/**
 * Document Summarizer — powered by Ollama VPS (Mistral) via local Flask server
 */

const AI_SERVER = `${import.meta.env.VITE_PYTHON_API || 'http://localhost:5000'}/api/ai`;

// ─── Summarize Document ───────────────────────────────────────────────────────
export const summarizeDocument = async (text, options = {}) => {
  const { length = 'medium', style = 'bullet', progressCallback = null } = options;

  if (!text || text.trim().length === 0) throw new Error('No text to summarize');

  try {
    if (progressCallback) progressCallback({ status: 'processing', progress: 10, message: 'Analyzing document...' });

    const response = await fetch(`${AI_SERVER}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, length, style })
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const result = await response.json();

    if (progressCallback) progressCallback({ status: 'complete', progress: 100, message: 'Summary complete!' });

    const summaryText = result.summary || '';
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

// ─── Extract Key Points ───────────────────────────────────────────────────────
export const extractKeyPoints = async (text, options = {}) => {
  const { maxPoints = 5, progressCallback = null } = options;

  if (!text || text.trim().length === 0) throw new Error('No text to analyze');

  try {
    if (progressCallback) progressCallback({ status: 'processing', progress: 10, message: 'Extracting key points...' });

    const response = await fetch(`${AI_SERVER}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `Extract the ${maxPoints} most important key points from the following document. Return them as a numbered list.\n\nDocument:\n${text}`,
        style: 'key-points',
        length: 'medium'
      })
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const result = await response.json();

    if (progressCallback) progressCallback({ status: 'complete', progress: 100, message: 'Key points extracted!' });

    const keyPointsText = result.summary || '';
    return {
      keyPoints: keyPointsText.trim(),
      count: (keyPointsText.match(/\d+\./g) || []).length || maxPoints
    };
  } catch (error) {
    console.error('Key points extraction error:', error);
    throw error;
  }
};
