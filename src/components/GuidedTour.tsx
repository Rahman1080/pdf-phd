// Guided Tour Component - First-time user onboarding
import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';

interface TourStep {
    id: string;
    title: string;
    description: string;
    target?: string; // CSS selector for element to highlight
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
    onComplete: () => void;
    onSkip: () => void;
}

const TOUR_STEPS: TourStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to PDF Studio! 🎉',
        description: 'Let\'s take a quick tour to help you get started with the most powerful PDF editor.',
        position: 'bottom',
    },
    {
        id: 'toolbar',
        title: 'Your Toolbox',
        description: 'All your editing tools are here - text, shapes, drawings, signatures, and more. Click any tool to start using it.',
        target: '.toolbar-container',
        position: 'bottom',
    },
    {
        id: 'canvas',
        title: 'Your Workspace',
        description: 'This is where the magic happens! Click anywhere to add elements, drag to move them, and double-click to edit.',
        target: '.canvas-area',
        position: 'left',
    },
    {
        id: 'pages',
        title: 'Page Navigator',
        description: 'View all your pages here. Drag to reorder, right-click for more options like duplicate or delete.',
        target: '.page-sidebar',
        position: 'right',
    },
    {
        id: 'properties',
        title: 'Properties Panel',
        description: 'Select any element to see and edit its properties - colors, fonts, sizes, and more.',
        target: '.properties-panel',
        position: 'left',
    },
    {
        id: 'export',
        title: 'Export & Save',
        description: 'When you\'re done, export your PDF, convert to Word/Excel, or save as images. All your options are here.',
        target: '.export-button',
        position: 'bottom',
    },
    {
        id: 'complete',
        title: 'You\'re All Set! 🚀',
        description: 'You now know the basics. Explore, experiment, and create amazing documents. Press ? anytime for keyboard shortcuts!',
        position: 'bottom',
    },
];

export function GuidedTour({ onComplete, onSkip }: GuidedTourProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

    const step = TOUR_STEPS[currentStep];
    const isFirst = currentStep === 0;
    const isLast = currentStep === TOUR_STEPS.length - 1;

    useEffect(() => {
        if (step.target) {
            const element = document.querySelector(step.target);
            if (element) {
                setHighlightRect(element.getBoundingClientRect());
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                setHighlightRect(null);
            }
        } else {
            setHighlightRect(null);
        }
    }, [step.target]);

    // Close/Skip on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onSkip();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onSkip]);

    const handleNext = () => {
        if (isLast) {
            onComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (!isFirst) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-[99999] pointer-events-auto">
                {/* Dark overlay with cutout for target element */}
                <svg className="absolute inset-0 w-full h-full">
                    <defs>
                        <mask id="tour-mask">
                            <rect width="100%" height="100%" fill="white" />
                            {highlightRect && (
                                <rect
                                    x={highlightRect.left - 8}
                                    y={highlightRect.top - 8}
                                    width={highlightRect.width + 16}
                                    height={highlightRect.height + 16}
                                    rx="12"
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>
                    <rect
                        width="100%"
                        height="100%"
                        fill="rgba(0, 0, 0, 0.85)"
                        mask="url(#tour-mask)"
                    />
                </svg>

                {/* Highlight ring around target */}
                {highlightRect && (
                    <div
                        className="absolute border-2 border-primary-500 rounded-xl pointer-events-none animate-pulse"
                        style={{
                            left: highlightRect.left - 8,
                            top: highlightRect.top - 8,
                            width: highlightRect.width + 16,
                            height: highlightRect.height + 16,
                            boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.3), 0 0 30px rgba(139, 92, 246, 0.5)',
                        }}
                    />
                )}

                {/* Tour Dialog */}
                <div
                    className="absolute bg-surface-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6"
                    style={{
                        left: '50%',
                        top: highlightRect ? (highlightRect.bottom + 24) : '50%',
                        transform: highlightRect ? 'translateX(-50%)' : 'translate(-50%, -50%)',
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                                {isLast ? (
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                ) : (
                                    <Sparkles className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                                <p className="text-xs text-surface-500">Step {currentStep + 1} of {TOUR_STEPS.length}</p>
                            </div>
                        </div>
                        <button
                            onClick={onSkip}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-surface-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Description */}
                    <p className="text-surface-300 text-sm mb-6 leading-relaxed">
                        {step.description}
                    </p>

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-1.5 mb-6">
                        {TOUR_STEPS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentStep
                                    ? 'bg-primary-500 w-6'
                                    : idx < currentStep
                                        ? 'bg-primary-500/50'
                                        : 'bg-surface-700'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onSkip}
                            className="text-sm text-surface-500 hover:text-white transition-colors"
                        >
                            Skip Tour
                        </button>
                        <div className="flex gap-2">
                            {!isFirst && (
                                <button
                                    onClick={handlePrev}
                                    className="flex items-center gap-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-white transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-1 px-6 py-2 bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-400 hover:to-purple-500 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-primary-500/25"
                            >
                                {isLast ? 'Get Started' : 'Next'}
                                {!isLast && <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default GuidedTour;
