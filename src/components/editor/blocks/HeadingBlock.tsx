import React, { useState, useEffect, useRef } from 'react';
import { BlockData } from '../../../types';

interface HeadingBlockProps {
  block: BlockData;
  onUpdate: (id: string, data: Partial<BlockData>) => void;
}

const HeadingBlock: React.FC<HeadingBlockProps> = ({ block, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const [level, setLevel] = useState(block.level || 2);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setContent(block.content);
    setLevel(block.level || 2);
  }, [block.content, block.level]);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Set cursor at the end
      inputRef.current.selectionStart = inputRef.current.value.length;
      inputRef.current.selectionEnd = inputRef.current.value.length;
    }
  }, [isEditing]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };
  
  const handleBlur = () => {
    onUpdate(block.id, { content, level });
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onUpdate(block.id, { content, level });
      setIsEditing(false);
    }
  };
  
  const changeHeadingLevel = (newLevel: 1 | 2 | 3) => {
    setLevel(newLevel);
    onUpdate(block.id, { level: newLevel });
  };
  
  const renderHeading = () => {
    if (!content && !isEditing) {
      return <div className="text-gray-400 italic">Click to add heading...</div>;
    }
    
    switch (level) {
      case 1:
        return <h1 className="text-3xl font-bold font-jakarta">{content}</h1>;
      case 2:
        return <h2 className="text-2xl font-bold font-jakarta">{content}</h2>;
      case 3:
        return <h3 className="text-xl font-bold font-jakarta">{content}</h3>;
      default:
        return <h2 className="text-2xl font-bold font-jakarta">{content}</h2>;
    }
  };
  
  if (isEditing) {
    return (
      <div>
        <div className="flex mb-2">
          <button
            className={`px-2 py-1 text-xs rounded-l-md ${level === 1 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => changeHeadingLevel(1)}
          >
            H1
          </button>
          <button
            className={`px-2 py-1 text-xs ${level === 2 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => changeHeadingLevel(2)}
          >
            H2
          </button>
          <button
            className={`px-2 py-1 text-xs rounded-r-md ${level === 3 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => changeHeadingLevel(3)}
          >
            H3
          </button>
        </div>
        <input
          ref={inputRef}
          value={content}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full border-none bg-transparent p-0 focus:ring-0 font-jakarta font-bold ${level === 1 ? 'text-3xl' : level === 2 ? 'text-2xl' : 'text-xl'}`}
          placeholder={`Heading ${level}...`}
        />
      </div>
    );
  }
  
  return (
    <div 
      className="cursor-text"
      onClick={() => setIsEditing(true)}
    >
      {renderHeading()}
    </div>
  );
};

export default HeadingBlock;