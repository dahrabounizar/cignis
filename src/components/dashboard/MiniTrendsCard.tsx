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
    if (!data || data.length < 2) return 0;
    const recent = data.slice(-3).reduce((sum, item) => sum + (item?.value || 0), 0);
    const previous = data.slice(-6, -3).reduce((sum, item) => sum + (item?.value || 0), 0);
    return recent - previous;
  };

  const postsTrend = calculateTrend(trends?.posts || []);
  const engagementsTrend = calculateTrend(trends?.engagements || []);

  return (
    <Card 
      variant="glass" 
      className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={() => setCurrentModule('analytics')}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">7-Day Trends</h3>
        <TrendingUp size={20} className="text-blue-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Posts Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <FileText size={16} className="text-blue-600" />
              <span className="font-medium text-gray-900">Posts</span>
            </div>
            <div className={`text-sm font-medium ${
              postsTrend > 0 ? 'text-green-600' : postsTrend < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {postsTrend > 0 ? '+' : ''}{postsTrend}
            </div>
          </div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends?.posts || []}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={false}
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
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Heart size={16} className="text-purple-600" />
              <span className="font-medium text-gray-900">Engagements</span>
            </div>
            <div className={`text-sm font-medium ${
              engagementsTrend > 0 ? 'text-green-600' : engagementsTrend < 0 ? 'text-red-600' : 'text-gray-600'
            }`}>
              {engagementsTrend > 0 ? '+' : ''}{engagementsTrend}
            </div>
          </div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends?.engagements || []}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Click for detailed analytics</strong> with full trend analysis and insights.
        </p>
      </div>
    </Card>
  );
};