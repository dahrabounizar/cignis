import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  changeText?: string;
  icon: LucideIcon;
  borderColor: string;
  iconColor: string;
  bgColor: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  changeText, 
  icon: Icon, 
  borderColor,
  iconColor,
  bgColor
}: MetricCardProps) => {
  return (
    <Card variant="glass" className={`p-6 border-l-4 ${borderColor} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className={`p-2 rounded-lg ${bgColor} mr-3`}>
              <Icon size={20} className={iconColor} />
            </div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {value}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {subtitle}
            </div>
            {changeText && (
              <div className="text-sm text-green-600 flex items-center">
                <span className="mr-1">↗</span>
                {changeText}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Card>
  );
};