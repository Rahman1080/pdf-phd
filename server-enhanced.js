// Enhanced PDF Converter Server - Production Ready for Hostinger VPS
// =====================================================================
// This server handles Office document conversions using LibreOffice and Python
//
// REQUIREMENTS:
// 1. Node.js 18+
// 2. LibreOffice (headless)
// 3. Python 3 with: pdf2docx, tabula-py, pandas, PyMuPDF, python-pptx, Pillow
//
// SETUP ON HOSTINGER VPS (Ubuntu):
// --------------------------------
// sudo apt update && sudo apt upgrade -y
// sudo apt install -y nodejs npm libreoffice python3 python3-pip
// pip3 install pdf2docx tabula-py pandas PyMuPDF python-pptx Pillow
// npm install
// 
// RUN IN PRODUCTION:
// ------------------
// npm install -g pm2
// pm2 start server-enhanced.js --name pdf-converter
// pm2 save
// pm2 startup
//
// NGINX REVERSE PROXY (optional, for SSL):
// ----------------------------------------
// server {
//     listen 443 ssl;
//     server_name api.yourdomain.com;
//     
//     ssl_certificate /path/to/cert.pem;
//     ssl_certificate_key /path/to/key.pem;
//     
//     location / {
//         proxy_pass http://localhost:3001;
//         proxy_http_version 1.1;
//         proxy_set_header Upgrade $http_upgrade;
//         proxy_set_header Connection 'upgrade';
//         proxy_set_header Host $host;
//         proxy_set_header X-Real-IP $remote_addr;
//         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
//         proxy_cache_bypass $http_upgrade;
//         client_max_body_size 100M;
//     }
// }

import express from "express";
import multer from "multer";
import cors from "cors";
import { spawn, exec } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// CORS Configuration - Allow your domains
// ============================================
const allowedOrigins = [
    'http://localhost:5173',      // Vite dev server
    'http://localhost:3000',      // React dev server
    'http://127.0.0.1:5173',
    'https://localhost:5173',
    // Add your production domains here:
    'https://pdfphd.com',
    'https://www.pdfphd.com',
    'https://app.pdfphd.com',
    // Add any other domains that should access this API
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list or matches pattern
        if (allowedOrigins.includes(origin) ||
            origin.includes('localhost') ||
            origin.includes('127.0.0.1') ||
            origin.includes('pdfphd')) {
            return callback(null, true);
        }

        // For development, allow all origins
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "100mb" }));

// ============================================
// Directory Setup
// ============================================
const tempDir = path.join(os.tmpdir(), "pdf-studio");
const uploadDir = path.join(tempDir, "uploads");
const outDir = path.join(tempDir, "converted");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Configure multer with file size limits
const upload = multer({
    dest: uploadDir,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max
    }
});

// Determine python command based on platform
const pythonCmd = process.platform === "win32" ? "python" : "python3";

// Determine LibreOffice command based on platform
const libreOfficeCmd = process.platform === "win32"
    ? '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"'
    : 'libreoffice';

// ============================================
// Utility Functions
// ============================================

// Clean up old temp files periodically
const cleanupTempFiles = () => {
    const maxAge = 1000 * 60 * 60; // 1 hour
    const now = Date.now();

    [uploadDir, outDir].forEach(dir => {
        if (fs.existsSync(dir)) {
            fs.readdirSync(dir).forEach(file => {
                const filePath = path.join(dir, file);
                try {
                    const stat = fs.statSync(filePath);
                    if (now - stat.mtimeMs > maxAge) {
                        fs.unlinkSync(filePath);
                        console.log(`Cleaned up: ${filePath}`);
                    }
                } catch (e) { }
            });
        }
    });
};

// Run cleanup every 30 minutes
setInterval(cleanupTempFiles, 1000 * 60 * 30);

// Safe file deletion
const safeDelete = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (e) {
        console.warn(`Could not delete ${filePath}:`, e.message);
    }
};

