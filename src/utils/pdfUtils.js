// PDF utility functions for better PDF handling

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
  const errors = [];
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push('File size too large. Please select a PDF smaller than 10MB.');
  }
  
  // Check if it's actually a PDF
  if (!isPDFFile(file)) {
    errors.push('Please select a valid PDF file.');
  }
  
  // Check file extension
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    errors.push('File must have .pdf extension.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
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

export const getPDFProcessingTips = () => {
  return [
    "Ensure the PDF contains selectable text (not just scanned images)",
    "Avoid password-protected PDFs",
    "For scanned PDFs, try converting to images first",
    "PDFs with clear, readable fonts work best",
    "Complex layouts may not process perfectly"
  ];
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
