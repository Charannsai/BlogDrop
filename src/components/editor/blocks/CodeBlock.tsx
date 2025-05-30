import React, { useState, useEffect, useRef } from 'react';
import { Code } from 'lucide-react';
import { BlockData } from '../../../types';

interface CodeBlockProps {
  block: BlockData;
  onUpdate: (id: string, data: Partial<BlockData>) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ block, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(!block.content);
  const [code, setCode] = useState(block.content || '');
  const [language, setLanguage] = useState(block.language || 'javascript');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const languages = [
    'javascript', 'typescript', 'html', 'css', 'jsx', 'tsx',
    'python', 'ruby', 'java', 'c', 'cpp', 'csharp', 'go', 'rust',
    'php', 'swift', 'kotlin', 'sql', 'bash', 'json'
  ];
  
  useEffect(() => {
    setCode(block.content || '');
    setLanguage(block.language || 'javascript');
  }, [block.content, block.language]);
  
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(120, textareaRef.current.scrollHeight)}px`;
    }
  }, [isEditing]);
  
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.max(120, e.target.scrollHeight)}px`;
  };
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };
  
  const handleSave = () => {
    onUpdate(block.id, { 
      content: code,
      language
    });
    setIsEditing(false);
  };
  
  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-1 focus:ring-primary-300 focus:border-primary-300"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleSave}
            className="bg-primary-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-primary-600 transition-colors ml-auto"
          >
            Save
          </button>
        </div>
        
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          className="w-full border border-gray-300 rounded-lg p-3 font-mono text-sm focus:ring-1 focus:ring-primary-300 focus:border-primary-300 min-h-[120px]"
          placeholder={`// Enter your ${language} code here`}
        />
      </div>
    );
  }
  
  if (!block.content) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center">
        <Code size={40} className="text-gray-400 mb-3" />
        <p className="text-gray-600 mb-4">Add a code snippet</p>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-600 transition-colors"
        >
          Add Code
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="bg-gray-800 rounded-t-lg px-4 py-2 text-xs text-gray-400 flex justify-between items-center">
        <span>{language.charAt(0).toUpperCase() + language.slice(1)}</span>
        <button
          onClick={() => setIsEditing(true)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Edit
        </button>
      </div>
      <pre className="bg-gray-900 rounded-b-lg p-4 overflow-x-auto text-gray-200 font-mono text-sm whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;