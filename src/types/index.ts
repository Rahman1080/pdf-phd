// PDF Studio - Core Types

export interface PDFDocument {
    id: string;
    name: string;
    file: File;
    pages: PDFPage[];
    totalPages: number;
    modified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface PDFPage {
    index: number;
    width: number;
    height: number;
    rotation: number;
    thumbnail?: string;
    elements: PageElement[];
}

// Base element interface
export interface BaseElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    zIndex: number;
    locked: boolean;
}

export type ElementType = 'text' | 'image' | 'shape' | 'signature' | 'watermark' | 'drawing';

// Text element
export interface TextElement extends BaseElement {
    type: 'text';
    content: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: number;
    fontStyle: 'normal' | 'italic';
    color: string;
    backgroundColor?: string;
    textAlign: 'left' | 'center' | 'right';
    lineHeight: number;
}

// Image element
export interface ImageElement extends BaseElement {
    type: 'image';
    src: string; // base64 or URL
    originalWidth: number;
    originalHeight: number;
    aspectRatio: number;
    fit: 'contain' | 'cover' | 'fill';
    borderRadius: number;
    border?: {
        width: number;
        color: string;
        style: 'solid' | 'dashed' | 'dotted';
    };
}

// Shape element
export interface ShapeElement extends BaseElement {
    type: 'shape';
    shapeType: 'rectangle' | 'circle' | 'triangle' | 'arrow' | 'line';
    fill: string;
    stroke: string;
    strokeWidth: number;
    borderRadius?: number;
    arrowType?: 'single' | 'double';
}

// Signature element
export interface SignatureElement extends BaseElement {
    type: 'signature';
    signatureType: 'draw' | 'type' | 'upload' | 'capture' | 'qrcode' | 'sms' | 'email' | 'notarize';
    data: string; // base64 image or text
    initials?: string | null;
    signedAt: Date;
    signedBy?: string;
}

// Watermark element
export interface WatermarkElement extends BaseElement {
    type: 'watermark';
    watermarkType: 'text' | 'image';
    content: string; // text or base64 image
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    tiled: boolean;
    tileSpacing?: number;
    pattern: 'diagonal' | 'horizontal' | 'center';
}

// Drawing element (freehand)
export interface DrawingElement extends BaseElement {
    type: 'drawing';
    paths: DrawingPath[];
    strokeColor: string;
    strokeWidth: number;
}

export interface DrawingPath {
    points: { x: number; y: number }[];
    color: string;
    width: number;
}

export type PageElement =
    | TextElement
    | ImageElement
    | ShapeElement
    | SignatureElement
    | WatermarkElement
    | DrawingElement;

// Tool types
export type Tool =
    | 'select'
    | 'text'
    | 'image'
    | 'shape'
    | 'signature'
    | 'watermark'
    | 'draw'
    | 'highlight'
    | 'stamp'
    | 'qrcode'
    | 'pan';

// History for undo/redo
export interface HistoryState {
    id: string;
    timestamp: Date;
    action: string;
    pages: PDFPage[];
}

// Export options
export interface ExportOptions {
    format: 'pdf' | 'png' | 'jpg';
    quality: number;
    compress: boolean;
    includeAnnotations: boolean;
    pageRange?: { start: number; end: number };
    dpi?: number;
}

// Merge options
export interface MergeOptions {
    documents: File[];
    order: number[];
}

// Split options
export interface SplitOptions {
    mode: 'all' | 'range' | 'custom';
    ranges?: { start: number; end: number }[];
    customPages?: number[];
}

// Compress options
export interface CompressOptions {
    level: 'low' | 'medium' | 'high' | 'extreme';
    downsampleImages: boolean;
    imageQuality: number;
    removeMetadata: boolean;
}

// Editor state
export interface EditorState {
    document: PDFDocument | null;
    currentPage: number;
    zoom: number;
    tool: Tool;
    selectedElement: PageElement | null;
    clipboard: PageElement | null;
    history: HistoryState[];
    historyIndex: number;
    isLoading: boolean;
    isSaving: boolean;
    showGrid: boolean;
    snapToGrid: boolean;
    gridSize: number;
}

// Color preset
export interface ColorPreset {
    name: string;
    color: string;
}

// Font preset
export interface FontPreset {
    name: string;
    family: string;
    weights: number[];
}

// Template
export interface Template {
    id: string;
    name: string;
    thumbnail: string;
    category: string;
    elements: PageElement[];
}

// Project save format
export interface ProjectFile {
    version: string;
    document: PDFDocument;
    settings: EditorSettings;
    createdAt: Date;
    updatedAt: Date;
}

export interface EditorSettings {
    theme: 'dark' | 'light';
    autoSave: boolean;
    autoSaveInterval: number;
    defaultExportFormat: ExportOptions['format'];
    recentFiles: string[];
}
