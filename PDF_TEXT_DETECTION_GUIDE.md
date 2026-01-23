# 🎯 PDFfiller-Style Text Detection Integration

## What This Does

This creates **automatic text detection** like PDFfiller.com where:
- ✅ All PDF text is automatically detected
- ✅ Dotted borders appear around clickable text regions
- ✅ Blue highlight on hover with "T" icon
- ✅ Click any text box to edit it
- ✅ Works with PDF.js `getTextContent()` API

---

## 📸 How It Looks (Like Your Screenshots)

```
┌─────────────────────────────────────┐
│  ┌───────────────────┐              │
│  │ Sample PDF        │ ← Dotted border around text
│  └───────────────────┘              │
│                                      │
│  ┌──────────T─────────┐             │
│  │ Created for testing │ ← Hover state with "T" icon
│  └────────────────────┘             │
│                                      │
│  This PDF is three pages long...    │
│  ┌────────────────────────────┐    │
│  │ (entire paragraph)         │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## 🔧 Integration Steps

### Step 1: Export the Component

Update `src/components/index.ts`:

```typescript
export { PDFTextLayerDetector } from './PDFTextLayerDetector';
```

### Step 2: Import in Your Main PDF Viewer

In your `App.tsx` or main PDF viewer component:

```typescript
import { PDFTextLayerDetector, DirectTextEditor } from './components';
import * as pdfjsLib from 'pdfjs-dist';
```

### Step 3: Add State for Editing

```typescript
const [editingTextBox, setEditingTextBox] = useState<{
    content: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    x: number;
    y: number;
    width: number;
    height: number;
    pageIndex: number;
    id: string;
} | null>(null);
```

### Step 4: Render Text Layer Over PDF Canvas

```tsx
{/* Your PDF canvas */}
<canvas ref={canvasRef} />

{/* Add text detection layer ON TOP */}
{pdfDocument && (
    <PDFTextLayerDetector
        pdfDocument={pdfDocument}
        pageIndex={currentPage}
        scale={zoom}
        renderCanvas={canvasRef.current}
        onTextBoxClick={(textBox) => {
            setEditingTextBox(textBox);
        }}
    />
)}

{/* Text editor modal */}
{editingTextBox && (
    <DirectTextEditor
        text={editingTextBox.content}
        fontSize={editingTextBox.fontSize}
        fontFamily={editingTextBox.fontFamily}
        color={editingTextBox.color}
        textAlign="left"
        x={editingTextBox.x}
        y={editingTextBox.y}
        onSave={(updated) => {
            // Update the PDF with new text
            console.log('Updated text:', updated);
            // TODO: Replace original text in PDF
            setEditingTextBox(null);
        }}
        onCancel={() => setEditingTextBox(null)}
        onDelete={() => {
            // Remove text from PDF
            console.log('Delete text:', editingTextBox.id);
            setEditingTextBox(null);
        }}
    />
)}
```

---

## 🎨 How It Works (Technical)

### 1. Text Extraction with PDF.js

```typescript
const page = await pdfDocument.getPage(pageIndex + 1);
const textContent = await page.getTextContent();

// textContent.items contains:
// - str: the text string
// - transform: [a, b, c, d, e, f] transformation matrix
//   - transform[4] = X position
//   - transform[5] = Y position
//   - transform[0] = font size (approximately)
// - width: text width
// - fontName: internal font identifier
```

### 2. Coordinate Conversion

PDF coordinates are **bottom-left origin**, canvas is **top-left origin**:

```typescript
const viewport = page.getViewport({ scale });
const canvasX = transform[4];
const canvasY = viewport.height - transform[5] - height;
```

### 3. Text Box Merging (Optional)

Adjacent text items are merged into larger editable regions for better UX:

```typescript
// Merges "Hello " + "world" → "Hello world"
// If they're on same line and close together
const mergedBoxes = mergeAdjacentTextBoxes(detectedBoxes);
```

---

## 📊 Full Working Example

```typescript
import { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFTextLayerDetector, DirectTextEditor } from './components';

function PDFEditor() {
    const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [editingText, setEditingText] = useState<any>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Load PDF
    useEffect(() => {
        const loadPDF = async () => {
            const pdf = await pdfjsLib.getDocument('/sample.pdf').promise;
            setPdfDocument(pdf);
            renderPage(pdf, 0);
        };
        loadPDF();
    }, []);

    // Render PDF page to canvas
    const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
        const page = await pdf.getPage(pageNum + 1);
        const viewport = page.getViewport({ scale: zoom });
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* PDF Canvas */}
            <canvas ref={canvasRef} />

            {/* Text Detection Layer */}
            {pdfDocument && (
                <PDFTextLayerDetector
                    pdfDocument={pdfDocument}
                    pageIndex={currentPage}
                    scale={zoom}
                    renderCanvas={canvasRef.current}
                    onTextBoxClick={(textBox) => {
                        console.log('Clicked text:', textBox.content);
                        setEditingText(textBox);
                    }}
                />
            )}

            {/* Text Editor */}
            {editingText && (
                <DirectTextEditor
                    text={editingText.content}
                    fontSize={editingText.fontSize}
                    fontFamily={editingText.fontFamily}
                    color={editingText.color}
                    textAlign="left"
                    x={editingText.x}
                    y={editingText.y}
                    onSave={(updated) => {
                        console.log('Save:', updated);
                        // TODO: Update PDF
                        setEditingText(null);
                    }}
                    onCancel={() => setEditingText(null)}
                />
            )}
        </div>
    );
}
```

---

## 🎯 Advanced Features

### Custom Styling

Customize the text box appearance:

```typescript
// In PDFTextLayerDetector.tsx, modify the style:
style={{
    border: hoveredBox === box.id 
        ? '2px solid #3b82f6' // Your custom hover color
        : '1px dashed rgba(156, 163, 175, 0.3)', // Your custom idle color
    borderRadius: '4px', // Rounded corners
    backgroundColor: hoveredBox === box.id 
        ? 'rgba(59, 130, 246, 0.1)' // Hover background
        : 'transparent',
}}
```

### Enable/Disable Text Detection

Add a toggle:

```typescript
const [showTextBoxes, setShowTextBoxes] = useState(true);

// In toolbar:
<button onClick={() => setShowTextBoxes(!showTextBoxes)}>
    {showTextBoxes ? 'Hide' : 'Show'} Text Boxes
</button>

// Conditionally render:
{showTextBoxes && pdfDocument && (
    <PDFTextLayerDetector ... />
)}
```

### Filter Small Text Boxes

Ignore very small text (like superscripts):

```typescript
// In extractTextBoxes function:
items.forEach((item, index) => {
    const fontSize = Math.abs(transform[0]) || 12;
    
    // Skip if too small
    if (fontSize < 6) return;
    
    // ... rest of code
});
```

---

## 🔄 Updating PDF After Edit

When user edits text, you need to update the PDF:

### Option 1: Using pdf-lib (Recommended)

```typescript
import { PDFDocument } from 'pdf-lib';

async function updateTextInPDF(
    pdfBytes: Uint8Array,
    textBox: any,
    newText: string
) {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages()[textBox.pageIndex];
    
    // Remove old text (redact it with white rectangle)
    page.drawRectangle({
        x: textBox.x,
        y: page.getHeight() - textBox.y - textBox.height,
        width: textBox.width,
        height: textBox.height,
        color: rgb(1, 1, 1), // White
    });
    
    // Draw new text
    page.drawText(newText, {
        x: textBox.x,
        y: page.getHeight() - textBox.y - textBox.height,
        size: textBox.fontSize,
        font: await pdfDoc.embedFont(StandardFonts.Helvetica),
        color: rgb(0, 0, 0),
    });
    
    return await pdfDoc.save();
}
```

### Option 2: Track Changes as Overlay Layer

```typescript
// Keep original PDF unchanged
// Store edits as overlay elements
const [textEdits, setTextEdits] = useState<any[]>([]);

function handleSave(updated) {
    setTextEdits([
        ...textEdits,
        {
            ...editingText,
            content: updated.content,
            // ... other updated properties
        }
    ]);
}

// Render edits on top of original PDF
{textEdits.map(edit => (
    <div style={{
        position: 'absolute',
        left: edit.x,
        top: edit.y,
        fontSize: edit.fontSize,
        fontFamily: edit.fontFamily,
        color: edit.color,
    }}>
        {edit.content}
    </div>
))}
```

---

## 🐛 Troubleshooting

### Text boxes not appearing
**Check:** Is PDF.js worker loaded?
```typescript
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs';
```

### Text positions are wrong
**Check:** Scale/zoom is applied correctly
```typescript
// Make sure scale is consistent between rendering and detection
const viewport = page.getViewport({ scale: zoom });
```

### Text boxes too small/large
**Adjust:** Padding or size estimation
```typescript
const width = item.width + 10; // Add padding
const height = fontSize * 1.5; // Increase height multiplier
```

### Merged text looks wrong
**Disable merging:**
```typescript
// Instead of:
const mergedBoxes = mergeAdjacentTextBoxes(detectedBoxes);

// Use:
setTextBoxes(detectedBoxes); // Use individual text items
```

---

## 📚 API Reference

### PDFTextLayerDetector Props

```typescript
interface PDFTextLayerDetectorProps {
    pdfDocument: pdfjsLib.PDFDocumentProxy;  // PDF.js document
    pageIndex: number;                        // 0-indexed page number
    scale: number;                            // Zoom level (1.0 = 100%)
    onTextBoxClick: (textBox: TextBox) => void; // Click handler
    renderCanvas: HTMLCanvasElement | null;   // Canvas element for reference
}
```

### TextBox Type

```typescript
interface TextBox {
    id: string;         // Unique identifier
    content: string;    // Text content
    x: number;          // X position (pixels)
    y: number;          // Y position (pixels)
    width: number;      // Width (pixels)
    height: number;     // Height (pixels)
    fontSize: number;   // Font size
    fontFamily: string; // Font family name
    color: string;      // Text color (hex)
    rotation: number;   // Rotation angle
    pageIndex: number;  // Page number (0-indexed)
}
```

---

## 🎉 What You Get

With this integration, your PDF editor will have:

✅ **Automatic text detection** - All PDF text automatically identified  
✅ **Visual indicators** - Dotted borders around editable text (like PDFfiller)  
✅ **Hover effects** - Blue highlight + "T" icon on hover  
✅ **Click to edit** - One click opens DirectTextEditor  
✅ **Full formatting control** - Font, size, color, alignment  
✅ **Production-ready** - Based on Mozilla's PDF.js (industry standard)  

**You now have PDFfiller's best feature!** 🚀

---

## 📖 Further Reading

- **PDF.js Documentation:** https://mozilla.github.io/pdf.js/
- **getTextContent API:** https://github.com/mozilla/pdf.js/blob/master/examples/
- **pdf-lib (for editing):** https://pdf-lib.js.org/
- **MuPDF.js (alternative):** https://mupdf.com/docs/mupdf.js.html

---

*Integration guide created: January 2026*  
*Feature: PDFfiller-style automatic text detection*
