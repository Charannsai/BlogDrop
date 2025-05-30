import React, { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Grip, Trash2, Settings } from 'lucide-react';
import { BlockData } from '../../types';
import TextBlock from './blocks/TextBlock';
import HeadingBlock from './blocks/HeadingBlock';
import ImageBlock from './blocks/ImageBlock';
import VideoBlock from './blocks/VideoBlock';
import ButtonBlock from './blocks/ButtonBlock';
import CodeBlock from './blocks/CodeBlock';
import QuoteBlock from './blocks/QuoteBlock';
import DividerBlock from './blocks/DividerBlock';

interface DraggableBlockProps {
  block: BlockData;
  onUpdate: (id: string, data: Partial<BlockData>) => void;
  onDelete: (id: string) => void;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({ block, onUpdate, onDelete }) => {
  const [showControls, setShowControls] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 999 : 'auto'
  };
  
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowControls(true), 200);
  };
  
  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowControls(false), 200);
  };
  
  const renderBlockContent = () => {
    switch (block.type) {
      case 'text':
        return <TextBlock block={block} onUpdate={onUpdate} />;
      case 'heading':
        return <HeadingBlock block={block} onUpdate={onUpdate} />;
      case 'image':
        return <ImageBlock block={block} onUpdate={onUpdate} />;
      case 'video':
        return <VideoBlock block={block} onUpdate={onUpdate} />;
      case 'button':
        return <ButtonBlock block={block} onUpdate={onUpdate} />;
      case 'code':
        return <CodeBlock block={block} onUpdate={onUpdate} />;
      case 'quote':
        return <QuoteBlock block={block} onUpdate={onUpdate} />;
      case 'divider':
        return <DividerBlock />;
      default:
        return <div>Unknown block type: {block.type}</div>;
    }
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative mb-3 ${isDragging ? 'z-50' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`relative border border-transparent rounded-lg p-3 transition-all duration-200 ${showControls ? 'border-gray-200 bg-gray-50' : 'hover:border-gray-200 hover:bg-gray-50'}`}>
        {renderBlockContent()}
        
        {/* Block controls */}
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pl-2 flex flex-col gap-1 opacity-0 transition-opacity duration-200 ${showControls ? 'opacity-100' : 'group-hover:opacity-100'}`}>
          <button
            className="p-1.5 bg-white border border-gray-200 rounded-md text-gray-500 hover:text-primary-500 hover:border-primary-300 transition-colors"
            {...attributes}
            {...listeners}
          >
            <Grip size={16} />
          </button>
        </div>
        
        <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pr-2 flex flex-col gap-1 opacity-0 transition-opacity duration-200 ${showControls ? 'opacity-100' : 'group-hover:opacity-100'}`}>
          <button
            className="p-1.5 bg-white border border-gray-200 rounded-md text-gray-500 hover:text-primary-500 hover:border-primary-300 transition-colors"
            onClick={() => onDelete(block.id)}
          >
            <Trash2 size={16} />
          </button>
          
          <button
            className="p-1.5 bg-white border border-gray-200 rounded-md text-gray-500 hover:text-primary-500 hover:border-primary-300 transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraggableBlock;