import React, { useState, useEffect } from 'react';
import { FileText, Plus, X, Download } from 'lucide-react';
import { base44 } from '../../api/base44Client';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function DocumentMerger({ onMergeComplete }) {
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [availableDocs, setAvailableDocs] = useState([]);
  const [mergedText, setMergedText] = useState('');
  const [separator, setSeparator] = useState('\n\n---\n\n');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await base44.entities.UploadHistory.list('-created_date');
      setAvailableDocs(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const toggleDocument = (doc) => {
    if (selectedDocs.find(d => d.id === doc.id)) {
      setSelectedDocs(selectedDocs.filter(d => d.id !== doc.id));
    } else {
      setSelectedDocs([...selectedDocs, doc]);
    }
  };

  const mergeDocuments = () => {
    if (selectedDocs.length < 2) {
      toast.error('Please select at least 2 documents to merge');
      return;
    }

    const texts = selectedDocs.map(doc => {
      const header = `\n[${doc.original_filename}]\n`;
      return header + (doc.extracted_text || '');
    });

    const merged = texts.join(separator);
    setMergedText(merged);
    toast.success('Documents merged successfully!');
  };

  const downloadMerged = () => {
    const blob = new Blob([mergedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merged_documents_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-slate-800/30 border border-white/10 rounded-2xl">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Merge Documents
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-white text-sm mb-2">Separator</label>
          <input
            type="text"
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white"
            placeholder="Separator between documents"
          />
        </div>

        <div>
          <p className="text-white text-sm mb-2">
            Select documents ({selectedDocs.length} selected):
          </p>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {availableDocs.map(doc => (
              <label
                key={doc.id}
                className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={!!selectedDocs.find(d => d.id === doc.id)}
                  onChange={() => toggleDocument(doc)}
                  className="w-4 h-4 text-cyan-500"
                />
                <span className="text-white text-sm flex-1">{doc.original_filename}</span>
                <span className="text-slate-400 text-xs">
                  {doc.extracted_text?.length || 0} chars
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={mergeDocuments}
          disabled={selectedDocs.length < 2}
          className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl text-white font-semibold disabled:opacity-50"
        >
          Merge Documents
        </button>

        {mergedText && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm">Merged Text:</p>
              <button
                onClick={downloadMerged}
                className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
            <textarea
              value={mergedText}
              readOnly
              className="w-full h-48 p-3 bg-slate-900 border border-white/10 rounded-lg text-white text-sm font-mono"
            />
          </div>
        )}
      </div>
    </div>
  );
}

