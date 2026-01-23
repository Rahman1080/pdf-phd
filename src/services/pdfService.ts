// PDF Studio - PDF Service using pdf-lib and pdfjs-dist

import { PDFDocument as PDFLibDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocument, PDFPage, TextElement, ImageElement, ShapeElement, SignatureElement, WatermarkElement, ExportOptions, CompressOptions } from '../types';
import { generateId } from '../utils/helpers';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class PDFService {
    private pdfDoc: PDFLibDocument | null = null;
    private pdfJsDoc: pdfjsLib.PDFDocumentProxy | null = null;

    /**
     * Load a PDF file and extract page information
     */
    async loadPDF(file: File): Promise<PDFDocument> {
        const arrayBuffer = await file.arrayBuffer();

        // Load with pdf-lib for editing
        this.pdfDoc = await PDFLibDocument.load(arrayBuffer, {
            ignoreEncryption: true,
            updateMetadata: false
        });

        // Load with PDF.js for rendering
        this.pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        const totalPages = this.pdfDoc.getPageCount();
        const pages: PDFPage[] = [];

        for (let i = 0; i < totalPages; i++) {
            const page = this.pdfDoc.getPage(i);
            const { width, height } = page.getSize();

            pages.push({
                index: i,
                width,
                height,
                rotation: page.getRotation().angle,
                elements: [],
                thumbnail: undefined,
            });
        }

        // Generate thumbnails asynchronously
        this.generateThumbnails(pages);

        return {
            id: generateId(),
            name: file.name,
            file,
            pages,
            totalPages,
            modified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    /**
     * Generate thumbnails for all pages
     */
    private async generateThumbnails(pages: PDFPage[]): Promise<void> {
        if (!this.pdfJsDoc) return;

        for (let i = 0; i < pages.length; i++) {
            try {
                const thumbnail = await this.renderPageToCanvas(i + 1, 150);
                pages[i].thumbnail = thumbnail;
            } catch (error) {
                console.error(`Failed to generate thumbnail for page ${i + 1}:`, error);
            }
        }
    }

    /**
     * Render a page to canvas and return as base64
     */
    async renderPageToCanvas(pageNumber: number, maxWidth: number = 800): Promise<string> {
        if (!this.pdfJsDoc) throw new Error('No PDF loaded');

        const page = await this.pdfJsDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });

        const scale = maxWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        const context = canvas.getContext('2d')!;

        await (page.render({
            canvasContext: context,
            viewport: scaledViewport,
        } as any)).promise;

        return canvas.toDataURL('image/png');
    }

    /**
     * Get rendered page as canvas element
     */
    async getPageCanvas(pageNumber: number, scale: number = 1): Promise<HTMLCanvasElement> {
        if (!this.pdfJsDoc) throw new Error('No PDF loaded');

        const page = await this.pdfJsDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext('2d')!;

        await (page.render({
            canvasContext: context,
            viewport,
        } as any)).promise;

        return canvas;
    }

    /**
     * Add text to a page
     */
    async addTextToPage(
        pageIndex: number,
        element: TextElement
    ): Promise<void> {
        if (!this.pdfDoc) throw new Error('No PDF loaded');

        const page = this.pdfDoc.getPage(pageIndex);
        const font = await this.pdfDoc.embedFont(this.mapFont(element.fontFamily));

        const color = this.hexToRgb(element.color);

        page.drawText(element.content, {
            x: element.x,
            y: page.getHeight() - element.y - element.fontSize, // Flip Y coordinate
            size: element.fontSize,
            font,
            color: rgb(color.r, color.g, color.b),
            opacity: element.opacity,
        });
    }

    /**
     * Add image to a page
     */
    async addImageToPage(
        pageIndex: number,
        element: ImageElement
    ): Promise<void> {
        if (!this.pdfDoc) throw new Error('No PDF loaded');

        const page = this.pdfDoc.getPage(pageIndex);

        // Fetch image data
        const imageData = await fetch(element.src).then(res => res.arrayBuffer());

        // Determine image type and embed
        let image;
        if (element.src.includes('image/png') || element.src.toLowerCase().endsWith('.png')) {
            image = await this.pdfDoc.embedPng(imageData);
        } else {
            image = await this.pdfDoc.embedJpg(imageData);
        }

        page.drawImage(image, {
            x: element.x,
            y: page.getHeight() - element.y - element.height, // Flip Y
            width: element.width,
            height: element.height,
            opacity: element.opacity,
        });
    }

    /**
     * Add shape to a page
     */
    async addShapeToPage(
        pageIndex: number,
        element: ShapeElement
    ): Promise<void> {
        if (!this.pdfDoc) throw new Error('No PDF loaded');

        const page = this.pdfDoc.getPage(pageIndex);
        const fill = this.hexToRgb(element.fill);
        const stroke = this.hexToRgb(element.stroke);

        const y = page.getHeight() - element.y - element.height;

        switch (element.shapeType) {
            case 'rectangle':
                page.drawRectangle({
                    x: element.x,
                    y,
                    width: element.width,
                    height: element.height,
                    color: rgb(fill.r, fill.g, fill.b),
                    borderColor: rgb(stroke.r, stroke.g, stroke.b),
                    borderWidth: element.strokeWidth,
                    opacity: element.opacity,
                });
                break;

            case 'circle':
                page.drawEllipse({
                    x: element.x + element.width / 2,
                    y: y + element.height / 2,
                    xScale: element.width / 2,
                    yScale: element.height / 2,
                    color: rgb(fill.r, fill.g, fill.b),
                    borderColor: rgb(stroke.r, stroke.g, stroke.b),
                    borderWidth: element.strokeWidth,
                    opacity: element.opacity,
                });
                break;

            case 'line':
                page.drawLine({
                    start: { x: element.x, y },
                    end: { x: element.x + element.width, y: y + element.height },
                    color: rgb(stroke.r, stroke.g, stroke.b),
                    thickness: element.strokeWidth,
                    opacity: element.opacity,
                });
                break;
        }
    }

    /**
     * Add signature to a page
     */
    async addSignatureToPage(
        pageIndex: number,
        element: SignatureElement
    ): Promise<void> {
        if (!this.pdfDoc) throw new Error('No PDF loaded');

        if (element.signatureType === 'draw' || element.signatureType === 'upload') {
            // Treat as image
            await this.addImageToPage(pageIndex, {
                ...element,
                type: 'image',
                src: element.data,
                originalWidth: element.width,
                originalHeight: element.height,
                aspectRatio: element.width / element.height,
                fit: 'contain',
                borderRadius: 0,
            } as ImageElement);
        } else {
            // Typed signature - add as text
            await this.addTextToPage(pageIndex, {
                ...element,
                type: 'text',
                content: element.data,
                fontSize: 24,
                fontFamily: 'cursive',
                fontWeight: 400,
                fontStyle: 'italic',
                color: '#000000',
                textAlign: 'left',
                lineHeight: 1.2,
            } as TextElement);
        }
    }

    /**
     * Add watermark to all pages or specific page
     */
    async addWatermark(
        element: WatermarkElement,
        pageIndices?: number[]
    ): Promise<void> {
        if (!this.pdfDoc) throw new Error('No PDF loaded');

        const pages = pageIndices
            ? pageIndices.map(i => this.pdfDoc!.getPage(i))
            : this.pdfDoc.getPages();

        for (const page of pages) {
            const { width, height } = page.getSize();

            if (element.watermarkType === 'text') {
                const font = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);
                const color = this.hexToRgb(element.color || '#808080');
                const fontSize = element.fontSize || 48;

                if (element.tiled) {
                    // Draw tiled watermark
                    const spacing = element.tileSpacing || 100;
                    const textWidth = font.widthOfTextAtSize(element.content, fontSize);

                    for (let y = 0; y < height + 200; y += spacing) {
                        for (let x = -200; x < width + 200; x += textWidth + spacing) {
                            page.drawText(element.content, {
                                x,
                                y,
                                size: fontSize,
                                font,
                                color: rgb(color.r, color.g, color.b),
                                opacity: element.opacity,
                                rotate: element.pattern === 'diagonal'
                                    ? degrees(-45)
                                    : undefined,
                            });
                        }
                    }
                } else {
                    // Center watermark
                    const textWidth = font.widthOfTextAtSize(element.content, fontSize);
                    page.drawText(element.content, {
                        x: (width - textWidth) / 2,
                        y: height / 2,
                        size: fontSize,
                        font,
                        color: rgb(color.r, color.g, color.b),
                        opacity: element.opacity,
                        rotate: element.pattern === 'diagonal'
                            ? degrees(-45)
                            : undefined,
                    });
                }
            } else {
                // Image watermark
                const imageData = await fetch(element.content).then(res => res.arrayBuffer());
                const image = await this.pdfDoc.embedPng(imageData);
                const dims = image.scale(0.5);

                if (element.tiled) {
                    const spacing = element.tileSpacing || 100;
                    for (let y = 0; y < height; y += dims.height + spacing) {
                        for (let x = 0; x < width; x += dims.width + spacing) {
                            page.drawImage(image, {
                                x,
                                y,
                                width: dims.width,
                                height: dims.height,
                                opacity: element.opacity,
                            });
                        }
                    }
                } else {
                    page.drawImage(image, {
                        x: (width - dims.width) / 2,
                        y: (height - dims.height) / 2,
                        width: dims.width,
                        height: dims.height,
                        opacity: element.opacity,
                    });
                }
            }
        }
    }

    /**
     * Merge multiple PDFs
     */
    async mergePDFs(files: File[]): Promise<Uint8Array> {
        const mergedDoc = await PDFLibDocument.create();

        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFLibDocument.load(arrayBuffer, { ignoreEncryption: true });
            const pages = await mergedDoc.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(page => mergedDoc.addPage(page));
        }

        return mergedDoc.save();
    }

    /**
     * Split PDF into multiple documents
     */
    async splitPDF(ranges: { start: number; end: number }[]): Promise<Uint8Array[]> {
        if (!this.pdfDoc) throw new Error('No PDF loaded');

        const results: Uint8Array[] = [];

        for (const range of ranges) {
            const newDoc = await PDFLibDocument.create();
            const pageIndices = Array.from(
                { length: range.end - range.start + 1 },
                (_, i) => range.start + i
            );
            const pages = await newDoc.copyPages(this.pdfDoc, pageIndices);
            pages.forEach(page => newDoc.addPage(page));
            results.push(await newDoc.save());
        }

        return results;
    }

    /**
     * Extract specific pages
     */
    async extractPages(pageIndices: number[]): Promise<Uint8Array> {
        if (!this.pdfDoc) throw new Error('No PDF loaded');

        const newDoc = await PDFLibDocument.create();
        const pages = await newDoc.copyPages(this.pdfDoc, pageIndices);
        pages.forEach(page => newDoc.addPage(page));

        return newDoc.save();
    }

    /**
     * Rotate pages
     */
    async rotatePages(pageIndices: number[], angle: number): Promise<void> {
        if (!this.pdfDoc) throw new Error('No PDF loaded');

        for (const index of pageIndices) {
            const page = this.pdfDoc.getPage(index);
            const currentRotation = page.getRotation().angle;
            page.setRotation({ type: 'degrees', angle: currentRotation + angle } as any);
        }
    }

    /**
     * Delete pages
     */
    async deletePages(pageIndices: number[]): Promise<void> {
        if (!this.pdfDoc) throw new Error('No PDF loaded');

        // Delete in reverse order to maintain indices
        const sortedIndices = [...pageIndices].sort((a, b) => b - a);
        for (const index of sortedIndices) {
            this.pdfDoc.removePage(index);
        }
    }

    /**
     * Reorder pages
     */
    async reorderPages(newOrder: number[]): Promise<void> {
        if (!this.pdfDoc) throw new Error('No PDF loaded');

        // Create a new document with pages in the new order
        const newDoc = await PDFLibDocument.create();
        const pages = await newDoc.copyPages(this.pdfDoc, newOrder);
        pages.forEach(page => newDoc.addPage(page));

        this.pdfDoc = newDoc;
    }

    /**
     * Compress PDF
     */
    async compressPDF(_options: CompressOptions): Promise<Uint8Array> {
        if (!this.pdfDoc) throw new Error('No PDF loaded');

        // For now, use basic compression options
        // Full image downsampling would require more complex processing
        return this.pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
        });
    }

    /**
     * Apply all elements and export
     */
    async exportPDF(pages: PDFPage[], options: ExportOptions): Promise<Uint8Array> {
        if (!this.pdfDoc) throw new Error('No PDF loaded');

        // Apply all elements to pages
        for (const page of pages) {
            for (const element of page.elements) {
                switch (element.type) {
                    case 'text':
                        await this.addTextToPage(page.index, element as TextElement);
                        break;
                    case 'image':
                        await this.addImageToPage(page.index, element as ImageElement);
                        break;
                    case 'shape':
                        await this.addShapeToPage(page.index, element as ShapeElement);
                        break;
                    case 'signature':
                        await this.addSignatureToPage(page.index, element as SignatureElement);
                        break;
                    case 'watermark':
                        await this.addWatermark(element as WatermarkElement, [page.index]);
                        break;
                }
            }
        }

        return this.pdfDoc.save({
            useObjectStreams: options.compress,
        });
    }

    /**
     * Export page as image
     */
    async exportPageAsImage(
        pageNumber: number,
        format: 'png' | 'jpg' = 'png',
        quality: number = 0.92
    ): Promise<Blob> {
        const canvas = await this.getPageCanvas(pageNumber, 2); // 2x for higher quality

        return new Promise((resolve, reject) => {
            canvas.toBlob(
                blob => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
                format === 'jpg' ? 'image/jpeg' : 'image/png',
                quality
            );
        });
    }

    /**
     * Get the current PDF document bytes
     */
    async getDocumentBytes(): Promise<Uint8Array> {
        if (!this.pdfDoc) throw new Error('No PDF loaded');
        return this.pdfDoc.save();
    }

    // Helper methods
    private mapFont(fontFamily: string): typeof StandardFonts[keyof typeof StandardFonts] {
        const fontMap: Record<string, typeof StandardFonts[keyof typeof StandardFonts]> = {
            'helvetica': StandardFonts.Helvetica,
            'times': StandardFonts.TimesRoman,
            'courier': StandardFonts.Courier,
            'cursive': StandardFonts.TimesRomanItalic,
        };
        return fontMap[fontFamily.toLowerCase()] || StandardFonts.Helvetica;
    }

    private hexToRgb(hex: string): { r: number; g: number; b: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
        } : { r: 0, g: 0, b: 0 };
    }
}

// Singleton instance
export const pdfService = new PDFService();
