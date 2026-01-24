// Community Page - Join PDF PhD Community
import { ExternalLink, MessageCircle, Users, Heart, Zap } from 'lucide-react';
import { Layout, SEOHead, getBreadcrumbSchema } from '../components/layout';

const WHATSAPP_COMMUNITY_LINK = 'https://chat.whatsapp.com/IYrpCm9jsjYG9LWGAQwnhO';

export function Community() {
    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: 'https://pdfphd.com' },
        { name: 'Help', url: 'https://pdfphd.com/help' },
        { name: 'Community', url: 'https://pdfphd.com/community' }
    ]);

    const communityBenefits = [
        {
            icon: Users,
            title: 'Connect with Users',
            description: 'Meet other PDF PhD users, share tips, and learn from the community.'
        },
        {
            icon: Zap,
            title: 'Get Quick Help',
            description: 'Ask questions and get answers from experienced users and our team.'
        },
        {
            icon: Heart,
            title: 'Shape the Future',
            description: 'Share feedback, suggest features, and help us improve PDF PhD.'
        }
    ];

    return (
        <>
            <SEOHead
                title="Join PDF PhD Community - WhatsApp Group"
                description="Join the PDF PhD WhatsApp community. Connect with other users, get help, share tips, and stay updated with the latest features."
                keywords={['pdf phd community', 'pdf help group', 'whatsapp pdf group', 'pdf tools community']}
                canonical="https://pdfphd.com/community"
                schema={breadcrumbSchema}
            />

            <Layout>
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium mb-6">
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp Community
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Join Our Community
                    </h1>
                    <p className="text-lg text-surface-400 max-w-2xl mx-auto">
                        Connect with thousands of PDF PhD users. Get help, share tips,
                        and stay updated with the latest features and announcements.
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                    {/* QR Code Section */}
                    <div className="flex flex-col items-center">
                        <div className="p-6 bg-white rounded-3xl shadow-2xl shadow-green-500/10 mb-6">
                            <img
                                src="/whatsapp-community-qr.jpg"
                                alt="PDF PhD WhatsApp Community QR Code"
                                className="w-64 h-64 md:w-80 md:h-80 object-contain rounded-2xl"
                            />
                        </div>
                        <p className="text-surface-400 text-sm text-center max-w-xs">
                            Scan this QR code with your WhatsApp camera to join the community
                        </p>
                    </div>

                    {/* Info Section */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-white">
                                PDF PhD Community
                            </h2>
                            <p className="text-surface-400 leading-relaxed">
                                Join our official WhatsApp community to connect with fellow PDF enthusiasts,
                                get instant support, share your experience, and be the first to know about
                                new features and updates.
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="space-y-4">
                            {communityBenefits.map((benefit) => (
                                <div
                                    key={benefit.title}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-surface-900 border border-white/5"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                        <benefit.icon className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{benefit.title}</h3>
                                        <p className="text-sm text-surface-400">{benefit.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Join Button */}
                        <a
                            href={WHATSAPP_COMMUNITY_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-3 w-full px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] shadow-lg shadow-green-500/25"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Join WhatsApp Community
                            <ExternalLink className="w-5 h-5" />
                        </a>

                        {/* Direct Link */}
                        <div className="text-center">
                            <p className="text-sm text-surface-500 mb-2">Or copy the link:</p>
                            <code className="text-xs text-green-400 bg-surface-900 px-4 py-2 rounded-lg border border-white/5 break-all">
                                {WHATSAPP_COMMUNITY_LINK}
                            </code>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-3 gap-4 mb-16">
                    {[
                        { value: '500+', label: 'Members' },
                        { value: '24/7', label: 'Active Support' },
                        { value: 'Free', label: 'Forever' }
                    ].map((stat) => (
                        <div key={stat.label} className="text-center p-6 rounded-2xl bg-surface-900 border border-white/5">
                            <div className="text-2xl md:text-3xl font-black text-green-400">{stat.value}</div>
                            <div className="text-sm text-surface-400">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Community Guidelines */}
                <section className="p-8 rounded-3xl bg-surface-900 border border-white/5">
                    <h2 className="text-xl font-bold text-white mb-4">Community Guidelines</h2>
                    <ul className="space-y-3 text-surface-400">
                        <li className="flex items-start gap-3">
                            <span className="text-green-400">✓</span>
                            Be respectful and helpful to other members
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-green-400">✓</span>
                            Share tips, tricks, and useful resources
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-green-400">✓</span>
                            Report bugs and suggest new features
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-red-400">✗</span>
                            No spam, advertising, or off-topic content
                        </li>
                    </ul>
                </section>
            </Layout>
        </>
    );
}

export default Community;
