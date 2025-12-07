/**
 * Amazon Nova 2 Lite OCR Client - Uses n8n webhook to process images and PDFs with Amazon Nova 2 Lite via OpenRouter
 */

// Configuration - Get from environment variables
const NOVA_WEBHOOK_URL = import.meta.env?.VITE_NOVA_WEBHOOK_URL || 'https://n8n.srv980418.hstgr.cloud/webhook-test/nova-ocr';
const NOVA_API_KEY = import.meta.env?.VITE_NOVA_API_KEY || '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';

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
 * Extract text from image or PDF using Amazon Nova 2 Lite OCR via n8n webhook
 * @param {File|Blob} file - Image or PDF file
 * @param {Object} options - OCR options
 * @param {string} options.apiKey - OpenRouter API key (optional, uses default if not provided)
 * @param {Function} options.progressCallback - Progress callback function
 * @returns {Promise<Object>} OCR result with text and confidence
 */
export const extractTextWithAmazonNova = async (file, options = {}) => {
  const { apiKey = NOVA_API_KEY, progressCallback = null } = options;

  if (!apiKey) {
    throw new Error('Amazon Nova API key is required. Please set VITE_NOVA_API_KEY environment variable or provide apiKey in options.');
  }

  try {
    // Update progress
    if (progressCallback) {
      progressCallback({ status: 'converting', progress: 10, message: 'Converting file to base64...' });
    }

    // Convert file to base64
    const base64Data = await fileToBase64(file);

    if (progressCallback) {
      progressCallback({ status: 'uploading', progress: 30, message: 'Sending to Amazon Nova 2 Lite OCR...' });
    }

    // Determine mime type based on file type
    let mimeType = 'image/jpeg'; // default
    if (file instanceof File || file instanceof Blob) {
      if (file.type) {
        if (file.type.startsWith('image/')) {
          // Map image types correctly
          if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            mimeType = 'image/jpeg';
          } else if (file.type === 'image/png') {
            mimeType = 'image/png';
          } else if (file.type === 'image/webp') {
            mimeType = 'image/webp';
          } else {
            mimeType = file.type; // Use the file's actual type
          }
        } else if (file.type === 'application/pdf') {
          mimeType = 'application/pdf';
        }
      }
    }

    // Prepare payload for webhook (matching n8n workflow structure)
    const payload = {
      image: base64Data, // Using 'image' field as per n8n workflow
      apiKey: apiKey,
      fileType: mimeType // Add fileType to help n8n workflow
    };

    // Determine the webhook URL (use proxy in development to avoid CORS)
    const isDev = import.meta.env.DEV || (typeof window !== 'undefined' && window.location.hostname === 'localhost');
    
    // Use proxy in development to avoid CORS issues
    let webhookUrl = NOVA_WEBHOOK_URL;
    if (isDev && NOVA_WEBHOOK_URL.includes('n8n.srv980418.hstgr.cloud')) {
      webhookUrl = '/api/nova-ocr';
    }

    console.log('Using webhook URL:', webhookUrl, '(Development:', isDev, ')');

    // Call n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 70, message: 'Processing with Amazon Nova 2 Lite...' });
    }

    // Check response status
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${errorText || 'Unknown error'}`;
      
      if (response.status === 404) {
        errorMessage += '\n\n⚠️ Webhook not found in n8n. Please check:';
        errorMessage += '\n1. Open your n8n workflow and make sure it is ACTIVE (not in test mode)';
        errorMessage += '\n2. Click "Execute workflow" button if you see test mode message';
        errorMessage += '\n3. Verify the webhook path in n8n matches: /webhook-test/nova-ocr';
        errorMessage += '\n4. Or try using webhook ID format: /webhook/{webhook-id}';
        errorMessage += '\n5. Current webhook URL: ' + NOVA_WEBHOOK_URL;
        
        // Try to parse n8n error message
        try {
          const n8nError = JSON.parse(errorText);
          if (n8nError.message) {
            errorMessage += '\n\nn8n Error: ' + n8nError.message;
          }
          if (n8nError.hint) {
            errorMessage += '\nHint: ' + n8nError.hint;
          }
        } catch (e) {
          // Not JSON, ignore
        }
      }
      
      throw new Error(errorMessage);
    }

    // Get response text first to check if it's empty
    const responseText = await response.text();
    
    if (!responseText || responseText.trim().length === 0) {
      throw new Error('Empty response from webhook. Please check n8n workflow configuration.');
    }

    // Try to parse JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Response text:', responseText);
      throw new Error(`Invalid JSON response from webhook: ${parseError.message}. Response: ${responseText.substring(0, 200)}`);
    }

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Complete!' });
    }

    // Check if request was successful
    if (!result || (result.success === false)) {
      throw new Error(result?.error || result?.message || 'OCR processing failed');
    }

    // Extract text from response
    const extractedText = result.extractedText || result.text || '';

    // Return in format compatible with existing code
    return {
      data: {
        text: extractedText,
        confidence: extractedText.length > 0 ? 95 : 0 // Amazon Nova doesn't return confidence, so we estimate
      }
    };
  } catch (error) {
    console.error('Amazon Nova 2 Lite OCR Error:', error);
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
  const { apiKey = NOVA_API_KEY, progressCallback = null } = options;
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

      const result = await extractTextWithAmazonNova(file, { apiKey, progressCallback });

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
  extractTextWithAmazonNova,
  extractTextFromMultipleFiles,
  fileToBase64
};

