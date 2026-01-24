// Contact Page with Form
import { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle, Building, HelpCircle, Bug, Lightbulb, AlertCircle } from 'lucide-react';
import { Layout, SEOHead, getBreadcrumbSchema } from '../components/layout';
import emailjs from '@emailjs/browser';

type ContactReason = 'general' | 'support' | 'enterprise' | 'bug' | 'feature';

const contactReasons = [
    { id: 'general' as ContactReason, label: 'General Inquiry', icon: MessageSquare },
    { id: 'support' as ContactReason, label: 'Technical Support', icon: HelpCircle },
    { id: 'enterprise' as ContactReason, label: 'Enterprise Sales', icon: Building },
    { id: 'bug' as ContactReason, label: 'Report a Bug', icon: Bug },
    { id: 'feature' as ContactReason, label: 'Feature Request', icon: Lightbulb },
];

// EmailJS Configuration - You need to set these up at emailjs.com
// 1. Create free account at https://emailjs.com
// 2. Create email service (connect your gmail)
// 3. Create email template with variables: from_name, from_email, subject, message, reason
// 4. Replace these values with your actual keys
const EMAILJS_SERVICE_ID = 'service_pdfphd'; // Create this at emailjs.com
const EMAILJS_TEMPLATE_ID = 'template_contact'; // Create this at emailjs.com  
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Get this from emailjs.com Account > API Keys

export function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        reason: 'general' as ContactReason,
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: 'https://pdfphd.com' },
        { name: 'Contact', url: 'https://pdfphd.com/contact' }
    ]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Find the reason label
        const reasonLabel = contactReasons.find(r => r.id === formData.reason)?.label || formData.reason;

        try {
            // Try EmailJS first (if configured)
            if (EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
                await emailjs.send(
                    EMAILJS_SERVICE_ID,
                    EMAILJS_TEMPLATE_ID,
                    {
                        from_name: formData.name,
                        from_email: formData.email,
                        subject: formData.subject,
                        message: formData.message,
                        reason: reasonLabel,
                        to_email: 'pdfphd247@gmail.com'
                    },
                    EMAILJS_PUBLIC_KEY
                );
                setIsSubmitted(true);
            } else {
                // Fallback: Open mailto link with pre-filled content
                const mailtoSubject = encodeURIComponent(`[${reasonLabel}] ${formData.subject}`);
                const mailtoBody = encodeURIComponent(
                    `Name: ${formData.name}\nEmail: ${formData.email}\nReason: ${reasonLabel}\n\nMessage:\n${formData.message}`
                );
                const mailtoLink = `mailto:pdfphd247@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

                // Open email client
                window.location.href = mailtoLink;

                // Show success after a brief delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                setIsSubmitted(true);
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send message. Please try emailing us directly at pdfphd247@gmail.com');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    if (isSubmitted) {
        return (
            <>
                <SEOHead
                    title="Contact Us"
                    description="Get in touch with the PDF PhD team. We're here to help with support, enterprise inquiries, or feedback."
                    canonical="https://pdfphd.com/contact"
                    schema={breadcrumbSchema}
                />
                <Layout>
                    <div className="max-w-xl mx-auto text-center py-20">
                        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4">Message Sent!</h1>
                        <p className="text-surface-400 mb-8">
                            Thank you for reaching out. We'll get back to you within 24-48 hours.
                        </p>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="px-6 py-3 bg-surface-800 text-white font-medium rounded-xl hover:bg-surface-700 transition-colors"
                        >
                            Send Another Message
                        </button>
                    </div>
                </Layout>
            </>
        );
    }

    return (
        <>
            <SEOHead
                title="Contact Us - Get in Touch"
                description="Contact the PDF PhD team for support, enterprise inquiries, or feedback. We typically respond within 24-48 hours."
                keywords={['contact pdf phd', 'pdf support', 'enterprise pdf', 'pdf help']}
                canonical="https://pdfphd.com/contact"
                schema={breadcrumbSchema}
            />

            <Layout>
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-8 h-8 text-primary-400" />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-4">Get in Touch</h1>
                        <p className="text-lg text-surface-400 max-w-xl mx-auto">
                            Have a question, feedback, or need help? We'd love to hear from you.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <div className="md:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                <div>
                                    <h2 className="font-bold text-white mb-4">Contact Options</h2>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl bg-surface-900 border border-white/5">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Mail className="w-5 h-5 text-primary-400" />
                                                <span className="font-medium text-white">Email</span>
                                            </div>
                                            <a href="mailto:pdfphd247@gmail.com" className="text-sm text-surface-400 hover:text-primary-400">
                                                pdfphd247@gmail.com
                                            </a>
                                        </div>
                                        <div className="p-4 rounded-xl bg-surface-900 border border-white/5">
                                            <div className="flex items-center gap-3 mb-2">
                                                <MessageSquare className="w-5 h-5 text-primary-400" />
                                                <span className="font-medium text-white">Community</span>
                                            </div>
                                            <p className="text-sm text-surface-400">
                                                Join our Discord for quick help
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-white mb-3">Response Time</h3>
                                    <p className="text-sm text-surface-400">
                                        We typically respond within 24-48 hours during business days.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="md:col-span-2">
                            <form onSubmit={handleSubmit} className="p-6 lg:p-8 rounded-2xl bg-surface-900 border border-white/5">
                                {/* Reason Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-surface-400 mb-3">
                                        What can we help you with?
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {contactReasons.map((reason) => (
                                            <button
                                                key={reason.id}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, reason: reason.id }))}
                                                className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${formData.reason === reason.id
                                                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                                    : 'bg-surface-800 text-surface-400 border border-white/5 hover:bg-surface-700'
                                                    }`}
                                            >
                                                <reason.icon className="w-4 h-4" />
                                                <span className="truncate">{reason.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Name & Email */}
                                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-surface-400 mb-2">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-surface-800 border border-white/10 rounded-xl text-white placeholder:text-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-surface-400 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-surface-800 border border-white/10 rounded-xl text-white placeholder:text-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="mb-4">
                                    <label htmlFor="subject" className="block text-sm font-medium text-surface-400 mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-surface-800 border border-white/10 rounded-xl text-white placeholder:text-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20"
                                        placeholder="Brief summary of your inquiry"
                                    />
                                </div>

                                {/* Message */}
                                <div className="mb-6">
                                    <label htmlFor="message" className="block text-sm font-medium text-surface-400 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 bg-surface-800 border border-white/10 rounded-xl text-white placeholder:text-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 resize-none"
                                        placeholder="Tell us more about how we can help..."
                                    />
                                </div>

                                {/* Error Display */}
                                {error && (
                                    <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-red-400 text-sm">{error}</p>
                                            <a
                                                href="mailto:pdfphd247@gmail.com"
                                                className="text-primary-400 hover:underline text-sm mt-1 inline-block"
                                            >
                                                Click here to email directly
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white font-bold rounded-xl transition-colors"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send Message
                                        </>
                                    )}
                                </button>

                                <p className="mt-4 text-xs text-surface-500 text-center">
                                    By submitting this form, you agree to our{' '}
                                    <a href="/privacy" className="text-primary-400 hover:underline">Privacy Policy</a>.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}

export default Contact;
