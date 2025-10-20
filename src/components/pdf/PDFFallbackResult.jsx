import React from 'react'
import { 
  AlertTriangle, 
  ExternalLink, 
  Upload, 
  RefreshCw, 
  FileText,
  Image as ImageIcon,
  CheckCircle,
  ArrowRight,
  Download
} from 'lucide-react'

export default function PDFFallbackResult({ record, onRetry, onNewUpload }) {
  const isFallbackResult = record?.extracted_text?.includes('PDF processing encountered a technical issue')
  
  if (!isFallbackResult) return null

  const conversionTools = [
    {
      name: "SmallPDF",
      description: "Convert PDF to images online",
      url: "https://smallpdf.com/pdf-to-jpg",
      icon: "🛠️",
      free: true
    },
    {
      name: "ILovePDF", 
      description: "PDF to image converter",
      url: "https://www.ilovepdf.com/pdf_to_jpg",
      icon: "💖",
      free: true
    },
    {
      name: "PDF24",
      description: "Free PDF tools including conversion",
      url: "https://tools.pdf24.org/en/pdf-to-image",
      icon: "📋",
      free: true
    }
  ]

  const steps = [
    {
      step: 1,
      title: "Convert PDF to Images",
      description: "Use one of the online tools below to convert your PDF pages to images",
      icon: <ImageIcon className="w-5 h-5" />,
      action: "Choose a tool"
    },
    {
      step: 2,
      title: "Download Images",
      description: "Download the converted images (PNG or JPG format) to your device",
      icon: <Download className="w-5 h-5" />,
      action: "Save images"
    },
    {
      step: 3,
      title: "Upload Images",
      description: "Upload the converted images individually to this application for OCR processing",
      icon: <Upload className="w-5 h-5" />,
      action: "Upload here"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-orange-500/20">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">PDF Processing Unavailable</h3>
            <p className="text-slate-300 mb-4">
              We encountered a technical issue while processing your PDF. Don't worry - you can still extract text 
              by converting your PDF to images first.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-xl text-orange-400 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={onNewUpload}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl text-cyan-400 transition-all"
              >
                <Upload className="w-4 h-4" />
                New Upload
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Solution Steps */}
      <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          Quick Solution
        </h3>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.step} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-amber-500 flex items-center justify-center text-white font-bold">
                  {step.step}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {step.icon}
                  <h4 className="text-lg font-semibold text-white">{step.title}</h4>
                </div>
                <p className="text-slate-300 mb-2">{step.description}</p>
                <span className="text-sm text-cyan-400 font-medium">{step.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Online Conversion Tools */}
      <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-blue-400" />
          Recommended Tools
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          {conversionTools.map((tool, index) => (
            <a
              key={index}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-4 rounded-xl bg-slate-700/50 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{tool.icon}</span>
                <div>
                  <h5 className="text-white font-semibold">{tool.name}</h5>
                  <span className="text-xs text-green-400">Free</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-3">{tool.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-400">Visit Tool</span>
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Alternative Methods */}
      <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          Alternative Methods
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/50">
            <h4 className="text-white font-semibold mb-2">For Text-based PDFs</h4>
            <p className="text-slate-300 text-sm">
              If your PDF contains selectable text, you can copy and paste it directly. 
              Open the PDF in a viewer and try selecting text with your mouse.
            </p>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/50">
            <h4 className="text-white font-semibold mb-2">Desktop Software</h4>
            <p className="text-slate-300 text-sm">
              Use desktop applications like Adobe Acrobat, Foxit Reader, or online PDF editors 
              to convert your PDF to images before uploading.
            </p>
          </div>
        </div>
      </div>

      {/* File Information */}
      {record && (
        <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/50">
          <h4 className="text-white font-semibold mb-2">File Information</h4>
          <div className="text-sm text-slate-400 space-y-1">
            <p><strong>File:</strong> {record.original_filename}</p>
            <p><strong>Type:</strong> PDF Document</p>
            <p><strong>Status:</strong> Processing failed - fallback mode</p>
            <p><strong>Confidence:</strong> 0% (fallback message)</p>
          </div>
        </div>
      )}
    </div>
  )
}
