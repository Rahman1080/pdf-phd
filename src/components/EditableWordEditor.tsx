import { useState, useRef, useEffect, useCallback } from 'react';
import type { LoadedPDF } from '../App';
import {
    Loader2, X, Edit3, ZoomIn, ZoomOut, Check, GripVertical, Plus,
    Table, PenTool, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { AddFieldsPanel } from './AddFieldsPanel';
import type { FormField } from './AddFieldsPanel';
import { TableCreator } from './TableCreator';
import type { TableData } from './TableCreator';
import { SignatureCreator } from './SignatureCreator';
import type { CreatorMode } from './SignatureCreator';
import pdfTextApiClient from '../utils/pdfTextApiClient';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface EditableWordEditorProps {
    pdf: LoadedPDF;
    onClose: () => void;
    onPdfUpdate: (newPdf: File) => void;
}

interface PageData {
    num: number;
    width: number;
    height: number;
    rotation: number;
    originalPage: any;
    viewport: any;
}

interface InteractiveElement {
    id: string;
    type: 'paragraph' | 'field' | 'table' | 'signature' | 'image';
    pageIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
    content: any;
    isNew?: boolean;
}

const AVAILABLE_FONTS = [
    { name: 'Times New Roman', value: 'Times-Roman', css: '"Times New Roman", Times, serif' },
    { name: 'Helvetica (Arial)', value: 'Helvetica', css: 'Helvetica, Arial, sans-serif' },
    { name: 'Courier New', value: 'Courier', css: '"Courier New", Courier, monospace' },
];

export function EditableWordEditor({ pdf, onClose, onPdfUpdate }: EditableWordEditorProps) {
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState<PageData[]>([]);
    const [scale, setScale] = useState(1.0);
    const [edits, setEdits] = useState<Record<string, string>>({});
    const [fontOverrides] = useState<Record<string, string>>({});
    const [paragraphs, setParagraphs] = useState<any[]>([]);
    const [alignments, setAlignments] = useState<Record<string, 'left' | 'center' | 'right'>>({});
    const [elements, setElements] = useState<InteractiveElement[]>([]);
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [, setShowFontMenu] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Panels
    const [showFieldsPanel, setShowFieldsPanel] = useState(false);
    const [showTableCreator, setShowTableCreator] = useState(false);
    const [showSignatureCreator, setShowSignatureCreator] = useState(false);
    const [currentPage] = useState(0);

    // Drag & Resize State
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const containerRef = useRef<HTMLDivElement>(null);

    // PDF Loading - Same as before
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const arrayBuffer = await pdf.file.arrayBuffer();
                const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const extractedPages: PageData[] = [];
                const allParagraphs: any[] = [];

                for (let i = 1; i <= doc.numPages; i++) {
                    const page = await doc.getPage(i);
                    // Get viewport without forcing rotation to discover intrinsic rotation
                    const viewport = page.getViewport({ scale: 1.0 });
                    const textContent = await page.getTextContent();

                    const pageData: PageData = {
                        num: i,
                        width: viewport.width,
                        height: viewport.height,
                        rotation: viewport.rotation,
                        originalPage: page,
                        viewport: viewport
                    };
                    extractedPages.push(pageData);

                    const scaleX = viewport.transform ? viewport.transform[0] : 1;
                    const scaleY = viewport.transform ? viewport.transform[3] : 1;

                    // Improved text extraction using PDF4QT-inspired positioning
                    const items = textContent.items
                        .filter((item: any) => typeof item.str === 'string')
                        .map((item: any, idx: number) => {
                            const transform = item.transform;

                            // Extract font metrics from transform matrix
                            // PDF transform: [a, b, c, d, e, f] where:
                            // a = horizontal scale, b = vertical skew
                            // c = horizontal skew, d = vertical scale
                            // e = x position, f = y position
                            const [a, b, , _d, e, f] = transform;

                            // Font size is the magnitude of the scaling vector
                            const fontSize = Math.sqrt(a * a + b * b);

                            // Calculate rotation angle
                            const angle = Math.atan2(b, a) * (180 / Math.PI);

                            // Viewport coordinates
                            let x, y;
                            if (viewport.convertToViewportPoint) {
                                [x, y] = viewport.convertToViewportPoint(e, f);
                            } else {
                                x = e * scaleX;
                                y = viewport.height - (f * Math.abs(scaleY));
                            }

                            // More accurate dimensions using font metrics
                            // PDF fonts typically have ascent ~85% of font size
                            const ascent = fontSize * 0.85;
                            const descent = fontSize * 0.15;

                            // Width in viewport space
                            const pixelWidth = item.width * Math.abs(scaleX);

                            // Height using proper font metrics
                            const pixelHeight = (ascent + descent) * Math.abs(scaleY);

                            // Adjust Y to account for baseline (text draws FROM baseline)
                            const adjustedY = y - ascent * Math.abs(scaleY);

                            return {
                                id: `${i}-${idx}`,
                                pageIndex: i - 1,
                                text: item.str,
                                x,
                                y: adjustedY,
                                baseline: y,  // Store original baseline
                                pdfX: e,
                                pdfY: f,
                                fontSize,
                                pixelWidth,
                                pixelHeight,
                                fontName: item.fontName,
                                right: x + pixelWidth,
                                bottom: adjustedY + pixelHeight,
                                angle,  // Store rotation for later use
                                ascent: ascent * Math.abs(scaleY),
                                descent: descent * Math.abs(scaleY),
                                transform: transform  // Store full transform
                            };
                        });

                    allParagraphs.push(...groupItems(items));
                }

                setPages(extractedPages);
                setParagraphs(allParagraphs);
            } catch (err: any) {
                console.error("Critical Editor Error:", err);
                setError(err.message || "Failed to load PDF editor layers.");
            }
            setLoading(false);
        };
        load();
    }, [pdf]);

    // Grouping logic (simplified for brevity - same as before)
    const groupItems = (items: any[]) => {
        if (items.length === 0) return [];
        const sorted = [...items].sort((a, b) => {
            const yDiff = Math.abs(a.y - b.y);
            if (yDiff < (Math.min(a.pixelHeight, b.pixelHeight) * 0.5)) return a.x - b.x;
            return a.y - b.y;
        });

        const lines: any[] = [];
        let currentLine: any = null;

        sorted.forEach(item => {
            if (!currentLine) {
                currentLine = { ...item, items: [item] };
                return;
            }
            const isSameBaseline = Math.abs(item.y - currentLine.y) < (Math.max(item.pixelHeight, currentLine.pixelHeight) * 0.4);
            const horizontalGap = item.x - currentLine.right;
            const isClose = horizontalGap < (item.pixelHeight * 0.6);

            if (isSameBaseline && isClose) {
                currentLine.text += (horizontalGap > (item.pixelHeight * 0.1) ? ' ' : '') + item.text;
                currentLine.right = item.x + item.pixelWidth;
                currentLine.pixelWidth = currentLine.right - currentLine.x;
                currentLine.items.push(item);
                currentLine.fontSize = Math.max(currentLine.fontSize, item.fontSize);
            } else {
                lines.push(currentLine);
                currentLine = { ...item, items: [item] };
            }
        });
        if (currentLine) lines.push(currentLine);

        const blocks: any[] = [];
        lines.sort((a, b) => a.y - b.y);

        lines.forEach(line => {
            let bestMatch = null;
            for (let i = blocks.length - 1; i >= Math.max(0, blocks.length - 5); i--) {
                const block = blocks[i];
                const dy = line.y - block.bottom;

                // Stricter paragraph threshold (usually 1.1-1.2x font size)
                // If the gap is larger than 10% of the font size, it's likely a new paragraph
                if (dy > (line.pixelHeight * 0.15)) continue;
                if (dy < -2) continue;

                const overlapStart = Math.max(line.x, block.left);
                const overlapEnd = Math.min(line.right, block.right);
                const overlapLen = overlapEnd - overlapStart;
                const smallerWidth = Math.min(line.pixelWidth, block.width);
                const overlapRatio = overlapLen / smallerWidth;

                // Lines in a paragraph usually have significant horizontal overlap
                const isOverlapping = overlapRatio > 0.4;
                const sizeDiff = Math.abs(line.fontSize - block.fontSize);
                if (sizeDiff > 1.0) continue; // Different font size usually means different block

                if (isOverlapping && dy <= (line.pixelHeight * 0.15)) {
                    bestMatch = block;
                    break;
                }
            }

            const lineObj = {
                text: line.text,
                pdfX: line.items[0].pdfX,
                pdfY: line.items[0].pdfY,
                fontSize: line.fontSize
            };

            if (bestMatch) {
                bestMatch.text += '\n' + line.text;
                bestMatch.bottom = Math.max(bestMatch.bottom, line.y + line.pixelHeight);
                bestMatch.right = Math.max(bestMatch.right, line.right);
                bestMatch.left = Math.min(bestMatch.left, line.x);
                bestMatch.width = bestMatch.right - bestMatch.left;
                bestMatch.height = bestMatch.bottom - bestMatch.top;
                bestMatch.originalItems.push(...line.items);
                bestMatch.lines.push(lineObj);
            } else {
                blocks.push({
                    id: 'p-' + line.id,
                    pageIndex: line.pageIndex,
                    text: line.text,
                    left: line.x,
                    top: line.y,
                    width: line.pixelWidth,
                    height: line.pixelHeight,
                    right: line.right,
                    bottom: line.y + line.pixelHeight,
                    fontSize: line.fontSize,
                    fontName: line.fontName,
                    originalItems: [...line.items],
                    lines: [lineObj]
                });
            }
        });

        return blocks;
    };

    // Drag handlers
    const handleMouseDown = (e: React.MouseEvent, elementId: string, action: 'drag' | 'resize', handle?: string) => {
        e.preventDefault();
        e.stopPropagation();

        const element = [...paragraphs, ...elements].find(el => el.id === elementId);
        if (!element) return;

        setSelectedElement(elementId);
        setDragStart({ x: e.clientX, y: e.clientY });
        setElementStart({
            x: element.left || element.x,
            y: element.top || element.y,
            width: element.width,
            height: element.height
        });

        if (action === 'drag') {
            setIsDragging(true);
        } else {
            setIsResizing(true);
            setResizeHandle(handle || null);
        }
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging && !isResizing) return;
        if (!selectedElement) return;

        const dx = (e.clientX - dragStart.x) / scale;
        const dy = (e.clientY - dragStart.y) / scale;

        // Update paragraph position
        setParagraphs(prev => prev.map(p => {
            if (p.id !== selectedElement) return p;

            if (isDragging) {
                return {
                    ...p,
                    left: elementStart.x + dx,
                    top: elementStart.y + dy
                };
            }

            if (isResizing) {
                let newWidth = p.width;
                let newHeight = p.height;
                let newLeft = p.left;
                let newTop = p.top;

                switch (resizeHandle) {
                    case 'se':
                        newWidth = Math.max(50, elementStart.width + dx);
                        newHeight = Math.max(20, elementStart.height + dy);
                        break;
                    case 'sw':
                        newWidth = Math.max(50, elementStart.width - dx);
                        newLeft = elementStart.x + dx;
                        newHeight = Math.max(20, elementStart.height + dy);
                        break;
                    case 'ne':
                        newWidth = Math.max(50, elementStart.width + dx);
                        newHeight = Math.max(20, elementStart.height - dy);
                        newTop = elementStart.y + dy;
                        break;
                    case 'nw':
                        newWidth = Math.max(50, elementStart.width - dx);
                        newHeight = Math.max(20, elementStart.height - dy);
                        newLeft = elementStart.x + dx;
                        newTop = elementStart.y + dy;
                        break;
                    case 'e':
                        newWidth = Math.max(50, elementStart.width + dx);
                        break;
                    case 'w':
                        newWidth = Math.max(50, elementStart.width - dx);
                        newLeft = elementStart.x + dx;
                        break;
                    case 'n':
                        newHeight = Math.max(20, elementStart.height - dy);
                        newTop = elementStart.y + dy;
                        break;
                    case 's':
                        newHeight = Math.max(20, elementStart.height + dy);
                        break;
                }

                return { ...p, width: newWidth, height: newHeight, left: newLeft, top: newTop };
            }

            return p;
        }));

        // Update custom elements
        setElements(prev => prev.map(el => {
            if (el.id !== selectedElement) return el;

            if (isDragging) {
                return {
                    ...el,
                    x: elementStart.x + dx,
                    y: elementStart.y + dy
                };
            }

            if (isResizing) {
                let newWidth = el.width;
                let newHeight = el.height;
                let newX = el.x;
                let newY = el.y;

                switch (resizeHandle) {
                    case 'se':
                        newWidth = Math.max(50, elementStart.width + dx);
                        newHeight = Math.max(20, elementStart.height + dy);
                        break;
                    case 'e':
                        newWidth = Math.max(50, elementStart.width + dx);
                        break;
                    case 's':
                        newHeight = Math.max(20, elementStart.height + dy);
                        break;
                }

                return { ...el, width: newWidth, height: newHeight, x: newX, y: newY };
            }

            return el;
        }));
    }, [isDragging, isResizing, selectedElement, dragStart, elementStart, scale, resizeHandle]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle(null);
    }, []);

    useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

    // Add new field
    const handleAddField = (field: FormField) => {
        const newElement: InteractiveElement = {
            id: field.id,
            type: 'field',
            pageIndex: currentPage,
            x: field.x,
            y: field.y,
            width: field.width,
            height: field.height,
            content: field,
            isNew: true
        };
        setElements(prev => [...prev, newElement]);
    };

    // Add table
    const handleInsertTable = (tableData: TableData) => {
        const newElement: InteractiveElement = {
            id: `table-${Date.now()}`,
            type: 'table',
            pageIndex: currentPage,
            x: 100,
            y: 100,
            width: tableData.cols * tableData.cellWidth,
            height: tableData.rows * tableData.cellHeight,
            content: tableData,
            isNew: true
        };
        setElements(prev => [...prev, newElement]);
        setShowTableCreator(false);
    };

    // Add signature
    const handleSaveSignature = (signatureData: string, initialsData: string | null, _signatureType: CreatorMode) => {
        if (signatureData) {
            const newElement: InteractiveElement = {
                id: `sig-${Date.now()}`,
                type: 'signature',
                pageIndex: currentPage,
                x: 100,
                y: 100,
                width: 200,
                height: 80,
                content: { signature: signatureData, initials: initialsData },
                isNew: true
            };
            setElements(prev => [...prev, newElement]);
        }
        setShowSignatureCreator(false);
    };

    const getFontFamily = (p: any): string => {
        if (fontOverrides[p.id]) {
            const match = AVAILABLE_FONTS.find(f => f.value === fontOverrides[p.id]);
            if (match) return match.css;
        }
        const name = (p.fontName || '').toLowerCase();
        if (name.includes('times') || name.includes('serif')) return '"Times New Roman", Times, serif';
        if (name.includes('helvetica') || name.includes('arial') || name.includes('sans')) return 'Helvetica, Arial, sans-serif';
        if (name.includes('courier') || name.includes('mono')) return '"Courier New", Courier, monospace';
        return '"Times New Roman", Times, serif';
    };

    // Save (extended to include new elements)
    const handleSave = async () => {
        setLoading(true);
        try {
            const bytes = await pdf.file.arrayBuffer();

            // Get only the paragraphs that were actually edited
            const editedParagraphIds = Object.keys(edits);

            // If nothing was edited and no new elements, just close
            if (editedParagraphIds.length === 0 && elements.length === 0) {
                setLoading(false);
                onClose();
                return;
            }

            // 1. Prepare text edits for the server (ONLY edited paragraphs)
            const textEdits = paragraphs
                .filter(p => edits[p.id] !== undefined) // ONLY edited ones
                .map(p => {
                    const textToRender = edits[p.id];

                    // Use ORIGINAL PDF coordinates from the extracted text items
                    // The p.lines array contains the actual PDF coordinates (pdfX, pdfY)
                    if (!p.lines || p.lines.length === 0) {
                        console.warn('Skipping paragraph with no line data:', p.id);
                        return null;
                    }

                    // Get the bounding box from the original PDF coordinates
                    const minX = Math.min(...p.lines.map((l: any) => l.pdfX));
                    const maxX = Math.max(...p.lines.map((l: any) => l.pdfX + (l.fontSize * 0.5 * (l.text?.length || 0))));
                    const minY = Math.min(...p.lines.map((l: any) => l.pdfY));
                    const maxY = Math.max(...p.lines.map((l: any) => l.pdfY + l.fontSize));

                    const pdfX = minX;
                    const pdfY = minY;
                    const pdfW = maxX - minX + 5; // Add padding
                    const pdfH = maxY - minY + 5;

                    return {
                        pageIndex: p.pageIndex,
                        originalText: p.text,
                        newText: textToRender,
                        rect: [pdfX, pdfY, pdfX + pdfW, pdfY + pdfH] as [number, number, number, number]
                    };
                })
                .filter((e): e is NonNullable<typeof e> => e !== null);

            let currentBytes: ArrayBuffer | Uint8Array = bytes;

            // 2. Try server-side edit ONLY if there are text edits
            if (textEdits.length > 0) {
                const serverResult = await pdfTextApiClient.smartTextEdit(bytes, textEdits);

                if (serverResult.success && serverResult.file) {
                    console.log(`Using server-side high-precision text editing for ${textEdits.length} paragraphs`);
                    currentBytes = serverResult.file;
                } else {
                    console.log("Server not available, falling back to pdf-lib overlay editing");

                    // Fallback using pdf-lib for text overlay
                    const { PDFDocument, rgb, StandardFonts } = await import('@cantoo/pdf-lib');
                    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
                    const pdfPages = pdfDoc.getPages();

                    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
                    const times = await pdfDoc.embedFont(StandardFonts.TimesRoman);
                    const courier = await pdfDoc.embedFont(StandardFonts.Courier);

                    const getPdfFont = (p: any) => {
                        if (fontOverrides[p.id]) {
                            if (fontOverrides[p.id] === 'Times-Roman') return times;
                            if (fontOverrides[p.id] === 'Helvetica') return helvetica;
                            if (fontOverrides[p.id] === 'Courier') return courier;
                        }
                        const name = (p.fontName || '').toLowerCase();
                        if (name.includes('times') || name.includes('serif')) return times;
                        if (name.includes('courier') || name.includes('mono')) return courier;
                        return helvetica;
                    };

                    // ONLY process edited paragraphs
                    for (const pId of editedParagraphIds) {
                        const p = paragraphs.find(para => para.id === pId);
                        if (!p) continue;

                        const textToRender = edits[p.id];
                        if (!textToRender || !textToRender.trim()) continue;

                        const page = pdfPages[p.pageIndex];
                        const font = getPdfFont(p);
                        const charHeight = p.fontSize;
                        const viewport = pages[p.pageIndex].viewport;
                        const pdfWidth = p.width / viewport.transform[0];

                        // Draw whiteout and text
                        if (p.lines && p.lines.length > 0) {
                            const topY = Math.max(...p.lines.map((l: any) => l.pdfY)) + charHeight;
                            const bottomY = Math.min(...p.lines.map((l: any) => l.pdfY));
                            const boxHeight = topY - bottomY + 2;
                            const minX = Math.min(...p.lines.map((l: any) => l.pdfX));

                            page.drawRectangle({
                                x: minX - 2,
                                y: bottomY - 1,
                                width: pdfWidth + 4,
                                height: boxHeight + 2,
                                color: rgb(1, 1, 1)
                            });

                            // Render the edited text line by line
                            const lines = textToRender.split('\n');
                            lines.forEach((lineText: string, lineIdx: number) => {
                                const baseY = p.lines[0]?.pdfY || bottomY + 2;
                                const lineY = baseY - (lineIdx * charHeight * 1.2);
                                page.drawText(lineText.trim(), {
                                    x: minX,
                                    y: lineY,
                                    size: charHeight,
                                    font: font,
                                    color: rgb(0, 0, 0)
                                });
                            });
                        }
                    }

                    const fallbackOut = await pdfDoc.save();
                    currentBytes = new Uint8Array(fallbackOut);
                }
            }

            // 3. Handle non-text elements (signatures, tables, fields) if they exist
            if (elements.length > 0) {
                const { PDFDocument: PDFDoc2, rgb: rgb2 } = await import('@cantoo/pdf-lib');
                const pdfDoc2 = await PDFDoc2.load(currentBytes, { ignoreEncryption: true });
                const pdfPages2 = pdfDoc2.getPages();

                for (const el of elements) {
                    const page = pdfPages2[el.pageIndex];
                    const pageHeight = pages[el.pageIndex].height;

                    if (el.type === 'signature' && el.content.signature) {
                        const imgBytes = await fetch(el.content.signature).then(r => r.arrayBuffer());
                        const img = await pdfDoc2.embedPng(imgBytes);
                        page.drawImage(img, {
                            x: el.x,
                            y: pageHeight - el.y - el.height,
                            width: el.width,
                            height: el.height
                        });
                    }

                    if (el.type === 'table') {
                        const table = el.content as TableData;
                        for (let r = 0; r < table.rows; r++) {
                            for (let c = 0; c < table.cols; c++) {
                                const cellX = el.x + c * table.cellWidth;
                                const cellY = pageHeight - el.y - (r + 1) * table.cellHeight;

                                // Draw cell background
                                const hexToRgb = (hex: string) => {
                                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                                    return result ? {
                                        r: parseInt(result[1], 16) / 255,
                                        g: parseInt(result[2], 16) / 255,
                                        b: parseInt(result[3], 16) / 255
                                    } : { r: 1, g: 1, b: 1 };
                                };

                                const bgColor = r === 0 ? hexToRgb(table.headerBg) : hexToRgb(table.cellBg);
                                const borderCol = hexToRgb(table.borderColor);

                                page.drawRectangle({
                                    x: cellX,
                                    y: cellY,
                                    width: table.cellWidth,
                                    height: table.cellHeight,
                                    color: rgb2(bgColor.r, bgColor.g, bgColor.b),
                                    borderColor: rgb2(borderCol.r, borderCol.g, borderCol.b),
                                    borderWidth: table.borderWidth
                                });
                            }
                        }
                    }
                }

                const out = await pdfDoc2.save();
                currentBytes = new Uint8Array(out);
            }

            const pdfBytes = new Uint8Array(currentBytes);
            // CRITICAL: Use the ORIGINAL filename (not '_edited.pdf') to replace the file in the current tab
            // This ensures edits persist when exporting/downloading
            onPdfUpdate(new File([pdfBytes as unknown as BlobPart], pdf.name, { type: 'application/pdf' }));
            onClose();
        } catch (err) {
            console.error("Save Error:", err);
            alert("Failed to apply changes.");
        }
        setLoading(false);
    };

    // Render resize handles
    const renderResizeHandles = (elementId: string) => {
        const handles = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
        const cursorMap: Record<string, string> = {
            n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize',
            ne: 'nesw-resize', sw: 'nesw-resize', nw: 'nwse-resize', se: 'nwse-resize'
        };
        const positionMap: Record<string, React.CSSProperties> = {
            n: { top: -4, left: '50%', transform: 'translateX(-50%)' },
            ne: { top: -4, right: -4 },
            e: { top: '50%', right: -4, transform: 'translateY(-50%)' },
            se: { bottom: -4, right: -4 },
            s: { bottom: -4, left: '50%', transform: 'translateX(-50%)' },
            sw: { bottom: -4, left: -4 },
            w: { top: '50%', left: -4, transform: 'translateY(-50%)' },
            nw: { top: -4, left: -4 }
        };

        return handles.map(handle => (
            <div
                key={handle}
                className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-sm shadow-md z-50"
                style={{
                    ...positionMap[handle],
                    cursor: cursorMap[handle]
                }}
                onMouseDown={(e) => handleMouseDown(e, elementId, 'resize', handle)}
            />
        ));
    };

    return (
        <div className="fixed inset-0 z-[100] flex bg-[#05050a] text-white">
            {/* Left Panel - Add Fields */}
            {showFieldsPanel && (
                <AddFieldsPanel
                    onAddField={handleAddField}
                    onClose={() => setShowFieldsPanel(false)}
                    selectedField={elements.find(e => e.id === selectedElement)?.content}
                    onUpdateField={(field) => {
                        setElements(prev => prev.map(e =>
                            e.id === selectedElement ? { ...e, content: field } : e
                        ));
                    }}
                    onDeleteField={(id) => {
                        setElements(prev => prev.filter(e => e.id !== id));
                        setSelectedElement(null);
                    }}
                />
            )}

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col">
                {/* Header Toolbar */}
                <div className="flex items-center justify-between px-6 py-3 bg-[#11111a] border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <Edit3 className="w-6 h-6 text-emerald-500" />
                        <div>
                            <h1 className="text-sm font-bold">Advanced PDF Editor</h1>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Move • Resize • Edit</p>
                        </div>
                    </div>

                    {/* Tools */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFieldsPanel(!showFieldsPanel)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${showFieldsPanel ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                                }`}
                        >
                            <Plus className="w-4 h-4" />
                            Add Fields
                        </button>
                        <button
                            onClick={() => setShowTableCreator(true)}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium flex items-center gap-2 text-white/70"
                        >
                            <Table className="w-4 h-4" />
                            Table
                        </button>
                        <button
                            onClick={() => setShowSignatureCreator(true)}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium flex items-center gap-2 text-white/70"
                        >
                            <PenTool className="w-4 h-4" />
                            Signature
                        </button>

                        <div className="w-px h-6 bg-white/10 mx-2" />

                        {/* Text Formatting Tools (Visible when a text paragraph is selected) */}
                        {selectedElement && paragraphs.find(p => p.id === selectedElement) && (
                            <div className="flex items-center gap-1 bg-white/5 rounded-lg border border-white/10 p-1 mr-2">
                                <button
                                    onClick={() => setAlignments(prev => ({ ...prev, [selectedElement]: 'left' }))}
                                    className={`p-1.5 rounded hover:bg-white/10 transition-colors ${(alignments[selectedElement] || 'left') === 'left' ? 'text-emerald-500 bg-emerald-500/10' : 'text-white/40'}`}
                                    title="Align Left"
                                >
                                    <AlignLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setAlignments(prev => ({ ...prev, [selectedElement]: 'center' }))}
                                    className={`p-1.5 rounded hover:bg-white/10 transition-colors ${alignments[selectedElement] === 'center' ? 'text-emerald-500 bg-emerald-500/10' : 'text-white/40'}`}
                                    title="Align Center"
                                >
                                    <AlignCenter className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setAlignments(prev => ({ ...prev, [selectedElement]: 'right' }))}
                                    className={`p-1.5 rounded hover:bg-white/10 transition-colors ${alignments[selectedElement] === 'right' ? 'text-emerald-500 bg-emerald-500/10' : 'text-white/40'}`}
                                    title="Align Right"
                                >
                                    <AlignRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-1">
                            <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className="p-1 px-3 hover:bg-white/10 rounded">
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
                            <button onClick={() => setScale(s => Math.min(4, s + 0.1))} className="p-1 px-3 hover:bg-white/10 rounded">
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                        >
                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Apply Changes
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div
                    className="flex-1 overflow-auto bg-[#0a0a0f] py-10"
                    ref={containerRef}
                    onClick={() => { setShowFontMenu(null); setSelectedElement(null); }}
                >
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                            <p className="text-white/50 text-sm font-mono animate-pulse">Initializing Precision Layers...</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                                <X className="w-6 h-6" />
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="flex flex-col items-center gap-10">
                            {pages.map((page, pIdx) => (
                                <div
                                    key={pIdx}
                                    className="relative bg-white shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                                    style={{
                                        width: page.width * scale,
                                        height: page.height * scale,
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <PdfPageRenderer page={page.originalPage} scale={scale} rotation={page.rotation} />

                                    {/* Interactive Layer */}
                                    <div className="absolute inset-0 z-10">
                                        {/* Paragraphs */}
                                        {paragraphs.filter(p => p.pageIndex === pIdx).map(p => {
                                            const isEdited = edits[p.id] !== undefined;
                                            const isSelected = selectedElement === p.id;

                                            return (
                                                <div
                                                    key={p.id}
                                                    className={`absolute group ${isDragging && isSelected ? 'cursor-grabbing' : 'cursor-grab'}`}
                                                    onMouseEnter={() => setHoveredId(p.id)}
                                                    onMouseLeave={() => setHoveredId(null)}
                                                    onClick={(e) => { e.stopPropagation(); setSelectedElement(p.id); }}
                                                    style={{
                                                        left: p.left * scale,
                                                        top: p.top * scale,
                                                        width: p.width * scale,
                                                        height: p.height * scale,
                                                        border: isSelected
                                                            ? '2px solid #3b82f6'
                                                            : focusedId === p.id
                                                                ? '1.5px solid #22c55e'
                                                                : hoveredId === p.id ? '1.5px dashed #22c55e60' : '1px solid transparent',
                                                        backgroundColor: (focusedId === p.id || isEdited) ? 'white' : 'transparent',
                                                        backgroundImage: isSelected && !isEdited && focusedId !== p.id
                                                            ? 'linear-gradient(rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.1))'
                                                            : 'none',
                                                        zIndex: isSelected ? 50 : focusedId === p.id ? 40 : isEdited ? 15 : 10,
                                                        borderRadius: '2px'
                                                    }}
                                                >
                                                    {/* Drag Handle */}
                                                    <div
                                                        className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
                                                        onMouseDown={(e) => handleMouseDown(e, p.id, 'drag')}
                                                    >
                                                        <GripVertical className="w-4 h-4 text-blue-500" />
                                                    </div>

                                                    {/* Resize Handles (when selected) */}
                                                    {isSelected && renderResizeHandles(p.id)}

                                                    {/* Edit indicator */}
                                                    {isEdited && !isSelected && focusedId !== p.id && (
                                                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#f37021] rounded-full border border-white shadow-sm z-30 pointer-events-none" />
                                                    )}

                                                    {/* Textarea */}
                                                    <textarea
                                                        value={isEdited ? edits[p.id] : p.text}
                                                        onChange={(e) => setEdits({ ...edits, [p.id]: e.target.value })}
                                                        onFocus={() => { setFocusedId(p.id); setShowFontMenu(null); }}
                                                        onBlur={() => setFocusedId(null)}
                                                        spellCheck={false}
                                                        className={`w-full h-full border-none outline-none resize-none overflow-hidden p-0 block text-black selection:bg-emerald-100 ${focusedId !== p.id && !isEdited ? 'text-transparent bg-transparent' : 'bg-white'
                                                            }`}
                                                        style={{
                                                            fontFamily: getFontFamily(p),
                                                            fontSize: p.fontSize * scale,
                                                            lineHeight: '1.2',
                                                            whiteSpace: 'pre-wrap',
                                                            wordBreak: 'break-word',
                                                            textAlign: alignments[p.id] || 'left'
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}

                                        {/* Custom Elements (Fields, Tables, Signatures) */}
                                        {elements.filter(el => el.pageIndex === pIdx).map(el => {
                                            const isSelected = selectedElement === el.id;

                                            return (
                                                <div
                                                    key={el.id}
                                                    className={`absolute ${isDragging && isSelected ? 'cursor-grabbing' : 'cursor-grab'}`}
                                                    onClick={(e) => { e.stopPropagation(); setSelectedElement(el.id); }}
                                                    onMouseDown={(e) => handleMouseDown(e, el.id, 'drag')}
                                                    style={{
                                                        left: el.x * scale,
                                                        top: el.y * scale,
                                                        width: el.width * scale,
                                                        height: el.height * scale,
                                                        border: isSelected ? '2px solid #3b82f6' : '1px dashed #3b82f680',
                                                        backgroundColor: el.type === 'signature' ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                                                        zIndex: isSelected ? 60 : 20,
                                                    }}
                                                >
                                                    {isSelected && renderResizeHandles(el.id)}

                                                    {/* Render based on type */}
                                                    {el.type === 'signature' && el.content.signature && (
                                                        <img
                                                            src={el.content.signature}
                                                            alt="Signature"
                                                            className="w-full h-full object-contain pointer-events-none"
                                                        />
                                                    )}

                                                    {el.type === 'table' && (
                                                        <div className="w-full h-full overflow-hidden">
                                                            <table className="w-full h-full" style={{ borderCollapse: 'collapse' }}>
                                                                <tbody>
                                                                    {Array(el.content.rows).fill(null).map((_, r) => (
                                                                        <tr key={r}>
                                                                            {Array(el.content.cols).fill(null).map((_, c) => (
                                                                                <td
                                                                                    key={c}
                                                                                    style={{
                                                                                        border: `${el.content.borderWidth}px solid ${el.content.borderColor}`,
                                                                                        backgroundColor: r === 0 ? el.content.headerBg : el.content.cellBg,
                                                                                    }}
                                                                                />
                                                                            ))}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}

                                                    {el.type === 'field' && (
                                                        <div className="w-full h-full flex items-center px-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-600">
                                                            {el.content.placeholder || el.content.type}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showTableCreator && (
                <TableCreator
                    onInsert={handleInsertTable}
                    onClose={() => setShowTableCreator(false)}
                />
            )}

            {showSignatureCreator && (
                <SignatureCreator
                    onSave={handleSaveSignature}
                    onClose={() => setShowSignatureCreator(false)}
                />
            )}
        </div>
    );
}

function PdfPageRenderer({ page, scale, rotation }: { page: any; scale: number; rotation: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        let active = true;
        const render = async () => {
            if (!canvasRef.current || !page) return;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (!context) return;
            const viewport = page.getViewport({ scale, rotation });
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            if (active) await page.render({ canvasContext: context, viewport }).promise;
        };
        render();
        return () => { active = false; };
    }, [page, scale]);
    return <canvas ref={canvasRef} className="absolute inset-0" />;
}
