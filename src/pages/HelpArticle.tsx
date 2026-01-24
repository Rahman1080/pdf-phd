// Help Article Page
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, ThumbsDown, ChevronRight, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Layout, SEOHead, getBreadcrumbSchema } from '../components/layout';

// Sample help articles - In production, this would come from a CMS
interface HelpArticle {
    slug: string;
    title: string;
    category: string;
    content: string;
    relatedArticles: string[];
}

const helpArticles: Record<string, HelpArticle> = {
    'quick-start': {
        slug: 'quick-start',
        title: 'Quick Start Guide',
        category: 'Getting Started',
        content: `
# Quick Start Guide

Welcome to PDF PhD! This guide will help you get started with our PDF tools in just a few minutes.

## Step 1: Open the Workplace

Click the "Open Workplace" button on the homepage or navigate to /workplace. This is your central hub for all PDF operations.

## Step 2: Upload Your PDF

You can upload a PDF in several ways:
- **Drag and drop** a file directly onto the upload area
- **Click to browse** and select a file from your computer
- Use **Ctrl+O** (or Cmd+O on Mac) as a keyboard shortcut

## Step 3: Choose a Tool

Once your PDF is loaded, you'll see the toolbar with various tools:
- **Edit**: Add text, images, and annotations
- **Organize**: Merge, split, reorder, or rotate pages
- **Convert**: Transform to/from different formats
- **Security**: Add passwords, redact, or sign
- **Optimize**: Compress file size

## Step 4: Make Your Changes

Use the selected tool to make your desired changes. All changes are previewed in real-time.

## Step 5: Export Your Document

When you're done, click the **Export** button to download your modified PDF. You can also:
- Save as a different format
- Apply compression
- Add password protection

## Tips for Success

- **Auto-save**: Your work is automatically saved in your browser
- **Undo/Redo**: Use Ctrl+Z and Ctrl+Y to undo or redo changes
- **Keyboard shortcuts**: Press ? to see all available shortcuts
- **Privacy**: All processing happens locally - your files never leave your device

## Need More Help?

Contact us at pdfphd247@gmail.com or join our WhatsApp community at /community.
    `,
        relatedArticles: ['upload-pdf', 'workplace-overview', 'export-document']
    },
    'upload-pdf': {
        slug: 'upload-pdf',
        title: 'Uploading Your First PDF',
        category: 'Getting Started',
        content: `
# Uploading Your First PDF

PDF PhD accepts various file types and provides multiple ways to upload documents.

## Supported File Types

- **PDF** (.pdf) - Primary format
- **Images** (.jpg, .png, .gif, .webp, .tiff) - Will be converted to PDF
- **Documents** (.doc, .docx, .odt) - Will be converted to PDF
- **Spreadsheets** (.xlsx, .xls) - Will be converted to PDF
- **Presentations** (.pptx, .ppt) - Will be converted to PDF

## Upload Methods

### Drag and Drop
The easiest method - simply drag files from your computer and drop them onto the upload area.

### Click to Browse
Click the upload area to open your file browser and select files.

### Keyboard Shortcut
Press **Ctrl+O** (Windows/Linux) or **Cmd+O** (Mac) to open the file dialog.

## Multiple Files
You can upload multiple files at once. They'll be added to your workspace where you can merge or work with them separately.

## File Size Limits
There's no strict file size limit, but very large files (100MB+) may take longer to process depending on your device.

## Troubleshooting

### File won't upload
- Check that the file format is supported
- Ensure the file isn't corrupted
- Try refreshing the page and uploading again

### Upload is slow
- Large files take longer to process
- Close other browser tabs to free up memory
- Consider compressing the PDF first

## Need Help?
Email us at pdfphd247@gmail.com for support.
    `,
        relatedArticles: ['quick-start', 'workplace-overview']
    },
    'workplace-overview': {
        slug: 'workplace-overview',
        title: 'Understanding the Workplace Editor',
        category: 'Getting Started',
        content: `
# Understanding the Workplace Editor

The Workplace is PDF PhD's powerful PDF editing environment where all the magic happens.

## Main Interface Areas

### 1. Toolbar (Top)
Contains all editing tools organized by category:
- **File**: Open, save, export, print
- **Edit**: Text, images, annotations
- **View**: Zoom, page layout, thumbnails
- **Tools**: All PDF tools dropdown

### 2. Page Sidebar (Left)
Shows thumbnails of all pages:
- Click to navigate to any page
- Drag to reorder pages
- Right-click for page options (delete, rotate, extract)

### 3. Main Canvas (Center)
Your PDF is displayed here:
- Scroll to navigate pages
- Click to select elements
- Double-click to edit text

### 4. Properties Panel (Right)
Shows settings for selected elements:
- Font, size, color for text
- Position, size for images
- Style options for annotations

## Keyboard Shortcuts

- **Ctrl+S** - Save document
- **Ctrl+Z** - Undo
- **Ctrl+Y** - Redo
- **Ctrl+P** - Print
- **Ctrl+F** - Find text
- **+/-** - Zoom in/out
- **Page Up/Down** - Navigate pages

## Saving Your Work

Your work is automatically saved in your browser. To export:
1. Click the **Export** button
2. Choose your format (PDF, Word, Image)
3. Select quality settings
4. Download your file

## Support

Email pdfphd247@gmail.com for any questions.
    `,
        relatedArticles: ['quick-start', 'export-document']
    },
    'export-document': {
        slug: 'export-document',
        title: 'Exporting Your Document',
        category: 'Getting Started',
        content: `
# Exporting Your Document

Learn how to save and export your edited PDFs in various formats.

## Export Options

### PDF Format
- **Standard PDF** - Best compatibility
- **PDF/A** - For archiving
- **Compressed PDF** - Smaller file size

### Other Formats
- **Word (.docx)** - Editable document
- **Images (.png, .jpg)** - Individual page images
- **Print** - Send directly to printer

## Export Settings

### Quality
- **High** - Best quality, larger file
- **Medium** - Balanced quality and size
- **Low** - Smallest file, reduced quality

### Compression
- **None** - Keep original quality
- **Standard** - Good balance
- **Maximum** - Smallest possible size

## Password Protection

Add security when exporting:
1. Check "Add Password Protection"
2. Enter your password
3. Confirm password
4. Choose permission levels

## Batch Export

Export multiple files:
1. Select multiple documents
2. Click "Batch Export"
3. Choose format and settings
4. All files will be downloaded as ZIP

## Troubleshooting

### Export fails
- Check you have enough disk space
- Try exporting in smaller chunks
- Refresh and try again

### File too large
- Use compression options
- Reduce image quality
- Remove unnecessary pages

## Contact Support

Email pdfphd247@gmail.com for help.
    `,
        relatedArticles: ['quick-start', 'workplace-overview']
    },
    'merging-pdfs': {
        slug: 'merging-pdfs',
        title: 'Merging PDF Files',
        category: 'PDF Tools',
        content: `
# Merging PDF Files

Combine multiple PDF documents into a single file with our merge tool.

## How to Merge PDFs

1. **Open the Merge Tool**
   - Go to Tools > Merge PDF, or
   - Open the Workplace and select the Merge option

2. **Add Your Files**
   - Drag and drop multiple PDF files, or
   - Click to browse and select multiple files (hold Ctrl/Cmd to select multiple)

3. **Arrange File Order**
   - Drag the files to reorder them
   - The final merged document will follow this order

4. **Merge**
   - Click the "Merge" button
   - Wait for processing to complete

5. **Download**
   - Your merged PDF is ready to download
   - Click "Download" to save it to your computer

## Tips

- **Preview pages** before merging to ensure correct order
- **Remove unwanted pages** from individual PDFs before merging
- **Compress after merging** if the file size is too large

## Frequently Asked Questions

**Can I merge password-protected PDFs?**
Yes, but you'll need to enter the password for each protected file.

**Is there a limit to how many files I can merge?**
No limit! Merge as many files as you need.

**Will the merged file preserve bookmarks?**
Yes, bookmarks from all source files are preserved.

## Support

Email pdfphd247@gmail.com for assistance.
    `,
        relatedArticles: ['splitting-pdfs', 'quick-start']
    },
    'splitting-pdfs': {
        slug: 'splitting-pdfs',
        title: 'Splitting Documents',
        category: 'PDF Tools',
        content: `
# Splitting PDF Documents

Divide your PDF into multiple smaller documents.

## Split Options

### Split by Page Range
Extract specific pages (e.g., pages 1-5, 10-15).

### Split Every N Pages
Divide document into equal chunks (e.g., every 2 pages).

### Split by Bookmarks
Create separate files based on bookmark structure.

### Extract Single Pages
Save individual pages as separate PDFs.

## How to Split

1. Upload your PDF
2. Select "Split" from the toolbar
3. Choose your split method
4. Preview the results
5. Click "Split" to process
6. Download individual files or as ZIP

## Use Cases

- Extract chapters from a book
- Separate invoice pages
- Create handouts from presentations
- Archive specific sections

## Support

Contact pdfphd247@gmail.com for help.
    `,
        relatedArticles: ['merging-pdfs', 'quick-start']
    },
    'converting-to-pdf': {
        slug: 'converting-to-pdf',
        title: 'Converting Files to PDF',
        category: 'PDF Tools',
        content: `
# Converting Files to PDF

Transform various file formats into PDF documents.

## Supported Conversions

### Documents
- **Word to PDF** - .doc, .docx files
- **Excel to PDF** - .xls, .xlsx spreadsheets
- **PowerPoint to PDF** - .ppt, .pptx presentations
- **Text to PDF** - .txt files

### Images
- **JPG to PDF** - JPEG images
- **PNG to PDF** - PNG images
- **GIF to PDF** - GIF images
- **TIFF to PDF** - TIFF images
- **WebP to PDF** - WebP images

## How to Convert

1. Go to Tools > Convert to PDF
2. Upload your file(s)
3. Adjust settings if needed
4. Click "Convert"
5. Download your PDF

## Multiple Images to PDF

1. Upload multiple images
2. Arrange order by dragging
3. Set page size and orientation
4. Convert to single PDF

## Settings

- **Page Size** - A4, Letter, Legal, Custom
- **Orientation** - Portrait or Landscape
- **Margins** - Adjust spacing
- **Quality** - High, Medium, Low

## Support

Email pdfphd247@gmail.com for assistance.
    `,
        relatedArticles: ['quick-start', 'merging-pdfs']
    },
    'adding-signatures': {
        slug: 'adding-signatures',
        title: 'Adding Signatures',
        category: 'PDF Tools',
        content: `
# Adding Electronic Signatures

Sign your PDF documents digitally with PDF PhD.

## Signature Types

### Draw Signature
Draw your signature using mouse or touchscreen.

### Type Signature
Type your name and choose from stylish fonts.

### Upload Image
Upload an image of your handwritten signature.

### Remote Signing
Send documents to others for signature via QR code.

## How to Sign

1. Open your PDF in the Workplace
2. Click "Sign" in the toolbar
3. Choose signature type
4. Create or select your signature
5. Click where you want to place it
6. Resize and position as needed
7. Save your signed document

## Remote Signing Feature

Send documents for others to sign:
1. Click "Request Signature"
2. Scan QR code or share link
3. Recipient signs on their device
4. Signature syncs to your document

## Signature Management

- Save signatures for reuse
- Create multiple signature styles
- Add initials and date stamps
- Include witness signatures

## Legal Validity

Electronic signatures created with PDF PhD are legally valid in most jurisdictions. For notarization, contact pdfphd247@gmail.com.

## Support

Email pdfphd247@gmail.com for help with signatures.
    `,
        relatedArticles: ['quick-start', 'export-document']
    },
    'create-account': {
        slug: 'create-account',
        title: 'Creating an Account',
        category: 'Account & Billing',
        content: `
# Creating an Account

PDF PhD is 100% FREE and works without an account! However, you can create one for additional features.

## Free Features (No Account Required)

- All PDF tools
- Unlimited conversions
- No watermarks
- Local processing (privacy)

## Why Create an Account?

- Sync settings across devices
- Save documents to cloud
- Access from anywhere
- Premium support

## Account Benefits

PDF PhD is committed to being free forever. An account simply enhances your experience.

## Support

For account questions, email pdfphd247@gmail.com.
    `,
        relatedArticles: ['quick-start']
    },
    'upload-issues': {
        slug: 'upload-issues',
        title: 'File Upload Issues',
        category: 'Troubleshooting',
        content: `
# Troubleshooting File Upload Issues

Having trouble uploading files? Here are solutions to common problems.

## Common Issues

### File Won't Upload
- Check file format is supported
- Ensure file isn't corrupted
- Try a different browser
- Clear browser cache

### Upload Is Slow
- Large files take longer
- Check internet connection
- Close other browser tabs
- Try during off-peak hours

### File Appears Blank
- PDF may have security restrictions
- Try with a different file
- Check if file opens elsewhere

### Upload Freezes
- Refresh the page
- Try smaller file first
- Update your browser

## Supported Formats

- PDF (.pdf)
- Word (.doc, .docx)
- Excel (.xls, .xlsx)
- PowerPoint (.ppt, .pptx)
- Images (.jpg, .png, .gif, .webp, .tiff)

## Still Having Issues?

Contact us at pdfphd247@gmail.com with:
- Your browser and version
- File type and size
- Error message (if any)
- Screenshot if possible

We'll help you resolve the issue!
    `,
        relatedArticles: ['quick-start', 'upload-pdf']
    },
    'browser-compatibility': {
        slug: 'browser-compatibility',
        title: 'Browser Compatibility',
        category: 'Troubleshooting',
        content: `
# Browser Compatibility

PDF PhD works best with modern browsers. Here's what you need to know.

## Recommended Browsers

- **Google Chrome** (latest version) ✅ Best experience
- **Microsoft Edge** (latest version) ✅ Excellent
- **Mozilla Firefox** (latest version) ✅ Great
- **Safari** (latest version) ✅ Good
- **Opera** (latest version) ✅ Good

## Minimum Requirements

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Known Issues

### Internet Explorer
Not supported. Please upgrade to Edge or Chrome.

### Older Browsers
Some features may not work. Please update your browser.

### Mobile Browsers
Most features work on mobile, but desktop is recommended for complex editing.

## Performance Tips

- Keep browser updated
- Enable JavaScript
- Allow sufficient memory
- Close unnecessary tabs

## Support

Email pdfphd247@gmail.com if you encounter browser issues.
    `,
        relatedArticles: ['upload-issues', 'quick-start']
    }
};

