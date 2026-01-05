import React, { useState, useEffect, useRef } from "react";
import { base44 } from "../api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Copy, Download, RotateCcw, CheckCircle, ImageIcon, FileText, Type, Eye, Languages, Undo2, Redo2, BarChart3, Share2, Keyboard, Tag, Sparkles, MessageSquare, Brain } from "lucide-react";
import { autoTranslate, detectLanguage } from "../api/translationClient";
import toast from "react-hot-toast";
import { Skeleton } from "../components/ui/skeleton";
import FormattedTextEditor from "../components/editor/FormattedTextEditor";
import SmartTextFormatter from "../components/editor/SmartTextFormatter";
import PDFFallbackResult from "../components/pdf/PDFFallbackResult";
import ExportManager from "../components/export/ExportManager";
import TagManager from "../components/document/TagManager";
import KeyboardShortcuts from "../components/ui/KeyboardShortcuts";
import TranslationLanguageSelector from "../components/translation/TranslationLanguageSelector";
import DocumentSummarizer from "../components/ai/DocumentSummarizer";
import QuestionAnswering from "../components/ai/QuestionAnswering";
import ImageTextChat from "../components/ai/ImageTextChat";
import AIFeaturesPanel from "../components/ai/AIFeaturesPanel";
import { AutoSaveManager } from "../utils/autoSave";
import { QRCodeScanner } from "../utils/qrBarcodeScanner";
import { UndoRedoManager } from "../utils/undoRedo";
import { DocumentStats } from "../utils/documentStats";
import { VersionHistory } from "../utils/versionHistory";

