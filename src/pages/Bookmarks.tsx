import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark, 
  Search, 
  Calendar,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import BlogCard from '../components/BlogCard';

const Bookmarks: React.FC = () => {
  const { user } = useAuthStore();
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          *,
          blogs (
            *,
            profiles (
              username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user interactions for each blog
      const blogsWithInteractions = await Promise.all(
        (data || []).map(async (bookmark) => {
          const blog = bookmark.blogs;
          if (!blog) return null;

          const [likeData, followData] = await Promise.all([
            supabase.from('likes').select('id').eq('user_id', user.id).eq('blog_id', blog.id).single(),
            supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', blog.author_id).single()
          ]);

          return {
            ...blog,
            bookmark_id: bookmark.id,
            bookmark_created_at: bookmark.created_at,
            is_liked: !!likeData.data,
            is_bookmarked: true,
            is_following: !!followData.data
          };
        })
      );

      setBookmarkedBlogs(blogsWithInteractions.filter(Boolean));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (blogId: string) => {
    if (!user) return;

    const blog = bookmarkedBlogs.find(b => b.id === blogId);
    if (!blog) return;

    try {
      if (blog.is_liked) {
        await supabase.from('likes').delete().eq('user_id', user.id).eq('blog_id', blogId);
        setBookmarkedBlogs(bookmarkedBlogs.map(b => 
          b.id === blogId 
            ? { ...b, is_liked: false, likes_count: b.likes_count - 1 }
            : b
        ));
      } else {
        await supabase.from('likes').insert([{ user_id: user.id, blog_id: blogId }]);
        setBookmarkedBlogs(bookmarkedBlogs.map(b => 
          b.id === blogId 
            ? { ...b, is_liked: true, likes_count: b.likes_count + 1 }
            : b
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleRemoveBookmark = async (blogId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('blog_id', blogId);

      setBookmarkedBlogs(bookmarkedBlogs.filter(b => b.id !== blogId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const handleFollow = async (blogId: string) => {
    if (!user) return;

    const blog = bookmarkedBlogs.find(b => b.id === blogId);
    if (!blog) return;

    try {
      if (blog.is_following) {
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', blog.author_id);
        setBookmarkedBlogs(bookmarkedBlogs.map(b => 
          b.author_id === blog.author_id ? { ...b, is_following: false } : b
        ));
      } else {
        await supabase.from('follows').insert([{ follower_id: user.id, following_id: blog.author_id }]);
        setBookmarkedBlogs(bookmarkedBlogs.map(b => 
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
  };

  const filteredBlogs = bookmarkedBlogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bookmarks</h1>
              <p className="text-gray-600">Your saved blogs for later reading</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bookmarked blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full pl-12"
            />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="card text-center">
            <Bookmark className="w-8 h-8 text-warning-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{bookmarkedBlogs.length}</div>
            <div className="text-sm text-gray-600">Total Bookmarks</div>
          </div>
          <div className="card text-center">
            <Calendar className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {bookmarkedBlogs.filter(b => {
                const bookmarkDate = new Date(b.bookmark_created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return bookmarkDate > weekAgo;
              }).length}
            </div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
          <div className="card text-center">
            <ExternalLink className="w-8 h-8 text-success-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {new Set(bookmarkedBlogs.map(b => b.author_id)).size}
            </div>
            <div className="text-sm text-gray-600">Unique Authors</div>
          </div>
        </motion.div>

        {/* Bookmarked Blogs */}
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
                  className="relative"
                >
                  <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white rounded-lg px-3 py-1 shadow-medium border border-gray-200">
                        <span className="text-xs text-gray-500">
                          Saved {formatDate(blog.bookmark_created_at)}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRemoveBookmark(blog.id)}
                        className="p-2 bg-white rounded-lg shadow-medium border border-gray-200 text-error-600 hover:bg-error-50 transition-colors"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  
                  <BlogCard
                    blog={blog}
                    onLike={() => handleLike(blog.id)}
                    onBookmark={() => handleRemoveBookmark(blog.id)}
                    onShare={() => handleShare(blog.id)}
                    onFollow={() => handleFollow(blog.id)}
                  />
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
              <div className="w-20 h-20 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchQuery ? 'No bookmarks found' : 'No bookmarks yet'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search terms.'
                  : 'Start bookmarking blogs you want to read later. Click the bookmark icon on any blog to save it here.'
                }
              </p>
              {!searchQuery && (
                <Link to="/" className="btn-primary">
                  Explore Blogs
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Bookmarks;