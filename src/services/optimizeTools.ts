import { PDFDocument } from '@cantoo/pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pixelmatch from 'pixelmatch';

export interface CompressionOptions {
    quality: 'low' | 'medium' | 'high';
    resampleImages: boolean;
    removeMetadata: boolean;
    imageQuality: number; // 0 to 1
}

export interface OptimizeResult {
    success: boolean;
    pdfBytes?: Uint8Array;
    originalSize: number;
    newSize?: number;
    compressionRatio?: number;
    error?: string;
}

/**
 * Advanced PDF Compression with Image Resampling
 * Uses pdf.js to render pages, then rebuilds PDF with compressed JPEG images
 */
export async function compressPDF(
    pdfBytes: Uint8Array,
    options: CompressionOptions = { quality: 'medium', resampleImages: true, removeMetadata: true, imageQuality: 0.6 }
): Promise<OptimizeResult> {
    try {
        const originalSize = pdfBytes.length;

        // Quality presets
        const qualitySettings = {
            low: { jpegQuality: 0.4, scale: 0.75 },
            medium: { jpegQuality: 0.65, scale: 1.0 },
            high: { jpegQuality: 0.85, scale: 1.25 }
        };
        const settings = qualitySettings[options.quality];

        if (options.resampleImages) {
            // Render each page and rebuild as compressed JPEG images
            const srcPdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
            const newPdf = await PDFDocument.create();

            for (let i = 1; i <= srcPdf.numPages; i++) {
                const page = await srcPdf.getPage(i);
                const viewport = page.getViewport({ scale: settings.scale * 1.5 }); // 1.5 base for quality

                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d')!;

                // Fill with white background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                await page.render({ canvas, canvasContext: ctx, viewport }).promise;

                // Convert to JPEG with specified quality
                const jpegDataUrl = canvas.toDataURL('image/jpeg', settings.jpegQuality);
                const jpegBase64 = jpegDataUrl.split(',')[1];
                const jpegBytes = Uint8Array.from(atob(jpegBase64), c => c.charCodeAt(0));

                const jpegImage = await newPdf.embedJpg(jpegBytes);
                const newPage = newPdf.addPage([viewport.width / 1.5 * settings.scale, viewport.height / 1.5 * settings.scale]);
                newPage.drawImage(jpegImage, {
                    x: 0,
                    y: 0,
                    width: newPage.getWidth(),
                    height: newPage.getHeight()
                });
            }

            if (options.removeMetadata) {
                newPdf.setTitle('');
                newPdf.setAuthor('');
                newPdf.setSubject('');
                newPdf.setKeywords([]);
                newPdf.setProducer('PDF PHD');
                newPdf.setCreator('PDF PHD Compressor');
            }

            const compressedBytes = await newPdf.save({ useObjectStreams: true });
            const compressionRatio = Math.round((1 - compressedBytes.length / originalSize) * 100);

            return {
                success: true,
                pdfBytes: compressedBytes,
                originalSize,
                newSize: compressedBytes.length,
                compressionRatio
            };
        } else {
            // Simple structural optimization without image resampling
            const pdfDoc = await PDFDocument.load(pdfBytes);

            if (options.removeMetadata) {
                pdfDoc.setTitle('');
                pdfDoc.setAuthor('');
                pdfDoc.setSubject('');
                pdfDoc.setKeywords([]);
                pdfDoc.setProducer('PDF PHD');
                pdfDoc.setCreator('PDF PHD');
            }

            const compressedBytes = await pdfDoc.save({
                useObjectStreams: true,
                addDefaultPage: false,
                updateFieldAppearances: false
            });

            return {
                success: true,
                pdfBytes: compressedBytes,
                originalSize,
                newSize: compressedBytes.length,
                compressionRatio: Math.round((1 - compressedBytes.length / originalSize) * 100)
            };
        }
    } catch (error) {
        return {
            success: false,
            originalSize: pdfBytes.length,
            error: (error as Error).message
        };
    }
}

/**
 * Advanced PDF Repair with multiple recovery strategies
 */
