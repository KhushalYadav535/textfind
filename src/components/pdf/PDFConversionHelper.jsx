import React from 'react'
import { FileText, Image, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react'

export default function PDFConversionHelper() {
  const conversionSteps = [
    {
      step: 1,
      title: "Upload PDF Directly",
      description: "Simply upload your PDF file - we'll automatically detect if it's scanned or text-based",
      icon: <FileText className="w-5 h-5" />,
      tips: ["Both scanned and text-based PDFs are supported", "No manual conversion needed", "Automatic detection and processing"]
    },
    {
      step: 2,
      title: "Automatic Processing",
      description: "Scanned PDFs are converted to images and processed with OCR automatically",
      icon: <Image className="w-5 h-5" />,
      tips: ["High-quality OCR using Tesseract.js", "Multi-language support", "Progress tracking for large files"]
    },
    {
      step: 3,
      title: "Get Results",
      description: "Receive extracted text with confidence scores and processing details",
      icon: <CheckCircle className="w-5 h-5" />,
      tips: ["View confidence scores for each page", "Download extracted text", "Processing history saved"]
    }
  ]

  const onlineTools = [
    {
      name: "SmallPDF",
      description: "Convert PDF to images online",
      url: "https://smallpdf.com/pdf-to-jpg",
      free: true
    },
    {
      name: "ILovePDF",
      description: "PDF to image converter",
      url: "https://www.ilovepdf.com/pdf_to_jpg",
      free: true
    },
    {
      name: "PDF24",
      description: "Free PDF tools including conversion",
      url: "https://tools.pdf24.org/en/pdf-to-image",
      free: true
    }
  ]

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-3 rounded-xl bg-amber-500/20">
          <Lightbulb className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Enhanced PDF Processing</h3>
          <p className="text-slate-300">
            Now supporting both scanned and text-based PDFs with automatic detection and OCR processing.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-8">
        {conversionSteps.map((step, index) => (
          <div key={step.step} className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
                {step.step}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {step.icon}
                <h4 className="text-lg font-semibold text-white">{step.title}</h4>
              </div>
              <p className="text-slate-300 mb-2">{step.description}</p>
              <ul className="space-y-1">
                {step.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="text-sm text-slate-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          New Features
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-green-500/20">
            <h5 className="text-white font-semibold mb-2">Automatic Detection</h5>
            <p className="text-slate-400 text-sm">Detects scanned vs text-based PDFs automatically</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-green-500/20">
            <h5 className="text-white font-semibold mb-2">OCR Processing</h5>
            <p className="text-slate-400 text-sm">High-quality OCR using Tesseract.js for scanned PDFs</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-green-500/20">
            <h5 className="text-white font-semibold mb-2">Multi-language</h5>
            <p className="text-slate-400 text-sm">Support for multiple languages including Hindi, English, and more</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-green-500/20">
            <h5 className="text-white font-semibold mb-2">Progress Tracking</h5>
            <p className="text-slate-400 text-sm">Real-time progress updates for large PDF processing</p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-600/50">
        <h4 className="text-white font-semibold mb-2">Current Status</h4>
        <p className="text-slate-300 text-sm">
          PDF processing is now available! The system automatically detects scanned vs text-based PDFs and processes them accordingly. 
          If you encounter any issues, you can still use our <strong>image upload feature</strong> as an alternative.
        </p>
      </div>

      {/* Troubleshooting */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <h4 className="text-amber-300 font-semibold mb-2">Having Issues?</h4>
        <p className="text-slate-300 text-sm">
          If PDF processing fails, try converting your PDF to images using online tools like SmallPDF or ILovePDF, 
          then upload the images individually for OCR processing.
        </p>
      </div>
    </div>
  )
}
