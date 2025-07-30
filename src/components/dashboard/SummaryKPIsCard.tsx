import { motion } from 'framer-motion';
import { Users, FileText, Heart, UserPlus, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { SummaryKPIs } from '../../hooks/useDashboardData';

interface SummaryKPIsCardProps {
  kpis: SummaryKPIs;
}

export const SummaryKPIsCard = ({ kpis }: SummaryKPIsCardProps) => {
  const kpiItems = [
    {
      label: 'Total Connections',
      value: kpis.totalConnections.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      label: 'Posts (30 days)',
      value: kpis.postsLast30Days.toString(),
      icon: FileText,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      textColor: 'text-green-600',
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      label: 'Engagement Rate',
      value: kpis.engagementRate,
      icon: Heart,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      textColor: 'text-purple-600',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      label: 'New Connections',
      value: kpis.connectionsLast30Days.toString(),
      icon: UserPlus,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      textColor: 'text-orange-600',
      iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ];

  return (
    <Card variant="glass" className="p-6 bg-gradient-to-br from-white to-gray-50 border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="mr-3 text-indigo-600" size={24} />
          Summary KPIs
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {kpiItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: index * 0.1,
              duration: 0.5,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.05, 
              y: -4,
              transition: { duration: 0.2 }
            }}
            className={`${item.bgColor} rounded-xl p-4 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
                <item.icon size={20} className="text-white" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full"
              />
            </div>
            
            <div className="space-y-1">
              <motion.div 
                className="text-2xl font-bold text-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                {item.value}
              </motion.div>
              <div className="text-sm font-medium text-gray-600">
                {item.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 pt-4 border-t border-gray-200"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Last 30 days activity</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-600 font-medium">Active</span>
          </div>
        </div>
      </motion.div>
    </Card>
  );
};