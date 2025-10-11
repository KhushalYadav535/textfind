import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Image, 
  FileText, 
  Settings, 
  Languages, 
  Zap,
  CheckCircle,
  AlertCircle,
  X,
  Download
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { base44 } from '../../api/base44Client'
import { useUserStore } from '../../store/userStore'
import toast from 'react-hot-toast'

const languages = [
  { code: 'eng', name: 'English', flag: '🇺🇸' },
  { code: 'hin', name: 'Hindi', flag: '🇮🇳' },
  { code: 'spa', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fra', name: 'French', flag: '🇫🇷' },
  { code: 'deu', name: 'German', flag: '🇩🇪' },
  { code: 'chi_sim', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'jpn', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ara', name: 'Arabic', flag: '🇸🇦' }
]

export default function AdvancedUpload() {
  const { preferences, updatePreferences, incrementUsage } = useUserStore()
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState({})
  const [results, setResults] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [selectedLanguages, setSelectedLanguages] = useState(['eng'])
  const [advancedOptions, setAdvancedOptions] = useState({
    enablePreprocessing: true,
    confidenceThreshold: 60,
    enableBatchProcessing: false
  })

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      status: 'ready',
      progress: 0,
      result: null,
      error: null
    }))
    setSelectedFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff', '.webp'],
      'application/pdf': ['.pdf']
    },
    multiple: true,
    maxFiles: 10
  })

  const removeFile = (id) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id))
  }

  const processFile = async (fileObj) => {
    try {
      setProcessingProgress(prev => ({ ...prev, [fileObj.id]: 0 }))
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => ({
          ...prev,
          [fileObj.id]: Math.min((prev[fileObj.id] || 0) + 10, 90)
        }))
      }, 200)

      // Update file status
      setSelectedFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, status: 'processing' } : f
      ))

      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ 
        file: fileObj.file 
      })

      // Extract text
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        file: fileObj.file
      })

      clearInterval(progressInterval)
      setProcessingProgress(prev => ({ ...prev, [fileObj.id]: 100 }))

      // Update file with result
      setSelectedFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { 
          ...f, 
          status: 'completed', 
          result,
          progress: 100
        } : f
      ))

      // Save to history
      const historyRecord = await base44.entities.UploadHistory.create({
        original_filename: fileObj.file.name,
        image_url: file_url,
        extracted_text: result.output?.text || "No text detected",
        confidence_data: {
          overall: result.output?.confidence || 0
        },
        language: selectedLanguages.join('+'),
        processing_options: advancedOptions
      })

      setResults(prev => [...prev, { ...historyRecord, fileObj }])
      incrementUsage()

      toast.success(`Successfully processed ${fileObj.file.name}`)

    } catch (error) {
      setSelectedFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { 
          ...f, 
          status: 'error', 
          error: error.message 
        } : f
      ))
      toast.error(`Failed to process ${fileObj.file.name}: ${error.message}`)
    }
  }

  const processAllFiles = async () => {
    if (selectedFiles.length === 0) return

    setIsProcessing(true)
    setResults([])

    // Process files sequentially to avoid overwhelming the system
    for (const fileObj of selectedFiles) {
      if (fileObj.status === 'ready') {
        await processFile(fileObj)
      }
    }

    setIsProcessing(false)
  }

  const downloadResults = () => {
    const content = results.map(result => 
      `=== ${result.original_filename} ===\n${result.extracted_text}\n\n`
    ).join('')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'extracted_texts.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const FileCard = ({ fileObj }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative p-4 rounded-2xl bg-slate-800/50 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-amber-500/20">
          <Image className="w-5 h-5 text-cyan-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate">{fileObj.file.name}</h4>
          <p className="text-slate-400 text-sm">
            {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
          </p>
          
          {fileObj.status === 'processing' && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-slate-400 text-sm">Processing...</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-amber-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress[fileObj.id] || 0}%` }}
                />
              </div>
            </div>
          )}

          {fileObj.status === 'completed' && (
            <div className="mt-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">
                {fileObj.result?.output?.confidence || 0}% confidence
              </span>
            </div>
          )}

          {fileObj.status === 'error' && (
            <div className="mt-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{fileObj.error}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => removeFile(fileObj.id)}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </motion.div>
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent mb-4">
          Advanced OCR Processing
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Upload multiple documents, choose languages, and extract text with advanced AI-powered accuracy
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Zone */}
          <motion.div
            {...getRootProps()}
            className={`relative p-12 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
              isDragActive
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-white/20 bg-slate-800/30 hover:border-white/40 hover:bg-slate-800/50'
            } backdrop-blur-sm`}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-amber-500/20 mb-4">
                <Upload className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {isDragActive ? 'Drop files here' : 'Upload Documents'}
              </h3>
              <p className="text-slate-400 mb-4">
                Drag and drop files here, or click to select
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-sm text-slate-500">
                <span>PNG</span>
                <span>•</span>
                <span>JPG</span>
                <span>•</span>
                <span>PDF</span>
                <span>•</span>
                <span>TIFF</span>
              </div>
            </div>
          </motion.div>

          {/* Selected Files */}
          <AnimatePresence>
            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    Selected Files ({selectedFiles.length})
                  </h3>
                  <button
                    onClick={processAllFiles}
                    disabled={isProcessing || selectedFiles.every(f => f.status !== 'ready')}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isProcessing ? 'Processing...' : 'Process All'}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {selectedFiles.map(fileObj => (
                    <FileCard key={fileObj.id} fileObj={fileObj} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Processing Complete
                </h3>
                <button
                  onClick={downloadResults}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download All
                </button>
              </div>
              <p className="text-slate-400">
                Successfully processed {results.length} file(s). Click download to get all extracted texts.
              </p>
            </motion.div>
          )}
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Processing Settings</h3>
            </div>

            {/* Language Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Languages
              </label>
              <div className="grid grid-cols-2 gap-2">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      if (selectedLanguages.includes(lang.code)) {
                        setSelectedLanguages(prev => prev.filter(l => l !== lang.code))
                      } else {
                        setSelectedLanguages(prev => [...prev, lang.code])
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                      selectedLanguages.includes(lang.code)
                        ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                        : 'bg-slate-700/50 border border-white/10 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="truncate">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Enable Preprocessing</span>
                <button
                  onClick={() => setAdvancedOptions(prev => ({ 
                    ...prev, 
                    enablePreprocessing: !prev.enablePreprocessing 
                  }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    advancedOptions.enablePreprocessing 
                      ? 'bg-gradient-to-r from-cyan-500 to-amber-500' 
                      : 'bg-slate-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      advancedOptions.enablePreprocessing ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2">
                  Confidence Threshold: {advancedOptions.confidenceThreshold}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={advancedOptions.confidenceThreshold}
                  onChange={(e) => setAdvancedOptions(prev => ({ 
                    ...prev, 
                    confidenceThreshold: parseInt(e.target.value) 
                  }))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-6 rounded-3xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Files Selected</span>
                <span className="text-white font-medium">{selectedFiles.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Completed</span>
                <span className="text-green-400 font-medium">
                  {selectedFiles.filter(f => f.status === 'completed').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Processing</span>
                <span className="text-cyan-400 font-medium">
                  {selectedFiles.filter(f => f.status === 'processing').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Errors</span>
                <span className="text-red-400 font-medium">
                  {selectedFiles.filter(f => f.status === 'error').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
