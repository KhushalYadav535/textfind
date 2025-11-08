import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered,
  Quote,
  Code,
  Palette,
  Type,
  Save,
  Copy,
  Download,
  RotateCcw,
  Eye,
  EyeOff,
  Settings,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function FormattedTextEditor({ 
  initialText = '', 
  onSave, 
  onCopy, 
  className = '' 
}) {
  const [text, setText] = useState(initialText)
  const [formattedText, setFormattedText] = useState(initialText)
  const [showPreview, setShowPreview] = useState(true)
  const [activeFormat, setActiveFormat] = useState(null)
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState('Inter')
  const [lineHeight, setLineHeight] = useState(1.6)
  const [textColor, setTextColor] = useState('#ffffff')
  const [backgroundColor, setBackgroundColor] = useState('transparent')
  const [showSettings, setShowSettings] = useState(false)

  const fonts = [
    'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 
    'Verdana', 'Courier New', 'Monaco', 'Roboto', 'Open Sans'
  ]

  const colors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', 
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
  ]

  const backgrounds = [
    'transparent', '#1e293b', '#0f172a', '#334155', '#475569',
    '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'
  ]

  useEffect(() => {
    setText(initialText)
    setFormattedText(initialText)
  }, [initialText])

  const formatText = (format) => {
    const textarea = document.getElementById('formatted-textarea')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = text.substring(start, end)
    
    if (!selectedText) {
      toast.error('Please select text to format')
      return
    }

    let formattedSelection = selectedText
    let newText = text

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

    newText = text.substring(0, start) + formattedSelection + text.substring(end)
    setText(newText)
    setActiveFormat(format)
    
    // Update cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + formattedSelection.length, start + formattedSelection.length)
    }, 0)
  }

  const applyAlignment = (alignment) => {
    const textarea = document.getElementById('formatted-textarea')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = text.substring(start, end)
    
    if (!selectedText) {
      toast.error('Please select text to align')
      return
    }

    let alignedText = selectedText
    switch (alignment) {
      case 'left':
        alignedText = selectedText.replace(/^>\s*/gm, '')
        break
      case 'center':
        alignedText = selectedText.split('\n').map(line => `> ${line}`).join('\n')
        break
      case 'right':
        alignedText = selectedText.split('\n').map(line => `>> ${line}`).join('\n')
        break
    }

    const newText = text.substring(0, start) + alignedText + text.substring(end)
    setText(newText)
  }

  const renderFormattedText = (rawText) => {
    let formatted = rawText;
    
    // Markdown Tables - Convert to HTML tables
    const tableRegex = /(\|.+\|)\n(\|[-:\s|]+\|)\n((?:\|.+\|\n?)+)/g;
    formatted = formatted.replace(tableRegex, (match, header, separator, rows) => {
      // Parse header
      const headers = header.split('|').map(h => h.trim()).filter(h => h);
      const headerCells = headers.map(h => `<th class="px-3 py-2 bg-slate-700 text-left font-semibold text-cyan-400 border border-slate-600">${h}</th>`).join('');
      
      // Parse rows
      const rowLines = rows.trim().split('\n').filter(line => line.trim());
      const tableRows = rowLines.map(row => {
        const cells = row.split('|').map(c => c.trim()).filter(c => c);
        const rowCells = cells.map(c => `<td class="px-3 py-2 border border-slate-600 text-slate-300">${c}</td>`).join('');
        return `<tr>${rowCells}</tr>`;
      }).join('');
      
      return `<div class="overflow-x-auto my-3"><table class="border-collapse border border-slate-600"><thead><tr>${headerCells}</tr></thead><tbody>${tableRows}</tbody></table></div>`;
    });
    
    // Headers
    formatted = formatted
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-cyan-400 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-amber-400 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-purple-400 mb-4">$1</h1>')
      
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>')
      
      // Code
      .replace(/`(.*?)`/g, '<code class="bg-slate-800 text-cyan-400 px-2 py-1 rounded text-sm font-mono">$1</code>')
      
      // Underline
      .replace(/<u>(.*?)<\/u>/g, '<u class="underline text-yellow-400">$1</u>')
      
      // Quotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-cyan-500 pl-4 italic text-slate-300 my-2">$1</blockquote>')
      .replace(/^>> (.*$)/gim, '<div class="text-right text-slate-300 my-2">$1</div>')
      
      // Lists
      .replace(/^1\. (.*$)/gim, '<li class="list-decimal list-inside text-slate-300 my-1">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="list-disc list-inside text-slate-300 my-1">$1</li>')
      
      // Preserve spacing between paragraphs
      .replace(/\n\n+/g, '</p><p class="mb-2 text-slate-300">')
      
      // Line breaks
      .replace(/\n/g, '<br>');
    
    return formatted;
  }

  const handleSave = () => {
    if (onSave) {
      onSave(formattedText)
    }
    toast.success('Formatted text saved!')
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
    element.download = 'formatted-text.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('Text downloaded!')
  }

  const resetFormatting = () => {
    setText(initialText)
    setFormattedText(initialText)
    toast.success('Formatting reset!')
  }

  const FormatButton = ({ format, icon, label, onClick }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-all duration-200 ${
        activeFormat === format
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
      }`}
      title={label}
    >
      {icon}
    </button>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Text Formatting */}
          <div className="flex items-center gap-2">
            <FormatButton
              format="bold"
              icon={<Bold className="w-4 h-4" />}
              label="Bold"
              onClick={() => formatText('bold')}
            />
            <FormatButton
              format="italic"
              icon={<Italic className="w-4 h-4" />}
              label="Italic"
              onClick={() => formatText('italic')}
            />
            <FormatButton
              format="underline"
              icon={<Underline className="w-4 h-4" />}
              label="Underline"
              onClick={() => formatText('underline')}
            />
            <FormatButton
              format="code"
              icon={<Code className="w-4 h-4" />}
              label="Code"
              onClick={() => formatText('code')}
            />
          </div>

          <div className="w-px h-6 bg-slate-600"></div>

          {/* Headers */}
          <div className="flex items-center gap-2">
            <FormatButton
              format="heading1"
              icon={<Type className="w-4 h-4" />}
              label="Heading 1"
              onClick={() => formatText('heading1')}
            />
            <FormatButton
              format="heading2"
              icon={<Type className="w-3 h-3" />}
              label="Heading 2"
              onClick={() => formatText('heading2')}
            />
            <FormatButton
              format="heading3"
              icon={<Type className="w-2 h-2" />}
              label="Heading 3"
              onClick={() => formatText('heading3')}
            />
          </div>

          <div className="w-px h-6 bg-slate-600"></div>

          {/* Alignment */}
          <div className="flex items-center gap-2">
            <FormatButton
              format="left"
              icon={<AlignLeft className="w-4 h-4" />}
              label="Align Left"
              onClick={() => applyAlignment('left')}
            />
            <FormatButton
              format="center"
              icon={<AlignCenter className="w-4 h-4" />}
              label="Align Center"
              onClick={() => applyAlignment('center')}
            />
            <FormatButton
              format="right"
              icon={<AlignRight className="w-4 h-4" />}
              label="Align Right"
              onClick={() => applyAlignment('right')}
            />
          </div>

          <div className="w-px h-6 bg-slate-600"></div>

          {/* Lists */}
          <div className="flex items-center gap-2">
            <FormatButton
              format="list"
              icon={<List className="w-4 h-4" />}
              label="Bullet List"
              onClick={() => formatText('list')}
            />
            <FormatButton
              format="numbered"
              icon={<ListOrdered className="w-4 h-4" />}
              label="Numbered List"
              onClick={() => formatText('numbered')}
            />
            <FormatButton
              format="quote"
              icon={<Quote className="w-4 h-4" />}
              label="Quote"
              onClick={() => formatText('quote')}
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
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-200"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-white/10 space-y-4"
          >
            <div className="grid md:grid-cols-3 gap-4">
              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white"
                >
                  {fonts.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Font Size</label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-slate-400 text-center">{fontSize}px</div>
              </div>

              {/* Line Height */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Line Height</label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-slate-400 text-center">{lineHeight}</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Text Color */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Text Color</label>
                <div className="flex gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className={`w-8 h-8 rounded-lg border-2 ${
                        textColor === color ? 'border-white' : 'border-slate-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Background</label>
                <div className="flex gap-2">
                  {backgrounds.map(bg => (
                    <button
                      key={bg}
                      onClick={() => setBackgroundColor(bg)}
                      className={`w-8 h-8 rounded-lg border-2 ${
                        backgroundColor === bg ? 'border-white' : 'border-slate-600'
                      }`}
                      style={{ 
                        backgroundColor: bg === 'transparent' ? 'transparent' : bg,
                        borderColor: bg === 'transparent' ? '#64748b' : bg
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Editor and Preview */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Text Editor */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Type className="w-5 h-5 text-cyan-400" />
            Text Editor
          </h3>
          <textarea
            id="formatted-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-96 p-4 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-500/50"
            style={{
              fontFamily: fontFamily,
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              color: textColor,
              backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor
            }}
            placeholder="Type your text here... Use formatting buttons to style your text."
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
                fontFamily: fontFamily,
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                color: textColor,
                backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor
              }}
              dangerouslySetInnerHTML={{ __html: renderFormattedText(text) }}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform"
        >
          <Save className="w-5 h-5" />
          Save Formatted Text
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
