import React, { useState, useEffect } from 'react';
import { Link } from 'lucide-react';
import { BlockData } from '../../../types';

interface ButtonBlockProps {
  block: BlockData;
  onUpdate: (id: string, data: Partial<BlockData>) => void;
}

const ButtonBlock: React.FC<ButtonBlockProps> = ({ block, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(!block.linkUrl);
  const [linkText, setLinkText] = useState(block.linkText || 'Click here');
  const [linkUrl, setLinkUrl] = useState(block.linkUrl || '');
  
  useEffect(() => {
    setLinkText(block.linkText || 'Click here');
    setLinkUrl(block.linkUrl || '');
  }, [block.linkText, block.linkUrl]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (linkUrl && linkText) {
      onUpdate(block.id, { 
        linkUrl, 
        linkText,
        content: `${linkText} - ${linkUrl}`
      });
      setIsEditing(false);
    }
  };
  
  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Button Text
          </label>
          <input
            type="text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary-300 focus:border-primary-300"
            placeholder="Click here"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary-300 focus:border-primary-300"
            placeholder="https://example.com"
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-primary-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-primary-600 transition-colors"
          >
            Save
          </button>
          {block.linkUrl && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    );
  }
  
  return (
    <div>
      <a
        href={block.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
      >
        {block.linkText}
      </a>
      <button
        onClick={() => setIsEditing(true)}
        className="block mt-2 text-xs text-gray-500 hover:text-primary-500 transition-colors"
      >
        Edit button
      </button>
    </div>
  );
};

export default ButtonBlock;