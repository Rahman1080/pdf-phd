/**
 * PDF Text Editing API Client
 * 
 * Communicates with the Python PyMuPDF server for accurate text editing.
 * Falls back to client-side editing if server is unavailable.
 */

const SERVER_URL = 'http://localhost:5050';

export interface TextSpan {
    text: string;
    bbox: [number, number, number, number];
    font: string;
    size: number;
    origin: [number, number];
    color?: number;
    flags?: number;
}

export interface TextLine {
    bbox: [number, number, number, number];
    spans: TextSpan[];
}

export interface TextBlock {
    bbox: [number, number, number, number];
    lines: TextLine[];
}

export interface PageTextData {
    pageNum: number;
    width: number;
    height: number;
    rotation: number;
    blocks: TextBlock[];
}

export interface TextMatch {
    pageNum: number;
    bbox: [number, number, number, number];
    text: string;
}

export interface TextEdit {
    page: number;
    rect: [number, number, number, number];
    newText: string;
    fontSize: number;
    fontName?: string;
    color?: [number, number, number];
}

export interface TextReplacement {
    searchText: string;
    replaceText: string;
    page?: number;
}

// Check if server is available
let serverAvailable: boolean | null = null;

async function checkServerHealth(): Promise<boolean> {
    if (serverAvailable !== null) return serverAvailable;

    try {
        const response = await fetch(`${SERVER_URL}/api/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(2000)  // 2 second timeout
        });

        if (response.ok) {
            const data = await response.json();
            serverAvailable = data.pymupdf_available === true;
            console.log('PDF Text Server status:', serverAvailable ? 'Available' : 'PyMuPDF not installed');
            return serverAvailable;
        }
    } catch (e) {
        console.log('PDF Text Server not available, using client-side editing');
        serverAvailable = false;
    }

    return false;
}

/**
 * Convert File to Base64
 */
async function fileToBase64(file: File | Blob | ArrayBuffer): Promise<string> {
    let arrayBuffer: ArrayBuffer;

    if (file instanceof File || file instanceof Blob) {
        arrayBuffer = await file.arrayBuffer();
    } else {
        arrayBuffer = file;
    }

    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Convert Base64 back to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

/**
 * Extract text with precise positioning from a PDF
 * Uses server if available, falls back to pdf.js
 */
export async function extractTextWithPositions(
    pdfFile: File | Blob | ArrayBuffer,
    pageNum?: number
): Promise<{ pages: PageTextData[] }> {
    const isServerUp = await checkServerHealth();

    if (isServerUp) {
        try {
            const base64 = await fileToBase64(pdfFile);

            const response = await fetch(`${SERVER_URL}/api/extract-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file: base64,
                    page: pageNum
                })
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            console.warn('Server extraction failed, falling back to client-side');
        }
    }

    // Fallback: Return empty - client should use pdf.js directly
    return { pages: [] };
}

/**
 * Find all occurrences of text in a PDF
 */
export async function findText(
    pdfFile: File | Blob | ArrayBuffer,
    searchText: string,
    caseSensitive: boolean = false
): Promise<{ matches: TextMatch[]; count: number }> {
    const isServerUp = await checkServerHealth();

    if (isServerUp) {
        try {
            const base64 = await fileToBase64(pdfFile);

            const response = await fetch(`${SERVER_URL}/api/find-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file: base64,
                    searchText,
                    caseSensitive
                })
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            console.warn('Server find failed');
        }
    }

    return { matches: [], count: 0 };
}

/**
 * Replace text in a PDF - the key function for accurate text editing
 * This uses PyMuPDF's redaction feature for true text removal
 */
export async function replaceText(
    pdfFile: File | Blob | ArrayBuffer,
    replacements: TextReplacement[],
    preserveFormatting: boolean = true
): Promise<{ file: Uint8Array; changes: number } | null> {
    const isServerUp = await checkServerHealth();

    if (!isServerUp) {
        console.warn('Server not available for text replacement');
        return null;
    }

    try {
        const base64 = await fileToBase64(pdfFile);

        const response = await fetch(`${SERVER_URL}/api/replace-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                file: base64,
                replacements,
                preserveFormatting
            })
        });

        if (response.ok) {
            const data = await response.json();
            return {
                file: base64ToUint8Array(data.file),
                changes: data.changes
            };
        }
    } catch (e) {
        console.warn('Server replace failed:', e);
    }

    return null;
}

