import React, { useState } from "react";
import { base44 } from "../api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import FileUploadZone from "../assets/components/FileUploadZone";
import ProcessingView from "../assets/components/Processingview";
import PDFConversionHelper from "../components/pdf/PDFConversionHelper";
import { AlertCircle } from "lucide-react";

export default function Upload() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showPDFHelper, setShowPDFHelper] = useState(false);

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setError(null);
    await processImage(file);
  };

  const processImage = async (file) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Progress animation for OCR processing
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 30) return Math.min(prev + 2, 30);
          if (prev < 80) return Math.min(prev + 1, 80);
          return prev;
        });
      }, 200);

      // Step 1: Upload file
      setProgress(20);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Step 2: Extract text using real OCR
      setProgress(50);
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        file: file // Pass the actual file for Tesseract.js
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (result.status === "success" && result.output) {
        // Save to history
        const historyRecord = await base44.entities.UploadHistory.create({
          original_filename: file.name,
          image_url: file_url,
          extracted_text: result.output.text || "No text detected",
          confidence_data: {
            overall: result.output.confidence || 0
          },
          language: "eng"
        });

        // Navigate to results
        setTimeout(() => {
          navigate(createPageUrl(`Results?id=${historyRecord.id}`));
        }, 500);
      } else if (result.status === "error") {
        // Handle specific error messages from OCR
        const errorMessage = result.output?.text || "Failed to process file";
        throw new Error(errorMessage);
      } else {
        // Generic error
        throw new Error("Could not extract text from the file. Please try with a different file.");
      }
    } catch (err) {
      setError(err.message || "Failed to process image");
      setIsProcessing(false);
      
      // Show PDF helper if it's a PDF processing error
      if (selectedFile?.type === 'application/pdf') {
        setShowPDFHelper(true);
      }
    }
  };

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
            Upload Your Image
          </h1>
          <p className="text-xl text-slate-400">
            Drag and drop, paste, or select a file to get started
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {!isProcessing ? (
          <>
            <FileUploadZone onFileSelect={handleFileSelect} />
            
            {/* PDF Conversion Helper */}
            {showPDFHelper && (
              <div className="mt-8">
                <PDFConversionHelper />
              </div>
            )}
          </>
        ) : (
          <ProcessingView 
            file={selectedFile}
            progress={progress}
          />
        )}
      </div>
    </div>
  );
}