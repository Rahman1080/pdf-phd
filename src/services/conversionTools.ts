/**
 * Conversion Tools for PDF PHD
 * Implements document conversion functionality
 * All processing is done 100% locally in the browser
 */

import { PDFDocument, rgb, StandardFonts } from '@cantoo/pdf-lib';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Configure pdf.js worker - use CDN to avoid local file issues
if (typeof window !== 'undefined') {
    GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs';
}

// ============================================
// CONVERT TO PDF TOOLS
// ============================================

/**
 * Convert images (JPG, PNG, etc.) to PDF
 */
export async function imageToPDF(files: File[]): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
        const bytes = await file.arrayBuffer();
        const type = file.type;

        let image;
        if (type === 'image/png') {
            image = await pdfDoc.embedPng(bytes);
        } else if (type === 'image/jpeg' || type === 'image/jpg') {
            image = await pdfDoc.embedJpg(bytes);
        } else {
            // For other formats, try to convert via canvas
            const img = await loadImageFromFile(file);
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0);
            const jpegData = await new Promise<Blob>((resolve) =>
                canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92)
            );
            image = await pdfDoc.embedJpg(await jpegData.arrayBuffer());
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
        });
    }

    return pdfDoc.save();
}

/**
 * Convert HTML content to PDF
 */
export async function htmlToPDF(htmlContent: string, title: string = 'Document'): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Parse HTML and extract text content
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Simple text extraction with basic formatting
    const textBlocks: { text: string; isHeading: boolean; isBold: boolean }[] = [];

    const extractText = (element: Element) => {
        const tagName = element.tagName.toLowerCase();
        const text = element.textContent?.trim() || '';

        if (!text) return;

        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
            textBlocks.push({ text, isHeading: true, isBold: true });
        } else if (['p', 'div', 'span', 'li'].includes(tagName)) {
            textBlocks.push({ text, isHeading: false, isBold: false });
        }
    };

    doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div, li').forEach(extractText);

    // If no structured content found, just use body text
    if (textBlocks.length === 0 && doc.body.textContent) {
        textBlocks.push({ text: doc.body.textContent.trim(), isHeading: false, isBold: false });
    }

    // Create pages with text
    const pageWidth = 612; // Letter size
    const pageHeight = 792;
    const margin = 50;
    const lineHeight = 14;
    const maxWidth = pageWidth - 2 * margin;

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    for (const block of textBlocks) {
        const fontSize = block.isHeading ? 16 : 11;
        const usedFont = block.isBold ? boldFont : font;

        // Word wrap
        const words = block.text.split(/\s+/);
        let line = '';

        for (const word of words) {
            const testLine = line + (line ? ' ' : '') + word;
            const testWidth = usedFont.widthOfTextAtSize(testLine, fontSize);

            if (testWidth > maxWidth && line) {
                // Draw current line
                if (y < margin + lineHeight) {
                    currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
                    y = pageHeight - margin;
                }
                currentPage.drawText(line, {
                    x: margin,
                    y,
                    size: fontSize,
                    font: usedFont,
                    color: rgb(0, 0, 0),
                });
                y -= lineHeight * (block.isHeading ? 1.5 : 1.2);
                line = word;
            } else {
                line = testLine;
            }
        }

        // Draw remaining text
        if (line) {
            if (y < margin + lineHeight) {
                currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
                y = pageHeight - margin;
            }
            currentPage.drawText(line, {
                x: margin,
                y,
                size: fontSize,
                font: usedFont,
                color: rgb(0, 0, 0),
            });
            y -= lineHeight * (block.isHeading ? 2 : 1.5);
        }
    }

    pdfDoc.setTitle(title);
    return pdfDoc.save();
}

/**
 * Convert plain text file to PDF
 */
export async function textToPDF(text: string, title: string = 'Document'): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Courier);

    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 50;
    const fontSize = 10;
    const lineHeight = 12;
    const maxCharsPerLine = 80;

    const lines = text.split('\n');
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    for (const rawLine of lines) {
        // Wrap long lines
        const chunks = [];
        for (let i = 0; i < rawLine.length; i += maxCharsPerLine) {
            chunks.push(rawLine.substring(i, i + maxCharsPerLine));
        }
        if (chunks.length === 0) chunks.push('');

        for (const line of chunks) {
            if (y < margin) {
                currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
                y = pageHeight - margin;
            }
            currentPage.drawText(line, {
                x: margin,
                y,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
            });
            y -= lineHeight;
        }
    }

    pdfDoc.setTitle(title);
    return pdfDoc.save();
}

// ============================================
// CONVERT FROM PDF TOOLS
// ============================================

/**
 * Convert PDF to images (one image per page)
 */
