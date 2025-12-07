import React, { useState } from "react";
import { base44 } from "../api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import FileUploadZone from "../assets/components/FileUploadZone";
import ProcessingView from "../assets/components/Processingview";
import PDFConversionHelper from "../components/pdf/PDFConversionHelper";
import { processPDFWithOCR, analyzePDF } from "../utils/pdfUtils";
import { AlertCircle } from "lucide-react";

export default function Upload() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showPDFHelper, setShowPDFHelper] = useState(false);
  const [pdfAnalysis, setPdfAnalysis] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setError(null);
    setPdfAnalysis(null);
    
    // Analyze PDF if it's a PDF file
    if (file.type === 'application/pdf') {
      try {
        const analysis = await analyzePDF(file);
        setPdfAnalysis(analysis);
      } catch (error) {
        console.error('PDF analysis error:', error);
      }
    }
    
    await processImage(file);
  };

  const processImage = async (file) => {
    setIsProcessing(true);
    setProgress(0);
    setProcessingStatus('');

    try {
      let result, file_url;

      // Check if it's a PDF file
      if (file.type === 'application/pdf') {
        setProcessingStatus('Processing PDF...');
        
        // Progress callback for PDF processing
        const progressCallback = (progressData) => {
          if (progressData.status === 'analyzing') {
            setProcessingStatus('Analyzing PDF type...');
            setProgress(10);
          } else if (progressData.status === 'converting') {
            setProcessingStatus('Converting PDF to images...');
            setProgress(30);
          } else if (progressData.status === 'ocr_processing') {
            setProcessingStatus('Running OCR...');
            setProgress(50);
          } else if (progressData.status === 'processing') {
            setProcessingStatus(`Processing page ${progressData.current}/${progressData.total}...`);
            setProgress(50 + (progressData.current / progressData.total) * 30);
          }
        };

        // Process PDF with OCR support
        const pdfResult = await processPDFWithOCR(file, {
          languages: ['eng'],
          progressCallback,
          maxPages: 10
        });

        // Create blob URL for PDF preview
        setProcessingStatus('Preparing file...');
        setProgress(85);
        file_url = URL.createObjectURL(file);

        // Format result to match expected structure
        result = {
          status: "success",
          output: {
            text: pdfResult.totalText,
            confidence: Math.round(pdfResult.totalConfidence),
            type: pdfResult.type,
            pages: pdfResult.pages.length,
            words: pdfResult.totalWords
          },
          analysis: pdfResult.analysis
        };
      } else {
        // Process regular image files
        setProcessingStatus('Processing image...');
        
        // Progress animation for OCR processing
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev < 30) return Math.min(prev + 2, 30);
            if (prev < 80) return Math.min(prev + 1, 80);
            return prev;
          });
        }, 200);

        // Step 1: Create blob URL for file preview
        setProgress(20);
        file_url = URL.createObjectURL(file);

        // Step 2: Extract text using Amazon Nova 2 Lite OCR
        setProgress(50);
        const extractResult = await base44.ExtractDataFromUploadedFile(file, {
          progressCallback: (progress) => {
            setProgress(50 + (progress.progress || 0) * 0.3);
            setProcessingStatus(progress.message || 'Processing with OCR...');
          }
        });
        
        result = {
          status: "success",
          output: {
            text: extractResult.text || "",
            confidence: extractResult.confidence || 0,
            type: 'image',
            pages: 1,
            words: extractResult.text ? extractResult.text.split(/\s+/).length : 0
          }
        };

        clearInterval(progressInterval);
      }

      setProgress(100);
      setProcessingStatus('Complete!');

      if (result.status === "success" && result.output) {
        // Convert file to base64 for permanent storage (works for both images and PDFs)
        let fileDataUrl = null;
        try {
          fileDataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result); // This will be data URL (data:image/jpeg;base64,... or data:application/pdf;base64,...)
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        } catch (error) {
          console.error('Error converting file to base64:', error);
        }

        // Save to history (without file_data_url to save localStorage space)
        // Note: file_data_url is huge and will cause quota errors, so we don't save it
        // The blob URL (file_url) will work for preview, but it's temporary
        const historyRecord = await base44.entities.UploadHistory.create({
          original_filename: file.name,
          image_url: file_url, // Keep blob URL for immediate use (temporary)
          // file_data_url: fileDataUrl, // NOT SAVING - too large for localStorage
          file_type: file.type, // Store file type
          extracted_text: result.output.text || "No text detected",
          confidence_data: {
            overall: result.output.confidence || 0,
            type: result.output?.type || 'image',
            pages: result.output?.pages || 1,
            words: result.output?.words || 0
          },
          language: "eng"
        });

        console.log('History record created with ID:', historyRecord.id);
        
        // Verify the record was saved before navigating
        const verifyRecords = await base44.entities.UploadHistory.filter({ id: historyRecord.id });
        if (verifyRecords.length > 0) {
          console.log('Record verified in storage, navigating to results...');
          // Navigate to results
          setTimeout(() => {
            navigate(createPageUrl(`Results?id=${historyRecord.id}`));
          }, 100);
        } else {
          console.error('Record not found after creation! ID:', historyRecord.id);
          // Wait a bit and try again
          setTimeout(async () => {
            const retry = await base44.entities.UploadHistory.filter({ id: historyRecord.id });
            if (retry.length > 0) {
              navigate(createPageUrl(`Results?id=${historyRecord.id}`));
            } else {
              console.error('Record still not found after retry');
              setError('Failed to save record. Please try again.');
            }
          }, 500);
        }
      } else if (result.status === "error") {
        // Handle specific error messages from OCR
        const errorMessage = result.output?.text || "Failed to process file";
        throw new Error(errorMessage);
      } else {
        // Generic error
        throw new Error("Could not extract text from the file. Please try with a different file.");
      }
    } catch (err) {
      setError(err.message || "Failed to process file");
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
            Upload Your Document
          </h1>
          <p className="text-xl text-slate-400">
            Drag and drop, paste, or select an image or PDF to get started
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
            status={processingStatus}
            pdfAnalysis={pdfAnalysis}
          />
        )}
      </div>
    </div>
  );
}