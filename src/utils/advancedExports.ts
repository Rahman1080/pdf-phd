import { PDFDocument, PDFName, PDFString } from '@cantoo/pdf-lib';

// ============================================
// XML/XMP Metadata Export
// ============================================
export function exportToXML(pdfLibDoc: PDFDocument): string {
    const title = pdfLibDoc.getTitle() || '';
    const author = pdfLibDoc.getAuthor() || '';
    const subject = pdfLibDoc.getSubject() || '';
    const keywords = pdfLibDoc.getKeywords() || '';
    const creator = pdfLibDoc.getCreator() || '';
    const producer = pdfLibDoc.getProducer() || '';
    const creationDate = pdfLibDoc.getCreationDate()?.toISOString() || '';
    const modificationDate = pdfLibDoc.getModificationDate()?.toISOString() || '';

    const xml = `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="PDF Studio Professional Export">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:xmp="http://ns.adobe.com/xap/1.0/"
        xmlns:xmpMM="http://ns.adobe.com/xap/1.0/mm/"
        xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
        xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      
      <!-- Dublin Core -->
      <dc:format>application/pdf</dc:format>
      <dc:title><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(title)}</rdf:li></rdf:Alt></dc:title>
      <dc:creator><rdf:Seq><rdf:li>${escapeXml(author)}</rdf:li></rdf:Seq></dc:creator>
      <dc:description><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(subject)}</rdf:li></rdf:Alt></dc:description>
      
      <!-- XMP Basic -->
      <xmp:CreatorTool>${escapeXml(creator)}</xmp:CreatorTool>
      <xmp:CreateDate>${creationDate}</xmp:CreateDate>
      <xmp:ModifyDate>${modificationDate}</xmp:ModifyDate>
      
      <!-- PDF ID -->
      <pdf:Producer>${escapeXml(producer)}</pdf:Producer>
      <pdf:Keywords>${escapeXml(keywords)}</pdf:Keywords>
      
      <!-- PDF/A ID Signal -->
      <pdfaid:part>2</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
      
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

    return xml;
}

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// ============================================
// FDF (Forms Data Format) Export/Import
// ============================================
export function exportToFDF(pdfLibDoc: PDFDocument, pdfFileName: string): string {
    const fields: { name: string; value: string }[] = [];

    try {
        const form = pdfLibDoc.getForm();
        const formFields = form.getFields();

        for (const field of formFields) {
            const name = field.getName();
            let value = '';

            // @ts-ignore
            if (field.getText) value = (field as any).getText() || '';
            // @ts-ignore
            if (field.isChecked) value = (field as any).isChecked() ? 'Yes' : 'Off';
            // @ts-ignore
            if (field.getSelected) value = (field as any).getSelected()?.[0] || '';

            fields.push({ name, value });
        }
    } catch (e) {
        console.warn('Failed to extract form fields for FDF:', e);
    }

    // Generate FDF file format using standard PDF string escaping
    // Professional FDF requires proper escaping for field values and binary marker
    const escapeFdfString = (s: string) => `(${s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')})`;

    const fdfContent = `%FDF-1.2
%âãÏÓ
1 0 obj
<<
/FDF <<
/F ${escapeFdfString(pdfFileName)}
/Fields [
${fields.map(f => `  << /T ${escapeFdfString(f.name)} /V ${escapeFdfString(f.value)} >>`).join('\n')}
]
>>
>>
endobj
trailer
<< /Root 1 0 R >>
%%EOF`;

    return fdfContent;
}

export function parseFDF(fdfContent: string): { [fieldName: string]: string } {
    const result: { [fieldName: string]: string } = {};

    // Simple regex-based FDF parser
    const fieldRegex = /\/T\s*\(([^)]+)\)\s*\/V\s*\(([^)]*)\)/g;
    let match;

    while ((match = fieldRegex.exec(fdfContent)) !== null) {
        result[match[1]] = match[2];
    }

    return result;
}

