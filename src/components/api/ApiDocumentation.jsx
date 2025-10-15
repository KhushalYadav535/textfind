import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Code, Copy, Check, Terminal, Key, Globe, Zap, FileText, Download, TestTube, Play, BookOpen, Shield, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ApiDocumentation() {
  const [activeTab, setActiveTab] = useState('overview')
  const [copiedCode, setCopiedCode] = useState(null)
  const [activeLanguage, setActiveLanguage] = useState('javascript')

  const codeSnippets = {
    curl: `# Basic OCR Request
curl -X POST https://api.textmitra.ai/v1/ocr \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://example.com/document.jpg",
    "languages": ["eng", "hin"],
    "options": {
      "confidence_threshold": 80,
      "preprocessing": true,
      "output_format": "structured",
      "include_metadata": true
    }
  }'

# Batch Processing
curl -X POST https://api.textmitra.ai/v1/batch \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "images": [
      {"url": "https://example.com/doc1.jpg"},
      {"url": "https://example.com/doc2.pdf"}
    ],
    "languages": ["eng"],
    "options": {
      "confidence_threshold": 85,
      "parallel_processing": true
    }
  }'`,

    javascript: `// Using our official JavaScript SDK
import { TextMitraAPI } from 'textmitra-js';

const client = new TextMitraAPI('YOUR_API_KEY');

// Basic OCR
const result = await client.extractText({
  image_url: 'https://example.com/document.jpg',
  languages: ['eng', 'hin'],
  options: {
    confidence_threshold: 80,
    preprocessing: true,
    output_format: 'structured'
  }
});

console.log('Extracted Text:', result.extracted_text);
console.log('Confidence:', result.confidence);

// Batch Processing
const batchResult = await client.batchProcess({
  images: [
    'https://example.com/doc1.jpg',
    'https://example.com/doc2.pdf'
  ],
  languages: ['eng'],
  options: {
    confidence_threshold: 85
  }
});

// File Upload
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
const uploadResult = await client.uploadAndProcess(file, ['eng'], {
  confidence_threshold: 90
});`,

    python: `# Using our official Python SDK
from textmitra import TextMitraAPI

client = TextMitraAPI(api_key='YOUR_API_KEY')

# Basic OCR
result = client.extract_text(
    image_url='https://example.com/document.jpg',
    languages=['eng', 'hin'],
    options={
        'confidence_threshold': 80,
        'preprocessing': True,
        'output_format': 'structured'
    }
)

print(f"Extracted Text: {result.extracted_text}")
print(f"Confidence: {result.confidence}%")

# Batch Processing
batch_result = client.batch_process(
    images=[
        'https://example.com/doc1.jpg',
        'https://example.com/doc2.pdf'
    ],
    languages=['eng'],
    options={'confidence_threshold': 85}
)

# File Upload
with open('document.pdf', 'rb') as file:
    upload_result = client.upload_and_process(
        file, 
        languages=['eng'], 
        options={'confidence_threshold': 90}
    )`,

    php: `<?php
// Using our official PHP SDK
use TextMitra\\TextMitraAPI;

$client = new TextMitraAPI('YOUR_API_KEY');

// Basic OCR
$result = $client->extractText([
    'image_url' => 'https://example.com/document.jpg',
    'languages' => ['eng', 'hin'],
    'options' => [
        'confidence_threshold' => 80,
        'preprocessing' => true,
        'output_format' => 'structured'
    ]
]);

echo "Extracted Text: " . $result['extracted_text'] . PHP_EOL;
echo "Confidence: " . $result['confidence'] . "%" . PHP_EOL;

// Batch Processing
$batchResult = $client->batchProcess([
    'images' => [
        'https://example.com/doc1.jpg',
        'https://example.com/doc2.pdf'
    ],
    'languages' => ['eng'],
    'options' => ['confidence_threshold' => 85]
]);

// File Upload
$file = file_get_contents('document.pdf');
$uploadResult = $client->uploadAndProcess($file, ['eng'], [
    'confidence_threshold' => 90
]);
?>`
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
                  TextMitra API Documentation
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
                <TabButton
                  id="playground"
                  label="API Playground"
                  icon={<Play className="w-4 h-4" />}
                  isActive={activeTab === 'playground'}
                  onClick={() => setActiveTab('playground')}
                />
                <TabButton
                  id="guides"
                  label="Guides"
                  icon={<BookOpen className="w-4 h-4" />}
                  isActive={activeTab === 'guides'}
                  onClick={() => setActiveTab('guides')}
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4">API Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm">All systems operational</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Uptime: 99.9%</div>
                  <div>Response Time: 1.2s avg</div>
                  <div>Last Updated: 2 min ago</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4">Rate Limits</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Free Plan</span>
                  <span className="text-white">100 req/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pro Plan</span>
                  <span className="text-white">10,000 req/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Enterprise</span>
                  <span className="text-white">Unlimited</span>
                </div>
              </div>
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
                    The TextMitra API allows you to extract text from images using advanced OCR technology. 
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
                    <code className="text-cyan-400">https://api.textmitra.ai/v1</code>
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
                    TextMitra uses API keys to authenticate requests. Include your API key in the Authorization header.
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
                        <div className="text-slate-400 text-sm">npm install textmitra-js</div>
                      </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-white/10 transition-all">
                      <Download className="w-5 h-5 text-cyan-400" />
                      <div className="text-left">
                        <div className="text-white font-medium">Python SDK</div>
                        <div className="text-slate-400 text-sm">pip install textmitra</div>
                      </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-white/10 transition-all">
                      <Download className="w-5 h-5 text-cyan-400" />
                      <div className="text-left">
                        <div className="text-white font-medium">PHP SDK</div>
                        <div className="text-slate-400 text-sm">composer require textmitra/php</div>
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* API Playground */}
            {activeTab === 'playground' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="p-8 rounded-3xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
                  <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <TestTube className="w-8 h-8 text-cyan-400" />
                    API Playground
                  </h2>
                  
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Request Builder */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Request Builder</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-white font-medium mb-2">API Key</label>
                          <input
                            type="password"
                            placeholder="Enter your API key"
                            className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2">Image URL</label>
                          <input
                            type="url"
                            placeholder="https://example.com/document.jpg"
                            className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2">Languages</label>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="flex items-center gap-2">
                              <input type="checkbox" className="text-cyan-500" defaultChecked />
                              <span className="text-slate-300 text-sm">English</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" className="text-cyan-500" />
                              <span className="text-slate-300 text-sm">Hindi</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" className="text-cyan-500" />
                              <span className="text-slate-300 text-sm">Spanish</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" className="text-cyan-500" />
                              <span className="text-slate-300 text-sm">French</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2">Options</label>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">Confidence Threshold</span>
                              <span className="text-white font-medium">80%</span>
                            </div>
                            <input type="range" min="0" max="100" defaultValue="80" className="w-full" />
                            
                            <label className="flex items-center gap-3">
                              <input type="checkbox" defaultChecked className="text-cyan-500" />
                              <span className="text-slate-300">Enable Preprocessing</span>
                            </label>
                            
                            <label className="flex items-center gap-3">
                              <input type="checkbox" className="text-cyan-500" />
                              <span className="text-slate-300">Include Metadata</span>
                            </label>
                          </div>
                        </div>

                        <button className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform">
                          <Play className="w-5 h-5 inline mr-2" />
                          Test API Call
                        </button>
                      </div>
                    </div>

                    {/* Response */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Response</h3>
                      <div className="bg-slate-900 p-6 rounded-xl border border-white/10">
                        <pre className="text-sm text-slate-300 overflow-x-auto">
{`{
  "success": true,
  "extracted_text": "Sample extracted text from your document...",
  "confidence": 95.5,
  "language_detected": "eng",
  "processing_time": 1.2,
  "metadata": {
    "image_size": "1920x1080",
    "text_regions": 5,
    "characters_detected": 142
  },
  "request_id": "req_abc123def456"
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Guides */}
            {activeTab === 'guides' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="p-8 rounded-3xl bg-slate-800/30 border border-white/10 backdrop-blur-sm">
                  <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-cyan-400" />
                    Integration Guides
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-amber-500/10 border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600">
                          <Globe className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Web Integration</h3>
                      </div>
                      <p className="text-slate-300 mb-4">
                        Learn how to integrate TextMitra API into your web applications using JavaScript, React, or any frontend framework.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="text-slate-400">• React Integration</div>
                        <div className="text-slate-400">• Vue.js Setup</div>
                        <div className="text-slate-400">• Angular Implementation</div>
                        <div className="text-slate-400">• Vanilla JavaScript</div>
                      </div>
                      <button className="mt-4 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl text-cyan-400 text-sm transition-colors">
                        Read Guide
                      </button>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Backend Integration</h3>
                      </div>
                      <p className="text-slate-300 mb-4">
                        Integrate TextMitra API into your backend services using Python, Node.js, PHP, or other server-side technologies.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="text-slate-400">• Python Flask/Django</div>
                        <div className="text-slate-400">• Node.js Express</div>
                        <div className="text-slate-400">• PHP Laravel</div>
                        <div className="text-slate-400">• Ruby on Rails</div>
                      </div>
                      <button className="mt-4 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl text-amber-400 text-sm transition-colors">
                        Read Guide
                      </button>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-green-500/10 border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Mobile Apps</h3>
                      </div>
                      <p className="text-slate-300 mb-4">
                        Build mobile applications with OCR capabilities using our SDKs for iOS, Android, React Native, and Flutter.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="text-slate-400">• iOS Swift/Objective-C</div>
                        <div className="text-slate-400">• Android Kotlin/Java</div>
                        <div className="text-slate-400">• React Native</div>
                        <div className="text-slate-400">• Flutter</div>
                      </div>
                      <button className="mt-4 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-purple-400 text-sm transition-colors">
                        Read Guide
                      </button>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Advanced Usage</h3>
                      </div>
                      <p className="text-slate-300 mb-4">
                        Learn advanced features like batch processing, webhooks, custom models, and performance optimization.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="text-slate-400">• Batch Processing</div>
                        <div className="text-slate-400">• Webhook Integration</div>
                        <div className="text-slate-400">• Custom Models</div>
                        <div className="text-slate-400">• Performance Tips</div>
                      </div>
                      <button className="mt-4 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 text-sm transition-colors">
                        Read Guide
                      </button>
                    </div>
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
