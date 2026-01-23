// Help Center Page
import { Link } from 'react-router-dom';
import {
    Search, BookOpen, MessageCircle, Mail, FileText, Zap,
    ChevronRight, Video, HelpCircle, Users
} from 'lucide-react';
import { Layout, SEOHead, getBreadcrumbSchema } from '../components/layout';

const helpCategories = [
    {
        title: 'Getting Started',
        icon: Zap,
        description: 'Learn the basics of using PDF PhD',
        articles: [
            { title: 'Quick Start Guide', slug: 'quick-start' },
            { title: 'Uploading Your First PDF', slug: 'upload-pdf' },
            { title: 'Understanding the Workplace Editor', slug: 'workplace-overview' },
            { title: 'Exporting Your Document', slug: 'export-document' },
        ]
    },
    {
        title: 'PDF Tools',
        icon: FileText,
        description: 'Learn how to use each PDF tool',
        articles: [
            { title: 'Merging PDF Files', slug: 'merging-pdfs' },
            { title: 'Splitting Documents', slug: 'splitting-pdfs' },
            { title: 'Converting Files to PDF', slug: 'converting-to-pdf' },
            { title: 'Adding Signatures', slug: 'adding-signatures' },
        ]
    },
    {
        title: 'Account & Billing',
        icon: Users,
        description: 'Manage your account and subscription',
        articles: [
            { title: 'Creating an Account', slug: 'create-account' },
            { title: 'Managing Subscription', slug: 'manage-subscription' },
            { title: 'Billing FAQ', slug: 'billing-faq' },
            { title: 'Cancellation Policy', slug: 'cancellation' },
        ]
    },
    {
        title: 'Troubleshooting',
        icon: HelpCircle,
        description: 'Solve common issues and problems',
        articles: [
            { title: 'File Upload Issues', slug: 'upload-issues' },
            { title: 'Conversion Problems', slug: 'conversion-problems' },
            { title: 'Export Errors', slug: 'export-errors' },
            { title: 'Browser Compatibility', slug: 'browser-compatibility' },
        ]
    }
];

const popularArticles = [
    { title: 'How to merge multiple PDFs into one', views: '12.5K' },
    { title: 'Converting Word documents to PDF', views: '8.3K' },
    { title: 'Adding electronic signatures', views: '6.7K' },
    { title: 'Reducing PDF file size', views: '5.2K' },
    { title: 'Extracting pages from a PDF', views: '4.8K' },
];

export function HelpCenter() {
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: 'https://pdfphd.com' },
        { name: 'Help Center', url: 'https://pdfphd.com/help' }
    ]);

    return (
        <>
            <SEOHead
                title="Help Center - Support & Documentation"
                description="Get help with PDF PhD. Find answers to common questions, tutorials, and documentation for all PDF tools."
                keywords={['pdf help', 'pdf support', 'pdf tutorials', 'pdf documentation', 'how to use pdf tools']}
                canonical="https://pdfphd.com/help"
                schema={breadcrumbSchema}
            />

            <Layout>
                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        How can we help?
                    </h1>
                    <p className="text-lg text-surface-400 max-w-2xl mx-auto mb-8">
                        Search our knowledge base or browse categories below.
                    </p>

                    {/* Search */}
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                        <input
                            type="text"
                            placeholder="Search for help articles..."
                            className="w-full pl-12 pr-4 py-4 bg-surface-900 border border-white/10 rounded-2xl text-white placeholder:text-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all text-lg"
                        />
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {[
                        { icon: BookOpen, label: 'Documentation', href: '/docs' },
                        { icon: Video, label: 'Video Tutorials', href: '/tutorials' },
                        { icon: MessageCircle, label: 'Community', href: '/community' },
                        { icon: Mail, label: 'Contact Support', href: '/contact' },
                    ].map((item) => (
                        <Link
                            key={item.label}
                            to={item.href}
                            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-surface-900 border border-white/5 hover:border-white/15 transition-all group"
                        >
                            <item.icon className="w-8 h-8 text-primary-400 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-white">{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Categories */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6">Browse by Category</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {helpCategories.map((category) => (
                            <div
                                key={category.title}
                                className="p-6 rounded-2xl bg-surface-900 border border-white/5"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                                        <category.icon className="w-6 h-6 text-primary-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{category.title}</h3>
                                        <p className="text-sm text-surface-400">{category.description}</p>
                                    </div>
                                </div>
                                <ul className="space-y-2">
                                    {category.articles.map((article) => (
                                        <li key={article.slug}>
                                            <Link
                                                to={`/help/${article.slug}`}
                                                className="flex items-center justify-between py-2 px-3 rounded-lg text-sm text-surface-300 hover:text-white hover:bg-white/5 transition-colors group"
                                            >
                                                {article.title}
                                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to={`/help/category/${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="inline-flex items-center gap-1 mt-4 text-sm text-primary-400 hover:text-primary-300 font-medium"
                                >
                                    View all articles <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Popular Articles */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6">Popular Articles</h2>
                    <div className="bg-surface-900 rounded-2xl border border-white/5 overflow-hidden">
                        {popularArticles.map((article, i) => (
                            <Link
                                key={article.title}
                                to={`/help/${article.title.toLowerCase().replace(/\s+/g, '-')}`}
                                className={`flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${i !== popularArticles.length - 1 ? 'border-b border-white/5' : ''
                                    }`}
                            >
                                <span className="text-surface-300 hover:text-white">{article.title}</span>
                                <span className="text-xs text-surface-500">{article.views} views</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="text-center py-12 px-8 rounded-3xl bg-gradient-to-br from-primary-900/30 to-purple-900/20 border border-white/5">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Still need help?
                    </h2>
                    <p className="text-surface-400 mb-8 max-w-md mx-auto">
                        Can't find what you're looking for? Our support team is here to help.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-surface-900 font-bold rounded-xl hover:scale-105 transition-transform"
                        >
                            <Mail className="w-5 h-5" />
                            Contact Support
                        </Link>
                        <Link
                            to="/community"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/15 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Join Community
                        </Link>
                    </div>
                </section>
            </Layout>
        </>
    );
}

export default HelpCenter;
