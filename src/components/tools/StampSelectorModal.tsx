// Stamp Selector Modal - Mobile Optimized
import { useState } from 'react';
import { X, Check } from 'lucide-react';

interface StampSelectorModalProps {
    onSelect: (stamp: string, color: string) => void;
    onClose: () => void;
}

const STAMPS = [
    { text: 'APPROVED', color: '#10b981' },
    { text: 'REJECTED', color: '#ef4444' },
    { text: 'CONFIDENTIAL', color: '#f59e0b' },
    { text: 'DRAFT', color: '#6b7280' },
    { text: 'FINAL', color: '#3b82f6' },
    { text: 'PAID', color: '#10b981' },
    { text: 'URGENT', color: '#ef4444' },
    { text: 'RECEIVED', color: '#8b5cf6' },
    { text: 'REVIEWED', color: '#06b6d4' },
    { text: 'VOID', color: '#dc2626' },
    { text: 'COPY', color: '#6366f1' },
    { text: 'ORIGINAL', color: '#059669' },
];

const COLORS = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Gray', value: '#6b7280' },
];

export function StampSelectorModal({ onSelect, onClose }: StampSelectorModalProps) {
    const [customText, setCustomText] = useState('');
    const [selectedColor, setSelectedColor] = useState('#ef4444');
    const [showCustom, setShowCustom] = useState(false);

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[200] p-0 sm:p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xl sm:w-full animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 shrink-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Select Stamp</h3>
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
                    {/* Preset Stamps */}
                    {!showCustom && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Stamps</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                {STAMPS.map((stamp) => (
                                    <button
                                        key={stamp.text}
                                        onClick={() => {
                                            onSelect(stamp.text, stamp.color);
                                            onClose();
                                        }}
                                        className="p-3 sm:p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 active:bg-blue-100 transition-all group touch-target"
                                    >
                                        <div className="text-center">
                                            <div
                                                className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 border-2 sm:border-3 rounded font-black text-[10px] sm:text-xs uppercase tracking-wider transform -rotate-3"
                                                style={{
                                                    borderColor: stamp.color,
                                                    color: stamp.color,
                                                    backgroundColor: `${stamp.color}15`,
                                                }}
                                            >
                                                {stamp.text}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Custom Stamp Section */}
                    <div className={`border-t pt-5 ${showCustom ? '' : ''}`}>
                        {!showCustom ? (
                            <button
                                onClick={() => setShowCustom(true)}
                                className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-semibold hover:border-blue-400 hover:bg-blue-50 active:bg-blue-100 transition-all touch-target"
                            >
                                + Create Custom Stamp
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-gray-700">Custom Stamp</h4>
                                    <button
                                        onClick={() => setShowCustom(false)}
                                        className="text-sm text-blue-500 font-medium hover:underline"
                                    >
                                        Back to presets
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value.toUpperCase())}
                                    placeholder="Enter stamp text..."
                                    className="w-full px-4 py-3.5 sm:py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold text-base"
                                    maxLength={20}
                                    autoFocus
                                />

                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Select Color:</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {COLORS.map((color) => (
                                            <button
                                                key={color.value}
                                                onClick={() => setSelectedColor(color.value)}
                                                className={`w-11 h-11 sm:w-10 sm:h-10 rounded-xl border-2 transition-all touch-target ${selectedColor === color.value
                                                    ? 'border-gray-900 scale-110 ring-2 ring-gray-900/20'
                                                    : 'border-gray-300 hover:scale-105 active:scale-95'
                                                    }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {customText && (
                                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                                        <p className="text-xs text-gray-500 mb-2">Preview:</p>
                                        <div
                                            className="inline-block px-5 py-2.5 border-3 rounded font-black text-base uppercase tracking-wider transform -rotate-3"
                                            style={{
                                                borderColor: selectedColor,
                                                color: selectedColor,
                                                backgroundColor: `${selectedColor}15`,
                                            }}
                                        >
                                            {customText}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Button (only for custom) */}
                {showCustom && (
                    <div className="p-4 sm:p-5 pt-0 shrink-0 pb-safe">
                        <button
                            onClick={() => {
                                if (customText.trim()) {
                                    onSelect(customText.trim(), selectedColor);
                                    onClose();
                                }
                            }}
                            disabled={!customText.trim()}
                            className="w-full px-4 py-3.5 sm:py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/25 disabled:shadow-none touch-target"
                        >
                            <Check className="w-5 h-5" />
                            Add Custom Stamp
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