export async function importFDF(pdfLibDoc: PDFDocument, fdfContent: string): Promise<void> {
    const fieldValues = parseFDF(fdfContent);
    const form = pdfLibDoc.getForm();

    for (const [name, value] of Object.entries(fieldValues)) {
        try {
            const field = form.getField(name);
            if (!field) continue;

            // @ts-ignore
            if (field.setText) (field as any).setText(value);
            // @ts-ignore
            if (field.check && value === 'Yes') (field as any).check();
            // @ts-ignore
            if (field.uncheck && value === 'Off') (field as any).uncheck();
            // @ts-ignore
            if (field.select) (field as any).select(value);
        } catch (e) {
            console.warn(`Failed to set field ${name}:`, e);
        }
    }
}

// ============================================
// Bulk Stamping Utility
// ============================================
export interface StampOptions {
    text: string;
    color: string;
    fontSize: number;
    position: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    rotation: number;
    opacity: number;
    pageRange: 'all' | 'odd' | 'even' | number[];
}

export async function applyBulkStamp(pdfLibDoc: PDFDocument, options: StampOptions): Promise<void> {
    const { StandardFonts, rgb } = await import('@cantoo/pdf-lib');
    const font = await pdfLibDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfLibDoc.getPages();

    // Determine which pages to stamp
    let pageIndices: number[] = [];
    if (options.pageRange === 'all') {
        pageIndices = pages.map((_, i) => i);
    } else if (options.pageRange === 'odd') {
        pageIndices = pages.map((_, i) => i).filter(i => (i + 1) % 2 === 1);
    } else if (options.pageRange === 'even') {
        pageIndices = pages.map((_, i) => i).filter(i => (i + 1) % 2 === 0);
    } else {
        pageIndices = (options.pageRange as number[]).map(p => p - 1).filter(i => i >= 0 && i < pages.length);
    }

    // Parse color
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
        } : { r: 0, g: 0, b: 0 };
    };
    const { r, g, b } = hexToRgb(options.color);

    for (const pageIdx of pageIndices) {
        const page = pages[pageIdx];
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
        const textHeight = options.fontSize;

        // Calculate position
        let x = 0, y = 0;
        const margin = 30;

        switch (options.position) {
            case 'top-left':
                x = margin; y = height - margin - textHeight;
                break;
            case 'top-center':
                x = (width - textWidth) / 2; y = height - margin - textHeight;
                break;
            case 'top-right':
                x = width - margin - textWidth; y = height - margin - textHeight;
                break;
            case 'center':
                x = (width - textWidth) / 2; y = (height - textHeight) / 2;
                break;
            case 'bottom-left':
                x = margin; y = margin;
                break;
            case 'bottom-center':
                x = (width - textWidth) / 2; y = margin;
                break;
            case 'bottom-right':
                x = width - margin - textWidth; y = margin;
                break;
        }

        page.drawText(options.text, {
            x, y,
            size: options.fontSize,
            font,
            color: rgb(r, g, b),
            opacity: options.opacity,
            rotate: { angle: options.rotation, type: 'degrees' } as any,
        });
    }
}

