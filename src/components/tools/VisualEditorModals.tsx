import React, { useState } from 'react';
import { X, Check, Link2, QrCode, Hash, ListOrdered, AlignCenter, Highlighter } from 'lucide-react';

interface ModalProps {
    onClose: () => void;
    title: string;
    icon: React.ElementType;
    iconColor: string;
    children: React.ReactNode;
    onSave: () => void;
    saveLabel?: string;
}

function BaseModal({ onClose, title, icon: Icon, iconColor, children, onSave, saveLabel = 'Apply' }: ModalProps) {
    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[200] p-0 sm:p-4 animate-in fade-in duration-300"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-surface-900 border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${iconColor} flex items-center justify-center shadow-lg transition-transform hover:scale-110`}>
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-surface-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {children}
                </div>

                <div className="p-6 pt-0 flex gap-3 pb-safe-offset-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-surface-400 font-bold rounded-2xl transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        className="flex-1 py-4 bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        <span>{saveLabel}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export function LinkModal({ initialUrl, onSave, onClose }: { initialUrl: string, onSave: (url: string) => void, onClose: () => void }) {
    const [url, setUrl] = useState(initialUrl || 'https://');

    return (
        <BaseModal title="Web Hyperlink" icon={Link2} iconColor="bg-blue-500" onClose={onClose} onSave={() => onSave(url)}>
            <div className="space-y-2">
                <label className="text-xs font-black text-surface-500 uppercase tracking-widest px-1">Destination URL</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Link2 className="w-4 h-4 text-surface-500 group-focus-within:text-primary-400 transition-colors" />
                    </div>
                    <input
                        autoFocus
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full bg-surface-800 border-2 border-white/5 focus:border-primary-500 rounded-2xl py-4 pl-11 pr-4 text-white font-medium placeholder:text-surface-600 outline-none transition-all shadow-inner"
                    />
                </div>
                <p className="text-[10px] text-surface-500 font-bold px-1 italic">Clickable area will be added to the PDF at your chosen location.</p>
            </div>
        </BaseModal>
    );
}

export function QRCodeModal({ initialContent, onSave, onClose }: { initialContent: string, onSave: (content: string) => void, onClose: () => void }) {
    const [content, setContent] = useState(initialContent || 'https://');

    return (
        <BaseModal title="QR Code Tool" icon={QrCode} iconColor="bg-purple-600" onClose={onClose} onSave={() => onSave(content)}>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-black text-surface-500 uppercase tracking-widest px-1">QR Data (Text or URL)</label>
                    <textarea
                        autoFocus
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter website, text, or contact info..."
                        rows={4}
                        className="w-full bg-surface-800 border-2 border-white/5 focus:border-primary-500 rounded-2xl p-4 text-white font-medium placeholder:text-surface-600 outline-none transition-all resize-none shadow-inner"
                    />
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="w-16 h-16 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 shadow-xl">
                        <QrCode className="w-full h-full text-black" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xs font-bold text-white mb-1">Dynamic Live Preview</h4>
                        <p className="text-[10px] text-surface-500 leading-tight">Your QR code will be generated instantly and embedded at full resolution into the final PDF.</p>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}

export function BatesModal({ initialData, onSave, onClose }: { initialData?: any, onSave: (data: any) => void, onClose: () => void }) {
    const [prefix, setPrefix] = useState(initialData?.prefix || 'BATES-');
    const [startNum, setStartNum] = useState(initialData?.startNum || 1);
    const [digits, setDigits] = useState(initialData?.digits || 6);

    return (
        <BaseModal title="Bates Numbering" icon={Hash} iconColor="bg-orange-500" onClose={onClose} onSave={() => onSave({ prefix, startNum, digits })}>
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-black text-surface-500 uppercase tracking-widest px-1">Sequence Prefix</label>
                    <input
                        type="text"
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        className="w-full bg-surface-800 border border-white/5 focus:border-primary-500 rounded-xl py-3 px-4 text-white font-bold outline-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-surface-500 uppercase tracking-widest px-1">Start At</label>
                        <input
                            type="number"
                            value={startNum}
                            onChange={(e) => setStartNum(parseInt(e.target.value))}
                            className="w-full bg-surface-800 border border-white/5 focus:border-primary-500 rounded-xl py-3 px-4 text-white font-bold outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-surface-500 uppercase tracking-widest px-1">Fixed Digits</label>
                        <select
                            value={digits}
                            onChange={(e) => setDigits(parseInt(e.target.value))}
                            className="w-full bg-surface-800 border border-white/5 focus:border-primary-500 rounded-xl py-3 px-4 text-white font-bold outline-none appearance-none cursor-pointer"
                        >
                            {[3, 4, 5, 6, 7, 8].map(d => <option key={d} value={d}>{d} digits</option>)}
                        </select>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-center">
                    <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest block mb-1">Preview Format</span>
                    <span className="text-lg font-mono font-black text-white">{prefix}{String(startNum).padStart(digits, '0')}</span>
                </div>
            </div>
        </BaseModal>
    );
}

export function PageNumbersModal({ initialData, onSave, onClose }: { initialData?: any, onSave: (data: any) => void, onClose: () => void }) {
    const [format, setFormat] = useState(initialData?.format || 'Page {n}');

    return (
        <BaseModal title="Page Numbers" icon={ListOrdered} iconColor="bg-green-600" onClose={onClose} onSave={() => onSave({ format })}>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-black text-surface-500 uppercase tracking-widest px-1">Dynamic Format</label>
                    <div className="flex flex-col gap-2">
                        {['Page {n}', '{n}', 'Pg {n} of {total}', '- {n} -'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFormat(f)}
                                className={`py-4 px-6 rounded-2xl font-bold text-left transition-all border-2 ${format === f ? 'bg-primary-500/10 border-primary-500 text-white shadow-lg shadow-primary-500/5' : 'bg-surface-800 border-white/5 text-surface-400 hover:bg-white/5'}`}
                            >
                                {f.replace('{n}', '1').replace('{total}', '10')}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <ListOrdered className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-[10px] text-surface-500 font-medium">Use <code className="text-primary-400">{"{n}"}</code> for current page and <code className="text-primary-400">{"{total}"}</code> for total pages.</p>
                </div>
            </div>
        </BaseModal>
    );
}

export function HeaderFooterModal({ initialText, onSave, onClose }: { initialText: string, onSave: (text: string) => void, onClose: () => void }) {
    const [text, setText] = useState(initialText || '');

    return (
        <BaseModal title="Header & Footer" icon={AlignCenter} iconColor="bg-indigo-600" onClose={onClose} onSave={() => onSave(text)}>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-black text-surface-500 uppercase tracking-widest px-1">Content Text</label>
                    <textarea
                        autoFocus
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter header or footer content..."
                        rows={3}
                        className="w-full bg-surface-800 border-2 border-white/5 focus:border-primary-500 rounded-2xl p-4 text-white font-medium outline-none transition-all resize-none"
                    />
                </div>
                <div className="p-4 rounded-xl bg-surface-800 border border-white/5">
                    <h4 className="text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Available Tags</h4>
                    <div className="flex flex-wrap gap-2">
                        {['{date}', '{filename}', '{page}'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => setText(prev => prev + tag)}
                                className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md text-[10px] font-mono text-primary-400 transition-colors"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
export function BulkRedactModal({ onSave, onClose }: { onSave: (searchTerms: string[]) => void, onClose: () => void }) {
    const [terms, setTerms] = useState('');

    return (
        <BaseModal title="Auto Redact" icon={Highlighter} iconColor="bg-red-600" onClose={onClose} onSave={() => onSave(terms.split('\n').filter(t => t.trim()))} saveLabel="Search & Redact">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-black text-surface-500 uppercase tracking-widest px-1">Words to Redact</label>
                    <textarea
                        autoFocus
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                        placeholder="Enter words or phrases to redact (one per line)..."
                        rows={6}
                        className="w-full bg-surface-800 border-2 border-white/5 focus:border-primary-500 rounded-2xl p-4 text-white font-medium placeholder:text-surface-600 outline-none transition-all resize-none shadow-inner"
                    />
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                        <Highlighter className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                        <p className="text-xs text-white font-bold mb-1">Precision Scan</p>
                        <p className="text-[10px] text-surface-500 leading-tight">Our AI will scan all pages and automatically place accurate redaction boxes over matching text.</p>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
