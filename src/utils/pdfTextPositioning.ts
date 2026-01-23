/**
 * PDF Text Positioning Utilities
 * 
 * This module provides accurate text positioning for PDF editing.
 * Based on PDF4QT's approach to text layout analysis.
 * 
 * Key concepts from PDF4QT:
 * - Text transform matrix: [scaleX, skewY, skewX, scaleY, translateX, translateY]
 * - Accurate bounding box calculation using font metrics
 * - Text flow analysis for proper text grouping
 */

export interface PDFTextItem {
    str: string;
    transform: [number, number, number, number, number, number];
    width: number;
    height: number;
    fontName: string;
    hasEOL?: boolean;
    dir?: string;
}

export interface TextPosition {
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontName: string;
    angle: number;  // Rotation angle in degrees
    text: string;
    baseline: number;  // Y position of text baseline
    ascent: number;    // Height above baseline
    descent: number;   // Height below baseline
    transform: number[];  // Original transform matrix
}

export interface TextBlock {
    id: string;
    pageIndex: number;
    text: string;
    items: TextPosition[];
    boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    pdfCoordinates: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    fontSize: number;
    fontName: string;
}

/**
 * Extract precise font metrics from transform matrix
 * PDF text transform: [a, b, c, d, e, f]
 * where: a = horizontal scale, b = vertical skew, c = horizontal skew, 
 *        d = vertical scale, e = x position, f = y position
 */
export function extractFontMetrics(transform: number[]): {
    fontSize: number;
    scaleX: number;
    scaleY: number;
    angle: number;
    x: number;
    y: number;
} {
    const [a, b, c, d, e, f] = transform;

    // Calculate font size from the transformation matrix
    // Font size is the magnitude of the vertical scaling
    const fontSize = Math.sqrt(a * a + b * b);

    // Horizontal and vertical scale factors
    const scaleX = Math.sqrt(a * a + b * b);
    const scaleY = Math.sqrt(c * c + d * d);

    // Rotation angle in radians, then convert to degrees
    const angle = Math.atan2(b, a) * (180 / Math.PI);

    return {
        fontSize,
        scaleX,
        scaleY,
        angle,
        x: e,
        y: f
    };
}

/**
 * Convert PDF coordinates to viewport coordinates with high accuracy
 */
export function pdfToViewport(
    pdfX: number,
    pdfY: number,
    viewport: any
): { x: number; y: number } {
    if (viewport.convertToViewportPoint) {
        const [vx, vy] = viewport.convertToViewportPoint(pdfX, pdfY);
        return { x: vx, y: vy };
    }

    // Manual conversion using viewport transform
    const transform = viewport.transform || [1, 0, 0, -1, 0, viewport.height];
    const [a, b, c, d, e, f] = transform;

    const x = a * pdfX + c * pdfY + e;
    const y = b * pdfX + d * pdfY + f;

    return { x, y };
}

/**
 * Convert viewport coordinates back to PDF coordinates
 */
export function viewportToPdf(
    viewportX: number,
    viewportY: number,
    viewport: any
): { x: number; y: number } {
    if (viewport.convertToPdfPoint) {
        const [px, py] = viewport.convertToPdfPoint(viewportX, viewportY);
        return { x: px, y: py };
    }

    // Manual inverse conversion
    const transform = viewport.transform || [1, 0, 0, -1, 0, viewport.height];
    const [a, b, c, d, e, f] = transform;

    // Calculate determinant for matrix inversion
    const det = a * d - b * c;
    if (Math.abs(det) < 1e-10) {
        return { x: viewportX, y: viewportY };
    }

    // Inverse transform
    const x = (d * (viewportX - e) - c * (viewportY - f)) / det;
    const y = (-b * (viewportX - e) + a * (viewportY - f)) / det;

    return { x, y };
}

/**
 * Calculate precise text item bounds including font metrics
 * This is the key improvement over simple width/height estimates
 */
