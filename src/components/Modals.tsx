// PDF Studio - Modal Components

import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Upload, PenTool, Type, Download, Trash2, Plus, FileText } from 'lucide-react';

// Base Modal wrapper
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    if (!isOpen) return null;

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal max-w-xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="btn-icon">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="mb-6">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

// Signature Modal
interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (signatureData: string, type: 'draw' | 'type' | 'upload') => void;
}

export function SignatureModal({ isOpen, onClose, onSave }: SignatureModalProps) {
    const [mode, setMode] = useState<'draw' | 'type' | 'upload'>('draw');
    const [typedText, setTypedText] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    }, [isOpen, mode]);

    const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ctx = canvasRef.current!.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
        }
    };

    const clearCanvas = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const handleSave = () => {
        if (mode === 'draw' && canvasRef.current) {
            onSave(canvasRef.current.toDataURL('image/png'), 'draw');
        } else if (mode === 'type' && typedText) {
            // Create canvas with text
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.font = 'italic 36px cursive';
                ctx.fillStyle = '#000000';
                ctx.textBaseline = 'middle';
                ctx.fillText(typedText, 20, 50);
            }
            onSave(canvas.toDataURL('image/png'), 'type');
        }
        onClose();
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    onSave(event.target.result as string, 'upload');
                    onClose();
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Signature"
            footer={
                <>
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Add Signature
                    </button>
                </>
            }
        >
            {/* Mode tabs */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setMode('draw')}
                    className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors
                     ${mode === 'draw' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-surface-800 text-surface-400'}`}
                >
                    <PenTool className="w-4 h-4" />
                    Draw
                </button>
                <button
                    onClick={() => setMode('type')}
                    className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors
                     ${mode === 'type' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-surface-800 text-surface-400'}`}
                >
                    <Type className="w-4 h-4" />
                    Type
                </button>
                <button
                    onClick={() => setMode('upload')}
                    className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors
                     ${mode === 'upload' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-surface-800 text-surface-400'}`}
                >
                    <Upload className="w-4 h-4" />
                    Upload
                </button>
            </div>

            {/* Content based on mode */}
            {mode === 'draw' && (
                <div>
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={150}
                        className="w-full bg-white rounded-xl border border-surface-600 cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={handleDraw}
                        onMouseUp={() => setIsDrawing(false)}
                        onMouseLeave={() => setIsDrawing(false)}
                    />
                    <button onClick={clearCanvas} className="mt-2 text-sm text-surface-400 hover:text-white">
                        Clear
                    </button>
                </div>
            )}

            {mode === 'type' && (
                <input
                    type="text"
                    value={typedText}
                    onChange={(e) => setTypedText(e.target.value)}
                    placeholder="Type your signature..."
                    className="input text-2xl italic"
                    style={{ fontFamily: 'cursive' }}
                />
            )}

            {mode === 'upload' && (
                <label className="drop-zone cursor-pointer !p-8">
                    <Upload className="w-10 h-10 text-primary-400 mb-2" />
                    <p className="text-surface-400">Click to upload signature image</p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                    />
                </label>
            )}
        </Modal>
    );
}

// Export Modal
interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (format: 'pdf' | 'png' | 'jpg', options: any) => void;
}