/**
 * Edit text directly at specific coordinates
 * Uses redaction (true removal) + insertion
 */
export async function editTextDirect(
    pdfFile: File | Blob | ArrayBuffer,
    edits: TextEdit[]
): Promise<{ file: Uint8Array; success: boolean } | null> {
    const isServerUp = await checkServerHealth();

    if (!isServerUp) {
        console.warn('Server not available for direct text editing');
        return null;
    }

    try {
        const base64 = await fileToBase64(pdfFile);

        const response = await fetch(`${SERVER_URL}/api/edit-text-direct`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                file: base64,
                edits
            })
        });

        if (response.ok) {
            const data = await response.json();
            return {
                file: base64ToUint8Array(data.file),
                success: data.success
            };
        }
    } catch (e) {
        console.warn('Server direct edit failed:', e);
    }

    return null;
}

/**
 * Get text within a specific rectangle area
 */
export async function getTextAtRect(
    pdfFile: File | Blob | ArrayBuffer,
    pageNum: number,
    rect: [number, number, number, number]
): Promise<{ text: string; spans: TextSpan[] } | null> {
    const isServerUp = await checkServerHealth();

    if (!isServerUp) {
        return null;
    }

    try {
        const base64 = await fileToBase64(pdfFile);

        const response = await fetch(`${SERVER_URL}/api/get-text-at-rect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                file: base64,
                page: pageNum,
                rect
            })
        });

        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.warn('Server get-text-at-rect failed:', e);
    }

    return null;
}

/**
 * Get complete text layer data for a PDF
 * Returns data compatible with pdf.js text content format
 */
export async function getTextLayer(
    pdfFile: File | Blob | ArrayBuffer
): Promise<{
    pages: Array<{
        pageNum: number;
        width: number;
        height: number;
        rotation: number;
        textItems: Array<{
            str: string;
            bbox: number[];
            origin: number[];
            transform: number[];
            width: number;
            height: number;
            fontSize: number;
            fontName: string;
        }>;
    }>;
} | null> {
    const isServerUp = await checkServerHealth();

    if (!isServerUp) {
        return null;
    }

    try {
        const base64 = await fileToBase64(pdfFile);

        const response = await fetch(`${SERVER_URL}/api/pdf-to-text-layer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: base64 })
        });

        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.warn('Server get-text-layer failed:', e);
    }

    return null;
}

/**
 * High-level function to edit text in a PDF
 * Automatically uses server if available, returns modified PDF bytes
 */
export async function smartTextEdit(
    pdfFile: File | Blob | ArrayBuffer,
    edits: Array<{
        pageIndex: number;
        originalText: string;
        newText: string;
        rect?: [number, number, number, number];
    }>
): Promise<{
    success: boolean;
    file?: Uint8Array;
    method: 'server' | 'client';
    error?: string;
}> {
    const isServerUp = await checkServerHealth();

    if (isServerUp) {
        // Use server for accurate editing
        const textEdits: TextEdit[] = edits
            .filter(e => e.rect)
            .map(e => ({
                page: e.pageIndex,
                rect: e.rect!,
                newText: e.newText,
                fontSize: 12  // Will be auto-detected by server
            }));

        if (textEdits.length > 0) {
            const result = await editTextDirect(pdfFile, textEdits);
            if (result?.success) {
                return {
                    success: true,
                    file: result.file,
                    method: 'server'
                };
            }
        }

        // Try find/replace method
        const replacements: TextReplacement[] = edits.map(e => ({
            searchText: e.originalText,
            replaceText: e.newText,
            page: e.pageIndex
        }));

        const result = await replaceText(pdfFile, replacements);
        if (result) {
            return {
                success: true,
                file: result.file,
                method: 'server'
            };
        }
    }

    // Fallback to client-side
    return {
        success: false,
        method: 'client',
        error: 'Server not available, use client-side pdf-lib editing'
    };
}

/**
 * Reset server availability check (useful after starting server)
 */
export function resetServerCheck(): void {
    serverAvailable = null;
}

/**
 * Force check server health
 */
export async function forceHealthCheck(): Promise<boolean> {
    serverAvailable = null;
    return checkServerHealth();
}

export default {
    extractTextWithPositions,
    findText,
    replaceText,
    editTextDirect,
    getTextAtRect,
    getTextLayer,
    smartTextEdit,
    checkServerHealth: forceHealthCheck,
    resetServerCheck
};
