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
 * Extract text content from model output
 * Handles different output formats including JSON with role/content structure
 */
const extractContent = (output) => {
  if (typeof output === 'string') {
    return output;
  }
  
  // Handle JSON format like {"role":"assistant","content":"..."}
  if (output?.content) {
    return output.content;
  }
  
  // Handle other common formats
  if (output?.text) {
    return output.text;
  }
  
  if (output?.summary) {
    return output.summary;
  }
  
  if (output?.answer) {
    return output.answer;
  }
  
  // Handle array of messages
  if (Array.isArray(output) && output.length > 0) {
    const lastMessage = output[output.length - 1];
    if (typeof lastMessage === 'string') {
      return lastMessage;
    }
    return lastMessage?.content || lastMessage?.text || '';
  }
  
  // Fallback: try to stringify and extract
  const outputStr = JSON.stringify(output);
  try {
    const parsed = JSON.parse(outputStr);
    return parsed.content || parsed.text || parsed.summary || outputStr;
  } catch {
    return outputStr;
  }
};

/**
 * Summarize document text
 */
export const summarizeDocument = async (text, options = {}) => {
  const { 
    length = 'medium', // short, medium, long
    style = 'bullet', // bullet, paragraph, key-points
    progressCallback = null 
  } = options;

  if (!text || text.trim().length === 0) {
    throw new Error('No text to summarize');
  }

  try {
    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 10, message: 'Analyzing document...' });
    }

    const sdk = getBytezSDK();
    // Use openai/gpt-4o-mini - already working in codebase for vision tasks
    // This model should work for text summarization as well
    const model = sdk.model('openai/gpt-4o-mini');

    const lengthInstructions = {
      short: 'in 2-3 sentences',
      medium: 'in a concise paragraph (4-6 sentences)',
      long: 'in detail (2-3 paragraphs)'
    };

    const styleInstructions = {
      bullet: 'as bullet points',
      paragraph: 'as a paragraph',
      'key-points': 'as key points'
    };

    const prompt = `Summarize the following document ${lengthInstructions[length]} ${styleInstructions[style]}. Focus on the main ideas and important information:\n\n${text}`;

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 50, message: 'Generating summary...' });
    }

    // Use messages array format for OpenAI models
    const { error, output } = await model.run([
      {
        role: "user",
        content: prompt
      }
    ]);

    if (error) {
      throw new Error(`Summarization error: ${error.message || error}`);
    }

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Summary complete!' });
    }

    // Extract summary text from output - handle different formats
    const summaryText = extractContent(output);

    return {
      summary: summaryText.trim(),
      length: text.length,
      summaryLength: summaryText.trim().length
    };
  } catch (error) {
    console.error('Summarization error:', error);
    throw error;
  }
};

/**
 * Extract key points from document
 */
export const extractKeyPoints = async (text, options = {}) => {
  const { maxPoints = 5, progressCallback = null } = options;

  if (!text || text.trim().length === 0) {
    throw new Error('No text to analyze');
  }

  try {
    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 10, message: 'Extracting key points...' });
    }

    const sdk = getBytezSDK();
    // Use openai/gpt-4o-mini - already working in codebase
    const model = sdk.model('openai/gpt-4o-mini');

    const prompt = `Extract the ${maxPoints} most important key points from the following document. Return them as a numbered list:\n\n${text}`;

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 50, message: 'Analyzing content...' });
    }

    // Use messages array format for OpenAI models
    const { error, output } = await model.run([
      {
        role: "user",
        content: prompt
      }
    ]);

    if (error) {
      throw new Error(`Key points extraction error: ${error.message || error}`);
    }

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Key points extracted!' });
    }

    // Extract key points text from output - handle different formats
    let keyPointsText = extractContent(output);
    
    // Also check for keyPoints field specifically
    if (output?.keyPoints && typeof output.keyPoints === 'string') {
      keyPointsText = output.keyPoints;
    }

    return {
      keyPoints: keyPointsText.trim(),
      count: (keyPointsText.match(/\d+\./g) || []).length || maxPoints
    };
  } catch (error) {
    console.error('Key points extraction error:', error);
    throw error;
  }
};

