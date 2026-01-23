// Privacy Policy Page
import { Shield, Lock, Server, Trash2, Mail } from 'lucide-react';
import { Layout, SEOHead, getBreadcrumbSchema } from '../components/layout';

export function Privacy() {
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: 'https://pdfphd.com' },
        { name: 'Privacy Policy', url: 'https://pdfphd.com/privacy' }
    ]);

    const lastUpdated = 'January 15, 2025';

    return (
        <>
            <SEOHead
                title="Privacy Policy"
                description="PDF PhD Privacy Policy. Learn how we protect your data and ensure your files never leave your device."
                keywords={['privacy policy', 'data protection', 'pdf privacy', 'secure pdf']}
                canonical="https://pdfphd.com/privacy"
                schema={breadcrumbSchema}
            />

            <Layout>
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-green-400" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4">Privacy Policy</h1>
                    <p className="text-surface-400">Last updated: {lastUpdated}</p>
                </div>

                {/* Key Points */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {[
                        { icon: Lock, title: 'Local Processing', desc: 'Your files are processed 100% locally in your browser' },
                        { icon: Server, title: 'No Uploads', desc: 'Files never leave your device or touch our servers' },
                        { icon: Trash2, title: 'No Storage', desc: 'We don\'t store, save, or retain any of your documents' }
                    ].map((item) => (
                        <div key={item.title} className="p-6 rounded-2xl bg-surface-900 border border-white/5 text-center">
                            <item.icon className="w-8 h-8 text-green-400 mx-auto mb-3" />
                            <h3 className="font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-sm text-surface-400">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="max-w-3xl mx-auto prose-custom">
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                        <p className="text-surface-300 leading-relaxed mb-4">
                            At PDF PhD ("we," "our," or "us"), we are committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our PDF tools and services.
                        </p>
                        <p className="text-surface-300 leading-relaxed">
                            <strong className="text-white">The most important thing to know:</strong> PDF PhD is designed to work entirely in your browser. Your files are processed locally on your device and never uploaded to our servers.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>

                        <h3 className="text-lg font-semibold text-white mt-6 mb-3">2.1 Your Documents</h3>
                        <p className="text-surface-300 leading-relaxed mb-4">
                            <strong className="text-green-400">We do NOT collect, access, or store your documents.</strong> All PDF processing happens entirely within your web browser using client-side JavaScript. Your files never leave your device.
                        </p>

                        <h3 className="text-lg font-semibold text-white mt-6 mb-3">2.2 Account Information (Optional)</h3>
                        <p className="text-surface-300 leading-relaxed mb-4">
                            If you choose to create an account, we collect:
                        </p>
                        <ul className="list-disc list-inside text-surface-300 space-y-2 mb-4">
                            <li>Email address</li>
                            <li>Name (optional)</li>
                            <li>Account preferences</li>
                            <li>Subscription status (if applicable)</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-white mt-6 mb-3">2.3 Usage Analytics</h3>
                        <p className="text-surface-300 leading-relaxed">
                            We collect anonymous usage analytics to improve our service, including:
                        </p>
                        <ul className="list-disc list-inside text-surface-300 space-y-2">
                            <li>Pages visited and features used</li>
                            <li>Browser type and device information</li>
                            <li>Geographic region (not precise location)</li>
                            <li>Error logs (to fix bugs)</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Information</h2>
                        <p className="text-surface-300 leading-relaxed mb-4">
                            The limited information we collect is used to:
                        </p>
                        <ul className="list-disc list-inside text-surface-300 space-y-2">
                            <li>Provide and maintain our services</li>
                            <li>Process payments (if you subscribe to paid features)</li>
                            <li>Send important service updates</li>
                            <li>Improve user experience and fix bugs</li>
                            <li>Respond to support requests</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">4. Data Sharing</h2>
                        <p className="text-surface-300 leading-relaxed mb-4">
                            We do not sell, trade, or rent your personal information. We may share data with:
                        </p>
                        <ul className="list-disc list-inside text-surface-300 space-y-2">
                            <li><strong className="text-white">Payment processors</strong> (Stripe) to handle subscriptions</li>
                            <li><strong className="text-white">Analytics providers</strong> (anonymized data only)</li>
                            <li><strong className="text-white">Law enforcement</strong> if legally required</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">5. Cookies</h2>
                        <p className="text-surface-300 leading-relaxed">
                            We use essential cookies for basic functionality (like keeping you logged in) and optional analytics cookies. You can disable non-essential cookies in your browser settings.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
                        <p className="text-surface-300 leading-relaxed mb-4">You have the right to:</p>
                        <ul className="list-disc list-inside text-surface-300 space-y-2">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Delete your account and data</li>
                            <li>Export your data</li>
                            <li>Opt out of marketing communications</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">7. Security</h2>
                        <p className="text-surface-300 leading-relaxed">
                            We implement industry-standard security measures including HTTPS encryption, secure authentication, and regular security audits. However, since your files are processed locally, they benefit from the highest level of security — they never leave your device.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
                        <p className="text-surface-300 leading-relaxed">
                            PDF PhD is not intended for children under 13. We do not knowingly collect information from children under 13 years of age.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Policy</h2>
                        <p className="text-surface-300 leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
                        <p className="text-surface-300 leading-relaxed mb-4">
                            If you have questions about this Privacy Policy, please contact us:
                        </p>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-900 border border-white/5">
                            <Mail className="w-5 h-5 text-primary-400" />
                            <a href="mailto:privacy@pdfphd.com" className="text-primary-400 hover:underline">
                                privacy@pdfphd.com
                            </a>
                        </div>
                    </section>
                </div>
            </Layout>
        </>
    );
}

export default Privacy;
