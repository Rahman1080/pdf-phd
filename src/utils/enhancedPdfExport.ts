// Enhanced PDF Export Utilities
// Preserves layout, format, and structure when converting PDFs to text/markdown/HTML

export interface EnhancedTextItem {
    str: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontName: string;
    isBold: boolean;
    isItalic: boolean;
}

export interface TextLine {
    y: number;
    items: EnhancedTextItem[];
    avgFontSize: number;
    maxFontSize: number;
}

export interface PageStructure {
    lines: TextLine[];
    avgFontSize: number;
    viewport: any;
}

/**
 * Analyze text items and extract enhanced metadata
 */
export function analyzeTextItems(items: any[]): EnhancedTextItem[] {
    return items.map(item => {
        if (!item.str) return null;
        const transform = item.transform;
        const fontSize = Math.abs(transform[0]) || 12;
        const fontName = item.fontName || '';

        return {
            str: item.str,
            x: Math.round(transform[4]),
            y: Math.round(transform[5]),
            width: item.width || 0,
            height: item.height || fontSize,
            fontSize: fontSize,
            fontName: fontName,
            isBold: fontName.toLowerCase().includes('bold'),
            isItalic: fontName.toLowerCase().includes('italic')
        };
    }).filter(Boolean) as EnhancedTextItem[];
}

/**
 * Group text items into lines with better tolerance
 */
export function groupIntoLines(enhancedItems: EnhancedTextItem[]): TextLine[] {
    const lines: TextLine[] = [];

    enhancedItems.forEach(item => {
        const tolerance = Math.max(3, item.fontSize * 0.25);
        let line = lines.find(l => Math.abs(l.y - item.y) < tolerance);
        if (!line) {
            line = { y: item.y, items: [], avgFontSize: 0, maxFontSize: 0 };
            lines.push(line);
        }
        line.items.push(item);
    });

    // Sort lines top to bottom, calculate metrics
    lines.sort((a, b) => b.y - a.y);
    lines.forEach(line => {
        line.items.sort((a, b) => a.x - b.x);
        line.avgFontSize = line.items.reduce((sum, item) => sum + item.fontSize, 0) / line.items.length;
        line.maxFontSize = Math.max(...line.items.map(item => item.fontSize));
    });

    return lines;
}

/**
 * Build text from line with proper spacing and columns
 */
export function buildLineText(line: TextLine): string {
    const sortedItems = line.items.sort((a, b) => a.x - b.x);

    let lineText = '';
    let lastX = 0;

    sortedItems.forEach((item, idx) => {
        if (idx > 0) {
            const gap = item.x - lastX;
            const spaceWidth = item.fontSize * 0.5;

            // Detect columns or large gaps
            if (gap > spaceWidth * 3) {
                // Large gap - might be column break or intentional spacing
                const spaces = Math.min(Math.floor(gap / spaceWidth), 10);
                lineText += ' '.repeat(spaces);
            } else if (gap > spaceWidth * 0.5) {
                // Normal word spacing
                lineText += ' ';
            }
        }
        lineText += item.str;
        lastX = item.x + item.width;
    });

    return lineText.trim();
}

/**
 * Calculate indentation level
 */
export function calculateIndent(line: TextLine): number {
    const minX = Math.min(...line.items.map(item => item.x));
    return Math.floor(minX / 20); // Every 20 pixels = 1 indent level
}

/**
 * Build structured page text with layout preservation
 */
export function buildPageText(lines: TextLine[], avgFontSize: number, preserveLayout: boolean): string {
    let pageText = '';
    let previousY = -1;

    lines.forEach((line) => {
        // Calculate line spacing
        const lineSpacing = previousY !== -1 ? Math.abs(previousY - line.y) : 0;
        const isLargeGap = lineSpacing > avgFontSize * 1.5;

        const lineText = buildLineText(line);
        if (!lineText) {
            previousY = line.y;
            return;
        }

        // Add paragraph breaks for large gaps
        if (isLargeGap && pageText) {
            pageText += '\n';
        }

        // Add indentation if preserving layout
        if (preserveLayout) {
            const indent = calculateIndent(line);
            if (indent > 0) {
                pageText += '  '.repeat(indent);
            }
        }

        pageText += lineText + '\n';
        previousY = line.y;
    });

    return pageText;
}

/**
 * Export to Plain Text format
 */
export function exportToPlainText(pageTexts: string[]): string {
    return pageTexts.map((t, i) => {
        const separator = '='.repeat(60);
        return `${separator}\nPAGE ${i + 1}\n${separator}\n\n${t}`;
    }).join('\n\n');
}

/**
 * Export to Markdown format with smart heading detection
 */
