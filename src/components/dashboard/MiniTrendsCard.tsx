import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../ui/Card';
import { MiniTrend } from '../../hooks/useDashboardData';

interface MiniTrendsCardProps {
  trends: {
    posts: MiniTrend[];
    engagements: MiniTrend[];
  };
}

export const MiniTrendsCard = ({ trends }: MiniTrendsCardProps) => {
  const maxPostValue = Math.max(...trends.posts.map(p => p.value), 1);
  const maxEngagementValue = Math.max(...trends.engagements.map(e => e.value), 1);
  
  // Calculate trend direction
  const getPostsTrend = () => {
    const recent = trends.posts.slice(-3).reduce((sum, item) => sum + item.value, 0);
    const earlier = trends.posts.slice(0, 3).reduce((sum, item) => sum + item.value, 0);
    if (recent > earlier) return 'up';
    if (recent < earlier) return 'down';
    return 'stable';
  };

  const getEngagementsTrend = () => {
    const recent = trends.engagements.slice(-3).reduce((sum, item) => sum + item.value, 0);
    const earlier = trends.engagements.slice(0, 3).reduce((sum, item) => sum + item.value, 0);
    if (recent > earlier) return 'up';
    if (recent < earlier) return 'down';
    return 'stable';
  };

  const postsTrend = getPostsTrend();
  const engagementsTrend = getEngagementsTrend();

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingUp size={16} className="text-green-500" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-red-500" />;
    return <Minus size={16} className="text-gray-500" />;
  };

  const TrendColor = (trend: string) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card variant="glass" className="p-6 bg-gradient-to-br from-white to-gray-50 border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="mr-3 text-indigo-600" size={24} />
          Weekly Trends
        </h3>
      </div>

      <div className="space-y-8">
        {/* Posts Trend */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-800">Posts</h4>
              <TrendIcon trend={postsTrend} />
            </div>
            <div className={`text-sm font-medium ${TrendColor(postsTrend)}`}>
              {postsTrend === 'up' && '↗ Increasing'}
              {postsTrend === 'down' && '↘ Decreasing'}
              {postsTrend === 'stable' && '→ Stable'}
            </div>
          </div>
          
          <div className="flex items-end justify-between gap-2 h-20">
            {trends.posts.map((item, index) => (
              <motion.div
                key={item.date}
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: `${(item.value / maxPostValue) * 100}%`, 
                  opacity: 1 
                }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
                className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg min-h-[4px] relative group"
                whileHover={{ scale: 1.1, y: -2 }}
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.value} posts
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {trends.posts.map((item) => (
              <span key={item.date} className="flex-1 text-center">
                {item.date.replace('Day ', '')}
              </span>
            ))}
          </div>
        </div>

        {/* Engagements Trend */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-800">Engagements</h4>
              <TrendIcon trend={engagementsTrend} />
            </div>
            <div className={`text-sm font-medium ${TrendColor(engagementsTrend)}`}>
              {engagementsTrend === 'up' && '↗ Increasing'}
              {engagementsTrend === 'down' && '↘ Decreasing'}
              {engagementsTrend === 'stable' && '→ Stable'}
            </div>
          </div>
          
          <div className="flex items-end justify-between gap-2 h-20">
            {trends.engagements.map((item, index) => (
              <motion.div
                key={item.date}
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: `${(item.value / maxEngagementValue) * 100}%`, 
                  opacity: 1 
                }}
                transition={{ 
                  delay: index * 0.1 + 0.3,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
                className="flex-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg min-h-[4px] relative group"
                whileHover={{ scale: 1.1, y: -2 }}
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.value} engagements
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {trends.engagements.map((item) => (
              <span key={item.date} className="flex-1 text-center">
                {item.date.replace('Day ', '')}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-6 pt-4 border-t border-gray-200"
      >
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {trends.posts.reduce((sum, item) => sum + item.value, 0)}
            </div>
            <div className="text-gray-600">Total Posts</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {trends.engagements.reduce((sum, item) => sum + item.value, 0)}
            </div>
            <div className="text-gray-600">Total Engagements</div>
          </div>
        </div>
      </motion.div>
    </Card>
  );
};