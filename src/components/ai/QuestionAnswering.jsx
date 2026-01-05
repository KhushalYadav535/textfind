import React, { useState } from 'react';
import { MessageSquare, Send, Loader, Sparkles, HelpCircle } from 'lucide-react';
import { answerQuestion, generateQuestions } from '../../utils/questionAnswering';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuestionAnswering({ documentText }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);

  const handleAsk = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (!documentText || documentText.trim().length === 0) {
      toast.error('No document text available');
      return;
    }

    try {
      setIsProcessing(true);
      const userQuestion = question.trim();
      
      // Add user question to history
      setChatHistory(prev => [...prev, { type: 'question', content: userQuestion }]);
      setQuestion('');

      toast.loading('Analyzing document and generating answer...', { id: 'answering' });

      const result = await answerQuestion(documentText, userQuestion, {
        progressCallback: (progress) => {
          console.log('Q&A progress:', progress);
        }
      });

      setAnswer(result.answer);
      
      // Add answer to history
      setChatHistory(prev => [...prev, { type: 'answer', content: result.answer }]);

      toast.success('Answer generated!', { id: 'answering' });
    } catch (error) {
      console.error('Question answering error:', error);
      toast.error(`Failed to answer: ${error.message}`, { id: 'answering' });
      
      // Add error to history
      setChatHistory(prev => [...prev, { 
        type: 'answer', 
        content: `Error: ${error.message}` 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!documentText || documentText.trim().length === 0) {
      toast.error('No document text available');
      return;
    }

    try {
      setShowSuggestions(true);
      toast.loading('Generating questions...', { id: 'questions' });

      const result = await generateQuestions(documentText, {
        count: 5,
        progressCallback: (progress) => {
          console.log('Question generation progress:', progress);
        }
      });

      // Parse questions from result
      const questions = result.questions.split(/\d+\./).filter(q => q.trim()).map(q => q.trim());
      setSuggestedQuestions(questions);

      toast.success('Questions generated!', { id: 'questions' });
    } catch (error) {
      console.error('Question generation error:', error);
      toast.error(`Failed to generate questions: ${error.message}`, { id: 'questions' });
    }
  };

  const handleSelectQuestion = (selectedQuestion) => {
    setQuestion(selectedQuestion);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="p-6 bg-slate-800/30 border border-white/10 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Ask Questions</h3>
        </div>
        <button
          onClick={handleGenerateQuestions}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Suggest Questions
        </button>
      </div>

      {/* Suggested Questions */}
      <AnimatePresence>
        {showSuggestions && suggestedQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-slate-900/50 rounded-xl border border-white/10"
          >
            <p className="text-slate-400 text-sm mb-2">Suggested Questions:</p>
            <div className="space-y-2">
              {suggestedQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectQuestion(q)}
                  className="w-full text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-white text-sm transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div className="mb-4 max-h-64 overflow-y-auto space-y-3">
          {chatHistory.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded-xl ${
                item.type === 'question'
                  ? 'bg-cyan-500/10 border border-cyan-500/20 ml-8'
                  : 'bg-purple-500/10 border border-purple-500/20 mr-8'
              }`}
            >
              <div className="flex items-start gap-2">
                {item.type === 'question' ? (
                  <HelpCircle className="w-4 h-4 text-cyan-400 mt-0.5" />
                ) : (
                  <MessageSquare className="w-4 h-4 text-purple-400 mt-0.5" />
                )}
                <p className="text-white text-sm whitespace-pre-wrap">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about the document..."
          className="flex-1 px-4 py-2 bg-slate-700 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
          disabled={isProcessing}
        />
        <button
          onClick={handleAsk}
          disabled={isProcessing || !question.trim()}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {answer && !chatHistory.some(item => item.type === 'answer' && item.content === answer) && (
        <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
          <p className="text-white whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  );
}