// ============================================
// ENDPOINT: Health Check
// ============================================
app.get("/", (req, res) => {
    // Check if LibreOffice is available
    exec(`${libreOfficeCmd} --version`, (err, stdout) => {
        const libreOfficeStatus = err ? 'Not installed' : stdout.trim().split('\n')[0];

        // Check if Python is available
        exec(`${pythonCmd} --version`, (pyErr, pyStdout) => {
            const pythonStatus = pyErr ? 'Not installed' : pyStdout.trim();

            res.json({
                status: "OK",
                version: "2.0.0",
                platform: process.platform,
                tempDir: tempDir,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                dependencies: {
                    libreOffice: libreOfficeStatus,
                    python: pythonStatus
                },
                endpoints: {
                    convert: '/convert (POST) - Office to PDF',
                    convertFrom: '/convert-from-pdf (POST) - PDF to Office',
                    extractText: '/extract-text-blocks (POST) - Extract text positions'
                }
            });
        });
    });
});

// ============================================
// ENDPOINT: Convert Office Documents to PDF
// ============================================
app.post("/convert", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const inp = req.file.path;
    const originalName = req.file.originalname || "document";
    const name = path.basename(originalName, path.extname(originalName));

    console.log(`[CONVERT] Processing: ${originalName}`);

    // Use LibreOffice for conversion
    const convertCmd = `${libreOfficeCmd} --headless --convert-to pdf --outdir "${outDir}" "${inp}"`;
    console.log(`[CONVERT] Command: ${convertCmd}`);

    exec(convertCmd, { timeout: 120000 }, (err, stdout, stderr) => {
        safeDelete(inp);

        if (err) {
            console.error("[CONVERT] LibreOffice Error:", err.message);
            console.error("[CONVERT] stderr:", stderr);
            return res.status(500).json({
                error: "Conversion failed",
                details: err.message,
                hint: "Make sure LibreOffice is installed: sudo apt install libreoffice"
            });
        }

        const finalOut = path.join(outDir, name + ".pdf");

        // Handle case where output filename differs
        if (!fs.existsSync(finalOut)) {
            const files = fs.readdirSync(outDir).filter(f => f.endsWith(".pdf"));
            if (files.length > 0) {
                files.sort((a, b) =>
                    fs.statSync(path.join(outDir, b)).mtimeMs -
                    fs.statSync(path.join(outDir, a)).mtimeMs
                );
                const latestFile = path.join(outDir, files[0]);
                console.log(`[CONVERT] Success: ${files[0]}`);
                return res.download(latestFile, name + ".pdf", () => {
                    safeDelete(latestFile);
                });
            }
            return res.status(500).json({ error: "PDF not found after conversion" });
        }

        console.log(`[CONVERT] Success: ${name}.pdf`);
        res.download(finalOut, name + ".pdf", () => {
            safeDelete(finalOut);
        });
    });
});

