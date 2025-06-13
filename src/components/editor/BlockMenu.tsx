import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Type, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Image, 
  Heading1, 
  Heading2, 
  Heading3,
  Minus,
} from 'lucide-react';
import { Editor } from '@tiptap/react';

interface BlockMenuProps {
  editor: Editor | null;
}

const BlockMenu: React.FC<BlockMenuProps> = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  const blocks = [
    { 
      icon: Type, 
      label: 'Paragraph', 
      description: 'Start writing with plain text',
      command: () => editor?.chain().focus().setParagraph().run(),
      keywords: ['text', 'paragraph', 'p']
    },
    { 
      icon: Heading1, 
      label: 'Heading 1', 
      description: 'Big section heading',
      command: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      keywords: ['heading', 'h1', 'title']
    },
    { 
      icon: Heading2, 
      label: 'Heading 2', 
      description: 'Medium section heading',
      command: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      keywords: ['heading', 'h2', 'subtitle']
    },
    { 
      icon: Heading3, 
      label: 'Heading 3', 
      description: 'Small section heading',
      command: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
      keywords: ['heading', 'h3']
    },
    { 
      icon: List, 
      label: 'Bullet List', 
      description: 'Create a simple bullet list',
      command: () => editor?.chain().focus().toggleBulletList().run(),
      keywords: ['list', 'bullet', 'ul']
    },
    { 
      icon: ListOrdered, 
      label: 'Numbered List', 
      description: 'Create a list with numbering',
      command: () => editor?.chain().focus().toggleOrderedList().run(),
      keywords: ['list', 'numbered', 'ol', 'ordered']
    },
    { 
      icon: Quote, 
      label: 'Quote', 
      description: 'Capture a quote or citation',
      command: () => editor?.chain().focus().toggleBlockquote().run(),
      keywords: ['quote', 'blockquote', 'citation']
    },
    { 
      icon: Code, 
      label: 'Code Block', 
      description: 'Display code with syntax highlighting',
      command: () => editor?.chain().focus().toggleCodeBlock().run(),
      keywords: ['code', 'codeblock', 'syntax', 'programming']
    },
    { 
      icon: Minus, 
      label: 'Divider', 
      description: 'Visually divide sections',
      command: () => editor?.chain().focus().setHorizontalRule().run(),
      keywords: ['divider', 'separator', 'hr', 'line']
    },
    { 
      icon: Image, 
      label: 'Image', 
      description: 'Upload or embed an image',
      command: () => addImage(),
      keywords: ['image', 'photo', 'picture', 'media']
    },
  ];

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
    setIsOpen(false);
  };

  const filteredBlocks = blocks.filter(block => 
    block.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    block.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    block.keywords.some(keyword => keyword.includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '@') {
        const { selection } = editor.state;
        const { from } = selection;
        const coords = editor.view.coordsAtPos(from);
        
        setPosition({
          x: coords.left,
          y: coords.bottom + 10,
        });
        setIsOpen(true);
        setSearchQuery('');
        
        event.preventDefault();
      } else if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  const handleBlockSelect = (command: () => void) => {
    command();
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="fixed z-50 bg-white rounded-xl shadow-large border border-gray-200 min-w-80 max-w-md"
          style={{
            left: Math.min(position.x, window.innerWidth - 320),
            top: Math.min(position.y, window.innerHeight - 400),
          }}
        >
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search blocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              autoFocus
            />
          </div>
          
          <div className="max-h-80 overflow-y-auto p-2">
            {filteredBlocks.length > 0 ? (
              filteredBlocks.map((block, index) => (
                <motion.button
                  key={block.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => handleBlockSelect(block.command)}
                  className="w-full flex items-start space-x-3 px-3 py-3 rounded-lg text-left hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <block.icon className="w-5 h-5 text-gray-600 group-hover:text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 group-hover:text-primary-700">
                      {block.label}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {block.description}
                    </div>
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="px-3 py-8 text-center text-gray-500">
                <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No blocks found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <p className="text-xs text-gray-500 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">esc</kbd> to close this menu
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BlockMenu;