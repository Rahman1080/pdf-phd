// PDF Studio - Properties Panel (Right Sidebar)

import {
    Type,
    Palette,
    Move,
    RotateCcw,
    Lock,
    Unlock,
    Trash2,
    Copy,
    Layers,
    ChevronUp,
    ChevronDown,
    ChevronsUp,
    ChevronsDown,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic
} from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import type { PageElement, TextElement, ShapeElement } from '../types';

const FONT_FAMILIES = [
    { name: 'Helvetica', value: 'helvetica' },
    { name: 'Times New Roman', value: 'times' },
    { name: 'Courier', value: 'courier' },
    { name: 'Cursive', value: 'cursive' },
];

const PRESET_COLORS = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
    '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];

interface PropertiesPanelProps {
    onDelete: () => void;
    onDuplicate: () => void;
}

export function PropertiesPanel({ onDelete, onDuplicate }: PropertiesPanelProps) {
    const { state, updateElement, copyElement, dispatch, selectElement } = useEditor();
    const { selectedElement, currentPage } = state;

    if (!selectedElement) {
        return (
            <div className="w-72 bg-surface-900/80 backdrop-blur-xl border-l border-white/5 p-4">
                <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
                        <Layers className="w-8 h-8 text-surface-600" />
                    </div>
                    <p className="text-surface-500 text-sm">
                        Select an element to<br />view its properties
                    </p>
                </div>
            </div>
        );
    }

    const handleUpdate = (updates: Partial<PageElement>) => {
        updateElement(currentPage, { ...selectedElement, ...updates } as PageElement);
    };

    const handleMoveLayer = (direction: 'up' | 'down' | 'top' | 'bottom') => {
        dispatch({
            type: 'MOVE_ELEMENT_LAYER',
            payload: { pageIndex: currentPage, elementId: selectedElement.id, direction }
        });
    };

    return (
        <div className="w-72 bg-surface-900/80 backdrop-blur-xl border-l border-white/5 
                    flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white capitalize">
                        {selectedElement.type} Properties
                    </h3>
                    <button
                        onClick={() => selectElement(null)}
                        className="text-surface-500 hover:text-white text-xs"
                    >
                        Deselect
                    </button>
                </div>
            </div>

            {/* Properties */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
                {/* Position & Size */}
                <div>
                    <h4 className="panel-header flex items-center gap-2">
                        <Move className="w-4 h-4" />
                        Position & Size
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="input-label">X</label>
                            <input
                                type="number"
                                value={Math.round(selectedElement.x)}
                                onChange={(e) => handleUpdate({ x: parseFloat(e.target.value) || 0 })}
                                className="input text-sm"
                            />
                        </div>
                        <div>
                            <label className="input-label">Y</label>
                            <input
                                type="number"
                                value={Math.round(selectedElement.y)}
                                onChange={(e) => handleUpdate({ y: parseFloat(e.target.value) || 0 })}
                                className="input text-sm"
                            />
                        </div>
                        <div>
                            <label className="input-label">Width</label>
                            <input
                                type="number"
                                value={Math.round(selectedElement.width)}
                                onChange={(e) => handleUpdate({ width: parseFloat(e.target.value) || 10 })}
                                className="input text-sm"
                            />
                        </div>
                        <div>
                            <label className="input-label">Height</label>
                            <input
                                type="number"
                                value={Math.round(selectedElement.height)}
                                onChange={(e) => handleUpdate({ height: parseFloat(e.target.value) || 10 })}
                                className="input text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Rotation */}
                <div>
                    <h4 className="panel-header flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Rotation
                    </h4>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={selectedElement.rotation}
                            onChange={(e) => handleUpdate({ rotation: parseInt(e.target.value) })}
                            className="slider flex-1"
                        />
                        <span className="text-sm text-surface-400 w-12 text-right">
                            {selectedElement.rotation}°
                        </span>
                    </div>
                </div>

                {/* Opacity */}
                <div>
                    <h4 className="panel-header flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Opacity
                    </h4>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={selectedElement.opacity}
                            onChange={(e) => handleUpdate({ opacity: parseFloat(e.target.value) })}
                            className="slider flex-1"
                        />
                        <span className="text-sm text-surface-400 w-12 text-right">
                            {Math.round(selectedElement.opacity * 100)}%
                        </span>
                    </div>
                </div>

                {/* Text-specific properties */}
                {selectedElement.type === 'text' && (
                    <>
                        <div>
                            <h4 className="panel-header flex items-center gap-2">
                                <Type className="w-4 h-4" />
                                Typography
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="input-label">Font Family</label>
                                    <select
                                        value={(selectedElement as TextElement).fontFamily}
                                        onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
                                        className="select text-sm"
                                    >
                                        {FONT_FAMILIES.map(font => (
                                            <option key={font.value} value={font.value}>{font.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="input-label">Font Size</label>
                                        <input
                                            type="number"
                                            value={(selectedElement as TextElement).fontSize}
                                            onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) || 12 })}
                                            className="input text-sm"
                                            min="6"
                                            max="200"
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">Line Height</label>
                                        <input
                                            type="number"
                                            value={(selectedElement as TextElement).lineHeight}
                                            onChange={(e) => handleUpdate({ lineHeight: parseFloat(e.target.value) || 1.2 })}
                                            className="input text-sm"
                                            min="0.5"
                                            max="3"
                                            step="0.1"
                                        />
                                    </div>
                                </div>

                                {/* Style buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleUpdate({
                                            fontWeight: (selectedElement as TextElement).fontWeight === 700 ? 400 : 700
                                        })}
                                        className={`toolbar-button flex-1 ${(selectedElement as TextElement).fontWeight === 700 ? 'active' : ''}`}
                                    >
                                        <Bold className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleUpdate({
                                            fontStyle: (selectedElement as TextElement).fontStyle === 'italic' ? 'normal' : 'italic'
                                        })}
                                        className={`toolbar-button flex-1 ${(selectedElement as TextElement).fontStyle === 'italic' ? 'active' : ''}`}
                                    >
                                        <Italic className="w-4 h-4" />
                                    </button>
                                    <div className="toolbar-divider !h-6" />
                                    <button
                                        onClick={() => handleUpdate({ textAlign: 'left' })}
                                        className={`toolbar-button ${(selectedElement as TextElement).textAlign === 'left' ? 'active' : ''}`}
                                    >
                                        <AlignLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleUpdate({ textAlign: 'center' })}
                                        className={`toolbar-button ${(selectedElement as TextElement).textAlign === 'center' ? 'active' : ''}`}
                                    >
                                        <AlignCenter className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleUpdate({ textAlign: 'right' })}
                                        className={`toolbar-button ${(selectedElement as TextElement).textAlign === 'right' ? 'active' : ''}`}
                                    >
                                        <AlignRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Color */}
                        <div>
                            <label className="input-label">Text Color</label>
                            <div className="flex items-center gap-2 flex-wrap">
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => handleUpdate({ color })}
                                        className={`w-6 h-6 rounded-md border-2 transition-all
                              ${(selectedElement as TextElement).color === color
                                                ? 'border-white scale-110'
                                                : 'border-transparent hover:scale-105'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={(selectedElement as TextElement).color}
                                    onChange={(e) => handleUpdate({ color: e.target.value })}
                                    className="w-6 h-6 rounded-md cursor-pointer"
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Shape-specific properties */}
                {selectedElement.type === 'shape' && (
                    <div>
                        <h4 className="panel-header">Shape Style</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="input-label">Fill Color</label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {PRESET_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => handleUpdate({ fill: color })}
                                            className={`w-6 h-6 rounded-md border-2 transition-all
                                ${(selectedElement as ShapeElement).fill === color
                                                    ? 'border-white scale-110'
                                                    : 'border-transparent hover:scale-105'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="input-label">Stroke Color</label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {PRESET_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => handleUpdate({ stroke: color })}
                                            className={`w-6 h-6 rounded-md border-2 transition-all
                                ${(selectedElement as ShapeElement).stroke === color
                                                    ? 'border-white scale-110'
                                                    : 'border-transparent hover:scale-105'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="input-label">Stroke Width</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={(selectedElement as ShapeElement).strokeWidth}
                                    onChange={(e) => handleUpdate({ strokeWidth: parseInt(e.target.value) })}
                                    className="slider w-full"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Layer ordering */}
                <div>
                    <h4 className="panel-header flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Layer Order
                    </h4>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleMoveLayer('bottom')} className="toolbar-button flex-1" title="Send to Back">
                            <ChevronsDown className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleMoveLayer('down')} className="toolbar-button flex-1" title="Send Backward">
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleMoveLayer('up')} className="toolbar-button flex-1" title="Bring Forward">
                            <ChevronUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleMoveLayer('top')} className="toolbar-button flex-1" title="Bring to Front">
                            <ChevronsUp className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Lock toggle */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-400">Lock Element</span>
                    <button
                        onClick={() => handleUpdate({ locked: !selectedElement.locked })}
                        className={`p-2 rounded-lg transition-colors ${selectedElement.locked
                            ? 'bg-primary-500/20 text-primary-400'
                            : 'bg-surface-800 text-surface-400 hover:text-white'
                            }`}
                    >
                        {selectedElement.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-white/5 space-y-2">
                <button
                    onClick={() => {
                        copyElement();
                        onDuplicate();
                    }}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                    <Copy className="w-4 h-4" />
                    Duplicate
                </button>
                <button
                    onClick={onDelete}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl
                     bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            </div>
        </div>
    );
}

export default PropertiesPanel;
