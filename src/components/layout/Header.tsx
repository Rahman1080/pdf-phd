// Global Header Component with Navigation - Premium Design (Free & Simple)
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Menu, X, ChevronDown, FileText, Scissors, Merge, Lock,
    FileUp, Signature, EyeOff, Hash, ScanText, Palette, Zap,
    BookOpen, HelpCircle, Sparkles
} from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    children?: NavItem[];
}

const toolCategories = [
    {
        category: 'Organize',
        items: [
            { label: 'Merge PDF', href: '/tools/merge', icon: Merge },
            { label: 'Split PDF', href: '/tools/split', icon: Scissors },
            { label: 'Reorder Pages', href: '/tools/reorder', icon: FileText },
            { label: 'Rotate Pages', href: '/tools/rotate', icon: FileText },
        ]
    },
    {
        category: 'Convert',
        items: [
            { label: 'Word to PDF', href: '/tools/convert/word-to-pdf', icon: FileUp },
            { label: 'Excel to PDF', href: '/tools/convert/excel-to-pdf', icon: FileUp },
            { label: 'Image to PDF', href: '/tools/convert/image-to-pdf', icon: FileUp },
            { label: 'PDF to Word', href: '/tools/convert/pdf-to-word', icon: FileText },
        ]
    },
    {
        category: 'Security',
        items: [
            { label: 'Protect PDF', href: '/tools/protect', icon: Lock },
            { label: 'Redact PDF', href: '/tools/redact', icon: EyeOff },
            { label: 'Sign PDF', href: '/tools/sign', icon: Signature },
        ]
    },
    {
        category: 'Edit & Enhance',
        items: [
            { label: 'Edit Text', href: '/tools/edit', icon: Palette },
            { label: 'Bates Numbering', href: '/tools/bates', icon: Hash },
            { label: 'OCR', href: '/tools/ocr', icon: ScanText },
            { label: 'Watermark', href: '/tools/watermark', icon: FileText },
        ]
    }
];

const navigation: NavItem[] = [
    { label: 'Workplace', href: '/workplace', icon: Zap },
    {
        label: 'Tools',
        href: '/tools',
        icon: FileText,
        children: toolCategories.flatMap(cat => cat.items)
    },
    { label: 'Blog', href: '/blog', icon: BookOpen },
    { label: 'Help', href: '/help', icon: HelpCircle },
];

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (href: string) => {
        if (href === '/') return location.pathname === '/';
        return location.pathname.startsWith(href);
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-surface-950/95 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-black/20'
            : 'bg-surface-950/80 backdrop-blur-md'
            }`}>
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                            <img
                                src="/logo-phd.png"
                                alt="PDF PhD"
                                className="h-10 w-auto rounded-xl relative transition-transform group-hover:scale-110"
                            />
                        </div>
                        <span className="font-bold text-xl text-white hidden sm:block">
                            PDF <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">PhD</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation - ALWAYS VISIBLE */}
                    <div className="nav-desktop">
                        {navigation.map((item) => (
                            <div
                                key={item.label}
                                className="relative"
                                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <Link
                                    to={item.href}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive(item.href)
                                        ? 'bg-gradient-to-r from-primary-500/20 to-purple-500/20 text-white border border-primary-500/30'
                                        : 'text-surface-300 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {item.icon && <item.icon className="w-4 h-4" />}
                                    {item.label}
                                    {item.children && (
                                        <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                                    )}
                                </Link>

                                {/* Dropdown Menu */}
                                {item.children && activeDropdown === item.label && (
                                    <div className="absolute top-full left-0 mt-2 w-80 py-4 bg-surface-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50">
                                        <div className="grid gap-1 px-3">
                                            {toolCategories.map((category) => (
                                                <div key={category.category} className="mb-3">
                                                    <div className="px-3 py-1.5 text-[10px] font-black text-primary-400 uppercase tracking-wider flex items-center gap-2">
                                                        <Sparkles className="w-3 h-3" />
                                                        {category.category}
                                                    </div>
                                                    {category.items.map((tool) => (
                                                        <Link
                                                            key={tool.href}
                                                            to={tool.href}
                                                            onClick={() => setActiveDropdown(null)}
                                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-surface-300 hover:text-white hover:bg-gradient-to-r hover:from-primary-500/10 hover:to-purple-500/10 transition-all group"
                                                        >
                                                            {tool.icon && <tool.icon className="w-4 h-4 text-primary-400 group-hover:scale-110 transition-transform" />}
                                                            {tool.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-2 mx-3 pt-3 border-t border-white/10">
                                            <Link
                                                to="/tools"
                                                onClick={() => setActiveDropdown(null)}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-primary-500/20 to-purple-500/20 text-primary-400 hover:from-primary-500/30 hover:to-purple-500/30 transition-all"
                                            >
                                                View All 40+ Tools
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="header-actions">
                        <Link
                            to="/workplace"
                            className="cta-btn group relative flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 opacity-100" />
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                            <Zap className="w-4 h-4 relative text-white group-hover:scale-110 transition-transform" />
                            <span className="relative text-white">Start Free</span>
                        </Link>

                        {/* Mobile Menu Toggle - hidden on screens wider than 768px */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="mobile-menu-btn p-2.5 text-surface-300 hover:text-white rounded-xl hover:bg-white/10 transition-all border border-white/10"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="mobile-menu bg-surface-950/98 backdrop-blur-xl border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-4 py-6 space-y-2">
                        {navigation.map((item) => (
                            <div key={item.label}>
                                <Link
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-all ${isActive(item.href)
                                        ? 'bg-gradient-to-r from-primary-500/20 to-purple-500/20 text-white border border-primary-500/30'
                                        : 'text-surface-300 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {item.icon && <item.icon className="w-5 h-5 text-primary-400" />}
                                    {item.label}
                                </Link>
                            </div>
                        ))}
                        <div className="pt-4 border-t border-white/10 space-y-3">
                            <Link
                                to="/workplace"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 text-white text-base font-bold rounded-xl shadow-lg shadow-primary-500/25"
                            >
                                <Zap className="w-5 h-5" />
                                Open Editor — Free
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;
