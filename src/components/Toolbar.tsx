// PDF Studio - Main Toolbar Component

import {
    MousePointer2,
    Type,
    Image,
    Shapes,
    PenTool,
    Stamp,
    Droplets,
    Undo2,
    Redo2,
    ZoomIn,
    ZoomOut,
    Download,
    Merge,
    Split,
    RotateCw,
    Settings,
    Grid3X3,
    Magnet,
    PenLine
} from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import type { Tool } from '../types';

interface ToolbarProps {
    onExport: () => void;
    onMerge: () => void;
    onSplit: () => void;
    onCompress: () => void;
    onWatermark: () => void;
    onSettings: () => void;
}

export function Toolbar({
    onExport,
    onMerge,
    onSplit,
    onCompress,
    onWatermark,
    onSettings
}: ToolbarProps) {
    const {
        state,
        setTool,
        zoomIn,
        zoomOut,
        setZoom,
        undo,
        redo,
        canUndo,
        canRedo,
        dispatch
    } = useEditor();

    const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
        { id: 'select', icon: <MousePointer2 className="w-5 h-5" />, label: 'Select' },
        { id: 'text', icon: <Type className="w-5 h-5" />, label: 'Add Text' },
        { id: 'image', icon: <Image className="w-5 h-5" />, label: 'Add Image' },
        { id: 'shape', icon: <Shapes className="w-5 h-5" />, label: 'Add Shape' },
        { id: 'draw', icon: <PenTool className="w-5 h-5" />, label: 'Draw' },
        { id: 'highlight', icon: <div className="w-5 h-5 bg-yellow-400/50 rounded-sm border border-yellow-600 flex items-center justify-center"><PenTool className="w-3 h-3 text-yellow-900" /></div>, label: 'Highlighter' },
        { id: 'stamp', icon: <Stamp className="w-5 h-5" />, label: 'Assets & Stamps' },
        { id: 'qrcode', icon: <div className="w-5 h-5 border-2 border-current rounded-sm p-[1px] "><div className="w-full h-full bg-current" /></div>, label: 'QR Code' },
        { id: 'signature', icon: <PenLine className="w-5 h-5" />, label: 'Signature' },
    ];

    const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];

    return (
        <div className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-surface-900/80 backdrop-blur-xl border-b border-white/5 overflow-x-auto no-scrollbar">
            {/* Tools Section - Scrollable on mobile */}
            <div className="toolbar shrink-0">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => setTool(tool.id)}
                        className={`toolbar-button touch-target min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 ${state.tool === tool.id ? 'active' : ''}`}
                        title={tool.label}
                    >
                        {tool.icon}
                    </button>
                ))}
            </div>

            <div className="toolbar-divider h-8 sm:h-10 shrink-0 hidden sm:block" />

            {/* Page Actions - Hidden on very small screens */}
            <div className="toolbar shrink-0 hidden sm:flex">
                <button
                    onClick={onMerge}
                    className="toolbar-button"
                    title="Merge PDFs"
                >
                    <Merge className="w-5 h-5" />
                </button>
                <button
                    onClick={onSplit}
                    className="toolbar-button"
                    title="Split PDF"
                >
                    <Split className="w-5 h-5" />
                </button>
                <button
                    onClick={onWatermark}
                    className="toolbar-button"
                    title="Add Watermark"
                >
                    <Droplets className="w-5 h-5" />
                </button>
                <button
                    onClick={onCompress}
                    className="toolbar-button"
                    title="Compress PDF"
                >
                    <RotateCw className="w-5 h-5" />
                </button>
            </div>

            <div className="toolbar-divider h-8 sm:h-10 shrink-0 hidden md:block" />

            {/* Undo/Redo */}
            <div className="toolbar shrink-0">
                <button
                    onClick={undo}
                    disabled={!canUndo}
                    className={`toolbar-button touch-target min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 ${!canUndo ? 'opacity-40 cursor-not-allowed' : ''}`}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo2 className="w-5 h-5" />
                </button>
                <button
                    onClick={redo}
                    disabled={!canRedo}
                    className={`toolbar-button touch-target min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 ${!canRedo ? 'opacity-40 cursor-not-allowed' : ''}`}
                    title="Redo (Ctrl+Y)"
                >
                    <Redo2 className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 min-w-[8px]" />

            {/* Zoom Controls - Simplified on mobile */}
            <div className="toolbar shrink-0">
                <button onClick={zoomOut} className="toolbar-button touch-target min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0" title="Zoom Out">
                    <ZoomOut className="w-5 h-5" />
                </button>

                <select
                    value={state.zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="bg-transparent text-white text-xs sm:text-sm font-medium px-1 sm:px-2 py-1 rounded-lg
                     border border-transparent hover:border-surface-600 focus:outline-none
                     cursor-pointer min-w-[60px] sm:min-w-[80px] text-center touch-target"
                >
                    {zoomLevels.map((level) => (
                        <option key={level} value={level} className="bg-surface-800">
                            {Math.round(level * 100)}%
                        </option>
                    ))}
                </select>

                <button onClick={zoomIn} className="toolbar-button touch-target min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0" title="Zoom In">
                    <ZoomIn className="w-5 h-5" />
                </button>
            </div>

            <div className="toolbar-divider h-8 sm:h-10 shrink-0 hidden md:block" />

            {/* View Options - Hidden on mobile */}
            <div className="toolbar shrink-0 hidden md:flex">
                <button
                    onClick={() => dispatch({ type: 'TOGGLE_GRID' })}
                    className={`toolbar-button ${state.showGrid ? 'active' : ''}`}
                    title="Toggle Grid"
                >
                    <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                    onClick={() => dispatch({ type: 'TOGGLE_SNAP' })}
                    className={`toolbar-button ${state.snapToGrid ? 'active' : ''}`}
                    title="Snap to Grid"
                >
                    <Magnet className="w-5 h-5" />
                </button>
            </div>

            <div className="toolbar-divider h-8 sm:h-10 shrink-0 hidden sm:block" />

            {/* Export/Save */}
            <div className="toolbar shrink-0">
                <button onClick={onSettings} className="toolbar-button touch-target min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 hidden sm:flex" title="Settings">
                    <Settings className="w-5 h-5" />
                </button>
                <button
                    onClick={onExport}
                    className="btn-primary flex items-center gap-1 sm:gap-2 !py-2 !px-3 sm:!px-4 text-xs sm:text-sm touch-target"
                >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                </button>
            </div>
        </div>
    );
}

export default Toolbar;
