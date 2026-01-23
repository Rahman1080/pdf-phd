# PDF Text Editing: Deep Dive into PDF4QT's Implementation

## Overview

PDF4QT is an open-source PDF editor that implements true PDF content stream editing. This document extracts the key algorithms and approaches that can be applied to JavaScript/TypeScript PDF editors.

## Key Architecture

### PDF Content Stream Structure

PDF pages contain a "content stream" - a sequence of operators that draw content:

```
BT                          % Begin text object
/F1 12 Tf                   % Set font F1, size 12
1 0 0 1 100 700 Tm          % Set text matrix (position)
(Hello World) Tj            % Show text
ET                          % End text object
```

### PDF4QT's 3-Phase Editing Approach

1. **Parse Phase**: `PDFPageContentEditorProcessor`
   - Reads the content stream
   - Extracts elements (text, paths, images) into editable objects
   - Preserves all state information (fonts, colors, transforms)

2. **Edit Phase**: `PDFEditedPageContentElement*` classes
   - `PDFEditedPageContentElementText` - Editable text blocks
   - `PDFEditedPageContentElementPath` - Vector graphics
   - `PDFEditedPageContentElementImage` - Images
   - Each element stores its transform, state, and content

3. **Rebuild Phase**: `PDFPageContentEditorContentStreamBuilder`
   - Converts edited elements back to PDF operators
   - Handles font encoding, color spaces, transforms
   - Produces a new content stream

## Key Text Editing Structures

### PDFEditedPageContentElementText

```cpp
class PDFEditedPageContentElementText {
    struct Item {
        bool isUpdateGraphicState;  // State change marker
        bool isText;                 // Text content marker
        TextSequence textSequence;   // Encoded text data
        PDFPageContentProcessorState state;  // Font, color, etc.
    };
    
    std::vector<Item> m_items;    // Sequence of text items
    QPainterPath m_textPath;       // Exact bounding path
    QString m_itemsAsText;         // Plain text for editing
    QTransform m_transform;        // Position/rotation transform
};
```

### Content Stream Writing for Text

From `writeText()` in PDF4QT:

```cpp
void writeText(QTextStream& stream, const QString& text) {
    stream << "q BT" << Qt::endl;    // Save state, begin text
    
    // Parse text (may contain XML markup for formatting)
    // For each text segment:
    if (textFont) {
        PDFEncodedText encoded = textFont->encodeText(characters);
        // Write hex-encoded text
        stream << "<" << encoded.encodedText.toHex() << "> Tj" << Qt::endl;
    }
    
    stream << "ET Q" << Qt::endl;    // End text, restore state
}
```

## Transform Matrix Handling

PDF uses a 6-element transformation matrix: `[a b c d e f]`

```
| a  b  0 |
| c  d  0 |
| e  f  1 |
```

Where:
- `a` = horizontal scale
- `b` = vertical skew  
- `c` = horizontal skew
- `d` = vertical scale
- `e` = x translation
- `f` = y translation

### Extract Font Metrics

```typescript
function extractFontMetrics(transform: number[]) {
    const [a, b, c, d, e, f] = transform;
    
    // Font size is the magnitude of the vertical scaling vector
    const fontSize = Math.sqrt(a * a + b * b);
    
    // Rotation angle
    const angle = Math.atan2(b, a) * (180 / Math.PI);
    
    return { fontSize, angle, x: e, y: f };
}
```

## Text Layout Analysis (from pdftextlayout.cpp)

PDF4QT uses a "docstrum" algorithm for text layout analysis:

### Settings

```cpp
struct PDFTextLayoutSettings {
    size_t samples = 5;                      // Nearest characters to consider
    PDFReal distanceSensitivity = 4.0;       // Max distance factor
    PDFReal charactersOnLineSensitivity = 0.25;  // Same-line threshold
    PDFReal fontSensitivity = 2.0;           // Font size ratio limit
    PDFReal blockVerticalSensitivity = 1.5;  // Block grouping factor
    PDFReal blockOverlapSensitivity = 0.3;   // Horizontal overlap threshold
};
```

### Line Detection

Characters are on the same line if:
1. Vertical distance < `fontSize * 0.25`
2. Font sizes are similar (ratio < 2.0)
3. Horizontal gap is reasonable

### Block Detection

Lines form a block if:
1. Vertical spacing < `lineHeight * 1.5`
2. Horizontal overlap > 30%
3. Font sizes are similar

## Content Stream Operators

### Text Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `BT` | Begin text object | `BT` |
| `ET` | End text object | `ET` |
| `Tf` | Set font and size | `/F1 12 Tf` |
| `Tm` | Set text matrix | `1 0 0 1 100 700 Tm` |
| `Td` | Move text position | `10 -15 Td` |
| `Tj` | Show text | `(Hello) Tj` |
| `TJ` | Show text with adjustments | `[(H) 80 (ello)] TJ` |
| `Tr` | Text rendering mode | `0 Tr` |

