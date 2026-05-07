// Enhanced PDF processing using PDF.js for real text extraction
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

/**
 * Real enhanced PDF processing using PDF.js text extraction layer.
 * This is the primary fallback when the MinerU/Python backend is unavailable.
 */
export const processPDFEnhanced = async (pdfFile, options = {}) => {
  const {
    maxPages = 10,
    progressCallback = null
  } = options;

  if (progressCallback) {
    progressCallback({ status: 'analyzing', progress: 20, message: 'Loading PDF for text extraction...' });
  }

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, verbosity: 0 }).promise;
  const totalPages = Math.min(pdf.numPages, maxPages);

  const pages = [];
  let allText = '';

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    if (progressCallback) {
      const progress = 20 + Math.round((pageNum / totalPages) * 70);
      progressCallback({
        status: 'processing',
        progress,
        current: pageNum,
        total: totalPages,
        message: `Extracting text from page ${pageNum}/${totalPages}...`
      });
    }

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Join text items preserving line breaks
    let pageText = '';
    let lastY = null;
    for (const item of textContent.items) {
      if ('str' in item) {
        // Insert newline when Y position changes significantly (new line in PDF)
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          pageText += '\n';
        }
        pageText += item.str;
        if (item.hasEOL) pageText += '\n';
        lastY = item.transform[5];
      }
    }

    pageText = pageText.trim();
    allText += (allText ? '\n\n' : '') + `## Page ${pageNum}\n\n${pageText}`;

    pages.push({
      pageNumber: pageNum,
      text: pageText,
      confidence: pageText.length > 0 ? 90 : 0,
      wordCount: pageText.split(/\s+/).filter(w => w.length > 0).length
    });
  }

  if (progressCallback) {
    progressCallback({ status: 'complete', progress: 100, message: 'Text extraction complete!' });
  }

  const totalWords = pages.reduce((sum, p) => sum + p.wordCount, 0);
  const hasRealText = allText.replace(/## Page \d+/g, '').trim().length > 20;

  // If PDF.js extracted no readable text, it's likely a scanned PDF (image-only)
  if (!hasRealText) {
    throw new Error('No readable text found in PDF — may be a scanned/image-only PDF');
  }

  return {
    type: 'pdfjs_extracted',
    analysis: {
      isScanned: false,
      hasText: true,
      confidence: 90,
      totalPages: pdf.numPages,
      pagesWithText: pages.filter(p => p.wordCount > 0).length
    },
    pages,
    totalText: allText,
    totalConfidence: 90,
    totalWords
  };
};
