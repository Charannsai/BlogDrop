import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Eye,
  Calendar,
  Clock,
  ArrowLeft,
  Send,
  UserPlus,
  UserMinus,
  MoreHorizontal,
  Edit,
  Trash2,
  Tag
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import DOMPurify from 'dompurify';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
}

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [blog, setBlog] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  useEffect(() => {
    if (id) {
      fetchBlogPost();
      fetchComments();
      checkUserInteractions();
      incrementViewCount();
    }
  }, [id, user]);

  const fetchBlogPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url,
            bio
          )
        `)
        .eq('id', id)
        .eq('published', true)
        .single();

      if (error) throw error;
      setBlog(data);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('blog_id', id)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching comments:', error);
      } else {
        setComments(data || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const checkUserInteractions = async () => {
    if (!user || !id) return;

    try {
      // Check if liked
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('blog_id', id)
        .single();

      setIsLiked(!!likeData);

      // Check if bookmarked
      const { data: bookmarkData } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('blog_id', id)
        .single();

      setIsBookmarked(!!bookmarkData);

      // Check if following author
      if (blog?.author_id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', blog.author_id)
          .single();

        setIsFollowing(!!followData);
      }
    } catch (error) {
      console.error('Error checking user interactions:', error);
    }
  };

  const incrementViewCount = async () => {
    if (!id) return;

    try {
      await supabase.rpc('increment_view_count', { blog_id: id });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleLike = async () => {
    if (!user || !id) return;

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('blog_id', id);
        
        setBlog((prev: any) => ({ ...prev, likes_count: prev.likes_count - 1 }));
      } else {
        await supabase
          .from('likes')
          .insert([{ user_id: user.id, blog_id: id }]);
        
        setBlog((prev: any) => ({ ...prev, likes_count: prev.likes_count + 1 }));

        // Create notification for blog author
        if (blog?.author_id !== user.id) {
          await supabase
            .from('notifications')
            .insert([{
              user_id: blog.author_id,
              actor_id: user.id,
              type: 'like',
              message: 'liked your blog post',
              blog_id: id
            }]);
        }
      }
      
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user || !id) return;

    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('blog_id', id);
      } else {
        await supabase
          .from('bookmarks')
          .insert([{ user_id: user.id, blog_id: id }]);
      }
      
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleFollow = async () => {
    if (!user || !blog?.author_id) return;

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', blog.author_id);
      } else {
        await supabase
          .from('follows')
          .insert([{ follower_id: user.id, following_id: blog.author_id }]);

        // Create notification for followed user
        await supabase
          .from('notifications')
          .insert([{
            user_id: blog.author_id,
            actor_id: user.id,
            type: 'follow',
            message: 'started following you'
          }]);
      }
      
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleShare = () => {
    setShareMenuOpen(!shareMenuOpen);
  };

  const handleShareOption = async (platform: string) => {
    const url = window.location.href;
    const title = blog?.title || 'Check out this blog post';

    switch (platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          alert('Link copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy link: ', err);
        }
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      default:
        break;
    }

    setShareMenuOpen(false);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          content: newComment.trim(),
          blog_id: id,
          user_id: user.id
        }])
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setComments([data, ...comments]);
      setNewComment('');
      setBlog((prev: any) => ({ ...prev, comments_count: prev.comments_count + 1 }));

      // Create notification for blog author
      if (blog?.author_id !== user.id) {
        await supabase
          .from('notifications')
          .insert([{
            user_id: blog.author_id,
            actor_id: user.id,
            type: 'comment',
            message: 'commented on your blog post',
            blog_id: id
          }]);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editCommentText.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editCommentText.trim(), updated_at: new Date().toISOString() })
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: editCommentText.trim() }
          : comment
      ));
      setEditingComment(null);
      setEditCommentText('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.filter(comment => comment.id !== commentId));
      setBlog((prev: any) => ({ ...prev, comments_count: prev.comments_count - 1 }));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const readingTime = Math.ceil((blog?.content ? JSON.stringify(blog.content).length : blog?.excerpt?.length || 0) / 1000);

  // Enhanced rich text rendering function
  const renderBlogContent = () => {
    if (!blog) return null;

    // Handle TipTap JSON content
    if (blog.content && typeof blog.content === 'object') {
      if (blog.content.type === 'doc' && blog.content.content) {
        return renderTipTapContent(blog.content);
      }
    }

    // Fallback to excerpt or empty message
    return (
      <div className="prose prose-lg max-w-none">
        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
          {blog.excerpt || 'No content available.'}
        </div>
      </div>
    );
  };

  // Helper function to render TipTap/ProseMirror JSON content
  const renderTipTapContent = (docNode: any) => {
    if (!docNode || !docNode.content) {
      return <div>No content</div>;
    }

    const renderNode = (node: any, index: number): React.ReactNode => {
      if (!node) return null;

      // Get node marks
      const marks = node.marks || [];
      const hasStrong = marks.some((mark: any) => mark.type === 'bold');
      const hasEm = marks.some((mark: any) => mark.type === 'italic');
      const hasStrike = marks.some((mark: any) => mark.type === 'strike');
      const hasCode = marks.some((mark: any) => mark.type === 'code');
      const hasLink = marks.some((mark: any) => mark.type === 'link');
      const hasHighlight = marks.some((mark: any) => mark.type === 'highlight');
      const linkMark = marks.find((mark: any) => mark.type === 'link');
      const colorMark = marks.find((mark: any) => mark.type === 'textStyle');
      const fontMark = marks.find((mark: any) => mark.type === 'textStyle');
      
      // Get alignment from attrs
      let textAlign = node.attrs?.textAlign || 'left';
      
      // Text nodes
      if (node.text) {
        let result: React.ReactNode = node.text;
        
        // Apply marks from innermost to outermost
        if (hasCode) {
          result = <code className="bg-gray-100 px-2 py-1 rounded text-primary-600 font-mono text-sm">{result}</code>;
        }
        if (hasHighlight) {
          result = <mark className="bg-yellow-200 px-1 rounded">{result}</mark>;
        }
        if (hasStrike) {
          result = <s>{result}</s>;
        }
        if (hasEm) {
          result = <em>{result}</em>;
        }
        if (hasStrong) {
          result = <strong>{result}</strong>;
        }
        if (hasLink && linkMark?.attrs?.href) {
          result = <a href={linkMark.attrs.href} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">{result}</a>;
        }
        
        // Apply color and font family
        const style: any = {};
        if (colorMark?.attrs?.color) style.color = colorMark.attrs.color;
        if (fontMark?.attrs?.fontFamily) style.fontFamily = fontMark.attrs.fontFamily;
        
        if (Object.keys(style).length > 0) {
          result = <span style={style}>{result}</span>;
        }
        
        return result;
      }

      // Paragraph
      if (node.type === 'paragraph') {
        return (
          <p key={index} className={`text-gray-700 leading-relaxed mb-4 text-${textAlign}`}>
            {node.content ? node.content.map(renderNode) : null}
          </p>
        );
      }

      // Headings
      if (node.type === 'heading') {
        const level = node.attrs?.level || 1;
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        const headingClasses = {
          1: 'text-4xl font-bold text-gray-900 mb-6 font-serif leading-tight',
          2: 'text-3xl font-semibold text-gray-800 mb-5 font-serif leading-tight',
          3: 'text-2xl font-medium text-gray-700 mb-4 font-serif leading-tight'
        };
        return (
          <HeadingTag key={index} className={`${headingClasses[level as keyof typeof headingClasses]} text-${textAlign}`}>
            {node.content ? node.content.map(renderNode) : null}
          </HeadingTag>
        );
      }

      // Blockquote
      if (node.type === 'blockquote') {
        return (
          <blockquote key={index} className="border-l-4 border-primary-400 pl-6 py-3 my-6 bg-primary-50 rounded-r-xl italic text-gray-600">
            {node.content ? node.content.map(renderNode) : null}
          </blockquote>
        );
      }

      // Code Block
      if (node.type === 'codeBlock') {
        return (
          <pre key={index} className="bg-gray-900 rounded-xl p-6 my-6 overflow-x-auto">
            <code className="text-gray-100 font-mono">
              {node.content ? node.content.map(renderNode) : null}
            </code>
          </pre>
        );
      }

      // Lists
      if (node.type === 'bulletList') {
        return (
          <ul key={index} className="list-disc ml-6 mb-4">
            {node.content ? node.content.map(renderNode) : null}
          </ul>
        );
      }

      if (node.type === 'orderedList') {
        return (
          <ol key={index} className="list-decimal ml-6 mb-4">
            {node.content ? node.content.map(renderNode) : null}
          </ol>
        );
      }

      if (node.type === 'listItem') {
        return (
          <li key={index} className="mb-2 text-gray-700 leading-relaxed">
            {node.content ? node.content.map(renderNode) : null}
          </li>
        );
      }

      // Horizontal Rule
      if (node.type === 'horizontalRule') {
        return <hr key={index} className="my-6 border-t border-gray-200" />;
      }

      // Image
      if (node.type === 'image') {
        return (
          <figure key={index} className={`my-6 ${textAlign === 'center' ? 'mx-auto' : ''}`}>
            <img 
              src={node.attrs?.src} 
              alt={node.attrs?.alt || ''} 
              className="rounded-xl max-w-full shadow-md" 
              style={{ 
                maxHeight: '600px', 
                width: node.attrs?.width ? `${node.attrs.width}px` : 'auto',
                margin: textAlign === 'center' ? '0 auto' : ''
              }}
            />
            {node.attrs?.title && (
              <figcaption className="text-center text-gray-500 mt-2 text-sm">
                {node.attrs.title}
              </figcaption>
            )}
          </figure>
        );
      }

      // Handle doc node (root)
      if (node.type === 'doc') {
        return (
          <React.Fragment key={index}>
            {node.content ? node.content.map(renderNode) : null}
          </React.Fragment>
        );
      }

      // Fallback for unhandled node types
      return (
        <div key={index} className="text-gray-700">
          {node.content ? node.content.map(renderNode) : null}
        </div>
      );
    };

    return (
      <div className="prose prose-lg max-w-none">
        {docNode.content.map(renderNode)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8 shimmer" />
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-6 shimmer" />
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gray-200 rounded-xl shimmer" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2 shimmer" />
                <div className="h-3 bg-gray-200 rounded w-24 shimmer" />
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded shimmer" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen pt-8 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h1>
          <Link to="/" className="btn-primary">
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

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

        {/* Blog Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Tags */}
          {blog.tags && Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag: string, index: number) => (
                <Link 
                  key={index} 
                  to={`/tags/${tag}`}
                  className="inline-flex items-center space-x-1 bg-primary-100 text-primary-800 px-3 py-1 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors"
                >
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Author Info */}
          <div className="flex items-center justify-between mb-8 p-6 bg-gray-50 rounded-2xl">
            <div className="flex items-center space-x-4">
              <Link to={`/profile/${blog.profiles.username}`} className="relative">
                {blog.profiles.avatar_url ? (
                  <img 
                    src={blog.profiles.avatar_url} 
                    alt={blog.profiles.full_name}
                    className="w-16 h-16 rounded-xl object-cover hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
                    <span className="text-white font-semibold text-xl">
                      {blog.profiles.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success-500 rounded-full border-2 border-white"></div>
              </Link>
              
              <div>
                <Link to={`/profile/${blog.profiles.username}`}>
                  <h3 className="font-semibold text-gray-900 text-lg hover:text-primary-600 transition-colors">{blog.profiles.full_name}</h3>
                </Link>
                <Link to={`/profile/${blog.profiles.username}`}>
                  <p className="text-gray-600 hover:text-primary-600 transition-colors">@{blog.profiles.username}</p>
                </Link>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(blog.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{readingTime} min read</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{blog.views_count} views</span>
                  </div>
                </div>
              </div>
            </div>

            {user?.id !== blog.author_id && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFollow}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
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
          </div>

          {/* Blog Content */}
          <div className="mb-8">
            {renderBlogContent()}
          </div>

          {/* Engagement Actions */}
          <div className="flex items-center justify-between py-6 border-t border-gray-200">
            <div className="flex items-center space-x-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  isLiked 
                    ? 'text-error-500 hover:text-error-600' 
                    : 'text-gray-500 hover:text-error-500'
                }`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium">{blog.likes_count}</span>
              </motion.button>

              <div className="flex items-center space-x-2 text-gray-500">
                <MessageCircle className="w-6 h-6" />
                <span className="font-medium">{blog.comments_count}</span>
              </div>

              <div className="flex items-center space-x-2 text-gray-500">
                <Eye className="w-6 h-6" />
                <span className="font-medium">{blog.views_count}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleBookmark}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  isBookmarked
                    ? 'text-warning-600 bg-warning-100 hover:bg-warning-200'
                    : 'text-gray-500 hover:text-warning-600 hover:bg-gray-100'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </motion.button>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShare}
                  className="p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
                
                {/* Share menu */}
                <AnimatePresence>
                  {shareMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-10 border border-gray-100"
                    >
                      <button
                        onClick={() => handleShareOption('copy')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                      >
                        <span>Copy link</span>
                      </button>
                      <button
                        onClick={() => handleShareOption('twitter')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                      >
                        <span>Share to Twitter</span>
                      </button>
                      <button
                        onClick={() => handleShareOption('facebook')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                      >
                        <span>Share to Facebook</span>
                      </button>
                      <button
                        onClick={() => handleShareOption('linkedin')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                      >
                        <span>Share to LinkedIn</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.article>

        {/* Comments Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          id="comments"
          className="border-t border-gray-200 pt-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          {user && (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="flex space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="input-field w-full resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={!newComment.trim() || submittingComment}
                      className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            <AnimatePresence>
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex space-x-4 p-6 bg-gray-50 rounded-2xl"
                >
                  <div className="flex-shrink-0">
                    <Link to={`/profile/${comment.profiles.username}`}>
                      {comment.profiles.avatar_url ? (
                        <img 
                          src={comment.profiles.avatar_url} 
                          alt={comment.profiles.full_name}
                          className="w-10 h-10 rounded-xl object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
                          <span className="text-white font-semibold">
                            {comment.profiles.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </Link>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Link to={`/profile/${comment.profiles.username}`}>
                          <h4 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">{comment.profiles.full_name}</h4>
                        </Link>
                        <Link to={`/profile/${comment.profiles.username}`}>
                          <span className="text-gray-500 hover:text-primary-600 transition-colors">@{comment.profiles.username}</span>
                        </Link>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 text-sm">{formatDate(comment.created_at)}</span>
                      </div>
                      
                      {user?.id === comment.user_id && (
                        <div className="relative">
                          <button
                            onClick={() => {
                              if (editingComment === comment.id) {
                                setEditingComment(null);
                                setEditCommentText('');
                              } else {
                                setEditingComment(comment.id);
                                setEditCommentText(comment.content);
                              }
                            }}
                            className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          
                          {editingComment === comment.id && (
                            <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                onClick={() => {
                                  setEditingComment(comment.id);
                                  setEditCommentText(comment.content);
                                }}
                                className="w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {editingComment === comment.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                          rows={3}
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditComment(comment.id)}
                            className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingComment(null);
                              setEditCommentText('');
                            }}
                            className="px-3 py-1 text-gray-600 rounded text-sm hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {comments.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No comments yet</h3>
                <p className="text-gray-600">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default BlogPost;