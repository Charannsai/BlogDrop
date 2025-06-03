import React from 'react';
import {
  Type,
  Heading1,
  Image,
  Play,
  Link,
  Code,
  Quote,
  List,
  ListOrdered,
  CheckSquare
} from 'lucide-react';

interface BlockMenuProps {
  onSelect: (type: string) => void;
  position: { x: number; y: number };
}

const BlockMenu: React.FC<BlockMenuProps> = ({ onSelect, position }) => {
  const blocks = [
    { type: 'text', icon: <Type size={16} />, label: 'Text' },
    { type: 'heading', icon: <Heading1 size={16} />, label: 'Heading' },
    { type: 'image', icon: <Image size={16} />, label: 'Image' },
    { type: 'video', icon: <Play size={16} />, label: 'Video' },
    { type: 'button', icon: <Link size={16} />, label: 'Button' },
    { type: 'code', icon: <Code size={16} />, label: 'Code' },
    { type: 'quote', icon: <Quote size={16} />, label: 'Quote' },
    { type: 'bullet-list', icon: <List size={16} />, label: 'Bullet List' },
    { type: 'ordered-list', icon: <ListOrdered size={16} />, label: 'Numbered List' },
    { type: 'task-list', icon: <CheckSquare size={16} />, label: 'Task List' }
  ];

  return (
    <div
      className="absolute bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[180px] z-50"
      style={{
        top: position.y,
        left: position.x
      }}
    >
      {blocks.map((block) => (
        <button
          key={block.type}
          className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center text-sm"
          onClick={() => onSelect(block.type)}
        >
          <span className="mr-2 text-gray-600">{block.icon}</span>
          {block.label}
        </button>
      ))}
    </div>
  );
};

export default BlockMenu;