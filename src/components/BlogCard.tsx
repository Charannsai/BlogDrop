import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  Share2, 
  Clock, 
  Bookmark,
  MoreHorizontal,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { Database } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import UserHoverCard from './UserHoverCard';

type Blog = Database['public']['Tables']['blogs']['Row'] & {
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  is_liked?: boolean;
  is_bookmarked?: boolean;
  is_following?: boolean;
};

interface BlogCardProps {
  blog: Blog;
  onLike?: () => void;
  onComment?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onFollow?: () => void;
  variant?: 'default' | 'featured' | 'compact';
}

const BlogCard: React.FC<BlogCardProps> = ({ 
  blog, 
  onLike, 
  onComment, 
  onBookmark,
  onShare,
  onFollow,
  variant = 'default'
}) => {
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const readingTime = Math.ceil((blog.excerpt?.length || 0) / 200);

  const cardVariants = {
    default: "card-interactive",
    featured: "card-interactive bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200",
    compact: "card hover:shadow-medium"
  };

  const getContentPreview = () => {
    if (!blog.excerpt) return '';
    const words = blog.excerpt.split(' ');
    if (words.length <= 30) return blog.excerpt;
    return words.slice(0, 30).join(' ') + '...';
  };

  const shouldShowReadMore = () => {
    if (!blog.excerpt) return false;
    return blog.excerpt.split(' ').length > 30;
  };

  const isOwnPost = user?.id === blog.author_id;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    
    // Navigate to full blog post
    window.location.href = `/blog/${blog.id}`;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      
      className={`${cardVariants[variant]} cursor-pointer`}
      onClick={handleCardClick}
    >
      {/* Author Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 ">
          <UserHoverCard username={blog.profiles.username}>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              {blog.profiles.avatar_url ? (
                <img 
                  src={blog.profiles.avatar_url} 
                  alt={blog.profiles.full_name}
                  className="w-12 h-12 rounded-xl object-cover shadow-medium"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-medium">
                  <span className="text-white font-semibold text-lg">
                    {blog.profiles.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white"></div>
            </motion.div>
          </UserHoverCard>
          
          <div className="flex-1">
             <p className="font-semibold text-gray-900 hover:text-primary-600 transition-colors cursor-pointer">
                {blog.profiles.full_name}
              </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <UserHoverCard username={blog.profiles.username}>
                <span className="hover:text-primary-600 transition-colors cursor-pointer">@{blog.profiles.username}</span>
              </UserHoverCard>
              <span>•</span>
              <span>{formatDate(blog.created_at)}</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{readingTime} min read</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* {!isOwnPost && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onFollow?.();
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                blog.is_following
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {blog.is_following ? (
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
          )} */}

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <MoreHorizontal className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="mb-6">
        <motion.h2 
          whileHover={{ color: '#0284c7' }}
          className="text-xl font-bold text-gray-900 mb-3 leading-tight transition-colors"
        >
          {blog.title}
        </motion.h2>
        
        {blog.excerpt && (
          <div className="text-gray-600 leading-relaxed text-base">
            <p className={showFullContent ? '' : 'line-clamp-3'}>
              {showFullContent ? blog.excerpt : getContentPreview()}
            </p>
            
            {shouldShowReadMore() && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullContent(!showFullContent);
                }}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm mt-2 transition-colors"
              >
                {showFullContent ? 'Show less' : 'Read more'}
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['Technology', 'Web Development'].map((tag) => (
          <span 
            key={tag}
            className="badge-primary text-xs cursor-pointer hover:bg-primary-200 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            #{tag.toLowerCase().replace(' ', '')}
          </span>
        ))}
      </div>

      {/* Engagement Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
            className={`flex items-center space-x-2 transition-all duration-200 ${
              blog.is_liked 
                ? 'text-error-500 hover:text-error-600' 
                : 'text-gray-500 hover:text-error-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${blog.is_liked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{blog.likes_count}</span>
          </motion.button>

          <Link to={`/blog/${blog.id}#comments`} onClick={(e) => e.stopPropagation()}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center space-x-2 text-gray-500 hover:text-primary-600 transition-all duration-200"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{blog.comments_count}</span>
            </motion.button>
          </Link>

          <div className="flex items-center space-x-2 text-gray-500">
            <Eye className="w-5 h-5" />
            <span className="text-sm font-medium">{blog.views_count}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onBookmark?.();
            }}
            className={`p-2 rounded-lg transition-all duration-200 ${
              blog.is_bookmarked
                ? 'text-warning-600 bg-warning-100 hover:bg-warning-200'
                : 'text-gray-500 hover:text-warning-600 hover:bg-gray-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${blog.is_bookmarked ? 'fill-current' : ''}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onShare?.();
            }}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
};

export default BlogCard;