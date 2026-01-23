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

Check out our [video tutorials](/tutorials) or [contact support](/contact) if you have questions.
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
    `,
        relatedArticles: ['splitting-pdfs', 'quick-start']
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
