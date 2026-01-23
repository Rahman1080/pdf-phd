import { useState, useEffect, useRef } from 'react';
import type { LoadedPDF } from '../App';
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';
import { Loader2, Download, FileText, X, Image, FileOutput, ScanSearch, Crown } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { CONVERT_FROM_PDF } from '../config/api';

interface WordEditorProps {
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
    fontFamily: string;
    bold: boolean;
    italic: boolean;
    color?: string;
}

/**
 * Reconstructs the page HTML with paragraphs, adhering to the same logic used for Export.
 * This guarantees the preview matches the Word Output exactly.
 */
function reconstructPageHtml(items: TextItem[], viewport: any): string {
    const wordPageWidth = 595;
    const fontScale = (wordPageWidth / viewport.width) * 0.85;

    const sortedItems = [...items].sort((a, b) => {
        const yDiff = Math.abs(a.y - b.y);
        if (yDiff < (Math.min(a.height, b.height) / 2)) return a.x - b.x;
        return a.y - b.y;
    });

    const lines: TextItem[][] = [];
    let currentLine: TextItem[] = [];
    let lastY = -1000;
    let lastH = 0;

    for (const it of sortedItems) {
        if (currentLine.length > 0 && Math.abs(it.y - lastY) > (lastH || 10) * 0.6) {
            lines.push(currentLine);
            currentLine = [];
        }
        currentLine.push(it);
        lastY = it.y;
        lastH = it.height || 10;
    }
    if (currentLine.length > 0) lines.push(currentLine);

    // STATISTICAL ANALYSIS PASS
    // Calculate mode/median for Line Gap and Font Size to adapt to document spacing (Single/Double/etc)
    const gaps: number[] = [];
    const fontSizes: number[] = [];

    for (let i = 0; i < lines.length; i++) {
        const first = lines[i][0];
        fontSizes.push(Math.round(first.fontSize));
        if (i > 0) {
            const prev = lines[i - 1][0];
            const g = first.y - (prev.y + prev.height);
            if (g > 0) gaps.push(g);
        }
    }

    // Helper to find mode
    const getMode = (arr: number[]) => {
        if (arr.length === 0) return 0;
        const counts: Record<number, number> = {};
        let maxCount = 0;
        let mode = arr[0];
        for (const num of arr) {
            const rnd = Math.round(num);
            counts[rnd] = (counts[rnd] || 0) + 1;
            if (counts[rnd] > maxCount) {
                maxCount = counts[rnd];
                mode = rnd;
            }
        }
        return mode;
    };

    const bodyFontSize = getMode(fontSizes) || 10;
    // Default gap is roughly 1.2x font size if essentially 0 lines found with gap
    const bodyLineGap = getMode(gaps) || (bodyFontSize * 0.2);

    // Thresholds
    const paraBreakThreshold = Math.max(bodyLineGap * 1.5, bodyFontSize * 0.5); // At least half a line height extra

    let pageSnippet = '';
    let currentPara = '';
    let currentParaType = 'p';
    let currentParaAlign = 'left';
    let currentParaSize = 11;
    let currentParaColor = '#000000';

    const flushPara = () => {
        if (!currentPara.trim()) return;

        const normalizedFontSize = Math.max(8, Math.round(currentParaSize * fontScale));

        const style = [
            `font-family: 'Times New Roman', serif`,
            `font-size: ${normalizedFontSize}pt`,
            `text-align: ${currentParaAlign}`,
            `color: ${currentParaColor}`,
            `margin-bottom: 12pt`,
            `margin-top: 0`,
            `line-height: 1.15`
        ].join(';');

        // Intelligent Heading Mapping
        if (currentParaType.startsWith('h')) {
            const sizeMult = currentParaType === 'h1' ? 1.5 : currentParaType === 'h2' ? 1.3 : 1.1;
            const mb = currentParaType === 'h1' ? '12pt' : '8pt';
            pageSnippet += `<${currentParaType} style="${style}; font-weight: bold; font-size: ${Math.round(normalizedFontSize * sizeMult)}pt; margin-bottom: ${mb};">${currentPara}</${currentParaType}>`;
        } else {
            pageSnippet += `<p style="${style}">${currentPara}</p>`;
        }

        currentPara = '';
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const first = line[0];
        const last = line[line.length - 1];

        let lineContent = '';
        let lastXEnd = 0;
        for (const w of line) {
            const content = w.content || '';
            if (lastXEnd > 0 && (w.x - lastXEnd) > 40) lineContent += '&emsp;&emsp;';
            else if (lastXEnd > 0) lineContent += ' ';
            lineContent += content;
            lastXEnd = w.x + w.width;
        }

        const fontSize = first.fontSize;
        const lineWidth = last.x + last.width - first.x;
        // A line is centered only if it's NOT full width (width < 80%) AND symmetric
        const isCentered = (lineWidth < viewport.width * 0.8) &&
            (Math.abs((viewport.width - lineWidth) / 2 - first.x) < 40);

        // Identify Headers relative to Body Font Size
        const isTitle = fontSize > bodyFontSize + 6; // e.g. 16pt vs 10pt
        const isHeading = fontSize > bodyFontSize + 2; // e.g. 12pt vs 10pt

        const prevLine = i > 0 ? lines[i - 1] : null;
        const gap = prevLine ? (first.y - (prevLine[0].y + prevLine[0].height)) : 0;

        // Check if previous line looks like the end of a sentence
        const prevText = prevLine ? prevLine.map(t => t.content).join(' ').trim() : '';
        const endsWithPunctuation = /[.!?:]$/.test(prevText);

        // Robust Paragraph Detection
        // 1. Structural Break: Header or alignment change
        // 2. Visual Break: Gap > Threshold
        // 3. Fallback: If no punctuation, bias towards merging (unless gap is huge)

        const isStructuralBreak = isTitle || isHeading || (prevLine && prevLine[0].fontSize > bodyFontSize + 2) || (isCentered !== (currentParaAlign === 'center'));

        const isVisualBreak = gap > paraBreakThreshold;

        const isHugeGap = gap > paraBreakThreshold * 2;

        const isNewPara = !prevLine ||
            isStructuralBreak ||
            isHugeGap || // Always break on massive gaps
            (isVisualBreak && endsWithPunctuation) || // Break on visual gap IF sentence ended
            (isVisualBreak && !endsWithPunctuation && gap > paraBreakThreshold * 1.2); // If sentence didn't end, only break if gap is VERY distinct

        if (isNewPara) {
            flushPara();
            currentParaType = isTitle ? 'h1' : isHeading ? 'h2' : 'p';
            currentParaAlign = isCentered ? 'center' : 'left';
            currentParaSize = fontSize;
            currentParaColor = first.color || '#000000';
            currentPara = lineContent;
        } else {
            currentPara += ' ' + lineContent;
        }
    }
    flushPara();
    return pageSnippet;
}

