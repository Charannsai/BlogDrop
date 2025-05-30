import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, Edit, Eye, Trash } from 'lucide-react';
import { Blog } from '../../types';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';

interface BlogCardProps {
  blog: Blog;
  onDelete: (id: string) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, onDelete }) => {
  // Format dates
  const formattedCreatedAt = new Date(blog.createdAt).toLocaleDateString();
  const formattedUpdatedAt = new Date(blog.updatedAt).toLocaleDateString();
  
  // Get cover image or placeholder
  const coverImage = blog.coverImage || 'https://images.pexels.com/photos/2505026/pexels-photo-2505026.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
  
  // Calculate reading time (rough estimate based on content length)
  const wordCount = blog.content.reduce((count, block) => {
    return count + (block.content?.split(/\s+/).length || 0);
  }, 0);
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  
  return (
    <Card hover bordered className="h-full flex flex-col">
      <div className="relative h-40 overflow-hidden">
        <img 
          src={coverImage} 
          alt={blog.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
          <div className="absolute bottom-3 left-3">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${blog.isPublished ? 'bg-success-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {blog.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      </div>
      
      <CardContent className="flex-1 flex flex-col">
        <h3 className="font-jakarta font-bold text-lg text-gray-800 mb-2">
          {blog.title}
        </h3>
        
        <div className="flex items-center text-xs text-gray-500 space-x-3 mb-4">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            <span>{formattedCreatedAt}</span>
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>{readingTime} min read</span>
          </div>
        </div>
        
        <div className="mt-auto pt-4 flex flex-wrap gap-2">
          <Link to={`/editor/${blog.id}`}>
            <Button 
              variant="outline" 
              size="sm" 
              icon={<Edit size={16} />}
            >
              Edit
            </Button>
          </Link>
          
          <Link to={`/preview/${blog.id}`}>
            <Button 
              variant="ghost" 
              size="sm" 
              icon={<Eye size={16} />}
            >
              Preview
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm" 
            icon={<Trash size={16} />}
            className="text-error-500 hover:bg-error-50 ml-auto"
            onClick={() => onDelete(blog.id)}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCard;