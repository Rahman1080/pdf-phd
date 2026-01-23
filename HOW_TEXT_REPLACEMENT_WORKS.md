# 📚 How PDF Text Replacement Works (pdf-lib)

## The Visual Explanation

### What You Think Happens:
```
PDF Text: "Hello World"
         ↓ (Edit)
PDF Text: "Goodbye World"
```

### What Actually Happens:
```
Step 1: Original PDF
┌─────────────────────┐
│                     │
│  Hello World   ← Text drawn at X=100, Y=700
│                     │
└─────────────────────┘

Step 2: Draw White Rectangle (Erase)
┌─────────────────────┐
│                     │
│  ▓▓▓▓▓▓▓▓▓▓▓   ← White rectangle covers old text
│                     │
└─────────────────────┘

Step 3: Draw New Text
┌─────────────────────┐
│                     │
│  Goodbye World  ← New text drawn on top
│                     │
└─────────────────────┘
```

---

## Why PDFs Work This Way

### PDF Structure (Simplified):
```
PDF File
├── Page 1
│   ├── Background (white)
│   ├── Graphics Layer 1: Rectangle at (50, 100)
│   ├── Graphics Layer 2: Image at (200, 400)
│   ├── Text Layer 1: "Hello" at (100, 700) size=12
│   ├── Text Layer 2: "World" at (145, 700) size=12
│   └── ...more layers...
└── Page 2
    └── ...
```

**Key Point:** Text is just drawing operations like graphics! Each letter is positioned individually.

---

## Step-by-Step Breakdown

### The Code:
```typescript
// STEP 1: Load PDF
const pdfDoc = await PDFDocument.load(pdfBytes);
const page = pdfDoc.getPages()[0];

// STEP 2: "Erase" old text
page.drawRectangle({
    x: 100,              // Left edge
    y: 700,              // Bottom edge (PDF coords!)
    width: 85,           // Width of "Hello World"
    height: 15,          // Height of text
    color: rgb(1, 1, 1), // White (1, 1, 1) = RGB(255, 255, 255)
});

// STEP 3: Draw new text
page.drawText("Goodbye World", {
    x: 100,              // Same X position
    y: 700,              // Same Y position
    size: 12,            // Same font size
    color: rgb(0, 0, 0), // Black
});

// STEP 4: Save
const newPdfBytes = await pdfDoc.save();
```

---

## Visual Demonstration

### Before Replacement:
```
Layer 0 (Background):
┌─────────────────────────────────┐
│                                 │
│                                 │ White page
│                                 │
└─────────────────────────────────┘

Layer 1 (Original Text):
┌─────────────────────────────────┐
│                                 │
│    Hello World                  │ Black text
│                                 │
└─────────────────────────────────┘
```

### After Step 2 (Erase):
```
Layer 0 (Background):
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
└─────────────────────────────────┘

Layer 1 (Original Text):
┌─────────────────────────────────┐
│                                 │
│    Hello World                  │ Still here!
│                                 │
└─────────────────────────────────┘

Layer 2 (White Rectangle):
┌─────────────────────────────────┐
│                                 │
│    ▓▓▓▓▓▓▓▓▓▓                   │ Covers old text
│                                 │
└─────────────────────────────────┘
```

### After Step 3 (Redraw):
```
Layer 0 (Background):
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
└─────────────────────────────────┘

Layer 1 (Original Text - hidden):
┌─────────────────────────────────┐
│                                 │
│    Hello World                  │ Hidden under
│                                 │
└─────────────────────────────────┘

Layer 2 (White Rectangle):
┌─────────────────────────────────┐
│                                 │
│    ▓▓▓▓▓▓▓▓▓▓                   │
│                                 │
└─────────────────────────────────┘

Layer 3 (New Text):
┌─────────────────────────────────┐
│                                 │
│    Goodbye World                │ New text on top!
│                                 │
└─────────────────────────────────┘

FINAL VIEW (all layers combined):
┌─────────────────────────────────┐
│                                 │
│    Goodbye World                │ ✅ Success!
│                                 │
└─────────────────────────────────┘
```

---

## Important: PDF Coordinate System

### HTML/Canvas (Top-Left Origin):
```
(0,0)─────────────►X
  │
  │   "Hello" is at (100, 50)
  │
  ▼
  Y
  
  ┌───────────────────┐
  │                   │
  │  Hello            │ Y = 50 from TOP
  │                   │
  └───────────────────┘
```

### PDF (Bottom-Left Origin):
```
  Y
  ▲
  │   ┌───────────────────┐
  │   │                   │
  │   │  Hello            │ Y = 700 from BOTTOM
  │   │                   │
  │   └───────────────────┘
  │
(0,0)─────────────►X
```

### Conversion Formula:
```typescript
// From PDF.js (top-left) to pdf-lib (bottom-left)
const pdfLibY = pageHeight - pdfjsY - textHeight;

// Example:
// Page height: 792 (Letter size)
// Text Y position from top: 50
// Text height: 15
// PDF.js Y: 50
// pdf-lib Y: 792 - 50 - 15 = 727
```