export function HelpArticle() {
    const { slug } = useParams<{ slug: string }>();
    const [helpful, setHelpful] = useState<boolean | null>(null);

    const article = helpArticles[slug || ''];

    if (!article) {
        return <Navigate to="/help" replace />;
    }

    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: 'https://pdfphd.com' },
        { name: 'Help Center', url: 'https://pdfphd.com/help' },
        { name: article.title, url: `https://pdfphd.com/help/${article.slug}` }
    ]);

    const relatedArticleData = article.relatedArticles
        .map(slug => helpArticles[slug])
        .filter(Boolean);

    return (
        <>
            <SEOHead
                title={`${article.title} - Help Center`}
                description={`Learn ${article.title.toLowerCase()} with our step-by-step guide.`}
                canonical={`https://pdfphd.com/help/${article.slug}`}
                schema={breadcrumbSchema}
            />

            <Layout>
                <div className="max-w-3xl mx-auto">
                    {/* Breadcrumb */}
                    <nav className="mb-8">
                        <ol className="flex items-center gap-2 text-sm text-surface-400">
                            <li>
                                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                            </li>
                            <li className="text-surface-600">/</li>
                            <li>
                                <Link to="/help" className="hover:text-white transition-colors">Help Center</Link>
                            </li>
                            <li className="text-surface-600">/</li>
                            <li className="text-white font-medium">{article.title}</li>
                        </ol>
                    </nav>

                    {/* Article Header */}
                    <header className="mb-8">
                        <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
                            {article.category}
                        </span>
                        <h1 className="text-3xl font-bold text-white mt-2">
                            {article.title}
                        </h1>
                    </header>

                    {/* Article Content */}
                    <article className="prose-custom mb-12">
                        {article.content.split('\n').map((line, i) => {
                            if (line.startsWith('# ')) {
                                return null; // Skip h1, we use our own
                            }
                            if (line.startsWith('## ')) {
                                return <h2 key={i} className="text-xl font-bold text-white mt-8 mb-4">{line.replace('## ', '')}</h2>;
                            }
                            if (line.startsWith('### ')) {
                                return <h3 key={i} className="text-lg font-semibold text-white mt-6 mb-3">{line.replace('### ', '')}</h3>;
                            }
                            if (line.startsWith('- ')) {
                                return <li key={i} className="text-surface-300 ml-6 mb-2">{line.replace('- ', '')}</li>;
                            }
                            if (line.startsWith('**') && line.endsWith('**')) {
                                return <p key={i} className="text-white font-semibold mb-2">{line.replace(/\*\*/g, '')}</p>;
                            }
                            if (line.trim() === '') {
                                return null;
                            }
                            return <p key={i} className="text-surface-300 leading-relaxed mb-4">{line}</p>;
                        })}
                    </article>

                    {/* Helpful? */}
                    <div className="p-6 rounded-2xl bg-surface-900 border border-white/5 mb-8">
                        <div className="flex items-center justify-between">
                            <span className="text-white font-medium">Was this article helpful?</span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setHelpful(true)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${helpful === true
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-surface-800 text-surface-400 hover:text-white border border-white/5'
                                        }`}
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                    Yes
                                </button>
                                <button
                                    onClick={() => setHelpful(false)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${helpful === false
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        : 'bg-surface-800 text-surface-400 hover:text-white border border-white/5'
                                        }`}
                                >
                                    <ThumbsDown className="w-4 h-4" />
                                    No
                                </button>
                            </div>
                        </div>
                        {helpful !== null && (
                            <p className="mt-4 text-sm text-surface-400">
                                {helpful
                                    ? 'Glad this was helpful! Feel free to explore more articles below.'
                                    : 'Sorry to hear that. Would you like to contact support for more help?'
                                }
                            </p>
                        )}
                    </div>

                    {/* Related Articles */}
                    {relatedArticleData.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-lg font-bold text-white mb-4">Related Articles</h2>
                            <div className="space-y-2">
                                {relatedArticleData.map((related) => (
                                    <Link
                                        key={related.slug}
                                        to={`/help/${related.slug}`}
                                        className="flex items-center justify-between p-4 rounded-xl bg-surface-900 border border-white/5 hover:border-white/15 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <HelpCircle className="w-5 h-5 text-primary-400" />
                                            <span className="text-surface-300 group-hover:text-white transition-colors">
                                                {related.title}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-surface-500 group-hover:text-white transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Back to Help */}
                    <div className="pt-6 border-t border-white/5">
                        <Link
                            to="/help"
                            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Help Center
                        </Link>
                    </div>
                </div>
            </Layout>
        </>
    );
}

export default HelpArticle;
