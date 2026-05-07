import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Loader2, Shield, FileSearch, GitCompare, FileSpreadsheet, Sparkles, X, BookOpen, Zap, ListChecks, BarChart2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const AI_SERVER = `${import.meta.env.VITE_PYTHON_API || 'http://localhost:5000'}/api`;

// ─── Document Chat ────────────────────────────────────────────────────────────
export function DocumentChat({ documentText, isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'नमस्ते! इस document के बारे में कोई भी सवाल पूछें। Hello! Ask me anything about this document.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${AI_SERVER}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: documentText,
          messages: messages.slice(-4),
          question: userMsg.content
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || 'Error getting response' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-slate-900 border border-white/20 rounded-2xl shadow-2xl flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          <span className="text-white font-semibold">Document Chat</span>
          <span className="text-xs text-slate-400">(Mistral AI)</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <Bot className="w-5 h-5 text-purple-400 mt-1 shrink-0" />}
            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white'
                : 'bg-white/10 text-slate-200'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && <User className="w-5 h-5 text-cyan-400 mt-1 shrink-0" />}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 justify-start">
            <Bot className="w-5 h-5 text-purple-400 mt-1" />
            <div className="bg-white/10 p-3 rounded-xl">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-white/10 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Document के बारे में पूछें..."
          className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="p-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


