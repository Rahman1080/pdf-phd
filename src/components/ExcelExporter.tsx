import { useState, useEffect } from 'react';
import type { LoadedPDF } from '../App';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Loader2, Download, FileSpreadsheet, X, Table, ScanSearch, Crown } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { CONVERT_FROM_PDF } from '../config/api';

interface ExcelExporterProps {
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
}

interface DetectedTable {
    pageNum: number;
    rows: string[][];
    startY: number;
    endY: number;
}

export function ExcelExporter({ pdf, onClose, isPremium, onDownload }: ExcelExporterProps) {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState('');
    const [localExtractedText, setLocalExtractedText] = useState<{ [p: number]: TextItem[] }>(
        pdf.extractedText as unknown as { [p: number]: TextItem[] } || {}
    );
    const [detectedTables, setDetectedTables] = useState<DetectedTable[]>([]);

    const [selectedTables, setSelectedTables] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (Object.keys(localExtractedText).length > 0) {
            detectTables();
        }
    }, [localExtractedText]);

    const performOCR = async () => {
        if (!confirm('Run OCR to recognize text in this document? This is needed for scanned PDFs.')) return;
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
                    const conversionRatio = 1.0 / 2.0;

                    const items: TextItem[] = words.map((w: any) => ({
                        content: w.text,
                        x: w.bbox.x0 * conversionRatio,
                        y: w.bbox.y0 * conversionRatio,
                        width: (w.bbox.x1 - w.bbox.x0) * conversionRatio,
                        height: (w.bbox.y1 - w.bbox.y0) * conversionRatio,
                        fontSize: (w.bbox.y1 - w.bbox.y0) * conversionRatio
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

    const handleServerConvert = async () => {
        setLoading(true);
        setProgress('Uploading and Converting on Server...');
        try {
            const pdfBlob = await pdf.pdfDoc.saveDocument();
            const formData = new FormData();
            formData.append('file', new Blob([pdfBlob], { type: 'application/pdf' }), 'document.pdf');
            formData.append('format', 'xlsx');

            const response = await fetch(CONVERT_FROM_PDF, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Conversion failed');

            const blob = await response.blob();
            if (onDownload) onDownload(blob, `converted_${Date.now()}.xlsx`);
            else saveAs(blob, `converted_${Date.now()}.xlsx`);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Server conversion failed. Make sure the server is running.');
        } finally {
            setLoading(false);
            setProgress('');
        }
    };

    /**
     * Paragraph-Based Content Extraction (like iLovePDF)
     * Instead of splitting by lines, we merge lines into complete paragraphs
     * Each paragraph becomes one row in Excel, preserving full text
     */
    const detectTables = async () => {
        setLoading(true);
        setProgress('Extracting document structure...');
        const tables: DetectedTable[] = [];

        const pageNums = Object.keys(localExtractedText).map(Number).sort((a, b) => a - b);

        for (const pageNum of pageNums) {
            const items = localExtractedText[pageNum] || [];
            if (items.length === 0) continue;

            const page = await pdf.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });

            // Sort by Y then X
            const sorted = [...items].sort((a, b) => {
                const yDiff = Math.abs(a.y - b.y);
                if (yDiff < Math.min(a.height, b.height) * 0.5) return a.x - b.x;
                return a.y - b.y;
            });

            // Group into lines
            const lines: TextItem[][] = [];
            let currentLine: TextItem[] = [];
            let lastY = -1000;
            let lastH = 10;

            for (const item of sorted) {
                if (currentLine.length > 0 && Math.abs(item.y - lastY) > lastH * 0.6) {
                    lines.push(currentLine);
                    currentLine = [];
                }
                currentLine.push(item);
                lastY = item.y;
                lastH = item.height || 10;
            }
            if (currentLine.length > 0) lines.push(currentLine);

            // STATISTICAL ANALYSIS (same as WordEditor)
            const fontSizes: number[] = [];
            const gaps: number[] = [];

            for (let i = 0; i < lines.length; i++) {
                const first = lines[i][0];
                fontSizes.push(Math.round(first.fontSize));
                if (i > 0) {
                    const prev = lines[i - 1][0];
                    const g = first.y - (prev.y + prev.height);
                    if (g > 0) gaps.push(g);
                }
            }

            const getMode = (arr: number[]) => {
                if (arr.length === 0) return 0;
                const counts: Record<number, number> = {};
                let maxCount = 0, mode = arr[0];
                for (const num of arr) {
                    const rnd = Math.round(num);
                    counts[rnd] = (counts[rnd] || 0) + 1;
                    if (counts[rnd] > maxCount) { maxCount = counts[rnd]; mode = rnd; }
                }
                return mode;
            };

            const bodyFontSize = getMode(fontSizes) || 10;
            const bodyLineGap = getMode(gaps) || (bodyFontSize * 0.2);
            const paraBreakThreshold = Math.max(bodyLineGap * 1.5, bodyFontSize * 0.5);

            // PARAGRAPH RECONSTRUCTION - merge lines into paragraphs
            const paragraphs: { text: string; type: 'title' | 'heading' | 'body'; }[] = [];
            let currentPara = '';
            let currentType: 'title' | 'heading' | 'body' = 'body';

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const first = line[0];
                const last = line[line.length - 1];

                const lineText = line.map(t => t.content).join(' ').trim();
                const lineWidth = last.x + last.width - first.x;
                const isCentered = (lineWidth < viewport.width * 0.8) &&
                    (Math.abs((viewport.width - lineWidth) / 2 - first.x) < 40);

                const isTitle = first.fontSize > bodyFontSize + 6;
                const isHeading = first.fontSize > bodyFontSize + 2;

                const prevLine = i > 0 ? lines[i - 1] : null;
                const gap = prevLine ? (first.y - (prevLine[0].y + prevLine[0].height)) : 0;

                const prevText = prevLine ? prevLine.map(t => t.content).join(' ').trim() : '';
                const endsWithPunctuation = /[.!?:]$/.test(prevText);

                const isStructuralBreak = isTitle || isHeading ||
                    (prevLine && prevLine[0].fontSize > bodyFontSize + 2) ||
                    isCentered;

                const isVisualBreak = gap > paraBreakThreshold;
                const isHugeGap = gap > paraBreakThreshold * 2;

                const isNewPara = !prevLine ||
                    isStructuralBreak ||
                    isHugeGap ||
                    (isVisualBreak && endsWithPunctuation) ||
                    (isVisualBreak && !endsWithPunctuation && gap > paraBreakThreshold * 1.2);

                if (isNewPara) {
                    // Flush current paragraph
                    if (currentPara.trim()) {
                        paragraphs.push({ text: currentPara.trim(), type: currentType });
                    }
                    currentPara = lineText;
                    currentType = isTitle ? 'title' : isHeading ? 'heading' : 'body';
                } else {
                    // Continue current paragraph
                    currentPara += ' ' + lineText;
                }
            }
            // Flush final paragraph
            if (currentPara.trim()) {
                paragraphs.push({ text: currentPara.trim(), type: currentType });
            }

            // Build Excel rows - each paragraph is one row
            const rows: string[][] = [];
            for (const para of paragraphs) {
                // Put text in column A, type indicator in column B (optional)
                rows.push([para.text]);
            }

            if (rows.length > 0) {
                tables.push({
                    pageNum,
                    rows,
                    startY: lines[0]?.[0]?.y || 0,
                    endY: lines[lines.length - 1]?.[0]?.y || 0
                });
            }
        }

        setDetectedTables(tables);
        setSelectedTables(new Set(tables.map((_, i) => i))); // Select all by default
        setLoading(false);
        setProgress('');
    };

    const handleExport = async () => {
        setLoading(true);
        setProgress('Preparing Excel export...');

        try {
            // Try server-side conversion first (tabula-py - best for tables)
            const CONVERSION_API = CONVERT_FROM_PDF;

            try {
                // IMPORTANT: pdf.file should be the EDITED version if user clicked "Apply Changes"
                console.log(`📊 Converting to Excel: ${pdf.file.name} (${pdf.file.size} bytes)`);

                const formData = new FormData();
                formData.append('file', pdf.file);
                formData.append('format', 'xlsx');

                setProgress('[Server] Creating Excel spreadsheet...');
                const response = await fetch(`${CONVERSION_API}?format=xlsx&isPremium=${isPremium}`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const blob = await response.blob();
                    if (onDownload) onDownload(blob, pdf.name.replace(/\.pdf$/i, '') + '.xlsx');
                    else saveAs(blob, pdf.name.replace(/\.pdf$/i, '') + '.xlsx');
                    setProgress('');
                    setLoading(false);
                    return;
                } else {
                    throw new Error('Server conversion failed');
                }
            } catch (serverError) {
                console.warn('Server conversion unavailable, using client-side fallback:', serverError);
                setProgress('[Local] Building spreadsheet...');
            }

            // Client-side fallback
            if (selectedTables.size === 0) {
                alert('Please select at least one page to export.');
                setLoading(false);
                return;
            }

            setProgress('Generating Excel file (iLovePDF style)...');

            const wb = XLSX.utils.book_new();
            const selectedIndices = Array.from(selectedTables).sort((a, b) => a - b);

            // Build all rows with cell data including styles
            // Format: Each paragraph in its own row in Column A
            const allCellData: any[][] = [];
            const rowHeights: { hpt: number }[] = [];

            for (let pageIdx = 0; pageIdx < selectedIndices.length; pageIdx++) {
                const tableIdx = selectedIndices[pageIdx];
                const table = detectedTables[tableIdx];
                if (!table) continue;

                // Add page separator if not first page
                if (pageIdx > 0) {
                    allCellData.push([{ v: '', s: {} }]);
                    rowHeights.push({ hpt: 15 }); // Small gap row
                }

                // Get all paragraphs for this page
                const paragraphs = table.rows.map(r => r[0] || '').filter(p => p.trim().length > 0);

                for (let i = 0; i < paragraphs.length; i++) {
                    const text = paragraphs[i];

                    // Detect if this is a title (first paragraph, short, or looks like a title)
                    const isTitle = i === 0 && text.length < 100 && !text.includes('.');
                    const isShortPara = text.length < 50 && !text.includes('.');

                    // Calculate row height based on text length (assuming ~80 chars per line with wrap)
                    const charsPerLine = 100;
                    const estimatedLines = Math.ceil(text.length / charsPerLine);
                    const baseHeight = isTitle ? 24 : 14;
                    const rowHeight = Math.max(baseHeight, estimatedLines * 14);

                    // Cell style
                    const cellStyle: any = {
                        alignment: {
                            wrapText: true,
                            vertical: 'top',
                            horizontal: 'left'
                        },
                        font: {
                            name: 'Calibri',
                            sz: isTitle ? 18 : 11,
                            bold: isTitle || isShortPara
                        },
                        border: {
                            top: { style: 'thin', color: { rgb: 'CCCCCC' } },
                            bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
                            left: { style: 'thin', color: { rgb: 'CCCCCC' } },
                            right: { style: 'thin', color: { rgb: 'CCCCCC' } }
                        }
                    };

                    allCellData.push([{ v: text, t: 's', s: cellStyle }]);
                    rowHeights.push({ hpt: rowHeight });
                }
            }

            // Create worksheet
            const ws: any = {};

            // Add all cells
            for (let r = 0; r < allCellData.length; r++) {
                const row = allCellData[r];
                for (let c = 0; c < row.length; c++) {
                    const addr = XLSX.utils.encode_cell({ r, c });
                    ws[addr] = row[c];
                }
            }

            // Set range
            ws['!ref'] = XLSX.utils.encode_range({
                s: { r: 0, c: 0 },
                e: { r: allCellData.length - 1, c: 0 }
            });

            // Set column width (wide enough for document-like appearance)
            ws['!cols'] = [{ wch: 120 }]; // Column A = 120 characters wide

            // Set row heights
            ws['!rows'] = rowHeights;

            XLSX.utils.book_append_sheet(wb, ws, 'PDF Content');

            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            if (onDownload) onDownload(blob, 'converted_spreadsheet.xlsx');
            else saveAs(blob, 'converted_spreadsheet.xlsx');

            setProgress('');
        } catch (e) {
            console.error(e);
            alert('Export failed: ' + (e instanceof Error ? e.message : String(e)));
        }

        setLoading(false);
    };

    const toggleTable = (idx: number) => {
        setSelectedTables(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    const hasText = Object.keys(localExtractedText).length > 0;

    return (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#1a1a2e' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(30,30,50,0.95)' }}>
                <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-green-400" />
                    <div>
                        <h2 className="text-white font-semibold flex items-center gap-2">PDF to Excel {isPremium && <Crown className="w-3 h-3 text-amber-500" />}</h2>
                        <p className="text-xs text-gray-400">{progress || `${pdf.pdfDoc.numPages} page(s) • ${detectedTables.length} table(s) detected`}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={performOCR}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 disabled:opacity-50"
                        title="Scan images for text (for scanned PDFs)"
                    >
                        <ScanSearch className="w-4 h-4" />OCR
                    </button>
                    <div className="w-px h-6 bg-gray-700"></div>
                    <button
                        onClick={handleExport}
                        disabled={loading || selectedTables.size === 0}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-600/50 hover:bg-gray-600 text-white rounded-md text-sm transition-all disabled:opacity-50"
                        title="Client-side extraction (basic)"
                    >
                        <Download className="w-4 h-4" />Client Export
                    </button>
                    <button
                        onClick={handleServerConvert}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-all font-medium disabled:opacity-50"
                        title="Server-powered conversion with tabula (best quality)"
                    >
                        <Download className="w-4 h-4" />Server Convert
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
            </div>

            {/* Mode Description */}
            <div className="px-4 py-3 border-b bg-green-500/10 border-green-500/20">
                <div className="max-w-4xl mx-auto flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Table className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-medium text-sm">Server-Powered Table Extraction</h3>
                        <p className="text-green-300/70 text-xs mt-0.5">
                            Uses <strong>PyMuPDF + tabula-py</strong> on our server to extract tables with high accuracy.
                            Each page becomes a sheet, tables are auto-detected and formatted.
                            <span className="text-yellow-400 ml-1">💡 Click "Server Convert" for best results.</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6" style={{ background: '#0d0d1a' }}>
                {loading ? (
                    <div className="flex items-center justify-center h-full flex-col">
                        <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-3" />
                        <p className="text-gray-400 animate-pulse">{progress || 'Processing...'}</p>
                    </div>
                ) : !hasText ? (
                    <div className="flex items-center justify-center h-full flex-col text-center">
                        <Table className="w-16 h-16 text-gray-600 mb-4" />
                        <h3 className="text-white text-lg font-medium mb-2">No Text Detected</h3>
                        <p className="text-gray-400 mb-4">This PDF appears to be scanned or image-based.<br />Click "Run OCR" to extract text.</p>
                        <button onClick={performOCR} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm transition-all">
                            <ScanSearch className="w-4 h-4" />Run OCR
                        </button>
                    </div>
                ) : detectedTables.length === 0 ? (
                    <div className="flex items-center justify-center h-full flex-col text-center">
                        <Table className="w-16 h-16 text-gray-600 mb-4" />
                        <h3 className="text-white text-lg font-medium mb-2">No Tables Detected (Client-Side)</h3>
                        <p className="text-gray-400 mb-4">Try our advanced server conversion to extract all text and tables.</p>
                        <button onClick={handleServerConvert} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all shadow-lg shadow-blue-900/20">
                            <Crown className="w-4 h-4 text-yellow-400" /> Advanced Convert (Text + Tables)
                        </button>
                        <p className="text-gray-400">Could not detect structured table data in this PDF.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {detectedTables.map((table, idx) => {
                            const isSelected = selectedTables.has(idx);
                            const previewRows = table.rows.slice(0, 5); // Show first 5 paragraphs
                            return (
                                <div
                                    key={idx}
                                    onClick={() => toggleTable(idx)}
                                    className={`bg-white/5 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${isSelected ? 'border-green-500 ring-2 ring-green-400/30' : 'border-transparent hover:border-white/20'}`}
                                >
                                    <div className={`px-4 py-2 flex items-center justify-between ${isSelected ? 'bg-green-500/20' : 'bg-white/5'}`}>
                                        <span className="text-white font-medium">Page {table.pageNum} - {table.rows.length} paragraph(s)</span>
                                        {isSelected && (
                                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {previewRows.map((row, rIdx) => (
                                            <div
                                                key={rIdx}
                                                className={`p-3 rounded-lg ${rIdx === 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/5'}`}
                                            >
                                                <p className="text-gray-300 text-sm leading-relaxed">
                                                    {row[0]?.length > 300 ? row[0].substring(0, 300) + '...' : row[0]}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    {table.rows.length > 5 && (
                                        <div className="px-4 py-2 text-xs text-gray-500 text-center bg-white/5">
                                            + {table.rows.length - 5} more paragraph(s)
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
