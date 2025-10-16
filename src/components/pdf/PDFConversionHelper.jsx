import React from 'react'
import { FileText, Image, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react'

export default function PDFConversionHelper() {
  const conversionSteps = [
    {
      step: 1,
      title: "Check PDF Type",
      description: "Verify if your PDF contains selectable text or is scanned images",
      icon: <FileText className="w-5 h-5" />,
      tips: ["Try selecting text in the PDF", "If text can't be selected, it's likely scanned"]
    },
    {
      step: 2,
      title: "Convert to Images",
      description: "Use online tools or software to convert PDF pages to images",
      icon: <Image className="w-5 h-5" />,
      tips: ["Use tools like Adobe Acrobat", "Convert each page to PNG/JPG", "Maintain high resolution"]
    },
    {
      step: 3,
      title: "Upload Images",
      description: "Upload the converted images to TextMitra for OCR processing",
      icon: <CheckCircle className="w-5 h-5" />,
      tips: ["Upload one image at a time", "Ensure good image quality", "Clear, readable text works best"]
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
          <h3 className="text-xl font-bold text-white mb-2">PDF Processing Help</h3>
          <p className="text-slate-300">
            Having trouble with PDF processing? Follow these steps to convert your PDF to images for better OCR results.
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

      {/* Online Tools */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          Recommended Online Tools
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          {onlineTools.map((tool, index) => (
            <a
              key={index}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-slate-800/50 border border-white/10 hover:border-amber-500/30 transition-all duration-300 hover:scale-105"
            >
              <h5 className="text-white font-semibold mb-2">{tool.name}</h5>
              <p className="text-slate-400 text-sm mb-2">{tool.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-400">Free</span>
                <span className="text-xs text-amber-400">→</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Alternative Solution */}
      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-600/50">
        <h4 className="text-white font-semibold mb-2">Alternative Solution</h4>
        <p className="text-slate-300 text-sm">
          If PDF processing continues to fail, try using our <strong>image upload feature</strong> instead. 
          Convert your PDF pages to high-quality images (PNG/JPG) and upload them individually for better OCR results.
        </p>
      </div>
    </div>
  )
}
