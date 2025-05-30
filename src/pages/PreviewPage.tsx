import React, { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Globe, Link as LinkIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useBlogStore } from '../store/blogStore';
import BlogPreview from '../components/blog/BlogPreview';
import Button from '../components/ui/Button';

const PreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { currentBlog, fetchBlog, updateBlogDetails, isLoading } = useBlogStore();
  
  useEffect(() => {
    if (id) {
      fetchBlog(id);
    }
  }, [id, fetchBlog]);
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!id) {
    return <Navigate to="/dashboard" />;
  }
  
  const togglePublishStatus = async () => {
    if (!currentBlog) return;
    
    await updateBlogDetails(currentBlog.id, {
      isPublished: !currentBlog.isPublished
    });
  };
  
  const copyLink = (type: 'public' | 'random') => {
    if (!currentBlog || !user) return;
    
    const baseUrl = `https://${user.subdomain}.crafta.blog`;
    const url = type === 'public' 
      ? `${baseUrl}/${currentBlog.slug}`
      : `${baseUrl}/view/${currentBlog.randomUrl}`;
    
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Could not copy link: ', err);
      });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
                  Back
                </Button>
              </Link>
              
              <h1 className="text-lg font-medium text-gray-800">
                {isLoading ? 'Loading...' : currentBlog?.title || 'Preview'}
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center mr-2">
                <span className="text-sm mr-2">Status:</span>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${currentBlog?.isPublished ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-700'}`}>
                  {currentBlog?.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                icon={<LinkIcon size={16} />}
                onClick={() => copyLink('random')}
              >
                Copy Preview Link
              </Button>
              
              {currentBlog?.isPublished && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Globe size={16} />}
                  onClick={() => copyLink('public')}
                >
                  Copy Public Link
                </Button>
              )}
              
              <Button
                variant={currentBlog?.isPublished ? 'outline' : 'primary'}
                size="sm"
                onClick={togglePublishStatus}
              >
                {currentBlog?.isPublished ? 'Unpublish' : 'Publish'}
              </Button>
              
              {id && (
                <Link to={`/editor/${id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Edit size={16} />}
                  >
                    Edit
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Preview content */}
      <div className="max-w-5xl mx-auto bg-white shadow-sm rounded-lg my-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : currentBlog ? (
          <BlogPreview blog={currentBlog} />
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">Blog not found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPage;