// Tools Index Page - Lists all PDF tools categorized
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Layout, SEOHead, getBreadcrumbSchema } from '../../components/layout';
import { tools, toolCategories, getToolsByCategory, type Tool } from '../../data/tools';

export function ToolsIndex() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTools = useMemo(() => {
        if (!searchQuery.trim()) return tools;
        const query = searchQuery.toLowerCase();
        return tools.filter(tool =>
            tool.name.toLowerCase().includes(query) ||
            tool.shortName.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            tool.keywords.some(k => k.toLowerCase().includes(query))
        );
    }, [searchQuery]);

    const groupedTools = useMemo((): { category: string; description?: string; tools: Tool[] }[] => {
        if (searchQuery.trim()) {
            return [{ category: 'Search Results', tools: filteredTools }];
        }
        return toolCategories.map(cat => ({
            category: cat.name,
            description: cat.description,
            tools: getToolsByCategory(cat.id)
        }));
    }, [filteredTools, searchQuery]);

    // Schema for breadcrumbs
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: 'https://pdfphd.com' },
        { name: 'Tools', url: 'https://pdfphd.com/tools' }
    ]);

    return (
        <>
            <SEOHead
                title="All PDF Tools - Merge, Split, Convert, Sign & More"
                description="Browse our complete collection of 40+ free PDF tools. Merge, split, compress, convert, sign, edit, and protect PDFs - all in your browser with no file uploads."
                keywords={[
                    'pdf tools', 'online pdf tools', 'free pdf tools', 'pdf editor tools',
                    'merge pdf', 'split pdf', 'compress pdf', 'convert pdf', 'sign pdf',
                    'edit pdf', 'pdf toolkit', 'all pdf tools'
                ]}
                canonical="https://pdfphd.com/tools"
                schema={breadcrumbSchema}
            />

            <Layout>
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        All PDF Tools
                    </h1>
                    <p className="text-lg text-surface-400 max-w-2xl mx-auto mb-8">
                        40+ powerful tools to handle all your PDF needs. Fast, secure, and completely free.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                        <input
                            type="text"
                            placeholder="Search tools..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-surface-900 border border-white/10 rounded-2xl text-white placeholder:text-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                    </div>
                </div>

                {/* Quick Access Bar */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {toolCategories.map((cat) => (
                        <a
                            key={cat.id}
                            href={`#${cat.id}`}
                            className="px-4 py-2 bg-surface-900 hover:bg-surface-800 text-surface-300 hover:text-white text-sm font-medium rounded-xl border border-white/5 hover:border-white/10 transition-all"
                        >
                            {cat.name}
                        </a>
                    ))}
                </div>

                {/* Tools by Category */}
                <div className="space-y-16">
                    {groupedTools.map((group) => (
                        <section key={group.category} id={group.category.toLowerCase().replace(/\s+/g, '-')}>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {group.category}
                                </h2>
                                {group.description && (
                                    <p className="text-surface-400">{group.description}</p>
                                )}
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {group.tools.map((tool) => (
                                    <Link
                                        key={tool.id}
                                        to={`/tools/${tool.slug}`}
                                        className="group p-5 rounded-2xl bg-surface-900 border border-white/5 hover:border-white/15 hover:shadow-xl hover:shadow-black/25 transition-all duration-300"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.bgGradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                                            >
                                                <tool.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">
                                                    {tool.shortName}
                                                </h3>
                                                <p className="text-sm text-surface-400 line-clamp-2">
                                                    {tool.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center gap-2 text-sm text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span>Try Now</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* No Results */}
                {searchQuery && filteredTools.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-lg text-surface-400 mb-4">
                            No tools found matching "{searchQuery}"
                        </p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="text-primary-400 hover:text-primary-300 font-medium"
                        >
                            Clear search
                        </button>
                    </div>
                )}

                {/* CTA Section */}
                <section className="mt-20 text-center py-12 px-8 rounded-3xl bg-gradient-to-br from-primary-900/30 to-purple-900/30 border border-white/5">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Need All Tools in One Place?
                    </h2>
                    <p className="text-surface-300 mb-8 max-w-xl mx-auto">
                        Open our Workplace editor for a unified experience with all tools accessible from a single interface.
                    </p>
                    <Link
                        to="/workplace"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-surface-900 font-bold rounded-2xl hover:scale-105 transition-transform"
                    >
                        Open Workplace Editor
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </section>
            </Layout>
        </>
    );
}

export default ToolsIndex;
