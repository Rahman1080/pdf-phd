// Image Replacement Component - Easy click-to-replace images
import React, { useState, useCallback, useRef } from 'react';
import { Image as ImageIcon, Upload, Trash2, Check, X, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';

interface ImageReplacementProps {
    currentImage: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    onReplace: (newImageData: string, transformations?: {
        rotation: number;
        flipH: boolean;
        flipV: boolean;
    }) => void;
    onCancel: () => void;
    onDelete?: () => void;
}

export function ImageReplacement({
    currentImage,
    x,
    y,
    width,
    height,
    rotation: initialRotation = 0,
    onReplace,
    onCancel,
    onDelete,
}: ImageReplacementProps) {
    const [newImage, setNewImage] = useState<string | null>(null);
    const [rotation, setRotation] = useState(initialRotation);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (PNG, JPG, GIF, etc.)');
            return;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Image is too large. Maximum size is 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setNewImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    // Handle drag and drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please drop an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('Image is too large. Maximum size is 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setNewImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    // Save changes
    const handleSave = useCallback(() => {
        const imageToSave = newImage || currentImage;
        onReplace(imageToSave, {
            rotation,
            flipH,
            flipV,
        });
    }, [newImage, currentImage, rotation, flipH, flipV, onReplace]);

    // Rotate image
    const handleRotate = useCallback(() => {
        setRotation((prev) => (prev + 90) % 360);
    }, []);

    const displayImage = newImage || currentImage;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={onCancel}
            />

            {/* Editor Panel */}
            <div
                className="fixed z-50 bg-surface-900 rounded-xl border border-white/10 shadow-2xl"
                style={{
                    left: Math.min(x, window.innerWidth - 600),
                    top: Math.max(y - 300, 20),
                    width: '580px',
                    maxHeight: '85vh',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <ImageIcon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Replace Image</h3>
                            <p className="text-xs text-gray-400">Upload a new image or transform current one</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-surface-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Image Preview */}
                    <div className="relative aspect-video bg-surface-800 rounded-lg overflow-hidden border border-white/10">
                        <img
                            src={displayImage}
                            alt="Preview"
                            className="absolute inset-0 w-full h-full object-contain"
                            style={{
                                transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                                transition: 'transform 0.3s ease',
                            }}
                        />
                        {newImage && (
                            <div className="absolute top-2 right-2">
                                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                                    New
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Upload Section */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${isDragging
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-white/20 hover:border-blue-500 hover:bg-blue-500/5'
                            }`}
                    >
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-white font-medium mb-1">
                            {newImage ? 'Upload Different Image' : 'Upload New Image'}
                        </p>
                        <p className="text-xs text-gray-400">
                            Click to browse or drag and drop
                            <br />
                            PNG, JPG, GIF up to 10MB
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* Transformation Controls */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-white">Transform Image</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={handleRotate}
                                className="flex flex-col items-center gap-2 p-3 bg-surface-800 rounded-lg 
                                         hover:bg-surface-700 transition-colors"
                            >
                                <RotateCw className="w-5 h-5 text-blue-400" />
                                <span className="text-xs text-gray-300">Rotate</span>
                                <span className="text-xs text-gray-500">{rotation}°</span>
                            </button>
                            <button
                                onClick={() => setFlipH(!flipH)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${flipH
                                        ? 'bg-blue-500/20 ring-2 ring-blue-500'
                                        : 'bg-surface-800 hover:bg-surface-700'
                                    }`}
                            >
                                <FlipHorizontal className={`w-5 h-5 ${flipH ? 'text-blue-400' : 'text-gray-400'}`} />
                                <span className="text-xs text-gray-300">Flip H</span>
                            </button>
                            <button
                                onClick={() => setFlipV(!flipV)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${flipV
                                        ? 'bg-blue-500/20 ring-2 ring-blue-500'
                                        : 'bg-surface-800 hover:bg-surface-700'
                                    }`}
                            >
                                <FlipVertical className={`w-5 h-5 ${flipV ? 'text-blue-400' : 'text-gray-400'}`} />
                                <span className="text-xs text-gray-300">Flip V</span>
                            </button>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-xs text-blue-200">
                            <strong>Tip:</strong> The image will be resized to fit the current space ({Math.round(width)} × {Math.round(height)}px)
                            while maintaining its aspect ratio.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 flex justify-between">
                    <div>
                        {onDelete && (
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this image?')) {
                                        onDelete();
                                    }
                                }}
                                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg 
                                         hover:bg-red-500/30 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Image
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-surface-800 text-white rounded-lg hover:bg-surface-700 
                                     transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white 
                                     rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all 
                                     font-medium text-sm flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            {newImage ? 'Replace Image' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ImageReplacement;
