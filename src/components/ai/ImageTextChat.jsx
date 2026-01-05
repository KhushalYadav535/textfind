import React, { useState } from 'react';
import { Image, MessageSquare, Send, Loader, Eye, Sparkles } from 'lucide-react';
import { chatWithImage, describeImage, extractTextFromImageVision } from '../../utils/imageTextChat';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ImageTextChat({ imageFile, imageUrl }) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeMode, setActiveMode] = useState('chat'); // chat, describe, extract

  const handleAsk = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (!imageFile && !imageUrl) {
      toast.error('No image available');
      return;
    }

    try {
      setIsProcessing(true);
      const userQuestion = question.trim();
      
      setChatHistory(prev => [...prev, { type: 'question', content: userQuestion }]);
      setQuestion('');

      toast.loading('Analyzing image...', { id: 'imagechat' });

      // Get image file
      let file = imageFile;
      if (!file && imageUrl) {
        // Convert imageUrl to File if needed
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        file = new File([blob], 'image.jpg', { type: blob.type });
      }

      const result = await chatWithImage(file, userQuestion, {
        progressCallback: (progress) => {
          console.log('Image chat progress:', progress);
        }
      });

      setResponse(result.response);
      setChatHistory(prev => [...prev, { type: 'answer', content: result.response }]);

      toast.success('Response generated!', { id: 'imagechat' });
    } catch (error) {
      console.error('Image chat error:', error);
      toast.error(`Failed: ${error.message}`, { id: 'imagechat' });
      
      setChatHistory(prev => [...prev, { 
        type: 'answer', 
        content: `Error: ${error.message}` 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDescribe = async () => {
    if (!imageFile && !imageUrl) {
      toast.error('No image available');
      return;
    }

    try {
      setIsProcessing(true);
      toast.loading('Describing image...', { id: 'describe' });

      let file = imageFile;
      if (!file && imageUrl) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        file = new File([blob], 'image.jpg', { type: blob.type });
      }

      const result = await describeImage(file, {
        detail: 'medium',
        progressCallback: (progress) => {
          console.log('Description progress:', progress);
        }
      });

      setResponse(result.description);
      setChatHistory(prev => [...prev, { 
        type: 'answer', 
        content: `Image Description:\n${result.description}` 
      }]);

      toast.success('Description generated!', { id: 'describe' });
    } catch (error) {
      console.error('Image description error:', error);
      toast.error(`Failed: ${error.message}`, { id: 'describe' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtractText = async () => {
    if (!imageFile && !imageUrl) {
      toast.error('No image available');
      return;
    }

    try {
      setIsProcessing(true);
      toast.loading('Extracting text from image...', { id: 'extract' });

      let file = imageFile;
      if (!file && imageUrl) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        file = new File([blob], 'image.jpg', { type: blob.type });
      }

      const result = await extractTextFromImageVision(file, {
        progressCallback: (progress) => {
          console.log('Text extraction progress:', progress);
        }
      });

      setResponse(result.text);
      setChatHistory(prev => [...prev, { 
        type: 'answer', 
        content: `Extracted Text:\n${result.text}` 
      }]);

      toast.success('Text extracted!', { id: 'extract' });
    } catch (error) {
      console.error('Text extraction error:', error);
      toast.error(`Failed: ${error.message}`, { id: 'extract' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="p-6 bg-slate-800/30 border border-white/10 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-cyan-500">
          <Image className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">Image AI Chat</h3>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveMode('chat')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            activeMode === 'chat'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-1" />
          Chat
        </button>
        <button
          onClick={() => setActiveMode('describe')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            activeMode === 'describe'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4 inline mr-1" />
          Describe
        </button>
        <button
          onClick={() => setActiveMode('extract')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            activeMode === 'extract'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-1" />
          Extract Text
        </button>
      </div>

      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div className="mb-4 max-h-64 overflow-y-auto space-y-3">
          {chatHistory.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded-xl ${
                item.type === 'question'
                  ? 'bg-cyan-500/10 border border-cyan-500/20 ml-8'
                  : 'bg-green-500/10 border border-green-500/20 mr-8'
              }`}
            >
              <p className="text-white text-sm whitespace-pre-wrap">{item.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chat Mode */}
      {activeMode === 'chat' && (
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about the image..."
            className="flex-1 px-4 py-2 bg-slate-700 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
            disabled={isProcessing}
          />
          <button
            onClick={handleAsk}
            disabled={isProcessing || !question.trim()}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-green-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      )}

      {/* Describe Mode */}
      {activeMode === 'describe' && (
        <button
          onClick={handleDescribe}
          disabled={isProcessing}
          className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-green-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader className="w-4 h-4 inline animate-spin mr-2" />
              Describing Image...
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 inline mr-2" />
              Describe Image
            </>
          )}
        </button>
      )}

      {/* Extract Text Mode */}
      {activeMode === 'extract' && (
        <button
          onClick={handleExtractText}
          disabled={isProcessing}
          className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-green-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader className="w-4 h-4 inline animate-spin mr-2" />
              Extracting Text...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 inline mr-2" />
              Extract Text from Image
            </>
          )}
        </button>
      )}

      {response && !chatHistory.some(item => item.content.includes(response)) && (
        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <p className="text-white whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
}