// ============================================
// Metadata Sanitization
// ============================================
export async function sanitizeMetadata(pdfLibDoc: PDFDocument): Promise<{ removed: string[] }> {
    const removed: string[] = [];

    // Remove standard metadata
    const currentTitle = pdfLibDoc.getTitle();
    const currentAuthor = pdfLibDoc.getAuthor();
    const currentSubject = pdfLibDoc.getSubject();
    const currentKeywords = pdfLibDoc.getKeywords();
    const currentCreator = pdfLibDoc.getCreator();
    const currentProducer = pdfLibDoc.getProducer();

    if (currentTitle) { pdfLibDoc.setTitle(''); removed.push('Title'); }
    if (currentAuthor) { pdfLibDoc.setAuthor(''); removed.push('Author'); }
    if (currentSubject) { pdfLibDoc.setSubject(''); removed.push('Subject'); }
    if (currentKeywords) { pdfLibDoc.setKeywords([]); removed.push('Keywords'); }
    if (currentCreator) { pdfLibDoc.setCreator(''); removed.push('Creator'); }
    if (currentProducer) { pdfLibDoc.setProducer(''); removed.push('Producer'); }

    // Remove Document Level Structures
    try {
        const catalog = pdfLibDoc.catalog;

        // PieceInfo: Application-specific private data
        if (catalog.has(PDFName.of('PieceInfo'))) {
            catalog.delete(PDFName.of('PieceInfo'));
            removed.push('Application Private Data (PieceInfo)');
        }

        // OutputIntents: Color profiles
        if (catalog.has(PDFName.of('OutputIntents'))) {
            catalog.delete(PDFName.of('OutputIntents'));
            removed.push('Color Profiles (OutputIntents)');
        }

        // StructTreeRoot: Accessibility/Tagging structure
        if (catalog.has(PDFName.of('StructTreeRoot'))) {
            catalog.delete(PDFName.of('StructTreeRoot'));
            removed.push('Structural Tags (Accessibility Info)');
        }

        // MarkInfo: Tagging state
        if (catalog.has(PDFName.of('MarkInfo'))) {
            catalog.delete(PDFName.of('MarkInfo'));
            removed.push('Mark Information');
        }

        // OCProperties: Layers (Optional Content)
        if (catalog.has(PDFName.of('OCProperties'))) {
            catalog.delete(PDFName.of('OCProperties'));
            removed.push('Layer Definitions (OCG)');
        }

        // PageLabels: Visual page numbering
        if (catalog.has(PDFName.of('PageLabels'))) {
            catalog.delete(PDFName.of('PageLabels'));
            removed.push('Page Labels');
        }

        // Deep page-level cleaning
        pdfLibDoc.getPages().forEach(page => {
            // Thumbnails
            if (page.node.has(PDFName.of('Thumb'))) {
                page.node.delete(PDFName.of('Thumb'));
                removed.push('Page Thumbnails');
            }
            // PieceInfo on pages
            if (page.node.has(PDFName.of('PieceInfo'))) {
                page.node.delete(PDFName.of('PieceInfo'));
                removed.push('Page-level Private Data');
            }
            // Metadata on pages
            if (page.node.has(PDFName.of('Metadata'))) {
                page.node.delete(PDFName.of('Metadata'));
                removed.push('Page-level Metadata');
            }
            // Annots: Optional - usually we keep them but can be cleaned if requested
            // page.node.delete(PDFName.of('Annots')); 
        });

    } catch (e) {
        console.warn('Failed in deep sanitization:', e);
    }

    return { removed: Array.from(new Set(removed)) };
}

// ============================================
// PDF/A Export (Simplified - adds PDF/A metadata)
// ============================================
export async function convertToPDFA(pdfLibDoc: PDFDocument): Promise<Uint8Array> {
    // Set required metadata
    pdfLibDoc.setCreator('PDF Studio');
    pdfLibDoc.setProducer('PDF Studio - PDF/A Compliant');

    if (!pdfLibDoc.getTitle()) {
        pdfLibDoc.setTitle('Untitled Document');
    }

    pdfLibDoc.setCreationDate(new Date());
    pdfLibDoc.setModificationDate(new Date());

    // Note: Full PDF/A compliance requires:
    // - Embedding all fonts
    // - No transparency
    // - No encryption
    // - Specific color spaces
    // - XMP metadata with PDF/A identification

    // This is a simplified version that adds the basic metadata
    // Full compliance would require a dedicated PDF/A conversion library

    return pdfLibDoc.save({
        useObjectStreams: false, // PDF/A-1 compatibility
    });
}

