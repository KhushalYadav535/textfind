import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { base44 } from '../../api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function BatchUpload({ onComplete }) {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [processingQueue, setProcessingQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      status: 'pending', // pending, processing, completed, error
      progress: 0,
      result: null,
      error: null
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const processBatch = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setCurrentIndex(0);

    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];
      setCurrentIndex(i);
      
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'processing', progress: 0 } : f
      ));

      try {
        // Process file
        const extractResult = await base44.ExtractDataFromUploadedFile(fileItem.file, {
          progressCallback: (progress) => {
            setFiles(prev => prev.map(f => 
              f.id === fileItem.id ? { ...f, progress: progress.progress || 0 } : f
            ));
          }
        });

        const file_url = URL.createObjectURL(fileItem.file);
        const historyRecord = await base44.entities.UploadHistory.create({
          original_filename: fileItem.file.name,
          image_url: file_url,
          file_type: fileItem.file.type,
          extracted_text: extractResult.text || "",
          confidence_data: {
            overall: extractResult.confidence || 0,
            type: 'image',
            pages: 1,
            words: extractResult.text ? extractResult.text.split(/\s+/).length : 0
          },
          language: "eng"
        });

        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { 
            ...f, 
            status: 'completed', 
            progress: 100,
            result: historyRecord
          } : f
        ));

        toast.success(`Processed: ${fileItem.file.name}`);
      } catch (error) {
        console.error('Processing error:', error);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { 
            ...f, 
            status: 'error', 
            error: error.message 
          } : f
        ));
        toast.error(`Failed: ${fileItem.file.name}`);
      }
    }

    setIsProcessing(false);
    if (onComplete) onComplete();
  };

  const clearAll = () => {
    setFiles([]);
    setProcessingQueue([]);
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-cyan-500 bg-cyan-500/10'
            : 'border-white/20 bg-white/5 hover:border-white/30'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-white text-lg mb-2">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to select'}
        </p>
        <p className="text-slate-400 text-sm">
          Supports images (JPG, PNG, WebP) and PDFs. Multiple files allowed.
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </h3>
            <div className="flex gap-2">
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={processBatch}
                disabled={isProcessing}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50"
              >
                {isProcessing ? `Processing ${currentIndex + 1}/${files.length}...` : 'Process All'}
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {files.map((fileItem) => (
                <motion.div
                  key={fileItem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-4 p-4 bg-slate-800/30 border border-white/10 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white truncate">{fileItem.file.name}</p>
                    <p className="text-slate-400 text-sm">
                      {(fileItem.file.size / 1024).toFixed(2)} KB
                    </p>
                    {fileItem.status === 'processing' && (
                      <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-cyan-500 h-2 rounded-full transition-all"
                          style={{ width: `${fileItem.progress}%` }}
                        />
                      </div>
                    )}
                    {fileItem.error && (
                      <p className="text-red-400 text-sm mt-1">{fileItem.error}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {fileItem.status === 'pending' && (
                      <div className="w-3 h-3 rounded-full bg-slate-500" />
                    )}
                    {fileItem.status === 'processing' && (
                      <Loader className="w-5 h-5 text-cyan-400 animate-spin" />
                    )}
                    {fileItem.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    {fileItem.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

