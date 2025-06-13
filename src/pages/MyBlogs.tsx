import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  TrendingUp,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import BlogCard from '../components/BlogCard';

const MyBlogs: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchMyBlogs();
    }
  }, [user, filter]);

  const fetchMyBlogs = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('blogs')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('author_id', user.id);

      // Apply filter
      if (filter === 'published') {
        query = query.eq('published', true);
      } else if (filter === 'drafts') {
        query = query.eq('published', false);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });
      
      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog: any) => {
    navigate(`/editor/${blog.id}`);
  };

  const handleDelete = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blogId);
      
      if (error) throw error;
      
      setBlogs(blogs.filter(blog => blog.id !== blogId));
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const handleTogglePublish = async (blog: any) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ published: !blog.published })
        .eq('id', blog.id);
      
      if (error) throw error;
      
      setBlogs(blogs.map(b => 
        b.id === blog.id ? { ...b, published: !b.published } : b
      ));
    } catch (error) {
      console.error('Error updating blog:', error);
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: blogs.length,
    published: blogs.filter(b => b.published).length,
    drafts: blogs.filter(b => !b.published).length,
    totalViews: blogs.reduce((sum, b) => sum + b.views_count, 0),
    totalLikes: blogs.reduce((sum, b) => sum + b.likes_count, 0),
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Blogs</h1>
              <p className="text-gray-600">Manage your published blogs and drafts</p>
            </div>
            
            <motion.button
              onClick={() => navigate('/editor')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Write New Blog</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <div className="card text-center">
            <FileText className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Blogs</div>
          </div>
          <div className="card text-center">
            <Eye className="w-8 h-8 text-success-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.published}</div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
          <div className="card text-center">
            <Edit3 className="w-8 h-8 text-warning-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.drafts}</div>
            <div className="text-sm text-gray-600">Drafts</div>
          </div>
          <div className="card text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalViews}</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
          <div className="card text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ❤️
            </motion.div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalLikes}</div>
            <div className="text-sm text-gray-600">Total Likes</div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full pl-12"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'published', label: 'Published' },
              { key: 'drafts', label: 'Drafts' },
            ].map(({ key, label }) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === key
                    ? 'bg-primary-600 text-white shadow-glow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Blog List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 shimmer" />
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded shimmer" />
                    <div className="h-4 bg-gray-200 rounded w-5/6 shimmer" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-20 shimmer" />
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 bg-gray-200 rounded shimmer" />
                      <div className="h-8 w-8 bg-gray-200 rounded shimmer" />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : filteredBlogs.length > 0 ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {filteredBlogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{blog.title}</h3>
                        <span className={`badge ${
                          blog.published ? 'badge-success' : 'badge-warning'
                        }`}>
                          {blog.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      
                      {blog.excerpt && (
                        <p className="text-gray-600 line-clamp-2 mb-3">{blog.excerpt}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(blog.updated_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{blog.views_count} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>❤️</span>
                          <span>{blog.likes_count} likes</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <motion.button
                        onClick={() => handleTogglePublish(blog)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          blog.published
                            ? 'text-warning-600 hover:bg-warning-100'
                            : 'text-success-600 hover:bg-success-100'
                        }`}
                        title={blog.published ? 'Unpublish' : 'Publish'}
                      >
                        {blog.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </motion.button>
                      
                      <motion.button
                        onClick={() => handleEdit(blog)}
                        className="p-2 rounded-lg text-primary-600 hover:bg-primary-100 transition-all duration-200"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </motion.button>
                      
                      <motion.button
                        onClick={() => handleDelete(blog.id)}
                        className="p-2 rounded-lg text-error-600 hover:bg-error-100 transition-all duration-200"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Edit3 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchQuery ? 'No blogs found' : 'Start your writing journey'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters.'
                  : 'Share your thoughts, experiences, and expertise with the world. Your first blog is just a click away!'
                }
              </p>
              {!searchQuery && (
                <motion.button
                  onClick={() => navigate('/editor')}
                  className="btn-primary"
                >
                  Write Your First Blog
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyBlogs;