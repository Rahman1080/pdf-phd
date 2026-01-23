// Visual PDF to HTML Export - Renders each page as image
// Preserves exact appearance including images, layout, fonts, colors

export interface VisualExportOptions {
  scale: number;           // Render quality (1 = 72dpi, 2 = 144dpi, etc.)
  format: 'png' | 'jpeg';
  quality: number;         // For JPEG (0-1)
  includeText: boolean;    // Include invisible text layer for searchability
  singlePage: boolean;     // Single scrolling page vs separate pages
}

/**
 * Render a single PDF page to canvas and return data URL
 */
export async function renderPageToImage(
  page: any,
  scale: number,
  format: 'png' | 'jpeg',
  quality: number
): Promise<string> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  // Render PDF page to canvas
  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;

  // Convert to data URL
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Extract text content with positioning for searchable overlay
 */
export async function extractTextWithPositions(page: any, viewport: any): Promise<string> {
  const textContent = await page.getTextContent();
  const items = textContent.items as any[];

  // Helper function to escape HTML
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  let textLayerHTML = '';

  items.forEach((item: any) => {
    if (!item.str || !item.str.trim()) return;

    const tx = item.transform;
    const [a, b, , , ,] = tx;

    // Improved font size calculation
    const fontHeight = Math.sqrt(a * a + b * b);
    const x = tx[4];
    const y = viewport.height - tx[5]; // Flip Y coordinate for HTML

    // Improved baseline adjustment
    // PDF text is drawn from the baseline (bottom of most characters)
    // HTML text is drawn from the top-left of its box
    const ascent = fontHeight * 0.85;

    // Create positioned span for each text item with escaped content
    const escapedText = escapeHtml(item.str);
    textLayerHTML += `<span data-text="${escapedText}" style="position:absolute;left:${x}px;top:${y - ascent}px;font-size:${fontHeight}px;opacity:0;pointer-events:none;white-space:pre;">${escapedText}</span>\n`;
  });

  return textLayerHTML;
}

/**
 * Generate modern, responsive HTML with embedded page images
 */