// ============================================
// ENDPOINT: Convert PDF to Office Documents
// ============================================
app.post("/convert-from-pdf", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const fmt = req.body.format || "docx";
    const inp = req.file.path;
    const ts = Date.now();
    const name = path.basename(req.file.originalname || "document", ".pdf");

    console.log(`[CONVERT-FROM] Processing: ${name}.pdf -> ${fmt}`);

    // ---- DOCX Conversion ----
    if (fmt === "docx") {
        const out = path.join(outDir, `${ts}.docx`);
        const pyScript = `
import sys
try:
    from pdf2docx import Converter
    cv = Converter(r"${inp}")
    cv.convert(r"${out}")
    cv.close()
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {str(e)}", file=sys.stderr)
    sys.exit(1)
`;
        const pyFile = path.join(tempDir, `conv_${ts}.py`);
        fs.writeFileSync(pyFile, pyScript);

        const proc = spawn(pythonCmd, [pyFile], { timeout: 180000 });
        let stderr = '';

        proc.stderr.on("data", (data) => { stderr += data.toString(); });

        proc.on("close", (code) => {
            safeDelete(inp);
            safeDelete(pyFile);

            if (code !== 0 || !fs.existsSync(out)) {
                console.error("[CONVERT-FROM] DOCX Error:", stderr);
                return res.status(500).json({
                    error: "DOCX conversion failed",
                    details: stderr,
                    hint: "Install: pip3 install pdf2docx"
                });
            }

            console.log(`[CONVERT-FROM] Success: ${name}.docx`);
            res.download(out, `${name}.docx`, () => { safeDelete(out); });
        });
    }
    // ---- XLSX Conversion ----
    else if (fmt === "xlsx") {
        const out = path.join(outDir, `${ts}.xlsx`);
        const pyScript = `
import sys
import os

try:
    from openpyxl import Workbook
    from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
    from openpyxl.utils import get_column_letter
    from openpyxl.utils.dataframe import dataframe_to_rows
    import fitz  # PyMuPDF
    
    # Create workbook
    wb = Workbook()
    if "Sheet" in wb.sheetnames:
        del wb["Sheet"]
    
    pdf_path = r"${inp}"
    tables_found = 0
    
    # ============================================
    # METHOD 1: Try tabula-py for table detection (BEST for structured tables)
    # ============================================
    try:
        import tabula
        import pandas as pd
        
        print("Attempting tabula-py table extraction...", file=sys.stderr)
        tables = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True, lattice=True)
        
        if not tables or len(tables) == 0:
            # Try stream mode for borderless tables
            tables = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True, stream=True)
        
        if tables and len(tables) > 0:
            print(f"Tabula found {len(tables)} tables", file=sys.stderr)
            for i, table in enumerate(tables):
                if table.empty:
                    continue
                    
                tables_found += 1
                sheet_name = f"Table_{tables_found}"[:31]  # Excel sheet name limit
                ws = wb.create_sheet(title=sheet_name)
                
                # Write headers
                for col_idx, col_name in enumerate(table.columns, 1):
                    cell = ws.cell(row=1, column=col_idx, value=str(col_name))
                    cell.font = Font(bold=True, name='Arial', size=11)
                    cell.fill = PatternFill(start_color="DDDDDD", end_color="DDDDDD", fill_type="solid")
                    cell.alignment = Alignment(horizontal='center', vertical='center')
                
                # Write data
                for row_idx, row in enumerate(table.values, 2):
                    for col_idx, value in enumerate(row, 1):
                        cell = ws.cell(row=row_idx, column=col_idx, value=str(value) if pd.notna(value) else "")
                        cell.font = Font(name='Arial', size=10)
                        cell.alignment = Alignment(wrap_text=True, vertical='top')
                
                # Auto-size columns
                for col in ws.columns:
                    max_length = 0
                    column = col[0].column_letter
                    for cell in col:
                        try:
                            if cell.value:
                                max_length = max(max_length, len(str(cell.value)))
                        except:
                            pass
                    ws.column_dimensions[column].width = min(max_length + 2, 50)
                    
    except ImportError:
        print("tabula-py not installed, using PyMuPDF fallback", file=sys.stderr)
    except Exception as e:
        print(f"Tabula error (non-fatal): {e}", file=sys.stderr)
    
    # ============================================
    # METHOD 2: PyMuPDF text extraction (fallback and for raw text)
    # ============================================
    doc = fitz.open(pdf_path)
    
    for page_num, page in enumerate(doc, 1):
        ws = wb.create_sheet(title=f"Page_{page_num}")
        
        # Get text with positioning
        blocks = page.get_text("dict")["blocks"]
        
        row = 1
        for block in blocks:
            if "lines" not in block:
                continue
            
            for line in block["lines"]:
                col = 1
                for span in line["spans"]:
                    text = span["text"].strip()
                    if text:
                        cell = ws.cell(row=row, column=col, value=text)
                        cell.font = Font(name='Arial', size=min(int(span.get("size", 11)), 14))
                        col += 1
                if col > 1:  # Only increment row if we wrote something
                    row += 1
        
        # Set column widths
        for i in range(1, 10):
            ws.column_dimensions[get_column_letter(i)].width = 25

    doc.close()
    
    # Ensure at least one sheet exists
    if len(wb.sheetnames) == 0:
        ws = wb.create_sheet(title="Empty")
        ws.cell(row=1, column=1, value="No content extracted from PDF")
    
    wb.save(r"${out}")
    print(f"SUCCESS - Tables found: {tables_found}")
    
except Exception as e:
    print(f"ERROR: {str(e)}", file=sys.stderr)
    import traceback
    traceback.print_exc()
    sys.exit(1)
`;
        const pyFile = path.join(tempDir, `conv_${ts}.py`);
        fs.writeFileSync(pyFile, pyScript);

        const proc = spawn(pythonCmd, [pyFile], { timeout: 180000 });
        let stderr = '';

        proc.stderr.on("data", (data) => { stderr += data.toString(); });

        proc.on("close", (code) => {
            safeDelete(inp);
            safeDelete(pyFile);

            if (code !== 0 || !fs.existsSync(out)) {
                console.error("[CONVERT-FROM] XLSX Error:", stderr);
                return res.status(500).json({
                    error: "XLSX conversion failed",
                    details: stderr,
                    hint: "Install: pip3 install tabula-py pandas openpyxl"
                });
            }

            console.log(`[CONVERT-FROM] Success: ${name}.xlsx`);
            res.download(out, `${name}.xlsx`, () => { safeDelete(out); });
        });
    }
    // ---- PPTX Conversion ----
    else if (fmt === "pptx") {
        const out = path.join(outDir, `${ts}.pptx`);
        const convMode = req.query.mode || req.body.mode || 'visual'; // 'visual' or 'editable'
        console.log(`[CONVERT-FROM] PPTX mode: ${convMode}`);

        // Editable mode: Extract text and create text boxes
        const editableScript = `
import sys
try:
    import fitz
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from io import BytesIO
    from PIL import Image

    doc = fitz.open(r"${inp}")
    prs = Presentation()
    
    for page in doc:
        page_width = page.rect.width
        page_height = page.rect.height
        
        # Set slide dimensions to match PDF aspect ratio
        prs.slide_width = Inches(10)
        prs.slide_height = Inches(10 * page_height / page_width)
        
        slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank layout
        
        # NO background image in editable mode - only text boxes
        # This prevents text duplication/overlap
        
        # Extract text blocks and add as editable text boxes
        blocks = page.get_text("dict")["blocks"]
        
        for block in blocks:
            if "lines" not in block:
                continue
                
            x0, y0, x1, y1 = block["bbox"]
            
            # Convert PDF coords to PowerPoint Inches
            left = Inches(x0 / page_width * 10)
            top = Inches(y0 / page_height * (10 * page_height / page_width))
            width = Inches((x1 - x0) / page_width * 10)
            height = Inches((y1 - y0) / page_height * (10 * page_height / page_width))
            
            # Collect text from all lines in block
            text_content = ""
            font_size = 12
            is_bold = False
            
            for line in block["lines"]:
                for span in line["spans"]:
                    text_content += span["text"] + " "
                    font_size = span.get("size", 12)
                    if "bold" in span.get("font", "").lower():
                        is_bold = True
                text_content = text_content.strip() + "\\n"
            
            text_content = text_content.strip()
            if not text_content:
                continue
            
            # Add text box
            try:
                txBox = slide.shapes.add_textbox(left, top, width, height)
                tf = txBox.text_frame
                tf.word_wrap = True
                
                p = tf.paragraphs[0]
                p.text = text_content
                p.font.size = Pt(min(font_size, 24))
                p.font.bold = is_bold
                p.font.name = "Arial"
            except Exception as e:
                print(f"Warning: Could not add text box: {e}", file=sys.stderr)
                continue

    prs.save(r"${out}")
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {str(e)}", file=sys.stderr)
    import traceback
    traceback.print_exc()
    sys.exit(1)
`;

        // Visual mode: High-quality images only
        const visualScript = `
import sys
try:
    import fitz
    from pptx import Presentation
    from pptx.util import Inches
    from io import BytesIO
    from PIL import Image

    doc = fitz.open(r"${inp}")
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)

    for page in doc:
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        img_buffer = BytesIO()
        img.save(img_buffer, format="PNG")
        img_buffer.seek(0)
        
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        slide.shapes.add_picture(img_buffer, Inches(0), Inches(0), width=Inches(10))

    prs.save(r"${out}")
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {str(e)}", file=sys.stderr)
    sys.exit(1)
`;

        const pyScript = convMode === 'editable' ? editableScript : visualScript;
        const pyFile = path.join(tempDir, `conv_${ts}.py`);
        fs.writeFileSync(pyFile, pyScript);

        const proc = spawn(pythonCmd, [pyFile], { timeout: 180000 });
        let stderr = '';

        proc.stderr.on("data", (data) => { stderr += data.toString(); });

        proc.on("close", (code) => {
            safeDelete(inp);
            safeDelete(pyFile);

            if (code !== 0 || !fs.existsSync(out)) {
                console.error("[CONVERT-FROM] PPTX Error:", stderr);
                return res.status(500).json({
                    error: "PPTX conversion failed",
                    details: stderr,
                    hint: "Install: pip3 install PyMuPDF python-pptx Pillow"
                });
            }

            console.log(`[CONVERT-FROM] Success: ${name}.pptx (mode: ${convMode})`);
            res.download(out, `${name}.pptx`, () => { safeDelete(out); });
        });
    } else {
        safeDelete(inp);
        res.status(400).json({ error: "Unsupported format. Use: docx, xlsx, or pptx" });
    }
});

