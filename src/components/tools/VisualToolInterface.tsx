import { useState, useCallback, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Plus,
    X,
    ZoomIn,
    ZoomOut,
    MousePointer2,
    Type,
    ImagePlus,
    Highlighter,
    Stamp,
    PenTool as Signature,
    Copy,
    Crop,
    FileOutput,
    EyeOff,
    Square,
    ArrowRight,
    RotateCcw,
    RotateCw,
    Trash2,
    Check,
    Download,
    GripVertical,
    Zap,
    Shield,
    Lock,
    FileText,
    Droplets,
    Hash,
    ListOrdered,
    AlignCenter,
    ScanText,
    Link2,
    QrCode,
    LayoutGrid,
    Layers
} from 'lucide-react';
import {
    PDFDocument,
    degrees,
    rgb,
    StandardFonts,
    PDFString
} from '@cantoo/pdf-lib';
import type { Tool } from '../../data/tools';
import { SignatureModal } from './SignatureModal';
import { ImageUploadModal } from './ImageUploadModal';
import { StampSelectorModal } from './StampSelectorModal';
import { ShapeSelectorModal } from './ShapeSelectorModal';
import { generateId } from '../../utils/helpers';
import { DirectTextEditor } from '../index';
import { OCRProcessor } from '../OCRProcessor';
import { LinkModal, QRCodeModal, BatesModal, PageNumbersModal, HeaderFooterModal, BulkRedactModal } from './VisualEditorModals';

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs';

interface VisualPage {
    id: string;
    fileIndex: number;
    originalIndex: number;
    thumbnail: string;
    rotation: number;
    selected: boolean;
    crop?: { top: number; right: number; bottom: number; left: number };
    elements?: any[];
}

interface VisualToolInterfaceProps {
    tool: Tool;
}

