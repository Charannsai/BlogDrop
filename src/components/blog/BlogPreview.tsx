import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Blog, BlockData } from '../../types';

interface BlogPreviewProps {
  blog: Blog;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ blog }) => {
  const renderBlock = (block: BlockData) => {
    switch (block.type) {
      case 'text':
        return (
          <div className="prose prose-lg max-w-none mb-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {block.content}
            </ReactMarkdown>
          </div>
        );
      
      case 'heading':
        switch (block.level) {
          case 1:
            return <h1 className="text-4xl font-bold font-jakarta mb-6">{block.content}</h1>;
          case 2:
            return <h2 className="text-3xl font-bold font-jakarta mb-5">{block.content}</h2>;
          case 3:
            return <h3 className="text-2xl font-bold font-jakarta mb-4">{block.content}</h3>;
          default:
            return <h2 className="text-3xl font-bold font-jakarta mb-5">{block.content}</h2>;
        }
      
      case 'image':
        return (
          <figure className="mb-8">
            <img 
              src={block.url}
              alt={block.alt || 'Blog image'} 
              className="w-full rounded-xl"
            />
            {block.alt && (
              <figcaption className="text-sm text-gray-500 mt-2 text-center">
                {block.alt}
              </figcaption>
            )}
          </figure>
        );
      
      case 'video':
        return (
          <div className="mb-8">
            <div className="relative pt-[56.25%] w-full">
              <iframe
                src={block.url}
                className="absolute top-0 left-0 w-full h-full rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        );
      
      case 'button':
        return (
          <div className="mb-8 flex justify-center">
            <a
              href={block.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              {block.linkText}
            </a>
          </div>
        );
      
      case 'code':
        return (
          <div className="mb-8">
            <div className="bg-gray-800 rounded-t-lg px-4 py-2 text-xs text-gray-400">
              {block.language?.charAt(0).toUpperCase() + block.language?.slice(1) || 'Code'}
            </div>
            <pre className="bg-gray-900 rounded-b-lg p-4 overflow-x-auto text-gray-200 font-mono text-sm whitespace-pre">
              <code>{block.content}</code>
            </pre>
          </div>
        );
      
      case 'quote':
        return (
          <blockquote className="pl-6 border-l-4 border-primary-500 italic text-gray-700 text-xl mb-8">
            {block.content}
          </blockquote>
        );
      
      case 'divider':
        return <hr className="border-t border-gray-200 my-8" />;
      
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {blog.coverImage && (
        <div className="mb-8">
          <img 
            src={blog.coverImage} 
            alt={blog.title} 
            className="w-full h-64 object-cover rounded-xl"
          />
        </div>
      )}
      
      <h1 className="text-4xl sm:text-5xl font-bold font-jakarta text-gray-900 mb-4">
        {blog.title}
      </h1>
      
      <div className="flex items-center text-gray-500 mb-8">
        <span>Published {new Date(blog.createdAt).toLocaleDateString()}</span>
      </div>
      
      <div className="blog-content">
        {blog.content.map((block) => (
          <div key={block.id}>
            {renderBlock(block)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPreview;