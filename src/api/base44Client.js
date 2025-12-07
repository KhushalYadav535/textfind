/**
 * Base44 Client - Main API client for the application
 * Handles OCR processing and data storage
 */

import { extractTextWithAmazonNova } from './amazonNovaOcrClient.js';
import { removeFileDataFromHistory, clearOldStorage } from '../utils/localStorageHelper.js';

export const base44 = {
  integrations: {
    amazonNova: {
      extractText: extractTextWithAmazonNova
    }
  },
  
  entities: {
    UploadHistory: {
      create: async (data) => {
        try {
          // PROACTIVE CLEANUP - Clean before saving to prevent quota errors
          console.log('Starting proactive cleanup before saving...');
          
          // Get existing items
          let existing = [];
          try {
            existing = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
          } catch (e) {
            console.warn('Error reading existing history, starting fresh:', e);
            existing = [];
          }
          
          // Step 1: Remove file_data_url from ALL items (biggest space saver)
          console.log('Removing file_data_url from all existing items...');
          existing = existing.map(item => {
            const { file_data_url, ...rest } = item;
            return rest;
          });
          
          // Step 2: Sort by date (newest first)
          const sorted = existing.sort((a, b) => 
            new Date(b.created_date || b.id) - new Date(a.created_date || a.id)
          );
          
          // Step 3: Keep only last 10 items (very aggressive limit)
          const cleaned = sorted.slice(0, 10);
          
          // Step 4: Create new record WITHOUT file_data_url to save space
          const id = Date.now().toString();
          const { file_data_url: newFileData, ...dataWithoutFile } = data;
          const record = { 
            ...dataWithoutFile,
            id, 
            created_date: new Date().toISOString()
          };
          
          // Step 5: Clear other localStorage items to free space
          try {
            clearOldStorage();
          } catch (e) {
            console.warn('Error clearing old storage:', e);
          }
          
          // Step 6: Add new record at the beginning (most recent)
          const finalList = [record, ...cleaned].slice(0, 10); // Keep max 10 items
          
          // Step 7: Try to save with aggressive limits
          try {
            const jsonString = JSON.stringify(finalList);
            
            // Check size before saving (optional - for debugging)
            const sizeInMB = new Blob([jsonString]).size / (1024 * 1024);
            console.log(`Attempting to save ${finalList.length} items, size: ${sizeInMB.toFixed(2)} MB`);
            
            localStorage.setItem('uploadHistory', jsonString);
            
            // Verify the record was saved
            const verify = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
            const found = verify.find(r => r.id === record.id);
            
            if (!found) {
              console.warn('Record not found after save, attempting retry...');
              // Retry with even more aggressive cleanup
              const retryList = [record];
              localStorage.setItem('uploadHistory', JSON.stringify(retryList));
              console.log('Saved with single record on retry');
              return record;
            }
            
            console.log('Record saved successfully');
            return record;
            
          } catch (saveError) {
            console.error('Error saving record:', saveError);
            
            // If still failing, try even more aggressive cleanup
            if (saveError.name === 'QuotaExceededError' || saveError.code === 22 || saveError.message?.includes('quota')) {
              console.warn('Still quota exceeded, performing extreme cleanup...');
              
              try {
                // Clear ALL other localStorage keys except uploadHistory
                const keysToKeep = ['uploadHistory'];
                for (let key in localStorage) {
                  if (localStorage.hasOwnProperty(key) && !keysToKeep.includes(key)) {
                    try {
                      localStorage.removeItem(key);
                    } catch (e) {
                      console.warn(`Could not remove ${key}:`, e);
                    }
                  }
                }
                
                // Try saving just the new record (last 3 items)
                const minimalList = [record, ...cleaned.slice(0, 2)]; // Only 3 items total
                localStorage.setItem('uploadHistory', JSON.stringify(minimalList));
                console.log('Saved with minimal records (3 items)');
                return record;
                
              } catch (extremeError) {
                console.error('Extreme cleanup also failed:', extremeError);
                
                // Last resort: save just the new record
                try {
                  localStorage.setItem('uploadHistory', JSON.stringify([record]));
                  console.log('Saved only new record as last resort');
                  return record;
                } catch (lastResortError) {
                  console.error('Even last resort failed:', lastResortError);
                  // Still return the record so navigation can happen
                  // User will see it's not saved but at least the app won't crash
                  return record;
                }
              }
            }
            
            // For other errors, still return the record
            return record;
          }
          
        } catch (error) {
          console.error('Error in create function:', error);
          
          // Even on error, try to create a minimal record
          try {
            const id = Date.now().toString();
            const { file_data_url, ...dataWithoutFile } = data;
            const minimalRecord = {
              ...dataWithoutFile,
              id,
              created_date: new Date().toISOString()
            };
            
            // Try to save just this one record
            try {
              localStorage.setItem('uploadHistory', JSON.stringify([minimalRecord]));
            } catch (e) {
              console.error('Could not save even minimal record:', e);
            }
            
            return minimalRecord;
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            // Return a basic record anyway so navigation can proceed
            return {
              id: Date.now().toString(),
              ...data,
              created_date: new Date().toISOString()
            };
          }
        }
      },
      
      list: async () => {
        try {
          const items = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
          return items.sort((a, b) => 
            new Date(b.created_date || b.id) - new Date(a.created_date || a.id)
          );
        } catch (error) {
          console.error('Error listing history:', error);
          return [];
        }
      },
      
      filter: async (criteria) => {
        try {
          const items = await base44.entities.UploadHistory.list();
          return items.filter(item => {
            return Object.keys(criteria).every(key => item[key] === criteria[key]);
          });
        } catch (error) {
          console.error('Error filtering history:', error);
          return [];
        }
      },
      
      update: async (id, data) => {
        try {
          const items = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
          const index = items.findIndex(item => item.id === id);
          
          if (index !== -1) {
            // Remove file_data_url from updated item to save space
            const { file_data_url, ...dataWithoutFile } = data;
            items[index] = { ...items[index], ...dataWithoutFile };
            
            localStorage.setItem('uploadHistory', JSON.stringify(items));
            return items[index];
          }
          
          return null;
        } catch (error) {
          console.error('Error updating history:', error);
          return null;
        }
      },
      
      delete: async (id) => {
        try {
          const items = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
          const filtered = items.filter(item => item.id !== id);
          localStorage.setItem('uploadHistory', JSON.stringify(filtered));
          return true;
        } catch (error) {
          console.error('Error deleting history:', error);
          return false;
        }
      }
    }
  },
  
  ExtractDataFromUploadedFile: async (file, options = {}) => {
    const { progressCallback = null, apiKey = null } = options;
    
    try {
      // Detect file type
      const fileType = file.type;
      const isImage = fileType.startsWith('image/');
      const isPDF = fileType === 'application/pdf';
      
      if (!isImage && !isPDF) {
        throw new Error(`Unsupported file type: ${fileType}`);
      }
      
      let extractedText = '';
      let confidence = 0;
      
      if (isImage) {
        console.log('Image file detected, processing with Amazon Nova 2 Lite OCR...');
        if (progressCallback) {
          progressCallback({ status: 'converting', message: 'Converting file to base64...' });
        }
        
        const result = await extractTextWithAmazonNova(file, {
          apiKey,
          progressCallback: (progress) => {
            if (progressCallback) {
              progressCallback({
                status: progress.status || 'processing',
                message: progress.message || 'Processing with Amazon Nova 2 Lite OCR...',
                progress: progress.progress || 0
              });
            }
          }
        });
        
        extractedText = result.data.text || '';
        confidence = result.data.confidence || 0;
      } else {
        // PDF handling would go here
        throw new Error('PDF processing not implemented in this function. Use processPDF instead.');
      }
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from the file. Please ensure the image/PDF contains readable text.');
      }
      
      if (!apiKey || apiKey.trim().length === 0) {
        throw new Error('Amazon Nova API key is required. Please check your configuration.');
      }
      
      return {
        text: extractedText,
        confidence: confidence,
        fileType: fileType,
        fileName: file.name
      };
      
    } catch (error) {
      console.error('Amazon Nova 2 Lite OCR Error:', error);
      throw error;
    }
  }
};
