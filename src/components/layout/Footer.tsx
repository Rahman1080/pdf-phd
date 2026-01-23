// Global Footer Component
import { Link } from 'react-router-dom';
import { Twitter, Github, Mail, Heart } from 'lucide-react';

const footerLinks = {
    tools: [
        { label: 'Merge PDF', href: '/tools/merge' },
        { label: 'Split PDF', href: '/tools/split' },
        { label: 'Compress PDF', href: '/tools/compress' },
        { label: 'Word to PDF', href: '/tools/convert/word-to-pdf' },
        { label: 'Excel to PDF', href: '/tools/convert/excel-to-pdf' },
        { label: 'Image to PDF', href: '/tools/convert/image-to-pdf' },
        { label: 'PDF to Word', href: '/tools/convert/pdf-to-word' },
        { label: 'View All Tools', href: '/tools' },
    ],
    features: [
        { label: 'Edit PDF', href: '/tools/edit' },
        { label: 'Sign PDF', href: '/tools/sign' },
        { label: 'Protect PDF', href: '/tools/protect' },
        { label: 'Redact PDF', href: '/tools/redact' },
        { label: 'Bates Numbering', href: '/tools/bates' },
        { label: 'OCR', href: '/tools/ocr' },
        { label: 'Watermark', href: '/tools/watermark' },
        { label: 'Page Numbers', href: '/tools/page-numbers' },
    ],
    resources: [
        { label: 'Blog', href: '/blog' },
        { label: 'Help Center', href: '/help' },
        { label: 'Documentation', href: '/docs' },
        { label: 'Tutorials', href: '/tutorials' },
        { label: 'API', href: '/api' },
    ],
    company: [
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Sitemap', href: '/sitemap' },
    ]
};

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-surface-950 border-t border-white/5">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
                        <Link to="/" className="flex items-center gap-3 mb-4">
                            <img
                                src="/logo-phd.png"
                                alt="PDF PhD"
                                className="h-12 w-auto rounded-xl"
                            />
                            <div>
                                <span className="font-bold text-lg text-white block">
                                    PDF <span className="text-primary-400">PhD</span>
                                </span>
                                <span className="text-[10px] text-surface-500 uppercase tracking-wider">
                                    Professional PDF Tools
                                </span>
                            </div>
                        </Link>
                        <p className="text-sm text-surface-400 leading-relaxed mb-6">
                            Fast, secure PDF tools that run 100% locally in your browser.
                            No uploads, no cloud servers — complete privacy guaranteed.
                        </p>
                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            <a
                                href="https://twitter.com/pdfphd"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/5 hover:bg-primary-500/20 rounded-xl text-surface-400 hover:text-primary-400 transition-all"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="https://github.com/pdfphd"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-surface-400 hover:text-white transition-all"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                            <a
                                href="mailto:support@pdfphd.com"
                                className="p-2 bg-white/5 hover:bg-primary-500/20 rounded-xl text-surface-400 hover:text-primary-400 transition-all"
                            >
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Tools Column */}
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">
                            PDF Tools
                        </h3>
                        <ul className="space-y-2.5">
                            {footerLinks.tools.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        to={link.href}
                                        className="text-sm text-surface-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Features Column */}
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">
                            Features
                        </h3>
                        <ul className="space-y-2.5">
                            {footerLinks.features.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        to={link.href}
                                        className="text-sm text-surface-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">
                            Resources
                        </h3>
                        <ul className="space-y-2.5">
                            {footerLinks.resources.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        to={link.href}
                                        className="text-sm text-surface-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">
                            Company
                        </h3>
                        <ul className="space-y-2.5">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        to={link.href}
                                        className="text-sm text-surface-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-surface-500">
                            © {currentYear} PDF PhD. All rights reserved.
                        </p>
                        <p className="text-sm text-surface-500 flex items-center gap-1">
                            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for productivity
                        </p>
                        <div className="flex items-center gap-4">
                            <Link to="/privacy" className="text-sm text-surface-500 hover:text-white transition-colors">
                                Privacy
                            </Link>
                            <Link to="/terms" className="text-sm text-surface-500 hover:text-white transition-colors">
                                Terms
                            </Link>
                            <Link to="/sitemap" className="text-sm text-surface-500 hover:text-white transition-colors">
                                Sitemap
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="border-t border-white/5 bg-surface-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-surface-500">
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span>100% Secure</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>No File Uploads</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            <span>Works Offline</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>Free Forever</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
