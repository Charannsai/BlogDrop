import React, { useEffect, useState, useCallback } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { Save, Plus } from 'lucide-react';
import { BlockData, BlockType } from '../../types';
import { useBlogStore } from '../../store/blogStore';
import DraggableBlock from './DraggableBlock';
import EditorSidebar from './EditorSidebar';
import Button from '../ui/Button';
import debounce from 'lodash/debounce';

interface EditorProps {
  blogId: string;
  autoSave?: boolean;
}

const Editor: React.FC<EditorProps> = ({ blogId, autoSave = true }) => {
  const { 
    currentBlog, 
    fetchBlog, 
    updateBlogContent, 
    addBlock, 
    updateBlock, 
    removeBlock, 
    reorderBlocks,
    isLoading 
  } = useBlogStore();
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [localContent, setLocalContent] = useState<BlockData[]>([]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  useEffect(() => {
    fetchBlog(blogId);
  }, [blogId, fetchBlog]);

  useEffect(() => {
    if (currentBlog) {
      setLocalContent(currentBlog.content);
    }
  }, [currentBlog]);
  
  const debouncedSave = useCallback(
    debounce(async (content: BlockData[]) => {
      try {
        setIsSaving(true);
        await updateBlogContent(blogId, content);
        setLastSavedAt(new Date());
      } catch (error) {
        console.error('Error saving blog content:', error);
      } finally {
        setIsSaving(false);
      }
    }, 3000),
    [blogId, updateBlogContent]
  );
  
  useEffect(() => {
    if (autoSave && localContent.length > 0) {
      debouncedSave(localContent);
    }
    
    return () => {
      debouncedSave.cancel();
    };
  }, [localContent, autoSave, debouncedSave]);
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = localContent.findIndex(block => block.id === active.id);
    const newIndex = localContent.findIndex(block => block.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newContent = [...localContent];
      const [removed] = newContent.splice(oldIndex, 1);
      newContent.splice(newIndex, 0, removed);
      setLocalContent(newContent);
      reorderBlocks(oldIndex, newIndex);
    }
  };
  
  const handleAddBlock = (type: BlockType, position?: number) => {
    addBlock(type, position);
    const newBlock = currentBlog?.content[position ?? currentBlog.content.length - 1];
    if (newBlock) {
      setLocalContent(prev => {
        const newContent = [...prev];
        if (position !== undefined) {
          newContent.splice(position, 0, newBlock);
        } else {
          newContent.push(newBlock);
        }
        return newContent;
      });
    }
  };
  
  const handleUpdateBlock = (id: string, data: Partial<BlockData>) => {
    updateBlock(id, data);
    setLocalContent(prev => 
      prev.map(block => block.id === id ? { ...block, ...data } : block)
    );
  };
  
  const handleRemoveBlock = (id: string) => {
    removeBlock(id);
    setLocalContent(prev => prev.filter(block => block.id !== id));
  };
  
  const handleManualSave = async () => {
    try {
      setIsSaving(true);
      await updateBlogContent(blogId, localContent);
      setLastSavedAt(new Date());
    } catch (error) {
      console.error('Error saving blog content:', error);
    } finally {
      setIsSaving(false);
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
      <EditorSidebar onAddBlock={handleAddBlock} />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2 border-b border-gray-100">
          <h2 className="text-xl font-bold font-jakarta text-gray-800">
            {currentBlog.title || 'Untitled Blog'}
          </h2>
          
          <div className="flex items-center space-x-3">
            {lastSavedAt && (
              <span className="text-sm text-gray-500">
                Last saved: {lastSavedAt.toLocaleTimeString()}
              </span>
            )}
            
            <Button
              variant="outline"
              size="sm"
              icon={<Plus size={16} />}
              onClick={() => handleAddBlock('text')}
            >
              Add Block
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              icon={<Save size={16} />}
              onClick={handleManualSave}
              isLoading={isSaving}
            >
              Save
            </Button>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localContent.map(block => block.id)}
              strategy={verticalListSortingStrategy}
            >
              {localContent.map((block) => (
                <DraggableBlock
                  key={block.id}
                  block={block}
                  onUpdate={handleUpdateBlock}
                  onDelete={handleRemoveBlock}
                />
              ))}
            </SortableContext>
          </DndContext>
          
          {localContent.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">Your blog is empty. Add some content!</p>
              <Button
                variant="primary"
                size="md"
                icon={<Plus size={18} />}
                onClick={() => handleAddBlock('heading')}
              >
                Add Your First Block
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;