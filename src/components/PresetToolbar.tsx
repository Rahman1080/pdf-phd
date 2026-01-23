// Preset Toolbars - Switch between different tool modes
import React from 'react';
import {
    Type, Highlighter, StickyNote, Pencil, Shapes, Image, FileSignature,
    FormInput, Table2, CheckSquare, Layout, Eye, Edit3, MessageSquare,
    X
} from 'lucide-react';

type ToolbarMode = 'edit' | 'forms' | 'review' | 'all';

interface PresetToolbarProps {
    currentMode: ToolbarMode;
    onModeChange: (mode: ToolbarMode) => void;
    onToolSelect: (tool: string) => void;
    currentTool: string;
}

const MODES = [
    { id: 'all' as ToolbarMode, label: 'All Tools', icon: <Layout className="w-4 h-4" />, color: 'from-purple-500 to-indigo-500' },
    { id: 'edit' as ToolbarMode, label: 'Editing', icon: <Edit3 className="w-4 h-4" />, color: 'from-blue-500 to-cyan-500' },
    { id: 'forms' as ToolbarMode, label: 'Forms', icon: <FormInput className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500' },
    { id: 'review' as ToolbarMode, label: 'Review', icon: <MessageSquare className="w-4 h-4" />, color: 'from-amber-500 to-orange-500' },
];

const TOOLS_BY_MODE: Record<ToolbarMode, { id: string; label: string; icon: React.ReactNode }[]> = {
    edit: [
        { id: 'select', label: 'Select', icon: <Eye className="w-5 h-5" /> },
        { id: 'text', label: 'Text', icon: <Type className="w-5 h-5" /> },
        { id: 'image', label: 'Image', icon: <Image className="w-5 h-5" /> },
        { id: 'shape', label: 'Shapes', icon: <Shapes className="w-5 h-5" /> },
        { id: 'draw', label: 'Draw', icon: <Pencil className="w-5 h-5" /> },
        { id: 'signature', label: 'Sign', icon: <FileSignature className="w-5 h-5" /> },
    ],
    forms: [
        { id: 'select', label: 'Select', icon: <Eye className="w-5 h-5" /> },
        { id: 'formfield', label: 'Fields', icon: <FormInput className="w-5 h-5" /> },
        { id: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="w-5 h-5" /> },
        { id: 'table', label: 'Table', icon: <Table2 className="w-5 h-5" /> },
        { id: 'signature', label: 'Sign', icon: <FileSignature className="w-5 h-5" /> },
    ],
    review: [
        { id: 'select', label: 'Select', icon: <Eye className="w-5 h-5" /> },
        { id: 'highlight', label: 'Highlight', icon: <Highlighter className="w-5 h-5" /> },
        { id: 'stickynote', label: 'Note', icon: <StickyNote className="w-5 h-5" /> },
        { id: 'draw', label: 'Markup', icon: <Pencil className="w-5 h-5" /> },
        { id: 'redact', label: 'Redact', icon: <X className="w-5 h-5" /> },
    ],
    all: [
        { id: 'select', label: 'Select', icon: <Eye className="w-5 h-5" /> },
        { id: 'text', label: 'Text', icon: <Type className="w-5 h-5" /> },
        { id: 'highlight', label: 'Highlight', icon: <Highlighter className="w-5 h-5" /> },
        { id: 'stickynote', label: 'Note', icon: <StickyNote className="w-5 h-5" /> },
        { id: 'draw', label: 'Draw', icon: <Pencil className="w-5 h-5" /> },
        { id: 'shape', label: 'Shapes', icon: <Shapes className="w-5 h-5" /> },
        { id: 'image', label: 'Image', icon: <Image className="w-5 h-5" /> },
        { id: 'signature', label: 'Sign', icon: <FileSignature className="w-5 h-5" /> },
        { id: 'formfield', label: 'Fields', icon: <FormInput className="w-5 h-5" /> },
        { id: 'table', label: 'Table', icon: <Table2 className="w-5 h-5" /> },
    ],
};

export function PresetToolbar({ currentMode, onModeChange, onToolSelect, currentTool }: PresetToolbarProps) {
    const tools = TOOLS_BY_MODE[currentMode];

    return (
        <div className="flex flex-col gap-3">
            {/* Mode Selector */}
            <div className="flex gap-1 p-1 bg-surface-800/50 rounded-xl">
                {MODES.map(mode => (
                    <button
                        key={mode.id}
                        onClick={() => onModeChange(mode.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${currentMode === mode.id
                                ? `bg-gradient-to-r ${mode.color} text-white shadow-lg`
                                : 'text-surface-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {mode.icon}
                        <span className="hidden sm:inline">{mode.label}</span>
                    </button>
                ))}
            </div>

            {/* Tool Buttons */}
            <div className="flex gap-1 flex-wrap">
                {tools.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => onToolSelect(tool.id)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[52px] ${currentTool === tool.id
                                ? 'bg-primary-500/20 text-primary-400 ring-2 ring-primary-500/50'
                                : 'text-surface-400 hover:text-white hover:bg-white/5'
                            }`}
                        title={tool.label}
                    >
                        {tool.icon}
                        <span className="text-[9px] font-medium">{tool.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default PresetToolbar;
