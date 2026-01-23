# 🔧 Fix: Persistence Service Cache Issue

## Problem

Your PDF editor has a persistence service that:
- ✅ Automatically saves all tabs to IndexedDB
- ✅ Restores tabs on page refresh
- ❌ **Problem:** Closed tabs keep coming back
- ❌ **Problem:** New code changes don't load (cached state)

## Solution Options

### Option 1: Add "Clear Cache" Button (Recommended)

Add this button to your UI to manually clear cached state:

```tsx
// In your App.tsx (near other action buttons)
<button
    onClick={async () => {
        await persistenceService.clearState();
        window.location.reload();
    }}
    className="btn-secondary flex items-center gap-2"
    title="Clear all cached data and reload"
>
    <Trash2 className="w-4 h-4" />
    Clear Cache & Reload
</button>
```

### Option 2: Keyboard Shortcut

Add this keyboard shortcut to **Ctrl+Shift+Delete** for quick cache clear:

```tsx
// Add this useEffect in App.tsx
useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
        // Ctrl+Shift+Delete = Clear cache
        if (e.ctrlKey && e.shiftKey && e.key === 'Delete') {
            e.preventDefault();
            const confirmed = confirm('Clear all cached PDFs and reload?');
            if (confirmed) {
                await persistenceService.clearState();
                window.location.reload();
            }
        }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

### Option 3: Disable Auto-Restore (Development Mode)

Add a dev mode flag to skip auto-restore during development:

```tsx
// At the top of App.tsx
const IS_DEV_MODE = import.meta.env.DEV; // Vite's dev mode flag

// In your initialization code:
useEffect(() => {
    const initialize = async () => {
        // Only restore tabs in production
        if (!IS_DEV_MODE) {
            const state = await persistenceService.loadState();
            if (state) {
                // Restore tabs...
            }
        }
    };
    initialize();
}, []);
```

### Option 4: URL Parameter Override

Skip persistence if URL has `?fresh` parameter:

```tsx
// In initialization
useEffect(() => {
    const initialize = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const skipCache = urlParams.has('fresh');
        
        if (!skipCache) {
            const state = await persistenceService.loadState();
            if (state) {
                // Restore tabs...
            }
        }
    };
    initialize();
}, []);

// Now you can use: http://localhost:5173/?fresh
```

---

## Quick Fix Right Now

### Browser Console Method (No Code Changes)

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Paste this command:

```javascript
// Clear IndexedDB
indexedDB.deleteDatabase('PDFStudioDB').onsuccess = () => {
    console.log('✅ Cache cleared!');
    location.reload();
};
```

4. Press Enter
5. Page will reload without cached tabs

---

## Application Tab Method

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **IndexedDB** → **PDFStudioDB**
4. Right-click → **Delete database**
5. Refresh page (Ctrl+R)

---

## Permanent Fix Recommendation

Add both **Button** and **Keyboard Shortcut**:

```tsx
import { Trash2, RefreshCw } from 'lucide-react';

// In your Settings modal or toolbar:
<div className="flex items-center gap-2">
    <button
        onClick={async () => {
            const confirmed = confirm(
                'This will close all tabs and clear cached PDFs. Continue?'
            );
            if (confirmed) {
                await persistenceService.clearState();
                window.location.reload();
            }
        }}
        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg 
                   hover:bg-red-500/30 transition-colors flex items-center gap-2"
        title="Clear Cache (Ctrl+Shift+Del)"
    >
        <Trash2 className="w-4 h-4" />
        Clear All Data
    </button>
</div>

// Add keyboard shortcut listener
useEffect(() => {
    const handleClearCache = async (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'Delete') {
            e.preventDefault();
            if (confirm('Clear all cached data?')) {
                await persistenceService.clearState();
                location.reload();
            }
        }
    };

    window.addEventListener('keydown', handleClearCache);
    return () => window.removeEventListener('keydown', handleClearCache);
}, []);
```

---

## Understanding the Issue

### What Happens:
1. You open **Tab A, Tab B, Tab C**
2. App saves them to IndexedDB automatically
3. You close **Tab B**
4. You refresh page (Ctrl+R)
5. App loads from IndexedDB → **All 3 tabs restored!**

### Why This Breaks Development:
- New code changes compile ✅
- But app loads old cached PDFs ❌
- Closed tabs reappear ❌
- Looks like changes didn't work ❌

---

## Best Practice

Add a **Settings panel** with cache controls:

```tsx
<div className="settings-panel">
    <h3>Data & Cache</h3>
    
    <label className="flex items-center gap-2">
        <input
            type="checkbox"
            checked={autoSave}
            onChange={(e) => setAutoSave(e.target.checked)}
        />
        Auto-save tabs on refresh
    </label>
    
    <button onClick={clearCache}>
        Clear all cached data
    </button>
    
    <p className="text-sm text-gray-400">
        Keyboard shortcut: Ctrl+Shift+Delete
    </p>
</div>
```

---

## Testing After Fix

1. Clear cache (use any method above)
2. Close some tabs
3. Refresh page
4. ✅ Closed tabs should stay closed
5. ✅ New code changes should load

---

*Issue: Persistence service restoring closed tabs*  
*Solution: Add clear cache button + keyboard shortcut*  
*Status: Ready to implement*
