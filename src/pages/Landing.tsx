// Landing Page - Premium, Colorful, Animated Design
import { Link } from 'react-router-dom';
import {
    Zap, Shield, Rocket, FileText, ArrowRight,
    Users, Globe, ChevronDown, Star, FileUp, Sparkles,
    Lock, Eye, Cpu, Check, Play, MessageCircle
} from 'lucide-react';
import { Layout, SEOHead, getSoftwareApplicationSchema, getOrganizationSchema, getFAQSchema } from '../components/layout';
import { getFeaturedTools } from '../data/tools';

// FAQ Data for landing page
const landingFAQs = [
    {
        question: "Is PDF PhD really free?",
        answer: "Yes! PDF PhD is completely free to use with no hidden costs. All core features including merge, split, convert, sign, and edit are available at no charge."
    },
    {
        question: "Are my files secure with PDF PhD?",
        answer: "Absolutely. PDF PhD runs 100% locally in your browser. Your files are never uploaded to any server. All processing happens on your device, ensuring complete privacy and security."
    },
    {
        question: "Do I need to create an account?",
        answer: "No account is required! You can use all PDF tools immediately without signing up. We've made everything completely free and accessible to everyone without the need for an account or subscription."
    },
    {
        question: "What file formats can I convert to PDF?",
        answer: "PDF PhD supports converting Word (DOC, DOCX), Excel (XLS, XLSX), PowerPoint (PPT, PPTX), images (JPG, PNG, GIF, TIFF, WebP), and many more formats to PDF."
    },
    {
        question: "Can I use PDF PhD offline?",
        answer: "Yes! Once loaded, PDF PhD can work offline. Since all processing happens in your browser, you don't need an internet connection to use most features after the initial load."
    },
    {
        question: "Is there a file size limit?",
        answer: "There's no strict file size limit. However, very large files (over 100MB) may take longer to process depending on your device's capabilities."
    }
];

// Features data with gradient colors
const features = [
    {
        icon: Zap,
        title: "Lightning Fast",
        description: "Local processing means instant results. No waiting for uploads or server processing.",
        gradient: "from-yellow-400 to-orange-500",
        bgGlow: "bg-yellow-500/20"
    },
    {
        icon: Shield,
        title: "100% Private & Secure",
        description: "Files never leave your device. Complete privacy with client-side processing.",
        gradient: "from-green-400 to-emerald-500",
        bgGlow: "bg-green-500/20"
    },
    {
        icon: Rocket,
        title: "40+ Powerful Tools",
        description: "All-in-one PDF toolkit. Merge, split, convert, sign, edit, and much more.",
        gradient: "from-purple-400 to-pink-500",
        bgGlow: "bg-purple-500/20"
    },
    {
        icon: Eye,
        title: "High Fidelity",
        description: "Perfect conversions that preserve formatting, fonts, and layouts.",
        gradient: "from-blue-400 to-cyan-500",
        bgGlow: "bg-blue-500/20"
    },
    {
        icon: Users,
        title: "Batch Processing",
        description: "Process multiple files at once. Save hours on repetitive tasks.",
        gradient: "from-pink-400 to-rose-500",
        bgGlow: "bg-pink-500/20"
    },
    {
        icon: Cpu,
        title: "Works Offline",
        description: "No internet? No problem. Use all tools offline after initial load.",
        gradient: "from-cyan-400 to-teal-500",
        bgGlow: "bg-cyan-500/20"
    }
];

// Trust signals data
const trustSignals = [
    { stat: "1M+", label: "Documents Processed", icon: FileText, color: "text-purple-400" },
    { stat: "50K+", label: "Happy Users", icon: Users, color: "text-pink-400" },
    { stat: "99.9%", label: "Uptime", icon: Zap, color: "text-yellow-400" },
    { stat: "40+", label: "PDF Tools", icon: Rocket, color: "text-cyan-400" }
];

