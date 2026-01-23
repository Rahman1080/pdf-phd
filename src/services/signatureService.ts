// Signature Service - Handles remote signing, QR codes, and signature sessions
import QRCode from 'qrcode';

export interface SignatureSession {
    id: string;
    documentId?: string;
    documentName?: string;
    createdAt: Date;
    expiresAt: Date;
    status: 'pending' | 'signed' | 'expired';
    signatureDataUrl?: string;
    signerName?: string;
    signerEmail?: string;
}

// Store sessions in memory (in production, use a database)
const sessions: Map<string, SignatureSession> = new Map();

// Broadcast channel for real-time updates
let broadcastChannel: BroadcastChannel | null = null;

/**
 * Initialize the broadcast channel for cross-tab communication
 */
export function initSignatureChannel(): BroadcastChannel {
    if (!broadcastChannel) {
        broadcastChannel = new BroadcastChannel('pdf-signature-channel');
    }
    return broadcastChannel;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
    return `sig_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Create a new signature session
 */
export function createSignatureSession(documentName?: string): SignatureSession {
    const session: SignatureSession = {
        id: generateSessionId(),
        documentName,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        status: 'pending'
    };

    sessions.set(session.id, session);

    // Store in localStorage for persistence across tabs
    try {
        const storedSessions = JSON.parse(localStorage.getItem('pdf_signature_sessions') || '[]');
        storedSessions.push(session);
        localStorage.setItem('pdf_signature_sessions', JSON.stringify(storedSessions));
    } catch (e) {
        console.warn('Could not persist signature session:', e);
    }

    return session;
}

/**
 * Get a signature session by ID
 */
export function getSignatureSession(sessionId: string): SignatureSession | null {
    // Check memory first
    let session = sessions.get(sessionId);

    // Check localStorage if not in memory
    if (!session) {
        try {
            const storedSessions = JSON.parse(localStorage.getItem('pdf_signature_sessions') || '[]');
            session = storedSessions.find((s: SignatureSession) => s.id === sessionId);
            if (session) {
                sessions.set(sessionId, session);
            }
        } catch (e) {
            console.warn('Could not retrieve signature session:', e);
        }
    }

    // Check if expired
    if (session && new Date(session.expiresAt) < new Date()) {
        session.status = 'expired';
    }

    return session || null;
}

/**
 * Complete a signature session with the signature data
 */
export function completeSignatureSession(
    sessionId: string,
    signatureDataUrl: string,
    signerName?: string
): boolean {
    const session = getSignatureSession(sessionId);

    if (!session || session.status !== 'pending') {
        return false;
    }

    session.status = 'signed';
    session.signatureDataUrl = signatureDataUrl;
    session.signerName = signerName;

    sessions.set(sessionId, session);

    // Update localStorage
    try {
        const storedSessions = JSON.parse(localStorage.getItem('pdf_signature_sessions') || '[]');
        const index = storedSessions.findIndex((s: SignatureSession) => s.id === sessionId);
        if (index >= 0) {
            storedSessions[index] = session;
            localStorage.setItem('pdf_signature_sessions', JSON.stringify(storedSessions));
        }
    } catch (e) {
        console.warn('Could not update signature session:', e);
    }

    // Broadcast the completion to other tabs/windows
    if (broadcastChannel) {
        broadcastChannel.postMessage({
            type: 'signature_completed',
            sessionId,
            signatureDataUrl,
            signerName
        });
    }

    return true;
}

/**
 * Generate signing URL for a session
 */
export function getSigningUrl(sessionId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/sign/${sessionId}`;
}

/**
 * Generate QR code for signing
 */
export async function generateSigningQRCode(sessionId: string): Promise<string> {
    const url = getSigningUrl(sessionId);

    try {
        const qrDataUrl = await QRCode.toDataURL(url, {
            width: 256,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            },
            errorCorrectionLevel: 'H'
        });
        return qrDataUrl;
    } catch (err) {
        console.error('Failed to generate QR code:', err);
        throw err;
    }
}

/**
 * Copy signing link to clipboard
 */
