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
        metaDescription: 'Reorder PDF pages online for free. Rearrange, move, and organize pages in your PDF document with a simple drag-and-drop visual editor. 100% secure.',
        longDescription: `PDF PhD's Reorder tool gives you ultimate control over your document's structure. Whether you've scanned documents out of order or need to reorganize sections of a report, our visual drag-and-drop interface makes it incredibly easy to rearrange PDF pages exactly how you want them.

Our reordering engine provides a high-fidelity preview of every page, allowing you to move individual pages or select multiple pages to move as a block. It's the perfect companion tool for merging multiple documents into a single, perfectly sequenced file.

Privacy is built-in. Your page reordering happens entirely within your web browser. Your sensitive documents never leave your device, ensuring total security and privacy for your business reports, legal files, and personal records.`,
        keywords: ['reorder pdf pages', 'rearrange pdf', 'move pdf pages', 'organize pdf', 'reorder pdf online', 'drag and drop pdf pages'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the PDF document you want to reorganize.' },
            { step: 2, title: 'Drag and Drop', description: 'Visually drag and drop thumbnails to rearrange pages into your preferred order.' },
            { step: 3, title: 'Apply & Save', description: 'Click apply to save your new sequence and download the reorganized PDF.' }
        ],
        useCases: [
            { title: 'Scan Correction', description: 'Fix documents that were scanned in the wrong order or upside down.' },
            { title: 'Report Assembly', description: 'Organize quarterly reports by moving critical data or executive summaries to the front.' },
            { title: 'Custom PDF Creation', description: 'Reorder pages from multiple sources into a new, logically structured document.' }
        ],
        faq: [
            { question: 'Is there a page limit?', answer: 'No, our tool can handle documents with hundreds of pages efficiently in your browser.' },
            { question: 'Can I move multiple pages?', answer: 'Yes, you can select multiple pages and move them together to a new location.' },
            { question: 'Are my changes permanent?', answer: 'Your original file is untouched; we create a new, reorganized version for you to download.' }
        ],
        featured: true, relatedTools: ['merge', 'split', 'rotate']
    }),
    createTool({
        id: 'rotate', slug: 'rotate', name: 'Rotate PDF Pages', shortName: 'Rotate',
        category: 'organize', type: 'visual', icon: RotateCw, bgGradient: 'from-cyan-500 to-cyan-600',
        description: 'Rotate pages 90° clockwise or counterclockwise',
        metaDescription: 'Rotate PDF pages online for free. Fix the orientation of upside-down or sideways PDF pages instantly. Secure local processing in your browser.',
        longDescription: `Fix poorly oriented documents in seconds with PDF PhD's Rotate tool. If you've ever received a PDF with sideways pages or upside-down scans, our visual editor allows you to fix the orientation of individual pages or the entire document with a single click.

Our rotation engine supports 90-degree increments, allowing you to move from portrait to landscape and back again perfectly. It's an essential tool for fixing architectural drawings, scanned forms, and legal documents that weren't oriented correctly during creation.

Because we value your privacy, the rotation process happens entirely on your machine. Your documents are never uploaded to our servers, providing the fastest and most secure way to fix your PDF orientation right in your browser.`,
        keywords: ['rotate pdf', 'rotate pdf pages', 'fix pdf orientation', 'flip pdf pages', 'rotate pdf online free', 'change pdf to landscape'],
        howItWorks: [
            { step: 1, title: 'Select PDF', description: 'Upload the PDF document that has pages with incorrect orientation.' },
            { step: 2, title: 'Rotate Pages', description: 'Click the rotate icons on specific pages or use the "Rotate All" feature.' },
            { step: 3, title: 'Download Fixed PDF', description: 'Save your document with all pages correctly oriented.' }
        ],
        useCases: [
            { title: 'Fix Scanned Forms', description: 'Correct documents that were fed into scanners sideways or upside-down.' },
            { title: 'Landscape Conversion', description: 'Rotate pages to better view blueprints, spreadsheets, or wide charts.' },
            { title: 'Presentation Prep', description: 'Ensure all pages are oriented properly for professional screen sharing or printing.' }
        ],
        faq: [
            { question: 'Can I rotate just one page?', answer: 'Yes, you can independently rotate any individual page in your document.' },
            { question: 'Will it affect the image quality?', answer: 'No, rotation is a lossless process that preserves the original clarity and resolution of your pages.' },
            { question: 'Does it save the new orientation?', answer: 'Yes, the resulting PDF will open in the new orientation on any device.' }
        ],
        relatedTools: ['reorder', 'split']
    }),
    createTool({
        id: 'delete-pages', slug: 'delete-pages', name: 'Delete PDF Pages', shortName: 'Delete Pages',
        category: 'organize', type: 'visual', icon: Trash2, bgGradient: 'from-rose-500 to-rose-600',
        description: 'Remove unwanted pages from your PDF',
        metaDescription: 'Delete PDF pages online for free. Remove unwanted, extra, or sensitive pages from your PDF documents easily. Secure local browser processing.',
        longDescription: `Clean up your documents instantly with PDF PhD's Delete Pages tool. If you have a PDF with blank pages, irrelevant sections, or sensitive info you want to remove, our visual editor makes it easy to select and delete pages permanently.

Our deletion engine provides a clear thumbnail view of your entire document. Simply click to mark pages for removal, or select ranges of pages to delete at once. It's the fastest way to trim down large manuals, reports, or contract files to only the content you need.

Total privacy is guaranteed. The page removal happens entirely within your browser environment. Your sensitive business records and personal files are never uploaded to any server, ensuring that only you see what you're deleting.`,
        keywords: ['delete pdf pages', 'remove pages from pdf', 'trim pdf', 'delete extra pdf pages', 'remove blank pages pdf'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the document from which you want to remove pages.' },
            { step: 2, title: 'Select Pages', description: 'Click on the pages you want to delete or use the range selection tool.' },
            { step: 3, title: 'Save Trimmed PDF', description: 'Download your new, smaller PDF with the unwanted pages removed.' }
        ],
        useCases: [
            { title: 'Remove Blank Pages', description: 'Clean up scanned documents by removing empty pages and separator sheets.' },
            { title: 'Trim Ebooks', description: 'Delete covers, advertisements, or irrelevant chapters from long PDF ebooks.' },
            { title: 'Confidential Sharing', description: 'Remove sensitive internal pages before sharing a document with external partners.' }
        ],
        faq: [
            { question: 'Is the deletion permanent?', answer: 'Yes, the pages are removed from the internal structure of the new PDF we create for you.' },
            { question: 'Can I undo a deletion?', answer: 'You can unselect a page as long as you haven\'t applied the changes and downloaded the file.' },
            { question: 'How many pages can I delete?', answer: 'There is no limit; you can remove as many pages as you need, leaving only what\'s essential.' }
        ],
        relatedTools: ['split', 'reorder']
    }),
    createTool({
        id: 'extract-pages', slug: 'extract-pages', name: 'Extract PDF Pages', shortName: 'Extract Pages',
        category: 'organize', type: 'visual', icon: FileOutput, bgGradient: 'from-amber-500 to-amber-600',
        description: 'Extract specific pages from a PDF document',
        metaDescription: 'Extract PDF pages online for free. Pull specific pages or ranges out of a large PDF into a new, smaller document. Fast, secure local processing.',
        longDescription: `Get exactly what you need with PDF PhD's Extract Pages tool. Instead of sharing a massive PDF, you can easily pull out specific pages or sections into a new, focused document. It's the perfect solution for isolating a single chapter, an invoice, or a signed contract page.

Our visual extraction tool shows you thumbnails of every page, making it simple to pick and choose. You can extract individual pages into separate files or combine your selection into one new PDF.

Privacy is our cornerstone. The extraction process runs completely in your web browser. Your confidential information stays on your device, providing peace of mind when handling sensitive legal, medical, or financial documents.`,
        keywords: ['extract pdf pages', 'pull pages from pdf', 'save specific pdf pages', 'pdf page extractor', 'extract pages online free'],
        howItWorks: [
            { step: 1, title: 'Upload Source PDF', description: 'Select the large PDF document you want to pull pages from.' },
            { step: 2, title: 'Pick Your Pages', description: 'Click on the thumbnails of the pages you need to extract.' },
            { step: 3, title: 'Generate New PDF', description: 'Download a new document containing only your selected pages.' }
        ],
        useCases: [
            { title: 'Isolate Invoices', description: 'Pull individual invoices out of a single multi-page accounting export.' },
            { title: 'Chapter Extraction', description: 'Extract key chapters from textbooks or manuals for easier study and sharing.' },
            { title: 'Signature Pages', description: 'Exctract only the signed pages from long legal agreements for your records.' }
        ],
        faq: [
            { question: 'Will the quality change?', answer: 'No, we extract pages with lossless precision, maintaining original text and image quality.' },
            { question: 'Can I extract into multiple files?', answer: 'Yes, you can choose to save each selected page as its own individual PDF.' },
            { question: 'Does it work with encrypted PDFs?', answer: 'Yes, as long as you have the password to open them in our editor.' }
        ],
        relatedTools: ['split', 'delete-pages']
    }),
    createTool({
        id: 'duplicate-pages', slug: 'duplicate-pages', name: 'Duplicate PDF Pages', shortName: 'Duplicate',
        category: 'organize', type: 'visual', icon: Copy, bgGradient: 'from-indigo-500 to-indigo-600',
        description: 'Duplicate pages within your PDF',
        metaDescription: 'Duplicate PDF pages online for free. Create copies of pages within your PDF document instantly. secure browser-based tool.',
        longDescription: `Repeat important content easily with PDF PhD's Duplicate Pages tool. Whether you need an extra copy of a form, a recurring template page, or multiple copies of a flyer within a single document, our visual tool makes duplication a snap.

Our editor allows you to select any page and create an identical copy right next to it. You can repeat this as many times as needed to build documents with repeating structures or multiple fillable copies.

Your security is paramount. The duplication process happens entirely locally in your browser. Your private documents are never uploaded to any server, making it safe to use for sensitive business forms and personal paperwork.`,
        keywords: ['duplicate pdf pages', 'copy pdf pages', 'repeat pdf pages', 'clone pdf pages online'],
        howItWorks: [
            { step: 1, title: 'Select PDF File', description: 'Upload the PDF document containing the pages you want to duplicate.' },
            { step: 2, title: 'Choose Page', description: 'Find the page you want to copy and click the duplicate icon.' },
            { step: 3, title: 'Save Result', description: 'Download your updated PDF with the additional copies included.' }
        ],
        useCases: [
            { title: 'Recurring Forms', description: 'Create multiple copies of a standard form within a single file for batch processing.' },
            { title: 'Flyer Printing', description: 'Duplicate a one-page flyer multiple times to create a multi-page PDF for easier bulk printing.' },
            { title: 'Document Drafts', description: 'Duplicate a page as a backup before making heavy annotations or edits.' }
        ],
        faq: [
            { question: 'Can I duplicate multiple pages?', answer: 'Yes, you can select and duplicate as many pages as you like.' },
            { question: 'Does it copy annotations?', answer: 'Yes, duplicating a page creates an exact structural copy, including any existing text or images.' },
            { question: 'Is there a limit on copies?', answer: 'No, you can create as many duplicates as your browser memory can handle.' }
        ],
        relatedTools: ['reorder', 'merge']
    }),
    createTool({
        id: 'crop', slug: 'crop', name: 'Crop PDF Pages', shortName: 'Crop',
        category: 'organize', type: 'visual', icon: Crop, bgGradient: 'from-teal-500 to-teal-600',
        description: 'Crop margins or adjust page boundaries',
        metaDescription: 'Crop PDF pages online for free. Adjust page margins, remove unwanted borders, or resize your PDF visually. Secure local processing.',
        longDescription: `Perfect your document's layout with PDF PhD's Crop tool. If your PDF has excessive margins, unwanted black scanner borders, or just needs to be reframed, our intuitive visual cropper gives you total control over the page boundaries.

Our cropping engine allows you to define a crop area for a single page or apply the same crop to the entire document. It's the ideal solution for preparing PDFs for printing, mobile viewing, or removing artifacts from scanned materials.

Privacy is built into our core. The cropping happens entirely in your browser, meaning your sensitive documents are never uploaded to a server. Work securely on confidential reports, legal briefs, and personal photos with total data sovereignty.`,
        keywords: ['crop pdf', 'trim pdf margins', 'resize pdf pages', 'remove pdf borders', 'crop pdf online free', 'adjust pdf frame'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the PDF document you want to crop or resize.' },
            { step: 2, title: 'Define Area', description: 'Use the visual selector to draw the crop area on the page.' },
            { step: 3, title: 'Download Cropped', description: 'Apply the crop to one or all pages and save your new document.' }
        ],
        useCases: [
            { title: 'Remove Scanner Borders', description: 'Clean up scans by removing the black edges and margins created by flatbed scanners.' },
            { title: 'Mobile Optimization', description: 'Crop unnecessary wide margins to make text larger and easier to read on phone screens.' },
            { title: 'Print Preparation', description: 'Adjust page boundaries to fit specific paper sizes or remove bleed margins.' }
        ],
        faq: [
            { question: 'Is the data lost?', answer: 'Cropping only hides the area outside the box; we create a new file that respects the new boundaries.' },
            { question: 'Can I crop all pages at once?', answer: 'Yes, you can set a crop area on the first page and apply it to every page in the document.' },
            { question: 'Does it support custom sizes?', answer: 'Yes, you can draw a custom crop box of any dimensions or aspect ratio.' }
        ],
        relatedTools: ['rotate', 'reorder'],
        layout: 'canvas'
    }),
    createTool({
        id: 'n-up', slug: 'n-up', name: 'N-Up PDF', shortName: 'N-Up',
        category: 'organize', icon: LayoutGrid, bgGradient: 'from-fuchsia-500 to-fuchsia-600',
        description: 'Print multiple pages on a single sheet',
        metaDescription: 'N-Up PDF online free. Combine multiple PDF pages onto a single sheet (2-up, 4-up) to save paper and create handouts. Secure local tool.',
        longDescription: `Save paper and create efficient handouts with PDF PhD's N-Up tool. N-Up printing allows you to place multiple pages of your document (like 2, 4, or 16 pages) onto a single sheet of paper. It's perfect for creating study guides, pocket-sized manuals, or quick-reference sheets.

Our N-Up engine intelligently scales and arranges your pages to maximize space while maintaining readability. You can customize the grid layout and orientation to fit your specific printing needs.

Because we value your privacy, all the layout processing happens on your own computer. Your documents are never uploaded to our servers, making it the most secure way to reformat your PDFs for printing and sharing.`,
        keywords: ['n-up pdf', 'multiple pages per sheet', '2-up pdf', '4-up pdf', 'pdf grid layout', 'print multiple pdf pages on one page'],
        howItWorks: [
            { step: 1, title: 'Upload Document', description: 'Select the PDF document you want to reformat into a grid layout.' },
            { step: 2, title: 'Choose Layout', description: 'Select how many pages you want per sheet (e.g., 2, 4, 6 or more).' },
            { step: 3, title: 'Download Grid PDF', description: 'Get your new PDF with multiple pages combined onto each sheet.' }
        ],
        useCases: [
            { title: 'Paper Saving', description: 'Reduce print costs and environmental impact by printing two or four pages per sheet of paper.' },
            { title: 'Handout Creation', description: 'Create compact overview sheets for presentations, lectures, and meetings.' },
            { title: 'Contact Sheets', description: 'Convert a multi-page PDF of images into a single-page grid overview for fast review.' }
        ],
        faq: [
            { question: 'What layouts are available?', answer: 'We support common grids like 2x1, 2x2, 3x2, and advanced custom grid layouts.' },
            { question: 'Will the text be readable?', answer: 'Auto-scaling ensures the best possible size, but readability depends on the total pages per sheet.' },
            { question: 'Can I change orientation?', answer: 'Yes, you can choose between portrait or landscape output for your grid sheets.' }
        ],
        relatedTools: ['merge', 'print']
    }),

    // === CONVERT TO PDF TOOLS (5) ===
    createTool({
        id: 'word-to-pdf', slug: 'convert/word-to-pdf', name: 'Word to PDF', shortName: 'Word → PDF',
        category: 'convert-to-pdf', icon: FileUp, bgGradient: 'from-blue-600 to-blue-700',
        description: 'Convert DOC and DOCX files to PDF format',
        metaDescription: 'Convert Word to PDF online for free. Transform .doc and .docx files into high-quality PDF documents instantly. 100% secure with local browser processing.',
        longDescription: `PDF PhD's Word to PDF converter is the most secure and efficient way to transform your Microsoft Word documents into professional PDF files. Whether you're working with DOC or DOCX formats, our tool preserves the exact layout, fonts, and images of your original document.

Why choose PDF PhD for Word conversion? Unlike other online services, we prioritize your privacy. The conversion happens entirely within your web browser using advanced libraries, meaning your sensitive documents are never uploaded to a remote server. This makes it the perfect choice for legal contracts, business proposals, and personal resumes.

Our converter handles complex formatting, including tables, headers, footers, and hyperlinks, ensuring that the final PDF looks exactly like the Word original. It's compatible with all versions of Microsoft Word and alternative editors like Google Docs or LibreOffice.`,
        keywords: ['word to pdf', 'convert docx to pdf', 'doc to pdf', 'word to pdf online free', 'ms word to pdf converter'],
        howItWorks: [
            { step: 1, title: 'Upload Word File', description: 'Drag and drop your .doc or .docx file into the converter or click to browse.' },
            { step: 2, title: 'Convert Instantly', description: 'Our powerful browser-based engine transforms your document into a PDF in seconds.' },
            { step: 3, title: 'Download PDF', description: 'Save your professionally formatted PDF document directly to your computer.' }
        ],
        useCases: [
            { title: 'Resume Creation', description: 'Convert your resume from Word to PDF to ensure formatting stays perfect across all devices.' },
            { title: 'Contract Finalization', description: 'Lock in document formatting before sending contracts or legal agreements for signature.' },
            { title: 'Professional Submissions', description: 'Prepare reports and official letters for submission in the industry-standard PDF format.' }
        ],
        faq: [
            { question: 'Is my data safe?', answer: 'Yes! PDF PhD uses local processing. Your Word files remain on your computer and are never seen by our servers.' },
            { question: 'Will the formatting change?', answer: 'No. Our converter is designed to maintain 1:1 parity with your original Word document layout.' },
            { question: 'Can I convert multiple files?', answer: 'Yes, you can upload and convert multiple Word documents simultaneously.' }
        ],
        featured: true, relatedTools: ['pdf-to-word', 'excel-to-pdf']
    }),
    createTool({
        id: 'excel-to-pdf', slug: 'convert/excel-to-pdf', name: 'Excel to PDF', shortName: 'Excel → PDF',
        category: 'convert-to-pdf', icon: Table, bgGradient: 'from-green-600 to-green-700',
        description: 'Convert XLS and XLSX spreadsheets to PDF',
        metaDescription: 'Convert Excel to PDF online for free. Transform spreadsheets into clean, readable PDF reports. Secure browser-based conversion for XLS and XLSX.',
        longDescription: `Transform your data into perfect reports with PDF PhD's Excel to PDF converter. We make it easy to turn complex spreadsheets into professional, easy-to-read PDF documents that anyone can view without needing Excel.

Our tool intelligently handles sheet layouts, ensuring that your tables and charts are correctly paginated in the resulting PDF. Whether you're converting financial statements, project timelines, or inventory lists, our engine ensures that your data remains structured and legible.

Security is our cornerstone. Just like our other tools, the Excel conversion process happens locally on your machine. Your proprietary financial data and private records never leave your browser, providing a level of security that cloud-based converters can't match.`,
        keywords: ['excel to pdf', 'convert xlsx to pdf', 'spreadsheet to pdf', 'excel to pdf converter free', 'xlsx to pdf online'],
        howItWorks: [
            { step: 1, title: 'Select Spreadsheet', description: 'Upload your .xls or .xlsx spreadsheet file to the converter.' },
            { step: 2, title: 'Process Data', description: 'We automatically format your sheets and cells into a clean PDF layout.' },
            { step: 3, title: 'Get Your PDF', description: 'Download your data-driven PDF document instantly.' }
        ],
        useCases: [
            { title: 'Financial Reporting', description: 'Share monthly budgets or annual reports in a secure, non-editable format.' },
            { title: 'Project Schedules', description: 'Convert project plans into PDFs for easy distribution to team members and stakeholders.' },
            { title: 'Data Archiving', description: 'Save snapshots of your data in a stable, permanent format for long-term record keeping.' }
        ],
        faq: [
            { question: 'Does it support multiple sheets?', answer: 'Yes, our converter can handle multi-sheet workbooks and convert them into a single continuous PDF.' },
            { question: 'Will my formulas be visible?', answer: 'The PDF will show the results of your formulas (the values), just like when you print a spreadsheet.' },
            { question: 'Is there a row limit?', answer: 'Our tool can handle large spreadsheets, but extremely large data sets may take a few extra seconds to render.' }
        ],
        relatedTools: ['word-to-pdf', 'pdf-to-excel']
    }),
    createTool({
        id: 'ppt-to-pdf', slug: 'convert/ppt-to-pdf', name: 'PowerPoint to PDF', shortName: 'PPT → PDF',
        category: 'convert-to-pdf', icon: Presentation, bgGradient: 'from-orange-600 to-orange-700',
        description: 'Convert PowerPoint presentations to PDF',
        metaDescription: 'Convert PPT to PDF online for free. Transform your slides into professional PDF handouts. High-quality conversion for PPT and PPTX.',
        longDescription: `Turn your presentations into portable handouts with PDF PhD's PowerPoint to PDF converter. This tool is perfect for speakers, teachers, and business professionals who want to share their slides in a format that works on every device.

We ensure that every slide transition, image, and text box is captured perfectly in the resulting PDF. Whether you use PPT or PPTX, your presentation will maintain its visual impact without the risk of formatting shifts when opened on different computers.

By processing your slides locally in your browser, PDF PhD guarantees that your intellectual property and presentation content remain private. No more waiting for uploads or worrying about server leaks—get your PDF conversion done instantly and securely.`,
        keywords: ['ppt to pdf', 'powerpoint to pdf', 'pptx to pdf', 'convert slides to pdf', 'ppt to pdf online free'],
        howItWorks: [
            { step: 1, title: 'Upload Slides', description: 'Drop your .ppt or .pptx presentation file into the converter.' },
            { step: 2, title: 'Convert Slides', description: 'Each slide is rendered precisely into a high-DPI PDF page.' },
            { step: 3, title: 'Download Output', description: 'Save your presentation as a PDF and share it with your audience.' }
        ],
        useCases: [
            { title: 'Meeting Handouts', description: 'Convert presentation slides into PDFs for printing or digital distribution to attendees.' },
            { title: 'Portfolio Sharing', description: 'Share your creative or professional portfolio in a single, stable PDF file.' },
            { title: 'Academic Lectures', description: 'Save lecture slides as PDFs for students to annotate and study.' }
        ],
        faq: [
            { question: 'Are animations preserved?', answer: 'PDFs are static documents, so slide animations and transitions will be removed, leaving the final look of each slide.' },
            { question: 'Will my fonts stay the same?', answer: 'Yes, we embed fonts to ensure your presentation looks identical on all systems.' },
            { question: 'Can I convert large decks?', answer: 'Yes, our tool efficiently handles presentations with many slides and heavy imagery.' }
        ],
        relatedTools: ['word-to-pdf', 'pdf-to-ppt']
    }),
    createTool({
        id: 'image-to-pdf', slug: 'convert/image-to-pdf', name: 'Image to PDF', shortName: 'Image → PDF',
        category: 'convert-to-pdf', icon: Image, bgGradient: 'from-pink-500 to-pink-600',
        description: 'Convert JPG, PNG, and other images to PDF',
        metaDescription: 'Convert Image to PDF online for free. Transform JPG, PNG, and BMP files into professional PDF documents instantly. Secure local browser processing.',
        longDescription: `Turn your visual content into professional documents with PDF PhD's Image to PDF converter. Whether you're combining photos into a portfolio, converting identity scans, or archiving creative work, our tool creates high-quality PDFs from your image files while preserving every pixel of clarity.

Our converter supports all major image formats, including JPEG, PNG, BMP, and GIF. You can upload multiple images at once and arrange them in your preferred order before creating the PDF. It's the perfect way to build digital scrapbooks, professional portfolios, or unified sets of scanned receipts.

Security and speed are guaranteed by our local processing technology. Your private photos and sensitive identity documents never leave your browser, providing total privacy that cloud-based converters can't match. No more waiting for uploads—convert your images to PDF instantly and securely.`,
        keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert photo to pdf', 'image to pdf converter free', 'combine images into pdf'],
        howItWorks: [
            { step: 1, title: 'Upload Images', description: 'Drag and drop your photos or image files into the converter window.' },
            { step: 2, title: 'Arrange Order', description: 'Reorder your images to determine their sequence in the final PDF document.' },
            { step: 3, title: 'Download PDF', description: 'Save your professionally formatted image-based PDF directly to your device.' }
        ],
        useCases: [
            { title: 'Digital Portfolios', description: 'Combine your best creative work into a single, professional PDF for easy sharing with clients.' },
            { title: 'Identity Documentation', description: 'Convert scans of passports or IDs into a single secure PDF for official submissions.' },
            { title: 'Receipt Archiving', description: 'Turn individual photos of business receipts into a unified PDF for expense reporting.' }
        ],
        faq: [
            { question: 'What formats are supported?', answer: 'We support JPG, PNG, BMP, and GIF formats with high-fidelity conversion.' },
            { question: 'Can I combine different formats?', answer: 'Yes! You can mix JPG and PNG files together in a single PDF conversion.' },
            { question: 'Is there an image limit?', answer: 'No, you can combine as many images as you need into a single multi-page PDF.' }
        ],
        featured: true, relatedTools: ['pdf-to-image', 'merge']
    }),
    createTool({
        id: 'html-to-pdf', slug: 'convert/html-to-pdf', name: 'HTML to PDF', shortName: 'HTML → PDF',
        category: 'convert-to-pdf', icon: Globe, bgGradient: 'from-cyan-600 to-cyan-700',
        description: 'Convert web pages and HTML to PDF',
        metaDescription: 'Convert HTML to PDF online for free. Transform web pages, URLs, and HTML code into clean, professional PDF documents. Secure browser-based tool.',
        longDescription: `Archive the web with precision using PDF PhD's HTML to PDF converter. Whether you need to save an online article, a receipt, or a full web page for offline viewing, our tool renders HTML content into high-fidelity PDF documents that preserve fonts, images, and layouts perfectly.

Our conversion engine handles complex CSS and modern web layouts, ensuring that what you see in the browser is what you get in the PDF. It's an invaluable tool for researchers, developers, and anyone who needs a permanent, portable snapshot of web content.

Privacy is built into our core. Since the rendering happens entirely within your browser, your private web sessions and sensitive URLs are never exposed to our servers. Experience the fastest and most secure way to convert web pages to PDF without ever leaving your device.`,
        keywords: ['html to pdf', 'webpage to pdf', 'url to pdf', 'convert website to pdf', 'save webpage as pdf', 'html to pdf converter online'],
        howItWorks: [
            { step: 1, title: 'Enter URL or HTML', description: 'Paste the web address or directly input the HTML code you want to convert.' },
            { step: 2, title: 'Render Content', description: 'Our browser-based engine captures the web layout and prepares the document.' },
            { step: 3, title: 'Save Your PDF', description: 'Download your high-resolution PDF snapshot of the web content.' }
        ],
        useCases: [
            { title: 'Article Archiving', description: 'Save online news articles and blog posts for permanent offline reading and reference.' },
            { title: 'Payment Receipts', description: 'Convert online order confirmations and digital receipts into portable PDF records.' },
            { title: 'Dev Documentation', description: 'Save web-based code documentation and technical guides as PDFs for easy access.' }
        ],
        faq: [
            { question: 'Does it capture images?', answer: 'Yes, our converter captures all images as long as they are publicly accessible via the web.' },
            { question: 'Will the links work?', answer: 'Yes, we preserve hyperlinks in the resulting PDF, making it fully interactive.' },
            { question: 'Can it convert private pages?', answer: 'It can convert any HTML you Paste directly, or public URLs that our engine can reach.' }
        ],
        relatedTools: ['word-to-pdf']
    }),

    // === CONVERT PDF TO... TOOLS (7) ===
    createTool({
        id: 'pdf-to-word', slug: 'convert/pdf-to-word', name: 'PDF to Word', shortName: 'PDF → Word',
        category: 'convert-from-pdf', icon: FileDown, bgGradient: 'from-blue-500 to-indigo-600',
        description: 'Convert PDF files to editable Word documents',
        metaDescription: 'Convert PDF to Word online for free. Transform PDF documents into editable Microsoft Word (.docx) files accurately. 100% secure with local browser processing.',
        longDescription: `PDF PhD's PDF to Word converter is built for accuracy and privacy. Reclaiming your content from a PDF has never been easier—our tool intelligently reconstructs your document structure, preserving paragraphs, tables, and lists in an editable .docx format.

Why use PDF PhD? Most online converters send your sensitive documents to the cloud. Our technology works 100% locally in your browser. This means your private reports, academic papers, and business documents stay on your machine, ensuring total data sovereignty.

Our conversion engine handles complex layouts and includes OCR (Optical Character Recognition) capabilities to extract text from scanned PDFs. Whether you're a student needing to edit a research paper or a professional updating a legacy contract, PDF PhD delivers high-fidelity Word documents ready for editing.`,
        keywords: ['pdf to word', 'convert pdf to docx', 'pdf to doc', 'edit pdf in word', 'free pdf to word converter online'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the PDF document you want to convert into an editable Word file.' },
            { step: 2, title: 'Extract Content', description: 'Our engine reconstructs the document layout and text elements into Word format.' },
            { step: 3, title: 'Download Word', description: 'Save your editable .docx file and start editing in Microsoft Word or Google Docs.' }
        ],
        useCases: [
            { title: 'Document Editing', description: 'Transform fixed PDF reports back into editable Word documents for fast updates.' },
            { title: 'Content Extraction', description: 'Quickly pull text and tables from PDFs into Word or Outlook for easier sharing.' },
            { title: 'Legacy Updates', description: 'Revive old PDF documents when the original source files have been lost.' }
        ],
        faq: [
            { question: 'Is the conversion accurate?', answer: 'Yes! We use advanced layout reconstruction to keep your text, fonts, and images in the right place.' },
            { question: 'Does it work with scanned PDFs?', answer: 'Yes, our built-in OCR technology extracts text from scanned documents and images within the PDF.' },
            { question: 'Is it really free?', answer: 'Absolutely. Use our PDF to Word converter as much as you need with no limits and no watermarks.' }
        ],
        featured: true, relatedTools: ['word-to-pdf', 'pdf-to-excel', 'ocr']
    }),
    createTool({
        id: 'pdf-to-excel', slug: 'convert/pdf-to-excel', name: 'PDF to Excel', shortName: 'PDF → Excel',
        category: 'convert-from-pdf', icon: Table, bgGradient: 'from-green-500 to-emerald-600',
        description: 'Convert PDF tables to Excel spreadsheets',
        metaDescription: 'Convert PDF to Excel online for free. Extract tables from PDF into editable XLS and XLSX spreadsheets. High-accuracy data extraction processed locally.',
        longDescription: `Stop manual data entry and start using PDF PhD's PDF to Excel converter. We specialize in identifying and extracting tabular data from PDF files, turning static columns and rows into fully editable Microsoft Excel spreadsheets.

Our tool is designed for precision. It recognizes table borders, cell alignments, and data types to ensure that your numbers, dates, and text are correctly placed in the resulting .xlsx file. It's the ideal solution for accountants, researchers, and analysts who need to work with data trapped in PDF reports.

Security is essential when handling financial data. PDF PhD processes your sensitive files locally in your browser. Your spreadsheets and business data never touch our servers, providing the ultimate privacy protection for your project's data.`,
        keywords: ['pdf to excel', 'pdf to xlsx', 'extract tables from pdf', 'pdf to excel converter free', 'tabular data extraction'],
        howItWorks: [
            { step: 1, title: 'Select PDF', description: 'Upload the PDF document containing the tables you need to extract.' },
            { step: 2, title: 'Analyze Tables', description: 'Our engine scans the document to find and structure all tabular data.' },
            { step: 3, title: 'Get Excel File', description: 'Download your editable .xlsx spreadsheet and start analyzing your data.' }
        ],
        useCases: [
            { title: 'Financial Analysis', description: 'Transfer annual reports and bank statements into Excel for faster calculation and analysis.' },
            { title: 'Inventory Management', description: 'Convert PDF price lists and inventory sheets into manageable spreadsheets.' },
            { title: 'Scientific Research', description: 'Extract data tables from academic papers to use in your own research and models.' }
        ],
        faq: [
            { question: 'Will it keep the formatting?', answer: 'We preserve the structure of the tables, including columns and rows, so the data remains organized.' },
            { question: 'Can it handle merged cells?', answer: 'Yes, our advanced table recognition engine is designed to handle complex cell structures.' },
            { question: 'Is there a limit on table size?', answer: 'No, our tool can extract tables spanning multiple pages in a single conversion.' }
        ],
        relatedTools: ['excel-to-pdf', 'pdf-to-word']
    }),
    createTool({
        id: 'pdf-to-ppt', slug: 'convert/pdf-to-ppt', name: 'PDF to PowerPoint', shortName: 'PDF → PPT',
        category: 'convert-from-pdf', icon: Presentation, bgGradient: 'from-orange-500 to-red-600',
        description: 'Convert PDF to PowerPoint presentations',
        metaDescription: 'Convert PDF to PPT online for free. Transform PDF pages into editable PowerPoint (.pptx) slides. Secure, fast, and high-quality slide reconstruction.',
        longDescription: `Turn your static documents back into dynamic presentations with PDF PhD's PDF to PowerPoint converter. Whether you need to fix a typo in a slide deck or repurpose document content for a meeting, our tool reconstructs PDF pages into editable .pptx slides.

We prioritize layout fidelity. Our slide reconstruction engine treats each PDF page as a slide, positioning text boxes and images logically to make editing as easy as possible. It's a powerful tool for marketing teams, educators, and executives who need to repurpose existing PDF content.

Your presentation stays private. Since PDF PhD converts slides directly in your browser, your proprietary business plans and confidential lecture notes never leave your computer. Experience the speed of local processing combined with the security of a desktop app, all in your web browser.`,
        keywords: ['pdf to ppt', 'pdf to powerpoint', 'pdf to pptx', 'convert pdf slides to ppt', 'free pdf to ppt converter'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the PDF file that you want to convert back into a presentation.' },
            { step: 2, title: 'Create Slides', description: 'Our engine rebuilds the presentation structure, slide by slide.' },
            { step: 3, title: 'Download PPTX', description: 'Get your editable PowerPoint file and start refining your presentation.' }
        ],
        useCases: [
            { title: 'Slide Deck Updates', description: 'Convert finished PDF slide decks back to PowerPoint to make last-minute edits.' },
            { title: 'Webinar Preparation', description: 'Transform PDF whitepapers into slide decks for webinars and online classes.' },
            { title: 'Meeting Presentations', description: 'Repurpose document content into professional slides for internal meetings.' }
        ],
        faq: [
            { question: 'Can I edit the text?', answer: 'Yes, our converter aims to make text boxes editable so you can change content directly in PowerPoint.' },
            { question: 'What about images?', answer: 'All images are extracted and placed on slides in their original quality.' },
            { question: 'Is it compatible with Google Slides?', answer: 'Yes, the resulting .pptx file can be easily uploaded and edited in Google Slides.' }
        ],
        relatedTools: ['ppt-to-pdf', 'pdf-to-word']
    }),
    createTool({
        id: 'pdf-to-image', slug: 'convert/pdf-to-image', name: 'PDF to Image', shortName: 'PDF → Image',
        category: 'convert-from-pdf', icon: Image, bgGradient: 'from-purple-500 to-pink-600',
        description: 'Convert PDF pages to JPG, PNG, or TIFF images',
        metaDescription: 'Convert PDF to Image online for free. Transform PDF pages into high-resolution JPG or PNG files. Safe, fast browser-based conversion.',
        longDescription: `Extract the visual power of your documents with PDF PhD's PDF to Image converter. Easily transform every page of your PDF into high-quality JPEG or PNG images, perfect for social media, web integration, or embedding in presentations.

Our high-fidelity rendering engine preserves every detail of your document, including vibrant colors, sharp text, and complex diagrams. You can choose to convert individual pages or export the entire document as a ZIP file of images.

Because we value your privacy, all image processing happens on your device. Your sensitive blueprints, creative designs, and legal documents are never sent across the internet, making PDF PhD the most secure choice for document-to-image conversion.`,
        keywords: ['pdf to image', 'pdf to jpg', 'pdf to png', 'convert pdf to jpeg', 'extract images from pdf'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the PDF document you want to turn into images.' },
            { step: 2, title: 'Render Pages', description: 'We render each page as a high-resolution image file in your browser.' },
            { step: 3, title: 'Save Images', description: 'Download individual pages or the entire document as a collection of images.' }
        ],
        useCases: [
            { title: 'Social Media Posts', description: 'Convert PDF newsletters or flyers into images for easy sharing on LinkedIn or Instagram.' },
            { title: 'Web Design', description: 'Turn PDF brochures into high-quality web images for your site or portfolio.' },
            { title: 'Document Thumbnails', description: 'Create high-resolution preview images for your documents and projects.' }
        ],
        faq: [
            { question: 'What formats are supported?', answer: 'We support conversion to JPG, PNG, and TIFF formats.' },
            { question: 'Can I select specific pages?', answer: 'Yes, you can choose to convert the whole document or just a selection of pages.' },
            { question: 'Will the resolution be high?', answer: 'Yes, we render images at high DPI to ensure text and diagrams remain sharp.' }
        ],
        relatedTools: ['image-to-pdf', 'pdf-to-word']
    }),
    createTool({
        id: 'pdf-to-text', slug: 'convert/pdf-to-text', name: 'PDF to Text', shortName: 'PDF → Text',
        category: 'convert-from-pdf', icon: FileText, bgGradient: 'from-slate-500 to-slate-600',
        description: 'Extract text content from PDF documents',
        metaDescription: 'Convert PDF to Text online for free. Extract plain text from PDF documents instantly. Secure browser-based tool with high-accuracy extraction.',
        longDescription: `Strip away the formatting and get right to the content with PDF PhD's PDF to Text converter. If you need to repurpose document content for a script, a database, or a simple text file, our tool extracts the raw text layer from your PDF with perfect character accuracy.

Our extraction engine handles multi-column layouts, special characters, and various encodings to ensure your resulting .txt file is clean and usable. It's the perfect companion for developers, researchers, and writers who need to analyze or search large volumes of document content.

Privacy is paramount when handling sensitive document text. Your files are processed 100% locally in your web browser. Whether you're extracting data from private research or confidential reports, PDF PhD ensures your text never leaves your device during the conversion process.`,
        keywords: ['pdf to text', 'extract text from pdf', 'pdf to txt', 'convert pdf to plain text free', 'text extraction tool online'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the document you want to extract text from.' },
            { step: 2, title: 'Extract Content', description: 'Our engine parses the document layers to pull out all readable text.' },
            { step: 3, title: 'Download TXT', description: 'Save your content as a clean, plain text file ready for any editor.' }
        ],
        useCases: [
            { title: 'Data Cleaning', description: 'Extract raw text from PDF reports for use in data analysis and cleaning pipelines.' },
            { title: 'Content Repurposing', description: 'Quickly pull text from PDFs to rewrite or repurpose for blogs, social media, or scripts.' },
            { title: 'Fast Searching', description: 'Convert large PDF libraries to text for lightning-fast keyword searching and indexing.' }
        ],
        faq: [
            { question: 'Does it support special characters?', answer: 'Yes, we support UTF-8 encoding to preserve international characters and symbols.' },
            { question: 'Will it keep the layout?', answer: 'Plain text removes all styling and images, providing just the raw character data in sequence.' },
            { question: 'Can it handle scanned PDFs?', answer: 'For scanned documents without a text layer, please use our OCR tool first.' }
        ],
        relatedTools: ['ocr', 'pdf-to-word']
    }),
    createTool({
        id: 'pdf-a', slug: 'convert/pdf-a', name: 'Convert to PDF/A', shortName: 'PDF/A',
        category: 'convert-from-pdf', icon: FileCheck, bgGradient: 'from-emerald-500 to-teal-600',
        description: 'Convert PDF to archival PDF/A format',
        metaDescription: 'Convert PDF to PDF/A online for free. Transform your documents into the industry-standard format for long-term archiving and preservation.',
        longDescription: `Ensure your documents remain readable for decades with PDF PhD's PDF/A converter. PDF/A is an ISO-standardized version of PDF specialized for use in the archiving and long-term preservation of digital documents. It ensures that your files will open exactly the same way in 50 years as they do today.

Our conversion engine embeds all fonts, removes non-archival elements like JavaScript and external links, and ensures color spaces are device-independent. This makes it an essential tool for legal professionals, government agencies, and corporate archivists who need to maintain permanent digital records.

Security and standards go hand-in-hand. Because PDF PhD converts your files locally, your sensitive records and permanent archives are never exposed to external servers. Experience professional-grade archival conversion with total privacy, right in your browser.`,
        keywords: ['pdf to pdfa', 'pdfa conversion', 'archival pdf', 'iso standard pdf', 'convert pdf for long term storage', 'pdf preservation'],
        howItWorks: [
            { step: 1, title: 'Select PDF', description: 'Upload the document you want to convert for long-term storage.' },
            { step: 2, title: 'Validate & Convert', description: 'Our engine applies the strict PDF/A standards for embedding and compliance.' },
            { step: 3, title: 'Save Archival PDF', description: 'Download your ISO-compliant PDF/A file, ready for your digital archive.' }
        ],
        useCases: [
            { title: 'Legal Records', description: 'Store court filings and legal agreements in the standard format required for long-term judicial records.' },
            { title: 'Government Filings', description: 'Prepare documents for submission to government agencies that require PDF/A compliance.' },
            { title: 'Corporate Archiving', description: 'Ensure that critical business records remain accessible throughout the company\'s lifetime.' }
        ],
        faq: [
            { question: 'Which PDF/A version is it?', answer: 'We typically target PDF/A-2b for the best balance of compatibility and preservation.' },
            { question: 'Are links allowed?', answer: 'PDF/A standards generally disable external links to ensure the document is self-contained.' },
            { question: 'Does it increase file size?', answer: 'Embedding all fonts and color profiles may slightly increase the file size to ensure total portability.' }
        ],
        relatedTools: ['compress', 'protect']
    }),
    createTool({
        id: 'grayscale', slug: 'convert/grayscale', name: 'PDF to Grayscale', shortName: 'Grayscale',
        category: 'convert-from-pdf', icon: Palette, bgGradient: 'from-gray-500 to-gray-600',
        description: 'Convert color PDF to black and white',
        metaDescription: 'Convert PDF to Grayscale online for free. Remove color and transform your PDF documents into clean black and white files. Secure local processing.',
        longDescription: `Save ink and create professional monochrome documents with PDF PhD's Grayscale tool. Whether you're preparing a document for black and white printing or want to create a clean, classic look for a report, our tool removes all color data from your PDF perfectly.

Our conversion engine handles images, text, and vector graphics, translating every hue into its precise tonal equivalent in grayscale. It's the ideal solution for photographers creating proof sheets, architects printing plans, or businesses wanting to reduce printing costs.

Privacy is built into our core. All color transformation happens locally in your web browser. Your sensitive designs, private photos, and business documents are never uploaded to a server, providing a secure and lightning-fast way to grayscale your PDF.`,
        keywords: ['pdf grayscale', 'pdf black and white', 'remove color from pdf', 'convert pdf to monochrome free', 'save ink pdf printing'],
        howItWorks: [
            { step: 1, title: 'Upload Color PDF', description: 'Select the document you want to convert to black and white.' },
            { step: 2, title: 'Convert Tones', description: 'We map all colors to a high-fidelity grayscale spectrum.' },
            { step: 3, title: 'Download Monochrome', description: 'Save your document and get ready for efficient, high-quality B&W printing.' }
        ],
        useCases: [
            { title: 'Print Cost Savings', description: 'Reduce the cost of bulk printing by converting color-heavy reports into ink-efficient grayscale.' },
            { title: 'Professional Aesthetic', description: 'Create a classic, high-contrast look for photography portfolios and design presentations.' },
            { title: 'Facsimile Preparation', description: 'Prepare documents for faxing or scanning systems that only support monochrome output.' }
        ],
        faq: [
            { question: 'Will it be blurry?', answer: 'No, we preserve the original resolution and sharpness of all images and text.' },
            { question: 'Can I undo it?', answer: 'Conversion is permanent in the new file we create, so keep your original color PDF safely.' },
            { question: 'Does it reduce file size?', answer: 'Removing color data often results in a smaller file size, making the document easier to share.' }
        ],
        relatedTools: ['compress', 'print']
    }),

    // === EDIT TOOLS (10) ===
    createTool({
        id: 'edit', slug: 'edit', name: 'Annotate PDF', shortName: 'Annotate',
        category: 'edit', type: 'visual', icon: Highlighter, bgGradient: 'from-violet-500 to-purple-600',
        description: 'Add highlights, comments, and drawings',
        metaDescription: 'Annotate PDF online for free. Add highlights, text comments, shapes, and freehand drawings to your PDF documents. Secure local browser editing.',
        longDescription: `Mark up your documents with precision using PDF PhD's Annotate tool. Our visual editor provides a suite of professional markup tools, including highlighters, underlines, stamps, and comment boxes, making it easy to review and collaborate on any PDF file.

Our annotation engine allows you to draw shapes, add sticky notes, and even use a freehand pen tool for signing or sketching. It's the ideal solution for students reviewing lecture notes, professionals proofreading reports, or teams collaborating on design drafts.

Total privacy is guaranteed by our browser-based technology. Your documents and annotations are processed entirely on your machine. Your sensitive records and private comments never reach our servers, giving you the fastest and most secure PDF markup experience available today.`,
        keywords: ['edit pdf', 'edit pdf text', 'modify pdf', 'annotate pdf', 'highlight pdf', 'pdf markup tool online', 'add comments to pdf'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the document you want to review and annotate.' },
            { step: 2, title: 'Apply Markup', description: 'Use the toolbar to add highlights, comments, shapes, and drawings.' },
            { step: 3, title: 'Save Edits', description: 'Download your annotated PDF with all markups permanently embedded.' }
        ],
        useCases: [
            { title: 'Academic Review', description: 'Highlight key concepts and add study notes directly onto your textbook or research PDFs.' },
            { title: 'Document Proofreading', description: 'Mark up typos, suggest changes, and add comments for project collaborators.' },
            { title: 'Remote Collaboration', description: 'Draw arrows and shapes to call out specific details in shared architectural or design plans.' }
        ],
        faq: [
            { question: 'Are the markups standard?', answer: 'Yes, our annotations are fully compatible with Adobe Acrobat and other standard PDF readers.' },
            { question: 'Can I delete annotations?', answer: 'Yes, you can select and remove any markups you\'ve added before saving the final file.' },
            { question: 'Does it work on mobile?', answer: 'Yes, our responsive editor supports touch gestures for drawing and highlighting on tablets and phones.' }
        ],
        featured: true, relatedTools: ['add-text', 'watermark']
    }),
    createTool({
        id: 'add-text', slug: 'add-text', name: 'Add Text to PDF', shortName: 'Add Text',
        category: 'edit', type: 'visual', icon: PenLine, bgGradient: 'from-yellow-500 to-amber-600',
        description: 'Add new text boxes to PDF documents',
        metaDescription: 'Add text to PDF online for free. Type on any PDF, fill out forms, or insert new text boxes with custom fonts and colors. Secure local processing.',
        longDescription: `Type anywhere on your PDF with PDF PhD's Add Text tool. Whether you're filling out a non-interactive form, adding a header to a report, or inserting new content into an existing document, our visual editor makes it as easy as using a word processor.

Our text engine allows you to customize fonts, sizes, colors, and text alignment. You can place text boxes exactly where you need them and move or resize them at any time. It's the perfect solution for updating resumes, completing applications, or adding labels to diagrams.

Security is our priority. Since the text insertion happens locally in your browser, your sensitive personal information and document content are never uploaded to a server. Experience the fastest and most private way to type on a PDF right in your web browser.`,
        keywords: ['add text to pdf', 'insert text pdf', 'type on pdf', 'fill out pdf form', 'add text box to pdf online', 'edit pdf text free'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the document you need to type on or fill out.' },
            { step: 2, title: 'Type Anywhere', description: 'Click anywhere on the page to create a text box and start typing.' },
            { step: 3, title: 'Download Output', description: 'Save your document with the new text elements integrated into the PDF.' }
        ],
        useCases: [
            { title: 'Form Completion', description: 'Easily fill out static PDF forms and applications that don\'t have interactive fields.' },
            { title: 'Resume Updates', description: 'Add new contact information or job details directly to your existing PDF resume.' },
            { title: 'Digital Labeling', description: 'Add clear, professional text labels to charts, maps, and technical drawings.' }
        ],
        faq: [
            { question: 'Can I change the font?', answer: 'Yes, we provide a selection of standard fonts and allow you to choose custom sizes and colors.' },
            { question: 'Is the text searchable?', answer: 'Yes, the text you add is embedded as a real text layer, making it fully searchable.' },
            { question: 'Can I move the text later?', answer: 'In our editor, you can move and resize any text boxes you\'ve added before you save the file.' }
        ],
        relatedTools: ['edit', 'annotate']
    }),
    createTool({
        id: 'add-image', slug: 'add-image', name: 'Add Image to PDF', shortName: 'Add Image',
        category: 'edit', type: 'visual', icon: ImagePlus, bgGradient: 'from-pink-500 to-rose-600',
        description: 'Insert images into PDF documents',
        metaDescription: 'Add image to PDF online for free. Insert logos, photos, or signatures into any PDF document with our visual editor. Secure local processing.',
        longDescription: `Enrich your documents with PDF PhD's Add Image tool. Whether you're adding a corporate logo to a letterhead, inserting a photo into a report, or placing a signature scan, our visual editor allows you to place, resize, and rotate any image within your PDF effortlessly.

Our image engine supports all major formats like JPG, PNG, and GIF. You can precisely position your images using our drag-and-drop interface and even adjust transparency for a professional look. It's the ideal way to brand your PDFs or add visual evidence to technical reports.

Privacy is built-in. Your images and documents are processed locally on your device. Your sensitive company logos and private photos never touch our servers, providing the highest level of security for your professional and personal projects.`,
        keywords: ['add image to pdf', 'insert picture pdf', 'add logo to pdf', 'insert image into pdf online', 'pdf image editor free'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the document you want to enhance with images.' },
            { step: 2, title: 'Insert & Position', description: 'Upload your image and drag it to the desired location on the page.' },
            { step: 3, title: 'Save Integrated PDF', description: 'Download your updated document with the images perfectly embedded.' }
        ],
        useCases: [
            { title: 'Corporate Branding', description: 'Add high-resolution company logos to your invoices, letters, and reports.' },
            { title: 'Document Illustration', description: 'Insert photographs and diagrams to provide visual context in manuals and guides.' },
            { title: 'Digital Signatures', description: 'Place a scan of your handwritten signature onto contracts and official forms.' }
        ],
        faq: [
            { question: 'What image types work?', answer: 'We support JPG, PNG, and GIF files, including images with transparency.' },
            { question: 'Can I resize the image?', answer: 'Yes, you can drag the corners of the image to scale it perfectly to your needs.' },
            { question: 'Does it affect file size?', answer: 'We optimize images during insertion to keep your PDF file size manageable.' }
        ],
        relatedTools: ['edit', 'watermark']
    }),
    createTool({
        id: 'bates', slug: 'bates', name: 'Bates Numbering', shortName: 'Bates',
        category: 'edit', type: 'visual', icon: Hash, bgGradient: 'from-emerald-500 to-teal-600',
        description: 'Add Bates numbering for legal document identification',
        metaDescription: 'Add Bates numbering to PDF online for free. Professional legal document numbering and indexing. Secure local browser-based tool.',
        longDescription: `Achieve professional legal organization with PDF PhD's Bates Numbering tool. Bates numbering (also known as Bates stamping) is the industry standard for identifying and retrieving legal documents. Our tool allows you to add unique, sequential identifiers to every page of your document collection.

Our Bates engine is highly customizable—you can define prefixes, suffixes, number length, and start values. You can also control the precise placement, font, and color of the numbering to meet specific court or discovery requirements.

Total privacy is essential for legal discovery. Because PDF PhD processes your documents locally, your sensitive case files and private exhibits are never uploaded to a server. Experience reliable, professional-grade Bates numbering with the security of a desktop app, right in your web browser.`,
        keywords: ['bates numbering', 'bates stamp', 'legal document numbering', 'pdf bates stamping online', 'add bates numbers free'],
        howItWorks: [
            { step: 1, title: 'Upload Legal Files', description: 'Select the document or set of documents you need to index.' },
            { step: 2, title: 'Configure Bates', description: 'Define your prefix, starting number, and position on the page.' },
            { step: 3, title: 'Apply & Index', description: 'Download your document with sequential Bates numbers professionally applied.' }
        ],
        useCases: [
            { title: 'Litigation Discovery', description: 'Prepare document productions for court by adding unique, traceable identifiers to every page.' },
            { title: 'Evidence Management', description: 'Organize exhibits and records for trials and hearings with consistent numbering.' },
            { title: 'Corporate Archiving', description: 'Index large sets of corporate records for easier retrieval during audits and reviews.' }
        ],
        faq: [
            { question: 'Can I use prefixes?', answer: 'Yes, you can add custom text prefixes like "SMITH_EXHIBIT_" before the numbers.' },
            { question: 'Does it work with multiple files?', answer: 'Yes, you can apply sequential numbering across a batch of multiple PDF documents.' },
            { question: 'Is it court-compliant?', answer: 'Our tool follows standard legal numbering formats used by modern legal professionals.' }
        ],
        featured: true, relatedTools: ['page-numbers', 'watermark']
    }),
    createTool({
        id: 'page-numbers', slug: 'page-numbers', name: 'Add Page Numbers', shortName: 'Page Numbers',
        category: 'edit', type: 'visual', icon: ListOrdered, bgGradient: 'from-blue-500 to-cyan-600',
        description: 'Add page numbers to PDF documents',
        metaDescription: 'Add page numbers to PDF online for free. Index your documents with professional pagination. Secure local processing in your browser.',
        longDescription: `Organize your long documents with PDF PhD's Page Numbers tool. Adding pagination is essential for reports, ebooks, and academic papers to help readers navigate your content. Our visual editor allows you to place page numbers exactly where you want them.

Our numbering engine gives you total control over the format (e.g., "Page 1" or "1 of 20"), font, size, and position (header or footer). You can even exclude the first page or start numbering from a specific value.

Security is built-in. Your document and its new page numbers are processed entirely on your machine. Your private books, sensitive reports, and academic papers are never uploaded to a server, providing the fastest and most secure way to paginate your PDF.`,
        keywords: ['add page numbers pdf', 'number pdf pages', 'pdf pagination', 'insert page numbers online free', 'label pdf pages'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the document you want to paginate.' },
            { step: 2, title: 'Set Style', description: 'Choose the number format, font, and position on the page.' },
            { step: 3, title: 'Save Numbered PDF', description: 'Download your document with professional page numbers applied to all selected pages.' }
        ],
        useCases: [
            { title: 'Report Creation', description: 'Finish professional business reports with consistent, easy-to-read page numbers.' },
            { title: 'Academic Thesis', description: 'Paginate long academic papers and dissertations according to school requirements.' },
            { title: 'Manuals & Guides', description: 'Add numbering to technical manuals to make the table of contents useful and accurate.' }
        ],
        faq: [
            { question: 'Can I skip the title page?', answer: 'Yes, you can choose to start numbering from the second page or any specific page index.' },
            { question: 'What formats are available?', answer: 'We support standard numbers, Roman numerals, and "X of Y" formats.' },
            { question: 'Is the text customizable?', answer: 'Yes, you can pick the font, size, and color to match your document\'s style.' }
        ],
        relatedTools: ['bates', 'header-footer']
    }),
    createTool({
        id: 'header-footer', slug: 'header-footer', name: 'Header & Footer', shortName: 'Header/Footer',
        category: 'edit', type: 'visual', icon: AlignCenter, bgGradient: 'from-indigo-500 to-blue-600',
        description: 'Add headers and footers to PDF pages',
        metaDescription: 'Add header and footer to PDF online for free. Insert titles, dates, or custom text at the top or bottom of your PDF pages. Secure local tool.',
        longDescription: `Professionalize your documents with PDF PhD's Header & Footer tool. Adding consistent information to every page, such as document titles, company names, or dates, is essential for maintaining a professional look in reports and formal correspondence.

Our visual editor allows you to type custom text and position it in the left, center, or right areas of the header and footer. You can customize the font and size to perfectly match your existing document design. It's the ideal way to add disclaimers, copyright notices, or project names to your PDF.

Privacy is our cornerstone. The header and footer insertion happens entirely in your web browser. Your sensitive reports and private letters never leave your device, ensuring total security and privacy for your business and personal communications.`,
        keywords: ['pdf header footer', 'add header pdf', 'add footer pdf', 'insert custom text pdf online', 'pdf styling free'],
        howItWorks: [
            { step: 1, title: 'Select PDF', description: 'Upload the document you want to brand or organize with headers and footers.' },
            { step: 2, title: 'Enter Text', description: 'Type your desired content into the header or footer sections and adjust the layout.' },
            { step: 3, title: 'Download Branded PDF', description: 'Save your document with consistent metadata applied to every page.' }
        ],
        useCases: [
            { title: 'Project Branding', description: 'Add project names and version numbers to the footer of every architectural or technical plan.' },
            { title: 'Legal Disclaimers', description: 'Insert required legal notices or confidentiality disclaimers at the bottom of every page.' },
            { title: 'Corporate Identity', description: 'Add your company name and website URL to whitepapers and reports.' }
        ],
        faq: [
            { question: 'Can I add different text?', answer: 'Yes, you can add different text to the left, center, and right sections of both the header and footer.' },
            { question: 'Will it overlap my content?', answer: 'You can adjust the margins and position to ensure the text doesn\'t obscure your document data.' },
            { question: 'Does it apply to all pages?', answer: 'Yes, but you can also choose to exclude specific pages like the cover.' }
        ],
        relatedTools: ['page-numbers', 'watermark']
    }),
    createTool({
        id: 'ocr', slug: 'ocr', name: 'OCR - Text Recognition', shortName: 'OCR',
        category: 'edit', type: 'visual', icon: ScanText, bgGradient: 'from-indigo-500 to-indigo-600',
        description: 'Extract text from scanned documents and images',
        metaDescription: 'Online OCR for PDF free. Convert scanned PDF to editable text and searchable PDF documents. High-accuracy text recognition processed locally.',
        longDescription: `Make your scanned documents searchable and editable with PDF PhD's OCR (Optical Character Recognition) tool. If you have a PDF that is essentially a collection of images, our tool uses advanced AI to recognize characters and layers them back into the document as searchable text.

Why use our OCR? Most online OCR services are slow and require document uploads. PDF PhD's OCR engine runs entirely in your browser, providing lightning-fast text recognition without ever sending your sensitive documents to a server. It's the perfect solution for digitizing legacy paperwork, invoices, and historical archives.

Our OCR supports multiple languages and handles complex layouts, rotated text, and low-quality scans with impressive accuracy. Once processed, you can highlight text, search for keywords, or convert the entire document to an editable Word file.`,
        keywords: ['ocr pdf', 'pdf ocr', 'scanned pdf to text', 'searchable pdf', 'extract text from image pdf', 'free ocr online'],
        howItWorks: [
            { step: 1, title: 'Upload Scanned PDF', description: 'Select the image-based or scanned PDF you want to make searchable.' },
            { step: 2, title: 'Run Text Recognition', description: 'Our AI engine scans the pages to identify characters and document structure.' },
            { step: 3, title: 'Download Searchable PDF', description: 'Get your document back with a new layer of selectable and searchable text.' }
        ],
        useCases: [
            { title: 'Digital Archiving', description: 'Convert boxes of paper records into a searchable digital database for fast information retrieval.' },
            { title: 'Legal Research', description: 'Make discovery documents searchable to quickly find case-critical keywords and names.' },
            { title: 'Accessibility Improvement', description: 'Enable screen readers to process scanned documents for better accessibility compliance.' }
        ],
        faq: [
            { question: 'What languages are supported?', answer: 'We support English, Spanish, French, German, and dozens of other major world languages.' },
            { question: 'Will it change the look of my PDF?', answer: 'No, we add a transparent text layer over your original images, so the visual appearance remains unchanged.' },
            { question: 'How accurate is the OCR?', answer: 'Our engine is highly accurate, though quality depends on the clarity of the original scan.' }
        ],
        featured: true, relatedTools: ['pdf-to-word', 'edit']
    }),
    createTool({
        id: 'watermark', slug: 'watermark', name: 'Add Watermark', shortName: 'Watermark',
        category: 'edit', type: 'visual', icon: Droplet, bgGradient: 'from-sky-500 to-cyan-600',
        description: 'Add text or image watermarks to PDFs',
        metaDescription: 'Watermark PDF online for free. Add text or image watermarks to your PDF documents. Protect your content with semi-transparent stamps. Secure local tool.',
        longDescription: `Protect your intellectual property with PDF PhD's Watermark tool. Adding a watermark is the best way to claim ownership of your work, mark documents as "Draft" or "Confidential", and prevent unauthorized use of your content.

Our visual editor allows you to add either text watermarks or image watermarks (like logos). You can customize the font, rotation, opacity, and positioning to ensure your watermark is visible but doesn't obscure the underlying document. It's a professional solution for photographers, designers, and business professionals.

Safety is non-negotiable. Your documents and watermark images are processed entirely in your web browser. Your private manuscripts and sensitive proprietary designs never leave your computer, providing the ultimate privacy protection while you secure your work.`,
        keywords: ['watermark pdf', 'add watermark to pdf', 'stamp pdf', 'protect pdf online', 'add logo to pdf', 'watermark pdf free'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the document you want to protect with a watermark.' },
            { step: 2, title: 'Design Watermark', description: 'Type your text or upload a logo, then adjust transparency and position.' },
            { step: 3, title: 'Apply & Save', description: 'Download your document with the watermark permanently embedded on all pages.' }
        ],
        useCases: [
            { title: 'Intellectual Property', description: 'Protect your creative designs and professional portfolios with a semi-transparent logo.' },
            { title: 'Status Marking', description: 'Mark documents as "COPY", "DRAFT", or "CONFIDENTIAL" to ensure proper handling.' },
            { title: 'Brand Consistency', description: 'Apply consistent branding to whitepapers and reports intended for public distribution.' }
        ],
        faq: [
            { question: 'Is it permanent?', answer: 'Yes, our watermarks are embedded into the PDF layer, making them very difficult to remove.' },
            { question: 'Can I use an image?', answer: 'Yes, you can upload any JPG or PNG logo to use as a professional watermark.' },
            { question: 'Does it affect text search?', answer: 'No, your underlying text remains fully searchable behind the watermark layer.' }
        ],
        relatedTools: ['protect', 'bates']
    }),
    createTool({
        id: 'stamp', slug: 'stamp', name: 'PDF Stamp', shortName: 'Stamp',
        category: 'edit', type: 'visual', icon: Stamp, bgGradient: 'from-red-500 to-orange-600',
        description: 'Add stamps like Approved, Confidential, Draft',
        metaDescription: 'Stamp PDF online for free. Add standard business stamps like "Approved", "Paid", or "Void" to your documents. Secure local browser processing.',
        longDescription: `Streamline your document workflow with PDF PhD's Stamp tool. Digital stamps provide a fast, professional way to mark document status without needing a physical stamp or printer. Our tool includes a collection of standard business stamps and allows you to create your own.

Our visual editor makes it easy to "stamp" a document anywhere on the page. You can choose from common categories like "Approved", "Urgent", or "Final", and customize their size and rotation. It's the perfect solution for accounting teams, warehouse managers, and office administrators.

Privacy is built-in. Your stamping process happens entirely on your machine. Your private invoices, business contracts, and internal memos are never uploaded to our servers, giving you a secure and lightning-fast way to process your documents.`,
        keywords: ['pdf stamp', 'stamp pdf', 'approved stamp pdf', 'add digital stamp to pdf', 'business stamps online free'],
        howItWorks: [
            { step: 1, title: 'Upload Document', description: 'Select the PDF that needs a status or approval stamp.' },
            { step: 2, title: 'Choose Your Stamp', description: 'Pick from a variety of standard business stamps or upload your own.' },
            { step: 3, title: 'Apply & Download', description: 'Place the stamp on the page and save your updated document instantly.' }
        ],
        useCases: [
            { title: 'Invoicing Workflow', description: 'Mark invoices as "PAID" or "VOID" as you process your business accounts.' },
            { title: 'Approval Cycles', description: 'Digitally "APPROVED" or "REJECTED" project plans and internal requests.' },
            { title: 'Document Status', description: 'Clearly mark documents as "DRAFT" or "FINAL" to ensure everyone is on the same page.' }
        ],
        faq: [
            { question: 'Are standard stamps included?', answer: 'Yes, we provide a library of the most common business and legal stamps.' },
            { question: 'Can I make a custom stamp?', answer: 'Yes, you can upload any image or icon to use as a custom digital stamp.' },
            { question: 'Will it work on mobile?', answer: 'Yes, our visual stamper is designed to work smoothly on both desktop and touch devices.' }
        ],
        relatedTools: ['watermark', 'annotate']
    }),

    // === SECURITY TOOLS (8) ===
    createTool({
        id: 'protect', slug: 'protect', name: 'Protect PDF', shortName: 'Protect',
        category: 'security', icon: Lock, bgGradient: 'from-yellow-500 to-amber-600',
        description: 'Add password protection and encryption to PDFs',
        metaDescription: 'Password protect PDF online for free. Encrypt your PDF documents with strong passwords and control user permissions. Secure local processing guaranteed.',
        longDescription: `Secure your sensitive information with PDF PhD's Protect PDF tool. We provide industry-standard 256-bit AES encryption to lock your documents, ensuring that only users with the correct password can view or modify your content.

Our protection tool goes beyond simple passwords. You can set granular permissions to prevent unauthorized printing, copying, or editing of your PDF. This makes it an essential tool for HR professionals, legal teams, and business owners who need to share confidential data securely.

Total privacy is our hallmark. Unlike other security tools, our encryption process happens 100% locally in your browser. Your password and your files never travel across the network to our servers, providing a level of security that cloud-based services simply cannot match.`,
        keywords: ['protect pdf', 'password protect pdf', 'encrypt pdf', 'lock pdf', 'set pdf permissions', 'pdf security online'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the document you want to encrypt and protect.' },
            { step: 2, title: 'Set Password', description: 'Enter a strong password and choose your desired permission settings.' },
            { step: 3, title: 'Download Secure PDF', description: 'Get your encrypted PDF file, ready for secure distribution.' }
        ],
        useCases: [
            { title: 'Confidential HR Files', description: 'Lock payroll reports and employee contracts before sharing them via email.' },
            { title: 'Intellectual Property', description: 'Protect your creative designs and proprietary business plans from unauthorized copying.' },
            { title: 'Secure Legal Prep', description: 'Ensure that sensitive legal briefs can only be opened by authorized counsel.' }
        ],
        faq: [
            { question: 'What encryption standard is used?', answer: 'We use strong AES-256 bit encryption, the same standard used by governments and financial institutions.' },
            { question: 'Can I restrict printing?', answer: 'Yes, you can specifically disable printing and content copying while still allowing the file to be viewed.' },
            { question: 'What if I forget the password?', answer: 'Since we don\'t store your files or passwords, we cannot recover a forgotten password. Please keep your passwords safe!' }
        ],
        featured: true, relatedTools: ['unlock', 'redact', 'sign']
    }),
    createTool({
        id: 'unlock', slug: 'unlock', name: 'Unlock PDF', shortName: 'Unlock',
        category: 'security', icon: Unlock, bgGradient: 'from-green-500 to-emerald-600',
        description: 'Remove password protection from PDFs',
        metaDescription: 'Unlock PDF online for free. Remove password protection and restrictions from your PDF documents instantly. Fast, secure, and easy to use.',
        longDescription: `Regain access to your documents with PDF PhD's Unlock PDF tool. If you have the password but want to remove it for easier sharing, or if you need to remove printing and copying restrictions, our tool makes it simple and fast.

Our unlocker provides a streamlined way to decrypt your files. Simply enter the document's password once, and our engine will create an unprotected version of the PDF that you can save and share freely. It's the perfect solution for preparing archived documents for a wider audience.

Security and privacy are non-negotiable. The decryption process happens entirely on your machine. Your passwords and decrypted content are never sent to a server, ensuring that your confidential documents remain strictly under your control throughout the unlocking process.`,
        keywords: ['unlock pdf', 'remove pdf password', 'pdf password remover', 'decrypt pdf', 'remove pdf restrictions'],
        howItWorks: [
            { step: 1, title: 'Upload Locked PDF', description: 'Select the password-protected PDF you wish to unlock.' },
            { step: 2, title: 'Enter Password', description: 'Provide the existing password to verify your ownership and decrypt the file.' },
            { step: 3, title: 'Download Unlocked PDF', description: 'Save the new version of your document without any password or restrictions.' }
        ],
        useCases: [
            { title: 'Archive Preparation', description: 'Remove passwords from old records to make them more accessible in your internal archive.' },
            { title: 'Collaboration Workflow', description: 'Unlock a protected brief so team members can easily copy text and add comments.' },
            { title: 'Device Compatibility', description: 'Remove passwords to ensure your PDF opens easily on all e-readers and mobile devices.' }
        ],
        faq: [
            { question: 'Can I unlock a PDF without the password?', answer: 'No. For security and legal reasons, you must know the password to remove encryption from a document.' },
            { question: 'Will it remove all restrictions?', answer: 'Yes, our tool removes both the viewing password and all usage restrictions (printing, copying, etc.).' },
            { question: 'Is there a file size limit?', answer: 'As with all our tools, the only limit is your device\'s memory. Most documents unlock in less than a second.' }
        ],
        relatedTools: ['protect', 'merge']
    }),
    createTool({
        id: 'redact', slug: 'redact', name: 'Redact PDF', shortName: 'Redact',
        category: 'security', type: 'visual', icon: EyeOff, bgGradient: 'from-slate-500 to-slate-600',
        description: 'Permanently remove sensitive information from PDFs',
        metaDescription: 'Redact PDF online for free. Permanently black out and remove sensitive text or images from your documents. Secure local processing for total privacy.',
        longDescription: `Ensure total confidentiality with PDF PhD's Redact PDF tool. Redaction is more than just drawing a black box—our tool permanently removes the underlying data from your PDF, ensuring that sensitive names, numbers, or images can never be recovered.

Use our intuitive visual editor to select specific areas of your document for redaction. You can black out entire paragraphs, hide specific social security numbers, or remove sensitive photographs before sharing documents publicly or with third parties.

Privacy is our priority. Since all redaction processing happens locally in your browser, your unredacted sensitive documents never leave your device. This makes PDF PhD the most secure choice for legal teams, government agencies, and anyone handling private personal data.`,
        keywords: ['redact pdf', 'pdf redaction', 'remove sensitive data pdf', 'black out text pdf', 'censor pdf online', 'permanent data removal pdf'],
        howItWorks: [
            { step: 1, title: 'Upload Document', description: 'Select the document containing sensitive info you need to hide.' },
            { step: 2, title: 'Select Areas', description: 'Use our visual tool to mark the text or images you want to permanently remove.' },
            { step: 3, title: 'Apply & Download', description: 'Our engine scrubs the data and provides a permanently redacted PDF file.' }
        ],
        useCases: [
            { title: 'Legal Compliance', description: 'Remove protected personal information (PII) from court filings and public records.' },
            { title: 'Medical Records', description: 'Censor patient details from medical reports before use in research or training.' },
            { title: 'Business Contracts', description: 'Hide trade secrets or pricing data from contracts before sharing them with partners.' }
        ],
        faq: [
            { question: 'Is redaction permanent?', answer: 'Yes! Unlike simple masking, our tool removes the actual text and image data from the document structure.' },
            { question: 'Can I redact multiple pages?', answer: 'Yes, you can move through your entire document and apply redactions wherever needed.' },
            { question: 'Is local processing safer?', answer: 'Absolutely. By processing locally, your unredacted documents are never exposed to the internet or our servers.' }
        ],
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
        metaDescription: 'Certify PDF documents online for free. Add official digital signatures and certificates to verify document authenticity. Secure local tool.',
        longDescription: `Establish trust and authenticity with PDF PhD's Certify tool. Unlike simple e-signatures, a digital certificate provides cryptographic proof that the document has not been altered since it was signed. Our tool makes it easy to add professional certification to your most important files.

Our certification engine allows you to use your own digital ID to sign documents, providing a high level of assurance for contracts, official records, and legal briefs. It's the gold standard for secure document distribution in business and government.

Privacy is paramount when handling certificates. Because PDF PhD processes everything locally, your private keys and sensitive documents never touch our servers. Experience the maximum level of document security and non-repudiation with total data sovereignty, right in your browser.`,
        keywords: ['certify pdf', 'digital certificate pdf', 'pdf certification', 'verify pdf authenticity', 'cryptographic pdf signature'],
        howItWorks: [
            { step: 1, title: 'Upload Document', description: 'Select the official document you need to cryptographically certify.' },
            { step: 2, title: 'Select Certificate', description: 'Choose your digital ID or certificate file for the signing process.' },
            { step: 3, title: 'Download Certified', description: 'Save your verified, tamper-evident PDF document.' }
        ],
        useCases: [
            { title: 'Official Agreements', description: 'Certify high-value business contracts to ensure they cannot be modified after signing.' },
            { title: 'Government Compliance', description: 'Submit official reports and filings that meet strict cryptographic certification standards.' },
            { title: 'Academic Transcripts', description: 'Issue digital diplomas and transcripts that can be verified as authentic and unaltered.' }
        ],
        faq: [
            { question: 'Is it different from signing?', answer: 'Yes, certification add a tamper-evident seal to the entire document structure.' },
            { question: 'What certificates work?', answer: 'We support standard X.509 digital certificates and common digital ID formats.' },
            { question: 'Can it be verified?', answer: 'Yes, any standard PDF reader like Adobe Acrobat can verify the certification status.' }
        ],
        relatedTools: ['sign', 'protect']
    }),
    createTool({
        id: 'flatten', slug: 'flatten', name: 'Flatten PDF', shortName: 'Flatten',
        category: 'security', icon: Layers, bgGradient: 'from-gray-500 to-zinc-600',
        description: 'Flatten form fields and annotations',
        metaDescription: 'Flatten PDF online for free. Merge form fields, comments, and annotations into the document layer to prevent further editing. Secure local tool.',
        longDescription: `Make your document changes permanent with PDF PhD's Flatten tool. Flattening is the process of merging interactive elements—like fillable forms, sticky notes, and highlights—directly into the main content layer of the PDF. This ensures the information is visible but can no longer be edited or changed by the recipient.

Our flattening engine is essential for finishing documents before distribution. It prevents others from accidentally or intentionally modifying your typed form data or moving your annotations. It's the final professional step for contracts, insurance forms, and academic submissions.

Your document privacy is guaranteed. The entire flattening process happens locally in your web browser. Your sensitive form data and private annotations are never uploaded to our servers, providing the fastest and most secure way to lock in your document content forever.`,
        keywords: ['flatten pdf', 'flatten form fields', 'convert form to pdf', 'lock pdf annotations', 'make pdf non-editable', 'flattening online free'],
        howItWorks: [
            { step: 1, title: 'Upload Filled PDF', description: 'Select the document that contains form data or annotations you want to lock.' },
            { step: 2, title: 'Apply Flattening', description: 'Our engine merges all interactive layers into the base document structure.' },
            { step: 3, title: 'Download Locked PDF', description: 'Get a stable, non-interactive version of your document that\'s safe for sharing.' }
        ],
        useCases: [
            { title: 'Contract Finalization', description: 'Flatten signed and filled contracts to ensure the terms cannot be altered by other parties.' },
            { title: 'Submission Prep', description: 'Prepare filled-out application forms for submission to ensure data integrity during review.' },
            { title: 'Review Completion', description: 'Lock in your proofreading marks and comments so they become a permanent part of the shared document.' }
        ],
        faq: [
            { question: 'Can I un-flatten?', answer: 'No, flattening is a permanent one-way process designed for finalize documents.' },
            { question: 'Will text be searchable?', answer: 'Yes, text that was in form fields remains searchable text in the flattened document.' },
            { question: 'Does it reduce file size?', answer: 'Often yes, as removing interactive overhead can streamline the file structure.' }
        ],
        relatedTools: ['protect', 'sign']
    }),
    createTool({
        id: 'add-links', slug: 'add-links', name: 'Add Links to PDF', shortName: 'Add Links',
        category: 'security', type: 'visual', icon: Link2, bgGradient: 'from-cyan-500 to-blue-600',
        description: 'Add clickable hyperlinks to PDF documents',
        metaDescription: 'Add links to PDF online for free. Insert clickable web links, email links, or page jumps into any PDF document. Secure local tool.',
        longDescription: `Make your documents interactive with PDF PhD's Add Links tool. Whether you're adding "Buy Now" buttons to a catalog, linking to your portfolio from a resume, or adding internal navigation to a long report, our visual editor makes it simple to place clickable hyperlinks anywhere.

Our link engine supports external URLs, email addresses, and internal "jump to page" links. You can draw link areas precisely over text or images, ensuring a smooth interactive experience for your readers. It's the perfect way to modernize your brochures and technical guides.

Privacy is built-in. Your document and its new hyperlinks are processed entirely on your machine. Your private resumes and sensitive business plans never leave your computer, providing a secure and lightning-fast way to enhance your PDFs with modern web interactivy.`,
        keywords: ['add links pdf', 'hyperlink pdf', 'clickable pdf', 'insert link into pdf online', 'interactive pdf tool free'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the document you want to make interactive with clickable links.' },
            { step: 2, title: 'Draw Link Area', description: 'Draw a box over the text or image you want to turn into a link, and enter the destination.' },
            { step: 3, title: 'Save Interactive PDF', description: 'Download your document with all hyperlinks working and embedded.' }
        ],
        useCases: [
            { title: 'Digital Resumes', description: 'Link directly to your LinkedIn profile, portfolio, or contact email from your resume.' },
            { title: 'Product Catalogs', description: 'Add "View Item" links that take customers directly to your online store from the PDF.' },
            { title: 'Document Navigation', description: 'Create a clickable table of contents that helps readers jump to relevant chapters instantly.' }
        ],
        faq: [
            { question: 'Do the links work everywhere?', answer: 'Yes, our links are standard PDF annotations that work in all modern PDF readers and browsers.' },
            { question: 'Can I link to an email?', answer: 'Yes, you can use "mailto:" links to allow readers to email you with a single click.' },
            { question: 'Are the links visible?', answer: 'You can choose to make the link areas transparent or highlight them with a border.' }
        ],
        relatedTools: ['edit', 'annotate']
    }),
    createTool({
        id: 'add-qr', slug: 'add-qr', name: 'Add QR Code', shortName: 'QR Code',
        category: 'security', type: 'visual', icon: QrCode, bgGradient: 'from-violet-500 to-purple-600',
        description: 'Add QR codes to PDF documents',
        metaDescription: 'Add QR code to PDF online for free. Generate and insert QR codes into your PDF for easy mobile access to links or data. Secure local tool.',
        longDescription: `Bridge the physical and digital worlds with PDF PhD's Add QR tool. QR codes are an incredibly powerful way to allow readers of your printed or digital PDFs to instantly access websites, download files, or save contact info using their smartphone camera.

Our visual editor allows you to generate a custom QR code for any URL or text and place it precisely on any page of your doc. You can resize and position the code so it fits your design perfectly. It's an essential tool for modern marketing flyers, business cards, and technical manuals.

Total privacy is guaranteed. Your QR codes are generated and placed entirely within your web browser. Your sensitive URLs and document content never reach our servers, giving you the fastest and most secure way to add mobile interactivity to your PDFs today.`,
        keywords: ['add qr code pdf', 'qr code pdf', 'generate qr pdf', 'insert qr into pdf online', 'pdf marketing tools free'],
        howItWorks: [
            { step: 1, title: 'Select PDF', description: 'Upload the document where you want to place a QR code.' },
            { step: 2, title: 'Generate QR', description: 'Enter the link or text for the code and see it appear on your document.' },
            { step: 3, title: 'Position & Download', description: 'Move the QR code to the perfect spot and save your updated PDF.' }
        ],
        useCases: [
            { title: 'Marketing Flyers', description: 'Add a QR code to your event flyer so attendees can instantly register on their phone.' },
            { title: 'Resume Contact', description: 'Place a QR code on your resume that links to your digital portfolio or LinkedIn profile.' },
            { title: 'Instruction Manuals', description: 'Include QR codes that link to video tutorials or updated digital documentation.' }
        ],
        faq: [
            { question: 'Can I change the QR data?', answer: 'Yes, you can update the link or text as many times as you want before saving.' },
            { question: 'Is the QR high quality?', answer: 'Yes, we generate vector-sharp QR codes that remain perfectly scannable at any size.' },
            { question: 'What can I put in a QR?', answer: 'You can use URLs, email addresses, phone numbers, or simple plain text.' }
        ],
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
        metaDescription: 'Repair PDF online for free. Fix corrupted or damaged PDF documents that won\'t open or display correctly. Secure local browser-based repair.',
        longDescription: `Rescue your lost data with PDF PhD's Repair tool. Corrupted PDFs can be a nightmare, refusing to open or showing missing content. Our intelligent repair engine analyzes the internal structure of your damaged PDF and attempts to reconstruct the cross-reference tables and object streams to make it usable again.

Our browser-based repair technology works locally on your machine, which is faster and more secure than traditional upload-based services. Whether a file was damaged during a download, interrupted while saving, or has structural errors, our tool tries every technique to salvage your important documents.

Total privacy is guaranteed. Since the repair attempt happens entirely within your web browser, your sensitive documents never leave your device. Trust PDF PhD for the fastest and most secure way to bring your corrupted PDFs back to life.`,
        keywords: ['repair pdf', 'fix pdf', 'corrupted pdf', 'fix damaged pdf online', 'recover pdf data free'],
        howItWorks: [
            { step: 1, title: 'Upload Damaged PDF', description: 'Select the file that is corrupted or won\'t open properly.' },
            { step: 2, title: 'Analyze & Fix', description: 'Our engine identifies structural errors and attempts to rebuild the document.' },
            { step: 3, title: 'Download Repaired', description: 'Save the recovered version of your document and verify its contents.' }
        ],
        useCases: [
            { title: 'Download Failures', description: 'Fix PDFs that were partially downloaded or interrupted during a network transfer.' },
            { title: 'Disk Errors', description: 'Recover files that were corrupted due to hardware failures or system crashes.' },
            { title: 'Legacy Files', description: 'Repair older PDF documents that have become structurally invalid over time.' }
        ],
        faq: [
            { question: 'Can it fix everything?', answer: 'We can fix most structural errors, but if the data itself is missing from the file, it may be unrecoverable.' },
            { question: 'Is it safe for my data?', answer: 'Yes, we process the file locally, so your sensitive content is never exposed during repair.' },
            { question: 'Does it change the content?', answer: 'We aim to restore the file exactly as it was meant to be, without altering any recovered data.' }
        ],
        relatedTools: ['compress', 'optimize']
    }),
    createTool({
        id: 'optimize', slug: 'optimize', name: 'Optimize PDF', shortName: 'Optimize',
        category: 'optimize', icon: Sparkles, bgGradient: 'from-green-500 to-emerald-600',
        description: 'Optimize PDF for web or print',
        metaDescription: 'Optimize PDF online for free. Enhance your PDF documents for faster web viewing or high-quality printing. Secure local browser processing.',
        longDescription: `Get the best performance from your documents with PDF PhD's Optimize tool. A one-size-fits-all PDF isn't always best—our tool allows you to tune your file for its specific destination, whether that's a high-speed web server or a professional print shop.

Our optimization engine performs smart cleanup: it can remove redundant metadata and embedded fonts for web use, or ensure image resolutions are perfectly balanced for the intended output. It's the essential final step before publishing any PDF document.

Privacy and speed are built into our browser-based technology. All the optimization happens locally on your machine, ensuring that your sensitive business data and creative projects are never uploaded to a server. Experience professional-grade PDF tuning with total data sovereignty.`,
        keywords: ['optimize pdf', 'pdf optimization', 'web optimize pdf', 'optimize pdf for print', 'improve pdf performance free'],
        howItWorks: [
            { step: 1, title: 'Select PDF', description: 'Upload the document you want to fine-tune for web or print.' },
            { step: 2, title: 'Choose Profile', description: 'Select your target (e.g., Fast Web View or High Quality Print).' },
            { step: 3, title: 'Download Result', description: 'Get your optimized PDF, ready for high-performance distribution.' }
        ],
        useCases: [
            { title: 'Web Publishing', description: 'Optimize newsletters and whitepapers for fast loading on websites and cloud platforms.' },
            { title: 'Print Quality', description: 'Ensure your brochures and reports are perfectly prepared for high-resolution physical printing.' },
            { title: 'Archive Cleanup', description: 'Remove unnecessary baggage from old documents to create clean, optimized records.' }
        ],
        faq: [
            { question: 'What does optimization do?', answer: 'It removes redundant data, streamlines the file structure, and adjusts image settings for specific uses.' },
            { question: 'Is it the same as compression?', answer: 'Optimization often includes compression, but it focuses on document performance and output quality.' },
            { question: 'Will it look different?', answer: 'Web labels may slightly reduce image quality to save space, while Print labels maintain maximum fidelity.' }
        ],
        relatedTools: ['compress', 'pdf-a']
    }),
    createTool({
        id: 'linearize', slug: 'linearize', name: 'Linearize PDF', shortName: 'Linearize',
        category: 'optimize', icon: Zap, bgGradient: 'from-blue-500 to-cyan-600',
        description: 'Optimize PDF for fast web viewing',
        metaDescription: 'Linearize PDF online for free. Enable "Fast Web View" to allow your PDFs to open instantly in browsers. Secure local browser-based tool.',
        longDescription: `Make your PDFs feel like instant web pages with PDF PhD's Linearize tool. Linearization (also known as Fast Web View) reorganizes the internal structure of a PDF so that the browser can display the first page while the rest of the document continues to download in the background.

It's a critical tool for anyone hosting large PDFs online, such as ebooks, catalogs, or technical manuals. Without linearization, your users might see a blank screen while the entire large file downloads—with it, they can start reading immediately.

Because we value your privacy, all the re-indexing happens locally in your browser. Your sensitive reports and private books are never uploaded to any server, providing the fastest and most secure way to web-optimize your PDF right on your own device.`,
        keywords: ['linearize pdf', 'fast web view pdf', 'pdf linearization', 'optimize pdf for web online', 'speed up pdf loading'],
        howItWorks: [
            { step: 1, title: 'Upload Large PDF', description: 'Select the document you intend to host online for your users.' },
            { step: 2, title: 'Process and Index', description: 'Our engine reorders the file structure to enable streaming capabilities.' },
            { step: 3, title: 'Save for Web', description: 'Download your linearized PDF and upload it to your web server for instant viewing.' }
        ],
        useCases: [
            { title: 'Online Catalogs', description: 'Allow customers to start browsing your product guides instantly without wait times.' },
            { title: 'Technical Manuals', description: 'Provide immediate access to documentation for users in the field with slower connections.' },
            { title: 'Digital Ebooks', description: 'Ensure a smooth reading experience by letting the first chapter load instantly.' }
        ],
        faq: [
            { question: 'How much faster is it?', answer: 'For the user, it feels instant. They see the first page as soon as the first few kilobytes are received.' },
            { question: 'Does it change the contents?', answer: 'No, linearization only changes the internal order of data objects within the file.' },
            { question: 'Can I combine it with compression?', answer: 'Yes, we recommend linearizing your file as the final step after all other optimizations.' }
        ],
        relatedTools: ['optimize', 'compress']
    }),
    createTool({
        id: 'print', slug: 'print', name: 'Print PDF', shortName: 'Print',
        category: 'optimize', icon: Printer, bgGradient: 'from-gray-600 to-gray-700',
        description: 'Print PDF documents with advanced options',
        metaDescription: 'Print PDF online for free. Access advanced print controls and formatting options directly in your browser. Secure local processing.',
        longDescription: `Get the perfect hard copy every time with PDF PhD's Print tool. Standard browser print dialogs can be limiting—our tool provides advanced layout controls, scale adjustments, and preview options specifically tuned for PDF documents.

Our printing engine helps you avoid common pitfalls like cut-off margins or incorrect page orientations. Whether you're printing a single page or a 500-page report, our interface ensures a professional result that matches exactly what you see on the screen.

Privacy is built-in. Your document stays on your device throughout the entire printing process. Your sensitive reports and private letters are never uploaded to our servers, providing total data sovereignty and peace of mind when you need physical copies of your files.`,
        keywords: ['print pdf', 'pdf printer', 'print options pdf', 'print large pdf online', 'advanced pdf printing free'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the document you need to print.' },
            { step: 2, title: 'Adjust Settings', description: 'Configure layout, margins, and page ranges for the perfect print.' },
            { step: 3, title: 'Send to Printer', description: 'Use our optimized engine to send your document to any connected printer.' }
        ],
        useCases: [
            { title: 'Professional Reporting', description: 'Ensure your business reports are printed with perfect margins and full formatting.' },
            { title: 'Draft Review', description: 'Print compact versions of your documents for offline review and proofreading.' },
            { title: 'Form Printing', description: 'Print official government or business forms with precise scaling to match the original layout.' }
        ],
        faq: [
            { question: 'Does it support color?', answer: 'Yes, we fully support both color and grayscale printing based on your hardware capabilities.' },
            { question: 'Can I print ranges?', answer: 'Yes, you can easily select specific pages or ranges to print to save ink and paper.' },
            { question: 'Is it faster?', answer: 'Our optimized engine prepares the print stream efficiently, reducing wait times for large documents.' }
        ],
        relatedTools: ['n-up', 'grayscale']
    }),
    createTool({
        id: 'compare', slug: 'compare', name: 'Compare PDFs', shortName: 'Compare',
        category: 'optimize', icon: GitCompare, bgGradient: 'from-indigo-500 to-purple-600',
        description: 'Compare two PDF documents side by side',
        metaDescription: 'Compare PDF online for free. Spot differences between two document versions instantly with a visual side-by-side comparison. Secure and private.',
        longDescription: `Detect changes effortlessly with PDF PhD's Compare tool. In professional workflows, tracking differences between two versions of a contract or report is critical. Our visual comparison engine highlights exactly what has been added, removed, or modified.

Our side-by-side view allows you to scroll through both documents simultaneously, with differences clearly marked. Whether you're a legal professional reviewing contract revisions or a project manager tracking report updates, our tool saves you hours of manual proofreading.

Privacy is our cornerstone. Your comparison happens entirely within your web browser. Your sensitive contracts and private business plans never leave your device, ensuring total confidentiality as you review changes across document versions.`,
        keywords: ['compare pdf', 'pdf comparison', 'diff pdf', 'compare two pdfs online free', 'track changes in pdf'],
        howItWorks: [
            { step: 1, title: 'Upload Two PDFs', description: 'Select the original document and the newer version you want to compare.' },
            { step: 2, title: 'Analyze Differences', description: 'Our engine scans both files to identify text and layout changes.' },
            { step: 3, title: 'Review & Contrast', description: 'Use the visual side-by-side view to spot Every modification instantly.' }
        ],
        useCases: [
            { title: 'Contract Review', description: 'Identify exactly what language has changed between two versions of a legal agreement.' },
            { title: 'Technical Revisions', description: 'Track updates in long technical manuals or engineering documentation.' },
            { title: 'Draft Verification', description: 'Ensure that requested changes were actually made between two drafts of a professional report.' }
        ],
        faq: [
            { question: 'What does it highlight?', answer: 'We highlight deleted text, added text, and significant changes in image or table placement.' },
            { question: 'Can I export the diff?', answer: 'Yes, you can save a summary of the differences for your records.' },
            { question: 'How large can files be?', answer: 'We can compare documents with hundreds of pages efficiently in your browser.' }
        ],
        relatedTools: ['merge', 'split']
    }),

    // === EXPORT & DATA TOOLS (11) ===
    createTool({
        id: 'export-json', slug: 'export-json', name: 'Export to JSON', shortName: 'JSON Structure',
        category: 'export', icon: Braces, bgGradient: 'from-amber-500 to-orange-600',
        description: 'Export document structure, metadata, and text to JSON format',
        metaDescription: 'Export PDF to JSON online for free. Extract structured text, metadata, and document hierarchies into JSON format for developers and data analysis.',
        longDescription: `Bridge the gap between documents and data with PDF PhD's Export to JSON tool. Perfect for developers, data scientists, and power users, our tool parses your PDF to create a structured JSON representation of its contents.

Unlike simple text extraction, our engine attempts to map the document hierarchy, identifying headers, paragraphs, and list items. This makes it easier to feed PDF content into databases, mobile apps, or large language models (LLMs).

Security is built into every step. Your sensitive data processing happens entirely within your browser environment. Whether you're extracting data from proprietary reports or private user information, PDF PhD ensures that your files are never exposed to external servers during the JSON export process.`,
        keywords: ['export json pdf', 'pdf to json', 'json structure', 'pdf metadata json', 'pdf data extraction', 'json export online'],
        howItWorks: [
            { step: 1, title: 'Select PDF File', description: 'Upload the PDF document you want to transform into structured JSON data.' },
            { step: 2, title: 'Parse Structure', description: 'Our engine analyzes the document to identify text blocks, metadata, and logical structure.' },
            { step: 3, title: 'Export JSON', description: 'Download your formatted .json file ready for developer use or data analysis.' }
        ],
        useCases: [
            { title: 'App Development', description: 'Convert document content into a format easily digestible by mobile and web applications.' },
            { title: 'Data Analysis', description: 'Feed structured PDF data into Python scripts or data visualization tools for deeper insights.' },
            { title: 'AI Training', description: 'Prepare document data for fine-tuning or prompting AI models by providing clean, structured JSON input.' }
        ],
        faq: [
            { question: 'Does it support metadata?', answer: 'Yes, we extract standard PDF metadata like Title, Author, Creation Date, and custom XMP properties.' },
            { question: 'Is the text clean?', answer: 'We perform advanced cleaning to remove artifacts and ensure the extracted text is accurately mapped to the JSON structure.' },
            { question: 'Can it handle tables?', answer: 'Yes, tables are represented as nested objects and arrays within the JSON export.' }
        ],
        relatedTools: ['export-xml', 'export-text']
    }),
    createTool({
        id: 'export-xml', slug: 'export-xml', name: 'Export XMP Metadata', shortName: 'XML/XMP Metadata',
        category: 'export', icon: Code, bgGradient: 'from-cyan-500 to-blue-600',
        description: 'Export XMP-compliant metadata in XML format',
        metaDescription: 'Export PDF metadata to XML online for free. Extract XMP properties, Dublin Core, and custom metadata for document management and archiving.',
        longDescription: `Unlock the hidden information in your documents with PDF PhD's Export XML tool. We specialize in extracting XMP (Extensible Metadata Platform) data, giving you direct access to the standard and custom properties embedded within your PDF files.

Our tool is essential for digital librarians, archival professionals, and document managers who need to maintain structured metadata across large document collections. We extract Dublin Core properties, creator information, usage rights, and publication dates in a clean, standard XML format.

Your document privacy is guaranteed. Since the metadata extraction happens locally in your browser, your sensitive organizational data and personal file information are never uploaded to a server. PDF PhD is the professional's choice for secure, standards-compliant metadata export.`,
        keywords: ['export xml pdf', 'xmp metadata', 'pdf metadata xml', 'dublin core', 'extract pdf properties', 'free xmp export'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the PDF document from which you need to extract metadata.' },
            { step: 2, title: 'Extract Metadata', description: 'We read the XMP stream and custom properties directly from the PDF header.' },
            { step: 3, title: 'Download XML', description: 'Save your metadata as an .xml file for use in document management systems or archives.' }
        ],
        useCases: [
            { title: 'Library Cataloging', description: 'Quickly extract publication metadata for integration into library and information systems.' },
            { title: 'Legal Discovery', description: 'Gather document properties and history for legal compliance and e-discovery purposes.' },
            { title: 'Archival Work', description: 'Ensure long-term document preservation by maintaining structured XML metadata records.' }
        ],
        faq: [
            { question: 'What schemas are supported?', answer: 'We support standard XMP schemas, Dublin Core, and custom PDF properties.' },
            { question: 'Can it remove metadata?', answer: 'For metadata removal, please use our "Sanitize Metadata" tool.' },
            { question: 'Does it work with older PDFs?', answer: 'Yes, we can extract both modern XMP metadata and older Info dictionary properties.' }
        ],
        relatedTools: ['export-json', 'sanitize-metadata']
    }),
    createTool({
        id: 'export-fdf', slug: 'export-fdf', name: 'Export Form Data', shortName: 'FDF Form Data',
        category: 'export', icon: FileInput, bgGradient: 'from-green-500 to-emerald-600',
        description: 'Export fillable form field data to FDF format',
        metaDescription: 'Export PDF form data to FDF online for free. Extract AcroForm values into a lightweight FDF file for efficient data handling. Secure local tool.',
        longDescription: `Manage your form data efficiently with PDF PhD's Export FDF tool. FDF (Forms Data Format) is a small, specialized file format used to store just the data from a PDF form, rather than the entire document. Our tool allows you to extract filled-in field values into this lightweight format.

Our extraction engine is ideal for administrators and developers who need to collect data from hundreds of submitted forms without's storing hundreds of full PDFs. FDF files can be easily imported back into the original PDF template or used for database entry.

Privacy is built-in. Your form data extraction happens entirely in your browser. Your sensitive personal info and official form values never touch our servers, providing a secure and lightning-fast way to handle your business data.`,
        keywords: ['export fdf', 'form data export', 'pdf forms fdf', 'acroform export', 'extract pdf form data online free'],
        howItWorks: [
            { step: 1, title: 'Upload Filled Form', description: 'Select the PDF document that has interactive form fields you\'ve completed.' },
            { step: 2, title: 'Extract Values', description: 'Our engine identifies all AcroForm fields and pulls their current data.' },
            { step: 3, title: 'Download FDF', description: 'Save your lightweight FDF file, ready for import or data processing.' }
        ],
        useCases: [
            { title: 'Data Collection', description: 'Gather form responses from customers or employees in a tiny, easy-to-manage file format.' },
            { title: 'Form Migration', description: 'Move your filled data from one version of a PDF form to another by exporting/importing FDF.' },
            { title: 'Database Integration', description: 'Use FDF files as an intermediate step for pushing PDF form data into enterprise databases.' }
        ],
        faq: [
            { question: 'What is FDF?', answer: 'FDF is a lightweight format that only contains the values typed into a form, not the layout.' },
            { question: 'Does it work with XFA?', answer: 'We primarily support standard AcroForm fields used in most professional PDF documents.' },
            { question: 'Is it really small?', answer: 'Yes! An FDF file is usually only a few kilobytes, even for very long forms.' }
        ],
        relatedTools: ['export-json', 'flatten']
    }),
    createTool({
        id: 'export-pdfa', slug: 'export-pdfa', name: 'Convert to PDF/A', shortName: 'PDF/A Archive',
        category: 'export', icon: Archive, bgGradient: 'from-purple-500 to-violet-600',
        description: 'Convert PDF to archival PDF/A format for long-term preservation',
        metaDescription: 'Convert PDF to PDF/A online for free. Ensure long-term accessibility with ISO-standard archival conversion. Secure and private local processing.',
        longDescription: `Future-proof your document collection with PDF PhD's Archival tool. PDF/A is the specialized version of PDF designed for long-term digital preservation. By converting to PDF/A, you ensure that your documents will look and behave exactly the same way for decades to come, regardless of future software changes.

Our professional conversion engine handles all the complexities of the ISO standard: embedding fonts, removing prohibited features, and ensuring color space consistency. It's the essential tool for digital archives, legal repositories, and corporate records departments.

Security and compliance are our top priorities. Your archival conversion happens 100% locally on your machine. Your permanent records and sensitive history never leave your browser, providing total data sovereignty as you build your digital legacy.`,
        keywords: ['pdf/a conversion', 'archive pdf', 'long term archiving', 'pdf preservation', 'iso compliant pdf online free'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the document you need to preserve for the long term.' },
            { step: 2, title: 'Apply Archival Standards', description: 'We restructure the file to meet strict ISO PDF/A compliance rules.' },
            { step: 3, title: 'Save for Archive', description: 'Download your ISO-certified document, ready for permanent storage.' }
        ],
        useCases: [
            { title: 'Permanent Records', description: 'Store historical business documents and project history in a format that will never expire.' },
            { title: 'Legal Repositories', description: 'Meet court and government requirements for document storage with standard PDF/A files.' },
            { title: 'Digital Libraries', description: 'Ensure that digitized books and manuscripts remain accessible for future generations of readers.' }
        ],
        faq: [
            { question: 'Which standard is used?', answer: 'We support multiple PDF/A versions, including the widely used PDF/A-1 and PDF/A-2 standards.' },
            { question: 'Will my fonts stay?', answer: 'Yes, PDF/A requires all fonts to be embedded, so your document is always self-contained.' },
            { question: 'Is it more secure?', answer: 'Archival standards disable many security risks like scripts, making the file inherently safer over time.' }
        ],
        relatedTools: ['optimize', 'sanitize-metadata']
    }),
    createTool({
        id: 'export-epub', slug: 'export-epub', name: 'Export to EPUB', shortName: 'EPUB eBook',
        category: 'export', icon: BookOpen, bgGradient: 'from-pink-500 to-rose-600',
        description: 'Convert PDF to EPUB format for e-readers',
        metaDescription: 'Convert PDF to EPUB online for free. Transform your PDF books and documents into reflowable EBUP files for Kindle, iPad, and e-readers.',
        longDescription: `Make your PDF reading experience better with PDF PhD's PDF to EPUB converter. While PDFs are great for fixed layouts, they can be difficult to read on small screens like e-readers or phones. Our EPUB export tool transforms your static PDFs into reflowable, mobile-friendly eBook files.

Our advanced AI-assisted conversion engine analyzes your PDF's structure to correctly identify chapters, headings, and body text. This ensures that the resulting EPUB file provides a native reading experience, allowing you to adjust font sizes and background colors on your favorite e-reading device.

Your privacy is our priority. The entire conversion from PDF to EPUB takes place locally in your browser. Your private manuscripts, study materials, and personal eBooks are never uploaded to any server, making PDF PhD the most secure way to prepare your content for Kindle, Kobo, or iBooks.`,
        keywords: ['pdf to epub', 'ebook conversion', 'kindle format', 'epub export', 'convert pdf to ebook', 'free pdf to epub online'],
        howItWorks: [
            { step: 1, title: 'Upload PDF eBook', description: 'Select the PDF document or book you wish to convert to EPUB format.' },
            { step: 2, title: 'Analyze & Convert', description: 'We process the text and images to create a reflowable eBook structure.' },
            { step: 3, title: 'Download EPUB', description: 'Save your new EPUB file and transfer it to your Kindle, phone, or e-reader.' }
        ],
        useCases: [
            { title: 'Mobile Reading', description: 'Convert research papers or PDFs into EPUBs for comfortable reading on small smartphone screens.' },
            { title: 'Self-Publishing', description: 'Prepare your manuscript for eBook platforms by converting your final PDF into Kindle-compatible EPUB format.' },
            { title: 'Study Accessibility', description: 'Transform textbook PDFs into reflowable text that works with screen readers and accessibility tools.' }
        ],
        faq: [
            { question: 'Will it work on Kindle?', answer: 'Yes! All modern Kindle devices and apps natively support the EPUB format.' },
            { question: 'What happens to the images?', answer: 'Our converter extracts images and optimizes them for eBook display, ensuring they look great on all screens.' },
            { question: 'Can I edit the metadata?', answer: 'The conversion preserves original title and author metadata, which you can then customize in your library app.' }
        ],
        relatedTools: ['export-html', 'export-text']
    }),
    createTool({
        id: 'sanitize-metadata', slug: 'sanitize-metadata', name: 'Sanitize Metadata', shortName: 'Sanitize Metadata',
        category: 'export', icon: ShieldOff, bgGradient: 'from-red-500 to-rose-600',
        description: 'Remove hidden info, scripts, and sensitive metadata from PDF',
        metaDescription: 'Sanitize PDF metadata online for free. Remove hidden history, creator info, and sensitive properties before sharing. Secure local tool.',
        longDescription: `Share your documents with total confidence using PDF PhD's Sanitize Metadata tool. Every PDF contains hidden information—like the author's name, the software used, and even the full revision history. Our tool scrubs this invisible data, ensuring that only the content you want visible is shared.

Our sanitation engine deep-cleans your PDF structure: it removes XMP metadata, creator information, creation dates, and even potentially dangerous embedded scripts. It's an essential security step for government work, legal filings, and high-stakes business negotiations.

Privacy is paramount. Since the sanitation process happens 100% locally in your browser, your sensitive document history never reaches our servers. Experience the most secure way to clean your PDFs and protect your identity, all without leaving your device.`,
        keywords: ['remove metadata pdf', 'sanitize pdf', 'clean pdf history', 'remove creator info pdf', 'scrub pdf properties online free'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the document you want to clean before sharing it publicly or with third parties.' },
            { step: 2, title: 'Deep Clean', description: 'Our engine identifies and removes all hidden metadata, history, and embedded scripts.' },
            { step: 3, title: 'Download Sanitized', description: 'Get a "clean" version of your PDF that contains only the visible content.' }
        ],
        useCases: [
            { title: 'Safe File Sharing', description: 'Ensure that personal names and company details are removed from PDFs before cloud uploads.' },
            { title: 'Legal Privacy', description: 'Remove the revision history and creation details from documents before they are entered into discovery.' },
            { title: 'Security Hardening', description: 'Scrub potentially dangerous scripts and attachments from PDFs before they reach your network.' }
        ],
        faq: [
            { question: 'What gets removed?', answer: 'We remove author info, creation/edit dates, software used, revision history, and custom properties.' },
            { question: 'Does it change the look?', answer: 'No, sanitation only affects the hidden metadata; your visible text and images remain untouched.' },
            { question: 'Is it better than redaction?', answer: 'They are different: Redaction hides visible text, while Sanitation hides invisible metadata.' }
        ],
        relatedTools: ['redact', 'flatten', 'export-xml']
    }),
    createTool({
        id: 'export-text', slug: 'export-text', name: 'Export Plain Text', shortName: 'Plain Text',
        category: 'export', icon: AlignLeft, bgGradient: 'from-slate-500 to-slate-600',
        description: 'Extract all text content from PDF as plain text',
        metaDescription: 'Extract text from PDF online for free. Pull all text layers out of your PDF into a clean .txt file. Secure and private local processing.',
        longDescription: `Get right to your content with PDF PhD's Export Plain Text tool. If you have a PDF report, a long document, or a research paper and you just need the raw text without any formatting, our tool provides a fast and clean extraction into the universal .txt format.

Our extraction engine parses document structures to identify text flows and removes all styling, images, and layout artifacts. This provides you with a clean stream of text that's perfect for searching, translating, or feeding into large language models and AI tools.

Your privacy is our hallmark. All text extraction happens locally on your own machine. Your sensitive business text and private documents are never sent across the network, providing the highest level of security for your data-heavy workflows and research.`,
        keywords: ['extract text pdf', 'pdf to text', 'plain text export', 'text extraction online free', 'convert pdf to txt'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the document you want to extract raw text content from.' },
            { step: 2, title: 'Parse Text Filter', description: 'We strip away all formatting, images, and layers to get to the pure character data.' },
            { step: 3, title: 'Download TXT File', description: 'Save your content as a platform-independent plain text file.' }
        ],
        useCases: [
            { title: 'AI Training Data', description: 'Extract clean text from PDF libraries to use in training or fine-tuning AI and search models.' },
            { title: 'Translation Prep', description: 'Pull raw text out of PDFs to make it easier to paste into translation software or CAT tools.' },
            { title: 'Script Writing', description: 'Convert PDF screenplays or reports into plain text for editing and repurposing in other formats.' }
        ],
        faq: [
            { question: 'Will and images be saved?', answer: 'No, Plain Text extraction ignores all images to provide just the written content.' },
            { question: 'Is it character-accurate?', answer: 'Yes, we map the text exactly as it appears in the PDF text layer.' },
            { question: 'Does it work with columns?', answer: 'Our engine identifies text blocks to maintain a logical reading order even in column layouts.' }
        ],
        relatedTools: ['export-markdown', 'export-html', 'ocr']
    }),
    createTool({
        id: 'export-markdown', slug: 'export-markdown', name: 'Export to Markdown', shortName: 'Markdown',
        category: 'export', icon: FileCode, bgGradient: 'from-gray-600 to-gray-700',
        description: 'Export PDF content as formatted Markdown',
        metaDescription: 'Convert PDF to Markdown online for free. Transform your PDF documents into structured .md files with headers and lists. Secure local tool.',
        longDescription: `Modernize your document workflow with PDF PhD's Export to Markdown tool. Markdown is the gold standard for developers, technical writers, and digital publishers. Our tool intelligently parses your PDF's structure—identifying headers, lists, and bold text—to create a clean, formatted .md file.

Our conversion engine goes beyond plain text by attempting to preserve the document's logical hierarchy. This makes it perfect for moving content from a static PDF into a GitHub repository, a blog platform like Hugo or Jekyll, or into modern note-taking apps like Notion and Obsidian.

Privacy is paramount. The entire conversion from PDF to Markdown happens locally in your web browser. Your sensitive technical documentation and private notes never touch our servers, providing the fastest and most secure way to convert documents for the modern web.`,
        keywords: ['pdf to markdown', 'markdown export', 'md format', 'formatted text', 'convert pdf to md online free', 'pdf structured extraction'],
        howItWorks: [
            { step: 1, title: 'Upload PDF', description: 'Select the document you want to transform into formatted Markdown.' },
            { step: 2, title: 'Structure Analysis', description: 'Our engine identifies headings, bullet points, and text styles within the PDF.' },
            { step: 3, title: 'Get Markdown', description: 'Download your structured .md file, ready for your favorite editor or repository.' }
        ],
        useCases: [
            { title: 'Docs Management', description: 'Efficiently move content from legacy PDF manuals into modern Markdown-based documentation sites.' },
            { title: 'Content Blogging', description: 'Convert PDF articles or whitepapers into Markdown for fast publishing to web platforms.' },
            { title: 'Note Taking', description: 'Import document content into Obsidian or Notion while maintaining headers and lists.' }
        ],
        faq: [
            { question: 'Does it support tables?', answer: 'Yes, we attempt to map PDF table structures into standard Markdown table syntax.' },
            { question: 'Will headers be correct?', answer: 'Our engine uses font size and weight to intelligently determine H1, H2, and H3 levels.' },
            { question: 'What about images?', answer: 'Markdown is a text-based format, so we include placeholders where images were located in the PDF.' }
        ],
        relatedTools: ['export-text', 'export-html']
    }),
    createTool({
        id: 'export-html', slug: 'export-html', name: 'Export to HTML', shortName: 'HTML',
        category: 'export', icon: Globe2, bgGradient: 'from-orange-500 to-red-600',
        description: 'Export PDF content as web-ready HTML page',
        metaDescription: 'Convert PDF to HTML online for free. Transform your PDF documents into clean, responsive web pages. Secure and private local processing.',
        longDescription: `Put your documents on the web with PDF PhD's Export to HTML tool. While PDFs are great for printing, HTML is best for the screen. Our tool transforms your static PDF pages into clean, responsive HTML code that looks great on any website and is easily indexed by search engines.

Our conversion engine handles text, images, and tables, creating a balanced web representation of your document. It's the perfect way for businesses to make their reports and brochures accessible directly in the browser without requiring a PDF plugin or download.

Security is built-in. Your HTML conversion happens entirely on your machine. Your private business reports and sensitive organizational data are never sent to our servers, providing the most secure way to web-enable your document collection right in your browser.`,
        keywords: ['pdf to html', 'html export', 'web page', 'html conversion', 'convert pdf to webpage online free', 'pdf to responsive html'],
        howItWorks: [
            { step: 1, title: 'Select PDF', description: 'Upload the document you want to turn into a web-ready HTML page.' },
            { step: 2, title: 'Render HTML', description: 'We map the document layout and content into modern, semantically accurate HTML.' },
            { step: 3, title: 'Download Web Page', description: 'Save your HTML file and its associated images, ready for web hosting.' }
        ],
        useCases: [
            { title: 'SEO Optimization', description: 'Turn hidden PDF content into searchable web pages to improve your site\'s search engine ranking.' },
            { title: 'Responsive Viewing', description: 'Convert large PDF reports into HTML that is easy to read on mobile phones and tablets.' },
            { title: 'Web Integration', description: 'Directly embed your document content into your company\'s website or intranet portal.' }
        ],
        faq: [
            { question: 'Is it responsive?', answer: 'Yes, we aim to produce code that adapts to different screen sizes for better mobile viewing.' },
            { question: 'What happens to the images?', answer: 'Images are exported and linked correctly within the HTML code.' },
            { question: 'Can I edit the code?', answer: 'Absolutely! The resulting HTML is clean and easy for any developer to modify or style.' }
        ],
        relatedTools: ['export-markdown', 'export-epub']
    }),
    createTool({
        id: 'export-csv', slug: 'export-csv', name: 'Extract Tables to CSV', shortName: 'Tables → CSV',
        category: 'export', icon: TableProperties, bgGradient: 'from-teal-500 to-cyan-600',
        description: 'Extract tables from PDF and export as CSV data',
        metaDescription: 'Extract PDF to CSV online for free. Pull tabular data out of PDF reports into clean, comma-separated values for data analysis. Secure local tool.',
        longDescription: `Get your data ready for analysis with PDF PhD's Tables to CSV tool. Comma-Separated Values (CSV) is the universal format for data science and analysis. Our tool specializes in finding tables within your PDF and transforming them into perfectly structured data files.

Our extraction engine is designed for precision, identifying columns and rows accurately across single or multiple pages. It's the essential first step for data analysts, researchers, and accountants who need to feed PDF-based numbers into Python, R, or data visualization software.

Privacy is paramount when handling data. Your extraction process runs 100% locally in your web browser. Your sensitive proprietary data, financial records, and research findings never touch our servers, ensuring your data sovereignty remains intact as you process your records.`,
        keywords: ['pdf table extraction', 'tables to csv', 'csv export', 'extract data pdf', 'convert pdf to csv online free', 'pdf table to spreadsheet'],
        howItWorks: [
            { step: 1, title: 'Upload PDF Source', description: 'Select the document that contains the tables or data you need to analyze.' },
            { step: 2, title: 'Identify Data', description: 'Our engine finds all tables and organizes them into a structured data format.' },
            { step: 3, title: 'Download CSV', description: 'Save your data as a .csv file, ready for Excel, Python, or your database.' }
        ],
        useCases: [
            { title: 'Data Analysis', description: 'Quickly export hundreds of PDF datasheet rows into clean CSV for statistical modeling.' },
            { title: 'Financial Cleanup', description: 'Transform bank statement tables into CSV for easy import into accounting software.' },
            { title: 'Scientific Research', description: 'Gather tabular data from academic papers into a unified CSV database for your own research.' }
        ],
        faq: [
            { question: 'Does it handle multiple tables?', answer: 'Yes, you can choose to export each table separately or combine them into one file.' },
            { question: 'Is the data clean?', answer: 'We remove common artifacts like page numbers and headers to ensure the data is analytical-ready.' },
            { question: 'What about currency symbols?', answer: 'We preserve original data values exactly as they are presented in the PDF.' }
        ],
        relatedTools: ['pdf-to-excel', 'export-json']
    }),
    createTool({
        id: 'export-pdf', slug: 'export-pdf', name: 'Export PDF', shortName: 'Export PDF',
        category: 'export', icon: Download, bgGradient: 'from-indigo-500 to-purple-600',
        description: 'Download PDF with all edits applied',
        metaDescription: 'Download your edited PDF online for free. Save your document with all changes, signatures, and annotations preserved. Fast and secure.',
        longDescription: `Complete your workflow with PDF PhD's Export PDF tool. This is the final step where all your hard work—from merging and splitting to signing and annotating—is finalized into a professional, industry-standard PDF document ready for distribution.

Our export engine ensures that every change you've made is perfectly rendered and embedded. We maintain maximum document quality while optimizing a file's internal structure for fast opening and high compatibility across all PDF readers, including mobile and web browsers.

Security is built into our core. Since the final file generation happens entirely on your machine, your finished documents never leave your care. Experience the fastest and most secure way to finalize your document projects with total privacy.`,
        keywords: ['export pdf', 'download pdf', 'save pdf', 'pdf download', 'finalize pdf online free', 'save edited pdf'],
        howItWorks: [
            { step: 1, title: 'Review Changes', description: 'Make sure all your edits, signatures, and reorganizations are correct.' },
            { step: 2, title: 'Finalize Document', description: 'Our engine compiles all your modifications into the final PDF structure.' },
            { step: 3, title: 'Download Final', description: 'Save your completed, high-quality document directly to your computer.' }
        ],
        useCases: [
            { title: 'Finished Proposals', description: 'Download your completed business proposals after all team edits and signatures are in place.' },
            { title: 'Finalized Forms', description: 'Save your signed applications and forms once they are ready for official submission.' },
            { title: 'Completed Archives', description: 'Finalize your scanned and organized personal records for safe long-term storage.' }
        ],
        faq: [
            { question: 'Will the quality be lower?', answer: 'No, we preserve the highest possible quality for both text and images during export.' },
            { question: 'Does it work in all readers?', answer: 'Yes, we export standard-compliant PDFs that work on Mac, Windows, iOS, and Android.' },
            { question: 'Is there a limit on file size?', answer: 'Only your browser\'s memory limits the size of the file you can export.' }
        ],
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
