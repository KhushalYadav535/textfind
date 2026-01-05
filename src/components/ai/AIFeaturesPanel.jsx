import React, { useState } from 'react';
import { Sparkles, MessageSquare, Image as ImageIcon, FileText, TrendingUp, Edit3, Table, Hash } from 'lucide-react';
import { extractEntities, analyzeSentiment, generateTitle, improveText, extractTableData } from '../../utils/aiFeatures';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AIFeaturesPanel({ documentText, onTextUpdate }) {
  const [activeFeature, setActiveFeature] = useState(null);
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const features = [
    { id: 'entities', name: 'Extract Entities', icon: <Hash className="w-5 h-5" />, description: 'Extract names, dates, locations' },
    { id: 'sentiment', name: 'Sentiment Analysis', icon: <TrendingUp className="w-5 h-5" />, description: 'Analyze text sentiment' },
    { id: 'title', name: 'Generate Title', icon: <FileText className="w-5 h-5" />, description: 'Create document title' },
    { id: 'improve', name: 'Improve Text', icon: <Edit3 className="w-5 h-5" />, description: 'Rewrite and improve text' },
    { id: 'table', name: 'Extract Tables', icon: <Table className="w-5 h-5" />, description: 'Extract tabular data' },
  ];

  const handleFeature = async (featureId) => {
    if (!documentText || documentText.trim().length === 0) {
      toast.error('No document text available');
      return;
    }

    try {
      setIsProcessing(true);
      setActiveFeature(featureId);
      setResult('');

      let resultData;

      switch (featureId) {
        case 'entities':
          toast.loading('Extracting entities...', { id: 'ai-feature' });
          resultData = await extractEntities(documentText);
          setResult(resultData.entities);
          break;

        case 'sentiment':
          toast.loading('Analyzing sentiment...', { id: 'ai-feature' });
          resultData = await analyzeSentiment(documentText);
          setResult(resultData.analysis);
          break;

        case 'title':
          toast.loading('Generating title...', { id: 'ai-feature' });
          resultData = await generateTitle(documentText);
          setResult(resultData.title);
          break;

        case 'improve':
          toast.loading('Improving text...', { id: 'ai-feature' });
          resultData = await improveText(documentText, { style: 'professional' });
          setResult(resultData.improved);
          if (onTextUpdate) {
            onTextUpdate(resultData.improved);
          }
          break;

        case 'table':
          toast.loading('Extracting table data...', { id: 'ai-feature' });
          resultData = await extractTableData(documentText);
          setResult(resultData.tableData);
          break;

        default:
          throw new Error('Unknown feature');
      }

      toast.success('Feature completed!', { id: 'ai-feature' });
    } catch (error) {
      console.error('AI feature error:', error);
      toast.error(`Failed: ${error.message}`, { id: 'ai-feature' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-slate-800/30 border border-white/10 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">More AI Features</h3>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => handleFeature(feature.id)}
            disabled={isProcessing}
            className={`p-4 rounded-xl border transition-all text-left ${
              activeFeature === feature.id
                ? 'border-purple-500/50 bg-purple-500/10'
                : 'border-white/10 bg-slate-700/30 hover:border-white/20'
            } disabled:opacity-50`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${
                activeFeature === feature.id ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-600 text-slate-300'
              }`}>
                {feature.icon}
              </div>
              <h4 className="text-white font-medium text-sm">{feature.name}</h4>
            </div>
            <p className="text-slate-400 text-xs">{feature.description}</p>
          </button>
        ))}
      </div>

      {result && (
        <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white font-medium">Result:</h4>
            <button
              onClick={() => {
                navigator.clipboard.writeText(result);
                toast.success('Copied!');
              }}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white text-xs"
            >
              Copy
            </button>
          </div>
          <div className="text-slate-300 whitespace-pre-wrap text-sm">{result}</div>
        </div>
      )}
    </div>
  );
}

