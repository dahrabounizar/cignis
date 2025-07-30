import { motion } from 'framer-motion';
import { Users, FileText, Heart, UserPlus } from 'lucide-react';
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
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      label: 'Posts (30 days)',
      value: kpis.postsLast30Days,
      icon: FileText,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      label: 'Engagement Rate',
      value: kpis.engagementRate,
      icon: Heart,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      label: 'New Connections',
      value: kpis.connectionsLast30Days,
      icon: UserPlus,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <Card variant="glass" className="p-6 bg-gradient-to-br from-white to-blue-50 border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Summary KPIs</h3>
        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {kpiItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                <item.icon size={20} className={item.textColor} />
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${item.bgColor} ${item.textColor} font-medium`}>
                Live
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {item.value}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {item.label}
            </div>
            <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((typeof item.value === 'string' ? parseInt(item.value.replace(/[^0-9]/g, '')) : item.value) / 100 * 100, 100)}%` }}
                transition={{ delay: index * 0.2 + 0.5, duration: 1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};