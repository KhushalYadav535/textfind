/**
 * TextVision API Client
 * Official JavaScript SDK for TextVision OCR API
 * 
 * @version 1.0.0
 * @author TextVision Team
 */

class TextVisionAPI {
  constructor(apiKey, baseURL = 'https://api.textvision.ai/v1') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  /**
   * Extract text from an image using OCR
   * @param {Object} options - OCR options
   * @param {string} options.image_url - URL of the image to process
   * @param {string[]} options.languages - Array of language codes (e.g., ['eng', 'hin'])
   * @param {Object} options.options - Additional processing options
   * @param {number} options.options.confidence_threshold - Minimum confidence threshold (0-100)
   * @param {boolean} options.options.preprocessing - Enable image preprocessing
   * @param {boolean} options.options.batch_mode - Enable batch processing
   * @returns {Promise<Object>} OCR result with extracted text and metadata
   */
  async extractText({
    image_url,
    languages = ['eng'],
    options = {
      confidence_threshold: 80,
      preprocessing: true,
      batch_mode: false
    }
  }) {
    try {
      const response = await fetch(`${this.baseURL}/ocr`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_url,
          languages,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('TextVision API Error:', error);
      throw error;
    }
  }

  /**
   * Process multiple images in batch
   * @param {Object} options - Batch processing options
   * @param {Array} options.images - Array of image URLs
   * @param {string[]} options.languages - Array of language codes
   * @param {Object} options.options - Additional processing options
   * @returns {Promise<Object>} Batch processing result
   */
  async batchProcess({
    images,
    languages = ['eng'],
    options = {
      confidence_threshold: 80,
      preprocessing: true
    }
  }) {
    try {
      const response = await fetch(`${this.baseURL}/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          images,
          languages,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('TextVision Batch API Error:', error);
      throw error;
    }
  }

  /**
   * Upload and process a file directly
   * @param {File} file - File object to upload
   * @param {string[]} languages - Array of language codes
   * @param {Object} options - Additional processing options
   * @returns {Promise<Object>} OCR result
   */
  async uploadAndProcess(file, languages = ['eng'], options = {}) {
    try {
      // First upload the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('languages', JSON.stringify(languages));
      formData.append('options', JSON.stringify(options));

      const uploadResponse = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed! status: ${uploadResponse.status}`);
      }

      const result = await uploadResponse.json();
      return result;
    } catch (error) {
      console.error('TextVision Upload Error:', error);
      throw error;
    }
  }

  /**
   * Get API usage statistics
   * @returns {Promise<Object>} Usage statistics
   */
  async getUsage() {
    try {
      const response = await fetch(`${this.baseURL}/usage`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('TextVision Usage API Error:', error);
      throw error;
    }
  }

  /**
   * Get supported languages
   * @returns {Promise<Object>} List of supported languages
   */
  async getSupportedLanguages() {
    try {
      const response = await fetch(`${this.baseURL}/languages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('TextVision Languages API Error:', error);
      throw error;
    }
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextVisionAPI;
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return TextVisionAPI;
  });
} else {
  window.TextVisionAPI = TextVisionAPI;
}

// Example usage:
/*
// Initialize the client
const client = new TextVisionAPI('your-api-key-here');

// Extract text from an image
client.extractText({
  image_url: 'https://example.com/image.jpg',
  languages: ['eng', 'hin'],
  options: {
    confidence_threshold: 85,
    preprocessing: true
  }
}).then(result => {
  console.log('Extracted text:', result.extracted_text);
  console.log('Confidence:', result.confidence);
}).catch(error => {
  console.error('Error:', error);
});

// Batch process multiple images
client.batchProcess({
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg'
  ],
  languages: ['eng'],
  options: {
    confidence_threshold: 80
  }
}).then(results => {
  console.log('Batch results:', results);
});

// Upload and process a file
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

client.uploadAndProcess(file, ['eng'], {
  confidence_threshold: 90
}).then(result => {
  console.log('Upload result:', result);
});
*/
