import { motion } from 'framer-motion';
import { TrendingUp, FileText, Heart } from 'lucide-react';
import { Card } from '../ui/Card';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { MiniTrend } from '../../hooks/useDashboardData';
import { useAppStore } from '../../stores/appStore';

interface MiniTrendsCardProps {
  trends: {
    posts: MiniTrend[];
    engagements: MiniTrend[];
  };
}

export const MiniTrendsCard = ({ trends }: MiniTrendsCardProps) => {
  const { setCurrentModule } = useAppStore();

  const calculateTrend = (data: MiniTrend[]) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-3).reduce((sum, item) => sum + item.value, 0);
    const previous = data.slice(-6, -3).reduce((sum, item) => sum + item.value, 0);
    return recent - previous;
  };

  const postsTrend = calculateTrend(trends.posts);
  const engagementsTrend = calculateTrend(trends.engagements);

  return (
    <Card 
      variant="glass" 
      className="p-6 cursor-pointer hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white via-purple-50 to-pink-50 border-purple-100"
      onClick={() => setCurrentModule('analytics')}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">7-Day Trends</h3>
            <p className="text-sm text-gray-600">Activity overview</p>
          </div>
        </div>
        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
      </div>

      <div className="space-y-4">
        {/* Posts Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
          className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-blue-600" />
              </div>
              <div>
                <span className="font-semibold text-gray-900">Posts</span>
                <p className="text-xs text-gray-500">Daily posting activity</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${
                postsTrend > 0 ? 'text-green-600' : postsTrend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {postsTrend > 0 ? '+' : ''}{postsTrend}
              </div>
              <div className="text-xs text-gray-500">vs last 3 days</div>
            </div>
          </div>
          <div className="h-16 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends.posts}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="url(#blueGradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#1D4ED8' }}
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Engagements Trend */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Heart size={16} className="text-purple-600" />
              </div>
              <div>
                <span className="font-semibold text-gray-900">Engagements</span>
                <p className="text-xs text-gray-500">Likes, comments & shares</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${
                engagementsTrend > 0 ? 'text-green-600' : engagementsTrend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {engagementsTrend > 0 ? '+' : ''}{engagementsTrend}
              </div>
              <div className="text-xs text-gray-500">vs last 3 days</div>
            </div>
          </div>
          <div className="h-16 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends.engagements}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="url(#purpleGradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#7C3AED' }}
                />
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-900">
                Dive deeper into your analytics
              </p>
              <p className="text-xs text-purple-700">
                View comprehensive trends, patterns, and growth insights
              </p>
            </div>
          </div>
          <div className="text-purple-500">
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              →
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Card>
  );
};