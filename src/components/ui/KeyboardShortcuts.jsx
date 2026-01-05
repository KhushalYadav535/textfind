import React, { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SHORTCUTS = [
  { keys: ['Ctrl', 'Z'], description: 'Undo last action' },
  { keys: ['Ctrl', 'Y'], description: 'Redo last action' },
  { keys: ['Ctrl', 'S'], description: 'Save document' },
  { keys: ['Ctrl', 'C'], description: 'Copy text' },
  { keys: ['Ctrl', 'V'], description: 'Paste text' },
  { keys: ['Ctrl', 'F'], description: 'Find in document' },
  { keys: ['Ctrl', 'A'], description: 'Select all' },
  { keys: ['Ctrl', 'B'], description: 'Bold text (in formatted editor)' },
  { keys: ['Ctrl', 'I'], description: 'Italic text (in formatted editor)' },
  { keys: ['Ctrl', 'U'], description: 'Underline text (in formatted editor)' },
  { keys: ['Esc'], description: 'Close modals/dialogs' },
];

export default function KeyboardShortcuts({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Keyboard className="w-6 h-6" />
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {SHORTCUTS.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-white/10"
                  >
                    <span className="text-slate-300">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <kbd className="px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-sm font-mono">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-slate-400 mx-1">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <p className="text-cyan-400 text-sm">
                  💡 Tip: On Mac, use <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">Cmd</kbd> instead of <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">Ctrl</kbd>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

