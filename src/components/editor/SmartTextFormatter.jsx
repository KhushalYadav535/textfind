import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Type, 
  Bold, 
  Italic, 
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Palette,
  Zap,
  RotateCcw,
  Download,
  Copy,
  Eye,
  Settings
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SmartTextFormatter({ 
  originalText = '', 
  imageUrl = null,
  onSave, 
  onCopy 
}) {
  const [formattedText, setFormattedText] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const [autoFormat, setAutoFormat] = useState(true)
  const [preserveLayout, setPreserveLayout] = useState(true)
  const [fontSize, setFontSize] = useState(16)
  const [lineHeight, setLineHeight] = useState(1.6)
  const [textColor, setTextColor] = useState('#ffffff')
  const [backgroundColor, setBackgroundColor] = useState('transparent')

  useEffect(() => {
    if (autoFormat && originalText) {
      const smartFormatted = smartFormatText(originalText)
      setFormattedText(smartFormatted)
    } else {
      setFormattedText(originalText)
    }
  }, [originalText, autoFormat])

  const smartFormatText = (text) => {
    let formatted = text

    // Auto-detect and format headings
    formatted = formatted.replace(/^([A-Z][A-Z\s]{10,})$/gm, '# $1')
    formatted = formatted.replace(/^([A-Z][A-Z\s]{5,10})$/gm, '## $1')
    formatted = formatted.replace(/^([A-Z][A-Z\s]{2,5})$/gm, '### $1')

    // Auto-detect lists
    formatted = formatted.replace(/^(\d+\.\s)/gm, '1. ')
    formatted = formatted.replace(/^([•\-\*]\s)/gm, '- ')

    // Auto-detect quotes (lines starting with common quote indicators)
    formatted = formatted.replace(/^(".*"|'.*'|".*|'.*)$/gm, '> $1')

    // Auto-detect emphasis (common patterns)
    formatted = formatted.replace(/\b(IMPORTANT|NOTE|WARNING|ATTENTION)\b/g, '**$1**')
    formatted = formatted.replace(/\b(please|note|important|warning)\b/g, '*$1*')

    // Auto-detect code patterns
    formatted = formatted.replace(/\b[A-Z]{2,}_[A-Z0-9]+\b/g, '`$&`')
    formatted = formatted.replace(/\b\d{4}-\d{2}-\d{2}\b/g, '`$&`')

    // Auto-detect email addresses
    formatted = formatted.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '`$&`')

    // Auto-detect phone numbers
    formatted = formatted.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '`$&`')

    // Auto-detect URLs
    formatted = formatted.replace(/\b(https?:\/\/[^\s]+)\b/g, '`$&`')

    // Auto-detect currency
    formatted = formatted.replace(/\$\d+(?:\.\d{2})?/g, '`$&`')

    // Auto-detect dates
    formatted = formatted.replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, '`$&`')

    return formatted
  }

  const applyCustomFormat = (format) => {
    const textarea = document.getElementById('smart-formatter-textarea')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formattedText.substring(start, end)
    
    if (!selectedText) {
      toast.error('Please select text to format')
      return
    }

    let formattedSelection = selectedText
    let newText = formattedText

    switch (format) {
      case 'bold':
        formattedSelection = `**${selectedText}**`
        break
      case 'italic':
        formattedSelection = `*${selectedText}*`
        break
      case 'underline':
        formattedSelection = `<u>${selectedText}</u>`
        break
      case 'code':
        formattedSelection = `\`${selectedText}\``
        break
      case 'quote':
        formattedSelection = `> ${selectedText}`
        break
      case 'heading1':
        formattedSelection = `# ${selectedText}`
        break
      case 'heading2':
        formattedSelection = `## ${selectedText}`
        break
      case 'heading3':
        formattedSelection = `### ${selectedText}`
        break
      case 'list':
        formattedSelection = `- ${selectedText}`
        break
      case 'numbered':
        formattedSelection = `1. ${selectedText}`
        break
    }

    newText = formattedText.substring(0, start) + formattedSelection + formattedText.substring(end)
    setFormattedText(newText)
    
    // Update cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + formattedSelection.length, start + formattedSelection.length)
    }, 0)
  }

  const renderFormattedText = (rawText) => {
    let formatted = rawText;
    
    // Markdown Tables - Convert to HTML tables with proper styling
    const tableRegex = /(\|.+\|)\n(\|[-:\s|]+\|)\n((?:\|.+\|\n?)+)/g;
    formatted = formatted.replace(tableRegex, (match, header, separator, rows) => {
      // Parse header
      const headers = header.split('|').map(h => h.trim()).filter(h => h);
      const headerCells = headers.map(h => `<th class="px-4 py-2 bg-slate-700 text-left font-semibold text-cyan-400 border-b-2 border-cyan-500">${h}</th>`).join('');
      
      // Parse rows
      const rowLines = rows.trim().split('\n').filter(line => line.trim());
      const tableRows = rowLines.map(row => {
        const cells = row.split('|').map(c => c.trim()).filter(c => c);
        const rowCells = cells.map(c => `<td class="px-4 py-2 border-b border-slate-700 text-slate-300">${c}</td>`).join('');
        return `<tr class="hover:bg-slate-800/50">${rowCells}</tr>`;
      }).join('');
      
      return `<div class="overflow-x-auto my-4"><table class="min-w-full border-collapse border border-slate-600 rounded-lg overflow-hidden"><thead><tr>${headerCells}</tr></thead><tbody>${tableRows}</tbody></table></div>`;
    });
    
    // Headers with better styling
    formatted = formatted
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-cyan-400 mb-3 mt-6 border-l-4 border-cyan-400 pl-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-amber-400 mb-4 mt-8 border-l-4 border-amber-400 pl-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-purple-400 mb-6 mt-10 border-l-4 border-purple-400 pl-4">$1</h1>')
      
      // Enhanced Bold and Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white bg-cyan-500/10 px-1 rounded">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300 bg-amber-500/10 px-1 rounded">$1</em>')
      
      // Enhanced Code
      .replace(/`(.*?)`/g, '<code class="bg-slate-800 text-cyan-400 px-2 py-1 rounded text-sm font-mono border border-slate-600">$1</code>')
      
      // Enhanced Underline
      .replace(/<u>(.*?)<\/u>/g, '<u class="underline text-yellow-400 border-b-2 border-yellow-400">$1</u>')
      
      // Enhanced Quotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-cyan-500 pl-4 italic text-slate-300 my-4 bg-slate-800/30 py-2 rounded-r">$1</blockquote>')
      
      // Enhanced Lists
      .replace(/^1\. (.*$)/gim, '<li class="list-decimal list-inside text-slate-300 my-2 ml-4">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="list-disc list-inside text-slate-300 my-2 ml-4 marker:text-cyan-400">$1</li>')
      
      // Preserve multiple line breaks (paragraphs)
      .replace(/\n\n+/g, '</p><p class="mb-4 text-slate-300">')
      
      // Line breaks
      .replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags if not already wrapped
    if (!formatted.startsWith('<')) {
      formatted = `<p class="mb-4 text-slate-300">${formatted}</p>`;
    }
    
    return formatted;
  }

  const handleSave = () => {
    if (onSave) {
      onSave(formattedText)
    }
    toast.success('Smart formatted text saved!')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText)
    if (onCopy) {
      onCopy(formattedText)
    }
    toast.success('Formatted text copied!')
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([formattedText], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'smart-formatted-text.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('Text downloaded!')
  }

  const resetFormatting = () => {
    setFormattedText(originalText)
    toast.success('Formatting reset!')
  }

  const toggleAutoFormat = () => {
    setAutoFormat(!autoFormat)
    if (!autoFormat && originalText) {
      const smartFormatted = smartFormatText(originalText)
      setFormattedText(smartFormatted)
    } else {
      setFormattedText(originalText)
    }
    toast.success(`Auto-format ${!autoFormat ? 'enabled' : 'disabled'}`)
  }

  const FormatButton = ({ format, icon, label, onClick, isActive = false }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
      }`}
      title={label}
    >
      {icon}
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Smart Formatting Toolbar */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/10 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Auto Format Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAutoFormat}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                autoFormat
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Auto Format
            </button>
            <span className="text-xs text-slate-400">
              {autoFormat ? 'Smart formatting enabled' : 'Manual formatting only'}
            </span>
          </div>

          <div className="w-px h-6 bg-slate-600"></div>

          {/* Text Formatting */}
          <div className="flex items-center gap-2">
            <FormatButton
              format="bold"
              icon={<Bold className="w-4 h-4" />}
              label="Bold"
              onClick={() => applyCustomFormat('bold')}
            />
            <FormatButton
              format="italic"
              icon={<Italic className="w-4 h-4" />}
              label="Italic"
              onClick={() => applyCustomFormat('italic')}
            />
            <FormatButton
              format="underline"
              icon={<Underline className="w-4 h-4" />}
              label="Underline"
              onClick={() => applyCustomFormat('underline')}
            />
            <FormatButton
              format="code"
              icon={<Code className="w-4 h-4" />}
              label="Code"
              onClick={() => applyCustomFormat('code')}
            />
          </div>

          <div className="w-px h-6 bg-slate-600"></div>

          {/* Headers */}
          <div className="flex items-center gap-2">
            <FormatButton
              format="heading1"
              icon={<Type className="w-4 h-4" />}
              label="Heading 1"
              onClick={() => applyCustomFormat('heading1')}
            />
            <FormatButton
              format="heading2"
              icon={<Type className="w-3 h-3" />}
              label="Heading 2"
              onClick={() => applyCustomFormat('heading2')}
            />
            <FormatButton
              format="heading3"
              icon={<Type className="w-2 h-2" />}
              label="Heading 3"
              onClick={() => applyCustomFormat('heading3')}
            />
          </div>

          <div className="w-px h-6 bg-slate-600"></div>

          {/* Lists */}
          <div className="flex items-center gap-2">
            <FormatButton
              format="list"
              icon={<List className="w-4 h-4" />}
              label="Bullet List"
              onClick={() => applyCustomFormat('list')}
            />
            <FormatButton
              format="numbered"
              icon={<ListOrdered className="w-4 h-4" />}
              label="Numbered List"
              onClick={() => applyCustomFormat('numbered')}
            />
            <FormatButton
              format="quote"
              icon={<Quote className="w-4 h-4" />}
              label="Quote"
              onClick={() => applyCustomFormat('quote')}
            />
          </div>

          <div className="w-px h-6 bg-slate-600"></div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-200"
              title={showPreview ? "Hide Preview" : "Show Preview"}
            >
              {showPreview ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Smart Formatting Info */}
        {autoFormat && (
          <div className="p-4 rounded-xl bg-slate-800/30 border border-cyan-500/20">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-cyan-400 mt-0.5" />
              <div>
                <h4 className="text-cyan-400 font-semibold mb-1">Smart Formatting Active</h4>
                <p className="text-slate-300 text-sm">
                  Automatically detects and formats: Headings, Lists, Quotes, Code, Emails, 
                  Phone numbers, URLs, Currency, Dates, and Important text.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor and Preview */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Text Editor */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Type className="w-5 h-5 text-cyan-400" />
            Smart Text Editor
          </h3>
          <textarea
            id="smart-formatter-textarea"
            value={formattedText}
            onChange={(e) => setFormattedText(e.target.value)}
            className="w-full h-96 p-4 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500/50"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              color: textColor,
              backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor
            }}
            placeholder="Your text will be automatically formatted... Use the toolbar for manual formatting."
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-400" />
              Live Preview
            </h3>
            <div 
              className="w-full h-96 p-4 bg-slate-800/50 border border-white/10 rounded-xl overflow-y-auto"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                color: textColor,
                backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor
              }}
              dangerouslySetInnerHTML={{ __html: renderFormattedText(formattedText) }}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform"
        >
          <Sparkles className="w-5 h-5" />
          Save Smart Formatted Text
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-colors"
        >
          <Copy className="w-5 h-5" />
          Copy Text
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-colors"
        >
          <Download className="w-5 h-5" />
          Download
        </button>
        <button
          onClick={resetFormatting}
          className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 font-semibold transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>
    </div>
  )
}
