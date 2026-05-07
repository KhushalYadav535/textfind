/**
 * Question Answering — powered by Groq (Llama 3.3 70B) via Flask /api/ai/qa
 */

const AI_SERVER = `${import.meta.env.VITE_PYTHON_API || 'http://localhost:5000'}/api`;

export const answerQuestion = async (documentText, question, options = {}) => {
  const { progressCallback = null } = options;

  if (!documentText?.trim()) throw new Error('No document text');
  if (!question?.trim()) throw new Error('No question provided');

  if (progressCallback) progressCallback({ status: 'processing', progress: 20, message: 'Sending to Groq AI...' });

  const response = await fetch(`${AI_SERVER}/ai/qa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: documentText, question })
  });

  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  const result = await response.json();

  if (progressCallback) progressCallback({ status: 'complete', progress: 100, message: 'Answer ready!' });

  return { answer: result.answer || 'No answer found.' };
};

export const generateQuestions = async (documentText, options = {}) => {
  const { count = 5, progressCallback = null } = options;

  if (!documentText?.trim()) throw new Error('No document text');

  if (progressCallback) progressCallback({ status: 'processing', progress: 20, message: 'Generating questions...' });

  const response = await fetch(`${AI_SERVER}/ai/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `Generate ${count} thoughtful questions about this document. Number them 1-${count}.\n\nDocument:\n${documentText}`,
      style: 'key-points',
      length: 'short'
    })
  });

  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  const result = await response.json();

  if (progressCallback) progressCallback({ status: 'complete', progress: 100, message: 'Questions generated!' });

  return { questions: result.summary || '' };
};
