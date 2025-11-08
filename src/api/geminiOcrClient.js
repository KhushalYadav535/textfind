/**
 * Gemini OCR Client - Uses n8n webhook to process images and PDFs with Gemini API
 */

// Configuration - Get from environment variables
const GEMINI_WEBHOOK_URL = import.meta.env?.VITE_GEMINI_WEBHOOK_URL || 'https://n8n.srv980418.hstgr.cloud/webhook/4e500b76-7dad-4f9f-8afe-7af7f2f1be83';
const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || ''; // Get from environment variable

/**
 * Convert file to base64 string
 * @param {File|Blob} file - File to convert
 * @returns {Promise<string>} Base64 encoded string (without data URL prefix)
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove data URL prefix (data:image/jpeg;base64, or data:application/pdf;base64,)
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Extract text from image or PDF using Gemini OCR via n8n webhook
 * @param {File|Blob} file - Image or PDF file
 * @param {Object} options - OCR options
 * @param {string} options.apiKey - Gemini API key (optional, uses default if not provided)
 * @param {Function} options.progressCallback - Progress callback function
 * @returns {Promise<Object>} OCR result with text and confidence
 */
export const extractTextWithGemini = async (file, options = {}) => {
  const { apiKey = GEMINI_API_KEY, progressCallback = null } = options;

  if (!apiKey) {
    throw new Error('Gemini API key is required. Please set VITE_GEMINI_API_KEY environment variable or provide apiKey in options.');
  }

  try {
    // Update progress
    if (progressCallback) {
      progressCallback({ status: 'converting', progress: 10, message: 'Converting file to base64...' });
    }

    // Convert file to base64
    const base64Data = await fileToBase64(file);

    if (progressCallback) {
      progressCallback({ status: 'uploading', progress: 30, message: 'Sending to Gemini OCR...' });
    }

    // Prepare payload for webhook
    const payload = {
      image: base64Data, // Using 'image' field as per n8n workflow
      apiKey: apiKey
    };

    // Call n8n webhook
    const response = await fetch(GEMINI_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 70, message: 'Processing with Gemini...' });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Complete!' });
    }

    // Check if request was successful
    if (!result.success) {
      throw new Error(result.error || 'OCR processing failed');
    }

    // Extract text from response
    const extractedText = result.extractedText || '';

    // Return in format compatible with existing code
    return {
      data: {
        text: extractedText,
        confidence: extractedText.length > 0 ? 95 : 0 // Gemini doesn't return confidence, so we estimate
      }
    };
  } catch (error) {
    console.error('Gemini OCR Error:', error);
    throw error;
  }
};

/**
 * Process multiple images/files (for PDF pages)
 * @param {Array<{file: File, pageNumber: number}>} files - Array of file objects with page numbers
 * @param {Object} options - OCR options
 * @returns {Promise<Array<{pageNumber: number, text: string, confidence: number}>>}
 */
export const extractTextFromMultipleFiles = async (files, options = {}) => {
  const { apiKey = GEMINI_API_KEY, progressCallback = null } = options;
  const results = [];
  const totalFiles = files.length;

  for (let i = 0; i < files.length; i++) {
    const fileObj = files[i];
    const file = fileObj.file || fileObj;

    try {
      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total: totalFiles,
          pageNumber: fileObj.pageNumber || i + 1,
          status: 'processing',
          message: `Processing page ${i + 1}/${totalFiles}...`
        });
      }

      const result = await extractTextWithGemini(file, { apiKey, progressCallback });

      results.push({
        pageNumber: fileObj.pageNumber || i + 1,
        text: result.data.text.trim(),
        confidence: result.data.confidence,
        wordCount: result.data.text.trim().split(/\s+/).filter(w => w.length > 0).length
      });
    } catch (error) {
      console.error(`Error processing file ${i + 1}:`, error);
      results.push({
        pageNumber: fileObj.pageNumber || i + 1,
        text: '',
        confidence: 0,
        wordCount: 0,
        error: error.message
      });
    }
  }

  return results;
};

// Export default for convenience
export default {
  extractTextWithGemini,
  extractTextFromMultipleFiles,
  fileToBase64
};

