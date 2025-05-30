import React, { useState, useEffect, useRef } from 'react';
import { BlockData } from '../../../types';

interface QuoteBlockProps {
  block: BlockData;
  onUpdate: (id: string, data: Partial<BlockData>) => void;
}

const QuoteBlock: React.FC<QuoteBlockProps> = ({ block, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(!block.content);
  const [content, setContent] = useState(block.content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    setContent(block.content || '');
  }, [block.content]);
  
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };
  
  const handleBlur = () => {
    onUpdate(block.id, { content });
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      onUpdate(block.id, { content });
      setIsEditing(false);
    }
  };
  
  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full border-none bg-transparent p-0 focus:ring-0 text-gray-800 resize-none min-h-[80px] pl-4 border-l-4 border-primary-500"
        placeholder="Enter a quote..."
      />
    );
  }
  
  return (
    <blockquote 
      className="pl-4 border-l-4 border-primary-500 italic text-gray-700 cursor-text"
      onClick={() => setIsEditing(true)}
    >
      {content || <span className="text-gray-400">Click to add a quote...</span>}
    </blockquote>
  );
};

export default QuoteBlock;