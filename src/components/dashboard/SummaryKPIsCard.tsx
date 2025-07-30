import { motion } from 'framer-motion';
import { Users, FileText, Heart, UserPlus, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
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
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      textColor: 'text-blue-700',
      change: '+12%',
      isPositive: true
    },
    {
      label: 'Posts (30 days)',
      value: kpis.postsLast30Days,
      icon: FileText,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
      textColor: 'text-green-700',
      change: '+8%',
      isPositive: true
    },
    {
      label: 'Engagement Rate',
      value: kpis.engagementRate,
      icon: Heart,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
      textColor: 'text-purple-700',
      change: '+15%',
      isPositive: true
    },
    {
      label: 'New Connections',
      value: kpis.connectionsLast30Days,
      icon: UserPlus,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      iconBg: 'bg-gradient-to-br from-orange-500 to-red-600',
      textColor: 'text-orange-700',
      change: '+5%',
      isPositive: true
    }
  ];

  return (
    <Card variant="glass" className="p-8 bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Summary KPIs
        </h3>
        <div className="flex items-center space-x-2 text-green-600">
          <TrendingUp size={20} />
          <span className="text-sm font-medium">Trending Up</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {kpiItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`relative p-6 rounded-2xl bg-gradient-to-br ${item.bgGradient} border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full -mr-10 -mt-10" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
                  <item.icon size={24} className="text-white" />
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-white/50 ${item.textColor}`}>
                  {item.isPositive ? (
                    <ArrowUp size={12} className="text-green-600" />
                  ) : (
                    <ArrowDown size={12} className="text-red-600" />
                  )}
                  <span className={`text-xs font-medium ${item.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">
                  {item.value}
                </div>
                <div className={`text-sm font-medium ${item.textColor}`}>
                  {item.label}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl border border-white/30"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Overall performance this month</span>
          <div className="flex items-center space-x-2 text-green-600 font-medium">
            <TrendingUp size={16} />
            <span>+10% improvement</span>
          </div>
        </div>
      </motion.div>
    </Card>
  );
};