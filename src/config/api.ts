// API Configuration for PDF Studio
// Configures connection to your Hostinger VPS conversion server

// ============================================
// CONFIGURATION - UPDATE THIS WITH YOUR VPS IP/DOMAIN
// ============================================

// Option 1: Use your VPS IP address directly
// export const API_BASE = 'http://YOUR_VPS_IP:3001';

// Option 2: Use a domain/subdomain (recommended for SSL)
// export const API_BASE = 'https://api.yourdomain.com';

// Option 3: Development mode (local server)
// export const API_BASE = 'http://localhost:3001';

// Set your Hostinger VPS details here:
const VPS_IP = '76.13.24.46';
const VPS_PORT = '3001';

// Dynamic API URL based on current hostname
const DYNAMIC_VPS_URL = `http://${VPS_IP}:${VPS_PORT}`;

export const API_BASE = DYNAMIC_VPS_URL;          // Production (your VPS)

// ============================================
// API Endpoints
// ============================================
export const CONVERT_TO_PDF = `${API_BASE}/convert`;
export const CONVERT_FROM_PDF = `${API_BASE}/convert-from-pdf`;
export const EXTRACT_TEXT_BLOCKS = `${API_BASE}/extract-text-blocks`;

// ============================================
// Health Check Function
// ============================================
export async function checkServerHealth(): Promise<{ ok: boolean; message: string; details?: any }> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(API_BASE, {
            signal: controller.signal,
            mode: 'cors'
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            return {
                ok: true,
                message: 'Server is online',
                details: data
            };
        } else {
            return {
                ok: false,
                message: `Server returned status ${response.status}`
            };
        }
    } catch (error: any) {
        if (error.name === 'AbortError') {
            return { ok: false, message: 'Server connection timed out' };
        }
        return {
            ok: false,
            message: error.message || 'Cannot connect to conversion server'
        };
    }
}

// ============================================
// Feature Availability
// ============================================
export const FEATURES = {
    // These work without the server (client-side only)
    clientSide: [
        'Images to PDF (JPG, PNG, GIF, WEBP, BMP, TIFF)',
        'Text files to PDF (TXT, CSV, HTML)',
        'Code files to PDF (with syntax highlighting)',
        'PDF editing (text, shapes, signatures, watermarks)',
        'PDF merge, split, rotate, reorder',
        'Export to EPUB, JSON, XML, FDF',
    ],
    // These require the VPS server
    serverRequired: [
        'Word to PDF (DOC, DOCX, RTF, ODT) - High Fidelity',
        'Excel to PDF (XLS, XLSX, ODS) - High Fidelity',
        'PowerPoint to PDF (PPT, PPTX, ODP) - High Fidelity',
        'PDF to Word (DOCX)',
        'PDF to Excel (XLSX)',
        'PDF to PowerPoint (PPTX)',
    ]
};
