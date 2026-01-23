// Right-Click Context Menu Component
import React from 'react';
import {
    Copy, Trash2, Lock, Unlock, ArrowUp, ArrowDown,
    Layers, Eye, EyeOff, RotateCcw, RotateCw, Clipboard,
    AlignLeft, AlignCenter, AlignRight, Maximize2, Minimize2,
    FlipHorizontal, FlipVertical
} from 'lucide-react';

interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    shortcut?: string;
    divider?: boolean;
    danger?: boolean;
    disabled?: boolean;
}

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onAction: (action: string) => void;
    elementType?: string;
    isLocked?: boolean;
    isVisible?: boolean;
}

export function ContextMenu({ x, y, onClose, onAction, elementType, isLocked, isVisible = true }: ContextMenuProps) {
    const baseItems: MenuItem[] = [
        { id: 'copy', label: 'Copy', icon: <Copy className="w-4 h-4" />, shortcut: 'Ctrl+C' },
        { id: 'paste', label: 'Paste', icon: <Clipboard className="w-4 h-4" />, shortcut: 'Ctrl+V' },
        { id: 'duplicate', label: 'Duplicate', icon: <Copy className="w-4 h-4" />, shortcut: 'Ctrl+D', divider: true },
    ];

    const orderItems: MenuItem[] = [
        { id: 'bring-front', label: 'Bring to Front', icon: <ArrowUp className="w-4 h-4" /> },
        { id: 'send-back', label: 'Send to Back', icon: <ArrowDown className="w-4 h-4" /> },
        { id: 'bring-forward', label: 'Bring Forward', icon: <Layers className="w-4 h-4" /> },
        { id: 'send-backward', label: 'Send Backward', icon: <Layers className="w-4 h-4" />, divider: true },
    ];

    const transformItems: MenuItem[] = elementType === 'image' || elementType === 'shape' ? [
        { id: 'rotate-cw', label: 'Rotate 90° Right', icon: <RotateCw className="w-4 h-4" /> },
        { id: 'rotate-ccw', label: 'Rotate 90° Left', icon: <RotateCcw className="w-4 h-4" /> },
        { id: 'flip-h', label: 'Flip Horizontal', icon: <FlipHorizontal className="w-4 h-4" /> },
        { id: 'flip-v', label: 'Flip Vertical', icon: <FlipVertical className="w-4 h-4" />, divider: true },
    ] : [];

    const alignItems: MenuItem[] = elementType === 'text' ? [
        { id: 'align-left', label: 'Align Left', icon: <AlignLeft className="w-4 h-4" /> },
        { id: 'align-center', label: 'Align Center', icon: <AlignCenter className="w-4 h-4" /> },
        { id: 'align-right', label: 'Align Right', icon: <AlignRight className="w-4 h-4" />, divider: true },
    ] : [];

    const visibilityItems: MenuItem[] = [
        { id: 'toggle-visibility', label: isVisible ? 'Hide' : 'Show', icon: isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" /> },
        { id: 'toggle-lock', label: isLocked ? 'Unlock' : 'Lock', icon: isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />, divider: true },
    ];

    const sizeItems: MenuItem[] = [
        { id: 'fit-page', label: 'Fit to Page Width', icon: <Maximize2 className="w-4 h-4" /> },
        { id: 'reset-size', label: 'Reset Size', icon: <Minimize2 className="w-4 h-4" />, divider: true },
    ];

    const deleteItem: MenuItem = {
        id: 'delete',
        label: 'Delete',
        icon: <Trash2 className="w-4 h-4" />,
        shortcut: 'Del',
        danger: true
    };

    const allItems = [
        ...baseItems,
        ...orderItems,
        ...transformItems,
        ...alignItems,
        ...visibilityItems,
        ...sizeItems,
        deleteItem
    ];

    // Adjust position to stay within viewport
    const menuStyle: React.CSSProperties = {
        position: 'fixed',
        top: Math.min(y, window.innerHeight - 400),
        left: Math.min(x, window.innerWidth - 220),
        zIndex: 99999,
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[99998]"
                onClick={onClose}
                onContextMenu={e => { e.preventDefault(); onClose(); }}
            />

            {/* Menu */}
            <div
                style={menuStyle}
                className="w-56 bg-surface-900/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            >
                <div className="py-1">
                    {allItems.map((item, _idx) => (
                        <React.Fragment key={item.id}>
                            <button
                                onClick={() => { onAction(item.id); onClose(); }}
                                disabled={item.disabled}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${item.danger
                                    ? 'text-red-400 hover:bg-red-500/10'
                                    : item.disabled
                                        ? 'text-surface-600 cursor-not-allowed'
                                        : 'text-surface-300 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                                {item.shortcut && (
                                    <span className="text-xs text-surface-500">{item.shortcut}</span>
                                )}
                            </button>
                            {item.divider && <div className="my-1 border-t border-white/5" />}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </>
    );
}

export default ContextMenu;