export async function copySigningLink(sessionId: string): Promise<boolean> {
    const url = getSigningUrl(sessionId);

    try {
        await navigator.clipboard.writeText(url);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
    }
}

/**
 * Share signing link via Web Share API (mobile)
 */
export async function shareSigningLink(sessionId: string, documentName?: string): Promise<boolean> {
    const url = getSigningUrl(sessionId);

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Sign Document',
                text: documentName
                    ? `Please sign the document: ${documentName}`
                    : 'Please sign this document',
                url: url
            });
            return true;
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                console.error('Share failed:', err);
            }
            return false;
        }
    }

    // Fallback to clipboard
    return copySigningLink(sessionId);
}

/**
 * Generate mailto link for email signature request
 */
export function generateEmailRequest(
    sessionId: string,
    recipientEmail: string,
    senderName: string,
    documentName?: string
): string {
    const url = getSigningUrl(sessionId);
    const subject = encodeURIComponent(
        documentName
            ? `Signature Request: ${documentName}`
            : 'Document Signature Request'
    );
    const body = encodeURIComponent(
        `Hello,\n\n${senderName} has requested your signature on a document.\n\n` +
        `Please click the link below to sign:\n${url}\n\n` +
        `This link will expire in 24 hours.\n\n` +
        `Thank you!`
    );

    return `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
}

/**
 * Open email client with signature request
 */
export function sendEmailRequest(
    sessionId: string,
    recipientEmail: string,
    senderName: string = 'Someone',
    documentName?: string
): void {
    const mailtoUrl = generateEmailRequest(sessionId, recipientEmail, senderName, documentName);
    window.location.href = mailtoUrl;
}

/**
 * Listen for signature completion from other tabs/devices
 */
export function onSignatureComplete(
    sessionId: string,
    callback: (signatureDataUrl: string, signerName?: string) => void
): () => void {
    const channel = initSignatureChannel();

    const handler = (event: MessageEvent) => {
        if (event.data.type === 'signature_completed' && event.data.sessionId === sessionId) {
            callback(event.data.signatureDataUrl, event.data.signerName);
        }
    };

    channel.addEventListener('message', handler);

    // Return cleanup function
    return () => {
        channel.removeEventListener('message', handler);
    };
}

/**
 * Poll for signature completion (fallback for when broadcast channel is not available)
 */
export function pollForSignatureCompletion(
    sessionId: string,
    callback: (signatureDataUrl: string, signerName?: string) => void,
    intervalMs: number = 2000
): () => void {
    let isPolling = true;

    const poll = async () => {
        while (isPolling) {
            const session = getSignatureSession(sessionId);
            if (session?.status === 'signed' && session.signatureDataUrl) {
                callback(session.signatureDataUrl, session.signerName);
                break;
            }
            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
    };

    poll();

    // Return cleanup function
    return () => {
        isPolling = false;
    };
}

/**
 * Notarization request (placeholder for future integration)
 */
export interface NotarizationRequest {
    documentName: string;
    signerName: string;
    signerEmail: string;
    notaryType: 'online' | 'in-person';
}

export function requestNotarization(_request: NotarizationRequest): Promise<{ success: boolean; message: string }> {
    // This would integrate with a notarization service like Notarize.com, DocVerify, etc.
    // For now, show a message about the feature
    return Promise.resolve({
        success: false,
        message: 'Online notarization requires integration with a certified notary service. This feature will be available soon.'
    });
}

/**
 * Clean up expired sessions
 */
export function cleanupExpiredSessions(): void {
    const now = new Date();

    // Clean memory
    for (const [id, session] of sessions.entries()) {
        if (new Date(session.expiresAt) < now) {
            sessions.delete(id);
        }
    }

    // Clean localStorage
    try {
        const storedSessions = JSON.parse(localStorage.getItem('pdf_signature_sessions') || '[]');
        const validSessions = storedSessions.filter(
            (s: SignatureSession) => new Date(s.expiresAt) >= now
        );
        localStorage.setItem('pdf_signature_sessions', JSON.stringify(validSessions));
    } catch (e) {
        console.warn('Could not cleanup expired sessions:', e);
    }
}
