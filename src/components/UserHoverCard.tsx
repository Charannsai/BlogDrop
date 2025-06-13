import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  User, 
  Users, 
  FileText, 
  Heart, 
  Eye,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface UserHoverCardProps {
  username: string;
  children: React.ReactNode;
  className?: string;
}

const UserHoverCard: React.FC<UserHoverCardProps> = ({ username, children, className = '' }) => {
  const { user } = useAuthStore();
  const [isHovered, setIsHovered] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    blogs: 0,
    followers: 0,
    following: 0,
    totalLikes: 0
  });
  const [recentBlogs, setRecentBlogs] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setIsHovered(true);
      if (!profile) {
        fetchUserData();
      }
    }, 500); // 500ms delay before showing card
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHovered(false);
  };

  const fetchUserData = async () => {
    if (!username || loading) return;
    
    setLoading(true);
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user stats and recent blogs
      const [blogsData, followersData, followingData] = await Promise.all([
        supabase
          .from('blogs')
          .select('id, title, likes_count, views_count, created_at')
          .eq('author_id', profileData.id)
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('follows')
          .select('id')
          .eq('following_id', profileData.id),
        supabase
          .from('follows')
          .select('id')
          .eq('follower_id', profileData.id)
      ]);

      const totalLikes = blogsData.data?.reduce((sum, blog) => sum + blog.likes_count, 0) || 0;

      setStats({
        blogs: blogsData.data?.length || 0,
        followers: followersData.data?.length || 0,
        following: followingData.data?.length || 0,
        totalLikes
      });

      setRecentBlogs(blogsData.data || []);

      // Check if current user is following this user
      if (user && user.id !== profileData.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profileData.id)
          .single();

        setIsFollowing(!!followData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || !profile) return;

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);
        
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await supabase
          .from('follows')
          .insert([{ follower_id: user.id, following_id: profile.id }]);
        
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
      
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return `${Math.floor(diffInDays / 30)}mo ago`;
  };

  const isOwnProfile = user?.id === profile?.id;

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 top-full left-0 mt-2"
            style={{ transform: 'translateX(-50%)' }}
          >
            {loading ? (
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl shimmer" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2 shimmer" />
                    <div className="h-3 bg-gray-200 rounded w-20 shimmer" />
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-4 shimmer" />
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="text-center">
                      <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1 shimmer" />
                      <div className="h-3 bg-gray-200 rounded w-12 mx-auto shimmer" />
                    </div>
                  ))}
                </div>
              </div>
            ) : profile ? (
              <>
                {/* Profile Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <Link to={`/profile/${profile.username}`}>
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name}
                        className="w-12 h-12 rounded-xl object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
                        <span className="text-white font-semibold">
                          {profile.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${profile.username}`}>
                      <h3 className="font-semibold text-gray-900 truncate hover:text-primary-600 transition-colors">
                        {profile.full_name}
                      </h3>
                    </Link>
                    <Link to={`/profile/${profile.username}`}>
                      <p className="text-gray-600 text-sm hover:text-primary-600 transition-colors">
                        @{profile.username}
                      </p>
                    </Link>
                  </div>
                  {!isOwnProfile && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFollow}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isFollowing
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-blue-700 text-white hover:bg-blue-800'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="w-3 h-3" />
                          <span>Unfollow</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          <span>Follow</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed line-clamp-2">
                    {profile.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{stats.blogs}</div>
                    <div className="text-xs text-gray-600">Blogs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{stats.followers}</div>
                    <div className="text-xs text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{stats.following}</div>
                    <div className="text-xs text-gray-600">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{stats.totalLikes}</div>
                    <div className="text-xs text-gray-600">Likes</div>
                  </div>
                </div>

                {/* Recent Blogs */}
                {recentBlogs.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">Recent Blogs</h4>
                    <div className="space-y-2">
                      {recentBlogs.map((blog) => (
                        <Link
                          key={blog.id}
                          to={`/blog/${blog.id}`}
                          className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-gray-900 text-sm truncate flex-1">
                              {blog.title}
                            </h5>
                            <span className="text-xs text-gray-500 ml-2">
                              {formatDate(blog.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>{blog.likes_count}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{blog.views_count}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* View Profile Link */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    to={`/profile/${profile.username}`}
                    className="block text-center text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                  >
                    View Full Profile
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">User not found</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserHoverCard;