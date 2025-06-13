import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Edit3, 
  MapPin, 
  Link as LinkIcon, 
  Calendar,
  Users,
  FileText,
  Heart,
  Eye,
  Settings,
  Save,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import BlogCard from '../components/BlogCard';
import ImageUpload from '../components/ImageUpload';

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [userBlogs, setUserBlogs] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    website: '',
    twitter: '',
    avatar_url: '',
    cover_url: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserBlogs();
      fetchFollowData();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setEditForm({
        full_name: data.full_name || '',
        bio: data.bio || '',
        website: data.website || '',
        twitter: data.twitter || '',
        avatar_url: data.avatar_url || '',
        cover_url: data.cover_url || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserBlogs = async () => {
    if (!user) return;

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
        .eq('author_id', user.id)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserBlogs(data || []);
    } catch (error) {
      console.error('Error fetching user blogs:', error);
    }
  };

  const fetchFollowData = async () => {
    if (!user) return;

    try {
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
        .eq('following_id', user.id);

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
        .eq('follower_id', user.id);

      if (followingError) throw followingError;

      setFollowers(followersData || []);
      setFollowing(followingData || []);
    } catch (error) {
      console.error('Error fetching follow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(editForm)
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleImageChange = (type: 'avatar' | 'cover', imageUrl: string | null) => {
    if (type === 'avatar') {
      setEditForm({ ...editForm, avatar_url: imageUrl || '' });
    } else {
      setEditForm({ ...editForm, cover_url: imageUrl || '' });
    }
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

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8"
        >
          {/* Cover Image */}
          {isEditing ? (
            <ImageUpload
              currentImage={editForm.cover_url}
              onImageChange={(url) => handleImageChange('cover', url)}
              type="cover"
              className="mb-6"
            />
          ) : (
            <div 
              className="h-32 rounded-2xl mb-6 relative"
              style={
                profile?.cover_url 
                  ? { backgroundImage: `url(${profile.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: 'linear-gradient(to right, #3b82f6, #1d4ed8)' }
              }
            >
              <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
            </div>
          )}

          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              {/* Profile Picture */}
              <div className="relative -mt-16">
                {isEditing ? (
                  <ImageUpload
                    currentImage={editForm.avatar_url}
                    onImageChange={(url) => handleImageChange('avatar', url)}
                    type="avatar"
                  />
                ) : (
                  <>
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
                  </>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="input-field text-2xl font-bold"
                      placeholder="Full Name"
                    />
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="input-field resize-none"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="url"
                        value={editForm.website}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        className="input-field"
                        placeholder="Website URL"
                      />
                      <input
                        type="text"
                        value={editForm.twitter}
                        onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                        className="input-field"
                        placeholder="Twitter handle"
                      />
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <motion.button
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </motion.button>
                  <motion.button
                    onClick={handleSaveProfile}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </motion.button>
                </>
              ) : (
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </motion.button>
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
                    variant="compact"
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No published blogs yet</h3>
              <p className="text-gray-600">Start writing and share your thoughts with the world!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;