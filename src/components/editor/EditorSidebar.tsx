import React from 'react';
import { 
  Type, 
  Heading1, 
  Image, 
  Play, 
  Link, 
  Code, 
  Quote, 
  SeparatorHorizontal 
} from 'lucide-react';
import { BlockType } from '../../types';

interface BlockOption {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface EditorSidebarProps {
  onAddBlock: (type: BlockType) => void;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({ onAddBlock }) => {
  const blockOptions: BlockOption[] = [
    {
      type: 'text',
      label: 'Text',
      icon: <Type size={20} />,
      description: 'Regular paragraph text'
    },
    {
      type: 'heading',
      label: 'Heading',
      icon: <Heading1 size={20} />,
      description: 'Section title'
    },
    {
      type: 'image',
      label: 'Image',
      icon: <Image size={20} />,
      description: 'Upload or embed an image'
    },
    {
      type: 'video',
      label: 'Video',
      icon: <Play size={20} />,
      description: 'Embed a video from YouTube or Vimeo'
    },
    {
      type: 'button',
      label: 'Button',
      icon: <Link size={20} />,
      description: 'Add a clickable button'
    },
    {
      type: 'code',
      label: 'Code',
      icon: <Code size={20} />,
      description: 'Add a code snippet'
    },
    {
      type: 'quote',
      label: 'Quote',
      icon: <Quote size={20} />,
      description: 'Add a blockquote'
    },
    {
      type: 'divider',
      label: 'Divider',
      icon: <SeparatorHorizontal size={20} />,
      description: 'Add a horizontal divider'
    }
  ];

  return (
    <div className="w-72 border-r border-gray-200 bg-white h-full p-4 overflow-y-auto">
      <h3 className="font-medium text-lg text-gray-800 mb-4">Blocks</h3>
      
      <div className="space-y-2">
        {blockOptions.map((option) => (
          <button
            key={option.type}
            className="flex items-center w-full p-3 rounded-lg border border-gray-200 text-left hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
            onClick={() => onAddBlock(option.type)}
          >
            <div className="text-gray-500 mr-3">{option.icon}</div>
            <div>
              <div className="font-medium text-gray-800">{option.label}</div>
              <div className="text-xs text-gray-500">{option.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EditorSidebar;