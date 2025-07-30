import { motion } from 'framer-motion';
import { Card } from './Card';

interface SkeletonLoaderProps {
  variant?: 'card' | 'text' | 'circle' | 'bar';
  width?: string;
  height?: string;
  className?: string;
}

export const SkeletonLoader = ({ 
  variant = 'card', 
  width = 'w-full', 
  height = 'h-4', 
  className = '' 
}: SkeletonLoaderProps) => {
  const baseClasses = "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse";
  
  const shimmer = {
    initial: { x: '-100%' },
    animate: { x: '100%' },
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear'
    }
  };

  if (variant === 'circle') {
    return (
      <div className={`${width} ${height} rounded-full ${baseClasses} ${className} relative overflow-hidden`}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          {...shimmer}
        />
      </div>
    );
  }

  if (variant === 'bar') {
    return (
      <div className={`${width} ${height} rounded-lg ${baseClasses} ${className} relative overflow-hidden`}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          {...shimmer}
        />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`${width} ${height} rounded ${baseClasses} ${className} relative overflow-hidden`}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          {...shimmer}
        />
      </div>
    );
  }

  // Default card variant
  return (
    <Card variant="glass" className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <SkeletonLoader variant="circle" width="w-12" height="h-12" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader variant="text" width="w-3/4" height="h-4" />
            <SkeletonLoader variant="text" width="w-1/2" height="h-3" />
          </div>
        </div>
        <div className="space-y-3">
          <SkeletonLoader variant="bar" width="w-full" height="h-2" />
          <SkeletonLoader variant="text" width="w-5/6" height="h-3" />
          <SkeletonLoader variant="text" width="w-4/6" height="h-3" />
        </div>
      </div>
    </Card>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonLoader variant="text" width="w-48" height="h-8" />
            <SkeletonLoader variant="text" width="w-64" height="h-5" />
          </div>
          <div className="flex space-x-3">
            <SkeletonLoader variant="bar" width="w-24" height="h-8" />
            <SkeletonLoader variant="bar" width="w-20" height="h-8" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card variant="glass" className="p-6 bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <SkeletonLoader variant="text" width="w-24" height="h-4" />
                    <SkeletonLoader variant="text" width="w-16" height="h-8" className="mt-2" />
                  </div>
                  <SkeletonLoader variant="circle" width="w-12" height="h-12" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Profile Evaluation Skeleton */}
        <Card variant="glass" className="p-8 bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <SkeletonLoader variant="circle" width="w-16" height="h-16" />
              <div>
                <SkeletonLoader variant="text" width="w-48" height="h-6" />
                <SkeletonLoader variant="text" width="w-64" height="h-4" className="mt-2" />
              </div>
            </div>
            <div className="text-center">
              <SkeletonLoader variant="circle" width="w-20" height="h-20" />
              <SkeletonLoader variant="text" width="w-16" height="h-6" className="mt-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <SkeletonLoader variant="text" width="w-8" height="h-8" />
                    <div>
                      <SkeletonLoader variant="text" width="w-32" height="h-4" />
                      <SkeletonLoader variant="text" width="w-20" height="h-3" className="mt-1" />
                    </div>
                  </div>
                  <SkeletonLoader variant="text" width="w-12" height="h-6" />
                </div>
                <SkeletonLoader variant="bar" width="w-full" height="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* KPIs and Trends Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkeletonLoader />
          <SkeletonLoader />
        </div>

        {/* Quick Actions Skeleton */}
        <Card variant="glass" className="p-8 bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <SkeletonLoader variant="text" width="w-40" height="h-6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 rounded-2xl bg-gray-100">
                <SkeletonLoader variant="text" width="w-8" height="h-8" />
                <SkeletonLoader variant="text" width="w-32" height="h-5" className="mt-2" />
                <SkeletonLoader variant="text" width="w-48" height="h-4" className="mt-1" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};