export function generateVisualHTML(
  pageImages: string[],
  textLayers: string[],
  pdfName: string,
  options: VisualExportOptions
): string {
  const pagesHTML = pageImages.map((imageData, index) => {
    const pageNum = index + 1;
    const textLayer = options.includeText ? textLayers[index] || '' : '';

    return `
    <div class="pdf-page" id="page-${pageNum}" data-page="${pageNum}">
      <div class="page-container">
        <div class="page-number-label">Page ${pageNum}</div>
        <div class="page-image-wrapper">
          <img 
            src="${imageData}" 
            alt="Page ${pageNum}" 
            class="page-image"
            loading="lazy"
          />
          ${textLayer ? `<div class="text-layer">${textLayer}</div>` : ''}
        </div>
      </div>
    </div>`;
  }).join('\n    ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pdfName.replace('.pdf', '')}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #2a2a2a;
      color: #fff;
      overflow-x: hidden;
    }

    .document-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    .document-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .document-info {
      font-size: 0.875rem;
      color: rgba(255,255,255,0.8);
      margin-top: 0.25rem;
    }

    .pdf-container {
      max-width: ${options.singlePage ? '100%' : '1200px'};
      margin: 0 auto;
      padding: 2rem 1rem;
      transition: all 0.3s ease;
    }

    .pdf-page {
      margin-bottom: ${options.singlePage ? '0' : '2rem'};
      background: white;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      border-radius: ${options.singlePage ? '0' : '8px'};
      overflow: visible;
      transition: transform 0.2s ease;
      transform-origin: top center;
    }

    .pdf-page:hover {
      transform: ${options.singlePage ? 'none' : 'translateY(-4px)'};
      box-shadow: ${options.singlePage ? '0 4px 20px rgba(0,0,0,0.3)' : '0 8px 30px rgba(0,0,0,0.4)'};
    }

    .page-container {
      position: relative;
      transform-origin: top center;
    }

    .page-number-label {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(102, 126, 234, 0.95);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      backdrop-filter: blur(10px);
    }

    .page-image-wrapper {
      position: relative;
      width: 100%;
      background: white;
      overflow: hidden;
    }

    .page-image {
      width: 100%;
      height: auto;
      display: block;
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }

    .text-layer {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      line-height: 1;
      user-select: text;
    }

    /* Toolbar */
    .toolbar {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      z-index: 1000;
    }

    .toolbar-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 50%;
      width: 56px;
      height: 56px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .toolbar-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }

    .toolbar-btn:active {
      transform: scale(0.95);
    }

    .toolbar-btn svg {
      width: 24px;
      height: 24px;
      fill: white;
    }

    /* Zoom controls */
    .zoom-controls {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .zoom-display {
      background: rgba(255,255,255,0.95);
      color: #333;
      padding: 0.5rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      text-align: center;
      min-width: 56px;
    }

    /* Search */
    .search-container {
      position: fixed;
      top: 5rem;
      right: 2rem;
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      display: none;
      z-index: 99;
    }

    .search-container.active {
      display: block;
    }

    .search-input {
      padding: 0.5rem 1rem;
      border: 2px solid #667eea;
      border-radius: 20px;
      font-size: 1rem;
      width: 250px;
      outline: none;
    }

    .search-input:focus {
      border-color: #764ba2;
    }

    .search-results {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #666;
    }

    /* Page navigation */
    .page-nav {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255,255,255,0.95);
      padding: 0.75rem 1.5rem;
      border-radius: 30px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      backdrop-filter: blur(10px);
      z-index: 999;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .page-nav button {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .page-nav button:hover {
      background: #764ba2;
      transform: scale(1.05);
    }

    .page-nav button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .page-indicator {
      color: #333;
      font-weight: 600;
      min-width: 100px;
      text-align: center;
    }

    /* Print styles */
    @media print {
      body {
        background: white;
      }
      .document-header,
      .toolbar,
      .page-nav,
      .search-container,
      .page-number-label {
        display: none !important;
      }
      .pdf-page {
        page-break-after: always;
        margin: 0;
        box-shadow: none;
        border-radius: 0;
      }
      .pdf-page:last-child {
        page-break-after: auto;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .document-header {
        padding: 0.75rem 1rem;
      }
      .document-title {
        font-size: 1.25rem;
      }
      .pdf-container {
        padding: 1rem 0.5rem;
      }
      .pdf-page {
        margin-bottom: 1rem;
        border-radius: 0;
      }
      .toolbar {
        bottom: 1rem;
        right: 1rem;
      }
      .toolbar-btn {
        width: 48px;
        height: 48px;
        font-size: 1rem;
      }
      .page-nav {
        bottom: 1rem;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
      }
    }

    /* Loading animation */
    .page-image {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Highlight matched text */
    .text-layer span.highlight {
      background: yellow !important;
      opacity: 0.6 !important;
    }

    .text-layer span.highlight.current {
      background: orange !important;
      opacity: 0.8 !important;
    }
  </style>
</head>
<body>
  <header class="document-header">
    <h1 class="document-title">📄 ${pdfName.replace('.pdf', '')}</h1>
    <div class="document-info">
      ${pageImages.length} page${pageImages.length > 1 ? 's' : ''} • Visual HTML Export • ${options.includeText ? 'Searchable Text' : 'Image Only'}
    </div>
  </header>

  <div class="pdf-container" id="pdf-container">
    ${pagesHTML}
  </div>

  <!-- Navigation -->
  <div class="page-nav">
    <button id="prev-page">← Prev</button>
    <span class="page-indicator">
      <span id="current-page">1</span> / <span id="total-pages">${pageImages.length}</span>
    </span>
    <button id="next-page">Next →</button>
  </div>

  <!-- Toolbar -->
  <div class="toolbar">
    <div class="zoom-controls">
      <button class="toolbar-btn" id="zoom-in" title="Zoom In (Ctrl/Cmd +)">
        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      </button>
      <div class="zoom-display" id="zoom-display">100%</div>
      <button class="toolbar-btn" id="zoom-out" title="Zoom Out (Ctrl/Cmd -)">
        <svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
      </button>
    </div>
    <button class="toolbar-btn" id="scroll-top" title="Scroll to Top">↑</button>
    ${options.includeText ? '<button class="toolbar-btn" id="search-btn" title="Search (Ctrl/Cmd F)">🔍</button>' : ''}
    <button class="toolbar-btn" id="print-btn" title="Print (Ctrl/Cmd P)">
      <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
    </button>
  </div>

  ${options.includeText ? `
  <!-- Search -->
  <div class="search-container" id="search-container">
    <input type="text" class="search-input" id="search-input" placeholder="Search in document...">
    <div class="search-results" id="search-results"></div>
  </div>
  ` : ''}

  <script>
    // Zoom functionality - scales entire page container
    let currentZoom = 100;
    const zoomStep = 25;
    const minZoom = 50;
    const maxZoom = 250;
    const pageContainers = document.querySelectorAll('.page-container');
    const zoomDisplay = document.getElementById('zoom-display');

    function updateZoom(newZoom) {
      currentZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
      zoomDisplay.textContent = currentZoom + '%';
      const scale = currentZoom / 100;
      
      // Scale each page container
      pageContainers.forEach(container => {
        container.style.transform = \`scale(\${scale})\`;
      });
    }

    document.getElementById('zoom-in').addEventListener('click', () => {
      updateZoom(currentZoom + zoomStep);
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
      updateZoom(currentZoom - zoomStep);
    });

    // Keyboard shortcuts for zoom
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          updateZoom(currentZoom + zoomStep);
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          updateZoom(currentZoom - zoomStep);
        } else if (e.key === '0') {
          e.preventDefault();
          updateZoom(100);
        }
      }
    });

    // Page navigation
    let currentPage = 1;
    const totalPages = ${pageImages.length};
    const pages = document.querySelectorAll('.pdf-page');
    
    function scrollToPage(pageNum) {
      if (pageNum >= 1 && pageNum <= totalPages) {
        currentPage = pageNum;
        pages[pageNum - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.getElementById('current-page').textContent = currentPage;
        updateNavButtons();
      }
    }
    
    function updateNavButtons() {
      document.getElementById('prev-page').disabled = currentPage === 1;
      document.getElementById('next-page').disabled = currentPage === totalPages;
    }
    
    document.getElementById('prev-page').addEventListener('click', () => {
      scrollToPage(currentPage - 1);
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
      scrollToPage(currentPage + 1);
    });
    
    // Scroll to top
    document.getElementById('scroll-top').addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Print
    document.getElementById('print-btn').addEventListener('click', () => {
      window.print();
    });
    
    ${options.includeText ? `
    // Search toggle
    const searchBtn = document.getElementById('search-btn');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    searchBtn.addEventListener('click', () => {
      searchContainer.classList.toggle('active');
      if (searchContainer.classList.contains('active')) {
        searchInput.focus();
      }
    });
    
    // Accurate search using data-text attribute
    let currentMatches = [];
    let currentMatchIndex = -1;

    function clearHighlights() {
      const textSpans = document.querySelectorAll('.text-layer span');
      textSpans.forEach(span => {
        span.classList.remove('highlight', 'current');
        span.style.backgroundColor = 'transparent';
        span.style.opacity = '0';
      });
      currentMatches = [];
      currentMatchIndex = -1;
    }

    function highlightMatches(query) {
      clearHighlights();
      if (query.length < 2) {
        searchResults.textContent = '';
        return;
      }

      const textSpans = document.querySelectorAll('.text-layer span[data-text]');
      const searchLower = query.toLowerCase();
      
      textSpans.forEach((span, index) => {
        const text = (span.getAttribute('data-text') || '').toLowerCase();
        if (text.includes(searchLower)) {
          span.classList.add('highlight');
          currentMatches.push({ element: span, text: span.getAttribute('data-text') });
        }
      });

      if (currentMatches.length > 0) {
        searchResults.textContent = \`Found \${currentMatches.length} match\${currentMatches.length > 1 ? 'es' : ''}\`;
        currentMatchIndex = 0;
        scrollToMatch(0);
      } else {
        searchResults.textContent = 'No matches found';
      }
    }

    function scrollToMatch(index) {
      if (index >= 0 && index < currentMatches.length) {
        // Remove current class from all
        currentMatches.forEach(m => m.element.classList.remove('current'));
        
        // Add current class to active match
        const match = currentMatches[index];
        match.element.classList.add('current');
        match.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
    searchInput.addEventListener('input', (e) => {
      highlightMatches(e.target.value);
    });

    // Navigate through search results with Enter
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && currentMatches.length > 0) {
        e.preventDefault();
        currentMatchIndex = (currentMatchIndex + 1) % currentMatches.length;
        scrollToMatch(currentMatchIndex);
        searchResults.textContent = \`Match \${currentMatchIndex + 1} of \${currentMatches.length}\`;
      } else if (e.key === 'Escape') {
        searchContainer.classList.remove('active');
        clearHighlights();
      }
    });
    ` : ''}
    
    // Track visible page
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const pageNum = parseInt(entry.target.dataset.page);
          currentPage = pageNum;
          document.getElementById('current-page').textContent = pageNum;
          updateNavButtons();
        }
      });
    }, { threshold: 0.5 });
    
    pages.forEach(page => observer.observe(page));
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return; // Don't interfere with search input
      
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        scrollToPage(currentPage + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollToPage(currentPage - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        scrollToPage(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollToPage(totalPages);
      }
    });
    
    updateNavButtons();
  </script>
</body>
</html>`;
}