// ─── Smart Extraction Panel ───────────────────────────────────────────────────
export function SmartExtractionPanel({ documentText }) {
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState(null);
  const [extracted, setExtracted] = useState(null);

  const detectAndExtract = async () => {
    setLoading(true);
    setDocType(null);
    setExtracted(null);
    try {
      // Step 1: Detect type
      const typeRes = await fetch(`${AI_SERVER}/ai/detect-type`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: documentText })
      });
      const typeData = await typeRes.json();
      const type = typeData.type || 'other';
      setDocType(type);

      // Step 2: Extract structured data
      const extRes = await fetch(`${AI_SERVER}/ai/extract-structured`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: documentText, doc_type: type })
      });
      const extData = await extRes.json();
      setExtracted(extData);
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const typeIcons = {
    resume: '👤', invoice: '🧾', id_card: '🪪', legal: '⚖️',
    academic: '📚', medical: '🏥', letter: '✉️', other: '📄'
  };

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-semibold">Smart Data Extraction</h3>
        </div>
        <button
          onClick={detectAndExtract}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Analyzing...' : 'Auto Extract'}
        </button>
      </div>

      {docType && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-2xl">{typeIcons[docType] || '📄'}</span>
          <div>
            <p className="text-slate-400 text-xs">Document Type Detected</p>
            <p className="text-white font-semibold capitalize">{docType.replace('_', ' ')}</p>
          </div>
        </div>
      )}

      {extracted && (
        <div className="space-y-2">
          {extracted.data ? (
            <div className="space-y-1">
              {Object.entries(extracted.data).map(([key, value]) => (
                <div key={key} className="flex gap-2 text-sm">
                  <span className="text-slate-400 capitalize min-w-24">{key.replace('_', ' ')}:</span>
                  <span className="text-white">
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <pre className="text-slate-300 text-xs bg-black/20 p-3 rounded-xl overflow-auto max-h-48">
              {extracted.raw}
            </pre>
          )}
        </div>
      )}

      {!extracted && !loading && (
        <p className="text-slate-500 text-sm">Click "Auto Extract" to detect document type and extract structured data using Mistral AI</p>
      )}
    </div>
  );
}


// ─── PII Redaction Panel ──────────────────────────────────────────────────────
export function RedactionPanel({ documentText, onRedacted }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const redact = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${AI_SERVER}/ai/redact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: documentText })
      });
      const data = await res.json();
      setResult(data);
      if (data.pii_found === 0) {
        toast.success('No PII detected in document');
      } else {
        toast.success(`${data.pii_found} PII items redacted!`);
      }
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-400" />
          <h3 className="text-white font-semibold">PII Redaction</h3>
          <span className="text-xs text-slate-400">(Phone, Email, Aadhar, PAN)</span>
        </div>
        <button
          onClick={redact}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          {loading ? 'Redacting...' : 'Redact PII'}
        </button>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className={`font-bold ${result.pii_found > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {result.pii_found} PII items found and redacted
            </span>
          </div>
          <div className="bg-black/20 rounded-xl p-3 max-h-32 overflow-auto">
            <pre className="text-slate-300 text-xs whitespace-pre-wrap">
              {result.redacted_text?.substring(0, 500)}...
            </pre>
          </div>
          {result.pii_found > 0 && (
            <button
              onClick={() => onRedacted && onRedacted(result.redacted_text)}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 rounded-xl text-white text-sm font-semibold"
            >
              Apply Redaction to Editor
            </button>
          )}
        </div>
      )}

      {!result && (
        <p className="text-slate-500 text-sm">Automatically detect and redact sensitive information like phone numbers, emails, Aadhar, PAN cards.</p>
      )}
    </div>
  );
}


// ─── Excel Export Button ──────────────────────────────────────────────────────
export function ExcelExportButton({ documentText, filename = 'export' }) {
  const [loading, setLoading] = useState(false);

  const exportExcel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${AI_SERVER}/export/excel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: documentText, filename })
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Excel file downloaded!');
    } catch (e) {
      toast.error(`Export failed: ${e.message}`);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={exportExcel}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-green-600/80 hover:bg-green-600 border border-green-500/30 rounded-xl text-white transition-all duration-300 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
      {loading ? 'Exporting...' : 'Export Excel'}
    </button>
  );
}


// ─── Document Outline Generator (Groq) ───────────────────────────────────────
export function OutlineGenerator({ documentText }) {
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState('');

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${AI_SERVER}/ai/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Create a structured outline with headings and subheadings for this document. Use markdown format (##, ###, - bullets).\n\nDocument:\n${documentText}`,
          style: 'key-points', length: 'long'
        })
      });
      const data = await res.json();
      setOutline(data.summary || '');
      toast.success('Outline generated!');
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h3 className="text-white font-semibold">Document Outline</h3>
        </div>
        <button onClick={generate} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 rounded-xl text-white text-sm font-semibold disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Generating...' : 'Generate Outline'}
        </button>
      </div>
      {outline ? (
        <div className="space-y-2">
          <pre className="text-slate-300 text-sm whitespace-pre-wrap bg-black/20 p-4 rounded-xl max-h-64 overflow-auto">{outline}</pre>
          <button onClick={() => { navigator.clipboard.writeText(outline); toast.success('Copied!'); }}
            className="flex items-center gap-1 text-slate-400 hover:text-white text-xs">
            <Copy className="w-3 h-3" /> Copy Outline
          </button>
        </div>
      ) : (
        <p className="text-slate-500 text-sm">Generate a structured outline with headings using Groq AI.</p>
      )}
    </div>
  );
}


// ─── Flashcard Generator (Groq) ───────────────────────────────────────────────
export function FlashcardGenerator({ documentText }) {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [flip, setFlip] = useState({});

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${AI_SERVER}/ai/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: documentText,
          question: 'Generate 5 flashcards as Q&A pairs. Format each as: Q: [question] | A: [answer]. Separate with newlines.'
        })
      });
      const data = await res.json();
      const raw = data.answer || '';
      const parsed = raw.split('\n').filter(l => l.includes('Q:') && l.includes('A:'))
        .map((l, i) => {
          const [q, a] = l.split('|');
          return { id: i, q: q?.replace('Q:', '').trim(), a: a?.replace('A:', '').trim() };
        }).filter(c => c.q && c.a);
      setCards(parsed);
      toast.success(`${parsed.length} flashcards generated!`);
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="text-white font-semibold">Flashcard Generator</h3>
        </div>
        <button onClick={generate} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600/80 hover:bg-yellow-600 rounded-xl text-white text-sm font-semibold disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {loading ? 'Creating...' : 'Create Flashcards'}
        </button>
      </div>
      {cards.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {cards.map(card => (
            <div key={card.id} onClick={() => setFlip(f => ({ ...f, [card.id]: !f[card.id] }))}
              className="cursor-pointer p-4 rounded-xl border border-white/10 bg-slate-800/50 hover:bg-slate-800 transition-all">
              <p className="text-xs text-yellow-400 mb-1">{flip[card.id] ? 'Answer' : 'Question'} (click to flip)</p>
              <p className="text-white text-sm">{flip[card.id] ? card.a : card.q}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">Generate study flashcards from this document using Groq AI.</p>
      )}
    </div>
  );
}


