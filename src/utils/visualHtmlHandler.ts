// Handler for Visual HTML Export in App.tsx
// Add this function to App.tsx and call it when exporting to HTML

import * as VisualExport from './visualPdfExport';

export async function handleVisualHTMLExport(
    pdf: any,
    setProgress: (msg: string) => void,
    setShowExportTextModal: (show: boolean) => void,
    onDownload?: (blob: Blob, filename: string) => void
) {
    const activePdf = pdf;
    if (!activePdf) return;

    const options: VisualExport.VisualExportOptions = {
        scale: 2,              // High quality (2x = 144 DPI)
        format: 'png',         // PNG for lossless quality (or 'jpeg' for smaller files)
        quality: 0.95,         // JPEG quality if using jpeg
        includeText: true,     // Include invisible searchable text layer
        singlePage: false      // Separate pages with spacing
    };

    setProgress('Rendering PDF pages as images...');

    try {
        const pdfJsDoc = activePdf.pdfDoc;
        const pageImages: string[] = [];
        const textLayers: string[] = [];
        const totalPages = pdfJsDoc.numPages;

        // Render each page to image
        for (let i = 1; i <= totalPages; i++) {
            setProgress(`Rendering page ${i} of ${totalPages}...`);
            const page = await pdfJsDoc.getPage(i);
            const viewport = page.getViewport({ scale: options.scale });

            // Render page to image
            const imageData = await VisualExport.renderPageToImage(
                page,
                options.scale,
                options.format,
                options.quality
            );
            pageImages.push(imageData);

            // Extract text with positions if needed
            if (options.includeText) {
                const textLayer = await VisualExport.extractTextWithPositions(page, viewport);
                textLayers.push(textLayer);
            }
        }

        setProgress('Generating HTML document...');

        // Generate complete HTML
        const html = VisualExport.generateVisualHTML(
            pageImages,
            textLayers,
            activePdf.name,
            options
        );

        // Create and download
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const filename = activePdf.name.replace('.pdf', '_visual.html');

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
        alert(`✅ Successfully exported visual HTML with ${totalPages} page${totalPages > 1 ? 's' : ''}! Images and layout fully preserved.`);
    } catch (e) {
        console.error('Visual export error:', e);
        alert('Visual HTML export failed: ' + (e as Error).message);
        setProgress('');
    }
}


// ============================================
// INTEGRATION INSTRUCTIONS FOR APP.TSX
// ============================================

/*

1. Add import at the top of App.tsx:
   import { handleVisualHTMLExport } from './utils/visualHtmlHandler';

2. Update the ExportTextModal component to add a "Visual HTML" option.
   Modify the formats array around line 1200:

   const formats = [
     { id: 'txt' as const, label: 'Plain Text', icon: '📝', desc: 'Simple text, no formatting' },
     { id: 'md' as const, label: 'Markdown', icon: '📄', desc: 'With headings and links' },
     { id: 'html' as const, label: 'HTML (Text)', icon: '🌐', desc: 'Web-ready with styles' },
     { id: 'visual-html' as const, label: 'HTML (Visual)', icon: '🖼️', desc: 'Page images with layout' },  // NEW!
   ];

3. Update the handleExportText function to handle 'visual-html':

   const handleExportText = async (format: 'txt' | 'md' | 'html' | 'visual-html', options: ...) => {
     
     // Add this at the start:
     if (format === 'visual-html') {
       return handleVisualHTMLExport(pdf, setProgress, setShowExportTextModal, onDownload);
     }
     
     // Rest of the function continues...
   };

4. Update the type definition in ExportTextModal:
   Change: onExport: (format: 'txt' | 'md' | 'html', ...)
   To:     onExport: (format: 'txt' | 'md' | 'html' | 'visual-html', ...)

That's it! Now you'll have a "Visual HTML" export option that preserves everything!

*/
