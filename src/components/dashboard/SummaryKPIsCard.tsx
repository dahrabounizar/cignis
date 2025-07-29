import { motion } from 'framer-motion';
import { Users, FileText, Heart, UserPlus, BarChart3 } from 'lucide-react';
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
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-700',
      description: 'Your network size'
    },
    {
      label: 'Posts (30 days)',
      value: kpis.postsLast30Days,
      icon: FileText,
      gradient: 'from-emerald-500 via-green-600 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      iconBg: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-700',
      description: 'Recent activity'
    },
    {
      label: 'Engagement Rate',
      value: kpis.engagementRate,
      icon: Heart,
      gradient: 'from-purple-500 via-violet-600 to-purple-600',
      bgGradient: 'from-purple-50 to-violet-50',
      iconBg: 'from-purple-500 to-violet-600',
      textColor: 'text-purple-700',
      description: 'Audience interaction'
    },
    {
      label: 'New Connections',
      value: kpis.connectionsLast30Days,
      icon: UserPlus,
      gradient: 'from-orange-500 via-amber-600 to-yellow-600',
      bgGradient: 'from-orange-50 to-yellow-50',
      iconBg: 'from-orange-500 to-yellow-600',
      textColor: 'text-orange-700',
      description: 'Monthly growth'
    }
  ];

  return (
    <Card variant="premium" className="p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-2xl transform -translate-x-12 -translate-y-12"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl transform translate-x-16 translate-y-16"></div>
      
      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
            <BarChart3 size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Summary KPIs</h3>
            <p className="text-gray-600 text-sm">Key performance indicators</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
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
                y: -5,
                transition: { duration: 0.2 }
              }}
              className="group relative"
            >
              <div className={`p-6 rounded-2xl bg-gradient-to-br ${item.bgGradient} border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm`}>
                {/* Icon with gradient background */}
                <div className={`w-14 h-14 bg-gradient-to-br ${item.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <item.icon size={24} className="text-white" />
                </div>
                
                {/* Value */}
                <div className={`text-3xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent mb-2 text-center`}>
                  {item.value}
                </div>
                
                {/* Label */}
                <div className="text-center">
                  <div className={`text-sm font-semibold ${item.textColor} mb-1`}>
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {item.description}
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional info section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm rounded-2xl border border-gray-200/30"
        >
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-gray-600 font-medium">
              Data refreshed automatically every hour
            </p>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-1000"></div>
          </div>
        </motion.div>
      </div>
    </Card>
  );
};