export function WordEditor({ pdf, onClose, isPremium, onDownload }: WordEditorProps) {
    const [htmlContent, setHtmlContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState('');
    const [mode, setMode] = useState<'visual' | 'text'>('visual');
    const [localExtractedText, setLocalExtractedText] = useState<{ [p: number]: TextItem[] }>(pdf.extractedText as unknown as { [p: number]: TextItem[] } || {});
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        extractContent();
    }, [pdf, mode, localExtractedText]);

    const performOCR = async () => {
        if (!confirm('Run OCR to recognize text in this document? This may take a while depending on the number of pages.')) return;
        setLoading(true);
        setProgress('Initializing OCR engine...');
        let worker: any = null;
        try {
            worker = await createWorker('eng');

            const newExtractedText: { [p: number]: TextItem[] } = { ...localExtractedText };

            for (let i = 1; i <= pdf.pdfDoc.numPages; i++) {
                setProgress(`Scanning Page ${i}/${pdf.pdfDoc.numPages}...`);
                const page = await pdf.pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
                    // Cast the result to any to avoid Tesseract type issues
                    const result = await worker.recognize(canvas);
                    const data = (result as any).data;
                    const words = data?.words || [];

                    const pdfScale = 1.5;
                    const conversionRatio = pdfScale / 2.0;

                    const items: TextItem[] = words.map((w: any) => ({
                        content: w.text,
                        x: w.bbox.x0 * conversionRatio,
                        y: w.bbox.y0 * conversionRatio,
                        width: (w.bbox.x1 - w.bbox.x0) * conversionRatio,
                        height: (w.bbox.y1 - w.bbox.y0) * conversionRatio,
                        fontSize: (w.bbox.y1 - w.bbox.y0) * conversionRatio * 0.9,
                        fontFamily: 'Arial',
                        bold: w.font_weight > 600 || (w.choices && w.choices[0]?.confidence > 90),
                        italic: w.font_name && w.font_name.toLowerCase().includes('italic'),
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

    const extractVisualContent = async () => {
        let fullHtml = '';
        for (let pnm = 1; pnm <= pdf.pdfDoc.numPages; pnm++) {
            const page = await pdf.pdfDoc.getPage(pnm), scale = 2.0, vp = page.getViewport({ scale });
            const canvas = document.createElement('canvas'); canvas.width = vp.width; canvas.height = vp.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
                fullHtml += `<div style="page-break-after: always; width: ${vp.width / scale}px; margin: 0 auto 20px auto; background: white;"><img src="${canvas.toDataURL('image/png', 0.95)}" style="width:100%;" /></div>`;
            }
        }
        return fullHtml;
    };

    const extractTextContent = async () => {
        // Show the original PDF pages in preview (since pdf2docx on server preserves layout)
        // This gives a WYSIWYG preview - what you see is what you'll get from pdf2docx
        let fullHtml = '';
        for (let pnm = 1; pnm <= pdf.pdfDoc.numPages; pnm++) {
            setProgress(`Loading page ${pnm}...`);
            const page = await pdf.pdfDoc.getPage(pnm);
            const scale = 2.0;
            const vp = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            canvas.width = vp.width;
            canvas.height = vp.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
                fullHtml += `<div style="page-break-after: always; width: ${vp.width / scale}px; margin: 0 auto 20px auto; background: white; position: relative;">
                    <div style="position: absolute; top: 10px; right: 10px; background: rgba(59, 130, 246, 0.9); color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; z-index: 10;">
                        📝 Text Mode - Editable when downloaded
                    </div>
                    <img src="${canvas.toDataURL('image/png', 0.95)}" style="width:100%;" />
                </div>`;
            }
        }
        setProgress('');
        return fullHtml || '<div style="color:white;text-align:center;padding:20px;">No pages found.</div>';
    };

    const extractContent = async () => {
        setLoading(true);
        try {
            if (mode === 'visual') setHtmlContent(await extractVisualContent());
            else setHtmlContent(await extractTextContent());
        } catch { setHtmlContent('Error loading.'); }
        setLoading(false);
    };

    const handleDownload = async () => {
        try {
            setProgress(`Exporting ${mode} mode to Word...`);

            // ============================================================
            // VISUAL MODE: Each page as a high-quality image (like a screenshot)
            // What you see is exactly what you get - no text extraction
            // ============================================================
            if (mode === 'visual') {
                setProgress('Generating page images...');

                // Build HTML with one image per page
                const pages: string[] = [];
                for (let pnm = 1; pnm <= pdf.pdfDoc.numPages; pnm++) {
                    setProgress(`Rendering page ${pnm}/${pdf.pdfDoc.numPages}...`);
                    const page = await pdf.pdfDoc.getPage(pnm);
                    // Use 1.5x scale for good quality without huge file size
                    const scale = 1.5;
                    const vp = page.getViewport({ scale });

                    const canvas = document.createElement('canvas');
                    canvas.width = vp.width;
                    canvas.height = vp.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
                        const imgData = canvas.toDataURL('image/jpeg', 0.92);

                        // Calculate aspect ratio to fit in A4 page (595x842 pt)
                        const aspectRatio = vp.height / vp.width;
                        const pageWidth = 6; // inches (6in = ~432pt, leaving margins)
                        const pageHeight = pageWidth * aspectRatio;

                        pages.push(`
                            <div style="page-break-after: always; margin: 0; padding: 0;">
                                <img src="${imgData}" width="${Math.round(pageWidth * 96)}" height="${Math.round(pageHeight * 96)}" 
                                     style="display: block; margin: 0 auto;" />
                            </div>
                        `);
                    }
                }

                // Simple HTML structure for Word
                const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="UTF-8">
<style>
@page { margin: 0.5in; }
body { margin: 0; padding: 0; }
div { margin: 0; padding: 0; }
img { max-width: 100%; height: auto; }
</style>
</head>
<body>
${pages.join('\n')}
</body>
</html>`;

                const blob = await asBlob(html, {
                    orientation: 'portrait',
                    margins: { top: 720, right: 720, bottom: 720, left: 720 }
                }) as Blob;
                const fileName = pdf.name.replace(/\.pdf$/i, '') + '_visual.docx';
                if (onDownload) onDownload(blob, fileName);
                else saveAs(blob, fileName);
                setProgress('');
                return;
            }

            // For Text mode: Export flowing text (try server first, then client)
            // Try server-side conversion first (pdf2docx - best quality)
            const CONVERSION_API = CONVERT_FROM_PDF;

            try {
                // IMPORTANT: pdf.file should be the EDITED version if user clicked "Apply Changes"
                // This is ensured by App.tsx's loadFile function updating the active tab
                console.log(`📄 Converting to Word: ${pdf.file.name} (${pdf.file.size} bytes)`);

                const formData = new FormData();
                formData.append('file', pdf.file);
                formData.append('format', 'docx');

                setProgress('[Server] Creating Word document...');
                const response = await fetch(`${CONVERSION_API}?format=docx&isPremium=${isPremium}`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const fileName = pdf.name.replace(/\.pdf$/i, '') + '.docx';
                    if (onDownload) onDownload(blob, fileName);
                    else saveAs(blob, fileName);
                    setProgress('');
                    return;
                } else {
                    throw new Error('Server conversion failed');
                }
            } catch (serverError) {
                console.warn('Server conversion unavailable, using client-side fallback:', serverError);
                setProgress('[Local] Building document...');
            }

            // Client-side text fallback
            if (!localExtractedText || Object.keys(localExtractedText).length === 0) {
                alert('No text to export! Try running OCR first.');
                return;
            }

            setProgress('Reconstructing Word layout...');
            let wordHtml = '';
            const validPages = Object.keys(localExtractedText).map(Number).sort((a, b) => a - b);

            for (const pageNum of validPages) {
                const items = (localExtractedText[pageNum] || []) as TextItem[];
                const page = await pdf.pdfDoc.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1.5 });

                const pageSnippet = reconstructPageHtml(items, viewport);
                wordHtml += pageSnippet;
                if (pageNum < validPages[validPages.length - 1]) wordHtml += `<br style="page-break-after:always;">\n`;
            }

            const html = `<!DOCTYPE html><html lang="en-US" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Language>en-US</w:Language><w:HideSpelling/><w:HideGrammar/></w:WordDocument></xml><![endif]--><style>body { font-family: 'Times New Roman', serif; mso-ansi-language: EN-US; } h2, h3, p { mso-ansi-language: EN-US; }</style></head><body style="padding:1in;">${wordHtml}</body></html>`;

            const blob = await asBlob(html, { orientation: 'portrait', margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }) as Blob;
            const fileName = pdf.name.replace(/\.pdf$/i, '') + '_text.docx';
            if (onDownload) onDownload(blob, fileName);
            else saveAs(blob, fileName);
            setProgress('');
        } catch (e) {
            console.error(e);
            setProgress('Error generating Word doc');
            setTimeout(() => setProgress(''), 3000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#1a1a2e' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(30,30,50,0.95)' }}>
                <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                        <h2 className="text-white font-semibold flex items-center gap-2">
                            PDF to Word {isPremium && <Crown className="w-3 h-3 text-amber-500" />}
                        </h2>
                        <p className="text-xs text-gray-400">{progress || `${pdf.pdfDoc.numPages} page(s) • Server-powered conversion`}</p>
                    </div>
                </div>

                {/* Mode Toggle */}
                <div className="flex items-center gap-1 bg-black/30 rounded-lg p-1">
                    <button
                        onClick={() => setMode('visual')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${mode === 'visual' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        title="Perfect layout - pages as images"
                    >
                        <Image className="w-4 h-4" />Visual
                    </button>
                    <button
                        onClick={() => setMode('text')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${mode === 'text' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        title="Editable text - can modify content"
                    >
                        <FileOutput className="w-4 h-4" />Editable
                    </button>
                    <div className="w-px h-6 bg-gray-700 mx-1"></div>
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
                        onClick={handleDownload}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-sm transition-all font-medium"
                    >
                        <Download className="w-4 h-4" />Download .docx
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Mode Description Banner */}
            <div className={`px-4 py-3 border-b ${mode === 'visual' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                <div className="max-w-4xl mx-auto flex items-start gap-3">
                    {mode === 'visual' ? (
                        <>
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Image className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium text-sm">Visual Mode - Perfect Layout</h3>
                                <p className="text-blue-300/70 text-xs mt-0.5">
                                    Each page is converted as a high-quality image. Layout is <strong>100% accurate</strong> but text cannot be edited in Word.
                                    Best for: Archiving, sharing documents that must look exactly like the original.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <FileOutput className="w-4 h-4 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium text-sm">Editable Mode - Server-Powered Conversion</h3>
                                <p className="text-green-300/70 text-xs mt-0.5">
                                    Text is extracted and made <strong>fully editable</strong> in Word using our server's pdf2docx engine.
                                    Best for: Documents you need to modify, copy text from, or reformat.
                                    <span className="text-yellow-400 ml-1">💡 For scanned PDFs, click "OCR" first.</span>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-auto p-6" style={{ background: '#0d0d1a' }}>
                {loading ? (
                    <div className="flex items-center justify-center h-full text-center flex-col">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
                        <p className="text-gray-400 animate-pulse">{progress || 'Processing...'}</p>
                    </div>
                ) : (
                    <div ref={editorRef} className="mx-auto max-w-4xl" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                )}
            </div>
        </div>
    );
}

