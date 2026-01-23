// Enhanced PDF Text Layer Detector - Detects ALL text with better accuracy
// Fixed version that catches every word and sentence in the PDF

import { useEffect, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface TextBox {
    id: string;
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    rotation: number;
    pageIndex: number;
}

interface EnhancedTextLayerProps {
    pdfDocument: pdfjsLib.PDFDocumentProxy;
    pageIndex: number;
    scale: number;
    onTextBoxClick: (textBox: TextBox) => void;
    renderCanvas: HTMLCanvasElement | null;
    minFontSize?: number;  // Minimum font size to detect (default: 4)
    mergeText?: boolean;   // Whether to merge adjacent text (default: true)
    debugMode?: boolean;   // Show all detected items for debugging
}

export function EnhancedPDFTextLayerDetector({
    pdfDocument,
    pageIndex,
    scale,
    onTextBoxClick,
    renderCanvas,
    minFontSize = 4,
    mergeText = true,
    debugMode = false,
}: EnhancedTextLayerProps) {
    const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
    const [hoveredBox, setHoveredBox] = useState<string | null>(null);

    const extractTextBoxes = useCallback(async () => {
        if (!pdfDocument || !renderCanvas) return;

        try {
            console.log(`🔍 Extracting text from page ${pageIndex + 1}...`);

            const page = await pdfDocument.getPage(pageIndex + 1);
            const viewport = page.getViewport({ scale });
            const textContent = await page.getTextContent();

            console.log(`   Found ${textContent.items.length} text items`);

            const items = textContent.items as any[];
            const detectedBoxes: TextBox[] = [];

            // Extract EVERY text item
            items.forEach((item, index) => {
                // Skip if no text content
                if (!item.str || item.str.trim() === '') {
                    if (debugMode) console.log(`   Skipped empty item ${index}`);
                    return;
                }

                // Get transform matrix: [scaleX, skewX, skewY, scaleY, translateX, translateY]
                const transform = item.transform;
                const x = transform[4];
                const y = transform[5];

                // Calculate font size from transform matrix
                // Font size is typically in transform[0] or transform[3]
                const fontSizeX = Math.abs(transform[0]);
                const fontSizeY = Math.abs(transform[3]);
                const fontSize = Math.max(fontSizeX, fontSizeY);

                // Skip very small text (likely artifacts) unless in debug mode
                if (!debugMode && fontSize < minFontSize) {
                    console.log(`   Skipped small text: "${item.str}" (size: ${fontSize})`);
                    return;
                }

                // Calculate width - use item.width if available, otherwise estimate
                let width = item.width;
                if (!width || width === 0) {
                    // Estimate width based on string length and font size
                    width = item.str.length * fontSize * 0.6;
                }

                // Calculate height
                const height = fontSize * 1.2; // Standard line height

                // Convert PDF coordinates (bottom-left origin) to canvas coordinates (top-left origin)
                const canvasX = x;
                const canvasY = viewport.height - y - height;

                // Extract font family
                let fontFamily = 'Arial';
                if (item.fontName) {
                    const fontName = item.fontName.toLowerCase();
                    if (fontName.includes('times')) fontFamily = 'Times New Roman';
                    else if (fontName.includes('courier')) fontFamily = 'Courier New';
                    else if (fontName.includes('helvetica') || fontName.includes('arial')) fontFamily = 'Arial';
                }

                // Create text box
                const textBox: TextBox = {
                    id: `text-${pageIndex}-${index}`,
                    content: item.str,
                    x: canvasX,
                    y: canvasY,
                    width,
                    height,
                    fontSize,
                    fontFamily,
                    color: '#000000', // Default color
                    rotation: 0,
                    pageIndex,
                };

                detectedBoxes.push(textBox);

                if (debugMode) {
                    console.log(`   ✓ "${item.str}" at (${canvasX.toFixed(1)}, ${canvasY.toFixed(1)}) size=${fontSize.toFixed(1)}`);
                }
            });

            console.log(`✅ Detected ${detectedBoxes.length} text boxes`);

            // Optionally merge adjacent text items
            const finalBoxes = mergeText
                ? mergeAdjacentTextBoxes(detectedBoxes)
                : detectedBoxes;

            console.log(`📦 Final: ${finalBoxes.length} text boxes after ${mergeText ? 'merging' : 'no merge'}`);

            setTextBoxes(finalBoxes);
        } catch (error) {
            console.error('❌ Error extracting text boxes:', error);
        }
    }, [pdfDocument, pageIndex, scale, renderCanvas, minFontSize, mergeText, debugMode]);

    useEffect(() => {
        extractTextBoxes();
    }, [extractTextBoxes]);

    // Smart text merging - combines text on the same line
    const mergeAdjacentTextBoxes = (boxes: TextBox[]): TextBox[] => {
        if (boxes.length === 0) return [];

        const merged: TextBox[] = [];

        // Group by approximate Y position (same line)
        const lineGroups: { [key: number]: TextBox[] } = {};
        const yThreshold = 5; // pixels - texts within 5px vertically are on same line

        boxes.forEach(box => {
            // Round Y to nearest yThreshold to group lines
            const lineY = Math.round(box.y / yThreshold) * yThreshold;

            if (!lineGroups[lineY]) {
                lineGroups[lineY] = [];
            }
            lineGroups[lineY].push(box);
        });

        // Sort and merge each line
        Object.values(lineGroups).forEach(lineBoxes => {
            // Sort by X position (left to right)
            const sorted = lineBoxes.sort((a, b) => a.x - b.x);

            let currentMerge: TextBox | null = null;
            const xGapThreshold = 10; // pixels - merge if gap is less than 10px

            sorted.forEach(box => {
                if (!currentMerge) {
                    currentMerge = { ...box };
                } else {
                    const gap = box.x - (currentMerge.x + currentMerge.width);

                    // Merge if close enough
                    if (gap < xGapThreshold) {
                        // Add space if needed
                        const needsSpace = gap > 2;
                        currentMerge.content += (needsSpace ? ' ' : '') + box.content;
                        currentMerge.width = (box.x + box.width) - currentMerge.x;
                        currentMerge.id = `merged-${currentMerge.id}`;
                    } else {
                        // Save current and start new
                        merged.push(currentMerge);
                        currentMerge = { ...box };
                    }
                }
            });

            // Add last merge
            if (currentMerge) {
                merged.push(currentMerge);
            }
        });

        return merged;
    };

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 5,
            }}
        >
            {textBoxes.map((box) => (
                <div
                    key={box.id}
                    onMouseEnter={() => setHoveredBox(box.id)}
                    onMouseLeave={() => setHoveredBox(null)}
                    onClick={() => onTextBoxClick(box)}
                    style={{
                        position: 'absolute',
                        left: `${box.x}px`,
                        top: `${box.y}px`,
                        width: `${box.width}px`,
                        height: `${box.height}px`,
                        border: hoveredBox === box.id
                            ? '2px solid rgba(59, 130, 246, 0.8)' // Blue on hover
                            : debugMode
                                ? '1px solid rgba(255, 0, 0, 0.5)' // Red in debug mode
                                : '1px dashed rgba(34, 197, 94, 0.4)', // Green dotted normally
                        borderRadius: '2px',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        backgroundColor: hoveredBox === box.id
                            ? 'rgba(59, 130, 246, 0.05)'
                            : debugMode
                                ? 'rgba(255, 0, 0, 0.05)'
                                : 'transparent',
                        transition: 'all 0.15s ease',
                        boxSizing: 'border-box',
                    }}
                    title={`Click to edit: "${box.content}"`}
                >
                    {/* Show "T" icon on hover */}
                    {hoveredBox === box.id && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: 'rgba(59, 130, 246, 0.9)',
                                color: 'white',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                fontFamily: 'monospace',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                zIndex: 10,
                            }}
                        >
                            T
                        </div>
                    )}

                    {/* Debug: Show font size */}
                    {debugMode && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '-16px',
                                left: '0',
                                fontSize: '10px',
                                color: '#ef4444',
                                fontWeight: 'bold',
                                background: 'rgba(255,255,255,0.9)',
                                padding: '2px 4px',
                                borderRadius: '2px',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {box.fontSize.toFixed(1)}px
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// Alias export for backward compatibility
export const PDFTextLayerDetector = EnhancedPDFTextLayerDetector;

export default EnhancedPDFTextLayerDetector;
