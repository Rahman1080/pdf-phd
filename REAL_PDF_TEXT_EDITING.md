# 🎯 REAL PDF Text Editing Solution (Browser-Based)

## The Truth About PDF Text Editing

**PDFs are NOT like Word documents!** Here's why:

```
Word Document:
- Text is stored as editable strings
- Formatting is preserved semantically
- Easy to edit inline

PDF Document:
- Text is positioned glyphs (like images of letters)
- No semantic structure
- Each letter has X,Y coordinates
- Editing requires redrawing entire text blocks
```

---

## What PyMuPDF & pdfmake Actually Do

### PyMuPDF (Python Only)
```python
# This is Python - CAN'T run in browser
import fitz  # PyMuPDF
doc = fitz.open("file.pdf")
page = doc[0]
page.insert_text((100, 100), "New text")  # Adds new text, doesn't edit existing
```

**For browser:** Use MuPDF.js (WebAssembly port)

### pdfmake (NOT for editing!)
```javascript
// pdfmake CREATES PDFs, doesn't edit them
const pdfMake = require('pdfmake/build/pdfmake');
const docDefinition = {
    content: ['This is new PDF content']  // Creating from scratch!
};
pdfMake.createPdf(docDefinition).download();
```

**It does NOT edit existing PDFs!**

---

## ✅ WORKING Solution: Using What You Have

You already have all the tools you need! Here's the realistic approach:

### Option 1: Text Replacement (Recommended)

Use **pdf-lib** (already installed) to replace text by:
1. Detecting existing text positions (PDF.js)
2. Drawing white rectangle over old text (erase it)
3. Drawing new text in same position

### Option 2: Text Layer Overlay

Keep original PDF unchanged, overlay editable div elements on top.

### Option 3: Convert to Editable Format

Your **WordEditor** already does this - perfect solution!

---

## 🔨 Implementation: Real Text Editing

Here's working code using pdf-lib to actually EDIT text:

```typescript
// Add this to your App.tsx or create a new TextEditingService.ts

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

interface TextEdit {
    pageIndex: number;
    oldText: string;
    newText: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    color: string;
}

export async function replaceTextInPDF(
    pdfBytes: Uint8Array,
    edits: TextEdit[]
): Promise<Uint8Array> {
    // Load PDF with pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    for (const edit of edits) {
        const page = pdfDoc.getPages()[edit.pageIndex];
        const { width, height } = page.getSize();
        
        // Embed font
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        
        // Calculate text width to know how wide the "eraser" should be
        const oldTextWidth = font.widthOfTextAtSize(edit.oldText, edit.fontSize);
        const textHeight = edit.fontSize * 1.2;
        
        // Step 1: "Erase" old text by drawing white rectangle
        page.drawRectangle({
            x: edit.x,
            y: height - edit.y - textHeight,  // PDF coords are bottom-up
            width: oldTextWidth,
            height: textHeight,
            color: rgb(1, 1, 1),  // White
        });
        
        // Step 2: Draw new text in same position
        const [r, g, b] = hexToRgb(edit.color);
        page.drawText(edit.newText, {
            x: edit.x,
            y: height - edit.y - textHeight,
            size: edit.fontSize,
            font: font,
            color: rgb(r / 255, g / 255, b / 255),
        });
    }
    
    return await pdfDoc.save();
}

function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
        ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
        : [0, 0, 0];
}

// Usage in your DirectTextEditor onSave:
async function handleTextEdit(textBox: any, newContent: string) {
    const edit: TextEdit = {
        pageIndex: textBox.pageIndex,
        oldText: textBox.content,
        newText: newContent,
        x: textBox.x,
        y: textBox.y,
        fontSize: textBox.fontSize,
        fontFamily: textBox.fontFamily,
        color: textBox.color,
    };
    
    const currentPdfBytes = await pdf.file.arrayBuffer();
    const newPdfBytes = await replaceTextInPDF(
        new Uint8Array(currentPdfBytes),
        [edit]
    );
    
    // Reload PDF with changes
    const newBlob = new Blob([newPdfBytes], { type: 'application/pdf' });
    const newFile = new File([newBlob], pdf.name, { type: 'application/pdf' });
    await loadFile(newFile);
}
```

---

## 🎨 Better Approach: Overlay Editing System

Instead of modifying the PDF directly, use an overlay system (like Google Docs):

