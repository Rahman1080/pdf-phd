import { PDFDocument, degrees, rgb } from '@cantoo/pdf-lib';
import { saveAs } from 'file-saver';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
import * as QRCode from 'qrcode';

/**
 * Universal Tool Logic for PDF PHD
 * All processing is done 100% locally in the browser
 */

// --- HELPER: RESILIENT LOAD ---
const loadPDF = async (buf: ArrayBuffer, password?: string): Promise<PDFDocument> => {
    try {
        // Primary attempt with updateMetadata: false for speed and resilience
        return await PDFDocument.load(buf, {
            ignoreEncryption: true,
            updateMetadata: false,
            password
        });
    } catch (e) {
        // Fallback: try with default settings which triggers a different internal parsing flow
        return await PDFDocument.load(buf, {
            ignoreEncryption: true,
            password
        });
    }
};

// --- ORGANIZE TOOLS ---

export const mergePDFs = async (files: File[]): Promise<Uint8Array> => {
    const merged = await PDFDocument.create();
    for (const f of files) {
        const buf = await f.arrayBuffer();
        try {
            const doc = await loadPDF(buf);
            const pages = await merged.copyPages(doc, doc.getPageIndices());
            pages.forEach(p => merged.addPage(p));
        } catch (e) {
            console.error(`Failed to load ${f.name}:`, e);
            throw new Error(`Could not load "${f.name}". The file might be corrupted, protected by an incompatible encryption, or not a valid PDF.`);
        }
    }
    return await merged.save();
};

export const splitPDF = async (file: File, ranges: string): Promise<Uint8Array[]> => {
    const buf = await file.arrayBuffer();
    const sourceDoc = await loadPDF(buf);
    const results: Uint8Array[] = [];

    const rangeParts = ranges.split(',').map(r => r.trim());

    for (const part of rangeParts) {
        const newDoc = await PDFDocument.create();
        if (part.includes('-')) {
            const [startStr, endStr] = part.split('-');
            const start = parseInt(startStr) - 1;
            const end = parseInt(endStr) - 1;
            const indices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
            const pages = await newDoc.copyPages(sourceDoc, indices);
            pages.forEach(p => newDoc.addPage(p));
        } else {
            const index = parseInt(part) - 1;
            if (!isNaN(index)) {
                const pages = await newDoc.copyPages(sourceDoc, [index]);
                pages.forEach(p => newDoc.addPage(p));
            }
        }
        results.push(await newDoc.save());
    }

    return results;
};

export const rotatePDF = async (file: File, angle: number): Promise<Uint8Array> => {
    const buf = await file.arrayBuffer();
    const doc = await loadPDF(buf);
    const pages = doc.getPages();
    pages.forEach(page => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + angle) % 360));
    });
    return await doc.save();
};

export const deletePages = async (file: File, pageNumbers: number[]): Promise<Uint8Array> => {
    const buf = await file.arrayBuffer();
    const doc = await loadPDF(buf);
    // Sort descending to avoid index shifts
    const sortedIndices = [...pageNumbers].map(n => n - 1).sort((a, b) => b - a);
    sortedIndices.forEach(index => {
        if (index >= 0 && index < doc.getPageCount()) {
            doc.removePage(index);
        }
    });
    return await doc.save();
};

// --- SECURITY TOOLS ---

export const protectPDF = async (file: File, password: string, ownerPassword?: string): Promise<Uint8Array> => {
    const buf = await file.arrayBuffer();
    const doc = await loadPDF(buf);
    // Save the clean PDF first, then encrypt
    const cleanBytes = await doc.save();

    // Use the encryption library for RC4 128-bit encryption
    const encrypted = await encryptPDF(
        cleanBytes,                    // Pass Uint8Array directly
        password,                      // User password (to open/view)
        ownerPassword || password      // Owner password (for full access)
    );

    return new Uint8Array(encrypted);
};

export const unlockPDF = async (file: File, password?: string): Promise<Uint8Array> => {
    const buf = await file.arrayBuffer();
    // Providing password to load if it's already encrypted
    const doc = await loadPDF(buf, password);
    return await doc.save();
};

export const certifyPDF = async (file: File, authority: string = 'PDF PHD Certification Service'): Promise<Uint8Array> => {
    const buf = await file.arrayBuffer();
    const doc = await loadPDF(buf);
    const pages = doc.getPages();

    if (pages.length > 0) {
        const page = pages[0];

        // Draw a visual "Certified" stamp in the bottom left
        // This is a simplified version of PDF certification

        // Better stamp drawing
        const helveticaBold = await doc.embedFont('Helvetica-Bold');

        page.drawRectangle({
            x: 30,
            y: 30,
            width: 160,
            height: 50,
            borderColor: rgb(0.1, 0.3, 0.6),
            borderWidth: 2,
            opacity: 0.1,
            color: rgb(0.9, 0.95, 1),
        });

        page.drawText('DIGITALLY CERTIFIED', {
            x: 40,
            y: 60,
            size: 10,
            font: helveticaBold,
            color: rgb(0.1, 0.3, 0.6),
        });

        page.drawText(`By: ${authority}`, {
            x: 40,
            y: 48,
            size: 8,
            font: helveticaBold,
            color: rgb(0.4, 0.4, 0.4),
        });

        page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
            x: 40,
            y: 38,
            size: 8,
            font: helveticaBold,
            color: rgb(0.4, 0.4, 0.4),
        });
    }

    return await doc.save();
};

// --- OPTIMIZE TOOLS ---

export const optimizePDF = async (file: File): Promise<Uint8Array> => {
    const buf = await file.arrayBuffer();
    const doc = await loadPDF(buf);
    const options: any = {
        useObjectStreams: true
    };
    return await doc.save(options);
};

