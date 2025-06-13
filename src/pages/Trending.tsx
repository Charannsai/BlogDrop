import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Flame, 
  Award, 
  Calendar,
  Eye,
  Heart,
  MessageCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import BlogCard from '../components/BlogCard';

const Trending: React.FC = () => {
  const { user } = useAuthStore();
  const [trendingBlogs, setTrendingBlogs] = useState<any[]>([]);
  const [topAuthors, setTopAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchTrendingData();
  }, [timeframe, user]);

  const fetchTrendingData = async () => {
    try {
      // Calculate date range based on timeframe
      const now = new Date();
      let startDate = new Date();
      
      switch (timeframe) {
        case 'today':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(now.getDate() - 30);
          break;
      }

      // Fetch trending blogs
      const { data: blogsData, error: blogsError } = await supabase
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
        .gte('created_at', startDate.toISOString())
        .order('likes_count', { ascending: false })
        .limit(20);

      if (blogsError) throw blogsError;

      // Fetch user interactions for blogs
      const blogsWithInteractions = await Promise.all(
        (blogsData || []).map(async (blog) => {
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

      setTrendingBlogs(blogsWithInteractions);

      // Fetch top authors
      const { data: authorsData, error: authorsError } = await supabase
        .from('profiles')
        .select(`
          *,
          blogs!inner (
            likes_count,
            views_count,
            created_at
          )
        `)
        .gte('blogs.created_at', startDate.toISOString())
        .limit(10);

      if (authorsError) throw authorsError;

      // Calculate author stats
      const authorsWithStats = (authorsData || []).map((author: any) => {
        const totalLikes = author.blogs.reduce((sum: number, blog: any) => sum + blog.likes_count, 0);
        const totalViews = author.blogs.reduce((sum: number, blog: any) => sum + blog.views_count, 0);
        const blogCount = author.blogs.length;

        return {
          ...author,
          total_likes: totalLikes,
          total_views: totalViews,
          blog_count: blogCount,
          engagement_score: totalLikes + (totalViews * 0.1)
        };
      }).sort((a: any, b: any) => b.engagement_score - a.engagement_score);

      setTopAuthors(authorsWithStats);
    } catch (error) {
      console.error('Error fetching trending data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (blogId: string) => {
    if (!user) return;

    const blog = trendingBlogs.find(b => b.id === blogId);
    if (!blog) return;

    try {
      if (blog.is_liked) {
        await supabase.from('likes').delete().eq('user_id', user.id).eq('blog_id', blogId);
        setTrendingBlogs(trendingBlogs.map(b => 
          b.id === blogId 
            ? { ...b, is_liked: false, likes_count: b.likes_count - 1 }
            : b
        ));
      } else {
        await supabase.from('likes').insert([{ user_id: user.id, blog_id: blogId }]);
        setTrendingBlogs(trendingBlogs.map(b => 
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

    const blog = trendingBlogs.find(b => b.id === blogId);
    if (!blog) return;

    try {
      if (blog.is_bookmarked) {
        await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('blog_id', blogId);
        setTrendingBlogs(trendingBlogs.map(b => 
          b.id === blogId ? { ...b, is_bookmarked: false } : b
        ));
      } else {
        await supabase.from('bookmarks').insert([{ user_id: user.id, blog_id: blogId }]);
        setTrendingBlogs(trendingBlogs.map(b => 
          b.id === blogId ? { ...b, is_bookmarked: true } : b
        ));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleFollow = async (blogId: string) => {
    if (!user) return;

    const blog = trendingBlogs.find(b => b.id === blogId);
    if (!blog) return;

    try {
      if (blog.is_following) {
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', blog.author_id);
        setTrendingBlogs(trendingBlogs.map(b => 
          b.author_id === blog.author_id ? { ...b, is_following: false } : b
        ));
      } else {
        await supabase.from('follows').insert([{ follower_id: user.id, following_id: blog.author_id }]);
        setTrendingBlogs(trendingBlogs.map(b => 
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

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
              <Fire className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Trending</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the most popular blogs and top creators in the community
          </p>
        </motion.div>

        {/* Timeframe Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
            {[
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' },
            ].map(({ key, label }) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTimeframe(key as any)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  timeframe === key
                    ? 'bg-primary-600 text-white shadow-glow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trending Blogs */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="w-6 h-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Trending Blogs</h2>
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="card animate-pulse">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-xl shimmer" />
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2 shimmer" />
                            <div className="h-3 bg-gray-200 rounded w-32 shimmer" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-6 bg-gray-200 rounded w-3/4 shimmer" />
                          <div className="h-4 bg-gray-200 rounded shimmer" />
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
                    className="space-y-6"
                  >
                    {trendingBlogs.map((blog, index) => (
                      <motion.div
                        key={blog.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        {index < 3 && (
                          <div className="absolute -top-2 -left-2 z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                        )}
                        <BlogCard
                          blog={blog}
                          onLike={() => handleLike(blog.id)}
                          onBookmark={() => handleBookmark(blog.id)}
                          onShare={() => handleShare(blog.id)}
                          onFollow={() => handleFollow(blog.id)}
                          variant={index === 0 ? 'featured' : 'default'}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {!loading && trendingBlogs.length === 0 && (
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No trending blogs yet</h3>
                  <p className="text-gray-600">Check back later for trending content!</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Top Authors Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card sticky top-24"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Award className="w-6 h-6 text-warning-600" />
                <h3 className="text-xl font-bold text-gray-900">Top Authors</h3>
              </div>

              <div className="space-y-4">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl shimmer" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-1 shimmer" />
                        <div className="h-3 bg-gray-200 rounded w-16 shimmer" />
                      </div>
                    </div>
                  ))
                ) : (
                  topAuthors.map((author, index) => (
                    <motion.div
                      key={author.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="relative">
                        {author.avatar_url ? (
                          <img 
                            src={author.avatar_url} 
                            alt={author.full_name}
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {author.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {index < 3 && (
                          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                          }`}>
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{author.full_name}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{author.total_likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{author.total_views}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {!loading && topAuthors.length === 0 && (
                <div className="text-center py-8">
                  <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No top authors yet</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending;