import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useBlogStore } from '../store/blogStore';
import BlogCard from '../components/blog/BlogCard';
import Button from '../components/ui/Button';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { blogs, fetchUserBlogs, createNewBlog, removeBlog, isLoading } = useBlogStore();
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      fetchUserBlogs(user.id);
    }
  }, [user, fetchUserBlogs]);
  
  const handleCreateBlog = async () => {
    if (!user) return;
    
    try {
      setIsCreating(true);
      const blog = await createNewBlog(user.id);
      navigate(`/editor/${blog.id}`);
    } catch (error) {
      console.error('Error creating blog:', error);
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleDeleteBlog = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      await removeBlog(id);
    }
  };
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-jakarta text-gray-900">
          Welcome, {user.displayName}
        </h1>
        <p className="text-gray-600 mt-2">
          Your blog is available at{' '}
          <a 
            href={`https://${user.subdomain}.crafta.blog`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            {user.subdomain}.crafta.blog
          </a>
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Your Blogs</h2>
            <p className="text-gray-600">Create and manage your blog posts</p>
          </div>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={handleCreateBlog}
            isLoading={isCreating}
            className="mt-3 sm:mt-0"
          >
            Create New Blog
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                onDelete={handleDeleteBlog}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              You don't have any blogs yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first blog post to get started
            </p>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={handleCreateBlog}
              isLoading={isCreating}
            >
              Create Your First Blog
            </Button>
          </div>
        )}
      </div>
      
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Need help getting started?</h2>
        <p className="mb-4 opacity-90">
          Check out our guides and tutorials to help you make the most of your blog.
        </p>
        <Link to="/help">
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            icon={<ArrowRight size={16} />}
          >
            View Guides
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;