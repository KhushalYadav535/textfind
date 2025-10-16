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
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
      onFileSelect(file);
    } else {
      alert('Please select an image file (PNG, JPG, WEBP) or PDF file.');
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
      </div>
    </div>
  );
}