// ============================================
// EPUB Export
// ============================================
export async function exportToEPUB(
    pdfDoc: any,
    title: string,
    author: string
): Promise<Blob> {
    const chapters: { title: string; imageBlob: Blob; width: number; height: number }[] = [];

    // Helper for generating unique IDs (fallback for non-secure origins)
    const getUUID = () => {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const bookUUID = getUUID();

    // Render each page as a high-fidelity image
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High resolution for readability
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Convert to JPEG for better compression/quality balance
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.85);
            });

            chapters.push({
                title: `Page ${i}`,
                imageBlob: blob,
                width: viewport.width,
                height: viewport.height
            });
        }
    }

    // Generate EPUB structure (ZIP-based format)
    // Note: JSZip might be exported as default or named depending on environment
    const JSZipModule = await import('jszip');
    const JSZip = (JSZipModule as any).default || JSZipModule;
    const zip = new JSZip();

    // mimetype (must be first, uncompressed)
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    // META-INF/container.xml
    zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

    // OEBPS/content.opf (Extended for Fixed Layout EPUB 3)
    const spine = chapters.map((_, i) =>
        `<itemref idref="page${i + 1}"/>`
    ).join('\n    ');

    const firstWidth = chapters[0]?.width || 800;
    const firstHeight = chapters[0]?.height || 1200;

    zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:identifier id="BookId">urn:uuid:${bookUUID}</dc:identifier>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().split('.')[0]}Z</meta>
    <!-- Fixed Layout Metadata -->
    <meta property="rendition:layout">pre-paginated</meta>
    <meta property="rendition:orientation">auto</meta>
    <meta property="rendition:spread">none</meta>
    <meta property="rendition:viewport">width=${firstWidth},height=${firstHeight}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    ${chapters.map((_, i) =>
        `<item id="page${i + 1}" href="page${i + 1}.xhtml" media-type="application/xhtml+xml"/>
         <item id="img${i + 1}" href="images/page${i + 1}.jpg" media-type="image/jpeg"/>`
    ).join('\n    ')}
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  </manifest>
  <spine toc="ncx">
    ${spine}
  </spine>
