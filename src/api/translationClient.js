/**
 * Translation Client — MyMemory API (Free, No Key, <1 second response)
 * Falls back to Ollama VPS for unsupported language pairs
 * MyMemory supports: Hindi, English, Spanish, French, German, Chinese, Japanese, etc.
 */

import { containsHindiText } from '../utils/hindiTextProcessor.js';

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';
const AI_SERVER = 'http://localhost:5000/api';

// Language code to name mapping
const LANGUAGE_NAMES = {
  'en': 'English', 'hi': 'Hindi', 'es': 'Spanish', 'fr': 'French',
  'de': 'German', 'zh': 'Chinese', 'ja': 'Japanese', 'ko': 'Korean',
  'ar': 'Arabic', 'pt': 'Portuguese', 'ru': 'Russian', 'it': 'Italian',
  'nl': 'Dutch', 'pl': 'Polish', 'tr': 'Turkish', 'vi': 'Vietnamese',
  'th': 'Thai', 'id': 'Indonesian',
};

/**
 * Detect if text is primarily Hindi or English
 */
export const detectLanguage = (text) => {
  if (!text || text.trim().length === 0) {
    return { isHindi: false, isEnglish: false, confidence: 0 };
  }
  const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const totalChars = text.length;
  const hindiPercentage = (hindiChars / totalChars) * 100;
  const englishPercentage = (englishChars / totalChars) * 100;
  const isHindi = hindiPercentage > 10;
  const isEnglish = !isHindi && englishPercentage > 20;
  return {
    isHindi, isEnglish,
    confidence: isHindi ? hindiPercentage : (isEnglish ? englishPercentage : 0),
    hindiPercentage, englishPercentage
  };
};

/**
 * Translate a single chunk using MyMemory API (free, fast, no auth)
 * MyMemory limit: 500 chars per request, so we chunk accordingly
 */
const translateChunk = async (chunk, fromLang, toLang) => {
  const langPair = `${fromLang}|${toLang}`;
  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(chunk)}&langpair=${langPair}`;

  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`MyMemory error: ${response.status}`);

  const data = await response.json();

  // responseStatus 200 = OK, 429 = quota exceeded
  if (data.responseStatus === 429) {
    throw new Error('MyMemory daily quota exceeded (5000 chars/day free). Try again tomorrow.');
  }

  const translated = data.responseData?.translatedText || chunk;

  // MyMemory sometimes returns "MYMEMORY WARNING" when quota is low
  if (translated.includes('MYMEMORY WARNING')) {
    throw new Error('MyMemory quota exceeded for today.');
  }

  return translated;
};

/**
 * Translate text using MyMemory API with chunking for long texts
 */
export const translateText = async (text, options = {}) => {
  const { fromLang = null, toLang = null, progressCallback = null } = options;

  if (!text || text.trim().length === 0) return text;

  // Auto-detect language if not specified
  let sourceLang = fromLang;
  let targetLang = toLang;
  if (!sourceLang || !targetLang) {
    const detected = detectLanguage(text);
    sourceLang = detected.isHindi ? 'hi' : 'en';
    targetLang = detected.isHindi ? 'en' : 'hi';
  }

  const fromLangName = LANGUAGE_NAMES[sourceLang] || sourceLang;
  const toLangName = LANGUAGE_NAMES[targetLang] || targetLang;

  if (progressCallback) {
    progressCallback({ status: 'translating', progress: 10, message: `Translating to ${toLangName}...` });
  }

  try {
    // MyMemory: max 500 chars per request
    const CHUNK_SIZE = 450;
    const chunks = [];
    // Split on sentence boundaries when possible
    const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > CHUNK_SIZE) {
        if (currentChunk) chunks.push(currentChunk.trim());
        // If single sentence > CHUNK_SIZE, split it hard
        if (sentence.length > CHUNK_SIZE) {
          for (let i = 0; i < sentence.length; i += CHUNK_SIZE) {
            chunks.push(sentence.substring(i, i + CHUNK_SIZE));
          }
          currentChunk = '';
        } else {
          currentChunk = sentence;
        }
      } else {
        currentChunk += sentence;
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());

    const translatedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      if (progressCallback) {
        const progress = 10 + Math.round((i / chunks.length) * 85);
        progressCallback({ status: 'translating', progress, message: `Translating ${i + 1}/${chunks.length}...` });
      }

      const translated = await translateChunk(chunks[i], sourceLang, targetLang);
      translatedChunks.push(translated);

      // Small delay to avoid rate limiting
      if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 200));
    }

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Translation complete!' });
    }

    return translatedChunks.join(' ');

  } catch (error) {
    // Fallback to Ollama VPS if MyMemory fails
    console.warn('MyMemory failed, trying Ollama VPS fallback:', error.message);
    if (progressCallback) {
      progressCallback({ status: 'translating', progress: 50, message: 'Using AI fallback...' });
    }

    try {
      const res = await fetch(`${AI_SERVER}/ai/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.substring(0, 400), target_lang: LANGUAGE_NAMES[targetLang] || targetLang })
      });
      const data = await res.json();
      if (progressCallback) progressCallback({ status: 'complete', progress: 100, message: 'Done!' });
      return data.translated || text;
    } catch (fallbackErr) {
      console.error('All translation methods failed:', fallbackErr);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }
};

/**
 * Auto-translate: detects language and translates to target language
 */
export const autoTranslate = async (text, progressCallback = null, targetLanguage = null) => {
  if (!text || text.trim().length === 0) {
    return { translatedText: text, fromLang: null, toLang: null };
  }

  const detected = detectLanguage(text);
  const fromLang = detected.isHindi ? 'hi' : 'en';
  const toLang = targetLanguage || (detected.isHindi ? 'en' : 'hi');

  const translatedText = await translateText(text, { fromLang, toLang, progressCallback });

  return {
    translatedText,
    fromLang,
    toLang,
    originalLang: LANGUAGE_NAMES[fromLang] || fromLang,
    targetLang: LANGUAGE_NAMES[toLang] || toLang
  };
};
