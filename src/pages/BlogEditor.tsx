import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Clock, 
  Send,
  FileText,
  Settings,
  Image,
  Link,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Tag
} from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import EditorToolbar from '../components/editor/EditorToolbar';
import BlockMenu from '../components/editor/BlockMenu';
import TagsModal from '../components/TagsModal';
import { getEditorExtensions } from '../components/editor/editorExtensions';

const BlogEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [message, setMessage] = useState('');
  const [currentBlog, setCurrentBlog] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const editor = useEditor({
    extensions: getEditorExtensions(),
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[600px] px-8 py-6',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const words = text.split(/\s+/).filter(word => word.length > 0).length;
      setWordCount(words);
      setReadingTime(Math.ceil(words / 200));
      
      // Trigger autosave
      debouncedAutoSave();
    },
  });

  // Debounced autosave function
  const debouncedAutoSave = useCallback(
    debounce(() => {
      if (title.trim() || (editor && editor.getText().trim())) {
        autoSave();
      }
    }, 2000),
    [title, editor]
  );

  // Load existing blog if editing
  useEffect(() => {
    if (id && user) {
      fetchBlog();
    }
  }, [id, user]);

  const fetchBlog = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .eq('author_id', user.id)
        .single();

      if (error) throw error;

      setCurrentBlog(data);
      setTitle(data.title);
      setIsPublished(data.published);
      setSelectedTags(data.tags || []);
      editor?.commands.setContent(data.content);
    } catch (error) {
      console.error('Error fetching blog:', error);
      navigate('/my-blogs');
    }
  };

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setMessage(msg);
    if (type === 'success') {
      setShowSuccess(true);
      setShowError(false);
    } else {
      setShowError(true);
      setShowSuccess(false);
    }
    
    setTimeout(() => {
      setShowSuccess(false);
      setShowError(false);
    }, 4000);
  };

  const autoSave = async () => {
    if (!editor || !user) return;
    
    setAutoSaveStatus('saving');
    
    try {
      const content = editor.getJSON();
      const excerpt = editor.getText().substring(0, 150);
      
      const blogData = {
        title: title.trim() || 'Untitled',
        content,
        excerpt,
        published: false,
        author_id: user.id,
        tags: selectedTags,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (currentBlog) {
        result = await supabase
          .from('blogs')
          .update(blogData)
          .eq('id', currentBlog.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('blogs')
          .insert([{ ...blogData, created_at: new Date().toISOString() }])
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      setCurrentBlog(result.data);
      setLastSaved(new Date());
      setAutoSaveStatus('saved');
      
      // Update URL if this is a new blog
      if (!currentBlog && result.data) {
        navigate(`/editor/${result.data.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Error auto-saving blog:', error);
      setAutoSaveStatus('error');
    }
  };

  const handleSave = async (publish = false) => {
    if (!editor || !user) return;
    
    if (!title.trim()) {
      showNotification('error', 'Please enter a title for your blog');
      return;
    }

    if (publish && selectedTags.length === 0) {
      setShowTagsModal(true);
      return;
    }
    
    setIsSaving(true);
    
    const content = editor.getJSON();
    const excerpt = editor.getText().substring(0, 150);
    
    try {
      const blogData = {
        title: title.trim(),
        content,
        excerpt,
        published: publish,
        author_id: user.id,
        tags: selectedTags,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (currentBlog) {
        result = await supabase
          .from('blogs')
          .update(blogData)
          .eq('id', currentBlog.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('blogs')
          .insert([{ ...blogData, created_at: new Date().toISOString() }])
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      setCurrentBlog(result.data);
      setIsPublished(publish);
      setLastSaved(new Date());
      
      if (publish) {
        showNotification('success', '🎉 Blog published successfully! Your story is now live.');
        setTimeout(() => navigate('/my-blogs'), 2000);
      } else {
        showNotification('success', '💾 Draft saved successfully!');
      }
    } catch (error: any) {
      console.error('Error saving blog:', error);
      showNotification('error', `Failed to ${publish ? 'publish' : 'save'} blog: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = () => {
    if (selectedTags.length === 0) {
      setShowTagsModal(true);
    } else {
      handleSave(true);
    }
  };

  const handleTagsConfirm = (tags: string[]) => {
    setSelectedTags(tags);
    setShowTagsModal(false);
    handleSave(true);
  };

  const renderPreview = () => {
    if (!editor) return null;

    const content = editor.getJSON();
    return renderBlogContent(content);
  };

  const renderBlogContent = (content: any) => {
    if (!content) return null;

    const renderNode = (node: any, index: number): React.ReactNode => {
      if (!node) return null;

      const marks = node.marks || [];
      const hasStrong = marks.some((mark: any) => mark.type === 'bold');
      const hasEm = marks.some((mark: any) => mark.type === 'italic');
      const hasStrike = marks.some((mark: any) => mark.type === 'strike');
      const hasCode = marks.some((mark: any) => mark.type === 'code');
      const hasLink = marks.some((mark: any) => mark.type === 'link');
      const hasHighlight = marks.some((mark: any) => mark.type === 'highlight');
      const linkMark = marks.find((mark: any) => mark.type === 'link');
      const colorMark = marks.find((mark: any) => mark.type === 'textStyle');
      const fontMark = marks.find((mark: any) => mark.type === 'textStyle');
      
      let textAlign = node.attrs?.textAlign || 'left';
      
      if (node.text) {
        let result: React.ReactNode = node.text;
        
        if (hasCode) result = <code key={index} className="bg-gray-100 px-2 py-1 rounded text-primary-600 font-mono text-sm">{result}</code>;
        if (hasHighlight) result = <mark key={index} className="bg-yellow-200 px-1 rounded">{result}</mark>;
        if (hasStrike) result = <s key={index}>{result}</s>;
        if (hasEm) result = <em key={index}>{result}</em>;
        if (hasStrong) result = <strong key={index}>{result}</strong>;
        if (hasLink && linkMark?.attrs?.href) {
          result = <a key={index} href={linkMark.attrs.href} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">{result}</a>;
        }
        
        // Apply color and font family
        const style: any = {};
        if (colorMark?.attrs?.color) style.color = colorMark.attrs.color;
        if (fontMark?.attrs?.fontFamily) style.fontFamily = fontMark.attrs.fontFamily;
        
        if (Object.keys(style).length > 0) {
          result = <span key={index} style={style}>{result}</span>;
        }
        
        return result;
      }

      if (node.type === 'paragraph') {
        return (
          <p key={index} className={`text-gray-700 leading-relaxed mb-4 text-${textAlign}`}>
            {node.content ? node.content.map(renderNode) : null}
          </p>
        );
      }

      if (node.type === 'heading') {
        const level = node.attrs?.level || 1;
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        const headingClasses = {
          1: 'text-4xl font-bold text-gray-900 mb-6 font-serif leading-tight',
          2: 'text-3xl font-semibold text-gray-800 mb-5 font-serif leading-tight',
          3: 'text-2xl font-medium text-gray-700 mb-4 font-serif leading-tight'
        };
        return (
          <HeadingTag key={index} className={`${headingClasses[level as keyof typeof headingClasses]} text-${textAlign}`}>
            {node.content ? node.content.map(renderNode) : null}
          </HeadingTag>
        );
      }

      if (node.type === 'bulletList') {
        return (
          <ul key={index} className="list-disc ml-6 mb-4">
            {node.content ? node.content.map(renderNode) : null}
          </ul>
        );
      }

      if (node.type === 'orderedList') {
        return (
          <ol key={index} className="list-decimal ml-6 mb-4">
            {node.content ? node.content.map(renderNode) : null}
          </ol>
        );
      }

      if (node.type === 'listItem') {
        return (
          <li key={index} className="mb-2 text-gray-700 leading-relaxed">
            {node.content ? node.content.map(renderNode) : null}
          </li>
        );
      }

      if (node.type === 'blockquote') {
        return (
          <blockquote key={index} className="border-l-4 border-primary-400 pl-6 py-3 my-6 bg-primary-50 rounded-r-xl italic text-gray-600">
            {node.content ? node.content.map(renderNode) : null}
          </blockquote>
        );
      }

      if (node.type === 'codeBlock') {
        return (
          <pre key={index} className="bg-gray-900 rounded-xl p-6 my-6 overflow-x-auto">
            <code className="text-gray-100 font-mono">
              {node.content ? node.content.map(renderNode) : null}
            </code>
          </pre>
        );
      }

      if (node.type === 'image') {
        return (
          <figure key={index} className="my-6">
            <img 
              src={node.attrs?.src} 
              alt={node.attrs?.alt || ''} 
              className="rounded-xl max-w-full h-auto shadow-md" 
              style={{ 
                width: node.attrs?.width ? `${node.attrs.width}px` : 'auto',
                height: node.attrs?.height ? `${node.attrs.height}px` : 'auto'
              }}
            />
          </figure>
        );
      }

      if (node.type === 'horizontalRule') {
        return <hr key={index} className="my-6 border-t border-gray-200" />;
      }

      if (node.type === 'doc') {
        return (
          <React.Fragment key={index}>
            {node.content ? node.content.map(renderNode) : null}
          </React.Fragment>
        );
      }

      return (
        <div key={index} className="text-gray-700">
          {node.content ? node.content.map(renderNode) : null}
        </div>
      );
    };

    return (
      <div className="prose prose-lg max-w-none">
        {content.content ? content.content.map(renderNode) : null}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success/Error Notifications */}
      <AnimatePresence>
        {(showSuccess || showError) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-lg border ${
              showSuccess 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              {showSuccess ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium">{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigate('/my-blogs')}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-700">
                  {currentBlog ? 'Edit Blog' : 'New Blog'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Auto-save Status */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {autoSaveStatus === 'saving' && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                )}
                {autoSaveStatus === 'saved' && lastSaved && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  </>
                )}
                {autoSaveStatus === 'error' && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>Save failed</span>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>{wordCount} words</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{readingTime} min read</span>
                </div>
              </div>

              {/* Tags Display */}
              {selectedTags.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.slice(0, 2).map((tag) => (
                      <span key={tag} className="badge-primary text-xs">
                        #{tag}
                      </span>
                    ))}
                    {selectedTags.length > 2 && (
                      <span className="text-xs text-gray-500">+{selectedTags.length - 2}</span>
                    )}
                  </div>
                </div>
              )}
              
              <motion.button
                onClick={() => setShowPreview(!showPreview)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </motion.button>
              
              <motion.button
                onClick={handlePublish}
                disabled={isSaving || !title.trim()}
                className="btn-primary flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSaving ? 'Publishing...' : (isPublished ? 'Update' : 'Publish')}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <input
            type="text"
            placeholder="Enter your blog title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-bold bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 resize-none"
          />
        </motion.div>

        {/* Preview/Editor Toggle */}
        <AnimatePresence mode="wait">
          {showPreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-6">{title || 'Untitled'}</h1>
              {renderPreview()}
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200"
            >
              <EditorToolbar editor={editor} />
              <div className="min-h-[600px]">
                <EditorContent editor={editor} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <BlockMenu editor={editor} />

        {/* Footer */}
        <div className="mt-8 p-4 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-4">
            <span>Press @ for blocks</span>
            <span>•</span>
            <span>Auto-saves every 2 seconds</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-4 h-4" />
              <span>AI writing assistant coming soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tags Modal */}
      <TagsModal
        isOpen={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        onConfirm={handleTagsConfirm}
        selectedTags={selectedTags}
      />
    </div>
  );
};

// Debounce utility function
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default BlogEditor;