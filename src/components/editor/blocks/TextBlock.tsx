import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BlockData } from '../../../types';

interface TextBlockProps {
  block: BlockData;
  onUpdate: (id: string, data: Partial<BlockData>) => void;
}

const TextBlock: React.FC<TextBlockProps> = ({ block, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    setContent(block.content);
  }, [block.content]);
  
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Set cursor at the end
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      textareaRef.current.selectionEnd = textareaRef.current.value.length;
      
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Auto-resize textarea as user types
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
        className="w-full border-none bg-transparent p-0 focus:ring-0 font-inter text-gray-800 resize-none min-h-[24px]"
        placeholder="Start typing..."
      />
    );
  }
  
  return (
    <div 
      className="prose prose-sm max-w-none cursor-text"
      onClick={() => setIsEditing(true)}
    >
      {content ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      ) : (
        <p className="text-gray-400 italic">Click to add text...</p>
      )}
    </div>
  );
};

export default TextBlock;