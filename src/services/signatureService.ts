import Peer from 'peerjs';
import QRCode from 'qrcode';
import { generateId } from '../utils/helpers';

export interface SignatureSession {
    id: string;
    createdAt: number;
    expiresAt: number;
    status: 'pending' | 'signed' | 'expired';
    signatureDataUrl?: string;
    signerName?: string;
    documentName?: string;
}

const sessions: Map<string, SignatureSession> = new Map();
let broadcastChannel: BroadcastChannel | null = null;
let peerInstance: Peer | null = null;

/**
 * Initializes the broadcast channel for same-browser communication
 */
export function initSignatureChannel(): BroadcastChannel {
    if (!broadcastChannel) {
        broadcastChannel = new BroadcastChannel('pdf-signature-channel');
    }
    return broadcastChannel;
}

/**
 * Initializes PeerJS for a session (as a sender/host)
 */
export function initPeerSession(sessionId: string, onConnected: () => void, onSignature: (dataUrl: string, name?: string) => void): () => void {
    if (peerInstance) {
        peerInstance.destroy();
    }

    console.log('[SignatureService] Initializing Peer host for session:', sessionId);

    // Use a shortened version of the UUID for Peer ID to ensure compatibility
    // PeerJS IDs are better when shorter and alphanumeric
    const peerId = `phd-sign-${sessionId.split('-')[0]}`;

    peerInstance = new Peer(peerId, {
        debug: 1,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun.relay.metered.ca:80' }
            ]
        }
    });

    peerInstance.on('open', (id) => {
        console.log('[SignatureService] Peer host ready with ID:', id);
    });

    peerInstance.on('connection', (conn) => {
        console.log('[SignatureService] Incoming connection from remote signer');
        onConnected();

        conn.on('data', (data: any) => {
            console.log('[SignatureService] Received peer data:', data.type);
            if (data.type === 'signature_completed' && data.signatureDataUrl) {
                onSignature(data.signatureDataUrl, data.signerName);

                // Also update local state for consistency
                completeSignatureSession(sessionId, data.signatureDataUrl, data.signerName);
            }
        });
    });

    peerInstance.on('error', (err) => {
        console.warn('[SignatureService] Peer host error:', err.type);
    });

    return () => {
        if (peerInstance) {
            peerInstance.destroy();
            peerInstance = null;
        }
    };
}

/**
 * Connects to a host session as a signer (recipient)
 */
export function connectAsSigner(sessionId: string, onReady: () => void): { sendSignature: (dataUrl: string, name?: string) => void, disconnect: () => void } | null {
    const peerId = `phd-sign-${sessionId.split('-')[0]}`;
    const remotePeer = new Peer({
        debug: 1,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun.relay.metered.ca:80' }
            ]
        }
    });

    let activeConn: any = null;

    remotePeer.on('open', () => {
        console.log('[SignatureService] Remote signer peer open, connecting to host...');
        const conn = remotePeer.connect(peerId, {
            reliable: true
        });

        conn.on('open', () => {
            console.log('[SignatureService] Connected to host session');
            activeConn = conn;
            onReady();
        });

        conn.on('error', (err) => {
            console.error('[SignatureService] Connection error:', err);
        });
    });

    return {
        sendSignature: (signatureDataUrl: string, signerName?: string) => {
            if (activeConn && activeConn.open) {
                activeConn.send({
                    type: 'signature_completed',
                    signatureDataUrl,
                    signerName
                });

                // Also try same-device completion if applicable
                completeSignatureSession(sessionId, signatureDataUrl, signerName);
                return true;
            } else {
                // If peer is not open, at least try localStorage/Broadcast
                return completeSignatureSession(sessionId, signatureDataUrl, signerName);
            }
        },
        disconnect: () => {
            remotePeer.destroy();
        }
    };
}

/**
 * Creates a new signature session
 */
export function createSignatureSession(documentName?: string): SignatureSession {
    const session: SignatureSession = {
        id: generateId(),
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        status: 'pending',
        documentName
    };

    sessions.set(session.id, session);

    // Save to localStorage
    try {
        const storedSessions = JSON.parse(localStorage.getItem('pdf_signature_sessions') || '[]');
        storedSessions.push(session);
        localStorage.setItem('pdf_signature_sessions', JSON.stringify(storedSessions.slice(-10))); // Only keep last 10
    } catch (e) {
        console.warn('Could not save signature session:', e);
    }

    return session;
}

