import { create } from 'zustand';
import { Blog, BlockData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { 
  createBlog, 
  updateBlog, 
  deleteBlog, 
  getBlogById, 
  getBlogsByUserId 
} from '../lib/supabase';

interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  isLoading: boolean;
  error: string | null;
  
  fetchUserBlogs: (userId: string) => Promise<void>;
  fetchBlog: (id: string) => Promise<void>;
  createNewBlog: (userId: string, title?: string) => Promise<Blog>;
  updateBlogContent: (id: string, content: BlockData[]) => Promise<void>;
  updateBlogDetails: (id: string, data: Partial<Blog>) => Promise<void>;
  removeBlog: (id: string) => Promise<void>;
  addBlock: (type: BlockData['type'], position?: number) => void;
  updateBlock: (id: string, data: Partial<BlockData>) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (sourceIndex: number, destinationIndex: number) => void;
}

export const useBlogStore = create<BlogState>((set, get) => ({
  blogs: [],
  currentBlog: null,
  isLoading: false,
  error: null,

  fetchUserBlogs: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const blogs = await getBlogsByUserId(userId);
      set({ blogs, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchBlog: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const blog = await getBlogById(id);
      set({ currentBlog: blog, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createNewBlog: async (userId, title = 'Untitled Blog') => {
    set({ isLoading: true, error: null });
    try {
      const slug = title.toLowerCase().replace(/\s+/g, '-');
      const randomUrl = nanoid(10);
      
      const newBlog: Partial<Blog> = {
        userId,
        title,
        slug,
        isPublished: false,
        randomUrl,
        content: [
          {
            id: uuidv4(),
            type: 'heading',
            content: 'Welcome to your new blog',
            level: 1
          },
          {
            id: uuidv4(),
            type: 'text',
            content: 'Start writing your awesome content here...'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const blog = await createBlog(newBlog);
      
      set(state => ({
        blogs: [...state.blogs, blog],
        currentBlog: blog,
        isLoading: false
      }));
      
      return blog;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateBlogContent: async (id, content) => {
    set({ isLoading: true, error: null });
    try {
      const { currentBlog } = get();
      
      if (!currentBlog) throw new Error('No blog selected');
      
      const updatedBlog = {
        ...currentBlog,
        content,
        updatedAt: new Date().toISOString()
      };
      
      await updateBlog(id, { content, updatedAt: updatedBlog.updatedAt });
      
      set(state => ({
        blogs: state.blogs.map(blog => 
          blog.id === id ? updatedBlog : blog
        ),
        currentBlog: updatedBlog,
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateBlogDetails: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const { currentBlog } = get();
      
      if (!currentBlog) throw new Error('No blog selected');
      
      const updatedData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      await updateBlog(id, updatedData);
      
      const updatedBlog = {
        ...currentBlog,
        ...updatedData
      };
      
      set(state => ({
        blogs: state.blogs.map(blog => 
          blog.id === id ? updatedBlog : blog
        ),
        currentBlog: updatedBlog,
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  removeBlog: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteBlog(id);
      
      set(state => ({
        blogs: state.blogs.filter(blog => blog.id !== id),
        currentBlog: state.currentBlog?.id === id ? null : state.currentBlog,
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addBlock: (type, position) => {
    const { currentBlog } = get();
    
    if (!currentBlog) return;
    
    const newBlock: BlockData = {
      id: uuidv4(),
      type,
      content: '',
    };
    
    if (type === 'heading') {
      newBlock.level = 2;
    }
    
    const updatedContent = [...currentBlog.content];
    
    if (position !== undefined) {
      updatedContent.splice(position, 0, newBlock);
    } else {
      updatedContent.push(newBlock);
    }
    
    set({
      currentBlog: {
        ...currentBlog,
        content: updatedContent,
        updatedAt: new Date().toISOString()
      }
    });
  },

  updateBlock: (id, data) => {
    const { currentBlog } = get();
    
    if (!currentBlog) return;
    
    const updatedContent = currentBlog.content.map(block => 
      block.id === id ? { ...block, ...data } : block
    );
    
    set({
      currentBlog: {
        ...currentBlog,
        content: updatedContent,
        updatedAt: new Date().toISOString()
      }
    });
  },

  removeBlock: (id) => {
    const { currentBlog } = get();
    
    if (!currentBlog) return;
    
    const updatedContent = currentBlog.content.filter(block => block.id !== id);
    
    set({
      currentBlog: {
        ...currentBlog,
        content: updatedContent,
        updatedAt: new Date().toISOString()
      }
    });
  },

  reorderBlocks: (sourceIndex, destinationIndex) => {
    const { currentBlog } = get();
    
    if (!currentBlog) return;
    
    const updatedContent = [...currentBlog.content];
    const [removed] = updatedContent.splice(sourceIndex, 1);
    updatedContent.splice(destinationIndex, 0, removed);
    
    set({
      currentBlog: {
        ...currentBlog,
        content: updatedContent,
        updatedAt: new Date().toISOString()
      }
    });
  }
}));