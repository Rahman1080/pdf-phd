// Visual PDF Compare - Side-by-side PDF comparison with visual highlighting
import { useState, useEffect } from 'react';
import { X, Upload, FileText, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, Layers } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

interface VisualCompareProps {
    onClose: () => void;
    onDownload?: (file: File | Blob, fileName: string) => void;
}

interface CompareResult {
    page: number;
    differences: number;
    leftImage: string;
    rightImage: string;
    diffImage?: string;
}

export function VisualCompare({ onClose, onDownload }: VisualCompareProps) {
    const [leftFile, setLeftFile] = useState<File | null>(null);
    const [rightFile, setRightFile] = useState<File | null>(null);
    const [comparing, setComparing] = useState(false);
    const [progress, setProgress] = useState('');
    const [results, setResults] = useState<CompareResult[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [zoom, setZoom] = useState(0.5);
    const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay' | 'diff'>('side-by-side');
    const [overlayOpacity, setOverlayOpacity] = useState(0.5);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !comparing) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, comparing]);

    const handleFileSelect = (side: 'left' | 'right') => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
                if (side === 'left') setLeftFile(file);
                else setRightFile(file);
            }
        };
        input.click();
    };

    const renderPageToImage = async (pdfDoc: any, pageNum: number, scale: number = 2): Promise<string> => {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
        return canvas.toDataURL('image/png');
    };

    const compareImages = (img1: string, img2: string): Promise<{ diffImage: string; diffCount: number }> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;

            const image1 = new Image();
            const image2 = new Image();

            image1.onload = () => {
                canvas.width = image1.width;
                canvas.height = image1.height;

                // Draw first image
                ctx.drawImage(image1, 0, 0);
                const data1 = ctx.getImageData(0, 0, canvas.width, canvas.height);

                image2.onload = () => {
                    // Draw second image
                    ctx.drawImage(image2, 0, 0);
                    const data2 = ctx.getImageData(0, 0, canvas.width, canvas.height);

                    // Create diff
                    const diffData = ctx.createImageData(canvas.width, canvas.height);
                    let diffCount = 0;

                    for (let i = 0; i < data1.data.length; i += 4) {
                        const r1 = data1.data[i], g1 = data1.data[i + 1], b1 = data1.data[i + 2];
                        const r2 = data2.data[i], g2 = data2.data[i + 1], b2 = data2.data[i + 2];

                        const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);

                        if (diff > 30) { // Threshold for difference
                            // Highlight differences in red/magenta
                            diffData.data[i] = 255;
                            diffData.data[i + 1] = 0;
                            diffData.data[i + 2] = 128;
                            diffData.data[i + 3] = 200;
                            diffCount++;
                        } else {
                            // Keep original but slightly faded
                            diffData.data[i] = (r1 + r2) / 2;
                            diffData.data[i + 1] = (g1 + g2) / 2;
                            diffData.data[i + 2] = (b1 + b2) / 2;
                            diffData.data[i + 3] = 100;
                        }
                    }

                    ctx.putImageData(diffData, 0, 0);
                    resolve({ diffImage: canvas.toDataURL('image/png'), diffCount });
                };
                image2.src = img2;
            };
            image1.src = img1;
        });
    };

    const startComparison = async () => {
        if (!leftFile || !rightFile) return;

        setComparing(true);
        setResults([]);
        setProgress('Loading documents...');

        try {
            const [leftBuffer, rightBuffer] = await Promise.all([
                leftFile.arrayBuffer(),
                rightFile.arrayBuffer()
            ]);

            const [leftDoc, rightDoc] = await Promise.all([
                pdfjsLib.getDocument({ data: leftBuffer }).promise,
                pdfjsLib.getDocument({ data: rightBuffer }).promise
            ]);

            const maxPages = Math.max(leftDoc.numPages, rightDoc.numPages);
            const compareResults: CompareResult[] = [];

            for (let i = 1; i <= maxPages; i++) {
                setProgress(`Comparing page ${i} of ${maxPages}...`);

                const leftImage = i <= leftDoc.numPages
                    ? await renderPageToImage(leftDoc, i)
                    : '';
                const rightImage = i <= rightDoc.numPages
                    ? await renderPageToImage(rightDoc, i)
                    : '';

                let diffResult = { diffImage: '', diffCount: 0 };
                if (leftImage && rightImage) {
                    diffResult = await compareImages(leftImage, rightImage);
                }

                compareResults.push({
                    page: i,
                    differences: diffResult.diffCount,
                    leftImage,
                    rightImage,
                    diffImage: diffResult.diffImage,
                });
            }

            setResults(compareResults);
            setCurrentPage(1);
        } catch (e) {
            console.error('Comparison failed:', e);
            alert('Failed to compare documents');
        } finally {
            setComparing(false);
            setProgress('');
        }
    };

    const currentResult = results[currentPage - 1];
    const totalDifferences = results.reduce((sum, r) => sum + r.differences, 0);
    const pagesWithDifferences = results.filter(r => r.differences > 0).length;

    return (
        <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={onClose}>
            <div
                className="modal !max-w-[95vw] !max-h-[95vh] h-[90vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Layers className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Visual PDF Compare</h2>
                            <p className="text-surface-400 text-sm">Side-by-side comparison with difference highlighting</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-surface-400" />
                    </button>
                </div>

                {/* File Selection or Results */}
                {results.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="grid grid-cols-2 gap-8 max-w-2xl w-full">
                            {/* Left File */}
                            <div
                                onClick={() => handleFileSelect('left')}
                                className={`p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${leftFile ? 'border-green-500 bg-green-500/10' : 'border-white/10 hover:border-primary-500/50 hover:bg-white/5'
                                    }`}
                            >
                                <div className="text-center">
                                    {leftFile ? (
                                        <>
                                            <FileText className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                            <p className="text-sm font-semibold text-white truncate">{leftFile.name}</p>
                                            <p className="text-xs text-green-400 mt-1">Original Document</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-12 h-12 text-surface-500 mx-auto mb-3" />
                                            <p className="text-sm font-semibold text-white">Select Original PDF</p>
                                            <p className="text-xs text-surface-500 mt-1">Click to upload</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Right File */}
                            <div
                                onClick={() => handleFileSelect('right')}
                                className={`p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${rightFile ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-primary-500/50 hover:bg-white/5'
                                    }`}
                            >
                                <div className="text-center">
                                    {rightFile ? (
                                        <>
                                            <FileText className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                                            <p className="text-sm font-semibold text-white truncate">{rightFile.name}</p>
                                            <p className="text-xs text-blue-400 mt-1">Modified Document</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-12 h-12 text-surface-500 mx-auto mb-3" />
                                            <p className="text-sm font-semibold text-white">Select Modified PDF</p>
                                            <p className="text-xs text-surface-500 mt-1">Click to upload</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Stats Bar */}
                        <div className="flex items-center justify-between mb-4 p-3 bg-surface-800/50 rounded-xl shrink-0">
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-xs text-surface-500">Pages with Changes</p>
                                    <p className={`text-lg font-bold ${pagesWithDifferences > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                                        {pagesWithDifferences} of {results.length}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-surface-500">Total Differences</p>
                                    <p className={`text-lg font-bold ${totalDifferences > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                        {totalDifferences > 1000000 ? '1M+' : totalDifferences.toLocaleString()} pixels
                                    </p>
                                </div>
                            </div>

                            {/* View Mode */}
                            <div className="flex gap-2">
                                {(['side-by-side', 'overlay', 'diff'] as const).map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === mode ? 'bg-primary-500 text-white' : 'bg-white/5 text-surface-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {mode === 'side-by-side' ? 'Side by Side' : mode === 'overlay' ? 'Overlay' : 'Differences'}
                                    </button>
                                ))}
                            </div>

                            {/* Zoom */}
                            <div className="flex items-center gap-2">
                                <button onClick={() => setZoom(z => Math.max(0.25, z - 0.1))} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg">
                                    <ZoomOut className="w-4 h-4 text-surface-400" />
                                </button>
                                <span className="text-xs text-surface-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
                                <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg">
                                    <ZoomIn className="w-4 h-4 text-surface-400" />
                                </button>
                            </div>
                        </div>

                        {/* Comparison View */}
                        <div className="flex-1 overflow-auto bg-surface-800/30 rounded-xl p-4">
                            {viewMode === 'side-by-side' && currentResult && (
                                <div className="flex gap-4 justify-center">
                                    <div className="text-center">
                                        <p className="text-xs text-green-400 font-semibold mb-2">Original</p>
                                        {currentResult.leftImage && (
                                            <img
                                                src={currentResult.leftImage}
                                                alt="Original"
                                                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                                                className="shadow-xl rounded-lg border border-green-500/30"
                                            />
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-blue-400 font-semibold mb-2">Modified</p>
                                        {currentResult.rightImage && (
                                            <img
                                                src={currentResult.rightImage}
                                                alt="Modified"
                                                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                                                className="shadow-xl rounded-lg border border-blue-500/30"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {viewMode === 'overlay' && currentResult && (
                                <div className="relative mx-auto" style={{ width: 'fit-content' }}>
                                    {currentResult.leftImage && (
                                        <img
                                            src={currentResult.leftImage}
                                            alt="Original"
                                            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                                            className="shadow-xl rounded-lg"
                                        />
                                    )}
                                    {currentResult.rightImage && (
                                        <img
                                            src={currentResult.rightImage}
                                            alt="Modified"
                                            style={{
                                                transform: `scale(${zoom})`,
                                                transformOrigin: 'top center',
                                                opacity: overlayOpacity,
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                            }}
                                            className="shadow-xl rounded-lg mix-blend-difference"
                                        />
                                    )}
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={overlayOpacity}
                                        onChange={e => setOverlayOpacity(parseFloat(e.target.value))}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48"
                                    />
                                </div>
                            )}

                            {viewMode === 'diff' && currentResult && (
                                <div className="text-center">
                                    <p className="text-xs text-pink-400 font-semibold mb-2">
                                        Differences Highlighted ({currentResult.differences.toLocaleString()} pixels changed)
                                    </p>
                                    {currentResult.diffImage && (
                                        <img
                                            src={currentResult.diffImage}
                                            alt="Differences"
                                            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                                            className="shadow-xl rounded-lg mx-auto border border-pink-500/30"
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Page Navigation */}
                        <div className="flex items-center justify-center gap-4 mt-4 shrink-0">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30"
                            >
                                <ChevronLeft className="w-5 h-5 text-white" />
                            </button>
                            <span className="text-sm text-white">
                                Page {currentPage} of {results.length}
                                {currentResult && currentResult.differences > 0 && (
                                    <span className="ml-2 text-amber-400">({currentResult.differences.toLocaleString()} changes)</span>
                                )}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(results.length, p + 1))}
                                disabled={currentPage === results.length}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30"
                            >
                                <ChevronRight className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 mt-4 shrink-0">
                    {results.length === 0 ? (
                        <>
                            <button onClick={onClose} className="px-4 py-2 text-surface-400 hover:text-white transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={startComparison}
                                disabled={!leftFile || !rightFile || comparing}
                                className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                            >
                                {comparing ? progress : 'Compare Documents'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => { setResults([]); setLeftFile(null); setRightFile(null); }}
                                className="px-4 py-2 text-surface-400 hover:text-white transition-colors"
                            >
                                New Comparison
                            </button>
                            <button
                                onClick={() => {
                                    // Export comparison report
                                    const report = results.map(r =>
                                        `Page ${r.page}: ${r.differences > 0 ? `${r.differences.toLocaleString()} pixels changed` : 'No changes'}`
                                    ).join('\n');
                                    const blob = new Blob([`PDF Comparison Report\n\nOriginal: ${leftFile?.name}\nModified: ${rightFile?.name}\n\n${report}`], { type: 'text/plain' });
                                    const filename = 'comparison_report.txt';
                                    if (onDownload) onDownload(blob, filename);
                                    else {
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = filename;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }
                                }}
                                className="flex items-center gap-2 px-6 py-2 bg-primary-500 hover:bg-primary-400 text-white font-semibold rounded-xl transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export Report
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VisualCompare;
