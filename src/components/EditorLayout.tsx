// PDF Studio - Main Editor Layout

import { useState, useCallback, useEffect } from 'react';
import { useEditor } from '../context/EditorContext';
import { pdfService } from '../services/pdfService';
import { Toolbar } from './Toolbar';
import { PageSidebar } from './PageSidebar';
import { CanvasEditor } from './CanvasEditor';
import { PropertiesPanel } from './PropertiesPanel';
import { SignatureCreator } from './SignatureCreator';
import type { CreatorMode } from './SignatureCreator';
import { ExportModal, MergeModal, WatermarkModal } from './Modals';
import { downloadBytes, generateId } from '../utils/helpers';
import type { PageElement, SignatureElement, WatermarkElement } from '../types';
import { Loader2, ArrowLeft } from 'lucide-react';

interface EditorLayoutProps {
    onBack: () => void;
}

export function EditorLayout({ onBack }: EditorLayoutProps) {
    const { state, dispatch, addElement, deleteElement, setTool } = useEditor();
    const { document: pdfDocument, currentPage, isLoading, isSaving } = state;

    const [pageImage, setPageImage] = useState<string | null>(null);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showMergeModal, setShowMergeModal] = useState(false);
    const [showWatermarkModal, setShowWatermarkModal] = useState(false);

    // Watch for signature tool
    useEffect(() => {
        if (state.tool === 'signature') {
            setShowSignatureModal(true);
        }
    }, [state.tool]);

    // Load current page image when page changes
    useEffect(() => {
        async function loadPageImage() {
            if (!pdfDocument || currentPage >= pdfDocument.pages.length) return;

            try {
                const image = await pdfService.renderPageToCanvas(currentPage + 1, 800);
                setPageImage(image);
            } catch (error) {
                console.error('Failed to render page:', error);
            }
        }

        loadPageImage();
    }, [pdfDocument, currentPage]);

    // Handle adding elements
    const handleAddElement = useCallback((element: PageElement) => {
        addElement(currentPage, element);
    }, [addElement, currentPage]);

    // Handle adding signature
    const handleAddSignature = useCallback((signatureData: string, initialsData: string | null, type: CreatorMode) => {
        const signatureElement: SignatureElement = {
            id: generateId(),
            type: 'signature',
            signatureType: type as any,
            data: signatureData,
            initials: initialsData,
            x: 100,
            y: 100,
            width: 200,
            height: 80,
            rotation: 0,
            opacity: 1,
            zIndex: (pdfDocument?.pages[currentPage]?.elements.length || 0),
            locked: false,
            signedAt: new Date(),
        };
        addElement(currentPage, signatureElement);
        setShowSignatureModal(false);
        setTool('select');
    }, [addElement, currentPage, pdfDocument, setTool]);

    // Handle export
    const handleExport = useCallback(async (format: 'pdf' | 'png' | 'jpg', options: any) => {
        if (!pdfDocument) return;

        dispatch({ type: 'SET_SAVING', payload: true });

        try {
            if (format === 'pdf') {
                const bytes = await pdfService.exportPDF(pdfDocument.pages, {
                    format: 'pdf',
                    quality: 1,
                    compress: options.compress,
                    includeAnnotations: true,
                });
                downloadBytes(bytes, pdfDocument.name.replace('.pdf', '_edited.pdf'));
            } else {
                // Export current page as image
                const blob = await pdfService.exportPageAsImage(
                    currentPage + 1,
                    format,
                    options.quality / 100
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `page_${currentPage + 1}.${format}`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            dispatch({ type: 'SET_SAVING', payload: false });
            setShowExportModal(false);
        }
    }, [pdfDocument, currentPage, dispatch]);

    // Handle merge
    const handleMerge = useCallback(async (files: File[]) => {
        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            const mergedBytes = await pdfService.mergePDFs(files);
            downloadBytes(mergedBytes, 'merged.pdf');
        } catch (error) {
            console.error('Merge failed:', error);
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [dispatch]);

    // Handle watermark
    const handleWatermark = useCallback(async (config: any) => {
        if (!pdfDocument) return;

        const watermarkElement: WatermarkElement = {
            id: generateId(),
            type: 'watermark',
            watermarkType: config.type,
            content: config.content,
            x: 0,
            y: 0,
            width: pdfDocument.pages[currentPage].width,
            height: pdfDocument.pages[currentPage].height,
            rotation: 0,
            opacity: config.opacity,
            zIndex: -1,
            locked: true,
            tiled: config.tiled,
            pattern: 'diagonal',
            fontSize: config.fontSize,
            color: config.color,
        };

        // Apply watermark to all pages
        pdfDocument.pages.forEach((_, index) => {
            addElement(index, { ...watermarkElement, id: generateId() });
        });
    }, [pdfDocument, currentPage, addElement]);

    // Page actions
    const handleRotatePage = useCallback(async (index: number) => {
        dispatch({ type: 'PUSH_HISTORY', payload: 'Rotate page' });
        await pdfService.rotatePages([index], 90);
        // Refresh page
        const image = await pdfService.renderPageToCanvas(index + 1, 800);
        setPageImage(image);
    }, [dispatch]);

    const handleDeletePage = useCallback((index: number) => {
        dispatch({ type: 'PUSH_HISTORY', payload: 'Delete page' });
        dispatch({ type: 'DELETE_PAGES', payload: [index] });
    }, [dispatch]);

    const handleDuplicatePage = useCallback(async (index: number) => {
        // For simplicity, just add a message - full implementation would copy the page
        console.log('Duplicate page:', index);
    }, []);

    const handleAddPage = useCallback(() => {
        console.log('Add blank page');
    }, []);

    // Handle delete selected element
    const handleDeleteSelected = useCallback(() => {
        if (state.selectedElement) {
            deleteElement(currentPage, state.selectedElement.id);
        }
    }, [state.selectedElement, currentPage, deleteElement]);

    // Handle duplicate selected element
    const handleDuplicateSelected = useCallback(() => {
        if (state.selectedElement) {
            const duplicated = {
                ...state.selectedElement,
                id: generateId(),
                x: state.selectedElement.x + 20,
                y: state.selectedElement.y + 20,
            };
            addElement(currentPage, duplicated);
        }
    }, [state.selectedElement, currentPage, addElement]);

    if (!pdfDocument) {
        return (
            <div className="flex items-center justify-center h-screen bg-surface-950">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    const currentPageData = pdfDocument.pages[currentPage];

    return (
        <div className="h-screen flex flex-col bg-surface-950 overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center gap-4 px-4 py-2 bg-surface-900/50 border-b border-white/5">
                <button onClick={onBack} className="btn-icon" title="Back to Home">
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex-1 min-w-0">
                    <h1 className="text-sm font-medium text-white truncate">{pdfDocument.name}</h1>
                    <p className="text-xs text-surface-500">
                        Page {currentPage + 1} of {pdfDocument.totalPages}
                        {pdfDocument.modified && <span className="text-primary-400 ml-2">• Modified</span>}
                    </p>
                </div>

                {(isLoading || isSaving) && (
                    <div className="flex items-center gap-2 text-sm text-surface-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isSaving ? 'Saving...' : 'Loading...'}
                    </div>
                )}
            </div>

            {/* Toolbar */}
            <Toolbar
                onExport={() => setShowExportModal(true)}
                onMerge={() => setShowMergeModal(true)}
                onSplit={() => console.log('Split')}
                onCompress={() => console.log('Compress')}
                onWatermark={() => setShowWatermarkModal(true)}
                onSettings={() => console.log('Settings')}
            />

            {/* Main content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Page sidebar */}
                <PageSidebar
                    pages={pdfDocument.pages}
                    onRotatePage={handleRotatePage}
                    onDeletePage={handleDeletePage}
                    onDuplicatePage={handleDuplicatePage}
                    onAddPage={handleAddPage}
                />

                {/* Canvas area */}
                <CanvasEditor
                    pageImage={pageImage}
                    pageWidth={currentPageData?.width || 612}
                    pageHeight={currentPageData?.height || 792}
                    elements={currentPageData?.elements || []}
                    onAddElement={handleAddElement}
                />

                {/* Properties panel */}
                <PropertiesPanel
                    onDelete={handleDeleteSelected}
                    onDuplicate={handleDuplicateSelected}
                />
            </div>

            {/* Modals */}
            {showSignatureModal && (
                <SignatureCreator
                    onClose={() => {
                        setShowSignatureModal(false);
                        setTool('select');
                    }}
                    onSave={handleAddSignature}
                />
            )}

            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onExport={handleExport}
            />

            <MergeModal
                isOpen={showMergeModal}
                onClose={() => setShowMergeModal(false)}
                onMerge={handleMerge}
            />

            <WatermarkModal
                isOpen={showWatermarkModal}
                onClose={() => setShowWatermarkModal(false)}
                onApply={handleWatermark}
            />
        </div>
    );
}

export default EditorLayout;
