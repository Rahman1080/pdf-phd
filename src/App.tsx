// PDF Studio - Complete Application with Advanced Tools
import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import * as pdfjsLib from 'pdfjs-dist';

import 'pdfjs-dist/web/pdf_viewer.css';
import { PDFDocument, degrees, rgb, StandardFonts, LineCapStyle, BlendMode } from '@cantoo/pdf-lib';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import {
  FileText, MousePointer2, Type, Image, Download, ZoomIn, ZoomOut, Trash2,
  ChevronLeft, ChevronRight, Loader2, X, Check, ArrowLeft, ArrowLeftRight, RotateCcw, RotateCw, Copy,
  Settings, Undo, Redo, Lock, Unlock, Square, Circle, Triangle, Star, Minus, ArrowRight, Droplet,
  Scissors, Highlighter,
  ChevronUp, ChevronDown, Merge, FileUp, Plus, ArrowUpDown,
  FileOutput, Hash, Trash, QrCode, Layers, Crop, FileSearch, EyeOff,
  Signature, StickyNote, Shapes, MessageSquare,
  Stamp, ImageDown, ScanText, Palette, Search, HelpCircle,
  Maximize, Move, XCircle, DownloadCloud, Zap, BookOpen,
  Minimize, Code, Files, Table2, FormInput, PenTool,
  Hexagon, Octagon, Cloud, Heart, Diamond, CheckSquare, XSquare, Crown, Eraser, PanelLeft,
  Tag, Pin, Smile, LayoutGrid, History, Accessibility, FileDown, Keyboard, Diff, Wrench, Shield, Link2
} from 'lucide-react';

import * as XLSX from 'xlsx';
import { renderAsync } from 'docx-preview';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-json';
// @ts-ignore - imported for HTML entity decoding in certain conversions
import he from 'he'; void he;
import html2canvas from 'html2canvas';
import { createWorker } from 'tesseract.js';

import { WordEditor } from './components/WordEditor';
import { EditableWordEditor } from './components/EditableWordEditor';
import { ExcelExporter } from './components/ExcelExporter';
import { PowerPointExporter } from './components/PowerPointExporter';
import { MaterialGallery } from './components/MaterialGallery';
import { DownloadArea } from './components/DownloadArea';
import { AddFieldsPanel } from './components/AddFieldsPanel';
import { TableCreator } from './components/TableCreator';
import { SignatureCreator } from './components/SignatureCreator';
import MobileSign from './components/MobileSign';
import type { FormField } from './components/AddFieldsPanel';
import type { TableData } from './components/TableCreator';
import { CONVERT_TO_PDF } from './config/api';
import { handleVisualHTMLExport } from './utils/visualHtmlHandler';

// New Feature Components (17 Missing Features Implementation)
import { KeyboardShortcutsPanel } from './components/KeyboardShortcutsPanel';
import { ContextMenu } from './components/ContextMenu';
import { TemplatesPanel } from './components/TemplatesPanel';
import { GuidedTour } from './components/GuidedTour';
import { StampsLibrary } from './components/StampsLibrary';
import { VisualCompare } from './components/VisualCompare';
import { VersionHistoryPanel } from './components/VersionHistory';
import { AccessibilityPanel } from './components/AccessibilityPanel';
import { BulkStampModal } from './components/BulkStampModal';
import { AdvancedExportModal } from './components/AdvancedExportModal';
import { FDFImportModal } from './components/FDFImportModal';
import { applyBulkStamp } from './utils/advancedExports';
import type { StampOptions } from './utils/advancedExports';


import { persistenceService } from './services/persistence';
import type { PersistentState, SerializedTab } from './services/persistence';

// Microsoft Office Logo Icons - Authentic high-fidelity brand designs
const WordLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Page background */}
    <rect x="5.5" y="3.5" width="13" height="17" rx="1" fill="#E1EAF6" />
    <path d="M7.5 7.5H16.5M7.5 10.5H16.5M7.5 13.5H16.5M7.5 16.5H13.5" stroke="#2B579A" strokeWidth="1" strokeLinecap="round" />
    {/* Brand plate */}
    <rect x="2.5" y="5.5" width="10" height="13" rx="1.5" fill="#2B579A" />
    <path d="M4.5 9.5L5.75 14.5L7 11L8.25 14.5L9.5 9.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ExcelLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Page background */}
    <rect x="5.5" y="3.5" width="13" height="17" rx="1" fill="#E7F3EC" />
    <path d="M7.5 6.5V17.5M10.5 6.5V17.5M13.5 6.5V17.5M16.5 6.5V17.5M7.5 6.5H16.5M7.5 9.5H16.5M7.5 12.5H16.5M7.5 15.5H16.5" stroke="#217346" strokeWidth="0.5" strokeOpacity="0.3" />
    {/* Brand plate */}
    <rect x="2.5" y="5.5" width="10" height="13" rx="1.5" fill="#217346" />
    <path d="M5 10L9 14M9 10L5 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PowerPointLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Page background */}
    <rect x="5.5" y="3.5" width="13" height="17" rx="1" fill="#FCEAE6" />
    <path d="M14 8C14 10.2091 12.2091 12 10 12C7.79086 12 6 10.2091 6 8C6 5.79086 7.79086 4 10 4V8H14Z" fill="#D24726" fillOpacity="0.2" />
    <circle cx="12" cy="12" r="5" fill="#D24726" fillOpacity="0.1" />
    {/* Brand plate */}
    <rect x="2.5" y="5.5" width="10" height="13" rx="1.5" fill="#D24726" />
    <path d="M5 9.5V14.5H6.5C7.32843 14.5 8 13.8284 8 13V11C8 10.1716 7.32843 9.5 6.5 9.5H5Z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="6.2" cy="11" r="0.5" fill="white" />
  </svg>
);



const GrayscaleLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Document Body */}
    <path d="M5 2C3.34315 2 2 3.34315 2 5V35C2 36.6569 3.34315 38 5 38H27C28.6569 38 30 36.6569 30 35V11L21 2H5Z" fill="white" stroke="#666" strokeWidth="2" />
    {/* Folded Corner */}
    <path d="M21 2V11H30" stroke="#666" strokeWidth="2" strokeLinejoin="round" />
    {/* PDF Brand Plate (Grayscale) */}
    <path d="M1 21H18C21.3137 21 24 23.6863 24 27V27C24 30.3137 21.3137 33 18 33H1V21Z" fill="#777" />
    {/* PDF Text */}
    <text x="4" y="29.5" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">PDF</text>
  </svg>
);

// Use CDN for PDF.js worker to avoid MIME type issues on some hosting providers
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs';



// Custom Color Palette for high-fidelity backgrounds
const BG_COLORS = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Paper White', hex: '#fdfcf0' },
  { name: 'Ivory Cream', hex: '#fefce8' },
  { name: 'Soft Smoke', hex: '#f3f4f6' },
  { name: 'Sky Mist', hex: '#eff6ff' },
  { name: 'Mint Leaf', hex: '#f0fdf4' },
  { name: 'Soft Amber', hex: '#fffbeb' },
  { name: 'Petal Rose', hex: '#fff1f1' },
  { name: 'Steel Slate', hex: '#f8fafc' },
  { name: 'Gentle Violet', hex: '#f5f3ff' },
  { name: 'Dark Mode', hex: '#1a1a1a' },
  { name: 'Midnight Blue', hex: '#0f172a' },
  { name: 'Deep Forest', hex: '#064e3b' },
  { name: 'Maroon', hex: '#7f1d1d' },
  { name: 'Vibrant Red', hex: '#ef4444' },
  { name: 'Golden Sun', hex: '#f59e0b' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Royal Blue', hex: '#3b82f6' },
  { name: 'Ocean Wave', hex: '#0ea5e9' },
  { name: 'Amethyst', hex: '#8b5cf6' },
  { name: 'Magenta', hex: '#d946ef' },
  { name: 'Hot Pink', hex: '#ec4899' },
  { name: 'Coffee', hex: '#4b3621' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Coral', hex: '#ff7f50' },
  { name: 'Salmon', hex: '#fa8072' },
  { name: 'Khaki', hex: '#f0e68c' },
  { name: 'Lavender', hex: '#e6e6fa' },
  { name: 'Plum', hex: '#dda0dd' },
  { name: 'Orchid', hex: '#da70d6' },
  { name: 'Azure', hex: '#f0ffff' },
  { name: 'Beige', hex: '#f5f5dc' },
  { name: 'Wheat', hex: '#f5deb3' },
  { name: 'Misty Rose', hex: '#ffe4e1' },
  { name: 'Old Lace', hex: '#fdf5e6' },
  { name: 'Sea Shell', hex: '#fff5ee' },
  { name: 'Ghost White', hex: '#f8f8ff' },
  { name: 'Alice Blue', hex: '#f0f8ff' },
  { name: 'Clear/None', hex: 'transparent' },
  // Additional Trend Colors
  { name: 'Sage', hex: '#87a96b' },
  { name: 'Terracotta', hex: '#e2725b' },
  { name: 'Mauve', hex: '#e0b0ff' },
  { name: 'Periwinkle', hex: '#ccccff' },
  { name: 'Charcoal', hex: '#36454f' },
  { name: 'Deep Sea', hex: '#006994' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Emerald Night', hex: '#043927' },
];

// Smart Tooltip for descriptive tool insights
function SmartTooltip({ text, description, children, position = 'bottom' }: { text: string; description?: string; children: React.ReactNode; position?: 'top' | 'bottom' | 'left' | 'right' }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<any>(null);

  const show = () => {
    if (window.innerWidth < 1024) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let top = 0;
      let left = 0;

      if (position === 'bottom') {
        top = rect.bottom + 8;
        left = centerX;
      } else if (position === 'top') {
        top = rect.top - 8;
        left = centerX;
      } else if (position === 'left') {
        top = centerY;
        left = rect.left - 8;
      } else if (position === 'right') {
        top = centerY;
        left = rect.right + 8;
      }
      setCoords({ top, left });
    }
    setVisible(true);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, []);

  return (
    <div ref={triggerRef} className="relative inline-block" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: coords.top,
            left: coords.left,
            transform: position === 'left' ? 'translate(-100%, -50%)' :
              position === 'right' ? 'translate(0, -50%)' :
                position === 'top' ? 'translate(-50%, -100%)' :
                  'translate(-50%, 0)'
          }}
        >
          <div className="p-3 rounded-xl bg-surface-900 border border-white/10 shadow-2xl min-w-[120px] max-w-[200px] text-left animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
              <p className="text-[10px] font-black text-white uppercase tracking-wider whitespace-nowrap">{text}</p>
            </div>
            {description && <p className="text-[10px] text-surface-400 leading-tight font-medium">{description}</p>}
            <div className={`absolute w-2 h-2 bg-surface-900 border-l border-t border-white/10 rotate-45 
                ${position === 'bottom' ? '-top-1 left-1/2 -translate-x-1/2' :
                position === 'top' ? '-bottom-1 left-1/2 -translate-x-1/2 rotate-[225deg]' :
                  position === 'left' ? '-right-1 top-1/2 -translate-y-1/2 rotate-[135deg]' :
                    '-left-1 top-1/2 -translate-y-1/2 rotate-[-45deg]'
              }`}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function BackgroundModal({ initialColor, onApply, onClose }: { initialColor?: string; onApply: (color: string, all: boolean) => void; onClose: () => void }) {
  const [selectedHex, setSelectedHex] = useState(initialColor || 'transparent');
  const selectedColor = BG_COLORS.find(c => c.hex.toLowerCase() === selectedHex.toLowerCase());

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Palette className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Add Background Color</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setSelectedHex('transparent'); onApply('transparent', false); }} className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-tighter border border-red-400/20 px-2 py-1 rounded hover:bg-red-400/10 transition-colors">Clear Page</button>
          <button onClick={() => { setSelectedHex('transparent'); onApply('transparent', true); }} className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-tighter border border-red-400/20 px-2 py-1 rounded hover:bg-red-400/10 transition-colors">Clear All Pages</button>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2 block">Premium Preview</label>
        <div className="w-full h-24 rounded-xl shadow-inner flex flex-col items-center justify-center gap-1 border border-white/10 transition-all duration-300 overflow-hidden relative"
          style={{ backgroundColor: selectedHex === 'transparent' ? '#27272a' : selectedHex }}>
          {selectedHex === 'transparent' && (
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }} />
          )}
          <span className="text-sm font-bold mix-blend-difference invert uppercase z-10" style={{ color: selectedHex === 'transparent' ? '#ffffff' : selectedHex }}>
            {selectedColor?.name || (selectedHex === 'transparent' ? 'No Background' : 'Custom Color')}
          </span>
          <span className="text-xs font-mono opacity-60 mix-blend-difference invert z-10" style={{ color: selectedHex === 'transparent' ? '#ffffff' : selectedHex }}>
            {selectedHex === 'transparent' ? 'Standard White' : selectedHex}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">Quick Select Palette</label>
          <input type="color" value={selectedHex === 'transparent' ? '#ffffff' : selectedHex} onChange={e => setSelectedHex(e.target.value)} className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-none" />
        </div>
        <div className="grid grid-cols-6 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {BG_COLORS.map(c => (
            <button key={c.hex} onClick={() => setSelectedHex(c.hex)}
              className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 shadow-sm relative overflow-hidden ${selectedHex === c.hex ? 'border-white scale-110 shadow-lg' : 'border-white/5'}`}
              style={{ backgroundColor: c.hex === 'transparent' ? 'white' : c.hex }} title={c.name}>
              {c.hex === 'transparent' && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-px bg-red-500 rotate-45" /></div>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <div className="flex gap-2 flex-[2]">
          <button onClick={() => onApply(selectedHex, false)} className="btn-primary flex-1 !bg-purple-600 hover:!bg-purple-500 text-xs">Apply Current</button>
          <button onClick={() => onApply(selectedHex, true)} className="btn-primary flex-1 !bg-green-600 hover:!bg-green-500 text-xs">Apply to All</button>
        </div>
      </div>
    </div></div>
  );
}

// Types
interface PDFPageData { id: string; pageNumber: number; width: number; height: number; rotation: number; }
interface BaseElement { id: string; x: number; y: number; width: number; height: number; rotation: number; opacity: number; locked: boolean; visible: boolean; zIndex: number; syncGroupId?: string; }
interface TextEl extends BaseElement { type: 'text'; content: string; fontSize: number; fontFamily: string; color: string; textAlign: string; bold: boolean; italic: boolean; original?: boolean; originalRect?: { x: number; y: number; w: number; h: number }; }
interface ShapeEl extends BaseElement { type: 'shape'; shapeType: string; fill: string; stroke: string; strokeWidth: number; }
interface ImageEl extends BaseElement { type: 'image'; src: string; }
interface SignatureEl extends BaseElement { type: 'signature'; src: string; }
interface WatermarkEl extends BaseElement { type: 'watermark'; content: string; fontSize: number; color: string; }
interface DrawingEl extends BaseElement { type: 'drawing'; paths: string; stroke: string; strokeWidth: number; }
interface HighlightEl extends BaseElement { type: 'highlight'; color: string; }
interface StickyNoteEl extends BaseElement { type: 'stickynote'; content: string; color: string; }
interface CropEl extends BaseElement { type: 'crop'; }
interface RedactionEl extends BaseElement { type: 'redaction'; color: string; }
interface FormFieldEl extends BaseElement {
  type: 'formfield';
  fieldType: 'text' | 'date' | 'name' | 'number' | 'dropdown' | 'checkbox' | 'radio' | 'formula' | 'email' | 'company' | 'title' | 'zipcode' | 'currency';
  value: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  options?: string[];
  label?: string;
  helpText?: string;
  fontSize?: number;
}
interface TableEl extends BaseElement {
  type: 'table';
  rows: number;
  cols: number;
  cellWidth: number;
  cellHeight: number;
  borderColor: string;
  borderWidth: number;
  headerBg: string;
  cellBg: string;
  cells: string[][];
  autoHeight?: boolean;
}
interface HyperlinkEl extends BaseElement { type: 'hyperlink'; url: string; content: string; fontSize: number; color: string; }
type PDFElement = TextEl | ShapeEl | ImageEl | SignatureEl | WatermarkEl | DrawingEl | HighlightEl | StickyNoteEl | CropEl | RedactionEl | FormFieldEl | TableEl | HyperlinkEl;
export interface LoadedPDF {
  file: File;
  name: string;
  pageCount: number;
  pdfLibDoc: PDFDocument;
  pdfDoc: any; // PDF.js doc
  elements: { [page: number]: PDFElement[] };
  pages: PDFPageData[];
  extractedText?: { [page: number]: PDFElement[] };
  pageBackgrounds?: { [page: number]: string };
  sourcePageMapping?: number[]; // Maps current page index to original PDF page index
  _cachedBuffer?: ArrayBuffer;
  _cachedFile?: File;
}
export interface PDFTab {
  id: string;
  title: string;
  pdf: LoadedPDF | null;
}

const genId = () => crypto.randomUUID();
const genTabId = () => 'tab-' + crypto.randomUUID();

// Helper to parse color and alpha
const parseColor = (color: string) => {
  if (!color) return { rgb: rgb(0, 0, 0), alpha: 1 };

  if (color.startsWith('#')) {
    const hex = color.slice(1);
    let r = 0, g = 0, b = 0, a = 1;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16) / 255;
      g = parseInt(hex[1] + hex[1], 16) / 255;
      b = parseInt(hex[2] + hex[2], 16) / 255;
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16) / 255;
      g = parseInt(hex.slice(2, 4), 16) / 255;
      b = parseInt(hex.slice(4, 6), 16) / 255;
      a = 1; // Default alpha for 6-digit hex
    } else if (hex.length === 8) {
      r = parseInt(hex.slice(0, 2), 16) / 255;
      g = parseInt(hex.slice(2, 4), 16) / 255;
      b = parseInt(hex.slice(4, 6), 16) / 255;
      a = parseInt(hex.slice(6, 8), 16) / 255;
    }
    return { rgb: rgb(r, g, b), alpha: a };
  }

  if (color.startsWith('rgb')) {
    const parts = color.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      const isNormalized = parseFloat(parts[0]) <= 1;
      const scale = isNormalized ? 1 : 255;
      const r = parseFloat(parts[0]) / scale;
      const g = parseFloat(parts[1]) / scale;
      const b = parseFloat(parts[2]) / scale;
      const a = parts.length > 3 ? parseFloat(parts[3]) : 1;
      return { rgb: rgb(r, g, b), alpha: a };
    }
  }
  return { rgb: rgb(0, 0, 0), alpha: 1 };
};

// Helper to determine text color based on background luminance
const getContrastColor = (hex: string) => {
  if (!hex || hex === 'transparent') return '#1f2937';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1f2937' : '#ffffff';
};

// Welcome Screen
function WelcomeScreen({ onFileSelect, onFilesSelect, onConvertFile, onConvertFiles, onAction, isPremium, onTogglePremium }: {
  onFileSelect: (f: File) => void;
  onFilesSelect: (files: File[]) => void;
  onConvertFile?: (f: File) => void;
  onConvertFiles?: (files: File[]) => void;
  onAction?: (id: string) => void;
  isPremium: boolean;
  onTogglePremium: () => void;
}) {
  const [drag, setDrag] = useState(false);
  const [dragConvert, setDragConvert] = useState(false);

  // Massive list of supported formats for the input's 'accept' attribute
  const supportedFormats = '.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.ico,.icns,.svg,.txt,.html,.htm,.md,.csv,.doc,.docx,.docm,.dot,.dotx,.dotm,.rtf,.odt,.xls,.xlsx,.xlsm,.xlsb,.ods,.ppt,.pptx,.pptm,.pot,.potx,.odp,.js,.ts,.tsx,.py,.java,.c,.cpp,.cs,.go,.rs,.rb,.php,.swift,.kt,.sh,.yml,.yaml,.json,.xml,.sql,.css,.scss,.log,.ini,.conf';

  const handlePdfDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.toLowerCase().endsWith('.pdf'));
    if (files.length === 1) {
      onFileSelect(files[0]);
    } else if (files.length > 1) {
      onFilesSelect(files);
    }
  };

  const handlePdfInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 1) {
      onFileSelect(files[0]);
    } else if (files.length > 1) {
      onFilesSelect(files);
    }
  };

  const handleConvertDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragConvert(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 1) {
      if (onConvertFile) onConvertFile(files[0]);
    } else if (files.length > 1 && onConvertFiles) {
      onConvertFiles(files);
    }
  };

  const handleConvertInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 1) {
      if (onConvertFile) onConvertFile(files[0]);
    } else if (files.length > 1 && onConvertFiles) {
      onConvertFiles(files);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-auto scrollbar-hide" style={{ background: '#09090b' }}>
      {/* Animated background highlights */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px] animate-pulse-soft" />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        {/* Logo & Headline */}
        <div className="text-center mb-12">
          <img
            src="/logo-phd.png"
            alt="PDF PhD"
            className="w-60 h-auto mb-6 mx-auto rounded-3xl hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
          />
          <div className="flex justify-center mb-6">
            <button
              onClick={onTogglePremium}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-300 ${isPremium
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-110'
                : 'bg-surface-900 border-surface-800 text-surface-500 hover:border-surface-700 hover:scale-105'
                }`}
            >
              <Crown className={`w-5 h-5 ${isPremium ? 'text-amber-400 animate-bounce-slow' : 'text-surface-600'}`} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {isPremium ? 'Pro Engine Enabled' : 'Switch to Pro Engine'}
              </span>
            </button>
          </div>
          <p className="text-surface-400 text-lg max-w-2xl mx-auto italic">
            A professional-grade PDF workspace that runs <span className="text-primary-400 font-bold">{isPremium ? 'with High-Fidelity Engine' : '100% locally'}</span>.
          </p>
        </div>

        {/* Main Upload Sections - Two Columns */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* PDF Upload */}
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handlePdfDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
            className={`group p-6 rounded-[2rem] cursor-pointer text-center transition-all duration-500 relative overflow-hidden bg-white/5 border border-white/10 hover:bg-white/[0.08] ${drag ? 'ring-4 ring-primary-500/50 bg-primary-500/5 scale-[0.98]' : ''}`}
          >
            <input type="file" id="fileInput" accept=".pdf" multiple className="hidden" onChange={handlePdfInputChange} />
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 bg-gradient-to-br from-primary-500 to-primary-700 shadow-[0_0_30px_rgba(139,92,246,0.3)] relative">
              <FileText className="w-10 h-10 text-white" />
              {isPremium && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow border-2 border-surface-950">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Open PDF</h3>
            <p className="text-surface-400 text-sm mb-5 font-medium">Edit, sign, annotate existing documents</p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-5 py-2 rounded-full text-[11px] font-black text-primary-400 bg-primary-500/10 border border-primary-500/20 uppercase tracking-widest">Fast Loading</span>
              <span className="px-5 py-2 rounded-full text-[11px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 uppercase tracking-widest flex items-center gap-2">
                <Merge className="w-3.5 h-3.5" />
                Multiple = Merge
              </span>
            </div>
          </div>

          {/* Any File to PDF */}
          <div
            onDragOver={e => { e.preventDefault(); setDragConvert(true); }}
            onDragLeave={() => setDragConvert(false)}
            onDrop={handleConvertDrop}
            onClick={() => document.getElementById('convertFileInput')?.click()}
            className={`group p-6 rounded-[2rem] cursor-pointer text-center transition-all duration-500 relative overflow-hidden bg-white/5 border border-white/10 hover:bg-white/[0.08] ${dragConvert ? 'ring-4 ring-accent-500/50 bg-accent-500/5 scale-[0.98]' : ''}`}
          >
            <input type="file" id="convertFileInput" accept={supportedFormats} multiple className="hidden" onChange={handleConvertInputChange} />
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <FileUp className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Convert to PDF</h3>
            <p className="text-surface-400 text-sm mb-5 font-medium">Word, Excel, PowerPoint, Images & Code</p>

            {/* Format Chips Grid */}
            <div className="space-y-3 mb-8">
              <div className="flex flex-wrap justify-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold">
                  <WordLogo className="w-4 h-4" /><span className="text-blue-400">DOC</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold">
                  <ExcelLogo className="w-4 h-4" /><span className="text-emerald-400">XLS</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold">
                  <PowerPointLogo className="w-4 h-4" /><span className="text-orange-500">PPT</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold">
                  <Image className="w-4 h-4 text-pink-400" /><span className="text-pink-400">IMG</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold">
                  <Code className="w-4 h-4 text-cyan-400" /><span className="text-cyan-400">CODE</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2 opacity-50">
                {['RTF', 'ODT', 'ODS', 'ODP', 'TXT', 'CSV', 'HTML'].map(f => (
                  <span key={f} className="px-2 py-1 bg-white/5 rounded text-[9px] font-bold text-surface-400">{f}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-5 py-2 rounded-full text-[11px] font-black text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">High Fidelity</span>
              <span className="px-5 py-2 rounded-full text-[11px] font-black text-pink-500 bg-pink-500/10 border border-pink-500/20 uppercase tracking-widest flex items-center gap-2">
                <Files className="w-3.5 h-3.5" />
                Batch Convert
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="w-full mb-12">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xs font-black text-surface-500 uppercase tracking-[0.3em]">Quick Tools</h2>
            <button onClick={() => onAction?.('explore')} className="text-xs font-bold text-primary-400 hover:underline">Explore All Tools</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { id: 'merge', icon: Merge, label: 'Merge', color: 'text-blue-400' },
              { id: 'split', icon: Scissors, label: 'Split', color: 'text-red-400' },
              { id: 'protect', icon: Lock, label: 'Protect', color: 'text-yellow-400' },
              { id: 'bates', icon: Hash, label: 'Bates ID', color: 'text-emerald-400' },
              { id: 'redact', icon: EyeOff, label: 'Redact', color: 'text-slate-400' },
              { id: 'sign', icon: Signature, label: 'Sign', color: 'text-purple-400' },
            ].map(tool => (
              <button
                key={tool.id}
                onClick={() => onAction?.(tool.id)}
                className="group p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.08] transition-all flex flex-col items-center gap-3"
              >
                <tool.icon className={`w-8 h-8 ${tool.color} transition-transform group-hover:scale-110`} />
                <span className="text-xs font-bold text-surface-300">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 py-4 px-8 rounded-full bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest">100% Client-Side Magic</span>
        </div>
      </div>
    </div>
  );
}

// Signature Pad
function SignaturePad({ onSave, onClose }: { onSave: (d: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const getPos = (e: any) => { const r = ref.current!.getBoundingClientRect(); const x = (e.touches?.[0]?.clientX ?? e.clientX) - r.left; const y = (e.touches?.[0]?.clientY ?? e.clientY) - r.top; return { x, y }; };
  const start = (e: any) => { setDrawing(true); const ctx = ref.current!.getContext('2d')!; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const draw = (e: any) => { if (!drawing) return; const ctx = ref.current!.getContext('2d')!; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke(); };
  const clear = () => ref.current!.getContext('2d')!.clearRect(0, 0, 400, 200);
  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal !max-w-lg" onClick={e => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-white mb-4">Draw Signature</h3>
      <canvas ref={ref} width={400} height={200} className="w-full bg-white rounded-lg mb-4 cursor-crosshair touch-none" onMouseDown={start} onMouseMove={draw} onMouseUp={() => setDrawing(false)} onMouseLeave={() => setDrawing(false)} onTouchStart={start} onTouchMove={draw} onTouchEnd={() => setDrawing(false)} />
      <div className="flex justify-between"><button onClick={clear} className="btn-secondary">Clear</button><div className="flex gap-2"><button onClick={onClose} className="btn-secondary">Cancel</button><button onClick={() => onSave(ref.current!.toDataURL())} className="btn-primary">Save</button></div></div>
    </div></div>
  );
}

// Watermark Modal
function WatermarkModal({ onApply, onClose }: { onApply: (t: string, o: number, type: 'text' | 'image', src?: string) => void; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('CONFIDENTIAL');
  const [image, setImage] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(0.2);

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setImage(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div className="modal !max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Droplet className="w-6 h-6 text-primary-400" />
            PDF Watermark
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5 text-surface-500" /></button>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface-800 p-1 rounded-xl mb-6">
          <button onClick={() => setActiveTab('text')} className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'text' ? 'bg-primary-500 text-white shadow-lg' : 'text-surface-400 hover:text-white'}`}>Text</button>
          <button onClick={() => setActiveTab('image')} className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'image' ? 'bg-primary-500 text-white shadow-lg' : 'text-surface-400 hover:text-white'}`}>Brand Logo</button>
        </div>

        <div className="space-y-6 mb-8">
          {activeTab === 'text' ? (
            <div>
              <label className="input-label mb-2">Watermark Text</label>
              <input type="text" value={text} onChange={e => setText(e.target.value)} className="input !bg-surface-800/50 !border-white/10 focus:!border-primary-500/50 py-3" placeholder="e.g. DRAFT, CONFIDENTIAL" />
            </div>
          ) : (
            <div>
              <label className="input-label mb-2">Logo Image</label>
              {image ? (
                <div className="relative group rounded-xl overflow-hidden bg-white/5 border border-white/10 p-4 flex items-center justify-center min-h-[140px]">
                  <img src={image} alt="Watermark" className="max-h-24 opacity-60 grayscale" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                    <button onClick={handleImageUpload} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">Change</button>
                    <button onClick={() => setImage(null)} className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-500">Remove</button>
                  </div>
                </div>
              ) : (
                <button onClick={handleImageUpload} className="w-full py-12 rounded-xl border-2 border-dashed border-white/10 hover:border-primary-500/30 hover:bg-primary-500/5 text-surface-400 hover:text-primary-400 transition-all flex flex-col items-center gap-2">
                  <Image className="w-8 h-8" />
                  <span className="text-sm font-medium">Click to upload brand logo</span>
                </button>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="input-label">Transparency</label>
              <span className="text-xs font-bold text-primary-400">{Math.round(opacity * 100)}%</span>
            </div>
            <input type="range" min="0.05" max="0.5" step="0.05" value={opacity} onChange={e => setOpacity(+e.target.value)} className="w-full slider" />
            <div className="flex justify-between text-[10px] text-surface-600 mt-1">
              <span>Subtle</span>
              <span>Noticeable</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-surface-400 hover:text-white transition-colors">Cancel</button>
          <button
            onClick={() => onApply(text, opacity, activeTab, image || undefined)}
            disabled={activeTab === 'image' && !image}
            className="btn-primary !px-8 !py-2.5 !rounded-xl !text-sm flex items-center gap-2 shadow-xl shadow-primary-500/20 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Apply to All Pages
          </button>
        </div>
      </div>
    </div>
  );
}

// Merge Modal
function MergeModal({ onMerge, onClose }: { onMerge: (files: File[]) => void; onClose: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const add = () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.pdf'; i.multiple = true; i.onchange = () => setFiles(f => [...f, ...Array.from(i.files || [])]); i.click(); };
  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal !max-w-md" onClick={e => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-white mb-4">Merge PDFs</h3>
      <div className="mb-4 max-h-48 overflow-auto">{files.map((f, i) => <div key={i} className="flex items-center justify-between py-2 px-3 mb-2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}><span className="text-sm text-gray-300 truncate">{f.name}</span><button onClick={() => setFiles(files.filter((_, j) => j !== i))}><X className="w-4 h-4 text-gray-500" /></button></div>)}</div>
      <button onClick={add} className="w-full py-2 mb-4 rounded-lg border-2 border-dashed text-gray-400 hover:text-white hover:border-purple-500" style={{ borderColor: 'rgba(255,255,255,0.1)' }}><FileUp className="w-4 h-4 inline mr-2" />Add PDFs</button>
      <div className="flex justify-end gap-2"><button onClick={onClose} className="btn-secondary">Cancel</button><button onClick={() => { if (files.length > 1) onMerge(files); }} disabled={files.length < 2} className="btn-primary">Merge</button></div>
    </div></div>
  );
}
// Image to PDF Modal
function ImageToPDFModal({ onConvert, onClose }: { onConvert: (files: File[]) => void; onClose: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const add = () => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/png, image/jpeg, image/jpg'; i.multiple = true; i.onchange = () => setFiles(f => [...f, ...Array.from(i.files || [])]); i.click(); };
  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal !max-w-md" onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-3 mb-4 text-purple-400"><Image className="w-6 h-6" /><h3 className="text-lg font-semibold text-white">Images to PDF</h3></div>
      <p className="text-gray-400 text-sm mb-4">Convert multiple images into a single PDF document.</p>

      <div className="mb-4 max-h-48 overflow-auto">
        {files.length === 0 && <p className="text-center text-gray-500 py-4 italic">No images selected</p>}
        {files.map((f, i) => <div key={i} className="flex items-center justify-between py-2 px-3 mb-2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}><span className="text-sm text-gray-300 truncate">{f.name}</span><button onClick={() => setFiles(files.filter((_, j) => j !== i))}><X className="w-4 h-4 text-gray-500" /></button></div>)}
      </div>

      <button onClick={add} className="w-full py-2 mb-4 rounded-lg border-2 border-dashed text-gray-400 hover:text-white hover:border-purple-500" style={{ borderColor: 'rgba(255,255,255,0.1)' }}><FileUp className="w-4 h-4 inline mr-2" />Add Images</button>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => { if (files.length > 0) onConvert(files); }} disabled={files.length === 0} className="btn-primary">Convert to PDF</button>
      </div>
    </div></div>
  );
}

// Split Modal
function SplitModal({ pages, onSplit, onClose }: { pages: number; onSplit: (ranges: string) => void; onClose: () => void }) {
  const [ranges, setRanges] = useState('1-' + Math.ceil(pages / 2) + ', ' + (Math.ceil(pages / 2) + 1) + '-' + pages);
  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-white mb-4">Split PDF</h3>
      <p className="text-gray-400 text-sm mb-4">Total pages: {pages}. Enter ranges (e.g., "1-3, 4-6")</p>
      <input type="text" value={ranges} onChange={e => setRanges(e.target.value)} className="input mb-4" />
      <div className="flex justify-end gap-2"><button onClick={onClose} className="btn-secondary">Cancel</button><button onClick={() => onSplit(ranges)} className="btn-primary">Split</button></div>
    </div></div>
  );
}

// Enhanced Compress Modal with Presets
function CompressModal({ onCompress, onClose }: { onCompress: (options: { quality: number; preset: string; downscaleImages: boolean; removeMetadata: boolean }) => void; onClose: () => void }) {
  const [quality, setQuality] = useState(0.7);
  const [preset, setPreset] = useState<'web' | 'print' | 'email' | 'custom'>('web');
  const [downscaleImages, setDownscaleImages] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(false);

  const presets = {
    web: { quality: 0.6, description: 'Optimized for fast web loading', size: '~40% smaller' },
    print: { quality: 0.85, description: 'High quality for printing', size: '~20% smaller' },
    email: { quality: 0.5, description: 'Small size for email attachments', size: '~60% smaller' },
    custom: { quality: quality, description: 'Your custom settings', size: 'Variable' }
  };

  useEffect(() => {
    if (preset !== 'custom') {
      setQuality(presets[preset].quality);
    }
  }, [preset]);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <Minimize className="w-6 h-6 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Compress PDF</h3>
        </div>

        {/* Preset Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {(['web', 'print', 'email', 'custom'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`p-3 rounded-xl text-center transition-all ${preset === p ? 'bg-emerald-500/30 ring-2 ring-emerald-500 text-emerald-300' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
            >
              <div className="text-xs font-bold uppercase">{p}</div>
              <div className="text-[10px] opacity-70">{presets[p].size}</div>
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-400 mb-4">{presets[preset].description}</p>

        {/* Quality Slider */}
        <div className="mb-4">
          <label className="input-label flex justify-between">
            <span>Quality</span>
            <span className="text-emerald-400 font-mono">{Math.round(quality * 100)}%</span>
          </label>
          <input
            type="range"
            min="0.3"
            max="1"
            step="0.05"
            value={quality}
            onChange={e => { setQuality(+e.target.value); setPreset('custom'); }}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Smaller file</span>
            <span>Better quality</span>
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-2 mb-4 p-3 bg-white/5 rounded-xl">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={downscaleImages} onChange={e => setDownscaleImages(e.target.checked)} className="accent-emerald-500" />
            <span className="text-sm text-gray-300">Downscale large images (max 1200px)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={removeMetadata} onChange={e => setRemoveMetadata(e.target.checked)} className="accent-emerald-500" />
            <span className="text-sm text-gray-300">Remove metadata (author, dates, etc.)</span>
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={() => onCompress({ quality, preset, downscaleImages, removeMetadata })} className="btn-primary bg-emerald-600 hover:bg-emerald-500">
            <Minimize className="w-4 h-4 mr-2" />Compress
          </button>
        </div>
      </div>
    </div>
  );
}



// Reorder Modal
function ReorderModal({ pages, onReorder, onClose }: { pages: number; onReorder: (order: number[]) => void; onClose: () => void }) {
  const [order, setOrder] = useState(Array.from({ length: pages }, (_, i) => i + 1).join(', '));

  const handleReorder = () => {
    let orderStr = order.trim();

    // For small PDFs (9 pages or less), allow "213" shorthand
    // For larger PDFs, require separators to avoid ambiguity (e.g., "1213" could be 1,2,13 or 12,13)
    if (pages <= 9 && !orderStr.match(/[, ]/)) {
      orderStr = orderStr.split('').join(',');
    }

    const newOrder = orderStr.split(/[, ]+/).map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 1 && n <= pages);

    if (newOrder.length === 0) return alert('Invalid order. Please enter valid page numbers.');
    if (newOrder.length !== pages) {
      // Warn but allow (user might want to remove/duplicate pages)
      const proceed = confirm(`You entered ${newOrder.length} pages but document has ${pages} pages. Continue?`);
      if (!proceed) return;
    }
    onReorder(newOrder);
  };

  const reverseAll = () => setOrder(Array.from({ length: pages }, (_, i) => pages - i).join(', '));
  const oddFirst = () => {
    const odds = Array.from({ length: pages }, (_, i) => i + 1).filter(n => n % 2 === 1);
    const evens = Array.from({ length: pages }, (_, i) => i + 1).filter(n => n % 2 === 0);
    setOrder([...odds, ...evens].join(', '));
  };
  const evenFirst = () => {
    const odds = Array.from({ length: pages }, (_, i) => i + 1).filter(n => n % 2 === 1);
    const evens = Array.from({ length: pages }, (_, i) => i + 1).filter(n => n % 2 === 0);
    setOrder([...evens, ...odds].join(', '));
  };
  const shuffleRandom = () => {
    const arr = Array.from({ length: pages }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setOrder(arr.join(', '));
  };
  const swapHalves = () => {
    const mid = Math.ceil(pages / 2);
    const first = Array.from({ length: mid }, (_, i) => i + 1);
    const second = Array.from({ length: pages - mid }, (_, i) => i + mid + 1);
    setOrder([...second, ...first].join(', '));
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-white mb-2">Reorder Pages</h3>
      <p className="text-gray-400 text-sm mb-1">Total pages: <span className="text-white font-medium">{pages}</span></p>
      <p className="text-gray-500 text-xs mb-3">
        {pages <= 9
          ? 'Enter page numbers (e.g., "321" or "3, 2, 1")'
          : 'Use commas or spaces between page numbers (e.g., "50, 49, 48, 1, 2")'}
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        <button onClick={reverseAll} className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded text-xs font-medium transition-colors">Reverse All</button>
        <button onClick={oddFirst} className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded text-xs font-medium transition-colors">Odd First</button>
        <button onClick={evenFirst} className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-300 rounded text-xs font-medium transition-colors">Even First</button>
        <button onClick={swapHalves} className="px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600/40 text-orange-300 rounded text-xs font-medium transition-colors">Swap Halves</button>
        <button onClick={shuffleRandom} className="px-3 py-1.5 bg-pink-600/20 hover:bg-pink-600/40 text-pink-300 rounded text-xs font-medium transition-colors">Shuffle</button>
      </div>

      <textarea
        value={order}
        onChange={e => setOrder(e.target.value)}
        className="input mb-4 w-full h-24 resize-none text-sm"
        placeholder={pages <= 9 ? "e.g. 321 or 3, 2, 1" : "e.g. 5, 4, 3, 2, 1"}
      />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={handleReorder} className="btn-primary">Reorder</button>
      </div>
    </div></div>
  );
}

// Extract Pages Modal
function ExtractPagesModal({ pages, onExtract, onClose }: { pages: number; onExtract: (pageList: string) => void; onClose: () => void }) {
  const [pageRange, setPageRange] = useState('1-' + pages);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-white mb-2">Extract Pages</h3>
      <p className="text-gray-400 text-sm mb-4">Download selected pages as a new PDF file.</p>

      <div className="mb-4">
        <label className="input-label">Pages to Extract</label>
        <input
          type="text"
          value={pageRange}
          onChange={e => setPageRange(e.target.value)}
          className="input"
          placeholder="e.g., 1-5, 8, 10-12"
        />
        <p className="text-gray-500 text-xs mt-1">Use ranges (1-5) and/or individual pages (8, 10)</p>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setPageRange('1-' + Math.ceil(pages / 2))} className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded text-xs">First Half</button>
        <button onClick={() => setPageRange((Math.ceil(pages / 2) + 1) + '-' + pages)} className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-300 rounded text-xs">Second Half</button>
        <button onClick={() => setPageRange(Array.from({ length: pages }, (_, i) => i + 1).filter(n => n % 2 === 1).join(', '))} className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded text-xs">Odd Pages</button>
        <button onClick={() => setPageRange(Array.from({ length: pages }, (_, i) => i + 1).filter(n => n % 2 === 0).join(', '))} className="px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600/40 text-orange-300 rounded text-xs">Even Pages</button>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => onExtract(pageRange)} className="btn-primary">Extract & Download</button>
      </div>
    </div></div>
  );
}

// Page Numbers Modal
function PageNumbersModal({ pages, onApply, onClose }: { pages: number; onApply: (options: { position: string; format: string; startNum: number; prefix: string; margin: number }) => void; onClose: () => void }) {
  const [position, setPosition] = useState('bottom-center');
  const [format, setFormat] = useState('number');
  const [startNum, setStartNum] = useState(1);
  const [prefix, setPrefix] = useState('');
  const [margin, setMargin] = useState(40);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-white mb-4">Add Page Numbers</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="input-label">Position</label>
          <select value={position} onChange={e => setPosition(e.target.value)} className="input !py-2">
            <option value="bottom-center">Bottom Center</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-right">Bottom Right</option>
            <option value="top-center">Top Center</option>
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
          </select>
        </div>
        <div>
          <label className="input-label">Format</label>
          <select value={format} onChange={e => setFormat(e.target.value)} className="input !py-2">
            <option value="number">1, 2, 3...</option>
            <option value="roman">I, II, III...</option>
            <option value="page-of">Page X of Y</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="input-label">Start Number</label>
          <input type="number" value={startNum} onChange={e => setStartNum(Number(e.target.value))} className="input" min={1} />
        </div>
        <div>
          <label className="input-label">Margin (px)</label>
          <input type="number" value={margin} onChange={e => setMargin(Number(e.target.value))} className="input" min={10} max={200} />
        </div>
        <div>
          <label className="input-label">Prefix</label>
          <input type="text" value={prefix} onChange={e => setPrefix(e.target.value)} className="input" placeholder="Page " />
        </div>
      </div>

      <p className="text-gray-400 text-xs mb-2">Preview: <span className="text-white">{prefix}{format === 'roman' ? 'I' : format === 'page-of' ? `Page ${startNum} of ${pages}` : startNum}</span></p>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
        <p className="text-blue-300 text-xs">?? <strong>Tip:</strong> After adding, you can edit any page number - change its position, font, color, or even the text format (like "Page 1" or "page - 1"). Then click <strong>"Apply Styles to All Pages"</strong> in Properties to sync ALL changes including the text format to every page.</p>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => onApply({ position, format, startNum, prefix, margin })} className="btn-primary">Add Page Numbers</button>
      </div>
    </div></div>
  );
}

// Delete Pages Modal
function DeletePagesModal({ pages, onDelete, onClose }: { pages: number; onDelete: (pageList: number[]) => void; onClose: () => void }) {
  const [pageRange, setPageRange] = useState('');

  const parsePages = (input: string): number[] => {
    const result: number[] = [];
    input.split(',').forEach(part => {
      part = part.trim();
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        for (let i = start; i <= end; i++) if (i >= 1 && i <= pages) result.push(i);
      } else {
        const n = parseInt(part);
        if (n >= 1 && n <= pages) result.push(n);
      }
    });
    return [...new Set(result)].sort((a, b) => a - b);
  };

  const parsedPages = parsePages(pageRange);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-white mb-2">Delete Pages</h3>
      <p className="text-gray-400 text-sm mb-4">Remove specific pages from the document.</p>

      <div className="mb-4">
        <label className="input-label">Pages to Delete</label>
        <input
          type="text"
          value={pageRange}
          onChange={e => setPageRange(e.target.value)}
          className="input"
          placeholder="e.g., 1, 3-5, 8"
        />
      </div>

      {parsedPages.length > 0 && (
        <p className="text-red-400 text-sm mb-4">
          Will delete {parsedPages.length} page(s): {parsedPages.join(', ')}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button
          onClick={() => parsedPages.length > 0 && onDelete(parsedPages)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          disabled={parsedPages.length === 0}
        >Delete Pages</button>
      </div>
    </div></div>
  );
}

// Rotate All Pages Modal
function RotateAllModal({ onRotate, onClose }: { onRotate: (angle: number) => void; onClose: () => void }) {
  const [angle, setAngle] = useState(90);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-white mb-4">Rotate All Pages</h3>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {[90, 180, 270, -90].map(a => (
          <button
            key={a}
            onClick={() => setAngle(a)}
            className={`py-3 rounded-lg text-sm font-medium transition-colors ${angle === a ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
          >
            {a > 0 ? `${a}°` : `${-a}° CCW`}
          </button>
        ))}
      </div>

      <p className="text-gray-500 text-xs mb-4">This will rotate all pages in the document by the selected angle.</p>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => onRotate(angle)} className="btn-primary">Rotate All</button>
      </div>
    </div></div>
  );
}

// PDF Metadata Editor Modal
function MetadataModal({ metadata, onSave, onClose }: { metadata: { title: string; author: string; subject: string; keywords: string }; onSave: (m: { title: string; author: string; subject: string; keywords: string }) => void; onClose: () => void }) {
  const [title, setTitle] = useState(metadata.title);
  const [author, setAuthor] = useState(metadata.author);
  const [subject, setSubject] = useState(metadata.subject);
  const [keywords, setKeywords] = useState(metadata.keywords);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-white mb-4">Edit PDF Metadata</h3>

      <div className="space-y-3 mb-4">
        <div>
          <label className="input-label">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="Document title" />
        </div>
        <div>
          <label className="input-label">Author</label>
          <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="input" placeholder="Author name" />
        </div>
        <div>
          <label className="input-label">Subject</label>
          <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="input" placeholder="Document subject" />
        </div>
        <div>
          <label className="input-label">Keywords</label>
          <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} className="input" placeholder="keyword1, keyword2, keyword3" />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => onSave({ title, author, subject, keywords })} className="btn-primary">Save Metadata</button>
      </div>
    </div></div>
  );
}

// Export Pages as Images Modal
function ExportImagesModal({ onExport, onClose }: { pages?: number; onExport: (format: string, quality: number, pageRange: string) => void; onClose: () => void }) {
  const [format, setFormat] = useState('png');
  const [quality, setQuality] = useState(90);
  const [pageRange, setPageRange] = useState('all');

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-white mb-4">Export Pages as Images</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="input-label">Format</label>
          <select value={format} onChange={e => setFormat(e.target.value)} className="input !py-2">
            <option value="png">PNG (Lossless)</option>
            <option value="jpeg">JPEG (Smaller)</option>
            <option value="webp">WebP (Modern)</option>
          </select>
        </div>
        <div>
          <label className="input-label">Quality: {quality}%</label>
          <input type="range" min="50" max="100" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full mt-2" />
        </div>
      </div>

      <div className="mb-4">
        <label className="input-label">Pages</label>
        <div className="flex gap-2">
          <button onClick={() => setPageRange('all')} className={`flex-1 py-2 rounded-lg text-sm ${pageRange === 'all' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300'}`}>All Pages</button>
          <button onClick={() => setPageRange('current')} className={`flex-1 py-2 rounded-lg text-sm ${pageRange === 'current' ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300'}`}>Current Page</button>
        </div>
      </div>

      <p className="text-gray-500 text-xs mb-4">Images will be downloaded as a ZIP file for multiple pages.</p>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => onExport(format, quality, pageRange)} className="btn-primary">Export Images</button>
      </div>
    </div></div>
  );
}

// Export Text Modal - Plain Text, Markdown, HTML
function ExportTextModal({ onExport, onClose }: { onExport: (format: 'txt' | 'md' | 'html' | 'visual-html', options: { preserveLayout: boolean; includeImages: boolean }) => void; onClose: () => void }) {
  const [format, setFormat] = useState<'txt' | 'md' | 'html' | 'visual-html'>('txt');
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [includeImages, setIncludeImages] = useState(false);

  const formats = [
    { id: 'txt' as const, label: 'Plain Text', icon: '??', desc: 'Simple text, no formatting' },
    { id: 'md' as const, label: 'Markdown', icon: '??', desc: 'With headings and links' },
    { id: 'html' as const, label: 'HTML (Text)', icon: '??', desc: 'Text extraction with styles' },
    { id: 'visual-html' as const, label: 'HTML (Visual)', icon: '???', desc: 'Page images - preserves everything' },
  ];

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Export as Text</h3>
        </div>

        {/* Format Selection */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {formats.map(f => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`p-3 rounded-xl text-center transition-all ${format === f.id ? 'bg-blue-500/30 ring-2 ring-blue-500 text-blue-300' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
            >
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-xs font-bold">{f.label}</div>
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-400 mb-4">{formats.find(f => f.id === format)?.desc}</p>

        {/* Options */}
        <div className="space-y-2 mb-4 p-3 bg-white/5 rounded-xl">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={preserveLayout} onChange={e => setPreserveLayout(e.target.checked)} className="accent-blue-500" />
            <span className="text-sm text-gray-300">Preserve paragraph layout</span>
          </label>
          {format === 'html' && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={includeImages} onChange={e => setIncludeImages(e.target.checked)} className="accent-blue-500" />
              <span className="text-sm text-gray-300">Include embedded images (base64)</span>
            </label>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={() => onExport(format, { preserveLayout, includeImages })} className="btn-primary bg-blue-600 hover:bg-blue-500">
            <Download className="w-4 h-4 mr-2" />Export
          </button>
        </div>
      </div>
    </div>
  );
}

// Table Extraction Modal - Extract tables to CSV/Excel
function TableExtractionModal({ onExtract, onClose, pageCount }: { onExtract: (format: 'csv' | 'xlsx', pageRange: string) => void; onClose: () => void; pageCount: number }) {
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv');
  const [pageRange, setPageRange] = useState('all');
  const [customRange, setCustomRange] = useState('');

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <Table2 className="w-6 h-6 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Extract Tables</h3>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Automatically detect and extract tables from your PDF. Works best with clearly formatted tables.
        </p>

        {/* Format Selection */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setFormat('csv')}
            className={`p-4 rounded-xl text-center transition-all ${format === 'csv' ? 'bg-green-500/30 ring-2 ring-green-500 text-green-300' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
          >
            <div className="text-2xl mb-1">??</div>
            <div className="text-sm font-bold">CSV</div>
            <div className="text-xs opacity-70">Universal format</div>
          </button>
          <button
            onClick={() => setFormat('xlsx')}
            className={`p-4 rounded-xl text-center transition-all ${format === 'xlsx' ? 'bg-green-500/30 ring-2 ring-green-500 text-green-300' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
          >
            <div className="text-2xl mb-1">??</div>
            <div className="text-sm font-bold">Excel</div>
            <div className="text-xs opacity-70">Multi-sheet support</div>
          </button>
        </div>

        {/* Page Range */}
        <div className="mb-4">
          <label className="input-label">Pages to scan</label>
          <div className="flex gap-2 mb-2">
            <button onClick={() => setPageRange('all')} className={`flex-1 py-2 rounded-lg text-sm ${pageRange === 'all' ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-300'}`}>All ({pageCount})</button>
            <button onClick={() => setPageRange('current')} className={`flex-1 py-2 rounded-lg text-sm ${pageRange === 'current' ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-300'}`}>Current</button>
            <button onClick={() => setPageRange('custom')} className={`flex-1 py-2 rounded-lg text-sm ${pageRange === 'custom' ? 'bg-green-600 text-white' : 'bg-white/10 text-gray-300'}`}>Custom</button>
          </div>
          {pageRange === 'custom' && (
            <input type="text" value={customRange} onChange={e => setCustomRange(e.target.value)} className="input" placeholder="e.g., 1-3, 5, 7-10" />
          )}
        </div>

        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-4">
          <p className="text-xs text-yellow-400">
            <strong>Tip:</strong> For best results, ensure tables have clear borders or consistent spacing. Complex merged cells may require manual adjustment.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={() => onExtract(format, pageRange === 'custom' ? customRange : pageRange)} className="btn-primary bg-green-600 hover:bg-green-500">
            <Table2 className="w-4 h-4 mr-2" />Extract Tables
          </button>
        </div>
      </div>
    </div>
  );
}

// Generate Table of Contents Modal
function TOCModal({ onGenerate, onClose }: { onGenerate: (options: { detectHeadings: boolean; addLinks: boolean }) => void; onClose: () => void }) {
  const [detectHeadings, setDetectHeadings] = useState(true);
  const [addLinks, setAddLinks] = useState(true);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Generate Table of Contents</h3>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Automatically detect headings and create a clickable table of contents for your document.
        </p>

        <div className="space-y-2 mb-4 p-3 bg-white/5 rounded-xl">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={detectHeadings} onChange={e => setDetectHeadings(e.target.checked)} className="accent-purple-500" />
            <span className="text-sm text-gray-300">Auto-detect headings by font size</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={addLinks} onChange={e => setAddLinks(e.target.checked)} className="accent-purple-500" />
            <span className="text-sm text-gray-300">Add clickable page links</span>
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={() => onGenerate({ detectHeadings, addLinks })} className="btn-primary bg-purple-600 hover:bg-purple-500">
            <BookOpen className="w-4 h-4 mr-2" />Generate TOC
          </button>
        </div>
      </div>
    </div>
  );
}

// Header/Footer Modal
function HeaderFooterModal({ onApply, onClose }: { pages?: number; onApply: (options: { headerText: string; footerText: string; fontSize: number; position: string }) => void; onClose: () => void }) {
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [fontSize, setFontSize] = useState(10);
  const [position, setPosition] = useState('center');

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-white mb-4">Add Header & Footer</h3>

      <div className="space-y-4 mb-4">
        <div>
          <label className="input-label">Header Text</label>
          <input type="text" value={headerText} onChange={e => setHeaderText(e.target.value)} className="input" placeholder="e.g., Company Name | Confidential" />
        </div>
        <div>
          <label className="input-label">Footer Text</label>
          <input type="text" value={footerText} onChange={e => setFooterText(e.target.value)} className="input" placeholder="e.g., © 2024 Company | {page} of {total}" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Font Size</label>
            <input type="number" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="input" min={6} max={24} />
          </div>
          <div>
            <label className="input-label">Alignment</label>
            <select value={position} onChange={e => setPosition(e.target.value)} className="input !py-2">
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
        <p className="text-blue-300 text-xs">?? Use <strong>{'{page}'}</strong> for current page number and <strong>{'{total}'}</strong> for total pages.</p>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => onApply({ headerText, footerText, fontSize, position })} className="btn-primary" disabled={!headerText && !footerText}>Add Header/Footer</button>
      </div>
    </div></div>
  );
}

// Add Page Modal
function AddPageModal({ onAdd, onClose }: { onAdd: (size: string, orient: string, pos: string) => void; onClose: () => void }) {
  const [size, setSize] = useState('Current');
  const [orient, setOrient] = useState('portrait');
  const [pos, setPos] = useState('end');

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-white mb-4">Add Blank Page</h3>

      <div className="mb-4">
        <label className="input-label">Paper Size</label>
        <select value={size} onChange={e => setSize(e.target.value)} className="input !py-2">
          <option value="Current">Match Current Page</option>
          <option value="A4">A4 (210 x 297 mm)</option>
          <option value="Letter">Letter (8.5 x 11 in)</option>
          <option value="Legal">Legal (8.5 x 14 in)</option>
          <option value="A3">A3 (297 x 420 mm)</option>
          <option value="Tabloid">Tabloid (11 x 17 in)</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="input-label">Orientation</label>
        <div className="flex gap-2">
          <button onClick={() => setOrient('portrait')} className={`flex-1 py-2 rounded border ${orient === 'portrait' ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-600 text-gray-400 hover:bg-white/5'}`}>Portrait</button>
          <button onClick={() => setOrient('landscape')} className={`flex-1 py-2 rounded border ${orient === 'landscape' ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-600 text-gray-400 hover:bg-white/5'}`}>Landscape</button>
        </div>
      </div>

      <div className="mb-4">
        <label className="input-label">Position</label>
        <select value={pos} onChange={e => setPos(e.target.value)} className="input !py-2">
          <option value="end">At End of Document</option>
          <option value="start">At Start of Document</option>
          <option value="after">After Current Page</option>
        </select>
      </div>

      <div className="flex justify-end gap-2"><button onClick={onClose} className="btn-secondary">Cancel</button><button onClick={() => onAdd(size, orient, pos)} className="btn-primary">Add Page</button></div>
    </div></div>
  );
}

// Page Size Modal
function PageSizeModal({ onApply, onClose }: { onApply: (w: number, h: number, all: boolean) => void; onClose: () => void }) {
  const [size, setSize] = useState('A4');
  const [w, setW] = useState(595.28);
  const [h, setH] = useState(841.89);

  const presets = [
    { name: 'A4', w: 595.28, h: 841.89 },
    { name: 'Letter', w: 612, h: 792 },
    { name: 'Legal', w: 612, h: 1008 },
    { name: 'A3', w: 841.89, h: 1190.55 },
    { name: 'Tabloid', w: 792, h: 1224 },
  ];

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal shadow-2xl overflow-hidden border border-white/10" onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <Maximize className="w-6 h-6 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Change Page Size</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {presets.map(p => (
          <button
            key={p.name}
            onClick={() => { setSize(p.name); setW(p.w); setH(p.h); }}
            className={`p-4 rounded-2xl border-2 transition-all text-left group ${size === p.name ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 hover:border-white/20 bg-white/5'}`}
          >
            <div className={`text-sm font-bold mb-1 transition-colors ${size === p.name ? 'text-purple-400' : 'text-white group-hover:text-purple-300'}`}>{p.name}</div>
            <div className="text-xs text-gray-500">{Math.round(p.w)} x {Math.round(p.h)} pt</div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-6 border-t border-white/5">
        <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all">Cancel</button>
        <button onClick={() => onApply(w, h, true)} className="flex-[2] py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/25">Apply to All Pages</button>
      </div>
    </div></div>
  );
}

// Margins Modal
function MarginsModal({ onApply, onClose }: { onApply: (m: { top: number; bottom: number; left: number; right: number }, all: boolean) => void; onClose: () => void }) {
  const [t, setT] = useState(20);
  const [b, setB] = useState(20);
  const [l, setL] = useState(20);
  const [r, setR] = useState(20);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <Move className="w-6 h-6 text-orange-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Adjust Margins</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Top (pt)</label>
          <input type="number" value={t} onChange={e => setT(+e.target.value)} className="input !bg-white/5 border-white/10 focus:border-orange-500/50" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Bottom (pt)</label>
          <input type="number" value={b} onChange={e => setB(+e.target.value)} className="input !bg-white/5 border-white/10 focus:border-orange-500/50" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Left (pt)</label>
          <input type="number" value={l} onChange={e => setL(+e.target.value)} className="input !bg-white/5 border-white/10 focus:border-orange-500/50" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Right (pt)</label>
          <input type="number" value={r} onChange={e => setR(+e.target.value)} className="input !bg-white/5 border-white/10 focus:border-orange-500/50" />
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-6 px-1 italic">Note: 72 points equals 1 inch. All pages will be adjusted to these margins.</p>

      <div className="flex gap-3 pt-6 border-t border-white/5">
        <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all">Cancel</button>
        <button onClick={() => onApply({ top: t, bottom: b, left: l, right: r }, true)} className="flex-[2] py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/25">Apply Margins to All</button>
      </div>
    </div></div>
  );
}

// Hyperlink Modal - Add clickable links to PDF
function HyperlinkModal({ onAdd, onClose }: { onAdd: (url: string, displayText: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState('https://');
  const [displayText, setDisplayText] = useState('');

  const handleAdd = () => {
    if (!url || url === 'https://') {
      alert('Please enter a valid URL');
      return;
    }
    onAdd(url, displayText || url);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div className="modal" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Link2 className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Add Hyperlink</h3>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Add a clickable link to your PDF. The link will open in the user's browser when clicked.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="input-label">Destination URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="input"
              placeholder="https://example.com"
              autoFocus
            />
          </div>
          <div>
            <label className="input-label">Display Text (Optional)</label>
            <input
              type="text"
              value={displayText}
              onChange={e => setDisplayText(e.target.value)}
              className="input"
              placeholder="Click here to visit our website"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to show the URL as the link text</p>
          </div>
        </div>

        {/* Preview */}
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl mb-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Preview</p>
          <a href="#" onClick={e => e.preventDefault()} className="text-blue-400 underline text-sm font-medium">
            {displayText || url || 'Your link will appear here'}
          </a>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={handleAdd}
            disabled={!url || url === 'https://'}
            className="btn-primary bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
          >
            <Link2 className="w-4 h-4 mr-2" />Add Link
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Editor

// Tool Guide Modal - Addresses user familiarity with complex tools
function ToolGuideModal({ onClose, onAction }: { onClose: () => void, onAction: (id: string) => void }) {
  const [search, setSearch] = useState('');

  const toolCategories = [
    {
      name: 'Assembly & Page Logic',
      color: 'text-blue-400',
      tools: [
        { id: 'merge', icon: Merge, label: 'Merge PDFs', desc: 'Combine multiple files into one.' },
        { id: 'split', icon: Scissors, label: 'Split PDF', desc: 'Extract pages or split by range.' },
        { id: 'insert', icon: Plus, label: 'Insert PDF', desc: 'Add pages from another PDF file.' },
        { id: 'reverse', icon: ArrowUpDown, label: 'Reverse Order', desc: 'Flip page order (1-10 to 10-1).' },
        { id: 'reorder', icon: ArrowUpDown, label: 'Reorder', desc: 'Custom page arrangement.' },
        { id: 'rotate', icon: RotateCw, label: 'Rotate All', desc: 'Rotate every page at once.' },
      ]
    },
    {
      name: 'Security & Legal Pro',
      color: 'text-emerald-400',
      tools: [
        { id: 'redact', icon: EyeOff, label: 'Redaction', desc: 'Permanently hide sensitive data.' },
        { id: 'bates', icon: Hash, label: 'Bates ID', desc: 'Sequential legal page numbering.' },
        { id: 'protect', icon: Lock, label: 'Protect', desc: 'Add password encryption.' },
        { id: 'unlock', icon: Unlock, label: 'Unlock', desc: 'Remove password restrictions.' },
        { id: 'sign', icon: Stamp, label: 'Signature', desc: 'Add professional e-signatures.' },
      ]
    },
    {
      name: 'Content & Review',
      color: 'text-amber-400',
      tools: [
        { id: 'edit', icon: Type, label: 'Direct Edit', desc: 'Edit PDF text like a Word doc.' },
        { id: 'notes', icon: FileOutput, label: 'Extract Notes', desc: 'Export all highlights to text.' },
        { id: 'ocr', icon: ScanText, label: 'OCR Text', desc: 'Make scanned PDFs searchable.' },
        { id: 'compare', icon: FileSearch, label: 'Compare', desc: 'Find differences between PDFs.' },
      ]
    },
    {
      name: 'Convert & Export',
      color: 'text-purple-400',
      tools: [
        { id: 'stitch', icon: FileOutput, label: 'Single Image', desc: 'Convert PDF to one long JPEG.' },
        { id: 'images', icon: ImageDown, label: 'Export Images', desc: 'Save pages as high-res images.' },
        { id: 'word', icon: WordLogo, label: 'to Word', desc: 'Convert to editable Word .docx.' },
        { id: 'excel', icon: ExcelLogo, label: 'to Excel', desc: 'Export tables to spreadsheets.' },
      ]
    }
  ];

  const filtered = toolCategories.map(cat => ({
    ...cat,
    tools: cat.tools.filter(t =>
      t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.tools.length > 0);

  return (
    <div className="modal-overlay" style={{ zIndex: 10001 }} onClick={onClose}>
      <div className="modal !max-w-4xl h-[700px] flex flex-col shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center">
              <HelpCircle className="w-7 h-7 text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Tool Explorer</h2>
              <p className="text-surface-400 text-sm italic">Unlock the full power of PDF Studio</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
          <input
            type="text"
            placeholder="What do you want to do? (e.g. 'lock', 'legal', 'convert')..."
            className="input !pl-12 !py-4 !rounded-2xl !bg-white/5 !border-white/10 focus:!border-primary-500/50"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
          {filtered.map(cat => (
            <div key={cat.name} className="mb-10">
              <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${cat.color} mb-4 flex items-center gap-2`}>
                <span className="w-4 h-px bg-current opacity-30" />
                {cat.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cat.tools.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { onAction(t.id); onClose(); }}
                    className="group flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary-500/30 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                      {t.id === 'edit' ? (
                        <img src="/edit_icon.png" alt="PDF Editor" className="w-8 h-8 rounded shadow-md object-contain" />
                      ) : (
                        <t.icon className="w-6 h-6 text-primary-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white mb-1 group-hover:text-primary-300 transition-colors">{t.label}</div>
                      <div className="text-xs text-surface-400 leading-relaxed">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PDFEditor({
  pdf,
  onBack,
  onUpdatePdf,
  onReloadFile,
  onSaveState,
  onDownload,
  tabs,
  activeTabId,
  onSwitchTab,
  onCloseTab,
  onNewTab,
  onFilesSelect,
  onConvertFile,
  onConvertFiles,
  isPremium,
  onTogglePremium
}: {
  pdf: LoadedPDF | null;
  onBack: () => void;
  onUpdatePdf: (p: LoadedPDF) => void;
  onReloadFile: (f: File) => void;
  onSaveState?: (elements: { [p: number]: PDFElement[] }, pageBackgrounds: { [p: number]: string }, pages: any[], page: number, zoom: number) => void;
  onDownload?: (file: File | Blob, fileName: string) => void;
  tabs?: PDFTab[];
  activeTabId?: string | null;
  onSwitchTab?: (id: string) => void;
  onCloseTab?: (id: string) => void;
  onNewTab?: () => void;
  onFilesSelect?: (files: File[]) => void;
  onConvertFile?: (f: File) => void;
  onConvertFiles?: (files: File[]) => void;
  isPremium: boolean;
  onTogglePremium: () => void;
}) {
  const [page, setPage] = useState(1);
  const renderRequestId = useRef(0);
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<string>('select');

  // Sync state with prop safely - use ref for elements to avoid heavy render cycles
  const [pages, setPages] = useState<PDFPageData[]>(pdf?.pages || []);
  const [elements, setElements] = useState<{ [p: number]: PDFElement[] }>(pdf?.elements || {});
  const [pageBackgrounds, setPageBackgrounds] = useState<{ [p: number]: string }>(pdf?.pageBackgrounds || {});

  const [selected, setSelected] = useState<PDFElement | null>(null);
  const [pageImages, setPageImages] = useState<{ [p: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState('');
  const [history, setHistory] = useState<{ [p: number]: PDFElement[] }[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [showProps, setShowProps] = useState(true);
  const [showPages, setShowPages] = useState(true);
  const [dragging, setDragging] = useState<any>(null);
  const [resizing, setResizing] = useState<any>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showSigModal, setShowSigModal] = useState(false);
  const [showWatermarkModal, setShowWatermarkModal] = useState(false);
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showMaterialGallery, setShowMaterialGallery] = useState(false);
  const [materialGalleryCategory, setMaterialGalleryCategory] = useState('all');
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showCompressModal, setShowCompressModal] = useState(false);
  const [newText, setNewText] = useState('');
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showExtractModal, setShowExtractModal] = useState(false);
  const [showPageNumbersModal, setShowPageNumbersModal] = useState(false);
  const [showDeletePagesModal, setShowDeletePagesModal] = useState(false);
  const [showRotateAllModal, setShowRotateAllModal] = useState(false);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [showExportImagesModal, setShowExportImagesModal] = useState(false);
  const [showHeaderFooterModal, setShowHeaderFooterModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [showHyperlinkModal, setShowHyperlinkModal] = useState(false);
  const [showProtectModal, setShowProtectModal] = useState(false);
  const [showBatesModal, setShowBatesModal] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPaths, setDrawPaths] = useState<{ x: number; y: number }[]>([]);
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [drawingWidth, setDrawingWidth] = useState(2);
  const [textEditMode, setTextEditMode] = useState(false);
  const renderLockRef = useRef(false); // Prevents stale PDF renders during structural updates
  const expectedPageIdOrderRef = useRef<string[] | null>(null); // Verifies when prop-sync has caught up
  const [showWordEditor, setShowWordEditor] = useState(false);
  const [showEditableWordEditor, setShowEditableWordEditor] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showExtractTextModal, setShowExtractTextModal] = useState(false);
  const [showGrayscaleModal, setShowGrayscaleModal] = useState(false);
  const [showStickyNoteModal, setShowStickyNoteModal] = useState(false);
  const [isGrayscaleMode, setIsGrayscaleMode] = useState(false); // Visual grayscale filter - preserves text editability
  const [showExcelExporter, setShowExcelExporter] = useState(false);
  const [showPowerPointExporter, setShowPowerPointExporter] = useState(false);
  const [bakedPdfForOffice, setBakedPdfForOffice] = useState<LoadedPDF | null>(null);
  const [bakedPdfForAdvanced, setBakedPdfForAdvanced] = useState<LoadedPDF | null>(null);

  const handleOpenAdvancedExport = async () => {
    const activePdf = pdf;
    if (!activePdf) return;
    try {
      setLoading(true);
      setProgress('Preparing advanced export... baking elements...');
      const bytes = await generateModifiedPdfBytes();
      if (bytes) {
        const bakedFile = new File([bytes as any], activePdf.name, { type: 'application/pdf' });
        const url = URL.createObjectURL(bakedFile);
        const newPdfDoc = await pdfjsLib.getDocument(url).promise;
        const newPdfLibDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

        const bakedPdfObj: LoadedPDF = {
          ...activePdf,
          file: bakedFile,
          pdfDoc: newPdfDoc,
          pdfLibDoc: newPdfLibDoc,
          elements: {},
          extractedText: {},
        };

        setBakedPdfForAdvanced(bakedPdfObj);
        setShowAdvancedExport(true);
      }
    } catch (e) {
      console.error('Advanced export preparation failed:', e);
      alert('Failed to prepare document for advanced export.');
    }
    setLoading(false);
    setProgress('');
  };

  const handleOpenOfficeExport = async (type: 'word' | 'excel' | 'powerpoint') => {
    const activePdf = pdf;
    if (!activePdf) return;
    try {
      setLoading(true);
      setProgress('Preparing document for conversion...');

      let pdfToExport: LoadedPDF;

      // Try to bake elements into PDF (for PDFs with annotations/edits)
      const bytes = await generateModifiedPdfBytes();

      if (bytes) {
        // Successfully baked - create a new LoadedPDF with baked bytes
        try {
          const bakedFile = new File([bytes as any], activePdf.name, { type: 'application/pdf' });
          const url = URL.createObjectURL(bakedFile);
          const newPdfDoc = await pdfjsLib.getDocument(url).promise;
          const newPdfLibDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

          pdfToExport = {
            ...activePdf,
            file: bakedFile,
            pdfDoc: newPdfDoc,
            pdfLibDoc: newPdfLibDoc,
            elements: {},
            extractedText: {},
          };
        } catch (loadErr) {
          console.warn('Failed to reload baked PDF, using original:', loadErr);
          pdfToExport = activePdf;
        }
      } else {
        // Baking failed (PDF has non-standard structure) - use original file
        // Server-side conversion will work fine with the original PDF
        console.warn('PDF baking failed, using original file for Office export');
        pdfToExport = activePdf;
      }

      setBakedPdfForOffice(pdfToExport);
      if (type === 'word') setShowWordEditor(true);
      else if (type === 'excel') setShowExcelExporter(true);
      else if (type === 'powerpoint') setShowPowerPointExporter(true);

    } catch (e) {
      console.error('Office export preparation failed:', e);
      alert('Failed to prepare document for Office export: ' + (e as Error).message);
    }
    setLoading(false);
  };

  const [showOCRModal, setShowOCRModal] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [showPageSizeModal, setShowPageSizeModal] = useState(false);
  const [showMarginsModal, setShowMarginsModal] = useState(false);

  // New advanced editor panels
  const [showAddFieldsPanel, setShowAddFieldsPanel] = useState(false);
  const [showTableCreator, setShowTableCreator] = useState(false);
  const [showSignatureCreator, setShowSignatureCreator] = useState(false);
  const [selectedFormField, setSelectedFormField] = useState<FormField | null>(null);

  // New enhanced tool modals
  const [showExportTextModal, setShowExportTextModal] = useState(false);
  const [showTableExtractionModal, setShowTableExtractionModal] = useState(false);
  const [showTOCModal, setShowTOCModal] = useState(false);
  const [showExportAsDropdown, setShowExportAsDropdown] = useState(false);

  // New Feature Components State (17 Missing Features)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showTemplatesPanel, setShowTemplatesPanel] = useState(false);
  const [showStampsLibrary, setShowStampsLibrary] = useState(false);
  const [showVisualCompare, setShowVisualCompare] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [showBulkStampModal, setShowBulkStampModal] = useState(false);
  const [showAdvancedExport, setShowAdvancedExport] = useState(false);
  const [showFDFImport, setShowFDFImport] = useState(false);
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [showMoreToolsDropdown, setShowMoreToolsDropdown] = useState(false);



  // Sync state with props when active PDF object is replaced (e.g. after insertion/merge/delete)
  useEffect(() => {
    if (pdf) {
      // If we've done an optimistic structural update, ONLY unlock when the prop catches up
      if (renderLockRef.current && expectedPageIdOrderRef.current) {
        const incomingIds = (pdf.pages || []).map(p => p.id);
        const match = JSON.stringify(incomingIds) === JSON.stringify(expectedPageIdOrderRef.current);
        if (!match) return; // Keep blocking: prop is still stale
        renderLockRef.current = false;
        expectedPageIdOrderRef.current = null;
      }

      setPages(pdf.pages || []);
      setElements(pdf.elements || {});
      setPageBackgrounds(pdf.pageBackgrounds || {});
    }
  }, [pdf?.pdfDoc, pdf?.pages]);

  // Text Search with Visual Highlights
  const [searchHighlights, setSearchHighlights] = useState<{ page: number; rects: { x: number; y: number; w: number; h: number }[] }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showSearchBar, setShowSearchBar] = useState(false);

  const [showToolGuide, setShowToolGuide] = useState(false);
  const [autoRedactQuery, setAutoRedactQuery] = useState('');
  const handleToolAction = (id: string) => {
    switch (id) {
      case 'merge': if (onFilesSelect) onFilesSelect([]); break;
      case 'split': setShowSplitModal(true); break;
      case 'insert': setShowInsertModal(true); break;
      case 'reverse': handleReversePages(); break;
      case 'reorder': setShowReorderModal(true); break;
      case 'rotate': setShowRotateAllModal(true); break;
      case 'redact': setTool('redact'); break;
      case 'bates': setShowBatesModal(true); break;
      case 'protect': setShowProtectModal(true); break;
      case 'unlock': handleUnlock(); break;
      case 'sign': setTool('signature'); break;
      case 'edit': setShowEditableWordEditor(true); break;
      case 'notes': handleExportHighlights(); break;
      case 'ocr': setShowOCRModal(true); break;
      case 'compare': setShowCompareModal(true); break;
      case 'stitch': handleExportSingleImage(); break;
      case 'images': setShowExportImagesModal(true); break;
      case 'word': setShowWordEditor(true); break;
      case 'excel': setShowExcelExporter(true); break;
      case 'extract-images': handleExtractImages(); break;
      case 'metadata': setShowMetadataModal(true); break;
      case 'repair': handleRepair(); break;
      case 'flatten': handleFlatten(); break;
    }
  };

  const safelyUpdatePdf = (updates: Partial<LoadedPDF>) => {
    if (pdf) onUpdatePdf({ ...pdf, ...updates } as LoadedPDF);
  };

  // Keyboard shortcut listener for help panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open keyboard shortcuts with ? key
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global Escape handler for simple internal modals
  useEffect(() => {
    const handleGlobalEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Set all simple modal states to false
        setShowTextModal(false);
        setShowSigModal(false);
        setShowWatermarkModal(false);
        setShowShapeMenu(false);
        setShowMaterialGallery(false);
        setShowSplitModal(false);
        setShowCompressModal(false);
        setShowAddPageModal(false);
        setShowReorderModal(false);
        setShowExtractModal(false);
        setShowPageNumbersModal(false);
        setShowDeletePagesModal(false);
        setShowRotateAllModal(false);
        setShowMetadataModal(false);
        setShowExportImagesModal(false);
        setShowHeaderFooterModal(false);
        setShowQRCodeModal(false);
        setShowProtectModal(false);
        setShowBatesModal(false);
        setShowInsertModal(false);
        setShowCompareModal(false);
        setShowWordEditor(false);
        setShowEditableWordEditor(false);
        setShowCropModal(false);
        setShowGrayscaleModal(false);
        setShowStickyNoteModal(false);
        setShowOCRModal(false);
        setShowBackgroundModal(false);
        setShowPageSizeModal(false);
        setShowMarginsModal(false);
        setShowTableCreator(false);
        setShowSignatureCreator(false);
        setShowTOCModal(false);
        setShowExportAsDropdown(false);
        setShowMoreToolsDropdown(false);
        setContextMenu(null);
      }
    };
    window.addEventListener('keydown', handleGlobalEsc);
    return () => window.removeEventListener('keydown', handleGlobalEsc);
  }, []);

  // Check for first-time user and show guided tour
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('pdf-studio-tour-complete');
    if (!hasSeenTour && pdf) {
      // Delay the tour slightly so the app loads first
      const timer = setTimeout(() => setShowGuidedTour(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [pdf]);

  // Open Stamps Library when stamp tool is selected
  useEffect(() => {
    if (tool === 'stamp') {
      setShowStampsLibrary(true);
    }
  }, [tool]);

  // Pinch-to-Zoom Logic Setup
  const viewerRef = useRef<HTMLDivElement>(null);
  const pinchStartRef = useRef<{ dist: number; startZoom: number } | null>(null);
  const zoomRef = useRef(zoom);

  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        pinchStartRef.current = { dist, startZoom: zoomRef.current };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStartRef.current) {
        if (e.cancelable) e.preventDefault(); // Stop Browser Zoom
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const ratio = dist / pinchStartRef.current.dist;
        const newZoom = Math.min(Math.max(0.5, pinchStartRef.current.startZoom * ratio), 5);
        setZoom(newZoom);
      }
    };

    const handleTouchEnd = () => {
      pinchStartRef.current = null;
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Toolbar Scroll Logic
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkToolbarScroll = () => {
    if (toolbarRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = toolbarRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkToolbarScroll, 100); // Check after render
    window.addEventListener('resize', checkToolbarScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkToolbarScroll);
    };
  }, []); // And dependent on isMobile if necessary?

  const scrollToolbar = (direction: 'left' | 'right') => {
    if (toolbarRef.current) {
      const amount = 200;
      toolbarRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  // Primary Toolbar Scroll Logic
  const primaryToolbarRef = useRef<HTMLDivElement>(null);
  const [canScrollPrimaryLeft, setCanScrollPrimaryLeft] = useState(false);
  const [canScrollPrimaryRight, setCanScrollPrimaryRight] = useState(false);

  const checkPrimaryToolbarScroll = () => {
    if (primaryToolbarRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = primaryToolbarRef.current;
      setCanScrollPrimaryLeft(scrollLeft > 10);
      setCanScrollPrimaryRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkPrimaryToolbarScroll, 100);
    window.addEventListener('resize', checkPrimaryToolbarScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkPrimaryToolbarScroll);
    };
  }, []);

  const scrollPrimaryToolbar = (direction: 'left' | 'right') => {
    if (primaryToolbarRef.current) {
      const amount = 200;
      primaryToolbarRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  // Fit Width / Fit Page Logic
  const handleFitWidth = useCallback(() => {
    if (!viewerRef.current || !pdf?.pages?.[0]) return;
    const padding = window.innerWidth < 640 ? 32 : 64;
    const containerWidth = viewerRef.current.clientWidth - padding;
    const pageWidth = pdf.pages[0].width;
    const newZoom = containerWidth / pageWidth;
    setZoom(newZoom);
  }, [pdf]);

  const handleFitPage = useCallback(() => {
    if (!viewerRef.current || !pdf?.pages?.[0]) return;
    const padding = 64;
    const containerHeight = viewerRef.current.clientHeight - padding;
    const pageHeight = pdf.pages[0].height;
    const newZoom = containerHeight / pageHeight;
    setZoom(newZoom);
  }, [pdf]);

  const handleTourComplete = () => {
    localStorage.setItem('pdf-studio-tour-complete', 'true');
    setShowGuidedTour(false);
  };


  const handleContextMenuAction = (action: string) => {
    if (!selected) return;
    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(JSON.stringify(selected));
        break;
      case 'delete':
        setElements(prev => ({
          ...prev,
          [page]: (prev[page] || []).filter(e => e.id !== selected.id)
        }));
        setSelected(null);
        break;
      case 'duplicate':
        const dup = { ...selected, id: crypto.randomUUID(), x: selected.x + 20, y: selected.y + 20 };
        setElements(prev => ({ ...prev, [page]: [...(prev[page] || []), dup] }));
        break;
      case 'bring-front':
        setElements(prev => {
          const pageEls = [...(prev[page] || [])];
          const idx = pageEls.findIndex(e => e.id === selected.id);
          if (idx > -1) {
            const [el] = pageEls.splice(idx, 1);
            pageEls.push(el);
          }
          return { ...prev, [page]: pageEls };
        });
        break;
      case 'send-back':
        setElements(prev => {
          const pageEls = [...(prev[page] || [])];
          const idx = pageEls.findIndex(e => e.id === selected.id);
          if (idx > -1) {
            const [el] = pageEls.splice(idx, 1);
            pageEls.unshift(el);
          }
          return { ...prev, [page]: pageEls };
        });
        break;
    }
    setContextMenu(null);
  };

  // Bulk stamp handler
  const handleApplyBulkStamp = async (options: StampOptions) => {
    if (!pdf?.pdfLibDoc) return;
    try {
      await applyBulkStamp(pdf.pdfLibDoc, options);
      const bytes = await pdf.pdfLibDoc.save();
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const newPdfDoc = await pdfjsLib.getDocument(url).promise;
      safelyUpdatePdf({ pdfDoc: newPdfDoc });
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      alert('Bulk stamp applied successfully!');
    } catch (e) {
      console.error('Bulk stamp failed:', e);
      alert('Failed to apply bulk stamp');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleToggleEditMode = () => {
    if (!textEditMode) {
      // Enter Edit Mode - Populate/Show text from extracted data
      if (pdf?.extractedText) {
        setElements(prev => {
          const next = { ...prev };
          Object.keys(pdf?.extractedText || {}).forEach((pStr) => {
            const p = Number(pStr);
            const extracted = pdf?.extractedText![p] || [];
            const current = next[p] || [];

            // 1. Make existing original elements visible
            let merged = current.map(e => (e as any).original ? { ...e, visible: true } : e);

            // 2. Add missing extracted elements
            extracted.forEach(e => {
              if (!merged.find(m => m.id === e.id)) {
                merged.push({ ...e, visible: true });
              }
            });
            next[p] = merged;
          });
          return next;
        });
      }
      setTextEditMode(true);
    } else {
      // Exit Edit Mode - Hide original text modifications to show clean PDF
      setElements(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(pStr => {
          const p = Number(pStr);
          next[p] = next[p].map(e => (e as any).original ? { ...e, visible: false } : e);
        });
        return next;
      });
      setTextEditMode(false);
    }
    setShowWordEditor(false);
    setSelected(null);
  };
  void handleToggleEditMode; // Reserved for future text editing toggle feature

  useEffect(() => { const h = () => setIsMobile(window.innerWidth < 768); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
      if (e.key === 'Delete' && selected) { e.preventDefault(); deleteEl(); }
      if (e.ctrlKey && e.key === 'd' && selected) { e.preventDefault(); duplicateEl(); }
      if (e.key === 'Escape') { setSelected(null); setTool('select'); setShowExportAsDropdown(false); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [selected, histIdx, history]);

  // Render pages - now with text whiteout for true editing
  const renderPages = useCallback(async () => {
    const activePdf = pdf;

    // Optimization: Don't show full-screen loader if we already have the current page image
    if (!pageImages[page]) setLoading(true);

    // If locked (optimistic update in progress), trust the cached images and SKIP render
    if (renderLockRef.current) {
      setLoading(false);
      return;
    }

    if (!activePdf || activePdf.pageCount === 0) return;
    const currentId = ++renderRequestId.current;

    const renderSinglePage = async (i: number) => {
      if (renderRequestId.current !== currentId) return;
      try {
        const actualPageNum = activePdf.sourcePageMapping ? activePdf.sourcePageMapping[i - 1] : i;
        const pg = await activePdf.pdfDoc.getPage(actualPageNum);

        // High-DPI Rendering Logic: Use device pixel ratio for crisp text
        const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 3) : 1;
        const scale = Math.max(1.5, dpr) * zoom;
        const vp = pg.getViewport({ scale, rotation: pages[i - 1]?.rotation || 0 });
        const cvs = document.createElement('canvas');
        cvs.width = vp.width;
        cvs.height = vp.height;
        const ctx = cvs.getContext('2d')!;

        if (pageBackgrounds[i] && pageBackgrounds[i] !== 'transparent') {
          ctx.fillStyle = pageBackgrounds[i];
          ctx.fillRect(0, 0, cvs.width, cvs.height);
          ctx.globalCompositeOperation = 'multiply';
        } else {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, cvs.width, cvs.height);
          ctx.globalCompositeOperation = 'source-over';
        }

        await (pg.render({ canvasContext: ctx, viewport: vp } as any)).promise;
        ctx.globalCompositeOperation = 'source-over';

        if (textEditMode && activePdf.extractedText && activePdf.extractedText[i]) {
          const extractedItems = activePdf.extractedText[i];
          ctx.fillStyle = 'white';
          extractedItems.forEach((item: any) => {
            if (item.originalRect) {
              const rect = item.originalRect;
              const [x1, y1] = vp.convertToViewportPoint(rect.x, rect.y);
              const [x2, y2] = vp.convertToViewportPoint(rect.x + rect.w, rect.y - rect.h);
              // eslint-disable-next-line
              ctx.fillRect(Math.min(x1, x2) - 2, Math.min(y1, y2) - 2, Math.abs(x2 - x1) + 4, Math.abs(y2 - y1) + 4);
            }
          });
        }

        if (renderRequestId.current === currentId) {
          const dataUrl = cvs.toDataURL('image/webp', 0.8); // Optimization: webp is faster/smaller
          setPageImages(prev => {
            if (prev[i] === dataUrl) return prev;
            return { ...prev, [i]: dataUrl };
          });
        }
      } catch (e) {
        console.warn(`Render error on page ${i}:`, e);
      }
    };

    // Phase 1: Render current page immediately for instant feedback
    await renderSinglePage(page);
    if (renderRequestId.current === currentId) setLoading(false);

    // Phase 2: Background render remaining pages for thumbnails
    for (let i = 1; i <= activePdf.pageCount; i++) {
      if (i === page) continue;
      if (renderRequestId.current !== currentId) break;
      await renderSinglePage(i);
    }
  }, [pdf?.pdfDoc, pages, textEditMode, zoom, pageBackgrounds, page]);

  useEffect(() => { renderPages(); }, [renderPages]);

  // Initialize history with current state
  useEffect(() => {
    if (history.length === 0) {
      setHistory([JSON.parse(JSON.stringify(elements))]);
      setHistIdx(0);
    }
  }, []);

  // Auto-save state to persistence layer (debounced)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Sync local state to parent PDF object whenever it changes
  useEffect(() => {
    // Prevent auto-sync if a manual complex operation (like reorder) is in progress
    if (renderLockRef.current) return;

    // Debounce to avoid excessive updates
    const timer = setTimeout(() => {
      safelyUpdatePdf({
        elements,
        pageBackgrounds, // Ensure this property exists on LoadedPDF type, if not we might need to cast or add it
        pages
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [elements, pageBackgrounds, pages]);

  useEffect(() => {
    if (!onSaveState) return;

    // Debounce saves to avoid excessive writes
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      onSaveState(elements, pageBackgrounds, pages, page, zoom);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [elements, pageBackgrounds, pages, page, zoom, onSaveState]);

  // History management with max 50 steps
  const MAX_HISTORY = 50;
  const pushHistory = () => {
    const h = history.slice(0, histIdx + 1);
    h.push(JSON.parse(JSON.stringify(elements)));
    // Limit history size
    if (h.length > MAX_HISTORY) {
      h.shift();
      setHistory(h);
      setHistIdx(h.length - 1);
    } else {
      setHistory(h);
      setHistIdx(h.length - 1);
    }
  };

  const undo = () => {
    if (histIdx > 0) {
      const newIdx = histIdx - 1;
      setElements(JSON.parse(JSON.stringify(history[newIdx])));
      setHistIdx(newIdx);
      setSelected(null);
    }
  };

  const redo = () => {
    if (histIdx < history.length - 1) {
      const newIdx = histIdx + 1;
      setElements(JSON.parse(JSON.stringify(history[newIdx])));
      setHistIdx(newIdx);
      setSelected(null);
    }
  };

  // Debounced history push for drag/resize operations
  const historyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushHistoryDebounced = () => {
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    historyTimeoutRef.current = setTimeout(() => {
      pushHistory();
    }, 500);
  };

  const addElement = (el: PDFElement) => { pushHistory(); setElements(prev => ({ ...prev, [page]: [...(prev[page] || []), el] })); setSelected(el); setTool('select'); };
  const updateEl = (el: PDFElement) => { setElements(prev => ({ ...prev, [page]: (prev[page] || []).map(e => e.id === el.id ? el : e) })); setSelected(el); pushHistoryDebounced(); };
  const deleteEl = () => { if (!selected) return; pushHistory(); setElements(prev => ({ ...prev, [page]: (prev[page] || []).filter(e => e.id !== selected.id) })); setSelected(null); };
  const duplicateEl = () => { if (!selected) return; addElement({ ...selected, id: genId(), x: selected.x + 20, y: selected.y + 20 }); };

  // Layer ordering - properly update zIndex
  const bringForward = () => {
    if (!selected) return;
    const els = elements[page] || [];
    const maxZ = Math.max(...els.map(e => e.zIndex || 0));
    if ((selected.zIndex || 0) < maxZ) {
      const newEl = { ...selected, zIndex: (selected.zIndex || 0) + 1 };
      setElements(prev => ({
        ...prev,
        [page]: prev[page].map(e => {
          if (e.id === selected.id) return newEl;
          // Swap zIndex with PDFElement that was above
          if (e.zIndex === newEl.zIndex && e.id !== selected.id) {
            return { ...e, zIndex: (e.zIndex || 0) - 1 };
          }
          return e;
        })
      }));
      setSelected(newEl);
      pushHistory();
    }
  };

  const sendBackward = () => {
    if (!selected) return;
    const minZ = 0;
    if ((selected.zIndex || 0) > minZ) {
      const newEl = { ...selected, zIndex: (selected.zIndex || 0) - 1 };
      setElements(prev => ({
        ...prev,
        [page]: prev[page].map(e => {
          if (e.id === selected.id) return newEl;
          // Swap zIndex with PDFElement that was below
          if (e.zIndex === newEl.zIndex && e.id !== selected.id) {
            return { ...e, zIndex: (e.zIndex || 0) + 1 };
          }
          return e;
        })
      }));
      setSelected(newEl);
      pushHistory();
    }
  };

  const sendToBack = () => {
    if (!selected) return;

    // Set to 0 and shift all others up
    setElements(prev => ({
      ...prev,
      [page]: prev[page].map(e => {
        if (e.id === selected.id) return { ...selected, zIndex: 0 };
        return { ...e, zIndex: (e.zIndex || 0) + 1 };
      })
    }));
    setSelected({ ...selected, zIndex: 0 });
    pushHistory();
  };

  const bringToFront = () => {
    if (!selected) return;
    const maxZ = Math.max(...(elements[page] || []).map(e => e.zIndex || 0), 0);
    const newZ = maxZ + 1;
    setElements(prev => ({
      ...prev,
      [page]: prev[page].map(e => e.id === selected.id ? { ...selected, zIndex: newZ } : e)
    }));
    setSelected({ ...selected, zIndex: newZ });
    pushHistory();
  };



  // Page operations
  const rotatePage = (num: number, deg: number) => { setPages(prev => prev.map((p, i) => i === num - 1 ? { ...p, rotation: (p.rotation + deg + 360) % 360 } : p)); };

  const handleReversePages = async () => {
    const activePdf = pdf;
    if (!activePdf) return;
    setLoading(true);
    setProgress('Reversing pages...');
    try {
      const pageCount = activePdf.pdfLibDoc.getPageCount();
      const indices = Array.from({ length: pageCount }, (_, i) => i);
      const reversedIndices = [...indices].reverse();

      // Create a new document with reversed pages
      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(activePdf.pdfLibDoc, reversedIndices);
      copiedPages.forEach(p => newDoc.addPage(p));

      // Map elements, pages and backgrounds
      const nextElements: { [p: number]: PDFElement[] } = {};
      const nextPages = [...pages].reverse().map((p, i) => ({ ...p, pageNumber: i + 1 }));
      const nextBackgrounds: { [p: number]: string } = {};

      indices.forEach((_, newIdx) => {
        const newP = newIdx + 1;
        const sourceP = pageCount - newIdx;
        if (elements[sourceP]) nextElements[newP] = elements[sourceP];
        if (pageBackgrounds[sourceP]) nextBackgrounds[newP] = pageBackgrounds[sourceP];
      });

      setElements(nextElements);
      setPages(nextPages);
      setPageBackgrounds(nextBackgrounds);

      const bytes = await newDoc.save();
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const newPdfDoc = await pdfjsLib.getDocument(url).promise;
      const newPdfLibDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

      safelyUpdatePdf({ pdfLibDoc: newPdfLibDoc, pdfDoc: newPdfDoc, pages: nextPages, elements: nextElements, pageBackgrounds: nextBackgrounds });
    } catch (e) {
      console.error(e);
      alert('Reverse failed');
    }
    setLoading(false);
    setProgress('');
  };

  const handleBates = async (options: { prefix: string; start: number; digits: number; position: 'top' | 'bottom' }) => {
    const activePdf = pdf;
    if (!activePdf) return;
    setLoading(true);
    setProgress('Applying Bates numbering...');
    try {
      const { prefix, start, digits, position } = options;
      const pdfLibPages = activePdf.pdfLibDoc.getPages();
      const font = await activePdf.pdfLibDoc.embedFont(StandardFonts.HelveticaBold);

      for (let i = 0; i < pdfLibPages.length; i++) {
        const p = pdfLibPages[i];
        const num = (start + i).toString().padStart(digits, '0');
        const text = `${prefix}${num}`;
        const fontSize = 10;
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const { width, height } = p.getSize();

        p.drawText(text, {
          x: (width - textWidth) / 2,
          y: position === 'top' ? height - 25 : 15,
          size: fontSize,
          font,
          color: rgb(0.1, 0.1, 0.1)
        });
      }

      const bytes = await activePdf.pdfLibDoc.save();
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const newPdfDoc = await pdfjsLib.getDocument(url).promise;
      const newPdfLibDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

      safelyUpdatePdf({ pdfLibDoc: newPdfLibDoc, pdfDoc: newPdfDoc });
      setShowBatesModal(false);
      alert('Bates numbering applied!');
    } catch (e) {
      console.error(e);
      alert('Bates numbering failed');
    }
    setLoading(false);
    setProgress('');
  };

  const handleExportHighlights = () => {
    const highlights: string[] = [];
    Object.keys(elements).forEach(p => {
      const pageEls = elements[Number(p)] || [];
      pageEls.forEach(el => {
        if (el.type === 'highlight' && (el as any).content) {
          highlights.push(`Page ${p}: ${(el as any).content}`);
        } else if (el.type === 'stickynote' && (el as any).content) {
          highlights.push(`Sticky Note (P${p}): ${(el as any).content}`);
        }
      });
    });

    if (highlights.length === 0) {
      alert('No highlights or sticky notes found to export.');
      return;
    }

    const text = highlights.join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pdf?.name || 'document'}_highlights.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSingleImage = async () => {
    const activePdf = pdf;
    if (!activePdf) return;
    try {
      setLoading(true);
      setProgress('Applying all elements to document for image conversion...');

      const bytes = await generateModifiedPdfBytes();
      if (!bytes) {
        setLoading(false);
        return;
      }

      setProgress('Converting pages to images...');
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const pdfLocal = await pdfjsLib.getDocument(url).promise;

      const canvases: HTMLCanvasElement[] = [];
      let totalHeight = 0;
      let maxWidth = 0;

      for (let i = 1; i <= pdfLocal.numPages; i++) {
        setProgress(`Rendering page ${i} of ${pdfLocal.numPages}...`);
        const page = await pdfLocal.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d')!, viewport, canvas }).promise;
        canvases.push(canvas);
        totalHeight += viewport.height;
        maxWidth = Math.max(maxWidth, viewport.width);
      }

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = maxWidth;
      finalCanvas.height = totalHeight;
      const ctx = finalCanvas.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, maxWidth, totalHeight);

      let y = 0;
      canvases.forEach(c => {
        ctx.drawImage(c, (maxWidth - c.width) / 2, y);
        y += c.height;
      });

      finalCanvas.toBlob(imgBlob => {
        if (imgBlob) {
          const filename = `${activePdf.name.replace(/\.pdf$/i, '')}_full.jpg`;
          if (onDownload) onDownload(imgBlob, filename);
          else saveAs(imgBlob, filename);
        }
        setLoading(false);
        setProgress('');
      }, 'image/jpeg', 0.9);
    } catch (e) {
      console.error(e);
      setLoading(false);
      setProgress('');
      alert('Failed to export single image');
    }
  };

  const handleInsertPDF = async (file: File, targetPage: number) => {
    const activePdf = pdf;
    if (!activePdf) return;

    setLoading(true);
    setProgress(`Merging ${file.name}...`);

    try {
      // 1. Load documents safely
      const [mainBytes, externalBytes] = await Promise.all([
        activePdf.pdfLibDoc.save(),
        file.arrayBuffer()
      ]);

      const [mainDoc, externalDoc] = await Promise.all([
        PDFDocument.load(mainBytes, { ignoreEncryption: true }),
        PDFDocument.load(externalBytes, { ignoreEncryption: true })
      ]);

      const externalIndices = Array.from({ length: externalDoc.getPageCount() }, (_, i) => i);
      const copiedPages = await mainDoc.copyPages(externalDoc, externalIndices);

      // 2. Perform merge
      const insertIdx = Math.min(mainDoc.getPageCount(), targetPage - 1);
      copiedPages.forEach((p, i) => {
        mainDoc.insertPage(insertIdx + i, p);
      });

      // 3. Shift elements and metadata
      const shiftCount = copiedPages.length;
      const nextElements: { [p: number]: PDFElement[] } = {};
      Object.keys(elements).forEach(pStr => {
        const p = Number(pStr);
        if (p <= insertIdx) nextElements[p] = elements[p];
        else nextElements[p + shiftCount] = elements[p];
      });

      const insertedPagesData = externalIndices.map(idx => {
        const p = externalDoc.getPage(idx);
        const { width, height } = p.getSize();
        return {
          id: crypto.randomUUID(),
          width,
          height,
          rotation: p.getRotation().angle,
          pageNumber: 0
        };
      });

      const nextPages = [...pages];
      nextPages.splice(insertIdx, 0, ...insertedPagesData);
      const finalPages = nextPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));

      // 4. Update thumbnails (shift existing ones)
      setPageImages(prev => {
        const next: { [p: number]: string } = {};
        Object.keys(prev).forEach(pStr => {
          const p = Number(pStr);
          if (p < insertIdx + 1) next[p] = prev[p];
          else next[p + shiftCount] = prev[p];
        });
        return next;
      });

      // 5. Build final PDF and sync
      const outBytes = await mainDoc.save();
      const blob = new Blob([outBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const newPdfDoc = await pdfjsLib.getDocument(url).promise;

      setPages(finalPages);
      setElements(nextElements);

      safelyUpdatePdf({
        file: new File([blob], activePdf.name, { type: 'application/pdf' }),
        pdfDoc: newPdfDoc,
        pdfLibDoc: mainDoc,
        pages: finalPages,
        elements: nextElements,
        pageCount: finalPages.length,
        sourcePageMapping: undefined
      });

      setPage(insertIdx + 1);
      setSelected(null);
      setShowInsertModal(false);

      setTimeout(() => URL.revokeObjectURL(url), 5000);
      alert(`${file.name} inserted!`);
    } catch (e) {
      console.error('Insert failed:', e);
      alert('Failed to insert PDF.');
    }
    setLoading(false);
    setProgress('');
  };


  const handleComparePDFs = async (f1: File, f2: File) => {
    setLoading(true);
    setProgress('Comparing documents...');
    try {
      const getTxt = async (f: File) => {
        const buf = await f.arrayBuffer();
        const d = await pdfjsLib.getDocument({ data: buf }).promise;
        let t = '';
        for (let i = 1; i <= d.numPages; i++) {
          const p = await d.getPage(i);
          const c = await p.getTextContent();
          t += (c.items as any[]).map(x => x.str).join(' ') + '\n';
        }
        return t.split('\n');
      };

      const [txt1, txt2] = await Promise.all([getTxt(f1), getTxt(f2)]);

      // Simple line diff
      const diffResults: string[] = [];
      const maxLines = Math.max(txt1.length, txt2.length);
      for (let i = 0; i < maxLines; i++) {
        const l1 = txt1[i] || '';
        const l2 = txt2[i] || '';
        if (l1 !== l2) {
          diffResults.push(`Line ${i + 1}:`);
          diffResults.push(`- ${l1}`);
          diffResults.push(`+ ${l2}`);
          diffResults.push('');
        }
      }

      if (diffResults.length === 0) {
        alert('Documents are identical in text content.');
      } else {
        const blob = new Blob([diffResults.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comparison_results.txt`;
        a.click();
        alert('Comparison complete! Differences saved to text file.');
      }
      setShowCompareModal(false);
    } catch (e) {
      console.error(e);
      alert('Comparison failed');
    }
    setLoading(false);
    setProgress('');
  };
  const duplicatePage = async (num: number) => {
    const activePdf = pdf;
    if (!activePdf) return;
    setLoading(true);
    setProgress('Duplicating page...');
    try {
      const np = await PDFDocument.load(await activePdf.pdfLibDoc.save(), { ignoreEncryption: true });
      const [cp] = await np.copyPages(np, [num - 1]);
      np.insertPage(num, cp);

      // Shift elements
      const nextElements: { [p: number]: PDFElement[] } = {};
      Object.keys(elements).forEach(pStr => {
        const p = Number(pStr);
        if (p <= num) {
          nextElements[p] = elements[p];
        } else {
          nextElements[p + 1] = elements[p];
        }
      });
      // Copy elements from duplicated page
      if (elements[num]) {
        nextElements[num + 1] = JSON.parse(JSON.stringify(elements[num])).map((e: any) => ({ ...e, id: genId() }));
      }
      setElements(nextElements);

      // Shift pageBackgrounds
      const nextPageBackgrounds: { [p: number]: string } = {};
      Object.keys(pageBackgrounds).forEach(pStr => {
        const p = Number(pStr);
        if (p <= num) {
          nextPageBackgrounds[p] = pageBackgrounds[p];
        } else {
          nextPageBackgrounds[p + 1] = pageBackgrounds[p];
        }
      });
      if (pageBackgrounds[num]) {
        nextPageBackgrounds[num + 1] = pageBackgrounds[num];
      }
      setPageBackgrounds(nextPageBackgrounds);

      // Update pages metadata (fix duplicate key issue)
      const newPageMeta: PDFPageData = {
        ...pages[num - 1],
        id: crypto.randomUUID(),
        pageNumber: num + 1
      };
      const nextPages = [...pages];
      nextPages.splice(num, 0, newPageMeta);
      const finalPages = nextPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
      setPages(finalPages);

      // Update thumbnails
      setPageImages(prev => {
        const next: { [p: number]: string } = {};
        Object.keys(prev).forEach(pStr => {
          const p = Number(pStr);
          if (p <= num) next[p] = prev[p];
          else next[p + 1] = prev[p];
        });
        if (prev[num]) next[num + 1] = prev[num];
        return next;
      });

      const bytes = await np.save();
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const newPdfDoc = await pdfjsLib.getDocument(url).promise;

      safelyUpdatePdf({
        file: new File([blob], activePdf.name, { type: 'application/pdf' }),
        pdfLibDoc: np,
        pdfDoc: newPdfDoc,
        pages: finalPages,
        elements: nextElements,
        pageBackgrounds: nextPageBackgrounds,
        pageCount: finalPages.length,
        sourcePageMapping: undefined
      });

      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setPage(num + 1);
    } catch (e) {
      console.error(e);
      alert('Duplication failed');
    }
    setLoading(false);
    setProgress('');
  };
  // Optimized Delete Pages (Accurate, cleans document)
  const handleDeletePages = async (pagesToDelete: number[]) => {
    const activePdf = pdf;
    if (!activePdf) return;
    if (pagesToDelete.length >= pages.length) { alert('Cannot delete all pages'); return; }

    setLoading(true);
    setProgress('Deleting pages...');

    try {
      // 1. Create a clean document by copying ONLY the pages we want to keep
      const newDoc = await PDFDocument.create();
      const pageSet = new Set(pagesToDelete);

      // Calculate which internal indices to keep
      const keepIndices: number[] = [];
      pages.forEach((p, i) => {
        if (!pageSet.has(p.pageNumber)) {
          // Find the actual source index in the original pdfLibDoc
          const actualIdx = activePdf.sourcePageMapping ? activePdf.sourcePageMapping[i] - 1 : i;
          keepIndices.push(actualIdx);
        }
      });

      // 2. Perform the copy
      const copiedPages = await newDoc.copyPages(activePdf.pdfLibDoc, keepIndices);
      copiedPages.forEach(p => newDoc.addPage(p));

      // 3. Map elements to their new page numbers
      const nextElements: { [p: number]: PDFElement[] } = {};
      const nextPages: PDFPageData[] = [];
      const nextPageImages: { [p: number]: string } = {};
      const nextPageBackgrounds: { [p: number]: string } = {};

      let newIdx = 0;
      pages.forEach((p) => {
        if (!pageSet.has(p.pageNumber)) {
          newIdx++;
          if (elements[p.pageNumber]) {
            nextElements[newIdx] = elements[p.pageNumber];
          }
          if (pageImages[p.pageNumber]) {
            nextPageImages[newIdx] = pageImages[p.pageNumber];
          }
          if (pageBackgrounds[p.pageNumber]) {
            nextPageBackgrounds[newIdx] = pageBackgrounds[p.pageNumber];
          }
          nextPages.push({ ...p, pageNumber: newIdx });
        }
      });

      // 4. Save and Update PDF.js
      const bytes = await newDoc.save();
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const newPdfDoc = await pdfjsLib.getDocument(url).promise;

      safelyUpdatePdf({
        file: new File([blob], activePdf.name, { type: 'application/pdf' }),
        pdfDoc: newPdfDoc,
        pdfLibDoc: newDoc,
        pageCount: nextPages.length,
        elements: nextElements,
        pages: nextPages,
        pageBackgrounds: nextPageBackgrounds,
        sourcePageMapping: undefined // Flattened now
      });

      setElements(nextElements);
      setPages(nextPages);
      setPageImages(nextPageImages);
      setPageBackgrounds(nextPageBackgrounds);

      setShowDeletePagesModal(false);
      setTimeout(() => {
        URL.revokeObjectURL(url);
        renderPages();
      }, 500);

      if (page > nextPages.length) {
        setPage(nextPages.length || 1);
      }

    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
    setLoading(false);
    setProgress('');
  };

  const deletePage = (num: number) => handleDeletePages([num]);

  const handleAddPage = async (sizeKey: string, orient: string, pos: string) => {
    const activePdf = pdf;
    if (!activePdf) return;
    setLoading(true);
    setProgress('Adding new page...');
    try {
      const PAGE_SIZES: { [key: string]: [number, number] } = {
        'A4': [595.28, 841.89], 'Letter': [612, 792], 'Legal': [612, 1008], 'A3': [841.89, 1190.55], 'Tabloid': [792, 1224]
      };

      let width, height;
      if (sizeKey === 'Current' && pages[page - 1]) {
        width = pages[page - 1].width / 1.5;
        height = pages[page - 1].height / 1.5;
      } else {
        const [w, h] = PAGE_SIZES[sizeKey] || PAGE_SIZES['A4'];
        width = orient === 'landscape' ? h : w;
        height = orient === 'landscape' ? w : h;
      }

      const newDoc = await PDFDocument.load(await activePdf.pdfLibDoc.save(), { ignoreEncryption: true });
      let insertIndex = newDoc.getPageCount();
      if (pos === 'start') insertIndex = 0;
      else if (pos === 'after') insertIndex = page; // After current page

      newDoc.insertPage(insertIndex, [width, height]);

      // Shift Elements
      const shiftFrom = insertIndex + 1;
      const nextElements: { [p: number]: PDFElement[] } = {};
      const nextPageBackgrounds: { [p: number]: string } = {};

      Object.keys(elements).forEach(pStr => {
        const p = Number(pStr);
        if (p < shiftFrom) nextElements[p] = elements[p];
        else nextElements[p + 1] = elements[p];
      });
      nextElements[shiftFrom] = [];
      setElements(nextElements);

      Object.keys(pageBackgrounds).forEach(pStr => {
        const p = Number(pStr);
        if (p < shiftFrom) nextPageBackgrounds[p] = pageBackgrounds[p];
        else nextPageBackgrounds[p + 1] = pageBackgrounds[p];
      });
      setPageBackgrounds(nextPageBackgrounds);

      // Update Pages State
      const newPageMeta: PDFPageData = {
        id: crypto.randomUUID(),
        width: width * 1.5,
        height: height * 1.5,
        pageNumber: shiftFrom,
        rotation: 0
      };
      const newPages = [...pages];
      newPages.splice(insertIndex, 0, newPageMeta);
      const finalPages = newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
      setPages(finalPages);

      // Update thumbnails (shift existing ones)
      setPageImages(prev => {
        const next: { [p: number]: string } = {};
        Object.keys(prev).forEach(pStr => {
          const p = Number(pStr);
          if (p < shiftFrom) next[p] = prev[p];
          else next[p + 1] = prev[p];
        });
        return next;
      });

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const newPdfDoc = await pdfjsLib.getDocument(url).promise;

      safelyUpdatePdf({
        file: new File([blob], activePdf.name, { type: 'application/pdf' }),
        pdfLibDoc: newDoc,
        pdfDoc: newPdfDoc,
        pageCount: newDoc.getPageCount(),
        elements: nextElements,
        pages: finalPages,
        pageBackgrounds: nextPageBackgrounds,
        sourcePageMapping: undefined
      });

      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setPage(shiftFrom);
      setShowAddPageModal(false);
      setTimeout(renderPages, 100);
    } catch (e) {
      console.error(e);
      alert('Failed to add page');
    }
    setLoading(false);
  };

  const handleReorder = async (newOrder: number[]) => {
    const activePdf = pdf;
    if (!activePdf) return;

    // Prevent race conditions: Cancel any pending drag-and-drop syncs
    if (pendingPdfSync.current) clearTimeout(pendingPdfSync.current);

    try {
      if (newOrder.length !== pages.length) throw new Error('Invalid page count');

      // 1. Optimistic UI Update - FAST
      const nextElements: { [p: number]: PDFElement[] } = {};
      const nextPageBackgrounds: { [p: number]: string } = {};

      newOrder.forEach((oldP, i) => {
        const newP = i + 1;
        if (elements[oldP]) {
          nextElements[newP] = JSON.parse(JSON.stringify(elements[oldP]));
        }
        if (pageBackgrounds[oldP]) {
          nextPageBackgrounds[newP] = pageBackgrounds[oldP];
        }
      });

      const finalPages = newOrder.map((oldP, i) => ({ ...pages[oldP - 1], pageNumber: i + 1 }));

      renderLockRef.current = true; // Lock local view
      expectedPageIdOrderRef.current = finalPages.map(p => p.id);
      setElements(nextElements);
      setPageBackgrounds(nextPageBackgrounds);
      setPages(finalPages);

      // Reorder thumbnails locally
      setPageImages(prev => {
        const next: { [p: number]: string } = {};
        console.log('?? [Modal] Reordering thumbnails:', newOrder);
        newOrder.forEach((oldP, i) => {
          const newP = i + 1;
          // Ensure we access with string keys if necessary, though numbers should work
          if (prev[oldP]) next[newP] = prev[oldP];
        });
        return next;
      });

      setShowReorderModal(false);
      setPage(1);

      // 2. Background PDF Processing - SLOW but invisible
      const newDoc = await PDFDocument.create();
      const desiredPages = newOrder.map(oldP => pages[oldP - 1]);

      // Map based on ID to ensure we grab the correct source pages
      const pagesToCopyIds = desiredPages.map(dp =>
        activePdf.pages.findIndex(op => op.id === dp.id)
      );

      if (pagesToCopyIds.includes(-1)) throw new Error('Page ID mismatch');

      // Use ignoreEncryption when copying if the source is protected (though usually unlocked by now)
      const copiedPages = await newDoc.copyPages(activePdf.pdfLibDoc, pagesToCopyIds);
      copiedPages.forEach(p => newDoc.addPage(p));

      // Background sync for PDF.js
      const pdfBytes = await newDoc.save();
      const blobs = new Blob([pdfBytes as any], { type: 'application/pdf' });

      // We must create a new PDF.js document for the renderer to see the changes
      const url = URL.createObjectURL(blobs);
      const newPdfDoc = await pdfjsLib.getDocument(url).promise;

      // Update the main PDF state
      safelyUpdatePdf({
        file: new File([blobs], activePdf.name, { type: 'application/pdf' }),
        pdfLibDoc: newDoc,
        pdfDoc: newPdfDoc,
        pageCount: newDoc.getPageCount(),
        elements: nextElements,
        pages: finalPages,
        pageBackgrounds: nextPageBackgrounds,
        // Reset extracted text and mapping for the new clean document
        extractedText: {},
        sourcePageMapping: undefined
      });

      // Unlock rendering and force a refresh via the natural useEffect flow
      renderLockRef.current = false;

      // We do NOT call renderPages() manually here because the closure captures the OLD pdf.
      // The safelyUpdatePdf() call above triggers a state update -> new renderPages closure -> useEffect fires.
    } catch (e) {
      console.error(e);
      alert('Reorder failed');
      renderLockRef.current = false;
      expectedPageIdOrderRef.current = null;
    }
    setLoading(false);
    setProgress('');
  };

  // Extract Pages - download specific pages as new PDF
  const handleExtractPages = async (pageRange: string) => {
    const activePdf = pdf;
    if (!activePdf) return;
    try {
      const pagesToExtract: number[] = [];
      pageRange.split(',').forEach(part => {
        part = part.trim();
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(n => parseInt(n.trim()));
          for (let i = start; i <= end; i++) if (i >= 1 && i <= pages.length) pagesToExtract.push(i);
        } else {
          const n = parseInt(part);
          if (n >= 1 && n <= pages.length) pagesToExtract.push(n);
        }
      });

      if (pagesToExtract.length === 0) { alert('No valid pages to extract'); return; }

      setLoading(true);
      setProgress('Baking elements for extraction...');
      const bakedBytes = await generateModifiedPdfBytes();
      if (!bakedBytes) {
        setLoading(false);
        return;
      }

      const newDoc = await PDFDocument.create();
      const srcDoc = await PDFDocument.load(bakedBytes, { ignoreEncryption: true });
      const copiedPages = await newDoc.copyPages(srcDoc, pagesToExtract.map(n => n - 1));
      copiedPages.forEach(p => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const filename = `extracted_pages_${pagesToExtract.join('-')}.pdf`;
      if (onDownload) {
        onDownload(blob, filename);
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
      }
      setShowExtractModal(false);
    } catch (e) { console.error(e); alert('Extract failed'); }
  };

  // Add Page Numbers to all pages
  const handleAddPageNumbers = async (options: { position: string; format: string; startNum: number; prefix: string; margin: number }) => {
    pushHistory();
    const { position, format, startNum, prefix, margin } = options;
    const nextEls = { ...elements };

    const toRoman = (num: number): string => {
      const romanNumerals: [number, string][] = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
      let result = '';
      for (const [value, numeral] of romanNumerals) {
        while (num >= value) { result += numeral; num -= value; }
      }
      return result;
    };

    // Calculate text width based on format
    const getTextWidth = (): number => {
      if (format === 'page-of') return 120;
      if (format === 'roman') return 60;
      return 40 + (prefix.length * 6);
    };

    for (let i = 1; i <= pages.length; i++) {
      const pageNum = startNum + i - 1;
      let text = prefix;
      if (format === 'roman') text += toRoman(pageNum);
      else if (format === 'page-of') text += `Page ${pageNum} of ${pages.length}`;
      else text += pageNum;

      const pg = pages[i - 1];
      const textWidth = getTextWidth();
      const textHeight = 24;

      // Calculate position based on selection and margin
      let x: number, y: number;

      // Vertical position
      if (position.includes('bottom')) {
        y = pg.height - margin - textHeight;
      } else {
        y = margin;
      }

      // Horizontal position
      if (position.includes('left')) {
        x = margin;
      } else if (position.includes('right')) {
        x = pg.width - margin - textWidth;
      } else {
        // Center
        x = (pg.width - textWidth) / 2;
      }

      const el: PDFElement = {
        id: genId(), type: 'text', x, y, width: textWidth, height: textHeight, rotation: 0, opacity: 1,
        locked: false, visible: true, zIndex: 20, content: text, fontSize: 12,
        fontFamily: 'Helvetica', color: '#333333', textAlign: position.includes('left') ? 'left' : position.includes('right') ? 'right' : 'center', bold: false, italic: false
      };
      nextEls[i] = [...(nextEls[i] || []), el];
    }
    setElements(nextEls);
    setShowPageNumbersModal(false);
  };



  // Rotate all pages
  const handleRotateAll = (angle: number) => {
    setPages(prev => prev.map(p => ({ ...p, rotation: ((p.rotation || 0) + angle + 360) % 360 })));
    setShowRotateAllModal(false);
  };

  // Save PDF metadata
  const handleSaveMetadata = async (metadata: { title: string; author: string; subject: string; keywords: string }) => {
    const activePdf = pdf;
    if (!activePdf) return;
    try {
      activePdf.pdfLibDoc.setTitle(metadata.title);
      activePdf.pdfLibDoc.setAuthor(metadata.author);
      activePdf.pdfLibDoc.setSubject(metadata.subject);
      activePdf.pdfLibDoc.setKeywords([metadata.keywords]);
      setShowMetadataModal(false);
      alert('Metadata saved! Download the PDF to see changes.');
    } catch (e) { console.error(e); alert('Failed to save metadata'); }
  };

  // Protect PDF (Encrypt)
  const handleProtect = async (password: string) => {
    const activePdf = pdf;
    if (!activePdf) return;
    try {
      setLoading(true);
      // Reload doc to ensure robust instance
      const pdfBytes = await activePdf.pdfLibDoc.save();
      const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

      // Verify encrypt exists
      if (typeof (doc as any).encrypt !== 'function') {
        throw new Error('Encryption feature unavailable. Library compatibility issue.');
      }

      (doc as any).encrypt({
        userPassword: password,
        ownerPassword: password,
        permissions: { print: true, modifying: true, copying: true, annotating: true }
      });

      safelyUpdatePdf({ pdfLibDoc: doc, elements });

      alert('Password set! The PDF will be encrypted when you save/download it.');
      setShowProtectModal(false);
    } catch (e) {
      console.error(e);
      alert((e as any).message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };


  // Unlock PDF
  const handleUnlock = async () => {
    const activePdf = pdf;
    if (!activePdf) return;
    try {
      if (!confirm('This will remove password protection from the file. Continue?')) return;
      setLoading(true);
      const newDoc = await PDFDocument.create();
      const srcDoc = activePdf.pdfLibDoc;
      const copiedPages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices());
      copiedPages.forEach(p => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const newPdfDoc = await pdfjsLib.getDocument(url).promise;

      safelyUpdatePdf({ pdfLibDoc: newDoc, pdfDoc: newPdfDoc, elements });
      alert('Password removed!');
    } catch (e) { console.error(e); alert('Failed to unlock PDF'); }
    setLoading(false);
  };





  // Export pages as images - WITH ALL ELEMENTS APPLIED
  const handleExportImages = async (format: string, quality: number, pageRange: string) => {
    const activePdf = pdf;
    if (!activePdf) return;
    try {
      setLoading(true);
      setProgress('Applying elements to document...');

      // Use generateModifiedPdfBytes to ensure all elements/edits are applied
      const bytes = await generateModifiedPdfBytes();
      if (!bytes) {
        setLoading(false);
        return;
      }

      setProgress('Converting pages to images...');
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const pdfLocal = await pdfjsLib.getDocument(url).promise;

      const zip = new JSZip();
      const pagesToExport: number[] = [];
      pageRange.split(',').forEach(part => {
        part = part.trim();
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(n => parseInt(n.trim()));
          for (let i = start; i <= end; i++) if (i >= 1 && i <= pdfLocal.numPages) pagesToExport.push(i);
        } else {
          const n = parseInt(part);
          if (n >= 1 && n <= pdfLocal.numPages) pagesToExport.push(n);
        }
      });

      if (pagesToExport.length === 0) {
        for (let i = 1; i <= pdfLocal.numPages; i++) pagesToExport.push(i);
      }

      for (const i of pagesToExport) {
        setProgress(`Processing page ${i} of ${pdfLocal.numPages}...`);
        const page = await pdfLocal.getPage(i);
        const scale = 2; // High quality
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d')!, viewport, canvas }).promise;
        const imgBlob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), `image/${format}`, quality));
        zip.file(`${activePdf.name.replace(/\.pdf$/i, '')}_page_${i}.${format}`, imgBlob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const filename = `${activePdf.name.replace(/\.pdf$/i, '')}_images.zip`;
      if (onDownload) {
        onDownload(new File([content], filename, { type: 'application/zip' }), filename);
      } else {
        saveAs(content, filename);
      }
      setShowExportImagesModal(false);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };
  // Add header and footer to all pages
  const handleAddHeaderFooter = (options: { headerText: string; footerText: string; fontSize: number; position: string }) => {
    pushHistory();
    const { headerText, footerText, fontSize, position } = options;
    const nextEls = { ...elements };

    for (let i = 1; i <= pages.length; i++) {
      const pg = pages[i - 1];
      const textWidth = 300;

      // Calculate X position
      let x: number;
      if (position === 'left') x = 40;
      else if (position === 'right') x = pg.width - textWidth - 40;
      else x = (pg.width - textWidth) / 2;

      // Replace placeholders
      const processText = (text: string) => text.replace('{page}', String(i)).replace('{total}', String(pages.length));

      // Add header
      if (headerText) {
        const el: PDFElement = {
          id: genId(), type: 'text', x, y: 25, width: textWidth, height: fontSize + 10, rotation: 0, opacity: 1,
          locked: false, visible: true, zIndex: 25, content: processText(headerText), fontSize,
          fontFamily: 'Helvetica', color: '#333333', textAlign: position as any, bold: false, italic: false
        };
        nextEls[i] = [...(nextEls[i] || []), el];
      }

      // Add footer
      if (footerText) {
        const el: PDFElement = {
          id: genId(), type: 'text', x, y: pg.height - 35, width: textWidth, height: fontSize + 10, rotation: 0, opacity: 1,
          locked: false, visible: true, zIndex: 25, content: processText(footerText), fontSize,
          fontFamily: 'Helvetica', color: '#333333', textAlign: position as any, bold: false, italic: false
        };
        nextEls[i] = [...(nextEls[i] || []), el];
      }
    }
    setElements(nextEls);
    setShowHeaderFooterModal(false);
  };

  const [draggedPage, setDraggedPage] = useState<number | null>(null);
  const [dragOverPage, setDragOverPage] = useState<number | null>(null);
  const pendingPdfSync = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Instant visual move - no PDF operations
  const movePageVisual = (from: number, to: number) => {
    const activePdf = pdf;
    if (!activePdf || from === to) return;

    // 1. Immediate State Update
    const newPages = [...pages];
    const [movedMeta] = newPages.splice(from, 1);
    newPages.splice(to, 0, movedMeta);
    const finalPages = newPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));

    renderLockRef.current = true; // Lock rendering
    expectedPageIdOrderRef.current = finalPages.map(p => p.id);
    setPages(finalPages);

    // 2. Update Elements mapping
    const nextElements: { [p: number]: PDFElement[] } = {};
    const nextPageBackgrounds: { [p: number]: string } = {};
    const oldToNew: { [old: number]: number } = {};
    const oldOrder = pages.map((_, i) => i);
    const newOrder = [...oldOrder];
    const [movedIdx] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, movedIdx);
    newOrder.forEach((oldIdx, newIdx) => { oldToNew[oldIdx] = newIdx; });

    Object.keys(elements).forEach(key => {
      const oldPage = Number(key);
      const oldIdx = oldPage - 1;
      const newIdx = oldToNew[oldIdx];
      if (newIdx !== undefined && elements[oldPage]) {
        nextElements[newIdx + 1] = elements[oldPage];
      }
    });

    Object.keys(pageBackgrounds).forEach(key => {
      const oldPage = Number(key);
      const oldIdx = oldPage - 1;
      const newIdx = oldToNew[oldIdx];
      if (newIdx !== undefined && pageBackgrounds[oldPage]) {
        nextPageBackgrounds[newIdx + 1] = pageBackgrounds[oldPage];
      }
    });

    setElements(nextElements);
    setPageBackgrounds(nextPageBackgrounds);

    // 3. Update internal activePdf reference to match immediately to prevent drift?
    // No, we treat activePdf as immutable until safelyUpdatePdf replaces it.
    // Ideally we shouldn't mutate activePdf.pdfLibDoc in place if we can avoid it.
    // Previous mutation caused duplication bugs.

    // Update thumbnails immediately
    setPageImages(prev => {
      const next: { [p: number]: string } = {};
      newOrder.forEach((oldIdx, newIdx) => {
        const oldP = oldIdx + 1;
        const newP = newIdx + 1;
        if (prev[oldP]) next[newP] = prev[oldP];
      });
      return next;
    });

    // 4. Debounce the expensive PDF.js reload
    if (pendingPdfSync.current) clearTimeout(pendingPdfSync.current);
    pendingPdfSync.current = setTimeout(async () => {
      try {
        // Construct NEW document from the new order to guarantee correctness
        // Use ID mapping to find the TRUE, original index in the unmodified activePdf
        const newDoc = await PDFDocument.create();

        // Critical Fix: Map the *visual* page order (newPages) back to the *source* indices
        // using stable IDs. This allows multiple optimistic moves without index drift.
        const pagesToCopyIds = newPages.map(np =>
          activePdf.pages.findIndex(op => op.id === np.id)
        );
        console.log('?? DND Sync Order (Indices):', pagesToCopyIds);

        if (pagesToCopyIds.includes(-1)) {
          console.error('Page ID mismatch during reorder sync');
          renderLockRef.current = false;
          expectedPageIdOrderRef.current = null;
          return;
        }

        const copiedPages = await newDoc.copyPages(activePdf.pdfLibDoc, pagesToCopyIds);
        copiedPages.forEach(p => newDoc.addPage(p));

        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const newPdfDoc = await pdfjsLib.getDocument(url).promise;

        safelyUpdatePdf({
          file: new File([blob], activePdf.name, { type: 'application/pdf' }),
          pdfDoc: newPdfDoc,
          pdfLibDoc: newDoc,
          pageCount: newDoc.getPageCount(),
          elements: nextElements,
          pageBackgrounds: nextPageBackgrounds,
          // Use the captured closure newPages which represent the target state
          pages: newPages.map((p, i) => ({ ...p, pageNumber: i + 1 })),
          // Reset mapping
          sourcePageMapping: undefined
        });

        console.log('? PDF Sync Complete for Drag & Drop');
        setPageImages({});
        // Release the lock so renderPages can update the view
        renderLockRef.current = false;

      } catch (e) {
        console.error('PDF sync error:', e);
        renderLockRef.current = false;
        expectedPageIdOrderRef.current = null;
        // Revert checks could go here, but complex.
      }
    }, 500); // Wait 500ms before syncing
  };



  // Watermark
  const addWatermark = (text: string, opacity: number, type: 'text' | 'image' = 'text', src?: string) => {
    pushHistory();
    const newEls = { ...elements };
    const groupId = `sync_${crypto.randomUUID()}`;

    for (let i = 1; i <= pages.length; i++) {
      const pw = pages[i - 1].width * 1.5;
      const ph = pages[i - 1].height * 1.5;

      const base = {
        id: genId(),
        x: pw / 2 - (type === 'image' ? 100 : 150),
        y: ph / 2 - (type === 'image' ? 100 : 25),
        width: type === 'image' ? 200 : 300,
        height: type === 'image' ? 200 : 50,
        rotation: -45,
        opacity,
        locked: false,
        visible: true,
        zIndex: 30,
        syncGroupId: groupId
      };

      if (type === 'text') {
        newEls[i] = [...(newEls[i] || []), {
          ...base,
          type: 'watermark' as const,
          content: text,
          fontSize: 48,
          color: '#888'
        }];
      } else if (type === 'image' && src) {
        newEls[i] = [...(newEls[i] || []), {
          ...base,
          type: 'image',
          src
        } as any];
      }
    }
    setElements(newEls);
    setShowWatermarkModal(false);
  };

  const applySelectedToAllPages = () => {
    if (!selected) return;
    pushHistory();

    // Ensure selected has a grouping ID
    let groupId = selected.syncGroupId;
    if (!groupId) {
      groupId = `sync_${crypto.randomUUID()}`;
      // Update selected PDFElement on current page
      const currentEls = [...(elements[page] || [])];
      const idx = currentEls.findIndex(e => e.id === selected.id);
      if (idx !== -1) {
        currentEls[idx] = { ...selected, syncGroupId: groupId };
        setElements({ ...elements, [page]: currentEls });
        setSelected(currentEls[idx]);
      }
    }

    const newEls = { ...elements };
    for (let i = 1; i <= pages.length; i++) {
      if (i === page) continue; // Skip current page (we already updated or it's source)

      // Filter out existing elements with same groupId to prevent duplicates
      const filtered = (newEls[i] || []).filter(e => e.syncGroupId !== groupId);

      // Add the synchronized clone
      newEls[i] = [...filtered, { ...selected, id: genId(), syncGroupId: groupId, zIndex: elements[i]?.length || 0 }];
    }
    setElements(newEls);
    alert('Smart Sync: Applied changes to all pages and removed old versions.');
  };

  const removeAllSynchronized = () => {
    if (!selected || !selected.syncGroupId) {
      alert('Select a synchronized PDFElement first.');
      return;
    }
    pushHistory();
    const groupId = selected.syncGroupId;
    const newEls = { ...elements };
    Object.keys(newEls).forEach(pStr => {
      const p = Number(pStr);
      newEls[p] = (newEls[p] || []).filter(e => e.syncGroupId !== groupId);
    });
    setElements(newEls);
    setSelected(null);
    alert('Removed all instances of this synchronized PDFElement from the document.');
  };

  // Split PDF
  const handleSplit = async (ranges: string) => {
    setLoading(true);
    setProgress('Baking elements for split...');
    try {
      const bakedBytes = await generateModifiedPdfBytes();
      if (!bakedBytes) {
        setLoading(false);
        return;
      }
      const srcDoc = await PDFDocument.load(bakedBytes, { ignoreEncryption: true });

      const parts = ranges.split(',').map(r => r.trim());
      for (const part of parts) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        const newDoc = await PDFDocument.create();
        for (let i = start; i <= (end || start); i++) {
          if (i < 1 || i > srcDoc.getPageCount()) continue;
          const [cp] = await newDoc.copyPages(srcDoc, [i - 1]);
          newDoc.addPage(cp);
        }
        const bytes = await newDoc.save();
        const blob = new Blob([bytes as any], { type: 'application/pdf' });
        const filename = `split_${part.replace('-', '_')}.pdf`;
        if (onDownload) {
          onDownload(blob, filename);
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
          URL.revokeObjectURL(url);
        }
      }
      setShowSplitModal(false);
    } catch (e) {
      console.error(e);
      alert('Split failed');
    }
    setLoading(false);
    setProgress('');
  };

  // Compress (simplified - just re-exports)
  const handleCompress = async () => {
    const activePdf = pdf;
    if (!activePdf) return;
    setLoading(true);
    setProgress('Applying elements for compression...');
    try {
      const bytes = await generateModifiedPdfBytes();
      if (!bytes) {
        setLoading(false);
        return;
      }
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const filename = activePdf.name.replace('.pdf', '_compressed.pdf');
      if (onDownload) {
        onDownload(blob, filename);
      } else {
        saveAs(blob, filename);
      }
      setShowCompressModal(false);
    } catch (e) {
      console.error(e);
      alert('Compression failed');
    }
    setLoading(false);
    setProgress('');
  };

  // Export as Text (Plain Text, Markdown, HTML) or Visual HTML
  const handleExportText = async (format: 'txt' | 'md' | 'html' | 'visual-html', _options: { preserveLayout: boolean; includeImages: boolean }) => {
    const activePdf = pdf;
    if (!activePdf) return;

    // Handle visual HTML export with image rendering
    if (format === 'visual-html') {
      setProgress('Baking elements for visual export...');
      const bytes = await generateModifiedPdfBytes();
      if (!bytes) {
        setProgress('');
        return;
      }
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const newPdfDoc = await pdfjsLib.getDocument(url).promise;
      const bakedPdf = { ...activePdf, pdfDoc: newPdfDoc, file: new File([bytes as any], activePdf.name, { type: 'application/pdf' }) };

      await handleVisualHTMLExport(bakedPdf, setProgress, setShowExportTextModal, onDownload);

      // Clean up
      newPdfDoc.destroy();
      URL.revokeObjectURL(url);
      return;
    }

    setProgress('Extracting text...');
    try {
      const pdfJsDoc = activePdf.pdfDoc;
      let fullText = '';
      const pageTexts: string[] = [];

      for (let i = 1; i <= pdfJsDoc.numPages; i++) {
        const page = await pdfJsDoc.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items as any[];

        // Group items by Y position for line detection
        const lines: { y: number; items: any[] }[] = [];
        items.forEach(item => {
          if (!item.str) return;
          const y = Math.round(item.transform[5]);
          let line = lines.find(l => Math.abs(l.y - y) < 5);
          if (!line) {
            line = { y, items: [] };
            lines.push(line);
          }
          line.items.push(item);
        });

        // Sort lines top to bottom
        lines.sort((a, b) => b.y - a.y);

        let pageText = '';
        lines.forEach(line => {
          line.items.sort((a, b) => a.transform[4] - b.transform[4]);
          const lineText = line.items.map(item => item.str).join(' ').trim();
          if (lineText) pageText += lineText + '\n';
        });

        pageTexts.push(pageText);

        // Also include user-added text elements for this page
        const pageElements = elements[i] || [];
        const userTexts = pageElements
          .filter((el: PDFElement) => el.visible && (el.type === 'text' || el.type === 'hyperlink'))
          .map((el: PDFElement) => {
            if (el.type === 'text') {
              return (el as TextEl).content || '';
            } else if (el.type === 'hyperlink') {
              const hel = el as any;
              return `[${hel.content || hel.url}](${hel.url})`;
            }
            return '';
          })
          .filter((t: string) => t.trim());

        if (userTexts.length > 0) {
          pageTexts[i - 1] += '\n\n--- Added Elements ---\n' + userTexts.join('\n');
        }
      }

      // Format based on type
      if (format === 'txt') {
        fullText = pageTexts.map((t, i) => `--- Page ${i + 1} ---\n${t}`).join('\n\n');
      } else if (format === 'md') {
        fullText = pageTexts.map((t, i) => {
          // Try to detect headings (lines with larger font or all caps at start)
          const lines = t.split('\n');
          const mdLines = lines.map(line => {
            if (line.length < 50 && line.length > 0 && line === line.toUpperCase() && /[A-Z]/.test(line)) {
              return `## ${line}`;
            }
            return line;
          });
          return `# Page ${i + 1}\n\n${mdLines.join('\n')}`;
        }).join('\n\n---\n\n');
      } else if (format === 'html') {
        const htmlPages = pageTexts.map((t, i) => {
          const paragraphs = t.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('\n');
          return `<div class="page" id="page-${i + 1}"><h2>Page ${i + 1}</h2>${paragraphs}</div>`;
        }).join('\n<hr>\n');

        fullText = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activePdf.name.replace('.pdf', '')}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 2rem auto; padding: 1rem; line-height: 1.6; }
    .page { margin-bottom: 2rem; }
    h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 0.5rem; }
    hr { border: none; border-top: 2px dashed #ccc; margin: 2rem 0; }
  </style>
</head>
<body>
  <h1>${activePdf.name.replace('.pdf', '')}</h1>
  ${htmlPages}
</body>
</html>`;
      }

      const ext = format === 'md' ? 'md' : format === 'html' ? 'html' : 'txt';
      const mimeType = format === 'html' ? 'text/html' : 'text/plain';
      const blob = new Blob([fullText], { type: `${mimeType};charset=utf-8` });
      const filename = activePdf.name.replace('.pdf', `.${ext}`);

      if (onDownload) {
        onDownload(blob, filename);
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
      }

      setShowExportTextModal(false);
      setProgress('');
    } catch (e) {
      alert('Text extraction failed: ' + (e as Error).message);
      setProgress('');
    }
  };

  // Table Extraction to CSV/Excel
  const handleTableExtraction = async (format: 'csv' | 'xlsx', pageRange: string) => {
    const activePdf = pdf;
    if (!activePdf) return;

    setProgress('Detecting tables...');
    try {
      const pdfJsDoc = activePdf.pdfDoc;
      const allTables: { page: number; rows: string[][] }[] = [];

      // Determine pages to process
      let pagesToProcess: number[] = [];
      if (pageRange === 'all') {
        pagesToProcess = Array.from({ length: pdfJsDoc.numPages }, (_, i) => i + 1);
      } else if (pageRange === 'current') {
        pagesToProcess = [page];
      } else {
        pageRange.split(',').forEach(part => {
          part = part.trim();
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim()));
            for (let i = start; i <= end; i++) pagesToProcess.push(i);
          } else {
            pagesToProcess.push(parseInt(part));
          }
        });
      }

      for (const pageNum of pagesToProcess) {
        const pageObj = await pdfJsDoc.getPage(pageNum);
        const textContent = await pageObj.getTextContent();
        const items = textContent.items as any[];

        // Group by Y position (rows)
        const rows: { y: number; cells: { x: number; text: string }[] }[] = [];
        items.forEach(item => {
          if (!item.str?.trim()) return;
          const y = Math.round(item.transform[5]);
          const x = Math.round(item.transform[4]);

          let row = rows.find(r => Math.abs(r.y - y) < 8);
          if (!row) {
            row = { y, cells: [] };
            rows.push(row);
          }

          // Try to merge consecutive text into cells
          const lastCell = row.cells[row.cells.length - 1];
          if (lastCell && x - (lastCell.x + lastCell.text.length * 5) < 20) {
            lastCell.text += ' ' + item.str;
          } else {
            row.cells.push({ x, text: item.str });
          }
        });

        // Sort rows and cells
        rows.sort((a, b) => b.y - a.y);
        rows.forEach(row => row.cells.sort((a, b) => a.x - b.x));

        // Convert to 2D array
        const tableRows = rows.map(r => r.cells.map(c => c.text.trim()));
        if (tableRows.length > 1) {
          allTables.push({ page: pageNum, rows: tableRows });
        }
      }

      if (allTables.length === 0) {
        alert('No tables detected. Try adjusting the page range or check if the PDF contains tabular data.');
        setProgress('');
        return;
      }

      if (format === 'csv') {
        const csvContent = allTables.map(table => {
          return `--- Page ${table.page} ---\n` + table.rows.map(row =>
            row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
          ).join('\n');
        }).join('\n\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const filename = activePdf.name.replace('.pdf', '_tables.csv');
        if (onDownload) onDownload(blob, filename);
        else saveAs(blob, filename);
      } else {
        // Excel format using xlsx library
        const workbook = XLSX.utils.book_new();
        allTables.forEach((table, _idx) => {
          const worksheet = XLSX.utils.aoa_to_sheet(table.rows);
          XLSX.utils.book_append_sheet(workbook, worksheet, `Page ${table.page}`);
        });
        const xlsxBytes = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
        const blob = new Blob([xlsxBytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const filename = activePdf.name.replace('.pdf', '_tables.xlsx');
        if (onDownload) onDownload(blob, filename);
        else saveAs(blob, filename);
      }

      setShowTableExtractionModal(false);
      setProgress('');
      alert(`Extracted ${allTables.length} table(s) successfully!`);
    } catch (e) {
      alert('Table extraction failed: ' + (e as Error).message);
      setProgress('');
    }
  };

  // Generate Table of Contents
  const handleGenerateTOC = async (_options: { detectHeadings: boolean; addLinks: boolean }) => {
    const activePdf = pdf;
    if (!activePdf) return;

    setProgress('Analyzing document structure...');
    try {
      const pdfJsDoc = activePdf.pdfDoc;
      const headings: { text: string; page: number; fontSize: number }[] = [];

      for (let i = 1; i <= pdfJsDoc.numPages; i++) {
        const pageObj = await pdfJsDoc.getPage(i);
        const textContent = await pageObj.getTextContent();
        const items = textContent.items as any[];

        // Find large text items (likely headings)
        items.forEach(item => {
          if (!item.str?.trim()) return;
          const fontSize = Math.abs(item.transform[0]) || 12;

          // Heuristic: headings are larger than 14pt and shorter lines
          if (fontSize >= 14 && item.str.length < 100 && item.str.trim().length > 2) {
            headings.push({
              text: item.str.trim(),
              page: i,
              fontSize
            });
          }
        });
      }

      // Sort by font size to determine hierarchy
      const avgFontSize = headings.reduce((sum, h) => sum + h.fontSize, 0) / headings.length || 14;

      // Generate TOC content
      let tocContent = '# Table of Contents\n\n';
      headings.forEach(heading => {
        const level = heading.fontSize > avgFontSize + 4 ? '' : heading.fontSize > avgFontSize ? '  ' : '    ';
        tocContent += `${level}- [${heading.text}](#page-${heading.page}) (Page ${heading.page})\n`;
      });

      // Add as text PDFElement on first page
      if (headings.length > 0) {
        addElement({
          id: genId(),
          type: 'text',
          x: 50,
          y: 50,
          width: 400,
          height: Math.min(headings.length * 20 + 40, 500),
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          zIndex: 10,
          content: tocContent,
          fontFamily: 'Arial',
          fontSize: 11,
          color: '#000000',
          bold: false,
          italic: false,
          textAlign: 'left'
        });

        alert(`Generated TOC with ${headings.length} entries. The TOC has been added to Page 1. You can move and resize it as needed.`);
      } else {
        alert('No headings detected. The document may not have clear heading structure.');
      }

      setShowTOCModal(false);
      setProgress('');
    } catch (e) {
      alert('TOC generation failed: ' + (e as Error).message);
      setProgress('');
    }
  };

  // Canvas interactions
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || dragging || resizing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    if (tool === 'text') { setClickPos({ x, y }); setNewText(''); setShowTextModal(true); }
    else if (tool === 'shape') addElement({ id: genId(), type: 'shape', shapeType: 'rectangle', x, y, width: 100, height: 60, rotation: 0, opacity: 1, locked: false, visible: true, zIndex: (elements[page]?.length || 0), fill: 'rgba(139,92,246,0.3)', stroke: '#8b5cf6', strokeWidth: 2 });
    else if (tool === 'circle') addElement({ id: genId(), type: 'shape', shapeType: 'circle', x, y, width: 80, height: 80, rotation: 0, opacity: 1, locked: false, visible: true, zIndex: (elements[page]?.length || 0), fill: 'rgba(34,211,238,0.3)', stroke: '#22d3ee', strokeWidth: 2 });
    else if (tool === 'highlight') addElement({ id: genId(), type: 'highlight', x, y, width: 150, height: 24, rotation: 0, opacity: 0.4, locked: false, visible: true, zIndex: (elements[page]?.length || 0), color: '#facc15' });
    else if (tool === 'redact') addElement({ id: genId(), type: 'redaction', x, y, width: 150, height: 24, rotation: 0, opacity: 1, locked: false, visible: true, zIndex: 50, color: '#000000' });
    else if (tool === 'whiteout') addElement({ id: genId(), type: 'redaction', x, y, width: 150, height: 24, rotation: 0, opacity: 1, locked: false, visible: true, zIndex: 50, color: '#FFFFFF' });
    // Don't deselect when clicking empty space - only deselect explicitly
  };

  // Freehand drawing
  const handleDrawStart = (e: any) => {
    if (tool !== 'draw' || !canvasRef.current) return;
    if (e.cancelable && (e.type === 'touchstart' || e.touches)) e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = e.touches?.[0]?.clientX ?? e.clientX;
    const cy = e.touches?.[0]?.clientY ?? e.clientY;
    const x = (cx - rect.left) / zoom;
    const y = (cy - rect.top) / zoom;
    setIsDrawing(true);
    setDrawPaths([{ x, y }]);
  };

  const handleDrawMove = (e: any) => {
    if (tool === 'draw' && e.cancelable && (e.type === 'touchmove' || e.touches)) { e.preventDefault(); }
    if (!isDrawing || tool !== 'draw' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = e.touches?.[0]?.clientX ?? e.clientX;
    const cy = e.touches?.[0]?.clientY ?? e.clientY;
    const x = (cx - rect.left) / zoom;
    const y = (cy - rect.top) / zoom;
    setDrawPaths(p => [...p, { x, y }]);
  };

  const handleDrawEnd = (_e?: any) => {
    if (!isDrawing || drawPaths.length < 2) { setIsDrawing(false); return; }
    const pathStr = drawPaths.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const minX = Math.min(...drawPaths.map(p => p.x));
    const minY = Math.min(...drawPaths.map(p => p.y));
    const maxX = Math.max(...drawPaths.map(p => p.x));
    const maxY = Math.max(...drawPaths.map(p => p.y));
    addElement({
      id: genId(),
      type: 'drawing',
      x: minX,
      y: minY,
      width: maxX - minX + 10,
      height: maxY - minY + 10,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: (elements[page]?.length || 0),
      paths: pathStr,
      stroke: drawingColor,
      strokeWidth: drawingWidth
    });
    console.log('?? Drawing added:', pathStr.substring(0, 100));
    setIsDrawing(false);
    setDrawPaths([]);
  };

  const addText = () => { if (!newText.trim()) return; addElement({ id: genId(), type: 'text', x: clickPos.x, y: clickPos.y, width: 200, height: 30, rotation: 0, opacity: 1, locked: false, visible: true, zIndex: (elements[page]?.length || 0), content: newText, fontSize: 16, fontFamily: 'Arial', color: '#000', textAlign: 'left', bold: false, italic: false }); setShowTextModal(false); };
  const addSignature = (d: string) => { addElement({ id: genId(), type: 'signature', x: 100, y: 100, width: 200, height: 100, rotation: 0, opacity: 1, locked: false, visible: true, zIndex: (elements[page]?.length || 0), src: d }); setShowSigModal(false); };

  // Handler for new form field from AddFieldsPanel
  const handleAddFormField = (field: FormField) => {
    const el: FormFieldEl = {
      id: genId(),
      type: 'formfield',
      fieldType: field.type,
      x: field.x,
      y: field.y,
      width: field.width,
      height: field.height,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: (elements[page]?.length || 0),
      value: field.value || '',
      placeholder: field.placeholder,
      required: field.required,
      readOnly: field.readOnly,
      options: field.options,
      label: field.label || field.type.charAt(0).toUpperCase() + field.type.slice(1).replace('_', ' '),
      helpText: field.helpText,
      fontSize: field.fontSize || 14,
    };
    addElement(el);
  };

  // Handler for table creation from TableCreator
  const handleAddTable = (tableData: TableData) => {
    const { rows, cols, cellWidth, cellHeight, borderColor, headerBg, cellBg, borderWidth, cells } = tableData;

    const currentPageWidth = pages[page - 1]?.width * 1.5 || 600;
    const currentPageHeight = pages[page - 1]?.height * 1.5 || 800;

    const totalWidth = cols * cellWidth;
    const totalHeight = rows * cellHeight;

    addElement({
      id: genId(),
      type: 'table',
      x: currentPageWidth / 2 - totalWidth / 2,
      y: currentPageHeight / 2 - totalHeight / 2,
      width: totalWidth,
      height: totalHeight,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: (elements[page]?.length || 0),
      rows,
      cols,
      cellWidth,
      cellHeight,
      borderColor,
      borderWidth,
      headerBg,
      cellBg,
      cells: [...cells.map(r => [...r])], // Deep copy
      autoHeight: true
    });
    setShowTableCreator(false);
  };

  // Handler for enhanced signature from SignatureCreator
  const handleAddESignature = (signatureData: string, initialsData: string | null, signatureType: string) => {
    console.log('Adding signature:', { type: signatureType, hasInitials: !!initialsData });

    addElement({
      id: genId(),
      type: 'signature',
      x: 100,
      y: 100,
      width: 250,
      height: 100,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: (elements[page]?.length || 0),
      src: signatureData
    });
    setShowSignatureCreator(false);
  };

  const addShape = (type: any) => {
    addElement({
      id: genId(), type: 'shape', shapeType: type,
      x: 100 + (elements[page]?.length || 0) * 10, y: 100 + (elements[page]?.length || 0) * 10,
      width: 100, height: 100, rotation: 0, opacity: 1,
      locked: false, visible: true, zIndex: (elements[page]?.length || 0),
      fill: type === 'line' || type === 'arrow' ? 'transparent' : 'rgba(139,92,246,0.5)',
      stroke: '#8b5cf6', strokeWidth: 2
    });
    setShowShapeMenu(false);
  };

  const addStamp = (text: string, color: string) => {
    const currentPageWidth = pages[page - 1].width * 1.5;
    const currentPageHeight = pages[page - 1].height * 1.5;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80">
        <rect x="5" y="5" width="190" height="70" rx="10" ry="10" fill="none" stroke="${color}" stroke-width="5" />
        <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="${color}" font-family="Arial, sans-serif" font-size="28" font-weight="bold" style="text-transform: uppercase; letter-spacing: 2px;">${text}</text>
      </svg>`;
    const src = 'data:image/svg+xml;base64,' + btoa(svg);
    const newEl: ImageEl = {
      id: crypto.randomUUID(), type: 'image', x: currentPageWidth / 2 - 100, y: currentPageHeight / 2 - 40, width: 200, height: 80,
      opacity: 1, rotation: 0, visible: true, locked: false, zIndex: elements[page]?.length || 0, src
    };
    addElement(newEl);
  };

  const addSticker = (svgString: string) => {
    const currentPageWidth = pages[page - 1].width * 1.5;
    const currentPageHeight = pages[page - 1].height * 1.5;
    // Ensure the SVG has xmlns and proper dimensions for data URL
    const finalSvg = svgString.includes('xmlns') ? svgString : svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    const src = 'data:image/svg+xml;base64,' + btoa(finalSvg);
    const newEl: ImageEl = {
      id: crypto.randomUUID(), type: 'image', x: currentPageWidth / 2 - 50, y: currentPageHeight / 2 - 50, width: 100, height: 100,
      opacity: 1, rotation: 0, visible: true, locked: false, zIndex: elements[page]?.length || 0, src
    };
    addElement(newEl);
  };

  const handleMaterialSelect = (type: string, data: any) => {
    const pw = pages[page - 1].width * 1.5;
    const ph = pages[page - 1].height * 1.5;
    const x = pw / 2 - 50;
    const y = ph / 2 - 50;

    if (type === 'stamp') {
      addStamp(data.name, data.color);
    } else if (type === 'emoji') {
      addElement({
        id: genId(), type: 'text', x, y, width: 80, height: 80,
        rotation: 0, opacity: 1, locked: false, visible: true, zIndex: 99,
        content: data.content, fontSize: 50, fontFamily: 'Arial', color: '#000',
        textAlign: 'center', bold: false, italic: false
      } as any);
    } else if (type === 'sticker') {
      if (data.svgString) {
        addSticker(data.svgString);
      } else {
        // Fallback for icons without svgString (legacy)
        addStamp(data.name.toUpperCase(), data.color || '#8b5cf6');
      }
    } else if (type === 'shape') {
      addShape(data.shapeType);
    } else if (type === 'redact') {
      addElement({
        id: genId(), type: 'shape', shapeType: 'rectangle',
        x, y, width: 120, height: 40, rotation: 0, opacity: 1,
        locked: false, visible: true, zIndex: 50,
        fill: data.color || '#000', stroke: data.color || '#000', strokeWidth: 0
      });
    }
    setShowMaterialGallery(false);
  };

  const addQRCode = (text: string) => {
    if (!text) return;
    const src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
    // We need to fetch and convert to base64 to ensure it saves in the PDF properly without CORS/loading issues later
    // For now, let's use the URL directly as ImageEl supports URL. Enhancing to base64 would be better but requires async fetch.
    // Let's wrap in a try-catch self-executing async or just use URL. Using URL is risky if internet is down during export.
    // Better: Fetch it.
    fetch(src).then(r => r.blob()).then(b => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const currentPageWidth = pages[page - 1].width * 1.5;
        const currentPageHeight = pages[page - 1].height * 1.5;
        addElement({
          id: crypto.randomUUID(), type: 'image', x: currentPageWidth / 2 - 75, y: currentPageHeight / 2 - 75, width: 150, height: 150,
          opacity: 1, rotation: 0, visible: true, locked: false, zIndex: elements[page]?.length || 0, src: base64
        });
      };
      reader.readAsDataURL(b);
    }).catch(e => {
      console.error(e);
      alert('Failed to generate QR Code. Check internet connection.');
    });
    setShowQRCodeModal(false);
  };

  const addHyperlink = (url: string, displayText: string) => {
    if (!url) return;
    const currentPageWidth = pages[page - 1].width * 1.5;
    const currentPageHeight = pages[page - 1].height * 1.5;
    addElement({
      id: crypto.randomUUID(),
      type: 'hyperlink',
      x: currentPageWidth / 2 - 100,
      y: currentPageHeight / 2 - 15,
      width: 200,
      height: 30,
      opacity: 1,
      rotation: 0,
      visible: true,
      locked: false,
      zIndex: elements[page]?.length || 0,
      url: url,
      content: displayText || url,
      fontSize: 14,
      color: '#2563eb'
    } as any);
    setShowHyperlinkModal(false);
  };

  const handleImageUpload = () => {
    const i = document.createElement('input');
    i.type = 'file';
    i.accept = 'image/*';
    i.onchange = () => {
      const f = i.files?.[0];
      if (f) {
        const r = new FileReader();
        r.onload = ev => {
          const src = ev.target?.result as string;
          const img = new window.Image();
          img.onload = () => {
            // Target width of 200, height proportional to natural aspect ratio
            const naturalWidth = img.naturalWidth || 200;
            const naturalHeight = img.naturalHeight || 150;
            const ratio = naturalHeight / naturalWidth;
            const width = 200;
            const height = 200 * ratio;

            addElement({
              id: genId(),
              type: 'image',
              x: 100,
              y: 100,
              width,
              height,
              rotation: 0,
              opacity: 1,
              locked: false,
              visible: true,
              zIndex: (elements[page]?.length || 0),
              src
            });
          };
          img.src = src;
        };
        r.readAsDataURL(f);
      }
    };
    i.click();
  };

  const handleElMouseDown = (e: any, el: PDFElement) => {
    e.stopPropagation();
    // Check if the actual click target is an editable PDFElement or within a table cell
    const isEditable = e.target.isContentEditable ||
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.closest('td') ||
      e.target.closest('[contenteditable="true"]');

    if (!isEditable) {
      e.preventDefault();
    }

    if (el.locked) return;
    setSelected(el);


    // Focus helper: If clicked on a TD, focus its contentEditable child
    if (e.target.tagName === 'TD') {
      const editable = e.target.querySelector('[contenteditable="true"]') as HTMLElement;
      if (editable) editable.focus();
    }

    const cx = e.touches?.[0]?.clientX ?? e.clientX;
    const cy = e.touches?.[0]?.clientY ?? e.clientY;
    setDragging({ el, startX: cx, startY: cy, elX: el.x, elY: el.y });
  };

  useEffect(() => {
    const move = (e: any) => {
      // Prevent scrolling while dragging/resizing on touch devices
      if ((dragging || resizing) && e.cancelable) {
        e.preventDefault();
      }

      const cx = e.touches?.[0]?.clientX ?? e.clientX;
      const cy = e.touches?.[0]?.clientY ?? e.clientY;
      if (dragging) { const dx = (cx - dragging.startX) / zoom; const dy = (cy - dragging.startY) / zoom; updateEl({ ...dragging.el, x: dragging.elX + dx, y: dragging.elY + dy }); }
      if (resizing) {
        const dx = (cx - resizing.startX) / zoom; const dy = (cy - resizing.startY) / zoom;
        let nw = resizing.startW, nh = resizing.startH, nx = resizing.startElX, ny = resizing.startElY;
        if (resizing.h.includes('e')) nw = Math.max(20, resizing.startW + dx);
        if (resizing.h.includes('w')) { nw = Math.max(20, resizing.startW - dx); nx = resizing.startElX + dx; }
        if (resizing.h.includes('s')) nh = Math.max(20, resizing.startH + dy);
        if (resizing.h.includes('n')) { nh = Math.max(20, resizing.startH - dy); ny = resizing.startElY + dy; }
        updateEl({ ...resizing.el, x: nx, y: ny, width: nw, height: nh });
      }
    };
    const up = (e: any) => {
      if (dragging || resizing) {
        pushHistory();
        // Auto-deselect if resized or moved > 5px
        let shouldDeselect = !!resizing;
        if (dragging) {
          const cx = e.changedTouches?.[0]?.clientX ?? e.clientX;
          const cy = e.changedTouches?.[0]?.clientY ?? e.clientY;
          if (cx !== undefined && cy !== undefined) {
            const dist = Math.hypot(cx - dragging.startX, cy - dragging.startY);
            if (dist > 5) shouldDeselect = true;
          }
        }
        if (shouldDeselect) setSelected(null);
      }
      setDragging(null); setResizing(null);
    };
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    // Passive: false is required to preventDefault (stop scrolling) on touch devices
    window.addEventListener('touchmove', move, { passive: false }); window.addEventListener('touchend', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); window.removeEventListener('touchmove', move); window.removeEventListener('touchend', up); };
  }, [dragging, resizing, zoom]);

  const handleResizeStart = (e: any, el: PDFElement, h: string) => { e.stopPropagation(); const cx = e.touches?.[0]?.clientX ?? e.clientX; const cy = e.touches?.[0]?.clientY ?? e.clientY; setResizing({ el, h, startX: cx, startY: cy, startW: el.width, startH: el.height, startElX: el.x, startElY: el.y }); };

  const applyToAll = () => {
    if (!selected) return;
    const msg = selected.type === 'watermark'
      ? 'Apply this watermark to all pages? Previous watermarks on other pages will be replaced.'
      : 'Apply this PDFElement to all pages?';
    if (!window.confirm(msg)) return;

    const newEls = { ...elements };
    for (let i = 1; i <= pages.length; i++) {
      if (i === page) continue;

      let pEls = newEls[i] || [];
      // If selected is a Watermark, clear other watermarks to avoid duplicates
      if (selected.type === 'watermark') {
        pEls = pEls.filter(e => e.type !== 'watermark');
      }

      // Add copy of selected PDFElement
      pEls.push({ ...selected, id: genId() });
      newEls[i] = pEls;
    }
    setElements(newEls);
    alert('Applied to all pages!');
  };

  // Apply ALL style properties AND content format of the selected PDFElement to similar elements on other pages
  // Useful for page numbers where styling and prefix should be the same across pages
  const applyStylesToAll = () => {
    if (!selected || selected.type !== 'text') return;
    if (!window.confirm('Apply all styles AND content format to page numbers on all pages?\n\nThis includes: position, size, font, color, bold, italic, opacity, rotation, and text prefix (like "page " or "Page - ").\n\nEach page will keep its unique number but use your format.')) return;

    const selectedText = selected as TextEl;
    const { x, y, width, height, fontSize, fontFamily, color, bold, italic, textAlign, opacity, rotation, content } = selectedText;

    // Extract the prefix from the current content (everything before the last number)
    // e.g., "page 1" -> prefix="page ", "Page - 5" -> prefix="Page - ", "I" -> prefix=""
    const currentContent = content.toString();
    const match = currentContent.match(/^(.*?)(\d+|[IVXLCDM]+)$/i);
    const prefix = match ? match[1] : '';
    const currentNum = match ? match[2] : currentContent;
    const isRoman = /^[IVXLCDM]+$/i.test(currentNum);

    // Roman numeral converter
    const toRoman = (num: number): string => {
      const romanNumerals: [number, string][] = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
      let result = '';
      for (const [value, numeral] of romanNumerals) {
        while (num >= value) { result += numeral; num -= value; }
      }
      return result;
    };

    const newEls = { ...elements };

    for (let i = 1; i <= pages.length; i++) {
      const pEls = newEls[i] || [];
      // Find text elements that look like page numbers (created at zIndex 1000)
      const updatedEls = pEls.map(el => {
        if (el.type === 'text' && el.zIndex === 1000) {
          // Generate new content with the same prefix format but the correct page number
          const pageNumber = isRoman ? toRoman(i) : i.toString();
          const newContent = prefix + pageNumber;

          return {
            ...el,
            x, y, width, height, fontSize, fontFamily, color, bold, italic, textAlign, opacity, rotation,
            content: newContent
          };
        }
        return el;
      });
      newEls[i] = updatedEls;
    }
    setElements(newEls);
    alert('All styles and content format applied to all pages!');
  };

  const generateModifiedPdfBytes = async () => {
    const activePdf = pdf;
    if (!activePdf) return null;

    try {
      // Create a fresh copy of the document to work on
      const currentBytes = await activePdf.pdfLibDoc.save();
      const pdfLibDoc = await PDFDocument.load(currentBytes, { ignoreEncryption: true });
      const pdfPages = pdfLibDoc.getPages();

      for (let i = 0; i < pdfPages.length; i++) {
        const pageNum = i + 1;
        const pdfPage = pdfPages[i];
        const componentPageData = pages[i];
        const userRotation = componentPageData?.rotation || 0;

        if (userRotation !== 0) {
          pdfPage.setRotation(degrees(userRotation));
        }

        const pageEls = elements[pageNum] || [];
        const sortedEls = [...pageEls].sort((a, b) => {
          const zDiff = (a.zIndex || 0) - (b.zIndex || 0);
          if (zDiff !== 0) return zDiff;
          const typeScore = (t: string) => {
            if (t === 'text') return 100;
            if (t === 'shape') return 10;
            return 0;
          };
          return typeScore(a.type) - typeScore(b.type);
        });

        const displayRot = ((userRotation || 0) % 360 + 360) % 360;
        const compW_pts = componentPageData?.width || 612;
        const compH_pts = componentPageData?.height || 792;
        const pgSize = pdfPage.getSize();
        const pgW = pgSize.width;
        const pgH = pgSize.height;
        const cropBox = pdfPage.getCropBox() || pdfPage.getMediaBox();

        // BACKGROUND COLOR
        const bgColor = pageBackgrounds[pageNum];
        if (bgColor && bgColor !== '#ffffff' && bgColor !== 'white' && bgColor !== 'transparent' && !bgColor.endsWith('00')) {
          const c = parseColor(bgColor);
          pdfPage.drawRectangle({
            x: 0, y: 0, width: pgW, height: pgH,
            color: c.rgb, blendMode: BlendMode.Multiply,
          });
        }

        const getPdfCoords = (elX: number, elY: number, elW: number, elH: number) => {
          const x = elX / 1.5;
          const y = elY / 1.5;
          const w = elW / 1.5;
          const h = elH / 1.5;
          const cx = cropBox.x;
          const cy = cropBox.y;

          let res;
          if (displayRot === 0) {
            res = { x: cx + x, y: cy + compH_pts - y - h, w: w, h: h };
          } else if (displayRot === 90) {
            res = { x: cx + y, y: cy + x, w: h, h: w };
          } else if (displayRot === 180) {
            res = { x: cx + compW_pts - x - w, y: cy + y, w: w, h: h };
          } else if (displayRot === 270) {
            res = { x: cx + compH_pts - y - h, y: cy + compW_pts - x - w, w: h, h: w };
          } else {
            res = { x: cx + x, y: cy + compH_pts - y - h, w: w, h: h };
          }
          return res;
        };

        // PASS 1: Whiteout original text
        for (const el of sortedEls) {
          if (!el.visible) continue;
          if (el.type === 'text' && (el as any).original && (el as any).originalRect) {
            const orig = (el as any).originalRect;
            pdfPage.drawRectangle({
              x: orig.x, y: orig.y - 2, width: orig.w, height: orig.h + 4,
              color: rgb(1, 1, 1), opacity: 1,
            });
          }
        }

        // PASS 2: Draw Elements
        for (const el of sortedEls) {
          if (!el.visible) continue;
          const { x: pdfX, y: pdfY, w: elW_pdf, h: elH_pdf } = getPdfCoords(el.x, el.y, el.width, el.height);
          const elRotDegrees = degrees(-el.rotation - displayRot);

          if (el.type === 'text') {
            const textEl = el as TextEl;
            let fontToUse = StandardFonts.Helvetica;
            const fam = textEl.fontFamily;
            const b = textEl.bold;
            const it = textEl.italic;

            if (fam === 'Times-Roman') {
              if (b && it) fontToUse = StandardFonts.TimesRomanBoldItalic;
              else if (b) fontToUse = StandardFonts.TimesRomanBold;
              else if (it) fontToUse = StandardFonts.TimesRomanItalic;
              else fontToUse = StandardFonts.TimesRoman;
            } else if (fam === 'Courier') {
              if (b && it) fontToUse = StandardFonts.CourierBoldOblique;
              else if (b) fontToUse = StandardFonts.CourierBold;
              else if (it) fontToUse = StandardFonts.CourierOblique;
              else fontToUse = StandardFonts.Courier;
            } else {
              if (b && it) fontToUse = StandardFonts.HelveticaBoldOblique;
              else if (b) fontToUse = StandardFonts.HelveticaBold;
              else if (it) fontToUse = StandardFonts.HelveticaOblique;
              else fontToUse = StandardFonts.Helvetica;
            }

            const font = await pdfLibDoc.embedFont(fontToUse);
            const textColor = parseColor(textEl.color || '#000000');
            const fontSize = Math.max(1, textEl.fontSize / 1.5);
            let drawX = pdfX;
            const align = textEl.textAlign || 'left';
            const content = String(textEl.content || '');

            if (align === 'center' || align === 'right') {
              const textWidth = font.widthOfTextAtSize(content, fontSize);
              if (align === 'center') drawX = pdfX + (elW_pdf - textWidth) / 2;
              else if (align === 'right') drawX = pdfX + elW_pdf - textWidth;
            }
            const textY = pdfY + elH_pdf - fontSize;

            pdfPage.drawText(content, {
              x: drawX, y: textY, size: fontSize, font: font,
              color: textColor.rgb, opacity: el.opacity * textColor.alpha,
              rotate: elRotDegrees,
            });
          } else if (el.type === 'shape') {
            const shape = el as ShapeEl;
            if (shape.shapeType === 'rectangle') {
              const fill = parseColor(shape.fill);
              const stroke = parseColor(shape.stroke);
              if (fill.alpha > 0) {
                pdfPage.drawRectangle({
                  x: pdfX, y: pdfY, width: elW_pdf, height: elH_pdf,
                  color: fill.rgb, opacity: el.opacity * fill.alpha, rotate: elRotDegrees,
                });
              }
              if (shape.strokeWidth > 0 && stroke.alpha > 0) {
                pdfPage.drawRectangle({
                  x: pdfX, y: pdfY, width: elW_pdf, height: elH_pdf,
                  borderColor: stroke.rgb, borderWidth: shape.strokeWidth,
                  opacity: el.opacity * stroke.alpha, rotate: elRotDegrees,
                });
              }
            } else if (shape.shapeType === 'circle') {
              const fill = parseColor(shape.fill);
              const stroke = parseColor(shape.stroke);
              if (fill.alpha > 0) {
                pdfPage.drawEllipse({
                  x: pdfX + elW_pdf / 2, y: pdfY + elH_pdf / 2, xScale: elW_pdf / 2, yScale: elH_pdf / 2,
                  color: fill.rgb, opacity: el.opacity * fill.alpha, rotate: elRotDegrees,
                });
              }
              if (shape.strokeWidth > 0 && stroke.alpha > 0) {
                pdfPage.drawEllipse({
                  x: pdfX + elW_pdf / 2, y: pdfY + elH_pdf / 2, xScale: elW_pdf / 2, yScale: elH_pdf / 2,
                  borderColor: stroke.rgb, borderWidth: shape.strokeWidth,
                  opacity: el.opacity * stroke.alpha, rotate: elRotDegrees,
                });
              }
            } else if (['triangle', 'arrow', 'star', 'line', 'diamond', 'hexagon', 'pentagon', 'octagon', 'heart', 'cloud', 'lightning', 'right_triangle', 'speech_bubble'].includes(shape.shapeType)) {
              const fill = parseColor(shape.fill);
              const stroke = parseColor(shape.stroke);
              const isLine = shape.shapeType === 'line';
              const isArrow = shape.shapeType === 'arrow';
              const sx = elW_pdf / 100;
              const sy = elH_pdf / 100;

              const toPath = (content: string, close = true) => {
                const scaled = content.replace(/([0-9.-]+),([0-9.-]+)/g, (_m, x, y) => {
                  return `${parseFloat(x) * sx},${(100 - parseFloat(y)) * sy}`;
                });
                return close && !scaled.includes('Z') ? scaled + ' Z' : scaled;
              };

              let path = '';
              if (shape.shapeType === 'triangle') path = toPath('M50,5 95,95 5,95');
              else if (shape.shapeType === 'star') path = toPath('M50,5 61,40 98,40 68,62 79,96 50,75 21,96 32,62 2,40 39,40');
              else if (shape.shapeType === 'diamond') path = toPath('M50,5 95,50 50,95 5,50');
              else if (shape.shapeType === 'hexagon') path = toPath('M50,5 93,25 93,75 50,95 7,75 7,25');
              else if (shape.shapeType === 'pentagon') path = toPath('M50,5 95,38 78,95 22,95 5,38');
              else if (shape.shapeType === 'octagon') path = toPath('M30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30');
              else if (shape.shapeType === 'heart') path = toPath('M50,30 C50,30 45,15 30,15 C15,15 5,30 5,45 C5,70 50,95 50,95 C50,95 95,70 95,45 C95,30 85,15 70,15 C55,15 50,30 50,30');
              else if (shape.shapeType === 'cloud') path = toPath('M25,40 C25,20 50,20 50,20 C50,20 75,20 75,40 C95,40 95,60 75,60 L25,60 C5,60 5,40 25,40');
              else if (shape.shapeType === 'lightning') path = toPath('M60,5 10,60 50,60 40,95 90,40 50,40');
              else if (shape.shapeType === 'right_triangle') path = toPath('M5,5 5,95 95,95');
              else if (shape.shapeType === 'speech_bubble') path = toPath('M10,10 L90,10 L90,70 L40,70 L10,95 L10,70');
              else if (shape.shapeType === 'check') path = toPath('M20,50 L45,75 L80,25', false);
              else if (shape.shapeType === 'cross') path = toPath('M25,25 L75,75 M75,25 L25,75', false);
              else if (isLine) path = toPath('M0,50 L100,50', false);
              else if (isArrow) path = toPath('M0,50 L90,50', false);

              if (path) {
                pdfPage.drawSvgPath(path, {
                  x: pdfX, y: pdfY,
                  color: (isLine || isArrow) ? undefined : fill.rgb,
                  borderColor: stroke.rgb, borderWidth: shape.strokeWidth,
                  opacity: el.opacity * (isLine || isArrow ? stroke.alpha : fill.alpha),
                  rotate: elRotDegrees
                });
              }
              if (isArrow) {
                const headPath = toPath('90,40 100,50 90,60', true);
                pdfPage.drawSvgPath(headPath, {
                  x: pdfX, y: pdfY, color: stroke.rgb, borderWidth: 0,
                  opacity: el.opacity * stroke.alpha, rotate: elRotDegrees
                });
              }
            }
          } else if (el.type === 'image' || el.type === 'signature') {
            const imgData = (el as any).src;
            if (imgData) {
              try {
                const convertToPng = async (src: string): Promise<ArrayBuffer> => {
                  return new Promise((resolve, reject) => {
                    const img = document.createElement('img');
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                      const canvas = document.createElement('canvas');
                      canvas.width = (img as any).naturalWidth || img.width;
                      canvas.height = (img as any).naturalHeight || img.height;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) { reject(new Error('No canvas context')); return; }
                      ctx.drawImage(img, 0, 0);
                      canvas.toBlob(blob => {
                        if (!blob) { reject(new Error('Blob creation failed')); return; }
                        blob.arrayBuffer().then(resolve).catch(reject);
                      }, 'image/png');
                    };
                    img.onerror = () => reject(new Error('Image load failed'));
                    img.src = src;
                  });
                };
                let embeddedImg;
                try {
                  const directBytes = await fetch(imgData).then(res => res.arrayBuffer());
                  try { embeddedImg = await pdfLibDoc.embedPng(directBytes); }
                  catch { embeddedImg = await pdfLibDoc.embedJpg(directBytes); }
                } catch {
                  try {
                    const pngBytes = await convertToPng(imgData);
                    embeddedImg = await pdfLibDoc.embedPng(pngBytes);
                  } catch (e) { console.warn('Canvas conversion failed:', e); }
                }

                if (embeddedImg) {
                  const imgW = embeddedImg.width;
                  const imgH = embeddedImg.height;
                  const imgRatio = imgW / imgH;
                  const boxRatio = elW_pdf / elH_pdf;
                  let drawW = elW_pdf, drawH = elH_pdf, dx = 0, dy = 0;
                  if (imgRatio > boxRatio) { drawH = elW_pdf / imgRatio; dy = (elH_pdf - drawH) / 2; }
                  else { drawW = elH_pdf * imgRatio; dx = (elW_pdf - drawW) / 2; }

                  pdfPage.drawImage(embeddedImg, {
                    x: pdfX + dx, y: pdfY + dy, width: drawW, height: drawH,
                    opacity: el.opacity, rotate: elRotDegrees,
                  });
                }
              } catch (e) { console.warn('Skipping invalid image:', e); }
            }
          } else if (el.type === 'drawing') {
            const d = el as DrawingEl;
            const color = parseColor(d.stroke);
            const commands = d.paths.split(' ');
            let lastPoint: any = null;
            for (const cmd of commands) {
              const coords = cmd.replace(/[ML]/, '').split(',');
              if (coords.length === 2) {
                const absX = parseFloat(coords[0]);
                const absY = parseFloat(coords[1]);
                if (!isNaN(absX) && !isNaN(absY)) {
                  const pt = getPdfCoords(absX, absY, 0, 0);
                  if (lastPoint) {
                    pdfPage.drawLine({
                      start: lastPoint, end: pt, thickness: d.strokeWidth / 1.5,
                      color: color.rgb, opacity: el.opacity * color.alpha, lineCap: LineCapStyle.Round,
                    });
                  }
                  lastPoint = pt;
                }
              }
            }
          } else if (el.type === 'highlight') {
            const h = el as HighlightEl;
            const color = parseColor(h.color);
            pdfPage.drawRectangle({
              x: pdfX, y: pdfY, width: elW_pdf, height: elH_pdf,
              color: color.rgb, opacity: el.opacity * color.alpha, rotate: elRotDegrees
            });
          } else if (el.type === 'redaction') {
            const redColor = parseColor((el as RedactionEl).color || '#000000');
            pdfPage.drawRectangle({
              x: pdfX, y: pdfY, width: elW_pdf, height: elH_pdf,
              color: redColor.rgb, opacity: 1, rotate: elRotDegrees
            });
          } else if (el.type === 'hyperlink') {
            const h = el as HyperlinkEl;
            const font = await pdfLibDoc.embedFont(StandardFonts.Helvetica);
            const fontSize = h.fontSize || 14;
            const linkColor = parseColor(h.color || '#2563eb');
            const displayText = h.content || h.url || 'Link';
            pdfPage.drawText(displayText, {
              x: pdfX + 2, y: pdfY + elH_pdf / 2 - fontSize / 3,
              size: fontSize, font, color: linkColor.rgb, opacity: el.opacity, rotate: elRotDegrees
            });
            pdfPage.drawLine({
              start: { x: pdfX + 2, y: pdfY + elH_pdf / 2 - fontSize / 2 },
              end: { x: pdfX + elW_pdf - 2, y: pdfY + elH_pdf / 2 - fontSize / 2 },
              thickness: 0.5, color: linkColor.rgb, opacity: el.opacity
            });
            try {
              const linkAnnotation = pdfLibDoc.context.obj({
                Type: 'Annot', Subtype: 'Link',
                Rect: [pdfX, pdfY, pdfX + elW_pdf, pdfY + elH_pdf],
                Border: [0, 0, 0],
                A: { Type: 'Action', S: 'URI', URI: h.url || h.content || '' }
              });
              const linkRef = pdfLibDoc.context.register(linkAnnotation);
              pdfPage.node.addAnnot(linkRef);
            } catch (e) { console.warn('Link annotation failed', e); }
          } else if (el.type === 'stickynote') {
            const sn = el as StickyNoteEl;
            const color = parseColor(sn.color);
            pdfPage.drawRectangle({
              x: pdfX, y: pdfY, width: elW_pdf, height: elH_pdf,
              color: color.rgb, opacity: el.opacity, rotate: elRotDegrees
            });
            const font = await pdfLibDoc.embedFont(StandardFonts.Helvetica);
            const fontSize = 8;
            const text = sn.content.substring(0, 100) + (sn.content.length > 100 ? '...' : '');
            pdfPage.drawText(text, {
              x: pdfX + 5, y: pdfY + elH_pdf - 12, size: fontSize, font,
              color: rgb(0.2, 0.2, 0.2), maxWidth: elW_pdf - 10, lineHeight: 10, rotate: elRotDegrees
            });
          } else if (el.type === 'table') {
            const tbl = el as TableEl;
            const bColor = parseColor(tbl.borderColor);
            const hBg = parseColor(tbl.headerBg);
            const cBg = parseColor(tbl.cellBg);
            const stdFont = await pdfLibDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfLibDoc.embedFont(StandardFonts.HelveticaBold);
            const cWidth = elW_pdf / tbl.cols;
            const cHeight = elH_pdf / tbl.rows;
            for (let r = 0; r < tbl.rows; r++) {
              for (let c = 0; c < tbl.cols; c++) {
                const cellX = pdfX + (c * cWidth);
                const cellY = pdfY + elH_pdf - ((r + 1) * cHeight);
                const currentBg = r === 0 ? hBg : cBg;
                if (currentBg.alpha > 0) {
                  pdfPage.drawRectangle({
                    x: cellX, y: cellY, width: cWidth, height: cHeight,
                    color: currentBg.rgb, opacity: el.opacity * currentBg.alpha
                  });
                }
                if (tbl.borderWidth > 0 && bColor.alpha > 0) {
                  pdfPage.drawRectangle({
                    x: cellX, y: cellY, width: cWidth, height: cHeight,
                    borderColor: bColor.rgb, borderWidth: tbl.borderWidth, opacity: el.opacity * bColor.alpha
                  });
                }
                const text = (tbl.cells[r] && tbl.cells[r][c]) || '';
                if (text) {
                  const font = r === 0 ? boldFont : stdFont;
                  const fSize = 10;
                  const tColor = parseColor(getContrastColor(r === 0 ? tbl.headerBg : tbl.cellBg));
                  pdfPage.drawText(text, {
                    x: cellX + 4, y: cellY + cHeight - fSize - 4, size: fSize, font,
                    color: tColor.rgb, rotate: elRotDegrees, opacity: el.opacity,
                    maxWidth: cWidth - 8, lineHeight: fSize * 1.2
                  });
                }
              }
            }
          } else if (el.type === 'watermark') {
            const wm = el as WatermarkEl;
            const color = parseColor(wm.color);
            const font = await pdfLibDoc.embedFont(StandardFonts.HelveticaBold);
            const fontSize = wm.fontSize / 1.5;
            const textWidth = font.widthOfTextAtSize(wm.content, fontSize);
            const textHeight = font.heightAtSize(fontSize);
            const centerX = pdfX + elW_pdf / 2;
            const centerY = pdfY + elH_pdf / 2;
            const rotRad = (el.rotation + displayRot) * (Math.PI / 180);
            const rcos = Math.cos(-rotRad), rsin = Math.sin(-rotRad);
            const rx = (-textWidth / 2) * rcos - (-textHeight / 4) * rsin;
            const ry = (-textWidth / 2) * rsin + (-textHeight / 4) * rcos;
            pdfPage.drawText(wm.content, {
              x: centerX + rx, y: centerY + ry, size: fontSize, font,
              color: color.rgb, opacity: el.opacity, rotate: elRotDegrees
            });
          } else if (el.type === 'formfield') {
            const f = el as FormFieldEl;
            const form = pdfLibDoc.getForm();
            const fieldName = `${f.fieldType}_${f.id.substring(0, 8)}`;
            const displayLabel = f.label || (f.fieldType.charAt(0).toUpperCase() + f.fieldType.slice(1).replace('_', ' '));
            try {
              if (f.fieldType === 'checkbox') {
                const cb = form.createCheckBox(fieldName);
                if (f.value === 'true' || f.value === 'checked') cb.check();
                cb.addToPage(pdfPage, { x: pdfX, y: pdfY, width: elW_pdf, height: elH_pdf, backgroundColor: rgb(1, 1, 1), borderColor: rgb(0.5, 0.5, 0.5), borderWidth: 1 });
                if (f.readOnly) cb.enableReadOnly();
                if (f.required) cb.enableRequired();
              } else if (f.fieldType === 'radio') {
                const rg = form.createRadioGroup(fieldName);
                rg.addOptionToPage('option', pdfPage, { x: pdfX, y: pdfY, width: elW_pdf, height: elH_pdf, backgroundColor: rgb(1, 1, 1), borderColor: rgb(0.5, 0.5, 0.5), borderWidth: 1 });
                if (f.value) rg.select('option');
                if (f.readOnly) rg.enableReadOnly();
                if (f.required) rg.enableRequired();
              } else if (f.fieldType === 'dropdown') {
                const dd = form.createDropdown(fieldName);
                const opts = f.options && f.options.length > 0 ? f.options : ['Option 1', 'Option 2'];
                dd.setOptions(opts);
                if (f.value && opts.includes(f.value)) dd.select(f.value);
                dd.addToPage(pdfPage, { x: pdfX, y: pdfY, width: elW_pdf, height: elH_pdf, backgroundColor: rgb(0.98, 0.98, 0.98), borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 1 });
                if (f.readOnly) dd.enableReadOnly();
                if (f.required) dd.enableRequired();
              } else {
                const tf = form.createTextField(fieldName);
                tf.setText(f.value || displayLabel);
                tf.addToPage(pdfPage, { x: pdfX, y: pdfY, width: elW_pdf, height: elH_pdf, backgroundColor: rgb(0.98, 0.98, 1), borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 1 });
                if (f.readOnly) tf.enableReadOnly();
                if (f.required) tf.enableRequired();
                if (f.fontSize) tf.setFontSize(f.fontSize / 1.5);
              }
            } catch (err) { console.warn('Form field failed', err); }
          }
        }
      }
      try {
        const form = pdfLibDoc.getForm();
        const helvetica = await pdfLibDoc.embedFont(StandardFonts.Helvetica);
        form.updateFieldAppearances(helvetica);
      } catch (e) { console.warn('Appearances failed', e); }

      return await pdfLibDoc.save();
    } catch (e) {
      console.error('[generateModifiedPdfBytes] Bake failed:', e);
      console.error('[generateModifiedPdfBytes] Error details:', {
        message: (e as Error).message,
        stack: (e as Error).stack,
        name: (e as Error).name
      });
      return null;
    }
  };

  const handleExport = async () => {
    const activePdf = pdf;
    if (!activePdf) return;
    try {
      setLoading(true);
      setProgress('Applying all elements and preparing export...');

      // Use the centralized baking logic
      let bytes = await generateModifiedPdfBytes();
      if (!bytes) {
        setLoading(false);
        return;
      }

      // If in visual grayscale mode, convert the final PDF to grayscale images before downloading
      if (isGrayscaleMode) {
        setProgress('Converting to grayscale...');
        try {
          const grayscaleDoc = await PDFDocument.create();
          const blob = new Blob([bytes as any], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const pdfDocForGrayscale = await pdfjsLib.getDocument(url).promise;

          for (let i = 1; i <= pdfDocForGrayscale.numPages; i++) {
            const pdfPage = await pdfDocForGrayscale.getPage(i);
            const scale = 2;
            const viewport = pdfPage.getViewport({ scale });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d')!;
            await pdfPage.render({ canvasContext: ctx, viewport, canvas } as any).promise;

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let j = 0; j < data.length; j += 4) {
              const avg = (data[j] * 0.299 + data[j + 1] * 0.587 + data[j + 2] * 0.114);
              data[j] = data[j + 1] = data[j + 2] = avg;
            }
            ctx.putImageData(imageData, 0, 0);

            const imgData = canvas.toDataURL('image/png');
            const pngBytes = await fetch(imgData).then(r => r.arrayBuffer());
            const pngImage = await grayscaleDoc.embedPng(pngBytes);
            const page = grayscaleDoc.addPage([viewport.width / scale, viewport.height / scale]);
            page.drawImage(pngImage, { x: 0, y: 0, width: viewport.width / scale, height: viewport.height / scale });
          }
          bytes = await grayscaleDoc.save();
        } catch (e) {
          console.error('Grayscale adjustment failed:', e);
          alert('Failed to apply grayscale. Saving regular version.');
        }
      }

      const cleanName = activePdf.name.replace(/\.pdf$/i, '').replace(/[^a-z0-9\-_ ]/gi, '_');
      const filename = isGrayscaleMode ? `${cleanName}_grayscale.pdf` : `${cleanName}_edited.pdf`;
      const file = new File([bytes as any], filename, { type: 'application/pdf' });

      if (onDownload) {
        onDownload(file, filename);
      } else {
        saveAs(file);
      }

      setLoading(false);
      setProgress('');
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      alert('Export failed: ' + msg);
      setLoading(false);
      setProgress('');
    }
  };




  // Crop PDF Pages - define visible area
  // IMPORTANT: We do NOT use translateContent because that would shift the PDF content
  // and cause user-added elements to appear in wrong positions relative to the content.
  // Instead, we only set CropBox/MediaBox to define what area is visible.
  // User elements stay at their ABSOLUTE positions - if cropped, they'll be clipped, not moved.
  const handleCrop = async (margins: { top: number; right: number; bottom: number; left: number }, singlePage?: number) => {
    const activePdf = pdf;
    if (!activePdf) return;
    setLoading(true);
    try {
      const pdfPages = activePdf.pdfLibDoc.getPages();

      for (let i = 0; i < pdfPages.length; i++) {
        // If singlePage is specified, only crop that page
        if (singlePage !== undefined && i !== singlePage - 1) continue;

        const pdfPage = pdfPages[i];
        const { width, height } = pdfPage.getSize();

        // Calculate crop box in PDF coordinates (origin is bottom-left)
        // CropBox defines the visible region: (x, y) is bottom-left corner, (width, height) is size
        const cropX = margins.left;
        const cropY = margins.bottom;
        const cropWidth = width - margins.left - margins.right;
        const cropHeight = height - margins.top - margins.bottom;

        // Validate crop dimensions
        if (cropWidth <= 0 || cropHeight <= 0) {
          throw new Error(`Crop margins too large for page ${i + 1} - resulting area would be zero or negative`);
        }

        // Set CropBox to define visible area (x, y is bottom-left corner of visible area)
        // This clips the view WITHOUT moving the content
        pdfPage.setCropBox(cropX, cropY, cropWidth, cropHeight);

        // Also set MediaBox to match for maximum viewer compatibility
        // MediaBox defines the page boundaries
        pdfPage.setMediaBox(cropX, cropY, cropWidth, cropHeight);
      }

      const bytes = await activePdf.pdfLibDoc.save();
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const newPdfDoc = await pdfjsLib.getDocument(url).promise;
      const newPdfLibDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

      // Rebuild pages array with new dimensions
      const newPages: PDFPageData[] = [];
      for (let i = 0; i < newPdfLibDoc.getPageCount(); i++) {
        const p = newPdfLibDoc.getPage(i);
        const { width: w, height: h } = p.getSize();
        newPages.push({ id: `page-${i + 1}-${Date.now()}`, pageNumber: i + 1, width: w, height: h, rotation: p.getRotation().angle });
      }

      // After cropping, we need to ADJUST PDFElement positions to maintain visual alignment
      // with the PDF content. When CropBox is set to (cropX, cropY, w, h), the PDF renderer
      // shows only that area. Our elements were positioned relative to the original page origin.
      // To keep elements visually in the same place relative to the content, we need to shift them.

      // Create adjusted elements - shift positions to compensate for crop offset
      const newElements: { [p: number]: PDFElement[] } = {};
      Object.keys(elements).forEach(pageKey => {
        const pageNum = Number(pageKey);
        const pageEls = elements[pageNum] || [];

        // Check if this page was cropped
        const wasCropped = singlePage === undefined || pageNum === singlePage;

        if (wasCropped && pageEls.length > 0) {
          // Calculate the offset in screen coordinates (elements use 1.5x scale)
          // margins are in PDF pts, so multiply by 1.5 to get screen coords
          const offsetX = margins.left * 1.5;
          const offsetY = margins.top * 1.5;  // Top margin shifts content up

          // Adjust each PDFElement's position
          newElements[pageNum] = pageEls
            .filter(el => el.type !== 'crop') // Remove crop elements
            .map(el => {
              const adjusted = {
                ...el,
                x: el.x - offsetX,
                y: el.y - offsetY
              };
              // Special handling for Freehand Drawings: shift absolute path points
              if (el.type === 'drawing') {
                const d = el as DrawingEl;
                (adjusted as DrawingEl).paths = d.paths.replace(/([0-9.-]+),([0-9.-]+)/g, (_m, xStr, yStr) => {
                  const nx = parseFloat(xStr) - offsetX;
                  const ny = parseFloat(yStr) - offsetY;
                  return `${nx},${ny}`;
                });
              }
              return adjusted;
            });
        } else {
          // Page was not cropped, just filter crop elements
          newElements[pageNum] = pageEls.filter(el => el.type !== 'crop');
        }
      });

      setElements(newElements);
      setPages(newPages);

      // CRITICAL: Pass the adjusted elements to preserve them in the PDF object
      safelyUpdatePdf({ pdfLibDoc: newPdfLibDoc, pdfDoc: newPdfDoc, pages: newPages, elements: newElements });

      setShowCropModal(false);
      setSelected(null);
      alert('Pages cropped successfully!');
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      alert('Crop failed: ' + msg);
    }
    setLoading(false);
  };

  // Convert PDF to Grayscale - Two modes:
  // 1. Visual mode (toggle): Apply CSS filter, preserves text editing, grayscale applied on export
  // 2. Permanent convert: Convert to image-based PDF (loses text)
  const handleGrayscale = async () => {
    const activePdf = pdf;
    if (!activePdf) return;
    // Show options
    const choice = window.confirm(
      'Grayscale Options:\n\n' +
      '• Click OK for Visual Grayscale (recommended)\n' +
      '  - Preserves text editing\n' +
      '  - Grayscale applied on export\n\n' +
      '• Click Cancel for Permanent Convert\n' +
      '  - Converts to image-based PDF\n' +
      '  - Text editing not available\n' +
      '  - Cannot be undone'
    );

    if (choice) {
      // Visual mode - just toggle the CSS filter
      setIsGrayscaleMode(!isGrayscaleMode);
      setShowGrayscaleModal(false);
      alert(isGrayscaleMode
        ? 'Grayscale mode disabled. PDF is back to color.'
        : 'Grayscale mode enabled! Text editing still works. Grayscale will be applied when you export.');
      return;
    }

    // Permanent convert - image-based (original code)
    if (!confirm('This will permanently convert the PDF to images. Text editing will not be available. Continue?')) return;

    setLoading(true);
    try {
      // Render each page as grayscale image and rebuild PDF
      const newPdfDoc = await PDFDocument.create();

      for (let i = 1; i <= activePdf.pdfDoc.numPages; i++) {
        const pdfPage = await activePdf.pdfDoc.getPage(i);
        const scale = 2; // High quality
        const viewport = pdfPage.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;

        await pdfPage.render({ canvasContext: ctx, viewport }).promise;

        // Convert to grayscale using luminosity formula
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let j = 0; j < data.length; j += 4) {
          const avg = (data[j] * 0.299 + data[j + 1] * 0.587 + data[j + 2] * 0.114);
          data[j] = data[j + 1] = data[j + 2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);

        // Add to new PDF
        const imgData = canvas.toDataURL('image/png');
        const pngBytes = await fetch(imgData).then(r => r.arrayBuffer());
        const pngImage = await newPdfDoc.embedPng(pngBytes);
        const page = newPdfDoc.addPage([viewport.width / scale, viewport.height / scale]);
        page.drawImage(pngImage, { x: 0, y: 0, width: viewport.width / scale, height: viewport.height / scale });
      }

      // Save and reload into editor for live preview
      const bytes = await newPdfDoc.save();
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Load the grayscale PDF back into the editor
      const grayscalePdfDoc = await pdfjsLib.getDocument(url).promise;
      const grayscalePdfLibDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

      // Rebuild pages array
      const newPages: PDFPageData[] = [];
      for (let i = 0; i < grayscalePdfLibDoc.getPageCount(); i++) {
        const p = grayscalePdfLibDoc.getPage(i);
        const { width: w, height: h } = p.getSize();
        newPages.push({ id: `page-${i + 1}-${Date.now()}`, pageNumber: i + 1, width: w, height: h, rotation: p.getRotation().angle });
      }

      setPages(newPages);
      setIsGrayscaleMode(false); // Disable visual mode since PDF is now permanently grayscale

      // Update the PDF in the editor
      safelyUpdatePdf({
        pdfLibDoc: grayscalePdfLibDoc,
        pdfDoc: grayscalePdfDoc,
        pages: newPages,
        elements,
        extractedText: {} // Clear - now image-based
      });

      // Force re-render of pages
      setTimeout(renderPages, 100);

      setShowGrayscaleModal(false);
      alert('PDF permanently converted to grayscale images. Text editing is no longer available.');
    } catch (e) { console.error(e); alert('Grayscale conversion failed: ' + (e as Error).message); }
    setLoading(false);
  };

  // Extract all text from PDF
  const handleExtractText = (mode: 'clipboard' | 'file') => {
    const activePdf = pdf;
    if (!activePdf) return;
    setLoading(true);
    try {
      let allText = '';

      for (let i = 1; i <= activePdf.pdfDoc.numPages; i++) {
        const pdfPage = activePdf.pdfDoc.getPage(i);
        pdfPage.then((p: any) => p.getTextContent()).then((textContent: any) => {
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          allText += `--- Page ${i} ---\n${pageText}\n\n`;
        });
      }

      // Wait for all promises to resolve
      Promise.all(Array.from({ length: activePdf.pdfDoc.numPages }, (_, i) => activePdf.pdfDoc.getPage(i + 1).then((p: any) => p.getTextContent()))).then(results => {
        allText = '';
        results.forEach((textContent, i) => {
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          allText += `--- Page ${i + 1} ---\n${pageText}\n\n`;
        });

        if (mode === 'clipboard') {
          navigator.clipboard.writeText(allText);
          alert('Text copied to clipboard!');
        } else {
          const blob = new Blob([allText], { type: 'text/plain' });
          const filename = activePdf.name.replace('.pdf', '_text.txt');
          if (onDownload) {
            onDownload(blob, filename);
          } else {
            saveAs(blob, filename);
          }
          alert('Text file ready!');
        }
        setShowExtractTextModal(false);
        setLoading(false);
      }).catch(e => {
        console.error(e);
        alert('Text extraction failed');
        setLoading(false);
      });

    } catch (e) { console.error(e); alert('Text extraction failed'); setLoading(false); }
  };

  // Repair PDF - Re-save to fix corruption

  // Add Sticky Note
  const addStickyNote = (content: string, color: string) => {
    const el: StickyNoteEl = {
      id: genId(),
      type: 'stickynote',
      x: 50,
      y: 50,
      width: 150,
      height: 100,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 1,
      content,
      color
    };
    addElement(el);
    setShowStickyNoteModal(false);
  };

  // Add Crop PDFElement - Visual crop box on page
  const addCropElement = () => {
    const cp = pages[page - 1];
    // Default crop box covers most of the page with small margins
    const margin = 20 * 1.5; // 20pt margins scaled
    const el: CropEl = {
      id: genId(),
      type: 'crop',
      x: margin,
      y: margin,
      width: cp.width * 1.5 - margin * 2,
      height: cp.height * 1.5 - margin * 2,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 50 // On top within canvas
    };
    addElement(el);
    setSelected(el);
    setShowCropModal(false);
  };


  // Extract Images from PDF - Download all embedded images

  // OCR - Text Recognition using Tesseract.js
  const handleRemoveMetadata = async () => {
    const activePdf = pdf;
    if (!activePdf) return;
    if (!confirm('This will permanently remove all metadata (title, author, subject, keywords, dates) from this PDF. Continue?')) return;
    try {
      setLoading(true);
      const doc = activePdf.pdfLibDoc;
      doc.setTitle('');
      doc.setAuthor('');
      doc.setSubject('');
      doc.setKeywords([]);
      doc.setProducer('');
      doc.setCreator('');

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const file = new File([blob], activePdf.name, { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const newPdfDoc = await pdfjsLib.getDocument(url).promise;
      safelyUpdatePdf({ file, pdfDoc: newPdfDoc, elements });
      alert('? All metadata has been removed!');
    } catch (e) {
      console.error(e);
      alert('Failed to remove metadata');
    }
    setLoading(false);
  };

  const handleExtractImages = async () => {
    const activePdf = pdf;
    if (!activePdf) return;
    try {
      setLoading(true);
      const zip = new JSZip();
      let imageCount = 0;

      for (let i = 1; i <= activePdf.pdfDoc.numPages; i++) {
        const page = await activePdf.pdfDoc.getPage(i);
        const ops = await page.getOperatorList();

        for (let j = 0; j < ops.fnArray.length; j++) {
          if (ops.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
            try {
              const imgName = ops.argsArray[j][0];
              const img = await page.objs.get(imgName);
              if (img && img.data) {
                imageCount++;
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d')!;
                const data = new Uint8ClampedArray(img.width * img.height * 4);
                // Simple RGB to RGBA expansion
                for (let k = 0, l = 0; k < img.data.length; k += 3, l += 4) {
                  data[l] = img.data[k];
                  data[l + 1] = img.data[k + 1];
                  data[l + 2] = img.data[k + 2];
                  data[l + 3] = 255;
                }
                ctx.putImageData(new ImageData(data, img.width, img.height), 0, 0);
                const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'));
                zip.file(`image_${imageCount}.png`, blob);
              }
            } catch (err) { console.warn('Image extraction error', err); }
          }
        }
      }

      if (imageCount === 0) {
        alert('No embedded images found in this PDF.');
      } else {
        const content = await zip.generateAsync({ type: 'blob' });
        const filename = `${activePdf.name.replace('.pdf', '')}_images.zip`;
        if (onDownload) onDownload(content, filename);
        else saveAs(content, filename);
        alert(`Successfully extracted ${imageCount} images!`);
      }
    } catch (e) {
      console.error(e);
      alert('Extraction failed');
    }
    setLoading(false);
  };

  const handleRepair = async () => {
    if (!pdf) return;
    try {
      setLoading(true);
      setProgress('Repairing PDF structure...');
      const bytes = await pdf.pdfLibDoc.save();
      const newDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const repairedBytes = await newDoc.save();
      const file = new File([new Blob([repairedBytes as any])], pdf.name, { type: 'application/pdf' });
      const url = URL.createObjectURL(new Blob([repairedBytes as any]));
      const newPdfDoc = await pdfjsLib.getDocument(url).promise;
      safelyUpdatePdf({ file, pdfDoc: newPdfDoc, pdfLibDoc: newDoc });
      alert('PDF structure refreshed/repaired!');
    } catch (e) { console.error(e); alert('Repair failed'); }
    setLoading(false);
  };

  const handleFlatten = async () => {
    if (!pdf) return;
    try {
      setLoading(true);
      setProgress('Flattening... This merges all edits permanently.');
      const bytes = await pdf.pdfLibDoc.save();
      const file = new File([new Blob([bytes as any])], pdf.name, { type: 'application/pdf' });
      const url = URL.createObjectURL(new Blob([bytes as any]));
      const newPdfDoc = await pdfjsLib.getDocument(url).promise;
      const newLibDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      // Effectively flattens because it commits the current pdfLibDoc state
      safelyUpdatePdf({ file, pdfDoc: newPdfDoc, pdfLibDoc: newLibDoc });
      alert('Edits committed to document structure.');
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleOCR = async (lang: string = 'eng') => {
    const activePdf = pdf;
    if (!activePdf) return;
    try {
      setLoading(true);
      setProgress('Initializing OCR engine...');
      const Tesseract = await import('tesseract.js');
      const worker = await Tesseract.createWorker(lang);

      const helvetica = await activePdf.pdfLibDoc.embedFont(StandardFonts.Helvetica);

      for (let i = 1; i <= activePdf.pdfDoc.numPages; i++) {
        setProgress(`Performing OCR on page ${i} of ${activePdf.pdfDoc.numPages}...`);
        const page = await activePdf.pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const result = await worker.recognize(canvas);
        const words = (result as any).data?.words || [];
        const pdfPage = activePdf.pdfLibDoc.getPages()[i - 1];

        // Use viewport dimensions instead of getSize() to avoid MediaBox errors
        const { width: pW, height: pH } = viewport;

        // Add hidden text layer
        for (const w of words) {
          const x = (w.bbox.x0 / canvas.width) * pW;
          const y = pH - ((w.bbox.y0 + (w.bbox.y1 - w.bbox.y0)) / canvas.height) * pH;
          const wHeight = ((w.bbox.y1 - w.bbox.y0) / canvas.height) * pH;

          pdfPage.drawText(w.text, {
            x,
            y,
            size: Math.max(1, wHeight * 0.8),
            font: helvetica,
            color: rgb(0, 0, 0),
            opacity: 0, // Hidden layer
          });
        }
      }

      await worker.terminate();

      const bytes = await activePdf.pdfLibDoc.save();
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const newPdfDoc = await pdfjsLib.getDocument(url).promise;
      const newPdfLibDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

      safelyUpdatePdf({ pdfLibDoc: newPdfLibDoc, pdfDoc: newPdfDoc });
      setShowOCRModal(false);
      alert('? OCR Complete! The document is now fully searchable and selectable.');
    } catch (e) {
      console.error(e);
      alert('OCR failed. Please try again.');
    }
    setLoading(false);
    setProgress('');
  };

  // Add Background - Add solid color or image background
  const handleAddBackground = async (color: string, applyToAll: boolean) => {
    const activePdf = pdf;
    if (!activePdf) return;
    setPageBackgrounds(prev => {
      const next = { ...prev };
      if (applyToAll) {
        for (let i = 1; i <= activePdf.pageCount; i++) next[i] = color;
      } else {
        next[page] = color;
      }
      return next;
    });
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  };

  // Change Page Size
  const handleChangePageSize = async (newWidth: number, newHeight: number, applyToAll: boolean) => {
    const activePdf = pdf;
    if (!activePdf) return;
    try {
      setLoading(true);
      const doc = activePdf.pdfLibDoc;
      const pagesToApply = applyToAll ? doc.getPages() : [doc.getPage(page - 1)];

      for (const pdfPage of pagesToApply) {
        pdfPage.setSize(newWidth, newHeight);
      }

      // Update local pages state
      const newPages = [...pages];
      if (applyToAll) {
        newPages.forEach((p, i) => {
          newPages[i] = { ...p, width: newWidth, height: newHeight };
        });
      } else {
        newPages[page - 1] = { ...newPages[page - 1], width: newWidth, height: newHeight };
      }
      setPages(newPages);

      // Re-save and reload
      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const file = new File([blob], activePdf.name, { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const newPdfDoc = await pdfjsLib.getDocument(url).promise;
      safelyUpdatePdf({ file, pdfDoc: newPdfDoc, pdfLibDoc: await PDFDocument.load(pdfBytes, { ignoreEncryption: true }), pages: newPages, elements });

      // Re-render thumbnails
      setPageImages({});

      alert(`? Page size changed to ${newWidth}×${newHeight} pt!`);
    } catch (e) {
      console.error(e);
      alert('Failed to change page size');
    }
    setLoading(false);
  };

  // Adjust Margins
  const handleAdjustMargins = async (marginPts: { top: number; right: number; bottom: number; left: number }, applyToAll: boolean) => {
    const activePdf = pdf;
    if (!activePdf) return;
    try {
      setLoading(true);
      const doc = activePdf.pdfLibDoc;
      const pageIndices = applyToAll ? doc.getPageIndices() : [page - 1];

      for (const idx of pageIndices) {
        const pdfPage = doc.getPage(idx);
        const { width, height } = pdfPage.getSize();

        // Increase page size to add margins
        const newWidth = width + marginPts.left + marginPts.right;
        const newHeight = height + marginPts.top + marginPts.bottom;

        pdfPage.setSize(newWidth, newHeight);

        // Translate content to account for margins
        pdfPage.translateContent(marginPts.left, marginPts.bottom);
      }

      // Update pages state
      const newPages = pages.map((p, i) => {
        if (applyToAll || i === page - 1) {
          const oldWidth = p.width;
          const oldHeight = p.height;
          return {
            ...p,
            width: oldWidth + marginPts.left + marginPts.right,
            height: oldHeight + marginPts.top + marginPts.bottom
          };
        }
        return p;
      });
      setPages(newPages);

      // Re-save
      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const file = new File([blob], activePdf.name, { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const newPdfDoc = await pdfjsLib.getDocument(url).promise;
      safelyUpdatePdf({ file, pdfDoc: newPdfDoc, pdfLibDoc: await PDFDocument.load(pdfBytes, { ignoreEncryption: true }), pages: newPages, elements });

      setPageImages({});
      alert('? Margins adjusted!');
    } catch (e) {
      console.error(e);
      alert('Failed to adjust margins');
    }
    setLoading(false);
  };

  // Text Search in PDF with Visual Highlights
  const handleTextSearch = async (query: string) => {
    const activePdf = pdf;
    if (!activePdf || !query.trim()) {
      clearSearch();
      return;
    }

    try {
      setLoading(true);
      setSearchQuery(query);
      const allHighlights: { page: number; rects: { x: number; y: number; w: number; h: number }[] }[] = [];
      const scale = 1.5; // Match the rendering scale

      for (let i = 1; i <= activePdf.pdfDoc.numPages; i++) {
        const pdfPage = await activePdf.pdfDoc.getPage(i);
        const textContent = await pdfPage.getTextContent();
        const viewport = pdfPage.getViewport({ scale: 1 });

        const pageRects: { x: number; y: number; w: number; h: number }[] = [];
        const lowerQuery = query.toLowerCase();

        for (const item of textContent.items as any[]) {
          if (!item.str) continue;

          const text = item.str.toLowerCase();
          let startIndex = 0;
          let foundIndex = text.indexOf(lowerQuery, startIndex);

          while (foundIndex !== -1) {
            // Calculate approximate position within the text item
            const charWidth = item.width / item.str.length;
            const xOffset = foundIndex * charWidth;
            const matchWidth = query.length * charWidth;

            // Transform coordinates from PDF space to screen space
            const tx = item.transform;
            const x = tx[4] + xOffset;
            const y = viewport.height - tx[5] - item.height;

            pageRects.push({
              x: x * scale,
              y: y * scale,
              w: matchWidth * scale,
              h: (item.height || 12) * scale
            });

            startIndex = foundIndex + 1;
            foundIndex = text.indexOf(lowerQuery, startIndex);
          }
        }

        if (pageRects.length > 0) {
          allHighlights.push({ page: i, rects: pageRects });
        }
      }

      setSearchHighlights(allHighlights);
      setCurrentMatchIndex(0);
      setShowSearchBar(true);

      if (allHighlights.length === 0) {
        alert(`No results found for "${query}"`);
      } else {
        // Navigate to first result
        setPage(allHighlights[0].page);
      }
    } catch (e) {
      console.error(e);
      alert('Search failed');
    }
    setLoading(false);
  };

  // Handle Automatic Redaction of specific words across all pages
  const handleAutoRedact = async (query: string) => {
    if (!pdf || !query.trim()) return;
    setLoading(true);
    try {
      const words = query.split(',').map(w => w.trim()).filter(w => w.length > 0);
      const newElements = { ...elements };
      let totalRedactCount = 0;

      for (let i = 1; i <= pdf.pageCount; i++) {
        const pdfPage = await pdf.pdfDoc.getPage(i);
        const textContent = await pdfPage.getTextContent();
        const viewport = pdfPage.getViewport({ scale: 1 });
        const scale = 1.5; // Internal rendering scale

        if (!newElements[i]) newElements[i] = [];

        // Create an offscreen canvas for text measurement (approximate but better than char counting)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.font = '100px sans-serif'; // Use large font for better precision

        for (const item of textContent.items as any[]) {
          if (!item.str) continue;
          const text = item.str;

          // Attempt to determine if it's a serif font from styles which improves measurement accuracy
          // Note: We are approximating based on item.fontName which links to styles
          const isSerif = (textContent.styles?.[item.fontName]?.fontFamily || '').toLowerCase().includes('serif');
          if (ctx) ctx.font = isSerif ? '100px serif' : '100px sans-serif';

          for (const word of words) {
            const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');

            let match;
            while ((match = regex.exec(text)) !== null) {
              const foundIndex = match.index;
              const matchText = match[0];
              const preText = text.substring(0, foundIndex);

              // Calculate ratios using canvas measurement
              // This handles variable width fonts (e.g. 'i' vs 'W') correctly
              let xRatio = 0;
              let widthRatio = 0;

              if (ctx) {
                const totalW = ctx.measureText(text).width;
                const preW = ctx.measureText(preText).width;
                const matchW = ctx.measureText(matchText).width;
                // Avoid division by zero
                if (totalW > 0) {
                  xRatio = preW / totalW;
                  widthRatio = matchW / totalW;
                }
              } else {
                // Fallback to simpler character count if no context (unlikely)
                xRatio = foundIndex / text.length;
                widthRatio = matchText.length / text.length;
              }

              const tx = item.transform;
              // PDF coordinates: tx[4] is x, tx[5] is y
              const itemX = tx[4];
              const itemY = tx[5];
              const itemWidth = item.width;
              const itemHeight = item.height || 12;

              const matchX = itemX + (itemWidth * xRatio);
              const matchW = itemWidth * widthRatio;

              // Add padding to ensure full coverage (2px visual padding)
              const paddingH = 2; // Horizontal padding
              const paddingV = 1.5; // Vertical padding

              newElements[i].push({
                id: genId(),
                type: 'redaction',
                x: (matchX - paddingH) * scale,
                y: (viewport.height - itemY - itemHeight - paddingV) * scale,
                width: (matchW + (paddingH * 2)) * scale,
                height: (itemHeight + (paddingV * 2)) * scale,
                rotation: 0,
                opacity: 1,
                locked: false,
                visible: true,
                zIndex: 50,
                color: '#000000'
              });

              totalRedactCount++;
            }
          }
        }
      }

      setElements(newElements);
      safelyUpdatePdf({ elements: newElements });
      alert(`Search complete! Found and redacted ${totalRedactCount} matches.`);
    } catch (e) {
      console.error(e);
      alert('Bulk redact failed. Please ensure the PDF has searchable text.');
    }
    setLoading(false);
  };

  // Clear search highlights
  const clearSearch = () => {
    setSearchHighlights([]);
    setSearchQuery('');
    setCurrentMatchIndex(0);
    setShowSearchBar(false);
  };

  // Navigate to next/previous match
  const goToNextMatch = () => {
    if (searchHighlights.length === 0) return;

    // Count total matches
    let totalMatches = 0;
    const matchPages: { page: number; localIndex: number }[] = [];

    for (const h of searchHighlights) {
      for (let i = 0; i < h.rects.length; i++) {
        matchPages.push({ page: h.page, localIndex: i });
        totalMatches++;
      }
    }

    const nextIndex = (currentMatchIndex + 1) % totalMatches;
    setCurrentMatchIndex(nextIndex);
    setPage(matchPages[nextIndex].page);
  };

  const goToPrevMatch = () => {
    if (searchHighlights.length === 0) return;

    let totalMatches = 0;
    const matchPages: { page: number; localIndex: number }[] = [];

    for (const h of searchHighlights) {
      for (let i = 0; i < h.rects.length; i++) {
        matchPages.push({ page: h.page, localIndex: i });
        totalMatches++;
      }
    }

    const prevIndex = (currentMatchIndex - 1 + totalMatches) % totalMatches;
    setCurrentMatchIndex(prevIndex);
    setPage(matchPages[prevIndex].page);
  };

  // Get total match count
  const getTotalMatches = () => {
    return searchHighlights.reduce((sum, h) => sum + h.rects.length, 0);
  };

  const cp = pages[page - 1] || { width: 595, height: 842, rotation: 0 };
  const els = elements[page] || [];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#09090b]">
      {/* Tab Bar */}
      {/* Tab Bar */}
      <div className="flex items-center gap-1.5 px-2 lg:px-4 py-1.5 lg:pt-3 lg:pb-2 bg-[#09090b] border-b border-white/5 overflow-x-auto overflow-y-hidden scrollbar-hide shrink-0 min-h-[40px] lg:min-h-[auto]">
        {tabs?.map(tab => (
          <div
            key={tab.id}
            onClick={() => onSwitchTab?.(tab.id)}
            className={`group relative flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap border border-transparent
              ${activeTabId === tab.id
                ? 'bg-primary-500/15 text-primary-400 border-primary-500/30 shadow-[0_4px_20px_rgba(139,92,246,0.1)]'
                : 'text-surface-500 hover:text-surface-300 hover:bg-white/5'}
            `}
          >
            <FileText className={`w-4 h-4 transition-colors ${activeTabId === tab.id ? 'text-primary-400' : 'text-surface-600 group-hover:text-surface-400'}`} />
            <span className="max-w-[150px] truncate">{tab.title}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onCloseTab?.(tab.id); }}
              className="p-1 rounded-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-primary-500/20 text-surface-500 hover:text-primary-400 transition-all ml-1 -mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {activeTabId === tab.id && (
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
            )}
          </div>
        ))}
        <button
          onClick={onNewTab}
          className="flex items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/10 text-surface-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all ml-2"
          title="Open new document in new tab"
        >
          <Plus className="w-4.5 h-4.5" />
        </button>
      </div>

      {pdf ? (
        <>
          <div className="relative w-full bg-surface-950 border-b border-white/5 z-20 group/primary-toolbar shrink-0 min-h-[44px] lg:min-h-[auto]">
            {canScrollPrimaryLeft && (
              <button
                onClick={() => scrollPrimaryToolbar('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-neutral-900/90 hover:bg-primary-600 text-white rounded-r-xl p-2 shadow-xl border-y border-r border-white/20 pointer-events-auto transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div ref={primaryToolbarRef} onScroll={checkPrimaryToolbarScroll} className="flex items-center gap-1.5 lg:gap-3 px-2 lg:px-4 py-1 lg:py-2 flex-nowrap overflow-x-auto scrollbar-hide scroll-smooth w-full">
              <button onClick={onBack} className="p-1.5 lg:p-2 rounded-xl hover:bg-white/5 text-surface-400 hover:text-white transition-all shrink-0">
                <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
              <SmartTooltip text={showPages ? "Hide Sidebar" : "Show Sidebar"} description="Toggle the page thumbnail sidebar.">
                <button onClick={() => setShowPages(!showPages)} className={`group p-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem] ${showPages ? 'bg-primary-500/20' : 'hover:bg-white/5'}`}>
                  <PanelLeft className={`w-5 h-5 lg:w-6 lg:h-6 ${showPages ? 'text-primary-400' : 'text-surface-400 group-hover:text-white'}`} />
                  <span className={`text-[8px] font-medium leading-none whitespace-nowrap ${showPages ? 'text-primary-400/80' : 'text-surface-400/80 group-hover:text-white'}`}>
                    Pages
                  </span>
                </button>
              </SmartTooltip>

              <div className="flex-1 min-w-[10px]" />

              <div className="flex items-center gap-1.5 shrink-0 overflow-visible">
                <div className="flex items-center gap-0.5 lg:gap-2 mr-1 lg:mr-2 pr-1 lg:pr-2 border-r border-white/5 shrink-0">
                  <SmartTooltip text="Rotate" description="Rotate all pages in the document clockwise.">
                    <button onClick={() => setShowRotateAllModal(true)} className="group p-1 rounded-xl hover:bg-white/5 text-cyan-400 transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <RotateCw className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-cyan-400/80 group-hover:text-cyan-400">Rotate</span>
                    </button>
                  </SmartTooltip>

                  <SmartTooltip text="Reorder" description="Drag and drop pages to change their order.">
                    <button onClick={() => setShowReorderModal(true)} className="group p-1 rounded-xl hover:bg-white/5 text-cyan-400 transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <ArrowUpDown className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-cyan-400/80 group-hover:text-cyan-400">Reorder</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Props" description="View and edit PDF document metadata and properties.">
                    <button onClick={() => setShowMetadataModal(true)} className="group p-1 rounded-xl hover:bg-white/5 text-blue-400 transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <FileText className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-blue-400/80 group-hover:text-blue-400">Props</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Clean" description="Permanently remove all metadata and hidden information.">
                    <button onClick={handleRemoveMetadata} className="group p-1 rounded-xl hover:bg-white/5 text-red-500 transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <XCircle className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-red-500/80 group-hover:text-red-500">Clean</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Images" description="Extract all embedded images from the PDF into a ZIP folder.">
                    <button onClick={handleExtractImages} className="group p-1 rounded-xl hover:bg-white/5 text-orange-400 transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <DownloadCloud className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-orange-400/80 group-hover:text-orange-400">Images</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Pages" description="Save each page as an individual image file.">
                    <button onClick={() => setShowExportImagesModal(true)} className="group p-1 rounded-xl hover:bg-white/5 text-purple-400 transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <ImageDown className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-purple-400/80 group-hover:text-purple-400">Pages</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Image" description="Convert current view to a high-quality single image.">
                    <button onClick={handleExportSingleImage} className="group p-1 rounded-xl hover:bg-white/5 text-teal-400 transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <FileOutput className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-teal-400/80 group-hover:text-teal-400">Image</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Repair" description="Fix internal structure issues and optimize the PDF.">
                    <button onClick={handleRepair} className="group p-1 rounded-xl hover:bg-white/5 text-green-400 transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <Wrench className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-green-400/80 group-hover:text-green-400">Repair</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Flatten" description="Merge all annotations and edits permanently into the document.">
                    <button onClick={handleFlatten} className="group p-1 rounded-xl hover:bg-white/5 text-yellow-500 transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <Layers className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-yellow-500/80 group-hover:text-yellow-500">Flatten</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Compress" description="Reduce file size while maintaining visual quality.">
                    <button onClick={() => setShowCompressModal(true)} className="group p-1 rounded-xl hover:bg-white/5 text-emerald-400 transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <Minimize className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-emerald-400/80 group-hover:text-emerald-400">Compress</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Crop" description="Trim page boundaries to focus on specific content.">
                    <button onClick={() => setShowCropModal(true)} className="group p-1 rounded-xl hover:bg-white/5 text-cyan-400 transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <Crop className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-cyan-400/80 group-hover:text-cyan-400">Crop</span>
                    </button>
                  </SmartTooltip>
                </div>

                <div className="flex items-center gap-0.5 lg:gap-2 mr-1 lg:mr-2 pr-1 lg:pr-2 border-r border-white/5">
                  <SmartTooltip text="Edit Text" description="Directly modify text content within the document.">
                    <button onClick={() => setShowEditableWordEditor(true)} className="group p-1 rounded-xl hover:bg-white/5 transition-all text-purple-400 flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <img src="/edit_icon.png" alt="PDF Editor" className="w-5 h-5 lg:w-6 lg:h-6 rounded shadow-md object-contain" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-purple-400/80 group-hover:text-purple-400">Edit Text</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Word" description="Convert this PDF to an editable Microsoft Word document.">
                    <button onClick={() => handleOpenOfficeExport('word')} className="group p-1 rounded-xl hover:bg-white/5 transition-all text-white flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <WordLogo className="w-5 h-5 lg:w-7 lg:h-7" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-white/50 group-hover:text-white">Word</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Excel" description="Extract tables and data into a clean Excel spreadsheet.">
                    <button onClick={() => handleOpenOfficeExport('excel')} className="group p-1 rounded-xl hover:bg-white/5 transition-all text-white flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <ExcelLogo className="w-5 h-5 lg:w-7 lg:h-7" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-white/50 group-hover:text-white">Excel</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="PPT" description="Transform your PDF into a presentation deck.">
                    <button onClick={() => handleOpenOfficeExport('powerpoint')} className="group p-1 rounded-xl hover:bg-white/5 transition-all text-white flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <PowerPointLogo className="w-5 h-5 lg:w-7 lg:h-7" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-white/50 group-hover:text-white">PPT</span>
                    </button>
                  </SmartTooltip>
                </div>

                <div className="flex items-center gap-0.5 lg:gap-2 mr-1 lg:mr-2 pr-1 lg:pr-2 border-r border-white/5">
                  <SmartTooltip text="Protect" description="Set a password to restrict viewing or editing.">
                    <button onClick={() => setShowProtectModal(true)} className="group p-1 rounded-xl hover:bg-white/5 transition-all text-yellow-500 flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <Lock className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-yellow-500/80 group-hover:text-yellow-500">Protect</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Split" description="Cut the PDF into multiple files by page range.">
                    <button onClick={() => setShowSplitModal(true)} className="group p-1 rounded-xl hover:bg-white/5 transition-all text-red-500 flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <Scissors className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-red-500/80 group-hover:text-red-500">Split</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="OCR" description="Make scanned text selectable and searchable.">
                    <button onClick={() => setShowOCRModal(true)} className="group p-1 rounded-xl hover:bg-white/5 transition-all text-cyan-400 flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <ScanText className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-cyan-400/80 group-hover:text-cyan-400">OCR</span>
                    </button>
                  </SmartTooltip>
                </div>

                <div className="flex items-center gap-0.5 lg:gap-2 mr-1 lg:mr-2">
                  <SmartTooltip text="Insert" description="Insert another PDF file after the current page.">
                    <button onClick={() => setShowInsertModal(true)} className="group p-1 rounded-xl hover:bg-white/5 text-indigo-400 transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <img src="/insert_icon.png" alt="Insert PDF" className="w-5 h-5 lg:w-6 lg:h-6 object-contain drop-shadow" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-indigo-400/80 group-hover:text-indigo-400">Insert</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Bates" description="Apply unique identification numbers to pages.">
                    <button onClick={() => setShowBatesModal(true)} className="group p-1 rounded-xl hover:bg-white/5 text-emerald-400 transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <Hash className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-emerald-400/80 group-hover:text-emerald-400">Bates</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Compare" description="Side-by-side comparison of two versions.">
                    <button onClick={() => setShowCompareModal(true)} className="group p-1 rounded-xl hover:bg-white/5 text-orange-400 transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <FileSearch className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-orange-400/80 group-hover:text-orange-400">Compare</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Theme" description="Change the application background and visual theme.">
                    <button onClick={() => setShowBackgroundModal(true)} className="group p-1 rounded-xl hover:bg-white/5 text-pink-400 transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <Palette className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-pink-400/80 group-hover:text-pink-400">Theme</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Margins" description="Adjust page margins and overall canvas size.">
                    <button onClick={() => setShowMarginsModal(true)} className="group p-1 rounded-xl hover:bg-white/5 text-amber-400 transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <Move className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-amber-400/80 group-hover:text-amber-400">Margins</span>
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Find" description="Search for text within the document.">
                    <button onClick={() => {
                      const searchBar = document.getElementById('search-input');
                      if (searchBar) {
                        searchBar.focus();
                        searchBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      } else {
                        alert('Search feature: Press Ctrl/Cmd+F or click the Search icon in the toolbar');
                      }
                    }} className="group p-1 rounded-xl hover:bg-white/5 text-white transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem]">
                      <Search className="w-5 h-5 lg:w-6 lg:h-6" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-white/50 group-hover:text-white">Find</span>
                    </button>
                  </SmartTooltip>


                  {/* NEW: More Tools Dropdown with 17 Missing Features */}
                  <div className="relative">
                    <button
                      id="more-tools-dropdown-btn"
                      onClick={(e) => { e.stopPropagation(); setShowMoreToolsDropdown(!showMoreToolsDropdown); }}
                      className={`group p-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 min-w-[3rem] ${showMoreToolsDropdown ? 'bg-purple-500/20 ring-2 ring-purple-500' : 'hover:bg-white/5'}`}
                      title="More Tools - Templates, Stamps, Compare, History, etc."
                    >
                      <LayoutGrid className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
                      <span className="text-[8px] font-medium leading-none whitespace-nowrap text-purple-400/80 group-hover:text-purple-400">More</span>
                    </button>
                    {showMoreToolsDropdown && createPortal(
                      <>
                        {/* Backdrop to close dropdown */}
                        <div className="fixed inset-0 z-[9998]" onClick={() => setShowMoreToolsDropdown(false)} />
                        <div
                          className="fixed bg-surface-900 border border-white/20 rounded-xl shadow-2xl p-3 z-[9999] min-w-[220px]"
                          style={{
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            top: (() => {
                              const btn = document.getElementById('more-tools-dropdown-btn');
                              if (btn) {
                                const rect = btn.getBoundingClientRect();
                                return rect.bottom + 8;
                              }
                              return 100;
                            })(),
                            left: (() => {
                              const btn = document.getElementById('more-tools-dropdown-btn');
                              if (btn) {
                                const rect = btn.getBoundingClientRect();
                                return Math.min(rect.left, window.innerWidth - 240);
                              }
                              return 100;
                            })()
                          }}
                        >
                          <div
                            className="fixed z-[100] w-72 max-h-[85vh] overflow-y-auto glass-dark border border-white/10 rounded-2xl shadow-2xl p-2 animate-scale-in"
                            style={{
                              top: (() => {
                                const btn = document.getElementById('more-tools-dropdown-btn');
                                if (btn) {
                                  const rect = btn.getBoundingClientRect();
                                  return rect.bottom + 8;
                                }
                                return 100;
                              })(),
                              left: (() => {
                                const btn = document.getElementById('more-tools-dropdown-btn');
                                if (btn) {
                                  const rect = btn.getBoundingClientRect();
                                  return Math.min(rect.left, window.innerWidth - 300);
                                }
                                return 100;
                              })()
                            }}
                          >
                            <div className="px-3 py-2">
                              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Documents</div>
                              <div className="space-y-1">
                                <button onClick={() => { setShowTemplatesPanel(true); setShowMoreToolsDropdown(false); }} className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group">
                                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                                    <LayoutGrid className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-200">Templates</div>
                                    <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Preset layouts for quick document creation</div>
                                  </div>
                                </button>
                              </div>

                              <div className="h-px bg-white/5 my-3" />
                              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Analysis & Review</div>
                              <div className="space-y-1">
                                <button onClick={() => { setShowVisualCompare(true); setShowMoreToolsDropdown(false); }} className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group">
                                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                                    <Diff className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-200">Visual Compare</div>
                                    <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Side-by-side visual difference detection</div>
                                  </div>
                                </button>
                                <button onClick={() => { setShowVersionHistory(true); setShowMoreToolsDropdown(false); }} className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group">
                                  <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20">
                                    <History className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-200">Version History</div>
                                    <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Track and restore previous document states</div>
                                  </div>
                                </button>
                                <button onClick={() => { setShowAccessibilityPanel(true); setShowMoreToolsDropdown(false); }} className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group">
                                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20">
                                    <Accessibility className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-200">Accessibility</div>
                                    <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Check and fix compliance for screen readers</div>
                                  </div>
                                </button>
                              </div>

                              <div className="h-px bg-white/5 my-3" />
                              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Advanced Workflow</div>
                              <div className="space-y-1">
                                <button onClick={() => { setShowAdvancedExport(true); setShowMoreToolsDropdown(false); }} className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group">
                                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                                    <FileOutput className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-200">Advanced Export</div>
                                    <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Complex multi-format and batch conversion</div>
                                  </div>
                                </button>
                                <button onClick={() => { setShowFDFImport(true); setShowMoreToolsDropdown(false); }} className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group">
                                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                                    <FileDown className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-200">Import FDF Data</div>
                                    <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Populate forms from standard FDF/XFDF files</div>
                                  </div>
                                </button>
                              </div>

                              <div className="h-px bg-white/5 my-3" />
                              <button onClick={() => { setShowKeyboardShortcuts(true); setShowMoreToolsDropdown(false); }} className="w-full px-3 py-2 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-all group">
                                <div className="p-2 rounded-lg bg-gray-500/10 text-gray-400 group-hover:text-gray-200">
                                  <Keyboard className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-400 group-hover:text-white">Keyboard Shortcuts</span>
                                <kbd className="ml-auto text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-gray-500">?</kbd>
                              </button>
                            </div>
                          </div>
                        </div>
                      </>,
                      document.body
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-[20px]" />


                {/* Export As Dropdown */}
                <div className="relative">
                  <button
                    id="export-as-main-btn"
                    onClick={(e) => { e.stopPropagation(); setShowExportAsDropdown(!showExportAsDropdown); }}
                    className="btn-primary !py-1.5 !px-3 lg:!py-2.5 lg:!px-6 xl:!px-8 !rounded-xl !text-xs lg:!text-base flex items-center gap-2 shadow-lg shadow-primary-500/20 whitespace-nowrap shrink-0"
                  >
                    <Download className="w-4 h-4 lg:w-6 lg:h-6" />
                    <span className="font-bold">Export As</span>
                    <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4" />
                  </button>
                  {showExportAsDropdown && createPortal(
                    <>
                      {/* Backdrop to close dropdown */}
                      <div className="fixed inset-0 z-[9998]" onClick={() => setShowExportAsDropdown(false)} />
                      <div
                        className="fixed bg-surface-900 border border-white/20 rounded-2xl shadow-2xl p-3 z-[9999] min-w-[280px] max-h-[80vh] overflow-y-auto"
                        style={{
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                          top: (() => {
                            const btn = document.getElementById('export-as-main-btn');
                            if (btn) {
                              const rect = btn.getBoundingClientRect();
                              return rect.bottom + 8;
                            }
                            return 100;
                          })(),
                          right: (() => {
                            const btn = document.getElementById('export-as-main-btn');
                            if (btn) {
                              const rect = btn.getBoundingClientRect();
                              return window.innerWidth - rect.right;
                            }
                            return 20;
                          })()
                        }}
                      >
                        {/* Quick Export PDF */}
                        <button
                          onClick={() => { handleExport(); setShowExportAsDropdown(false); }}
                          className="w-full px-4 py-3 mb-2 text-left rounded-xl flex items-center gap-3 bg-gradient-to-r from-primary-500/20 to-purple-500/20 border border-primary-500/30 hover:from-primary-500/30 hover:to-purple-500/30 transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-primary-500 text-white">
                            <Download className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">Export PDF</div>
                            <div className="text-[10px] text-surface-400">Download with all edits applied</div>
                          </div>
                        </button>

                        <div className="h-px bg-white/10 my-3" />
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">Advanced Formats</div>

                        {/* JSON Structure */}
                        <button
                          onClick={() => { handleOpenAdvancedExport(); setShowExportAsDropdown(false); }}
                          className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-200">JSON Structure</div>
                            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Export document structure, metadata, and text</div>
                          </div>
                        </button>

                        {/* XML/XMP Metadata */}
                        <button
                          onClick={() => { handleOpenAdvancedExport(); setShowExportAsDropdown(false); }}
                          className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                            <Code className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-200">XML/XMP Metadata</div>
                            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">XMP-compliant metadata in XML format</div>
                          </div>
                        </button>

                        {/* FDF Form Data */}
                        <button
                          onClick={() => { handleOpenAdvancedExport(); setShowExportAsDropdown(false); }}
                          className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-green-500/10 text-green-400 group-hover:bg-green-500/20">
                            <FileOutput className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-200">FDF Form Data</div>
                            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Export fillable form field data</div>
                          </div>
                        </button>

                        {/* PDF/A Archive */}
                        <button
                          onClick={() => { handleOpenAdvancedExport(); setShowExportAsDropdown(false); }}
                          className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-200">PDF/A Archive</div>
                            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Convert for long-term archiving</div>
                          </div>
                        </button>

                        {/* EPUB eBook */}
                        <button
                          onClick={() => { handleOpenAdvancedExport(); setShowExportAsDropdown(false); }}
                          className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-200">EPUB eBook</div>
                            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Convert to EPUB for e-readers</div>
                          </div>
                        </button>

                        {/* Sanitize Metadata */}
                        <button
                          onClick={() => { handleOpenAdvancedExport(); setShowExportAsDropdown(false); }}
                          className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20">
                            <EyeOff className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-200">Sanitize Metadata</div>
                            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Remove hidden info and scripts</div>
                          </div>
                        </button>

                        <div className="h-px bg-white/10 my-3" />
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">Office Formats</div>

                        {/* Word */}
                        <button
                          onClick={() => { handleOpenOfficeExport('word'); setShowExportAsDropdown(false); }}
                          className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group"
                        >
                          <div className="p-1 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-all">
                            <WordLogo className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-200">Export to Word</div>
                            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Convert PDF to editable .docx</div>
                          </div>
                        </button>

                        {/* Excel */}
                        <button
                          onClick={() => { handleOpenOfficeExport('excel'); setShowExportAsDropdown(false); }}
                          className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group"
                        >
                          <div className="p-1 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-all">
                            <ExcelLogo className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-200">Export to Excel</div>
                            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Extract tables to .xlsx spreadsheet</div>
                          </div>
                        </button>

                        {/* PowerPoint */}
                        <button
                          onClick={() => { handleOpenOfficeExport('powerpoint'); setShowExportAsDropdown(false); }}
                          className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group"
                        >
                          <div className="p-1 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-all">
                            <PowerPointLogo className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-200">Export to PPT</div>
                            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Convert PDF to .pptx presentation</div>
                          </div>
                        </button>

                        <div className="h-px bg-white/10 my-3" />
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">Text & Data</div>

                        {/* Plain Text */}
                        <button
                          onClick={() => { setShowExportTextModal(true); setShowExportAsDropdown(false); }}
                          className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-slate-500/10 text-slate-400 group-hover:bg-slate-500/20">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-200">Plain Text</div>
                            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Extract text content from PDF</div>
                          </div>
                        </button>

                        {/* Markdown */}
                        <button
                          onClick={() => { setShowExportTextModal(true); setShowExportAsDropdown(false); }}
                          className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
                            <Hash className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-200">Markdown</div>
                            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Export as formatted Markdown</div>
                          </div>
                        </button>

                        {/* HTML */}
                        <button
                          onClick={() => { setShowExportTextModal(true); setShowExportAsDropdown(false); }}
                          className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20">
                            <Code className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-200">HTML</div>
                            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Export as web-ready HTML</div>
                          </div>
                        </button>

                        {/* Tables ? CSV */}
                        <button
                          onClick={() => { setShowTableExtractionModal(true); setShowExportAsDropdown(false); }}
                          className="w-full px-3 py-2.5 text-left rounded-xl flex items-start gap-3 hover:bg-white/5 transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                            <Table2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-200">Tables ? CSV</div>
                            <div className="text-[10px] text-gray-500 leading-tight mt-0.5">Extract tables as CSV data</div>
                          </div>
                        </button>
                      </div>
                    </>,
                    document.body
                  )}
                </div>
              </div>
            </div>
            {canScrollPrimaryRight && (
              <button
                onClick={() => scrollPrimaryToolbar('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-neutral-900/90 hover:bg-primary-600 text-white rounded-l-xl p-2 shadow-xl border-y border-l border-white/20 pointer-events-auto transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>



          {/* Search Bar */}
          {showSearchBar && (
            <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'rgba(255,200,0,0.3)', background: 'rgba(50,50,30,0.95)' }}>
              <Search className="w-4 h-4 text-yellow-400" />
              <input
                id="search-input"
                type="text"
                placeholder="Search text in PDF..."
                value={searchQuery}
                onKeyDown={e => e.key === 'Enter' && handleTextSearch(searchQuery)}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder-surface-600"
                autoFocus
              />
              <button onClick={() => handleTextSearch(searchQuery)} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-lg border border-yellow-500/30 hover:bg-yellow-500/30 transition-all">
                Search
              </button>
              {getTotalMatches() > 0 && (
                <>
                  <span className="text-xs text-yellow-400 whitespace-nowrap">
                    {currentMatchIndex + 1} of {getTotalMatches()}
                  </span>
                  <SmartTooltip text="Previous" description="Go to the previous text match.">
                    <button onClick={goToPrevMatch} className="p-1 rounded hover:bg-white/10">
                      <ChevronUp className="w-4 h-4 text-yellow-400" />
                    </button>
                  </SmartTooltip>
                  <SmartTooltip text="Next" description="Go to the next text match.">
                    <button onClick={goToNextMatch} className="p-1 rounded hover:bg-white/10">
                      <ChevronDown className="w-4 h-4 text-yellow-400" />
                    </button>
                  </SmartTooltip>
                </>
              )}
              <SmartTooltip text="Close" description="Exit search and clear highlights.">
                <button onClick={clearSearch} className="p-1.5 rounded hover:bg-red-500/20">
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </SmartTooltip>
            </div>
          )}

          {/* Floatable Centered Toolbar */}
          <div className="flex justify-center w-full mb-1 z-10 relative lg:sticky lg:top-2 lg:pointer-events-none lg:z-30 lg:mb-2 group/toolbar">
            {canScrollLeft && (
              <button
                onClick={() => scrollToolbar('left')}
                className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-50 bg-neutral-900/90 hover:bg-primary-600 text-white rounded-full p-2 shadow-xl border border-white/20 pointer-events-auto transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div ref={toolbarRef} onScroll={checkToolbarScroll} className="flex items-center gap-1 lg:gap-1.5 px-3 py-2 lg:px-4 lg:py-2 rounded-xl bg-surface-900/90 shadow-2xl backdrop-blur-md pointer-events-auto origin-top max-w-[95vw] overflow-x-auto scrollbar-hide scroll-smooth">
              {[
                {
                  name: 'Select',
                  items: [
                    { id: 'select', icon: MousePointer2, label: 'Select', desc: 'Select and move elements' },
                  ]
                },
                {
                  name: 'Insert',
                  items: [
                    { id: 'text', icon: Type, label: 'Add Text', desc: 'Insert text box', color: 'text-blue-400' },
                    { id: 'shapes', icon: Shapes, label: 'Shapes', desc: 'Insert geometric shapes', color: 'text-cyan-400', action: () => { setShowShapeMenu(!showShapeMenu); setShowAssetMenu(false); } },
                    { id: 'table', icon: Table2, label: 'Table', desc: 'Insert customizable table', color: 'text-emerald-400', action: () => setShowTableCreator(true) },
                    { id: 'addfields', icon: FormInput, label: 'Add Fields', desc: 'Add signatures, dates, and form fields.', action: () => setShowAddFieldsPanel(true), color: 'text-teal-400' },
                  ]
                },
                {
                  name: 'Annotate',
                  items: [
                    { id: 'draw', icon: PenTool, label: 'Freehand', desc: 'Draw freely', color: 'text-orange-400' },
                    { id: 'highlight', icon: Highlighter, label: 'Highlight', desc: 'Highlight text', color: 'text-yellow-400' },
                    { id: 'stickynote', icon: StickyNote, label: 'Note', desc: 'Add sticky notes for feedback.', action: () => setShowStickyNoteModal(true), color: 'text-amber-400' },
                    { id: 'watermark', icon: Droplet, label: 'Watermark', desc: 'Overlay semi-transparent text.', action: () => setShowWatermarkModal(true), color: 'text-sky-400' },
                    {
                      id: 'stamp', icon: Stamp, label: 'Asset', desc: 'Add stamps and stickers.',
                      action: () => {
                        setShowAssetMenu(!showAssetMenu);
                        setShowShapeMenu(false);
                      },
                      color: 'text-pink-400'
                    },
                  ]
                },
                {
                  name: 'Media',
                  items: [
                    { id: 'image', icon: Image, label: 'Image', desc: 'Upload and insert image', color: 'text-purple-400', action: handleImageUpload },
                    { id: 'qrcode', icon: QrCode, label: 'QR Code', desc: 'Generate QR code', color: 'text-pink-400', action: () => setShowQRCodeModal(true) },
                    { id: 'hyperlink', icon: Link2, label: 'Link', desc: 'Add clickable hyperlink', color: 'text-blue-400', action: () => setShowHyperlinkModal(true) },
                    { id: 'signature', icon: Signature, label: 'Sign', desc: 'Add signature', color: 'text-indigo-400', action: () => setShowSignatureCreator(true) },
                  ]
                },
                {
                  name: 'Modify',
                  items: [
                    { id: 'whiteout', icon: Eraser, label: 'Whiteout', desc: 'Cover content', color: 'text-white' },
                    { id: 'redact', icon: EyeOff, label: 'Redact', desc: 'Permanently hide', color: 'text-red-500' },
                  ]
                },
              ].map((group, idx, arr) => (
                <div key={idx} className="flex items-center gap-0.5">
                  {group.items.map((t: any) => (
                    <SmartTooltip key={t.id} text={t.label} description={t.desc}>
                      <button
                        onClick={() => {
                          if (t.action) t.action();
                          else {
                            setTool(t.id);
                            // Auto-open properties panel for tools with settings/auto-redact
                            if (t.id === 'redact' || t.id === 'draw') setShowProps(true);
                          }
                        }}
                        className={`group px-3 py-2 rounded-xl transition-all flex flex-col items-center justify-center gap-1 min-w-[4.5rem] ${((tool === t.id && !t.action) || (t.id === 'shapes' && showShapeMenu) || (t.id === 'stamp' && showAssetMenu)) ? 'bg-primary-500/20 ring-1 ring-primary-500/50' : 'hover:bg-white/10'}`}
                      >
                        <t.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${((tool === t.id && !t.action) || (t.id === 'shapes' && showShapeMenu) || (t.id === 'stamp' && showAssetMenu)) ? 'text-white' : t.color || 'text-gray-400'}`} />
                        <span className={`text-[10px] lg:text-[11px] font-medium leading-none whitespace-nowrap ${((tool === t.id && !t.action) || (t.id === 'shapes' && showShapeMenu) || (t.id === 'stamp' && showAssetMenu)) ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{t.label}</span>
                      </button>
                    </SmartTooltip>
                  ))}
                  {idx < arr.length - 1 && <div className="w-px h-6 mx-2 bg-white/10" />}
                </div>
              ))}

              <div className="w-px h-6 mx-2 bg-white/10" />

              <div className="flex items-center gap-0.5">
                <SmartTooltip text="Undo" description="Roll back your last change.">
                  <button
                    onClick={undo}
                    disabled={histIdx <= 0}
                    className={`p-1.5 lg:p-2 xl:p-2.5 rounded-xl hover:bg-white/10 ${histIdx <= 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <Undo className="w-4.5 h-4.5 lg:w-5.5 lg:h-5.5 xl:w-6 xl:h-6 text-orange-400" />
                  </button>
                </SmartTooltip>
                <SmartTooltip text="Redo" description="Reapply a previously undone change.">
                  <button
                    onClick={redo}
                    disabled={histIdx >= history.length - 1}
                    className={`p-1.5 lg:p-2 xl:p-2.5 rounded-xl hover:bg-white/10 ${histIdx >= history.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <Redo className="w-4.5 h-4.5 lg:w-5.5 lg:h-5.5 xl:w-6 xl:h-6 text-sky-400" />
                  </button>
                </SmartTooltip>
              </div>

              <div className="w-px h-6 mx-2 bg-white/10" />

              <div className="flex items-center gap-1">
                <SmartTooltip text="Fit Width" description="Fit page to width">
                  <button onClick={handleFitWidth} className="p-1.5 lg:p-2 xl:p-2.5 rounded-xl hover:bg-white/10 text-teal-400"><ArrowLeftRight className="w-4.5 h-4.5 lg:w-5.5 lg:h-5.5 xl:w-6 xl:h-6" /></button>
                </SmartTooltip>
                <SmartTooltip text="Fit Page" description="Make page fit screen">
                  <button onClick={handleFitPage} className="p-1.5 lg:p-2 xl:p-2.5 rounded-xl hover:bg-white/10 text-teal-400"><ArrowUpDown className="w-4.5 h-4.5 lg:w-5.5 lg:h-5.5 xl:w-6 xl:h-6" /></button>
                </SmartTooltip>
                <div className="w-px h-6 mx-1 bg-white/10" />
                <SmartTooltip text="Zoom Out" description="View more of the page at once.">
                  <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="p-1.5 lg:p-2 xl:p-2.5 rounded-xl hover:bg-white/10 text-teal-400"><ZoomOut className="w-4.5 h-4.5 lg:w-5.5 lg:h-5.5 xl:w-6 xl:h-6" /></button>
                </SmartTooltip>
                <span className="text-xs lg:text-sm xl:text-base text-white font-mono w-14 text-center font-bold">{Math.round(zoom * 100)}%</span>
                <SmartTooltip text="Zoom In" description="Get a closer look at document details.">
                  <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-1.5 lg:p-2 xl:p-2.5 rounded-xl hover:bg-white/10 text-teal-400"><ZoomIn className="w-4.5 h-4.5 lg:w-5.5 lg:h-5.5 xl:w-6 xl:h-6" /></button>
                </SmartTooltip>
              </div>

              {isMobile && (
                <button onClick={() => setShowProps(!showProps)} className="p-2 ml-1 rounded-xl bg-violet-500/20 text-violet-400">
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>
            {canScrollRight && (
              <button
                onClick={() => scrollToolbar('right')}
                className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-50 bg-neutral-900/90 hover:bg-primary-600 text-white rounded-full p-2 shadow-xl border border-white/20 pointer-events-auto transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Shapes Submenu */}
          {showShapeMenu && (
            <div className="flex justify-center w-full pointer-events-none sticky top-20 lg:top-24 z-30 mb-2 -mt-1">
              <div className="flex flex-col gap-2 p-2 rounded-2xl bg-surface-900/95 border border-white/10 shadow-2xl backdrop-blur-md pointer-events-auto max-w-[95vw]">
                <div className="flex flex-wrap items-center justify-center gap-1">
                  {[
                    { id: 'rectangle', icon: Square, label: 'Rectangle' },
                    { id: 'circle', icon: Circle, label: 'Circle' },
                    { id: 'triangle', icon: Triangle, label: 'Triangle' },
                    { id: 'right_triangle', icon: Triangle, label: 'Right Triangle' },
                    { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
                    { id: 'star', icon: Star, label: 'Star' },
                    { id: 'diamond', icon: Diamond, label: 'Diamond' },
                    { id: 'hexagon', icon: Hexagon, label: 'Hexagon' },
                    { id: 'octagon', icon: Octagon, label: 'Octagon' },
                    { id: 'heart', icon: Heart, label: 'Heart' },
                    { id: 'cloud', icon: Cloud, label: 'Cloud' },
                    { id: 'lightning', icon: Zap, label: 'Lightning' },
                    { id: 'check', icon: CheckSquare, label: 'Check' },
                    { id: 'cross', icon: XSquare, label: 'Cross' },
                    { id: 'speech_bubble', icon: MessageSquare, label: 'Callout' },
                    { id: 'line', icon: Minus, label: 'Line' }
                  ].map(s => (
                    <SmartTooltip key={s.id} text={s.label}>
                      <button
                        onClick={() => addShape(s.id)}
                        className={`group p-1.5 lg:p-2 rounded-xl hover:bg-white/10 text-cyan-400 transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5 min-w-[3.5rem]`}
                      >
                        <s.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${s.id === 'right_triangle' ? 'rotate-90' : ''}`} />
                        <span className="text-[8px] font-medium leading-none whitespace-nowrap text-cyan-400/80 group-hover:text-cyan-400">{s.label}</span>
                      </button>
                    </SmartTooltip>
                  ))}
                  <div className="w-px h-6 mx-1 bg-white/10" />
                  <button
                    onClick={() => setShowShapeMenu(false)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Asset Submenu */}
          {showAssetMenu && (
            <div className="flex justify-center w-full pointer-events-none sticky top-20 lg:top-24 z-30 mb-2 -mt-1">
              <div className="flex items-center gap-1 p-2 rounded-2xl bg-surface-900/95 border border-white/10 shadow-2xl backdrop-blur-md pointer-events-auto">
                <button
                  onClick={() => { setShowStampsLibrary(true); setShowAssetMenu(false); }}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-white/10 group transition-all min-w-[5.5rem]"
                >
                  <Tag className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-gray-400 group-hover:text-white uppercase tracking-tighter">Saved Stamps</span>
                </button>
                <div className="w-px h-8 bg-white/10 mx-1" />
                <button
                  onClick={() => {
                    setMaterialGalleryCategory('all');
                    setShowMaterialGallery(true);
                    setShowAssetMenu(false);
                  }}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-white/10 group transition-all min-w-[5.5rem]"
                >
                  <Smile className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-gray-400 group-hover:text-white uppercase tracking-tighter">Stickers & Emojis</span>
                </button>
                <div className="w-px h-8 bg-white/10 mx-1" />
                <button
                  onClick={() => { setShowBulkStampModal(true); setShowAssetMenu(false); }}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl hover:bg-white/10 group transition-all min-w-[5.5rem]"
                >
                  <Pin className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-gray-400 group-hover:text-white uppercase tracking-tighter">Bulk Stamp</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 flex overflow-hidden">
            {/* Pages */}
            {/* Pages */}
            {(showPages) && (
              <div className={`${isMobile ? 'absolute z-20 left-0 top-24 bottom-16 w-36' : 'w-56'} border-r p-3 overflow-y-auto bg-surface-950/95 border-white/5`}>
                <div className="mb-3 px-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500 font-medium">Pages ({pages.length})</span>
                    <div className="flex items-center gap-1">
                      <SmartTooltip text="Add Page" description="Insert a blank page at the end of the document.">
                        <button onClick={() => setShowAddPageModal(true)} className="p-1 hover:bg-white/10 rounded text-green-400 hover:text-green-300 transition-colors"><Plus className="w-4 h-4" /></button>
                      </SmartTooltip>
                      <button onClick={() => setShowPages(false)} className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="flex justify-between gap-0.5 bg-black/20 rounded-lg p-1">
                    <SmartTooltip text="Reorder" description="Drag and drop pages to change their order.">
                      <button onClick={() => setShowReorderModal(true)} className="flex-1 p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors flex items-center justify-center"><ArrowUpDown className="w-3.5 h-3.5" /></button>
                    </SmartTooltip>
                    <SmartTooltip text="Extract" description="Save specific pages as new PDF files.">
                      <button onClick={() => setShowExtractModal(true)} className="flex-1 p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors flex items-center justify-center"><FileOutput className="w-3.5 h-3.5" /></button>
                    </SmartTooltip>
                    <SmartTooltip text="Page #" description="Add sequential page numbers to the document.">
                      <button onClick={() => setShowPageNumbersModal(true)} className="flex-1 p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors flex items-center justify-center"><Hash className="w-3.5 h-3.5" /></button>
                    </SmartTooltip>
                    <SmartTooltip text="Delete" description="Remove selected pages permanently.">
                      <button onClick={() => setShowDeletePagesModal(true)} className="flex-1 p-1.5 hover:bg-white/10 rounded text-red-400 hover:text-red-300 transition-colors flex items-center justify-center"><Trash className="w-3.5 h-3.5" /></button>
                    </SmartTooltip>
                  </div>
                </div>
                {pages.map((p, i) => (
                  <div
                    key={p.id}
                    draggable={true}
                    onDragStart={(e) => {
                      setDraggedPage(i);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(i));
                    }}
                    onDragEnd={() => {
                      setDraggedPage(null);
                      setDragOverPage(null);
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      if (draggedPage !== null && draggedPage !== i) {
                        setDragOverPage(i);
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDragLeave={() => {
                      setDragOverPage(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedPage !== null && draggedPage !== i) {
                        movePageVisual(draggedPage, i);
                      }
                      setDraggedPage(null);
                      setDragOverPage(null);
                    }}
                    className={`relative mb-4 group transition-all cursor-grab active:cursor-grabbing
                  ${draggedPage === i ? 'opacity-40 scale-95' : ''}
                  ${dragOverPage === i ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-zinc-900' : ''}
                `}
                  >
                    {/* Drop indicator line */}
                    {dragOverPage === i && draggedPage !== null && draggedPage > i && (
                      <div className="absolute -top-2 left-0 right-0 h-1 bg-purple-500 rounded-full" />
                    )}

                    <div onClick={() => { setPage(i + 1); setSelected(null); if (isMobile) setShowPages(false); }} className={`rounded-lg overflow-hidden cursor-pointer border-2 transition-all relative shadow-sm ${page === i + 1 ? 'border-purple-500 ring-1 ring-purple-500/50' : 'border-transparent hover:border-purple-500/50'}`}>
                      {pageImages[i + 1] ? <img src={pageImages[i + 1]} alt="" className="w-full bg-white block transition-all" style={{ filter: isGrayscaleMode ? 'grayscale(100%)' : 'none' }} draggable={false} /> : <div className="aspect-[3/4] bg-gray-800 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-600" /></div>}
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium backdrop-blur-md shadow-sm" style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>{i + 1}</div>
                    </div>

                    {/* Drop indicator line (bottom) */}
                    {dragOverPage === i && draggedPage !== null && draggedPage < i && (
                      <div className="absolute -bottom-2 left-0 right-0 h-1 bg-purple-500 rounded-full" />
                    )}

                    {/* Inline Actions */}
                    <div className="flex justify-between items-center mt-2 px-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => rotatePage(i + 1, -90)} title="Rotate Left" className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
                      <button onClick={() => rotatePage(i + 1, 90)} title="Rotate Right" className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><RotateCw className="w-3.5 h-3.5" /></button>
                      <button onClick={() => duplicatePage(i + 1)} title="Duplicate" className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deletePage(i + 1)} title="Delete" className="p-1.5 rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Canvas */}
            <div ref={viewerRef} className="flex-1 overflow-auto p-4 sm:p-8" style={{ background: '#18181b', touchAction: 'pan-x pan-y' }}>
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                  {progress && <p className="text-white text-lg font-medium animate-pulse">{progress}</p>}
                </div>
              ) : (
                <div ref={canvasRef} onClick={handleCanvasClick} onMouseDown={handleDrawStart} onMouseMove={handleDrawMove} onMouseUp={handleDrawEnd} onMouseLeave={handleDrawEnd} onTouchStart={handleDrawStart} onTouchMove={handleDrawMove} onTouchEnd={handleDrawEnd} className="relative mx-auto shadow-2xl overflow-hidden" style={{ width: ((cp.rotation || 0) % 180 === 90 ? cp.height : cp.width) * 1.5 * zoom, height: ((cp.rotation || 0) % 180 === 90 ? cp.width : cp.height) * 1.5 * zoom, background: 'white', touchAction: tool === 'draw' ? 'none' : 'pan-x pan-y', cursor: tool === 'draw' ? 'crosshair' : tool === 'text' ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'><text x=\'50%\' y=\'50%\' dominant-baseline=\'central\' text-anchor=\'middle\' font-size=\'24\' font-family=\'sans-serif\' font-weight=\'900\' fill=\'black\' stroke=\'white\' stroke-width=\'1\'>T</text></svg>") 16 16, text' : tool !== 'select' ? 'crosshair' : 'default', isolation: 'isolate' }}>
                  {pageImages[page] && <img src={pageImages[page]} alt="" className="absolute inset-0 w-full h-full pointer-events-none transition-all" style={{ filter: isGrayscaleMode ? 'grayscale(100%)' : 'none' }} draggable={false} />}

                  {/* PDF.js Text Layer - REMOVED to prevent overlap */}
                  {/* Elements - always show, with higher z-index than text layer */}

                  {/* Drawing preview */}
                  {isDrawing && drawPaths.length > 1 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `scale(${zoom})`, transformOrigin: '0 0', zIndex: 10 }}>
                      <path d={drawPaths.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')} fill="none" stroke={drawingColor} strokeWidth={drawingWidth} strokeLinecap="round" />
                    </svg>
                  )}

                  {/* Search Highlights */}
                  {searchHighlights.filter(h => h.page === page).map((h, hi) => (
                    h.rects.map((rect, ri) => (
                      <div
                        key={`search-${hi}-${ri}`}
                        className="absolute pointer-events-none animate-pulse"
                        style={{
                          left: rect.x * zoom,
                          top: rect.y * zoom,
                          width: rect.w * zoom,
                          height: rect.h * zoom,
                          background: 'rgba(255, 255, 0, 0.4)',
                          border: '2px solid rgba(255, 200, 0, 0.8)',
                          borderRadius: '2px',
                          zIndex: 50,
                          boxShadow: '0 0 8px rgba(255, 200, 0, 0.6)'
                        }}
                      />
                    ))
                  ))}


                  {els.filter((e: PDFElement) => e.visible).map((el: PDFElement) => (
                    <div key={el.id} onMouseDown={e => tool === 'select' && handleElMouseDown(e, el)} onTouchStart={e => tool === 'select' && handleElMouseDown(e, el)} className={`absolute ${selected?.id === el.id ? 'ring-2 ring-blue-500' : ''} ${el.locked ? 'cursor-not-allowed' : tool === 'select' ? 'cursor-move' : ''}`} style={{ left: el.x * zoom, top: el.y * zoom, width: el.width * zoom, height: el.height * zoom, opacity: el.opacity, transform: `rotate(${el.rotation}deg)`, zIndex: 10 + el.zIndex }}>
                      {el.type === 'text' && <div style={{ fontSize: (el as TextEl).fontSize * zoom, color: (el as TextEl).color, fontFamily: (el as TextEl).fontFamily, fontWeight: (el as TextEl).bold ? 'bold' : 'normal', fontStyle: (el as TextEl).italic ? 'italic' : 'normal', textAlign: (el as TextEl).textAlign as any, width: '100%', height: '100%' }}>{(el as TextEl).content}</div>}
                      {el.type === 'shape' && (
                        (el as ShapeEl).shapeType === 'rectangle' || (el as ShapeEl).shapeType === 'circle' ? (
                          <div style={{ width: '100%', height: '100%', background: (el as ShapeEl).fill, border: `${(el as ShapeEl).strokeWidth}px solid ${(el as ShapeEl).stroke}`, borderRadius: (el as ShapeEl).shapeType === 'circle' ? '50%' : '4px' }} />
                        ) : (el as ShapeEl).shapeType === 'line' ? (
                          <div style={{ width: '100%', height: `${(el as ShapeEl).strokeWidth}px`, background: (el as ShapeEl).stroke, top: '50%', position: 'absolute' }} />
                        ) : (el as ShapeEl).shapeType === 'arrow' ? (
                          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible"><defs><marker id={`ah-${el.id}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill={(el as ShapeEl).stroke} /></marker></defs><line x1="0" y1="50" x2="100" y2="50" stroke={(el as ShapeEl).stroke} strokeWidth={(el as ShapeEl).strokeWidth} markerEnd={`url(#ah-${el.id})`} vectorEffect="non-scaling-stroke" /></svg>
                        ) : (el as ShapeEl).shapeType === 'triangle' ? (
                          <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="50,5 95,95 5,95" fill={(el as ShapeEl).fill} stroke={(el as ShapeEl).stroke} strokeWidth={(el as ShapeEl).strokeWidth} vectorEffect="non-scaling-stroke" /></svg>
                        ) : (el as ShapeEl).shapeType === 'star' ? (
                          <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="50,5 61,40 98,40 68,62 79,96 50,75 21,96 32,62 2,40 39,40" fill={(el as ShapeEl).fill} stroke={(el as ShapeEl).stroke} strokeWidth={(el as ShapeEl).strokeWidth} vectorEffect="non-scaling-stroke" /></svg>
                        ) : (el as ShapeEl).shapeType === 'diamond' ? (
                          <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="50,5 95,50 50,95 5,50" fill={(el as ShapeEl).fill} stroke={(el as ShapeEl).stroke} strokeWidth={(el as ShapeEl).strokeWidth} vectorEffect="non-scaling-stroke" /></svg>
                        ) : (el as ShapeEl).shapeType === 'hexagon' ? (
                          <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="50,5 93,25 93,75 50,95 7,75 7,25" fill={(el as ShapeEl).fill} stroke={(el as ShapeEl).stroke} strokeWidth={(el as ShapeEl).strokeWidth} vectorEffect="non-scaling-stroke" /></svg>
                        ) : (el as ShapeEl).shapeType === 'pentagon' ? (
                          <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="50,5 95,38 78,95 22,95 5,38" fill={(el as ShapeEl).fill} stroke={(el as ShapeEl).stroke} strokeWidth={(el as ShapeEl).strokeWidth} vectorEffect="non-scaling-stroke" /></svg>
                        ) : (el as ShapeEl).shapeType === 'octagon' ? (
                          <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill={(el as ShapeEl).fill} stroke={(el as ShapeEl).stroke} strokeWidth={(el as ShapeEl).strokeWidth} vectorEffect="non-scaling-stroke" /></svg>
                        ) : (el as ShapeEl).shapeType === 'heart' ? (
                          <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M50,30 C50,30 45,15 30,15 C15,15 5,30 5,45 C5,70 50,95 50,95 C50,95 95,70 95,45 C95,30 85,15 70,15 C55,15 50,30 50,30" fill={(el as ShapeEl).fill} stroke={(el as ShapeEl).stroke} strokeWidth={(el as ShapeEl).strokeWidth} vectorEffect="non-scaling-stroke" /></svg>
                        ) : (el as ShapeEl).shapeType === 'cloud' ? (
                          <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M25,40 C25,20 50,20 50,20 C50,20 75,20 75,40 C95,40 95,60 75,60 L25,60 C5,60 5,40 25,40" fill={(el as ShapeEl).fill} stroke={(el as ShapeEl).stroke} strokeWidth={(el as ShapeEl).strokeWidth} vectorEffect="non-scaling-stroke" /></svg>
                        ) : (el as ShapeEl).shapeType === 'lightning' ? (
                          <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="60,5 10,60 50,60 40,95 90,40 50,40" fill={(el as ShapeEl).fill} stroke={(el as ShapeEl).stroke} strokeWidth={(el as ShapeEl).strokeWidth} vectorEffect="non-scaling-stroke" /></svg>
                        ) : (el as ShapeEl).shapeType === 'right_triangle' ? (
                          <svg viewBox="0 0 100 100" className="w-full h-full"><polygon points="5,5 5,95 95,95" fill={(el as ShapeEl).fill} stroke={(el as ShapeEl).stroke} strokeWidth={(el as ShapeEl).strokeWidth} vectorEffect="non-scaling-stroke" /></svg>
                        ) : (el as ShapeEl).shapeType === 'speech_bubble' ? (
                          <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M10,10 L90,10 L90,70 L40,70 L10,95 L10,70 Z" fill={(el as ShapeEl).fill} stroke={(el as ShapeEl).stroke} strokeWidth={(el as ShapeEl).strokeWidth} vectorEffect="non-scaling-stroke" /></svg>
                        ) : (el as ShapeEl).shapeType === 'check' ? (
                          <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M20,50 L45,75 L80,25" fill="none" stroke={(el as ShapeEl).stroke} strokeWidth={(el as ShapeEl).strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></svg>
                        ) : (el as ShapeEl).shapeType === 'cross' ? (
                          <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M25,25 L75,75 M75,25 L25,75" fill="none" stroke={(el as ShapeEl).stroke} strokeWidth={(el as ShapeEl).strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></svg>
                        ) : null
                      )}
                      {el.type === 'formfield' && (
                        <div className="w-full h-full border border-blue-400/50 bg-white rounded flex flex-col items-center justify-center p-1 overflow-hidden relative shadow-inner">

                          {((el as FormFieldEl).fieldType === 'checkbox' || (el as FormFieldEl).fieldType === 'radio') ? (
                            <div className={`w-5 h-5 border-2 border-slate-300 flex items-center justify-center ${(el as FormFieldEl).fieldType === 'radio' ? 'rounded-full' : 'rounded-sm'}`}>
                              <div className={`w-2 h-2 bg-slate-400 ${(el as FormFieldEl).fieldType === 'radio' ? 'rounded-full' : ''}`} />
                            </div>
                          ) : (el as FormFieldEl).fieldType === 'dropdown' ? (
                            <div className="w-full flex justify-between items-center text-[10px] text-slate-500 font-medium px-1 border border-slate-200 rounded bg-slate-50">
                              <span className="truncate">{(el as FormFieldEl).value || (el as FormFieldEl).label || 'Select...'}</span>
                              <ChevronDown className="w-3 h-3 text-slate-400" />
                            </div>
                          ) : (
                            <div className="w-full text-[10px] text-slate-500 font-medium text-center truncate italic opacity-80">
                              {(el as FormFieldEl).value || (el as FormFieldEl).label || `[${(el as FormFieldEl).fieldType.toUpperCase()}]`}
                            </div>
                          )}
                        </div>
                      )}
                      {(el.type === 'image' || el.type === 'signature') && <img src={(el as ImageEl).src} alt="" className="w-full h-full object-contain" draggable={false} />}
                      {el.type === 'watermark' && <div style={{ fontSize: (el as WatermarkEl).fontSize * zoom, color: (el as WatermarkEl).color, fontWeight: 'bold', textAlign: 'center', width: '100%', whiteSpace: 'nowrap' }}>{(el as WatermarkEl).content}</div>}
                      {el.type === 'highlight' && <div style={{ width: '100%', height: '100%', background: (el as HighlightEl).color, borderRadius: '2px' }} />}
                      {el.type === 'redaction' && <div style={{ width: '100%', height: '100%', background: (el as RedactionEl).color || '#000000', borderRadius: '0px' }} title="Redacted - Content will be permanently removed on export" />}
                      {el.type === 'hyperlink' && (
                        <div className="w-full h-full flex items-center gap-2 px-2 py-1 bg-blue-500/10 border border-blue-400/30 rounded cursor-pointer" style={{ color: (el as HyperlinkEl).color || '#2563eb' }}>
                          <Link2 className="w-3 h-3 shrink-0" />
                          <span style={{ fontSize: ((el as HyperlinkEl).fontSize || 14) * zoom, textDecoration: 'underline' }} className="truncate font-medium">
                            {(el as HyperlinkEl).content || (el as HyperlinkEl).url || 'Hyperlink'}
                          </span>
                        </div>
                      )}
                      {el.type === 'drawing' && <svg className="w-full h-full" viewBox={`0 0 ${el.width} ${el.height}`}><path d={(el as DrawingEl).paths} fill="none" stroke={(el as DrawingEl).stroke} strokeWidth={(el as DrawingEl).strokeWidth} strokeLinecap="round" transform={`translate(-${el.x},-${el.y})`} /></svg>}
                      {el.type === 'stickynote' && (
                        <div style={{ width: '100%', height: '100%', background: (el as StickyNoteEl).color, borderRadius: '4px', padding: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                          <div style={{ fontSize: '11px', color: '#333', fontWeight: '500', lineHeight: '1.4', wordWrap: 'break-word' }}>{(el as StickyNoteEl).content}</div>
                        </div>
                      )}
                      {el.type === 'crop' && (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          border: '3px dashed #22c55e',
                          borderRadius: '4px',
                          background: 'rgba(34, 197, 94, 0.1)',
                          position: 'relative'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '-24px',
                            left: '0px',
                            background: '#22c55e',
                            color: 'white',
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                          }}>
                            CROP AREA
                          </div>
                          <div style={{
                            position: 'absolute',
                            inset: '0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#22c55e',
                            fontSize: '12px',
                            fontWeight: '500',
                            textAlign: 'center',
                            padding: '10px'
                          }}>
                            Resize to define crop area.<br />Content outside will be removed.
                          </div>
                        </div>
                      )}
                      {el.type === 'table' && (
                        <div className="w-full h-full overflow-hidden bg-white/5 rounded shadow-sm">
                          <table
                            style={{
                              width: '100%',
                              height: '100%',
                              borderCollapse: 'collapse',
                              border: `${(el as TableEl).borderWidth}px solid ${(el as TableEl).borderColor}`,
                              tableLayout: 'fixed'
                            }}
                          >
                            <tbody>
                              {(el as TableEl).cells.map((row, rIdx) => (
                                <tr key={rIdx} style={{ height: (100 / (el as TableEl).rows) + '%' }}>
                                  {row.map((cell, cIdx) => (
                                    <td
                                      key={cIdx}
                                      style={{
                                        border: `${(el as TableEl).borderWidth}px solid ${(el as TableEl).borderColor}`,
                                        backgroundColor: rIdx === 0 ? (el as TableEl).headerBg : (el as TableEl).cellBg,
                                        padding: 0,
                                        textAlign: 'center',
                                        verticalAlign: 'middle',
                                        fontSize: Math.max(8, 12 * zoom) + 'px',
                                        color: getContrastColor(rIdx === 0 ? (el as TableEl).headerBg : (el as TableEl).cellBg),
                                        fontWeight: rIdx === 0 ? 'bold' : 'normal',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                        lineHeight: '1.2',
                                        position: 'relative'
                                      }}
                                    >
                                      <div
                                        contentEditable={!el.locked}
                                        suppressContentEditableWarning
                                        onBlur={(e) => {
                                          const newText = e.currentTarget.textContent || '';
                                          const newCells = [...(el as TableEl).cells];
                                          newCells[rIdx] = [...newCells[rIdx]];
                                          newCells[rIdx][cIdx] = newText;
                                          updateEl({ ...el, cells: newCells } as TableEl);
                                        }}
                                        className="outline-none w-full h-full min-h-[1.2em] flex items-center justify-center p-1"
                                        style={{
                                          cursor: el.locked ? 'default' : 'text',
                                          userSelect: 'text'
                                        }}
                                      >
                                        {cell}
                                      </div>
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {selected?.id === el.id && isMobile && (
                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                          <button
                            onMouseDown={(e) => { e.stopPropagation(); setShowProps(true); }}
                            onTouchStart={(e) => { e.stopPropagation(); setShowProps(true); }}
                            className="bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20 whitespace-nowrap active:scale-95 transition-transform"
                          >
                            Properties
                          </button>
                        </div>
                      )}
                      {selected?.id === el.id && !el.locked && ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(h => (
                        <div key={h} onMouseDown={e => handleResizeStart(e, el, h)} onTouchStart={e => handleResizeStart(e, el, h)} className="absolute w-6 h-6 bg-blue-500 border-2 border-white rounded-full shadow-md z-50 touch-none" style={{ cursor: `${h}-resize`, ...({ nw: { top: -12, left: -12 }, n: { top: -12, left: '50%', marginLeft: -12 }, ne: { top: -12, right: -12 }, e: { top: '50%', right: -12, marginTop: -12 }, se: { bottom: -12, right: -12 }, s: { bottom: -12, left: '50%', marginLeft: -12 }, sw: { bottom: -12, left: -12 }, w: { top: '50%', left: -12, marginTop: -12 } }[h]) }} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Properties & Tool Settings Panel */}
            {(showProps || !isMobile) && (selected || tool === 'redact' || tool === 'draw') && (
              <div className={`${isMobile ? 'absolute z-30 left-0 right-0 top-[50px] bottom-auto max-h-[60vh] h-auto w-full border-b border-l-0 rounded-b-2xl shadow-2xl animate-in slide-in-from-top duration-300' : 'w-72 border-l'} p-4 overflow-y-auto transition-opacity duration-200 ${isMobile && dragging ? 'opacity-25 pointer-events-none' : 'opacity-100'}`} style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(24,24,27,0.95)' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 uppercase font-semibold">{selected ? 'Properties' : 'Tool Settings'}</span>
                  {isMobile && <button onClick={() => setShowProps(false)}><X className="w-4 h-4 text-gray-400" /></button>}
                </div>

                {/* Tool-Specific Global Settings */}
                {tool === 'redact' && (
                  <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 shadow-sm">
                    <div className="flex items-center gap-2 text-red-500 mb-2">
                      <EyeOff className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Bulk Auto-Redact</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mb-3 leading-relaxed">Enter words or phrases (separated by commas) to permanently hide them across the whole document.</p>
                    <textarea
                      value={autoRedactQuery}
                      onChange={e => setAutoRedactQuery(e.target.value)}
                      placeholder="e.g. secret, confidential, private"
                      className="input w-full text-xs h-20 mb-3 border-red-500/30 focus:border-red-500 transition-colors custom-scrollbar"
                    />
                    <button
                      onClick={() => handleAutoRedact(autoRedactQuery)}
                      disabled={!autoRedactQuery.trim()}
                      className="btn-primary w-full !bg-red-500 hover:!bg-red-400 text-[10px] py-1.5 shadow-lg shadow-red-500/10 flex items-center justify-center gap-1.5 transform active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:active:scale-100 font-bold"
                    >
                      Apply Bulk Redaction
                    </button>
                  </div>
                )}

                {/* Drawing Tool Settings */}
                {tool === 'draw' && (
                  <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5 shadow-sm">
                    <div className="flex items-center gap-2 text-orange-400 mb-3">
                      <PenTool className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Drawing Settings</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500">Stroke Color</label>
                        <input
                          type="color"
                          value={drawingColor}
                          onChange={e => setDrawingColor(e.target.value)}
                          className="w-full h-8 rounded cursor-pointer mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Stroke Width ({drawingWidth}px)</label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={drawingWidth}
                          onChange={e => setDrawingWidth(+e.target.value)}
                          className="w-full mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Selection Specific Properties */}
                {selected && (
                  <>
                    {/* Position & Size */}
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-2 font-medium">Position & Size</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs text-gray-500">X</label><input type="number" value={Math.round(selected.x)} onChange={e => updateEl({ ...selected, x: +e.target.value })} className="input !py-1.5 text-sm w-full" /></div>
                        <div><label className="text-xs text-gray-500">Y</label><input type="number" value={Math.round(selected.y)} onChange={e => updateEl({ ...selected, y: +e.target.value })} className="input !py-1.5 text-sm w-full" /></div>
                        <div><label className="text-xs text-gray-500">Width</label><input type="number" value={Math.round(selected.width)} onChange={e => updateEl({ ...selected, width: +e.target.value })} className="input !py-1.5 text-sm w-full" /></div>
                        <div><label className="text-xs text-gray-500">Height</label><input type="number" value={Math.round(selected.height)} onChange={e => updateEl({ ...selected, height: +e.target.value })} className="input !py-1.5 text-sm w-full" /></div>
                      </div>
                    </div>

                    {/* Opacity */}
                    <div className="mb-4">
                      <label className="text-xs text-gray-500 flex justify-between"><span>Opacity</span><span className="text-white">{Math.round(selected.opacity * 100)}%</span></label>
                      <input type="range" min="0" max="1" step="0.1" value={selected.opacity} onChange={e => updateEl({ ...selected, opacity: +e.target.value })} className="w-full mt-1" />
                    </div>

                    <div className="mb-4">
                      <label className="text-xs text-gray-500 flex justify-between"><span>Rotation</span><span className="text-white">{selected.rotation}°</span></label>
                      <input type="range" min="0" max="360" value={selected.rotation} onChange={e => updateEl({ ...selected, rotation: +e.target.value })} className="w-full mt-1" />
                    </div>

                    {/* Sync to all pages action */}
                    {(selected.type === 'image' || selected.type === 'text' || selected.type === 'watermark') && (
                      <div className="mb-6 pt-2 border-t border-white/5 mt-2">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={applySelectedToAllPages}
                              className="flex-1 py-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 text-xs font-bold rounded-lg border border-primary-500/30 transition-all flex items-center justify-center gap-2"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              Apply to all pages
                            </button>
                            <button
                              onClick={undo}
                              title="Undo changes"
                              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold rounded-lg border border-white/10 transition-all flex items-center justify-center group"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {selected.syncGroupId && (
                            <button
                              onClick={removeAllSynchronized}
                              className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold rounded-lg border border-red-500/20 transition-all flex items-center justify-center gap-2"
                            >
                              <Trash className="w-3 h-3" />
                              Remove from all pages
                            </button>
                          )}
                        </div>
                        <p className="text-[9px] text-gray-500 mt-2 text-center px-1 leading-tight">
                          {selected.syncGroupId
                            ? "This PDFElement is synchronized. Use 'Remove' to clear it from all pages."
                            : "Clones this PDFElement to same position on all pages. Re-applying replaces old versions."}
                        </p>
                      </div>
                    )}

                    {selected.type === 'table' && (
                      <div className="mb-4 border-t border-white/5 pt-4 space-y-4">
                        <div className="text-xs text-gray-400 font-medium flex items-center gap-2">
                          <Table2 className="w-4 h-4 text-emerald-400" />
                          Table Settings
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1 uppercase font-bold">Header BG</label>
                            <div className="flex gap-2">
                              <input type="color" value={(selected as TableEl).headerBg} onChange={e => updateEl({ ...selected, headerBg: e.target.value } as TableEl)} className="w-full h-8 rounded bg-transparent border border-white/10 clickable" />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1 uppercase font-bold">Cell BG</label>
                            <div className="flex gap-2">
                              <input type="color" value={(selected as TableEl).cellBg} onChange={e => updateEl({ ...selected, cellBg: e.target.value } as TableEl)} className="w-full h-8 rounded bg-transparent border border-white/10 clickable" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1 uppercase font-bold">Border</label>
                            <input type="color" value={(selected as TableEl).borderColor} onChange={e => updateEl({ ...selected, borderColor: e.target.value } as TableEl)} className="w-full h-8 rounded bg-transparent border border-white/10 clickable" />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1 uppercase font-bold">Width</label>
                            <input type="number" min="0" max="10" value={(selected as TableEl).borderWidth} onChange={e => updateEl({ ...selected, borderWidth: +e.target.value } as TableEl)} className="input !py-1 w-full" />
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <div className="text-[10px] text-gray-500 uppercase font-bold">Rows & Columns</div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                const tbl = selected as TableEl;
                                const newCells = [...tbl.cells, Array(tbl.cols).fill('')];
                                updateEl({ ...tbl, rows: tbl.rows + 1, cells: newCells } as TableEl);
                              }}
                              className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-gray-200"
                            >
                              + Row
                            </button>
                            <button
                              onClick={() => {
                                const tbl = selected as TableEl;
                                if (tbl.rows <= 1) return;
                                const newCells = tbl.cells.slice(0, -1);
                                updateEl({ ...tbl, rows: tbl.rows - 1, cells: newCells } as TableEl);
                              }}
                              className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-gray-200"
                            >
                              - Row
                            </button>
                            <button
                              onClick={() => {
                                const tbl = selected as TableEl;
                                const newCells = tbl.cells.map(row => [...row, '']);
                                updateEl({ ...tbl, cols: tbl.cols + 1, cells: newCells } as TableEl);
                              }}
                              className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-gray-200"
                            >
                              + Col
                            </button>
                            <button
                              onClick={() => {
                                const tbl = selected as TableEl;
                                if (tbl.cols <= 1) return;
                                const newCells = tbl.cells.map(row => row.slice(0, -1));
                                updateEl({ ...tbl, cols: tbl.cols - 1, cells: newCells } as TableEl);
                              }}
                              className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-gray-200"
                            >
                              - Col
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Form Field Properties */}
                    {selected.type === 'formfield' && (
                      <div className="mb-4 border-t border-gray-700 pt-4">
                        <div className="text-xs text-gray-400 mb-2 font-medium flex items-center gap-2">
                          <FormInput className="w-4 h-4 text-blue-400" />
                          Form Field ({(selected as FormFieldEl).fieldType.toUpperCase()})
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-500">Label</label>
                            <input type="text" value={(selected as FormFieldEl).label || ''} onChange={e => updateEl({ ...selected, label: e.target.value } as FormFieldEl)} className="input !py-1.5 text-sm w-full" placeholder="Field Label" />
                          </div>

                          <div>
                            <label className="text-xs text-gray-500">Placeholder</label>
                            <input type="text" value={(selected as FormFieldEl).placeholder || ''} onChange={e => updateEl({ ...selected, placeholder: e.target.value } as FormFieldEl)} className="input !py-1.5 text-sm w-full" placeholder="Placeholder text" />
                          </div>

                          <div>
                            <label className="text-xs text-gray-500">Default Value</label>
                            <input
                              type="text"
                              value={(selected as FormFieldEl).value || ''}
                              onChange={e => updateEl({ ...selected, value: e.target.value } as FormFieldEl)}
                              className="input !py-1.5 text-sm w-full"
                              placeholder={(selected as FormFieldEl).fieldType === 'zipcode' || (selected as FormFieldEl).fieldType === 'number' ? "Numbers and letters allowed" : "Initial value"}
                            />
                          </div>

                          {((selected as FormFieldEl).fieldType === 'dropdown' || (selected as FormFieldEl).fieldType === 'radio') && (
                            <div className="space-y-2">
                              <label className="text-xs text-gray-500">Options</label>
                              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {((selected as FormFieldEl).options || []).map((opt, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={e => {
                                        const newOptions = [...((selected as FormFieldEl).options || [])];
                                        newOptions[idx] = e.target.value;
                                        updateEl({ ...selected, options: newOptions } as FormFieldEl);
                                      }}
                                      className="input !py-1 text-sm flex-1"
                                    />
                                    <button
                                      onClick={() => {
                                        const newOptions = ((selected as FormFieldEl).options || []).filter((_, i) => i !== idx);
                                        updateEl({ ...selected, options: newOptions } as FormFieldEl);
                                      }}
                                      className="p-1 hover:text-red-500 text-gray-500"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <button
                                onClick={() => {
                                  const newOptions = [...((selected as FormFieldEl).options || []), `Option ${((selected as FormFieldEl).options || []).length + 1}`];
                                  updateEl({ ...selected, options: newOptions } as FormFieldEl);
                                }}
                                className="w-full py-1.5 border border-dashed border-gray-600 rounded-lg text-[10px] text-gray-400 hover:text-white hover:border-blue-500 transition-all font-bold"
                              >
                                + Add Option
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-4 py-2 border-t border-white/5">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={(selected as FormFieldEl).required || false} onChange={e => updateEl({ ...selected, required: e.target.checked } as FormFieldEl)} className="w-4 h-4 rounded border-white/10" />
                              <span className="text-xs text-gray-400">Required</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={(selected as FormFieldEl).readOnly || false} onChange={e => updateEl({ ...selected, readOnly: e.target.checked } as FormFieldEl)} className="w-4 h-4 rounded border-white/10" />
                              <span className="text-xs text-gray-400">Read Only</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Text Properties */}
                    {selected.type === 'text' && <div className="mb-4 border-t border-gray-700 pt-4">
                      <div className="text-xs text-gray-400 mb-2 font-medium">Text Properties</div>

                      <label className="text-xs text-gray-500">Font Family</label>
                      <select value={(selected as TextEl).fontFamily} onChange={e => updateEl({ ...selected, fontFamily: e.target.value } as TextEl)} className="input !py-1.5 text-sm mb-3 w-full">
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times-Roman">Times Roman</option>
                        <option value="Courier">Courier</option>
                      </select>

                      <label className="text-xs text-gray-500">Content</label>
                      <textarea value={(selected as TextEl).content} onChange={e => updateEl({ ...selected, content: e.target.value } as TextEl)} className="input !py-1.5 text-sm mb-3 w-full" rows={2} />

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <label className="text-xs text-gray-500">Font Size</label>
                          <input type="number" value={(selected as TextEl).fontSize} onChange={e => updateEl({ ...selected, fontSize: +e.target.value } as TextEl)} className="input !py-1.5 text-sm w-full" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Color</label>
                          <input type="color" value={(selected as TextEl).color} onChange={e => updateEl({ ...selected, color: e.target.value } as TextEl)} className="w-full h-9 rounded cursor-pointer" />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => updateEl({ ...selected, bold: !(selected as TextEl).bold } as TextEl)} className={`flex-1 py-2 rounded text-sm font-bold transition-colors ${(selected as TextEl).bold ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>Bold</button>
                        <button onClick={() => updateEl({ ...selected, italic: !(selected as TextEl).italic } as TextEl)} className={`flex-1 py-2 rounded text-sm italic transition-colors ${(selected as TextEl).italic ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>Italic</button>
                      </div>

                      {/* Apply all styles to all pages (for page numbers) */}
                      {selected.zIndex === 1000 && (
                        <button onClick={applyStylesToAll} className="w-full mt-3 py-2 rounded-lg text-sm flex items-center justify-center gap-1 text-white bg-blue-600 hover:bg-blue-700">
                          <Copy className="w-4 h-4" /> Apply Styles to All Pages
                        </button>
                      )}
                    </div>}
                    {selected.type === 'shape' && <div className="mb-4"><div className="flex gap-2"><div><label className="text-xs text-gray-500">Color</label><input type="color" value={(selected as ShapeEl).stroke} onChange={e => updateEl({ ...selected, fill: e.target.value + '40', stroke: e.target.value } as ShapeEl)} className="w-full h-8 rounded cursor-pointer" /></div><div><label className="text-xs text-gray-500">Border</label><input type="number" value={(selected as ShapeEl).strokeWidth} onChange={e => updateEl({ ...selected, strokeWidth: +e.target.value } as ShapeEl)} className="input !py-1 text-sm" /></div></div></div>}
                    {selected.type === 'highlight' && <div className="mb-4"><label className="text-xs text-gray-500">Color</label><input type="color" value={(selected as HighlightEl).color} onChange={e => updateEl({ ...selected, color: e.target.value } as HighlightEl)} className="w-full h-8 rounded cursor-pointer" /></div>}
                    {selected.type === 'drawing' && (
                      <div className="mb-4">
                        <div className="flex gap-2">
                          <div>
                            <label className="text-xs text-gray-500">Color</label>
                            <input type="color" value={(selected as DrawingEl).stroke} onChange={e => updateEl({ ...selected, stroke: e.target.value } as DrawingEl)} className="w-full h-8 rounded cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Width</label>
                            <input type="number" min="1" max="20" value={(selected as DrawingEl).strokeWidth} onChange={e => updateEl({ ...selected, strokeWidth: +e.target.value } as DrawingEl)} className="input !py-1 text-sm w-full" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sticky Note Properties - Editable */}
                    {selected.type === 'stickynote' && (
                      <div className="mb-4 border-t border-gray-700 pt-4">
                        <div className="text-xs text-gray-400 mb-2 font-medium">Sticky Note</div>
                        <label className="text-xs text-gray-500">Content</label>
                        <textarea
                          value={(selected as StickyNoteEl).content}
                          onChange={e => updateEl({ ...selected, content: e.target.value } as StickyNoteEl)}
                          className="input !py-1.5 text-sm mb-3 w-full"
                          rows={3}
                          placeholder="Enter note..."
                        />
                        <label className="text-xs text-gray-500">Color</label>
                        <div className="flex gap-2 mt-2">
                          {['#fef08a', '#86efac', '#93c5fd', '#fca5a5', '#d8b4fe'].map(c => (
                            <button
                              key={c}
                              onClick={() => updateEl({ ...selected, color: c } as StickyNoteEl)}
                              className={`w-7 h-7 rounded ${(selected as StickyNoteEl).color === c ? 'ring-2 ring-white' : ''}`}
                              style={{ background: c }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Crop Properties - Live Preview Controls */}
                    {selected.type === 'crop' && (
                      <div className="mb-4 border-t border-gray-700 pt-4">
                        <div className="text-xs text-gray-400 mb-2 font-medium flex items-center gap-2"><Crop className="w-4 h-4" /> Crop Area</div>
                        <p className="text-xs text-gray-500 mb-3">Resize the crop box to define the area to keep. Content outside will be removed.</p>

                        {/* Display current page dimensions */}
                        <div className="text-xs text-gray-400 mb-2">
                          Page size: {Math.round(pages[page - 1].width)}×{Math.round(pages[page - 1].height)} pts
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div><label className="text-xs text-gray-500">X (from left)</label><input type="number" value={Math.round(selected.x)} onChange={e => updateEl({ ...selected, x: +e.target.value })} className="input !py-1.5 text-sm w-full" /></div>
                          <div><label className="text-xs text-gray-500">Y (from top)</label><input type="number" value={Math.round(selected.y)} onChange={e => updateEl({ ...selected, y: +e.target.value })} className="input !py-1.5 text-sm w-full" /></div>
                          <div><label className="text-xs text-gray-500">Width</label><input type="number" value={Math.round(selected.width)} onChange={e => updateEl({ ...selected, width: +e.target.value })} className="input !py-1.5 text-sm w-full" /></div>
                          <div><label className="text-xs text-gray-500">Height</label><input type="number" value={Math.round(selected.height)} onChange={e => updateEl({ ...selected, height: +e.target.value })} className="input !py-1.5 text-sm w-full" /></div>
                        </div>

                        <button
                          onClick={() => {
                            const cropEl = selected as CropEl;
                            const pageW = pages[page - 1].width * 1.5; // Scaled page width
                            const pageH = pages[page - 1].height * 1.5; // Scaled page height

                            // The crop PDFElement is in screen coordinates (scaled by 1.5)
                            // Convert back to PDF coordinates by dividing by 1.5
                            const margins = {
                              left: cropEl.x / 1.5,
                              top: cropEl.y / 1.5,
                              right: (pageW - (cropEl.x + cropEl.width)) / 1.5,
                              bottom: (pageH - (cropEl.y + cropEl.height)) / 1.5
                            };
                            handleCrop(margins, page); // Pass current page number for single-page crop
                          }}
                          className="w-full py-2 rounded-lg text-sm flex items-center justify-center gap-1 text-white bg-green-600 hover:bg-green-700 mb-2"
                        >
                          <Crop className="w-4 h-4" /> Apply Crop to This Page Only
                        </button>

                        <button
                          onClick={() => {
                            if (!confirm('Apply this crop to ALL pages? Pages with different sizes may have different results.')) return;
                            const cropEl = selected as CropEl;
                            const pageW = pages[page - 1].width * 1.5;
                            const pageH = pages[page - 1].height * 1.5;

                            const margins = {
                              left: cropEl.x / 1.5,
                              top: cropEl.y / 1.5,
                              right: (pageW - (cropEl.x + cropEl.width)) / 1.5,
                              bottom: (pageH - (cropEl.y + cropEl.height)) / 1.5
                            };
                            handleCrop(margins); // No page number = all pages
                          }}
                          className="w-full py-2 rounded-lg text-sm flex items-center justify-center gap-1 text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Copy className="w-4 h-4" /> Apply Crop to All Pages
                        </button>
                      </div>
                    )}

                    {selected.type === 'watermark' && (
                      <button onClick={applyToAll} className="w-full mb-2 py-2 rounded-lg text-sm flex items-center justify-center gap-1 text-white bg-purple-600 hover:bg-purple-700">
                        <Copy className="w-4 h-4" /> Apply to All Pages
                      </button>
                    )}

                    {/* Layer Ordering */}
                    <div className="mb-4">
                      <label className="text-xs text-gray-500 block mb-2">Layer Order</label>
                      <div className="grid grid-cols-4 gap-1">
                        <button onClick={bringToFront} className="py-2.5 rounded-lg flex flex-col items-center justify-center gap-0.5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }} title="Bring to Front">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 11l5-5 5 5" />
                            <rect x="4" y="14" width="16" height="6" rx="1" fill="currentColor" fillOpacity="0.3" />
                            <rect x="6" y="11" width="12" height="5" rx="1" stroke="currentColor" fill="none" />
                          </svg>
                          <span className="text-[10px]">Front</span>
                        </button>
                        <button onClick={sendToBack} className="py-2.5 rounded-lg flex flex-col items-center justify-center gap-0.5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }} title="Send to Back">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="4" width="16" height="6" rx="1" fill="currentColor" fillOpacity="0.3" />
                            <rect x="6" y="8" width="12" height="5" rx="1" stroke="currentColor" fill="none" />
                            <path d="M7 18l5 5 5-5" />
                          </svg>
                          <span className="text-[10px]">Back</span>
                        </button>
                        <button onClick={sendBackward} className="py-2.5 rounded-lg flex flex-col items-center justify-center gap-0.5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }} title="Send Backward">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="5" y="5" width="14" height="5" rx="1" stroke="currentColor" strokeDasharray="2 2" />
                            <rect x="5" y="12" width="14" height="5" rx="1" fill="currentColor" fillOpacity="0.3" />
                            <path d="M9 20l3 3 3-3" />
                          </svg>
                          <span className="text-[10px]">-1</span>
                        </button>
                        <button onClick={bringForward} className="py-2.5 rounded-lg flex flex-col items-center justify-center gap-0.5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }} title="Bring Forward">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 4l3-3 3 3" />
                            <rect x="5" y="7" width="14" height="5" rx="1" fill="currentColor" fillOpacity="0.3" />
                            <rect x="5" y="14" width="14" height="5" rx="1" stroke="currentColor" strokeDasharray="2 2" />
                          </svg>
                          <span className="text-[10px]">+1</span>
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button onClick={() => updateEl({ ...selected, locked: !selected.locked })} className="flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1 text-gray-300" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {selected.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        {selected.locked ? 'Unlock' : 'Lock'}
                      </button>
                      <button onClick={duplicateEl} className="flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1 text-gray-300" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Copy className="w-4 h-4" /> Duplicate
                      </button>
                    </div>
                    <button onClick={deleteEl} className="w-full mt-2 py-2 rounded-lg text-sm flex items-center justify-center gap-1 text-red-400 hover:bg-red-500/20" style={{ background: 'rgba(239,68,68,0.1)' }}>
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-t text-xs" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(24,24,27,0.95)' }}>
            <div className="flex items-center gap-2">
              <span className={isPremium ? "text-amber-500" : "text-green-500"}>?</span>
              <span className="text-gray-500">{isPremium ? 'Pro Engine' : 'Local Only'}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">{Math.round((pdf?.file?.size || 0) / 1024)} KB</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1 rounded hover:bg-white/10 disabled:opacity-50"><ChevronLeft className="w-4 h-4 text-gray-400" /></button>
              <span className="text-gray-400">{page} / {pages.length}</span>
              <button onClick={() => setPage(p => Math.min(pages.length, p + 1))} disabled={page >= pages.length} className="p-1 rounded hover:bg-white/10 disabled:opacity-50"><ChevronRight className="w-4 h-4 text-gray-400" /></button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-auto bg-[#09090b] relative">
          <WelcomeScreen
            onFileSelect={onReloadFile}
            onFilesSelect={onFilesSelect || (() => { })}
            onConvertFile={onConvertFile}
            onConvertFiles={onConvertFiles}
            isPremium={isPremium}
            onTogglePremium={onTogglePremium}
          />
        </div>
      )
      }


      {/* Modals */}
      {showTextModal && <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowTextModal(false)}><div className="modal" onClick={e => e.stopPropagation()}><h3 className="text-lg font-semibold text-white mb-4">Add Text</h3><textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="Enter text..." className="input mb-4" rows={3} autoFocus /><div className="flex justify-end gap-2"><button onClick={() => setShowTextModal(false)} className="btn-secondary">Cancel</button><button onClick={addText} className="btn-primary"><Check className="w-4 h-4 mr-1" />Add</button></div></div></div>}

      {showSigModal && <SignaturePad onSave={addSignature} onClose={() => setShowSigModal(false)} />}
      {showWatermarkModal && <WatermarkModal onApply={addWatermark} onClose={() => setShowWatermarkModal(false)} />}
      {showSplitModal && <SplitModal pages={pages.length} onSplit={handleSplit} onClose={() => setShowSplitModal(false)} />}
      {showCompressModal && <CompressModal onCompress={handleCompress} onClose={() => setShowCompressModal(false)} />}
      {showAddPageModal && <AddPageModal onAdd={handleAddPage} onClose={() => setShowAddPageModal(false)} />}
      {showReorderModal && <ReorderModal pages={pages.length} onReorder={handleReorder} onClose={() => setShowReorderModal(false)} />}
      {showExtractModal && <ExtractPagesModal pages={pages.length} onExtract={handleExtractPages} onClose={() => setShowExtractModal(false)} />}
      {showPageNumbersModal && <PageNumbersModal pages={pages.length} onApply={handleAddPageNumbers} onClose={() => setShowPageNumbersModal(false)} />}
      {showDeletePagesModal && <DeletePagesModal pages={pages.length} onDelete={handleDeletePages} onClose={() => setShowDeletePagesModal(false)} />}
      {showRotateAllModal && <RotateAllModal onRotate={handleRotateAll} onClose={() => setShowRotateAllModal(false)} />}
      {showProtectModal && <ProtectModal onProtect={handleProtect} onClose={() => setShowProtectModal(false)} />}
      {showBatesModal && <BatesModal onApply={handleBates} onClose={() => setShowBatesModal(false)} />}
      {showInsertModal && <InsertModal onInsert={handleInsertPDF} onClose={() => setShowInsertModal(false)} pageCount={pages.length} />}
      {showCompareModal && <CompareModal onCompare={handleComparePDFs} onClose={() => setShowCompareModal(false)} />}
      {showQRCodeModal && <QRCodeModal onAdd={addQRCode} onClose={() => setShowQRCodeModal(false)} />}
      {showHyperlinkModal && <HyperlinkModal onAdd={addHyperlink} onClose={() => setShowHyperlinkModal(false)} />}
      {showToolGuide && <ToolGuideModal onClose={() => setShowToolGuide(false)} onAction={handleToolAction} />}
      {showMetadataModal && <MetadataModal metadata={{ title: pdf?.pdfLibDoc.getTitle() || '', author: pdf?.pdfLibDoc.getAuthor() || '', subject: pdf?.pdfLibDoc.getSubject() || '', keywords: (pdf?.pdfLibDoc.getKeywords() || '') }} onSave={handleSaveMetadata} onClose={() => setShowMetadataModal(false)} />}
      {showExportImagesModal && <ExportImagesModal pages={pages.length} onExport={handleExportImages} onClose={() => setShowExportImagesModal(false)} />}
      {showHeaderFooterModal && <HeaderFooterModal pages={pages.length} onApply={handleAddHeaderFooter} onClose={() => setShowHeaderFooterModal(false)} />}

      {/* New Enhanced Tool Modals */}
      {showExportTextModal && <ExportTextModal onExport={handleExportText} onClose={() => setShowExportTextModal(false)} />}
      {showTableExtractionModal && <TableExtractionModal onExtract={handleTableExtraction} onClose={() => setShowTableExtractionModal(false)} pageCount={pages.length} />}
      {showTOCModal && <TOCModal onGenerate={handleGenerateTOC} onClose={() => setShowTOCModal(false)} />}

      {/* NEW: Advanced Tool Modals */}
      {
        showCropModal && (
          <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowCropModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Crop className="w-5 h-5" /> Crop PDF Pages</h3>

              {/* Visual Crop Option */}
              <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="text-sm text-green-400 font-medium mb-2">?? Visual Crop (Recommended)</div>
                <p className="text-xs text-gray-400 mb-3">Place a resizable crop box directly on the page. Drag the handles to define the area to keep.</p>
                <button
                  onClick={addCropElement}
                  className="w-full py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium flex items-center justify-center gap-2"
                >
                  <Crop className="w-4 h-4" /> Place Visual Crop Box
                </button>
              </div>

              {/* Manual Crop Option */}
              <div className="border-t border-gray-700 pt-4">
                <div className="text-sm text-gray-400 font-medium mb-2">?? Manual Margins (Advanced)</div>
                <p className="text-xs text-gray-500 mb-3">Enter exact margin values in points (1 inch = 72pt).</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div><label className="text-xs text-gray-500">Top</label><input id="crop-top" type="number" defaultValue={0} className="input" /></div>
                  <div><label className="text-xs text-gray-500">Bottom</label><input id="crop-bottom" type="number" defaultValue={0} className="input" /></div>
                  <div><label className="text-xs text-gray-500">Left</label><input id="crop-left" type="number" defaultValue={0} className="input" /></div>
                  <div><label className="text-xs text-gray-500">Right</label><input id="crop-right" type="number" defaultValue={0} className="input" /></div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowCropModal(false)} className="btn-secondary">Cancel</button>
                  <button onClick={() => handleCrop({
                    top: +(document.getElementById('crop-top') as HTMLInputElement).value || 0,
                    bottom: +(document.getElementById('crop-bottom') as HTMLInputElement).value || 0,
                    left: +(document.getElementById('crop-left') as HTMLInputElement).value || 0,
                    right: +(document.getElementById('crop-right') as HTMLInputElement).value || 0
                  })} className="btn-primary">Apply Manual Crop</button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        showExtractTextModal && (
          <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowExtractTextModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><FileSearch className="w-5 h-5" /> Extract Text from PDF</h3>
              <p className="text-sm text-gray-400 mb-4">Extract all readable text from the PDF document.</p>
              <div className="flex gap-2">
                <button onClick={() => handleExtractText('clipboard')} className="flex-1 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center justify-center gap-2">
                  <Copy className="w-4 h-4" /> Copy to Clipboard
                </button>
                <button onClick={() => handleExtractText('file')} className="flex-1 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Save as .txt File
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        showGrayscaleModal && (
          <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowGrayscaleModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><GrayscaleLogo className="w-6 h-6" /> Convert to Grayscale</h3>
              <p className="text-sm text-gray-400 mb-4">Convert all pages to black and white. This will save a new PDF file.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowGrayscaleModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleGrayscale} className="btn-primary">Convert & Save</button>
              </div>
            </div>
          </div>
        )
      }

      {
        showStickyNoteModal && (
          <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowStickyNoteModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Add Sticky Note</h3>
              <div className="mb-4">
                <label className="text-xs text-gray-500">Note Content</label>
                <textarea id="sticky-content" placeholder="Enter your comment..." className="input" rows={3} />
              </div>
              <div className="mb-4">
                <label className="text-xs text-gray-500">Color</label>
                <div className="flex gap-2 mt-2">
                  {['#fef08a', '#86efac', '#93c5fd', '#fca5a5', '#d8b4fe'].map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        const note = (document.getElementById('sticky-content') as HTMLTextAreaElement)?.value || 'New Note';
                        addStickyNote(note, c);
                        setShowStickyNoteModal(false);
                      }}
                      className="w-8 h-8 rounded shadow-sm hover:scale-110 transition-transform"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowStickyNoteModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        )
      }

      {
        showOCRModal && (
          <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowOCRModal(false)}>
            <div className="modal shadow-2xl overflow-hidden border border-white/10" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <ScanText className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Optical Character Recognition</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">Run high-fidelity OCR to make scanned PDF text fully selectable, searchable, and editable. This process runs entirely in your browser using Tesseract.js.</p>
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button onClick={() => setShowOCRModal(false)} className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={() => handleOCR()} className="flex-[2] py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/25">Run OCR Engine</button>
              </div>
            </div>
          </div>
        )
      }

      {
        showBackgroundModal && (
          <BackgroundModal
            initialColor={pageBackgrounds[page] || '#ffffff'}
            onApply={(color, all) => handleAddBackground(color, all)}
            onClose={() => setShowBackgroundModal(false)}
          />
        )
      }

      {
        showPageSizeModal && (
          <PageSizeModal
            onApply={(w, h, all) => handleChangePageSize(w, h, all)}
            onClose={() => setShowPageSizeModal(false)}
          />
        )
      }

      {
        showMarginsModal && (
          <MarginsModal
            onApply={(margins, all) => handleAdjustMargins(margins, all)}
            onClose={() => setShowMarginsModal(false)}
          />
        )
      }

      {
        showMaterialGallery && (
          <MaterialGallery
            initialCategory={materialGalleryCategory}
            onSelect={handleMaterialSelect}
            onClose={() => setShowMaterialGallery(false)}
          />
        )
      }

      {
        showWordEditor && bakedPdfForOffice && (
          <WordEditor
            pdf={bakedPdfForOffice}
            onClose={() => { setShowWordEditor(false); setBakedPdfForOffice(null); }}
            isPremium={isPremium}
            onDownload={onDownload}
          />
        )
      }

      {
        showExcelExporter && bakedPdfForOffice && (
          <ExcelExporter
            pdf={bakedPdfForOffice}
            onClose={() => { setShowExcelExporter(false); setBakedPdfForOffice(null); }}
            isPremium={isPremium}
            onDownload={onDownload}
          />
        )
      }

      {
        showPowerPointExporter && bakedPdfForOffice && (
          <PowerPointExporter
            pdf={bakedPdfForOffice}
            onClose={() => { setShowPowerPointExporter(false); setBakedPdfForOffice(null); }}
            isPremium={isPremium}
            onDownload={onDownload}
          />
        )
      }

      {
        showEditableWordEditor && pdf && (
          <EditableWordEditor
            pdf={pdf}
            onClose={() => setShowEditableWordEditor(false)}
            onPdfUpdate={(newFile) => onReloadFile(newFile)}
          />
        )
      }

      {
        showAddFieldsPanel && (
          <div className="modal-overlay" style={{ zIndex: 10001 }} onClick={() => setShowAddFieldsPanel(false)}>
            <div className="modal !max-w-sm !p-0 shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
              <AddFieldsPanel
                onAddField={handleAddFormField}
                onClose={() => setShowAddFieldsPanel(false)}
                selectedField={selectedFormField}
                onUpdateField={(field) => {
                  setSelectedFormField(field);
                }}
                onDeleteField={(_fieldId) => {
                  setSelectedFormField(null);
                }}
              />
            </div>
          </div>
        )
      }

      {
        showTableCreator && (
          <div className="modal-overlay" style={{ zIndex: 10001 }} onClick={() => setShowTableCreator(false)}>
            <div className="modal !max-w-2xl !p-0 shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
              <TableCreator
                onInsert={handleAddTable}
                onClose={() => setShowTableCreator(false)}
              />
            </div>
          </div>
        )
      }

      {
        showSignatureCreator && (
          <SignatureCreator
            onSave={handleAddESignature}
            onClose={() => setShowSignatureCreator(false)}
          />
        )
      }

      {/* NEW: 17 Missing Features Modals */}

      {/* Keyboard Shortcuts Panel */}
      {showKeyboardShortcuts && (
        <KeyboardShortcutsPanel onClose={() => setShowKeyboardShortcuts(false)} />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onAction={handleContextMenuAction}
          elementType={selected?.type}
          isLocked={selected?.locked}
        />
      )}

      {/* Templates Panel */}
      {showTemplatesPanel && (
        <TemplatesPanel
          onClose={() => { setShowTemplatesPanel(false); }}
          onSelectTemplate={async (templateId) => {
            setShowTemplatesPanel(false);

            // Generate template PDF content
            try {
              const newPdfDoc = await PDFDocument.create();
              const font = await newPdfDoc.embedFont(StandardFonts.Helvetica);
              const boldFont = await newPdfDoc.embedFont(StandardFonts.HelveticaBold);

              // Template configurations
              const templates: Record<string, { title: string; content: string[] }> = {

                // Business
                'contract': {
                  title: 'MASTER SERVICE AGREEMENT',
                  content: [
                    'THIS AGREEMENT is made effective as of [EFFECTIVE DATE]',
                    'BETWEEN: [COMPANY NAME] ("Provider")',
                    'AND: [CLIENT NAME] ("Client")',
                    '',
                    '1. SERVICES & DELIVERABLES',
                    'Provider shall perform the services described in Exhibit A. All work product shall be',
                    'delivered according to the agreed timeline. Client shall have 5 days to review.',
                    '',
                    '2. COMPENSATION & PAYMENT',
                    'Provider shall invoice Client on a [MONTHLY/MILESTONE] basis. Payment is due',
                    'within 30 days of invoice date. Late payments accrue interest at 1.5% per month.',
                    '',
                    '3. INTELLECTUAL PROPERTY',
                    'Upon full payment, all deliverables created specifically for Client shall be owned',
                    'by Client. Provider retains ownership of its pre-existing tools and methodologies.',
                    '',
                    '4. CONFIDENTIALITY',
                    'Each party agrees to maintain the confidentiality of the other party\'s proprietary',
                    'information and not to disclose such information to any third party.',
                    '',
                    '5. TERMINATION',
                    'Either party may terminate this agreement with 30 days written notice. Client',
                    'shall pay for all services performed up to the date of termination.',
                    '',
                    '__________________________          __________________________',
                    'Provider Authorized Signature        Client Authorized Signature',
                  ]
                },
                'nda': {
                  title: 'NON-DISCLOSURE AGREEMENT (NDA)',
                  content: [
                    '1. PURPOSE: The parties wish to explore a business relationship and may',
                    'disclose "Confidential Information" relating to their technology and business.',
                    '',
                    '2. DEFINITION: Confidential Information means any non-public information,',
                    'whether oral or written, disclosed by a party to the receiving party.',
                    '',
                    '3. EXCLUSIONS: Confidential Information does not include information that',
                    'is already public, independently developed, or obtained from third parties.',
                    '',
                    '4. OBLIGATIONS: The receiving party shall:',
                    '• Use at least a reasonable degree of care to protect the information.',
                    '• Use the information ONLY for the purpose of the business evaluation.',
                    '• Limit access to employees with a specific "need to know".',
                    '',
                    '5. TERM: This agreement shall remain in effect for 3 years from disclosure.',
                    '',
                    '__________________________          __________________________',
                    'Disclosing Party Signature          Receiving Party Signature',
                  ]
                },
                'invoice': {
                  title: 'PROFESSIONAL INVOICE',
                  content: [
                    'Invoice ID: INV-2024-[001]             Issue Date: [DATE]',
                    '                                       Due Date: [DATE + 30]',
                    '',
                    'FROM:                                  BILL TO:',
                    '[YOUR COMPANY NAME]                    [CLIENT NAME]',
                    '[ADDRESS LINE 1]                       [CLIENT ADDRESS]',
                    '[EMAIL / PHONE]                        [CLIENT CONTACT]',
                    '',
                    '-------------------------------------------------------------------',
                    'DESCRIPTION                            QTY      RATE        TOTAL',
                    '-------------------------------------------------------------------',
                    '[Service/Product Description 1]        1.0      $0.00       $0.00',
                    '[Service/Product Description 2]        1.0      $0.00       $0.00',
                    '-------------------------------------------------------------------',
                    '                                       SUBTOTAL:    $0.00',
                    '                                       TAX (0%):    $0.00',
                    '                                       TOTAL DUE:   $0.00',
                    '',
                    'PAYMENT TERMS: Please make checks payable to "[YOUR NAME]".',
                    'Wiring instructions: [Bank Name] | Acc: [Number] | Routing: [Number]',
                  ]
                },
                'offer-letter': {
                  title: 'EMPLOYMENT OFFER LETTER',
                  content: [
                    'Date: [DATE]',
                    '',
                    'Dear [CANDIDATE NAME],',
                    '',
                    'We are pleased to offer you the position of [JOB TITLE] at [COMPANY NAME].',
                    'We were impressed with your background and believe you will be a great asset.',
                    '',
                    'TERMS OF EMPLOYMENT:',
                    '• Reporting to: [MANAGER NAME]',
                    '• Start Date: [START DATE]',
                    '• Salary: $[AMOUNT] per year, paid bi-weekly',
                    '',
                    'BENEFITS:',
                    'You will be eligible for our standard benefits package, including medical insurance,',
                    '401(k) matching, and [NUMBER] days of Paid Time Off (PTO) annually.',
                    '',
                    'CONTINGENCIES:',
                    'This offer is contingent upon successful completion of a background check.',
                    '',
                    'To accept this offer, please sign and return this letter by [EXPIRATION DATE].',
                    '',
                    'Sincerely,                      Accepted By:',
                    '',
                    '[HIRING MANAGER]                __________________________',
                    '[COMPANY NAME]                 [CANDIDATE NAME]',
                  ]
                },
                'proposal': {
                  title: 'PROJECT PROPOSAL & ESTIMATE',
                  content: [
                    'PREPARED FOR: [CLIENT NAME]             DATE: [DATE]',
                    'PREPARED BY: [YOUR NAME/COMPANY]',
                    '',
                    'EXECUTIVE SUMMARY:',
                    'Our team proposes to solve [Problem] by implementing [Solution]. This',
                    'approach will deliver [Benefit 1] and [Benefit 2].',
                    '',
                    'SCOPE OF WORK:',
                    '• Phase 1: Research and Analysis ([Timeline])',
                    '• Phase 2: Design and Prototyping ([Timeline])',
                    '• Phase 3: Implementation and Testing ([Timeline])',
                    '',
                    'INVESTMENT:',
                    'Development Fee: $[Amount]',
                    'Licensing & Support: $[Amount]',
                    '',
                    'APPROVAL:',
                    'Signature: __________________________   Date: __________',
                  ]
                },
                'letterhead': {
                  title: '[COMPANY NAME/LOGO]',
                  content: [
                    '[Street Address, City, State ZIP]',
                    'W: [Website] | E: [Email] | P: [Phone]',
                    '',
                    '-------------------------------------------------------------------',
                    '',
                    '[DATE]',
                    '',
                    '[RECIPIENT NAME]',
                    '[RECIPIENT ADDRESS]',
                    '',
                    'Dear [Name],',
                    '',
                    '[Enter the body of your letter here. This professional letterhead template',
                    'is designed to look clean and modern for any corporate correspondence.]',
                    '',
                    'Best Regards,',
                    '',
                    '__________________________',
                    '[Your Printed Name]',
                  ]
                },
                'press-release': {
                  title: 'FOR IMMEDIATE RELEASE',
                  content: [
                    'Contact: [Name] | [Email] | [Phone]',
                    'Headline: [CATCHY AND DESCRIPTIVE HEADLINE]',
                    '',
                    '[CITY, State] — [Date] — [Lead paragraph: Who, what, when, where, why]',
                    '',
                    '[Body paragraph 1: Details of the announcement, quotes from executives]',
                    '[Body paragraph 2: Additional context or background information]',
                    '',
                    '###',
                    '',
                    'About [Company Name]:',
                    '[Boilerplate description of your company.]',
                  ]
                },
                'meeting-minutes': {
                  title: 'MEETING MINUTES: [MEETING NAME]',
                  content: [
                    'Date: [DATE]                           Time: [TIME]',
                    'Location: [LOCATION]                   Facilitator: [NAME]',
                    '',
                    'ATTENDEES: [List of participants]',
                    '',
                    'AGENDA ITEMS:',
                    '1. [Agenda Item 1]: [Summary of discussion and outcomes]',
                    '2. [Agenda Item 2]: [Summary of discussion and outcomes]',
                    '',
                    'ACTION ITEMS:',
                    '• [Task] – [Assigned To] – [Due Date]',
                    '• [Task] – [Assigned To] – [Due Date]',
                    '',
                    'NEXT MEETING: [Date/Time/Location]',
                  ]
                },
                'strategic-plan': {
                  title: 'STRATEGIC BUSINESS PLAN',
                  content: [
                    'I. EXECUTIVE SUMMARY',
                    '[Provide a high-level overview of the company\'s goals and strategy.]',
                    '',
                    'II. MISSION & VISION',
                    'Mission: [Our purpose and what we do.]',
                    'Vision:  [Where we want to be in 5-10 years.]',
                    '',
                    'III. SWOT ANALYSIS',
                    'Strengths: [List strengths]      Weaknesses: [List weaknesses]',
                    'Opportunities: [List]             Threats: [List]',
                    '',
                    'IV. KEY OBJECTIVES (OKRs)',
                    'Objective 1: [Strategic Goal]',
                    '  - KR 1: [Measurable Result]',
                    '  - KR 2: [Measurable Result]',
                    '',
                    'V. EXECUTION ROADMAP',
                    '[Outline the timeline for key initiatives.]',
                  ]
                },


                // Personal
                'resume': {
                  title: '[YOUR FULL NAME]',
                  content: [
                    '[Professional Title] | [City, State]',
                    '[Phone Number] | [Professional Email]',
                    '',
                    'OBJECTIVE',
                    'Results-oriented professional with experience seeking to contribute to [Company].',
                    '',
                    'EXPERIENCE',
                    '[Current Job Title] | [Company Name] | [Dates]',
                    '• Led a team to achieve [Specific Metric/Result].',
                    '• Developed [Project Name] which resulted in [Percentage] improvement.',
                    '',
                    'EDUCATION',
                    '[Degree Name] | [University Name] | [Graduation Year]',
                    '',
                    'SKILLS',
                    '[Skill 1], [Skill 2], [Skill 3]',
                  ]
                },
                'cover-letter': {
                  title: 'COVER LETTER',
                  content: [
                    '[Your Name]',
                    '[Your Address]',
                    '',
                    '[Date]',
                    '',
                    '[Hiring Manager Name]',
                    '[Company Name]',
                    '',
                    'Dear [Hiring Manager Name],',
                    '',
                    'I am writing to express my interest in the [Position] role...',
                    '',
                    '[Body of your cover letter expressing qualifications and enthusiasm]',
                    '',
                    'Sincerely,',
                    '',
                    '[Your Name]',
                  ]
                },
                'expense-track': {
                  title: 'MONTHLY EXPENSE TRACKER',
                  content: [
                    'MONTH: _______________                 YEAR: _______________',
                    '',
                    'DATE      CATEGORY        DESCRIPTION            AMOUNT',
                    '-------------------------------------------------------------------',
                    '[01]      Housing         Rent/Mortgage          $0.00',
                    '[05]      Food            Grocery Store          $0.00',
                    '-------------------------------------------------------------------',
                    '                                 TOTAL SPENT:    $0.00',
                  ]
                },
                'gift-cert': {
                  title: 'GIFT CERTIFICATE',
                  content: [
                    '',
                    'PRESENTED TO: [Recipient Name]',
                    '------------------------------------------',
                    'AMOUNT: [VALUE/SERVICE]',
                    '------------------------------------------',
                    '',
                    'FROM: [Sender Name]',
                    'DATE: [Date Issued]              EXPIRES: [Date]',
                    '',
                    'REDEEMABLE AT: [Your Business Name]',
                    'TERMS: [Non-refundable, not valid for cash, etc.]',
                    '',
                    'CERTIFICATE ID: [Serial Number]',
                  ]
                },
                'invitation': {
                  title: 'YOU ARE CORDIALLY INVITED',
                  content: [
                    '',
                    'Please join us for a celebration in honor of',
                    '[GUEST OF HONOR / EVENT TYPE]',
                    '',
                    'DATE: [Date of Event]',
                    'TIME: [Time of Event]',
                    '',
                    'LOCATION:',
                    '[Venue Name]',
                    '[Venue Address]',
                    '',
                    'RSVP BY: [Date] to [Contact Name]',
                    'DRESS CODE: [Optional: Semi-formal, etc.]',
                  ]
                },
                'membership': {
                  title: 'MEMBERSHIP APPLICATION',
                  content: [
                    'ORGANIZATION: [Group Name]',
                    '',
                    'PERSONAL INFORMATION:',
                    'Name: [Full Name]',
                    'Address: [Street, City, State, ZIP]',
                    'Email: [Email Address]          Phone: [Phone Number]',
                    '',
                    'MEMBERSHIP LEVEL:',
                    '[ ] Standard     [ ] Premium     [ ] Student/Senior',
                    '',
                    'DECLARATION:',
                    'I agree to abide by the rules and bylaws of [Organization].',
                    '',
                    'Signature: __________________________   Date: [DATE]',
                  ]
                },


                // Legal
                'lease': {
                  title: 'RESIDENTIAL LEASE AGREEMENT',
                  content: [
                    'This Lease Agreement is entered into on [DATE]',
                    '',
                    'LANDLORD: [Name]',
                    'TENANT: [Name]',
                    'PROPERTY: [Address]',
                    '',
                    '1. TERM: From [START DATE] to [END DATE]',
                    '',
                    '2. RENT: $[AMOUNT] per month, due on the 1st of each month',
                    '',
                    '3. SECURITY DEPOSIT: $[AMOUNT]',
                    '',
                    '____________________       ____________________',
                    'Landlord Signature          Tenant Signature',
                  ]
                },
                'power-attorney': {
                  title: 'POWER OF ATTORNEY',
                  content: [
                    'I, [PRINCIPAL NAME], hereby appoint [AGENT NAME]',
                    'as my Attorney-in-Fact to act in my name and on my behalf.',
                    '',
                    'POWERS GRANTED:',
                    '• Financial decisions',
                    '• Legal matters',
                    '',
                    'This Power of Attorney shall become effective immediately.',
                    '',
                    '____________________       ____________________',
                    'Principal Signature         Date',
                  ]
                },
                'will': {
                  title: 'LAST WILL AND TESTAMENT',
                  content: [
                    'I, [FULL LEGAL NAME], declare this my Last Will.',
                    '',
                    '1. EXECUTOR: I appoint [NAME] as Executor.',
                    '',
                    '2. BEQUESTS: I give [Item] to [Beneficiary].',
                    '',
                    'Signed: ____________________  Date: ____________',
                  ]
                },
                'partnership-agreement': {
                  title: 'PARTNERSHIP AGREEMENT',
                  content: [
                    'THIS PARTNERSHIP is entered into on [DATE] between:',
                    '[Partner 1 Name] and [Partner 2 Name]',
                    '',
                    '1. NAME AND BUSINESS: The partnership shall be known as [Business Name].',
                    'The principal place of business shall be [Address].',
                    '',
                    '2. CAPITAL CONTRIBUTIONS:',
                    '[Partner 1]: $[Amount]           [Partner 2]: $[Amount]',
                    '',
                    '3. PROFIT AND LOSS: Partners shall share profits and losses equally',
                    'unless otherwise specified in a separate schedule.',
                    '',
                    '4. MANAGEMENT AND VOTING: Partners shall have equal rights in management.',
                    'Major decisions require unanimous consent.',
                    '',
                    '5. TERMINATION: The partnership may be dissolved by written agreement.',
                    '',
                    '____________________       ____________________',
                    'Partner 1 Signature         Partner 2 Signature',
                  ]
                },
                'consulting-agreement': {
                  title: 'CONSULTING SERVICES AGREEMENT',
                  content: [
                    'CLIENT: [Client Name]           CONSULTANT: [Your Name]',
                    '',
                    '1. SCOPE OF SERVICES: Consultant agrees to provide [Description of Services].',
                    '',
                    '2. TERM: This agreement starts on [Start Date] and ends on [End Date].',
                    '',
                    '3. COMPENSATION: Client shall pay Consultant $[Rate] per [Hour/Project].',
                    'Payments are due net 15 days from invoice.',
                    '',
                    '4. INDEPENDENT CONTRACTOR: Consultant is an independent contractor,',
                    'not an employee. No benefits or tax withholdings shall be provided.',
                    '',
                    '____________________       ____________________',
                    'Client Signature            Consultant Signature',
                  ]
                },
                'affidavit': {
                  title: 'SWORN AFFIDAVIT',
                  content: [
                    'STATE OF [STATE]   )   COUNTY OF [COUNTY]   )',
                    '',
                    'I, [AFFIANT NAME], residing at [Address],',
                    'being duly sworn, depose and say as follows:',
                    '',
                    '1. [Statement of Fact 1]',
                    '2. [Statement of Fact 2]',
                    '3. [Statement of Fact 3]',
                    '',
                    'I certify under penalty of perjury that the foregoing is true and correct.',
                    '',
                    'Signature: __________________________   Date: [DATE]',
                    '',
                    'NOTARY PUBLIC ACKNOWLEDGMENT',
                    'Subscribed and sworn to before me this ____ day of ________, 20__.',
                    '__________________________ (Notary Signature)',
                  ]
                },


                // Education
                'certificate': {
                  title: 'CERTIFICATE OF ACHIEVEMENT',
                  content: [
                    '',
                    'GLOBAL INSTITUTE OF EXCELLENCE',
                    '',
                    'This Honor is Bestowed Upon',
                    '------------------------------------------',
                    '[RECIPIENT FULL NAME]',
                    '------------------------------------------',
                    '',
                    'For Successful Completion of [PROGRAM NAME]',
                    '',
                    'Awarded this day, [DATE]',
                  ]
                },
                'syllabus': {
                  title: 'COURSE SYLLABUS: [COURSE NAME]',
                  content: [
                    'INSTRUCTOR: [NAME]                     SEMESTER: [TERM/YEAR]',
                    '',
                    'COURSE DESCRIPTION: [Description]',
                    '',
                    'GRADING POLICY:',
                    '• Assignments: 40% | Midterm: 30% | Final Exam: 30%',
                  ]
                },
                'report-card': {
                  title: 'STUDENT REPORT CARD',
                  content: [
                    'Student: _________________________    Grade: ___________',
                    '',
                    '-------------------------------------------------------------------',
                    'Subject                    Grade      Comments',
                    '-------------------------------------------------------------------',
                    'Mathematics                 ___',
                    'Science                     ___',
                    '-------------------------------------------------------------------',
                    '',
                    'Teacher: _______________  Date: ________',
                  ]
                },
                'lesson-plan': {
                  title: 'DAILY LESSON PLAN',
                  content: [
                    'SUBJECT: [Subject]              GRADE LEVEL: [Grade]',
                    'TOPIC: [Lesson Title]           DATE: [Date]',
                    '',
                    'LEARNING OBJECTIVES:',
                    '• Students will be able to [Objective 1]',
                    '• Students will be able to [Objective 2]',
                    '',
                    'MATERIALS NEEDED:',
                    '[ ] [Material 1]    [ ] [Material 2]',
                    '',
                    'PROCEDURE:',
                    '1. Introduction ([Time]): [Hook or Bell Ringer]',
                    '2. Direct Instruction ([Time]): [Lecture/Activity]',
                    '3. Guided Practice ([Time]): [Group Work]',
                    '4. Independent Practice ([Time]): [Quiz/Assignment]',
                    '',
                    'ASSESSMENT: [How learning will be measured]',
                  ]
                },
                'transcript': {
                  title: 'OFFICIAL ACADEMIC TRANSCRIPT',
                  content: [
                    'INSTITUTION: [University/School Name]',
                    'STUDENT: [Full Name]                STUDENT ID: [ID Number]',
                    '',
                    'ACADEMIC RECORD:',
                    'COURSE CODE | COURSE TITLE                      | GRADE | CREDITS',
                    '-------------------------------------------------------------------',
                    'CS-101      | Introduction to Computing       | A     | 3.0',
                    'MA-201      | Advanced Calculus               | B+    | 4.0',
                    '-------------------------------------------------------------------',
                    'CUMULATIVE GPA: [3.85]              TOTAL CREDITS: [120]',
                    '',
                    'REGISTRAR SIGNATURE: ____________________   DATE: [DATE]',
                  ]
                },


                // Healthcare
                'medical-history': {
                  title: 'CONFIDENTIAL MEDICAL HISTORY',
                  content: [
                    'PATIENT: [NAME]                         DOB: [MM/DD/YYYY]',
                    '',
                    'MEDICAL CONDITIONS:',
                    '[ ] Diabetes    [ ] Hypertension   [ ] Asthma',
                    '',
                    'CURRENT MEDICATIONS: [List here]',
                    '',
                    'Signature: __________________________   Date: [DATE]',
                  ]
                },
                'treatment-consent': {
                  title: 'INFORMED CONSENT FOR TREATMENT',
                  content: [
                    'PATIENT: [NAME]                         PROCEDURE: [NAME]',
                    '',
                    'I hereby authorize the treatment described above.',
                    '',
                    'Patient Signature: _______________  Date: _________',
                  ]
                },
                'prescription': {
                  title: 'MEDICAL PRESCRIPTION (RX)',
                  content: [
                    'DR. [DOCTOR NAME]               LICENSE #: [NUMBER]',
                    '[CLINIC/HOSPITAL NAME]',
                    '[ADDRESS / PHONE]',
                    '',
                    'PATIENT: [Full Name]                DOB: [MM/DD/YYYY]',
                    'DATE: [Date of Issue]',
                    '',
                    '?:',
                    '[Medication Name] [Dosage]',
                    'SIG: [Instructions: e.g., Take 1 tablet by mouth daily]',
                    'QTY: [Quantity]                     REFILLS: [Number]',
                    '',
                    'Signature: __________________________',
                    '[Security Watermark Area]',
                  ]
                },
                'medical-report': {
                  title: 'CLINICAL EVALUATION REPORT',
                  content: [
                    'PATIENT ID: [Number]                REPORT DATE: [Date]',
                    'PHYSICIAN: [Doctor Name]           FACILITY: [Hospital]',
                    '',
                    'CHIEF COMPLAINT:',
                    '[Patient description of symptoms]',
                    '',
                    'OBSERVATIONS & VITAL SIGNS:',
                    'Temp: [__] F   BP: [___/___]   Heart Rate: [___] bpm',
                    '',
                    'DIAGNOSIS:',
                    '[Clinical findings and diagnosis]',
                    '',
                    'RECOMMENDED TREATMENT PLAN:',
                    '1. [Instruction 1]',
                    '2. [Instruction 2]',
                    '',
                    'FOLLOW-UP: [Date/Time]',
                  ]
                },


                // Travel
                'itinerary': {
                  title: 'TRAVEL ITINERARY',
                  content: [
                    'TRIP TO: [DESTINATION]                  DATES: [START] TO [END]',
                    '',
                    'FLIGHT: [Airline] #[Number] | [Dep. Time]',
                    'HOTEL:  [Hotel Name] | [Confirmation #]',
                    '',
                    'EMERGENCY CONTACT: [Name] | [Phone]',
                  ]
                },
                'travel-consent': {
                  title: 'CONSENT FOR MINOR TRAVEL',
                  content: [
                    'I, [PARENT NAME], legal guardian of [CHILD NAME],',
                    'grant permission for my child to travel with [TRAVELER NAME].',
                    '',
                    'DATES: [START] to [END]',
                    '',
                    'Signature: __________________________   Date: [DATE]',
                  ]
                },
                'packing-list': {
                  title: 'TRAVEL PACKING LIST',
                  content: [
                    'TRIP: [Destination]             DATES: [Start] - [End]',
                    '',
                    'CLOTHING:                           DOCUMENTS:',
                    '[ ] [Shirt/Pants]                 [ ] Passport / ID',
                    '[ ] [Underwear]                   [ ] Travel Insurance',
                    '[ ] [Shoes]                       [ ] Boarding Passes',
                    '',
                    'TOILETRIES:                         ELECTRONICS:',
                    '[ ] [Toothbrush]                  [ ] Laptop / Tablet',
                    '[ ] [Shampoo]                     [ ] Chargers / Adapters',
                    '',
                    'OTHER ESSENTIALS:',
                    '[ ] [Medication]                  [ ] [Cash/Credit Cards]',
                  ]
                },
                'visa-support': {
                  title: 'VISA SPONSORSHIP SUPPORT LETTER',
                  content: [
                    'Date: [DATE]',
                    'To: [Embassy/Consulate Name]',
                    'Ref: Visa Application for [Applicant Full Name]',
                    '',
                    'Dear Honorable Consular Officer,',
                    '',
                    'I, [Sponsor Name], confirm that I am sponsoring [Applicant Name] ',
                    'for their visit to [Country] from [Start Date] to [End Date].',
                    '',
                    'PURPOSE: [e.g., Tourism / Family Visit / Business Meeting]',
                    '',
                    'I certify that I will provide financial support, including travel ',
                    'expenses, accommodation, and insurance during their stay.',
                    '',
                    'Sponsor Signature: ____________________',
                    'Sponsor Address: [Address] | Phone: [Number]',
                  ]
                },

              };

              const template = templates[templateId] || {
                title: templateId.toUpperCase().replace(/-/g, ' '),
                content: ['This is a template document.', '', 'Add your content here.']
              };

              // Create a page
              const page = newPdfDoc.addPage([612, 792]); // Letter size
              let y = 720;

              // Title
              page.drawText(template.title, {
                x: 72,
                y,
                size: 24,
                font: boldFont,
                color: rgb(0.1, 0.1, 0.1),
              });
              y -= 40;

              // Content
              for (const line of template.content) {
                if (y < 72) {
                  // Add new page if needed
                  newPdfDoc.addPage([612, 792]);
                  y = 720;
                }
                page.drawText(line, {
                  x: 72,
                  y,
                  size: 12,
                  font: line.startsWith('?') || line.includes('?') ? boldFont : font,
                  color: rgb(0.2, 0.2, 0.2),
                });
                y -= 20;
              }

              // Save and load
              const pdfBytes = await newPdfDoc.save();
              const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
              const file = new File([blob], `${templateId}_template.pdf`, { type: 'application/pdf' });

              // Load into editor
              onReloadFile(file);

            } catch (e) {
              console.error('Failed to generate template:', e);
              alert('Failed to generate template');
            }
          }}
        />
      )}

      {/* Stamps Library */}
      {showStampsLibrary && (
        <StampsLibrary
          onClose={() => setShowStampsLibrary(false)}
          onSelectAsset={(asset) => {
            // Add stamp as text PDFElement with proper positioning and styling
            const pageData = pages[page - 1] || { width: 595, height: 842 };
            // Coordinate system is 1.5 * points, so we factor that in
            const centerX = (pageData.width * 1.5) / 2 - 100;
            const centerY = (pageData.height * 1.5) / 2 - 25;

            let newEl: PDFElement;

            if (asset.type === 'stamp' || asset.type === 'text') {
              // Create a proper TextEl that matches the interface
              newEl = {
                id: crypto.randomUUID(),
                type: 'text' as const,
                x: centerX,
                y: centerY,
                width: 200,
                height: 50,
                rotation: asset.type === 'stamp' ? -15 : 0,
                opacity: 0.9,
                locked: false,
                visible: true,
                zIndex: 40,
                content: asset.content, // TextEl uses 'content' not 'text'
                fontSize: 32,
                fontFamily: 'Helvetica',
                color: asset.type === 'stamp' ? '#dc2626' : '#000000',
                textAlign: 'center',
                bold: true,
                italic: false,
              };
            } else if (asset.type === 'image' && asset.content) {
              // For image assets, add as image PDFElement
              newEl = {
                id: crypto.randomUUID(),
                type: 'image' as const,
                x: centerX,
                y: centerY,
                width: 150,
                height: 100,
                rotation: 0,
                opacity: 1,
                locked: false,
                visible: true,
                zIndex: 40,
                src: asset.content,
              };
            } else {
              setShowStampsLibrary(false);
              return;
            }

            // Update local state
            const newElements = { ...elements, [page]: [...(elements[page] || []), newEl] };
            setElements(newElements);
            setSelected(newEl);
            setTool('select');

            // Sync with parent state
            safelyUpdatePdf({ elements: newElements });
            pushHistory();

            setShowStampsLibrary(false);
          }}
        />
      )}

      {/* Visual PDF Compare */}
      {showVisualCompare && (
        <VisualCompare
          onClose={() => setShowVisualCompare(false)}
          onDownload={onDownload}
        />
      )}

      {/* Version History */}
      {showVersionHistory && pdf?.file && (
        <VersionHistoryPanel
          documentId={pdf.name}
          currentDocumentData={new ArrayBuffer(0)} // Will be loaded on demand
          onRestore={async (data) => {
            try {
              const pdfLibDoc = await PDFDocument.load(data, { ignoreEncryption: true });
              const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(data) }).promise;
              safelyUpdatePdf({ pdfLibDoc, pdfDoc });
            } catch (e) {
              console.error('Restore failed:', e);
            }
          }}
          onClose={() => setShowVersionHistory(false)}
        />
      )}

      {/* Accessibility Panel */}
      {showAccessibilityPanel && pdf?.pdfLibDoc && pdf?.pdfDoc && (
        <AccessibilityPanel
          pdfLibDoc={pdf.pdfLibDoc}
          pdfDoc={pdf.pdfDoc}
          onClose={() => setShowAccessibilityPanel(false)}
          onApplyFix={(fix) => {
            console.log('Applied fix:', fix);
          }}
        />
      )}

      {/* Bulk Stamp Modal */}
      {showBulkStampModal && (
        <BulkStampModal
          totalPages={pages.length}
          onApply={handleApplyBulkStamp}
          onClose={() => setShowBulkStampModal(false)}
        />
      )}

      {/* Advanced Export Modal */}
      {showAdvancedExport && bakedPdfForAdvanced && (
        <AdvancedExportModal
          pdfLibDoc={bakedPdfForAdvanced.pdfLibDoc}
          pdfDoc={bakedPdfForAdvanced.pdfDoc}
          fileName={bakedPdfForAdvanced.name}
          onDownload={onDownload}
          onClose={() => { setShowAdvancedExport(false); setBakedPdfForAdvanced(null); }}
        />
      )}

      {/* FDF Import Modal */}
      {showFDFImport && pdf?.pdfLibDoc && (
        <FDFImportModal
          pdfLibDoc={pdf.pdfLibDoc}
          onImport={() => {
            // Refresh the view after importing form data
            setShowFDFImport(false);
          }}
          onClose={() => setShowFDFImport(false)}
        />
      )}

      {/* Guided Tour (First-Time Users) */}
      {showGuidedTour && (
        <GuidedTour
          onComplete={handleTourComplete}
          onSkip={() => {
            localStorage.setItem('pdf-studio-tour-complete', 'true');
            setShowGuidedTour(false);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const [tabs, setTabs] = useState<PDFTab[]>([{ id: 'tab-1', title: 'New Tab', pdf: null }]);
  const [activeTabId, setActiveTabId] = useState<string | null>('tab-1');

  // Handle URL tool parameters (Deep Linking)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tool = params.get('tool');
    if (tool) {
      setTimeout(() => {
        if (tool === 'merge') setShowMerge(true);
        else if (tool === 'jpg-to-pdf' || tool === 'image-to-pdf') setShowImageToPDF(true);
        else if (tool === 'convert-pdf' || tool === 'pdf-to-word' || tool === 'pdf-to-excel' || tool === 'pdf-to-ppt') {
          // For converters that require file upload first, we can guide the user
          // Or rely on the general convert button if available
          // But for now, we just handle the modals we have
        }
      }, 500);
    }
  }, [location.search]);

  // Handle incoming file from standalone tools
  useEffect(() => {
    if (location.state?.incomingFile || location.state?.incomingFiles) {
      const file = location.state.incomingFile;
      const files = location.state.incomingFiles;

      // Small delay to ensure refs are connected
      setTimeout(() => {
        if (files && files.length > 1) {
          // Multiple files - currently only image-to-pdf supports this in workplace
          handleImageToPDF(files);
        } else if (file) {
          const fileName = file.name.toLowerCase();
          if (fileName.endsWith('.pdf')) {
            loadFile(file);
          } else {
            handleConvertFile(file);
          }
        }
      }, 100);

      // Clear state so we don't reload on every mount
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<{ file: File | Blob; fileName: string } | null>(null);
  const [showMerge, setShowMerge] = useState(false);
  const [showImageToPDF, setShowImageToPDF] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [savedSession, setSavedSession] = useState<PersistentState | null>(null);
  const [isPremium, setIsPremium] = useState(true);
  const handleTogglePremium = useCallback(() => setIsPremium(p => !p), []);

  const handleTriggerDownload = useCallback((file: File | Blob, fileName: string) => {
    setDownloadInfo({ file, fileName });
  }, []);

  const handleShare = useCallback(async (fileToShare: File | Blob, fileName: string) => {
    // Ensure we have a File object with correct type for sharing
    const file = fileToShare instanceof File
      ? fileToShare
      : new File([fileToShare], fileName, { type: fileToShare.type || 'application/pdf' });

    if (navigator.share) {
      try {
        // Double check if this browser can share these specific files
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: fileName,
            text: `Document processed with PDF PhD: ${fileName}`,
          });
          return;
        }

        // Fallback for browsers that support sharing but not file sharing
        await navigator.share({
          title: fileName,
          text: `Download ${fileName}`,
          url: window.location.href, // Sharing the app URL as context
        });
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          console.error('Sharing failed:', e);
          // Don't alert here, fall through to clipboard fallback
        } else {
          return; // User cancelled
        }
      }
    }

    // Fallback: Copy name to clipboard and notify
    try {
      await navigator.clipboard.writeText(fileName);
      alert('File name copied to clipboard. Direct file sharing is not supported on this device/browser.');
    } catch {
      alert('Sharing is not supported on this browser.');
    }
  }, []);

  const handleCompress = useCallback(async (fileToCompress: File | Blob) => {
    setLoading(true);
    setProgress('Compressing PDF...');
    try {
      const arrayBuffer = await fileToCompress.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      // Optimization: useObjectStreams and simple resave can often reduce size of unoptimized PDFs
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });
      const compressedBlob = new Blob([compressedBytes as any], { type: 'application/pdf' });
      const currentName = fileToCompress instanceof File ? fileToCompress.name : 'document.pdf';
      const newName = currentName.includes('_compressed') ? currentName : currentName.replace('.pdf', '_compressed.pdf');
      const compressedFile = new File([compressedBlob], newName, { type: 'application/pdf' });
      handleTriggerDownload(compressedFile, newName);
    } catch (e) {
      console.error('Compression failed:', e);
      setError('Failed to compress document. It might already be optimized or is non-standard.');
    } finally {
      setLoading(false);
      setProgress('');
    }
  }, [handleTriggerDownload]);

  const activeTab = tabs.find(t => t.id === activeTabId) || null;
  const pdf = activeTab?.pdf || null;

  const convertFileRef = useRef<any>(null);

  const handleUpdateActiveTabPdf = useCallback((updates: Partial<LoadedPDF>) => {
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId && t.pdf) {
        const updatedPdf = { ...t.pdf, ...updates };
        return { ...t, pdf: updatedPdf, title: updatedPdf.name };
      }
      return t;
    }));
  }, [activeTabId]);

  const handleNewTab = useCallback(() => {
    const newTab: PDFTab = { id: genTabId(), title: 'New Tab', pdf: null };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const handleCloseTab = useCallback((id: string) => {
    setTabs(prev => {
      const next = prev.filter(t => t.id !== id);
      const idx = prev.findIndex(t => t.id === id);
      let nextActiveId = activeTabId;

      if (activeTabId === id) {
        if (next.length > 0) {
          const newActive = next[Math.min(idx, next.length - 1)];
          nextActiveId = newActive.id;
        } else {
          nextActiveId = null;
        }
      }
      setActiveTabId(nextActiveId);
      return next;
    });
  }, [activeTabId]);

  const handleSwitchTab = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);


  // Auto-restore session on mount (no modal prompt)
  useEffect(() => {
    const autoRestoreSession = async () => {
      // Emergency Reset via URL parameter
      if (window.location.search.includes('reset=true')) {
        console.warn('??? Resetting application state as requested...');
        await persistenceService.clearState();
        window.history.replaceState({}, document.title, "/");
        return;
      }

      // Safety timeout - if restore takes too long, clear state and start fresh
      const timeoutId = setTimeout(() => {
        console.warn('?? Session restore timed out. Starting fresh...');
        setLoading(false);
        setProgress('');
        persistenceService.clearState().catch(console.error);
      }, 10000); // 10 second timeout

      try {
        const state = await persistenceService.loadState();
        if (state && state.tabs && state.tabs.length > 0) {
          setLoading(true);
          setProgress('Recovering your workspace...');

          const restoredTabs: PDFTab[] = [];

          for (const t of state.tabs) {
            if (!t.fileData) continue;
            try {
              const file = new File([t.fileData], t.fileName, { type: 'application/pdf' });
              const arrayBuffer = await file.arrayBuffer();

              if (arrayBuffer.byteLength === 0) throw new Error('Empty file data');

              const pdfLibDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
              const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

              const loadedPdf: LoadedPDF = {
                file,
                name: t.fileName,
                pdfDoc,
                pdfLibDoc,
                pageCount: pdfDoc.numPages,
                elements: t.elements || {},
                pageBackgrounds: t.pageBackgrounds || {},
                pages: t.pages || [],
                extractedText: t.extractedText || {}
              };

              // Generate pages if missing
              if (!loadedPdf.pages || loadedPdf.pages.length === 0) {
                const pages: any[] = [];
                for (let i = 1; i <= loadedPdf.pageCount; i++) {
                  const p = await loadedPdf.pdfDoc.getPage(i);
                  const { width, height } = p.getViewport({ scale: 1 });
                  pages.push({ id: crypto.randomUUID(), pageNumber: i, width, height, rotation: 0 });
                }
                loadedPdf.pages = pages;
              }

              restoredTabs.push({ id: t.id, title: t.title, pdf: loadedPdf });
            } catch (tabErr) {
              console.warn(`?? Skipped corrupted tab "${t.title}":`, tabErr);
            }
          }

          if (restoredTabs.length > 0) {
            setTabs(restoredTabs);
            const activeId = state.activeTabId && restoredTabs.find(tab => tab.id === state.activeTabId)
              ? state.activeTabId
              : restoredTabs[0].id;
            setActiveTabId(activeId);
          }

          clearTimeout(timeoutId);
          setLoading(false);
          setProgress('');
        } else {
          clearTimeout(timeoutId);
        }
      } catch (e) {
        console.error('? Failed to restore session safely:', e);
        clearTimeout(timeoutId);
        setLoading(false);
        setProgress('');
        // Clear corrupted state
        await persistenceService.clearState().catch(console.error);
      }
    };
    autoRestoreSession();
  }, []);

  // Auto-save tabs whenever they change (debounced)
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // We want to save even if tabs.length === 0 (to clear the session)

    // Debounce to avoid excessive writes
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const serializedTabs: SerializedTab[] = [];
        for (const t of tabs) {
          if (t.pdf) {
            try {
              const fileData = await t.pdf.file.arrayBuffer();
              serializedTabs.push({
                id: t.id,
                title: t.title,
                fileName: t.pdf.name,
                fileData,
                elements: t.pdf.elements || {},
                pageBackgrounds: t.pdf.pageBackgrounds || {},
                pages: t.pdf.pages || [],
                extractedText: t.pdf.extractedText || {},
                currentPage: 1,
                zoom: 1
              });
            } catch (e) { console.warn('Failed to serialize tab', t.id, e); }
          }
        }
        // Always save state, even if tabs are empty, to reflect the current workspace
        await persistenceService.saveState({ tabs: serializedTabs, activeTabId });
      } catch (e) {
        console.error('Auto-save failed:', e);
      }
    }, 2000); // 2 second debounce

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [tabs, activeTabId]);


  // Restore session handler
  const handleRestoreSession = async () => {
    if (!savedSession || !savedSession.tabs) return;
    setShowRestoreModal(false);
    setLoading(true);
    setProgress('Restoring your session...');

    try {
      const restoredTabs: PDFTab[] = [];

      // Process tabs sequentially to avoid freezing UI
      for (const t of savedSession.tabs) {
        if (!t.fileData) continue;
        const file = new File([t.fileData], t.fileName, { type: 'application/pdf' });

        // We need to load the PDF to get the doc/libDoc objects
        // This reuses logic similar to loadFile but for explicit restoration
        const arrayBuffer = await file.arrayBuffer();
        const pdfLibDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

        const loadedPdf: LoadedPDF = {
          file,
          name: t.fileName,
          pdfDoc,
          pdfLibDoc,
          pageCount: pdfDoc.numPages,
          elements: t.elements || {},
          pageBackgrounds: t.pageBackgrounds || {},
          pages: t.pages || [], // Should regenerate default pages check?
          extractedText: t.extractedText || {}
        };

        // If pages are missing/empty (legacy save), generate defaults
        if (!loadedPdf.pages || loadedPdf.pages.length === 0) {
          const pages: any[] = [];
          for (let i = 1; i <= loadedPdf.pageCount; i++) {
            const p = await loadedPdf.pdfDoc.getPage(i);
            const { width, height } = p.getViewport({ scale: 1 });
            pages.push({ id: `page-${i}`, pageNumber: i, width, height, rotation: 0 });
          }
          loadedPdf.pages = pages;
        }

        restoredTabs.push({
          id: t.id,
          title: t.title,
          pdf: loadedPdf
        });
      }

      setTabs(restoredTabs);
      if (savedSession.activeTabId && restoredTabs.find(t => t.id === savedSession.activeTabId)) {
        setActiveTabId(savedSession.activeTabId);
      } else if (restoredTabs.length > 0) {
        setActiveTabId(restoredTabs[0].id);
      }

    } catch (e) {
      console.error('Failed to restore session:', e);
      setError('Failed to restore session');
      await persistenceService.clearState();
    }
    setLoading(false);
    setProgress('');
  };

  // Dismiss restore and start fresh
  const handleDismissRestore = async () => {
    setShowRestoreModal(false);
    setSavedSession(null);
    await persistenceService.clearState();
  };

  // Save state handler - called by PDFEditor and/or Effect
  const handleSaveState = useCallback(async (
    // These args are from the specific tab triggering the save, 
    // BUT we want to save ALL tabs.
    // So we primarily rely on the current 'tabs' state value
    _elements: { [p: number]: PDFElement[] },
    _pageBackgrounds: { [p: number]: string },
    _pages: any[],
    _page: number,
    _zoom: number
  ) => {
    // We need to access the LATEST tabs state. 
    // Since this is a callback, 'tabs' might be stale if not in dep array.
    // But adding 'tabs' to dep array resets this callback often.
    // Instead, we can use a functional state update or a ref, 
    // BUT here we are INSIDE a component that has access to 'tabs'.

    // Actually, PDFEditor calls this after syncing to 'tabs' via onUpdatePdf.
    // So 'tabs' locally *should* be relatively fresh, OR we can just rely on the fact 
    // that we will serialize the current 'tabs' state.

    // Wait, if PDFEditor calls onUpdatePdf (debounced), then onSaveState (debounced),
    // The 'tabs' state in App might be updated.

    // We allow tabs.length === 0 to clear the saved session

    // Serialize tabs
    const serializedTabs: SerializedTab[] = [];

    for (const t of tabs) {
      if (t.pdf) {
        try {
          // Optimization: many PDF operations change elements but NOT the file structure.
          // Re-using the arrayBuffer if the File object identity hasn't changed.
          // Since we create a new File() on reorder/delete, this correctly detects structural changes.
          if (!t.pdf._cachedBuffer || t.pdf._cachedFile !== t.pdf.file) {
            t.pdf._cachedBuffer = await t.pdf.file.arrayBuffer();
            t.pdf._cachedFile = t.pdf.file;
          }
          const fileData = t.pdf._cachedBuffer;

          serializedTabs.push({
            id: t.id,
            title: t.title,
            fileName: t.pdf.name,
            fileData,
            elements: t.pdf.elements || {},
            pageBackgrounds: t.pdf.pageBackgrounds || {},
            pages: t.pdf.pages || [],
            extractedText: t.pdf.extractedText || {},
            currentPage: 1, // Store simple default or specific if tracked
            zoom: 1
          });
        } catch (e) { console.warn('Failed to serialize tab', t.id, e); }
      }
    }

    if (serializedTabs.length > 0) {
      await persistenceService.saveState({
        tabs: serializedTabs,
        activeTabId: activeTabId
      });
    }

  }, [tabs, activeTabId]);

  // Clear session when going back
  const handleBack = useCallback(async () => {
    if (activeTabId) {
      handleCloseTab(activeTabId);
    } else {
      setTabs([]);
    }
    await persistenceService.clearState();
  }, [handleCloseTab, activeTabId]);



  const loadFile = useCallback(async (file: File) => {
    // Check if PDF or convertible
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const isConvertible = /\.(docx|pptx|xlsx|xls|csv|txt|md|jpg|jpeg|png|webp|bmp|gif)$/i.test(file.name);

    if (!isPdf) {
      if (isConvertible && convertFileRef.current) {
        // Auto-convert non-PDF files
        return convertFileRef.current(file);
      }
      setError('Please select a PDF file');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const buf = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise;
      const pdfLibDoc = await PDFDocument.load(buf.slice(0), { ignoreEncryption: true });

      const newPages: PDFPageData[] = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const pg = await pdfDoc.getPage(i);
        const vp = pg.getViewport({ scale: 1 });
        newPages.push({ id: crypto.randomUUID(), pageNumber: i, width: vp.width, height: vp.height, rotation: vp.rotation || 0 });
      }

      const loadedPdf: LoadedPDF = {
        file,
        name: file.name,
        pageCount: pdfDoc.numPages,
        pdfDoc,
        pdfLibDoc,
        pages: newPages,
        elements: {},
        extractedText: {},
        pageBackgrounds: {}
      };

      // CRITICAL FIX: Check if we're reloading the same file in the active tab
      // This happens when user edits a PDF and clicks "Apply Changes"
      const activeTab = tabs.find(t => t.id === activeTabId);
      const isReloadingSameFile = activeTab?.pdf?.name === file.name;

      if (isReloadingSameFile && activeTabId) {
        // UPDATE the existing tab instead of creating a new one
        // CRITICAL: Preserve elements and pageBackgrounds from the old PDF!
        // Otherwise all user-added watermarks, shapes, redactions will be lost
        setTabs(prev => prev.map(t => {
          if (t.id === activeTabId && t.pdf) {
            // Merge old elements/backgrounds with new PDF structure
            const mergedPdf: LoadedPDF = {
              ...loadedPdf,
              elements: t.pdf.elements || {},  // PRESERVE existing elements
              pageBackgrounds: t.pdf.pageBackgrounds || {}  // PRESERVE backgrounds
            };
            return { ...t, pdf: mergedPdf, title: file.name };
          }
          return t;
        }));
        console.log(`? Updated existing tab "${file.name}" with edited PDF (preserved ${Object.keys(activeTab?.pdf?.elements || {}).length} pages of elements)`);
      } else {
        // Create a NEW tab for genuinely new files
        const id = genTabId();
        setTabs(prev => [...prev, { id, title: file.name, pdf: loadedPdf }]);
        setActiveTabId(id);
        console.log(`? Created new tab "${file.name}"`);
      }
    } catch (e) {
      console.error('Load Error:', e);
      setError('Failed to load PDF file. It may be corrupted or encrypted.');
    }
    setLoading(false);
  }, [tabs, activeTabId]);

  // Main tool action handler for WelcomeScreen
  const handleToolAction = (id: string) => {
    switch (id) {
      case 'merge': setShowMerge(true); break;
      case 'img-to-pdf': setShowImageToPDF(true); break;
      case 'restore': handleRestoreSession(); break;
      default:
        // For other tools, we might need a file first. 
        // We could show a file picker if no file is loaded.
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) loadFile(file);
        };
        input.click();
    }
  };


  const handleMerge = async (files: File[]) => {
    setLoading(true);
    try {
      const merged = await PDFDocument.create();
      for (const f of files) {
        const buf = await f.arrayBuffer();
        try {
          const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
          const pages = await merged.copyPages(doc, doc.getPageIndices());
          pages.forEach(p => merged.addPage(p));
        } catch (e) {
          console.warn(`Skipping potentially corrupted/locked file: ${f.name}`, e);
          // Continue with other files if one fails
        }
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const file = new File([blob], 'merged.pdf', { type: 'application/pdf' });
      await loadFile(file);
      handleTriggerDownload(file, 'merged.pdf');
    } catch (e) { console.error(e); setError('Merge failed'); }
    setShowMerge(false);
    setLoading(false);
  };

  const handleImageToPDF = async (files: File[]) => {
    setLoading(true);
    let ocrWorker: any = null;
    setProgress('Initializing engine...');

    try {
      const doc = await PDFDocument.create();
      const helvetica = await doc.embedFont(StandardFonts.Helvetica); // Required for OCR text

      // Re-use robust OCR logic locally or refactor to shared if possible, 
      // but for safety in this scope we'll implement the worker pattern here too
      // or define getOcrWorker outside.
      // To keep it simple and safe given the file structure, we'll spin up a worker here.

      setProgress('Initializing OCR engine...');
      ocrWorker = await createWorker('eng');

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        setProgress(`Processing Image ${i + 1}/${files.length}...`);

        const imgBytes = await f.arrayBuffer();
        let img;
        let isPng = f.name.toLowerCase().endsWith('.png');

        if (isPng) {
          img = await doc.embedPng(imgBytes);
        } else {
          try {
            // Normalize non-standard formats to JPEG
            const bitmap = await createImageBitmap(f);
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bitmap, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            const bytesArr = await (await fetch(dataUrl)).arrayBuffer();
            img = await doc.embedJpg(bytesArr);
            isPng = false;
          } catch {
            img = await doc.embedJpg(imgBytes);
          }
        }

        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const scale = Math.min(pageWidth / img.width, pageHeight / img.height, 1);
        const page = doc.addPage([pageWidth, pageHeight]);

        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const drawX = (pageWidth - drawW) / 2;
        const drawY = (pageHeight - drawH) / 2;

        page.drawImage(img, {
          x: drawX,
          y: drawY,
          width: drawW,
          height: drawH,
        });

        // OCR Layer Integration
        setProgress(`Running OCR on Image ${i + 1}...`);
        try {
          const result = await ocrWorker.recognize(f);
          const words = result.data?.words || [];
          const sourceW = (result.data as any).width;
          const sourceH = (result.data as any).height;

          for (const w of words) {
            const x = drawX + (w.bbox.x0 / sourceW) * drawW;
            const y = (pageHeight - drawY) - ((w.bbox.y0 + (w.bbox.y1 - w.bbox.y0)) / sourceH) * drawH;
            const wHeight = ((w.bbox.y1 - w.bbox.y0) / sourceH) * drawH;

            page.drawText(w.text, {
              x,
              y,
              size: Math.max(1, wHeight * 0.8),
              font: helvetica,
              color: rgb(0, 0, 0),
              opacity: 0,
            });
          }
        } catch (err) {
          console.warn('OCR failed for image', f.name, err);
        }
      }

      if (ocrWorker) {
        setProgress('Cleaning up...');
        await ocrWorker.terminate();
        ocrWorker = null;
      }

      const bytes = await doc.save();
      const pdfFile = new File([new Blob([bytes as any])], 'images.pdf', { type: 'application/pdf' });
      await loadFile(pdfFile);
      handleTriggerDownload(pdfFile, 'images.pdf');
    } catch (e) {
      console.error(e);
      if (ocrWorker) await ocrWorker.terminate();
      setError('Conversion failed: ' + (e as any).message);
    }
    setShowImageToPDF(false);
    setLoading(false);
    setProgress('');
  };

  // Syntax Colors for high-fidelity code highlighting in PDF
  const syntaxColors: Record<string, { r: number, g: number, b: number }> = {
    keyword: { r: 0.77, g: 0.41, b: 0.77 },
    string: { r: 0.53, g: 0.71, b: 0.28 },
    comment: { r: 0.48, g: 0.48, b: 0.48 },
    number: { r: 0.85, g: 0.53, b: 0.16 },
    function: { r: 0.38, g: 0.65, b: 0.86 },
    operator: { r: 0.7, g: 0.7, b: 0.7 },
    'class-name': { r: 0.3, g: 0.75, b: 0.75 },
    boolean: { r: 0.85, g: 0.53, b: 0.16 },
    punctuation: { r: 0.4, g: 0.4, b: 0.4 },
    tag: { r: 0.9, g: 0.3, b: 0.3 },
    'attr-name': { r: 0.85, g: 0.53, b: 0.16 },
    'attr-value': { r: 0.53, g: 0.71, b: 0.28 },
    constant: { r: 0.85, g: 0.53, b: 0.16 },
    symbol: { r: 0.38, g: 0.65, b: 0.86 },
    deleted: { r: 0.9, g: 0.3, b: 0.3 },
    selector: { r: 0.85, g: 0.53, b: 0.16 }
  };

  // Convert any supported file type to PDF
  const handleConvertFile = async (file: File) => {
    setLoading(true);
    setProgress('Initializing engine...');
    try {
      const doc = await PDFDocument.create();
      const fileName = file.name.toLowerCase();
      const pageWidth = 595.28; // A4
      const pageHeight = 841.89;
      const margin = 50;
      const contentWidth = pageWidth - margin * 2;

      const helvetica = await doc.embedFont(StandardFonts.Helvetica);
      const courier = await doc.embedFont(StandardFonts.Courier);
      const courierBold = await doc.embedFont(StandardFonts.CourierBold);

      let ocrWorker: any = null;
      const getOcrWorker = async () => {
        if (!ocrWorker) {
          setProgress('Initializing OCR engine...');
          ocrWorker = await createWorker('eng');
        }
        return ocrWorker;
      };

      const addOcrLayer = async (targetPage: any, source: string | HTMLCanvasElement, drawW: number, drawH: number, drawX = 0, drawY = 0) => {
        try {
          const worker = await getOcrWorker();
          // Timeout for OCR to prevent infinite hang (e.g. 15s per page)
          const ocrPromise = worker.recognize(source);
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('OCR Timeout')), 15000));

          const result = await Promise.race([ocrPromise, timeoutPromise]) as any;
          const words = result.data?.words || [];

          const sourceW = (source instanceof HTMLCanvasElement) ? source.width : (result.data as any).width;
          const sourceH = (source instanceof HTMLCanvasElement) ? source.height : (result.data as any).height;

          for (const w of words) {
            const x = drawX + (w.bbox.x0 / sourceW) * drawW;
            const y = (pageHeight - drawY) - ((w.bbox.y0 + (w.bbox.y1 - w.bbox.y0)) / sourceH) * drawH;
            const wHeight = ((w.bbox.y1 - w.bbox.y0) / sourceH) * drawH;

            targetPage.drawText(w.text, {
              x,
              y,
              size: Math.max(1, wHeight * 0.8),
              font: helvetica,
              color: rgb(0, 0, 0),
              opacity: 0,
            });
          }
        } catch (ocrErr) {
          console.warn('OCR Layer failed/skipped:', ocrErr);
          // We continue anyway so the user gets their PDF
        }
      };

      // Helper to draw text with automatic wrapping and page breaks
      let currentPage: any = null;
      let currentY = pageHeight - margin;

      const ensurePage = () => {
        if (!currentPage) {
          currentPage = doc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }
        return currentPage;
      };

      const drawWrappedLine = (text: string, font = helvetica, size = 11, lineH = 15, color = rgb(0, 0, 0), x = margin) => {
        const words = text.split(' ');
        let line = '';
        const limit = pageWidth - margin;

        for (const word of words) {
          const testLine = line + (line ? ' ' : '') + word;
          if (font.widthOfTextAtSize(testLine, size) > (limit - x)) {
            if (currentY < margin + lineH) {
              currentPage = doc.addPage([pageWidth, pageHeight]);
              currentY = pageHeight - margin;
            } else {
              ensurePage();
            }
            currentPage.drawText(line, { x, y: currentY, size, font, color });
            currentY -= lineH;
            line = word;
          } else {
            line = testLine;
          }
        }
        if (line) {
          if (currentY < margin + lineH) {
            currentPage = doc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          } else {
            ensurePage();
          }
          currentPage.drawText(line, { x, y: currentY, size, font, color });
          currentY -= lineH;
        }
      };

      // 1. IMAGE CONVERSION
      if (/\.(jpg|jpeg|png|gif|webp|bmp|tiff|ico|icns)$/i.test(fileName)) {
        setProgress('Processing image...');
        const imgBytes = await file.arrayBuffer();
        let img;
        if (fileName.endsWith('.png')) {
          img = await doc.embedPng(imgBytes);
        } else {
          const bitmap = await createImageBitmap(file);
          const canvas = document.createElement('canvas');
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(bitmap, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          const bytes = await (await fetch(dataUrl)).arrayBuffer();
          img = await doc.embedJpg(bytes);
        }
        const scale = Math.min(contentWidth / img.width, (pageHeight - margin * 2) / img.height, 1);
        const page = doc.addPage([pageWidth, pageHeight]);
        page.drawImage(img, {
          x: (pageWidth - img.width * scale) / 2,
          y: (pageHeight - img.height * scale) / 2,
          width: img.width * scale,
          height: img.height * scale,
        });

        // OCR Searchable Layer
        const imgDrawWidth = img.width * scale;
        const imgDrawHeight = img.height * scale;
        const imgX = (pageWidth - imgDrawWidth) / 2;
        const imgY = (pageHeight - imgDrawHeight) / 2;
        setProgress('Performing OCR for searchable text...');
        await addOcrLayer(page, file as any, imgDrawWidth, imgDrawHeight, imgX, imgY);
      }

      // 2. OFFICE - WORD DOCUMENTS (Server-side LibreOffice for all Word formats)
      else if (/\.(doc|docx|docm|dot|dotx|dotm|rtf|odt|pages)$/i.test(fileName)) {
        setProgress('Converting Word document with high-fidelity engine...');

        // Try server-side conversion first (LibreOffice - same as ilovepdf.com)
        const CONVERSION_API = CONVERT_TO_PDF;

        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('isPremium', isPremium.toString());

          setProgress('Uploading to conversion server...');
          const response = await fetch(CONVERSION_API, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            setProgress('Processing with LibreOffice...');
            const pdfBlob = await response.blob();
            const pdfArrayBuffer = await pdfBlob.arrayBuffer();

            const convertedDoc = await PDFDocument.load(pdfArrayBuffer, { ignoreEncryption: true });
            const pages = convertedDoc.getPages();
            const copiedPages = await doc.copyPages(convertedDoc, pages.map((_, i) => i));
            copiedPages.forEach(page => doc.addPage(page));

            setProgress('Server conversion complete! Perfect quality.');
          } else {
            throw new Error('Server conversion failed');
          }
        } catch (serverError) {
          console.warn('Server conversion unavailable, using client-side fallback:', serverError);
          setProgress('Using local conversion (server unavailable)...');

          // High-Fidelity Rendering Container (docx-preview) - FALLBACK
          const container = document.createElement('div');
          container.style.position = 'fixed';
          container.style.top = '-10000px';
          container.style.left = '0';
          container.style.width = '794px'; // A4 width at 96 DPI
          container.style.backgroundColor = 'white';
          // docx-preview handles padding/margins internally based on the doc
          container.className = 'docx-render-target';

          document.body.appendChild(container);

          try {
            await renderAsync(await file.arrayBuffer(), container, undefined, {
              inWrapper: false,
              ignoreWidth: false,
              ignoreHeight: false,
              ignoreFonts: false,
              breakPages: true,
              debug: false,
              useBase64URL: true
            });
            const renderScale = 1.5;
            setProgress('Generating Word high-fidelity layout...');

            const canvas = await html2canvas(container, {
              scale: renderScale,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff'
            });

            const pageW = 595.28;
            const pageH = 841.89;

            // Paginate the large canvas into A4 chunks
            const canvasW = canvas.width;
            const canvasH = canvas.height;
            const ratio = canvasH / canvasW;
            const totalPDFHeight = pageW * ratio;

            let yRemaining = totalPDFHeight;
            let currentY = 0;

            while (yRemaining > 1) {
              const page = doc.addPage([pageW, pageH]);
              const drawH = Math.min(yRemaining, pageH);

              // Create a slice of the canvas for this page
              const sliceCanvas = document.createElement('canvas');
              sliceCanvas.width = canvasW;
              sliceCanvas.height = (pageH / pageW) * canvasW;
              const sCtx = sliceCanvas.getContext('2d')!;
              sCtx.fillStyle = 'white';
              sCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

              sCtx.drawImage(
                canvas,
                0, (currentY / totalPDFHeight) * canvasH, canvasW, sliceCanvas.height,
                0, 0, canvasW, sliceCanvas.height
              );

              const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.92);
              const sliceImg = await doc.embedJpg(sliceData);

              page.drawImage(sliceImg, {
                x: 0,
                y: pageH - drawH,
                width: pageW,
                height: drawH
              });

              // OCR Searchable Layer for Word
              setProgress(`Running OCR on Page ${doc.getPageCount()} (Searchable Layer)...`);
              await addOcrLayer(page, sliceCanvas, pageW, drawH);

              yRemaining -= pageH;
              currentY += pageH;
            }
          } finally {
            document.body.removeChild(container);
          }
        } // End of catch block (client-side fallback)
      }

      // 3. OFFICE - SPREADSHEETS (Server-side LibreOffice for all spreadsheet formats)
      else if (/\.(xlsx|xlsm|xlsb|xls|ods|csv|numbers)$/i.test(fileName)) {
        setProgress('Converting Spreadsheet with high-fidelity engine...');

        // Try server-side conversion first for Excel formats (LibreOffice)
        const CONVERSION_API = CONVERT_TO_PDF;
        const useServer = /\.(xlsx|xlsm|xlsb|xls|ods|numbers)$/i.test(fileName); // CSV uses client-side

        if (useServer) {
          try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('isPremium', isPremium.toString());

            setProgress('Uploading to conversion server...');
            const response = await fetch(CONVERSION_API, {
              method: 'POST',
              body: formData,
            });

            if (response.ok) {
              setProgress('Processing with LibreOffice...');
              const pdfBlob = await response.blob();
              const pdfArrayBuffer = await pdfBlob.arrayBuffer();

              const convertedDoc = await PDFDocument.load(pdfArrayBuffer, { ignoreEncryption: true });
              const pages = convertedDoc.getPages();
              const copiedPages = await doc.copyPages(convertedDoc, pages.map((_, i) => i));
              copiedPages.forEach(page => doc.addPage(page));

              setProgress('Server conversion complete! Perfect quality.');
            } else {
              throw new Error('Server conversion failed');
            }
          } catch (serverError) {
            console.warn('Server conversion unavailable, using client-side fallback:', serverError);
            setProgress('Using local conversion (server unavailable)...');
            // Fall through to client-side conversion below
            await convertExcelClientSide();
          }
        } else {
          // CSV/ODS use client-side directly
          await convertExcelClientSide();
        }

        async function convertExcelClientSide() {
          const buf = await file.arrayBuffer();
          const wb = XLSX.read(buf);
          const html = XLSX.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]]);

          const container = document.createElement('div');
          container.style.position = 'fixed';
          container.style.top = '-10000px';
          container.style.left = '0';
          container.style.width = '1000px'; // Wider for spreadsheets
          container.style.backgroundColor = 'white';
          container.style.padding = '40px';
          container.style.color = 'black';
          container.innerHTML = `<style>table { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 12px; } td { border: 1px solid #ccc; padding: 4px; }</style>${html}`;
          const renderScale = 1.5;
          setProgress('Generating Excel high-fidelity layout...');
          document.body.appendChild(container);

          try {
            const canvas = await html2canvas(container, {
              scale: renderScale,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff'
            });

            const pageW = 595.28;
            const pageH = 841.89;
            const canvasW = canvas.width;
            const canvasH = canvas.height;

            const ratio = canvasH / canvasW;
            const totalPDFHeight = pageW * ratio;

            let yRemaining = totalPDFHeight;
            let currentY = 0;

            while (yRemaining > 1) {
              const page = doc.addPage([pageW, pageH]);
              const drawH = Math.min(yRemaining, pageH);

              const sliceCanvas = document.createElement('canvas');
              sliceCanvas.width = canvasW;
              sliceCanvas.height = (pageH / pageW) * canvasW;
              const sCtx = sliceCanvas.getContext('2d')!;
              sCtx.fillStyle = 'white';
              sCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

              sCtx.drawImage(
                canvas,
                0, (currentY / totalPDFHeight) * canvasH, canvasW, sliceCanvas.height,
                0, 0, canvasW, sliceCanvas.height
              );

              const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.92);
              const sliceImg = await doc.embedJpg(sliceData);

              page.drawImage(sliceImg, {
                x: 0,
                y: pageH - drawH,
                width: pageW,
                height: drawH
              });

              // OCR Searchable Layer for Excel
              setProgress(`Running OCR on Page ${doc.getPageCount()} (Searchable Layer)...`);
              await addOcrLayer(page, sliceCanvas, pageW, drawH);

              yRemaining -= pageH;
              currentY += pageH;
            }
          } finally {
            document.body.removeChild(container);
          }
        } // End of convertExcelClientSide function
      }

      // 5. POWERPOINT - PRESENTATIONS (Server-side LibreOffice for all presentation formats)
      else if (/\.(ppt|pptx|pptm|pot|potx|odp|key)$/i.test(fileName)) {
        setProgress('Converting PowerPoint with high-fidelity engine...');

        // Try server-side conversion first (LibreOffice - same as ilovepdf.com)
        const CONVERSION_API = CONVERT_TO_PDF;

        try {
          // Upload to conversion server
          const formData = new FormData();
          formData.append('file', file);
          formData.append('isPremium', isPremium.toString());

          setProgress('Uploading to conversion server...');
          const response = await fetch(CONVERSION_API, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            setProgress('Processing with LibreOffice...');
            const pdfBlob = await response.blob();
            const pdfArrayBuffer = await pdfBlob.arrayBuffer();

            // Load the converted PDF
            const convertedDoc = await PDFDocument.load(pdfArrayBuffer, { ignoreEncryption: true });
            const pages = convertedDoc.getPages();

            // Copy all pages to our output document
            const copiedPages = await doc.copyPages(convertedDoc, pages.map((_, i) => i));
            copiedPages.forEach(page => doc.addPage(page));

            setProgress('Server conversion complete! Perfect quality.');
          } else {
            throw new Error('Server conversion failed');
          }
        } catch (serverError) {
          console.warn('Server conversion unavailable, using client-side fallback:', serverError);
          setProgress('Using local conversion (server unavailable)...');

          const zip = await JSZip.loadAsync(await file.arrayBuffer());
          const parser = new DOMParser();

          // Parse slide size
          let slideW = 960, slideH = 540;
          try {
            const presXml = await zip.file('ppt/presentation.xml')?.async('string');
            if (presXml) {
              const xmlDoc = parser.parseFromString(presXml, 'text/xml');
              const sldSz = xmlDoc.getElementsByTagName('p:sldSz')[0];
              if (sldSz) {
                const cx = parseInt(sldSz.getAttribute('cx') || '0');
                const cy = parseInt(sldSz.getAttribute('cy') || '0');
                if (cx > 0) slideW = Math.round((cx / 914400) * 96);
                if (cy > 0) slideH = Math.round((cy / 914400) * 96);
              }
            }
          } catch (e) { console.warn('Size parse error', e); }

          // Collect ALL media files
          setProgress('Loading media files...');
          const mediaMap: Record<string, string> = {};
          for (const path of Object.keys(zip.files)) {
            if (path.includes('/media/')) {
              try {
                const data = await zip.file(path)!.async('base64');
                const ext = path.split('.').pop()?.toLowerCase() || 'png';
                const mime = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
                mediaMap[path] = `data:${mime};base64,${data}`;
              } catch (e) { }
            }
          }

          // Get slides sorted
          const slideFiles = Object.keys(zip.files)
            .filter(f => f.match(/^ppt\/slides\/slide\d+\.xml$/))
            .sort((a, b) => parseInt(a.match(/slide(\d+)/)?.[1] || '0') - parseInt(b.match(/slide(\d+)/)?.[1] || '0'));

          const emuToPx = (v: string | null) => Math.round(parseInt(v || '0') / 914400 * 96);

          // Helper to parse relationships
          const parseRels = async (relsPath: string) => {
            const rels: Record<string, string> = {};
            const relsXml = await zip.file(relsPath)?.async('string');
            if (relsXml) {
              const rDoc = parser.parseFromString(relsXml, 'text/xml');
              Array.from(rDoc.getElementsByTagName('Relationship')).forEach(r => {
                const id = r.getAttribute('Id');
                let t = r.getAttribute('Target') || '';
                if (t.startsWith('../')) t = 'ppt/' + t.substring(3);
                if (id) rels[id] = t;
              });
            }
            return rels;
          };

          // Helper to render images with proper loading
          const renderImages = (xmlDoc: Document, rels: Record<string, string>, container: HTMLElement, zIndex: number) => {
            const promises: Promise<void>[] = [];
            Array.from(xmlDoc.getElementsByTagName('p:pic')).forEach(pic => {
              try {
                const xfrm = pic.getElementsByTagName('a:xfrm')[0];
                const off = xfrm?.getElementsByTagName('a:off')[0];
                const ext = xfrm?.getElementsByTagName('a:ext')[0];
                if (!off || !ext) return;

                const blip = pic.getElementsByTagName('a:blip')[0];
                const embedId = blip?.getAttribute('r:embed');
                const src = mediaMap[rels[embedId || '']];
                if (!src) return;

                const img = document.createElement('img');
                img.style.cssText = `position:absolute;left:${emuToPx(off.getAttribute('x'))}px;top:${emuToPx(off.getAttribute('y'))}px;width:${emuToPx(ext.getAttribute('cx'))}px;height:${emuToPx(ext.getAttribute('cy'))}px;z-index:${zIndex};`;
                const loadPromise = new Promise<void>(resolve => {
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                  img.src = src;
                });
                promises.push(loadPromise);
                container.appendChild(img);
              } catch (e) { }
            });
            return promises;
          };

          // Helper to get background
          const getBgColor = (xmlDoc: Document): string | null => {
            const bgPr = xmlDoc.getElementsByTagName('p:bgPr')[0];
            if (bgPr) {
              const sf = bgPr.getElementsByTagName('a:solidFill')[0];
              if (sf) {
                const c = sf.getElementsByTagName('a:srgbClr')[0];
                if (c) return '#' + (c.getAttribute('val') || 'ffffff');
              }
            }
            return null;
          };

          if (slideFiles.length === 0) {
            throw new Error('No slides found in PowerPoint file');
          }

          // Process each slide
          for (let i = 0; i < slideFiles.length; i++) {
            setProgress(`Processing Slide ${i + 1}/${slideFiles.length}...`);
            const sNum = parseInt(slideFiles[i].match(/slide(\d+)/)?.[1] || '1');

            // Parse slide relationships
            const slideRels = await parseRels(`ppt/slides/_rels/slide${sNum}.xml.rels`);

            // Create slide container
            const slideDiv = document.createElement('div');
            slideDiv.style.cssText = `
            position: fixed; left: -9999px; top: 0;
            width: ${slideW}px; height: ${slideH}px;
            background: #ffffff; overflow: hidden;
            font-family: Calibri, Arial, sans-serif;
          `;
            document.body.appendChild(slideDiv);

            const imagePromises: Promise<void>[] = [];

            // Parse slide XML
            const sXml = await zip.file(slideFiles[i])?.async('string');
            if (sXml) {
              const sDoc = parser.parseFromString(sXml, 'text/xml');

              // Get background from slide or layout/master
              let bgColor = getBgColor(sDoc);

              // Check layout for background and images
              const layoutId = Object.keys(slideRels).find(k => slideRels[k].includes('slideLayout'));
              if (layoutId && slideRels[layoutId]) {
                try {
                  const layoutPath = slideRels[layoutId];
                  const layoutXml = await zip.file(layoutPath)?.async('string');
                  if (layoutXml) {
                    const layoutDoc = parser.parseFromString(layoutXml, 'text/xml');
                    if (!bgColor) bgColor = getBgColor(layoutDoc);

                    const layoutNum = layoutPath.match(/slideLayout(\d+)/)?.[1];
                    if (layoutNum) {
                      const layoutRels = await parseRels(`ppt/slideLayouts/_rels/slideLayout${layoutNum}.xml.rels`);
                      imagePromises.push(...renderImages(layoutDoc, layoutRels, slideDiv, 1));

                      // Check master
                      const masterId = Object.keys(layoutRels).find(k => layoutRels[k].includes('slideMaster'));
                      if (masterId && layoutRels[masterId]) {
                        const masterPath = layoutRels[masterId];
                        const masterXml = await zip.file(masterPath)?.async('string');
                        if (masterXml) {
                          const masterDoc = parser.parseFromString(masterXml, 'text/xml');
                          if (!bgColor) bgColor = getBgColor(masterDoc);

                          const masterNum = masterPath.match(/slideMaster(\d+)/)?.[1];
                          if (masterNum) {
                            const masterRels = await parseRels(`ppt/slideMasters/_rels/slideMaster${masterNum}.xml.rels`);
                            imagePromises.push(...renderImages(masterDoc, masterRels, slideDiv, 0));
                          }
                        }
                      }
                    }
                  }
                } catch (e) { console.warn('Layout/Master error', e); }
              }

              if (bgColor) slideDiv.style.backgroundColor = bgColor;

              // Render slide images (highest z-index)
              imagePromises.push(...renderImages(sDoc, slideRels, slideDiv, 10));

              // Render text shapes
              Array.from(sDoc.getElementsByTagName('p:sp')).forEach(sp => {
                try {
                  const xfrm = sp.getElementsByTagName('a:xfrm')[0];
                  const off = xfrm?.getElementsByTagName('a:off')[0];
                  const ext = xfrm?.getElementsByTagName('a:ext')[0];

                  const x = off ? emuToPx(off.getAttribute('x')) : 0;
                  const y = off ? emuToPx(off.getAttribute('y')) : 0;
                  const w = ext ? emuToPx(ext.getAttribute('cx')) : slideW;
                  const h = ext ? emuToPx(ext.getAttribute('cy')) : 50;

                  const shapeDiv = document.createElement('div');
                  shapeDiv.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;min-height:${h}px;padding:8px;box-sizing:border-box;z-index:20;`;

                  Array.from(sp.getElementsByTagName('a:p')).forEach(p => {
                    const pEl = document.createElement('p');
                    pEl.style.margin = '0 0 4px 0';

                    const pPr = p.getElementsByTagName('a:pPr')[0];
                    if (pPr?.getAttribute('algn') === 'ctr') pEl.style.textAlign = 'center';
                    if (pPr?.getAttribute('algn') === 'r') pEl.style.textAlign = 'right';

                    Array.from(p.getElementsByTagName('a:r')).forEach(r => {
                      const t = r.getElementsByTagName('a:t')[0]?.textContent;
                      if (!t) return;

                      const span = document.createElement('span');
                      span.textContent = t;
                      span.style.fontSize = '18pt';
                      span.style.color = bgColor && bgColor !== '#ffffff' && bgColor !== '#FFFFFF' ? '#FFFFFF' : '#000000';

                      const rPr = r.getElementsByTagName('a:rPr')[0];
                      if (rPr) {
                        const sz = parseInt(rPr.getAttribute('sz') || '0');
                        if (sz) span.style.fontSize = `${sz / 100}pt`;
                        if (rPr.getAttribute('b') === '1') span.style.fontWeight = 'bold';

                        const sf = rPr.getElementsByTagName('a:solidFill')[0];
                        const srgb = sf?.getElementsByTagName('a:srgbClr')[0] || rPr.getElementsByTagName('a:srgbClr')[0];
                        if (srgb) span.style.color = '#' + (srgb.getAttribute('val') || '000000');

                        const scheme = sf?.getElementsByTagName('a:schemeClr')[0] || rPr.getElementsByTagName('a:schemeClr')[0];
                        if (scheme) {
                          const val = scheme.getAttribute('val');
                          if (val === 'lt1' || val === 'bg1') span.style.color = '#FFFFFF';
                          else if (val === 'dk1' || val === 'tx1') span.style.color = '#000000';
                        }
                      }

                      pEl.appendChild(span);
                    });

                    if (pEl.textContent?.trim()) shapeDiv.appendChild(pEl);
                  });

                  if (shapeDiv.textContent?.trim()) slideDiv.appendChild(shapeDiv);
                } catch (e) { }
              });
            }

            // Wait for all images to load
            setProgress(`Loading images for Slide ${i + 1}...`);
            await Promise.all(imagePromises);
            await new Promise(r => setTimeout(r, 300));

            // Capture with html2canvas
            try {
              setProgress(`Capturing Slide ${i + 1}...`);
              const canvas = await html2canvas(slideDiv, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                width: slideW,
                height: slideH,
                logging: false
              });

              const pdfPageW = slideW * 0.75, pdfPageH = slideH * 0.75;
              const page = doc.addPage([pdfPageW, pdfPageH]);

              const imgBytes = await fetch(canvas.toDataURL('image/png')).then(r => r.arrayBuffer());
              const pdfImg = await doc.embedPng(imgBytes);
              page.drawImage(pdfImg, { x: 0, y: 0, width: pdfPageW, height: pdfPageH });

              setProgress(`Running OCR on Slide ${i + 1}...`);
              await addOcrLayer(page, canvas, pdfPageW, pdfPageH);
            } finally {
              document.body.removeChild(slideDiv);
            }
          }
        } // End of catch block (client-side fallback)
      }

      // 4. CODE & MARKDOWN (Syntax Highlighted)
      else if (/\.(js|ts|tsx|py|java|c|cpp|cs|go|rs|rb|php|swift|kt|sh|yml|yaml|json|xml|sql|css|scss|html|htm|md|txt|log|ini|conf)$/i.test(fileName)) {
        const text = await file.text();
        const ext = fileName.split('.').pop() || 'clike';
        const prismLang = (Prism.languages as any)[ext] || Prism.languages.clike;
        const tokens = Prism.tokenize(text, prismLang);

        let currentX = margin;
        const fontSize = 9;
        const lineH = 12;

        const renderTokens = (ts: any[]) => {
          for (const t of ts) {
            const font = (typeof t === 'string' || !syntaxColors[t.type]) ? courier : courierBold;
            const colorObj = (typeof t === 'string') ? { r: 0, g: 0, b: 0 } : (syntaxColors[t.type] || { r: 0, g: 0, b: 0 });
            const color = rgb(colorObj.r, colorObj.g, colorObj.b);
            const content = typeof t === 'string' ? t : (Array.isArray(t.content) ? '' : String(t.content));

            if (Array.isArray(t.content)) {
              renderTokens(t.content);
              continue;
            }

            const lines = content.split('\n');
            lines.forEach((l, i) => {
              if (i > 0) {
                currentY -= lineH;
                currentX = margin;
                if (currentY < margin) { currentPage = doc.addPage([pageWidth, pageHeight]); currentY = pageHeight - margin; }
                else { ensurePage(); }
              }

              // Word wrap within the token line if it's too long
              let remaining = l;
              while (remaining.length > 0) {
                const available = pageWidth - margin - currentX;
                // Find how much of 'remaining' fits
                let fitCount = 0;
                let low = 0, high = remaining.length;
                while (low <= high) {
                  let mid = Math.floor((low + high) / 2);
                  if (font.widthOfTextAtSize(remaining.substring(0, mid), fontSize) <= available) {
                    fitCount = mid;
                    low = mid + 1;
                  } else {
                    high = mid - 1;
                  }
                }

                if (fitCount === 0 && currentX > margin) {
                  // If nothing fits and we are not at margin, move to next line
                  currentY -= lineH;
                  currentX = margin;
                  if (currentY < margin) { currentPage = doc.addPage([pageWidth, pageHeight]); currentY = pageHeight - margin; }
                  else { ensurePage(); }
                  continue;
                }

                if (fitCount === 0) fitCount = 1; // Force at least one char to avoid infinite loop

                const chunk = remaining.substring(0, fitCount);
                ensurePage().drawText(chunk, { x: currentX, y: currentY, size: fontSize, font, color });
                currentX += font.widthOfTextAtSize(chunk, fontSize);
                remaining = remaining.substring(fitCount);

                if (remaining.length > 0) {
                  currentY -= lineH;
                  currentX = margin;
                  if (currentY < margin) { currentPage = doc.addPage([pageWidth, pageHeight]); currentY = pageHeight - margin; }
                  else { ensurePage(); }
                }
              }
            });
          }
        };
        renderTokens(tokens);
      }

      // 5. OTHER / FALLBACK
      else {
        const text = await file.text();
        text.split('\n').forEach(l => drawWrappedLine(l));
      }

      if (ocrWorker) {
        setProgress('Cleaning up...');
        await ocrWorker.terminate();
      }
      setProgress('Saving PDF document...');
      const pdfBytes = await doc.save();
      const pdfBlob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setProgress('Finalizing...');
      const convertedFileName = file.name.replace(/\.[^.]+$/, '.pdf');
      const convertedFile = new File([pdfBlob], convertedFileName, { type: 'application/pdf' });
      await loadFile(convertedFile);
      handleTriggerDownload(convertedFile, convertedFileName);
    } catch (err) {
      console.error(err);
      setError('Conversion failed: ' + (err as any).message);
    }
    setLoading(false);
    setProgress('');
  };

  // Handle Remote Signing Route - MUST be first to override editing mode
  if (window.location.pathname.includes('/remote-sign') || window.location.pathname.includes('/mobile-sign') || window.location.search.includes('session=')) {
    return <MobileSign />;
  }

  if (loading) return (
    <div className="fixed inset-0 flex flex-col gap-8 items-center justify-center z-50" style={{ background: '#09090b' }}>
      <img src="/logo-phd.png" alt="PDF PhD" className="w-40 h-auto rounded-2xl drop-shadow-2xl" />
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
        {progress && <p className="text-white text-lg font-medium animate-pulse">{progress}</p>}
      </div>
    </div>
  );

  if (downloadInfo) return (
    <DownloadArea
      file={downloadInfo.file}
      fileName={downloadInfo.fileName}
      onBack={() => setDownloadInfo(null)}
      onShare={handleShare}
      onCompress={handleCompress}
    />
  );

  if (error) return <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: '#09090b' }}><X className="w-12 h-12 mb-4 text-red-500" /><p className="text-white mb-4">{error}</p><button onClick={() => setError(null)} className="btn-primary">Try Again</button></div>;

  if (tabs.length > 0) return (
    <PDFEditor
      key={activeTabId || 'no-active-tab'}
      pdf={pdf}
      onBack={handleBack}
      onUpdatePdf={handleUpdateActiveTabPdf}
      onReloadFile={loadFile}
      onSaveState={handleSaveState}
      onDownload={handleTriggerDownload}
      tabs={tabs}
      activeTabId={activeTabId}
      onSwitchTab={handleSwitchTab}
      onCloseTab={handleCloseTab}
      onNewTab={handleNewTab}
      onFilesSelect={handleMerge}
      onConvertFile={handleConvertFile}
      onConvertFiles={(files) => {
        // Multiple files - convert all images to single PDF
        const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i.test(f.name));
        if (imageFiles.length > 0) {
          handleImageToPDF(imageFiles);
        } else {
          // If not images, convert the first file
          handleConvertFile(files[0]);
        }
      }}
      isPremium={isPremium}
      onTogglePremium={handleTogglePremium}
    />
  );

  return (
    <>
      <ConvertRefLinker handler={handleConvertFile} linkRef={convertFileRef} />
      <WelcomeScreen
        onFileSelect={loadFile}
        onFilesSelect={(files) => {
          // Multiple PDFs - directly merge them
          handleMerge(files);
        }}
        onConvertFile={handleConvertFile}
        onConvertFiles={(files) => {
          // Multiple files - convert all images to single PDF
          const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i.test(f.name));
          if (imageFiles.length > 0) {
            handleImageToPDF(imageFiles);
          } else {
            // If not images, convert the first file
            handleConvertFile(files[0]);
          }
        }}
        onAction={handleToolAction}
        isPremium={isPremium}
        onTogglePremium={handleTogglePremium}
      />
      {showMerge && <MergeModal onMerge={handleMerge} onClose={() => setShowMerge(false)} />}
      {showImageToPDF && <ImageToPDFModal onConvert={handleImageToPDF} onClose={() => setShowImageToPDF(false)} />}

      {/* Session Restore Modal */}
      {showRestoreModal && savedSession && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal !max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Welcome Back!</h3>
                <p className="text-sm text-gray-400">You have an unsaved session</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
              <p className="text-sm text-gray-300 mb-2">
                <span className="font-semibold text-white">
                  {savedSession.tabs?.[0]?.fileName || 'Multiple Documents'}
                  {savedSession.tabs.length > 1 ? ` (+${savedSession.tabs.length - 1} more)` : ''}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                Last modified: {new Date(savedSession.lastModified).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {savedSession.tabs.reduce((total, t) =>
                  total + Object.keys(t.elements || {}).reduce((acc, key) => acc + (t.elements[Number(key)]?.length || 0), 0)
                  , 0)} edits saved across {savedSession.tabs.length} tab(s)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDismissRestore}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
              >
                Start Fresh
              </button>
              <button
                onClick={handleRestoreSession}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/25"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper to capture handleConvertFile in ref for hoisting
function ConvertRefLinker({ handler, linkRef }: { handler: (f: File) => Promise<void>, linkRef: React.MutableRefObject<any> }) {
  useEffect(() => { linkRef.current = handler; }, [handler, linkRef]);
  return null;
}

// QR Code Modal
function QRCodeModal({ onAdd, onClose }: { onAdd: (text: string) => void; onClose: () => void }) {
  const [text, setText] = useState('');
  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-white mb-4">Generate QR Code</h3>
      <div className="mb-4">
        <label className="input-label">Content (URL or Text)</label>
        <input type="text" value={text} onChange={e => setText(e.target.value)} className="input" placeholder="https://example.com" autoFocus />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => onAdd(text)} className="btn-primary" disabled={!text.trim()}>Generate</button>
      </div>
    </div></div>
  );
}

// Protect PDF Modal
function ProtectModal({ onProtect, onClose }: { onProtect: (p: string) => void; onClose: () => void }) {
  const [password, setPassword] = useState('');
  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-3 mb-4 text-purple-400"><Lock className="w-6 h-6" /><h3 className="text-lg font-semibold text-white">Protect PDF</h3></div>
      <p className="text-gray-400 text-sm mb-4">Set a password to encrypt this document. Users will need this password to view the PDF.</p>
      <div className="mb-4">
        <label className="input-label">Enter Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" autoFocus />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => onProtect(password)} className="btn-primary" disabled={!password}>Set Password</button>
      </div>
    </div></div>
  );
}

function BatesModal({ onApply, onClose }: { onApply: (opts: { prefix: string; start: number; digits: number; position: 'top' | 'bottom' }) => void; onClose: () => void }) {
  const [prefix, setPrefix] = useState('BATES-');
  const [start, setStart] = useState(1);
  const [digits, setDigits] = useState(6);
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-3 mb-4 text-emerald-400"><Hash className="w-6 h-6" /><h3 className="text-lg font-semibold text-white">Bates Numbering</h3></div>
      <p className="text-gray-400 text-sm mb-4">Assign unique, sequential identifiers to each page for legal or professional document sets.</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="input-label">Prefix</label>
          <input type="text" value={prefix} onChange={e => setPrefix(e.target.value)} className="input" placeholder="CASE-001-" />
        </div>
        <div>
          <label className="input-label">Start Number</label>
          <input type="number" value={start} onChange={e => setStart(+e.target.value)} className="input" min="1" />
        </div>
        <div>
          <label className="input-label">Digits (Total)</label>
          <input type="number" value={digits} onChange={e => setDigits(+e.target.value)} className="input" min="1" max="10" />
        </div>
        <div>
          <label className="input-label">Position</label>
          <select value={position} onChange={e => setPosition(e.target.value as any)} className="input">
            <option value="top">Top Header</option>
            <option value="bottom">Bottom Footer</option>
          </select>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-6 font-mono text-center text-emerald-400">
        Preview: {prefix}{start.toString().padStart(digits, '0')}
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => onApply({ prefix, start, digits, position })} className="btn-primary">Apply Numbering</button>
      </div>
    </div></div>
  );
}

function InsertModal({ onInsert, onClose, pageCount }: { onInsert: (file: File, target: number) => void; onClose: () => void; pageCount: number }) {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState(pageCount + 1);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-3 mb-4 text-purple-400"><Plus className="w-6 h-6" /><h3 className="text-lg font-semibold text-white">Insert PDF</h3></div>
      <p className="text-gray-400 text-sm mb-4">Select another PDF file to insert its pages into this document.</p>

      <div className="mb-4">
        <label className="input-label">Select PDF File</label>
        <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="input" />
      </div>

      <div className="mb-4">
        <label className="input-label">Insert At Page</label>
        <div className="flex items-center gap-2">
          <input type="number" value={target} onChange={e => setTarget(+e.target.value)} className="input w-24" min="1" max={pageCount + 1} />
          <span className="text-xs text-gray-500">(1 to {pageCount + 1})</span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => file && onInsert(file, target)} className="btn-primary" disabled={!file}>Insert Pages</button>
      </div>
    </div></div>
  );
}

function CompareModal({ onCompare, onClose }: { onCompare: (f1: File, f2: File) => void; onClose: () => void }) {
  const [f1, setF1] = useState<File | null>(null);
  const [f2, setF2] = useState<File | null>(null);

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-3 mb-4 text-cyan-400"><FileOutput className="w-6 h-6" /><h3 className="text-lg font-semibold text-white">Compare PDFs</h3></div>
      <p className="text-gray-400 text-sm mb-4">Select two versions of a document to highlight differences in text content.</p>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <label className="input-label">Document A (Original)</label>
          <input type="file" accept="application/pdf" onChange={e => setF1(e.target.files?.[0] || null)} className="input" />
        </div>
        <div>
          <label className="input-label">Document B (New Version)</label>
          <input type="file" accept="application/pdf" onChange={e => setF2(e.target.files?.[0] || null)} className="input" />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => f1 && f2 && onCompare(f1, f2)} className="btn-primary" disabled={!f1 || !f2}>Start Comparison</button>
      </div>
    </div></div>
  );
}





