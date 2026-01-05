import React, { useState, useEffect } from 'react';
import { Tag, X, Plus } from 'lucide-react';
import { base44 } from '../../api/base44Client';
import toast from 'react-hot-toast';

const AVAILABLE_TAGS = [
  'Important', 'Work', 'Personal', 'Receipt', 'Invoice', 'Form', 'Letter', 
  'Contract', 'Certificate', 'ID', 'Passport', 'Medical', 'Legal', 'Other'
];

export default function TagManager({ documentId, initialTags = [] }) {
  const [tags, setTags] = useState(initialTags);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadTags();
  }, [documentId]);

  const loadTags = async () => {
    try {
      const record = await base44.entities.UploadHistory.filter({ id: documentId });
      if (record.length > 0 && record[0].tags) {
        setTags(record[0].tags);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const saveTags = async (newTags) => {
    try {
      await base44.entities.UploadHistory.update(documentId, {
        tags: newTags
      });
      setTags(newTags);
      toast.success('Tags updated');
    } catch (error) {
      console.error('Error saving tags:', error);
      toast.error('Failed to save tags');
    }
  };

  const addTag = (tagName) => {
    const trimmedTag = tagName.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      saveTags(newTags);
      setNewTag('');
      setShowAddTag(false);
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    saveTags(newTags);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm"
        >
          <Tag className="w-3 h-3" />
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      
      {showAddTag ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addTag(newTag);
              } else if (e.key === 'Escape') {
                setShowAddTag(false);
                setNewTag('');
              }
            }}
            placeholder="Tag name..."
            className="px-3 py-1 bg-slate-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            autoFocus
          />
          <button
            onClick={() => addTag(newTag)}
            className="p-1 text-cyan-400 hover:text-white"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddTag(true)}
          className="flex items-center gap-1 px-3 py-1 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:border-white/20 text-sm transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Tag
        </button>
      )}

      {/* Quick tag suggestions */}
      {showAddTag && (
        <div className="w-full mt-2 p-2 bg-slate-800/30 rounded-lg border border-white/10">
          <p className="text-slate-400 text-xs mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.filter(t => !tags.includes(t)).map(tag => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white text-xs transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

