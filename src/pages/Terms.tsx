// Terms of Service Page
import { Link } from 'react-router-dom';
import { FileText, Mail } from 'lucide-react';
import { Layout, SEOHead, getBreadcrumbSchema } from '../components/layout';

export function Terms() {
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: 'https://pdfphd.com' },
        { name: 'Terms of Service', url: 'https://pdfphd.com/terms' }
    ]);

    const lastUpdated = 'January 15, 2025';

    return (
        <>
            <SEOHead
                title="Terms of Service"
                description="PDF PhD Terms of Service. Read our terms and conditions for using PDF PhD tools and services."
                keywords={['terms of service', 'terms and conditions', 'pdf terms', 'user agreement']}
                canonical="https://pdfphd.com/terms"
                schema={breadcrumbSchema}
            />

            <Layout>
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-8 h-8 text-primary-400" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4">Terms of Service</h1>
                    <p className="text-surface-400">Last updated: {lastUpdated}</p>
                </div>

                {/* Content */}
                <div className="max-w-3xl mx-auto">
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p className="text-surface-300 leading-relaxed mb-4">
                            By accessing or using PDF PhD ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
                        </p>
                        <p className="text-surface-300 leading-relaxed">
                            We reserve the right to modify these Terms at any time. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                        <p className="text-surface-300 leading-relaxed mb-4">
                            PDF PhD provides browser-based PDF tools including but not limited to:
                        </p>
                        <ul className="list-disc list-inside text-surface-300 space-y-2">
                            <li>PDF editing, merging, and splitting</li>
                            <li>Document conversion to and from PDF</li>
                            <li>Digital signatures and form filling</li>
                            <li>OCR (Optical Character Recognition)</li>
                            <li>PDF security and redaction tools</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                        <p className="text-surface-300 leading-relaxed mb-4">
                            Some features may require account registration. You agree to:
                        </p>
                        <ul className="list-disc list-inside text-surface-300 space-y-2">
                            <li>Provide accurate and complete registration information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Accept responsibility for all activities under your account</li>
                            <li>Notify us immediately of any unauthorized access</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">4. Acceptable Use</h2>
                        <p className="text-surface-300 leading-relaxed mb-4">
                            You agree NOT to use the Service to:
                        </p>
                        <ul className="list-disc list-inside text-surface-300 space-y-2 mb-4">
                            <li>Violate any applicable laws or regulations</li>
                            <li>Infringe on intellectual property rights of others</li>
                            <li>Process documents containing illegal content</li>
                            <li>Attempt to reverse-engineer or compromise the Service</li>
                            <li>Use automated systems to access the Service without permission</li>
                            <li>Distribute malware or other harmful content</li>
                        </ul>
                        <p className="text-surface-300 leading-relaxed">
                            We reserve the right to terminate access for violations of these terms.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
                        <p className="text-surface-300 leading-relaxed mb-4">
                            <strong className="text-white">Our Property:</strong> The Service, including its design, code, features, and content, is owned by PDF PhD and protected by intellectual property laws.
                        </p>
                        <p className="text-surface-300 leading-relaxed">
                            <strong className="text-white">Your Content:</strong> You retain all rights to documents you process using the Service. Since processing is done locally in your browser, we have no access to your content.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">6. Subscription and Payments</h2>
                        <p className="text-surface-300 leading-relaxed mb-4">
                            For paid subscriptions:
                        </p>
                        <ul className="list-disc list-inside text-surface-300 space-y-2">
                            <li>Fees are billed in advance on a monthly or annual basis</li>
                            <li>All fees are non-refundable except as required by law</li>
                            <li>We may change pricing with 30 days notice</li>
                            <li>You may cancel at any time; access continues until period end</li>
                            <li>Failed payments may result in service interruption</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">7. Free Tier</h2>
                        <p className="text-surface-300 leading-relaxed">
                            The free tier is provided "as is" and may be modified or discontinued at any time. We make no guarantees about the availability of free features.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimer of Warranties</h2>
                        <p className="text-surface-300 leading-relaxed mb-4">
                            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                        </p>
                        <ul className="list-disc list-inside text-surface-300 space-y-2">
                            <li>Merchantability or fitness for a particular purpose</li>
                            <li>Uninterrupted or error-free operation</li>
                            <li>Accuracy or reliability of any results</li>
                            <li>Correction of defects or errors</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
                        <p className="text-surface-300 leading-relaxed">
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, PDF PHD SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE, ARISING FROM YOUR USE OF THE SERVICE.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">10. Indemnification</h2>
                        <p className="text-surface-300 leading-relaxed">
                            You agree to indemnify and hold harmless PDF PhD and its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">11. Governing Law</h2>
                        <p className="text-surface-300 leading-relaxed">
                            These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts of [Your Jurisdiction].
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-white mb-4">12. Severability</h2>
                        <p className="text-surface-300 leading-relaxed">
                            If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">13. Contact</h2>
                        <p className="text-surface-300 leading-relaxed mb-4">
                            For questions about these Terms of Service:
                        </p>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-900 border border-white/5">
                            <Mail className="w-5 h-5 text-primary-400" />
                            <a href="mailto:legal@pdfphd.com" className="text-primary-400 hover:underline">
                                legal@pdfphd.com
                            </a>
                        </div>
                    </section>

                    {/* Related Links */}
                    <div className="mt-12 pt-8 border-t border-white/5">
                        <p className="text-surface-500 mb-4">Related documents:</p>
                        <div className="flex gap-4">
                            <Link to="/privacy" className="text-primary-400 hover:underline">
                                Privacy Policy
                            </Link>
                            <Link to="/help" className="text-primary-400 hover:underline">
                                Help Center
                            </Link>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}

export default Terms;