export async function pdfToImages(
    pdfBytes: Uint8Array,
    format: 'png' | 'jpeg' = 'png',
    scale: number = 2.0
): Promise<Blob[]> {
    const images: Blob[] = [];
    const pdfDoc = await getDocument({ data: pdfBytes }).promise;

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d')!;

        await page.render({ canvasContext: context, viewport, canvas }).promise;

        const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob(
                (b) => resolve(b!),
                format === 'png' ? 'image/png' : 'image/jpeg',
                format === 'jpeg' ? 0.92 : undefined
            );
        });

        images.push(blob);
    }

    return images;
}

/**
 * Extract text from PDF (for PDF → Text conversion)
 */
export async function pdfToText(pdfBytes: Uint8Array): Promise<string> {
    const pdfDoc = await getDocument({ data: pdfBytes }).promise;
    const textContent: string[] = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
            .map((item: any) => item.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (pageText) {
            textContent.push(`--- Page ${i} ---\n${pageText}`);
        }
    }

    return textContent.join('\n\n');
}

/**
 * Extract tables from PDF for Excel-like export
 * Returns structured data that can be converted to XLSX or CSV
 */
export async function pdfToTableData(pdfBytes: Uint8Array): Promise<{
    pages: { pageNumber: number; tables: string[][] }[];
}> {
    const pdfDoc = await getDocument({ data: pdfBytes }).promise;
    const result: { pages: { pageNumber: number; tables: string[][] }[] } = { pages: [] };

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        const items = content.items as any[];

        // Group by Y position (rows)
        const rows: Map<number, any[]> = new Map();
        items.forEach((item) => {
            const y = Math.round(item.transform[5] / 10) * 10;
            if (!rows.has(y)) rows.set(y, []);
            rows.get(y)!.push(item);
        });

        // Sort rows and cells
        const sortedRows = Array.from(rows.entries())
            .sort((a, b) => b[0] - a[0])
            .map(([_, cells]) => cells.sort((a, b) => a.transform[4] - b.transform[4]));

        // Extract table-like structures
        const tables: string[][] = [];
        let currentTable: string[][] = [];

        sortedRows.forEach((row) => {
            if (row.length >= 2) {
                currentTable.push(row.map((c) => c.str.trim()));
            } else if (currentTable.length >= 2) {
                tables.push(...currentTable);
                currentTable = [];
            }
        });

        if (currentTable.length >= 2) {
            tables.push(...currentTable);
        }

        if (tables.length > 0) {
            result.pages.push({ pageNumber: i, tables: [tables.flat().map(String)] });
        }
    }

    return result;
}

/**
 * Convert PDF to grayscale
 */
export async function pdfToGrayscale(pdfBytes: Uint8Array): Promise<Uint8Array> {
    const pdfDoc = await getDocument({ data: pdfBytes }).promise;
    const newPdf = await PDFDocument.create();

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d')!;

        await page.render({ canvasContext: context, viewport, canvas }).promise;

        // Convert to grayscale
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let j = 0; j < data.length; j += 4) {
            const gray = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2];
            data[j] = data[j + 1] = data[j + 2] = gray;
        }

        context.putImageData(imageData, 0, 0);

        // Add to new PDF
        const jpegData = await new Promise<Blob>((resolve) =>
            canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92)
        );
        const image = await newPdf.embedJpg(await jpegData.arrayBuffer());
        const newPage = newPdf.addPage([image.width / 2, image.height / 2]);
        newPage.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width / 2,
            height: image.height / 2,
        });
    }

    return newPdf.save();
}

/**
 * Generate a simple DOCX-like structure (RTF format for Word compatibility)
 * Note: True DOCX requires complex XML structure, this provides RTF which Word can open
 */
export async function pdfToRTF(pdfBytes: Uint8Array): Promise<string> {
    const text = await pdfToText(pdfBytes);

    // RTF header and content
    let rtf = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\fs24 ';

    // Convert text with basic formatting
    const lines = text.split('\n');
    for (const line of lines) {
        if (line.startsWith('--- Page')) {
            rtf += `\\par\\b ${escapeRTF(line)}\\b0 \\par `;
        } else {
            rtf += `${escapeRTF(line)}\\par `;
        }
    }

    rtf += '}';
    return rtf;
}

/**
 * Generate CSV from PDF tables
 */
export async function pdfToCSV(pdfBytes: Uint8Array): Promise<string> {
    const tableData = await pdfToTableData(pdfBytes);

    let csv = '';
    tableData.pages.forEach((page) => {
        csv += `# Page ${page.pageNumber}\n`;
        page.tables.forEach((row) => {
            csv +=
                row
                    .map((cell) => {
                        const escaped = cell.replace(/"/g, '""');
                        return cell.includes(',') || cell.includes('"') || cell.includes('\n')
                            ? `"${escaped}"`
                            : escaped;
                    })
                    .join(',') + '\n';
        });
        csv += '\n';
    });

    return csv || 'No tabular data found in document.';
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

function escapeRTF(text: string): string {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/\n/g, '\\par ');
}

/**
 * Download helper for text/binary content
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function downloadText(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    downloadBlob(blob, filename);
}
