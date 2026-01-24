// Individual Tool Page Template
import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Check, ChevronDown, Zap, ArrowLeft } from 'lucide-react';
import { Layout, SEOHead, getBreadcrumbSchema, getHowToSchema, getFAQSchema } from '../../components/layout';
import { getToolBySlug, getRelatedTools } from '../../data/tools';
import { ToolInterface } from '../../components/tools/ToolInterface';
import { VisualToolInterface } from '../../components/tools/VisualToolInterface';

export function ToolPage() {
    const { slug, subslug } = useParams<{ slug: string; subslug?: string }>();

    // Scroll to top when tool changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug, subslug]);

    // Handle nested slugs like /tools/convert/word-to-pdf
    const fullSlug = subslug ? `${slug}/${subslug}` : slug;
    const tool = getToolBySlug(fullSlug || '');

    if (!tool) {
        return <Navigate to="/tools" replace />;
    }

    const relatedTools = getRelatedTools(tool);

    // Build schemas
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: 'https://pdfphd.com' },
        { name: 'Tools', url: 'https://pdfphd.com/tools' },
        { name: tool.shortName, url: `https://pdfphd.com/tools/${tool.slug}` }
    ]);

    const howToSchema = getHowToSchema(
        `How to ${tool.name}`,
        tool.metaDescription,
        tool.howItWorks.map(step => ({
            name: step.title,
            text: step.description
        }))
    );

    const faqSchema = tool.faq.length > 0 ? getFAQSchema(tool.faq) : null;

    // Add SoftwareApplication schema for each tool (important for rich results)
    const softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": `PDF PhD - ${tool.name}`,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Web Browser",
        "url": `https://pdfphd.com/tools/${tool.slug}`,
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": tool.metaDescription,
        "featureList": tool.keywords.join(", ")
    };

    const schemas = [breadcrumbSchema, howToSchema, softwareSchema, ...(faqSchema ? [faqSchema] : [])];

    return (
        <>
            <SEOHead
                title={`${tool.name} Online Free - ${tool.description} | PDF PhD`}
                description={`${tool.metaDescription} Use PDF PhD's free ${tool.shortName.toLowerCase()} tool online. No signup, no upload to servers - 100% secure browser processing.`}
                keywords={[...tool.keywords, 'free', 'online', 'no signup', 'secure', 'browser']}
                canonical={`https://pdfphd.com/tools/${tool.slug}`}
                schema={schemas}
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
                            <Link to="/tools" className="hover:text-white transition-colors">Tools</Link>
                        </li>
                        <li className="text-surface-600">/</li>
                        <li className="text-white font-medium">{tool.shortName}</li>
                    </ol>
                </nav>

                {/* Interactive Tool Section - NOW AT THE TOP */}
                <section id="tool-interface" className="min-h-[60vh] flex flex-col justify-center mb-16">
                    {tool.type === 'visual' ? (
                        <VisualToolInterface tool={tool} />
                    ) : (
                        <ToolInterface tool={tool} />
                    )}
                </section>

                {/* SEO Content & Information - Moved Below */}
                <div className="max-w-4xl mx-auto px-4 space-y-24 pb-24">
                    {/* H1 Title - Critical for SEO */}
                    <section>
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-8 text-center">
                            {tool.name} Online Free
                        </h1>
                        <div className="prose prose-invert prose-lg mx-auto">
                            <div className="text-surface-300 leading-relaxed whitespace-pre-line text-center">
                                {tool.longDescription}
                            </div>
                        </div>
                    </section>

                    {/* How It Works */}
                    <section>
                        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
                            How to {tool.name}
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            {tool.howItWorks.map((step, i) => (
                                <div key={i} className="text-center relative group">
                                    {/* Connector line */}
                                    {i < tool.howItWorks.length - 1 && (
                                        <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-white/10 to-transparent group-hover:from-primary-500/50 transition-all" />
                                    )}

                                    <div className="relative inline-flex mb-6 transition-transform group-hover:scale-110 duration-300">
                                        <div
                                            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tool.bgGradient} opacity-20 flex items-center justify-center`}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-3xl font-black text-white">{step.step}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                                    <p className="text-surface-400 leading-relaxed">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Use Cases */}
                {tool.useCases.length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
                            Perfect For
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            {tool.useCases.map((useCase, i) => (
                                <div
                                    key={i}
                                    className="p-6 rounded-2xl bg-surface-900 border border-white/5"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                            <Check className="w-5 h-5 text-green-400" />
                                        </div>
                                        <h3 className="font-bold text-white">{useCase.title}</h3>
                                    </div>
                                    <p className="text-surface-400 text-sm">{useCase.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* FAQ Section */}
                {tool.faq.length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
                            Frequently Asked Questions
                        </h2>

                        <div className="max-w-3xl mx-auto space-y-4">
                            {tool.faq.map((faq, i) => (
                                <details
                                    key={i}
                                    className="group p-5 rounded-2xl bg-surface-900 border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    <summary className="flex items-center justify-between cursor-pointer list-none">
                                        <h3 className="font-bold text-white pr-8">{faq.question}</h3>
                                        <ChevronDown className="w-5 h-5 text-surface-400 group-open:rotate-180 transition-transform shrink-0" />
                                    </summary>
                                    <p className="mt-4 text-surface-400 leading-relaxed">{faq.answer}</p>
                                </details>
                            ))}
                        </div>
                    </section>
                )}

                {/* Related Tools */}
                {relatedTools.length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            Related Tools
                        </h2>

                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {relatedTools.map((relTool) => (
                                <Link
                                    key={relTool.id}
                                    to={`/tools/${relTool.slug}`}
                                    className="group p-5 rounded-2xl bg-surface-900 border border-white/5 hover:border-white/15 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${relTool.bgGradient} flex items-center justify-center group-hover:scale-110 transition-transform`}
                                        >
                                            <relTool.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors">
                                                {relTool.shortName}
                                            </h3>
                                            <p className="text-sm text-surface-500 line-clamp-1">
                                                {relTool.description}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Final CTA */}
                <section className="text-center py-12 px-8 rounded-3xl bg-gradient-to-br from-primary-900/30 to-purple-900/30 border border-white/5">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Ready to {tool.shortName}?
                    </h2>
                    <p className="text-surface-300 mb-8 max-w-xl mx-auto">
                        Start using our {tool.shortName.toLowerCase()} tool now — it's free, fast, and secure.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => document.getElementById('tool-interface')?.scrollIntoView({ behavior: 'smooth' })}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-surface-900 font-bold rounded-2xl hover:scale-105 transition-transform"
                        >
                            <Zap className="w-5 h-5" />
                            Open Tool — Free
                        </button>
                        <Link
                            to="/tools"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 text-white font-medium rounded-2xl hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Browse All Tools
                        </Link>
                    </div>
                </section>
            </Layout>
        </>
    );
}

export default ToolPage;