---

## Real-World Example

### Scenario: Edit OCR text "Invoice #123" to "Invoice #456"

```typescript
import { replaceTextInPDF } from './utils/pdfTextReplacement';

// After OCR detection:
const ocrResult = {
    text: "Invoice #123",
    x: 100,         // From left edge
    y: 50,          // From TOP (PDF.js coordinates)
    width: 95,      // Width of text
    height: 14,     // Height of text
    pageIndex: 0    // First page
};

// Convert Y coordinate to PDF format
const pageHeight = 792; // Letter size
const pdfY = pageHeight - ocrResult.y - ocrResult.height;
// pdfY = 792 - 50 - 14 = 728

// Replace the text
const pdfFile = await fetch('/invoice.pdf');
const pdfBytes = await pdfFile.arrayBuffer();

const modifiedBytes = await replaceTextInPDF(
    new Uint8Array(pdfBytes),
    [{
        pageIndex: 0,
        x: ocrResult.x,           // 100
        y: pdfY,                  // 728 (converted!)
        width: ocrResult.width,   // 95
        height: ocrResult.height, // 14
        oldText: "Invoice #123",
        newText: "Invoice #456",
        fontSize: 12,
        fontColor: "#000000",     // Black
        backgroundColor: "#FFFFFF" // White eraser
    }]
);

// Save the modified PDF
const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);

// Download or display
const a = document.createElement('a');
a.href = url;
a.download = 'invoice_edited.pdf';
a.click();
```

---

## Challenges & Solutions

### Challenge 1: Finding Text Position
**Problem:** How do you know where "Invoice #123" is?  
**Solution:** Use PDF.js `getTextContent()` to extract text with coordinates.

### Challenge 2: Coordinate Conversion
**Problem:** PDF.js uses top-left, pdf-lib uses bottom-left  
**Solution:** Convert with `pageHeight - y - height`

### Challenge 3: Text Width Calculation
**Problem:** How wide is the "eraser" rectangle?  
**Solution:** Use `font.widthOfTextAtSize(text, fontSize)`

### Challenge 4: Font Matching
**Problem:** Original text might use a special font  
**Solution:** Use similar standard fonts (Helvetica, Times, Courier)

---

## Limitations

### ❌ What Doesn't Work Well:
1. **Multi-line text** - Each line needs separate replacement
2. **Rotated text** - Rotation requires matrix transformations
3. **Complex fonts** - Only standard fonts available
4. **Exact positioning** - Slight variations may occur
5. **Styled text** - Bold/italic requires different font embedding

### ✅ What Works Great:
1. **Simple text replacement** - Exact same position
2. **Invoice/form fields** - Structured documents
3. **OCR corrections** - Fix scanned text errors
4. **Data updates** - Change dates, numbers, names

---

## Performance Tips

### Batch Processing:
```typescript
// ✅ GOOD: Replace all text in one pass
const allReplacements = [
    { pageIndex: 0, x: 100, y: 700, oldText: "A", newText: "B", ... },
    { pageIndex: 0, x: 200, y: 650, oldText: "C", newText: "D", ... },
    { pageIndex: 1, x: 150, y: 500, oldText: "E", newText: "F", ... },
];
const result = await replaceTextInPDF(pdfBytes, allReplacements);

// ❌ BAD: Load and save PDF multiple times
for (const replacement of allReplacements) {
    const result = await replaceTextInPDF(pdfBytes, [replacement]);
    pdfBytes = result; // Very slow!
}
```

### Memory Management:
```typescript
// For large PDFs, process in chunks
const chunkSize = 10;
for (let i = 0; i < replacements.length; i += chunkSize) {
    const chunk = replacements.slice(i, i + chunkSize);
    pdfBytes = await replaceTextInPDF(pdfBytes, chunk);
}
```

---

## Alternative: The Overlay Approach

Instead of modifying the PDF, you can overlay editable divs:

```typescript
// Overlay (non-destructive, easier)
<div
    contentEditable
    style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        fontSize: `${size}px`,
    }}
>
    {text}
</div>
```

**Pros:**
- ✅ Easier to implement
- ✅ Real-time editing
- ✅ Can undo/redo
- ✅ No coordinate conversion needed

**Cons:**
- ❌ Must "burn in" to PDF when saving
- ❌ Not truly editing the PDF
- ❌ More memory usage

---

## Summary: The "Erase and Redraw" Method

1. **Load PDF** with pdf-lib
2. **Find text position** with PDF.js
3. **Convert coordinates** (top-left → bottom-left)
4. **Draw white rectangle** over old text (erase)
5. **Draw new text** in same position
6. **Save PDF** with modifications

**It's like using white-out tape and writing over it!**

---

## Code Files

- **Implementation:** `src/utils/pdfTextReplacement.ts`
- **Usage Example:** See REAL_PDF_TEXT_EDITING.md
- **Integration:** Add to DirectTextEditor `onSave` callback

---

*Created: January 2026*  
*Method: pdf-lib drawRectangle + drawText*  
*Coordinate System: Bottom-left origin (PDF standard)*