export function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
    const [format, setFormat] = useState<'pdf' | 'png' | 'jpg'>('pdf');
    const [quality, setQuality] = useState(90);
    const [compress, setCompress] = useState(true);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Export PDF"
            footer={
                <>
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button
                        onClick={() => onExport(format, { quality, compress })}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </>
            }
        >
            <div className="space-y-6">
                {/* Format selection */}
                <div>
                    <label className="input-label">Export Format</label>
                    <div className="grid grid-cols-3 gap-3">
                        {(['pdf', 'png', 'jpg'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFormat(f)}
                                className={`py-3 px-4 rounded-xl border transition-all uppercase font-semibold
                           ${format === f
                                        ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                        : 'bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-600'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quality slider (for images) */}
                {format !== 'pdf' && (
                    <div>
                        <label className="input-label">Quality</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={quality}
                                onChange={(e) => setQuality(parseInt(e.target.value))}
                                className="slider flex-1"
                            />
                            <span className="text-sm text-surface-400 w-12 text-right">{quality}%</span>
                        </div>
                    </div>
                )}

                {/* Compress option (for PDF) */}
                {format === 'pdf' && (
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={compress}
                            onChange={(e) => setCompress(e.target.checked)}
                            className="checkbox"
                        />
                        <span className="text-surface-300">Compress PDF (reduce file size)</span>
                    </label>
                )}
            </div>
        </Modal>
    );
}

// Merge Modal
interface MergeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMerge: (files: File[]) => void;
}

export function MergeModal({ isOpen, onClose, onMerge }: MergeModalProps) {
    const [files, setFiles] = useState<File[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const addFiles = (newFiles: FileList | null) => {
        if (!newFiles) return;
        const pdfFiles = Array.from(newFiles).filter(f => f.type === 'application/pdf');
        setFiles(prev => [...prev, ...pdfFiles]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleMerge = () => {
        if (files.length >= 2) {
            onMerge(files);
            setFiles([]);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Merge PDFs"
            footer={
                <>
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button
                        onClick={handleMerge}
                        disabled={files.length < 2}
                        className={`btn-primary flex items-center gap-2 ${files.length < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Check className="w-4 h-4" />
                        Merge {files.length} PDFs
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <p className="text-surface-400 text-sm">
                    Add multiple PDF files and merge them into a single document.
                </p>

                {/* File list */}
                {files.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 border border-surface-700"
                            >
                                <FileText className="w-5 h-5 text-primary-400" />
                                <span className="flex-1 text-sm text-white truncate">{file.name}</span>
                                <span className="text-xs text-surface-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="p-1 text-surface-400 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add files button */}
                <button
                    onClick={() => inputRef.current?.click()}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-surface-600 
                     text-surface-400 hover:border-primary-500 hover:text-primary-400
                     flex items-center justify-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add PDF Files
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => addFiles(e.target.files)}
                    className="hidden"
                />
            </div>
        </Modal>
    );
}

// Watermark Modal
interface WatermarkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (config: {
        type: 'text' | 'image';
        content: string;
        opacity: number;
        tiled: boolean;
        fontSize?: number;
        color?: string;
    }) => void;
}

export function WatermarkModal({ isOpen, onClose, onApply }: WatermarkModalProps) {
    const [type, setType] = useState<'text' | 'image'>('text');
    const [text, setText] = useState('CONFIDENTIAL');
    const [opacity, setOpacity] = useState(0.3);
    const [tiled, setTiled] = useState(true);
    const [fontSize, setFontSize] = useState(48);
    const [color, setColor] = useState('#808080');

    const handleApply = () => {
        onApply({
            type,
            content: text,
            opacity,
            tiled,
            fontSize,
            color,
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Watermark"
            footer={
                <>
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={handleApply} className="btn-primary flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Apply Watermark
                    </button>
                </>
            }
        >
            <div className="space-y-6">
                {/* Type selection */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setType('text')}
                        className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2
                       ${type === 'text' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-surface-800 text-surface-400'}`}
                    >
                        <Type className="w-4 h-4" />
                        Text
                    </button>
                    <button
                        onClick={() => setType('image')}
                        className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2
                       ${type === 'image' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-surface-800 text-surface-400'}`}
                    >
                        <Upload className="w-4 h-4" />
                        Image
                    </button>
                </div>

                {/* Text input */}
                {type === 'text' && (
                    <>
                        <div>
                            <label className="input-label">Watermark Text</label>
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="input"
                                placeholder="Enter watermark text..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">Font Size</label>
                                <input
                                    type="number"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(parseInt(e.target.value) || 48)}
                                    className="input"
                                    min="12"
                                    max="200"
                                />
                            </div>
                            <div>
                                <label className="input-label">Color</label>
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-full h-10 rounded-xl cursor-pointer"
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Opacity */}
                <div>
                    <label className="input-label">Opacity</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="0.05"
                            max="1"
                            step="0.05"
                            value={opacity}
                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                            className="slider flex-1"
                        />
                        <span className="text-sm text-surface-400 w-12 text-right">
                            {Math.round(opacity * 100)}%
                        </span>
                    </div>
                </div>

                {/* Tiled option */}
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={tiled}
                        onChange={(e) => setTiled(e.target.checked)}
                        className="checkbox"
                    />
                    <span className="text-surface-300">Repeat watermark (tiled pattern)</span>
                </label>
            </div>
        </Modal>
    );
}

export default Modal;
