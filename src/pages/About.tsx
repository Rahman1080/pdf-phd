// About Page - Company information for trust and SEO
import { Link } from 'react-router-dom';
import {
    Shield, Zap, Globe, Users, Heart, Code,
    ArrowRight, Lock, Check, Award, Sparkles
} from 'lucide-react';
import { Layout, SEOHead, getBreadcrumbSchema, getOrganizationSchema } from '../components/layout';

const companyValues = [
    {
        icon: Shield,
        title: "Privacy First",
        description: "Your files never leave your device. All PDF processing happens locally in your browser, ensuring complete data sovereignty.",
        gradient: "from-green-500 to-emerald-600"
    },
    {
        icon: Zap,
        title: "Lightning Fast",
        description: "No server uploads means instant processing. Experience the speed of native applications right in your browser.",
        gradient: "from-yellow-500 to-orange-600"
    },
    {
        icon: Globe,
        title: "Works Everywhere",
        description: "Access PDF PhD from any device with a modern browser. Works offline after initial load - no internet required.",
        gradient: "from-blue-500 to-cyan-600"
    },
    {
        icon: Heart,
        title: "Free Forever",
        description: "Core features are and always will be free. No hidden costs, no watermarks, no signup required.",
        gradient: "from-pink-500 to-rose-600"
    }
];

const teamStats = [
    { stat: "40+", label: "PDF Tools", icon: Code },
    { stat: "100%", label: "Local Processing", icon: Lock },
    { stat: "0", label: "Files Uploaded", icon: Shield },
    { stat: "1M+", label: "Documents Processed", icon: Users }
];

export function About() {
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: 'https://pdfphd.com' },
        { name: 'About', url: 'https://pdfphd.com/about' }
    ]);

    const organizationSchema = {
        ...getOrganizationSchema(),
        "foundingDate": "2024",
        "slogan": "Professional PDF Tools That Run 100% Locally",
        "description": "PDF PhD is a privacy-first PDF toolkit that processes documents entirely in your browser. No uploads, no servers, no compromise on security."
    };

    return (
        <>
            <SEOHead
                title="About PDF PhD - Privacy-First PDF Tools | Free Online PDF Editor"
                description="Learn about PDF PhD, the privacy-first PDF toolkit. All processing happens locally in your browser - your files never leave your device. Free, fast, and secure."
                keywords={[
                    'about pdf phd', 'pdf editor company', 'privacy first pdf',
                    'local pdf processing', 'browser pdf editor', 'secure pdf tools'
                ]}
                canonical="https://pdfphd.com/about"
                schema={[breadcrumbSchema, organizationSchema]}
            />

            <Layout>
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <ol className="flex items-center gap-2 text-sm text-surface-400">
                        <li>
                            <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        </li>
                        <li className="text-surface-600">/</li>
                        <li className="text-white font-medium">About</li>
                    </ol>
                </nav>

                {/* Hero Section */}
                <section className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-400 text-sm font-bold uppercase tracking-wide mb-6">
                        <Sparkles className="w-4 h-4" />
                        Our Mission
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                        PDF Tools That Respect
                        <br />
                        <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Your Privacy
                        </span>
                    </h1>
                    <p className="text-xl text-surface-300 max-w-3xl mx-auto leading-relaxed">
                        PDF PhD was built with a simple belief: you shouldn't have to upload sensitive documents
                        to unknown servers just to merge a few PDFs. Every tool runs 100% locally in your browser.
                    </p>
                </section>

                {/* Our Story Section */}
                <section className="mb-20">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                            Why We Built PDF PhD
                        </h2>
                        <div className="prose prose-invert prose-lg mx-auto">
                            <div className="text-surface-300 space-y-6 leading-relaxed">
                                <p>
                                    We were frustrated. Every time we needed to merge PDFs, compress documents, or add a signature,
                                    we faced the same dilemma: upload confidential files to servers we didn't control or pay for
                                    expensive desktop software.
                                </p>
                                <p>
                                    That's why we created PDF PhD — a complete PDF toolkit that runs entirely in your browser.
                                    Using modern web technologies like WebAssembly and the PDF.js library, we've built tools that
                                    rival desktop applications in speed and capability, without ever touching your files.
                                </p>
                                <p>
                                    <strong className="text-white">Your files stay on your device.</strong> When you use PDF PhD,
                                    the processing happens locally using your computer's resources. We don't see your documents,
                                    we don't store them, and we can't access them — because they never leave your browser.
                                </p>
                                <p>
                                    Whether you're a legal professional handling confidential contracts, a student organizing research papers,
                                    or a business owner managing invoices, PDF PhD gives you professional-grade tools with
                                    consumer-grade simplicity and enterprise-grade security.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 bg-surface-900/50 rounded-3xl border border-white/5 mb-20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto px-8">
                        {teamStats.map((item, i) => (
                            <div key={i} className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <item.icon className="w-6 h-6 text-primary-400" />
                                    <span className="text-4xl md:text-5xl font-black text-white">{item.stat}</span>
                                </div>
                                <span className="text-surface-400 font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Values Section */}
                <section className="mb-20">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
                        Our Core Values
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {companyValues.map((value, i) => (
                            <div
                                key={i}
                                className="group p-8 rounded-3xl bg-surface-900/50 border border-white/5 hover:border-white/15 transition-all"
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <value.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">{value.title}</h3>
                                <p className="text-surface-400 leading-relaxed text-lg">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Security Promise */}
                <section className="mb-20 max-w-4xl mx-auto">
                    <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/20">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
                                <Shield className="w-8 h-8 text-green-400" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white">Our Security Promise</h2>
                        </div>
                        <div className="space-y-4 text-surface-300">
                            <div className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                                <p><strong className="text-white">100% Local Processing:</strong> Files are processed entirely in your browser using client-side JavaScript and WebAssembly.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                                <p><strong className="text-white">No Server Uploads:</strong> Your documents never leave your device. We physically cannot access your files.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                                <p><strong className="text-white">No Account Required:</strong> Use all features immediately without creating an account or providing personal information.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                                <p><strong className="text-white">Works Offline:</strong> After initial load, PDF PhD functions without an internet connection.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center py-16 px-8 rounded-3xl bg-gradient-to-br from-primary-900/30 to-purple-900/30 border border-white/5">
                    <Award className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Experience the Difference?
                    </h2>
                    <p className="text-xl text-surface-300 mb-8 max-w-2xl mx-auto">
                        Try PDF PhD today. No signup, no uploads, no compromise.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/workplace"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-surface-900 font-bold rounded-2xl hover:scale-105 transition-transform"
                        >
                            <Zap className="w-5 h-5" />
                            Start Free Now
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            to="/tools"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 text-white font-medium rounded-2xl hover:bg-white/15 transition-colors"
                        >
                            Explore All Tools
                        </Link>
                    </div>
                </section>
            </Layout>
        </>
    );
}

export default About;