export async function repairPDF(pdfBytes: Uint8Array): Promise<OptimizeResult> {
    const originalSize = pdfBytes.length;

    // Strategy 1: Try pdf-lib with lenient options
    try {
        const pdfDoc = await PDFDocument.load(pdfBytes, {
            ignoreEncryption: true,
            updateMetadata: false
        });

        // Force rebuild all internal structures
        const repairedBytes = await pdfDoc.save({
            useObjectStreams: false, // More compatible with older readers
            addDefaultPage: false
        });

        return {
            success: true,
            pdfBytes: repairedBytes,
            originalSize,
            newSize: repairedBytes.length
        };
    } catch (firstError) {
        // Strategy 2: Try pdf.js to parse and rebuild
        try {
            const srcPdf = await pdfjsLib.getDocument({
                data: pdfBytes,
                stopAtErrors: false
            }).promise;

            const newPdf = await PDFDocument.create();

            for (let i = 1; i <= srcPdf.numPages; i++) {
                try {
                    const page = await srcPdf.getPage(i);
                    const viewport = page.getViewport({ scale: 2 });

                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    const ctx = canvas.getContext('2d')!;
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

                    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
                    const jpegBase64 = jpegDataUrl.split(',')[1];
                    const jpegBytes = Uint8Array.from(atob(jpegBase64), c => c.charCodeAt(0));

                    const jpegImage = await newPdf.embedJpg(jpegBytes);
                    const newPage = newPdf.addPage([viewport.width / 2, viewport.height / 2]);
                    newPage.drawImage(jpegImage, {
                        x: 0,
                        y: 0,
                        width: newPage.getWidth(),
                        height: newPage.getHeight()
                    });
                } catch {
                    // Skip corrupted pages
                    console.warn(`Skipped corrupted page ${i}`);
                }
            }

            if (newPdf.getPageCount() === 0) {
                throw new Error('No pages could be recovered from the PDF');
            }

            const repairedBytes = await newPdf.save();

            return {
                success: true,
                pdfBytes: repairedBytes,
                originalSize,
                newSize: repairedBytes.length
            };
        } catch (secondError) {
            return {
                success: false,
                originalSize,
                error: `Repair failed: ${(firstError as Error).message}. Recovery attempt: ${(secondError as Error).message}`
            };
        }
    }
}

/**
 * Optimize PDF for Web/Print with enhanced structure
 */
export async function optimizePDF(pdfBytes: Uint8Array): Promise<OptimizeResult> {
    try {
        const originalSize = pdfBytes.length;
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // Clean up metadata for smaller size
        pdfDoc.setTitle(pdfDoc.getTitle() || '');
        pdfDoc.setProducer('PDF PHD');
        pdfDoc.setCreator('PDF PHD Optimizer');
        pdfDoc.setModificationDate(new Date());

        // Save with maximum optimization
        const optimizedBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            updateFieldAppearances: true // Ensure forms render correctly
        });

        return {
            success: true,
            pdfBytes: optimizedBytes,
            originalSize,
            newSize: optimizedBytes.length,
            compressionRatio: Math.round((1 - optimizedBytes.length / originalSize) * 100)
        };
    } catch (error) {
        return {
            success: false,
            originalSize: pdfBytes.length,
            error: (error as Error).message
        };
    }
}

/**
 * Linearize a PDF for Fast Web View
 * Note: True linearization requires hint tables; this provides web optimization
 */
export async function linearizePDF(pdfBytes: Uint8Array): Promise<OptimizeResult> {
    try {
        const originalSize = pdfBytes.length;
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // Object streams and modern PDF structure for faster loading
        const linearizedBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            updateFieldAppearances: false
        });

        return {
            success: true,
            pdfBytes: linearizedBytes,
            originalSize,
            newSize: linearizedBytes.length
        };
    } catch (error) {
        return {
            success: false,
            originalSize: pdfBytes.length,
            error: (error as Error).message
        };
    }
}

/**
 * Compare two PDFs visually with pixel-perfect accuracy and detailed reporting
 */