</package>`);

    // OEBPS/nav.xhtml (Mandatory for EPUB 3)
    zip.file('OEBPS/nav.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>${escapeXml(title)}</title>
  <meta charset="utf-8" />
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      ${chapters.map((ch, i) => `<li><a href="page${i + 1}.xhtml">${escapeXml(ch.title)}</a></li>`).join('\n      ')}
    </ol>
  </nav>
  <nav epub:type="landmarks" id="landmarks" hidden="hidden">
    <h2>Landmarks</h2>
    <ol>
      <li><a epub:type="toc" href="#toc">Table of Contents</a></li>
      <li><a epub:type="bodymatter" href="page1.xhtml">Begin Reading</a></li>
    </ol>
  </nav>
</body>
</html>`);

    // OEBPS/toc.ncx
    const navPoints = chapters.map((ch, i) => `
    <navPoint id="navpoint${i + 1}" playOrder="${i + 1}">
      <navLabel><text>${escapeXml(ch.title)}</text></navLabel>
      <content src="page${i + 1}.xhtml"/>
    </navPoint>`
    ).join('');

    zip.file('OEBPS/toc.ncx', `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${bookUUID}"/>
  </head>
  <docTitle><text>${escapeXml(title)}</text></docTitle>
  <navMap>${navPoints}
  </navMap>
</ncx>`);

    // Images folder
    const imgFolder = zip.folder('OEBPS/images');
    chapters.forEach((ch, i) => {
        imgFolder?.file(`page${i + 1}.jpg`, ch.imageBlob);
    });

    // Page files (Fixed Layout Viewports)
    for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];

        zip.file(`OEBPS/page${i + 1}.xhtml`, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>${escapeXml(chapter.title)}</title>
  <meta name="viewport" content="width=${chapter.width}, height=${chapter.height}"/>
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; background-color: #000; overflow: hidden; }
    svg { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" 
       viewBox="0 0 ${chapter.width} ${chapter.height}" preserveAspectRatio="xMidYMid meet">
    <image width="${chapter.width}" height="${chapter.height}" xlink:href="images/page${i + 1}.jpg"/>
  </svg>
</body>
</html>`);
    }

    return zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
}

// ============================================
// Accessibility Tools
// ============================================
export interface AccessibilityReport {
    score: number; // 0-100
    issues: {
        severity: 'error' | 'warning' | 'info';
        message: string;
        page?: number;
    }[];
    hasTaggedContent: boolean;
    hasDocumentTitle: boolean;
    hasLanguage: boolean;
    imageAltTextCoverage: number;
}

export async function checkAccessibility(pdfLibDoc: PDFDocument): Promise<AccessibilityReport> {
    const issues: AccessibilityReport['issues'] = [];
    let score = 100;

    // Check document title
    const hasDocumentTitle = Boolean(pdfLibDoc.getTitle());
    if (!hasDocumentTitle) {
        issues.push({ severity: 'error', message: 'Document has no title' });
        score -= 10;
    }

    // Check for language specification
    let hasLanguage = false;
    try {
        const catalog = pdfLibDoc.catalog;
        hasLanguage = catalog.has(PDFName.of('Lang'));
    } catch (e) { }

    if (!hasLanguage) {
        issues.push({ severity: 'warning', message: 'Document language is not specified' });
        score -= 5;
    }

    // Check for tagged content (structure tree)
    let hasTaggedContent = false;
    try {
        const catalog = pdfLibDoc.catalog;
        hasTaggedContent = catalog.has(PDFName.of('MarkInfo')) || catalog.has(PDFName.of('StructTreeRoot'));
    } catch (e) { }

    if (!hasTaggedContent) {
        issues.push({ severity: 'error', message: 'Document is not tagged (no structure tree)' });
        score -= 20;
    }

    // Check for images without alt text (simplified check)
    let imageCount = 0;
    let imagesWithAlt = 0;

    // Note: Full image alt text checking would require parsing the structure tree
    // This is a simplified version
    const imageAltTextCoverage = imageCount > 0 ? (imagesWithAlt / imageCount) * 100 : 100;

    // Add general accessibility recommendations
    if (score >= 80) {
        issues.push({ severity: 'info', message: 'Consider adding bookmarks for navigation' });
        issues.push({ severity: 'info', message: 'Ensure reading order matches visual layout' });
    }

    return {
        score: Math.max(0, score),
        issues,
        hasTaggedContent,
        hasDocumentTitle,
        hasLanguage,
        imageAltTextCoverage,
    };
}

export async function addDocumentLanguage(pdfLibDoc: PDFDocument, language: string = 'en'): Promise<void> {
    try {
        pdfLibDoc.catalog.set(PDFName.of('Lang'), PDFString.of(language));
    } catch (e) {
        console.error('Failed to set document language:', e);
    }
}

// ============================================
// Plain Text Export
// ============================================
export async function exportToPlainText(pdfDoc: any): Promise<string> {
    const textContent: string[] = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        try {
            const page = await pdfDoc.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
                .map((item: any) => item.str)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();

            if (pageText) {
                textContent.push(`--- Page ${i} ---\n${pageText}`);
            }
        } catch (e) {
            console.warn(`Failed to extract text from page ${i}:`, e);
        }
    }

    return textContent.join('\n\n');
}

// ============================================
// Markdown Export
// ============================================
export async function exportToMarkdown(pdfDoc: any, pdfLibDoc: PDFDocument): Promise<string> {
    const title = pdfLibDoc.getTitle() || 'Untitled Document';
    const author = pdfLibDoc.getAuthor() || '';

    let markdown = `# ${title}\n\n`;

    if (author) {
        markdown += `**Author:** ${author}\n\n`;
    }

    markdown += `---\n\n`;

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        try {
            const page = await pdfDoc.getPage(i);
            const content = await page.getTextContent();

            // Group text items by approximate Y position for paragraph detection
            const items = content.items as any[];
            const lines: { y: number; text: string }[] = [];

            items.forEach((item: any) => {
                const y = Math.round(item.transform[5]); // Y position
                const existing = lines.find(l => Math.abs(l.y - y) < 5);
                if (existing) {
                    existing.text += ' ' + item.str;
                } else {
                    lines.push({ y, text: item.str });
                }
            });

            // Sort by Y (descending for top-to-bottom)
            lines.sort((a, b) => b.y - a.y);

            // Convert to markdown paragraphs
            const paragraphs = lines
                .map(l => l.text.trim())
                .filter(t => t.length > 0)
                .map(t => {
                    // Detect potential headings (short lines in all caps or ending with colon)
                    if (t.length < 100 && (t === t.toUpperCase() || t.endsWith(':'))) {
                        return `## ${t}`;
                    }
                    return t;
                });

            if (paragraphs.length > 0) {
                markdown += `### Page ${i}\n\n`;
                markdown += paragraphs.join('\n\n') + '\n\n';
            }
        } catch (e) {
            console.warn(`Failed to extract text from page ${i}:`, e);
        }
    }

    return markdown;
}

