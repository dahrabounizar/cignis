import { motion } from 'framer-motion';
import { TrendingUp, FileText, Heart, BarChart3, Info } from 'lucide-react';
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

  const getTrendDescription = (trend: number, type: 'posts' | 'engagements') => {
    const direction = trend > 0 ? 'increased' : trend < 0 ? 'decreased' : 'remained stable';
    const magnitude = Math.abs(trend);
    
    if (type === 'posts') {
      return `Your posting activity has ${direction} by ${magnitude} posts in the last 3 days compared to the previous 3 days. ${
        trend > 0 ? 'Great consistency!' : trend < 0 ? 'Consider maintaining regular posting.' : 'Steady posting pattern.'
      }`;
    } else {
      return `Your engagement has ${direction} by ${magnitude} interactions in the last 3 days. ${
        trend > 0 ? 'Your content is resonating well!' : trend < 0 ? 'Try engaging more with your network.' : 'Stable engagement levels.'
      }`;
    }
  };

  return (
    <Card 
      variant="glass" 
      className="p-8 cursor-pointer hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/30 border-2 border-white/60 backdrop-blur-xl group"
      onClick={() => setCurrentModule('analytics')}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
            <BarChart3 size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">7-Day Trends</h3>
            <p className="text-gray-600 text-sm">Recent activity patterns</p>
          </div>
        </div>
        <TrendingUp size={20} className="text-purple-600 group-hover:scale-110 transition-transform duration-300" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Posts Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
          className="group/item relative"
        >
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/50 hover:shadow-lg hover:shadow-blue-200/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm">
                  <FileText size={18} className="text-white" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-lg">Posts</span>
                  <div className="relative inline-block ml-2">
                    <Info size={14} className="text-gray-400 hover:text-blue-600 cursor-help transition-colors" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-72 p-4 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-2xl opacity-0 group-hover/item:opacity-100 transition-all duration-300 z-20 pointer-events-none shadow-2xl border border-gray-700">
                      <div className="font-semibold text-blue-300 mb-2">Posts Trend Analysis</div>
                      <div className="text-gray-300 mb-2">{getTrendDescription(postsTrend, 'posts')}</div>
                      <div className="text-gray-400 text-xs border-t border-gray-700 pt-2">
                        <strong className="text-blue-300">Calculation:</strong><br />
                        Recent 3 days: {trends.posts.slice(-3).reduce((sum, item) => sum + item.value, 0)} posts<br />
                        Previous 3 days: {trends.posts.slice(-6, -3).reduce((sum, item) => sum + item.value, 0)} posts<br />
                        Trend: {postsTrend > 0 ? '+' : ''}{postsTrend}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900/95"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`text-lg font-bold px-3 py-1 rounded-full ${
                postsTrend > 0 ? 'text-emerald-700 bg-emerald-100' : 
                postsTrend < 0 ? 'text-rose-700 bg-rose-100' : 
                'text-gray-700 bg-gray-100'
              }`}>
                {postsTrend > 0 ? '+' : ''}{postsTrend}
              </div>
            </div>
            <div className="h-24 mb-2">
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
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Engagements Trend */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="group/item relative"
        >
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200/50 hover:shadow-lg hover:shadow-purple-200/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-sm">
                  <Heart size={18} className="text-white" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-lg">Engagements</span>
                  <div className="relative inline-block ml-2">
                    <Info size={14} className="text-gray-400 hover:text-purple-600 cursor-help transition-colors" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-72 p-4 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-2xl opacity-0 group-hover/item:opacity-100 transition-all duration-300 z-20 pointer-events-none shadow-2xl border border-gray-700">
                      <div className="font-semibold text-purple-300 mb-2">Engagement Trend Analysis</div>
                      <div className="text-gray-300 mb-2">{getTrendDescription(engagementsTrend, 'engagements')}</div>
                      <div className="text-gray-400 text-xs border-t border-gray-700 pt-2">
                        <strong className="text-purple-300">Calculation:</strong><br />
                        Recent 3 days: {trends.engagements.slice(-3).reduce((sum, item) => sum + item.value, 0)} engagements<br />
                        Previous 3 days: {trends.engagements.slice(-6, -3).reduce((sum, item) => sum + item.value, 0)} engagements<br />
                        Trend: {engagementsTrend > 0 ? '+' : ''}{engagementsTrend}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900/95"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`text-lg font-bold px-3 py-1 rounded-full ${
                engagementsTrend > 0 ? 'text-emerald-700 bg-emerald-100' : 
                engagementsTrend < 0 ? 'text-rose-700 bg-rose-100' : 
                'text-gray-700 bg-gray-100'
              }`}>
                {engagementsTrend > 0 ? '+' : ''}{engagementsTrend}
              </div>
            </div>
            <div className="h-24 mb-2">
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
                    activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                  />
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <BarChart3 size={18} className="text-indigo-600" />
          </div>
          <p className="text-sm text-indigo-900 font-medium">
            <strong>Click for detailed analytics</strong> with comprehensive trend analysis, forecasting, and actionable insights.
          </p>
        </div>
      </motion.div>
    </Card>
  );
};