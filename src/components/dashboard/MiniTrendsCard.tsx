import { motion } from 'framer-motion';
import { TrendingUp, FileText, Heart, Info, BarChart3 } from 'lucide-react';
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

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return '📈';
    if (trend < 0) return '📉';
    return '➖';
  };

  const postsTotal = trends.posts.reduce((sum, item) => sum + item.value, 0);
  const engagementsTotal = trends.engagements.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card 
      variant="glass" 
      className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
      onClick={() => setCurrentModule('analytics')}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 size={20} className="text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">7-Day Trends</h3>
        </div>
        <div className="text-sm text-gray-500">Click for detailed analytics</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Posts Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="group relative"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={16} className="text-blue-600" />
              </div>
              <div>
                <span className="font-medium text-gray-900">Posts</span>
                <div className="text-xs text-gray-500">Total: {postsTotal}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`text-sm font-medium ${getTrendColor(postsTrend)}`}>
                {getTrendIcon(postsTrend)} {postsTrend > 0 ? '+' : ''}{postsTrend}
              </div>
              <div className="relative">
                <Info size={14} className="text-gray-400 cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none shadow-lg">
                  Your posting activity over the last 7 days. The trend shows the change compared to the previous period. Consistent posting helps maintain visibility in your network.
                </div>
              </div>
            </div>
          </div>
          <div className="h-20 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends.posts}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Engagements Trend */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="group relative"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Heart size={16} className="text-purple-600" />
              </div>
              <div>
                <span className="font-medium text-gray-900">Engagements</span>
                <div className="text-xs text-gray-500">Total: {engagementsTotal}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`text-sm font-medium ${getTrendColor(engagementsTrend)}`}>
                {getTrendIcon(engagementsTrend)} {engagementsTrend > 0 ? '+' : ''}{engagementsTrend}
              </div>
              <div className="relative">
                <Info size={14} className="text-gray-400 cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none shadow-lg">
                  Engagement you've received (likes + comments) over the last 7 days. Higher engagement indicates your content resonates well with your audience.
                </div>
              </div>
            </div>
          </div>
          <div className="h-20 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends.engagements}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600">{postsTotal}</div>
          <div className="text-xs text-blue-800">Total Posts (7d)</div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg text-center">
          <div className="text-lg font-bold text-purple-600">{engagementsTotal}</div>
          <div className="text-xs text-purple-800">Total Engagements (7d)</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <p className="text-sm text-gray-800">
          <strong>Click for detailed analytics</strong> with full trend analysis, engagement insights, and content performance metrics.
        </p>
      </div>
    </Card>
  );
};