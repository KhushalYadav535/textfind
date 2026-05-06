/**
 * Image Text Chat — uses local PaddleOCR (Flask) for OCR + Groq for chat
 * Image analysis via text: first extract text from image, then chat about it
 */

const AI_SERVER = 'http://localhost:5000/api';

const imageToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result.split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export const chatWithImage = async (imageFile, question, options = {}) => {
  const { progressCallback = null } = options;

  if (!imageFile) throw new Error('No image provided');
  if (!question?.trim()) throw new Error('No question');

  if (progressCallback) progressCallback({ status: 'extracting', progress: 20, message: 'Extracting text from image...' });

  // Step 1: Extract text using local PaddleOCR
  const base64 = await imageToBase64(imageFile);
  const ocrRes = await fetch(`${AI_SERVER}/extract-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64, lang: 'en' })
  });

  let extractedText = '';
  if (ocrRes.ok) {
    const ocrData = await ocrRes.json();
    extractedText = ocrData.text || '';
  }

  if (progressCallback) progressCallback({ status: 'analyzing', progress: 60, message: 'Asking Groq AI...' });

  // Step 2: Answer question about extracted text
  const qaRes = await fetch(`${AI_SERVER}/ai/qa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: extractedText || `[No text could be extracted from image. The question was: ${question}]`,
      question
    })
  });

  if (!qaRes.ok) throw new Error(`Server error: ${qaRes.status}`);
  const result = await qaRes.json();

  if (progressCallback) progressCallback({ status: 'complete', progress: 100, message: 'Done!' });

  return { response: result.answer || 'Could not generate a response.' };
};

export const describeImage = async (imageFile, options = {}) => {
  const { progressCallback = null } = options;

  if (!imageFile) throw new Error('No image provided');

  if (progressCallback) progressCallback({ status: 'extracting', progress: 30, message: 'Extracting text...' });

  const base64 = await imageToBase64(imageFile);
  const ocrRes = await fetch(`${AI_SERVER}/extract-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64, lang: 'en' })
  });

  let extractedText = '';
  if (ocrRes.ok) {
    const ocrData = await ocrRes.json();
    extractedText = ocrData.text || '';
  }

  if (progressCallback) progressCallback({ status: 'analyzing', progress: 60, message: 'Generating description...' });

  const sumRes = await fetch(`${AI_SERVER}/ai/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: extractedText || 'No text found in image.',
      style: 'paragraph',
      length: 'short'
    })
  });

  const result = await sumRes.json();
  if (progressCallback) progressCallback({ status: 'complete', progress: 100, message: 'Done!' });

  return { description: result.summary || extractedText || 'No content detected in image.' };
};

export const extractTextFromImageVision = async (imageFile, options = {}) => {
  const { progressCallback = null } = options;

  if (!imageFile) throw new Error('No image provided');

  if (progressCallback) progressCallback({ status: 'extracting', progress: 30, message: 'Running OCR...' });

  const base64 = await imageToBase64(imageFile);
  const res = await fetch(`${AI_SERVER}/extract-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64, lang: 'en' })
  });

  if (!res.ok) throw new Error(`OCR error: ${res.status}`);
  const data = await res.json();

  if (progressCallback) progressCallback({ status: 'complete', progress: 100, message: 'Text extracted!' });

  return { text: data.text || 'No text found.' };
};
