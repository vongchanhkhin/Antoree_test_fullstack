import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  padding = 'md',
  onClick,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      transition={{ duration: 0.2 }}
      className={`
        card
        ${paddingClasses[padding]}
        ${onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </Component>
  );
};

export default Card;
