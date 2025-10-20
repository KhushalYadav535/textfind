import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  Download,
  RefreshCw
} from 'lucide-react'
import { processPDFWithOCR, analyzePDF } from '../../utils/pdfUtils'

export default function PDFTestDemo() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setSelectedFile(file)
    setResult(null)
    setError(null)
    setAnalysis(null)

    try {
      // Analyze PDF type
      const pdfAnalysis = await analyzePDF(file)
      setAnalysis(pdfAnalysis)
    } catch (error) {
      console.error('PDF analysis error:', error)
    }
  }

  const processFile = async () => {
    if (!selectedFile) return

    setProcessing(true)
    setError(null)

    try {
      const result = await processPDFWithOCR(selectedFile, {
        languages: ['eng'],
        maxPages: 3
      })

      setResult(result)
    } catch (error) {
      setError(error.message)
    } finally {
      setProcessing(false)
    }
  }

  const downloadResult = () => {
    if (!result) return

    const content = `PDF Processing Result\n\nFile: ${selectedFile.name}\nType: ${result.type}\nPages: ${result.pages.length}\nTotal Words: ${result.totalWords}\nAverage Confidence: ${Math.round(result.totalConfidence)}%\n\nExtracted Text:\n${result.totalText}`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedFile.name}_result.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          PDF Processing Test Demo
        </h1>
        <p className="text-xl text-slate-400">
          Test the scanned PDF processing functionality with automatic fallback
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="w-6 h-6 text-cyan-400" />
              Upload PDF for Testing
            </h3>
            
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="w-full p-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
            />

            {selectedFile && (
              <div className="mt-4 p-4 rounded-xl bg-slate-700/30">
                <h4 className="text-white font-medium mb-2">{selectedFile.name}</h4>
                <p className="text-slate-400 text-sm">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            {selectedFile && (
              <button
                onClick={processFile}
                disabled={processing}
                className="w-full mt-4 p-4 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {processing ? 'Processing...' : 'Process PDF'}
              </button>
            )}
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                PDF Analysis
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${analysis.isScanned ? 'bg-orange-400' : 'bg-green-400'}`} />
                  <span className="text-white font-medium">
                    {analysis.isScanned ? 'Scanned PDF' : 'Text-based PDF'}
                  </span>
                </div>
                
                <div className="text-slate-400 text-sm space-y-1">
                  <p>Total Pages: {analysis.totalPages}</p>
                  <p>Pages with Text: {analysis.pagesWithText}</p>
                  <p>Confidence: {Math.round(analysis.confidence)}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <h3 className="text-red-400 font-semibold mb-2">Processing Error</h3>
                  <p className="text-slate-300 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Processing Status */}
          {processing && (
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                  Processing PDF...
                </h3>
              <p className="text-slate-400">
                This may take a few moments depending on the PDF size and complexity.
              </p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  Processing Results
                </h3>
                <button
                  onClick={downloadResult}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${result.type === 'scanned' ? 'bg-orange-400' : 'bg-green-400'}`} />
                  <span className="text-slate-300 text-sm">
                    {result.type === 'scanned' ? 'OCR Processed' : 'Text Extracted'}
                  </span>
                </div>
                
                <div className="text-slate-400 text-sm space-y-1">
                  <p>Pages Processed: {result.pages.length}</p>
                  <p>Total Words: {result.totalWords}</p>
                  <p>Average Confidence: {Math.round(result.totalConfidence)}%</p>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto">
                <h4 className="text-white font-medium mb-2">Extracted Text:</h4>
                <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">
                    {result.totalText.substring(0, 500)}
                    {result.totalText.length > 500 && '...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Features Info */}
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-400" />
              Features Tested
            </h3>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Automatic PDF type detection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>OCR processing for scanned PDFs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Fallback handling for technical issues</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Multi-language support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Progress tracking and error handling</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
