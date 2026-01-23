// Image Upload Modal - Mobile Optimized
import React, { useRef, useState } from 'react';
import { X, Image as ImageIcon, Camera, Loader2 } from 'lucide-react';

interface ImageUploadModalProps {
    onSave: (dataUrl: string) => void;
    onClose: () => void;
}

export function ImageUploadModal({ onSave, onClose }: ImageUploadModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    // Detect mobile device
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Image size must be less than 10MB');
            return;
        }

        setIsLoading(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            setPreview(dataUrl);
            setIsLoading(false);
        };
        reader.onerror = () => {
            alert('Failed to read file');
            setIsLoading(false);
        };
        reader.readAsDataURL(file);
    };

    const confirmImage = () => {
        if (preview) {
            onSave(preview);
            onClose();
        }
    };

    const resetSelection = () => {
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[200] p-0 sm:p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:w-full animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 shrink-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Upload Image</h3>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-colors touch-target"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Hidden file inputs */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                {/* Camera input for mobile */}
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Content Area */}
                <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                            <p className="text-gray-500 font-medium">Processing image...</p>
                        </div>
                    ) : preview ? (
                        <div className="space-y-4">
                            <div className="relative rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-auto max-h-[40vh] object-contain"
                                />
                            </div>
                            <p className="text-sm text-gray-500 text-center">
                                Tap confirm to add this image to your document
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Gallery Upload */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100 transition-all group"
                            >
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500" />
                                </div>
                                <p className="text-gray-700 font-semibold mb-1">Choose from Gallery</p>
                                <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </button>

                            {/* Camera Capture - Only show on mobile */}
                            {isMobile && (
                                <button
                                    onClick={() => cameraInputRef.current?.click()}
                                    className="w-full border-2 border-gray-200 rounded-xl p-5 flex items-center justify-center gap-3 cursor-pointer hover:border-green-500 hover:bg-green-50 active:bg-green-100 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Camera className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-gray-700 font-semibold">Take Photo</p>
                                        <p className="text-sm text-gray-500">Use your camera</p>
                                    </div>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="p-4 sm:p-5 pt-0 flex gap-3 shrink-0 pb-safe">
                    {preview ? (
                        <>
                            <button
                                onClick={resetSelection}
                                className="flex-1 px-4 py-3.5 sm:py-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors touch-target"
                            >
                                Choose Different
                            </button>
                            <button
                                onClick={confirmImage}
                                className="flex-1 px-4 py-3.5 sm:py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/25 touch-target"
                            >
                                Confirm
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3.5 sm:py-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors touch-target"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
