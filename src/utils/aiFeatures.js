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
  
  if (output?.entities) {
    return output.entities;
  }
  
  if (output?.sentiment) {
    return output.sentiment;
  }
  
  if (output?.title) {
    return output.title;
  }
  
  if (output?.improved) {
    return output.improved;
  }
  
  if (output?.table || output?.tableData) {
    return output.table || output.tableData;
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
    return parsed.content || parsed.text || parsed.entities || parsed.sentiment || parsed.title || parsed.improved || parsed.table || parsed.tableData || outputStr;
  } catch {
    return outputStr;
  }
};

/**
 * Extract entities (names, dates, locations, etc.) from text
 */
export const extractEntities = async (text, options = {}) => {
  const { progressCallback = null } = options;

  if (!text || text.trim().length === 0) {
    throw new Error('No text provided');
  }

  try {
    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 10, message: 'Extracting entities...' });
    }

    const sdk = getBytezSDK();
    const model = sdk.model('openai/gpt-4o-mini');

    const prompt = `Extract all important entities from the following text. Identify:
- Person names
- Organization names
- Locations/Places
- Dates
- Email addresses
- Phone numbers
- URLs
- Important keywords

Return the result as a structured list with categories.

Text:
${text}`;

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 50, message: 'Analyzing...' });
    }

    // Use messages array format for OpenAI models
    const { error, output } = await model.run([
      {
        role: "user",
        content: prompt
      }
    ]);

    if (error) {
      throw new Error(`Entity extraction error: ${error.message || error}`);
    }

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Entities extracted!' });
    }

    const entities = extractContent(output);

    return {
      entities: entities.trim()
    };
  } catch (error) {
    console.error('Entity extraction error:', error);
    throw error;
  }
};

/**
 * Sentiment analysis
 */
export const analyzeSentiment = async (text, options = {}) => {
  const { progressCallback = null } = options;

  if (!text || text.trim().length === 0) {
    throw new Error('No text provided');
  }

  try {
    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 10, message: 'Analyzing sentiment...' });
    }

    const sdk = getBytezSDK();
    const model = sdk.model('openai/gpt-4o-mini');

    const prompt = `Analyze the sentiment of the following text. Determine if it is:
- Positive
- Negative
- Neutral

Also provide a brief explanation (1-2 sentences).

Text:
${text}`;

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 50, message: 'Processing...' });
    }

    // Use messages array format for OpenAI models
    const { error, output } = await model.run([
      {
        role: "user",
        content: prompt
      }
    ]);

    if (error) {
      throw new Error(`Sentiment analysis error: ${error.message || error}`);
    }

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Analysis complete!' });
    }

    const analysis = extractContent(output);

    return {
      analysis: analysis.trim()
    };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    throw error;
  }
};

/**
 * Generate document title
 */
export const generateTitle = async (text, options = {}) => {
  const { progressCallback = null } = options;

  if (!text || text.trim().length === 0) {
    throw new Error('No text provided');
  }

  try {
    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 10, message: 'Generating title...' });
    }

    const sdk = getBytezSDK();
    const model = sdk.model('openai/gpt-4o-mini');

    const prompt = `Generate a concise, descriptive title (maximum 10 words) for the following document:

${text}

Title:`;

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 50, message: 'Creating title...' });
    }

    // Use messages array format for OpenAI models
    const { error, output } = await model.run([
      {
        role: "user",
        content: prompt
      }
    ]);

    if (error) {
      throw new Error(`Title generation error: ${error.message || error}`);
    }

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Title generated!' });
    }

    const title = extractContent(output);

    return {
      title: title.trim().replace(/^["']|["']$/g, '') // Remove quotes
    };
  } catch (error) {
    console.error('Title generation error:', error);
    throw error;
  }
};

/**
 * Improve/rewrite text
 */
export const improveText = async (text, options = {}) => {
  const { style = 'professional', progressCallback = null } = options;

  if (!text || text.trim().length === 0) {
    throw new Error('No text provided');
  }

  try {
    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 10, message: 'Improving text...' });
    }

    const sdk = getBytezSDK();
    const model = sdk.model('openai/gpt-4o-mini');

    const styleInstructions = {
      professional: 'in a professional, formal style',
      casual: 'in a casual, friendly style',
      academic: 'in an academic, scholarly style',
      simple: 'in simple, easy-to-understand language'
    };

    const prompt = `Rewrite the following text ${styleInstructions[style]}. Improve grammar, clarity, and flow while preserving the original meaning:

${text}`;

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 50, message: 'Rewriting...' });
    }

    // Use messages array format for OpenAI models
    const { error, output } = await model.run([
      {
        role: "user",
        content: prompt
      }
    ]);

    if (error) {
      throw new Error(`Text improvement error: ${error.message || error}`);
    }

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Text improved!' });
    }

    const improved = extractContent(output);

    return {
      improved: improved.trim(),
      original: text
    };
  } catch (error) {
    console.error('Text improvement error:', error);
    throw error;
  }
};

/**
 * Extract table data from text
 */
export const extractTableData = async (text, options = {}) => {
  const { progressCallback = null } = options;

  if (!text || text.trim().length === 0) {
    throw new Error('No text provided');
  }

  try {
    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 10, message: 'Extracting table data...' });
    }

    const sdk = getBytezSDK();
    const model = sdk.model('openai/gpt-4o-mini');

    const prompt = `Extract any tabular data from the following text. If tables are present, format them as CSV. If no tables, return "No table data found":

${text}`;

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 50, message: 'Analyzing...' });
    }

    // Use messages array format for OpenAI models
    const { error, output } = await model.run([
      {
        role: "user",
        content: prompt
      }
    ]);

    if (error) {
      throw new Error(`Table extraction error: ${error.message || error}`);
    }

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Table data extracted!' });
    }

    const tableData = extractContent(output);

    return {
      tableData: tableData.trim(),
      hasTable: !tableData.toLowerCase().includes('no table')
    };
  } catch (error) {
    console.error('Table extraction error:', error);
    throw error;
  }
};

