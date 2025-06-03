import React, { useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import { BubbleMenu } from '@tiptap/react';
import { BlockData } from '../../types';
import { useBlogStore } from '../../store/blogStore';
import FloatingToolbar from './FloatingToolbar';
import BlockMenu from './BlockMenu';
import Button from '../ui/Button';
import { Save, Plus } from 'lucide-react';
import debounce from 'lodash/debounce';

interface EditorProps {
  blogId: string;
  autoSave?: boolean;
}

const Editor: React.FC<EditorProps> = ({ blogId, autoSave = true }) => {
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [blockMenuPosition, setBlockMenuPosition] = useState({ x: 0, y: 0 });
  const { currentBlog, updateBlogContent, isLoading } = useBlogStore();
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Press @ for commands, or just start writing...',
      }),
      TextStyle,
    ],
    content: currentBlog?.content || '',
    onUpdate: ({ editor }) => {
      if (autoSave) {
        debouncedSave(editor.getHTML());
      }
    },
    onKeyDown: ({ event }) => {
      if (event.key === '@') {
        event.preventDefault();
        const { top, left } = editorRef.current?.getBoundingClientRect() || { top: 0, left: 0 };
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setBlockMenuPosition({
            x: rect.left - left,
            y: rect.top - top + rect.height,
          });
          setShowBlockMenu(true);
        }
      }
    },
  });

  const debouncedSave = useCallback(
    debounce(async (content: string) => {
      try {
        setIsSaving(true);
        await updateBlogContent(blogId, [{ type: 'text', content }] as BlockData[]);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    [blogId, updateBlogContent]
  );

  const handleBlockSelect = (type: string) => {
    setShowBlockMenu(false);
    if (!editor) return;

    switch (type) {
      case 'text':
        editor.chain().focus().setParagraph().run();
        break;
      case 'heading':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'bullet-list':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'ordered-list':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'code':
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case 'quote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      // Add more block types as needed
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!currentBlog) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Blog not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2 border-b border-gray-100">
          <h2 className="text-xl font-bold font-jakarta text-gray-800">
            {currentBlog.title || 'Untitled Blog'}
          </h2>

          <div className="flex items-center space-x-3">
            {isSaving && (
              <span className="text-sm text-gray-500">Saving...</span>
            )}

            <Button
              variant="outline"
              size="sm"
              icon={<Plus size={16} />}
              onClick={() => setShowBlockMenu(true)}
            >
              Add Block
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={<Save size={16} />}
              onClick={() => debouncedSave(editor?.getHTML() || '')}
              isLoading={isSaving}
            >
              Save
            </Button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto" ref={editorRef}>
          {editor && (
            <BubbleMenu editor={editor}>
              <FloatingToolbar
                editor={editor}
                onDuplicate={() => {/* Implement duplicate */}}
                onDelete={() => {/* Implement delete */}}
              />
            </BubbleMenu>
          )}

          {showBlockMenu && (
            <BlockMenu
              onSelect={handleBlockSelect}
              position={blockMenuPosition}
            />
          )}

          <EditorContent editor={editor} className="prose prose-lg max-w-none" />
        </div>
      </div>
    </div>
  );
};

export default Editor;