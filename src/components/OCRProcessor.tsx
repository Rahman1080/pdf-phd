// OCR Processor Component - Convert scanned PDFs to editable text using Tesseract.js
import { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';
import { FileSearch, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface OCRProcessorProps {
    onClose: () => void;
    onComplete: (extractedText: { pageIndex: number; text: string }[]) => void;
    pageImages: { pageIndex: number; imageData: string }[];
}

interface OCRProgress {
    pageIndex: number;
    status: 'pending' | 'processing' | 'complete' | 'error';
    progress: number;
    text?: string;
    error?: string;
}

const SUPPORTED_LANGUAGES = [
    { code: 'eng', name: 'English' },
    { code: 'spa', name: 'Spanish' },
    { code: 'fra', name: 'French' },
    { code: 'deu', name: 'German' },
    { code: 'ita', name: 'Italian' },
    { code: 'por', name: 'Portuguese' },
    { code: 'rus', name: 'Russian' },
    { code: 'jpn', name: 'Japanese' },
    { code: 'chi_sim', name: 'Chinese (Simplified)' },
    { code: 'chi_tra', name: 'Chinese (Traditional)' },
    { code: 'kor', name: 'Korean' },
    { code: 'ara', name: 'Arabic' },
    { code: 'hin', name: 'Hindi' },
];

export function OCRProcessor({ onClose, onComplete, pageImages }: OCRProcessorProps) {
    const [selectedLanguage, setSelectedLanguage] = useState('eng');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<OCRProgress[]>([]);
    const [overallProgress, setOverallProgress] = useState(0);

    const processOCR = useCallback(async () => {
        setIsProcessing(true);

        // Initialize progress for all pages
        const initialProgress: OCRProgress[] = pageImages.map((page) => ({
            pageIndex: page.pageIndex,
            status: 'pending',
            progress: 0,
        }));
        setProgress(initialProgress);

        const worker = await createWorker(selectedLanguage);
        const results: { pageIndex: number; text: string }[] = [];

        try {
            for (let i = 0; i < pageImages.length; i++) {
                const page = pageImages[i];

                // Update status to processing
                setProgress((prev) =>
                    prev.map((p) =>
                        p.pageIndex === page.pageIndex
                            ? { ...p, status: 'processing' as const }
                            : p
                    )
                );

                try {
                    // Update progress to processing
                    setProgress((prev) =>
                        prev.map((p) =>
                            p.pageIndex === page.pageIndex
                                ? { ...p, progress: 50 }
                                : p
                        )
                    );

                    const { data } = await worker.recognize(page.imageData);


                    results.push({
                        pageIndex: page.pageIndex,
                        text: data.text,
                    });

                    // Mark as complete
                    setProgress((prev) =>
                        prev.map((p) =>
                            p.pageIndex === page.pageIndex
                                ? { ...p, status: 'complete' as const, progress: 100, text: data.text }
                                : p
                        )
                    );
                } catch (error) {
                    // Mark as error
                    setProgress((prev) =>
                        prev.map((p) =>
                            p.pageIndex === page.pageIndex
                                ? {
                                    ...p,
                                    status: 'error' as const,
                                    error: error instanceof Error ? error.message : 'OCR failed',
                                }
                                : p
                        )
                    );
                }

                // Update overall progress
                setOverallProgress(Math.round(((i + 1) / pageImages.length) * 100));
            }

            await worker.terminate();
            onComplete(results);
        } catch (error) {
            console.error('OCR processing failed:', error);
            alert('OCR processing failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    }, [pageImages, selectedLanguage, onComplete]);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface-900 rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <FileSearch className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">OCR - Extract Text from Scanned PDF</h2>
                            <p className="text-sm text-gray-400">Convert images to editable, searchable text</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {!isProcessing && (
                        <>
                            {/* Language Selection */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                                    <FileSearch className="w-4 h-4" />
                                    Select Language
                                </label>
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className="w-full px-4 py-3 bg-surface-800 text-white rounded-lg border border-white/10 
                                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {SUPPORTED_LANGUAGES.map((lang) => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Info */}
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <FileSearch className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="text-white font-medium mb-1">How OCR Works:</p>
                                        <ul className="text-gray-300 space-y-1 list-disc list-inside">
                                            <li>Scans each page of your PDF for text</li>
                                            <li>Recognizes characters using AI (Tesseract.js)</li>
                                            <li>Converts images to editable, searchable text</li>
                                            <li>Processing {pageImages.length} page{pageImages.length !== 1 ? 's' : ''}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Processing Progress */}
                    {isProcessing && (
                        <div className="space-y-4">
                            {/* Overall Progress */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-white">Overall Progress</span>
                                    <span className="text-sm text-gray-400">{overallProgress}%</span>
                                </div>
                                <div className="w-full h-2 bg-surface-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                                        style={{ width: `${overallProgress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Per-Page Progress */}
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {progress.map((page) => (
                                    <div
                                        key={page.pageIndex}
                                        className="flex items-center gap-3 p-3 bg-surface-800 rounded-lg"
                                    >
                                        {/* Status Icon */}
                                        <div className="flex-shrink-0">
                                            {page.status === 'pending' && (
                                                <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                                            )}
                                            {page.status === 'processing' && (
                                                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                            )}
                                            {page.status === 'complete' && (
                                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                            )}
                                            {page.status === 'error' && (
                                                <AlertCircle className="w-5 h-5 text-red-400" />
                                            )}
                                        </div>

                                        {/* Page Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-white">
                                                    Page {page.pageIndex + 1}
                                                </span>
                                                {page.status === 'processing' && (
                                                    <span className="text-xs text-gray-400">{page.progress}%</span>
                                                )}
                                            </div>
                                            {page.status === 'processing' && (
                                                <div className="w-full h-1 bg-surface-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 transition-all duration-300"
                                                        style={{ width: `${page.progress}%` }}
                                                    />
                                                </div>
                                            )}
                                            {page.status === 'error' && (
                                                <span className="text-xs text-red-400">{page.error}</span>
                                            )}
                                            {page.status === 'complete' && (
                                                <span className="text-xs text-green-400">Text extracted successfully</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="px-6 py-2.5 bg-surface-800 text-white rounded-lg hover:bg-surface-700 
                                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : 'Cancel'}
                    </button>
                    {!isProcessing && (
                        <button
                            onClick={processOCR}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white 
                                     rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all 
                                     font-medium flex items-center gap-2"
                        >
                            <FileSearch className="w-4 h-4" />
                            Start OCR Processing
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default OCRProcessor;
