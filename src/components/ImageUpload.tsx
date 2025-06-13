import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, Check } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string | null) => void;
  type: 'avatar' | 'cover';
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  currentImage, 
  onImageChange, 
  type, 
  className = '' 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create a FileReader to convert to base64 or use a URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onImageChange(imageUrl);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemoveImage = () => {
    onImageChange(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (type === 'avatar') {
    return (
      <div className={`relative ${className}`}>
        <div className="relative group">
          {currentImage ? (
            <img 
              src={currentImage} 
              alt="Profile"
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-large"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-large">
              <Camera className="w-8 h-8 text-white" />
            </div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={triggerFileInput}
            disabled={isUploading}
            className="absolute bottom-0 right-0 p-2 bg-white rounded-lg shadow-medium border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </motion.button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    );
  }

  // Cover image upload
  return (
    <div className={`relative ${className}`}>
      <div 
        className={`h-32 rounded-2xl relative overflow-hidden transition-all duration-200 ${
          currentImage 
            ? 'bg-cover bg-center' 
            : 'bg-gradient-to-r from-primary-500 to-primary-600'
        } ${dragOver ? 'ring-4 ring-primary-300' : ''}`}
        style={currentImage ? { backgroundImage: `url(${currentImage})` } : {}}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
        
        {/* Upload overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={triggerFileInput}
            disabled={isUploading}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </motion.button>
        </div>

        {/* Remove button */}
        {currentImage && !isUploading && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRemoveImage}
            className="absolute top-4 right-4 p-2 bg-red-500/80 backdrop-blur-sm rounded-lg text-white hover:bg-red-600/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Drop zone indicator */}
      {dragOver && (
        <div className="absolute inset-0 border-2 border-dashed border-primary-400 rounded-2xl bg-primary-50/80 flex items-center justify-center">
          <div className="text-primary-600 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Drop image here</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;