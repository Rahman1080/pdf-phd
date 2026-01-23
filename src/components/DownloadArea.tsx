import { useState, useEffect } from 'react';
import { Download, FileText, CheckCircle2, ArrowLeft, Loader2, Share2, ShieldCheck, Zap } from 'lucide-react';

interface DownloadAreaProps {
    file: File | Blob;
    fileName: string;
    onBack: () => void;
    onShare?: (file: File | Blob, fileName: string) => void;
    onCompress?: (file: File | Blob) => void;
}

export function DownloadArea({ file, fileName, onBack, onShare, onCompress }: DownloadAreaProps) {
    const [isProcessing, setIsProcessing] = useState(true);
    const [processProgress, setProcessProgress] = useState(0);

    useEffect(() => {
        // Simulate high-fidelity processing for premium feel and ad space
        const timer = setInterval(() => {
            setProcessProgress(prev => {
                if (prev >= 100) {
                    setIsProcessing(false);
                    clearInterval(timer);
                    return 100;
                }
                return prev + (Math.random() * 25); // Faster for better UX
            });
        }, 300);
        return () => clearInterval(timer);
    }, []);

    const handleDownload = () => {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center py-8 px-4 lg:p-8 overflow-y-auto">
            <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 w-full px-2">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Editor</span>
                    </button>
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20">
                            <FileText className="w-5 h-5" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">PDF Studio</span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Right Side (Ads) - APPEARS FIRST ON MOBILE */}
                    <div className="w-full lg:w-1/3 order-1 lg:order-2 space-y-6">
                        <div className="bg-white/5 border border-dashed border-white/20 rounded-3xl min-h-[300px] flex flex-col items-center justify-center p-6 lg:p-8 relative overflow-hidden group">
                            {/* This is where the ads would go */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10 text-center">
                                <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-[9px] font-bold tracking-widest uppercase text-gray-500 mb-4 border border-white/10">
                                    Sponsored Advertisement
                                </div>

                                <div className="w-full max-w-[200px] mx-auto aspect-square bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
                                    {/* Placeholder for real ad network */}
                                    <div className="flex flex-col items-center gap-3 p-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                            <Zap className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <p className="text-gray-400 text-xs font-semibold">Your Ad Here</p>
                                        <p className="text-gray-600 text-[10px] leading-tight">
                                            Promote your brand to thousands of PDF users.
                                        </p>
                                    </div>
                                    {/* Glass reflection */}
                                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent skew-y-[-10deg] translate-y-[-50%]" />
                                </div>

                                <div className="space-y-2">
                                    <div className="h-3 w-40 bg-white/5 rounded mx-auto" />
                                    <div className="h-2 w-24 bg-white/5 rounded mx-auto opacity-50" />
                                </div>
                            </div>
                        </div>

                        {/* Secondary Ad Space or Quick Tools */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-white text-xs font-bold tracking-tight">Success! Ready for download.</p>
                                <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mt-0.5">Verified & Private</p>
                            </div>
                        </div>
                    </div>

                    {/* Left Side (File Info & Download) - APPEARS SECOND ON MOBILE */}
                    <div className="w-full lg:w-2/3 order-2 lg:order-1 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                            {/* Decorative background flare */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
                            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner flex-shrink-0">
                                        <FileText className="w-8 h-8 text-purple-400" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h2 className="text-2xl font-bold text-white mb-2 truncate" title={fileName}>
                                            {fileName}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <p className="text-gray-400 text-xs flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                                100% Private
                                            </p>
                                            <p className="text-gray-400 text-xs flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                                                Virus Scanned
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {isProcessing ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-purple-400 font-medium animate-pulse flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Finalizing document...
                                            </span>
                                            <span className="text-gray-500 font-mono text-xs">{Math.round(processProgress)}%</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 transition-all duration-300 ease-out rounded-full shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                                                style={{ width: `${processProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5 animate-in zoom-in-95 duration-500">
                                        <button
                                            onClick={handleDownload}
                                            className="w-full py-5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center gap-3 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-xl shadow-purple-500/25 active:scale-[0.98] group"
                                        >
                                            <Download className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
                                            Download Your File
                                        </button>

                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={() => onShare && onShare(file, fileName)}
                                                className="flex-1 py-3.5 px-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
                                            >
                                                <Share2 className="w-4 h-4" /> Share
                                            </button>
                                            {fileName.toLowerCase().endsWith('.pdf') && (
                                                <button
                                                    onClick={() => onCompress && onCompress(file)}
                                                    className="flex-1 py-3.5 px-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
                                                >
                                                    <Zap className="w-4 h-4 text-yellow-500" /> Compress
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Premium Features Upsell */}
                        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                                <Zap className="w-6 h-6 text-indigo-400 fill-indigo-400/20" />
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-indigo-300 font-bold text-sm mb-1">Unlock PDF PhD Pro</h3>
                                <p className="text-gray-400 text-xs leading-relaxed max-w-md">
                                    Get unlimited conversions, remove all advertisements, and access high-speed OCR.
                                    Support independent development and get the best experience.
                                </p>
                            </div>
                            <button className="md:ml-auto whitespace-nowrap px-4 py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/20">
                                Go Premium
                            </button>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-white/10 text-center px-4">
                    <p className="text-gray-500 text-[10px] sm:text-xs mb-6 leading-relaxed">
                        PDF Studio processes all files securely. We never upload your documents to our servers.
                        <br className="hidden sm:block" /> Every operation is performed in your browser for maximum privacy.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                        <a href="#" className="text-gray-500 hover:text-white transition-colors text-[9px] uppercase font-bold tracking-widest">Privacy Policy</a>
                        <a href="#" className="text-gray-500 hover:text-white transition-colors text-[9px] uppercase font-bold tracking-widest">Terms of Service</a>
                        <a href="#" className="text-gray-500 hover:text-white transition-colors text-[9px] uppercase font-bold tracking-widest">API Document</a>
                        <a href="#" className="text-gray-500 hover:text-white transition-colors text-[9px] uppercase font-bold tracking-widest">Help Center</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