export async function comparePDFs(
    pdf1Bytes: Uint8Array,
    pdf2Bytes: Uint8Array
): Promise<{
    success: boolean;
    diffImages: string[];
    overlayImages: string[];
    page1Images: string[];
    page2Images: string[];
    matchCount: number;
    pageCount: number;
    totalDiffPixels: number[];
    diffPercentages: number[];
    error?: string
}> {
    try {
        const pdf1 = await pdfjsLib.getDocument({ data: pdf1Bytes }).promise;
        const pdf2 = await pdfjsLib.getDocument({ data: pdf2Bytes }).promise;

        const numPages = Math.min(pdf1.numPages, pdf2.numPages);
        const diffImages: string[] = [];
        const overlayImages: string[] = [];
        const page1Images: string[] = [];
        const page2Images: string[] = [];
        const totalDiffPixels: number[] = [];
        const diffPercentages: number[] = [];
        let matchCount = 0;

        for (let i = 1; i <= numPages; i++) {
            const page1 = await pdf1.getPage(i);
            const page2 = await pdf2.getPage(i);

            const scale = 1.5;
            const viewport1 = page1.getViewport({ scale });
            const viewport2 = page2.getViewport({ scale });

            // Use the larger dimensions
            const width = Math.max(viewport1.width, viewport2.width);
            const height = Math.max(viewport1.height, viewport2.height);

            // Render first PDF page
            const canvas1 = document.createElement('canvas');
            canvas1.width = width;
            canvas1.height = height;
            const ctx1 = canvas1.getContext('2d', { willReadFrequently: true })!;
            ctx1.fillStyle = '#ffffff';
            ctx1.fillRect(0, 0, width, height);
            await page1.render({ canvas: canvas1, canvasContext: ctx1, viewport: viewport1 }).promise;

            // Render second PDF page
            const canvas2 = document.createElement('canvas');
            canvas2.width = width;
            canvas2.height = height;
            const ctx2 = canvas2.getContext('2d', { willReadFrequently: true })!;
            ctx2.fillStyle = '#ffffff';
            ctx2.fillRect(0, 0, width, height);
            await page2.render({ canvas: canvas2, canvasContext: ctx2, viewport: viewport2 }).promise;

            // Store page images for side-by-side view
            page1Images.push(canvas1.toDataURL());
            page2Images.push(canvas2.toDataURL());

            const img1 = ctx1.getImageData(0, 0, width, height);
            const img2 = ctx2.getImageData(0, 0, width, height);

            // Create diff canvas
            const diffCanvas = document.createElement('canvas');
            diffCanvas.width = width;
            diffCanvas.height = height;
            const diffCtx = diffCanvas.getContext('2d')!;
            const diffImg = diffCtx.createImageData(width, height);

            const numDiffPixels = pixelmatch(
                img1.data,
                img2.data,
                diffImg.data,
                width,
                height,
                { threshold: 0.1, includeAA: false }
            );

            const totalPixels = width * height;
            const diffPercent = (numDiffPixels / totalPixels) * 100;

            totalDiffPixels.push(numDiffPixels);
            diffPercentages.push(Math.round(diffPercent * 100) / 100);

            if (diffPercent < 0.1) { // Less than 0.1% difference = match
                matchCount++;
            }

            diffCtx.putImageData(diffImg, 0, 0);
            diffImages.push(diffCanvas.toDataURL());

            // Create overlay image (original with red highlights for differences)
            const overlayCanvas = document.createElement('canvas');
            overlayCanvas.width = width;
            overlayCanvas.height = height;
            const overlayCtx = overlayCanvas.getContext('2d')!;
            overlayCtx.drawImage(canvas1, 0, 0);

            // Draw diff areas in red
            const overlayImgData = overlayCtx.getImageData(0, 0, width, height);
            for (let j = 0; j < diffImg.data.length; j += 4) {
                if (diffImg.data[j] > 0) { // If there's a diff (pixelmatch uses red channel)
                    overlayImgData.data[j] = 255; // Red
                    overlayImgData.data[j + 1] = 50; // Low green
                    overlayImgData.data[j + 2] = 50; // Low blue
                    overlayImgData.data[j + 3] = 255; // Full alpha
                }
            }
            overlayCtx.putImageData(overlayImgData, 0, 0);
            overlayImages.push(overlayCanvas.toDataURL());
        }

        return {
            success: true,
            diffImages,
            overlayImages,
            page1Images,
            page2Images,
            matchCount,
            pageCount: numPages,
            totalDiffPixels,
            diffPercentages
        };
    } catch (error) {
        return {
            success: false,
            diffImages: [],
            overlayImages: [],
            page1Images: [],
            page2Images: [],
            matchCount: 0,
            pageCount: 0,
            totalDiffPixels: [],
            diffPercentages: [],
            error: (error as Error).message
        };
    }
}

/**
 * Print PDF - opens in new window to avoid cross-origin issues
 */
export function printPDF(pdfBytes: Uint8Array): Promise<void> {
    return new Promise((resolve) => {
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Open PDF in new window and trigger print
        const printWindow = window.open(url, '_blank');

        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
            };
        }

        // Cleanup after a delay
        setTimeout(() => {
            URL.revokeObjectURL(url);
            resolve();
        }, 3000);
    });
}
