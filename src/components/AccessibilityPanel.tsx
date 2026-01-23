// Accessibility Tools Panel - PDF/UA features, reading order, alt text
import { useState, useEffect } from 'react';
import {
    X, AlertTriangle, CheckCircle2, Info, Accessibility,
    Languages, FileText, RefreshCw, Download, Settings
} from 'lucide-react';
import type { AccessibilityReport } from '../utils/advancedExports';
import { checkAccessibility, addDocumentLanguage } from '../utils/advancedExports';

interface AccessibilityPanelProps {
    pdfLibDoc: any;
    pdfDoc: any;
    onClose: () => void;
    onApplyFix: (fix: string) => void;
}

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
];

export function AccessibilityPanel({ pdfLibDoc, pdfDoc, onClose, onApplyFix }: AccessibilityPanelProps) {
    const [report, setReport] = useState<AccessibilityReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        runAccessibilityCheck();
    }, [pdfLibDoc, pdfDoc]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const runAccessibilityCheck = async () => {
        setLoading(true);
        try {
            const result = await checkAccessibility(pdfLibDoc);
            setReport(result);
        } catch (e) {
            console.error('Accessibility check failed:', e);
        }
        setLoading(false);
    };

    const handleSetLanguage = async () => {
        try {
            await addDocumentLanguage(pdfLibDoc, selectedLanguage);
            onApplyFix('language');
            runAccessibilityCheck();
        } catch (e) {
            alert('Failed to set language');
        }
    };

    const getScoreColor = (score: number): string => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    const getScoreLabel = (score: number): string => {
        if (score >= 80) return 'Good';
        if (score >= 60) return 'Needs Improvement';
        if (score >= 40) return 'Poor';
        return 'Critical';
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
            default: return <Info className="w-4 h-4 text-blue-400" />;
        }
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={onClose}>
            <div
                className="modal !max-w-2xl h-[700px] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                            <Accessibility className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Accessibility Tools</h2>
                            <p className="text-surface-400 text-sm">PDF/UA compliance and accessibility features</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-2 rounded-xl transition-colors ${showSettings ? 'bg-primary-500/20 text-primary-400' : 'hover:bg-white/10 text-surface-400'}`}
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <X className="w-5 h-5 text-surface-400" />
                        </button>
                    </div>
                </div>

                {/* Score Overview */}
                {report && (
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {/* Overall Score */}
                        <div className="col-span-2 p-6 bg-surface-800/50 rounded-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">Accessibility Score</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-4xl font-black ${getScoreColor(report.score)}`}>
                                            {report.score}
                                        </span>
                                        <span className="text-surface-500">/100</span>
                                    </div>
                                    <p className={`text-sm font-medium ${getScoreColor(report.score)}`}>
                                        {getScoreLabel(report.score)}
                                    </p>
                                </div>
                                <div className={`w-20 h-20 rounded-full border-4 ${report.score >= 80 ? 'border-green-500' :
                                    report.score >= 60 ? 'border-yellow-500' :
                                        report.score >= 40 ? 'border-orange-500' : 'border-red-500'
                                    } flex items-center justify-center`}>
                                    {report.score >= 80 ? (
                                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                                    ) : (
                                        <AlertTriangle className="w-10 h-10 text-yellow-400" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="p-4 bg-surface-800/50 rounded-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className={`w-5 h-5 ${report.hasDocumentTitle ? 'text-green-400' : 'text-red-400'}`} />
                                <span className="text-xs text-surface-400">Title</span>
                            </div>
                            <p className={`text-sm font-semibold ${report.hasDocumentTitle ? 'text-green-400' : 'text-red-400'}`}>
                                {report.hasDocumentTitle ? 'Set' : 'Missing'}
                            </p>
                        </div>

                        <div className="p-4 bg-surface-800/50 rounded-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Languages className={`w-5 h-5 ${report.hasLanguage ? 'text-green-400' : 'text-yellow-400'}`} />
                                <span className="text-xs text-surface-400">Language</span>
                            </div>
                            <p className={`text-sm font-semibold ${report.hasLanguage ? 'text-green-400' : 'text-yellow-400'}`}>
                                {report.hasLanguage ? 'Set' : 'Not Set'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Settings Panel */}
                {showSettings && (
                    <div className="mb-6 p-4 bg-surface-800/50 rounded-2xl">
                        <h3 className="text-sm font-bold text-white mb-4">Quick Fixes</h3>

                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="text-xs text-surface-500 uppercase tracking-wider mb-2 block">Document Language</label>
                                <select
                                    value={selectedLanguage}
                                    onChange={e => setSelectedLanguage(e.target.value)}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500/50"
                                >
                                    {LANGUAGES.map(lang => (
                                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleSetLanguage}
                                className="px-4 py-2 bg-primary-500 hover:bg-primary-400 text-white text-sm font-semibold rounded-xl transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                )}

                {/* Issues List */}
                <div className="flex-1 overflow-y-auto pr-2">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <RefreshCw className="w-8 h-8 text-primary-400 animate-spin" />
                        </div>
                    ) : report ? (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-3">
                                Issues Found ({report.issues.length})
                            </h3>

                            {report.issues.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                    <p className="text-white font-semibold">No issues found!</p>
                                    <p className="text-surface-500 text-sm">Your document passes basic accessibility checks.</p>
                                </div>
                            ) : (
                                report.issues.map((issue, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-start gap-3 p-4 rounded-xl border ${issue.severity === 'error' ? 'bg-red-500/10 border-red-500/20' :
                                            issue.severity === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                                                'bg-blue-500/10 border-blue-500/20'
                                            }`}
                                    >
                                        {getSeverityIcon(issue.severity)}
                                        <div className="flex-1">
                                            <p className="text-sm text-white">{issue.message}</p>
                                            {issue.page && (
                                                <p className="text-xs text-surface-500 mt-1">Page {issue.page}</p>
                                            )}
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${issue.severity === 'error' ? 'bg-red-500/20 text-red-400' :
                                            issue.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {issue.severity}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-surface-400">
                            Failed to analyze document
                        </div>
                    )}
                </div>

                {/* Checklist */}
                <div className="mt-4 pt-4 border-t border-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-3">PDF/UA Checklist</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Document Title', checked: report?.hasDocumentTitle },
                            { label: 'Document Language', checked: report?.hasLanguage },
                            { label: 'Tagged Content', checked: report?.hasTaggedContent },
                            { label: 'Image Alt Text', checked: (report?.imageAltTextCoverage ?? 0) >= 80 },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.checked ? 'bg-green-500/20 text-green-400' : 'bg-surface-700 text-surface-500'
                                    }`}>
                                    {item.checked ? '✓' : '○'}
                                </div>
                                <span className="text-xs text-surface-300">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                    <button
                        onClick={runAccessibilityCheck}
                        className="flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Re-check
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                if (report) {
                                    const text = `Accessibility Report\n\nScore: ${report.score}/100\n\nIssues:\n${report.issues.map(i => `- [${i.severity.toUpperCase()}] ${i.message}`).join('\n')}`;
                                    const blob = new Blob([text], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'accessibility_report.txt';
                                    a.click();
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccessibilityPanel;
