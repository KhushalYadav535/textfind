import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import QRCode from 'qrcode';

/**
 * Export text to various formats
 */

export async function exportToTXT(text, filename, options = {}) {
  const metadata = options.includeMetadata ? generateMetadata(options.metadata) : '';
  const content = metadata ? `${metadata}\n\n${text}` : text;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `${filename}.txt`);
}

export async function exportToPDF(text, filename, options = {}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  
  let y = margin;
  
  // Add metadata if requested
  if (options.includeMetadata && options.metadata) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const metadata = generateMetadata(options.metadata);
    const metadataLines = doc.splitTextToSize(metadata, maxWidth);
    doc.text(metadataLines, margin, y);
    y += metadataLines.length * 5 + 10;
  }
  
  // Add main text
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  const lines = doc.splitTextToSize(text, maxWidth);
  
  lines.forEach((line) => {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 7;
  });
  
  doc.save(`${filename}.pdf`);
}

export async function exportToDOCX(text, filename, options = {}) {
  const children = [];
  
  // Add metadata if requested
  if (options.includeMetadata && options.metadata) {
    children.push(
      new Paragraph({
        text: generateMetadata(options.metadata),
        heading: HeadingLevel.HEADING_2,
      })
    );
    children.push(new Paragraph({ text: '' }));
  }
  
  // Split text into paragraphs
  const paragraphs = text.split('\n').filter(p => p.trim());
  paragraphs.forEach(para => {
    children.push(
      new Paragraph({
        children: [new TextRun(para)],
      })
    );
  });
  
  const doc = new Document({
    sections: [{
      children: children,
    }],
  });
  
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${filename}.docx`);
}

export async function exportToCSV(text, filename, options = {}) {
  // Try to detect table structure
  const lines = text.split('\n');
  const rows = [];
  
  lines.forEach(line => {
    // Check if line contains tab or multiple spaces (potential table row)
    if (line.includes('\t') || line.match(/\s{2,}/)) {
      const cells = line.split(/\t|\s{2,}/).map(cell => cell.trim()).filter(cell => cell);
      if (cells.length > 1) {
        rows.push(cells);
      }
    } else if (line.trim()) {
      // Single column
      rows.push([line.trim()]);
    }
  });
  
  // If no table structure found, create single column
  if (rows.length === 0) {
    rows.push(['Text']);
    lines.forEach(line => {
      if (line.trim()) rows.push([line.trim()]);
    });
  }
  
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `${filename}.csv`);
}

export async function exportToJSON(text, filename, options = {}) {
  const data = {
    text: text,
    ...(options.includeMetadata && options.metadata ? { metadata: options.metadata } : {}),
    ...(options.includeConfidence && options.confidence ? { confidence: options.confidence } : {}),
    exportedAt: new Date().toISOString(),
  };
  
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, `${filename}.json`);
}

export async function exportToHTML(text, filename, options = {}) {
  const metadata = options.includeMetadata && options.metadata 
    ? `<div class="metadata">${generateMetadataHTML(options.metadata)}</div>` 
    : '';
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    .metadata { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; font-size: 0.9em; color: #666; }
    pre { white-space: pre-wrap; word-wrap: break-word; }
  </style>
</head>
<body>
  ${metadata}
  <pre>${escapeHtml(text)}</pre>
</body>
</html>`;
  
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, `${filename}.html`);
}

export async function generateQRCode(text) {
  try {
    const qrDataUrl = await QRCode.toDataURL(text);
    return qrDataUrl;
  } catch (error) {
    console.error('QR Code generation error:', error);
    return null;
  }
}

// Helper functions
function generateMetadata(metadata) {
  if (!metadata) return '';
  
  const lines = [];
  if (metadata.filename) lines.push(`File: ${metadata.filename}`);
  if (metadata.date) lines.push(`Date: ${metadata.date}`);
  if (metadata.confidence) lines.push(`Confidence: ${metadata.confidence}%`);
  if (metadata.language) lines.push(`Language: ${metadata.language}`);
  
  return lines.join('\n');
}

function generateMetadataHTML(metadata) {
  if (!metadata) return '';
  
  const lines = [];
  if (metadata.filename) lines.push(`<strong>File:</strong> ${escapeHtml(metadata.filename)}<br>`);
  if (metadata.date) lines.push(`<strong>Date:</strong> ${escapeHtml(metadata.date)}<br>`);
  if (metadata.confidence) lines.push(`<strong>Confidence:</strong> ${metadata.confidence}%<br>`);
  if (metadata.language) lines.push(`<strong>Language:</strong> ${escapeHtml(metadata.language)}<br>`);
  
  return lines.join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

