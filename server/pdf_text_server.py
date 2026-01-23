"""
PDF Text Editing Server
Based on PyMuPDF (fitz) for accurate PDF text manipulation.

Install dependencies:
    pip install pymupdf flask flask-cors

Run server:
    python pdf_text_server.py
"""

import io
import json
import base64
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

try:
    import fitz  # PyMuPDF
except ImportError:
    print("PyMuPDF not installed. Run: pip install pymupdf")
    fitz = None

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "pymupdf_available": fitz is not None,
        "version": fitz.version if fitz else None
    })


@app.route('/api/extract-text', methods=['POST'])
def extract_text():
    """
    Extract text with precise positioning from a PDF.
    
    Request body:
        - file: Base64 encoded PDF file
        - page: (optional) Specific page number (0-indexed)
    
    Returns:
        - pages: Array of page objects with text blocks
    """
    if not fitz:
        return jsonify({"error": "PyMuPDF not installed"}), 500
    
    try:
        data = request.get_json()
        pdf_base64 = data.get('file')
        specific_page = data.get('page')
        
        if not pdf_base64:
            return jsonify({"error": "No PDF file provided"}), 400
        
        # Decode PDF
        pdf_bytes = base64.b64decode(pdf_base64)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        result = {"pages": []}
        
        page_range = [specific_page] if specific_page is not None else range(doc.page_count)
        
        for page_num in page_range:
            if page_num >= doc.page_count:
                continue
                
            page = doc[page_num]
            page_dict = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)
            
            blocks = []
            for block in page_dict.get("blocks", []):
                if block.get("type") == 0:  # Text block
                    block_data = {
                        "bbox": list(block["bbox"]),
                        "lines": []
                    }
                    
                    for line in block.get("lines", []):
                        line_data = {
                            "bbox": list(line["bbox"]),
                            "spans": []
                        }
                        
                        for span in line.get("spans", []):
                            line_data["spans"].append({
                                "text": span.get("text", ""),
                                "bbox": list(span["bbox"]),
                                "font": span.get("font", ""),
                                "size": span.get("size", 12),
                                "color": span.get("color", 0),
                                "flags": span.get("flags", 0),
                                "origin": list(span.get("origin", [0, 0]))
                            })
                        
                        block_data["lines"].append(line_data)
                    
                    blocks.append(block_data)
            
            result["pages"].append({
                "pageNum": page_num,
                "width": page.rect.width,
                "height": page.rect.height,
                "rotation": page.rotation,
                "blocks": blocks
            })
        
        doc.close()
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/find-text', methods=['POST'])
def find_text():
    """
    Find all occurrences of text in a PDF.
    
    Request body:
        - file: Base64 encoded PDF file
        - searchText: Text to search for
        - caseSensitive: (optional) Whether search is case-sensitive
    
    Returns:
        - matches: Array of match objects with page and position info
    """
    if not fitz:
        return jsonify({"error": "PyMuPDF not installed"}), 500
    
    try:
        data = request.get_json()
        pdf_base64 = data.get('file')
        search_text = data.get('searchText', '')
        case_sensitive = data.get('caseSensitive', False)
        
        if not pdf_base64 or not search_text:
            return jsonify({"error": "Missing file or searchText"}), 400
        
        pdf_bytes = base64.b64decode(pdf_base64)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        matches = []
        flags = 0 if case_sensitive else fitz.TEXT_PRESERVE_WHITESPACE
        
        for page_num in range(doc.page_count):
            page = doc[page_num]
            text_instances = page.search_for(search_text, flags=flags)
            
            for rect in text_instances:
                matches.append({
                    "pageNum": page_num,
                    "bbox": [rect.x0, rect.y0, rect.x1, rect.y1],
                    "text": search_text
                })
        
        doc.close()
        return jsonify({"matches": matches, "count": len(matches)})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/replace-text', methods=['POST'])
