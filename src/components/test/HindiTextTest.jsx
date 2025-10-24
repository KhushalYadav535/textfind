import React, { useState } from 'react';
import { processPDF } from '../../utils/pdfProcessor.js';
import { processPDFWithHindi as processHindi } from '../../utils/hindiTextProcessor.js';

const HindiTextTest = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({});
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const processWithStandardMethod = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const result = await processPDF(file, {
        maxPages: 5,
        autoDetectLanguage: true,
        progressCallback: (status) => {
          setProgress(status);
        }
      });
      
      setResult({
        method: 'Standard Method',
        ...result
      });
    } catch (err) {
      setError(`Standard method failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const processWithHindiMethod = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const result = await processHindi(file, {
        maxPages: 5,
        useHindiOnly: false,
        progressCallback: (status) => {
          setProgress(status);
        }
      });
      
      setResult({
        method: 'Hindi Specialized Method',
        ...result
      });
    } catch (err) {
      setError(`Hindi method failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
    setProgress({});
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Hindi Text Extraction Test</h2>
      
      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Hindi PDF File
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* Processing Buttons */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={processWithStandardMethod}
          disabled={!file || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Test Standard Method
        </button>
        
        <button
          onClick={processWithHindiMethod}
          disabled={!file || loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Test Hindi Method
        </button>
        
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>

      {/* Progress */}
      {loading && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Processing...</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress || 0}%` }}
            ></div>
          </div>
          <p className="text-sm text-blue-600 mt-2">
            {progress.message || 'Processing...'} 
            {progress.current && progress.total && ` (${progress.current}/${progress.total})`}
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">
              {result.method} - Results
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Type:</span> {result.type}
              </div>
              <div>
                <span className="font-medium">Confidence:</span> {result.totalConfidence}%
              </div>
              <div>
                <span className="font-medium">Total Words:</span> {result.totalWords}
              </div>
              <div>
                <span className="font-medium">Pages:</span> {result.pages?.length || 0}
              </div>
              {result.hindiStats && (
                <>
                  <div>
                    <span className="font-medium">Hindi Characters:</span> {result.hindiStats.hindiChars}
                  </div>
                  <div>
                    <span className="font-medium">Hindi Percentage:</span> {result.hindiStats.hindiPercentage}%
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Extracted Text */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">Extracted Text:</h3>
            <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {result.totalText || 'No text extracted'}
              </pre>
            </div>
          </div>

          {/* Page-by-page Results */}
          {result.pages && result.pages.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-800">Page-by-page Results:</h3>
              {result.pages.map((page, index) => (
                <div key={index} className="p-4 bg-white border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Page {page.pageNumber}</h4>
                    <div className="text-sm text-gray-600">
                      Confidence: {page.confidence}% | Words: {page.wordCount}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {page.text || 'No text extracted from this page'}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HindiTextTest;
