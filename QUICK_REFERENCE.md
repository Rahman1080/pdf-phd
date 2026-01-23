# 🚀 Quick Reference Card - New PDF Features

## OCR Processor
**Import:** `import { OCRProcessor } from './components';`

```tsx
<OCRProcessor
    pageImages={pages.map((p, i) => ({ pageIndex: i, imageData: p.image }))}
    onComplete={(results) => console.log(results)}
    onClose={() => setShowOCR(false)}
/>
```

## Signature Creator
**Import:** `import { SignatureCreator } from './components';`

```tsx
<SignatureCreator
    onSave={(data, type) => addSignature(data, type)}
    onClose={() => setShowSig(false)}
/>
```

## Direct Text Editor
**Import:** `import { DirectTextEditor } from './components';`

```tsx
<DirectTextEditor
    text={element.content}
    fontSize={element.fontSize}
    fontFamily={element.fontFamily}
    color={element.color}
    textAlign={element.textAlign}
    x={element.x}
    y={element.y}
    onSave={(updated) => updateText(updated)}
    onCancel={() => setEditingText(null)}
/>
```

## Image Replacement
**Import:** `import { ImageReplacement } from './components';`

```tsx
<ImageReplacement
    currentImage={element.src}
    x={element.x}
    y={element.y}
    width={element.width}
    height={element.height}
    onReplace={(newImg, transforms) => replaceImage(newImg)}
    onCancel={() => setEditingImg(null)}
/>
```

---

## Quick Integration (3 Steps)

### Step 1: Add State
```typescript
const [showOCR, setShowOCR] = useState(false);
const [showSig, setShowSig] = useState(false);
const [editingText, setEditingText] = useState(null);
const [editingImg, setEditingImg] = useState(null);
```

### Step 2: Add Buttons
```tsx
<button onClick={() => setShowOCR(true)}>OCR</button>
<button onClick={() => setShowSig(true)}>Sign</button>
```

### Step 3: Enable Double-Click
```tsx
<div onDoubleClick={() => setEditingText(element)}>Text</div>
<img onDoubleClick={() => setEditingImg(element)} />
```

---

## Keyboard Shortcuts

### Direct Text Editor:
- `Ctrl+B` / `Cmd+B` - Bold
- `Ctrl+I` / `Cmd+I` - Italic
- `Esc` - Cancel
- `Ctrl+Enter` / `Cmd+Enter` - Save

### Signature Creator:
- `Esc` - Cancel

---

## Testing Commands

```bash
# Your dev server is already running!
# Just refresh browser to see changes

# Check for TypeScript errors
npm run build

# Run linter
npm run lint
```

---

## File Locations

```
src/components/
├── OCRProcessor.tsx
├── SignatureCreator.tsx  
├── DirectTextEditor.tsx
└── ImageReplacement.tsx
```

---

## Need Help?

1. Read: `FEATURE_INTEGRATION_GUIDE.md`
2. See: `DemoIntegration.tsx` (working example)
3. Check: Component source code (well-documented)

---

**🎉 You're ready to ship!**
