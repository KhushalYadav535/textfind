import React, { useState } from 'react';
import { FileText, Sparkles, Loader, Copy, CheckCircle } from 'lucide-react';
import { summarizeDocument, extractKeyPoints } from '../../utils/documentSummarizer';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function DocumentSummarizer({ documentText, onSummaryGenerated }) {
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // summary or keypoints
  const [summaryLength, setSummaryLength] = useState('medium');
  const [summaryStyle, setSummaryStyle] = useState('bullet');
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!documentText || documentText.trim().length === 0) {
      toast.error('No document text to summarize');
      return;
    }

    try {
      setIsProcessing(true);
      toast.loading('Generating summary...', { id: 'summarizing' });

      const result = await summarizeDocument(documentText, {
        length: summaryLength,
        style: summaryStyle,
        progressCallback: (progress) => {
          console.log('Summary progress:', progress);
        }
      });

      setSummary(result.summary);
      toast.success('Summary generated!', { id: 'summarizing' });
      
      if (onSummaryGenerated) {
        onSummaryGenerated(result.summary);
      }
    } catch (error) {
      console.error('Summarization error:', error);
      toast.error(`Failed to generate summary: ${error.message}`, { id: 'summarizing' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtractKeyPoints = async () => {
    if (!documentText || documentText.trim().length === 0) {
      toast.error('No document text to analyze');
      return;
    }

    try {
      setIsProcessing(true);
      toast.loading('Extracting key points...', { id: 'keypoints' });

      const result = await extractKeyPoints(documentText, {
        maxPoints: 5,
        progressCallback: (progress) => {
          console.log('Key points progress:', progress);
        }
      });

      setKeyPoints(result.keyPoints);
      toast.success('Key points extracted!', { id: 'keypoints' });
    } catch (error) {
      console.error('Key points extraction error:', error);
      toast.error(`Failed to extract key points: ${error.message}`, { id: 'keypoints' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 bg-slate-800/30 border border-white/10 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">AI Document Summarizer</h3>
      </div>

      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'summary'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('keypoints')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'keypoints'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Key Points
          </button>
        </div>

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm mb-2">Summary Length</label>
                <select
                  value={summaryLength}
                  onChange={(e) => setSummaryLength(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white"
                >
                  <option value="short">Short (2-3 sentences)</option>
                  <option value="medium">Medium (4-6 sentences)</option>
                  <option value="long">Long (2-3 paragraphs)</option>
                </select>
              </div>
              <div>
                <label className="block text-white text-sm mb-2">Style</label>
                <select
                  value={summaryStyle}
                  onChange={(e) => setSummaryStyle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white"
                >
                  <option value="bullet">Bullet Points</option>
                  <option value="paragraph">Paragraph</option>
                  <option value="key-points">Key Points</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSummarize}
              disabled={isProcessing}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-4 h-4 inline animate-spin mr-2" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Generate Summary
                </>
              )}
            </button>

            {summary && (
              <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">Summary:</h4>
                  <button
                    onClick={() => handleCopy(summary)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-slate-300 whitespace-pre-wrap">{summary}</p>
              </div>
            )}
          </div>
        )}

        {/* Key Points Tab */}
        {activeTab === 'keypoints' && (
          <div className="space-y-4">
            <button
              onClick={handleExtractKeyPoints}
              disabled={isProcessing}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-4 h-4 inline animate-spin mr-2" />
                  Extracting Key Points...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 inline mr-2" />
                  Extract Key Points
                </>
              )}
            </button>

            {keyPoints && (
              <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">Key Points:</h4>
                  <button
                    onClick={() => handleCopy(keyPoints)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-slate-300 whitespace-pre-wrap">{keyPoints}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

