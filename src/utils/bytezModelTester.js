/**
 * Bytez Model Tester - Test which models are available
 * Use this to find working models in Bytez catalog
 */

import Bytez from "bytez.js";

const BYTEZ_API_KEY = import.meta.env?.VITE_BYTEZ_API_KEY || 'c693e970502c7ac513415efe7032958e';

// Common model names to test
const MODELS_TO_TEST = [
  // OpenAI models
  'openai/gpt-4o-mini',
  'openai/gpt-4o',
  'openai/gpt-4-turbo',
  'openai/gpt-3.5-turbo',
  
  // Llama models (various formats)
  'meta-llama/llama-3.1-8b-instruct',
  'meta-llama/Llama-3.1-8B-Instruct',
  'llama-3.1-8b-instruct',
  'meta-llama/llama-3-8b-instruct',
  'meta-llama/llama-2-7b-chat',
  
  // Other common models
  'mistralai/mistral-7b-instruct',
  'google/gemini-pro',
  'anthropic/claude-3-haiku',
];

/**
 * Test if a model is available
 */
export const testModel = async (modelId) => {
  try {
    const sdk = new Bytez(BYTEZ_API_KEY);
    const model = sdk.model(modelId);
    
    // Try a simple prompt
    const { error, output } = await model.run("Hello");
    
    if (error) {
      return { available: false, error: error.message || error };
    }
    
    return { available: true, output };
  } catch (error) {
    return { available: false, error: error.message || error };
  }
};

/**
 * Test multiple models and return available ones
 */
export const findAvailableModels = async () => {
  const results = [];
  
  for (const modelId of MODELS_TO_TEST) {
    console.log(`Testing model: ${modelId}...`);
    const result = await testModel(modelId);
    results.push({
      modelId,
      ...result
    });
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const available = results.filter(r => r.available);
  const unavailable = results.filter(r => !r.available);
  
  console.log('\n=== Available Models ===');
  available.forEach(r => console.log(`✅ ${r.modelId}`));
  
  console.log('\n=== Unavailable Models ===');
  unavailable.forEach(r => console.log(`❌ ${r.modelId}: ${r.error}`));
  
  return {
    available,
    unavailable,
    all: results
  };
};

// Export for use in browser console or testing
if (typeof window !== 'undefined') {
  window.bytezModelTester = {
    testModel,
    findAvailableModels,
    MODELS_TO_TEST
  };
}

