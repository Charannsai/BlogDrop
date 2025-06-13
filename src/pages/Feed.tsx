import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Filter,
  Grid3X3,
  List,
  Search,
  Users,
  BookOpen,
  Award
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import BlogCard from '../components/BlogCard';

const Feed: React.FC = () => {
  const { user } = useAuthStore();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'recent' | 'trending' | 'liked'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, [filter, user]);

  const fetchBlogs = async () => {
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
        .eq('published', true);

      // Apply sorting based on filter
      switch (filter) {
        case 'trending':
          query = query.order('likes_count', { ascending: false });
          break;
        case 'liked':
          query = query.order('likes_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(20);
      
      if (error) throw error;
      
      // Fetch user interactions for each blog
      const blogsWithInteractions = await Promise.all(
        (data || []).map(async (blog) => {
          if (!user) return { ...blog, is_liked: false, is_bookmarked: false, is_following: false };

          const [likeData, bookmarkData, followData] = await Promise.all([
            supabase.from('likes').select('id').eq('user_id', user.id).eq('blog_id', blog.id).single(),
            supabase.from('bookmarks').select('id').eq('user_id', user.id).eq('blog_id', blog.id).single(),
            supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', blog.author_id).single()
          ]);

          return {
            ...blog,
            is_liked: !!likeData.data,
            is_bookmarked: !!bookmarkData.data,
            is_following: !!followData.data
          };
        })
      );

      setBlogs(blogsWithInteractions);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (blogId: string) => {
    if (!user) return;

    const blog = blogs.find(b => b.id === blogId);
    if (!blog) return;

    try {
      if (blog.is_liked) {
        await supabase.from('likes').delete().eq('user_id', user.id).eq('blog_id', blogId);
        setBlogs(blogs.map(b => 
          b.id === blogId 
            ? { ...b, is_liked: false, likes_count: b.likes_count - 1 }
            : b
        ));
      } else {
        await supabase.from('likes').insert([{ user_id: user.id, blog_id: blogId }]);
        setBlogs(blogs.map(b => 
          b.id === blogId 
            ? { ...b, is_liked: true, likes_count: b.likes_count + 1 }
            : b
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async (blogId: string) => {
    if (!user) return;

    const blog = blogs.find(b => b.id === blogId);
    if (!blog) return;

    try {
      if (blog.is_bookmarked) {
        await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('blog_id', blogId);
        setBlogs(blogs.map(b => 
          b.id === blogId ? { ...b, is_bookmarked: false } : b
        ));
      } else {
        await supabase.from('bookmarks').insert([{ user_id: user.id, blog_id: blogId }]);
        setBlogs(blogs.map(b => 
          b.id === blogId ? { ...b, is_bookmarked: true } : b
        ));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleFollow = async (blogId: string) => {
    if (!user) return;

    const blog = blogs.find(b => b.id === blogId);
    if (!blog) return;

    try {
      if (blog.is_following) {
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', blog.author_id);
        setBlogs(blogs.map(b => 
          b.author_id === blog.author_id ? { ...b, is_following: false } : b
        ));
      } else {
        await supabase.from('follows').insert([{ follower_id: user.id, following_id: blog.author_id }]);
        setBlogs(blogs.map(b => 
          b.author_id === blog.author_id ? { ...b, is_following: true } : b
        ));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleShare = (blogId: string) => {
    const url = `${window.location.origin}/blog/${blogId}`;
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

  const filters = [
    { key: 'recent', label: 'Recent', icon: Clock, description: 'Latest posts' },
    { key: 'trending', label: 'Trending', icon: TrendingUp, description: 'Popular this week' },
    { key: 'liked', label: 'Most Liked', icon: Sparkles, description: 'Community favorites' },
  ];

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8"
        >
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map(({ key, label, icon: Icon, description }) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilter(key as any)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  filter === key
                    ? 'bg-primary-600 text-white shadow-glow'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <div>{label}</div>
                  <div className={`text-xs ${filter === key ? 'text-primary-100' : 'text-gray-500'}`}>
                    {description}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-full pl-12"
              />
            </div>

            <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
              <motion.button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Blog Feed */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl shimmer" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2 shimmer" />
                      <div className="h-3 bg-gray-200 rounded w-32 shimmer" />
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 shimmer" />
                    <div className="h-4 bg-gray-200 rounded shimmer" />
                    <div className="h-4 bg-gray-200 rounded w-5/6 shimmer" />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex space-x-6">
                      <div className="h-4 bg-gray-200 rounded w-8 shimmer" />
                      <div className="h-4 bg-gray-200 rounded w-8 shimmer" />
                      <div className="h-4 bg-gray-200 rounded w-8 shimmer" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-4 shimmer" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1 max-w-4xl mx-auto'
              }`}
            >
              {filteredBlogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <BlogCard
                    blog={blog}
                    onLike={() => handleLike(blog.id)}
                    onBookmark={() => handleBookmark(blog.id)}
                    onShare={() => handleShare(blog.id)}
                    onFollow={() => handleFollow(blog.id)}
                    variant={index === 0 && filter === 'trending' ? 'featured' : 'default'}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!loading && filteredBlogs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-large">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchQuery ? 'No blogs found' : 'No blogs found'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery 
                ? 'Try adjusting your search terms or browse all blogs.'
                : 'Be the first to share your story with the community! Your unique perspective could inspire thousands.'
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Feed;