// ============================================
// ENDPOINT: Extract Text Blocks (for editing)
// ============================================
app.post("/extract-text-blocks", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const inp = req.file.path;
    const ts = Date.now();
    const pageNum = parseInt(req.body.page) || 1;

    console.log(`[EXTRACT] Processing page ${pageNum}`);

    const pyScript = `
import fitz
import json
import sys

try:
    doc = fitz.open(r"${inp}")
    if ${pageNum - 1} >= len(doc):
        print(json.dumps({"error": "Page number out of range"}))
        sys.exit(1)
        
    page = doc[${pageNum - 1}]

    blocks = page.get_text("dict", sort=True)["blocks"]

    result = []
    for block in blocks:
        if block.get("type") == 0:
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    if span.get("text", "").strip():
                        result.append({
                            "text": span["text"],
                            "x": span["bbox"][0],
                            "y": span["bbox"][1],
                            "width": span["bbox"][2] - span["bbox"][0],
                            "height": span["bbox"][3] - span["bbox"][1],
                            "font": span.get("font", ""),
                            "size": span.get("size", 12),
                            "color": span.get("color", 0),
                            "flags": span.get("flags", 0)
                        })

    print(json.dumps({
        "width": page.rect.width,
        "height": page.rect.height,
        "blocks": result
    }))
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
`;

    const pyFile = path.join(tempDir, `extract_${ts}.py`);
    fs.writeFileSync(pyFile, pyScript);

    let output = "";
    const proc = spawn(pythonCmd, [pyFile], { timeout: 60000 });

    proc.stdout.on("data", (data) => { output += data.toString(); });
    proc.stderr.on("data", (data) => { console.error("[EXTRACT] stderr:", data.toString()); });

    proc.on("close", (code) => {
        safeDelete(inp);
        safeDelete(pyFile);

        if (code !== 0) {
            return res.status(500).json({ error: "Text extraction failed" });
        }

        try {
            const result = JSON.parse(output);
            if (result.error) {
                return res.status(500).json(result);
            }
            console.log(`[EXTRACT] Success: ${result.blocks.length} blocks found`);
            res.json(result);
        } catch (e) {
            res.status(500).json({ error: "Failed to parse text blocks" });
        }
    });
});

// ============================================
// Error Handling Middleware
// ============================================
app.use((err, req, res, next) => {
    console.error('[ERROR]', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('PDF Studio Conversion Server');
    console.log('='.repeat(50));
    console.log(`Port:      ${PORT}`);
    console.log(`Platform:  ${process.platform}`);
    console.log(`Node:      ${process.version}`);
    console.log(`Temp Dir:  ${tempDir}`);
    console.log(`Python:    ${pythonCmd}`);
    console.log('='.repeat(50));
    console.log('Endpoints:');
    console.log('  GET  /                    - Health check');
    console.log('  POST /convert             - Office to PDF');
    console.log('  POST /convert-from-pdf    - PDF to Office');
    console.log('  POST /extract-text-blocks - Extract text');
    console.log('='.repeat(50));

    // Initial cleanup
    cleanupTempFiles();
});