// ─── Action Items Extractor (Groq) ────────────────────────────────────────────
export function ActionItemsExtractor({ documentText }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [done, setDone] = useState({});

  const extract = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${AI_SERVER}/ai/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: documentText,
          question: 'Extract all action items, tasks, todos, and next steps from this document. List each on a new line starting with "- ".'
        })
      });
      const data = await res.json();
      const parsed = (data.answer || '').split('\n')
        .filter(l => l.trim().startsWith('-') || l.trim().match(/^\d+\./))
        .map((l, i) => ({ id: i, text: l.replace(/^[-\d.]\s*/, '').trim() }))
        .filter(l => l.text);
      setItems(parsed);
      toast.success(`${parsed.length} action items found!`);
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-green-400" />
          <h3 className="text-white font-semibold">Action Items</h3>
        </div>
        <button onClick={extract} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-700/80 hover:bg-green-700 rounded-xl text-white text-sm font-semibold disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ListChecks className="w-4 h-4" />}
          {loading ? 'Extracting...' : 'Extract Tasks'}
        </button>
      </div>
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} onClick={() => setDone(d => ({ ...d, [item.id]: !d[item.id] }))}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-all">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${done[item.id] ? 'bg-green-500 border-green-500' : 'border-slate-500'}`}>
                {done[item.id] && <span className="text-white text-xs">✓</span>}
              </div>
              <p className={`text-sm ${done[item.id] ? 'line-through text-slate-500' : 'text-white'}`}>{item.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">Extract tasks, todos, and action items from this document.</p>
      )}
    </div>
  );
}


// ─── Reading Analyzer (100% Local, no AI) ────────────────────────────────────
export function ReadingAnalyzer({ documentText }) {
  const analyze = () => {
    const words = documentText.trim().split(/\s+/).filter(Boolean);
    const sentences = documentText.split(/[.!?]+/).filter(s => s.trim());
    const chars = documentText.replace(/\s/g, '').length;
    const avgWordLength = words.reduce((s, w) => s + w.length, 0) / (words.length || 1);
    const avgSentenceLen = words.length / (sentences.length || 1);
    const readingTime = Math.ceil(words.length / 200); // 200 wpm
    const fleschScore = 206.835 - 1.015 * avgSentenceLen - 84.6 * (avgWordLength / 5);
    const level = fleschScore > 70 ? 'Easy' : fleschScore > 50 ? 'Medium' : 'Difficult';
    const freq = {};
    words.forEach(w => { const k = w.toLowerCase().replace(/[^a-z]/g, ''); if (k.length > 3) freq[k] = (freq[k] || 0) + 1; });
    const topWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return { words: words.length, sentences: sentences.length, chars, readingTime, level, fleschScore: Math.round(fleschScore), topWords };
  };

  const stats = documentText?.trim() ? analyze() : null;

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-5 h-5 text-blue-400" />
        <h3 className="text-white font-semibold">Reading Analysis</h3>
        <span className="text-xs text-slate-400">(Instant, no AI)</span>
      </div>
      {stats ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Words', value: stats.words.toLocaleString() },
              { label: 'Sentences', value: stats.sentences.toLocaleString() },
              { label: 'Reading Time', value: `${stats.readingTime} min` },
              { label: 'Level', value: stats.level },
            ].map(s => (
              <div key={s.label} className="bg-slate-800/60 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-slate-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-2">Top Keywords</p>
            <div className="flex flex-wrap gap-2">
              {stats.topWords.map(([word, count]) => (
                <span key={word} className="px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs">
                  {word} <span className="text-blue-500">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-slate-500 text-sm">Load a document to see reading statistics.</p>
      )}
    </div>
  );
}
