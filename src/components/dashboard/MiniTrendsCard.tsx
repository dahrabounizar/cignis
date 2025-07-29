import { motion } from 'framer-motion';
import { TrendingUp, FileText, Heart, Activity } from 'lucide-react';
import { Card } from '../ui/Card';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Area, AreaChart } from 'recharts';
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

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-emerald-600 bg-emerald-100';
    if (trend < 0) return 'text-rose-600 bg-rose-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return '↗️';
    if (trend < 0) return '↘️';
    return '➡️';
  };

  const postsTrend = calculateTrend(trends.posts);
  const engagementsTrend = calculateTrend(trends.engagements);

  return (
    <Card 
      variant="premium" 
      className="p-8 cursor-pointer group relative overflow-hidden"
      hover={true}
      onClick={() => setCurrentModule('analytics')}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-green-200/20 to-blue-200/20 rounded-full blur-2xl transform translate-x-14 -translate-y-14"></div>
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl transform -translate-x-18 translate-y-18"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-lg">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">7-Day Trends</h3>
              <p className="text-gray-600 text-sm">Recent activity patterns</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp size={16} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Posts Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="group/chart"
          >
            <div className="p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl border border-blue-200/30 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm">
                    <FileText size={16} className="text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 text-lg">Posts</span>
                    <p className="text-xs text-gray-600">Daily publishing activity</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${getTrendColor(postsTrend)}`}>
                  <span>{getTrendIcon(postsTrend)}</span>
                  <span>{postsTrend > 0 ? '+' : ''}{postsTrend}</span>
                </div>
              </div>
              
              <div className="h-24 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends.posts}>
                    <defs>
                      <linearGradient id="postsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      fill="url(#postsGradient)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Last 7 days</span>
                <span className="font-semibold text-blue-600">
                  {trends.posts.reduce((sum, item) => sum + item.value, 0)} total
                </span>
              </div>
            </div>
          </motion.div>

          {/* Engagements Trend */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="group/chart"
          >
            <div className="p-6 bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-2xl border border-purple-200/30 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-sm">
                    <Heart size={16} className="text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 text-lg">Engagements</span>
                    <p className="text-xs text-gray-600">Likes, comments & shares</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${getTrendColor(engagementsTrend)}`}>
                  <span>{getTrendIcon(engagementsTrend)}</span>
                  <span>{engagementsTrend > 0 ? '+' : ''}{engagementsTrend}</span>
                </div>
              </div>
              
              <div className="h-24 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends.engagements}>
                    <defs>
                      <linearGradient id="engagementsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      fill="url(#engagementsGradient)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Last 7 days</span>
                <span className="font-semibold text-purple-600">
                  {trends.engagements.reduce((sum, item) => sum + item.value, 0)} total
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-2xl border border-indigo-200/30"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-sm">
              <TrendingUp size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-900">
                Click for detailed analytics
              </p>
              <p className="text-xs text-indigo-700">
                Explore comprehensive trend analysis and performance insights
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Card>
  );
};