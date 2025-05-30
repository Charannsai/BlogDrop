import React, { useState, useEffect } from 'react';
import { PlayCircle } from 'lucide-react';
import { BlockData } from '../../../types';

interface VideoBlockProps {
  block: BlockData;
  onUpdate: (id: string, data: Partial<BlockData>) => void;
}

const VideoBlock: React.FC<VideoBlockProps> = ({ block, onUpdate }) => {
  const [url, setUrl] = useState(block.url || '');
  const [isEditing, setIsEditing] = useState(!block.url);
  
  useEffect(() => {
    setUrl(block.url || '');
  }, [block.url]);
  
  const getEmbedUrl = (url: string): string | null => {
    // YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=)?([a-zA-Z0-9_-]{11})$/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[5]}`;
    }
    
    // Vimeo
    const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/([\d]+)$/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[4]}`;
    }
    
    return null;
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const embedUrl = getEmbedUrl(url);
    
    if (embedUrl) {
      onUpdate(block.id, { 
        url: embedUrl,
        content: url
      });
      setIsEditing(false);
    } else {
      // Show error or handle invalid URL
      alert('Please enter a valid YouTube or Vimeo URL');
    }
  };
  
  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={url}
          onChange={handleUrlChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary-300 focus:border-primary-300"
          placeholder="Paste YouTube or Vimeo URL"
        />
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-primary-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-primary-600 transition-colors"
          >
            Embed Video
          </button>
          {block.url && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    );
  }
  
  if (!block.url) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center">
        <PlayCircle size={40} className="text-gray-400 mb-3" />
        <p className="text-gray-600 mb-4">Embed a video from YouTube or Vimeo</p>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-600 transition-colors"
        >
          Add Video URL
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="relative pt-[56.25%] w-full">
        <iframe
          src={block.url}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <div className="mt-2 flex justify-end">
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-gray-500 hover:text-primary-500 transition-colors"
        >
          Change URL
        </button>
      </div>
    </div>
  );
};

export default VideoBlock;