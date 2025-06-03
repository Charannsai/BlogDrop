import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Link,
  Code,
  Type,
  Quote,
  List,
  Trash2,
  Copy
} from 'lucide-react';

interface FloatingToolbarProps {
  editor: Editor;
  onDuplicate: () => void;
  onDelete: () => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  editor,
  onDuplicate,
  onDelete
}) => {
  if (!editor) return null;

  const items = [
    {
      icon: <Bold size={16} />,
      title: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold')
    },
    {
      icon: <Italic size={16} />,
      title: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic')
    },
    {
      icon: <Strikethrough size={16} />,
      title: 'Strikethrough',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike')
    },
    {
      icon: <Code size={16} />,
      title: 'Code',
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code')
    },
    {
      icon: <Link size={16} />,
      title: 'Link',
      action: () => {
        const url = window.prompt('Enter URL');
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
      isActive: editor.isActive('link')
    }
  ];

  const blockItems = [
    {
      icon: <Type size={16} />,
      title: 'Text',
      action: () => editor.chain().focus().setParagraph().run(),
      isActive: editor.isActive('paragraph')
    },
    {
      icon: <Quote size={16} />,
      title: 'Quote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote')
    },
    {
      icon: <List size={16} />,
      title: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList')
    }
  ];

  return (
    <div className="flex items-center space-x-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={item.action}
          className={`p-1.5 rounded hover:bg-gray-100 ${
            item.isActive ? 'bg-gray-100 text-primary-500' : 'text-gray-600'
          }`}
          title={item.title}
        >
          {item.icon}
        </button>
      ))}
      
      <div className="w-px h-6 bg-gray-200 mx-1" />
      
      {blockItems.map((item, index) => (
        <button
          key={index}
          onClick={item.action}
          className={`p-1.5 rounded hover:bg-gray-100 ${
            item.isActive ? 'bg-gray-100 text-primary-500' : 'text-gray-600'
          }`}
          title={item.title}
        >
          {item.icon}
        </button>
      ))}
      
      <div className="w-px h-6 bg-gray-200 mx-1" />
      
      <button
        onClick={onDuplicate}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
        title="Duplicate"
      >
        <Copy size={16} />
      </button>
      
      <button
        onClick={onDelete}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default FloatingToolbar;