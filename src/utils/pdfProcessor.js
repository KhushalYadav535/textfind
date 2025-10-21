// PDF processing utilities for both text-based and scanned PDFs
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import { processPDFFallback } from './pdfProcessorFallback.js';
import { processPDFSimple } from './simplePDFProcessor.js';
import { processPDFEnhanced } from './enhancedPDFProcessor.js';
import { processPDFWithHindi, containsHindiText } from './hindiTextProcessor.js';

// Configure PDF.js worker - Use local worker file
if (typeof window !== 'undefined') {
  // Use local worker file from public directory
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

/**
 * Check if a PDF contains selectable text or is scanned
 * @param {File} pdfFile - The PDF file to analyze
 * @returns {Promise<{isScanned: boolean, hasText: boolean, confidence: number}>}
 */
export const analyzePDFType = async (pdfFile) => {
  try {
    if (!pdfFile || pdfFile.type !== 'application/pdf') {
      throw new Error('Invalid PDF file');
    }
    
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let totalTextLength = 0;
    let totalPages = pdf.numPages;
    let pagesWithText = 0;
    
    // Check first few pages for text content
    const pagesToCheck = Math.min(3, totalPages);
    
    for (let i = 1; i <= pagesToCheck; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      
      if (pageText.trim().length > 10) {
        pagesWithText++;
        totalTextLength += pageText.length;
      }
    }
    
    const textRatio = totalTextLength / (pagesToCheck * 100); // Normalize
    const hasText = pagesWithText > 0 && textRatio > 0.1;
    const isScanned = !hasText;
    const confidence = hasText ? Math.min(95, textRatio * 100) : 85;
    
    return {
      isScanned,
      hasText,
      confidence,
      totalPages,
      pagesWithText
    };
  } catch (error) {
    console.error('Error analyzing PDF:', error);
    
    // If it's a worker error, return a default analysis
    if (error.message.includes('worker') || error.message.includes('Failed to fetch')) {
      return {
        isScanned: true, // Assume scanned if analysis fails
        hasText: false,
        confidence: 0,
        totalPages: 1, // Assume at least 1 page
        pagesWithText: 0
      };
    }
    
    return {
      isScanned: true, // Assume scanned if analysis fails
      hasText: false,
      confidence: 0,
      totalPages: 0,
      pagesWithText: 0
    };
  }
};

/**
 * Convert PDF pages to images for OCR processing
 * @param {File} pdfFile - The PDF file to convert
 * @param {Object} options - Conversion options
 * @returns {Promise<Array<{pageNumber: number, imageData: string, canvas: HTMLCanvasElement}>>}
 */
export const convertPDFToImages = async (pdfFile, options = {}) => {
  const {
    scale = 2.0, // Higher scale for better OCR accuracy
    maxPages = 10, // Limit pages to prevent memory issues
    quality = 0.95
  } = options;
  
  try {
    if (!pdfFile || pdfFile.type !== 'application/pdf') {
      throw new Error('Invalid PDF file');
    }
    
    const arrayBuffer = await pdfFile.arrayBuffer();
    
    // Add error handling for PDF loading
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0 // Reduce console output
    });
    
    const pdf = await loadingTask.promise;
    const totalPages = Math.min(pdf.numPages, maxPages);
    const images = [];
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Convert to image data
      const imageData = canvas.toDataURL('image/png', quality);
      
      images.push({
        pageNumber: pageNum,
        imageData,
        canvas,
        width: canvas.width,
        height: canvas.height
      });
    }
    
    return images;
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    
    // If it's a worker error, throw a specific error that will trigger fallback
    if (error.message.includes('worker') || error.message.includes('Failed to fetch')) {
      throw new Error(`Failed to convert PDF to images: ${error.message}`);
    }
    
    throw new Error(`Failed to convert PDF to images: ${error.message}`);
  }
};

/**
 * Extract text from images using OCR
 * @param {Array} images - Array of image objects from convertPDFToImages
 * @param {Object} options - OCR options
 * @returns {Promise<Array<{pageNumber: number, text: string, confidence: number}>>}
 */
