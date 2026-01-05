import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Download, 
  Share2, 
  FileText, 
  FileSpreadsheet, 
  FileImage, 
  Mail,
  Link,
  QrCode,
  Copy,
  Check,
  Calendar,
  User,
  Globe,
  Lock,
  Eye,
  Settings,
  Zap,
  Cloud,
  Database
} from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  exportToTXT, 
  exportToPDF, 
  exportToDOCX, 
  exportToCSV, 
  exportToJSON, 
  exportToHTML,
  generateQRCode as generateQRCodeUtil
} from '../../utils/exportUtils'

export default function ExportManager({ documentData, onExport }) {
  const [activeTab, setActiveTab] = useState('export')
  const [selectedFormat, setSelectedFormat] = useState('txt')
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    includeImages: false,
    includeConfidence: true,
    format: 'formatted'
  })
  const [shareSettings, setShareSettings] = useState({
    visibility: 'private',
    expires: null,
    password: '',
    allowComments: true,
    allowDownload: true
  })

  const formats = [
    { id: 'txt', name: 'Plain Text', icon: <FileText className="w-5 h-5" />, description: 'Simple text file (.txt)' },
    { id: 'pdf', name: 'PDF Document', icon: <FileText className="w-5 h-5" />, description: 'Portable document format' },
    { id: 'docx', name: 'Word Document', icon: <FileText className="w-5 h-5" />, description: 'Microsoft Word format' },
    { id: 'csv', name: 'CSV Spreadsheet', icon: <FileSpreadsheet className="w-5 h-5" />, description: 'Comma-separated values' },
    { id: 'json', name: 'JSON Data', icon: <Database className="w-5 h-5" />, description: 'Structured data format' },
    { id: 'html', name: 'HTML Webpage', icon: <Globe className="w-5 h-5" />, description: 'Web page format' }
  ]

  const handleExport = async () => {
    try {
      const filename = documentData.metadata?.filename?.replace(/\.[^/.]+$/, "") || 'document';
      const text = documentData.text || '';
      
      const exportOptions_full = {
        includeMetadata: exportOptions.includeMetadata,
        includeConfidence: exportOptions.includeConfidence,
        includeImages: exportOptions.includeImages,
        metadata: documentData.metadata,
        confidence: documentData.confidence,
        format: exportOptions.format
      };

      toast.loading(`Exporting as ${selectedFormat.toUpperCase()}...`, { id: 'exporting' });

      switch (selectedFormat) {
        case 'txt':
          await exportToTXT(text, filename, exportOptions_full);
          break;
        case 'pdf':
          await exportToPDF(text, filename, exportOptions_full);
          break;
        case 'docx':
          await exportToDOCX(text, filename, exportOptions_full);
          break;
        case 'csv':
          await exportToCSV(text, filename, exportOptions_full);
          break;
        case 'json':
          await exportToJSON(text, filename, exportOptions_full);
          break;
        case 'html':
          await exportToHTML(text, filename, exportOptions_full);
          break;
        default:
          throw new Error('Unsupported format');
      }

      toast.success(`Exported as ${selectedFormat.toUpperCase()}!`, { id: 'exporting' });
      
      if (onExport) {
        onExport({ format: selectedFormat, options: exportOptions_full });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message}`, { id: 'exporting' });
    }
  }

  const generateShareLink = () => {
    const shareId = Math.random().toString(36).substring(7)
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/shared/${shareId}`
    
    navigator.clipboard.writeText(shareUrl)
    toast.success('Share link copied to clipboard!')
    return shareUrl
  }

  const sendViaEmail = () => {
    const email = prompt('Enter email address:')
    if (email) {
      toast.success(`Document sent to ${email}`)
    }
  }

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const handleGenerateQRCode = async () => {
    try {
      const shareUrl = generateShareLink();
      const qrDataUrl = await generateQRCodeUtil(shareUrl);
      setQrCodeDataUrl(qrDataUrl);
      setShowQRModal(true);
    } catch (error) {
      console.error('QR Code generation error:', error);
      toast.error('Failed to generate QR code');
    }
  }

  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
        isActive
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )

  const FormatCard = ({ format, isSelected, onSelect }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(format.id)}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-cyan-500/50 bg-cyan-500/10'
          : 'border-white/10 bg-slate-800/30 hover:border-white/20'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${
          isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-400'
        }`}>
          {format.icon}
        </div>
        <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
          {format.name}
        </h3>
      </div>
      <p className="text-slate-400 text-sm">{format.description}</p>
    </motion.div>
  )

  return (
    <div className="w-full max-w-4xl bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Download className="w-6 h-6 text-cyan-400" />
            Export & Share
          </h2>
          <div className="flex gap-2">
            <TabButton
              id="export"
              label="Export"
              icon={<Download className="w-4 h-4" />}
              isActive={activeTab === 'export'}
              onClick={() => setActiveTab('export')}
            />
            <TabButton
              id="share"
              label="Share"
              icon={<Share2 className="w-4 h-4" />}
              isActive={activeTab === 'share'}
              onClick={() => setActiveTab('share')}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'export' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Format Selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Choose Export Format</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formats.map(format => (
                  <FormatCard
                    key={format.id}
                    format={format}
                    isSelected={selectedFormat === format.id}
                    onSelect={setSelectedFormat}
                  />
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="p-4 bg-slate-800/30 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Export Options</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-white font-medium">Include Metadata</label>
                    <p className="text-slate-400 text-sm">Add file info, processing date, etc.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeMetadata}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-white font-medium">Include Confidence Scores</label>
                    <p className="text-slate-400 text-sm">Add accuracy percentages for each text block</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeConfidence}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeConfidence: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-white font-medium">Include Original Images</label>
                    <p className="text-slate-400 text-sm">Embed source images in the export</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeImages}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeImages: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Text Formatting</label>
                  <select
                    value={exportOptions.format}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="formatted">Preserve Formatting</option>
                    <option value="plain">Plain Text Only</option>
                    <option value="structured">Structured Layout</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform"
              >
                <Download className="w-5 h-5" />
                Export Document
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'share' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Share Methods */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Share Your Document</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={generateShareLink}
                  className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="p-3 rounded-xl bg-cyan-500/20">
                    <Link className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-medium">Share Link</h4>
                    <p className="text-slate-400 text-sm">Generate a shareable URL</p>
                  </div>
                </button>

                <button
                  onClick={sendViaEmail}
                  className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <Mail className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-medium">Email</h4>
                    <p className="text-slate-400 text-sm">Send via email</p>
                  </div>
                </button>

                <button
                  onClick={handleGenerateQRCode}
                  className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <QrCode className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-medium">QR Code</h4>
                    <p className="text-slate-400 text-sm">Generate QR code for mobile</p>
                  </div>
                </button>

                <button className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-white/10 hover:border-white/20 transition-all">
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <Cloud className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-medium">Cloud Storage</h4>
                    <p className="text-slate-400 text-sm">Save to Google Drive, Dropbox</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Share Settings */}
            <div className="p-4 bg-slate-800/30 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Share Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Visibility</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={shareSettings.visibility === 'private'}
                        onChange={(e) => setShareSettings(prev => ({ ...prev, visibility: e.target.value }))}
                        className="text-cyan-500"
                      />
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Private</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={shareSettings.visibility === 'public'}
                        onChange={(e) => setShareSettings(prev => ({ ...prev, visibility: e.target.value }))}
                        className="text-cyan-500"
                      />
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Public</span>
                    </label>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Expiration</label>
                    <select
                      value={shareSettings.expires || ''}
                      onChange={(e) => setShareSettings(prev => ({ ...prev, expires: e.target.value || null }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Never</option>
                      <option value="1h">1 Hour</option>
                      <option value="1d">1 Day</option>
                      <option value="1w">1 Week</option>
                      <option value="1m">1 Month</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Password (Optional)</label>
                    <input
                      type="password"
                      value={shareSettings.password}
                      onChange={(e) => setShareSettings(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Set password"
                      className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Allow Comments</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shareSettings.allowComments}
                        onChange={(e) => setShareSettings(prev => ({ ...prev, allowComments: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white">Allow Download</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shareSettings.allowDownload}
                        onChange={(e) => setShareSettings(prev => ({ ...prev, allowDownload: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && qrCodeDataUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <img src={qrCodeDataUrl} alt="QR Code" className="w-64 h-64" />
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = qrCodeDataUrl;
                  a.download = 'qrcode.png';
                  a.click();
                }}
                className="px-4 py-2 bg-cyan-500 rounded-xl text-white hover:bg-cyan-600 transition-colors"
              >
                Download QR Code
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
