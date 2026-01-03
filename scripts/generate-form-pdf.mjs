import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import fontkit from '@pdf-lib/fontkit';

async function generateFormPDF() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const regularBytes = fs.readFileSync(path.join(process.cwd(), 'scripts', 'Roboto-Regular.ttf'));
  const boldBytes = fs.readFileSync(path.join(process.cwd(), 'scripts', 'Roboto-Bold.ttf'));

  const regular = await pdfDoc.embedFont(regularBytes);
  const bold = await pdfDoc.embedFont(boldBytes);

  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  const drawText = (text, options = {}) => {
    page.drawText(text, {
      x: options.x || margin,
      y,
      size: options.size || 10,
      font: options.bold ? bold : regular,
      color: rgb(0, 0, 0),
    });
    y -= options.lineHeight || 16;
  };

  const drawField = (label, lineWidth = 340) => {
    drawText(label);
    y += 11;
    page.drawLine({
      start: { x: margin + 130, y: y + 3 },
      end: { x: margin + 130 + lineWidth, y: y + 3 },
      thickness: 0.5,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 22;
  };

  // Title
  drawText('FORMULARZ ODSTĄPIENIA OD UMOWY', { bold: true, size: 13 });
  y -= 3;
  page.drawLine({ start: { x: margin, y: y + 5 }, end: { x: width - margin, y: y + 5 }, thickness: 1, color: rgb(0, 0, 0) });
  y -= 12;

  // Recipient
  drawText('Adresat:', { bold: true });
  drawText('Home Screen Magdalena Cylke, ul. Szeroka 20, 75-814 Koszalin');
  drawText('E-mail: info@homescreen.pl');
  y -= 8;

  drawText('Ja, niżej podpisany/a, oświadczam, że zgodnie z art. 27 ustawy z dnia 30 maja 2014 r.');
  drawText('o prawach konsumenta (Dz. U. 2014 r. poz. 827) odstępuję od umowy sprzedaży');
  drawText('wyżej wymienionych towarów:');
  y -= 8;

  // Products table
  const tableX = margin;
  const tableWidth = width - 2 * margin;
  const colWidths = [30, 260, 50, 155]; // Lp, Nazwa, Ilość, Powód
  const rowHeight = 22;
  const tableRows = 5;

  // Header row
  page.drawRectangle({ x: tableX, y: y - rowHeight, width: tableWidth, height: rowHeight, borderColor: rgb(0, 0, 0), borderWidth: 0.5, color: rgb(0.95, 0.95, 0.95) });

  let colX = tableX;
  const headers = ['Lp.', 'EAN (kod z opakowania)', 'Ilość', 'Powód zwrotu'];
  headers.forEach((header, i) => {
    page.drawText(header, { x: colX + 5, y: y - 15, size: 9, font: bold });
    colX += colWidths[i];
    if (i < headers.length - 1) {
      page.drawLine({ start: { x: colX, y: y }, end: { x: colX, y: y - rowHeight }, thickness: 0.5, color: rgb(0, 0, 0) });
    }
  });
  y -= rowHeight;

  // Data rows
  for (let row = 0; row < tableRows; row++) {
    page.drawRectangle({ x: tableX, y: y - rowHeight, width: tableWidth, height: rowHeight, borderColor: rgb(0, 0, 0), borderWidth: 0.5 });

    colX = tableX;
    page.drawText(`${row + 1}.`, { x: colX + 10, y: y - 15, size: 9, font: regular });

    colWidths.forEach((w, i) => {
      colX += w;
      if (i < colWidths.length - 1) {
        page.drawLine({ start: { x: colX, y: y }, end: { x: colX, y: y - rowHeight }, thickness: 0.5, color: rgb(0, 0, 0) });
      }
    });
    y -= rowHeight;
  }
  y -= 20;

  // Buyer data
  drawText('Dane kupującego:', { bold: true });
  drawField('Numer zamówienia:', 365);
  drawField('Imię i nazwisko:', 365);
  drawField('Adres:', 365);
  drawField('Telefon:', 365);
  drawField('E-mail:', 365);
  y -= 5;

  // Bank account in boxes
  drawText('Numer konta do zwrotu (jeśli inny niż przy płatności):', { bold: true });
  y -= 5;

  const boxSize = 14;
  const boxGap = 1;
  const accountBoxes = 26;
  let boxX = margin;

  for (let i = 0; i < accountBoxes; i++) {
    page.drawRectangle({
      x: boxX,
      y: y - boxSize,
      width: boxSize,
      height: boxSize,
      borderColor: rgb(0.3, 0.3, 0.3),
      borderWidth: 0.5,
    });
    boxX += boxSize + boxGap;

    // Add gap after every 4 digits for readability
    if ((i + 1) % 4 === 0 && i < accountBoxes - 1) {
      boxX += 4;
    }
  }
  y -= boxSize + 20;

  // Date and signature
  drawText('Data zamówienia: __________________     Data: __________________     Podpis: __________________');
  y -= 12;

  page.drawLine({ start: { x: margin, y: y + 5 }, end: { x: width - margin, y: y + 5 }, thickness: 0.5, color: rgb(0.5, 0.5, 0.5) });
  y -= 15;

  drawText('INFORMACJE:', { bold: true, size: 9 });
  ['• 30 dni na odstąpienie od umowy', '• Produkt nieużywany, w oryginalnym opakowaniu', '• Koszt przesyłki zwrotnej pokrywa kupujący', '• Zwrot pieniędzy w ciągu 14 dni'].forEach(t => drawText(t, { size: 9 }));
  y -= 3;

  drawText('Formularz wyślij na: info@homescreen.pl lub ul. Szeroka 20, 75-814 Koszalin | Tel: +48 793 237 970', { size: 9 });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(process.cwd(), 'public', 'formularz-odstapienia.pdf'), pdfBytes);
  console.log('PDF saved');
}

generateFormPDF().catch(console.error);
