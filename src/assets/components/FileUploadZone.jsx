import React, { useRef, useState } from "react";
import { Upload, Camera, Image as ImageIcon } from "lucide-react";

export default function FileUploadZone({ onFileSelect }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size too large. Please select a file smaller than 10MB.');
      return;
    }

    // Check file type
    const isValidImage = file.type.startsWith('image/') && 
                        ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type);
    const isValidPDF = file.type === 'application/pdf';

    if (isValidImage || isValidPDF) {
      if (isValidImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else if (isValidPDF) {
        // For PDF files, show a preview message
        setPreview('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzM0NDE1NSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBERiBGaWxlPC90ZXh0Pjwvc3ZnPg==');
      }
      onFileSelect(file);
    } else {
      alert('Please select a valid image file (PNG, JPG, WEBP) or PDF file.');
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        handleFile(file);
        break;
      }
    }
  };

  React.useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative rounded-3xl border-2 border-dashed transition-all duration-500 ${
        dragActive
          ? "border-cyan-500 bg-cyan-500/10 scale-105"
          : "border-white/20 bg-gradient-to-br from-white/5 to-transparent"
      }`}
    >
      <div className="p-16 text-center">
        {/* Upload Icon with Animation */}
        <div className={`inline-flex mb-8 relative ${dragActive ? 'animate-bounce' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full blur-2xl opacity-30 animate-pulse" />
          <div className="relative p-8 bg-gradient-to-br from-cyan-500/20 to-amber-500/20 rounded-full border border-white/20 backdrop-blur-sm">
            <Upload className="w-16 h-16 text-cyan-400" />
          </div>
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Drop your file here
        </h3>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Upload images or PDF files, use your camera, or paste from clipboard
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50"
          >
            <ImageIcon className="w-5 h-5" />
            Choose File
          </button>

          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-3 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105"
          >
            <Camera className="w-5 h-5" />
            Use Camera
          </button>
        </div>

        {/* Supported formats */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm text-slate-500">
          <span className="px-3 py-1 rounded-lg bg-white/5">PNG</span>
          <span className="px-3 py-1 rounded-lg bg-white/5">JPG</span>
          <span className="px-3 py-1 rounded-lg bg-white/5">WEBP</span>
          <span className="px-3 py-1 rounded-lg bg-white/5">PDF</span>
        </div>
        
        {/* PDF Help Text */}
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-300 text-center">
            <strong>PDF Note:</strong> For best results with PDF files, ensure they contain selectable text. 
            Scanned PDFs (images) may not work as well.
          </p>
        </div>
      </div>
    </div>
  );
}