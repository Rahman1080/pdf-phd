// Templates Panel - Pre-built document templates
import React, { useState } from 'react';
import {
    X, FileText, Briefcase, Receipt, FileSignature, User, Building,
    GraduationCap, Heart, Plane, Search, Download, Eye, Star, Lock, BookOpen
} from 'lucide-react';

interface Template {
    id: string;
    name: string;
    category: string;
    icon: React.ReactNode;
    description: string;
    pages: number;
    popular?: boolean;
}

interface TemplatesPanelProps {
    onClose: () => void;
    onSelectTemplate: (templateId: string) => void;
}

const TEMPLATES: Template[] = [
    { id: 'contract', name: 'Business Contract', category: 'Business', icon: <FileSignature className="w-6 h-6" />, description: 'Standard business agreement with legal clauses', pages: 3, popular: true },
    { id: 'nda', name: 'Non-Disclosure Agreement', category: 'Business', icon: <Lock className="w-6 h-6" />, description: 'Mutual confidentiality and data protection agreement', pages: 2, popular: true },
    { id: 'invoice', name: 'Professional Invoice', category: 'Business', icon: <Receipt className="w-6 h-6" />, description: 'Modern invoice with tax and payment terms', pages: 1, popular: true },
    { id: 'offer-letter', name: 'Employment Offer', category: 'Business', icon: <User className="w-6 h-6" />, description: 'Official job offer letter with standard terms', pages: 2, popular: true },
    { id: 'proposal', name: 'Project Proposal', category: 'Business', icon: <Briefcase className="w-6 h-6" />, description: 'Detailed project scope and investment outline', pages: 4 },
    { id: 'letterhead', name: 'Executive Letterhead', category: 'Business', icon: <Building className="w-6 h-6" />, description: 'Minimalist corporate letterhead design', pages: 1 },
    { id: 'press-release', name: 'Press Release', category: 'Business', icon: <FileText className="w-6 h-6" />, description: 'Official media announcement template', pages: 1 },
    { id: 'meeting-minutes', name: 'Meeting Minutes', category: 'Business', icon: <BookOpen className="w-6 h-6" />, description: 'Professional summary of meeting discussions and actions', pages: 2 },
    { id: 'strategic-plan', name: 'Strategic Plan', category: 'Business', icon: <Briefcase className="w-6 h-6" />, description: 'Core business strategy and goals roadmap', pages: 5 },

    // Personal
    { id: 'resume', name: 'Modern Resume/CV', category: 'Personal', icon: <User className="w-6 h-6" />, description: 'Multi-section professional career history', pages: 2, popular: true },
    { id: 'cover-letter', name: 'Cover Letter', category: 'Personal', icon: <FileText className="w-6 h-6" />, description: 'Persuasive job application introduction', pages: 1 },
    { id: 'expense-track', name: 'Expense Tracker', category: 'Personal', icon: <Receipt className="w-6 h-6" />, description: 'Personal budget and spending log', pages: 1 },
    { id: 'gift-cert', name: 'Gift Certificate', category: 'Personal', icon: <Star className="w-6 h-6" />, description: 'Customizable gift voucher with value and terms', pages: 1 },
    { id: 'invitation', name: 'Event Invitation', category: 'Personal', icon: <Plane className="w-6 h-6" />, description: 'Elegant invitation for parties and events', pages: 1 },
    { id: 'membership', name: 'Membership Form', category: 'Personal', icon: <User className="w-6 h-6" />, description: 'Sign-up form for clubs or organizations', pages: 1 },

    // Legal
    { id: 'lease', name: 'Rental Agreement', category: 'Legal', icon: <Building className="w-6 h-6" />, description: 'Residential lease with terms and conditions', pages: 4, popular: true },
    { id: 'power-attorney', name: 'Power of Attorney', category: 'Legal', icon: <FileSignature className="w-6 h-6" />, description: 'Legal designation of representative authority', pages: 2 },
    { id: 'will', name: 'Last Will & Testament', category: 'Legal', icon: <FileText className="w-6 h-6" />, description: 'Secure document for estate planning', pages: 3 },
    { id: 'partnership-agreement', name: 'Partnership Agreement', category: 'Legal', icon: <FileSignature className="w-6 h-6" />, description: 'Legal terms for business partners', pages: 6 },
    { id: 'consulting-agreement', name: 'Consulting Service', category: 'Legal', icon: <Briefcase className="w-6 h-6" />, description: 'Professional consulting terms and fees', pages: 4 },
    { id: 'affidavit', name: 'Sworn Affidavit', category: 'Legal', icon: <FileText className="w-6 h-6" />, description: 'Formal sworn statement for legal use', pages: 2 },

    // Education
    { id: 'certificate', name: 'Award Certificate', category: 'Education', icon: <GraduationCap className="w-6 h-6" />, description: 'Elegant diploma or achievement award', pages: 1, popular: true },
    { id: 'syllabus', name: 'Course Syllabus', category: 'Education', icon: <BookOpen className="w-6 h-6" />, description: 'Educational curriculum and schedule', pages: 2 },
    { id: 'report-card', name: 'Student Report', category: 'Education', icon: <FileText className="w-6 h-6" />, description: 'Academic performance and grade tracking', pages: 1 },
    { id: 'lesson-plan', name: 'Lesson Plan', category: 'Education', icon: <BookOpen className="w-6 h-6" />, description: 'Structured teaching guide and objectives', pages: 2 },
    { id: 'transcript', name: 'Academic Transcript', category: 'Education', icon: <GraduationCap className="w-6 h-6" />, description: 'Official record of courses and grades', pages: 1 },

    // Healthcare
    { id: 'medical-history', name: 'Medical History', category: 'Healthcare', icon: <Heart className="w-6 h-6" />, description: 'Comprehensive patient health record', pages: 2, popular: true },
    { id: 'treatment-consent', name: 'Consent Form', category: 'Healthcare', icon: <FileSignature className="w-6 h-6" />, description: 'Informed consent for medical procedures', pages: 1 },
    { id: 'prescription', name: 'Medical Prescription', category: 'Healthcare', icon: <FileText className="w-6 h-6" />, description: 'Official doctor prescription template', pages: 1 },
    { id: 'medical-report', name: 'Clinical Report', category: 'Healthcare', icon: <Heart className="w-6 h-6" />, description: 'Professional medical diagnosis summary', pages: 2 },

    // Travel
    { id: 'itinerary', name: 'Travel Itinerary', category: 'Travel', icon: <Plane className="w-6 h-6" />, description: 'Detailed trip schedule and logistics', pages: 2, popular: true },
    { id: 'travel-consent', name: 'Minor Travel Consent', category: 'Travel', icon: <FileSignature className="w-6 h-6" />, description: 'Authorization for children traveling alone', pages: 1 },
    { id: 'packing-list', name: 'Packing List', category: 'Travel', icon: <Receipt className="w-6 h-6" />, description: 'Essential travel checklist and inventory', pages: 1 },
    { id: 'visa-support', name: 'Visa Support Letter', category: 'Travel', icon: <FileText className="w-6 h-6" />, description: 'Sponsorship letter for visa applications', pages: 1 },

];