export function calculateTextItemBounds(
    item: PDFTextItem,
    viewport: any,
    fontHeightEstimate: number = 0.85  // Typical ascent ratio for most fonts
): TextPosition {
    const metrics = extractFontMetrics(item.transform);

    // Get viewport coordinates for the text position
    const viewportPos = pdfToViewport(metrics.x, metrics.y, viewport);

    // Calculate width in viewport space
    // item.width is already in PDF space units
    const viewportScale = viewport.scale || 1;
    const widthScale = Math.abs(viewport.transform?.[0] || viewportScale);

    // More accurate width calculation
    const viewportWidth = item.width * widthScale;

    // Height calculation using font metrics
    // PDF fonts typically have height around 1.2x the font size
    const fontHeight = metrics.fontSize * Math.abs(viewport.transform?.[3] || viewportScale);
    const ascentHeight = fontHeight * fontHeightEstimate;
    const descentHeight = fontHeight * (1 - fontHeightEstimate);

    // Total height including line spacing factor
    const viewportHeight = fontHeight * 1.2;

    // The baseline is at the transform position (PDF y coordinate)
    // Text is drawn FROM the baseline, so we need to adjust the top
    const topY = viewportPos.y - ascentHeight;

    return {
        x: viewportPos.x,
        y: topY,
        width: viewportWidth,
        height: viewportHeight,
        fontSize: metrics.fontSize,
        fontName: item.fontName || 'Unknown',
        angle: metrics.angle,
        text: item.str,
        baseline: viewportPos.y,
        ascent: ascentHeight,
        descent: descentHeight,
        transform: item.transform
    };
}

/**
 * Calculate the PDF-space bounding rectangle for whiteout
 * This returns the exact coordinates needed for pdf-lib to draw a white rectangle
 */
export function calculateWhiteoutRect(
    item: PDFTextItem,
    paddingX: number = 1,
    paddingY: number = 1
): {
    x: number;
    y: number;
    width: number;
    height: number;
} {
    const metrics = extractFontMetrics(item.transform);

    // The text baseline is at (metrics.x, metrics.y)
    // Text is drawn above the baseline
    const fontSize = metrics.fontSize;

    // Standard font metrics (can be adjusted per font)
    const ascent = fontSize * 0.85;   // Height above baseline
    const descent = fontSize * 0.15;  // Height below baseline

    return {
        x: metrics.x - paddingX,
        y: metrics.y - descent - paddingY,  // Start below baseline
        width: item.width + (paddingX * 2),
        height: (ascent + descent) + (paddingY * 2)
    };
}

/**
 * Group text items into logical lines based on position
 * Uses the docstrum algorithm approach from PDF4QT
 */
export function groupIntoLines(
    items: TextPosition[],
    lineTolerance: number = 0.3  // Fraction of font height for same-line detection
): TextPosition[][] {
    if (items.length === 0) return [];

    // Sort by Y position (top to bottom) then X position (left to right)
    const sorted = [...items].sort((a, b) => {
        const yDiff = Math.abs(a.baseline - b.baseline);
        const avgHeight = (a.height + b.height) / 2;

        // If items are on roughly the same line
        if (yDiff < avgHeight * lineTolerance) {
            return a.x - b.x;  // Sort by X
        }
        return a.baseline - b.baseline;  // Sort by baseline Y
    });

    const lines: TextPosition[][] = [];
    let currentLine: TextPosition[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
        const current = sorted[i];
        const lastInLine = currentLine[currentLine.length - 1];

        // Check if current item is on the same line
        const baselineDiff = Math.abs(current.baseline - lastInLine.baseline);
        const avgHeight = (current.height + lastInLine.height) / 2;

        if (baselineDiff < avgHeight * lineTolerance) {
            currentLine.push(current);
        } else {
            // Sort line by X position
            currentLine.sort((a, b) => a.x - b.x);
            lines.push(currentLine);
            currentLine = [current];
        }
    }

    // Don't forget the last line
    if (currentLine.length > 0) {
        currentLine.sort((a, b) => a.x - b.x);
        lines.push(currentLine);
    }

    return lines;
}

/**
 * Merge adjacent text items on the same line into blocks
 */
export function mergeLineItems(
    line: TextPosition[],
    spaceThreshold: number = 0.3  // Fraction of font size for space detection
): { text: string; boundingBox: { x: number; y: number; width: number; height: number } } {
    if (line.length === 0) {
        return { text: '', boundingBox: { x: 0, y: 0, width: 0, height: 0 } };
    }

    let text = '';
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (let i = 0; i < line.length; i++) {
        const item = line[i];

        // Update bounding box
        minX = Math.min(minX, item.x);
        minY = Math.min(minY, item.y);
        maxX = Math.max(maxX, item.x + item.width);
        maxY = Math.max(maxY, item.y + item.height);

        // Check if we need to add a space
        if (i > 0) {
            const prev = line[i - 1];
            const gap = item.x - (prev.x + prev.width);
            const avgFontSize = (item.fontSize + prev.fontSize) / 2;

            if (gap > avgFontSize * spaceThreshold) {
                text += ' ';
            }
        }

        text += item.text;
    }

    return {
        text,
        boundingBox: {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        }
    };
}

