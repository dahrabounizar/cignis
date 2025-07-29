import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

interface ProfileProgressProps {
  percentage: number;
  title?: string;
  subtitle?: string;
}

export const ProfileProgress = ({ 
  percentage, 
  title = "Profile Progress",
  subtitle = "Room for improvement"
}: ProfileProgressProps) => {
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card variant="glass" className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">{title}</h3>
      
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-2xl font-bold text-gray-900">
                {percentage}%
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 text-center">
          {subtitle}
        </div>
      </div>
    </Card>
  );
};