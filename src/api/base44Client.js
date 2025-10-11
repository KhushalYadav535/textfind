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
          // Real OCR extraction using Tesseract.js
          const { data: { text, confidence } } = await Tesseract.recognize(
            file || file_url,
            'eng+hin', // English + Hindi support
            {
              logger: m => {
                if (m.status === 'recognizing text') {
                  console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                }
              }
            }
          );
          
          return {
            status: "success",
            output: {
              text: text.trim() || "No text detected in the image",
              confidence: Math.round(confidence)
            }
          };
        } catch (error) {
          console.error('OCR Error:', error);
          return {
            status: "error",
            output: {
              text: "Error extracting text from image",
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
