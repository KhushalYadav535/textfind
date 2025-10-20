// Fallback PDF processing without PDF.js workers
import Tesseract from 'tesseract.js';

/**
 * Simple PDF processing fallback that treats PDFs as images
 * This is a basic implementation for when PDF.js workers fail
 */
export const processPDFFallback = async (pdfFile, options = {}) => {
  const {
    languages = ['eng'],
    progressCallback = null
  } = options;
  
  try {
    if (progressCallback) {
      progressCallback({ status: 'fallback', message: 'Using fallback PDF processing...' });
    }
    
    // For now, we'll return a message indicating that PDF processing is not available
    // In a real implementation, you might want to:
    // 1. Convert PDF to images server-side
    // 2. Use a different PDF processing library
    // 3. Ask user to convert PDF to images manually
    
    return {
      type: 'fallback',
      analysis: {
        isScanned: true,
        hasText: false,
        confidence: 0,
        totalPages: 1,
        pagesWithText: 0
      },
      pages: [{
        pageNumber: 1,
        text: `PDF processing encountered a technical issue. 

To extract text from your PDF, please try one of these alternatives:

1. Convert PDF to Images:
   • Use online tools like SmallPDF, ILovePDF, or PDF24
   • Convert each page to PNG or JPG format
   • Upload the images individually to this application

2. Use Text-based PDFs:
   • If your PDF contains selectable text, try copying and pasting the text directly
   • Use PDF editing software to ensure text is selectable

3. Try Again:
   • Refresh the page and try uploading the PDF again
   • Check your internet connection
   • Try with a smaller PDF file

The OCR engine is working properly for image files, so converting your PDF to images will give you the best results.`,
        confidence: 0,
        wordCount: 0
      }],
      totalText: `PDF processing encountered a technical issue. 

To extract text from your PDF, please try one of these alternatives:

1. Convert PDF to Images:
   • Use online tools like SmallPDF, ILovePDF, or PDF24
   • Convert each page to PNG or JPG format
   • Upload the images individually to this application

2. Use Text-based PDFs:
   • If your PDF contains selectable text, try copying and pasting the text directly
   • Use PDF editing software to ensure text is selectable

3. Try Again:
   • Refresh the page and try uploading the PDF again
   • Check your internet connection
   • Try with a smaller PDF file

The OCR engine is working properly for image files, so converting your PDF to images will give you the best results.`,
      totalConfidence: 0,
      totalWords: 0
    };
  } catch (error) {
    console.error('Fallback PDF processing error:', error);
    throw new Error(`PDF processing failed: ${error.message}`);
  }
};

/**
 * Check if PDF processing is available
 */
export const isPDFProcessingAvailable = () => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return false;
    }
    
    // Check if PDF.js is available
    if (typeof pdfjsLib === 'undefined') {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};
