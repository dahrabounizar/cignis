import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'modern';
  hover?: boolean;
  onClick?: () => void;
}

export const Card = ({ 
  children, 
  className = '', 
  variant = 'default', 
  hover = false,
  onClick
}: CardProps) => {
  const baseClasses = "rounded-2xl overflow-hidden transition-all duration-300";
  
  const variantClasses = {
    default: "bg-white border border-gray-200 text-gray-900",
    glass: "bg-white/80 backdrop-blur-xl border border-white/20 text-gray-900",
    elevated: "bg-white shadow-xl border border-gray-200 text-gray-900",
    gradient: "bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 border-2 border-white/60 backdrop-blur-xl text-gray-900 shadow-lg shadow-blue-100/20",
    modern: "bg-gradient-to-br from-white/95 via-gray-50/40 to-slate-50/30 border-2 border-white/70 backdrop-blur-xl text-gray-900 shadow-xl shadow-gray-200/30"
  };

  return (
    <motion.div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        hover && "hover:shadow-2xl hover:scale-[1.02]",
        onClick && "cursor-pointer",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {children}
    </motion.div>
  );
};