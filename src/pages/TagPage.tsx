import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, 
  ArrowLeft, 
  TrendingUp, 
  Calendar,
  Users,
  FileText,
  Hash
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import BlogCard from '../components/BlogCard';

const TagPage: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const { user } = useAuthStore();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagStats, setTagStats] = useState({
    totalBlogs: 0,
    totalAuthors: 0,
    totalLikes: 0,
    totalViews: 0
  });

  useEffect(() => {
    if (tag) {
      fetchTagBlogs();
    }
  }, [tag, user]);

  const fetchTagBlogs = async () => {
    if (!tag) return;

    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('published', true)
        .contains('tags', [tag])
        .order('created_at', { ascending: false });

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

      // Calculate tag statistics
      const uniqueAuthors = new Set(data?.map(blog => blog.author_id));
      const totalLikes = data?.reduce((sum, blog) => sum + blog.likes_count, 0) || 0;
      const totalViews = data?.reduce((sum, blog) => sum + blog.views_count, 0) || 0;

      setTagStats({
        totalBlogs: data?.length || 0,
        totalAuthors: uniqueAuthors.size,
        totalLikes,
        totalViews
      });
    } catch (error) {
      console.error('Error fetching tag blogs:', error);
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
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8 shimmer" />
            <div className="h-12 bg-gray-200 rounded w-1/2 mb-6 shimmer" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl shimmer" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Feed</span>
          </Link>
        </motion.div>

        {/* Tag Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
              <Hash className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">#{tag}</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore all blogs tagged with #{tag}
          </p>
        </motion.div>

        {/* Tag Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="card text-center">
            <FileText className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{tagStats.totalBlogs}</div>
            <div className="text-sm text-gray-600">Total Blogs</div>
          </div>
          <div className="card text-center">
            <Users className="w-8 h-8 text-success-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{tagStats.totalAuthors}</div>
            <div className="text-sm text-gray-600">Authors</div>
          </div>
          <div className="card text-center">
            <TrendingUp className="w-8 h-8 text-error-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{tagStats.totalLikes}</div>
            <div className="text-sm text-gray-600">Total Likes</div>
          </div>
          <div className="card text-center">
            <Calendar className="w-8 h-8 text-warning-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{tagStats.totalViews}</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
        </motion.div>

        {/* Blogs List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <Tag className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Latest Blogs</h2>
          </div>

          <AnimatePresence mode="wait">
            {blogs.length > 0 ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              >
                {blogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <BlogCard
                      blog={blog}
                      onLike={() => handleLike(blog.id)}
                      onBookmark={() => handleBookmark(blog.id)}
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
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Hash className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No blogs found for #{tag}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Be the first to write a blog with this tag! Share your knowledge and insights with the community.
                </p>
                <Link to="/editor" className="btn-primary">
                  Write First Blog
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default TagPage;