// Individual Blog Post Page
import { useParams, Link, Navigate } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Layout, SEOHead, getBreadcrumbSchema } from '../components/layout';
import { blogPosts, type BlogPost } from '../data/blogPosts';

// Get blog post by slug
function getBlogPostBySlug(slug: string): BlogPost | undefined {
    return blogPosts.find(post => post.slug === slug);
}

// Get related posts (same category, different post)
function getRelatedPosts(currentPost: BlogPost): BlogPost[] {
    return blogPosts
        .filter(post => post.category === currentPost.category && post.slug !== currentPost.slug)
        .slice(0, 3);
}

export function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const [copied, setCopied] = useState(false);

    const post = getBlogPostBySlug(slug || '');

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    const relatedPosts = getRelatedPosts(post);
    const content = post.content || post.excerpt;

    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: 'https://pdfphd.com' },
        { name: 'Blog', url: 'https://pdfphd.com/blog' },
        { name: post.title, url: `https://pdfphd.com/blog/${post.slug}` }
    ]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <SEOHead
                title={post.title}
                description={post.excerpt}
                keywords={post.tags}
                canonical={`https://pdfphd.com/blog/${post.slug}`}
                ogType="article"
                schema={breadcrumbSchema}
            />

            <Layout>
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <ol className="flex items-center gap-2 text-sm text-surface-400">
                        <li>
                            <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        </li>
                        <li className="text-surface-600">/</li>
                        <li>
                            <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
                        </li>
                        <li className="text-surface-600">/</li>
                        <li className="text-white font-medium line-clamp-1">{post.title}</li>
                    </ol>
                </nav>

                <article className="max-w-3xl mx-auto">
                    {/* Header */}
                    <header className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 text-xs font-bold text-primary-400 bg-primary-500/10 rounded-full">
                                {post.category}
                            </span>
                            <span className="text-sm text-surface-500">{post.date}</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
                            {post.title}
                        </h1>

                        <p className="text-lg text-surface-400 mb-6">
                            {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between py-4 border-y border-white/5">
                            <div className="flex items-center gap-4 text-sm text-surface-400">
                                <span className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {post.author}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {post.readTime}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {post.date}
                                </span>
                            </div>

                            {/* Share buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCopyLink}
                                    className="p-2 text-surface-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                    title="Copy link"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <a
                                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-surface-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                    title="Share on Twitter"
                                >
                                    <Twitter className="w-4 h-4" />
                                </a>
                                <a
                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-surface-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                    title="Share on LinkedIn"
                                >
                                    <Linkedin className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="prose-custom mb-12">
                        {content.split('\n').map((paragraph, i) => {
                            if (paragraph.startsWith('[[CTA:')) {
                                const parts = paragraph.replace('[[CTA:', '').replace(']]', '').split(':');
                                const action = parts[0];
                                const tool = parts[1] || '';
                                const url = tool ? `/workplace?tool=${tool}` : '/workplace';
                                return (
                                    <div key={i} className="my-10 p-8 bg-gradient-to-br from-primary-900/50 to-purple-900/50 border border-primary-500/30 rounded-2xl text-center shadow-2xl">
                                        <h3 className="text-2xl font-bold text-white mb-3">Ready to {action}?</h3>
                                        <p className="text-surface-300 mb-6 text-lg">Use our free, professional-grade tool right now. No registration required.</p>
                                        <Link to={url} className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary-500/25 transform hover:-translate-y-1">
                                            Start {action} Now →
                                        </Link>
                                    </div>
                                );
                            }
                            if (paragraph.startsWith('## ')) {
                                return <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4">{paragraph.replace('## ', '')}</h2>;
                            }
                            if (paragraph.startsWith('### ')) {
                                return <h3 key={i} className="text-xl font-semibold text-white mt-8 mb-3">{paragraph.replace('### ', '')}</h3>;
                            }
                            if (paragraph.startsWith('- ')) {
                                return <li key={i} className="text-surface-300 ml-6 mb-2">{paragraph.replace('- ', '')}</li>;
                            }
                            if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ') || paragraph.startsWith('4. ') || paragraph.startsWith('5. ')) {
                                return <li key={i} className="text-surface-300 ml-6 mb-2 list-decimal">{paragraph.replace(/^\d+\.\s/, '')}</li>;
                            }
                            if (paragraph.trim() === '') {
                                return null;
                            }
                            return <p key={i} className="text-surface-300 leading-relaxed mb-4">{paragraph}</p>;
                        })}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-10">
                        {post.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 text-xs font-medium text-surface-400 bg-surface-900 rounded-full border border-white/5"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* Author Box */}
                    <div className="p-6 rounded-2xl bg-surface-900 border border-white/5 mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                                <User className="w-6 h-6 text-primary-400" />
                            </div>
                            <div>
                                <div className="font-bold text-white">{post.author}</div>
                                <p className="text-sm text-surface-400">Expert guides on PDF editing, conversion, and document management.</p>
                            </div>
                        </div>
                    </div>

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold text-white mb-6">Related Articles</h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                {relatedPosts.map((relPost) => (
                                    <Link
                                        key={relPost.slug}
                                        to={`/blog/${relPost.slug}`}
                                        className="p-4 rounded-xl bg-surface-900 border border-white/5 hover:border-white/15 transition-all group"
                                    >
                                        <span className="text-xs text-primary-400 font-medium">{relPost.category}</span>
                                        <h3 className="text-sm font-bold text-white mt-1 group-hover:text-primary-400 transition-colors line-clamp-2">
                                            {relPost.title}
                                        </h3>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Back to Blog */}
                    <div className="mt-12 pt-8 border-t border-white/5">
                        <Link
                            to="/blog"
                            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Blog
                        </Link>
                    </div>
                </article>
            </Layout>
        </>
    );
}

export default BlogPostPage;
