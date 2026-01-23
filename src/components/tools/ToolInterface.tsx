import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Check, Download, X, Lock, RotateCw, Zap, Shield, ArrowRight, Trash2 } from 'lucide-react';
import * as ToolLogic from '../../utils/toolLogic';
import * as OptimizeTools from '../../services/optimizeTools';
import * as AdvancedExports from '../../utils/advancedExports';
import * as ConversionTools from '../../services/conversionTools';
import type { Tool } from '../../data/tools';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { PDFDocument } from '@cantoo/pdf-lib';
import { Printer as PrinterIcon } from 'lucide-react';
import { CONVERT_TO_PDF, CONVERT_FROM_PDF } from '../../config/api';

// Configure pdf.js worker
GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs';

interface ToolInterfaceProps {
    tool: Tool;
}

export function ToolInterface({ tool }: ToolInterfaceProps) {
    const navigate = useNavigate();
    const [files, setFiles] = useState<File[]>([]);
    const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
    const [result, setResult] = useState<Uint8Array | Uint8Array[] | null>(null);
    const [compareResult, setCompareResult] = useState<any>(null);
    const [textResult, setTextResult] = useState<{ content: string; extension: string; mimeType: string } | null>(null);
    const [imageResults, setImageResults] = useState<Blob[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Config states
    const [password, setPassword] = useState('');
    const [ranges, setRanges] = useState('');
    const [rotation, setRotation] = useState(90);
    const [selectedPages] = useState<number[]>([]);
    const [nUpOption, setNUpOption] = useState(2);
    const [compressionQuality, setCompressionQuality] = useState<'low' | 'medium' | 'high'>('medium');
    const [compressionStats, setCompressionStats] = useState<{ original: number; compressed: number; ratio: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFilesSelect = (selectedFiles: File[]) => {
        // Redirection logic for conversion tools
        if (tool.category === 'convert-to-pdf' || tool.category === 'convert-from-pdf') {
            if (selectedFiles.length > 0) {
                // For multi-image conversion, send all files
                if (tool.id === 'image-to-pdf') {
                    navigate('/workplace', { state: { incomingFiles: selectedFiles, toolId: tool.id } });
                } else {
                    navigate('/workplace', { state: { incomingFile: selectedFiles[0], toolId: tool.id } });
                }
                return;
            }
        }

        if (tool.id === 'merge' || tool.id === 'image-to-pdf' || tool.id === 'compare') {
            setFiles(prev => {
                const updated = [...prev, ...selectedFiles];
                return tool.id === 'compare' ? updated.slice(0, 2) : updated;
            });
        } else {
            setFiles([selectedFiles[0]]);
            setStatus('idle');
            setResult(null);
            setCompareResult(null);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const processTool = async () => {
        if (files.length === 0) return;

        setStatus('processing');
        setError(null);
        setCompressionStats(null);
        setTextResult(null);
        setImageResults(null);

        try {
            let data: Uint8Array | Uint8Array[] | null = null;

            switch (tool.id) {
                case 'merge':
                    if (files.length < 2) throw new Error('Please add at least 2 files to merge');
                    data = await ToolLogic.mergePDFs(files);
                    break;
                case 'split':
                    if (!ranges) throw new Error('Please specify page ranges (e.g. 1-2, 3-5)');
                    data = await ToolLogic.splitPDF(files[0], ranges);
                    break;
                case 'protect':
                    if (!password) throw new Error('Please set a password');
                    data = await ToolLogic.protectPDF(files[0], password);
                    break;
                case 'unlock':
                    data = await ToolLogic.unlockPDF(files[0], password);
                    break;
                case 'rotate':
                    data = await ToolLogic.rotatePDF(files[0], rotation);
                    break;
                case 'compress': {
                    const bytes = new Uint8Array(await files[0].arrayBuffer());
                    const res = await OptimizeTools.compressPDF(bytes, {
                        quality: compressionQuality,
                        resampleImages: true,
                        removeMetadata: true,
                        imageQuality: compressionQuality === 'low' ? 0.4 : compressionQuality === 'medium' ? 0.65 : 0.85
                    });
                    if (!res.success) throw new Error(res.error);
                    setCompressionStats({
                        original: res.originalSize,
                        compressed: res.newSize!,
                        ratio: res.compressionRatio || 0
                    });
                    data = res.pdfBytes!;
                    break;
                }
                case 'optimize': {
                    const bytes = new Uint8Array(await files[0].arrayBuffer());
                    const res = await OptimizeTools.optimizePDF(bytes);
                    if (!res.success) throw new Error(res.error);
                    setCompressionStats({
                        original: res.originalSize,
                        compressed: res.newSize!,
                        ratio: res.compressionRatio || 0
                    });
                    data = res.pdfBytes!;
                    break;
                }
                case 'linearize': {
                    const bytes = new Uint8Array(await files[0].arrayBuffer());
                    const res = await OptimizeTools.linearizePDF(bytes);
                    if (!res.success) throw new Error(res.error);
                    data = res.pdfBytes!;
                    break;
                }
                case 'repair': {
                    const bytes = new Uint8Array(await files[0].arrayBuffer());
                    const res = await OptimizeTools.repairPDF(bytes);
                    if (!res.success) throw new Error(res.error);
                    data = res.pdfBytes!;
                    break;
                }
                case 'compare': {
                    if (files.length < 2) throw new Error('Select 2 PDFs for comparison');
                    const b1 = new Uint8Array(await files[0].arrayBuffer());
                    const b2 = new Uint8Array(await files[1].arrayBuffer());
                    const res = await OptimizeTools.comparePDFs(b1, b2);
                    if (!res.success) throw new Error(res.error);
                    setCompareResult(res);
                    data = new Uint8Array(); // Marker for completion
                    break;
                }
                case 'print': {
                    const bytes = new Uint8Array(await files[0].arrayBuffer());
                    await OptimizeTools.printPDF(bytes);
                    data = bytes;
                    break;
                }
                case 'delete-pages':
                    if (selectedPages.length === 0 && !ranges) throw new Error('Please select pages to delete');
                    const pagesToDelete = ranges ? ranges.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)) : selectedPages;
                    data = await ToolLogic.deletePages(files[0], pagesToDelete);
                    break;
                case 'n-up':
                    data = await ToolLogic.nUpPDF(files[0], nUpOption);
                    break;
                case 'image-to-pdf':
                    if (files.length === 0) throw new Error('Please select images to convert');
                    data = await ToolLogic.imageToPDF(files);
                    break;
                case 'flatten':
                    data = await ToolLogic.flattenPDF(files[0]);
                    break;
                case 'certify':
                    data = await ToolLogic.certifyPDF(files[0], ranges || 'PDF PHD Certification Service');
                    break;
                case 'page-numbers':
                    data = await ToolLogic.addPageNumbers(files[0]);
                    break;

                // === EXPORT TOOLS ===
                case 'export-json': {
                    const bytes = new Uint8Array(await files[0].arrayBuffer());
                    const pdfLibDoc = await PDFDocument.load(bytes);
                    const pdfDoc = await getDocument({ data: bytes }).promise;
                    const json = await AdvancedExports.exportToJSON(pdfLibDoc, pdfDoc);
                    setTextResult({ content: json, extension: 'json', mimeType: 'application/json' });
                    data = new Uint8Array(); // Marker
                    break;
                }
                case 'export-xml': {
                    const bytes = new Uint8Array(await files[0].arrayBuffer());
                    const pdfLibDoc = await PDFDocument.load(bytes);
                    const xml = AdvancedExports.exportToXML(pdfLibDoc);
                    setTextResult({ content: xml, extension: 'xml', mimeType: 'application/xml' });
                    data = new Uint8Array();
                    break;
                }
                case 'export-fdf': {
                    const bytes = new Uint8Array(await files[0].arrayBuffer());
                    const pdfLibDoc = await PDFDocument.load(bytes);
                    const fdf = AdvancedExports.exportToFDF(pdfLibDoc, files[0].name);
                    setTextResult({ content: fdf, extension: 'fdf', mimeType: 'application/vnd.fdf' });
                    data = new Uint8Array();
                    break;
                }
                case 'export-pdfa': {
                    const bytes = new Uint8Array(await files[0].arrayBuffer());
                    const pdfLibDoc = await PDFDocument.load(bytes);
                    data = await AdvancedExports.convertToPDFA(pdfLibDoc);
                    break;
                }
                case 'export-epub': {
                    const bytes = new Uint8Array(await files[0].arrayBuffer());
                    const pdfDoc = await getDocument({ data: bytes }).promise;
                    const blob = await AdvancedExports.exportToEPUB(pdfDoc, files[0].name.replace('.pdf', ''), 'PDF PhD User');
                    // Special handling for blob in ToolInterface
                    const blobBytes = new Uint8Array(await blob.arrayBuffer());
                    data = blobBytes;
                    // We also want the right extension
                    break;
                }
                case 'sanitize-metadata': {
                    const bytes = new Uint8Array(await files[0].arrayBuffer());
                    const pdfLibDoc = await PDFDocument.load(bytes);
                    await AdvancedExports.sanitizeMetadata(pdfLibDoc);
                    data = await pdfLibDoc.save();
                    break;
                }
                case 'export-text': {
                    const bytes = new Uint8Array(await files[0].arrayBuffer());
                    const pdfDoc = await getDocument({ data: bytes }).promise;
                    const text = await AdvancedExports.exportToPlainText(pdfDoc);
                    setTextResult({ content: text, extension: 'txt', mimeType: 'text/plain' });
                    data = new Uint8Array();
                    break;
                }
                case 'export-markdown': {
                    const bytes = new Uint8Array(await files[0].arrayBuffer());
                    const pdfLibDoc = await PDFDocument.load(bytes);
                    const pdfDoc = await getDocument({ data: bytes }).promise;
                    const md = await AdvancedExports.exportToMarkdown(pdfDoc, pdfLibDoc);
                    setTextResult({ content: md, extension: 'md', mimeType: 'text/markdown' });
                    data = new Uint8Array();
                    break;
                }
                case 'export-html': {
                    const bytes = new Uint8Array(await files[0].arrayBuffer());
                    const pdfLibDoc = await PDFDocument.load(bytes);
                    const pdfDoc = await getDocument({ data: bytes }).promise;
                    const html = await AdvancedExports.exportToHTML(pdfDoc, pdfLibDoc);
                    setTextResult({ content: html, extension: 'html', mimeType: 'text/html' });
                    data = new Uint8Array();
                    break;
                }
                case 'export-csv': {
                    const bytes = new Uint8Array(await files[0].arrayBuffer());
                    const pdfDoc = await getDocument({ data: bytes }).promise;
                    const csv = await AdvancedExports.exportAllTablesToCSV(pdfDoc);
                    setTextResult({ content: csv, extension: 'csv', mimeType: 'text/csv' });
                    data = new Uint8Array();
                    break;
                }
                case 'export-pdf': {
                    // Export PDF is just saving the current document
                    data = await files[0].arrayBuffer().then(buf => new Uint8Array(buf));
                    break;
                }

                // === CONVERSION TOOLS ===
                // Convert TO PDF
                case 'image-to-pdf': {
                    data = await ConversionTools.imageToPDF(files);
                    break;
                }
                case 'html-to-pdf': {
                    // Read HTML file content
                    const htmlText = await files[0].text();
                    data = await ConversionTools.htmlToPDF(htmlText, files[0].name.replace('.html', ''));
                    break;
                }
                case 'word-to-pdf':
                case 'excel-to-pdf':
                case 'ppt-to-pdf': {
                    // Server-side conversion for high fidelity
                    const formData = new FormData();
                    formData.append('file', files[0]);

                    const response = await fetch(CONVERT_TO_PDF, {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) {
                        const err = await response.json().catch(() => ({}));
                        throw new Error(err.error || `Conversion failed: ${response.statusText}. Ensure server is running.`);
                    }

                    const blob = await response.blob();
                    data = new Uint8Array(await blob.arrayBuffer());
                    break;
                }

                // Convert FROM PDF
                case 'pdf-to-image': {
                    const pdfBytes = new Uint8Array(await files[0].arrayBuffer());
                    const images = await ConversionTools.pdfToImages(pdfBytes, 'png', 2.0);
                    setImageResults(images);
                    data = new Uint8Array(); // Marker
                    break;
                }
                case 'pdf-to-text': {
                    const pdfBytes = new Uint8Array(await files[0].arrayBuffer());
                    const text = await ConversionTools.pdfToText(pdfBytes);
                    setTextResult({ content: text, extension: 'txt', mimeType: 'text/plain' });
                    data = new Uint8Array();
                    break;
                }
                case 'pdf-to-word': {
                    // Server-side DOCX conversion
                    const formData = new FormData();
                    formData.append('file', files[0]);
                    formData.append('format', 'docx');

                    const response = await fetch(CONVERT_FROM_PDF, {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) throw new Error('Conversion failed. Ensure server is running.');

                    const blob = await response.blob();
                    data = new Uint8Array(await blob.arrayBuffer());
                    break;
                }
                case 'pdf-to-excel': {
                    // Server-side XLSX conversion
                    const formData = new FormData();
                    formData.append('file', files[0]);
                    formData.append('format', 'xlsx');

                    const response = await fetch(CONVERT_FROM_PDF, {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) throw new Error('Conversion failed. Ensure server is running.');

                    const blob = await response.blob();
                    data = new Uint8Array(await blob.arrayBuffer());
                    break;
                }
                case 'pdf-to-ppt': {
                    // Server-side PPTX conversion
                    const formData = new FormData();
                    formData.append('file', files[0]);
                    formData.append('format', 'pptx');

                    const response = await fetch(CONVERT_FROM_PDF, {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) throw new Error('Conversion failed. Ensure server is running.');

                    const blob = await response.blob();
                    data = new Uint8Array(await blob.arrayBuffer());
                    break;
                }
                case 'grayscale': {
                    const pdfBytes = new Uint8Array(await files[0].arrayBuffer());
                    data = await ConversionTools.pdfToGrayscale(pdfBytes);
                    break;
                }

                default:
                    // Fallback or placeholder for other tools
                    data = await files[0].arrayBuffer().then(buf => new Uint8Array(buf));
            }

            setResult(data);
            setStatus('completed');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred during processing');
            setStatus('error');
        }
    };

    const handleDownload = () => {
        // Handle text results (JSON, XML, CSV, RTF, etc.)
        if (textResult) {
            const blob = new Blob([textResult.content], { type: textResult.mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${tool.shortName.toLowerCase().replace(/\s+/g, '_')}_result.${textResult.extension}`;
            a.click();
            URL.revokeObjectURL(url);
            return;
        }

        // Handle image results (PDF to Image, PDF to PPT)
        if (imageResults && imageResults.length > 0) {
            imageResults.forEach((blob, i) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `page_${i + 1}.png`;
                a.click();
                URL.revokeObjectURL(url);
            });
            return;
        }

        if (!result) return;

        let extension = 'pdf';
        const extensionMap: Record<string, string> = {
            'export-epub': 'epub',
            'pdf-to-word': 'docx',
            'pdf-to-excel': 'xlsx',
            'pdf-to-ppt': 'pptx'
        };
        if (extensionMap[tool.id]) extension = extensionMap[tool.id];

        if (Array.isArray(result)) {
            result.forEach((data, i) => {
                ToolLogic.downloadUint8Array(data, `${tool.id}_part_${i + 1}.${extension}`);
            });
        } else {
            ToolLogic.downloadUint8Array(result, `${tool.id}_result.${extension}`);
        }
    };

    const reset = () => {
        setFiles([]);
        setStatus('idle');
        setResult(null);
        setError(null);
    };

    const openInWorkplace = async () => {
        let fileToOpen: File | null = null;

        if (textResult) {
            const blob = new Blob([textResult.content], { type: textResult.mimeType });
            fileToOpen = new File([blob], `result.${textResult.extension}`, { type: textResult.mimeType });
        } else if (imageResults && imageResults.length > 0) {
            fileToOpen = new File([imageResults[0]], 'page_1.png', { type: 'image/png' });
        } else if (result) {
            let extension = 'pdf';
            const extensionMap: Record<string, string> = {
                'export-epub': 'epub',
                'pdf-to-word': 'docx',
                'pdf-to-excel': 'xlsx',
                'pdf-to-ppt': 'pptx'
            };
            if (extensionMap[tool.id]) extension = extensionMap[tool.id];

            if (Array.isArray(result)) {
                fileToOpen = new File([result[0] as any], `result.${extension}`, { type: 'application/octet-stream' });
            } else {
                fileToOpen = new File([result as any], `result.${extension}`, { type: 'application/octet-stream' });
            }
        }

        if (fileToOpen) {
            navigate('/workplace', { state: { incomingFile: fileToOpen } });
        }
    };

    return (
        <>
            {/* Fullscreen Workspace when files are present or processing */}
            {((files.length > 0 && status !== 'completed') || status === 'processing') && (
                <div className="fixed inset-0 z-[100] bg-surface-950 flex flex-col animate-in fade-in duration-300">
                    {/* Header Bar */}
                    <div className={`shrink-0 bg-gradient-to-r ${tool.bgGradient} p-4 md:px-8 py-4 flex items-center justify-between shadow-2xl z-[110]`}>
                        <div className="flex items-center gap-4 md:gap-6">
                            <button
                                onClick={reset}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all group"
                            >
                                <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 truncate">
                                <tool.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <h2 className="text-lg md:text-xl font-black text-white leading-none uppercase tracking-tighter">{tool.name}</h2>
                                <p className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1 whitespace-nowrap">Local Document Processing</p>
                            </div>
                        </div>

                        {status !== 'processing' && (
                            <button
                                onClick={processTool}
                                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-surface-900 font-bold rounded-xl active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider touch-target"
                            >
                                <Zap className="w-4 h-4 fill-current" />
                                <span className="hidden sm:inline">Process Now</span>
                                <span className="sm:hidden">Process</span>
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto bg-surface-950 p-4 md:p-8 lg:p-12">
                        {status === 'processing' ? (
                            <div className="h-full flex flex-col items-center justify-center py-20">
                                <div className="w-24 h-24 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin mb-8 shadow-2xl shadow-primary-500/10" />
                                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Processing your PDF...</h3>
                                <p className="text-surface-400 font-medium">This usually takes just a few seconds.</p>
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8 items-start animate-in slide-in-from-bottom-4 duration-500">
                                {/* Left Column: Configuration */}
                                <div className="space-y-8 order-2 lg:order-1">
                                    <div className="bg-surface-900/50 border border-white/5 rounded-3xl p-6 md:p-8">
                                        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 text-sm">2</div>
                                            Configure Settings
                                        </h3>

                                        <div className="space-y-6">
                                            {tool.id === 'split' && (
                                                <div>
                                                    <label className="block text-xs font-black text-surface-500 uppercase tracking-[0.2em] mb-3">Page Ranges (e.g. 1-5, 8, 10-12)</label>
                                                    <input
                                                        type="text"
                                                        value={ranges}
                                                        onChange={(e) => setRanges(e.target.value)}
                                                        placeholder="Enter page ranges..."
                                                        className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-primary-500 outline-none transition-all placeholder:text-surface-700"
                                                    />
                                                </div>
                                            )}

                                            {(tool.id === 'protect' || tool.id === 'unlock') && (
                                                <div>
                                                    <label className="block text-xs font-black text-surface-500 uppercase tracking-[0.2em] mb-3">Password</label>
                                                    <div className="relative">
                                                        <input
                                                            type="password"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            placeholder="Enter password..."
                                                            className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-4 pl-12 text-white focus:border-primary-500 outline-none transition-all placeholder:text-surface-700"
                                                        />
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-600" />
                                                    </div>
                                                </div>
                                            )}

                                            {tool.id === 'rotate' && (
                                                <div>
                                                    <label className="block text-xs font-black text-surface-500 uppercase tracking-[0.2em] mb-3">Rotation Angle</label>
                                                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                                        {[90, 180, 270].map(angle => (
                                                            <button
                                                                key={angle}
                                                                onClick={() => setRotation(angle)}
                                                                className={`py-3 sm:py-4 rounded-xl border-2 font-black text-sm transition-all touch-target ${rotation === angle ? 'bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/20 scale-105' : 'bg-surface-950 border-white/5 text-surface-500 active:border-white/20'}`}
                                                            >
                                                                {angle}°
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {tool.id === 'delete-pages' && (
                                                <div>
                                                    <label className="block text-xs font-black text-surface-500 uppercase tracking-[0.2em] mb-3">Pages to Delete (comma separated)</label>
                                                    <input
                                                        type="text"
                                                        value={ranges}
                                                        onChange={(e) => setRanges(e.target.value)}
                                                        placeholder="e.g. 2, 4, 6"
                                                        className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-primary-500 outline-none transition-all placeholder:text-surface-700"
                                                    />
                                                </div>
                                            )}

                                            {tool.id === 'n-up' && (
                                                <div>
                                                    <label className="block text-xs font-black text-surface-500 uppercase tracking-[0.2em] mb-3">Pages Per Sheet</label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {[2, 4].map(n => (
                                                            <button
                                                                key={n}
                                                                onClick={() => setNUpOption(n)}
                                                                className={`py-4 rounded-xl border-2 font-black text-sm transition-all ${nUpOption === n ? 'bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/20 scale-105' : 'bg-surface-950 border-white/5 text-surface-500 hover:border-white/10'}`}
                                                            >
                                                                {n}-Up
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {tool.id === 'certify' && (
                                                <div>
                                                    <label className="block text-xs font-black text-surface-500 uppercase tracking-[0.2em] mb-3">Certification Authority / Name</label>
                                                    <input
                                                        type="text"
                                                        value={ranges}
                                                        onChange={(e) => setRanges(e.target.value)}
                                                        placeholder="Enter your name or organization..."
                                                        className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-primary-500 outline-none transition-all placeholder:text-surface-700"
                                                    />
                                                    <p className="mt-2 text-[10px] text-surface-500">Note: This adds a visual certification seal. For legally-binding PKI certificates, use a hardware-based CA.</p>
                                                </div>
                                            )}


                                            {tool.id === 'compress' && (
                                                <div>
                                                    <label className="block text-xs font-black text-surface-500 uppercase tracking-[0.2em] mb-3">Compression Quality</label>
                                                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                                        {(['low', 'medium', 'high'] as const).map(quality => (
                                                            <button
                                                                key={quality}
                                                                onClick={() => setCompressionQuality(quality)}
                                                                className={`py-3 sm:py-4 rounded-xl border-2 font-black text-sm transition-all touch-target ${compressionQuality === quality ? 'bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/20 scale-105' : 'bg-surface-950 border-white/5 text-surface-500 active:border-white/20'}`}
                                                            >
                                                                <span className="capitalize">{quality}</span>
                                                                <span className="block text-[9px] mt-1 opacity-60">
                                                                    {quality === 'low' ? 'Max compression' : quality === 'medium' ? 'Balanced' : 'Best quality'}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <p className="mt-3 text-[10px] text-surface-500">Lower quality = smaller file size. Images will be recompressed.</p>
                                                </div>
                                            )}

                                            {(tool.id === 'flatten' || tool.id === 'page-numbers' || tool.id === 'repair' || tool.id === 'optimize' || tool.id === 'linearize' || tool.id === 'print') && (
                                                <div className="bg-surface-800/50 p-4 rounded-xl border border-white/5">
                                                    <p className="text-sm text-surface-400 font-medium">
                                                        No configuration needed. Click <strong className="text-white">Process Now</strong> to start.
                                                    </p>
                                                </div>
                                            )}

                                            {tool.id === 'compare' && (
                                                <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                                                    <p className="text-sm text-blue-300 font-medium">
                                                        Select <strong className="text-white">2 PDF files</strong> to compare them visually.
                                                        Differences will be highlighted in red.
                                                    </p>
                                                </div>
                                            )}

                                            <p className="text-[10px] text-surface-500 font-bold uppercase tracking-widest text-center mt-4">
                                                All changes are applied instantly in your browser.
                                            </p>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 font-bold flex items-center gap-4 animate-shake">
                                            <X className="w-6 h-6 shrink-0 text-red-500" />
                                            <span>{error}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: File List */}
                                <div className="space-y-6 order-1 lg:order-2">
                                    <div className="bg-surface-900/50 border border-white/5 rounded-3xl p-6 md:p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 text-sm">1</div>
                                                Selected Files
                                            </h3>
                                            <span className="text-[10px] font-black text-surface-500 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">{files.length} Files</span>
                                        </div>

                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {files.map((file, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface-950 border border-white/5 group hover:border-white/10 transition-all">
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                                                            <FileText className="w-5 h-5 text-primary-400" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-white truncate">{file.name}</p>
                                                            <p className="text-[10px] text-surface-600 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFile(i)}
                                                        className="p-2 text-surface-600 hover:text-red-400 transition-colors"
                                                        aria-label="Remove file"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add specific Add More button for Image to PDF and Compare */}
                                        {(tool.id === 'merge' || tool.id === 'image-to-pdf' || (tool.id === 'compare' && files.length < 2)) && (
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full mt-4 py-4 rounded-xl border-2 border-dashed border-white/5 text-surface-500 hover:text-white hover:border-primary-500/30 transition-all text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                            >
                                                <Zap className="w-4 h-4" />
                                                {tool.id === 'compare' ? 'Add second PDF to compare' : `Add more ${tool.id === 'image-to-pdf' ? 'images' : 'files'}`}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Landing/Success/Idle State */}
            {((files.length === 0 && status === 'idle') || status === 'completed' || status === 'error') && (
                <div className="max-w-4xl mx-auto py-12 px-4 min-h-[500px] flex flex-col justify-center animate-in fade-in duration-700">
                    {status === 'completed' ? (
                        <div className="bg-surface-900 border border-white/5 rounded-3xl sm:rounded-[3rem] overflow-hidden shadow-2xl p-6 sm:p-8 md:p-12 max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
                            <div className="text-center mb-8 sm:mb-10">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl shadow-green-500/20">
                                    <Check className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
                                </div>
                                <h3 className="text-2xl sm:text-4xl font-black text-white mb-2 uppercase tracking-tighter">SUCCESS!</h3>
                                <p className="text-surface-400 font-medium text-base sm:text-lg">
                                    {tool.id === 'compare' ? `Found ${compareResult?.matchCount} identical pages out of ${compareResult?.pageCount}.` : 'Your PDF has been processed.'}
                                </p>
                            </div>

                            {tool.id === 'compare' && compareResult && (
                                <div className="mb-8 space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-surface-800 border border-white/5">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest mb-1">Identical Pages</p>
                                            <p className="text-2xl font-black text-green-400">{compareResult.matchCount} / {compareResult.pageCount}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest mb-1">Pages with Changes</p>
                                            <p className="text-2xl font-black text-red-400">{compareResult.pageCount - compareResult.matchCount}</p>
                                        </div>
                                    </div>

                                    {/* Page-by-page comparison */}
                                    {compareResult.page1Images?.map((_: string, idx: number) => (
                                        <div key={idx} className="bg-surface-800 rounded-2xl p-4 border border-white/5">
                                            <div className="flex justify-between items-center mb-4 px-1">
                                                <span className="text-sm font-black text-white uppercase">Page {idx + 1}</span>
                                                <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${compareResult.diffPercentages?.[idx] < 0.1
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {compareResult.diffPercentages?.[idx] < 0.1
                                                        ? 'Identical'
                                                        : `${compareResult.diffPercentages[idx]}% different`}
                                                </span>
                                            </div>

                                            {/* Side by side comparison */}
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black text-surface-500 uppercase text-center">Document 1</p>
                                                    <img src={compareResult.page1Images[idx]} alt={`PDF 1 - Page ${idx + 1}`} className="w-full rounded-lg border border-white/10 shadow-lg" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black text-surface-500 uppercase text-center">Document 2</p>
                                                    <img src={compareResult.page2Images[idx]} alt={`PDF 2 - Page ${idx + 1}`} className="w-full rounded-lg border border-white/10 shadow-lg" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black text-red-400 uppercase text-center">Differences</p>
                                                    <img src={compareResult.overlayImages[idx]} alt={`Diff - Page ${idx + 1}`} className="w-full rounded-lg border border-red-500/30 shadow-lg" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {(tool.id === 'compress' || tool.id === 'optimize') && compressionStats && (
                                <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest mb-1">Original</p>
                                            <p className="text-lg font-black text-white">{(compressionStats.original / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest mb-1">Compressed</p>
                                            <p className="text-lg font-black text-teal-400">{(compressionStats.compressed / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest mb-1">Reduced</p>
                                            <p className="text-lg font-black text-green-400">{compressionStats.ratio > 0 ? `${compressionStats.ratio}%` : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                <button
                                    onClick={openInWorkplace}
                                    className="flex flex-col items-center gap-2 sm:gap-3 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-xl active:scale-95 transition-all group touch-target"
                                >
                                    <Zap className="w-6 h-6 sm:w-8 sm:h-8" />
                                    <span className="font-black uppercase tracking-wider text-[10px] sm:text-xs text-center line-clamp-1">Edit in Workspace</span>
                                </button>
                                {tool.id !== 'compare' ? (
                                    <button
                                        onClick={handleDownload}
                                        className="flex flex-col items-center gap-2 sm:gap-3 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl active:scale-95 transition-all group touch-target"
                                    >
                                        <Download className="w-6 h-6 sm:w-8 sm:h-8" />
                                        <span className="font-black uppercase tracking-wider text-[10px] sm:text-xs">Download</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => window.print()}
                                        className="flex flex-col items-center gap-2 sm:gap-3 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl active:scale-95 transition-all group touch-target"
                                    >
                                        <PrinterIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                                        <span className="font-black uppercase tracking-wider text-[10px] sm:text-xs">Print Diff</span>
                                    </button>
                                )}
                                <button
                                    onClick={reset}
                                    className="flex flex-col items-center gap-2 sm:gap-3 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-white/5 border border-white/10 text-surface-400 active:bg-white/10 transition-all group touch-target"
                                >
                                    <RotateCw className="w-6 h-6 sm:w-8 sm:h-8" />
                                    <span className="font-black uppercase tracking-wider text-[10px] sm:text-xs">New Action</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center">
                            <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="mb-10 text-center">
                                    <div className={`w-28 h-28 rounded-[2.5rem] bg-gradient-to-br ${tool.bgGradient} flex items-center justify-center mx-auto mb-8 shadow-2xl group transition-transform hover:scale-105`}>
                                        <tool.icon className="w-14 h-14 text-white group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h3 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter leading-none">Ready to {tool.shortName}?</h3>
                                    <p className="text-surface-400 text-xl font-medium max-w-lg mx-auto leading-relaxed mt-4">
                                        The fastest way to {tool.shortName.toLowerCase()} your PDF files. Fast, private, and 100% free.
                                    </p>
                                </div>

                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    multiple={tool.id === 'merge' || tool.id === 'image-to-pdf' || tool.id === 'compare'}
                                    accept={tool.category === 'convert-to-pdf' ? ".doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.html,.htm,.pages,.numbers,.key,.jpg,.jpeg,.png,.webp" : (tool.id === 'image-to-pdf' ? "image/*" : ".pdf")}
                                    onChange={(e) => {
                                        const picked = Array.from(e.target.files || []);
                                        if (picked.length > 0) handleFilesSelect(picked);
                                    }}
                                />

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="group w-full max-w-sm sm:max-w-md py-5 sm:py-8 px-6 sm:px-10 rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-r from-primary-500 to-primary-600 text-white font-black text-lg sm:text-2xl uppercase tracking-tighter shadow-2xl shadow-primary-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 sm:gap-4 border border-white/20 mx-auto touch-target"
                                >
                                    <Zap className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
                                    <span className="hidden sm:inline">
                                        {tool.id === 'image-to-pdf' ? 'SELECT IMAGES' :
                                            (tool.id === 'compare' ? 'SELECT 2 DOCUMENTS' :
                                                (tool.category === 'convert-to-pdf' ? 'SELECT DOCUMENT' : `SELECT ${tool.shortName} PDF`))}
                                    </span>
                                    <span className="sm:hidden">Select File</span>
                                </button>

                                <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-8 text-surface-600">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-green-500/50" />
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Offline</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-blue-500/50" />
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Private</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-amber-500/50" />
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Instant</span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="mt-10 p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-100 font-bold flex items-center gap-4 animate-shake max-w-md mx-auto">
                                        <X className="w-6 h-6 text-red-500 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
