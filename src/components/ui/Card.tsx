import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  bordered?: boolean;
}

const Card = ({ 
  children, 
  className = '', 
  onClick, 
  hover = false,
  bordered = false
}: CardProps) => {
  const baseStyles = 'bg-white rounded-xl shadow-sm overflow-hidden';
  const hoverStyles = hover ? 'transition-all duration-200 hover:shadow-md' : '';
  const borderStyles = bordered ? 'border border-gray-200' : '';
  const cursorStyles = onClick ? 'cursor-pointer' : '';
  
  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${borderStyles} ${cursorStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`px-5 py-4 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`px-5 py-4 bg-gray-50 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
};

export default Card;