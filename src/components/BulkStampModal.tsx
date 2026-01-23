// Bulk Stamping Modal
import { useState, useEffect } from 'react';
import { X, Stamp } from 'lucide-react';
import type { StampOptions } from '../utils/advancedExports';

interface BulkStampModalProps {
    totalPages: number;
    onApply: (options: StampOptions) => Promise<void>;
    onClose: () => void;
}

const PRESET_STAMPS = [
    { text: 'APPROVED', color: '#22c55e' },
    { text: 'REJECTED', color: '#ef4444' },
    { text: 'DRAFT', color: '#f59e0b' },
    { text: 'CONFIDENTIAL', color: '#ef4444' },
    { text: 'FINAL', color: '#22c55e' },
    { text: 'COPY', color: '#3b82f6' },
    { text: 'VOID', color: '#6b7280' },
    { text: 'PAID', color: '#22c55e' },
];

const POSITIONS = [
    { id: 'top-left', label: 'Top Left' },
    { id: 'top-center', label: 'Top Center' },
    { id: 'top-right', label: 'Top Right' },
    { id: 'center', label: 'Center' },
    { id: 'bottom-left', label: 'Bottom Left' },
    { id: 'bottom-center', label: 'Bottom Center' },
    { id: 'bottom-right', label: 'Bottom Right' },
];

