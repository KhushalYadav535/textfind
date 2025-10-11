import React from "react";
import { Loader2, Sparkles } from "lucide-react";

export default function ProcessingView({ file, progress }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-cyan-500/10 to-amber-500/10 border border-white/10 backdrop-blur-sm p-12">
      <div className="max-w-md mx-auto text-center space-y-8">
        {/* Animated Processing Icon */}
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full blur-2xl opacity-50 animate-pulse" />
          <div className="relative p-8 bg-gradient-to-br from-cyan-500/20 to-amber-500/20 rounded-full">
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Processing Your Image
          </h3>
          <p className="text-slate-400">
            {file?.name}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer" />
            </div>
          </div>
          <p className="text-sm font-medium text-cyan-400">
            {progress}% Complete
          </p>
        </div>

        {/* Status Messages */}
        <div className="space-y-2 text-sm text-slate-500">
          {progress < 20 && <p>📤 Uploading image...</p>}
          {progress >= 20 && progress < 50 && <p>🔄 Preparing OCR engine...</p>}
          {progress >= 50 && progress < 80 && <p>🔍 Extracting text with AI...</p>}
          {progress >= 80 && progress < 95 && <p>✨ Processing results...</p>}
          {progress >= 95 && <p>✅ Text extraction complete!</p>}
        </div>
      </div>

    </div>
  );
}