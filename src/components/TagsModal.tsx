import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Plus, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tags: string[]) => void;
  selectedTags: string[];
}

const TagsModal: React.FC<TagsModalProps> = ({ isOpen, onClose, onConfirm, selectedTags }) => {
  const [tags, setTags] = useState<string[]>(selectedTags);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableTags();
      setTags(selectedTags);
    }
  }, [isOpen, selectedTags]);

  const fetchAvailableTags = async () => {
    try {
      // Get all unique tags from published blogs
      const { data, error } = await supabase
        .from('blogs')
        .select('tags')
        .eq('published', true);

      if (error) throw error;

      const allTags = new Set<string>();
      data?.forEach((blog) => {
        if (blog.tags && Array.isArray(blog.tags)) {
          blog.tags.forEach((tag: string) => allTags.add(tag));
        }
      });

      setAvailableTags(Array.from(allTags).sort());
    } catch (error) {
      console.error('Error fetching tags:', error);
      // Fallback to default tags
      setAvailableTags([
        'technology', 'webdevelopment', 'javascript', 'react', 'nodejs',
        'python', 'ai', 'machinelearning', 'design', 'ux', 'ui',
        'programming', 'coding', 'tutorial', 'tips', 'career',
        'startup', 'business', 'productivity', 'lifestyle'
      ]);
    }
  };

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags([...tags, normalizedTag]);
    }
    setNewTag('');
    setSearchQuery('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleCreateNewTag = () => {
    if (newTag.trim()) {
      handleAddTag(newTag.trim());
    }
  };

  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !tags.includes(tag)
  );

  const handleConfirm = () => {
    onConfirm(tags);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add Tags</h2>
                  <p className="text-sm text-gray-600">Help readers discover your blog</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Tags */}
            {tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Tags ({tags.length}/5)</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center space-x-1 bg-primary-100 text-primary-800 px-3 py-1 rounded-lg text-sm font-medium"
                    >
                      <span>#{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Search/Add New Tag */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search or create new tag..."
                  value={searchQuery || newTag}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    setNewTag(value);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newTag.trim()) {
                      handleCreateNewTag();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={tags.length >= 5}
                />
              </div>
              
              {newTag.trim() && !availableTags.includes(newTag.toLowerCase().trim()) && tags.length < 5 && (
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleCreateNewTag}
                  className="mt-2 flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create "{newTag.trim()}"</span>
                </motion.button>
              )}
            </div>

            {/* Available Tags */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Tags</h3>
              <div className="max-h-40 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {filteredTags.slice(0, 20).map((tag) => (
                    <motion.button
                      key={tag}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddTag(tag)}
                      disabled={tags.length >= 5}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      #{tag}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {tags.length === 0 ? 'Add at least one tag' : `${tags.length}/5 tags selected`}
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirm}
                  disabled={tags.length === 0}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Publish Blog
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TagsModal;