export function Landing() {
    const featuredTools = getFeaturedTools();

    return (
        <>
            <SEOHead
                title="Fast, Secure PDF Tools — PDF PhD | Edit, Merge, Convert PDF Online"
                description="Professional PDF editor with one-click tools, high-fidelity conversion, and a fast local-first experience. Edit, merge, split, convert, sign PDFs — 100% free and secure."
                keywords={[
                    'pdf editor', 'pdf tools', 'merge pdf', 'split pdf', 'convert pdf',
                    'sign pdf', 'edit pdf online', 'free pdf editor', 'pdf converter',
                    'compress pdf', 'pdf to word', 'word to pdf'
                ]}
                schema={[
                    getSoftwareApplicationSchema(),
                    getOrganizationSchema(),
                    getFAQSchema(landingFAQs)
                ]}
            />

            <Layout fullWidth hideFooter={false}>
                {/* Hero Section - Vibrant and Animated */}
                <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                    {/* Animated Gradient Background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {/* Large animated orbs */}
                        <div className="absolute top-0 left-0 w-full h-full">
                            <div className="absolute top-1/4 -left-32 w-[700px] h-[700px] bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full blur-[120px] animate-pulse" />
                            <div className="absolute bottom-1/4 -right-32 w-[700px] h-[700px] bg-gradient-to-r from-primary-600/30 to-cyan-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
                        </div>

                        {/* Grid pattern */}
                        <div
                            className="absolute inset-0 opacity-[0.02]"
                            style={{
                                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                                backgroundSize: '50px 50px'
                            }}
                        />

                        {/* Animated particles */}
                        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-float opacity-60" />
                        <div className="absolute top-40 right-32 w-3 h-3 bg-pink-400 rounded-full animate-float opacity-60" style={{ animationDelay: '0.5s' }} />
                        <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-float opacity-60" style={{ animationDelay: '1s' }} />
                        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-float opacity-60" style={{ animationDelay: '1.5s' }} />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                        {/* Animated Badge */}
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-8 animate-fade-in backdrop-blur-sm">
                            <div className="relative flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping absolute" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                            </div>
                            <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent uppercase tracking-wide">
                                100% Client-Side • No Uploads • Free Forever
                            </span>
                            <Sparkles className="w-4 h-4 text-purple-400" />
                        </div>

                        {/* Main Headline with animated gradient */}
                        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-6 sm:mb-8 leading-[1.1] tracking-tight">
                            <span className="block">Professional PDF</span>
                            <span className="relative inline-block mt-2">
                                <span className="bg-gradient-to-r from-primary-400 via-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                                    Tools That Shine
                                </span>
                                <Sparkles className="absolute -right-8 sm:-right-12 top-0 w-5 h-5 sm:w-8 sm:h-8 text-yellow-400 animate-pulse" />
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-base sm:text-xl md:text-2xl text-surface-300 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed font-medium px-2">
                            Merge, split, convert, sign & edit PDFs with
                            <span className="text-white font-bold"> lightning-fast local processing</span>.
                            Your files never leave your device.
                        </p>

                        {/* CTAs with glow effects */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-12 sm:mb-16 px-4">
                            <Link
                                to="/workplace"
                                className="group relative flex items-center gap-3 w-full sm:w-auto justify-center px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold rounded-2xl transition-all duration-300 overflow-hidden touch-target"
                            >
                                {/* Button gradient background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500" />
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {/* Glow */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                                <Zap className="w-5 h-5 sm:w-6 sm:h-6 relative text-white" />
                                <span className="relative text-white">Start Free — No Signup</span>
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 relative text-white group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/tools"
                                className="group flex items-center gap-3 w-full sm:w-auto justify-center px-8 sm:px-10 py-4 sm:py-5 bg-white/5 active:bg-white/10 text-white text-base sm:text-lg font-bold rounded-2xl border border-white/20 active:border-white/40 backdrop-blur-sm transition-all touch-target"
                            >
                                <Play className="w-5 h-5" />
                                Explore 40+ Tools
                            </Link>
                        </div>

                        {/* Feature pills */}
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12 sm:mb-16 px-2">
                            {[
                                { icon: Check, text: "No uploads", color: "text-green-400" },
                                { icon: Lock, text: "Secure", color: "text-blue-400" },
                                { icon: Zap, text: "Instant", color: "text-yellow-400" },
                                { icon: Globe, text: "Offline", color: "text-purple-400" }
                            ].map((pill, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-surface-900/60 backdrop-blur-sm border border-white/10"
                                >
                                    <pill.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${pill.color}`} />
                                    <span className="text-xs sm:text-sm font-medium text-surface-300">{pill.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Hero Visual - App Preview */}
                        <div className="relative max-w-5xl mx-auto group">
                            {/* Glow behind card */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/30 via-purple-500/30 to-pink-500/30 rounded-3xl blur-3xl opacity-50 group-hover:opacity-75 transition-opacity" />

                            <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl shadow-black/50 bg-gradient-to-br from-surface-900 to-surface-950">
                                {/* Mock editor header */}
                                <div className="flex items-center gap-2 px-6 py-4 bg-surface-900 border-b border-white/10">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <div className="flex-1 ml-4">
                                        <div className="max-w-xs mx-auto px-4 py-1.5 bg-surface-800 rounded-lg text-xs text-surface-400 text-center">
                                            pdfphd.com/workplace
                                        </div>
                                    </div>
                                </div>

                                {/* Mock content */}
                                <div className="relative p-8 md:p-12">
                                    <div className="grid grid-cols-4 gap-4 mb-6">
                                        {['Merge', 'Split', 'Convert', 'Sign'].map((tool, i) => (
                                            <div key={i} className="aspect-square rounded-2xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-white/10 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform cursor-pointer">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="text-xs font-bold text-white">{tool}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-48 rounded-2xl bg-surface-800/50 border border-white/5 flex items-center justify-center">
                                        <div className="text-center">
                                            <FileUp className="w-12 h-12 text-surface-600 mx-auto mb-3" />
                                            <p className="text-surface-500 font-medium">Drop your PDF here to start</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating elements */}
                            <div className="absolute -left-6 top-1/4 hidden lg:flex items-center gap-2 px-4 py-3 bg-surface-900/90 backdrop-blur-xl rounded-xl border border-green-500/30 shadow-xl animate-float">
                                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-green-400" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-green-400">Secure</div>
                                    <div className="text-[10px] text-surface-400">256-bit AES</div>
                                </div>
                            </div>
                            <div className="absolute -right-6 top-1/3 hidden lg:flex items-center gap-2 px-4 py-3 bg-surface-900/90 backdrop-blur-xl rounded-xl border border-yellow-500/30 shadow-xl animate-float" style={{ animationDelay: '0.5s' }}>
                                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-yellow-400">Instant</div>
                                    <div className="text-[10px] text-surface-400">Local Processing</div>
                                </div>
                            </div>
                            <div className="absolute -right-4 bottom-1/4 hidden lg:flex items-center gap-2 px-4 py-3 bg-surface-900/90 backdrop-blur-xl rounded-xl border border-purple-500/30 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-purple-400">40+ Tools</div>
                                    <div className="text-[10px] text-surface-400">All-in-One</div>
                                </div>
                            </div>
                        </div>

                        {/* Scroll indicator */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                            <ChevronDown className="w-8 h-8 text-surface-500" />
                        </div>
                    </div>
                </section>

                {/* Trust Signals Bar - Colorful */}
                <section className="py-12 bg-gradient-to-r from-surface-900/80 via-surface-950 to-surface-900/80 border-y border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {trustSignals.map((signal, i) => (
                                <div key={i} className="text-center group">
                                    <div className="flex items-center justify-center gap-3 mb-2">
                                        <signal.icon className={`w-6 h-6 ${signal.color} group-hover:scale-110 transition-transform`} />
                                        <div className={`text-4xl md:text-5xl font-black ${signal.color}`}>{signal.stat}</div>
                                    </div>
                                    <div className="text-sm text-surface-400 font-medium">{signal.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section - Colorful Cards */}
                <section className="py-24 lg:py-32 relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-600/10 rounded-full blur-[200px] pointer-events-none" />

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-400 text-sm font-bold uppercase tracking-wide mb-4">
                                <Sparkles className="w-4 h-4" />
                                Why Choose PDF PhD
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                                Everything You Need,
                                <br />
                                <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                                    Nothing You Don't
                                </span>
                            </h2>
                            <p className="text-xl text-surface-400 max-w-2xl mx-auto">
                                The most powerful PDF toolkit that respects your privacy. Everything runs locally in your browser.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, i) => (
                                <div
                                    key={i}
                                    className="group relative p-8 rounded-3xl bg-surface-900/50 border border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden"
                                >
                                    {/* Hover glow */}
                                    <div className={`absolute inset-0 ${feature.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />

                                    <div className="relative">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                                            <feature.icon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                                        <p className="text-surface-400 leading-relaxed text-lg">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Tools Grid Section - Gradient Cards */}
                <section className="py-24 lg:py-32 bg-gradient-to-b from-surface-900/50 to-transparent relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-bold uppercase tracking-wide mb-4">
                                <Rocket className="w-4 h-4" />
                                40+ PDF Tools
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                                One Toolkit,
                                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Endless Possibilities</span>
                            </h2>
                            <p className="text-xl text-surface-400 max-w-2xl mx-auto">
                                Everything you need to work with PDFs, all in one secure place.
                            </p>
                        </div>

                        {/* Featured Tools */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
                            {featuredTools.slice(0, 8).map((tool, index) => (
                                <Link
                                    key={tool.id}
                                    to={`/tools/${tool.slug}`}
                                    className="group p-6 rounded-2xl bg-surface-900/80 border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div
                                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.bgGradient} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
                                    >
                                        <tool.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                                        {tool.shortName}
                                    </h3>
                                    <p className="text-surface-400 line-clamp-2">
                                        {tool.description}
                                    </p>
                                </Link>
                            ))}
                        </div>

                        {/* View All Tools CTA */}
                        <div className="text-center">
                            <Link
                                to="/tools"
                                className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 text-white font-bold rounded-2xl border border-purple-500/30 hover:border-purple-500/50 transition-all"
                            >
                                View All 40+ Tools
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-24 lg:py-32 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-bold uppercase tracking-wide mb-4">
                                <Zap className="w-4 h-4" />
                                How It Works
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                                Simple as
                                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> 1-2-3</span>
                            </h2>
                            <p className="text-xl text-surface-400 max-w-2xl mx-auto">
                                No signup. No installation. Just drag, drop, and done.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                            {[
                                { step: 1, title: "Upload Your File", description: "Drag and drop your PDF or document. All processing happens locally in your browser.", icon: FileUp, gradient: "from-blue-500 to-cyan-500" },
                                { step: 2, title: "Edit & Transform", description: "Use any of our 40+ tools to merge, split, convert, sign, edit, or enhance your document.", icon: Sparkles, gradient: "from-purple-500 to-pink-500" },
                                { step: 3, title: "Download Instantly", description: "Get your processed file immediately. No waiting for uploads or server processing.", icon: Check, gradient: "from-green-500 to-emerald-500" }
                            ].map((item) => (
                                <div key={item.step} className="text-center group">
                                    <div className="relative inline-flex mb-8">
                                        <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                            <item.icon className="w-12 h-12 text-white" />
                                        </div>
                                        <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white font-black text-lg shadow-xl border-4 border-surface-950`}>
                                            {item.step}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                                    <p className="text-surface-400 leading-relaxed text-lg">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials/Social Proof */}
                <section className="py-24 lg:py-32 bg-gradient-to-b from-surface-900/50 to-transparent">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-bold uppercase tracking-wide mb-4">
                                <Star className="w-4 h-4" />
                                Testimonials
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                                Loved by
                                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"> Thousands</span>
                            </h2>
                            <p className="text-xl text-surface-400">
                                Join professionals who trust PDF PhD for their document needs.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { name: "Sarah Mitchell", role: "Legal Assistant", review: "The redaction tool saved me hours of work. Everything runs locally which is crucial for our confidential documents.", rating: 5, avatar: "SM" },
                                { name: "James Kim", role: "Freelance Designer", review: "Best PDF converter I've used. The high-fidelity conversions preserve my layouts perfectly every time.", rating: 5, avatar: "JK" },
                                { name: "Maria Lopez", role: "Small Business Owner", review: "Finally a free PDF tool that doesn't require uploading files to some random server. Fast and secure!", rating: 5, avatar: "ML" }
                            ].map((testimonial, i) => (
                                <div key={i} className="group p-8 rounded-3xl bg-surface-900/80 border border-white/5 hover:border-yellow-500/30 transition-all duration-300">
                                    <div className="flex items-center gap-1 mb-6">
                                        {Array(testimonial.rating).fill(0).map((_, j) => (
                                            <Star key={j} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-lg text-surface-300 leading-relaxed mb-8">"{testimonial.review}"</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                            {testimonial.avatar}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{testimonial.name}</div>
                                            <div className="text-sm text-surface-500">{testimonial.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 lg:py-32">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 text-pink-400 text-sm font-bold uppercase tracking-wide mb-4">
                                <MessageCircle className="w-4 h-4" />
                                FAQ
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                                Got Questions?
                            </h2>
                            <p className="text-xl text-surface-400">
                                Everything you need to know about PDF PhD.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {landingFAQs.map((faq, i) => (
                                <details
                                    key={i}
                                    className="group p-6 rounded-2xl bg-surface-900/80 border border-white/5 hover:border-pink-500/30 transition-all"
                                >
                                    <summary className="flex items-center justify-between cursor-pointer list-none">
                                        <h3 className="text-lg font-bold text-white pr-8">{faq.question}</h3>
                                        <ChevronDown className="w-5 h-5 text-pink-400 group-open:rotate-180 transition-transform" />
                                    </summary>
                                    <p className="mt-4 text-surface-400 leading-relaxed">{faq.answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA Section - Stunning Gradient */}
                <section className="py-24 lg:py-32 relative overflow-hidden">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 via-purple-900/50 to-pink-900/50" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.2),transparent_50%)]" />

                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-6 animate-pulse" />
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
                            Ready to Transform
                            <br />
                            <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Your PDF Workflow?
                            </span>
                        </h2>
                        <p className="text-xl text-surface-300 mb-12 max-w-2xl mx-auto">
                            Join thousands of users who trust PDF PhD for fast, secure, and professional PDF editing.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                            <Link
                                to="/workplace"
                                className="group relative flex items-center gap-3 px-10 py-5 text-lg font-bold rounded-2xl transition-all duration-300 overflow-hidden bg-white text-surface-900 hover:scale-105 shadow-2xl shadow-white/20"
                            >
                                <Zap className="w-6 h-6" />
                                Start Free — No Signup Required
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <p className="mt-8 text-sm text-surface-400">
                            ✓ No file uploads &nbsp;&nbsp; ✓ Works offline &nbsp;&nbsp; ✓ 100% free forever
                        </p>
                    </div>
                </section>
            </Layout>
        </>
    );
}

export default Landing;
