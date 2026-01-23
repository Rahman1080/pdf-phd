// Blog Index Page - SEO content hub
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { Layout, SEOHead, getBreadcrumbSchema } from '../components/layout';
import { blogPosts, type BlogPost } from '../data/blogPosts';

export type { BlogPost };
export { blogPosts };

const categories = ['All', 'Tutorials', 'Security', 'Conversion', 'Legal', 'Technology', 'Optimization', 'Editing', 'Organization', 'Forms', 'Signatures', 'Mobile', 'Comparison', 'Business', 'Personal', 'Productivity', 'Analysis', 'Extraction'];

export function BlogIndex() {
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: 'https://pdfphd.com' },
        { name: 'Blog', url: 'https://pdfphd.com/blog' }
    ]);

    const featuredPosts = blogPosts.filter(p => p.featured);
    const recentPosts = blogPosts.filter(p => !p.featured);

    return (
        <>
            <SEOHead
                title="PDF Blog - Tips, Tutorials & Best Practices"
                description="Expert guides on PDF editing, conversion, security, and more. Learn how to work with PDFs efficiently with our comprehensive tutorials and tips."
                keywords={[
                    'pdf tips', 'pdf tutorials', 'how to edit pdf', 'pdf guide',
                    'pdf best practices', 'document management', 'pdf security'
                ]}
                canonical="https://pdfphd.com/blog"
                schema={breadcrumbSchema}
            />

            <Layout>
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        PDF PhD Blog
                    </h1>
                    <p className="text-lg text-surface-400 max-w-2xl mx-auto">
                        Expert guides, tutorials, and tips to help you work with PDFs more efficiently.
                    </p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${cat === 'All'
                                ? 'bg-primary-500 text-white'
                                : 'bg-surface-900 text-surface-300 hover:bg-surface-800 hover:text-white border border-white/5'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Featured Posts */}
                {featuredPosts.length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary-500" />
                            Featured Articles
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {featuredPosts.map((post) => (
                                <Link
                                    key={post.slug}
                                    to={`/blog/${post.slug}`}
                                    className="group p-6 rounded-2xl bg-gradient-to-br from-primary-900/30 to-purple-900/20 border border-primary-500/20 hover:border-primary-500/40 transition-all"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1 text-xs font-bold text-primary-400 bg-primary-500/10 rounded-full">
                                            {post.category}
                                        </span>
                                        <span className="text-xs text-surface-500">{post.date}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-400 transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-surface-400 mb-4 line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-xs text-surface-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {post.readTime}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="w-3.5 h-3.5" />
                                                {post.author}
                                            </span>
                                        </div>
                                        <span className="text-primary-400 text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            Read More <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Recent Posts */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-6">Recent Articles</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentPosts.map((post) => (
                            <Link
                                key={post.slug}
                                to={`/blog/${post.slug}`}
                                className="group p-5 rounded-2xl bg-surface-900 border border-white/5 hover:border-white/15 transition-all"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="px-2.5 py-1 text-[10px] font-bold text-surface-300 bg-surface-800 rounded-full uppercase tracking-wider">
                                        {post.category}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-surface-400 mb-4 line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-surface-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {post.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {post.readTime}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Newsletter CTA */}
                <section className="mt-16 text-center py-12 px-8 rounded-3xl bg-surface-900 border border-white/5">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Stay Updated
                    </h2>
                    <p className="text-surface-400 mb-6 max-w-md mx-auto">
                        Get the latest PDF tips, tutorials, and product updates delivered to your inbox.
                    </p>
                    <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 bg-surface-800 border border-white/10 rounded-xl text-white placeholder:text-surface-500 focus:outline-none focus:border-primary-500/50"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors"
                        >
                            Subscribe
                        </button>
                    </form>
                </section>
            </Layout>
        </>
    );
}

export default BlogIndex;
