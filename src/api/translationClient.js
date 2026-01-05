/**
 * Translation Client using Amazon Nova 2 Lite via OpenRouter
 * Translates text between Hindi and English
 */

import { containsHindiText } from '../utils/hindiTextProcessor.js';

// Configuration
const NOVA_API_KEY = import.meta.env?.VITE_NOVA_API_KEY || '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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

  if (totalChars === 0) {
    return { isHindi: false, isEnglish: false, confidence: 0 };
  }

  const hindiPercentage = (hindiChars / totalChars) * 100;
  const englishPercentage = (englishChars / totalChars) * 100;

  const isHindi = hindiPercentage > 10;
  const isEnglish = !isHindi && englishPercentage > 20;

  return {
    isHindi,
    isEnglish,
    confidence: isHindi ? hindiPercentage : (isEnglish ? englishPercentage : 0),
    hindiPercentage,
    englishPercentage
  };
};

// Language code to name mapping
const LANGUAGE_NAMES = {
  'en': 'English',
  'hi': 'Hindi',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'it': 'Italian',
  'nl': 'Dutch',
  'pl': 'Polish',
  'tr': 'Turkish',
  'vi': 'Vietnamese',
  'th': 'Thai',
  'id': 'Indonesian',
};

/**
 * Translate text using Amazon Nova 2 Lite via OpenRouter
 */
export const translateText = async (text, options = {}) => {
  const { fromLang = null, toLang = null, progressCallback = null, apiKey = NOVA_API_KEY } = options;

  if (!text || text.trim().length === 0) {
    return text;
  }

  try {
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
      progressCallback({ status: 'translating', progress: 10, message: `Translating from ${fromLangName} to ${toLangName}...` });
    }

    // Create translation prompt for any language pair
    const translationPrompt = `Translate the following ${fromLangName} text to ${toLangName}. Return ONLY the translated ${toLangName} text without any explanation, prefix, suffix, or additional text. Just return the translation:\n\n${text}`;

    if (progressCallback) {
      progressCallback({ status: 'translating', progress: 30, message: 'Sending translation request...' });
    }

    // Call OpenRouter API directly for translation
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'Text Translator'
      },
      body: JSON.stringify({
        model: 'amazon/nova-2-lite-v1',
        messages: [
          {
            role: 'user',
            content: translationPrompt
          }
        ],
        max_tokens: 4096,
        temperature: 0.3 // Lower temperature for more accurate translation
      })
    });

    if (progressCallback) {
      progressCallback({ status: 'processing', progress: 70, message: 'Processing translation...' });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Translation failed: HTTP ${response.status}: ${errorText || 'Unknown error'}`);
    }

    const result = await response.json();

    if (!result || !result.choices || result.choices.length === 0) {
      throw new Error('Invalid response from translation service');
    }

    // Extract translated text
    let translatedText = result.choices[0]?.message?.content || '';
    
    // Clean up the translated text
    translatedText = translatedText.trim();
    
    // Remove common prefixes/suffixes
    translatedText = translatedText.replace(/^(translated text|translation|hindi|english|the translation is):\s*/i, '');
    translatedText = translatedText.replace(/^["']|["']$/g, ''); // Remove quotes
    translatedText = translatedText.trim();

    if (progressCallback) {
      progressCallback({ status: 'complete', progress: 100, message: 'Translation complete!' });
    }

    return translatedText;

  } catch (error) {
    console.error('Translation error:', error);
    throw error;
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
  const isHindi = detected.isHindi;
  
  // Use provided target language or auto-detect
  const fromLang = isHindi ? 'hi' : 'en';
  const toLang = targetLanguage || (isHindi ? 'en' : 'hi');

  const translatedText = await translateText(text, {
    fromLang,
    toLang,
    progressCallback
  });

  return {
    translatedText,
    fromLang,
    toLang,
    originalLang: LANGUAGE_NAMES[fromLang] || fromLang,
    targetLang: LANGUAGE_NAMES[toLang] || toLang
  };
};