### Graphics State Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `q` | Save graphics state | `q` |
| `Q` | Restore graphics state | `Q` |
| `cm` | Concatenate matrix | `1 0 0 1 50 50 cm` |
| `g` | Set gray fill | `0.5 g` |
| `rg` | Set RGB fill | `1 0 0 rg` |
| `k` | Set CMYK fill | `0 1 1 0 k` |

### Path Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `m` | Move to | `100 200 m` |
| `l` | Line to | `200 200 l` |
| `c` | Bézier curve | `x1 y1 x2 y2 x3 y3 c` |
| `h` | Close path | `h` |
| `re` | Rectangle | `100 200 50 30 re` |
| `S` | Stroke | `S` |
| `f` | Fill | `f` |
| `B` | Fill and stroke | `B` |

## Implementation for JavaScript

### Text Whiteout (Correct Approach)

Instead of just covering text, properly calculate the bounding box:

```typescript
function calculateWhiteoutRect(item: TextItem, viewport: any) {
    const [a, b, c, d, e, f] = item.transform;
    
    // Font size from matrix
    const fontSize = Math.sqrt(a * a + b * b);
    
    // Standard metrics (adjust per font)
    const ascent = fontSize * 0.85;
    const descent = fontSize * 0.15;
    
    return {
        x: e - 1,                    // Small padding
        y: f - descent - 1,          // Start below baseline
        width: item.width + 2,
        height: ascent + descent + 2
    };
}
```

### Accurate Text Replacement

Use pdf-lib's content stream modification:

```typescript
import { PDFDocument, StandardFonts, rgb } from '@cantoo/pdf-lib';

async function replaceText(pdfBytes: Uint8Array, edits: TextEdit[]) {
    const doc = await PDFDocument.load(pdfBytes);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    
    for (const edit of edits) {
        const page = doc.getPages()[edit.pageIndex];
        
        // 1. Whiteout original text
        page.drawRectangle({
            x: edit.rect.x,
            y: edit.rect.y,
            width: edit.rect.width,
            height: edit.rect.height,
            color: rgb(1, 1, 1)  // White
        });
        
        // 2. Draw replacement at baseline
        page.drawText(edit.newText, {
            x: edit.rect.x,
            y: edit.rect.y + edit.rect.height * 0.15, // Baseline offset
            size: edit.fontSize,
            font: font,
            color: rgb(0, 0, 0)
        });
    }
    
    return doc.save();
}
```

### True Content Stream Editing (Advanced)

For true PDF editing without overlay, you need to:

1. Parse the content stream
2. Identify text operators
3. Modify the text encodings
4. Rebuild the content stream

This is complex in JavaScript but possible with libraries like `pdfjs-dist` for parsing and custom stream writing.

## Best Practices

1. **Always preserve fonts** - Use the original font when possible
2. **Match baseline positions** - Text sits ON the baseline, not above
3. **Account for encoding** - PDF text uses various encodings (WinAnsi, UTF-16, custom)
4. **Handle transforms** - Text can be rotated, scaled, skewed
5. **Group operations** - Batch edits to minimize page rebuilds

## Recommended Architecture for PDF Studio

```
┌─────────────────────────────────────────────────────────┐
│                    PDF Text Editor                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │   pdf.js        │  │   PyMuPDF       │              │
│  │   (Frontend)    │──│   (Backend)     │              │
│  │   Rendering     │  │   True Editing  │              │
│  └─────────────────┘  └─────────────────┘              │
│           │                    │                        │
│  ┌────────▼────────────────────▼────────┐              │
│  │     Text Position Calculator          │              │
│  │     (pdfTextPositioning.ts)           │              │
│  └─────────────────────────────────────┘              │
│           │                                             │
│  ┌────────▼─────────────────────────────┐              │
│  │     pdf-lib Export                    │              │
│  │     (Overlay-based for fallback)      │              │
│  └─────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

## Files Created

1. `src/utils/pdfTextPositioning.ts` - Improved position calculation
2. `server/pdf_text_server.py` - PyMuPDF server for true editing
3. `src/utils/pdfTextApiClient.ts` - Frontend API client

## Usage

### Start the Python server:
```bash
pip install pymupdf flask flask-cors
python server/pdf_text_server.py
```

### Use in your React code:
```typescript
import { smartTextEdit } from './utils/pdfTextApiClient';

const result = await smartTextEdit(pdfFile, [
    {
        pageIndex: 0,
        originalText: "Hello",
        newText: "Hi",
        rect: [100, 700, 150, 720]
    }
]);

if (result.success) {
    // result.file contains the modified PDF bytes
}
```
