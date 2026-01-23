// Keyboard Shortcuts Panel - Shows all available keyboard shortcuts
import React, { useState } from 'react';
import { X, Keyboard, Command, Search } from 'lucide-react';

interface ShortcutsPanelProps {
    onClose: () => void;
}

const SHORTCUTS = [
    {
        category: 'General',
        color: 'text-blue-400',
        items: [
            { keys: ['Ctrl', 'S'], action: 'Save/Export PDF' },
            { keys: ['Ctrl', 'Z'], action: 'Undo' },
            { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo' },
            { keys: ['Ctrl', 'F'], action: 'Find/Search text' },
            { keys: ['Escape'], action: 'Cancel/Deselect' },
            { keys: ['Delete'], action: 'Delete selected element' },
        ]
    },
    {
        category: 'Navigation',
        color: 'text-green-400',
        items: [
            { keys: ['←', '→'], action: 'Previous/Next page' },
            { keys: ['Home'], action: 'Go to first page' },
            { keys: ['End'], action: 'Go to last page' },
            { keys: ['Ctrl', '+'], action: 'Zoom in' },
            { keys: ['Ctrl', '-'], action: 'Zoom out' },
            { keys: ['Ctrl', '0'], action: 'Reset zoom to 100%' },
        ]
    },
    {
        category: 'Tools',
        color: 'text-purple-400',
        items: [
            { keys: ['V'], action: 'Select tool' },
            { keys: ['T'], action: 'Text tool' },
            { keys: ['H'], action: 'Highlight tool' },
            { keys: ['D'], action: 'Draw tool' },
            { keys: ['S'], action: 'Shape tool' },
            { keys: ['N'], action: 'Sticky note' },
        ]
    },
    {
        category: 'Text Editing',
        color: 'text-orange-400',
        items: [
            { keys: ['Ctrl', 'B'], action: 'Bold text' },
            { keys: ['Ctrl', 'I'], action: 'Italic text' },
            { keys: ['Ctrl', 'Enter'], action: 'Save text changes' },
            { keys: ['Ctrl', 'A'], action: 'Select all text' },
        ]
    },
    {
        category: 'Page Operations',
        color: 'text-pink-400',
        items: [
            { keys: ['Ctrl', 'N'], action: 'Add new page' },
            { keys: ['Ctrl', 'D'], action: 'Duplicate current page' },
            { keys: ['Ctrl', 'R'], action: 'Rotate page' },
        ]
    }
];

export function KeyboardShortcutsPanel({ onClose }: ShortcutsPanelProps) {
    const [search, setSearch] = useState('');

    // Close on Escape key
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const filteredShortcuts = SHORTCUTS.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.action.toLowerCase().includes(search.toLowerCase()) ||
            item.keys.join(' ').toLowerCase().includes(search.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={onClose}>
            <div
                className="modal !max-w-2xl h-[600px] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                            <Keyboard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
                            <p className="text-surface-400 text-sm">Master PDF Studio like a pro</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-surface-400" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input
                        type="text"
                        placeholder="Search shortcuts..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/50"
                    />
                </div>

                {/* Shortcuts List */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    {filteredShortcuts.map(category => (
                        <div key={category.category}>
                            <h3 className={`text-xs font-bold uppercase tracking-wider ${category.color} mb-3 flex items-center gap-2`}>
                                <div className="w-2 h-2 rounded-full bg-current" />
                                {category.category}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {category.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                                    >
                                        <span className="text-sm text-surface-300">{item.action}</span>
                                        <div className="flex items-center gap-1">
                                            {item.keys.map((key, i) => (
                                                <React.Fragment key={i}>
                                                    <kbd className="px-2 py-1 bg-surface-800 border border-surface-700 rounded text-xs font-mono text-surface-300">
                                                        {key === 'Ctrl' ? <><Command className="w-3 h-3 inline" /></> : key}
                                                    </kbd>
                                                    {i < item.keys.length - 1 && <span className="text-surface-600">+</span>}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Tip */}
                <div className="mt-4 p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                    <p className="text-xs text-primary-300">
                        <strong>Pro Tip:</strong> Press <kbd className="px-1.5 py-0.5 bg-surface-800 rounded text-[10px]">?</kbd> anytime to open this panel quickly!
                    </p>
                </div>
            </div>
        </div>
    );
}

export default KeyboardShortcutsPanel;
