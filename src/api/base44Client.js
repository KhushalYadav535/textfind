import { extractTextWithGemini } from './geminiOcrClient.js';

// Gemini OCR client using n8n webhook
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
            console.log('PDF file detected, processing with Gemini OCR...');
          } else {
            console.log('Image file detected, processing with Gemini OCR...');
          }

          // Get API key from environment or use empty string (will be handled by geminiOcrClient)
          const apiKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '';
          
          // Use Gemini OCR via n8n webhook
          const result = await extractTextWithGemini(file, {
            apiKey: apiKey || undefined, // Pass undefined if empty to let geminiOcrClient handle it
            progressCallback: (progress) => {
              console.log(`Gemini OCR Status: ${progress.status} - ${progress.message || ''}`);
            }
          });
          
          const extractedText = result.data.text.trim();
          
          if (!extractedText || extractedText.length < 3) {
            return {
              status: "success",
              output: {
                text: isPDF 
                  ? "No text could be extracted from this PDF. The PDF might contain only images or be corrupted."
                  : "No text detected in the image. Please ensure the image contains clear, readable text.",
                confidence: Math.round(result.data.confidence)
              }
            };
          }
          
          return {
            status: "success",
            output: {
              text: extractedText,
              confidence: Math.round(result.data.confidence)
            }
          };
        } catch (error) {
          console.error('Gemini OCR Error:', error);
          
          // Provide specific error messages based on error type
          let errorMessage = "Error processing the file. ";
          
          if (error.message?.includes('API key')) {
            errorMessage += "Gemini API key is required. Please configure VITE_GEMINI_API_KEY environment variable.";
          } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
            errorMessage += "Network error occurred while processing. Please check your internet connection.";
          } else if (error.message?.includes('HTTP')) {
            errorMessage += `Server error: ${error.message}`;
          } else if (file?.type === 'application/pdf') {
            errorMessage += "PDF processing failed. This might be because:\n";
            errorMessage += "• The PDF is password-protected or corrupted\n";
            errorMessage += "• The PDF is too large\n";
            errorMessage += "• Network connection issues\n\n";
            errorMessage += "Please try again or use a different PDF file.";
          } else {
            errorMessage += error.message || "Please try with a different file or check if the file contains clear, readable text.";
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