export function BulkStampModal({ totalPages, onApply, onClose }: BulkStampModalProps) {
    const [text, setText] = useState('APPROVED');
    const [color, setColor] = useState('#22c55e');
    const [fontSize, setFontSize] = useState(36);
    const [position, setPosition] = useState<StampOptions['position']>('center');
    const [rotation, setRotation] = useState(-30);
    const [opacity, setOpacity] = useState(0.3);
    const [pageRange, setPageRange] = useState<'all' | 'odd' | 'even' | 'custom'>('all');
    const [customPages, setCustomPages] = useState('');
    const [applying, setApplying] = useState(false);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !applying) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, applying]);

    const handleApply = async () => {
        setApplying(true);
        try {
            let pages: StampOptions['pageRange'] = 'all';
            if (pageRange === 'custom') {
                pages = customPages.split(',').flatMap(part => {
                    part = part.trim();
                    if (part.includes('-')) {
                        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
                        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
                    }
                    return [parseInt(part)];
                }).filter(n => !isNaN(n) && n >= 1 && n <= totalPages);
            } else {
                pages = pageRange;
            }

            await onApply({
                text,
                color,
                fontSize,
                position,
                rotation,
                opacity,
                pageRange: pages,
            });
            onClose();
        } catch (e) {
            console.error('Failed to apply stamp:', e);
            alert('Failed to apply stamp');
        }
        setApplying(false);
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={onClose}>
            <div
                className="modal !max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden glass-dark shadow-2xl animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-surface-950/30">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Stamp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Bulk Stamping</h2>
                            <p className="text-surface-400 text-xs">Apply stamps across multiple pages automatically</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors group">
                        <X className="w-5 h-5 text-surface-400 group-hover:text-white" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    <div className="space-y-8">
                        {/* Preset Stamps */}
                        <section>
                            <label className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-3 block">Quick Presets</label>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_STAMPS.map(stamp => (
                                    <button
                                        key={stamp.text}
                                        onClick={() => { setText(stamp.text); setColor(stamp.color); }}
                                        className={`px-4 py-2 rounded-full border-2 border-dashed text-xs font-bold uppercase transition-all duration-200 transform hover:scale-105 active:scale-95 ${text === stamp.text
                                            ? 'ring-4 ring-primary-500/20 opacity-100 shadow-lg'
                                            : 'opacity-70 hover:opacity-100'
                                            }`}
                                        style={{
                                            borderColor: stamp.color,
                                            color: stamp.color,
                                            backgroundColor: text === stamp.text ? `${stamp.color}15` : 'transparent'
                                        }}
                                    >
                                        {stamp.text}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Text & Color */}
                            <div className="space-y-6">
                                <section>
                                    <label className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-3 block">Stamp Content</label>
                                    <input
                                        type="text"
                                        value={text}
                                        onChange={e => setText(e.target.value.toUpperCase())}
                                        className="input bg-surface-900/50 border-white/5 focus:bg-surface-800"
                                        placeholder="ENTER TEXT..."
                                    />
                                </section>

                                <section>
                                    <label className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-3 block">Color & Theme</label>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-xl relative overflow-hidden ring-2 ring-white/10 shadow-inner"
                                            style={{ backgroundColor: color }}
                                        >
                                            <input
                                                type="color"
                                                value={color}
                                                onChange={e => setColor(e.target.value)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={color}
                                            onChange={e => setColor(e.target.value)}
                                            className="input flex-1 bg-surface-900/50 border-white/5 font-mono text-xs"
                                        />
                                    </div>
                                </section>
                            </div>

                            {/* Right Column: Sliders */}
                            <div className="space-y-6">
                                <section>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">Font Size</label>
                                        <span className="text-xs font-mono text-primary-400">{fontSize}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="12"
                                        max="72"
                                        value={fontSize}
                                        onChange={e => setFontSize(parseInt(e.target.value))}
                                        className="slider"
                                    />
                                </section>

                                <section>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">Rotation</label>
                                        <span className="text-xs font-mono text-primary-400">{rotation}°</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="-90"
                                        max="90"
                                        value={rotation}
                                        onChange={e => setRotation(parseInt(e.target.value))}
                                        className="slider"
                                    />
                                </section>

                                <section>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">Opacity</label>
                                        <span className="text-xs font-mono text-primary-400">{Math.round(opacity * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1"
                                        step="0.05"
                                        value={opacity}
                                        onChange={e => setOpacity(parseFloat(e.target.value))}
                                        className="slider"
                                    />
                                </section>
                            </div>
                        </div>

                        {/* Position */}
                        <section>
                            <label className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-3 block">Placement</label>
                            <div className="grid grid-cols-4 gap-2">
                                {POSITIONS.map(pos => (
                                    <button
                                        key={pos.id}
                                        onClick={() => setPosition(pos.id as StampOptions['position'])}
                                        className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all ${position === pos.id
                                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 translate-y-[-1px]'
                                            : 'bg-white/5 text-surface-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {pos.label.replace('Center', 'Ctr')}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Page Range */}
                        <section className="bg-surface-900/50 p-4 rounded-2xl border border-white/5 shadow-inner">
                            <label className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-3 block">
                                Target Pages (Total: {totalPages})
                            </label>
                            <div className="flex gap-2 mb-4">
                                {(['all', 'odd', 'even', 'custom'] as const).map(range => (
                                    <button
                                        key={range}
                                        onClick={() => setPageRange(range)}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${pageRange === range
                                            ? 'bg-white text-black shadow-xl ring-4 ring-white/10'
                                            : 'bg-white/5 text-surface-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {range === 'all' ? 'All' : range === 'odd' ? 'Odd' : range === 'even' ? 'Even' : 'Custom'}
                                    </button>
                                ))}
                            </div>
                            {pageRange === 'custom' && (
                                <input
                                    type="text"
                                    value={customPages}
                                    onChange={e => setCustomPages(e.target.value)}
                                    placeholder="e.g., 1, 3-5, 8"
                                    className="input bg-surface-950/50 border-white/5"
                                />
                            )}
                        </section>

                        {/* Preview */}
                        <section>
                            <label className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-3 block">Real-time Preview</label>
                            <div className="bg-white rounded-2xl p-4 shadow-inner relative h-48 overflow-hidden flex items-center justify-center border-4 border-surface-900/20">
                                {/* Page Mockup */}
                                <div className="absolute inset-4 bg-gray-50 rounded shadow-sm border border-gray-100">
                                    <div className="w-full h-full p-4 space-y-2 opacity-10 pointer-events-none">
                                        <div className="h-2 w-3/4 bg-gray-400 rounded"></div>
                                        <div className="h-2 w-1/2 bg-gray-400 rounded"></div>
                                        <div className="h-2 w-2/3 bg-gray-400 rounded"></div>
                                        <div className="h-2 w-full bg-gray-400 rounded"></div>
                                    </div>

                                    {/* The Stamp Preview */}
                                    <div
                                        className="font-bold border-2 border-dashed inline-block px-4 py-2 absolute whitespace-nowrap transition-all duration-300"
                                        style={{
                                            color,
                                            borderColor: color,
                                            fontSize: Math.max(12, fontSize / 2.5),
                                            opacity,
                                            transform: `scale(1) rotate(${rotation}deg)`,
                                            // Simple positioning logic for preview
                                            top: position.includes('top') ? '15%' : position.includes('bottom') ? '70%' : '45%',
                                            left: position.includes('left') ? '10%' : position.includes('right') ? '60%' : '50%',
                                            marginLeft: position.includes('left') ? '0' : position.includes('right') ? '0' : '-25%',
                                            marginTop: position.includes('top') ? '0' : position.includes('bottom') ? '0' : '-5%',
                                        }}
                                    >
                                        {text || 'PREVIEW'}
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-4 text-[10px] text-gray-400 font-mono">1 / {totalPages}</div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/10 bg-surface-950/50 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="btn-ghost text-sm flex items-center gap-2"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        disabled={!text.trim() || applying}
                        className="btn-primary flex items-center gap-2 !py-2.5 !px-8 disabled:opacity-50 group transition-all"
                    >
                        {applying ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Stamp className="w-4 h-4 transition-transform group-hover:rotate-12" />
                        )}
                        <span>{applying ? 'Applying...' : 'Apply Stamp to All Pages'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BulkStampModal;
