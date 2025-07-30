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
      value: (kpis?.totalConnections || 0).toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      label: 'Posts (30 days)',
      value: kpis?.postsLast30Days || 0,
      icon: FileText,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      label: 'Engagement Rate',
      value: kpis?.engagementRate || '0%',
      icon: Heart,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      label: 'New Connections',
      value: kpis?.connectionsLast30Days || 0,
      icon: UserPlus,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <Card variant="glass" className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Summary KPIs</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
              <item.icon size={24} className={item.textColor} />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {item.value}
            </div>
            <div className="text-sm text-gray-600">
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};