export function exportToMarkdown(pageTexts: string[], pageStructures: PageStructure[]): string {
    return pageTexts.map((t, i) => {
        const structure = pageStructures[i];
        const avgSize = structure.avgFontSize;
        const lines = t.split('\n');

        const mdLines = lines.map((line, lineIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return '';

            const structureLine = structure.lines[lineIdx];
            if (!structureLine) return trimmed;

            const fontSize = structureLine.maxFontSize || avgSize;
            const isBold = structureLine.items.some(item => item.isBold);

            // Detect headings by font size
            if (fontSize > avgSize * 1.4) {
                return `# ${trimmed}`;
            } else if (fontSize > avgSize * 1.2) {
                return `## ${trimmed}`;
            } else if (fontSize > avgSize * 1.05) {
                return `### ${trimmed}`;
            }

            // Detect lists
            if (/^[-•·∙○●◦▪▫■□*]\s/.test(trimmed)) {
                return `- ${trimmed.substring(2).trim()}`;
            }
            if (/^\d+[\.)]\s/.test(trimmed)) {
                return trimmed;
            }

            // Detect code blocks
            const isMonospace = structureLine.items.some(item =>
                item.fontName.toLowerCase().includes('mono') ||
                item.fontName.toLowerCase().includes('courier')
            );
            if (isMonospace || line.startsWith('      ')) {
                return `    ${trimmed}`;
            }

            // Bold text
            if (isBold && trimmed.length < 100) {
                return `**${trimmed}**`;
            }

            return trimmed || line;
        });

        return `# Page ${i + 1}\n\n${mdLines.join('\n')}`;
    }).join('\n\n---\n\n');
}

/**
 * Export to HTML format with enhanced styling
 */
export function exportToHTML(pageTexts: string[], pageStructures: PageStructure[], pdfName: string): string {
    const htmlPages = pageTexts.map((t, i) => {
        const structure = pageStructures[i];
        const avgSize = structure.avgFontSize;
        const lines = t.split('\n');

        let htmlContent = '';
        let inParagraph = false;
        let paragraphContent = '';

        const flushParagraph = () => {
            if (paragraphContent.trim()) {
                htmlContent += `<p>${paragraphContent.trim()}</p>\n`;
                paragraphContent = '';
            }
            inParagraph = false;
        };

        lines.forEach((line, lineIdx) => {
            const trimmed = line.trim();
            if (!trimmed) {
                flushParagraph();
                return;
            }

            const structureLine = structure.lines[lineIdx];
            if (!structureLine) {
                if (inParagraph) {
                    paragraphContent += ' ' + trimmed;
                } else {
                    paragraphContent = trimmed;
                    inParagraph = true;
                }
                return;
            }

            const fontSize = structureLine.maxFontSize || avgSize;
            const isBold = structureLine.items.some(item => item.isBold);
            const isItalic = structureLine.items.some(item => item.isItalic);

            // Headings
            if (fontSize > avgSize * 1.4) {
                flushParagraph();
                htmlContent += `<h1 style="font-size: ${fontSize}px;">${trimmed}</h1>\n`;
            } else if (fontSize > avgSize * 1.2) {
                flushParagraph();
                htmlContent += `<h2 style="font-size: ${fontSize}px;">${trimmed}</h2>\n`;
            } else if (fontSize > avgSize * 1.05) {
                flushParagraph();
                htmlContent += `<h3 style="font-size: ${fontSize}px;">${trimmed}</h3>\n`;
            } else {
                // Regular content
                let styledText = trimmed;
                if (isBold) styledText = `<strong>${styledText}</strong>`;
                if (isItalic) styledText = `<em>${styledText}</em>`;

                if (inParagraph) {
                    paragraphContent += ' ' + styledText;
                } else {
                    paragraphContent = styledText;
                    inParagraph = true;
                }
            }
        });

        flushParagraph();

        return `<div class="page" id="page-${i + 1}">
  <div class="page-header"><span class="page-number">Page ${i + 1}</span></div>
  <div class="page-content">
    ${htmlContent}
  </div>
</div>`;
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pdfName.replace('.pdf', '')}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Georgia', 'Times New Roman', serif; 
      max-width: 900px; 
      margin: 0 auto; 
      padding: 2rem; 
      line-height: 1.7;
      color: #333;
      background: #f9f9f9;
    }
    .document-title {
      text-align: center;
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 3rem;
      padding-bottom: 1rem;
      border-bottom: 3px solid #2563eb;
      color: #1e40af;
    }
    .page { 
      background: white;
      margin-bottom: 2rem; 
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-radius: 8px;
    }
    .page-header {
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #e5e7eb;
    }
    .page-number {
      color: #6b7280;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .page-content {
      color: #1f2937;
    }
    h1 { 
      color: #1e40af; 
      margin: 1.5rem 0 1rem;
      font-size: 1.875rem;
      font-weight: bold;
      line-height: 1.3;
    }
    h2 { 
      color: #2563eb; 
      margin: 1.25rem 0 0.875rem;
      font-size: 1.5rem;
      font-weight: bold;
      line-height: 1.4;
    }
    h3 { 
      color: #3b82f6; 
      margin: 1rem 0 0.75rem;
      font-size: 1.25rem;
      font-weight: 600;
      line-height: 1.4;
    }
    p {
      margin: 0.75rem 0;
      text-align: justify;
      hyphens: auto;
    }
    strong {
      font-weight: 700;
      color: #111827;
    }
    em {
      font-style: italic;
      color: #374151;
    }
    code {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    @media print {
      body { background: white; }
      .page { box-shadow: none; page-break-after: always; }
    }
    @media (max-width: 768px) {
      body { padding: 1rem; }
      .page { padding: 1.5rem; }
      .document-title { font-size: 1.75rem; }
    }
  </style>
</head>
<body>
  <h1 class="document-title">${pdfName.replace('.pdf', '')}</h1>
  ${htmlPages.join('\n  ')}
</body>
</html>`;
}