def replace_text():
    """
    Find and replace text in a PDF.
    This is the KEY endpoint for accurate text editing.
    
    Request body:
        - file: Base64 encoded PDF file
        - replacements: Array of {searchText, replaceText, page (optional)}
        - preserveFormatting: (optional) Try to match original font/size
    
    Returns:
        - file: Base64 encoded modified PDF
        - changes: Number of replacements made
    """
    if not fitz:
        return jsonify({"error": "PyMuPDF not installed"}), 500
    
    try:
        data = request.get_json()
        pdf_base64 = data.get('file')
        replacements = data.get('replacements', [])
        preserve_formatting = data.get('preserveFormatting', True)
        
        if not pdf_base64:
            return jsonify({"error": "No PDF file provided"}), 400
        
        pdf_bytes = base64.b64decode(pdf_base64)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        total_changes = 0
        
        for replacement in replacements:
            search_text = replacement.get('searchText', '')
            replace_text = replacement.get('replaceText', '')
            specific_page = replacement.get('page')
            
            if not search_text:
                continue
            
            page_range = [specific_page] if specific_page is not None else range(doc.page_count)
            
            for page_num in page_range:
                if page_num >= doc.page_count:
                    continue
                    
                page = doc[page_num]
                
                # Find all instances of the search text
                text_instances = page.search_for(search_text)
                
                for rect in text_instances:
                    # Get the font info from the original text
                    font_name = "helv"  # Default to Helvetica
                    font_size = 11
                    text_color = (0, 0, 0)
                    
                    if preserve_formatting:
                        # Try to get original formatting
                        blocks = page.get_text("dict")["blocks"]
                        for block in blocks:
                            if block.get("type") == 0:
                                for line in block.get("lines", []):
                                    for span in line.get("spans", []):
                                        span_rect = fitz.Rect(span["bbox"])
                                        if span_rect.intersects(rect) and search_text in span.get("text", ""):
                                            font_name = span.get("font", "helv")
                                            font_size = span.get("size", 11)
                                            color_int = span.get("color", 0)
                                            # Convert color int to RGB tuple
                                            r = ((color_int >> 16) & 0xFF) / 255.0
                                            g = ((color_int >> 8) & 0xFF) / 255.0
                                            b = (color_int & 0xFF) / 255.0
                                            text_color = (r, g, b)
                                            break
                    
                    # Create redaction (covers original text)
                    page.add_redact_annot(rect, fill=(1, 1, 1))
                
                # Apply redactions (actually removes the text)
                page.apply_redactions()
                
                # Now add the replacement text
                for rect in text_instances:
                    # Draw replacement text at original position
                    page.insert_text(
                        (rect.x0, rect.y1 - 2),  # Baseline position
                        replace_text,
                        fontname=font_name,
                        fontsize=font_size,
                        color=text_color
                    )
                    total_changes += 1
        
        # Save modified PDF
        output = io.BytesIO()
        doc.save(output)
        doc.close()
        
        output.seek(0)
        result_base64 = base64.b64encode(output.read()).decode('utf-8')
        
        return jsonify({
            "file": result_base64,
            "changes": total_changes
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/edit-text-direct', methods=['POST'])
def edit_text_direct():
    """
    Direct text editing at specific coordinates.
    Uses redaction + insertion for accurate text replacement.
    
    Request body:
        - file: Base64 encoded PDF file
        - edits: Array of {
            page: page number (0-indexed),
            rect: [x0, y0, x1, y1] - area to replace,
            newText: replacement text,
            fontSize: font size,
            fontName: font name (optional),
            color: [r, g, b] (optional)
          }
    
    Returns:
        - file: Base64 encoded modified PDF
    """
    if not fitz:
        return jsonify({"error": "PyMuPDF not installed"}), 500
    
    try:
        data = request.get_json()
        pdf_base64 = data.get('file')
        edits = data.get('edits', [])
        
        if not pdf_base64:
            return jsonify({"error": "No PDF file provided"}), 400
        
        pdf_bytes = base64.b64decode(pdf_base64)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        # Group edits by page
        edits_by_page = {}
        for edit in edits:
            page_num = edit.get('page', 0)
            if page_num not in edits_by_page:
                edits_by_page[page_num] = []
            edits_by_page[page_num].append(edit)
        
        # Process each page
        for page_num, page_edits in edits_by_page.items():
            if page_num >= doc.page_count:
                continue
                
            page = doc[page_num]
            
            # First pass: Add all redactions
            for edit in page_edits:
                rect = edit.get('rect', [0, 0, 0, 0])
                
                # Convert PDF bottom-origin to PyMuPDF top-origin
                page_height = page.rect.height
                pymupdf_y_top = page_height - rect[3]
                pymupdf_y_bottom = page_height - rect[1]
                
                # Create rectangle for redaction in PyMuPDF coordinates
                # Add padding to ensure complete coverage
                pdf_rect = fitz.Rect(
                    rect[0] - 2,                  # x0 (left)
                    pymupdf_y_top - 2,            # y0 (top in PyMuPDF coords)
                    rect[2] + 2,                  # x1 (right)
                    pymupdf_y_bottom + 2          # y1 (bottom in PyMuPDF coords)
                )
                page.add_redact_annot(pdf_rect, fill=(1, 1, 1))
            
            # Apply all redactions at once
            page.apply_redactions()
            
            # Second pass: Insert replacement text
            for edit in page_edits:
                rect = edit.get('rect', [0, 0, 0, 0])
                new_text = edit.get('newText', '')
                font_size = edit.get('fontSize', 12)
                font_name = edit.get('fontName', 'helv')
                color = edit.get('color', [0, 0, 0])
                
                # CRITICAL: PyMuPDF uses TOP-ORIGIN coordinates (Y=0 at top, increasing DOWN)
                # But PDF.js and standard PDF coords use BOTTOM-ORIGIN (Y=0 at bottom, increasing UP)
                # We must convert!
                page_height = page.rect.height
                
                # DEBUG: Log coordinates BEFORE conversion
                print(f"DEBUG: Page {page_num} height: {page_height}")
                print(f"DEBUG: Received rect (PDF bottom-origin): {rect}")
                print(f"DEBUG: rect[0]={rect[0]}, rect[1]={rect[1]}, rect[2]={rect[2]}, rect[3]={rect[3]}")
                
                if new_text:
                    # Convert PDF bottom-origin to PyMuPDF top-origin
                    # PDF: rect = [x0, y0_bottom, x1, y1_top] where y1 > y0
                    # PyMuPDF: y_top = page_height - y_pdf
                    
                    pymupdf_y_top = page_height - rect[3]  # Top of text box in PyMuPDF coords
                    pymupdf_y_bottom = page_height - rect[1]  # Bottom of text box in PyMuPDF coords
                    
                    print(f"DEBUG: Converted to PyMuPDF (top-origin): y_top={pymupdf_y_top}, y_bottom={pymupdf_y_bottom}")
                    print(f"DEBUG: New text (first 50 chars): '{new_text[:50]}'")
                    
                    # Handle multi-line text
                    lines = new_text.split('\n')
                    
                    for line_idx, line_text in enumerate(lines):
                        if not line_text.strip():
                            continue
                        
                        # In PyMuPDF top-origin: start from top and move DOWN for each line
                        text_y = pymupdf_y_top + (font_size * 0.8) + (line_idx * font_size * 1.2)
                        
                        print(f"DEBUG: Inserting line {line_idx} at PyMuPDF Y={text_y}, text='{line_text[:30]}'")
                        
                        page.insert_text(
                            (rect[0], text_y),
                            line_text,
                            fontname=font_name,
                            fontsize=font_size,
                            color=tuple(color)
                        )
        
        # Save modified PDF
        output = io.BytesIO()
        doc.save(output)
        doc.close()
        
        output.seek(0)
        result_base64 = base64.b64encode(output.read()).decode('utf-8')
        
        return jsonify({"file": result_base64, "success": True})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/get-text-at-rect', methods=['POST'])
def get_text_at_rect():
    """
    Get all text within a specific rectangle on a page.
    Useful for selection-based editing.
    
    Request body:
        - file: Base64 encoded PDF file
        - page: Page number (0-indexed)
        - rect: [x0, y0, x1, y1]
    
    Returns:
        - text: Extracted text
        - spans: Detailed span information
    """
    if not fitz:
        return jsonify({"error": "PyMuPDF not installed"}), 500
    
    try:
        data = request.get_json()
        pdf_base64 = data.get('file')
        page_num = data.get('page', 0)
        rect = data.get('rect', [0, 0, 100, 100])
        
        if not pdf_base64:
            return jsonify({"error": "No PDF file provided"}), 400
        
        pdf_bytes = base64.b64decode(pdf_base64)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        if page_num >= doc.page_count:
            return jsonify({"error": "Invalid page number"}), 400
        
        page = doc[page_num]
        clip_rect = fitz.Rect(rect[0], rect[1], rect[2], rect[3])
        
        # Get text within rectangle
        text = page.get_text("text", clip=clip_rect)
        
        # Get detailed span info
        spans = []
        text_dict = page.get_text("dict", clip=clip_rect)
        for block in text_dict.get("blocks", []):
            if block.get("type") == 0:
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        spans.append({
                            "text": span.get("text", ""),
                            "bbox": list(span["bbox"]),
                            "font": span.get("font", ""),
                            "size": span.get("size", 12),
                            "origin": list(span.get("origin", [0, 0]))
                        })
        
        doc.close()
        return jsonify({"text": text.strip(), "spans": spans})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/pdf-to-text-layer', methods=['POST'])
def pdf_to_text_layer():
    """
    Extract complete text layer with all formatting.
    Returns data suitable for recreating text layer in frontend.
    
    Request body:
        - file: Base64 encoded PDF file
    
    Returns:
        - pages: Array of pages with complete text layer data
    """
    if not fitz:
        return jsonify({"error": "PyMuPDF not installed"}), 500
    
    try:
        data = request.get_json()
        pdf_base64 = data.get('file')
        
        if not pdf_base64:
            return jsonify({"error": "No PDF file provided"}), 400
        
        pdf_bytes = base64.b64decode(pdf_base64)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        pages = []
        
        for page_num in range(doc.page_count):
            page = doc[page_num]
            
            # Get all text with full detail
            text_dict = page.get_text("dict")
            
            text_items = []
            for block in text_dict.get("blocks", []):
                if block.get("type") == 0:
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            # Calculate transform-like data for compatibility
                            bbox = span["bbox"]
                            origin = span.get("origin", [bbox[0], bbox[3]])
                            size = span.get("size", 12)
                            
                            text_items.append({
                                "str": span.get("text", ""),
                                "bbox": list(bbox),
                                "origin": list(origin),
                                "transform": [
                                    size, 0, 0, size,  # Scale factors
                                    origin[0], origin[1]  # Position
                                ],
                                "width": bbox[2] - bbox[0],
                                "height": bbox[3] - bbox[1],
                                "fontSize": size,
                                "fontName": span.get("font", "Unknown"),
                                "color": span.get("color", 0),
                                "flags": span.get("flags", 0)
                            })
            
            pages.append({
                "pageNum": page_num,
                "width": page.rect.width,
                "height": page.rect.height,
                "rotation": page.rotation,
                "textItems": text_items
            })
        
        doc.close()
        return jsonify({"pages": pages})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("=" * 60)
    print("PDF Text Editing Server")
    print("=" * 60)
    if fitz:
        print(f"PyMuPDF version: {fitz.version}")
    else:
        print("WARNING: PyMuPDF not installed!")
        print("Install with: pip install pymupdf")
    print()
    print("Endpoints:")
    print("  GET  /api/health              - Health check")
    print("  POST /api/extract-text        - Extract text with positions")
    print("  POST /api/find-text           - Find text occurrences")
    print("  POST /api/replace-text        - Find and replace text")
    print("  POST /api/edit-text-direct    - Edit text at coordinates")
    print("  POST /api/get-text-at-rect    - Get text in rectangle")
    print("  POST /api/pdf-to-text-layer   - Extract complete text layer")
    print()
    print("Starting server on http://localhost:5050")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5050, debug=True)
