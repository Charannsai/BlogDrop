import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Link as LinkIcon, 
  Calendar,
  Users,
  FileText,
  Heart,
  Eye,
  UserPlus,
  UserMinus,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import BlogCard from '../components/BlogCard';

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [userBlogs, setUserBlogs] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetchUserProfile();
      fetchUserBlogs();
      fetchFollowData();
      checkIfFollowing();
    }
  }, [username, user]);

  const fetchUserProfile = async () => {
    if (!username) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserBlogs = async () => {
    if (!username) return;

    try {
      // First get the user's profile to get their ID
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (!profileData) return;

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
        .eq('author_id', profileData.id)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user interactions for each blog
      const blogsWithInteractions = await Promise.all(
        (data || []).map(async (blog) => {
          if (!user) return { ...blog, is_liked: false, is_bookmarked: false, is_following: false };

          const [likeData, bookmarkData] = await Promise.all([
            supabase.from('likes').select('id').eq('user_id', user.id).eq('blog_id', blog.id).single(),
            supabase.from('bookmarks').select('id').eq('user_id', user.id).eq('blog_id', blog.id).single()
          ]);

          return {
            ...blog,
            is_liked: !!likeData.data,
            is_bookmarked: !!bookmarkData.data,
            is_following: isFollowing
          };
        })
      );

      setUserBlogs(blogsWithInteractions);
    } catch (error) {
      console.error('Error fetching user blogs:', error);
    }
  };

  const fetchFollowData = async () => {
    if (!username) return;

    try {
      // Get user ID first
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (!profileData) return;

      // Fetch followers
      const { data: followersData, error: followersError } = await supabase
        .from('follows')
        .select(`
          follower_id,
          profiles!follows_follower_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('following_id', profileData.id);

      if (followersError) throw followersError;

      // Fetch following
      const { data: followingData, error: followingError } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles!follows_following_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('follower_id', profileData.id);

      if (followingError) throw followingError;

      setFollowers(followersData || []);
      setFollowing(followingData || []);
    } catch (error) {
      console.error('Error fetching follow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFollowing = async () => {
    if (!user || !username) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (!profileData) return;

      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profileData.id)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user || !profile) return;

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);
      } else {
        await supabase
          .from('follows')
          .insert([{ follower_id: user.id, following_id: profile.id }]);
      }
      
      setIsFollowing(!isFollowing);
      
      // Update followers count
      if (isFollowing) {
        setFollowers(followers.filter(f => f.follower_id !== user.id));
      } else {
        // Add current user to followers list
        const { data: currentUserProfile } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (currentUserProfile) {
          setFollowers([...followers, { 
            follower_id: user.id, 
            profiles: currentUserProfile 
          }]);
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleLike = async (blogId: string) => {
    if (!user) return;

    const blog = userBlogs.find(b => b.id === blogId);
    if (!blog) return;

    try {
      if (blog.is_liked) {
        await supabase.from('likes').delete().eq('user_id', user.id).eq('blog_id', blogId);
        setUserBlogs(userBlogs.map(b => 
          b.id === blogId 
            ? { ...b, is_liked: false, likes_count: b.likes_count - 1 }
            : b
        ));
      } else {
        await supabase.from('likes').insert([{ user_id: user.id, blog_id: blogId }]);
        setUserBlogs(userBlogs.map(b => 
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

    const blog = userBlogs.find(b => b.id === blogId);
    if (!blog) return;

    try {
      if (blog.is_bookmarked) {
        await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('blog_id', blogId);
        setUserBlogs(userBlogs.map(b => 
          b.id === blogId ? { ...b, is_bookmarked: false } : b
        ));
      } else {
        await supabase.from('bookmarks').insert([{ user_id: user.id, blog_id: blogId }]);
        setUserBlogs(userBlogs.map(b => 
          b.id === blogId ? { ...b, is_bookmarked: true } : b
        ));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleShare = (blogId: string) => {
    const url = `${window.location.origin}/blog/${blogId}`;
    navigator.clipboard.writeText(url);
  };

  const stats = {
    blogs: userBlogs.length,
    totalLikes: userBlogs.reduce((sum, blog) => sum + blog.likes_count, 0),
    totalViews: userBlogs.reduce((sum, blog) => sum + blog.views_count, 0),
    followers: followers.length,
    following: following.length
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8 shimmer" />
            <div className="h-32 bg-gray-200 rounded-2xl mb-8 shimmer" />
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-24 h-24 bg-gray-200 rounded-2xl shimmer" />
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-48 mb-2 shimmer" />
                <div className="h-4 bg-gray-200 rounded w-32 shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-8 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
          <Link to="/" className="btn-primary">
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8"
        >
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl mb-6 relative">
            <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
          </div>

          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              {/* Profile Picture */}
              <div className="relative -mt-16">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name}
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-large"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-large">
                    <span className="text-white font-bold text-2xl">
                      {profile?.full_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile?.full_name}</h1>
                <p className="text-gray-600 mb-2">@{profile?.username}</p>
                {profile?.bio && (
                  <p className="text-gray-700 mb-4 leading-relaxed">{profile.bio}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {profile?.website && (
                    <div className="flex items-center space-x-1">
                      <LinkIcon className="w-4 h-4" />
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        Website
                      </a>
                    </div>
                  )}
                  {profile?.twitter && (
                    <div className="flex items-center space-x-1">
                      <span>@</span>
                      <span>{profile.twitter}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(profile?.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {!isOwnProfile && (
                <motion.button
                  onClick={handleFollow}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-700 text-white hover:bg-blue-800'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      <span>Unfollow</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </motion.button>
              )}
              
              {isOwnProfile && (
                <Link to="/profile" className="btn-secondary">
                  Edit Profile
                </Link>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.blogs}</div>
              <div className="text-sm text-gray-600">Blogs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.followers}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.following}</div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalLikes}</div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalViews}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
          </div>
        </motion.div>

        {/* User Blogs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Published Blogs</h2>
          </div>

          {userBlogs.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {userBlogs.map((blog, index) => (
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
                    variant="compact"
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No published blogs yet</h3>
              <p className="text-gray-600">
                {isOwnProfile 
                  ? "Start writing and share your thoughts with the world!" 
                  : `${profile.full_name} hasn't published any blogs yet.`
                }
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;