import React, { useState } from 'react';
import { Image as ImageIcon, RotateCw, Sun, Contrast, Zap, X } from 'lucide-react';
import { ImagePreprocessor } from '../../utils/imagePreprocessor';
import toast from 'react-hot-toast';

export default function ImagePreprocessorPanel({ file, onProcessed }) {
  const [settings, setSettings] = useState({
    brightness: 0,
    contrast: 0,
    grayscale: false,
    sharpen: false,
    autoRotate: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleProcess = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      const processedFile = await ImagePreprocessor.processImage(file, settings);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        onProcessed(processedFile);
        toast.success('Image processed successfully!');
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error('Image processing error:', error);
      toast.error('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetSettings = () => {
    setSettings({
      brightness: 0,
      contrast: 0,
      grayscale: false,
      sharpen: false,
      autoRotate: false,
    });
    setPreview(null);
  };

  return (
    <div className="p-6 bg-slate-800/30 border border-white/10 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Image Enhancement
        </h3>
        {preview && (
          <button
            onClick={resetSettings}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-white text-sm mb-2">
            Brightness: {settings.brightness > 0 ? '+' : ''}{settings.brightness}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            value={settings.brightness}
            onChange={(e) => setSettings({ ...settings, brightness: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-white text-sm mb-2">
            Contrast: {settings.contrast > 0 ? '+' : ''}{settings.contrast}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            value={settings.contrast}
            onChange={(e) => setSettings({ ...settings, contrast: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-white text-sm">Grayscale</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.grayscale}
              onChange={(e) => setSettings({ ...settings, grayscale: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-white text-sm">Sharpen</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.sharpen}
              onChange={(e) => setSettings({ ...settings, sharpen: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-white text-sm">Auto Rotate</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoRotate}
              onChange={(e) => setSettings({ ...settings, autoRotate: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        {preview && (
          <div className="mt-4 p-4 bg-slate-900/50 rounded-xl">
            <p className="text-white text-sm mb-2">Preview:</p>
            <img src={preview} alt="Processed preview" className="max-w-full h-auto rounded-lg" />
          </div>
        )}

        <button
          onClick={handleProcess}
          disabled={isProcessing}
          className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Apply Enhancements'}
        </button>
      </div>
    </div>
  );
}

