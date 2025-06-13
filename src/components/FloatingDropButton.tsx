import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingDropButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate('/editor')}
      className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-large hover:shadow-glow flex items-center justify-center z-50 transition-all duration-300 group"
    >
      <motion.div
        initial={{ rotate: 0 }}
        whileHover={{ rotate: 90 }}
        transition={{ duration: 0.2 }}
      >
        <Plus className="w-7 h-7 text-white" />
      </motion.div>
      
      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="absolute right-full mr-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap pointer-events-none"
      >
        Write a new blog
        <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
      </motion.div>
    </motion.button>
  );
};

export default FloatingDropButton;