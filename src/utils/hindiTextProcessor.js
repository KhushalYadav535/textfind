// Specialized Hindi text processing utilities
import Tesseract from 'tesseract.js';

/**
 * Enhanced Hindi text extraction with better OCR settings
 * @param {Array} images - Array of image objects from convertPDFToImages
 * @param {Object} options - OCR options
 * @returns {Promise<Array<{pageNumber: number, text: string, confidence: number}>>}
 */
export const extractHindiTextFromImages = async (images, options = {}) => {
  const {
    progressCallback = null,
    useHindiOnly = false
  } = options;
  
  const results = [];
  const totalImages = images.length;
  
  // Use Hindi + English for better recognition of mixed content
  const languages = useHindiOnly ? ['hin'] : ['hin', 'eng'];
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    
    try {
      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total: totalImages,
          pageNumber: image.pageNumber,
          status: 'processing_hindi'
        });
      }
      
      // Enhanced OCR settings for Hindi text
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
                status: 'recognizing_hindi',
                progress: Math.round(m.progress * 100)
              });
            }
          },
          // Enhanced settings for better Hindi recognition
          tessedit_char_whitelist: 'अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहक्षत्रज्ञ०१२३४५६७८९ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?;:()[]{}"\'',
          tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
          preserve_interword_spaces: '1'
        }
      );
      
      // Clean up the extracted text
      const cleanedText = cleanHindiText(text);
      
      results.push({
        pageNumber: image.pageNumber,
        text: cleanedText,
        confidence: Math.round(confidence),
        wordCount: cleanedText.trim().split(/\s+/).length,
        language: 'hindi'
      });
      
    } catch (error) {
      console.error(`Error processing Hindi text on page ${image.pageNumber}:`, error);
      results.push({
        pageNumber: image.pageNumber,
        text: '',
        confidence: 0,
        wordCount: 0,
        error: error.message,
        language: 'hindi'
      });
    }
  }
  
  return results;
};

/**
 * Clean and normalize Hindi text
 * @param {string} text - Raw extracted text
 * @returns {string} Cleaned text
 */
const cleanHindiText = (text) => {
  if (!text) return '';
  
  // Remove extra whitespace and normalize
  let cleaned = text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim();
  
  // Fix common OCR errors in Hindi
  const corrections = {
    // Common OCR mistakes for Hindi characters
    'अं': 'अं',
    'अः': 'अः',
    'कं': 'कं',
    'खं': 'खं',
    'गं': 'गं',
    'घं': 'घं',
    'चं': 'चं',
    'छं': 'छं',
    'जं': 'जं',
    'झं': 'झं',
    'टं': 'टं',
    'ठं': 'ठं',
    'डं': 'डं',
    'ढं': 'ढं',
    'तं': 'तं',
    'थं': 'थं',
    'दं': 'दं',
    'धं': 'धं',
    'नं': 'नं',
    'पं': 'पं',
    'फं': 'फं',
    'बं': 'बं',
    'भं': 'भं',
    'मं': 'मं',
    'यं': 'यं',
    'रं': 'रं',
    'लं': 'लं',
    'वं': 'वं',
    'शं': 'शं',
    'षं': 'षं',
    'सं': 'सं',
    'हं': 'हं'
  };
  
  // Apply corrections
  Object.entries(corrections).forEach(([wrong, correct]) => {
    cleaned = cleaned.replace(new RegExp(wrong, 'g'), correct);
  });
  
  return cleaned;
};

/**
 * Detect if text contains Hindi characters
 * @param {string} text - Text to analyze
 * @returns {boolean} True if Hindi characters are detected
 */
export const containsHindiText = (text) => {
  if (!text) return false;
  
  // Hindi Unicode range: U+0900-U+097F
  const hindiRegex = /[\u0900-\u097F]/;
  return hindiRegex.test(text);
};

/**
 * Get Hindi text statistics
 * @param {string} text - Text to analyze
 * @returns {Object} Statistics about Hindi content
 */
export const getHindiTextStats = (text) => {
  if (!text) return { totalChars: 0, hindiChars: 0, hindiPercentage: 0 };
  
  const totalChars = text.length;
  const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
  const hindiPercentage = totalChars > 0 ? (hindiChars / totalChars) * 100 : 0;
  
  return {
    totalChars,
    hindiChars,
    hindiPercentage: Math.round(hindiPercentage * 100) / 100
  };
};

/**
 * Process PDF with enhanced Hindi support
 * @param {File} pdfFile - The PDF file to process
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processing result with Hindi text
 */
export const processPDFWithHindi = async (pdfFile, options = {}) => {
  const {
    maxPages = 10,
    progressCallback = null,
    useHindiOnly = false
  } = options;
  
  try {
    if (progressCallback) {
      progressCallback({ status: 'analyzing', message: 'Analyzing PDF for Hindi content...' });
    }
    
    // Import the main PDF processor
    const { convertPDFToImages } = await import('./pdfProcessor.js');
    
    // Convert PDF to images
    const images = await convertPDFToImages(pdfFile, { maxPages });
    
    if (progressCallback) {
      progressCallback({ status: 'ocr_processing', message: 'Running Hindi OCR on images...' });
    }
    
    // Extract Hindi text
    const hindiResults = await extractHindiTextFromImages(images, { 
      progressCallback, 
      useHindiOnly 
    });
    
    // Analyze the results
    const totalText = hindiResults.map(r => r.text).join('\n\n');
    const stats = getHindiTextStats(totalText);
    
    return {
      type: 'hindi_ocr',
      analysis: {
        isScanned: true,
        hasText: true,
        confidence: Math.round(hindiResults.reduce((sum, r) => sum + r.confidence, 0) / hindiResults.length),
        totalPages: hindiResults.length,
        pagesWithText: hindiResults.filter(r => r.text.trim().length > 0).length,
        hindiStats: stats
      },
      pages: hindiResults,
      totalText,
      totalConfidence: Math.round(hindiResults.reduce((sum, r) => sum + r.confidence, 0) / hindiResults.length),
      totalWords: hindiResults.reduce((sum, r) => sum + r.wordCount, 0),
      hindiStats: stats
    };
    
  } catch (error) {
    console.error('Error processing PDF with Hindi support:', error);
    throw new Error(`Hindi PDF processing failed: ${error.message}`);
  }
};
