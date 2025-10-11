import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Save,
  Undo,
  Redo,
  Download,
  Eye,
  Search,
  Replace,
  Type,
  Palette,
  FileText,
  SpellCheck
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdvancedTextEditor({ initialText = '', onSave, onExport }) {
  const editorRef = useRef(null)
  const [content, setContent] = useState(initialText)
  const [history, setHistory] = useState([initialText])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [showSearchReplace, setShowSearchReplace] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState('Inter')
  const [textColor, setTextColor] = useState('#ffffff')
  const [highlightColor, setHighlightColor] = useState('#ffff00')

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }, [])

  const saveToHistory = (newContent) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newContent)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleContentChange = (e) => {
    const newContent = e.target.value
    setContent(newContent)
    if (onSave) onSave(newContent)
  }

  const executeCommand = (command, value = null) => {
    editorRef.current.focus()
    document.execCommand(command, false, value)
    
    // Save to history after command
    setTimeout(() => {
      const newContent = editorRef.current.innerHTML
      saveToHistory(newContent)
      setContent(newContent)
    }, 100)
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setContent(history[newIndex])
      if (editorRef.current) {
        editorRef.current.innerHTML = history[newIndex]
      }
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setContent(history[newIndex])
      if (editorRef.current) {
        editorRef.current.innerHTML = history[newIndex]
      }
    }
  }

  const handleSearch = () => {
    if (!searchTerm) return
    
    const text = editorRef.current.innerText
    const regex = new RegExp(searchTerm, 'gi')
    const matches = text.match(regex)
    
    if (matches) {
      toast.success(`Found ${matches.length} matches`)
      // Highlight matches
      const highlightedText = text.replace(regex, `<mark style="background-color: ${highlightColor}">$&</mark>`)
      editorRef.current.innerHTML = highlightedText
    } else {
      toast.error('No matches found')
    }
  }

  const handleReplace = () => {
    if (!searchTerm || !replaceTerm) return
    
    const text = editorRef.current.innerText
    const regex = new RegExp(searchTerm, 'gi')
    const newText = text.replace(regex, replaceTerm)
    
    editorRef.current.innerText = newText
    setContent(newText)
    toast.success('Replace completed')
  }

  const exportToFile = (format) => {
    const text = editorRef.current.innerText
    let mimeType, extension, content
    
    switch (format) {
      case 'txt':
        mimeType = 'text/plain'
        extension = '.txt'
        content = text
        break
      case 'html':
        mimeType = 'text/html'
        extension = '.html'
        content = editorRef.current.innerHTML
        break
      case 'md':
        mimeType = 'text/markdown'
        extension = '.md'
        content = text
        break
      default:
        return
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `document${extension}`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success(`Exported as ${format.toUpperCase()}`)
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      executeCommand('createLink', url)
    }
  }

  const insertImage = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      executeCommand('insertImage', url)
    }
  }

  const ToolbarButton = ({ icon, onClick, active = false, title }) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all ${
        active
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          : 'text-slate-400 hover:text-white hover:bg-white/10'
      }`}
    >
      {icon}
    </button>
  )

  return (
    <div className="w-full h-full bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-white/10 bg-slate-800/30">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* File Operations */}
          <div className="flex gap-1">
            <ToolbarButton icon={<Save className="w-4 h-4" />} onClick={() => toast.success('Saved!')} title="Save" />
            <ToolbarButton icon={<Undo className="w-4 h-4" />} onClick={undo} title="Undo" />
            <ToolbarButton icon={<Redo className="w-4 h-4" />} onClick={redo} title="Redo" />
          </div>

          <div className="w-px h-6 bg-white/20 mx-2" />

          {/* Text Formatting */}
          <div className="flex gap-1">
            <ToolbarButton 
              icon={<Bold className="w-4 h-4" />} 
              onClick={() => executeCommand('bold')} 
              title="Bold" 
            />
            <ToolbarButton 
              icon={<Italic className="w-4 h-4" />} 
              onClick={() => executeCommand('italic')} 
              title="Italic" 
            />
            <ToolbarButton 
              icon={<Underline className="w-4 h-4" />} 
              onClick={() => executeCommand('underline')} 
              title="Underline" 
            />
          </div>

          <div className="w-px h-6 bg-white/20 mx-2" />

          {/* Alignment */}
          <div className="flex gap-1">
            <ToolbarButton 
              icon={<AlignLeft className="w-4 h-4" />} 
              onClick={() => executeCommand('justifyLeft')} 
              title="Align Left" 
            />
            <ToolbarButton 
              icon={<AlignCenter className="w-4 h-4" />} 
              onClick={() => executeCommand('justifyCenter')} 
              title="Align Center" 
            />
            <ToolbarButton 
              icon={<AlignRight className="w-4 h-4" />} 
              onClick={() => executeCommand('justifyRight')} 
              title="Align Right" 
            />
            <ToolbarButton 
              icon={<AlignJustify className="w-4 h-4" />} 
              onClick={() => executeCommand('justifyFull')} 
              title="Justify" 
            />
          </div>

          <div className="w-px h-6 bg-white/20 mx-2" />

          {/* Lists */}
          <div className="flex gap-1">
            <ToolbarButton 
              icon={<List className="w-4 h-4" />} 
              onClick={() => executeCommand('insertUnorderedList')} 
              title="Bullet List" 
            />
            <ToolbarButton 
              icon={<ListOrdered className="w-4 h-4" />} 
              onClick={() => executeCommand('insertOrderedList')} 
              title="Numbered List" 
            />
            <ToolbarButton 
              icon={<Quote className="w-4 h-4" />} 
              onClick={() => executeCommand('formatBlock', 'blockquote')} 
              title="Quote" 
            />
          </div>

          <div className="w-px h-6 bg-white/20 mx-2" />

          {/* Insert */}
          <div className="flex gap-1">
            <ToolbarButton 
              icon={<Link className="w-4 h-4" />} 
              onClick={insertLink} 
              title="Insert Link" 
            />
            <ToolbarButton 
              icon={<Image className="w-4 h-4" />} 
              onClick={insertImage} 
              title="Insert Image" 
            />
            <ToolbarButton 
              icon={<Code className="w-4 h-4" />} 
              onClick={() => executeCommand('formatBlock', 'pre')} 
              title="Code Block" 
            />
          </div>

          <div className="w-px h-6 bg-white/20 mx-2" />

          {/* Tools */}
          <div className="flex gap-1">
            <ToolbarButton 
              icon={<Search className="w-4 h-4" />} 
              onClick={() => setShowSearchReplace(!showSearchReplace)} 
              title="Search & Replace" 
            />
            <ToolbarButton 
              icon={<Eye className="w-4 h-4" />} 
              onClick={() => setShowPreview(!showPreview)} 
              active={showPreview}
              title="Preview" 
            />
          </div>
        </div>

        {/* Font Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-slate-400" />
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value)
                document.execCommand('fontName', false, e.target.value)
              }}
              className="px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-sm"
            >
              <option value="Inter">Inter</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="12"
              max="48"
              value={fontSize}
              onChange={(e) => {
                setFontSize(parseInt(e.target.value))
                document.execCommand('fontSize', false, e.target.value)
              }}
              className="w-20"
            />
            <span className="text-slate-400 text-sm w-8">{fontSize}px</span>
          </div>

          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-slate-400" />
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value)
                document.execCommand('foreColor', false, e.target.value)
              }}
              className="w-8 h-8 rounded border border-white/10"
            />
          </div>
        </div>

        {/* Search & Replace */}
        {showSearchReplace && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-white/10"
          >
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded text-white placeholder-slate-400"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Replace with..."
                  value={replaceTerm}
                  onChange={(e) => setReplaceTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded text-white placeholder-slate-400"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-cyan-400 transition-colors"
              >
                Find
              </button>
              <button
                onClick={handleReplace}
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded text-amber-400 transition-colors"
              >
                Replace
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex">
        {/* Main Editor */}
        <div className="flex-1 p-6">
          <div
            ref={editorRef}
            contentEditable
            dangerouslySetInnerHTML={{ __html: content }}
            onInput={handleContentChange}
            className="w-full h-full min-h-96 p-4 bg-slate-800/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 overflow-y-auto prose prose-invert max-w-none"
            style={{
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily,
              color: textColor,
              lineHeight: '1.6'
            }}
          />
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            className="w-80 border-l border-white/10 p-4 bg-slate-800/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold">Preview</h3>
            </div>
            <div 
              className="prose prose-invert max-w-none text-white"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </motion.div>
        )}
      </div>

      {/* Export Options */}
      <div className="p-4 border-t border-white/10 bg-slate-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-sm">
              {content.length} characters
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => exportToFile('txt')}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 border border-white/10 rounded text-white text-sm transition-colors"
            >
              Export TXT
            </button>
            <button
              onClick={() => exportToFile('html')}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 border border-white/10 rounded text-white text-sm transition-colors"
            >
              Export HTML
            </button>
            <button
              onClick={() => exportToFile('md')}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 border border-white/10 rounded text-white text-sm transition-colors"
            >
              Export MD
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