export default function Results() {
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editedText, setEditedText] = useState("");
  const [originalText, setOriginalText] = useState(""); // Store original text before translation
  const [translatedText, setTranslatedText] = useState(""); // Store translated text separately
  const [copied, setCopied] = useState(false);
  const [showFormattedEditor, setShowFormattedEditor] = useState(false);
  const [viewMode, setViewMode] = useState('plain'); // 'plain', 'formatted', or 'smart'
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationStatus, setTranslationStatus] = useState("");
  const [isShowingOriginal, setIsShowingOriginal] = useState(false); // Toggle between original and translated
  const [undoRedoManager] = useState(() => new UndoRedoManager(""));
  const [showExportManager, setShowExportManager] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [documentStats, setDocumentStats] = useState(null);
  const [autoSaveManager, setAutoSaveManager] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState(null); // Will be set based on detected language
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  const [activeAIFeature, setActiveAIFeature] = useState('summary'); // summary, qa, imagechat
  const textareaRef = useRef(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    
    if (id) {
      loadRecord(id);
    }
  }, []);

  const loadRecord = async (id) => {
    try {
      console.log('Loading record with ID:', id);
      const records = await base44.entities.UploadHistory.filter({ id });
      console.log('Filtered records:', records);
      
      if (records.length > 0) {
        setRecord(records[0]);
        const text = records[0].extracted_text || '';
        setEditedText(text);
        setOriginalText(text);
        undoRedoManager.reset(text);
        updateStats(text);
        
        // Set default target language based on detected language
        if (targetLanguage === null) {
          const detected = detectLanguage(text);
          setTargetLanguage(detected.isHindi ? 'en' : 'hi'); // Opposite of source
        }
        
        // Initialize auto-save
        const autoSave = new AutoSaveManager(records[0].id, async () => {
          await base44.entities.UploadHistory.update(records[0].id, {
            extracted_text: editedText
          });
        }, 30000); // Auto-save every 30 seconds
        setAutoSaveManager(autoSave);
      } else {
        // Try loading all records to debug
        const allRecords = await base44.entities.UploadHistory.list();
        console.log('All records in storage:', allRecords);
        console.log('Looking for ID:', id);
        
        // Try to find by ID manually
        const found = allRecords.find(r => r.id === id);
        if (found) {
          setRecord(found);
          const text = found.extracted_text || '';
          setEditedText(text);
          setOriginalText(text);
          undoRedoManager.reset(text);
          updateStats(text);
          
          // Set default target language based on detected language
          if (targetLanguage === null) {
            const detected = detectLanguage(text);
            setTargetLanguage(detected.isHindi ? 'en' : 'hi'); // Opposite of source
          }
        } else {
          console.error('Record not found. Available IDs:', allRecords.map(r => r.id));
        }
      }
    } catch (err) {
      console.error("Error loading record:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([editedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.original_filename.replace(/\.[^/.]+$/, "")}_extracted.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRetry = () => {
    // Navigate back to upload page for retry
    navigate(createPageUrl('Upload'));
  };

  const handleNewUpload = () => {
    // Navigate to upload page for new upload
    navigate(createPageUrl('Upload'));
  };

  const updateStats = (text) => {
    const stats = DocumentStats.getAllStats(text);
    setDocumentStats(stats);
  };

  const handleTextChange = (newText) => {
    setEditedText(newText);
    undoRedoManager.push(newText);
    updateStats(newText);
    
    // Trigger auto-save
    if (autoSaveManager) {
      autoSaveManager.markDirty();
    }
  };

  const handleUndo = () => {
    const previousText = undoRedoManager.undo();
    if (previousText !== null) {
      setEditedText(previousText);
      updateStats(previousText);
      toast.success('Undone');
    }
  };

  const handleRedo = () => {
    const nextText = undoRedoManager.redo();
    if (nextText !== null) {
      setEditedText(nextText);
      updateStats(nextText);
      toast.success('Redone');
    }
  };

  const handleSave = async () => {
    if (record) {
      await base44.entities.UploadHistory.update(record.id, {
        extracted_text: editedText
      });
      
      // Save version
      await VersionHistory.saveVersion(record.id, editedText, {
        filename: record.original_filename,
        confidence: record.confidence_data?.overall
      });
      
      toast.success('Text saved successfully!');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editedText]);

  const handleTranslate = async () => {
    if (!editedText || editedText.trim().length === 0) {
      toast.error('No text to translate');
      return;
    }

    // Set default target language if not set
    let finalTargetLanguage = targetLanguage;
    if (!finalTargetLanguage) {
      const detected = detectLanguage(editedText);
      finalTargetLanguage = detected.isHindi ? 'en' : 'hi';
      setTargetLanguage(finalTargetLanguage);
    }

    try {
      setIsTranslating(true);
      setTranslationStatus('Detecting language...');

      // Save original text before translation
      setOriginalText(editedText);

      // Detect source language
      const detected = detectLanguage(editedText);
      const sourceLang = detected.isHindi ? 'hi' : 'en';
      const sourceLangName = detected.isHindi ? 'Hindi' : 'English';
      
      // Get target language name
      const targetLangNames = {
        'en': 'English', 'hi': 'Hindi', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
        'zh': 'Chinese', 'ja': 'Japanese', 'ko': 'Korean', 'ar': 'Arabic', 'pt': 'Portuguese',
        'ru': 'Russian', 'it': 'Italian', 'nl': 'Dutch', 'pl': 'Polish', 'tr': 'Turkish',
        'vi': 'Vietnamese', 'th': 'Thai', 'id': 'Indonesian'
      };
      const targetLangName = targetLangNames[finalTargetLanguage] || 'English';

      toast.loading(`Translating from ${sourceLangName} to ${targetLangName}...`, { id: 'translating' });

      const result = await autoTranslate(editedText, (progress) => {
        setTranslationStatus(progress.message || 'Translating...');
      }, finalTargetLanguage);

      // Save translated text
      setTranslatedText(result.translatedText);
      setEditedText(result.translatedText);
      setIsShowingOriginal(false); // Show translated text by default
      setTranslationStatus('');

      // Save translated text to record
      if (record) {
        await base44.entities.UploadHistory.update(record.id, {
          extracted_text: result.translatedText
        });
      }

      toast.success(`Translated from ${result.originalLang} to ${result.targetLang}!`, { id: 'translating' });
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(`Translation failed: ${error.message}`, { id: 'translating' });
      setTranslationStatus('');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleShowOriginal = () => {
    if (isShowingOriginal) {
      // Currently showing original, switch to translated
      if (translatedText && translatedText.trim().length > 0) {
        setEditedText(translatedText);
        setIsShowingOriginal(false);
        toast.success('Showing translated text');
      } else {
        toast.error('Translated text not available');
      }
    } else {
      // Currently showing translated, switch to original
      if (originalText && originalText.trim().length > 0) {
        setEditedText(originalText);
        setIsShowingOriginal(true);
        toast.success('Showing original text');
      } else {
        toast.error('Original text not available');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8 bg-white/5" />
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 bg-white/5 rounded-3xl" />
            <Skeleton className="h-96 bg-white/5 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen px-6 py-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-400">Record not found</p>
        </div>
      </div>
    );
  }

  // Check if this is a PDF fallback result
  const isPDFFallback = record?.extracted_text?.includes('PDF processing encountered a technical issue')

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {isPDFFallback ? 'PDF Processing Issue' : 'Extracted Text'}
            </h1>
            <p className="text-slate-400">
              {record.original_filename} • Confidence: {record.confidence_data?.overall || 0}%
            </p>
            <div className="mt-4">
              <TagManager documentId={record.id} initialTags={record.tags || []} />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'plain' ? 'formatted' : 'plain')}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all duration-300"
              >
                {viewMode === 'plain' ? <Type className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {viewMode === 'plain' ? 'Format Text' : 'Plain View'}
              </button>
              <button
                onClick={() => setViewMode('smart')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white transition-all duration-300 ${
                  viewMode === 'smart' 
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500' 
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Type className="w-4 h-4" />
                Smart Format
              </button>
            </div>
            <button
              onClick={handleUndo}
              disabled={!undoRedoManager.canUndo()}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
              Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={!undoRedoManager.canRedo()}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
              Redo
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all duration-300"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={() => setShowExportManager(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all duration-300"
            >
              <Share2 className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4" />
              Stats
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('AI Features button clicked, current state:', showAIFeatures);
                const newState = !showAIFeatures;
                setShowAIFeatures(newState);
                console.log('Setting AI Features to:', newState);
                toast.success(newState ? 'AI Features opened' : 'AI Features closed');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105"
            >
              <Brain className="w-4 h-4" />
              AI Features
            </button>
            <div className="flex items-center gap-2">
              <TranslationLanguageSelector
                selectedLanguage={targetLanguage || (editedText ? (detectLanguage(editedText).isHindi ? 'en' : 'hi') : 'en')}
                onLanguageChange={setTargetLanguage}
                disabled={isTranslating}
              />
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !editedText || editedText.trim().length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white transition-all duration-300 ${
                  isTranslating
                    ? 'bg-gradient-to-r from-amber-500/50 to-purple-500/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-purple-500 hover:scale-105'
                }`}
              >
                <Languages className={`w-4 h-4 ${isTranslating ? 'animate-spin' : ''}`} />
                {isTranslating ? 'Translating...' : 'Translate'}
              </button>
            </div>
            {translatedText && translatedText.trim().length > 0 && (
              <button
                onClick={handleShowOriginal}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all duration-300"
                title={isShowingOriginal ? 'Show translated text' : 'Show original text'}
              >
                <Undo2 className="w-4 h-4" />
                {isShowingOriginal ? 'Show Translated' : 'Show Original'}
              </button>
            )}
            <button
              onClick={() => setShowShortcuts(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all duration-300"
              title="Keyboard Shortcuts"
            >
              <Keyboard className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(createPageUrl("Upload"))}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              New Upload
            </button>
          </div>
        </div>

        {/* PDF Fallback Content */}
        {isPDFFallback ? (
          <PDFFallbackResult 
            record={record} 
            onRetry={handleRetry}
            onNewUpload={handleNewUpload}
          />
        ) : (
          /* Main Content Grid */
          <div className="grid lg:grid-cols-2 gap-8">

          {/* Image Preview */}
          <div className="group relative rounded-3xl bg-gradient-to-br from-cyan-500/10 to-amber-500/10 border border-white/10 backdrop-blur-sm p-8 hover:border-white/20 transition-all duration-500">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Original Document</h2>
              </div>
              
              <div className="relative rounded-2xl overflow-hidden bg-slate-900/50 border border-white/5 shadow-lg">
                {/* Try to use file_data_url first (base64), then fallback to image_url (blob URL) */}
                {(record.file_data_url || record.image_url) ? (
                  record.file_type === 'application/pdf' ? (
                    // PDF Preview using embed or iframe
                    <div className="w-full h-96 bg-white">
                      <embed
                        src={record.file_data_url || record.image_url}
                        type="application/pdf"
                        className="w-full h-full"
                        onError={(e) => {
                          // If PDF fails to load, show placeholder
                          e.target.style.display = 'none';
                          const placeholder = e.target.parentElement.parentElement.querySelector('.preview-placeholder');
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                      />
                    </div>
                  ) : (
                    // Image Preview
                    <img
                      src={record.file_data_url || record.image_url}
                      alt="Original upload"
                      className="w-full h-auto max-h-96 object-contain bg-white"
                      onError={(e) => {
                        // If image fails to load, show placeholder
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement.querySelector('.preview-placeholder');
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                      onLoad={(e) => {
                        // Hide placeholder when image loads successfully
                        const placeholder = e.target.parentElement.querySelector('.preview-placeholder');
                        if (placeholder) {
                          placeholder.style.display = 'none';
                        }
                      }}
                    />
                  )
                ) : null}
                <div 
                  className="preview-placeholder w-full min-h-64 flex items-center justify-center bg-slate-800/50"
                  style={{ display: (record.file_data_url || record.image_url) ? 'none' : 'flex' }}
                >
                  <div className="text-center">
                    <div className="p-4 rounded-full bg-slate-700/50 mb-4 mx-auto w-fit">
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-400">Document Preview</p>
                    <p className="text-slate-500 text-sm mt-2">No preview available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Editor */}
          {viewMode === 'formatted' ? (
            <FormattedTextEditor
              initialText={editedText}
              onSave={(formattedText) => {
                setEditedText(formattedText)
                // Save to record
                if (record) {
                  const updatedRecord = { ...record, extracted_text: formattedText }
                  base44.entities.UploadHistory.update(record.id, updatedRecord)
                }
              }}
              onCopy={(formattedText) => {
                navigator.clipboard.writeText(formattedText)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="group relative rounded-3xl bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-500"
            />
          ) : viewMode === 'smart' ? (
            <SmartTextFormatter
              originalText={editedText}
              imageUrl={record?.image_url}
              onSave={(formattedText) => {
                setEditedText(formattedText)
                // Save to record
                if (record) {
                  const updatedRecord = { ...record, extracted_text: formattedText }
                  base44.entities.UploadHistory.update(record.id, updatedRecord)
                }
              }}
              onCopy={(formattedText) => {
                navigator.clipboard.writeText(formattedText)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="group relative rounded-3xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-500"
            />
          ) : (
            <div className="group relative rounded-3xl bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-white/10 backdrop-blur-sm p-8 hover:border-white/20 transition-all duration-500">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Extracted Text</h2>
                  </div>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white text-sm font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Save Changes
                  </button>
                </div>
                
                <textarea
                  ref={textareaRef}
                  value={editedText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="w-full h-96 p-6 rounded-2xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none font-mono text-sm leading-relaxed"
                  placeholder="Extracted text will appear here..."
                />
              </div>
            </div>
          )}
          </div>
        )}

        {/* AI Features Section */}
        {showAIFeatures && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">AI-Powered Features</h2>
              </div>
              <button
                onClick={() => setShowAIFeatures(false)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors"
              >
                Close
              </button>
            </div>

            {/* AI Feature Tabs */}
            <div className="flex gap-2 border-b border-white/10 mb-6">
              <button
                onClick={() => setActiveAIFeature('summary')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeAIFeature === 'summary'
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Summarize
              </button>
              <button
                onClick={() => setActiveAIFeature('qa')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeAIFeature === 'qa'
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Q&A
              </button>
              {record?.file_type?.startsWith('image/') && (
                <button
                  onClick={() => setActiveAIFeature('imagechat')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeAIFeature === 'imagechat'
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  Image Chat
                </button>
              )}
            </div>

            {/* AI Feature Content */}
            {activeAIFeature === 'summary' && (
              <DocumentSummarizer 
                documentText={editedText}
                onSummaryGenerated={(summary) => {
                  // Option to replace text with summary
                  console.log('Summary generated:', summary);
                }}
              />
            )}

            {activeAIFeature === 'qa' && (
              <QuestionAnswering documentText={editedText} />
            )}

            {activeAIFeature === 'imagechat' && record?.file_type?.startsWith('image/') && (
              <ImageTextChat 
                imageUrl={record.image_url || record.file_data_url}
                imageFile={null}
              />
            )}
          </div>
        )}

        {/* Additional AI Features */}
        {showAIFeatures && (
          <div className="mt-6">
            <AIFeaturesPanel 
              documentText={editedText}
              onTextUpdate={(improvedText) => {
                setEditedText(improvedText);
                handleTextChange(improvedText);
                toast.success('Text improved and updated!');
              }}
            />
          </div>
        )}

        {/* Export Manager Modal */}
        {showExportManager && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl">
              <button
                onClick={() => setShowExportManager(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-slate-900 rounded-full text-white hover:bg-slate-800"
              >
                ×
              </button>
              <ExportManager
                documentData={{
                  text: editedText,
                  metadata: {
                    filename: record?.original_filename,
                    date: new Date().toLocaleDateString(),
                    confidence: record?.confidence_data?.overall,
                    language: record?.language
                  },
                  confidence: record?.confidence_data
                }}
                onExport={() => setShowExportManager(false)}
              />
            </div>
          </div>
        )}

        {/* Document Statistics Panel */}
        {showStats && documentStats && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Document Statistics
                </h3>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Words:</span>
                  <span className="text-white font-semibold">{documentStats.words}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Characters:</span>
                  <span className="text-white font-semibold">{documentStats.characters}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Characters (no spaces):</span>
                  <span className="text-white font-semibold">{documentStats.charactersNoSpaces}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Paragraphs:</span>
                  <span className="text-white font-semibold">{documentStats.paragraphs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lines:</span>
                  <span className="text-white font-semibold">{documentStats.lines}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reading Time:</span>
                  <span className="text-white font-semibold">
                    {documentStats.readingTime.minutes} min {documentStats.readingTime.seconds} sec
                  </span>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <p className="text-slate-400 text-sm mb-2">Language Distribution:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Hindi:</span>
                      <span className="text-white">{documentStats.languageDistribution.hindi}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">English:</span>
                      <span className="text-white">{documentStats.languageDistribution.english}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      </div>
    </div>
  );
}