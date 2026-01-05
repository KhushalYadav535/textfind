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
  
  if (output?.answer) {
    return output.answer;
  }
  
  if (output?.questions) {
    return output.questions;
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
    return parsed.content || parsed.text || parsed.answer || parsed.questions || outputStr;
  } catch {
    return outputStr;
  }
};

/**
 * Answer questions from document text
 */
export const answerQuestion = async (documentText, question, options = {}) => {
  const { progressCallback = null } = options;

  if (!documentText || documentText.trim().length === 0) {
    throw new Error('No document text provided');
  }

  if (!question || question.trim().length === 0) {
    throw new Error('No question provided');
  }

  try {
    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 10, message: 'Analyzing document and question...' });
    }

    const sdk = getBytezSDK();
    const model = sdk.model('openai/gpt-4o-mini'); // Use working model

    const prompt = `Based on the following document, answer this question. If the answer is not in the document, say "The answer is not found in the document."

Document:
${documentText}

Question: ${question}

Answer:`;

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 50, message: 'Generating answer...' });
    }

    // Use messages array format for OpenAI models
    const { error, output } = await model.run([
      {
        role: "user",
        content: prompt
      }
    ]);

    if (error) {
      throw new Error(`Question answering error: ${error.message || error}`);
    }

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Answer generated!' });
    }

    const answer = extractContent(output);

    return {
      answer: answer.trim(),
      question,
      hasAnswer: !answer.toLowerCase().includes('not found')
    };
  } catch (error) {
    console.error('Question answering error:', error);
    throw error;
  }
};

/**
 * Generate multiple questions from document
 */
export const generateQuestions = async (documentText, options = {}) => {
  const { count = 5, progressCallback = null } = options;

  if (!documentText || documentText.trim().length === 0) {
    throw new Error('No document text provided');
  }

  try {
    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 10, message: 'Analyzing document...' });
    }

    const sdk = getBytezSDK();
    const model = sdk.model('openai/gpt-4o-mini');

    const prompt = `Generate ${count} important questions that can be answered from the following document. Return them as a numbered list:\n\n${documentText}`;

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 50, message: 'Generating questions...' });
    }

    // Use messages array format for OpenAI models
    const { error, output } = await model.run([
      {
        role: "user",
        content: prompt
      }
    ]);

    if (error) {
      throw new Error(`Question generation error: ${error.message || error}`);
    }

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Questions generated!' });
    }

    const questions = extractContent(output);

    return {
      questions,
      count: (questions.match(/\d+\./g) || []).length || count
    };
  } catch (error) {
    console.error('Question generation error:', error);
    throw error;
  }
};

