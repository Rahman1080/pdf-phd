// Tool Data - Complete metadata for all PDF tools (SEO-optimized)
// Icons research: Using most semantically accurate Lucide icons for each PDF operation
import {
    // Organize tools
    Merge,           // merge - combining documents
    Scissors,        // split - cutting/separating
    ArrowUpDown,     // reorder - moving pages up/down
    RotateCw,        // rotate - rotation
    Trash2,          // delete pages - removing
    FileOutput,      // extract pages - pulling out
    Copy,            // duplicate - copying
    Crop,            // crop - trimming
    LayoutGrid,      // n-up - grid layout

    // Convert tools
    FileUp,          // to PDF - uploading/converting to
    FileDown,        // from PDF - downloading/converting from
    Image,           // image conversion
    Globe,           // HTML/web conversion
    FileText,        // text extraction
    FileCheck,       // PDF/A - archival/validated
    Palette,         // grayscale - color adjustment
    Table,           // spreadsheet/table conversion
    Presentation,    // PowerPoint conversion

    // Edit tools
    PenLine,         // add text - writing
    ImagePlus,       // add image - insert image
    Highlighter,     // annotate - highlighting
    Hash,            // bates numbering
    ListOrdered,     // page numbers - numbered list
    AlignCenter,     // header/footer - alignment
    ScanText,        // OCR - scanning text
    Droplet,         // watermark - water drop
    Stamp,           // stamp - approval stamp

    // Security tools
    Lock,            // protect - locked
    Unlock,          // unlock - open lock
    EyeOff,          // redact - hidden/blocked
    PenTool,         // sign - signature pen
    ShieldCheck,     // certify - verified shield
    Layers,          // flatten - flattening layers
    Link2,           // add links - hyperlinks
    QrCode,          // QR code

    // Optimize tools
    Minimize2,       // compress - shrink
    Wrench,          // repair - fixing
    Sparkles,        // optimize - enhancement
    Zap,             // linearize - fast/lightning
    Printer,         // print
    GitCompare,      // compare - diff comparison

    // Export tools
    Download,        // export PDF
    Braces,          // JSON structure
    Code,            // XML metadata
    FileInput,       // FDF form data
    Archive,         // PDF/A archive
    BookOpen,        // EPUB eBook
    ShieldOff,       // sanitize metadata
    AlignLeft,       // plain text
    FileCode,        // markdown
    Globe2,          // HTML
    TableProperties  // tables to CSV
} from 'lucide-react';

export type ToolCategory = 'organize' | 'convert-to-pdf' | 'convert-from-pdf' | 'edit' | 'security' | 'optimize' | 'export';
export type ToolType = 'visual' | 'automatic';

export interface Tool {
    id: string;
    slug: string;
    name: string;
    shortName: string;
    category: ToolCategory;
    type: ToolType;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgGradient: string;
    description: string;
    metaDescription: string;
    longDescription: string;
    keywords: string[];
    howItWorks: { step: number; title: string; description: string }[];
    useCases: { title: string; description: string }[];
    faq: { question: string; answer: string }[];
    relatedTools: string[];
    featured?: boolean;
    layout?: 'grid' | 'canvas';
}

export const toolCategories: { id: ToolCategory; name: string; description: string }[] = [
    { id: 'organize', name: 'Organize', description: 'Merge, split, reorder, and manage PDF pages' },
    { id: 'convert-to-pdf', name: 'Convert to PDF', description: 'Transform documents, images, and web pages to PDF format' },
    { id: 'convert-from-pdf', name: 'Convert PDF To...', description: 'Export PDF to Word, Excel, PowerPoint, images, and more' },
    { id: 'edit', name: 'Edit & Annotate', description: 'Modify content, add text, images, and annotations' },
    { id: 'security', name: 'Security & Sign', description: 'Protect, encrypt, sign, and redact PDFs' },
    { id: 'optimize', name: 'Optimize', description: 'Compress, repair, and optimize PDF files' },
    { id: 'export', name: 'Export & Data', description: 'Export to advanced formats, extract text, data, and metadata' },
];

// Helper to create tool with defaults
const createTool = (partial: Partial<Tool> & Pick<Tool, 'id' | 'slug' | 'name' | 'shortName' | 'category' | 'icon' | 'bgGradient' | 'description'>): Tool => ({
    color: '#8b5cf6',
    type: 'automatic', // Default to automatic
    metaDescription: partial.description,
    longDescription: partial.description,
    keywords: [partial.shortName.toLowerCase(), 'pdf', partial.category],
    howItWorks: [
        { step: 1, title: 'Upload PDF', description: 'Select your PDF file' },
        { step: 2, title: 'Process', description: 'Apply the tool' },
        { step: 3, title: 'Download', description: 'Get your result' }
    ],
    useCases: [{ title: 'General Use', description: 'Works for all PDF documents' }],
    faq: [{ question: 'Is it free?', answer: 'Yes, completely free with no limits.' }],
    relatedTools: [],
    layout: partial.category === 'organize' ? 'grid' : 'canvas', // Organize tools default to grid, others to canvas if visual
    ...partial
});

