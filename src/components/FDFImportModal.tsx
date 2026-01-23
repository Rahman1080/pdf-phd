// FDF Import Modal
import { useState, useEffect } from 'react';
import { X, Upload, FileText, Check, AlertTriangle } from 'lucide-react';
import { parseFDF, importFDF } from '../utils/advancedExports';

interface FDFImportModalProps {
    pdfLibDoc: any;
    onImport: () => void;
    onClose: () => void;
}

export function FDFImportModal({ pdfLibDoc, onImport, onClose }: FDFImportModalProps) {
    const [fdfContent, setFdfContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [previewFields, setPreviewFields] = useState<{ name: string; value: string }[]>([]);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !importing) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, importing]);

    const handleFileSelect = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.fdf';
        input.onchange = async (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
                setFileName(file.name);
                const text = await file.text();
                setFdfContent(text);

                // Parse and preview fields
                const fields = parseFDF(text);
                setPreviewFields(Object.entries(fields).map(([name, value]) => ({ name, value })));
            }
        };
        input.click();
    };

    const handleImport = async () => {
        if (!fdfContent) return;

        setImporting(true);
        try {
            await importFDF(pdfLibDoc, fdfContent);
            setResult({ success: true, message: `Successfully imported ${previewFields.length} field(s)!` });
            onImport();
        } catch (e: any) {
            setResult({ success: false, message: e.message || 'Import failed' });
        }
        setImporting(false);
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={onClose}>
            <div
                className="modal !max-w-md overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Import FDF</h2>
                            <p className="text-surface-400 text-sm">Load form data from FDF file</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-surface-400" />
                    </button>
                </div>

                {/* File Selection */}
                {!fdfContent ? (
                    <div
                        onClick={handleFileSelect}
                        className="p-8 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-green-500/50 hover:bg-green-500/5 transition-all text-center"
                    >
                        <Upload className="w-12 h-12 text-surface-500 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-white">Select FDF File</p>
                        <p className="text-xs text-surface-500 mt-1">Click to browse</p>
                    </div>
                ) : (
                    <>
                        {/* Selected File */}
                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl mb-4 flex items-center gap-3">
                            <FileText className="w-8 h-8 text-green-400" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{fileName}</p>
                                <p className="text-xs text-green-400">{previewFields.length} field(s) found</p>
                            </div>
                            <button
                                onClick={handleFileSelect}
                                className="text-xs text-surface-400 hover:text-white"
                            >
                                Change
                            </button>
                        </div>

                        {/* Preview Fields */}
                        {previewFields.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Fields Preview</h3>
                                <div className="max-h-48 overflow-y-auto space-y-2">
                                    {previewFields.map((field, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                            <span className="text-xs text-surface-400 truncate max-w-[40%]">{field.name}</span>
                                            <span className="text-xs text-white truncate max-w-[50%]">{field.value || '(empty)'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Result */}
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
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!fdfContent || importing}
                        className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {importing ? 'Importing...' : 'Import Data'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FDFImportModal;
