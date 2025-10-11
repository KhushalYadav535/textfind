import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Code, Copy, Check, Terminal, Key, Globe, Zap, FileText, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ApiDocumentation() {
  const [activeTab, setActiveTab] = useState('overview')
  const [copiedCode, setCopiedCode] = useState(null)
  const [activeLanguage, setActiveLanguage] = useState('javascript')

  const codeSnippets = {
    curl: `curl -X POST https://api.textvision.ai/v1/ocr \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://example.com/image.jpg",
    "languages": ["eng", "hin"],
    "options": {
      "confidence_threshold": 80,
      "preprocessing": true,
      "batch_mode": false
    }
  }'`,

    javascript: `const response = await fetch('https://api.textvision.ai/v1/ocr', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    image_url: 'https://example.com/image.jpg',
    languages: ['eng', 'hin'],
    options: {
      confidence_threshold: 80,
      preprocessing: true,
      batch_mode: false
    }
  })
});

const result = await response.json();
console.log(result.extracted_text);`,

    python: `import requests

url = "https://api.textvision.ai/v1/ocr"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "image_url": "https://example.com/image.jpg",
    "languages": ["eng", "hin"],
    "options": {
        "confidence_threshold": 80,
        "preprocessing": True,
        "batch_mode": False
    }
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result['extracted_text'])`,

    nodejs: `const axios = require('axios');

const options = {
  method: 'POST',
  url: 'https://api.textvision.ai/v1/ocr',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  data: {
    image_url: 'https://example.com/image.jpg',
    languages: ['eng', 'hin'],
    options: {
      confidence_threshold: 80,
      preprocessing: true,
      batch_mode: false
    }
  }
};

try {
  const response = await axios.request(options);
  console.log(response.data.extracted_text);
} catch (error) {
  console.error(error);
}`
  }

  const copyToClipboard = (code, key) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(key)
    toast.success('Code copied to clipboard!')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
        isActive
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )

  const CodeBlock = ({ code, language }) => (
    <div className="relative">
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2 rounded-t-xl border-b border-white/10">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400 text-sm">{language}</span>
        </div>
        <button
          onClick={() => copyToClipboard(code, language)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          {copiedCode === language ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>
      <pre className="bg-slate-900 p-6 rounded-b-xl overflow-x-auto text-sm text-slate-300">
        <code>{code}</code>
      </pre>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent mb-4">
          TextVision API Documentation
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
          Integrate powerful OCR capabilities into your applications with our RESTful API. 
          Extract text from images with industry-leading accuracy.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4">Quick Start</h3>
              <div className="space-y-2">
                <TabButton
                  id="overview"
                  label="Overview"
                  icon={<Globe className="w-4 h-4" />}
                  isActive={activeTab === 'overview'}
                  onClick={() => setActiveTab('overview')}
                />
                <TabButton
                  id="authentication"
                  label="Authentication"
                  icon={<Key className="w-4 h-4" />}
                  isActive={activeTab === 'authentication'}
                  onClick={() => setActiveTab('authentication')}
                />
                <TabButton
                  id="endpoints"
                  label="Endpoints"
                  icon={<Zap className="w-4 h-4" />}
                  isActive={activeTab === 'endpoints'}
                  onClick={() => setActiveTab('endpoints')}
                />
                <TabButton
                  id="examples"
                  label="Code Examples"
                  icon={<Code className="w-4 h-4" />}
                  isActive={activeTab === 'examples'}
                  onClick={() => setActiveTab('examples')}
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4">API Status</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm">All systems operational</span>
              </div>
              <p className="text-slate-400 text-xs mt-2">99.9% uptime</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="space-y-8">
            {/* Overview */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-amber-500/10 border border-white/10 backdrop-blur-sm">
                  <h2 className="text-3xl font-bold text-white mb-4">Getting Started</h2>
                  <p className="text-slate-300 mb-6">
                    The TextVision API allows you to extract text from images using advanced OCR technology. 
                    Simply send an image URL or upload a file, and receive the extracted text with confidence scores.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">Fast Processing</h3>
                      <p className="text-slate-400 text-sm">Average response time under 2 seconds</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">High Accuracy</h3>
                      <p className="text-slate-400 text-sm">99.5% accuracy on clear images</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">Multi-Language</h3>
                      <p className="text-slate-400 text-sm">Support for 100+ languages</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold text-white mb-4">Base URL</h2>
                  <div className="bg-slate-900 p-4 rounded-xl border border-white/10">
                    <code className="text-cyan-400">https://api.textvision.ai/v1</code>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Authentication */}
            {activeTab === 'authentication' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="p-8 rounded-3xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
                  <h2 className="text-3xl font-bold text-white mb-4">Authentication</h2>
                  <p className="text-slate-300 mb-6">
                    TextVision uses API keys to authenticate requests. Include your API key in the Authorization header.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Get Your API Key</h3>
                      <p className="text-slate-400 mb-4">
                        1. Sign up for a free account<br/>
                        2. Go to your dashboard<br/>
                        3. Navigate to API settings<br/>
                        4. Generate your API key
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Using Your API Key</h3>
                      <div className="bg-slate-900 p-4 rounded-xl border border-white/10">
                        <code className="text-slate-300">
                          Authorization: Bearer YOUR_API_KEY
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Endpoints */}
            {activeTab === 'endpoints' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="p-8 rounded-3xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
                  <h2 className="text-3xl font-bold text-white mb-6">API Endpoints</h2>
                  
                  <div className="space-y-6">
                    {/* OCR Endpoint */}
                    <div className="border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full font-mono">POST</span>
                        <code className="text-cyan-400">/ocr</code>
                      </div>
                      <p className="text-slate-300 mb-4">Extract text from an image using OCR</p>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-white font-semibold mb-2">Request Body</h4>
                          <div className="bg-slate-900 p-4 rounded-xl border border-white/10">
                            <pre className="text-sm text-slate-300">{`{
  "image_url": "string (required)",
  "languages": ["eng", "hin"],
  "options": {
    "confidence_threshold": 80,
    "preprocessing": true,
    "batch_mode": false
  }
}`}</pre>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-white font-semibold mb-2">Response</h4>
                          <div className="bg-slate-900 p-4 rounded-xl border border-white/10">
                            <pre className="text-sm text-slate-300">{`{
  "success": true,
  "extracted_text": "The extracted text content...",
  "confidence": 95.5,
  "language_detected": "eng",
  "processing_time": 1.2,
  "metadata": {
    "image_size": "1920x1080",
    "text_regions": 5
  }
}`}</pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Batch Processing */}
                    <div className="border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full font-mono">POST</span>
                        <code className="text-cyan-400">/batch</code>
                      </div>
                      <p className="text-slate-300 mb-4">Process multiple images in batch</p>
                      
                      <div className="bg-slate-900 p-4 rounded-xl border border-white/10">
                        <pre className="text-sm text-slate-300">{`{
  "images": [
    {"url": "https://example.com/image1.jpg"},
    {"url": "https://example.com/image2.jpg"}
  ],
  "languages": ["eng"],
  "options": {
    "confidence_threshold": 80
  }
}`}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Code Examples */}
            {activeTab === 'examples' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="p-8 rounded-3xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
                  <h2 className="text-3xl font-bold text-white mb-6">Code Examples</h2>
                  
                  {/* Language Tabs */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {Object.keys(codeSnippets).map(lang => (
                      <button
                        key={lang}
                        onClick={() => setActiveLanguage(lang)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          activeLanguage === lang
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </button>
                    ))}
                  </div>

                  <CodeBlock 
                    code={codeSnippets[activeLanguage]} 
                    language={activeLanguage} 
                  />

                  <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <h3 className="text-xl font-bold text-white mb-3">Response Example</h3>
                    <div className="bg-slate-900 p-4 rounded-xl border border-white/10">
                      <pre className="text-sm text-slate-300">{`{
  "success": true,
  "extracted_text": "Hello World! This is extracted text from the image.",
  "confidence": 95.5,
  "language_detected": "eng",
  "processing_time": 1.2,
  "metadata": {
    "image_size": "1920x1080",
    "text_regions": 2,
    "characters_detected": 47
  },
  "request_id": "req_123456789"
}`}</pre>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold text-white mb-4">SDK Downloads</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <button className="flex items-center gap-3 p-4 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-white/10 transition-all">
                      <Download className="w-5 h-5 text-cyan-400" />
                      <div className="text-left">
                        <div className="text-white font-medium">JavaScript SDK</div>
                        <div className="text-slate-400 text-sm">npm install textvision-js</div>
                      </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-white/10 transition-all">
                      <Download className="w-5 h-5 text-cyan-400" />
                      <div className="text-left">
                        <div className="text-white font-medium">Python SDK</div>
                        <div className="text-slate-400 text-sm">pip install textvision</div>
                      </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-white/10 transition-all">
                      <Download className="w-5 h-5 text-cyan-400" />
                      <div className="text-left">
                        <div className="text-white font-medium">PHP SDK</div>
                        <div className="text-slate-400 text-sm">composer require textvision/php</div>
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
