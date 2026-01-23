// PDF Studio - File Drop Zone Component

import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Sparkles } from 'lucide-react';

interface DropZoneProps {
    onFilesSelect: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in bytes
}

export function DropZone({
    onFilesSelect,
    accept = '.pdf,.docx,.pptx,.xlsx,.xls,.csv,.txt,.md,.jpg,.jpeg,.png,.webp',
    multiple = false,
    maxSize = 100 * 1024 * 1024 // 100MB default
}: DropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateAndSelectFiles = useCallback((files: File[]) => {
        const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.xlsx', '.pptx', '.txt', '.md', '.csv'];
        const validated: File[] = [];

        for (const file of files) {
            const isPdf = file.name.toLowerCase().endsWith('.pdf');
            const isSupported = allowedExts.some(ext => file.name.toLowerCase().endsWith(ext));

            if (!isPdf && !isSupported) {
                setError(`File "${file.name}" is not a supported format.`);
                continue;
            }

            if (file.size > maxSize) {
                setError(`File "${file.name}" exceeds the ${Math.round(maxSize / 1024 / 1024)}MB limit.`);
                continue;
            }
            validated.push(file);
        }

        if (validated.length > 0) {
            setError(null);
            onFilesSelect(validated);
        }
    }, [maxSize, onFilesSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            validateAndSelectFiles(multiple ? files : [files[0]]);
        }
    }, [multiple, validateAndSelectFiles]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            validateAndSelectFiles(multiple ? files : [files[0]]);
        }
    }, [multiple, validateAndSelectFiles]);

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div
            className={`relative group cursor-pointer transition-all duration-500 overflow-hidden 
                ${isDragging
                    ? 'bg-primary-500/10 border-primary-500 border-solid'
                    : 'bg-surface-900/50 hover:bg-surface-800/80 border-surface-700 hover:border-primary-500/50'
                } 
                border-2 border-dashed rounded-[2.5rem] p-8 md:p-12 
                flex flex-col items-center justify-center 
                min-h-[200px] md:min-h-[300px] 
                w-full max-w-4xl mx-auto shadow-2xl active:scale-[0.98]
                mobile-upload-btn-override`} // Custom class for mobile override if needed
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleInputChange}
                className="hidden"
            />

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

            {/* Icon Group */}
            <div className="relative mb-8">
                <div className={`w-28 h-28 rounded-3xl flex items-center justify-center transition-all duration-500 ${isDragging
                    ? 'bg-primary-500 text-white scale-110 rotate-3 shadow-[0_0_50px_rgba(139,92,246,0.4)]'
                    : 'bg-surface-800 text-primary-400 group-hover:scale-110 group-hover:rotate-[-2deg] border border-white/5 shadow-xl'
                    }`}>
                    {isDragging ? (
                        <Sparkles className="w-12 h-12" />
                    ) : (
                        <Upload className="w-12 h-12 transition-transform group-hover:translate-y-[-4px]" />
                    )}
                </div>

                {/* Status Indicator */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-accent-500 flex items-center justify-center text-white shadow-lg shadow-accent-500/30">
                    <FileText className="w-5 h-5" />
                </div>
            </div>

            {/* Text Content */}
            <div className="relative z-10 text-center space-y-3">
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                    {isDragging ? 'Now Release!' : <span className="md:hidden">Tap to Select File</span>}
                    <span className="hidden md:inline">{isDragging ? 'Now Release!' : 'Choose your PDF files'}</span>
                </h3>
                <p className="hidden md:block text-surface-400 text-lg font-medium">
                    Or drag and drop them here for <span className="text-primary-400 font-bold decoration-2 underline-offset-4 decoration-primary-500/30 underline">pro-grade processing</span>
                </p>
            </div>

            {/* Tool Footer */}
            <div className={`mt-10 flex items-center gap-6 px-8 py-3 rounded-2xl transition-all duration-300 ${isDragging ? 'opacity-0 translate-y-4' : 'opacity-100'}`}>
                <div className="flex items-center gap-2 text-surface-500">
                    <div className="w-2 h-2 rounded-full bg-primary-500/50" />
                    <span className="text-xs font-black uppercase tracking-widest leading-none">Safe & Secure</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-2 text-surface-500">
                    <span className="text-xs font-black uppercase tracking-widest leading-none">Max {Math.round(maxSize / 1024 / 1024)}MB</span>
                </div>
            </div>

            {error && (
                <div className="absolute top-6 right-6 px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest animate-in slide-in-from-right-8">
                    {error}
                </div>
            )}
        </div>
    );
}

export default DropZone;
