// Advanced Export Modal - JSON, XML, FDF, PDF/A, EPUB
import React, { useState } from 'react';
import {
    X, FileJson, Code, FileText, BookOpen, Shield,
    Download, Check, AlertTriangle, Loader2
} from 'lucide-react';
import {
    exportToJSON, exportToXML, exportToFDF,
    convertToPDFA, exportToEPUB, sanitizeMetadata
} from '../utils/advancedExports';

interface AdvancedExportModalProps {
    pdfLibDoc: any;
    pdfDoc: any;
    fileName: string;
    onClose: () => void;
    onSuccess?: (message: string) => void;
    onDownload?: (file: File | Blob, fileName: string) => void;
}

type ExportType = 'json' | 'xml' | 'fdf' | 'pdfa' | 'epub' | 'sanitize';

const EXPORT_OPTIONS: { id: ExportType; label: string; icon: React.ReactNode; description: string; color: string }[] = [
    {
        id: 'json',
        label: 'JSON Structure',
        icon: <FileJson className="w-6 h-6" />,
        description: 'Export document structure, metadata, and text content as JSON',
        color: 'from-amber-500 to-orange-600'
    },
    {
        id: 'xml',
        label: 'XML/XMP Metadata',
        icon: <Code className="w-6 h-6" />,
        description: 'Export XMP-compliant metadata in XML format',
        color: 'from-blue-500 to-indigo-600'
    },
    {
        id: 'fdf',
        label: 'FDF Form Data',
        icon: <FileText className="w-6 h-6" />,
        description: 'Export fillable form field data (Forms Data Format)',
        color: 'from-green-500 to-emerald-600'
    },
    {
        id: 'pdfa',
        label: 'PDF/A Archive',
        icon: <Shield className="w-6 h-6" />,
        description: 'Convert to PDF/A format for long-term archiving',
        color: 'from-purple-500 to-pink-600'
    },
    {
        id: 'epub',
        label: 'EPUB eBook',
        icon: <BookOpen className="w-6 h-6" />,
        description: 'Convert to EPUB format for e-readers',
        color: 'from-teal-500 to-cyan-600'
    },
    {
        id: 'sanitize',
        label: 'Sanitize Metadata',
        icon: <Shield className="w-6 h-6" />,
        description: 'Remove all metadata, hidden info, and embedded scripts',
        color: 'from-red-500 to-rose-600'
    },
];

export function AdvancedExportModal({ pdfLibDoc, pdfDoc, fileName, onClose, onDownload }: AdvancedExportModalProps) {
    const [selectedType, setSelectedType] = useState<ExportType | null>(null);
    const [exporting, setExporting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    // Close on Escape key
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !exporting) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, exporting]);

    const handleExport = async () => {
        if (!selectedType) return;

        setExporting(true);
        setResult(null);

        try {
            const baseName = fileName.replace('.pdf', '');

            switch (selectedType) {
                case 'json': {
                    const json = await exportToJSON(pdfLibDoc, pdfDoc);
                    downloadFile(new Blob([json], { type: 'application/json' }), `${baseName}_structure.json`);
                    setResult({ success: true, message: 'JSON exported successfully!' });
                    break;
                }

                case 'xml': {
                    const xml = exportToXML(pdfLibDoc);
                    downloadFile(new Blob([xml], { type: 'application/xml' }), `${baseName}_metadata.xml`);
                    setResult({ success: true, message: 'XML metadata exported successfully!' });
                    break;
                }

                case 'fdf': {
                    const fdf = exportToFDF(pdfLibDoc, fileName);
                    downloadFile(new Blob([fdf], { type: 'application/vnd.fdf' }), `${baseName}_formdata.fdf`);
                    setResult({ success: true, message: 'FDF form data exported successfully!' });
                    break;
                }

                case 'pdfa': {
                    const pdfaBytes = await convertToPDFA(pdfLibDoc);
                    downloadFile(new Blob([pdfaBytes as BlobPart], { type: 'application/pdf' }), `${baseName}_PDFA.pdf`);
                    setResult({ success: true, message: 'PDF/A version created successfully!' });
                    break;
                }

                case 'epub': {
                    const title = pdfLibDoc.getTitle() || baseName;
                    const author = pdfLibDoc.getAuthor() || 'Unknown';
                    const epubBlob = await exportToEPUB(pdfDoc, title, author);
                    downloadFile(epubBlob, `${baseName}.epub`);
                    setResult({ success: true, message: 'EPUB eBook created successfully!' });
                    break;
                }

                case 'sanitize': {
                    const { removed } = await sanitizeMetadata(pdfLibDoc);
                    const pdfBytes = await pdfLibDoc.save();
                    downloadFile(new Blob([pdfBytes], { type: 'application/pdf' }), `${baseName}_sanitized.pdf`);
                    setResult({
                        success: true,
                        message: `Sanitized! Removed: ${removed.length > 0 ? removed.join(', ') : 'nothing to remove'}`
                    });
                    break;
                }
            }
        } catch (e: any) {
            console.error('Export failed:', e);
            setResult({ success: false, message: e.message || 'Export failed' });
        }

        setExporting(false);
    };

    const downloadFile = (blob: Blob, filename: string) => {
        if (onDownload) {
            onDownload(blob, filename);
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={onClose}>
            <div
                className="modal !max-w-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                            <Download className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Advanced Export</h2>
                            <p className="text-surface-400 text-sm">Export to specialized formats</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-surface-400" />
                    </button>
                </div>

                {/* Export Options Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {EXPORT_OPTIONS.map(option => (
                        <button
                            key={option.id}
                            onClick={() => setSelectedType(option.id)}
                            className={`p-4 rounded-2xl text-left transition-all border ${selectedType === option.id
                                ? 'border-primary-500 bg-primary-500/10 ring-2 ring-primary-500/50'
                                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center text-white mb-3`}>
                                {option.icon}
                            </div>
                            <h3 className="text-sm font-bold text-white mb-1">{option.label}</h3>
                            <p className="text-xs text-surface-400 line-clamp-2">{option.description}</p>
                        </button>
                    ))}
                </div>

                {/* Result Message */}
                {result && (
                    <div className={`p-4 rounded-xl mb-4 flex items-start gap-3 ${result.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                        }`}>
                        {result.success ? (
                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                        ) : (
                            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        )}
                        <p className={`text-sm ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                            {result.message}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-surface-400 hover:text-white transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={!selectedType || exporting}
                        className="flex items-center gap-2 px-6 py-2 bg-primary-500 hover:bg-primary-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {exporting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Export
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdvancedExportModal;
