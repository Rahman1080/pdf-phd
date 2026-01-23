// PDF Text Replacement Utility using pdf-lib
// This demonstrates how to replace text in a PDF by "erasing" and "redrawing"

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * HOW IT WORKS:
 * 
 * PDFs don't store text as editable strings. Instead, text is drawn like graphics:
 * Each letter has an X,Y position and is rendered as a glyph (like a tiny image).
 * 
 * To "replace" text, we must:
 * 1. Draw a white (or background-colored) rectangle OVER the old text (to "erase" it)
 * 2. Draw new text in the same position
 * 
 * Think of it like using white-out on paper, then writing new text on top!
 */

export interface TextPosition {
    pageIndex: number;      // Which page (0-indexed)
    x: number;              // X coordinate (left position)
    y: number;              // Y coordinate (from BOTTOM of page - PDF coords!)
    width: number;          // Width of text to erase
    height: number;         // Height of text to erase
    oldText: string;        // Original text (for verification)
    newText: string;        // New text to write
    fontSize: number;       // Font size
    fontColor?: string;     // Hex color like "#000000"
    backgroundColor?: string; // Background to "erase" with (default: white)
}

/**
 * Step-by-step text replacement
 */
export async function replaceTextInPDF(
    pdfBytes: Uint8Array,
    replacements: TextPosition[]
): Promise<Uint8Array> {

    // STEP 1: Load the PDF
    console.log('📄 Loading PDF...');
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

    // STEP 2: Embed fonts we'll use
    console.log('🔤 Embedding fonts...');
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // STEP 3: Process each replacement
    for (let i = 0; i < replacements.length; i++) {
        const replacement = replacements[i];
        console.log(`✏️ Processing replacement ${i + 1}/${replacements.length}:`, {
            old: replacement.oldText,
            new: replacement.newText,
            page: replacement.pageIndex + 1,
        });

        // Get the page
        const page = pdfDoc.getPages()[replacement.pageIndex];
        const { width: pageWidth, height: pageHeight } = page.getSize();

        console.log(`   Page size: ${pageWidth} x ${pageHeight}`);
        console.log(`   Text position: (${replacement.x}, ${replacement.y})`);

        // STEP 3a: "ERASE" old text by drawing a rectangle
        // This is like using white-out on the old text
        const bgColor = replacement.backgroundColor || '#FFFFFF';
        const [bgR, bgG, bgB] = hexToRgb(bgColor);

        console.log(`   🗑️ Erasing old text with ${bgColor} rectangle...`);
        page.drawRectangle({
            x: replacement.x,
            y: replacement.y,
            width: replacement.width,
            height: replacement.height,
            color: rgb(bgR / 255, bgG / 255, bgB / 255),
            borderWidth: 0, // No border
        });

        // STEP 3b: DRAW new text in the same position
        const textColor = replacement.fontColor || '#000000';
        const [r, g, b] = hexToRgb(textColor);

        console.log(`   ✍️ Drawing new text: "${replacement.newText}"`);
        page.drawText(replacement.newText, {
            x: replacement.x,
            y: replacement.y,
            size: replacement.fontSize,
            font: helvetica,
            color: rgb(r / 255, g / 255, b / 255),
        });
    }

    // STEP 4: Save and return the modified PDF
    console.log('💾 Saving modified PDF...');
    const modifiedPdfBytes = await pdfDoc.save();
    console.log('✅ Text replacement complete!');

    return modifiedPdfBytes;
}

/**
 * Helper: Convert hex color to RGB values (0-255)
 */
function hexToRgb(hex: string): [number, number, number] {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return [r, g, b];
}

/**
 * IMPORTANT: PDF Coordinate System
 * 
 * PDF uses BOTTOM-LEFT as origin (0,0), not top-left like HTML!
 * 
 *     HTML (Canvas):              PDF:
 *     
 *     (0,0)────────►X             Y▲
 *        │                         │
 *        │                         │
 *        ▼                         │
 *        Y                    (0,0)└────────►X
 * 
 * To convert from PDF.js (top-left) to pdf-lib (bottom-left):
 * pdfLibY = pageHeight - pdfjsY - textHeight
 */

/**
 * Helper: Convert PDF.js coordinates to pdf-lib coordinates
 */
export function convertCoordinates(
    pdfjsY: number,          // Y from PDF.js (top-left origin)
    textHeight: number,      // Height of the text
    pageHeight: number       // Total page height
): number {
    // Convert from top-left to bottom-left origin
    return pageHeight - pdfjsY - textHeight;
}

/**
 * Example Usage:
 * 
 * // After OCR detects text at position (100, 50) on page 1:
 * const replacements: TextPosition[] = [{
 *     pageIndex: 0,
 *     x: 100,
 *     y: 700,  // PDF coordinates (bottom-left origin)
 *     width: 150,
 *     height: 20,
 *     oldText: "Hello World",
 *     newText: "Goodbye World",
 *     fontSize: 12,
 *     fontColor: "#000000",
 *     backgroundColor: "#FFFFFF"
 * }];
 * 
 * const pdfBytes = await pdfFile.arrayBuffer();
 * const modifiedBytes = await replaceTextInPDF(
 *     new Uint8Array(pdfBytes),
 *     replacements
 * );
 * 
 * // Save or display the modified PDF
 * const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
 * const url = URL.createObjectURL(blob);
 * window.open(url);
 */

/**
 * Advanced: Calculate text width automatically
 */
export async function calculateTextWidth(
    text: string,
    fontSize: number,
    fontType: 'regular' | 'bold' = 'regular'
): Promise<number> {
    // Create a temporary PDF to measure text
    const tempDoc = await PDFDocument.create();
    const font = fontType === 'bold'
        ? await tempDoc.embedFont(StandardFonts.HelveticaBold)
        : await tempDoc.embedFont(StandardFonts.Helvetica);

    return font.widthOfTextAtSize(text, fontSize);
}

/**
 * Smart text replacement with automatic width calculation
 */
export async function smartReplaceText(
    pdfBytes: Uint8Array,
    pageIndex: number,
    x: number,
    y: number,
    oldText: string,
    newText: string,
    fontSize: number,
    fontColor: string = '#000000'
): Promise<Uint8Array> {

    // Calculate dimensions
    const oldWidth = await calculateTextWidth(oldText, fontSize);
    const textHeight = fontSize * 1.2; // Standard line height

    // Create replacement
    const replacement: TextPosition = {
        pageIndex,
        x,
        y,
        width: oldWidth,
        height: textHeight,
        oldText,
        newText,
        fontSize,
        fontColor,
    };

    return replaceTextInPDF(pdfBytes, [replacement]);
}

export default replaceTextInPDF;
