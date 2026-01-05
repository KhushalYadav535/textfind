import React, { useState } from 'react';
import { FileText, ArrowRight, X } from 'lucide-react';
import { VersionHistory } from '../../utils/versionHistory';
import { motion } from 'framer-motion';

export default function DocumentComparison({ documentId, currentText }) {
  const [versions, setVersions] = useState([]);
  const [selectedVersion1, setSelectedVersion1] = useState(null);
  const [selectedVersion2, setSelectedVersion2] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const loadVersions = async () => {
    const allVersions = await VersionHistory.getVersions(documentId);
    setVersions(allVersions);
  };

  const compareVersions = async () => {
    if (!selectedVersion1 || !selectedVersion2) return;

    const v1 = await VersionHistory.getVersion(documentId, selectedVersion1);
    const v2 = await VersionHistory.getVersion(documentId, selectedVersion2);

    if (v1 && v2) {
      const diff = VersionHistory.compareVersions(v1, v2);
      setComparison(diff);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen, documentId]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all"
      >
        <FileText className="w-4 h-4" />
        Compare Versions
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Compare Document Versions</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Version 1</label>
                  <select
                    value={selectedVersion1 || ''}
                    onChange={(e) => setSelectedVersion1(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white"
                  >
                    <option value="">Select version...</option>
                    {versions.map(v => (
                      <option key={v.id} value={v.id}>
                        {new Date(v.timestamp).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Version 2</label>
                  <select
                    value={selectedVersion2 || ''}
                    onChange={(e) => setSelectedVersion2(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white"
                  >
                    <option value="">Select version...</option>
                    {versions.map(v => (
                      <option key={v.id} value={v.id}>
                        {new Date(v.timestamp).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={compareVersions}
                disabled={!selectedVersion1 || !selectedVersion2}
                className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl text-white font-semibold disabled:opacity-50"
              >
                Compare
              </button>

              {comparison && (
                <div className="mt-6 p-4 bg-slate-800/30 rounded-xl">
                  <h3 className="text-white font-semibold mb-4">Comparison Results</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{comparison.added}</div>
                      <div className="text-slate-400 text-sm">Added</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{comparison.removed}</div>
                      <div className="text-slate-400 text-sm">Removed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{comparison.modified}</div>
                      <div className="text-slate-400 text-sm">Modified</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

