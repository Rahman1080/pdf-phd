// PDF Text Overlay - Editable text layer on top of PDF (like Google Docs)
// This is the BETTER approach for text editing - real-time, intuitive, and easy to use!

import { useState, useRef, useEffect } from 'react';
import { Type, Save, X, Edit3 } from 'lucide-react';

export interface OverlayText {
    id: string;
    content: string;
    x: number;              // Position from left (in PDF coordinates)
    y: number;              // Position from top (in canvas coordinates)
    fontSize: number;       // Font size in pixels
    fontFamily: string;     // Font family name
    color: string;          // Hex color
    bold: boolean;          // Bold style
    italic: boolean;        // Italic style
    textAlign: 'left' | 'center' | 'right';
    pageIndex: number;      // Which page this text belongs to
}

interface PDFTextOverlayProps {
    pageIndex: number;
    zoom: number;
    overlayTexts: OverlayText[];
    onTextChange: (id: string, newContent: string) => void;
    onTextUpdate: (id: string, updates: Partial<OverlayText>) => void;
    onTextDelete: (id: string) => void;
    onTextAdd: (text: OverlayText) => void;
    editable?: boolean;
}

export function PDFTextOverlay({
    pageIndex,
    zoom,
    overlayTexts,
    onTextChange,
    onTextUpdate,
    onTextDelete,
    onTextAdd: _onTextAdd,
    editable = true,
}: PDFTextOverlayProps) {
    const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef<{ x: number; y: number } | null>(null);

    // Filter texts for current page
    const pageTexts = overlayTexts.filter(t => t.pageIndex === pageIndex);

    const handleTextClick = (e: React.MouseEvent, textId: string) => {
        if (!editable) return;
        e.stopPropagation();
        setSelectedTextId(textId);
    };

    const handleTextBlur = (textId: string, newContent: string) => {
        if (newContent.trim() === '') {
            // Delete if empty
            const confirm = window.confirm('Delete empty text?');
            if (confirm) {
                onTextDelete(textId);
            }
        } else {
            onTextChange(textId, newContent);
        }
        setSelectedTextId(null);
    };

    const handleDragStart = (e: React.MouseEvent, textId: string) => {
        if (!editable) return;
        setIsDragging(true);
        setSelectedTextId(textId);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleDragMove = (e: React.MouseEvent, text: OverlayText) => {
        if (!isDragging || !dragStartPos.current) return;

        const deltaX = (e.clientX - dragStartPos.current.x) / zoom;
        const deltaY = (e.clientY - dragStartPos.current.y) / zoom;

        onTextUpdate(text.id, {
            x: text.x + deltaX,
            y: text.y + deltaY,
        });

        dragStartPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        dragStartPos.current = null;
    };

    useEffect(() => {
        if (isDragging) {
            const handleMouseUp = () => handleDragEnd();
            window.addEventListener('mouseup', handleMouseUp);
            return () => window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [isDragging]);

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 10,
            }}
        >
            {pageTexts.map(text => (
                <div
                    key={text.id}
                    onMouseDown={(e) => handleDragStart(e, text.id)}
                    onMouseMove={(e) => isDragging && handleDragMove(e, text)}
                    style={{
                        position: 'absolute',
                        left: `${text.x * zoom}px`,
                        top: `${text.y * zoom}px`,
                        fontSize: `${text.fontSize * zoom}px`,
                        fontFamily: text.fontFamily,
                        color: text.color,
                        fontWeight: text.bold ? 'bold' : 'normal',
                        fontStyle: text.italic ? 'italic' : 'normal',
                        textAlign: text.textAlign,
                        pointerEvents: editable ? 'auto' : 'none',
                        cursor: isDragging ? 'grabbing' : 'move',
                        outline: 'none',
                        padding: '4px',
                        minWidth: '40px',
                        minHeight: '1em',
                        border: selectedTextId === text.id
                            ? '2px solid #3b82f6'
                            : editable
                                ? '1px dashed rgba(59, 130, 246, 0.3)'
                                : '1px dashed transparent',
                        borderRadius: '2px',
                        backgroundColor: selectedTextId === text.id
                            ? 'rgba(59, 130, 246, 0.05)'
                            : 'transparent',
                        transition: 'border-color 0.15s, background-color 0.15s',
                        userSelect: isDragging ? 'none' : 'text',
                    }}
                    className="hover:border-blue-400 hover:bg-blue-500/5"
                    onClick={(e) => handleTextClick(e, text.id)}
                >
                    {selectedTextId === text.id ? (
                        <input
                            type="text"
                            autoFocus
                            defaultValue={text.content}
                            onBlur={(e) => handleTextBlur(text.id, e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                }
                                if (e.key === 'Escape') {
                                    setSelectedTextId(null);
                                }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                fontSize: 'inherit',
                                fontFamily: 'inherit',
                                color: 'inherit',
                                fontWeight: 'inherit',
                                fontStyle: 'inherit',
                                textAlign: 'inherit',
                                padding: 0,
                            }}
                        />
                    ) : (
                        <span style={{ pointerEvents: 'none' }}>
                            {text.content}
                        </span>
                    )}

                    {/* Delete button on hover */}
                    {selectedTextId === text.id && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onTextDelete(text.id);
                                setSelectedTextId(null);
                            }}
                            style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            }}
                            title="Delete text"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

/**
 * Toolbar for managing overlay texts
 */
interface OverlayToolbarProps {
    onSaveToPDF: () => void;
    onToggleEdit: () => void;
    isEditing: boolean;
    textCount: number;
}

export function OverlayToolbar({
    onSaveToPDF,
    onToggleEdit,
    isEditing,
    textCount,
}: OverlayToolbarProps) {
    return (
        <div className="flex items-center gap-2 p-2 bg-surface-800/90 rounded-lg backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <Type className="w-4 h-4" />
                <span>{textCount} text overlay{textCount !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex-1" />

            <button
                onClick={onToggleEdit}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isEditing
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                title={isEditing ? 'Lock editing' : 'Enable editing'}
            >
                <Edit3 className="w-4 h-4" />
            </button>

            <button
                onClick={onSaveToPDF}
                disabled={textCount === 0}
                className="px-3 py-1.5 rounded-md bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Save overlays to PDF"
            >
                <Save className="w-4 h-4" />
                Burn into PDF
            </button>
        </div>
    );
}

export default PDFTextOverlay;
