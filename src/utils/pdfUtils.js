// PDF utility functions for better PDF handling
import { processPDF, analyzePDFType, validatePDFForProcessing, getProcessingTips } from './pdfProcessor.js';

export const isPDFFile = (file) => {
  return file && file.type === 'application/pdf';
};

export const getPDFInfo = (file) => {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  };
};

export const validatePDFFile = (file) => {
  // Use the enhanced validation from pdfProcessor
  return validatePDFForProcessing(file);
};

export const createPDFPreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      // Create a simple PDF preview using canvas or return a placeholder
      const previewData = {
        type: 'pdf',
        name: file.name,
        size: file.size,
        preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzM0NDE1NSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBERiBGaWxlPC90ZXh0Pjwvc3ZnPg=='
      };
      resolve(previewData);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read PDF file'));
    };
    
    // For PDF files, we don't actually need to read the content for preview
    // Just resolve with placeholder data
    setTimeout(() => {
      const previewData = {
        type: 'pdf',
        name: file.name,
        size: file.size,
        preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzM0NDE1NSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBERiBGaWxlPC90ZXh0Pjwvc3ZnPg=='
      };
      resolve(previewData);
    }, 100);
  });
};

export const getPDFProcessingTips = (analysis = null) => {
  if (analysis) {
    return getProcessingTips(analysis);
  }
  
  return [
    "Ensure the PDF contains selectable text (not just scanned images)",
    "Avoid password-protected PDFs",
    "For scanned PDFs, OCR processing will be used automatically",
    "PDFs with clear, readable fonts work best",
    "Complex layouts may not process perfectly",
    "Large PDFs may take longer to process"
  ];
};

// New function to analyze PDF type
export const analyzePDF = async (file) => {
  try {
    return await analyzePDFType(file);
  } catch (error) {
    console.error('Error analyzing PDF:', error);
    return {
      isScanned: true,
      hasText: false,
      confidence: 0,
      totalPages: 0,
      pagesWithText: 0
    };
  }
};

// New function to process PDF with OCR support
export const processPDFWithOCR = async (file, options = {}) => {
  try {
    return await processPDF(file, options);
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
