// Shape Selector Modal - Mobile Optimized
import { useState } from 'react';
import { X, Square, Circle, Triangle, ArrowRight, Minus, Check } from 'lucide-react';

interface ShapeSelectorModalProps {
    onSelect: (shapeType: string, color: string) => void;
    onClose: () => void;
}

const SHAPES = [
    { id: 'rectangle', label: 'Rectangle', icon: Square },
    { id: 'circle', label: 'Circle', icon: Circle },
    { id: 'triangle', label: 'Triangle', icon: Triangle },
    { id: 'arrow', label: 'Arrow', icon: ArrowRight },
    { id: 'line', label: 'Line', icon: Minus },
];

const COLORS = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#fbbf24' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Gray', value: '#6b7280' },
];

export function ShapeSelectorModal({ onSelect, onClose }: ShapeSelectorModalProps) {
    const [selectedShape, setSelectedShape] = useState('rectangle');
    const [selectedColor, setSelectedColor] = useState('#3b82f6');

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[200] p-0 sm:p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg sm:w-full animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 shrink-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Select Shape</h3>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-colors touch-target"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
                    {/* Shape Selection */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Shape Type</h4>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                            {SHAPES.map((shape) => {
                                const Icon = shape.icon;
                                return (
                                    <button
                                        key={shape.id}
                                        onClick={() => setSelectedShape(shape.id)}
                                        className={`p-3 sm:p-4 border-2 rounded-xl transition-all active:scale-95 touch-target ${selectedShape === shape.id
                                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                                                : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                                            <Icon
                                                className={`w-6 h-6 sm:w-7 sm:h-7 ${selectedShape === shape.id ? 'text-blue-500' : 'text-gray-600'
                                                    }`}
                                            />
                                            <span
                                                className={`text-[10px] sm:text-xs font-medium ${selectedShape === shape.id ? 'text-blue-700' : 'text-gray-600'
                                                    }`}
                                            >
                                                {shape.label}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Color</h4>
                        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                            {COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => setSelectedColor(color.value)}
                                    className={`h-12 sm:h-11 rounded-xl border-2 transition-all active:scale-95 touch-target ${selectedColor === color.value
                                            ? 'border-gray-900 scale-105 ring-2 ring-gray-900/20'
                                            : 'border-gray-300 hover:scale-102'
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="p-5 sm:p-6 bg-gray-50 rounded-xl border-2 border-gray-100 flex items-center justify-center min-h-[100px] sm:min-h-[120px]">
                        <div className="text-center">
                            <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-medium">Preview</p>
                            <div className="flex items-center justify-center">
                                {selectedShape === 'rectangle' && (
                                    <div
                                        className="w-20 h-14 sm:w-24 sm:h-16 border-3 rounded"
                                        style={{ borderColor: selectedColor, backgroundColor: `${selectedColor}20` }}
                                    />
                                )}
                                {selectedShape === 'circle' && (
                                    <div
                                        className="w-16 h-16 sm:w-20 sm:h-20 border-3 rounded-full"
                                        style={{ borderColor: selectedColor, backgroundColor: `${selectedColor}20` }}
                                    />
                                )}
                                {selectedShape === 'triangle' && (
                                    <div
                                        className="w-0 h-0"
                                        style={{
                                            borderLeft: '35px solid transparent',
                                            borderRight: '35px solid transparent',
                                            borderBottom: `60px solid ${selectedColor}`,
                                            opacity: 0.6
                                        }}
                                    />
                                )}
                                {selectedShape === 'arrow' && (
                                    <div className="flex items-center justify-center">
                                        <div
                                            className="h-1.5 w-14 sm:w-16"
                                            style={{ backgroundColor: selectedColor }}
                                        />
                                        <div
                                            className="w-0 h-0"
                                            style={{
                                                borderTop: '10px solid transparent',
                                                borderBottom: '10px solid transparent',
                                                borderLeft: `14px solid ${selectedColor}`
                                            }}
                                        />
                                    </div>
                                )}
                                {selectedShape === 'line' && (
                                    <div
                                        className="h-1.5 w-20 sm:w-24 rounded-full"
                                        style={{ backgroundColor: selectedColor }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="p-4 sm:p-5 pt-0 shrink-0 pb-safe">
                    <button
                        onClick={() => {
                            onSelect(selectedShape, selectedColor);
                            onClose();
                        }}
                        className="w-full px-4 py-3.5 sm:py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/25 touch-target"
                    >
                        <Check className="w-5 h-5" />
                        Add Shape
                    </button>
                </div>
            </div>
        </div>
    );
}
