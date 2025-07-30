import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Activity, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';

interface MiniTrend {
  date: string;
  value: number;
}

interface MiniTrendsProps {
  trends: {
    posts: MiniTrend[];
    engagements: MiniTrend[];
  };
}

export const MiniTrendsCard = ({ trends }: MiniTrendsProps) => {
  const maxPostValue = Math.max(...trends.posts.map(p => p.value), 1);
  const maxEngagementValue = Math.max(...trends.engagements.map(e => e.value), 1);

  const getBarHeight = (value: number, maxValue: number) => {
    return Math.max((value / maxValue) * 100, 2); // Minimum 2% height for visibility
  };

  const getTotalChange = (data: MiniTrend[]) => {
    if (data.length < 2) return 0;
    const first = data[0].value;
    const last = data[data.length - 1].value;
    if (first === 0) return last > 0 ? 100 : 0;
    return ((last - first) / first) * 100;
  };

  const postsChange = getTotalChange(trends.posts);
  const engagementsChange = getTotalChange(trends.engagements);

  return (
    <Card variant="glass" className="p-8 bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          7-Day Trends
        </h3>
        <div className="flex items-center space-x-2 text-blue-600">
          <Calendar size={20} />
          <span className="text-sm font-medium">Last Week</span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Posts Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Posts</h4>
                <p className="text-sm text-gray-600">Daily posting activity</p>
              </div>
            </div>
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
              postsChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <TrendingUp size={14} className={postsChange >= 0 ? 'text-green-600' : 'text-red-600 rotate-180'} />
              <span className="text-sm font-medium">
                {postsChange >= 0 ? '+' : ''}{postsChange.toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between h-24 bg-gradient-to-t from-green-50/50 to-transparent rounded-xl p-4 border border-green-100/50">
            {trends.posts.map((item, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${getBarHeight(item.value, maxPostValue)}%` }}
                transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
                className="flex flex-col items-center space-y-2"
              >
                <div
                  className="w-6 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  style={{ height: `${getBarHeight(item.value, maxPostValue)}%` }}
                />
                <div className="text-xs text-gray-500 font-medium">{item.date}</div>
                <div className="text-xs text-gray-700 font-bold">{item.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Engagements Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Engagements</h4>
                <p className="text-sm text-gray-600">Likes, comments & shares</p>
              </div>
            </div>
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
              engagementsChange >= 0 ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
            }`}>
              <TrendingUp size={14} className={engagementsChange >= 0 ? 'text-purple-600' : 'text-red-600 rotate-180'} />
              <span className="text-sm font-medium">
                {engagementsChange >= 0 ? '+' : ''}{engagementsChange.toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between h-24 bg-gradient-to-t from-purple-50/50 to-transparent rounded-xl p-4 border border-purple-100/50">
            {trends.engagements.map((item, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${getBarHeight(item.value, maxEngagementValue)}%` }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                className="flex flex-col items-center space-y-2"
              >
                <div
                  className="w-6 bg-gradient-to-t from-purple-500 to-pink-400 rounded-t-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  style={{ height: `${getBarHeight(item.value, maxEngagementValue)}%` }}
                />
                <div className="text-xs text-gray-500 font-medium">{item.date}</div>
                <div className="text-xs text-gray-700 font-bold">{item.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-xl border border-white/30"
      >
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {trends.posts.reduce((sum, p) => sum + p.value, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {trends.engagements.reduce((sum, e) => sum + e.value, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Engagements</div>
          </div>
        </div>
      </motion.div>
    </Card>
  );
};