```typescript
// PDFTextOverlay.tsx - Editable overlay on top of PDF

interface OverlayText {
    id: string;
    content: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    pageIndex: number;
}

export function PDFTextOverlay({ 
    page, 
    zoom, 
    overlayTexts,
    onTextChange 
}: {
    page: number;
    zoom: number;
    overlayTexts: OverlayText[];
    onTextChange: (id: string, newContent: string) => void;
}) {
    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {overlayTexts
                .filter(t => t.pageIndex === page)
                .map(textItem => (
                    <div
                        key={textItem.id}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => onTextChange(textItem.id, e.currentTarget.textContent || '')}
                        style={{
                            position: 'absolute',
                            left: `${textItem.x * zoom}px`,
                            top: `${textItem.y * zoom}px`,
                            fontSize: `${textItem.fontSize * zoom}px`,
                            fontFamily: textItem.fontFamily,
                            color: textItem.color,
                            pointerEvents: 'auto',
                            outline: 'none',
                            cursor: 'text',
                            padding: '2px',
                            border: '1px dashed transparent',
                            minWidth: '20px',
                            minHeight: '1em',
                        }}
                        className="hover:border-blue-500 hover:bg-blue-500/5"
                    >
                        {textItem.content}
                    </div>
                ))}
        </div>
    );
}

// When user clicks "Save", export as new PDF with overlays burned in
async function saveWithOverlays(pdf: LoadedPDF, overlays: OverlayText[]) {
    const pdfDoc = await PDFDocument.load(await pdf.file.arrayBuffer());
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    for (const overlay of overlays) {
        const page = pdfDoc.getPages()[overlay.pageIndex];
        const { height } = page.getSize();
        
        page.drawText(overlay.content, {
            x: overlay.x,
            y: height - overlay.y - overlay.fontSize,
            size: overlay.fontSize,
            font: font,
            color: rgb(0, 0, 0),
        });
    }
    
    return await pdfDoc.save();
}
```

---

## 🚀 Complete Integration Plan

### Phase 1: OCR + Visual Detection (Done!)
✅ OCR extracts text positions  
✅ PDFTextLayerDetector shows clickable boxes  
✅ DirectTextEditor allows editing  

### Phase 2: Save Changes (Add This)
```typescript
// In your DirectTextEditor onSave callback:
const handleSaveTextEdit = async (updated: any) => {
    // Option A: Replace in PDF (complex, but permanent)
    await replaceTextInPDF(pdf.file, [{
        pageIndex: page,
        oldText: originalText,
        newText: updated.content,
        x: updated.x,
        y: updated.y,
        fontSize: updated.fontSize,
        fontFamily: updated.fontFamily,
        color: updated.color,
    }]);
    
    // Option B: Save as overlay (easier, can export later)
    addTextOverlay({
        id: crypto.randomUUID(),
        content: updated.content,
        x: updated.x,
        y: updated.y,
        fontSize: updated.fontSize,
        fontFamily: updated.fontFamily,
        color: updated.color,
        pageIndex: page,
    });
};
```

---

## 📊 Comparison: What Actually Works

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **pdf-lib text replacement** | ✅ Permanent changes | ⚠️ Complex positioning | Simple text edits |
| **Overlay system** | ✅ Easy to implement<br>✅ Undo/redo<br>✅ Real-time editing | ❌ Must "burn in" to save | Interactive editing |
| **Export to Word** | ✅ Full editing power<br>✅ Familiar interface | ❌ Not in-PDF editing | Complex edits |
| **PyMuPDF (Python)** | ✅ Powerful | ❌ Can't run in browser | Server-side only |
| **pdfmake** | ✅ Good for creation | ❌ Can't edit existing | Creating new PDFs |

---

## 💡 Recommended Implementation

Use the **Overlay System** because:

1. **Easy to implement** - Just `contentEditable` divs
2. **Real-time editing** - Users see changes immediately
3. **Undo/redo capable** - Track overlay changes
4. **Export when done** - Burn overlays into PDF on save

Then add a "Save PDF" button that:
```typescript
async function savePDF() {
    // Burn all overlays into the PDF
    const newPdfBytes = await saveWithOverlays(pdf, textOverlays);
    
    // Download
    const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = pdf.name;
    a.click();
}
```

---

## 🎯 Next Steps

1. **Use the PDFTextOverlay component** (code above)
2. **After OCR completes**, populate overlays with detected text
3. **Let users edit** the contentEditable divs
4. **On "Save PDF"**, burn overlays into PDF using pdf-lib

This gives you **real PDF text editing** that works in the browser!

---

## 🔗 Resources

- **pdf-lib docs:** https://pdf-lib.js.org/
- **PDF.js text extraction:** https://mozilla.github.io/pdf.js/
- **MuPDF.js (alternative):** https://mupdf.com/docs/mupdf.js.html

---

*Created: January 2026*  
*Status: Ready to implement*  
*Method: Overlay system with pdf-lib export*
