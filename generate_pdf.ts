import { PDFDocument } from '@cantoo/pdf-lib';
import fs from 'fs';

async function createPdf() {
    const doc = await PDFDocument.create();

    // Add 3 pages
    const page1 = doc.addPage([500, 500]);
    page1.drawText('Page 1');

    const page2 = doc.addPage([500, 500]);
    page2.drawText('Page 2');

    const page3 = doc.addPage([500, 500]);
    page3.drawText('Page 3');

    const pdfBytes = await doc.save();
    fs.writeFileSync('test_delete.pdf', pdfBytes);
    console.log('test_delete.pdf created');
}

createPdf();