export const nUpPDF = async (file: File, n: number): Promise<Uint8Array> => {
    const buf = await file.arrayBuffer();
    const srcDoc = await loadPDF(buf);
    const outDoc = await PDFDocument.create();

    const pageCount = srcDoc.getPageCount();
    if (pageCount === 0) return await srcDoc.save();

    if (n === 2) {
        // 2 pages per A4 sheet (Side-by-side in Landscape A4)
        for (let i = 0; i < pageCount; i += 2) {
            const outPage = outDoc.addPage([842, 595]);
            const cellW = 842 / 2;
            const cellH = 595;

            const drawAt = async (idx: number, offsetX: number) => {
                if (idx >= pageCount) return;
                const pArr = srcDoc.getPages();
                if (idx >= pArr.length) return;
                const p = await outDoc.embedPage(pArr[idx]);
                const { width: w, height: h } = p;
                const scale = Math.min(cellW / w, cellH / h) * 0.95;
                outPage.drawPage(p, {
                    x: offsetX + (cellW - w * scale) / 2,
                    y: (cellH - h * scale) / 2,
                    width: w * scale,
                    height: h * scale
                });
            };

            await drawAt(i, 0);
            await drawAt(i + 1, cellW);
        }
    } else if (n === 4) {
        // 4 pages per A4 sheet (2x2 grid)
        for (let i = 0; i < pageCount; i += 4) {
            const outPage = outDoc.addPage([595, 842]);
            const cellW = 595 / 2;
            const cellH = 842 / 2;

            const drawInCell = async (idx: number, col: number, row: number) => {
                if (idx >= pageCount) return;
                const pArr = srcDoc.getPages();
                if (idx >= pArr.length) return;
                const p = await outDoc.embedPage(pArr[idx]);
                const { width: w, height: h } = p;
                const scale = Math.min(cellW / w, cellH / h) * 0.95;
                outPage.drawPage(p, {
                    x: col * cellW + (cellW - w * scale) / 2,
                    y: (1 - row) * cellH + (cellH - h * scale) / 2,
                    width: w * scale,
                    height: h * scale
                });
            };

            await drawInCell(i, 0, 0);   // Top Left
            await drawInCell(i + 1, 1, 0); // Top Right
            await drawInCell(i + 2, 0, 1); // Bottom Left
            await drawInCell(i + 3, 1, 1); // Bottom Right
        }
    } else {
        const copied = await outDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        copied.forEach(p => outDoc.addPage(p));
    }

    return await outDoc.save();
};

export const imageToPDF = async (files: File[]): Promise<Uint8Array> => {
    const doc = await PDFDocument.create();
    for (const file of files) {
        const imageBytes = await file.arrayBuffer();
        let image;
        // Basic check for png/jpg
        if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
            image = await doc.embedJpg(imageBytes);
        } else if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
            image = await doc.embedPng(imageBytes);
        } else {
            // Try JPG fallback
            try {
                image = await doc.embedJpg(imageBytes);
            } catch {
                // Try PNG fallback
                try { image = await doc.embedPng(imageBytes); } catch (e) { continue; }
            }
        }

        if (image) {
            const page = doc.addPage([image.width, image.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            });
        }
    }
    return await doc.save();
};

export const addPageNumbers = async (file: File): Promise<Uint8Array> => {
    const buf = await file.arrayBuffer();
    const doc = await loadPDF(buf);
    const pages = doc.getPages();

    // Embed standard font
    const font = await doc.embedFont('Helvetica');

    pages.forEach((page, i) => {
        const { width } = page.getSize();
        const text = `${i + 1}`;
        const textSize = 12;
        const textWidth = font.widthOfTextAtSize(text, textSize);

        page.drawText(text, {
            x: width / 2 - textWidth / 2,
            y: 20,
            size: textSize,
            font: font,
        });
    });


    return await doc.save();
};

export const flattenPDF = async (file: File): Promise<Uint8Array> => {
    const buf = await file.arrayBuffer();
    const doc = await loadPDF(buf);
    const form = doc.getForm();
    try {
        form.flatten();
    } catch (e) {
        // Form might not exist or be empty
    }
    return await doc.save();
};

// --- HELPER ---
export const downloadUint8Array = (data: Uint8Array, fileName: string) => {
    const blob = new Blob([data as any], { type: 'application/pdf' });
    saveAs(blob, fileName);
};

// --- QR CODE GENERATION ---
export interface QRCodeOptions {
    data: string;
    size?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export const generateQRCode = async (options: QRCodeOptions): Promise<string> => {
    const qrOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel || 'M',
        width: options.size || 200,
        margin: 4,
    };

    return await QRCode.toDataURL(options.data, qrOptions);
};

export const addQRCodeToPDF = async (
    file: File,
    qrDataUrl: string,
    pageIndex: number = 0,
    x: number = 50,
    y: number = 50,
    size: number = 100
): Promise<Uint8Array> => {
    const buf = await file.arrayBuffer();
    const doc = await loadPDF(buf);
    const pages = doc.getPages();

    if (pageIndex < 0 || pageIndex >= pages.length) {
        throw new Error(`Invalid page index: ${pageIndex}`);
    }

    const page = pages[pageIndex];
    const { height } = page.getSize();

    // Extract base64 data from data URL
    const base64Data = qrDataUrl.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Embed the image
    const qrImage = await doc.embedPng(imageBytes);

    // Draw the QR code (convert y from top-down to bottom-up)
    page.drawImage(qrImage, {
        x: x,
        y: height - y - size,
        width: size,
        height: size
    });

    return await doc.save();
};