export const extractTextFromImages = async (images, options = {}) => {
  const {
    languages = ['eng', 'hin'], // Add Hindi support by default
    progressCallback = null
  } = options;
  
  const results = [];
  const totalImages = images.length;
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    
    try {
      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total: totalImages,
          pageNumber: image.pageNumber,
          status: 'processing'
        });
      }
      
      const { data: { text, confidence } } = await Tesseract.recognize(
        image.imageData,
        languages.join('+'),
        {
          logger: m => {
            if (progressCallback && m.status === 'recognizing text') {
              progressCallback({
                current: i + 1,
                total: totalImages,
                pageNumber: image.pageNumber,
                status: 'recognizing',
                progress: Math.round(m.progress * 100)
              });
            }
          }
        }
      );
      
      results.push({
        pageNumber: image.pageNumber,
        text: text.trim(),
        confidence: Math.round(confidence),
        wordCount: text.trim().split(/\s+/).length
      });
      
    } catch (error) {
      console.error(`Error processing page ${image.pageNumber}:`, error);
      results.push({
        pageNumber: image.pageNumber,
        text: '',
        confidence: 0,
        wordCount: 0,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Process a PDF file (both text-based and scanned)
 * @param {File} pdfFile - The PDF file to process
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processing result
 */
export const processPDF = async (pdfFile, options = {}) => {
  const {
    languages = ['eng', 'hin'], // Add Hindi support by default
    maxPages = 10,
    progressCallback = null,
    forceOCR = false,
    autoDetectLanguage = true
  } = options;
  
  try {
    // Step 1: Analyze PDF type
    if (progressCallback) {
      progressCallback({ status: 'analyzing', message: 'Analyzing PDF type...' });
    }
    
    const analysis = await analyzePDFType(pdfFile);
    
    // Step 1.5: Try a quick Hindi detection if auto-detect is enabled
    if (autoDetectLanguage && !forceOCR) {
      try {
        if (progressCallback) {
          progressCallback({ status: 'detecting_language', message: 'Detecting language...' });
        }
        
        // Quick test with first page to detect Hindi content
        const testImages = await convertPDFToImages(pdfFile, { maxPages: 1 });
        if (testImages.length > 0) {
          const testResult = await extractTextFromImages(testImages, { 
            languages: ['hin', 'eng'], 
            progressCallback: null 
          });
          
          if (testResult.length > 0 && containsHindiText(testResult[0].text)) {
            if (progressCallback) {
              progressCallback({ status: 'hindi_detected', message: 'Hindi text detected, using specialized processing...' });
            }
            
            // Use specialized Hindi processing
            return await processPDFWithHindi(pdfFile, { 
              maxPages, 
              progressCallback,
              useHindiOnly: false 
            });
          }
        }
      } catch (error) {
        console.log('Language detection failed, proceeding with standard processing:', error.message);
      }
    }
    
    if (!forceOCR && analysis.hasText && analysis.confidence > 70) {
      // PDF has selectable text, use standard extraction
      if (progressCallback) {
        progressCallback({ status: 'extracting_text', message: 'Extracting text from PDF...' });
      }
      
      // For now, we'll still convert to images for consistency
      // In a real implementation, you might want to use a different approach
      const images = await convertPDFToImages(pdfFile, { maxPages });
      const ocrResults = await extractTextFromImages(images, { languages, progressCallback });
      
      return {
        type: 'text_based',
        analysis,
        pages: ocrResults,
        totalText: ocrResults.map(r => r.text).join('\n\n'),
        totalConfidence: ocrResults.reduce((sum, r) => sum + r.confidence, 0) / ocrResults.length,
        totalWords: ocrResults.reduce((sum, r) => sum + r.wordCount, 0)
      };
    } else {
      // PDF is scanned or has insufficient text, use OCR
      if (progressCallback) {
        progressCallback({ status: 'converting', message: 'Converting PDF to images...' });
      }
      
      const images = await convertPDFToImages(pdfFile, { maxPages });
      
      if (progressCallback) {
        progressCallback({ status: 'ocr_processing', message: 'Running OCR on images...' });
      }
      
      const ocrResults = await extractTextFromImages(images, { languages, progressCallback });
      
      return {
        type: 'scanned',
        analysis,
        pages: ocrResults,
        totalText: ocrResults.map(r => r.text).join('\n\n'),
        totalConfidence: ocrResults.reduce((sum, r) => sum + r.confidence, 0) / ocrResults.length,
        totalWords: ocrResults.reduce((sum, r) => sum + r.wordCount, 0)
      };
    }
  } catch (error) {
    console.error('Error processing PDF:', error);
    
    // If PDF.js fails, try enhanced processing first
    if (error.message.includes('worker') || error.message.includes('Failed to fetch')) {
      console.log('PDF.js worker failed, using enhanced processing');
      try {
        return await processPDFEnhanced(pdfFile, options);
      } catch (enhancedError) {
        console.log('Enhanced processing failed, using simple processing');
        try {
          return await processPDFSimple(pdfFile, options);
        } catch (simpleError) {
          console.log('Simple processing failed, using fallback');
          return await processPDFFallback(pdfFile, options);
        }
      }
    }
    
    throw new Error(`PDF processing failed: ${error.message}`);
  }
};

/**
 * Get processing tips based on PDF analysis
 * @param {Object} analysis - PDF analysis result
 * @returns {Array<string>} Array of tips
 */
export const getProcessingTips = (analysis) => {
  const tips = [];
  
  if (analysis.isScanned) {
    tips.push("This appears to be a scanned PDF - OCR processing will be used");
    tips.push("For best results, ensure the original document has clear, readable text");
    tips.push("Higher resolution scans typically produce better OCR results");
  } else {
    tips.push("This PDF contains selectable text - standard extraction will be used");
    tips.push("Text-based PDFs typically process faster and more accurately");
  }
  
  if (analysis.totalPages > 10) {
    tips.push("Large PDFs may take longer to process");
    tips.push("Consider splitting very large documents into smaller sections");
  }
  
  return tips;
};

/**
 * Validate PDF file for processing
 * @param {File} pdfFile - The PDF file to validate
 * @returns {Object} Validation result
 */
export const validatePDFForProcessing = (pdfFile) => {
  const errors = [];
  const warnings = [];
  
  // Check file size (max 50MB for scanned PDFs)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (pdfFile.size > maxSize) {
    errors.push('File size too large. Please select a PDF smaller than 50MB.');
  }
  
  // Check if it's actually a PDF
  if (!pdfFile.type.includes('pdf') && !pdfFile.name.toLowerCase().endsWith('.pdf')) {
    errors.push('Please select a valid PDF file.');
  }
  
  // Warnings for large files
  if (pdfFile.size > 20 * 1024 * 1024) { // 20MB
    warnings.push('Large file detected - processing may take longer');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
