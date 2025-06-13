import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Highlighter,
  Link,
  Type,
  Palette,
  Image,
  Quote,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo
} from 'lucide-react';
import { Editor } from '@tiptap/react';

interface EditorToolbarProps {
  editor: Editor | null;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);

  if (!editor) return null;

  const fontFamilies = [
    { name: 'Inter', value: 'Inter' },
    { name: 'Playfair Display', value: 'Playfair Display' },
    { name: 'Source Code Pro', value: 'Source Code Pro' },
    { name: 'Georgia', value: 'Georgia' },
    { name: 'Times New Roman', value: 'Times New Roman' },
    { name: 'Arial', value: 'Arial' },
    { name: 'Helvetica', value: 'Helvetica' },
    { name: 'Roboto', value: 'Roboto' },
    { name: 'Open Sans', value: 'Open Sans' },
    { name: 'Lato', value: 'Lato' },
    { name: 'Montserrat', value: 'Montserrat' },
    { name: 'Poppins', value: 'Poppins' },
    { name: 'Merriweather', value: 'Merriweather' },
    { name: 'Crimson Text', value: 'Crimson Text' },
    { name: 'Libre Baskerville', value: 'Libre Baskerville' },
  ];

  const colors = [
    '#000000', '#374151', '#6b7280', '#9ca3af',
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#22c55e', '#10b981', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#ec4899', '#f43f5e', '#ffffff'
  ];

  const handleColorChange = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  const handleFontChange = (font: string) => {
    editor.chain().focus().setFontFamily(font).run();
    setShowFontPicker(false);
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const toolbarSections = [
    {
      name: 'History',
      tools: [
        { icon: Undo, action: () => editor.chain().focus().undo().run(), active: false },
        { icon: Redo, action: () => editor.chain().focus().redo().run(), active: false },
      ]
    },
    {
      name: 'Headings',
      tools: [
        { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
        { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
        { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
      ]
    },
    {
      name: 'Formatting',
      tools: [
        { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
        { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
        { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
        { icon: Code, action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code') },
        { icon: Highlighter, action: () => editor.chain().focus().toggleHighlight().run(), active: editor.isActive('highlight') },
      ]
    },
    {
      name: 'Alignment',
      tools: [
        { icon: AlignLeft, action: () => editor.chain().focus().setTextAlign('left').run(), active: editor.isActive({ textAlign: 'left' }) },
        { icon: AlignCenter, action: () => editor.chain().focus().setTextAlign('center').run(), active: editor.isActive({ textAlign: 'center' }) },
        { icon: AlignRight, action: () => editor.chain().focus().setTextAlign('right').run(), active: editor.isActive({ textAlign: 'right' }) },
      ]
    },
    {
      name: 'Lists',
      tools: [
        { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
        { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
        { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
      ]
    },
    {
      name: 'Media',
      tools: [
        { icon: Link, action: addLink, active: editor.isActive('link') },
        { icon: Image, action: addImage, active: false },
      ]
    }
  ];

  return (
    <div className="border-b border-gray-200 p-4 bg-white sticky top-0 z-30">
      <div className="floating-toolbar">
        {toolbarSections.map((section, sectionIndex) => (
          <React.Fragment key={section.name}>
            <div className="flex items-center space-x-1">
              {section.tools.map((tool, toolIndex) => (
                <motion.button
                  key={toolIndex}
                  onClick={tool.action}
                  className={`p-2.5 rounded-lg transition-all duration-200 ${
                    tool.active 
                      ? 'bg-primary-100 text-primary-700 shadow-glow' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tool.icon className="w-4 h-4" />
                </motion.button>
              ))}
            </div>
            {sectionIndex < toolbarSections.length - 1 && (
              <div className="w-px h-6 bg-gray-300" />
            )}
          </React.Fragment>
        ))}

        <div className="w-px h-6 bg-gray-300" />

        {/* Font Family Picker */}
        <div className="relative">
          <motion.button
            onClick={() => setShowFontPicker(!showFontPicker)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
          >
            <Type className="w-4 h-4" />
            <span className="text-sm">Font</span>
          </motion.button>

          <AnimatePresence>
            {showFontPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-large border border-gray-200 py-2 z-50 max-h-64 overflow-y-auto"
              >
                {fontFamilies.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => handleFontChange(font.value)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Color Picker */}
        <div className="relative">
          <motion.button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
          >
            <Palette className="w-4 h-4" />
            <span className="text-sm">Color</span>
          </motion.button>

          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-large border border-gray-200 p-4 z-50"
              >
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((color) => (
                    <motion.button
                      key={color}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleColorChange(color)}
                      className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;