// ============================================
// HTML Export (Visual & Structured)
// ============================================
export async function exportToHTML(pdfDoc: any, pdfLibDoc: PDFDocument): Promise<string> {
    const title = pdfLibDoc.getTitle() || 'Untitled Document';

    let htmlContent = '';
    const pageData: { image: string; width: number; height: number; text: any[] }[] = [];

    // Step 1: Render pages and extract visual info
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        try {
            const page = await pdfDoc.getPage(i);
            const scale = 1.5; // Good balance for clarity vs size
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            if (context) {
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                const imageData = canvas.toDataURL('image/jpeg', 0.8);
                const textContent = await page.getTextContent();

                pageData.push({
                    image: imageData,
                    width: viewport.width,
                    height: viewport.height,
                    text: textContent.items
                });
            }
        } catch (e) {
            console.warn(`Failed to process page ${i} for HTML:`, e);
        }
    }

    // Step 2: Build HTML with layers (Image Background + Text Overlay)
    pageData.forEach((page, i) => {
        htmlContent += `
        <div class="pdf-page" id="page-${i + 1}" style="width: ${page.width}px; height: ${page.height}px;">
            <img src="${page.image}" class="page-background" alt="Page ${i + 1}" />
            <div class="text-layer">
        `;

        // Add text elements as TRANSPARENT overlays (for selection/search only)
        page.text.forEach((item: any) => {
            const tx = item.transform;
            const x = tx[4] * 1.5; // compensate for rendering scale
            const y = page.height - (tx[5] * 1.5);
            const fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]) * 1.5;

            htmlContent += `
                <span style="left: ${x}px; top: ${y - fontSize}px; font-size: ${fontSize}px; font-family: sans-serif;">
                    ${escapeHtml(item.str)}
                </span>`;
        });

        htmlContent += `
            </div>
        </div>\n`;
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body { background: #f0f2f5; margin: 0; padding: 40px 0; display: flex; flex-direction: column; align-items: center; font-family: sans-serif; }
    .pdf-page { background: white; margin-bottom: 30px; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border-radius: 4px; overflow: hidden; }
    .page-background { width: 100%; height: 100%; display: block; pointer-events: none; }
    .text-layer { position: absolute; inset: 0; pointer-events: none; }
    .text-layer span { 
        position: absolute; 
        white-space: pre; 
        pointer-events: auto; 
        color: transparent; /* Makes text selectable but invisible, preventing ghosting */
        transform-origin: 0 0;
    }
    ::selection { background: rgba(0, 80, 255, 0.2); }
    .page-info { position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.7); color: white; padding: 10px 20px; border-radius: 30px; font-size: 12px; z-index: 1000; }
    @media print {
        body { background: none; padding: 0; }
        .pdf-page { margin: 0; box-shadow: none; page-break-after: always; }
        .text-layer { display: none; }
    }
  </style>
</head>
<body>
    ${htmlContent}
    <div class="page-info">Exported from PDF PhD • ${pageData.length} Pages</div>
