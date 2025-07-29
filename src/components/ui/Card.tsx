import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'modern' | 'premium';
  hover?: boolean;
}

export const Card = ({ 
  children, 
  className = '', 
  variant = 'default', 
  hover = false 
}: CardProps) => {
  const baseClasses = "rounded-2xl overflow-hidden transition-all duration-300";
  
  const variantClasses = {
    default: "bg-white border border-gray-200 text-gray-900",
    glass: "bg-white/80 backdrop-blur-xl border border-white/20 text-gray-900 shadow-lg",
    elevated: "bg-white shadow-xl border border-gray-200 text-gray-900",
    gradient: "bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/30 backdrop-blur-xl border border-white/30 text-gray-900 shadow-xl",
    modern: "bg-white/90 backdrop-blur-2xl border border-gradient-to-r from-blue-200/30 to-purple-200/30 text-gray-900 shadow-2xl",
    premium: "bg-gradient-to-br from-white/95 via-indigo-50/80 to-purple-50/60 backdrop-blur-2xl border border-white/40 text-gray-900 shadow-2xl"
  };

  return (
    <motion.div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        hover && "hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { 
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        y: -4 
      } : undefined}
    >
      {children}
    </motion.div>
  );
};