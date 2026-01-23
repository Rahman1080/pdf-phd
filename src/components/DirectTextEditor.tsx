// Direct Text Editor - Edit existing PDF text in place
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Check, X, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface DirectTextEditorProps {
    text: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    textAlign: 'left' | 'center' | 'right';
    bold?: boolean;
    italic?: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    onSave: (updatedText: {
        content: string;
        fontSize: number;
        fontFamily: string;
        color: string;
        textAlign: 'left' | 'center' | 'right';
        bold: boolean;
        italic: boolean;
    }) => void;
    onCancel: () => void;
    onDelete?: () => void;
}

const COMMON_FONTS = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Verdana',
    'Tahoma',
    'Trebuchet MS',
    'Palatino',
    'Garamond',
    'Comic Sans MS',
    'Impact',
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72];

export function DirectTextEditor({
    text: initialText,
    fontSize: initialFontSize,
    fontFamily: initialFontFamily,
    color: initialColor,
    textAlign: initialTextAlign,
    bold: initialBold = false,
    italic: initialItalic = false,
    // x and y no longer used - modal is now centered/bottom-sheet
    // x,
    // y,
    // width and height used for positioning only
    // width,
    // height,
    onSave,
    onCancel,
    onDelete,
}: DirectTextEditorProps) {
    const [content, setContent] = useState(initialText);
    const [fontSize, setFontSize] = useState(initialFontSize);
    const [customFontSize, setCustomFontSize] = useState(initialFontSize.toString());
    const [fontFamily, setFontFamily] = useState(initialFontFamily);
    const [color, setColor] = useState(initialColor);
    const [textAlign, setTextAlign] = useState(initialTextAlign);
    const [bold, setBold] = useState(initialBold);
    const [italic, setItalic] = useState(initialItalic);
    const [showFontSizeInput, setShowFontSizeInput] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-focus on mount
    useEffect(() => {
        textareaRef.current?.focus();
        // Select all text for easy replacement
        textareaRef.current?.select();
    }, []);

    // Handle custom font size
    const handleCustomFontSize = useCallback(() => {
        const size = parseInt(customFontSize, 10);
        if (!isNaN(size) && size >= 6 && size <= 144) {
            setFontSize(size);
            setShowFontSizeInput(false);
        } else {
            alert('Please enter a font size between 6 and 144');
        }
    }, [customFontSize]);

    // Save changes
    const handleSave = useCallback(() => {
        if (!content.trim()) {
            alert('Text cannot be empty. Use Delete button to remove text.');
            return;
        }

        onSave({
            content,
            fontSize,
            fontFamily,
            color,
            textAlign,
            bold,
            italic,
        });
    }, [content, fontSize, fontFamily, color, textAlign, bold, italic, onSave]);

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            // Ctrl/Cmd + B = Bold
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                setBold(!bold);
            }
            // Ctrl/Cmd + I = Italic
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                setItalic(!italic);
            }
            // Escape = Cancel
            if (e.key === 'Escape') {
                onCancel();
            }
            // Ctrl/Cmd + Enter = Save
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                handleSave();
            }
        },
        [bold, italic, onCancel, handleSave]
    );

    return (
        <>
            {/* Overlay to capture clicks outside */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={onCancel}
            />

            {/* Editor Panel - Full width bottom sheet on mobile, positioned modal on desktop */}
            <div
                className="fixed z-[100] bg-surface-900 border border-white/10 shadow-2xl 
                           inset-x-0 bottom-0 rounded-t-2xl md:rounded-xl
                           md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                           w-full md:w-[580px] max-h-[85vh] md:max-h-[80vh]
                           animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <img src="/edit_icon.png" alt="Edit" className="w-5 h-5 rounded shadow-sm" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Edit Text</h3>
                            <p className="text-xs text-gray-400">Ctrl+Enter to save, Esc to cancel</p>
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
                    {/* Text Input */}
                    <div>
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-3 bg-surface-800 text-white rounded-lg border border-white/10 
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            style={{
                                fontSize: `${fontSize}px`,
                                fontFamily,
                                fontWeight: bold ? 'bold' : 'normal',
                                fontStyle: italic ? 'italic' : 'normal',
                                textAlign,
                                color,
                            }}
                        />
                    </div>

                    {/* Formatting Toolbar */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Font Family */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Font</label>
                            <select
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                                className="w-full px-3 py-2 bg-surface-800 text-white rounded-lg border border-white/10 
                                         focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                {COMMON_FONTS.map((font) => (
                                    <option key={font} value={font} style={{ fontFamily: font }}>
                                        {font}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Font Size */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Size</label>
                            {showFontSizeInput ? (
                                <div className="flex gap-1">
                                    <input
                                        type="number"
                                        value={customFontSize}
                                        onChange={(e) => setCustomFontSize(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleCustomFontSize();
                                            if (e.key === 'Escape') setShowFontSizeInput(false);
                                        }}
                                        className="flex-1 px-3 py-2 bg-surface-800 text-white rounded-lg border 
                                                 border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="6-144"
                                        min="6"
                                        max="144"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleCustomFontSize}
                                        className="px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <select
                                    value={fontSize}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === 'custom') {
                                            setShowFontSizeInput(true);
                                            setCustomFontSize(fontSize.toString());
                                        } else {
                                            setFontSize(Number(value));
                                        }
                                    }}
                                    className="w-full px-3 py-2 bg-surface-800 text-white rounded-lg border 
                                             border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    {FONT_SIZES.map((size) => (
                                        <option key={size} value={size}>
                                            {size}px
                                        </option>
                                    ))}
                                    <option value="custom">Custom...</option>
                                </select>
                            )}
                        </div>

                        {/* Color */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-12 h-9 rounded-lg cursor-pointer border border-white/10"
                                />
                                <input
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-surface-800 text-white rounded-lg border 
                                             border-white/10 focus:outline-none text-sm"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>

                        {/* Text Align */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Alignment</label>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setTextAlign('left')}
                                    className={`flex-1 p-2 rounded-lg transition-colors ${textAlign === 'left'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-surface-800 text-gray-400 hover:bg-surface-700'
                                        }`}
                                    title="Align Left"
                                >
                                    <AlignLeft className="w-4 h-4 mx-auto" />
                                </button>
                                <button
                                    onClick={() => setTextAlign('center')}
                                    className={`flex-1 p-2 rounded-lg transition-colors ${textAlign === 'center'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-surface-800 text-gray-400 hover:bg-surface-700'
                                        }`}
                                    title="Align Center"
                                >
                                    <AlignCenter className="w-4 h-4 mx-auto" />
                                </button>
                                <button
                                    onClick={() => setTextAlign('right')}
                                    className={`flex-1 p-2 rounded-lg transition-colors ${textAlign === 'right'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-surface-800 text-gray-400 hover:bg-surface-700'
                                        }`}
                                    title="Align Right"
                                >
                                    <AlignRight className="w-4 h-4 mx-auto" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Text Style Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setBold(!bold)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
                                     transition-colors ${bold
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-surface-800 text-gray-400 hover:bg-surface-700'
                                }`}
                            title="Bold (Ctrl+B)"
                        >
                            <Bold className="w-4 h-4" />
                            <span className="text-sm">Bold</span>
                        </button>
                        <button
                            onClick={() => setItalic(!italic)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
                                     transition-colors ${italic
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-surface-800 text-gray-400 hover:bg-surface-700'
                                }`}
                            title="Italic (Ctrl+I)"
                        >
                            <Italic className="w-4 h-4" />
                            <span className="text-sm">Italic</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 flex justify-between">
                    <div>
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg 
                                         hover:bg-red-500/30 transition-colors text-sm font-medium"
                            >
                                Delete Text
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
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DirectTextEditor;
