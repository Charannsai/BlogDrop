import React, { useState, useEffect } from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import { BlockData } from '../../../types';
import { uploadImage } from '../../../lib/supabase';
import Button from '../../ui/Button';

interface ImageBlockProps {
  block: BlockData;
  onUpdate: (id: string, data: Partial<BlockData>) => void;
}

const ImageBlock: React.FC<ImageBlockProps> = ({ block, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [altText, setAltText] = useState(block.alt || '');
  const [showAltEdit, setShowAltEdit] = useState(false);
  
  useEffect(() => {
    setAltText(block.alt || '');
  }, [block.alt]);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      const path = `images/${Date.now()}-${file.name}`;
      const url = await uploadImage(file, path);
      
      onUpdate(block.id, { 
        url, 
        content: file.name,
        alt: file.name
      });
      
      setAltText(file.name);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleAltTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAltText(e.target.value);
  };
  
  const saveAltText = () => {
    onUpdate(block.id, { alt: altText });
    setShowAltEdit(false);
  };
  
  if (!block.url) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center">
        <ImageIcon size={40} className="text-gray-400 mb-3" />
        <p className="text-gray-600 mb-4">Upload an image</p>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button
            variant="primary"
            size="sm"
            icon={<Upload size={16} />}
            isLoading={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </label>
      </div>
    );
  }
  
  return (
    <div>
      <div className="relative">
        <img
          src={block.url}
          alt={block.alt || 'Blog image'}
          className="w-full rounded-lg"
        />
        
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <Button
              variant="primary"
              size="sm"
              className="bg-white/80 backdrop-blur-sm text-primary-600 border border-primary-300"
              isLoading={isUploading}
            >
              Replace
            </Button>
          </label>
        </div>
      </div>
      
      {showAltEdit ? (
        <div className="mt-2 flex">
          <input
            type="text"
            value={altText}
            onChange={handleAltTextChange}
            className="flex-1 border border-gray-300 rounded-l-lg px-3 py-1 text-sm focus:ring-1 focus:ring-primary-300 focus:border-primary-300"
            placeholder="Alt text for accessibility"
          />
          <button
            onClick={saveAltText}
            className="bg-primary-500 text-white px-3 py-1 rounded-r-lg text-sm hover:bg-primary-600 transition-colors"
          >
            Save
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAltEdit(true)}
          className="text-xs text-gray-500 mt-1 hover:text-primary-500 transition-colors"
        >
          {block.alt ? `Alt: ${block.alt}` : 'Add alt text'}
        </button>
      )}
    </div>
  );
};

export default ImageBlock;