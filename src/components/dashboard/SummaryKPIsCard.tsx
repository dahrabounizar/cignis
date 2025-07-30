import { motion } from 'framer-motion';
import { Users, FileText, Heart, UserPlus, TrendingUp, Info } from 'lucide-react';
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
      shadowColor: 'shadow-blue-200',
      textColor: 'text-blue-700',
      description: 'Your total LinkedIn network size. Industry average is 500-1000 connections.',
      trend: kpis.totalConnections > 500 ? 'positive' : 'neutral'
    },
    {
      label: 'Posts (30 days)',
      value: kpis.postsLast30Days,
      icon: FileText,
      gradient: 'from-emerald-500 via-green-600 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      shadowColor: 'shadow-emerald-200',
      textColor: 'text-emerald-700',
      description: 'Content published in the last 30 days. Recommended: 8-12 posts per month for optimal engagement.',
      trend: kpis.postsLast30Days >= 8 ? 'positive' : kpis.postsLast30Days >= 4 ? 'neutral' : 'negative'
    },
    {
      label: 'Engagement Rate',
      value: kpis.engagementRate,
      icon: Heart,
      gradient: 'from-purple-500 via-violet-600 to-purple-600',
      bgGradient: 'from-purple-50 to-violet-50',
      shadowColor: 'shadow-purple-200',
      textColor: 'text-purple-700',
      description: 'Average engagement per post. Good engagement rate is 2-5% for LinkedIn content.',
      trend: parseFloat(kpis.engagementRate.replace('%', '')) >= 2 ? 'positive' : 'neutral'
    },
    {
      label: 'New Connections',
      value: kpis.connectionsLast30Days,
      icon: UserPlus,
      gradient: 'from-orange-500 via-amber-600 to-yellow-600',
      bgGradient: 'from-orange-50 to-amber-50',
      shadowColor: 'shadow-orange-200',
      textColor: 'text-orange-700',
      description: 'New connections gained in the last 30 days. Active networking typically adds 20-50 connections monthly.',
      trend: kpis.connectionsLast30Days >= 20 ? 'positive' : kpis.connectionsLast30Days >= 10 ? 'neutral' : 'negative'
    }
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'positive') return <TrendingUp size={12} className="text-green-600" />;
    return null;
  };

  return (
    <Card 
      variant="glass" 
      className="p-8 bg-gradient-to-br from-white via-gray-50/30 to-slate-50/40 border-2 border-white/60 backdrop-blur-xl hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Summary KPIs</h3>
            <p className="text-gray-600 text-sm">Key performance indicators</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {kpiItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              stiffness: 100,
              damping: 10
            }}
            className="group relative"
          >
            <div className={`text-center p-6 rounded-2xl bg-gradient-to-br ${item.bgGradient} border-2 border-white/60 hover:shadow-xl ${item.shadowColor} hover:scale-105 transition-all duration-300 backdrop-blur-sm`}>
              <div className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                <item.icon size={28} className="text-white" />
              </div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="text-3xl font-black text-gray-900">
                  {item.value}
                </div>
                {getTrendIcon(item.trend)}
              </div>
              <div className={`text-sm font-semibold ${item.textColor} mb-2`}>
                {item.label}
              </div>
              
              {/* Info tooltip */}
              <div className="relative">
                <Info size={14} className="text-gray-400 hover:text-blue-600 cursor-help transition-colors mx-auto" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-64 p-4 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none shadow-2xl border border-gray-700">
                  <div className="font-semibold text-blue-300 mb-2">{item.label}</div>
                  <div className="text-gray-300">{item.description}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900/95"></div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};