/**
 * Extract text with precise positioning from a PDF page
 * Returns text blocks with accurate bounding boxes for editing
 */
export async function extractTextWithPrecision(
    page: any,
    viewport: any,
    pageIndex: number
): Promise<TextBlock[]> {
    const textContent = await page.getTextContent();

    // Convert raw items to TextPositions
    const positions: TextPosition[] = textContent.items
        .filter((item: any) => typeof item.str === 'string' && item.str.trim() !== '')
        .map((item: any) => calculateTextItemBounds(item, viewport));

    // Group into lines
    const lines = groupIntoLines(positions);

    // Create text blocks from lines
    const blocks: TextBlock[] = [];
    let blockId = 0;

    for (const line of lines) {
        const merged = mergeLineItems(line);

        // Calculate PDF coordinates for the bounding box
        const pdfTopLeft = viewportToPdf(merged.boundingBox.x, merged.boundingBox.y, viewport);
        const pdfBottomRight = viewportToPdf(
            merged.boundingBox.x + merged.boundingBox.width,
            merged.boundingBox.y + merged.boundingBox.height,
            viewport
        );

        blocks.push({
            id: `block-${pageIndex}-${blockId++}`,
            pageIndex,
            text: merged.text,
            items: line,
            boundingBox: merged.boundingBox,
            pdfCoordinates: {
                x: Math.min(pdfTopLeft.x, pdfBottomRight.x),
                y: Math.min(pdfTopLeft.y, pdfBottomRight.y),
                width: Math.abs(pdfBottomRight.x - pdfTopLeft.x),
                height: Math.abs(pdfBottomRight.y - pdfTopLeft.y)
            },
            fontSize: line[0]?.fontSize || 12,
            fontName: line[0]?.fontName || 'Unknown'
        });
    }

    return blocks;
}

/**
 * Get precise whiteout rectangles for a list of text items
 * Used when replacing text - creates properly sized white rectangles
 */
export function getWhiteoutRectangles(
    items: TextPosition[],
    padding: number = 2
): Array<{ x: number; y: number; width: number; height: number }> {
    const lines = groupIntoLines(items);

    return lines.map(line => {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const item of line) {
            minX = Math.min(minX, item.x);
            minY = Math.min(minY, item.y);
            maxX = Math.max(maxX, item.x + item.width);
            maxY = Math.max(maxY, item.y + item.height);
        }

        return {
            x: minX - padding,
            y: minY - padding,
            width: (maxX - minX) + (padding * 2),
            height: (maxY - minY) + (padding * 2)
        };
    });
}

/**
 * Calculate the best position to draw replacement text
 * Accounts for font differences between original and replacement
 */
export function calculateReplacementPosition(
    originalBlock: TextBlock,
    replacementFontSize: number,
    viewport: any
): {
    x: number;
    y: number;
    pdfX: number;
    pdfY: number;
} {
    // Use the first item's baseline as reference
    const firstItem = originalBlock.items[0];
    if (!firstItem) {
        return {
            x: originalBlock.boundingBox.x,
            y: originalBlock.boundingBox.y,
            pdfX: originalBlock.pdfCoordinates.x,
            pdfY: originalBlock.pdfCoordinates.y
        };
    }

    // Calculate where the baseline should be for the replacement text
    const newAscent = replacementFontSize * 0.85;

    // In viewport: text is drawn at baseline
    const viewportX = firstItem.x;
    const viewportY = firstItem.baseline;  // Use original baseline

    // Convert back to PDF coordinates
    const pdfPos = viewportToPdf(viewportX, viewportY, viewport);

    return {
        x: viewportX,
        y: viewportY - newAscent,  // Adjust for new ascent
        pdfX: pdfPos.x,
        pdfY: pdfPos.y
    };
}

export default {
    extractFontMetrics,
    pdfToViewport,
    viewportToPdf,
    calculateTextItemBounds,
    calculateWhiteoutRect,
    groupIntoLines,
    mergeLineItems,
    extractTextWithPrecision,
    getWhiteoutRectangles,
    calculateReplacementPosition
};
