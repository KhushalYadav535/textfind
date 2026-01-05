/**
 * Bytez OCR Client - Uses Bytez SDK for OCR processing
 */

import Bytez from 'bytez.js';

// Configuration - Get from environment variables
const BYTEZ_API_KEY = import.meta.env?.VITE_BYTEZ_API_KEY || 'c693e970502c7ac513415efe7032958e';

// Initialize Bytez SDK
let bytezSDK = null;
const getBytezSDK = () => {
  if (!bytezSDK) {
    bytezSDK = new Bytez(BYTEZ_API_KEY);
  }
  return bytezSDK;
};

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
 * Extract text from image or PDF using Bytez OCR
 * @param {File|Blob} file - Image or PDF file
 * @param {Object} options - OCR options
 * @param {string} options.apiKey - Bytez API key (optional, uses default if not provided)
 * @param {Array<string>} options.languages - Languages to detect (default: ['eng'])
 * @param {Function} options.progressCallback - Progress callback function
 * @returns {Promise<Object>} OCR result with text and confidence
 */
export const extractTextWithBytez = async (file, options = {}) => {
  const { 
    apiKey = BYTEZ_API_KEY, 
    languages = ['eng'],
    progressCallback = null,
    modelId = 'microsoft/trocr-base-printed' // OCR model
  } = options;

  if (!apiKey) {
    throw new Error('Bytez API key is required. Please set VITE_BYTEZ_API_KEY environment variable or provide apiKey in options.');
  }

  try {
    // Update progress
    if (progressCallback) {
      progressCallback({ status: 'converting', progress: 10, message: 'Converting file to base64...' });
    }

    // Convert file to base64
    const base64Data = await fileToBase64(file);
    const dataUrl = `data:${file.type || 'image/jpeg'};base64,${base64Data}`;

    if (progressCallback) {
      progressCallback({ status: 'uploading', progress: 30, message: 'Sending to Bytez OCR...' });
    }

    // Get Bytez SDK
    const sdk = getBytezSDK();
    const model = sdk.model(modelId);

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 50, message: 'Processing with Bytez OCR...' });
    }

    // Run OCR model with image
    // Bytez models typically accept image data or text prompts
    const prompt = `Extract all text from this image. Return only the extracted text without any additional formatting or explanation.`;
    
    const { error, output } = await model.run({
      image: dataUrl,
      prompt: prompt,
      languages: languages
    });

    if (error) {
      throw new Error(`Bytez OCR error: ${error.message || error}`);
    }

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 90, message: 'Receiving OCR results...' });
    }

    // Extract text from output
    // Bytez output format may vary, handle different formats
    let extractedText = '';
    if (typeof output === 'string') {
      extractedText = output;
    } else if (output?.text) {
      extractedText = output.text;
    } else if (output?.extractedText) {
      extractedText = output.extractedText;
    } else if (Array.isArray(output)) {
      extractedText = output.map(item => item.text || item).join('\n');
    } else if (output?.content) {
      extractedText = output.content;
    } else {
      // Try to stringify and extract
      extractedText = JSON.stringify(output);
    }

    // Clean up the text
    extractedText = extractedText.trim();

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Complete!' });
    }

    // Calculate confidence (Bytez may not provide this, so estimate based on text length)
    const confidence = extractedText.length > 0 ? 95 : 0;

    // Return in format compatible with existing code
    return {
      data: {
        text: extractedText,
        confidence: confidence
      }
    };
  } catch (error) {
    console.error('Bytez OCR Error:', error);
    
    // Provide helpful error messages
    if (error.message?.includes('API key') || error.message?.includes('401')) {
      throw new Error('Invalid Bytez API key. Please check your API key.');
    } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
      throw new Error('Bytez API rate limit exceeded. Please try again later.');
    }
    
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
  const { apiKey = BYTEZ_API_KEY, progressCallback = null } = options;
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

      const result = await extractTextWithBytez(file, { apiKey, progressCallback });

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
  extractTextWithBytez,
  extractTextFromMultipleFiles,
  fileToBase64
};