const CATEGORIES = ['All', 'Business', 'Personal', 'Legal', 'Education', 'Healthcare', 'Travel'];

export function TemplatesPanel({ onClose, onSelectTemplate }: TemplatesPanelProps) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    // Close on Escape key
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (previewTemplate) {
                    setPreviewTemplate(null);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, previewTemplate]);

    const filtered = TEMPLATES.filter(t => {
        const matchesCategory = category === 'All' || t.category === category;
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.description.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const popular = TEMPLATES.filter(t => t.popular);

    return (
        <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={onClose}>
            <div
                className="modal !max-w-4xl h-[700px] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Document Templates</h2>
                            <p className="text-surface-400 text-sm">Start with a professional template</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-surface-400" />
                    </button>
                </div>

                {/* Search & Categories */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/50"
                        />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${category === cat
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white/5 text-surface-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Popular Section */}
                {category === 'All' && !search && (
                    <div className="mb-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                            <Star className="w-4 h-4" /> Popular Templates
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                            {popular.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => onSelectTemplate(t.id)}
                                    className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left hover:bg-amber-500/20 transition-all group"
                                >
                                    <div className="text-amber-400 mb-2">{t.icon}</div>
                                    <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">{t.name}</div>
                                    <div className="text-xs text-surface-500">{t.pages} page{t.pages > 1 ? 's' : ''}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Templates Grid */}
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-3 gap-4">
                        {filtered.map(template => (
                            <div
                                key={template.id}
                                className="group p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-emerald-500/30 hover:bg-white/[0.08] transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                        {template.icon}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500 bg-white/5 px-2 py-1 rounded">
                                        {template.category}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1">{template.name}</h4>
                                <p className="text-xs text-surface-400 mb-4 line-clamp-2">{template.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-surface-500">{template.pages} page{template.pages > 1 ? 's' : ''}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPreviewTemplate(template)}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-surface-400 hover:text-white transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onSelectTemplate(template.id)}
                                            className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview Modal */}
                {previewTemplate && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-8" onClick={() => setPreviewTemplate(null)}>
                        <div className="bg-surface-900 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">{previewTemplate.name}</h3>
                                <button onClick={() => setPreviewTemplate(null)} className="p-1 hover:bg-white/10 rounded">
                                    <X className="w-5 h-5 text-surface-400" />
                                </button>
                            </div>
                            <div className="aspect-[8.5/11] bg-white rounded-lg mb-4 flex items-center justify-center text-surface-400">
                                <div className="text-center">
                                    {previewTemplate.icon}
                                    <p className="mt-2 text-sm">Preview not available</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { onSelectTemplate(previewTemplate.id); setPreviewTemplate(null); }}
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors"
                            >
                                Use Template
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TemplatesPanel;
