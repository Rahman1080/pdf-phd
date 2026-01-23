// Enhanced PDF Export Handler
// Drop-in replacement for handleExportText function in App.tsx

import type * as EnhancedExport from './enhancedPdfExport';

export async function handleExportTextEnhanced(
    format: 'txt' | 'md' | 'html',
    options: { preserveLayout: boolean; includeImages: boolean },
    pdf: any,
    setProgress: (msg: string) => void,
    setShowExportTextModal: (show: boolean) => void,
    EnhancedExport: typeof import('./enhancedPdfExport'),
    onDownload?: (blob: Blob, filename: string) => void
) {
    const activePdf = pdf;
    if (!activePdf) return;

    setProgress('Extracting text and analyzing layout...');
    try {
        const pdfJsDoc = activePdf.pdfDoc;
        const pageTexts: string[] = [];
        const pageStructures: EnhancedExport.PageStructure[] = [];

        // Process each page with enhanced analysis
        for (let i = 1; i <= pdfJsDoc.numPages; i++) {
            setProgress(`Analyzing page ${i} of ${pdfJsDoc.numPages}...`);
            const page = await pdfJsDoc.getPage(i);
            const textContent = await page.getTextContent();
            const viewport = page.getViewport({ scale: 1 });
            const items = textContent.items as any[];

            // Analyze and enhance text items
            const enhancedItems = EnhancedExport.analyzeTextItems(items);

            // Calculate average font size for baseline
            const avgFontSize = enhancedItems.length > 0
                ? enhancedItems.reduce((sum, item) => sum + item.fontSize, 0) / enhancedItems.length
                : 12;

            // Group items into lines with smart detection
            const lines = EnhancedExport.groupIntoLines(enhancedItems);

            // Build structured page text with layout preservation
            const pageText = EnhancedExport.buildPageText(lines, avgFontSize, options.preserveLayout);

            pageTexts.push(pageText);
            pageStructures.push({ lines, avgFontSize, viewport });
        }

        // Generate output based on format
        let fullText = '';
        let filename = '';
        let mimeType = '';

        if (format === 'txt') {
            fullText = EnhancedExport.exportToPlainText(pageTexts);
            filename = activePdf.name.replace('.pdf', '.txt');
            mimeType = 'text/plain';
        } else if (format === 'md') {
            fullText = EnhancedExport.exportToMarkdown(pageTexts, pageStructures);
            filename = activePdf.name.replace('.pdf', '.md');
            mimeType = 'text/plain';
        } else if (format === 'html') {
            fullText = EnhancedExport.exportToHTML(pageTexts, pageStructures, activePdf.name);
            filename = activePdf.name.replace('.pdf', '.html');
            mimeType = 'text/html';
        }

        // Create and download the file
        const blob = new Blob([fullText], { type: `${mimeType};charset=utf-8` });

        if (onDownload) {
            onDownload(blob, filename);
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }

        setShowExportTextModal(false);
        setProgress('');
        alert(`✅ Successfully exported to ${format.toUpperCase()} with enhanced layout preservation!`);
    } catch (e) {
        console.error('Export error:', e);
        alert('Text extraction failed: ' + (e as Error).message);
        setProgress('');
    }
}
