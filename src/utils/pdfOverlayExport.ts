// Export PDF with text overlays "burned in" using pdf-lib
// This takes the editable overlays and permanently writes them into the PDF

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { OverlayText } from '../components/PDFTextOverlay';

/**
 * Burn text overlays into PDF permanently
 * This creates a new PDF with all overlay texts drawn as permanent content
 */
export async function burnOverlaysIntoPDF(
    pdfBytes: Uint8Array,
    overlays: OverlayText[],
    _pageHeights: { [pageIndex: number]: number }
): Promise<Uint8Array> {
    console.log('🔥 Burning overlays into PDF...');
    console.log(`   Total overlays: ${overlays.length}`);

    // Load PDF
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

    // Embed fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const helveticaBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

    // Group overlays by page
    const overlaysByPage: { [pageIndex: number]: OverlayText[] } = {};
    for (const overlay of overlays) {
        if (!overlaysByPage[overlay.pageIndex]) {
            overlaysByPage[overlay.pageIndex] = [];
        }
        overlaysByPage[overlay.pageIndex].push(overlay);
    }

    // Process each page
    for (const [pageIndexStr, pageOverlays] of Object.entries(overlaysByPage)) {
        const pageIndex = parseInt(pageIndexStr);
        const page = pdfDoc.getPages()[pageIndex];
        const { height: pageHeight } = page.getSize();

        console.log(`   Processing page ${pageIndex + 1} (${pageOverlays.length} overlays)`);

        for (const overlay of pageOverlays) {
            // Select font based on bold/italic
            let font = helvetica;
            if (overlay.bold && overlay.italic) {
                font = helveticaBoldOblique;
            } else if (overlay.bold) {
                font = helveticaBold;
            } else if (overlay.italic) {
                font = helveticaOblique;
            }

            // Convert color
            const [r, g, b] = hexToRgb(overlay.color);

            // Convert Y coordinate from top-left to bottom-left
            const pdfY = pageHeight - overlay.y - overlay.fontSize;

            // Draw text
            page.drawText(overlay.content, {
                x: overlay.x,
                y: pdfY,
                size: overlay.fontSize,
                font: font,
                color: rgb(r / 255, g / 255, b / 255),
            });

            console.log(`      ✓ "${overlay.content}" at (${overlay.x.toFixed(1)}, ${pdfY.toFixed(1)})`);
        }
    }

    console.log('✅ Overlays burned successfully!');
    return await pdfDoc.save();
}

/**
 * Helper: Convert hex color to RGB
 */
function hexToRgb(hex: string): [number, number, number] {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
}

/**
 * Create overlay texts from OCR results
 * Converts OCR-detected text into editable overlays
 */
export function createOverlaysFromOCR(
    ocrResults: {
        pageIndex: number;
        words: Array<{
            text: string;
            x: number;
            y: number;
            width: number;
            height: number;
        }>;
    }[]
): OverlayText[] {
    const overlays: OverlayText[] = [];

    for (const page of ocrResults) {
        for (const word of page.words) {
            // Skip empty words
            if (!word.text || word.text.trim() === '') continue;

            overlays.push({
                id: `ocr-${page.pageIndex}-${overlays.length}`,
                content: word.text,
                x: word.x,
                y: word.y,
                fontSize: word.height || 12,
                fontFamily: 'Helvetica, Arial, sans-serif',
                color: '#000000',
                bold: false,
                italic: false,
                textAlign: 'left',
                pageIndex: page.pageIndex,
            });
        }
    }

    return overlays;
}

/**
 * Merge nearby overlays into lines
 * Combines words on the same line into single editable blocks
 */
export function mergeOverlaysIntoLines(
    overlays: OverlayText[],
    maxYDifference: number = 5,
    maxXGap: number = 20
): OverlayText[] {
    if (overlays.length === 0) return [];

    // Group by page
    const byPage: { [page: number]: OverlayText[] } = {};
    for (const overlay of overlays) {
        if (!byPage[overlay.pageIndex]) {
            byPage[overlay.pageIndex] = [];
        }
        byPage[overlay.pageIndex].push(overlay);
    }

    const merged: OverlayText[] = [];

    // Process each page
    for (const [_pageIndex, pageOverlays] of Object.entries(byPage)) {
        // Sort by Y then X
        const sorted = [...pageOverlays].sort((a, b) => {
            const yDiff = a.y - b.y;
            return Math.abs(yDiff) < 1 ? a.x - b.x : yDiff;
        });

        let currentLine: OverlayText | null = null;

        for (const overlay of sorted) {
            if (!currentLine) {
                // Start new line
                currentLine = { ...overlay };
            } else {
                // Check if on same line
                const onSameLine = Math.abs(currentLine.y - overlay.y) <= maxYDifference;
                const closeEnough = (overlay.x - (currentLine.x + currentLine.content.length * currentLine.fontSize * 0.6)) <= maxXGap;

                if (onSameLine && closeEnough) {
                    // Merge into current line
                    currentLine.content += ' ' + overlay.content;
                } else {
                    // Save current line and start new
                    merged.push(currentLine);
                    currentLine = { ...overlay };
                }
            }
        }

        // Add last line
        if (currentLine) {
            merged.push(currentLine);
        }
    }

    return merged;
}

export default burnOverlaysIntoPDF;
