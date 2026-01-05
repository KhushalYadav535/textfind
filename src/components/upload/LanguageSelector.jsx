import React, { useState } from 'react';
import { Languages, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUPPORTED_LANGUAGES = [
  { code: 'eng', name: 'English', flag: '🇬🇧' },
  { code: 'hin', name: 'Hindi', flag: '🇮🇳' },
  { code: 'spa', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fra', name: 'French', flag: '🇫🇷' },
  { code: 'deu', name: 'German', flag: '🇩🇪' },
  { code: 'chi_sim', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'jpn', name: 'Japanese', flag: '🇯🇵' },
  { code: 'kor', name: 'Korean', flag: '🇰🇷' },
  { code: 'ara', name: 'Arabic', flag: '🇸🇦' },
  { code: 'por', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'rus', name: 'Russian', flag: '🇷🇺' },
  { code: 'ita', name: 'Italian', flag: '🇮🇹' },
];

export default function LanguageSelector({ selectedLanguages = ['eng'], onLanguagesChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleLanguage = (langCode) => {
    const newSelection = selectedLanguages.includes(langCode)
      ? selectedLanguages.filter(l => l !== langCode)
      : [...selectedLanguages, langCode];
    
    if (newSelection.length > 0) {
      onLanguagesChange(newSelection);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all"
      >
        <Languages className="w-4 h-4" />
        <span className="text-sm">
          {selectedLanguages.length === 1
            ? SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguages[0])?.name || 'Select Language'
            : `${selectedLanguages.length} Languages`}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 z-50 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-white/10">
                <h3 className="text-white font-semibold mb-2">Select Languages</h3>
                <p className="text-slate-400 text-xs">Select one or more languages for OCR</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => toggleLanguage(lang.code)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
                      selectedLanguages.includes(lang.code) ? 'bg-cyan-500/10' : ''
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="flex-1 text-left text-white">{lang.name}</span>
                    {selectedLanguages.includes(lang.code) && (
                      <Check className="w-4 h-4 text-cyan-400" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

