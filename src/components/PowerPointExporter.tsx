import { useState, useEffect } from 'react';
import type { LoadedPDF } from '../App';
import { saveAs } from 'file-saver';
import PptxGenJS from 'pptxgenjs';
import { Loader2, Download, Presentation, X, Layers, ScanSearch, Image as ImageIcon, Crown } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { CONVERT_FROM_PDF } from '../config/api';

interface PowerPointExporterProps {
    pdf: LoadedPDF;
    onClose: () => void;
    isPremium?: boolean;
    onDownload?: (file: File | Blob, fileName: string) => void;
}

interface TextItem {
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontFamily?: string;
    bold?: boolean;
    color?: string;
}

interface ContentBlock {
    type: 'title' | 'heading' | 'text';
    content: string;
    items: TextItem[];
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    isCentered: boolean;
    color: string;
    bold?: boolean;
}

export function PowerPointExporter({ pdf, onClose, isPremium, onDownload }: PowerPointExporterProps) {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState('');
    const [mode, setMode] = useState<'editable' | 'image' | 'ocr_preview'>('image');
    const [localExtractedText, setLocalExtractedText] = useState<{ [p: number]: TextItem[] }>(() => {
        const initial: { [p: number]: TextItem[] } = {};
        if (pdf.extractedText) {
            Object.keys(pdf.extractedText).forEach(pStr => {
                const p = Number(pStr);
                const rawItems = (pdf.extractedText![p] || []) as any[];

                // 1. Scale and Normalize
                let items: TextItem[] = rawItems
                    .filter(it => (it.content || it.str || '').trim().length > 0)
                    .map(it => ({
                        content: it.content || it.str || '',
                        x: it.x / 1.5,
                        y: it.y / 1.5,
                        width: (it.width || 5) / 1.5,
                        height: (it.height || 10) / 1.5,
                        fontSize: (it.fontSize || 12) / 1.5,
                        color: it.color || '#000000',
                        bold: !!it.bold,
                        fontFamily: it.fontFamily || 'Arial'
                    }));

                // 2. Strict De-duplication: Only remove exact overlap artifacts
                // This prevents deleting unique words that are close together
                initial[p] = items.filter((item, idx) => {
                    const firstMatch = items.findIndex(it =>
                        Math.abs(it.x - item.x) < 2 &&
                        Math.abs(it.y - item.y) < 2 &&
                        it.content.trim() === item.content.trim()
                    );
                    return firstMatch === idx;
                });
            });
        }
        return initial;
    });
    const [previewPages, setPreviewPages] = useState<string[]>([]);

    useEffect(() => {
        generatePreviews();
    }, [pdf]);

    const generatePreviews = async () => {
        setLoading(true);
        setProgress('Generating previews...');
        const thumbs: string[] = [];

        for (let i = 1; i <= pdf.pdfDoc.numPages; i++) {
            try {
                const page = await pdf.pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 0.3 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
                    thumbs.push(canvas.toDataURL('image/png', 0.7));
                }
            } catch {
                thumbs.push('');
            }
        }
        setPreviewPages(thumbs);
        setLoading(false);
        setProgress('');
    };

    const performOCR = async () => {
        if (!confirm('Run OCR to recognize text? This is required for scanned PDFs.')) return;
        setLoading(true);
        setProgress('Initializing OCR engine...');
        let worker: any = null;
        try {
            worker = await createWorker('eng');
            const newExtractedText: { [p: number]: TextItem[] } = { ...localExtractedText };

            for (let i = 1; i <= pdf.pdfDoc.numPages; i++) {
                setProgress(`Scanning Page ${i}/${pdf.pdfDoc.numPages}...`);
                const page = await pdf.pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
                    const result = await worker.recognize(canvas);
                    const data = (result as any).data;
                    const words = data?.words || [];
                    const conversionRatio = 1.0 / 2.0; // Map from 2.0 canvas to 1.0 PDF points

                    const items: TextItem[] = words.map((w: any) => ({
                        content: w.text,
                        x: w.bbox.x0 * conversionRatio,
                        y: w.bbox.y0 * conversionRatio,
                        width: (w.bbox.x1 - w.bbox.x0) * conversionRatio,
                        height: (w.bbox.y1 - w.bbox.y0) * conversionRatio,
                        fontSize: (w.bbox.y1 - w.bbox.y0) * conversionRatio,
                        fontFamily: 'Arial',
                        bold: false,
                        color: '#000000'
                    }));
                    newExtractedText[i] = items;
                }
            }
            setLocalExtractedText(newExtractedText);
            setProgress('OCR Complete!');
        } catch (e) {
            console.error(e);
            alert('OCR Failed: ' + (e instanceof Error ? e.message : String(e)));
        } finally {
            if (worker) await worker.terminate();
        }
        setLoading(false);
        setProgress('');
    };

    const toHex = (color?: string): string => {
        if (!color) return '000000';
        if (color.startsWith('#')) return color.replace('#', '').slice(0, 6);
        if (color.startsWith('rgb')) {
            const matches = color.match(/\d+/g);
            if (matches && matches.length >= 3) {
                const r = parseInt(matches[0]).toString(16).padStart(2, '0');
                const g = parseInt(matches[1]).toString(16).padStart(2, '0');
                const b = parseInt(matches[2]).toString(16).padStart(2, '0');
                return (r + g + b).toUpperCase();
            }
        }
        return '000000';
    };

    /**
     * Reconstructs content blocks with exact bounding boxes
     */
    const reconstructContentBlocks = (items: TextItem[], _viewportWidth: number, _viewportHeight: number): ContentBlock[] => {
        if (!items || items.length === 0) return [];

        // 1. Precise Spatial Deduplication
        const deduplicated = items.filter((item, idx) => {
            const collision = items.find((other, otherIdx) => {
                if (idx === otherIdx) return false;
                const overlapX = Math.abs(item.x - other.x) < 2;
                const overlapY = Math.abs(item.y - other.y) < 1.5;
                if (overlapX && overlapY) {
                    if (other.content.length > item.content.length) return true;
                    if (otherIdx < idx && other.content.length === item.content.length) return true;
                }
                return false;
            });
            return !collision;
        });

        // 2. Group into Lines
        const sorted = [...deduplicated].sort((a, b) => {
            if (Math.abs(a.y - b.y) < 3.5) return a.x - b.x;
            return a.y - b.y;
        });

        const lines: TextItem[][] = [];
        let curLine: TextItem[] = [];
        let lastY = -1000;

        for (const item of sorted) {
            if (curLine.length > 0 && Math.abs(item.y - lastY) > (item.height || 10) * 0.7) {
                lines.push(curLine);
                curLine = [];
            }
            curLine.push(item);
            lastY = item.y;
        }
        if (curLine.length > 0) lines.push(curLine);

        // 3. Split Lines into Column Segments
        const segments: ContentBlock[] = [];
        for (const line of lines) {
            let curSegment: TextItem[] = [];
            for (let i = 0; i < line.length; i++) {
                const it = line[i];
                const prev = i > 0 ? line[i - 1] : null;
                const xGap = prev ? (it.x - (prev.x + prev.width)) : 0;

                // Be more conservative: Split only if gap is > 5.0x font size
                // This prevents over-splitting sidenotes while still catching major columns
                const columnThreshold = (it.fontSize || 12) * 5.0;

                if (curSegment.length > 0 && xGap > columnThreshold) {
                    segments.push(createBlockFromItems(curSegment));
                    curSegment = [];
                }
                curSegment.push(it);
            }
            if (curSegment.length > 0) segments.push(createBlockFromItems(curSegment));
        }

        // 4. Structural Column Merging (Vertical Column Flow)
        const finalBlocks: ContentBlock[] = [];
        const processedIndices = new Set<number>();

        // Sort segments: Primary X (Columns), Secondary Y (Rows)
        const typedSegments = segments.map((s, i) => ({ s, i })).sort((a, b) => {
            if (Math.abs(a.s.x - b.s.x) < 30) return a.s.y - b.s.y;
            return a.s.x - b.s.x;
        });

        for (let i = 0; i < typedSegments.length; i++) {
            if (processedIndices.has(typedSegments[i].i)) continue;

            const base = typedSegments[i].s;
            const blockItems = [...base.items];
            let blockX = base.x;
            let blockW = base.width;
            let currentBottom = base.y + base.height;

            processedIndices.add(typedSegments[i].i);

            // Look for segments directly below in the same structural column
            for (let j = i + 1; j < typedSegments.length; j++) {
                const next = typedSegments[j].s;
                if (processedIndices.has(typedSegments[j].i)) continue;

                const sameColumn = Math.abs(next.x - blockX) < 40;
                // Standard Paragraph Detection: 1.35x font size is usually the break point
                const isDirectlyBelow = (next.y - currentBottom) < (next.fontSize * 1.35);
                const sameStyle = Math.abs(next.fontSize - base.fontSize) < 2;

                if (sameColumn && isDirectlyBelow && sameStyle) {
                    blockItems.push(...next.items);
                    const newMaxX = Math.max(blockX + blockW, next.x + next.width);
                    blockX = Math.min(blockX, next.x);
                    blockW = newMaxX - blockX;
                    currentBottom = next.y + next.height;
                    processedIndices.add(typedSegments[j].i);
                } else {
                    // Stop merging as soon as we hit a larger gap or another column
                    break;
                }
            }

            const combined = createBlockFromItems(blockItems);
            combined.x = blockX;
            combined.width = blockW;
            finalBlocks.push(combined);
        }

        return finalBlocks;
    };

    const createBlockFromItems = (items: TextItem[]): ContentBlock => {
        const first = items[0];
        const last = items[items.length - 1];
        const width = (last.x + last.width) - first.x;
        const height = Math.max(...items.map(it => it.height || 10));

        // Group items by line to insert newlines
        const linesMap: { [key: number]: TextItem[] } = {};
        items.forEach(it => {
            const y = Math.round(it.y);
            if (!linesMap[y]) linesMap[y] = [];
            linesMap[y].push(it);
        });

        const sortedY = Object.keys(linesMap).map(Number).sort((a, b) => a - b);
        const content = sortedY.map(y =>
            linesMap[y].sort((a, b) => a.x - b.x).map(it => it.content).join(" ")
        ).join("\n").replace(/ +/g, ' ').trim();

        return {
            type: 'text',
            content: content,
            items: [...items],
            x: first.x,
            y: first.y,
            width: width,
            height: height,
            fontSize: first.fontSize || 12,
            isCentered: false,
            color: first.color || '#000000',
            bold: items.some(it => it.bold)
        };
    };

    const handleExportEditable = async () => {
        setLoading(true);
        setProgress('Preparing PowerPoint export...');

        try {
            // Try server-side conversion first
            const CONVERSION_API = CONVERT_FROM_PDF;
            // Send mode: 'visual' for image-based (perfect quality), 'editable' for text-based
            const serverMode = mode === 'image' ? 'visual' : 'editable';

            try {
                // IMPORTANT: pdf.file should be the EDITED version if user clicked "Apply Changes"
                console.log(`📊 Converting to PowerPoint: ${pdf.file.name} (${pdf.file.size} bytes)`);

                const formData = new FormData();
                formData.append('file', pdf.file);
                formData.append('format', 'pptx');
                formData.append('mode', serverMode);

                setProgress(mode === 'image' ? '[Server] Creating visual PowerPoint...' : '[Server] Creating editable PowerPoint...');
                const response = await fetch(`${CONVERSION_API}?format=pptx&mode=${serverMode}&isPremium=${isPremium}`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const blob = await response.blob();
                    if (onDownload) onDownload(blob, pdf.name.replace(/\.pdf$/i, '') + '.pptx');
                    else saveAs(blob, pdf.name.replace(/\.pdf$/i, '') + '.pptx');
                    setProgress('');
                    setLoading(false);
                    return;
                } else {
                    throw new Error('Server conversion failed');
                }
            } catch (serverError) {
                console.warn('Server conversion unavailable, using client-side fallback:', serverError);
                setProgress('[Local] Building presentation...');
            }

            // Client-side fallback
            setProgress('Preparing layout...');

            const pptx = new PptxGenJS();
            pptx.author = 'PDF PHD';
            pptx.title = 'Converted from PDF (High Quality)';

            // --- 1. DYNAMIC LAYOUT DEFINITION (The "iLovePDF" secret for perfect look) ---
            // Use the first page dimensions as a base, but ideally we'd define per slide
            // We'll define a custom layout for the document
            const firstPage = pdf.pages[0];
            const pdfW = firstPage.width / 72;
            const pdfH = firstPage.height / 72;
            pptx.defineLayout({ name: 'NATIVE_PDF', width: pdfW, height: pdfH });
            pptx.layout = 'NATIVE_PDF';

            const totalPages = pdf.pdfDoc.numPages;

            for (let i = 1; i <= totalPages; i++) {
                setProgress(`Processing slide ${i}/${totalPages}...`);

                const items = localExtractedText[i] || [];
                const page = await pdf.pdfDoc.getPage(i);

                // Get page specific dimensions (supporting mixed orientations)
                const pageViewport = page.getViewport({ scale: 1.0 });
                const curPdfW = pageViewport.width / 72;
                const curPdfH = pageViewport.height / 72;

                const toInchesX = (x: number) => (x / pageViewport.width) * curPdfW;
                const toInchesY = (y: number) => (y / pageViewport.height) * curPdfH;
                const toPtFontSize = (fs: number) => Math.max(7, Math.round(fs));

                const rawBlocks = reconstructContentBlocks(items, pageViewport.width, pageViewport.height);

                // --- 2. SURGICAL BACKGROUND GENERATION ---
                // We render the page at high-res but INTERCEPT text commands
                const renderScale = 2.0;
                const renderView = page.getViewport({ scale: renderScale });
                const canvas = document.createElement('canvas');
                canvas.width = renderView.width;
                canvas.height = renderView.height;
                const ctx = canvas.getContext('2d');

                let bgImageData = '';
                if (ctx) {
                    // Hijack text drawing to exclude it from background
                    const originalFillText = ctx.fillText;
                    const originalStrokeText = ctx.strokeText;

                    try {
                        ctx.fillText = function () { };
                        ctx.strokeText = function () { };
                        await page.render({ canvasContext: ctx, viewport: renderView, canvas }).promise;
                    } finally {
                        // Restore immediately
                        ctx.fillText = originalFillText;
                        ctx.strokeText = originalStrokeText;
                    }

                    bgImageData = canvas.toDataURL('image/png');
                }

                const slide = pptx.addSlide();
                if (bgImageData) {
                    slide.addImage({
                        data: bgImageData,
                        x: 0,
                        y: 0,
                        w: curPdfW,
                        h: curPdfH
                    });
                }

                // --- 3. HIGH-PRECISION TEXT OVERLAY ---
                for (const block of rawBlocks) {
                    const x = toInchesX(block.x);
                    const y = toInchesY(block.y);

                    if (isNaN(x) || isNaN(y) || !block.content.trim()) continue;

                    // Box Width: Be generous to prevent "Vertical Jumbling"
                    const contentWidth = (toInchesX(block.x + block.width) - x);
                    const wPadding = 0.5; // More padding is safer

                    const baseFS = toPtFontSize(block.fontSize);
                    // Force minimum logical width (1.5 inches) for paragraphs
                    const minW = block.items.length > 1 ? 1.5 : (baseFS / 72) * 5;

                    const w = Math.max(minW, Math.min(curPdfW - x - 0.05, contentWidth + wPadding));
                    const h = Math.max(0.1, Math.min(curPdfH - y - 0.05, (toInchesY(block.y + block.height) - y) + 0.1));

                    const textOptions: any = {
                        x: block.isCentered ? 0 : x,
                        y: y,
                        w: block.isCentered ? curPdfW : w,
                        h: h,
                        fontSize: baseFS,
                        fontFace: (block.items[0]?.fontFamily || '').toLowerCase().includes('serif') ? 'Times New Roman' : 'Arial',
                        color: toHex(block.items[0]?.color),
                        bold: block.bold,
                        align: (block.isCentered ? 'center' : 'left') as 'center' | 'left',
                        valign: 'top',
                        // Enable wrapping for multi-item paragraphs
                        wrap: block.items.length > 1 || block.content.length > 25,
                        autoFit: false, // Absolutely disable shrinkage
                        margin: 0
                    };

                    slide.addText(block.content, textOptions);
                }
            }

            setProgress('Generating PPTX...');
            const blob = await pptx.write({ outputType: 'blob' }) as Blob;
            if (onDownload) onDownload(blob, pdf.name.replace(/\.pdf$/i, '') + '.pptx');
            else saveAs(blob, pdf.name.replace(/\.pdf$/i, '') + '.pptx');
            setProgress('');
        } catch (e) {
            console.error(e);
            alert('Export failed: ' + (e instanceof Error ? e.message : String(e)));
        }
        setLoading(false);
    };

    const handleExportImage = async () => {
        setLoading(true);
        setProgress('Creating image-based PowerPoint...');

        try {
            const pptx = new PptxGenJS();
            pptx.author = 'PDF PHD';
            pptx.title = 'Converted from PDF';
            pptx.layout = 'LAYOUT_WIDE';

            for (let i = 1; i <= pdf.pdfDoc.numPages; i++) {
                setProgress(`Rendering page ${i}/${pdf.pdfDoc.numPages}...`);

                const page = await pdf.pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 2.5 }); // High quality
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');

                if (ctx) {
                    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
                    const dataUrl = canvas.toDataURL('image/png', 0.95);

                    const slide = pptx.addSlide();
                    slide.addImage({
                        data: dataUrl,
                        x: 0,
                        y: 0,
                        w: '100%',
                        h: '100%',
                        sizing: { type: 'contain', w: '100%', h: '100%' }
                    });
                }
            }

            setProgress('Saving file...');
            const blob = await pptx.write({ outputType: 'blob' }) as Blob;
            if (onDownload) onDownload(blob, pdf.name.replace(/\.pdf$/i, '') + '.pptx');
            else saveAs(blob, pdf.name.replace(/\.pdf$/i, '') + '.pptx');
            setProgress('');
        } catch (e) {
            console.error(e);
            alert('Export failed: ' + (e instanceof Error ? e.message : String(e)));
        }

        setLoading(false);
    };

    const handleExport = () => {
        // Both 'image' and 'editable' modes use server-side processing
        // handleExportEditable sends the mode parameter to the server
        if (mode === 'editable' || mode === 'image') {
            handleExportEditable();
        } else {
            // OCR preview mode - use client-side
            handleExportImage();
        }
    };

    const hasText = Object.keys(localExtractedText).length > 0;

    return (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#1a1a2e' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(30,30,50,0.95)' }}>
                <div className="flex items-center gap-3">
                    <Presentation className="w-5 h-5 text-orange-400" />
                    <div>
                        <h2 className="text-white font-semibold flex items-center gap-2">PDF to PowerPoint {isPremium && <Crown className="w-3 h-3 text-amber-500" />}</h2>
                        <p className="text-xs text-gray-400">{progress || `${pdf.pdfDoc.numPages} slide(s) • Server-powered conversion`}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Mode Selector */}
                    <div className="flex items-center gap-1 bg-black/30 rounded-lg p-1">
                        <button
                            onClick={() => setMode('image')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${mode === 'image' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            title="Perfect layout - pages as images"
                        >
                            <ImageIcon className="w-4 h-4" />Visual
                        </button>
                        <button
                            onClick={() => setMode('editable')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${mode === 'editable' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            title="Editable text boxes"
                        >
                            <Layers className="w-4 h-4" />Editable
                        </button>
                    </div>
                    <button
                        onClick={performOCR}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 disabled:opacity-50"
                        title="Scan images for text (for scanned PDFs)"
                    >
                        <ScanSearch className="w-4 h-4" />OCR
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        disabled={loading || (mode === 'editable' && !hasText)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition-all disabled:opacity-50 font-medium"
                    >
                        <Download className="w-4 h-4" />Download .pptx
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
            </div>

            {/* Mode Description Banner */}
            <div className={`px-4 py-3 border-b ${mode === 'image' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                <div className="max-w-4xl mx-auto flex items-start gap-3">
                    {mode === 'image' ? (
                        <>
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <ImageIcon className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium text-sm">Visual Mode - Perfect Layout</h3>
                                <p className="text-blue-300/70 text-xs mt-0.5">
                                    Each page becomes a <strong>high-quality image slide</strong>. Layout is 100% accurate.
                                    Best for: Presentations, archiving, complex layouts.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Layers className="w-4 h-4 text-orange-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium text-sm">Editable Mode - Text Boxes</h3>
                                <p className="text-orange-300/70 text-xs mt-0.5">
                                    Text is extracted as <strong>editable text boxes</strong> you can modify in PowerPoint.
                                    <span className="text-yellow-400 ml-1">💡 For scanned PDFs, click "OCR" first.</span>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6" style={{ background: '#0d0d1a' }}>
                {loading ? (
                    <div className="flex items-center justify-center h-full flex-col">
                        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-3" />
                        <p className="text-gray-400 animate-pulse">{progress || 'Processing...'}</p>
                    </div>
                ) : (
                    <div>
                        <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
                            {mode === 'editable' ? (
                                <div className="flex items-start gap-3">
                                    <Layers className="w-6 h-6 text-orange-400 mt-0.5" />
                                    <div>
                                        <h3 className="text-white font-medium">Editable Text Mode</h3>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Creates slides with editable text boxes. Text can be selected, edited, and formatted in PowerPoint.
                                            {!hasText && <span className="text-yellow-400 block mt-1">⚠ No text detected. Run OCR for scanned PDFs.</span>}
                                            <span className="text-blue-400 block mt-1">💡 Note: In PowerPoint, click "Enable Editing" at the top to modify text.</span>
                                        </p>
                                    </div>
                                </div>
                            ) : mode === 'image' ? (
                                <div className="flex items-start gap-3">
                                    <ImageIcon className="w-6 h-6 text-blue-400 mt-0.5" />
                                    <div>
                                        <h3 className="text-white font-medium">Image Slides Mode</h3>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Each PDF page becomes a high-quality image slide. Perfect layout preservation but content is not editable.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3">
                                    <ScanSearch className="w-6 h-6 text-purple-400 mt-0.5" />
                                    <div>
                                        <h3 className="text-white font-medium">OCR Debug Preview</h3>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Visualize recognized text regions (red boxes). This helps you confirm which parts of the scan were successfully converted to editable text.
                                            {!hasText && <span className="text-yellow-400 block mt-1">⚠ No OCR data found. Click "Run OCR" to scan this document.</span>}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {previewPages.map((thumb, idx) => (
                                <div key={idx} className="relative rounded-lg overflow-hidden border border-white/10 bg-white/5">
                                    {thumb ? (
                                        <div className="relative">
                                            <img src={thumb} alt={`Page ${idx + 1}`} className="w-full h-auto opacity-70" />
                                            {/* OCR Overlays */}
                                            {mode === 'ocr_preview' && localExtractedText[idx + 1] && (
                                                <div className="absolute inset-0 pointer-events-none">
                                                    {localExtractedText[idx + 1].map((item, i) => (
                                                        <div
                                                            key={i}
                                                            className="absolute border border-red-500/50 bg-red-500/10"
                                                            style={{
                                                                left: `${(item.x / (pdf.pages[idx]?.width || 1)) * 100}%`,
                                                                top: `${(item.y / (pdf.pages[idx]?.height || 1)) * 100}%`,
                                                                width: `${(item.width / (pdf.pages[idx]?.width || 1)) * 100}%`,
                                                                height: `${(item.height / (pdf.pages[idx]?.height || 1)) * 100}%`,
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="aspect-[16/9] bg-gray-800 flex items-center justify-center">
                                            <Presentation className="w-8 h-8 text-gray-600" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 text-center py-1 text-xs font-medium bg-black/60 text-gray-300">
                                        Slide {idx + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