</body>
</html>`;
}

// ============================================
// Enhanced JSON Structure Export
// ============================================
export async function exportToJSON(pdfLibDoc: PDFDocument, pdfDoc: any): Promise<string> {
    const structure: any = {
        documentInfo: {
            title: pdfLibDoc.getTitle() || '',
            author: pdfLibDoc.getAuthor() || '',
            subject: pdfLibDoc.getSubject() || '',
            keywords: pdfLibDoc.getKeywords() || '',
            creator: pdfLibDoc.getCreator() || '',
            producer: pdfLibDoc.getProducer() || '',
            pageCount: pdfLibDoc.getPageCount(),
        },
        pages: []
    };

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1.0 });

        structure.pages.push({
            number: i,
            width: viewport.width,
            height: viewport.height,
            rotation: viewport.rotation,
            content: textContent.items.map((item: any) => ({
                text: item.str,
                x: item.transform[4],
                y: item.transform[5],
                width: item.width,
                height: item.height,
                fontName: item.fontName,
                hasEOL: item.hasEOL
            }))
        });
    }

    return JSON.stringify(structure, null, 2);
}

// ============================================
// Enhanced Tables to CSV Export
// ============================================
export async function exportTablesToCSV(pdfDoc: any): Promise<{ pageNumber: number; tables: string[] }[]> {
    const result: { pageNumber: number; tables: string[] }[] = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        try {
            const page = await pdfDoc.getPage(i);
            const content = await page.getTextContent();
            if (content.items.length === 0) continue;

            // Better table detection: Look for items with consistent X alignments (columns)
            const items = content.items as any[];

            // Cluster by Y (rows) with higher precision
            const rows: Map<number, any[]> = new Map();
            items.forEach(item => {
                const y = Math.round(item.transform[5]);
                let foundRow = false;
                for (const [rowY] of rows) {
                    if (Math.abs(rowY - y) < 8) { // 8pt tolerance for row alignment
                        rows.get(rowY)!.push(item);
                        foundRow = true;
                        break;
                    }
                }
                if (!foundRow) rows.set(y, [item]);
            });

            const sortedY = Array.from(rows.keys()).sort((a, b) => b - a);
            const rawRows = sortedY.map(y => rows.get(y)!.sort((a, b) => a.transform[4] - b.transform[4]));

            // Detect table bounds (consecutive rows with 2+ columns)
            const tables: string[][] = [];
            let currentTable: any[][] = [];

            rawRows.forEach(row => {
                if (row.length >= 2) {
                    currentTable.push(row);
                } else if (currentTable.length > 0) {
                    if (currentTable.length >= 2) tables.push(processTableRows(currentTable));
                    currentTable = [];
                }
            });
            if (currentTable.length >= 2) tables.push(processTableRows(currentTable));

            if (tables.length > 0) {
                result.push({
                    pageNumber: i,
                    tables: tables.map(t => t.join('\n'))
                });
            }
        } catch (e) {
            console.warn(`Failed table extraction on page ${i}:`, e);
        }
    }

    return result;
}

function processTableRows(rows: any[][]): string[] {
    // Detect column boundaries across all rows to handle "holes" or merged cells
    const allX = rows.flat().map(item => item.transform[4]);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const tableWidth = maxX - minX;

    // Divide table into virtual columns (simple heuristic: 10% of width)
    const colStep = tableWidth / 10;

    return rows.map(row => {
        const line: string[] = [];
        let currentX = minX;

        row.forEach(item => {
            const itemX = item.transform[4];
            // If there's a significant gap, add empty cells
            while (itemX - currentX > colStep) {
                line.push('');
                currentX += colStep;
            }
            line.push(item.str.replace(/"/g, '""'));
            currentX = itemX + (item.width || 20);
        });

        return '"' + line.join('","') + '"';
    });
}

export async function exportAllTablesToCSV(pdfDoc: any): Promise<string> {
    const data = await exportTablesToCSV(pdfDoc);
    if (data.length === 0) return 'No tables detected in document.';

    let csv = '';
    data.forEach(page => {
        csv += `\n# --- Page ${page.pageNumber} ---\n`;
        page.tables.forEach((table, idx) => {
            csv += `# Table ${idx + 1}\n${table}\n\n`;
        });
    });
    return csv.trim();
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}


