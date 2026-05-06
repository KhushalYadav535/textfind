/**
 * AI Features — powered by Groq (Llama 3.3 70B) via local Flask server
 * Endpoints: /api/ai/summarize, /api/ai/qa, /api/ai/entities, /api/ai/improve, /api/ai/translate
 */

const AI_SERVER = 'http://localhost:5000/api/ai';

// ─── Entity Extraction ────────────────────────────────────────────────────────
export const extractEntities = async (text, options = {}) => {
  const { progressCallback = null } = options;

  if (!text || text.trim().length === 0) throw new Error('No text provided');

  try {
    if (progressCallback) progressCallback({ status: 'processing', progress: 10, message: 'Extracting entities...' });

    const response = await fetch(`${AI_SERVER}/entities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const result = await response.json();

    if (progressCallback) progressCallback({ status: 'complete', progress: 100, message: 'Entities extracted!' });

    return { entities: result.entities || '' };
  } catch (error) {
    console.error('Entity extraction error:', error);
    throw error;
  }
};

// ─── Sentiment Analysis ───────────────────────────────────────────────────────
export const analyzeSentiment = async (text, options = {}) => {
  const { progressCallback = null } = options;

  if (!text || text.trim().length === 0) throw new Error('No text provided');

  try {
    if (progressCallback) progressCallback({ status: 'processing', progress: 10, message: 'Analyzing sentiment...' });

    // Use summarize endpoint with sentiment prompt
    const response = await fetch(`${AI_SERVER}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `Analyze the sentiment of the following text. Determine if it is Positive, Negative, or Neutral. Also provide a brief explanation (1-2 sentences).\n\nText:\n${text}`,
        style: 'paragraph',
        length: 'short'
      })
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const result = await response.json();

    if (progressCallback) progressCallback({ status: 'complete', progress: 100, message: 'Analysis complete!' });

    return { analysis: result.summary || '' };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    throw error;
  }
};

// ─── Generate Title ───────────────────────────────────────────────────────────
export const generateTitle = async (text, options = {}) => {
  const { progressCallback = null } = options;

  if (!text || text.trim().length === 0) throw new Error('No text provided');

  try {
    if (progressCallback) progressCallback({ status: 'processing', progress: 10, message: 'Generating title...' });

    const response = await fetch(`${AI_SERVER}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `Generate a concise, descriptive title (maximum 10 words) for the following document. Return ONLY the title, no explanation.\n\nDocument:\n${text}`,
        style: 'paragraph',
        length: 'short'
      })
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const result = await response.json();

    if (progressCallback) progressCallback({ status: 'complete', progress: 100, message: 'Title generated!' });

    const title = (result.summary || '').replace(/^["']|["']$/g, '').split('\n')[0].trim();
    return { title };
  } catch (error) {
    console.error('Title generation error:', error);
    throw error;
  }
};

// ─── Improve Text ─────────────────────────────────────────────────────────────
export const improveText = async (text, options = {}) => {
  const { style = 'professional', progressCallback = null } = options;

  if (!text || text.trim().length === 0) throw new Error('No text provided');

  try {
    if (progressCallback) progressCallback({ status: 'processing', progress: 10, message: 'Improving text...' });

    const response = await fetch(`${AI_SERVER}/improve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, style })
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const result = await response.json();

    if (progressCallback) progressCallback({ status: 'complete', progress: 100, message: 'Text improved!' });

    return { improved: result.improved || '', original: text };
  } catch (error) {
    console.error('Text improvement error:', error);
    throw error;
  }
};

// ─── Extract Table Data ───────────────────────────────────────────────────────
export const extractTableData = async (text, options = {}) => {
  const { progressCallback = null } = options;

  if (!text || text.trim().length === 0) throw new Error('No text provided');

  try {
    if (progressCallback) progressCallback({ status: 'processing', progress: 10, message: 'Extracting table data...' });

    const response = await fetch(`${AI_SERVER}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `Extract any tabular data from the following text. If tables are present, format them as CSV. If no tables exist, return "No table data found".\n\nText:\n${text}`,
        style: 'paragraph',
        length: 'medium'
      })
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const result = await response.json();

    if (progressCallback) progressCallback({ status: 'complete', progress: 100, message: 'Table data extracted!' });

    const tableData = result.summary || '';
    return { tableData, hasTable: !tableData.toLowerCase().includes('no table') };
  } catch (error) {
    console.error('Table extraction error:', error);
    throw error;
  }
};
