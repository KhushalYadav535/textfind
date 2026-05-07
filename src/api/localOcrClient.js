/**
 * Local OCR Client - Uses python-backend (MinerU + PaddleOCR)
 * Falls back gracefully when server is unreachable or blocked (Mixed Content).
 */

const LOCAL_SERVER_URL = `${import.meta.env.VITE_PYTHON_API || 'http://localhost:5000'}/api`;

// How long to wait for the Python backend before giving up (ms)
const FETCH_TIMEOUT_MS = 5000;

/**
 * Fetch wrapper with timeout — prevents indefinite hangs when server is down/blocked.
 */
const fetchWithTimeout = (url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
};

/**
 * Extract text from image using local PaddleOCR
 * @param {File|Blob} file - Image file
 * @param {Object} options - OCR options
 * @returns {Promise<Object>} OCR result with text and confidence
 */
export const extractTextFromImage = async (file, options = {}) => {
  const { progressCallback = null } = options;

  try {
    if (progressCallback) {
      progressCallback({ status: 'uploading', progress: 30, message: 'Sending to local PaddleOCR...' });
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetchWithTimeout(`${LOCAL_SERVER_URL}/extract-image`, {
      method: 'POST',
      body: formData,
    });

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 80, message: 'Processing image...' });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'PaddleOCR processing failed');
    }

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Complete!' });
    }

    return {
      data: {
        text: result.text || '',
        confidence: result.confidence || 95
      }
    };
  } catch (error) {
    console.error('Local PaddleOCR Error:', error);
    throw new Error(`Failed to extract text using local PaddleOCR: ${error.message}`);
  }
};

/**
 * Extract text from PDF using local MinerU (magic-pdf)
 * @param {File|Blob} file - PDF file
 * @param {Object} options - OCR options
 * @returns {Promise<Object>} OCR result with text and confidence
 */
export const extractTextFromPDF = async (file, options = {}) => {
  const { progressCallback = null } = options;

  try {
    if (progressCallback) {
      progressCallback({ status: 'uploading', progress: 30, message: 'Sending PDF to local MinerU...' });
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetchWithTimeout(`${LOCAL_SERVER_URL}/extract-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 80, message: 'MinerU layout extraction...' });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'MinerU processing failed');
    }

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Complete!' });
    }

    return {
      data: {
        text: result.text || '',
        confidence: result.confidence || 95
      }
    };
  } catch (error) {
    console.error('Local MinerU Error:', error);
    throw new Error(`Failed to extract text using local MinerU: ${error.message}`);
  }
};

export default {
  extractTextFromImage,
  extractTextFromPDF
};
