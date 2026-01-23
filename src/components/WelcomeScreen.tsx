// PDF Studio - Welcome Screen (Home / Landing)


import {
    FileText,
    Merge,
    Split,
    Shrink,
    Stamp,
    Droplets,
    PenTool,
    RotateCw,
    Lock,
    Image,
    FileOutput,
    Sparkles,
    Shield,
    Zap,
    Globe,
    Hash,
    EyeOff,
    Crown
} from 'lucide-react';
import { DropZone } from './DropZone';

interface WelcomeScreenProps {
    onFileSelect: (file: File) => void;
    onQuickAction: (action: string) => void;
    isPremium: boolean;
}

const QUICK_TOOLS = [
    { id: 'merge', icon: Merge, label: 'Merge PDFs', color: 'from-blue-500 to-blue-600', desc: 'Combine multiple files' },
    { id: 'split', icon: Split, label: 'Split PDF', color: 'from-green-500 to-green-600', desc: 'Extract pages' },
    { id: 'compress', icon: Shrink, label: 'Compress', color: 'from-orange-500 to-orange-600', desc: 'Reduce file size' },
    { id: 'protect', icon: Lock, label: 'Protect', color: 'from-red-500 to-red-600', desc: 'Add password' },
    { id: 'bates', icon: Hash, label: 'Legal ID', color: 'from-emerald-500 to-emerald-600', desc: 'Bates numbering' },
    { id: 'redact', icon: EyeOff, label: 'Redact', color: 'from-zinc-700 to-zinc-900', desc: 'Hide sensitive info' },
    { id: 'sign', icon: Stamp, label: 'Sign PDF', color: 'from-indigo-500 to-indigo-600', desc: 'Electronic signature' },
    { id: 'pdf-to-word', icon: FileOutput, label: 'Convert', color: 'from-pink-500 to-pink-600', desc: 'PDF to Word/Images' },
];

const FEATURES = [
    { icon: Shield, title: 'Safe & Secure', description: '100% Client-side processing. Your private documents never leave your machine.' },
    { icon: Zap, title: 'Pro-Grade Tools', description: 'Bates numbering, redaction, and metadata editing built for professional workflows.' },
    { icon: Globe, title: 'Zero Install', description: 'A full-featured PDF suite that works instantly in any modern web browser.' },
];

export function WelcomeScreen({ onFileSelect, onQuickAction, isPremium }: WelcomeScreenProps) {
    return (
        <div className="min-h-screen bg-surface-950 overflow-auto">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-soft" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-soft"
                    style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 
                            flex items-center justify-center shadow-lg shadow-primary-500/30 relative">
                            <FileText className="w-8 h-8 text-white" />
                            {isPremium && (
                                <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow border-2 border-surface-950">
                                    <Crown className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center mb-6">
                        <div
                            className="flex items-center gap-2 px-4 py-2 rounded-full border bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        >
                            <Crown className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                                Pro Engine Active
                            </span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-display font-bold text-white mb-4">
                        PDF <span className="gradient-text">Studio</span>
                    </h1>
                    <p className="text-xl text-surface-400 max-w-2xl mx-auto">
                        The all-in-one PDF editor that works right in your browser.
                        Edit, merge, split, sign, and more — <span className="text-primary-400">all for free</span>.
                    </p>
                </div>

                {/* Drop Zone */}
                <div className="max-w-2xl mx-auto mb-16">
                    <DropZone onFilesSelect={(files) => onFileSelect(files[0])} />
                </div>

                {/* Quick Tools */}
                <div className="mb-16">
                    <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider text-center mb-6">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                        {QUICK_TOOLS.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => onQuickAction(tool.id)}
                                className="group p-4 rounded-2xl glass hover:bg-white/10 transition-all duration-300
                           flex flex-col items-center gap-3"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} 
                                flex items-center justify-center shadow-lg 
                                group-hover:scale-110 group-hover:shadow-xl transition-all`}>
                                    <tool.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-medium text-surface-300 group-hover:text-white transition-colors">
                                    {tool.label}
                                </span>
                                <span className="text-[10px] text-surface-500 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {tool.desc}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {FEATURES.map((feature, i) => (
                        <div
                            key={i}
                            className="p-6 rounded-2xl glass animate-fade-in"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
                                <feature.icon className="w-6 h-6 text-primary-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-surface-400 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* All Tools Grid */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">
                        Everything You Need for PDFs
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[
                            { icon: PenTool, label: 'Edit Text' },
                            { icon: Image, label: 'Add Images' },
                            { icon: Stamp, label: 'Add Signature' },
                            { icon: Droplets, label: 'Watermark' },
                            { icon: Merge, label: 'Merge Files' },
                            { icon: Split, label: 'Split Pages' },
                            { icon: Shrink, label: 'Compress' },
                            { icon: RotateCw, label: 'Rotate Pages' },
                            { icon: Lock, label: 'Password Protect' },
                            { icon: FileOutput, label: 'Export Images' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="p-4 rounded-xl bg-surface-900/50 border border-surface-800 
                           flex items-center gap-3 hover:border-surface-700 transition-colors"
                            >
                                {item.label === 'Edit Text' ? (
                                    <img src="/edit_icon.png" alt="PDF Editor" className="w-6 h-6 rounded shadow-lg" />
                                ) : item.label === 'Merge Files' ? (
                                    <img src="/insert_icon.png" alt="Insert PDF" className="w-6 h-6 rounded shadow-lg" />
                                ) : (
                                    <item.icon className="w-5 h-5 text-primary-400" />
                                )}
                                <span className="text-sm text-surface-300">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-surface-500 text-sm">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Built with modern web technologies</span>
                    </div>
                    <p>© 2026 PDF Studio. All processing happens locally in your browser.</p>
                </div>
            </div>
        </div>
    );
}

export default WelcomeScreen;