export const tools: Tool[] = [
    // === ORGANIZE TOOLS (9) ===
    createTool({
        id: 'merge', slug: 'merge', name: 'Merge PDF Files', shortName: 'Merge',
        category: 'organize', icon: Merge, bgGradient: 'from-blue-500 to-blue-600',
        description: 'Combine multiple PDF files into one document',
        metaDescription: 'Merge PDF files online for free. Combine multiple PDFs into one document quickly and securely. No signup required, 100% local processing.',
        longDescription: `PDF PhD's Merge tool lets you combine multiple PDF files into a single document in seconds. Whether you're compiling reports, joining contracts, or organizing scanned documents, our free online PDF merger handles it all with ease.

Unlike other online tools that upload your files to remote servers, PDF PhD processes everything locally in your browser. Your confidential documents never leave your device, ensuring complete privacy and security for sensitive business files, legal documents, and personal records.

Our advanced merging technology preserves all formatting, bookmarks, hyperlinks, and interactive elements from your original PDFs. You can also reorder pages visually before merging, giving you complete control over the final document structure.

Perfect for professionals who need to combine quarterly reports, students merging research papers and citations, legal teams assembling case files, or anyone who wants to reduce document clutter by consolidating multiple PDFs into one organized file.`,
        keywords: ['merge pdf', 'combine pdf', 'join pdf files', 'pdf merger', 'combine pdf online free', 'merge pdf files free', 'pdf combiner'],
        howItWorks: [
            { step: 1, title: 'Upload Files', description: 'Drag and drop multiple PDF files into the merge tool, or click to browse your device.' },
            { step: 2, title: 'Arrange Order', description: 'Reorder your PDFs by dragging them into your preferred sequence. Preview pages before merging.' },
            { step: 3, title: 'Download Result', description: 'Click merge and instantly download your combined PDF. All processing happens locally - nothing is uploaded.' }
        ],
        useCases: [
            { title: 'Business Reports', description: 'Combine monthly reports, financial statements, and presentations into comprehensive quarterly packages.' },
            { title: 'Legal Documents', description: 'Merge contracts, exhibits, and supporting documents into complete case files.' },
            { title: 'Academic Papers', description: 'Join research papers, citations, and appendices into unified thesis documents.' }
        ],
        faq: [
            { question: 'Is merging PDFs free?', answer: 'Yes, PDF PhD offers unlimited free PDF merging with no file size limits or watermarks.' },
            { question: 'Can I merge password-protected PDFs?', answer: 'Yes, you can merge encrypted PDFs after entering the password. The merged file will not retain password protection unless you add it.' },
            { question: 'Are my files uploaded to a server?', answer: 'No! PDF PhD processes everything locally in your browser. Your files never leave your device, ensuring complete privacy.' },
            { question: 'How many PDFs can I merge at once?', answer: 'You can merge as many PDFs as your browser can handle - typically hundreds of files without issues.' }
        ],
        featured: true, relatedTools: ['split', 'reorder', 'compress']
    }),
    createTool({
        id: 'split', slug: 'split', name: 'Split PDF', shortName: 'Split',
        category: 'organize', icon: Scissors, bgGradient: 'from-red-500 to-red-600',
        description: 'Extract pages or split PDF into multiple documents',
        metaDescription: 'Split PDF files online for free. Extract specific pages, separate large documents, or divide PDFs by page ranges. Fast, secure, and no upload required.',
        longDescription: `PDF PhD's Split tool makes it easy to break large PDF documents into smaller, manageable files. Whether you need to extract a single page, separate chapters, or divide a document into equal parts, our free online PDF splitter handles it all instantly.

Our intelligent splitting options give you complete control: extract specific page ranges, split by bookmarks, divide into single-page files, or create custom splits based on your needs. The visual interface lets you preview pages before splitting, ensuring you get exactly what you need.

All processing happens locally in your browser - your files are never uploaded to external servers. This means faster processing times and complete privacy for confidential documents like contracts, financial statements, and legal briefs.

Whether you're a business professional separating invoice pages, a student extracting relevant chapters, or a team member distributing document sections, PDF PhD's split tool delivers professional results without the professional price tag.`,
        keywords: ['split pdf', 'extract pdf pages', 'separate pdf', 'divide pdf', 'pdf splitter', 'split pdf online free', 'extract pages from pdf'],
        howItWorks: [
            { step: 1, title: 'Upload Your PDF', description: 'Select or drag your PDF file into the splitter. Large files work perfectly.' },
            { step: 2, title: 'Choose Split Method', description: 'Select pages visually, enter page ranges, or choose automatic splitting options.' },
            { step: 3, title: 'Download Splits', description: 'Get your separated PDF files instantly. Each split downloads as its own file.' }
        ],
        useCases: [
            { title: 'Extract Chapters', description: 'Pull specific chapters or sections from ebooks, manuals, or reports.' },
            { title: 'Separate Invoices', description: 'Split multi-page invoice documents into individual customer invoices.' },
            { title: 'Share Specific Pages', description: 'Extract only the pages you need to share without sending the entire document.' }
        ],
        faq: [
            { question: 'How do I split a PDF by page range?', answer: 'Enter your desired page ranges (like 1-5, 8, 12-15) in the split tool to extract those specific pages into a new PDF.' },
            { question: 'Can I split a PDF into single pages?', answer: 'Yes! Choose the "Split All" option to create separate PDF files for each page of your document.' },
            { question: 'Will splitting reduce quality?', answer: 'No. PDF splitting is lossless - each extracted page maintains the exact same quality as the original.' },
            { question: 'Can I split password-protected PDFs?', answer: 'Yes, enter the password first and then split the PDF freely.' }
        ],
        featured: true, relatedTools: ['merge', 'extract-pages', 'delete-pages']
    }),
    createTool({
        id: 'reorder', slug: 'reorder', name: 'Reorder PDF Pages', shortName: 'Reorder Pages',
        category: 'organize', type: 'visual', icon: ArrowUpDown, bgGradient: 'from-purple-500 to-purple-600',
        description: 'Rearrange and reorder pages in your PDF document',
        keywords: ['reorder pdf pages', 'rearrange pdf', 'move pdf pages', 'organize pdf'],
        featured: true, relatedTools: ['merge', 'split', 'rotate']
    }),
    createTool({
        id: 'rotate', slug: 'rotate', name: 'Rotate PDF Pages', shortName: 'Rotate',
        category: 'organize', type: 'visual', icon: RotateCw, bgGradient: 'from-cyan-500 to-cyan-600',
        description: 'Rotate pages 90° clockwise or counterclockwise',
        keywords: ['rotate pdf', 'rotate pdf pages', 'fix pdf orientation'],
        relatedTools: ['reorder', 'split']
    }),
    createTool({
        id: 'delete-pages', slug: 'delete-pages', name: 'Delete PDF Pages', shortName: 'Delete Pages',
        category: 'organize', type: 'visual', icon: Trash2, bgGradient: 'from-rose-500 to-rose-600',
        description: 'Remove unwanted pages from your PDF',
        keywords: ['delete pdf pages', 'remove pages from pdf'],
        relatedTools: ['split', 'reorder']
    }),
    createTool({
        id: 'extract-pages', slug: 'extract-pages', name: 'Extract PDF Pages', shortName: 'Extract Pages',
        category: 'organize', type: 'visual', icon: FileOutput, bgGradient: 'from-amber-500 to-amber-600',
        description: 'Extract specific pages from a PDF document',
        keywords: ['extract pdf pages', 'pull pages from pdf'],
        relatedTools: ['split', 'delete-pages']
    }),
    createTool({
        id: 'duplicate-pages', slug: 'duplicate-pages', name: 'Duplicate PDF Pages', shortName: 'Duplicate',
        category: 'organize', type: 'visual', icon: Copy, bgGradient: 'from-indigo-500 to-indigo-600',
        description: 'Duplicate pages within your PDF',
        keywords: ['duplicate pdf pages', 'copy pdf pages'],
        relatedTools: ['reorder', 'merge']
    }),
    createTool({
        id: 'crop', slug: 'crop', name: 'Crop PDF Pages', shortName: 'Crop',
        category: 'organize', type: 'visual', icon: Crop, bgGradient: 'from-teal-500 to-teal-600',
        description: 'Crop margins or adjust page boundaries',
        keywords: ['crop pdf', 'trim pdf margins', 'resize pdf pages'],
        relatedTools: ['rotate', 'reorder'],
        layout: 'canvas'
    }),
    createTool({
        id: 'n-up', slug: 'n-up', name: 'N-Up PDF', shortName: 'N-Up',
        category: 'organize', icon: LayoutGrid, bgGradient: 'from-fuchsia-500 to-fuchsia-600',
        description: 'Print multiple pages on a single sheet',
        keywords: ['n-up pdf', 'multiple pages per sheet', '2-up pdf'],
        relatedTools: ['merge', 'print']
    }),

    // === CONVERT TO PDF TOOLS (5) ===
    createTool({
        id: 'word-to-pdf', slug: 'convert/word-to-pdf', name: 'Word to PDF', shortName: 'Word → PDF',
        category: 'convert-to-pdf', icon: FileUp, bgGradient: 'from-blue-600 to-blue-700',
        description: 'Convert DOC and DOCX files to PDF format',
        keywords: ['word to pdf', 'convert docx to pdf', 'doc to pdf'],
        featured: true, relatedTools: ['pdf-to-word', 'excel-to-pdf']
    }),
    createTool({
        id: 'excel-to-pdf', slug: 'convert/excel-to-pdf', name: 'Excel to PDF', shortName: 'Excel → PDF',
        category: 'convert-to-pdf', icon: Table, bgGradient: 'from-green-600 to-green-700',
        description: 'Convert XLS and XLSX spreadsheets to PDF',
        keywords: ['excel to pdf', 'convert xlsx to pdf', 'spreadsheet to pdf'],
        relatedTools: ['word-to-pdf', 'pdf-to-excel']
    }),
    createTool({
        id: 'ppt-to-pdf', slug: 'convert/ppt-to-pdf', name: 'PowerPoint to PDF', shortName: 'PPT → PDF',
        category: 'convert-to-pdf', icon: Presentation, bgGradient: 'from-orange-600 to-orange-700',
        description: 'Convert PowerPoint presentations to PDF',
        keywords: ['ppt to pdf', 'powerpoint to pdf', 'pptx to pdf'],
        relatedTools: ['word-to-pdf', 'pdf-to-ppt']
    }),
    createTool({
        id: 'image-to-pdf', slug: 'convert/image-to-pdf', name: 'Image to PDF', shortName: 'Image → PDF',
        category: 'convert-to-pdf', icon: Image, bgGradient: 'from-pink-500 to-pink-600',
        description: 'Convert JPG, PNG, and other images to PDF',
        keywords: ['image to pdf', 'jpg to pdf', 'png to pdf'],
        featured: true, relatedTools: ['pdf-to-image', 'merge']
    }),
    createTool({
        id: 'html-to-pdf', slug: 'convert/html-to-pdf', name: 'HTML to PDF', shortName: 'HTML → PDF',
        category: 'convert-to-pdf', icon: Globe, bgGradient: 'from-cyan-600 to-cyan-700',
        description: 'Convert web pages and HTML to PDF',
        keywords: ['html to pdf', 'webpage to pdf', 'url to pdf'],
        relatedTools: ['word-to-pdf']
    }),

    // === CONVERT PDF TO... TOOLS (7) ===
    createTool({
        id: 'pdf-to-word', slug: 'convert/pdf-to-word', name: 'PDF to Word', shortName: 'PDF → Word',
        category: 'convert-from-pdf', icon: FileDown, bgGradient: 'from-blue-500 to-indigo-600',
        description: 'Convert PDF files to editable Word documents',
        keywords: ['pdf to word', 'convert pdf to docx', 'pdf to doc'],
        featured: true, relatedTools: ['word-to-pdf', 'pdf-to-excel', 'ocr']
    }),
    createTool({
        id: 'pdf-to-excel', slug: 'convert/pdf-to-excel', name: 'PDF to Excel', shortName: 'PDF → Excel',
        category: 'convert-from-pdf', icon: Table, bgGradient: 'from-green-500 to-emerald-600',
        description: 'Convert PDF tables to Excel spreadsheets',
        keywords: ['pdf to excel', 'pdf to xlsx', 'extract tables from pdf'],
        relatedTools: ['excel-to-pdf', 'pdf-to-word']
    }),
    createTool({
        id: 'pdf-to-ppt', slug: 'convert/pdf-to-ppt', name: 'PDF to PowerPoint', shortName: 'PDF → PPT',
        category: 'convert-from-pdf', icon: Presentation, bgGradient: 'from-orange-500 to-red-600',
        description: 'Convert PDF to PowerPoint presentations',
        keywords: ['pdf to ppt', 'pdf to powerpoint', 'pdf to pptx'],
        relatedTools: ['ppt-to-pdf', 'pdf-to-word']
    }),
    createTool({
        id: 'pdf-to-image', slug: 'convert/pdf-to-image', name: 'PDF to Image', shortName: 'PDF → Image',
        category: 'convert-from-pdf', icon: Image, bgGradient: 'from-purple-500 to-pink-600',
        description: 'Convert PDF pages to JPG, PNG, or TIFF images',
        keywords: ['pdf to image', 'pdf to jpg', 'pdf to png'],
        relatedTools: ['image-to-pdf', 'pdf-to-word']
    }),
    createTool({
        id: 'pdf-to-text', slug: 'convert/pdf-to-text', name: 'PDF to Text', shortName: 'PDF → Text',
        category: 'convert-from-pdf', icon: FileText, bgGradient: 'from-slate-500 to-slate-600',
        description: 'Extract text content from PDF documents',
        keywords: ['pdf to text', 'extract text from pdf', 'pdf to txt'],
        relatedTools: ['ocr', 'pdf-to-word']
    }),
    createTool({
        id: 'pdf-a', slug: 'convert/pdf-a', name: 'Convert to PDF/A', shortName: 'PDF/A',
        category: 'convert-from-pdf', icon: FileCheck, bgGradient: 'from-emerald-500 to-teal-600',
        description: 'Convert PDF to archival PDF/A format',
        keywords: ['pdf to pdfa', 'pdfa conversion', 'archival pdf'],
        relatedTools: ['compress', 'protect']
    }),
    createTool({
        id: 'grayscale', slug: 'convert/grayscale', name: 'PDF to Grayscale', shortName: 'Grayscale',
        category: 'convert-from-pdf', icon: Palette, bgGradient: 'from-gray-500 to-gray-600',
        description: 'Convert color PDF to black and white',
        keywords: ['pdf grayscale', 'pdf black and white', 'remove color from pdf'],
        relatedTools: ['compress', 'print']
    }),

    // === EDIT TOOLS (10) ===
    createTool({
        id: 'edit', slug: 'edit', name: 'Annotate PDF', shortName: 'Annotate',
        category: 'edit', type: 'visual', icon: Highlighter, bgGradient: 'from-violet-500 to-purple-600',
        description: 'Add highlights, comments, and drawings',
        keywords: ['edit pdf', 'edit pdf text', 'modify pdf', 'annotate pdf', 'highlight pdf'],
        featured: true, relatedTools: ['add-text', 'watermark']
    }),
    createTool({
        id: 'add-text', slug: 'add-text', name: 'Add Text to PDF', shortName: 'Add Text',
        category: 'edit', type: 'visual', icon: PenLine, bgGradient: 'from-yellow-500 to-amber-600',
        description: 'Add new text boxes to PDF documents',
        keywords: ['add text to pdf', 'insert text pdf', 'type on pdf'],
        relatedTools: ['edit', 'annotate']
    }),
    createTool({
        id: 'add-image', slug: 'add-image', name: 'Add Image to PDF', shortName: 'Add Image',
        category: 'edit', type: 'visual', icon: ImagePlus, bgGradient: 'from-pink-500 to-rose-600',
        description: 'Insert images into PDF documents',
        keywords: ['add image to pdf', 'insert picture pdf', 'add logo to pdf'],
        relatedTools: ['edit', 'watermark']
    }),
    createTool({
        id: 'bates', slug: 'bates', name: 'Bates Numbering', shortName: 'Bates',
        category: 'edit', type: 'visual', icon: Hash, bgGradient: 'from-emerald-500 to-teal-600',
        description: 'Add Bates numbering for legal document identification',
        keywords: ['bates numbering', 'bates stamp', 'legal document numbering'],
        featured: true, relatedTools: ['page-numbers', 'watermark']
    }),
    createTool({
        id: 'page-numbers', slug: 'page-numbers', name: 'Add Page Numbers', shortName: 'Page Numbers',
        category: 'edit', type: 'visual', icon: ListOrdered, bgGradient: 'from-blue-500 to-cyan-600',
        description: 'Add page numbers to PDF documents',
        keywords: ['add page numbers pdf', 'number pdf pages', 'pdf pagination'],
        relatedTools: ['bates', 'header-footer']
    }),
    createTool({
        id: 'header-footer', slug: 'header-footer', name: 'Header & Footer', shortName: 'Header/Footer',
        category: 'edit', type: 'visual', icon: AlignCenter, bgGradient: 'from-indigo-500 to-blue-600',
        description: 'Add headers and footers to PDF pages',
        keywords: ['pdf header footer', 'add header pdf', 'add footer pdf'],
        relatedTools: ['page-numbers', 'watermark']
    }),
    createTool({
        id: 'ocr', slug: 'ocr', name: 'OCR - Text Recognition', shortName: 'OCR',
        category: 'edit', type: 'visual', icon: ScanText, bgGradient: 'from-indigo-500 to-indigo-600',
        description: 'Extract text from scanned documents and images',
        keywords: ['ocr pdf', 'pdf ocr', 'scanned pdf to text'],
        featured: true, relatedTools: ['pdf-to-word', 'edit']
    }),
    createTool({
        id: 'watermark', slug: 'watermark', name: 'Add Watermark', shortName: 'Watermark',
        category: 'edit', type: 'visual', icon: Droplet, bgGradient: 'from-sky-500 to-cyan-600',
        description: 'Add text or image watermarks to PDFs',
        keywords: ['watermark pdf', 'add watermark to pdf', 'stamp pdf'],
        relatedTools: ['protect', 'bates']
    }),
    createTool({
        id: 'stamp', slug: 'stamp', name: 'PDF Stamp', shortName: 'Stamp',
        category: 'edit', type: 'visual', icon: Stamp, bgGradient: 'from-red-500 to-orange-600',
        description: 'Add stamps like Approved, Confidential, Draft',
        keywords: ['pdf stamp', 'stamp pdf', 'approved stamp pdf'],
        relatedTools: ['watermark', 'annotate']
    }),

    // === SECURITY TOOLS (8) ===
    createTool({
        id: 'protect', slug: 'protect', name: 'Protect PDF', shortName: 'Protect',
        category: 'security', icon: Lock, bgGradient: 'from-yellow-500 to-amber-600',
        description: 'Add password protection and encryption to PDFs',
        keywords: ['protect pdf', 'password protect pdf', 'encrypt pdf'],
        featured: true, relatedTools: ['unlock', 'redact', 'sign']
    }),
    createTool({
        id: 'unlock', slug: 'unlock', name: 'Unlock PDF', shortName: 'Unlock',
        category: 'security', icon: Unlock, bgGradient: 'from-green-500 to-emerald-600',
        description: 'Remove password protection from PDFs',
        keywords: ['unlock pdf', 'remove pdf password', 'pdf password remover'],
        relatedTools: ['protect', 'merge']
    }),
    createTool({
        id: 'redact', slug: 'redact', name: 'Redact PDF', shortName: 'Redact',
        category: 'security', type: 'visual', icon: EyeOff, bgGradient: 'from-slate-500 to-slate-600',
        description: 'Permanently remove sensitive information from PDFs',
        keywords: ['redact pdf', 'pdf redaction', 'remove sensitive data pdf'],
        featured: true, relatedTools: ['protect', 'sign']
    }),
    createTool({
        id: 'sign', slug: 'sign', name: 'Sign PDF', shortName: 'Sign',
        category: 'security', type: 'visual', icon: PenTool, bgGradient: 'from-purple-500 to-violet-600',
        description: 'Add electronic signatures to PDF documents',
        metaDescription: 'Sign PDF documents online for free. Add your electronic signature to contracts, agreements, and forms instantly. Legally binding, secure, no signup required.',
        longDescription: `PDF PhD's Sign tool lets you add professional electronic signatures to any PDF document in seconds. Whether you're signing contracts, forms, agreements, or legal documents, our free e-signature tool makes the process fast, secure, and legally binding.

Create your signature by drawing with your mouse or finger, typing your name in a signature font, or uploading an image of your existing signature. Place and resize it anywhere on the document with our intuitive visual editor, then download your signed PDF immediately.

Electronic signatures are legally recognized in most countries worldwide, including the US (ESIGN Act), EU (eIDAS), UK, Canada, and Australia. Your signed documents carry the same legal weight as traditional ink signatures for most business and personal purposes.

Since all processing happens locally in your browser, your documents never leave your device. This makes PDF PhD perfect for signing confidential contracts, employment agreements, medical forms, and financial documents without privacy concerns.`,
        keywords: ['sign pdf', 'electronic signature', 'e-sign pdf', 'digital signature', 'sign pdf online free', 'pdf signature', 'esign document'],
        howItWorks: [
            { step: 1, title: 'Upload Document', description: 'Select the PDF document you need to sign. Works with contracts, forms, and any PDF.' },
            { step: 2, title: 'Create Signature', description: 'Draw your signature, type your name, or upload an image. Style it how you want.' },
            { step: 3, title: 'Place & Download', description: 'Position your signature on the document and download your signed PDF instantly.' }
        ],
        useCases: [
            { title: 'Contracts & Agreements', description: 'Sign employment contracts, rental agreements, and business deals remotely.' },
            { title: 'Legal Documents', description: 'Add signatures to affidavits, power of attorney, and other legal paperwork.' },
            { title: 'Forms & Applications', description: 'Complete application forms, consent forms, and official paperwork digitally.' }
        ],
        faq: [
            { question: 'Are electronic signatures legally valid?', answer: 'Yes! E-signatures are legally binding in most countries under laws like ESIGN Act (US), eIDAS (EU), and similar legislation worldwide.' },
            { question: 'Can I add multiple signatures?', answer: 'Yes, add as many signatures, initials, or dates as needed on any pages of your document.' },
            { question: 'Is my signature saved?', answer: 'Your signature is saved locally in your browser for convenience. Nothing is uploaded to our servers.' },
            { question: 'Can I request signatures from others?', answer: 'Yes, use our Request Signature feature to send documents for others to sign remotely.' }
        ],
        featured: true, relatedTools: ['protect', 'redact']
    }),
    createTool({
        id: 'certify', slug: 'certify', name: 'Certify PDF', shortName: 'Certify',
        category: 'security', icon: ShieldCheck, bgGradient: 'from-blue-600 to-indigo-700',
        description: 'Add digital certificate to PDF documents',
        keywords: ['certify pdf', 'digital certificate pdf', 'pdf certification'],
        relatedTools: ['sign', 'protect']
    }),
    createTool({
        id: 'flatten', slug: 'flatten', name: 'Flatten PDF', shortName: 'Flatten',
        category: 'security', icon: Layers, bgGradient: 'from-gray-500 to-zinc-600',
        description: 'Flatten form fields and annotations',
        keywords: ['flatten pdf', 'flatten form fields', 'convert form to pdf'],
        relatedTools: ['protect', 'sign']
    }),
    createTool({
        id: 'add-links', slug: 'add-links', name: 'Add Links to PDF', shortName: 'Add Links',
        category: 'security', type: 'visual', icon: Link2, bgGradient: 'from-cyan-500 to-blue-600',
        description: 'Add clickable hyperlinks to PDF documents',
        keywords: ['add links pdf', 'hyperlink pdf', 'clickable pdf'],
        relatedTools: ['edit', 'annotate']
    }),
    createTool({
        id: 'add-qr', slug: 'add-qr', name: 'Add QR Code', shortName: 'QR Code',
        category: 'security', type: 'visual', icon: QrCode, bgGradient: 'from-violet-500 to-purple-600',
        description: 'Add QR codes to PDF documents',
        keywords: ['add qr code pdf', 'qr code pdf', 'generate qr pdf'],
        relatedTools: ['add-links', 'watermark']
    }),

    // === OPTIMIZE TOOLS (6) ===
    createTool({
        id: 'compress', slug: 'compress', name: 'Compress PDF', shortName: 'Compress',
        category: 'optimize', icon: Minimize2, bgGradient: 'from-teal-500 to-teal-600',
        description: 'Reduce PDF file size while maintaining quality',
        metaDescription: 'Compress PDF files online for free. Reduce PDF size by up to 90% without losing quality. Perfect for email attachments and web uploads. Fast & secure.',
        longDescription: `PDF PhD's Compress tool dramatically reduces your PDF file size while preserving visual quality. Whether you're trying to email a large document, upload files to limited storage, or optimize for web viewing, our intelligent compression finds the perfect balance between size and quality.

Our compression engine analyzes your PDF content and applies smart optimization: downsampling high-resolution images, removing redundant data, optimizing fonts, and streamlining the document structure. You can choose between different compression levels depending on whether you prioritize quality or file size.

Unlike other compressors that require uploading to external servers, PDF PhD processes everything in your browser. Large PDFs compress in seconds without any data leaving your device - perfect for confidential business documents, medical records, or financial statements.

Most users see 50-80% file size reduction while maintaining document readability. This means your 10MB PDF could become 2MB or less, making it easy to share via email, upload to web portals, or store efficiently.`,
        keywords: ['compress pdf', 'reduce pdf size', 'pdf compressor', 'shrink pdf', 'make pdf smaller', 'compress pdf online free', 'reduce pdf file size'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select your PDF file. Even very large files process quickly in your browser.' },
            { step: 2, title: 'Choose Quality', description: 'Select compression level: Low (highest quality), Medium (balanced), or High (smallest size).' },
            { step: 3, title: 'Download Compressed', description: 'Get your smaller PDF instantly. See the exact file size reduction achieved.' }
        ],
        useCases: [
            { title: 'Email Attachments', description: 'Reduce file size to meet email attachment limits (usually 25MB or less).' },
            { title: 'Web Upload', description: 'Compress PDFs for website uploads, form submissions, or cloud storage limits.' },
            { title: 'Storage Optimization', description: 'Shrink PDF archives to save disk space while keeping documents accessible.' }
        ],
        faq: [
            { question: 'How much can PDF size be reduced?', answer: 'Most PDFs compress by 50-80%. Image-heavy documents see the most reduction, while text-only PDFs have less room for compression.' },
            { question: 'Will compression reduce quality?', answer: 'Our "Low" compression setting maintains near-original quality. Higher settings trade some quality for smaller files - perfect for screen viewing.' },
            { question: 'Can I compress password-protected PDFs?', answer: 'Yes, enter the password first, then compress. You can re-apply protection after compression.' },
            { question: 'Is there a file size limit?', answer: 'Since processing happens in your browser, limits depend on your device memory. Most computers handle 100MB+ files easily.' }
        ],
        featured: true, relatedTools: ['merge', 'split']
    }),
    createTool({
        id: 'repair', slug: 'repair', name: 'Repair PDF', shortName: 'Repair',
        category: 'optimize', icon: Wrench, bgGradient: 'from-amber-500 to-orange-600',
        description: 'Fix corrupted or damaged PDF files',
        keywords: ['repair pdf', 'fix pdf', 'corrupted pdf'],
        relatedTools: ['compress', 'optimize']
    }),
    createTool({
        id: 'optimize', slug: 'optimize', name: 'Optimize PDF', shortName: 'Optimize',
        category: 'optimize', icon: Sparkles, bgGradient: 'from-green-500 to-emerald-600',
        description: 'Optimize PDF for web or print',
        keywords: ['optimize pdf', 'pdf optimization', 'web optimize pdf'],
        relatedTools: ['compress', 'pdf-a']
    }),
    createTool({
        id: 'linearize', slug: 'linearize', name: 'Linearize PDF', shortName: 'Linearize',
        category: 'optimize', icon: Zap, bgGradient: 'from-blue-500 to-cyan-600',
        description: 'Optimize PDF for fast web viewing',
        keywords: ['linearize pdf', 'fast web view pdf', 'pdf linearization'],
        relatedTools: ['optimize', 'compress']
    }),
    createTool({
        id: 'print', slug: 'print', name: 'Print PDF', shortName: 'Print',
        category: 'optimize', icon: Printer, bgGradient: 'from-gray-600 to-gray-700',
        description: 'Print PDF documents with advanced options',
        keywords: ['print pdf', 'pdf printer', 'print options pdf'],
        relatedTools: ['n-up', 'grayscale']
    }),
    createTool({
        id: 'compare', slug: 'compare', name: 'Compare PDFs', shortName: 'Compare',
        category: 'optimize', icon: GitCompare, bgGradient: 'from-indigo-500 to-purple-600',
        description: 'Compare two PDF documents side by side',
        keywords: ['compare pdf', 'pdf comparison', 'diff pdf'],
        relatedTools: ['merge', 'split']
    }),

    // === EXPORT & DATA TOOLS (11) ===
    createTool({
        id: 'export-json', slug: 'export-json', name: 'Export to JSON', shortName: 'JSON Structure',
        category: 'export', icon: Braces, bgGradient: 'from-amber-500 to-orange-600',
        description: 'Export document structure, metadata, and text to JSON format',
        keywords: ['export json pdf', 'pdf to json', 'json structure', 'pdf metadata json'],
        relatedTools: ['export-xml', 'export-text']
    }),
    createTool({
        id: 'export-xml', slug: 'export-xml', name: 'Export XMP Metadata', shortName: 'XML/XMP Metadata',
        category: 'export', icon: Code, bgGradient: 'from-cyan-500 to-blue-600',
        description: 'Export XMP-compliant metadata in XML format',
        keywords: ['export xml pdf', 'xmp metadata', 'pdf metadata xml', 'dublin core'],
        relatedTools: ['export-json', 'sanitize-metadata']
    }),
    createTool({
        id: 'export-fdf', slug: 'export-fdf', name: 'Export Form Data', shortName: 'FDF Form Data',
        category: 'export', icon: FileInput, bgGradient: 'from-green-500 to-emerald-600',
        description: 'Export fillable form field data to FDF format',
        keywords: ['export fdf', 'form data export', 'pdf forms fdf', 'acroform export'],
        relatedTools: ['export-json', 'flatten']
    }),
    createTool({
        id: 'export-pdfa', slug: 'export-pdfa', name: 'Convert to PDF/A', shortName: 'PDF/A Archive',
        category: 'export', icon: Archive, bgGradient: 'from-purple-500 to-violet-600',
        description: 'Convert PDF to archival PDF/A format for long-term preservation',
        keywords: ['pdf/a conversion', 'archive pdf', 'long term archiving', 'pdf preservation'],
        relatedTools: ['optimize', 'sanitize-metadata']
    }),
    createTool({
        id: 'export-epub', slug: 'export-epub', name: 'Export to EPUB', shortName: 'EPUB eBook',
        category: 'export', icon: BookOpen, bgGradient: 'from-pink-500 to-rose-600',
        description: 'Convert PDF to EPUB format for e-readers',
        keywords: ['pdf to epub', 'ebook conversion', 'kindle format', 'epub export'],
        relatedTools: ['export-html', 'export-text']
    }),
    createTool({
        id: 'sanitize-metadata', slug: 'sanitize-metadata', name: 'Sanitize Metadata', shortName: 'Sanitize Metadata',
        category: 'export', icon: ShieldOff, bgGradient: 'from-red-500 to-rose-600',
        description: 'Remove hidden info, scripts, and sensitive metadata from PDF',
        keywords: ['remove metadata', 'sanitize pdf', 'clean pdf', 'remove hidden data'],
        relatedTools: ['redact', 'flatten', 'export-xml']
    }),
    createTool({
        id: 'export-text', slug: 'export-text', name: 'Export Plain Text', shortName: 'Plain Text',
        category: 'export', icon: AlignLeft, bgGradient: 'from-slate-500 to-slate-600',
        description: 'Extract all text content from PDF as plain text',
        keywords: ['extract text pdf', 'pdf to text', 'plain text export', 'text extraction'],
        relatedTools: ['export-markdown', 'export-html', 'ocr']
    }),
    createTool({
        id: 'export-markdown', slug: 'export-markdown', name: 'Export to Markdown', shortName: 'Markdown',
        category: 'export', icon: FileCode, bgGradient: 'from-gray-600 to-gray-700',
        description: 'Export PDF content as formatted Markdown',
        keywords: ['pdf to markdown', 'markdown export', 'md format', 'formatted text'],
        relatedTools: ['export-text', 'export-html']
    }),
    createTool({
        id: 'export-html', slug: 'export-html', name: 'Export to HTML', shortName: 'HTML',
        category: 'export', icon: Globe2, bgGradient: 'from-orange-500 to-red-600',
        description: 'Export PDF content as web-ready HTML page',
        keywords: ['pdf to html', 'html export', 'web page', 'html conversion'],
        relatedTools: ['export-markdown', 'export-epub']
    }),
    createTool({
        id: 'export-csv', slug: 'export-csv', name: 'Extract Tables to CSV', shortName: 'Tables → CSV',
        category: 'export', icon: TableProperties, bgGradient: 'from-teal-500 to-cyan-600',
        description: 'Extract tables from PDF and export as CSV data',
        keywords: ['pdf table extraction', 'tables to csv', 'csv export', 'extract data pdf'],
        relatedTools: ['pdf-to-excel', 'export-json']
    }),
    createTool({
        id: 'export-pdf', slug: 'export-pdf', name: 'Export PDF', shortName: 'Export PDF',
        category: 'export', icon: Download, bgGradient: 'from-indigo-500 to-purple-600',
        description: 'Download PDF with all edits applied',
        keywords: ['export pdf', 'download pdf', 'save pdf', 'pdf download'],
        relatedTools: ['compress', 'optimize']
    })
];

// Helper functions
export function getToolBySlug(slug: string): Tool | undefined {
    return tools.find(t => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
    return tools.filter(t => t.category === category);
}

export function getFeaturedTools(): Tool[] {
    return tools.filter(t => t.featured);
}

export function getRelatedTools(tool: Tool): Tool[] {
    return tool.relatedTools
        .map(slug => tools.find(t => t.slug === slug || t.id === slug))
        .filter(Boolean) as Tool[];
}