/**
 * Gets the full signing URL for a session
 */
export function getSigningUrl(sessionId: string): string {
    return `${window.location.origin}/sign/${sessionId}`;
}

/**
 * Generates a QR Code data URL for a session
 */
export async function generateSigningQRCode(sessionId: string): Promise<string> {
    const url = getSigningUrl(sessionId);
    return await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
            dark: '#4f46e5',
            light: '#ffffff',
        },
    });
}

/**
 * Copies the signing link to the clipboard
 */
export async function copySigningLink(sessionId: string): Promise<boolean> {
    try {
        const url = getSigningUrl(sessionId);
        await navigator.clipboard.writeText(url);
        return true;
    } catch (err) {
        console.error('Failed to copy link:', err);
        return false;
    }
}

/**
 * Uses the system share API for the signing link
 */
export async function shareSigningLink(sessionId: string, documentName?: string): Promise<void> {
    const url = getSigningUrl(sessionId);
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Sign Document',
                text: `Please sign "${documentName || 'the document'}" using the link below:`,
                url: url,
            });
        } catch (err) {
            console.warn('Share cancelled or failed:', err);
        }
    } else {
        copySigningLink(sessionId);
    }
}

/**
 * Opens email client with pre-filled request
 */
export function sendEmailRequest(sessionId: string, recipientEmail: string, senderName: string, documentName?: string): void {
    const url = getSigningUrl(sessionId);
    const subject = encodeURIComponent(`Signature Request: ${documentName || 'Document'}`);
    const body = encodeURIComponent(
        `Hi,\n\n${senderName} has requested your signature on "${documentName || 'a document'}".\n\n` +
        `You can sign it securely from your mobile device or computer using the link below:\n\n${url}\n\n` +
        `Thank you!`
    );
    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
}

/**
 * Gets a signature session by ID
 */
export function getSignatureSession(sessionId: string): SignatureSession | null {
    let session = sessions.get(sessionId);

    if (!session) {
        try {
            const storedSessions = JSON.parse(localStorage.getItem('pdf_signature_sessions') || '[]');
            session = storedSessions.find((s: SignatureSession) => s.id === sessionId);
            if (session) {
                sessions.set(sessionId, session);
            }
        } catch (e) {
            console.warn('Could not read signature sessions:', e);
        }
    }

    return session || null;
}

/**
 * Completes a signature session
 */
export function completeSignatureSession(
    sessionId: string,
    signatureDataUrl: string,
    signerName?: string
): boolean {
    const session = getSignatureSession(sessionId);

    if (!session) {
        // Even if we don't have the session object, we can still broadcast the completion
        // if we have the ID, though it's better to have the object.
        const channel = initSignatureChannel();
        channel.postMessage({
            type: 'signature_completed',
            sessionId,
            signatureDataUrl,
            signerName
        });
        return true;
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

    // Notify via BroadcastChannel for same-device listeners
    const channel = initSignatureChannel();
    channel.postMessage({
        type: 'signature_completed',
        sessionId,
        signatureDataUrl,
        signerName
    });

    return true;
}

/**
 * Listens for signature completion via BroadcastChannel
 */
export function onSignatureComplete(
    sessionId: string,
    callback: (signatureDataUrl: string, signerName?: string) => void
): () => void {
    const channel = initSignatureChannel();

    const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'signature_completed' && event.data.sessionId === sessionId) {
            callback(event.data.signatureDataUrl, event.data.signerName);
        }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
        channel.removeEventListener('message', handleMessage);
    };
}

/**
 * Polls for signature completion via localStorage (fallback)
 */
export function pollForSignatureCompletion(
    sessionId: string,
    callback: (signatureDataUrl: string, signerName?: string) => void,
    intervalMs: number = 2000
): () => void {
    const interval = setInterval(() => {
        const session = getSignatureSession(sessionId);
        if (session?.status === 'signed' && session.signatureDataUrl) {
            callback(session.signatureDataUrl, session.signerName);
            clearInterval(interval);
        }
    }, intervalMs);

    return () => clearInterval(interval);
}
