import { motion } from 'framer-motion';
import { Users, FileText, Heart, UserPlus, Info } from 'lucide-react';
import { Card } from '../ui/Card';
import { SummaryKPIs } from '../../hooks/useDashboardData';
import { useAppStore } from '../../stores/appStore';

interface SummaryKPIsCardProps {
  kpis: SummaryKPIs;
}

export const SummaryKPIsCard = ({ kpis }: SummaryKPIsCardProps) => {
  const { setCurrentModule } = useAppStore();

  const kpiItems = [
    {
      label: 'Total Connections',
      value: kpis.totalConnections.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      explanation: 'Total number of LinkedIn connections in your network. A larger network increases your content reach and professional opportunities.'
    },
    {
      label: 'Posts (30 days)',
      value: kpis.postsLast30Days,
      icon: FileText,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      borderColor: 'border-green-200',
      explanation: 'Number of posts you\'ve published in the last 30 days. Consistent posting helps maintain visibility and engagement with your network.'
    },
    {
      label: 'Engagement Rate',
      value: kpis.engagementRate,
      icon: Heart,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      explanation: 'Average engagement (likes + comments) per post as a percentage. Higher engagement rates indicate more compelling content that resonates with your audience.'
    },
    {
      label: 'New Connections',
      value: kpis.connectionsLast30Days,
      icon: UserPlus,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      explanation: 'New connections added in the last 30 days. Growing your network consistently helps expand your professional reach and opportunities.'
    }
  ];

  return (
    <Card 
      variant="glass" 
      className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={() => setCurrentModule('analytics')}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Summary KPIs</h3>
        <div className="text-sm text-gray-500">Click for detailed analytics</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kpiItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative"
          >
            <div className={`flex items-center justify-between p-4 rounded-lg border-2 hover:shadow-md transition-all ${item.bgColor} ${item.borderColor} hover:scale-105`}>
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm`}>
                  <item.icon size={24} className={item.textColor} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {item.value}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {item.label}
                  </div>
                </div>
              </div>
              <div className="relative">
                <Info size={14} className="text-gray-400 cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none shadow-lg">
                  {item.explanation}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Click to view detailed analytics</strong> and get insights on how to improve these metrics.
        </p>
      </div>
    </Card>
  );
};