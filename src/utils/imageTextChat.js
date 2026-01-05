import Bytez from 'bytez.js';

const BYTEZ_API_KEY = import.meta.env?.VITE_BYTEZ_API_KEY || 'c693e970502c7ac513415efe7032958e';

let bytezSDK = null;
const getBytezSDK = () => {
  if (!bytezSDK) {
    bytezSDK = new Bytez(BYTEZ_API_KEY);
  }
  return bytezSDK;
};

/**
 * Chat with image - Ask questions about image content
 */
export const chatWithImage = async (imageFile, question, options = {}) => {
  const { progressCallback = null } = options;

  if (!imageFile) {
    throw new Error('No image provided');
  }

  if (!question || question.trim().length === 0) {
    throw new Error('No question provided');
  }

  try {
    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 10, message: 'Processing image...' });
    }

    // Convert image to base64
    const imageDataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 30, message: 'Analyzing image...' });
    }

    const sdk = getBytezSDK();
    // Use vision model for image understanding
    const model = sdk.model('openai/gpt-4o-mini'); // Vision-capable model

    const prompt = `You are analyzing an image. Answer the following question about the image content. Be specific and detailed.

Question: ${question}

Answer based on what you see in the image:`;

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 50, message: 'Generating response...' });
    }

    const { error, output } = await model.run({
      image: imageDataUrl,
      prompt: prompt
    });

    if (error) {
      throw new Error(`Image chat error: ${error.message || error}`);
    }

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Response generated!' });
    }

    const response = typeof output === 'string' ? output : (output?.response || output?.text || output?.answer || JSON.stringify(output));

    return {
      response: response.trim(),
      question
    };
  } catch (error) {
    console.error('Image chat error:', error);
    throw error;
  }
};

/**
 * Describe image content
 */
export const describeImage = async (imageFile, options = {}) => {
  const { detail = 'medium', progressCallback = null } = options;

  if (!imageFile) {
    throw new Error('No image provided');
  }

  try {
    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 10, message: 'Processing image...' });
    }

    // Convert image to base64
    const imageDataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 30, message: 'Analyzing image...' });
    }

    const sdk = getBytezSDK();
    const model = sdk.model('openai/gpt-4o-mini');

    const detailInstructions = {
      brief: 'briefly',
      medium: 'in detail',
      comprehensive: 'comprehensively with all details'
    };

    const prompt = `Describe this image ${detailInstructions[detail]}. Include what you see, any text in the image, objects, people, colors, layout, and context.`;

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 50, message: 'Generating description...' });
    }

    const { error, output } = await model.run({
      image: imageDataUrl,
      prompt: prompt
    });

    if (error) {
      throw new Error(`Image description error: ${error.message || error}`);
    }

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Description generated!' });
    }

    const description = typeof output === 'string' ? output : (output?.description || output?.text || JSON.stringify(output));

    return {
      description: description.trim()
    };
  } catch (error) {
    console.error('Image description error:', error);
    throw error;
  }
};

/**
 * Extract text from image using vision model
 */
export const extractTextFromImageVision = async (imageFile, options = {}) => {
  const { progressCallback = null } = options;

  if (!imageFile) {
    throw new Error('No image provided');
  }

  try {
    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 10, message: 'Processing image...' });
    }

    // Convert image to base64
    const imageDataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 30, message: 'Extracting text from image...' });
    }

    const sdk = getBytezSDK();
    const model = sdk.model('openai/gpt-4o-mini');

    const prompt = `Extract all text from this image. Return ONLY the text content, preserving line breaks and structure. Do not add any explanation or additional text.`;

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 50, message: 'Reading text...' });
    }

    const { error, output } = await model.run({
      image: imageDataUrl,
      prompt: prompt
    });

    if (error) {
      throw new Error(`Text extraction error: ${error.message || error}`);
    }

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Text extracted!' });
    }

    const extractedText = typeof output === 'string' ? output : (output?.text || output?.extractedText || JSON.stringify(output));

    return {
      text: extractedText.trim(),
      confidence: extractedText.length > 0 ? 95 : 0
    };
  } catch (error) {
    console.error('Image text extraction error:', error);
    throw error;
  }
};

