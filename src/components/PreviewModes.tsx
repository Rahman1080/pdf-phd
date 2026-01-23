// Preview Modes - Different ways to view PDF pages
import React from 'react';
import { FileText, Columns2, ScrollText, Printer } from 'lucide-react';

export type PreviewMode = 'single' | 'continuous' | 'two-page' | 'print';

interface PreviewModeSelectorProps {
    currentMode: PreviewMode;
    onModeChange: (mode: PreviewMode) => void;
}

const MODES: { id: PreviewMode; label: string; icon: React.ReactNode; description: string }[] = [
    {
        id: 'single',
        label: 'Single Page',
        icon: <FileText className="w-5 h-5" />,
        description: 'View one page at a time'
    },
    {
        id: 'continuous',
        label: 'Continuous',
        icon: <ScrollText className="w-5 h-5" />,
        description: 'Scroll through all pages'
    },
    {
        id: 'two-page',
        label: 'Two-Page Spread',
        icon: <Columns2 className="w-5 h-5" />,
        description: 'Book-like side by side view'
    },
    {
        id: 'print',
        label: 'Print Preview',
        icon: <Printer className="w-5 h-5" />,
        description: 'See how pages will print'
    },
];

export function PreviewModeSelector({ currentMode, onModeChange }: PreviewModeSelectorProps) {
    return (
        <div className="flex gap-1 p-1 bg-surface-800/50 rounded-xl">
            {MODES.map(mode => (
                <button
                    key={mode.id}
                    onClick={() => onModeChange(mode.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${currentMode === mode.id
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'text-surface-400 hover:text-white hover:bg-white/5'
                        }`}
                    title={mode.description}
                >
                    {mode.icon}
                    <span className="hidden md:inline">{mode.label}</span>
                </button>
            ))}
        </div>
    );
}

// Preview Mode Wrapper - Renders pages based on selected mode
interface PreviewModeWrapperProps {
    mode: PreviewMode;
    currentPage: number;
    totalPages: number;
    pageImages: { [p: number]: string };
    zoom: number;
    onPageClick: (pageNum: number) => void;
    children: React.ReactNode;
}

export function PreviewModeWrapper({
    mode,
    currentPage,
    totalPages,
    pageImages,
    zoom,
    onPageClick,
    children
}: PreviewModeWrapperProps) {
    if (mode === 'single') {
        // Regular single page view - just render children
        return <>{children}</>;
    }

    if (mode === 'continuous') {
        // Continuous scroll - render all pages
        return (
            <div className="flex flex-col gap-4 items-center py-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <div
                        key={pageNum}
                        className={`relative transition-all ${pageNum === currentPage ? 'ring-4 ring-primary-500/50 rounded-lg' : ''}`}
                        onClick={() => onPageClick(pageNum)}
                    >
                        {pageImages[pageNum] ? (
                            <img
                                src={pageImages[pageNum]}
                                alt={`Page ${pageNum}`}
                                style={{ transform: `scale(${zoom})`, transformOrigin: 'center top' }}
                                className="shadow-xl rounded-lg"
                            />
                        ) : (
                            <div className="w-[612px] h-[792px] bg-white flex items-center justify-center">
                                <span className="text-surface-400">Loading page {pageNum}...</span>
                            </div>
                        )}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-xs text-white font-medium">
                            Page {pageNum} of {totalPages}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (mode === 'two-page') {
        // Two-page spread view
        const leftPage = currentPage % 2 === 0 ? currentPage - 1 : currentPage;
        const rightPage = leftPage + 1;

        return (
            <div className="flex gap-2 items-start justify-center py-4">
                {/* Left Page */}
                <div
                    className={`relative transition-all ${leftPage === currentPage ? 'ring-4 ring-primary-500/50 rounded-lg' : ''}`}
                    onClick={() => onPageClick(leftPage)}
                >
                    {leftPage > 0 && pageImages[leftPage] ? (
                        <img
                            src={pageImages[leftPage]}
                            alt={`Page ${leftPage}`}
                            style={{ transform: `scale(${zoom * 0.6})`, transformOrigin: 'right top' }}
                            className="shadow-xl rounded-lg"
                        />
                    ) : leftPage > 0 ? (
                        <div className="w-[367px] h-[475px] bg-white flex items-center justify-center shadow-xl rounded-lg">
                            <span className="text-surface-400">Page {leftPage}</span>
                        </div>
                    ) : null}
                </div>

                {/* Right Page */}
                {rightPage <= totalPages && (
                    <div
                        className={`relative transition-all ${rightPage === currentPage ? 'ring-4 ring-primary-500/50 rounded-lg' : ''}`}
                        onClick={() => onPageClick(rightPage)}
                    >
                        {pageImages[rightPage] ? (
                            <img
                                src={pageImages[rightPage]}
                                alt={`Page ${rightPage}`}
                                style={{ transform: `scale(${zoom * 0.6})`, transformOrigin: 'left top' }}
                                className="shadow-xl rounded-lg"
                            />
                        ) : (
                            <div className="w-[367px] h-[475px] bg-white flex items-center justify-center shadow-xl rounded-lg">
                                <span className="text-surface-400">Page {rightPage}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (mode === 'print') {
        // Print preview with margins and page breaks
        return (
            <div className="py-8 px-16 bg-surface-800">
                <div className="max-w-[8.5in] mx-auto">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <div
                            key={pageNum}
                            className="mb-8 bg-white shadow-2xl print:shadow-none print:mb-0"
                            style={{
                                padding: '0.5in',
                                pageBreakAfter: pageNum < totalPages ? 'always' : 'auto'
                            }}
                        >
                            {pageImages[pageNum] ? (
                                <img
                                    src={pageImages[pageNum]}
                                    alt={`Page ${pageNum}`}
                                    className="w-full h-auto"
                                />
                            ) : (
                                <div className="w-full aspect-[8.5/11] flex items-center justify-center text-surface-400">
                                    Loading page {pageNum}...
                                </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-surface-200 text-center text-xs text-surface-500">
                                Page {pageNum} of {totalPages}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export default PreviewModeSelector;
