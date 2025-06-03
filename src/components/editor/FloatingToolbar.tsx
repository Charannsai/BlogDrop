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
  ListOrdered,
  Trash2,
  Copy,
  Heading1,
  Heading2,
  Heading3
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

  const formatItems = [
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
      icon: <Heading1 size={16} />,
      title: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 })
    },
    {
      icon: <Heading2 size={16} />,
      title: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 })
    },
    {
      icon: <Heading3 size={16} />,
      title: 'Heading 3',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 })
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
    },
    {
      icon: <ListOrdered size={16} />,
      title: 'Numbered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList')
    }
  ];

  return (
    <div className="flex items-center space-x-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
      {formatItems.map((item, index) => (
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