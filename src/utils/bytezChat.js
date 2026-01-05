import Bytez from "bytez.js";

const BYTEZ_API_KEY = import.meta.env?.VITE_BYTEZ_API_KEY || 'c693e970502c7ac513415efe7032958e';

let bytezSDK = null;
const getBytezSDK = () => {
  if (!bytezSDK) {
    bytezSDK = new Bytez(BYTEZ_API_KEY);
  }
  return bytezSDK;
};

/**
 * Simple chat function using Bytez SDK
 * @param {string|Array} messages - Single message string or array of message objects
 * @param {Object} options - Optional configuration
 * @param {string} options.modelId - Model ID to use (default: "meta-llama/llama-3.1-8b-instruct")
 * @returns {Promise<{error: any, output: any}>}
 */
export const chatWithBytez = async (messages, options = {}) => {
  const { modelId = "openai/gpt-4o-mini" } = options;

  try {
    const sdk = getBytezSDK();
    const model = sdk.model(modelId);

    // Handle different input formats
    let input;
    if (typeof messages === 'string') {
      // Simple string - use directly (this format works based on existing codebase)
      input = messages;
    } else if (Array.isArray(messages)) {
      // Chat format with roles
      // Try array format first, if it fails, convert to string
      input = messages;
    } else {
      throw new Error('Messages must be a string or an array of message objects');
    }

    // Run the model
    // Note: Based on your codebase, model.run() accepts string prompts
    // If array format doesn't work, we'll convert it to a string
    let { error, output } = await model.run(input);

    // If array format fails, try converting to string format
    if (error && Array.isArray(input)) {
      console.warn('Array format failed, trying string format...');
      const prompt = input
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n') + '\nAssistant:';
      
      const result = await model.run(prompt);
      error = result.error;
      output = result.output;
    }

    if (error) {
      console.error('Bytez chat error:', error);
      return { error, output: null };
    }

    return { error: null, output };
  } catch (error) {
    console.error('Chat error:', error);
    return { error: error.message || error, output: null };
  }
};

// Example usage:
// Simple string:
// const { error, output } = await chatWithBytez("Hello");
// console.log({ error, output });

// Chat format with roles:
// const { error, output } = await chatWithBytez([
//   { role: "user", content: "Hello" }
// ]);
// console.log({ error, output });

// With custom model:
// const { error, output } = await chatWithBytez("Hello", { 
//   modelId: "openai/gpt-4o-mini" 
// });

