import Tesseract from 'tesseract.js';

// Real OCR client with Tesseract.js
export const base44 = {
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        // Return file URL for processing
        return {
          file_url: URL.createObjectURL(file)
        };
      },
      ExtractDataFromUploadedFile: async ({ file_url, file }) => {
        try {
          // Check file type
          const fileType = file?.type || 'unknown';
          const isPDF = fileType === 'application/pdf';
          const isImage = fileType.startsWith('image/');
          
          console.log('Processing file type:', fileType);
          
          if (!isPDF && !isImage) {
            return {
              status: "error",
              output: {
                text: "Unsupported file format. Please upload an image (PNG, JPG, WEBP) or PDF file.",
                confidence: 0
              }
            };
          }

          // For PDF files, show a helpful message
          if (isPDF) {
            console.log('PDF file detected, processing with Tesseract.js...');
          }

          // Real OCR extraction using Tesseract.js
          const { data: { text, confidence } } = await Tesseract.recognize(
            file || file_url,
            'eng+hin', // English + Hindi support
            {
              logger: m => {
                if (m.status === 'recognizing text') {
                  console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                }
                if (m.status === 'loading tesseract core') {
                  console.log('Loading Tesseract core...');
                }
                if (m.status === 'initializing tesseract') {
                  console.log('Initializing Tesseract...');
                }
              }
            }
          );
          
          const extractedText = text.trim();
          
          if (!extractedText || extractedText.length < 3) {
            return {
              status: "success",
              output: {
                text: isPDF 
                  ? "No text could be extracted from this PDF. The PDF might be scanned as images or contain only images. Try uploading a PDF with selectable text or convert it to images first."
                  : "No text detected in the image. Please ensure the image contains clear, readable text.",
                confidence: Math.round(confidence)
              }
            };
          }
          
          return {
            status: "success",
            output: {
              text: extractedText,
              confidence: Math.round(confidence)
            }
          };
        } catch (error) {
          console.error('OCR Error:', error);
          
          // Provide specific error messages based on error type
          let errorMessage = "Error processing the file. ";
          
          if (error.message?.includes('Invalid image')) {
            errorMessage += "The file format might not be supported or the file is corrupted.";
          } else if (error.message?.includes('network')) {
            errorMessage += "Network error occurred while processing.";
          } else if (file?.type === 'application/pdf') {
            errorMessage += "PDF processing failed. Try converting the PDF to images first or ensure the PDF contains readable text.";
          } else {
            errorMessage += "Please try with a different file or check if the file contains clear, readable text.";
          }
          
          return {
            status: "error",
            output: {
              text: errorMessage,
              confidence: 0
            }
          };
        }
      }
    }
  },
  entities: {
    UploadHistory: {
      create: async (data) => {
        // Mock creation - save to localStorage for demo
        const id = Date.now().toString();
        const record = { ...data, id, created_date: new Date().toISOString() };
        const existing = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
        existing.push(record);
        localStorage.setItem('uploadHistory', JSON.stringify(existing));
        return record;
      },
      list: async (sortBy) => {
        // Mock list - get from localStorage
        const existing = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
        return existing.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      },
      filter: async ({ id }) => {
        // Mock filter
        const existing = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
        return existing.filter(item => item.id === id);
      },
      update: async (id, data) => {
        // Mock update
        const existing = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
        const index = existing.findIndex(item => item.id === id);
        if (index !== -1) {
          existing[index] = { ...existing[index], ...data };
          localStorage.setItem('uploadHistory', JSON.stringify(existing));
          return existing[index];
        }
      },
      delete: async (id) => {
        // Mock delete
        const existing = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
        const filtered = existing.filter(item => item.id !== id);
        localStorage.setItem('uploadHistory', JSON.stringify(filtered));
      }
    }
  }
};