function CropOverlay({
    crop,
    onChange
}: {
    crop: { top: number; right: number; bottom: number; left: number };
    onChange: (crop: { top: number; right: number; bottom: number; left: number }) => void;
}) {
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const activeHandleRef = useRef<string | null>(null);

    const handlePointerDown = useCallback((e: React.PointerEvent, handle: string) => {
        e.stopPropagation();
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.setPointerCapture(e.pointerId);
        }
        setIsDragging(true);
        activeHandleRef.current = handle;
    }, []);

    useEffect(() => {
        if (!isDragging) return;

        const handlePointerMove = (e: PointerEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            const newCrop = { ...crop };
            const h = activeHandleRef.current;

            if (h?.includes('t')) newCrop.top = Math.max(0, Math.min(y, 100 - crop.bottom - 5));
            if (h?.includes('b')) newCrop.bottom = Math.max(0, Math.min(100 - y, 100 - crop.top - 5));
            if (h?.includes('l')) newCrop.left = Math.max(0, Math.min(x, 100 - crop.right - 5));
            if (h?.includes('r')) newCrop.right = Math.max(0, Math.min(100 - x, 100 - crop.left - 5));

            onChange(newCrop);
        };

        const handlePointerUp = (e: PointerEvent) => {
            setIsDragging(false);
            if (e.target instanceof HTMLElement) {
                try {
                    e.target.releasePointerCapture(e.pointerId);
                } catch (err) {
                    // Ignore if target is no longer in DOM
                }
            }
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isDragging, crop, onChange]);

    return (
        <div ref={containerRef} className="absolute inset-0 z-50 overflow-hidden touch-none group-hover:cursor-auto">
            {/* Dimmed Areas */}
            <div className="absolute top-0 left-0 right-0 bg-black/60 pointer-events-none transition-all duration-200" style={{ height: `${crop.top}%` }} />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 pointer-events-none transition-all duration-200" style={{ height: `${crop.bottom}%` }} />
            <div className="absolute left-0 bg-black/60 pointer-events-none transition-all duration-200" style={{ top: `${crop.top}%`, bottom: `${crop.bottom}%`, width: `${crop.left}%` }} />
            <div className="absolute right-0 bg-black/60 pointer-events-none transition-all duration-200" style={{ top: `${crop.top}%`, bottom: `${crop.bottom}%`, width: `${crop.right}%` }} />

            {/* Clear Area with Border */}
            <div
                className="absolute border-2 border-primary-500 shadow-[0_0_0_9999px_rgba(0,0,0,0)]"
                style={{
                    top: `${crop.top}%`,
                    bottom: `${crop.bottom}%`,
                    left: `${crop.left}%`,
                    right: `${crop.right}%`
                }}
            >
                {/* Handles */}
                {['tl', 'tr', 'bl', 'br', 't', 'r', 'b', 'l'].map(h => (
                    <div
                        key={h}
                        onPointerDown={(e) => handlePointerDown(e, h)}
                        className={`absolute flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-crosshair z-[60] touch-none
                            ${h === 'tl' ? 'top-0 left-0' : h === 'tr' ? 'top-0 left-full' : h === 'bl' ? 'top-full left-0' : h === 'br' ? 'top-full left-full' :
                                h === 't' ? 'top-0 left-1/2' : h === 'b' ? 'top-full left-1/2' : h === 'l' ? 'top-1/2 left-0' : 'top-1/2 left-full'}
                        `}
                        style={{ width: 44, height: 44 }} // Increased hit area for touch
                    >
                        <div className="w-3 h-3 bg-primary-500 border border-white rounded-full shadow-lg hover:scale-125 transition-transform" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function SortablePage({
    page,
    index,
    onToggleSelect,
    onCropChange,
    isReorderMode,
    isCropTool
}: {
    page: VisualPage;
    index: number;
    onToggleSelect: (id: string) => void;
    onCropChange: (id: string, crop: { top: number; right: number; bottom: number; left: number }) => void;
    isReorderMode: boolean;
    isCropTool: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: page.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative group bg-surface-800 rounded-2xl border transition-all duration-300 ${isDragging ? 'opacity-50 scale-105 border-primary-500 shadow-2xl' :
                page.selected ? 'border-primary-500 ring-2 ring-primary-500/50 shadow-lg shadow-primary-500/10' :
                    'border-white/5 hover:border-white/20'
                }`}
        >
            {/* Page Number Badge */}
            <div className="absolute top-3 left-3 z-20 px-2 py-1 rounded-lg bg-surface-900/80 backdrop-blur-md border border-white/10 text-[10px] font-black text-white">
                {index + 1}
            </div>

            {/* Selection Checkbox */}
            <button
                onClick={() => onToggleSelect(page.id)}
                className={`absolute top-3 right-3 z-30 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${page.selected ? 'bg-primary-500 border-primary-500 text-white' : 'bg-surface-900/60 border-white/20 text-transparent hover:border-white/50'
                    }`}
            >
                <Check className="w-4 h-4" />
            </button>

            {/* Thumbnail Wrapper */}
            <div
                className={`aspect-[3/4] p-3 cursor-pointer overflow-hidden rounded-xl transition-transform duration-300 ${isReorderMode ? 'cursor-grab' : ''}`}
                {...(isReorderMode ? { ...attributes, ...listeners } : { onClick: () => onToggleSelect(page.id) })}
            >
                <div
                    className="w-full h-full bg-white rounded shadow-sm overflow-hidden transition-all duration-500 relative"
                    style={{
                        transform: `rotate(${page.rotation}deg)`,
                        transformOrigin: 'center center'
                    }}
                >
                    <img src={page.thumbnail} alt={`Page ${index + 1}`} className="w-full h-full object-contain pointer-events-none select-none" />
                    {isCropTool && page.selected && (
                        <div className="absolute inset-0 z-50 overflow-hidden">
                            <CropOverlay
                                crop={page.crop || { top: 0, right: 0, bottom: 0, left: 0 }}
                                onChange={(newCrop) => onCropChange(page.id, newCrop)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Click Handler to change active page in Editor mode */}
            {!isReorderMode && (
                <div
                    className="absolute inset-x-0 bottom-0 top-12 z-10 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect(page.id);
                    }}
                />
            )}

            {/* Drag Handle Overlay (only in reorder mode) */}
            {isReorderMode && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                    <div className="bg-primary-500/20 backdrop-blur-sm p-4 rounded-full border border-primary-500/30">
                        <GripVertical className="w-6 h-6 text-primary-400" />
                    </div>
                </div>
            )}
        </div>
    );
}

export function VisualToolInterface({ tool }: VisualToolInterfaceProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [pages, setPages] = useState<VisualPage[]>([]);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState<string>('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'processing' | 'completed' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [layoutMode, setLayoutMode] = useState<'grid' | 'canvas'>(tool.layout || 'grid');
    const [activePageId, setActivePageId] = useState<string | null>(null);
    const [activeSubTool, setActiveSubTool] = useState<string>('select');
    const [selectedElementIndex, setSelectedElementIndex] = useState<number | null>(null);

    // Mobile/Tablet detection
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            setIsMobile(width < 640);
        };
        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    // Responsive zoom - smaller default on mobile for better overview
    const [zoom, setZoom] = useState(1.5);

    // Element manipulation state (copied from CanvasEditor)
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);

    // Modal state for tools
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showStampModal, setShowStampModal] = useState(false);
    const [showShapeModal, setShowShapeModal] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showBatesModal, setShowBatesModal] = useState(false);
    const [showPageNumbersModal, setShowPageNumbersModal] = useState(false);
    const [showHeaderFooterModal, setShowHeaderFooterModal] = useState(false);
    const [pendingElementPosition, setPendingElementPosition] = useState<{ x: number, y: number } | null>(null);
    const [editingElementIndex, setEditingElementIndex] = useState<number | null>(null);

    // Optimized drag state
    const [tempElementPos, setTempElementPos] = useState<{ x: number, y: number } | null>(null);
    const [tempElementSize, setTempElementSize] = useState<{ width: number, height: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Text Editing State
    const [editingTextIndex, setEditingTextIndex] = useState<number | null>(null);

    // Redaction State
    const [showBulkRedactModal, setShowBulkRedactModal] = useState(false);

    // OCR State
    const [showOCRModal, setShowOCRModal] = useState(false);

    // Initialize Tool based on which page we are on
    useEffect(() => {
        const id = tool.id;
        if (id === 'add-text') setActiveSubTool('add-text');
        else if (id === 'add-image') setActiveSubTool('add-image');
        else if (id === 'annotate') setActiveSubTool('annotate');
        else if (id === 'watermark') setActiveSubTool('watermark');
        else if (id === 'stamp') setActiveSubTool('stamp');
        else if (id === 'sign') setActiveSubTool('sign');
        else if (id === 'redact') setActiveSubTool('redact');
        else if (id === 'bates') {
            setActiveSubTool('bates');
            setShowBatesModal(true);
        }
        else if (id === 'page-numbers') {
            setActiveSubTool('page-numbers');
            setShowPageNumbersModal(true);
        }
        else if (id === 'header-footer') {
            setActiveSubTool('header-footer');
            setShowHeaderFooterModal(true);
        }
        else if (id === 'ocr') {
            setActiveSubTool('ocr');
            setShowOCRModal(true);
        }
    }, [tool.id]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedElementIndex !== null && !showSignatureModal && !showImageModal && !showStampModal && !showShapeModal) {
                    if ((document.activeElement as HTMLElement)?.contentEditable === 'true' || document.activeElement?.tagName === 'INPUT') return;

                    e.preventDefault();
                    setPages(pages.map(p => p.id === activePageId ? {
                        ...p,
                        elements: p.elements?.filter((_, idx) => idx !== selectedElementIndex)
                    } : p));
                    setSelectedElementIndex(null);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElementIndex, activePageId, pages, showSignatureModal, showImageModal, showStampModal, showShapeModal]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const loadPdfs = async (newFiles: File[]) => {
        setStatus('loading');
        setError(null);
        setProgress(0);

        try {
            const allFiles = [...files, ...newFiles];
            const allLoadedPages: VisualPage[] = [...pages];
            let currentFileIndex = files.length;

            for (const file of newFiles) {
                if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                    console.warn('[loadPdfs] Skipping non-PDF file:', file.name);
                    continue;
                }

                const arrayBuffer = await file.arrayBuffer();
                // CRITICAL FIX: Convert ArrayBuffer to Uint8Array for PDF.js compatibility
                const pdf = await pdfjsLib.getDocument({
                    data: new Uint8Array(arrayBuffer),
                    // Use a legacy-friendly approach for password-protected files
                    stopAtErrors: false
                }).promise;
                const pageCount = pdf.numPages;

                for (let i = 1; i <= pageCount; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({ canvasContext: context!, viewport } as any).promise;

                    allLoadedPages.push({
                        id: generateId(),
                        fileIndex: currentFileIndex,
                        originalIndex: i - 1,
                        thumbnail: canvas.toDataURL('image/webp', 0.8),
                        rotation: 0,
                        selected: false,
                        crop: { top: 0, right: 0, bottom: 0, left: 0 },
                        elements: []
                    });
                }
                currentFileIndex++;
                setProgress(Math.round((currentFileIndex / allFiles.length) * 100));
            }

            setPages(allLoadedPages);
            setFiles(allFiles);
            setStatus('ready');
            if (allLoadedPages.length > 0 && !activePageId) {
                setActivePageId(allLoadedPages[0].id);
            }
        } catch (err: any) {
            console.error('[VisualToolInterface] PDF Load Error:', err);
            setError(`Failed to load PDF: ${err.message || 'It might be corrupt or encrypted.'}`);
            setStatus('error');
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setPages((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const toggleSelect = (id: string) => {
        setPages(prev => prev.map(p => p.id === id ? { ...p, selected: !p.selected } : p));
    };

    const duplicateSelected = () => {
        setPages(prev => {
            const next = [...prev];
            const selected = prev.filter(p => p.selected);
            selected.forEach(p => {
                const idx = next.findIndex(item => item.id === p.id);
                const newPage = { ...p, id: generateId(), selected: false };
                next.splice(idx + 1, 0, newPage);
            });
            return next;
        });
    };

    const onCropChange = (id: string, crop: { top: number; right: number; bottom: number; left: number }) => {
        setPages(prev => prev.map(p => p.id === id ? { ...p, crop } : p));
    };

    const cropSelected = () => {
        alert('Visual Crop: Use the draggable handles on selected pages to define the crop area.');
    };

    const extractSelected = () => {
        setPages(prev => prev.filter(p => p.selected));
    };

    const selectAll = () => {
        const anyUnselected = pages.some(p => !p.selected);
        setPages(prev => prev.map(p => ({ ...p, selected: anyUnselected })));
    };

    const activePage = pages.find(p => p.id === activePageId) || pages[0];

    const rotateSelected = (angle: number) => {
        const targets = layoutMode === 'canvas' && activePageId ? [activePageId] : pages.filter(p => p.selected).map(p => p.id);
        if (targets.length === 0 && activePageId) targets.push(activePageId);
        setPages(prev => prev.map(p => targets.includes(p.id) ? { ...p, rotation: (p.rotation + angle + 360) % 360 } : p));
    };

    const deleteSelected = () => {
        const targets = layoutMode === 'canvas' && activePageId ? [activePageId] : pages.filter(p => p.selected).map(p => p.id);
        if (targets.length === 0 && activePageId) targets.push(activePageId);
        if (targets.length === 0) return;
        if (window.confirm(`Delete ${targets.length} pages?`)) {
            setPages(prev => prev.filter(p => !targets.includes(p.id)));
        }
    };

    const applyChanges = async () => {
        if (files.length === 0 || pages.length === 0) return;

        setStatus('processing');
        try {
            const loadedDocs = await Promise.all(
                files.map(async f => {
                    const buf = await f.arrayBuffer();
                    try {
                        return await PDFDocument.load(buf, { ignoreEncryption: true, updateMetadata: false });
                    } catch {
                        return await PDFDocument.load(buf, { ignoreEncryption: true });
                    }
                })
            );

            const resultDoc = await PDFDocument.create();
            // resultDoc.embedFont('Helvetica') is no longer needed here as we embed on demand below

            for (const pageInfo of pages) {
                const sourceDoc = loadedDocs[pageInfo.fileIndex];
                const [copiedPage] = await resultDoc.copyPages(sourceDoc, [pageInfo.originalIndex]);

                // Intrinsic page rotation
                const originalRotation = copiedPage.getRotation().angle;
                // Add visual rotation
                copiedPage.setRotation(degrees((originalRotation + pageInfo.rotation) % 360));

                if (pageInfo.crop && (pageInfo.crop.top > 0 || pageInfo.crop.right > 0 || pageInfo.crop.bottom > 0 || pageInfo.crop.left > 0)) {
                    const { width, height } = copiedPage.getSize();

                    // Calculate rotated crop
                    const L = pageInfo.crop.left;
                    const R = pageInfo.crop.right;
                    const T = pageInfo.crop.top;
                    const B = pageInfo.crop.bottom;
                    const rot = (pageInfo.rotation % 360 + 360) % 360;

                    let finalLeft = L, finalRight = R, finalTop = T, finalBottom = B;

                    if (rot === 90) { finalLeft = T; finalTop = R; finalRight = B; finalBottom = L; }
                    else if (rot === 180) { finalLeft = R; finalTop = B; finalRight = L; finalBottom = T; }
                    else if (rot === 270) { finalLeft = B; finalTop = L; finalRight = T; finalBottom = R; }

                    const leftPts = (finalLeft / 100) * width;
                    const rightPts = (finalRight / 100) * width;
                    const topPts = (finalTop / 100) * height;
                    const bottomPts = (finalBottom / 100) * height;

                    const newW = width - leftPts - rightPts;
                    const newH = height - topPts - bottomPts;

                    if (newW > 10 && newH > 10) {
                        copiedPage.setCropBox(leftPts, bottomPts, newW, newH);
                        copiedPage.setMediaBox(leftPts, bottomPts, newW, newH);
                    }
                }

                // Draw added elements
                if (pageInfo.elements && pageInfo.elements.length > 0) {
                    const { width, height } = copiedPage.getSize();

                    // Pre-embed standard fonts for this page
                    const fonts = {
                        helvetica: await resultDoc.embedFont(StandardFonts.Helvetica),
                        helveticaBold: await resultDoc.embedFont(StandardFonts.HelveticaBold),
                        helveticaOblique: await resultDoc.embedFont(StandardFonts.HelveticaOblique),
                        helveticaBoldOblique: await resultDoc.embedFont(StandardFonts.HelveticaBoldOblique),
                        times: await resultDoc.embedFont(StandardFonts.TimesRoman),
                        timesBold: await resultDoc.embedFont(StandardFonts.TimesRomanBold),
                        timesItalic: await resultDoc.embedFont(StandardFonts.TimesRomanItalic),
                        timesBoldItalic: await resultDoc.embedFont(StandardFonts.TimesRomanBoldItalic),
                        courier: await resultDoc.embedFont(StandardFonts.Courier),
                        courierBold: await resultDoc.embedFont(StandardFonts.CourierBold),
                        courierOblique: await resultDoc.embedFont(StandardFonts.CourierOblique),
                        courierBoldOblique: await resultDoc.embedFont(StandardFonts.CourierBoldOblique),
                    };

                    for (const el of pageInfo.elements) {
                        try {
                            // Position as percentages (0-100)
                            const xPer = typeof el.x === 'string' ? parseFloat(el.x) : el.x;
                            const yPer = typeof el.y === 'string' ? parseFloat(el.y) : el.y;
                            const x = (xPer / 100) * width;
                            const y = height - (yPer / 100) * height; // Top-down to Bottom-up

                            let elWidth: number;
                            let elHeight: number;

                            if (el.isPercentage || (el.width && el.width <= 100 && el.height && el.height <= 100)) {
                                const widthPer = el.width || 15;
                                const heightPer = el.height || 5;
                                elWidth = (widthPer / 100) * width;
                                elHeight = (heightPer / 100) * height;
                            } else {
                                const scaleX = width / 800;
                                const scaleY = height / 1000;
                                elWidth = (el.width || 100) * scaleX;
                                elHeight = (el.height || 24) * scaleY;
                            }

                            const parseColor = (hex: string) => {
                                const r = parseInt(hex.slice(1, 3), 16) / 255;
                                const g = parseInt(hex.slice(3, 5), 16) / 255;
                                const b = parseInt(hex.slice(5, 7), 16) / 255;
                                return rgb(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
                            };
                            const color = parseColor(el.color || '#000000');

                            let content = el.content || 'Text';
                            if (el.type === 'page-number' && (el as any).pageNumbersData) {
                                content = (el as any).pageNumbersData.format
                                    .replace('{n}', (pages.indexOf(pageInfo) + 1).toString())
                                    .replace('{total}', pages.length.toString());
                            } else if (el.type === 'bates' && (el as any).batesData) {
                                content = `${(el as any).batesData.prefix}${String((el as any).batesData.startNum + pages.indexOf(pageInfo)).padStart((el as any).batesData.digits, '0')}`;
                            } else if (el.type === 'header-footer') {
                                content = (el.content || '')
                                    .replace('{page}', (pages.indexOf(pageInfo) + 1).toString())
                                    .replace('{date}', new Date().toLocaleDateString())
                                    .replace('{filename}', files[0]?.name || 'document.pdf');
                            }

                            if (el.type === 'text' || el.type === 'watermark' || el.type === 'page-number' || el.type === 'bates' || el.type === 'header-footer') {
                                const fontSize = (el as any).fontSize || (el.type === 'watermark' ? 60 : 14);
                                const isBold = (el as any).fontWeight > 400 || (el as any).bold;
                                const isItalic = (el as any).fontStyle === 'italic' || (el as any).italic;
                                const family = ((el as any).fontFamily || '').toLowerCase();

                                let selectedFont = fonts.helvetica;
                                if (family.includes('times') || family.includes('serif')) {
                                    if (isBold && isItalic) selectedFont = fonts.timesBoldItalic;
                                    else if (isBold) selectedFont = fonts.timesBold;
                                    else if (isItalic) selectedFont = fonts.timesItalic;
                                    else selectedFont = fonts.times;
                                } else if (family.includes('courier') || family.includes('mono')) {
                                    if (isBold && isItalic) selectedFont = fonts.courierBoldOblique;
                                    else if (isBold) selectedFont = fonts.courierBold;
                                    else if (isItalic) selectedFont = fonts.courierOblique;
                                    else selectedFont = fonts.courier;
                                } else {
                                    if (isBold && isItalic) selectedFont = fonts.helveticaBoldOblique;
                                    else if (isBold) selectedFont = fonts.helveticaBold;
                                    else if (isItalic) selectedFont = fonts.helveticaOblique;
                                    else selectedFont = fonts.helvetica;
                                }


                                const opacity = (el as any).opacity ?? (el.type === 'watermark' ? 0.3 : 1);
                                const rotationDeg = el.rotation || 0;
                                const rotation = degrees(rotationDeg);

                                // Calculate text width for centering
                                const textWidth = selectedFont.widthOfTextAtSize(content, fontSize);
                                const textHeight = fontSize; // Approximate height

                                // The element is positioned with top-left at (x, y) in PDF coordinates
                                // where y is already inverted (y = pageHeight - yPercent * pageHeight)
                                // CSS rotation rotates around the center of the element box
                                // PDF rotation rotates around the text origin (bottom-left of text)

                                // Calculate the center of the element box in PDF coordinates
                                const boxCenterX = x + elWidth / 2;
                                const boxCenterY = y - elHeight / 2;

                                // For centered text with rotation, we need to position so the text center
                                // ends up at the box center after rotation
                                const rad = (rotationDeg * Math.PI) / 180;
                                const cosR = Math.cos(rad);
                                const sinR = Math.sin(rad);

                                // Text origin should be placed so the center of the text (considering rotation)
                                // lands on the box center. After rotation around origin, the text center moves.
                                // For a text of width W and height H, the center relative to origin is (W/2, H/2)
                                // After rotation, this center is at:
                                // rotatedCenterX = (W/2) * cos(r) - (H/2) * sin(r)
                                // rotatedCenterY = (W/2) * sin(r) + (H/2) * cos(r)
                                // So text origin X = boxCenterX - rotatedCenterX
                                // text origin Y = boxCenterY - rotatedCenterY

                                const rotatedCenterX = (textWidth / 2) * cosR - (textHeight / 2) * sinR;
                                const rotatedCenterY = (textWidth / 2) * sinR + (textHeight / 2) * cosR;

                                const textX = boxCenterX - rotatedCenterX;
                                const textY = boxCenterY - rotatedCenterY;

                                copiedPage.drawText(content, {
                                    x: textX,
                                    y: textY,
                                    size: fontSize,
                                    font: selectedFont,
                                    color,
                                    opacity,
                                    rotate: rotation,
                                });
                            } else if (el.type === 'image' || el.type === 'signature') {
                                if (el.content && el.content.startsWith('data:image')) {
                                    const base64 = el.content.split(',')[1];
                                    const imageBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
                                    let embeddedImage;
                                    if (el.content.startsWith('data:image/png')) {
                                        embeddedImage = await resultDoc.embedPng(imageBytes);
                                    } else {
                                        embeddedImage = await resultDoc.embedJpg(imageBytes);
                                    }

                                    if (embeddedImage) {
                                        copiedPage.drawImage(embeddedImage, {
                                            x,
                                            y: y - elHeight,
                                            width: elWidth,
                                            height: elHeight,
                                            rotate: degrees(el.rotation || 0),
                                        });
                                    }
                                }
                            } else if (el.type === 'redact') {
                                copiedPage.drawRectangle({
                                    x,
                                    y: y - elHeight,
                                    width: elWidth,
                                    height: elHeight,
                                    color: rgb(0, 0, 0),
                                });
                            } else if (el.type === 'stamp') {
                                copiedPage.drawRectangle({
                                    x,
                                    y: y - elHeight,
                                    width: elWidth,
                                    height: elHeight,
                                    color: rgb(color.red, color.green, color.blue),
                                    opacity: 0.1,
                                    borderColor: color,
                                    borderWidth: 2,
                                });
                                const fontSize = 14;
                                const text = el.content || 'STAMP';
                                const tw = fonts.helveticaBold.widthOfTextAtSize(text, fontSize);
                                copiedPage.drawText(text, {
                                    x: x + (elWidth - tw) / 2,
                                    y: y - elHeight / 2 - 5,
                                    size: fontSize,
                                    font: fonts.helveticaBold,
                                    color,
                                });
                            } else if (el.type === 'shape') {
                                if (el.shapeType === 'circle') {
                                    copiedPage.drawEllipse({
                                        x: x + elWidth / 2,
                                        y: y - elHeight / 2,
                                        xScale: elWidth / 2,
                                        yScale: elHeight / 2,
                                        color: rgb(color.red, color.green, color.blue),
                                        opacity: 0.2,
                                        borderColor: color,
                                        borderWidth: 2,
                                    });
                                } else if (el.shapeType === 'triangle') {
                                    const path = `M ${x} ${y - elHeight} L ${x + elWidth / 2} ${y} L ${x + elWidth} ${y - elHeight} Z`;
                                    copiedPage.drawSvgPath(path, { color, opacity: 0.2, borderColor: color, borderWidth: 2 });
                                } else if (el.shapeType === 'arrow') {
                                    copiedPage.drawLine({
                                        start: { x, y: y - elHeight / 2 },
                                        end: { x: x + elWidth - 10, y: y - elHeight / 2 },
                                        thickness: 3,
                                        color,
                                    });
                                    // Arrow head
                                    const headPath = `M ${x + elWidth - 10} ${y - elHeight / 2 + 6} L ${x + elWidth} ${y - elHeight / 2} L ${x + elWidth - 10} ${y - elHeight / 2 - 6} Z`;
                                    copiedPage.drawSvgPath(headPath, { color });
                                } else if (el.shapeType === 'line') {
                                    copiedPage.drawLine({
                                        start: { x, y: y - elHeight / 2 },
                                        end: { x: x + elWidth, y: y - elHeight / 2 },
                                        thickness: 3,
                                        color,
                                    });
                                } else {
                                    copiedPage.drawRectangle({
                                        x,
                                        y: y - elHeight,
                                        width: elWidth,
                                        height: elHeight,
                                        color: rgb(color.red, color.green, color.blue),
                                        opacity: 0.2,
                                        borderColor: color,
                                        borderWidth: 2,
                                    });
                                }
                            } else if (el.type === 'highlight') {
                                copiedPage.drawRectangle({
                                    x,
                                    y: y - elHeight,
                                    width: elWidth,
                                    height: elHeight,
                                    color: rgb(1, 1, 0),
                                    opacity: 0.4,
                                });
                            } else if (el.type === 'link') {
                                // Draw visual link text
                                copiedPage.drawText(el.content || '', {
                                    x,
                                    y: y - elHeight + 2,
                                    size: 10,
                                    font: fonts.helvetica,
                                    color: rgb(0.14, 0.39, 0.92), // Blue
                                });
                                // Draw underline
                                copiedPage.drawLine({
                                    start: { x, y: y - elHeight },
                                    end: { x: x + elWidth, y: y - elHeight },
                                    thickness: 0.5,
                                    color: rgb(0.14, 0.39, 0.92),
                                });

                                // Add actual PDF link annotation
                                try {
                                    const linkAnnotation = resultDoc.context.obj({
                                        Type: 'Annot',
                                        Subtype: 'Link',
                                        Rect: [x, y - elHeight, x + elWidth, y],
                                        Border: [0, 0, 0],
                                        A: {
                                            Type: 'Action',
                                            S: 'URI',
                                            URI: PDFString.of(el.content || ''),
                                        },
                                    });
                                    const linkRef = resultDoc.context.register(linkAnnotation);
                                    copiedPage.node.addAnnot(linkRef);
                                } catch (e) {
                                    console.warn('Failed to add link annotation', e);
                                }
                            } else if (el.type === 'qrcode') {
                                try {
                                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(el.content || '')}`;
                                    const qrResp = await fetch(qrUrl);
                                    const qrBuf = await qrResp.arrayBuffer();
                                    const qrImage = await resultDoc.embedPng(new Uint8Array(qrBuf));
                                    copiedPage.drawImage(qrImage, {
                                        x,
                                        y: y - elHeight,
                                        width: elWidth,
                                        height: elHeight,
                                    });
                                } catch (e) {
                                    console.error('Failed to add QR code', e);
                                }
                            }
                        } catch (err) {
                            console.warn('Failed to draw element', el.type, err);
                        }
                    }
                }

                resultDoc.addPage(copiedPage);
            }

            const bytes = await resultDoc.save();
            const blob = new Blob([bytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setResultUrl(url);
            setStatus('completed');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Processing failed');
            setStatus('error');
        }
    };

    const handleDownload = () => {
        if (resultUrl) {
            const link = document.createElement('a');
            link.href = resultUrl;
            link.download = `${tool.id}_result.pdf`;
            link.click();
        }
    };

    const reset = () => {
        setFiles([]);
        setPages([]);
        setStatus('idle');
        setResultUrl(null);
    };

    // ====== ELEMENT MANIPULATION HANDLERS (from CanvasEditor) ======

    // Handle drag start on an element
    const handleElementDragStart = (e: React.MouseEvent | React.TouchEvent, elementIndex: number) => {
        e.stopPropagation();
        // Prevent page scrolling on touch devices
        if ('touches' in e) {
            e.preventDefault();
        }
        const el = activePage?.elements?.[elementIndex];
        if (!el) return;

        setSelectedElementIndex(elementIndex);
        setIsDragging(true);
        setIsResizing(false);

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        setDragStart({ x: clientX, y: clientY });
        setElementStart({
            x: el.x as number,
            y: el.y as number,
            width: el.width || 100,
            height: el.height || 50
        });
    };

    // Handle resize start on an element
    const handleElementResizeStart = (e: React.MouseEvent | React.TouchEvent, handle: string) => {
        e.stopPropagation();
        // Prevent page scrolling on touch devices
        if ('touches' in e) {
            e.preventDefault();
        }
        if (selectedElementIndex === null || !activePage) return;

        const el = activePage.elements?.[selectedElementIndex];
        if (!el) return;

        setIsResizing(true);
        setIsDragging(false);
        setResizeHandle(handle);

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        setDragStart({ x: clientX, y: clientY });
        setElementStart({
            x: el.x as number,
            y: el.y as number,
            width: el.width || 100,
            height: el.height || 50
        });
    };

    // Handle mouse/touch move for dragging and resizing
    const handleCanvasMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if ((!isDragging && !isResizing) || selectedElementIndex === null || !activePage || !canvasRef.current) return;

        // Prevent page scrolling during drag/resize
        if ('touches' in e) {
            e.preventDefault();
        }

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const dx = ((clientX - dragStart.x) / canvasRect.width) * 100;
        const dy = ((clientY - dragStart.y) / canvasRect.height) * 100;

        if (isDragging) {
            const newX = Math.max(0, Math.min(95, elementStart.x + dx));
            const newY = Math.max(0, Math.min(95, elementStart.y + dy));
            setTempElementPos({ x: newX, y: newY });
        }

        if (isResizing && resizeHandle) {
            const el = activePage.elements?.[selectedElementIndex];
            const isElementPercentage = el?.isPercentage;

            let newX = elementStart.x;
            let newY = elementStart.y;

            // Get start dimensions as percentages
            let startWidthPercent: number;
            let startHeightPercent: number;

            if (isElementPercentage) {
                // Element dimensions are already percentages
                startWidthPercent = elementStart.width;
                startHeightPercent = elementStart.height;
            } else {
                // Convert pixel-based dimensions to percentages
                startWidthPercent = (elementStart.width / canvasRect.width) * 100;
                startHeightPercent = (elementStart.height / canvasRect.height) * 100;
            }

            // Calculate deltas as percentages
            const dxPercent = ((clientX - dragStart.x) / canvasRect.width) * 100;
            const dyPercent = ((clientY - dragStart.y) / canvasRect.height) * 100;

            let newWidthPercent = startWidthPercent;
            let newHeightPercent = startHeightPercent;
            const minSizePercent = 3; // Minimum 3% of canvas

            if (resizeHandle.includes('e')) {
                newWidthPercent = Math.max(minSizePercent, startWidthPercent + dxPercent);
            }
            if (resizeHandle.includes('w')) {
                const widthDelta = Math.min(startWidthPercent - minSizePercent, dxPercent);
                newX = elementStart.x + widthDelta;
                newWidthPercent = Math.max(minSizePercent, startWidthPercent - dxPercent);
            }
            if (resizeHandle.includes('s')) {
                newHeightPercent = Math.max(minSizePercent, startHeightPercent + dyPercent);
            }
            if (resizeHandle.includes('n')) {
                const heightDelta = Math.min(startHeightPercent - minSizePercent, dyPercent);
                newY = elementStart.y + heightDelta;
                newHeightPercent = Math.max(minSizePercent, startHeightPercent - dyPercent);
            }

            setTempElementPos({ x: newX, y: newY });
            // Store as percentage with flag
            setTempElementSize({
                width: newWidthPercent,
                height: newHeightPercent,
                isPercentage: true
            } as any);
        }
    };

    // Handle mouse/touch up to stop dragging/resizing
    const handleCanvasMouseUp = () => {
        if ((isDragging || isResizing) && selectedElementIndex !== null && activePage && tempElementPos) {
            setPages(pages.map(p => p.id === activePage.id ? {
                ...p,
                elements: p.elements?.map((el, i) => i === selectedElementIndex ? {
                    ...el,
                    x: tempElementPos.x,
                    y: tempElementPos.y,
                    // If resizing with percentage values, save them with the flag
                    width: tempElementSize?.width ?? el.width,
                    height: tempElementSize?.height ?? el.height,
                    // Preserve or set isPercentage flag
                    isPercentage: (tempElementSize as any)?.isPercentage ?? el.isPercentage ?? true
                } : el)
            } : p));
        }

        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle(null);
        setTempElementPos(null);
        setTempElementSize(null);
    };

    // Get resize handle position styles - larger on mobile for touch
    const getHandleStyle = (handle: string): React.CSSProperties => {
        // Larger offset on mobile to account for bigger handles (28px vs 12px)
        const offset = isMobile ? -14 : -6;

        const styles: Record<string, React.CSSProperties> = {
            nw: { top: offset, left: offset, cursor: 'nw-resize' },
            n: { top: offset, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
            ne: { top: offset, right: offset, cursor: 'ne-resize' },
            e: { top: '50%', right: offset, transform: 'translateY(-50%)', cursor: 'e-resize' },
            se: { bottom: offset, right: offset, cursor: 'se-resize' },
            s: { bottom: offset, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
            sw: { bottom: offset, left: offset, cursor: 'sw-resize' },
            w: { top: '50%', left: offset, transform: 'translateY(-50%)', cursor: 'w-resize' },
        };
        return styles[handle] || {};
    };

    // ====== END ELEMENT MANIPULATION HANDLERS ======

    // ====== MODAL SAVE HANDLERS ======

    const handleSignatureSave = (signatureDataUrl: string) => {
        if (!pendingElementPosition || !activePage) {
            console.warn('[handleSignatureSave] Missing position or active page', { pos: !!pendingElementPosition, page: !!activePage });
            return;
        }

        console.log('[handleSignatureSave] Received signature data length:', signatureDataUrl.length);

        const newElement = {
            id: generateId(),
            type: 'signature',
            content: signatureDataUrl,
            x: Math.max(0, Math.min(pendingElementPosition.x, 95)),
            y: Math.max(0, Math.min(pendingElementPosition.y, 95)),
            width: 30, // Increased from 25
            height: 12, // Increased from 10
            color: '#000000',
            isPercentage: true
        };

        setPages(pages.map(p => p.id === activePage.id ? {
            ...p,
            elements: [...(p.elements || []), newElement]
        } : p));

        setSelectedElementIndex((activePage.elements?.length || 0));
        setPendingElementPosition(null);
    };

    const handleImageSave = (imageDataUrl: string) => {
        if (!pendingElementPosition || !activePage) return;

        const newElement = {
            id: generateId(),
            type: 'image',
            content: imageDataUrl,
            x: Math.max(0, Math.min(pendingElementPosition.x, 95)),
            y: Math.max(0, Math.min(pendingElementPosition.y, 95)),
            width: 20, // 20% of page width
            height: 20, // 20% of page height
            color: '#000000',
            isPercentage: true
        };

        setPages(pages.map(p => p.id === activePage.id ? {
            ...p,
            elements: [...(p.elements || []), newElement]
        } : p));

        setSelectedElementIndex((activePage.elements?.length || 0));
        setPendingElementPosition(null);
    };

    const handleStampSelect = (stampText: string, stampColor: string) => {
        if (!pendingElementPosition || !activePage) return;

        const newElement = {
            id: generateId(),
            type: 'stamp',
            content: stampText,
            x: Math.max(0, Math.min(pendingElementPosition.x, 95)),
            y: Math.max(0, Math.min(pendingElementPosition.y, 95)),
            width: 18, // 18% of page width
            height: 6, // 6% of page height
            color: stampColor,
            isPercentage: true
        };

        setPages(pages.map(p => p.id === activePage.id ? {
            ...p,
            elements: [...(p.elements || []), newElement]
        } : p));

        setSelectedElementIndex((activePage.elements?.length || 0));
        setPendingElementPosition(null);
    };

    const handleShapeSelect = (shapeType: string, shapeColor: string) => {
        if (!pendingElementPosition || !activePage) return;

        // Different sizes for different shapes (as percentages of page)
        let width = 12; // 12% of page width
        let height = 15; // 15% of page height

        if (shapeType === 'line') {
            width = 18;
            height = 0.5;
        } else if (shapeType === 'arrow') {
            width = 18;
            height = 6;
        }

        const newElement = {
            id: generateId(),
            type: 'shape',
            shapeType: shapeType, // rectangle, circle, triangle, arrow, line
            content: '',
            x: Math.max(0, Math.min(pendingElementPosition.x, 95)),
            y: Math.max(0, Math.min(pendingElementPosition.y, 95)),
            width,
            height,
            color: shapeColor,
            isPercentage: true
        };

        setPages(pages.map(p => p.id === activePage.id ? {
            ...p,
            elements: [...(p.elements || []), newElement]
        } : p));

        setSelectedElementIndex((activePage.elements?.length || 0));
        setPendingElementPosition(null);
    };

    const handleWatermarkAdd = () => {
        if (!activePage) return;

        const pos = pendingElementPosition || { x: 30, y: 40 };

        const newElementBase = {
            id: generateId(),
            type: 'watermark',
            content: 'WATERMARK',
            x: Math.max(0, Math.min(pos.x, 95)),
            y: Math.max(0, Math.min(pos.y, 95)),
            width: 40,
            height: 10,
            fontSize: 60,
            rotation: -45,
            color: '#000000',
            isPercentage: true
        };

        // Apply to ALL pages for watermark
        setPages(pages.map(p => ({
            ...p,
            elements: [...(p.elements || []), { ...newElementBase, id: generateId() }]
        })));

        setSelectedElementIndex((activePage.elements?.length || 0));
        setPendingElementPosition(null);
    };

    const saveElement = (elementData: any) => {
        const isProfessionalTool = ['bates', 'page-number', 'header-footer', 'watermark'].includes(elementData.type);

        // For professional tools, only need pages to exist. For others, need activePage.
        if (!isProfessionalTool && !activePage) return;
        if (pages.length === 0) return;

        if (editingElementIndex !== null && activePage) {
            // Update existing element on active page
            setPages(pages.map(p => p.id === activePage.id ? {
                ...p,
                elements: p.elements?.map((el, i) => i === editingElementIndex ? { ...el, ...elementData } : el)
            } : p));
            setEditingElementIndex(null);
        } else {
            // Add new element
            const defaultY = elementData.type === 'header-footer' ? 5 :
                (elementData.type === 'page-number' ? 92 : 45);
            const pos = pendingElementPosition || { x: 35, y: defaultY };

            const newElementBase = {
                id: generateId(),
                x: Math.max(0, Math.min(pos.x, 95)),
                y: Math.max(0, Math.min(pos.y, 95)),
                isPercentage: true,
                ...elementData
            };

            if (isProfessionalTool) {
                // Apply to all pages
                setPages(pages.map(p => ({
                    ...p,
                    elements: [...(p.elements || []), { ...newElementBase, id: generateId() }]
                })));
            } else if (activePage) {
                setPages(pages.map(p => p.id === activePage.id ? {
                    ...p,
                    elements: [...(p.elements || []), newElementBase]
                } : p));
            }

            if (activePage) {
                setSelectedElementIndex((activePage.elements?.length || 0));
            }
            setPendingElementPosition(null);
        }
    };

    const handleBatesAdd = () => {
        // Bates is a professional tool that applies to all pages - just needs pages to exist
        if (pages.length === 0) return;
        setShowBatesModal(true);
    };

    const handlePageNumbersAdd = () => {
        // Page numbers apply to all pages - just needs pages to exist
        if (pages.length === 0) return;
        setShowPageNumbersModal(true);
    };

    const handleHeaderFooterAdd = () => {
        // Header/Footer applies to all pages - just needs pages to exist
        if (pages.length === 0) return;
        setShowHeaderFooterModal(true);
    };

    const handleLinksAdd = () => {
        if (!activePage) return;
        setShowLinkModal(true);
    };

    const handleQRAdd = () => {
        if (!activePage) return;
        setShowQRModal(true);
    };



    const handleOCRComplete = (results: { pageIndex: number; text: string }[]) => {
        // Apply text to pages
        setPages(prev => prev.map(p => {
            const res = results.find(r => r.pageIndex === p.originalIndex);
            if (res) {
                const newElement = {
                    id: generateId(),
                    type: 'text',
                    content: res.text,
                    x: 5,
                    y: 5,
                    width: 90,
                    height: 90,
                    fontSize: 10,
                    fontFamily: 'Helvetica',
                    color: '#000000',
                    isPercentage: true
                };
                return { ...p, elements: [...(p.elements || []), newElement] };
            }
            return p;
        }));
        setShowOCRModal(false);
    };

    const handleBulkRedactSave = async (searchTerms: string[]) => {
        if (!files.length || !searchTerms.length) return;

        setStatus('processing');
        setProgress(0);
        setProgressMessage('Scanning document for matches...');

        try {
            const newPages = [...pages];

            let totalMatches = 0;
            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                for (let i = 1; i <= pdf.numPages; i++) {
                    const currentPct = Math.round(((i / pdf.numPages)) * 100);
                    setProgress(currentPct);
                    setProgressMessage(`Scanning page ${i} of ${pdf.numPages}...`);
                    // Small delay to allow UI to update
                    await new Promise(resolve => setTimeout(resolve, 10));
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1 });
                    const textContent = await page.getTextContent();

                    const pageWidth = viewport.width;
                    const pageHeight = viewport.height;

                    const visualPageIndex = newPages.findIndex(p => p.originalIndex === i - 1);
                    if (visualPageIndex === -1) continue;

                    const addedElements: any[] = [];

                    textContent.items.forEach((item: any) => {
                        const str = item.str || '';
                        if (!str) return;

                        searchTerms.forEach(term => {
                            const lowerStr = str.toLowerCase();
                            const lowerTerm = term.toLowerCase();
                            let lastIndex = lowerStr.indexOf(lowerTerm);

                            while (lastIndex !== -1) {
                                const tx = item.transform;
                                // Font scale/height
                                const fontHeight = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);

                                // Linear approximation of word position and width within the text run
                                // PDF.js gives item.width for the whole string. 
                                // We calculate offset and width based on characters.
                                const ratio = lastIndex / str.length;
                                const widthRatio = term.length / str.length;

                                const matchXOffset = ratio * item.width;
                                const matchWidth = widthRatio * item.width;

                                // Text origin (bottom-left)
                                const x = tx[4] + matchXOffset;
                                const y = tx[5];

                                // Convert to our coordinate system (origin top-left, percentages)
                                const pctX = (x / pageWidth) * 100;
                                const pctY = ((pageHeight - y - fontHeight) / pageHeight) * 100;
                                const pctW = (matchWidth / pageWidth) * 100;
                                const pctH = (fontHeight / pageHeight) * 100;

                                addedElements.push({
                                    id: generateId(),
                                    type: 'redact',
                                    x: Math.max(0, pctX - 0.2), // Slight overlap for safety
                                    y: Math.max(0, pctY - 0.2),
                                    width: pctW + 0.4,
                                    height: Math.max(0.5, pctH + 0.4),
                                    color: '#000000',
                                    isPercentage: true
                                });
                                totalMatches++;

                                // Search for next match in the same text item
                                lastIndex = lowerStr.indexOf(lowerTerm, lastIndex + lowerTerm.length);
                            }
                        });
                    });

                    if (addedElements.length > 0) {
                        newPages[visualPageIndex] = {
                            ...newPages[visualPageIndex],
                            elements: [...(newPages[visualPageIndex].elements || []), ...addedElements]
                        };
                    }
                }
            }

            if (totalMatches === 0) {
                setError('No matches found for the provided search terms.');
            }

            setPages(newPages);
            setShowBulkRedactModal(false);
            setStatus('ready');
            setProgress(0);
            setProgressMessage('');
        } catch (err) {
            console.error('Bulk redact failed:', err);
            setError('Failed to auto-redact. Some contents may be images or non-searchable.');
            setStatus('ready');
            setProgress(0);
            setProgressMessage('');
        }
    };

    // ====== END MODAL SAVE HANDLERS ======

    const editTools = [
        { id: 'select', label: 'Select', icon: MousePointer2, color: 'text-blue-400' },
        { id: 'add-text', label: 'Text', icon: Type, color: 'text-primary-400' },
        { id: 'add-image', label: 'Image', icon: ImagePlus, color: 'text-emerald-400' },
        { id: 'annotate', label: 'Highlight', icon: Highlighter, color: 'text-amber-400' },
        { id: 'rect', label: 'Shape', icon: Square, color: 'text-indigo-400' },
        { id: 'redact', label: 'Redact', icon: EyeOff, color: 'text-red-400' },
        { id: 'stamp', label: 'Stamp', icon: Stamp, color: 'text-purple-400' },
        { id: 'sign', label: 'Sign', icon: Signature, color: 'text-pink-400' },
        { id: 'watermark', label: 'Watermark', icon: Droplets, color: 'text-cyan-400' },
        { id: 'bates', label: 'Bates', icon: Hash, color: 'text-emerald-500' },
        { id: 'page-numbers', label: 'Pages', icon: ListOrdered, color: 'text-blue-500' },
        { id: 'header-footer', label: 'H/F', icon: AlignCenter, color: 'text-indigo-400' },
        { id: 'ocr', label: 'OCR', icon: ScanText, color: 'text-orange-400' },
        { id: 'add-links', label: 'Link', icon: Link2, color: 'text-blue-500' },
        { id: 'add-qr', label: 'QR', icon: QrCode, color: 'text-purple-500' },
    ];

    const selectedCount = pages.filter(p => p.selected).length;

    return (
        <>
            {/* Fullscreen Editor Overlay when status is ready/processing */}
            {(status === 'ready' || status === 'loading' || status === 'processing') && (
                <div className="fixed inset-0 z-[100] bg-surface-950 flex flex-col animate-in fade-in duration-300">
                    {/* Header Bar (Professional Style) */}
                    <div className={`shrink-0 bg-gradient-to-r ${tool.bgGradient} p-4 md:px-8 py-4 flex items-center justify-between shadow-2xl z-[110]`}>
                        <div className="flex items-center gap-4 md:gap-6">
                            <button
                                onClick={() => setStatus('idle')}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all group"
                                title="Exit Editor"
                            >
                                <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <tool.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <h2 className="text-lg md:text-xl font-black text-white leading-none uppercase tracking-tighter">{tool.name}</h2>
                                <p className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Professional Visual Editor</p>
                            </div>
                        </div>

                        {status === 'ready' && (
                            <div className="flex items-center gap-3">
                                <div className="text-right mr-4 hidden md:block">
                                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none mb-1">Pages</p>
                                    <p className="text-xl font-black text-white leading-none">{pages.length}</p>
                                </div>
                                <button
                                    onClick={applyChanges}
                                    className="px-6 py-3 bg-white text-surface-900 font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center gap-2 text-sm"
                                >
                                    <Check className="w-5 h-5" />
                                    <span>DONE</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col min-h-0 bg-surface-950">
                        {status === 'loading' ? (
                            <div className="h-full flex flex-col items-center justify-center py-20">
                                <div className="relative mb-8">
                                    <div className="w-32 h-32 rounded-full border-4 border-primary-500/10 border-t-primary-500 animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xl font-black text-primary-400">{progress}%</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Preparing Workplace...</h3>
                                <p className="text-surface-400 font-medium tracking-wide uppercase text-xs">Loading your PDF documents for the visual tool</p>
                            </div>
                        ) : status === 'ready' ? (
                            <div className="flex flex-col h-full">
                                {/* Compact header on mobile */}
                                <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4 mb-2 md:mb-8 p-2 md:p-4 rounded-xl md:rounded-2xl bg-surface-800/50 border border-white/5">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <button
                                            onClick={selectAll}
                                            className="px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-white/5 border border-white/10 text-[10px] md:text-xs font-bold text-white active:bg-white/10 transition-all"
                                        >
                                            {selectedCount === pages.length ? 'Deselect' : 'Select All'}
                                        </button>
                                        <span className="hidden md:inline text-xs font-medium text-surface-500">{selectedCount} pages selected</span>
                                        <span className="md:hidden text-[10px] font-medium text-surface-500">{selectedCount} sel.</span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Desktop Edit Tools - Integrated into secondary header */}
                                        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-surface-900/50 rounded-2xl border border-white/5">
                                            {editTools.filter(t => {
                                                if (tool.id === 'edit') return true;
                                                if (tool.id === 'annotate') return t.id === 'draw' || t.id === 'highlight' || t.id === 'select';
                                                if (tool.id === 'sign') return t.id === 'signature' || t.id === 'select';
                                                if (tool.id === 'reorder' || tool.id === 'rotate' || tool.id === 'delete-pages' || tool.id === 'duplicate-pages' || tool.id === 'extract-pages') return t.id === 'select';
                                                if (tool.id === 'crop') return t.id === 'select';
                                                if (tool.id === 'bates') return t.id === 'bates' || t.id === 'select';
                                                if (tool.id === 'page-numbers') return t.id === 'page-numbers' || t.id === 'select';
                                                if (tool.id === 'header-footer') return t.id === 'header-footer' || t.id === 'select';
                                                if (tool.id === 'ocr') return t.id === 'ocr' || t.id === 'select';
                                                if (tool.id === 'watermark') return t.id === 'watermark' || t.id === 'select';
                                                if (tool.id === 'stamp') return t.id === 'stamp' || t.id === 'select';
                                                return t.id === 'select' || t.id === tool.id || (tool.id === 'redact' && t.id === 'redact');
                                            }).map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setActiveSubTool(item.id)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all shrink-0 active:scale-95 ${activeSubTool === item.id ? 'bg-primary-500 border-primary-400 shadow-lg shadow-primary-500/20' : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}`}
                                                >
                                                    <item.icon className={`w-4 h-4 ${activeSubTool === item.id ? 'text-white' : item.color}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${activeSubTool === item.id ? 'text-white' : 'text-surface-400'}`}>{item.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {activeSubTool === 'redact' && (
                                            <button
                                                onClick={() => setShowBulkRedactModal(true)}
                                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center gap-2 text-[10px] uppercase tracking-widest border border-white/10"
                                            >
                                                <Zap className="w-4 h-4 fill-current animate-pulse" />
                                                Auto Redact
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 md:gap-2">
                                        {selectedCount > 0 && (
                                            <>
                                                <button
                                                    onClick={() => rotateSelected(90)}
                                                    className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-primary-500/20 text-primary-400 border border-primary-500/30 active:bg-primary-500/30 transition-all flex items-center gap-1 md:gap-2 md:px-3"
                                                >
                                                    <RotateCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                    <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Rotate</span>
                                                </button>
                                                <button
                                                    onClick={duplicateSelected}
                                                    className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 active:bg-indigo-500/30 transition-all flex items-center gap-1 md:gap-2 md:px-3"
                                                >
                                                    <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                    <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Duplicate</span>
                                                </button>
                                                {tool.id === 'crop' && (
                                                    <button
                                                        onClick={cropSelected}
                                                        className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 active:bg-teal-500/30 transition-all flex items-center gap-1 md:gap-2 md:px-3"
                                                    >
                                                        <Crop className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                        <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Crop</span>
                                                    </button>
                                                )}
                                                {(tool.id === 'extract-pages' || tool.id === 'split') && (
                                                    <button
                                                        onClick={extractSelected}
                                                        className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 active:bg-amber-500/30 transition-all flex items-center gap-1 md:gap-2 md:px-3"
                                                    >
                                                        <FileOutput className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                        <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Extract</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={deleteSelected}
                                                    className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 active:bg-red-500/30 transition-all flex items-center gap-1 md:gap-2 md:px-3"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                    <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Delete</span>
                                                </button>
                                            </>
                                        )}

                                        <div className="hidden md:block w-px h-6 bg-white/10 mx-2" />

                                        {/* Zoom controls - improved for desktop */}
                                        <div className="hidden md:flex items-center gap-2 bg-surface-900/50 p-1 rounded-xl border border-white/5">
                                            <button
                                                onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                                                className="p-1.5 rounded-lg hover:bg-white/5 text-surface-400 hover:text-white transition-all"
                                            >
                                                <ZoomOut className="w-4 h-4" />
                                            </button>
                                            <span className="text-[10px] font-black text-white w-12 text-center">{Math.round(zoom * 100)}%</span>
                                            <button
                                                onClick={() => setZoom(Math.min(5, zoom + 0.25))}
                                                className="p-1.5 rounded-lg hover:bg-white/5 text-surface-400 hover:text-white transition-all"
                                            >
                                                <ZoomIn className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-row overflow-hidden min-h-0 bg-surface-950">
                                    {/* NAVIGATION SIDEBAR (Desktop) */}
                                    <div className="hidden md:flex w-52 shrink-0 flex-col bg-surface-900/50 border-r border-white/10 overflow-hidden">
                                        <div className="p-3 border-b border-white/5 bg-surface-950/30">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Navigation</h3>
                                                <span className="text-[10px] font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">{pages.length}</span>
                                            </div>
                                            {/* Layout Toggle in Sidebar */}
                                            <div className="flex p-1 bg-surface-950 rounded-xl border border-white/5">
                                                <button
                                                    onClick={() => setLayoutMode('canvas')}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${layoutMode === 'canvas' ? 'bg-primary-500 text-white shadow-lg' : 'text-surface-500 hover:text-surface-300'}`}
                                                >
                                                    <MousePointer2 className="w-3 h-3" />
                                                    Focus
                                                </button>
                                                <button
                                                    onClick={() => setLayoutMode('grid')}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${layoutMode === 'grid' ? 'bg-primary-500 text-white shadow-lg' : 'text-surface-500 hover:text-surface-300'}`}
                                                >
                                                    <LayoutGrid className="w-3 h-3" />
                                                    Grid
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
                                            {pages.map((page, index) => (
                                                <div
                                                    key={page.id}
                                                    onClick={() => setActivePageId(page.id)}
                                                    className={`group relative cursor-pointer rounded-xl border-2 transition-all bg-surface-800 hover:scale-[1.02] active:scale-95 shadow-lg ${activePageId === page.id ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-white/5 hover:border-white/20'}`}
                                                >
                                                    <div className={`absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shadow-xl transition-colors ${activePageId === page.id ? 'bg-primary-500 text-white' : 'bg-black/60 text-white'}`}>
                                                        {index + 1}
                                                    </div>
                                                    <div className="p-1">
                                                        <img
                                                            src={page.thumbnail}
                                                            alt=""
                                                            className="w-full h-auto rounded-lg"
                                                            style={{ transform: `rotate(${page.rotation}deg)` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => document.getElementById('file-input-visual')?.click()}
                                                className="w-full py-4 rounded-xl border-2 border-dashed border-white/10 hover:border-primary-500/30 hover:bg-primary-500/5 transition-all flex flex-col items-center justify-center text-surface-500"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span className="text-[9px] font-black uppercase mt-1">Add</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                                        {layoutMode === 'canvas' ? (
                                            <div className="flex-1 flex flex-col h-full overflow-hidden">
                                                {/* Mobile Horizontal Thumbnail Strip */}
                                                <div className="shrink-0 bg-surface-900/80 backdrop-blur-md border-b border-white/5 px-3 py-3 block md:hidden">
                                                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                                                        {pages.map((page, index) => (
                                                            <div
                                                                key={page.id}
                                                                onClick={() => setActivePageId(page.id)}
                                                                className={`relative cursor-pointer rounded-lg border-2 transition-all shrink-0 bg-surface-800 active:scale-95 overflow-hidden ${activePageId === page.id
                                                                    ? 'border-primary-500 ring-2 ring-primary-500/30 shadow-lg shadow-primary-500/20'
                                                                    : 'border-white/10 active:border-white/30'
                                                                    }`}
                                                                style={{ width: 72, aspectRatio: '0.7' }}
                                                            >
                                                                <div className="absolute top-1 left-1 z-10 w-5 h-5 rounded-md bg-black/80 flex items-center justify-center text-[10px] font-bold text-white">
                                                                    {index + 1}
                                                                </div>
                                                                <img
                                                                    src={page.thumbnail}
                                                                    alt={`Page ${index + 1}`}
                                                                    className="w-full h-full object-cover pointer-events-none"
                                                                    style={{ transform: `rotate(${page.rotation}deg)` }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>


                                                {/* Main Editor Area - Takes Full Remaining Height */}
                                                <div className="flex-1 bg-surface-950/50 flex flex-col items-stretch justify-stretch relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
                                                    <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none" />

                                                    {activePage ? (
                                                        <div className="relative w-full h-full flex flex-col items-center justify-center min-h-0">
                                                            <div className="lg:hidden flex w-full h-16 shrink-0 bg-surface-900/80 backdrop-blur-xl border-b border-white/5 px-6 items-center justify-between z-30">
                                                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                                                                    {editTools.filter(t => {
                                                                        // Only show tools relevant to the current main tool
                                                                        if (tool.id === 'edit') return true; // Show all for full editor
                                                                        if (tool.id === 'annotate') return t.id === 'draw' || t.id === 'highlight' || t.id === 'select';
                                                                        if (tool.id === 'sign') return t.id === 'signature' || t.id === 'select';
                                                                        if (tool.id === 'reorder' || tool.id === 'rotate' || tool.id === 'delete-pages' || tool.id === 'duplicate-pages' || tool.id === 'extract-pages') return t.id === 'select';
                                                                        if (tool.id === 'crop') return t.id === 'select';
                                                                        if (tool.id === 'bates') return t.id === 'bates' || t.id === 'select';
                                                                        if (tool.id === 'page-numbers') return t.id === 'page-numbers' || t.id === 'select';
                                                                        if (tool.id === 'header-footer') return t.id === 'header-footer' || t.id === 'select';
                                                                        if (tool.id === 'ocr') return t.id === 'ocr' || t.id === 'select';
                                                                        if (tool.id === 'watermark') return t.id === 'watermark' || t.id === 'select';
                                                                        if (tool.id === 'stamp') return t.id === 'stamp' || t.id === 'select';
                                                                        return t.id === 'select' || t.id === tool.id || (tool.id === 'redact' && t.id === 'redact');
                                                                    }).map((item) => (
                                                                        <button
                                                                            key={item.id}
                                                                            onClick={() => setActiveSubTool(item.id)}
                                                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all shrink-0 active:scale-95 ${activeSubTool === item.id ? 'bg-primary-500 border-primary-400 shadow-lg shadow-primary-500/20' : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}`}
                                                                        >
                                                                            <item.icon className={`w-4 h-4 ${activeSubTool === item.id ? 'text-white' : item.color}`} />
                                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${activeSubTool === item.id ? 'text-white' : 'text-surface-400'}`}>{item.label}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>

                                                                <div className="flex items-center gap-3 shrink-0 ml-4">
                                                                    <div className="flex bg-surface-950 p-1 rounded-xl border border-white/5">
                                                                        <button onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} className="p-1.5 rounded-lg hover:bg-white/5 active:bg-white/10 text-surface-400"><ZoomOut className="w-4 h-4" /></button>
                                                                        <div className="px-3 flex items-center justify-center min-w-[60px] cursor-default">
                                                                            <span className="text-[10px] font-black text-white">{Math.round(zoom * 100)}%</span>
                                                                        </div>
                                                                        <button onClick={() => setZoom(Math.min(5, zoom + 0.25))} className="p-1.5 rounded-lg hover:bg-white/5 active:bg-white/10 text-surface-400"><ZoomIn className="w-4 h-4" /></button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Canvas Area - Disable touch scroll when dragging elements */}
                                                            <div
                                                                className={`relative flex-1 w-full min-h-0 overflow-auto custom-scrollbar p-4 sm:p-8 md:p-12 bg-surface-950/30 pb-48 md:pb-32 flex flex-col items-center ${(isDragging || isResizing) ? 'touch-none overflow-hidden' : ''}`}
                                                                onMouseMove={handleCanvasMouseMove}
                                                                onMouseUp={handleCanvasMouseUp}
                                                                onMouseLeave={handleCanvasMouseUp}
                                                                onTouchMove={handleCanvasMouseMove}
                                                                onTouchEnd={handleCanvasMouseUp}
                                                            >
                                                                {/* "Click to Place" Instructional Banner */}
                                                                {activeSubTool !== 'select' && !isDragging && !isResizing && (
                                                                    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[45] animate-in slide-in-from-top-4 duration-300 pointer-events-none">
                                                                        <div className="bg-indigo-600/90 backdrop-blur-md text-white px-6 py-2 rounded-full shadow-2xl border border-white/20 flex items-center gap-3">
                                                                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                                            <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">
                                                                                Click anywhere on the page to place: {editTools.find(t => t.id === activeSubTool)?.label}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* OCR Landing Zone */}
                                                                {tool.id === 'ocr' && !activePage?.elements?.some(e => e.type === 'text') && (
                                                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-surface-950/80 backdrop-blur-md animate-in fade-in duration-500">
                                                                        <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                                                                            <ScanText className="w-12 h-12 text-indigo-400" />
                                                                        </div>
                                                                        <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">OCR Text Recognition</h3>
                                                                        <p className="max-w-md text-surface-400 font-medium leading-relaxed mb-8">
                                                                            We've detected a scanned document. Click the button below to extract editable text from your pages.
                                                                        </p>
                                                                        <button
                                                                            onClick={() => setShowOCRModal(true)}
                                                                            className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center gap-3 uppercase tracking-tight"
                                                                        >
                                                                            <Zap className="w-5 h-5 fill-current" />
                                                                            Start OCR Process
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                <div
                                                                    ref={canvasRef}
                                                                    className={`relative shadow-[0_25px_80px_rgba(0,0,0,0.5)] rounded-lg overflow-visible bg-white transition-transform duration-200 my-auto ${activeSubTool !== 'select' ? 'cursor-crosshair' : 'cursor-default'}`}
                                                                    style={{
                                                                        transform: `rotate(${activePage.rotation}deg) scale(${zoom})`,
                                                                        transformOrigin: 'center center'
                                                                    }}
                                                                    onClick={(e) => {
                                                                        // Deselect element if clicking on empty area
                                                                        setSelectedElementIndex(null);

                                                                        if (activeSubTool === 'select') return;

                                                                        const rect = canvasRef.current!.getBoundingClientRect();
                                                                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                                                                        const y = ((e.clientY - rect.top) / rect.height) * 100;

                                                                        // For tools that need modals, store position and show modal
                                                                        if (activeSubTool === 'sign') {
                                                                            setPendingElementPosition({ x, y });
                                                                            setShowSignatureModal(true);
                                                                            return;
                                                                        } else if (activeSubTool === 'add-image') {
                                                                            setPendingElementPosition({ x, y });
                                                                            setShowImageModal(true);
                                                                            return;
                                                                        } else if (activeSubTool === 'stamp') {
                                                                            setPendingElementPosition({ x, y });
                                                                            setShowStampModal(true);
                                                                            return;
                                                                        } else if (activeSubTool === 'rect' || activeSubTool === 'shape') {
                                                                            setPendingElementPosition({ x, y });
                                                                            setShowShapeModal(true);
                                                                            return;
                                                                        } else if (activeSubTool === 'watermark') {
                                                                            setPendingElementPosition({ x, y });
                                                                            handleWatermarkAdd();
                                                                            return;
                                                                        } else if (activeSubTool === 'bates') {
                                                                            setPendingElementPosition({ x, y });
                                                                            handleBatesAdd();
                                                                            return;
                                                                        } else if (activeSubTool === 'page-numbers') {
                                                                            setPendingElementPosition({ x, y });
                                                                            handlePageNumbersAdd();
                                                                            return;
                                                                        } else if (activeSubTool === 'header-footer') {
                                                                            setPendingElementPosition({ x, y });
                                                                            handleHeaderFooterAdd();
                                                                            return;
                                                                        } else if (activeSubTool === 'add-links') {
                                                                            setPendingElementPosition({ x, y });
                                                                            handleLinksAdd();
                                                                            return;
                                                                        } else if (activeSubTool === 'add-qr') {
                                                                            setPendingElementPosition({ x, y });
                                                                            handleQRAdd();
                                                                            return;
                                                                        }

                                                                        // Direct placement tools (Text, Redact, Highlight)
                                                                        let type = 'text';
                                                                        let content = 'Text';
                                                                        let width = 15;
                                                                        let height = 4;


                                                                        if (activeSubTool === 'add-text') {
                                                                            type = 'text';
                                                                            content = 'Text';
                                                                        } else if (activeSubTool === 'redact') {
                                                                            type = 'redact';
                                                                            content = '';
                                                                            width = 10;
                                                                            height = 2;
                                                                        } else if (activeSubTool === 'annotate') {
                                                                            type = 'highlight';
                                                                            content = '';
                                                                            width = 15;
                                                                            height = 3;
                                                                        }

                                                                        const newElement = {
                                                                            id: generateId(),
                                                                            type,
                                                                            content,
                                                                            x: Math.max(0, Math.min(x, 95)),
                                                                            y: Math.max(0, Math.min(y, 95)),
                                                                            width,
                                                                            height,
                                                                            color: type === 'redact' ? '#000000' : '#4f46e5',
                                                                            isPercentage: true
                                                                        };

                                                                        if (activePage) {
                                                                            setPages(pages.map(p => p.id === activePage.id ? { ...p, elements: [...(p.elements || []), newElement] } : p));
                                                                            setSelectedElementIndex((activePage.elements?.length || 0));
                                                                            if (type === 'text') setEditingTextIndex(activePage.elements?.length || 0);
                                                                        }
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={activePage.thumbnail}
                                                                        alt=""
                                                                        className="w-auto h-auto rounded shadow-sm object-contain block pointer-events-none select-none"
                                                                        style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 200px)' }}
                                                                    />
                                                                    {tool.id === 'crop' && (
                                                                        <CropOverlay
                                                                            crop={activePage.crop || { top: 0, right: 0, bottom: 0, left: 0 }}
                                                                            onChange={(c) => onCropChange(activePage.id, c)}
                                                                        />
                                                                    )}

                                                                    {activeSubTool === 'ocr' && (
                                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-40 rounded-lg">
                                                                            <div className="bg-surface-900 p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-6 max-w-sm text-center mx-4">
                                                                                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                                                                                    <ScanText className="w-8 h-8 text-orange-400" />
                                                                                </div>
                                                                                <div>
                                                                                    <h4 className="text-xl font-bold text-white mb-2">Start OCR Recognition</h4>
                                                                                    <p className="text-surface-400 text-sm">Convert this page image to editable text using artificial intelligence.</p>
                                                                                </div>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setShowOCRModal(true);
                                                                                    }}
                                                                                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20"
                                                                                >
                                                                                    Initialize OCR
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div className="absolute inset-x-0 top-[-48px] flex justify-center pointer-events-none z-50">
                                                                        <div className={`px-5 py-2 rounded-full bg-primary-600/90 backdrop-blur-md text-[10px] font-black text-white border border-primary-400/50 uppercase tracking-widest transition-all ${activeSubTool === 'select' ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                                                                            Click to place: {activeSubTool.replace('add-', '').replace('-', ' ')}
                                                                        </div>
                                                                    </div>

                                                                    {/* Elements Layer */}
                                                                    <div className="absolute inset-0 overflow-visible">
                                                                        {activePage.elements?.map((el, i) => {
                                                                            const pageIndex = pages.findIndex(p => p.id === activePage.id);
                                                                            let displayContent = el.content;
                                                                            if (el.type === 'page-number' && (el as any).pageNumbersData) {
                                                                                displayContent = (el as any).pageNumbersData.format
                                                                                    .replace('{n}', (pageIndex + 1).toString())
                                                                                    .replace('{total}', pages.length.toString());
                                                                            } else if (el.type === 'bates' && (el as any).batesData) {
                                                                                displayContent = `${(el as any).batesData.prefix}${String((el as any).batesData.startNum + pageIndex).padStart((el as any).batesData.digits, '0')}`;
                                                                            } else if (el.type === 'header-footer') {
                                                                                displayContent = (el.content || '')
                                                                                    .replace('{page}', (pageIndex + 1).toString())
                                                                                    .replace('{date}', new Date().toLocaleDateString())
                                                                                    .replace('{filename}', files[0]?.name || 'document.pdf');
                                                                            }

                                                                            // Calculate display dimensions
                                                                            // Get current width/height values
                                                                            let displayWidth: string | number;
                                                                            let displayHeight: string | number;

                                                                            if (selectedElementIndex === i && tempElementSize) {
                                                                                // During resize
                                                                                displayWidth = (tempElementSize as any).isPercentage
                                                                                    ? `${tempElementSize.width}%`
                                                                                    : tempElementSize.width;
                                                                                displayHeight = (el.type === 'shape' && el.shapeType === 'line')
                                                                                    ? 3
                                                                                    : ((tempElementSize as any).isPercentage
                                                                                        ? `${tempElementSize.height}%`
                                                                                        : tempElementSize.height);
                                                                            } else {
                                                                                // Normal display
                                                                                displayWidth = el.isPercentage
                                                                                    ? `${el.width || 15}%`
                                                                                    : (el.width || 80);
                                                                                displayHeight = (el.type === 'shape' && el.shapeType === 'line')
                                                                                    ? 3
                                                                                    : (el.isPercentage
                                                                                        ? `${el.height || 5}%`
                                                                                        : (el.height || 24));
                                                                            }

                                                                            return (
                                                                                <div
                                                                                    key={el.id || i}
                                                                                    style={{
                                                                                        position: 'absolute',
                                                                                        left: (selectedElementIndex === i && tempElementPos) ? `${tempElementPos.x}%` : `${el.x}%`,
                                                                                        top: (selectedElementIndex === i && tempElementPos) ? `${tempElementPos.y}%` : `${el.y}%`,
                                                                                        width: displayWidth,
                                                                                        height: displayHeight,
                                                                                        transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                                                                                        zIndex: selectedElementIndex === i ? 50 : 10,
                                                                                        cursor: el.locked ? 'not-allowed' : 'move',
                                                                                        // Performance optimizations for smooth drag/resize
                                                                                        willChange: (isDragging || isResizing) && selectedElementIndex === i ? 'transform, left, top, width, height' : 'auto',
                                                                                    }}
                                                                                    className={`group/el select-none ${selectedElementIndex === i ? 'outline outline-2 outline-primary-500 outline-offset-1' : ''}`}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setSelectedElementIndex(i);
                                                                                    }}
                                                                                    onMouseDown={(e) => handleElementDragStart(e, i)}
                                                                                    onTouchStart={(e) => handleElementDragStart(e, i)}
                                                                                    onDoubleClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        if (el.type === 'text' || el.type === 'watermark') {
                                                                                            setEditingTextIndex(i);
                                                                                        } else if (el.type === 'link') {
                                                                                            setEditingElementIndex(i);
                                                                                            setShowLinkModal(true);
                                                                                        } else if (el.type === 'qrcode') {
                                                                                            setEditingElementIndex(i);
                                                                                            setShowQRModal(true);
                                                                                        } else if (el.type === 'bates') {
                                                                                            setEditingElementIndex(i);
                                                                                            setShowBatesModal(true);
                                                                                        } else if (el.type === 'page-number') {
                                                                                            setEditingElementIndex(i);
                                                                                            setShowPageNumbersModal(true);
                                                                                        } else if (el.type === 'header-footer') {
                                                                                            setEditingElementIndex(i);
                                                                                            setShowHeaderFooterModal(true);
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    {/* Quick Action Toolbar on selected element */}
                                                                                    {selectedElementIndex === i && !isDragging && !isResizing && (
                                                                                        <div
                                                                                            className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-surface-900 border border-white/10 rounded-lg p-1 shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200"
                                                                                            onMouseDown={(e) => e.stopPropagation()}
                                                                                            onTouchStart={(e) => e.stopPropagation()}
                                                                                        >
                                                                                            {(el.type === 'text' || el.type === 'watermark' || el.type === 'link' || el.type === 'qrcode' || el.type === 'bates' || el.type === 'page-number' || el.type === 'header-footer') && (
                                                                                                <button
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        if (el.type === 'text' || el.type === 'watermark') {
                                                                                                            setEditingTextIndex(i);
                                                                                                        } else if (el.type === 'link') {
                                                                                                            setEditingElementIndex(i);
                                                                                                            setShowLinkModal(true);
                                                                                                        } else if (el.type === 'qrcode') {
                                                                                                            setEditingElementIndex(i);
                                                                                                            setShowQRModal(true);
                                                                                                        } else if (el.type === 'bates') {
                                                                                                            setEditingElementIndex(i);
                                                                                                            setShowBatesModal(true);
                                                                                                        } else if (el.type === 'page-number') {
                                                                                                            setEditingElementIndex(i);
                                                                                                            setShowPageNumbersModal(true);
                                                                                                        } else if (el.type === 'header-footer') {
                                                                                                            setEditingElementIndex(i);
                                                                                                            setShowHeaderFooterModal(true);
                                                                                                        }
                                                                                                    }}
                                                                                                    onMouseDown={(e) => e.stopPropagation()}
                                                                                                    className="p-2 hover:bg-white/10 rounded text-white active:scale-95 transition-all cursor-pointer"
                                                                                                    title="Edit"
                                                                                                >
                                                                                                    <Type className="w-4 h-4" />
                                                                                                </button>
                                                                                            )}

                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setPages(pages.map(p => p.id === activePage.id ? {
                                                                                                        ...p,
                                                                                                        elements: p.elements?.map((ele, idx) => idx === i ? { ...ele, rotation: (ele.rotation || 0) + 90 } : ele)
                                                                                                    } : p));
                                                                                                }}
                                                                                                onMouseDown={(e) => e.stopPropagation()}
                                                                                                className="p-2 hover:bg-white/10 rounded text-white active:scale-95 transition-all cursor-pointer"
                                                                                                title="Rotate"
                                                                                            >
                                                                                                <RotateCw className="w-4 h-4" />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setPages(pages.map(p => p.id === activePage.id ? {
                                                                                                        ...p,
                                                                                                        elements: [...(p.elements || []), { ...el, id: generateId(), x: el.x + 2, y: el.y + 2 }]
                                                                                                    } : p));
                                                                                                }}
                                                                                                onMouseDown={(e) => e.stopPropagation()}
                                                                                                className="p-2 hover:bg-white/10 rounded text-white active:scale-95 transition-all cursor-pointer"
                                                                                                title="Duplicate"
                                                                                            >
                                                                                                <Copy className="w-4 h-4" />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    // Apply element to all pages - replace existing elements of same type
                                                                                                    setPages(pages.map((p) => {
                                                                                                        // First, remove all elements of the same type from this page
                                                                                                        const filteredElements = (p.elements || []).filter(
                                                                                                            existingEl => existingEl.type !== el.type
                                                                                                        );

                                                                                                        // Create a copy of the element with a new ID
                                                                                                        const newElement = {
                                                                                                            ...el,
                                                                                                            id: generateId()
                                                                                                        };

                                                                                                        return {
                                                                                                            ...p,
                                                                                                            elements: [...filteredElements, newElement]
                                                                                                        };
                                                                                                    }));
                                                                                                    setSelectedElementIndex(null);
                                                                                                }}
                                                                                                onMouseDown={(e) => e.stopPropagation()}
                                                                                                className="p-2 hover:bg-green-500/20 text-green-400 rounded active:scale-95 transition-all cursor-pointer"
                                                                                                title="Apply to All Pages"
                                                                                            >
                                                                                                <Layers className="w-4 h-4" />
                                                                                            </button>
                                                                                            <div className="w-px h-4 bg-white/10 mx-0.5" />
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setPages(pages.map(p => p.id === activePage.id ? {
                                                                                                        ...p,
                                                                                                        elements: p.elements?.filter((_, idx) => idx !== i)
                                                                                                    } : p));
                                                                                                    setSelectedElementIndex(null);
                                                                                                }}
                                                                                                onMouseDown={(e) => e.stopPropagation()}
                                                                                                className="p-2 hover:bg-red-500/20 text-red-400 rounded active:scale-95 transition-all cursor-pointer"
                                                                                                title="Delete"
                                                                                            >
                                                                                                <Trash2 className="w-4 h-4" />
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                    {/* Element Content Based on Type */}
                                                                                    {el.type === 'text' && (
                                                                                        <div
                                                                                            className="text-black text-sm font-medium p-2 px-3 hover:bg-black/5 rounded min-w-[80px] cursor-text"
                                                                                            onDoubleClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setEditingTextIndex(i);
                                                                                                setSelectedElementIndex(i);
                                                                                            }}
                                                                                            style={{
                                                                                                fontFamily: (el as any).fontFamily || 'Arial',
                                                                                                fontSize: `${((el as any).fontSize || 16) * zoom}px`, // Visual scaling
                                                                                                fontWeight: (el as any).fontWeight || 400,
                                                                                                fontStyle: (el as any).fontStyle || 'normal',
                                                                                                textAlign: (el as any).textAlign || 'left',
                                                                                                color: (el as any).color || '#000000',
                                                                                                lineHeight: 1.2
                                                                                            }}
                                                                                        >
                                                                                            {displayContent}
                                                                                        </div>
                                                                                    )}
                                                                                    {el.type === 'stamp' && (
                                                                                        <div
                                                                                            className="w-full h-full flex items-center justify-center border-3 rounded font-black uppercase text-xs tracking-wider shadow-md"
                                                                                            style={{
                                                                                                borderColor: el.color || '#ef4444',
                                                                                                color: el.color || '#ef4444',
                                                                                                backgroundColor: `${el.color || '#ef4444'}15`
                                                                                            }}
                                                                                        >
                                                                                            {el.content || 'APPROVED'}
                                                                                        </div>
                                                                                    )}
                                                                                    {el.type === 'shape' && (
                                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                                            {(el.shapeType === 'rectangle' || !el.shapeType) && (
                                                                                                <div
                                                                                                    className="w-full h-full border-3 shadow-md"
                                                                                                    style={{ borderColor: el.color || '#3b82f6', backgroundColor: `${el.color || '#3b82f6'}20`, borderRadius: '4px' }}
                                                                                                />
                                                                                            )}
                                                                                            {el.shapeType === 'circle' && (
                                                                                                <div
                                                                                                    className="w-full h-full border-3 rounded-full shadow-md"
                                                                                                    style={{ borderColor: el.color || '#3b82f6', backgroundColor: `${el.color || '#3b82f6'}20` }}
                                                                                                />
                                                                                            )}
                                                                                            {el.shapeType === 'triangle' && (
                                                                                                <div
                                                                                                    className="w-0 h-0"
                                                                                                    style={{
                                                                                                        borderLeft: `${(el.width || 80) / 2}px solid transparent`,
                                                                                                        borderRight: `${(el.width || 80) / 2}px solid transparent`,
                                                                                                        borderBottom: `${el.height || 80}px solid ${el.color || '#3b82f6'}`,
                                                                                                        opacity: 0.8,
                                                                                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                                                                                    }}
                                                                                                />
                                                                                            )}
                                                                                            {el.shapeType === 'arrow' && (
                                                                                                <div className="w-full h-full flex items-center relative">
                                                                                                    <div className="flex-1 h-1" style={{ backgroundColor: el.color || '#3b82f6' }} />
                                                                                                    <div
                                                                                                        className="w-0 h-0"
                                                                                                        style={{
                                                                                                            borderTop: '10px solid transparent',
                                                                                                            borderBottom: '10px solid transparent',
                                                                                                            borderLeft: `15px solid ${el.color || '#3b82f6'}`
                                                                                                        }}
                                                                                                    />
                                                                                                </div>
                                                                                            )}
                                                                                            {el.shapeType === 'line' && (
                                                                                                <div
                                                                                                    className="w-full h-1"
                                                                                                    style={{ backgroundColor: el.color || '#3b82f6' }}
                                                                                                />
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                    {el.type === 'signature' && (
                                                                                        <>
                                                                                            {el.content && el.content.startsWith('data:image') ? (
                                                                                                <img
                                                                                                    src={el.content}
                                                                                                    alt="Signature"
                                                                                                    className="w-full h-full object-contain"
                                                                                                />
                                                                                            ) : (
                                                                                                <div className="p-2 px-4 italic text-blue-800 font-serif text-lg border-b-2 border-blue-800">
                                                                                                    {el.content || 'Signature'}
                                                                                                </div>
                                                                                            )}
                                                                                        </>
                                                                                    )}
                                                                                    {el.type === 'highlight' && (
                                                                                        <div
                                                                                            className="w-full h-full bg-yellow-300/60"
                                                                                        />
                                                                                    )}
                                                                                    {el.type === 'watermark' && (
                                                                                        <div
                                                                                            className="w-full h-full flex items-center justify-center opacity-30 select-none cursor-move overflow-visible"
                                                                                            style={{
                                                                                                color: el.color || '#000000',
                                                                                                fontSize: `${((el as any).fontSize || 60) * zoom}px`,
                                                                                                fontWeight: 900,
                                                                                                whiteSpace: 'nowrap'
                                                                                            }}
                                                                                        >
                                                                                            {displayContent || 'WATERMARK'}
                                                                                        </div>
                                                                                    )}
                                                                                    {el.type === 'image' && (
                                                                                        <div
                                                                                            className="w-full h-full border-2 border-gray-300 bg-white shadow-md rounded overflow-hidden"
                                                                                        >
                                                                                            {el.content && el.content.startsWith('data:image') ? (
                                                                                                <img
                                                                                                    src={el.content}
                                                                                                    alt="Uploaded"
                                                                                                    className="w-full h-full object-cover"
                                                                                                />
                                                                                            ) : (
                                                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                                                    <ImagePlus className="w-8 h-8" />
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                    {el.type === 'redact' && (
                                                                                        <div className="w-full h-full bg-black border border-white/20 shadow-xl flex items-center justify-center">
                                                                                            <EyeOff className="w-4 h-4 text-white/30" />
                                                                                        </div>
                                                                                    )}
                                                                                    {el.type === 'link' && (
                                                                                        <div className="w-full h-full border border-blue-400/50 bg-blue-500/10 rounded flex items-center px-2 gap-2 overflow-hidden backdrop-blur-sm">
                                                                                            <Link2 className="w-3 h-3 text-blue-500 shrink-0" />
                                                                                            <span className="text-[10px] text-blue-600 font-bold truncate underline">{displayContent}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {el.type === 'qrcode' && (
                                                                                        <div className="w-full h-full border-2 border-surface-200 bg-white rounded flex flex-col items-center justify-center gap-1 shadow-sm">
                                                                                            <QrCode className="w-1/2 h-1/2 text-surface-900" />
                                                                                            <span className="text-[8px] text-surface-500 font-bold px-1 truncate w-full text-center uppercase tracking-tighter">QR: {displayContent}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {el.type === 'bates' && (
                                                                                        <div className="w-full h-full border border-orange-400/50 bg-orange-500/10 rounded flex items-center px-2 gap-2 overflow-hidden backdrop-blur-sm">
                                                                                            <Hash className="w-3 h-3 text-orange-500 shrink-0" />
                                                                                            <span className="text-[10px] text-orange-600 font-bold truncate font-mono">{displayContent}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {el.type === 'page-number' && (
                                                                                        <div className="w-full h-full border border-green-400/50 bg-green-500/10 rounded flex items-center px-2 gap-2 overflow-hidden backdrop-blur-sm">
                                                                                            <ListOrdered className="w-3 h-3 text-green-500 shrink-0" />
                                                                                            <span className="text-[10px] text-green-600 font-bold truncate">{displayContent}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {el.type === 'header-footer' && (
                                                                                        <div className="w-full h-full border border-indigo-400/50 bg-indigo-500/10 rounded flex items-center px-2 gap-2 overflow-hidden backdrop-blur-sm">
                                                                                            <AlignCenter className="w-3 h-3 text-indigo-500 shrink-0" />
                                                                                            <span className="text-[10px] text-indigo-600 font-bold truncate">{displayContent}</span>
                                                                                        </div>
                                                                                    )}


                                                                                    {/* Element Controls - Always visible on touch, hover on desktop */}


                                                                                    {/* Resize handles (visible on selection) - much larger on mobile for touch */}
                                                                                    {selectedElementIndex === i && !el.locked && (
                                                                                        <>
                                                                                            {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((handle) => (
                                                                                                <div
                                                                                                    key={handle}
                                                                                                    className={`absolute ${isMobile ? 'w-7 h-7 -m-3.5' : 'w-3 h-3'} bg-white border-2 border-primary-500 rounded-full shadow-lg shadow-black/30 z-[60] active:scale-110`}
                                                                                                    style={{
                                                                                                        ...getHandleStyle(handle),
                                                                                                        touchAction: 'none',
                                                                                                    }}
                                                                                                    onMouseDown={(e) => handleElementResizeStart(e, handle)}
                                                                                                    onTouchStart={(e) => handleElementResizeStart(e, handle)}
                                                                                                />
                                                                                            ))}
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Mobile Bottom Toolbar - Touch Optimized */}
                                                            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-900/95 backdrop-blur-xl border-t border-white/10 z-[60] pb-safe">
                                                                {/* Secondary Controls Row (Zoom/Page/Done) */}
                                                                <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-surface-950/80">
                                                                    {/* Zoom Controls */}
                                                                    <div className="flex items-center gap-0.5 bg-surface-800/50 rounded-xl p-0.5">
                                                                        <button
                                                                            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                                                                            className="p-2.5 text-surface-400 hover:text-white active:bg-white/10 rounded-lg transition-colors touch-target"
                                                                            aria-label="Zoom out"
                                                                        >
                                                                            <ZoomOut className="w-5 h-5" />
                                                                        </button>
                                                                        <span className="text-xs font-bold text-white min-w-[40px] text-center px-1">
                                                                            {Math.round(zoom * 100)}%
                                                                        </span>
                                                                        <button
                                                                            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                                                                            className="p-2.5 text-surface-400 hover:text-white active:bg-white/10 rounded-lg transition-colors touch-target"
                                                                            aria-label="Zoom in"
                                                                        >
                                                                            <ZoomIn className="w-5 h-5" />
                                                                        </button>
                                                                    </div>

                                                                    {/* Page Navigation */}
                                                                    <div className="flex items-center gap-0.5 bg-surface-800/50 rounded-xl p-0.5">
                                                                        <button
                                                                            onClick={() => {
                                                                                const idx = pages.indexOf(activePage);
                                                                                if (idx > 0) setActivePageId(pages[idx - 1].id);
                                                                            }}
                                                                            disabled={pages.indexOf(activePage) === 0}
                                                                            className="p-2.5 text-surface-400 disabled:opacity-30 active:bg-white/10 rounded-lg transition-colors touch-target"
                                                                            aria-label="Previous page"
                                                                        >
                                                                            <ArrowRight className="w-5 h-5 rotate-180" />
                                                                        </button>
                                                                        <span className="text-xs font-bold text-white min-w-[50px] text-center">
                                                                            {pages.indexOf(activePage) + 1} / {pages.length}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => {
                                                                                const idx = pages.indexOf(activePage);
                                                                                if (idx < pages.length - 1) setActivePageId(pages[idx + 1].id);
                                                                            }}
                                                                            disabled={pages.indexOf(activePage) === pages.length - 1}
                                                                            className="p-2.5 text-surface-400 disabled:opacity-30 active:bg-white/10 rounded-lg transition-colors touch-target"
                                                                            aria-label="Next page"
                                                                        >
                                                                            <ArrowRight className="w-5 h-5" />
                                                                        </button>
                                                                    </div>

                                                                    {/* Done Button */}
                                                                    <button
                                                                        onClick={applyChanges}
                                                                        className="px-4 py-2.5 bg-primary-500 hover:bg-primary-400 active:bg-primary-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-primary-500/30 transition-all active:scale-95 touch-target"
                                                                    >
                                                                        Done
                                                                    </button>
                                                                </div>

                                                                {/* Main Tool Bar - Horizontally Scrollable */}
                                                                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-2 py-2.5">
                                                                    {editTools.filter(t => {
                                                                        // Mobile filter same as desktop
                                                                        if (tool.id === 'edit') return true;
                                                                        if (tool.id === 'annotate') return t.id === 'draw' || t.id === 'highlight' || t.id === 'select';
                                                                        if (tool.id === 'sign') return t.id === 'signature' || t.id === 'select';
                                                                        if (tool.id === 'reorder' || tool.id === 'rotate' || tool.id === 'delete-pages' || tool.id === 'duplicate-pages' || tool.id === 'extract-pages') return t.id === 'select';
                                                                        if (tool.id === 'crop') return t.id === 'select';
                                                                        return t.id === 'select' || t.id === tool.id || (tool.id === 'redact' && t.id === 'redact');
                                                                    }).map((item) => (
                                                                        <button
                                                                            key={item.id}
                                                                            onClick={() => setActiveSubTool(item.id)}
                                                                            className={`flex flex-col items-center justify-center gap-1.5 min-w-[72px] py-2.5 px-2 rounded-xl transition-all active:scale-95 touch-target ${activeSubTool === item.id
                                                                                ? 'bg-primary-500/15 text-primary-400 ring-1 ring-primary-500/30'
                                                                                : 'text-surface-400 active:bg-white/5'
                                                                                }`}
                                                                        >
                                                                            <item.icon className={`w-6 h-6 ${activeSubTool === item.id ? 'text-primary-400' : item.color}`} />
                                                                            <span className={`text-[10px] font-bold leading-none ${activeSubTool === item.id ? 'text-primary-400' : 'text-surface-500'}`}>
                                                                                {item.label}
                                                                            </span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95 duration-700">
                                                            <div className="w-16 h-16 rounded-2xl bg-surface-900 flex items-center justify-center border border-white/5 mb-4 shadow-xl">
                                                                <MousePointer2 className="w-8 h-8 text-primary-500 animate-pulse" />
                                                            </div>
                                                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Select a page to edit</h3>
                                                            <p className="text-surface-400 mt-1 text-sm">Click on a thumbnail above to start editing</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                                                <DndContext
                                                    sensors={sensors}
                                                    collisionDetection={closestCenter}
                                                    onDragEnd={handleDragEnd}
                                                >
                                                    <SortableContext
                                                        items={pages.map(p => p.id)}
                                                        strategy={rectSortingStrategy}
                                                    >
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 pb-20">
                                                            {pages.map((page, index) => (
                                                                <SortablePage
                                                                    key={page.id}
                                                                    page={page}
                                                                    index={index}
                                                                    onToggleSelect={toggleSelect}
                                                                    onCropChange={onCropChange}
                                                                    isReorderMode={true}
                                                                    isCropTool={tool.id === 'crop'}
                                                                />
                                                            ))}
                                                            {/* Hint for Extract tool */}
                                                            {tool.id === 'extract-pages' && pages.length > 0 && selectedCount === 0 && (
                                                                <div className="col-span-full py-4 text-center animate-pulse">
                                                                    <p className="text-amber-400 text-sm font-bold">Select pages you want to keep then click "Extract"</p>
                                                                </div>
                                                            )}
                                                            <div className="relative aspect-[3/4]">
                                                                <input
                                                                    type="file"
                                                                    multiple
                                                                    accept=".pdf"
                                                                    onChange={(e) => {
                                                                        const f = Array.from(e.target.files || []);
                                                                        if (f.length > 0) loadPdfs(f);
                                                                    }}
                                                                    className="hidden"
                                                                    id="file-input-visual"
                                                                />
                                                                <button
                                                                    onClick={() => document.getElementById('file-input-visual')?.click()}
                                                                    className="w-full h-full rounded-2xl border-2 border-dashed border-white/10 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all flex flex-col items-center justify-center gap-3 group"
                                                                >
                                                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                                        <Plus className="w-6 h-6 text-surface-500" />
                                                                    </div>
                                                                    <span className="text-xs font-bold text-surface-500 text-center px-4">Insert Documents</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </SortableContext>
                                                </DndContext>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : status === 'processing' ? (
                            <div className="h-full flex flex-col items-center justify-center py-20 bg-surface-950">
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-black text-primary-400">{progress}%</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{progressMessage || 'Finalizing PDF...'}</h3>
                                <p className="text-surface-400 font-medium tracking-wide">{progressMessage ? 'Please wait while we process your request.' : 'Applying all modifications to your document.'}</p>
                            </div>
                        ) : null}
                    </div >
                </div >
            )
            }

            {/* Landing/Success State (Idle/Error/Completed) */}
            {
                (status === 'idle' || status === 'error' || status === 'completed') && (
                    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 min-h-[400px] sm:min-h-[500px] flex flex-col justify-center animate-in fade-in duration-700">
                        {status === 'completed' ? (
                            <div className="bg-surface-900 border border-white/5 rounded-3xl sm:rounded-[3rem] overflow-hidden shadow-2xl p-6 sm:p-8 md:p-12 max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
                                <div className="text-center mb-8 sm:mb-10">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl shadow-green-500/20">
                                        <Check className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
                                    </div>
                                    <h3 className="text-2xl sm:text-4xl font-black text-white mb-2 uppercase tracking-tighter">SUCCESS!</h3>
                                    <p className="text-surface-400 font-medium text-base sm:text-lg">Your file is ready.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <button
                                        onClick={handleDownload}
                                        className="flex flex-col items-center gap-2 sm:gap-3 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl active:scale-95 transition-all group touch-target"
                                    >
                                        <Download className="w-6 h-6 sm:w-8 sm:h-8" />
                                        <span className="font-black uppercase tracking-wider text-[10px] sm:text-xs">Download</span>
                                    </button>
                                    <button
                                        onClick={reset}
                                        className="flex flex-col items-center gap-2 sm:gap-3 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-white/5 border border-white/10 text-surface-400 active:bg-white/10 transition-all group touch-target"
                                    >
                                        <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8" />
                                        <span className="font-black uppercase tracking-wider text-[10px] sm:text-xs">Start Over</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center">
                                <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 px-2">
                                    <div className="mb-8 sm:mb-10 text-center">
                                        <div className={`w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br ${tool.bgGradient} flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl group`}>
                                            <tool.icon className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
                                        </div>
                                        <h3 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4 uppercase tracking-tighter leading-none">Ready to {tool.shortName}?</h3>
                                        <p className="text-surface-400 text-base sm:text-xl font-medium max-w-lg mx-auto leading-relaxed mt-3 sm:mt-4 px-2">
                                            Open your PDF in our visual workspace. Fast, secure, processing in your browser.
                                        </p>
                                    </div>

                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={fileInputRef}
                                        multiple={true}
                                        accept=".pdf"
                                        onChange={(e) => {
                                            const picked = Array.from(e.target.files || []);
                                            if (picked.length > 0) loadPdfs(picked);
                                        }}
                                    />

                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="group w-full max-w-sm sm:max-w-md py-5 sm:py-8 px-6 sm:px-10 rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-r from-primary-500 to-primary-600 text-white font-black text-lg sm:text-2xl uppercase tracking-tighter shadow-2xl shadow-primary-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 sm:gap-4 border border-white/20 mx-auto touch-target"
                                    >
                                        <Zap className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
                                        <span>Upload PDF</span>
                                    </button>

                                    <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-8 text-surface-500">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-green-500/50" />
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Local Only</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-blue-500/50" />
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Secure</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-purple-500/50" />
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Smart</span>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="mt-10 p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-100 font-bold flex items-center gap-4 animate-shake max-w-md mx-auto">
                                            <X className="w-6 h-6 text-red-500 shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )
            }

            {/* Modals outside of fixed overlay to prevent stacking issues */}
            {
                showSignatureModal && (
                    <SignatureModal
                        onSave={handleSignatureSave}
                        onClose={() => {
                            setShowSignatureModal(false);
                            setPendingElementPosition(null);
                        }}
                    />
                )
            }
            {
                showImageModal && (
                    <ImageUploadModal
                        onSave={handleImageSave}
                        onClose={() => {
                            setShowImageModal(false);
                            setPendingElementPosition(null);
                        }}
                    />
                )
            }
            {
                showStampModal && (
                    <StampSelectorModal
                        onSelect={handleStampSelect}
                        onClose={() => {
                            setShowStampModal(false);
                            setPendingElementPosition(null);
                        }}
                    />
                )
            }
            {
                showShapeModal && (
                    <ShapeSelectorModal
                        onSelect={handleShapeSelect}
                        onClose={() => {
                            setShowShapeModal(false);
                            setPendingElementPosition(null);
                        }}
                    />
                )
            }

            {/* Text Editor Modal */}
            {
                editingTextIndex !== null && activePage && activePage.elements && activePage.elements[editingTextIndex] && (
                    <DirectTextEditor
                        key={`editor-${activePage.id}-${editingTextIndex}`}
                        text={activePage.elements[editingTextIndex]?.content || ''}
                        fontSize={(activePage.elements[editingTextIndex] as any)?.fontSize || 16}
                        fontFamily={(activePage.elements[editingTextIndex] as any)?.fontFamily || 'Arial'}
                        color={(activePage.elements[editingTextIndex] as any)?.color || '#000000'}
                        textAlign={(activePage.elements[editingTextIndex] as any)?.textAlign || 'left'}
                        bold={((activePage.elements[editingTextIndex] as any)?.fontWeight || 400) > 400}
                        italic={(activePage.elements[editingTextIndex] as any)?.fontStyle === 'italic' || (activePage.elements[editingTextIndex] as any)?.italic}
                        x={(window.innerWidth - 580) / 2}
                        y={Math.max(100, (window.innerHeight - 500) / 2)}
                        width={200}
                        height={100}
                        onSave={(updated) => {
                            setPages(prev => {
                                const pageIndex = prev.findIndex(p => p.id === activePage.id);
                                if (pageIndex === -1) return prev;

                                const newPages = [...prev];
                                const newPage = { ...newPages[pageIndex] };
                                const newElements = [...(newPage.elements || [])];

                                if (!newElements[editingTextIndex]) return prev;

                                newElements[editingTextIndex] = {
                                    ...newElements[editingTextIndex],
                                    content: updated.content,
                                    fontSize: updated.fontSize,
                                    fontFamily: updated.fontFamily,
                                    color: updated.color,
                                    textAlign: updated.textAlign,
                                    fontWeight: updated.bold ? 700 : 400,
                                    fontStyle: updated.italic ? 'italic' : 'normal',
                                } as any;

                                newPage.elements = newElements;
                                newPages[pageIndex] = newPage;
                                return newPages;
                            });
                            setEditingTextIndex(null);
                        }}
                        onCancel={() => setEditingTextIndex(null)}
                        onDelete={() => {
                            setPages(prev => {
                                const pageIndex = prev.findIndex(p => p.id === activePage.id);
                                if (pageIndex === -1) return prev;

                                const newPages = [...prev];
                                const newPage = { ...newPages[pageIndex] };

                                newPage.elements = newPage.elements?.filter((_, idx) => idx !== editingTextIndex);
                                newPages[pageIndex] = newPage;
                                return newPages;
                            });
                            setEditingTextIndex(null);
                            setSelectedElementIndex(null);
                        }}
                    />
                )
            }

            {/* OCR Processor Modal */}
            {
                showOCRModal && (
                    <OCRProcessor
                        onClose={() => setShowOCRModal(false)}
                        onComplete={handleOCRComplete}
                        pageImages={pages.map(p => ({
                            pageIndex: p.originalIndex,
                            imageData: p.thumbnail
                        }))}
                    />
                )
            }

            {
                showLinkModal && activePage && (
                    <LinkModal
                        initialUrl={editingElementIndex !== null ? (activePage?.elements?.[editingElementIndex]?.content || '') : ''}
                        onClose={() => { setShowLinkModal(false); setEditingElementIndex(null); }}
                        onSave={(url) => {
                            saveElement({ type: 'link', content: url, width: 15, height: 4, color: '#2563eb' });
                            setShowLinkModal(false);
                        }}
                    />
                )
            }

            {
                showQRModal && activePage && (
                    <QRCodeModal
                        initialContent={editingElementIndex !== null ? (activePage?.elements?.[editingElementIndex]?.content || '') : ''}
                        onClose={() => { setShowQRModal(false); setEditingElementIndex(null); }}
                        onSave={(content) => {
                            saveElement({ type: 'qrcode', content, width: 20, height: 20, color: '#000000' });
                            setShowQRModal(false);
                        }}
                    />
                )
            }

            {
                showBatesModal && pages.length > 0 && (
                    <BatesModal
                        initialData={editingElementIndex !== null && activePage?.elements ? activePage.elements[editingElementIndex]?.batesData : null}
                        onClose={() => { setShowBatesModal(false); setEditingElementIndex(null); }}
                        onSave={(data) => {
                            saveElement({
                                type: 'bates',
                                batesData: data,
                                content: `${data.prefix}${String(data.startNum).padStart(data.digits, '0')}`,
                                width: 20,
                                height: 4,
                                fontSize: 14,
                                fontFamily: 'Courier',
                                fontWeight: 700,
                                color: '#000000'
                            });
                            setShowBatesModal(false);
                        }}
                    />
                )
            }

            {
                showPageNumbersModal && pages.length > 0 && (
                    <PageNumbersModal
                        initialData={editingElementIndex !== null && activePage?.elements ? activePage.elements[editingElementIndex]?.pageNumbersData : null}
                        onClose={() => { setShowPageNumbersModal(false); setEditingElementIndex(null); }}
                        onSave={(data) => {
                            saveElement({
                                type: 'page-number',
                                pageNumbersData: data,
                                content: data.format.replace('{n}', '1').replace('{total}', pages.length.toString()),
                                width: 15,
                                height: 4,
                                fontSize: 12,
                                color: '#000000'
                            });
                            setShowPageNumbersModal(false);
                        }}
                    />
                )
            }

            {
                showHeaderFooterModal && pages.length > 0 && (
                    <HeaderFooterModal
                        initialText={editingElementIndex !== null && activePage?.elements ? (activePage.elements[editingElementIndex]?.content || '') : ''}
                        onClose={() => { setShowHeaderFooterModal(false); setEditingElementIndex(null); }}
                        onSave={(text) => {
                            saveElement({
                                type: 'header-footer',
                                content: text,
                                width: 30,
                                height: 4,
                                fontSize: 10,
                                color: '#666666'
                            });
                            setShowHeaderFooterModal(false);
                        }}
                    />
                )
            }
            {
                showBulkRedactModal && (
                    <BulkRedactModal
                        onClose={() => setShowBulkRedactModal(false)}
                        onSave={handleBulkRedactSave}
                    />
                )
            }
        </>
    );
}
