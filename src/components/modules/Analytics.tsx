import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Users, MessageCircle, Eye, BarChart3, Heart, FileText, Info, RefreshCw, AlertCircle, Target, Activity } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAuthStore } from '../../stores/authStore';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

type TimeRange = '7d' | '30d' | '90d';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7300'];

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [debugMode, setDebugMode] = useState(false);
  const { dmaToken } = useAuthStore();
  const { data: analyticsData, isLoading, error, refetch } = useAnalyticsData(timeRange);

  if (!dmaToken) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Analytics Unavailable</h2>
          <p className="text-gray-600 mb-6">
            Advanced analytics require LinkedIn data access permissions.
          </p>
          <Button
            variant="primary"
            onClick={() => (window.location.href = "/")}
          >
            Enable Data Access
          </Button>
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Error Loading Analytics
        </h2>
        <p className="text-gray-600 mb-4">
          {error?.message || 'Failed to load analytics data'}
        </p>
        <div className="space-y-3">
          <Button variant="primary" onClick={() => refetch()}>
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => setDebugMode(!debugMode)}
          >
            {debugMode ? "Hide" : "Show"} Debug Info
          </Button>
        </div>
        {debugMode && error && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Deep Dive</h2>
          <p className="text-gray-600 mt-1">Detailed insights into your LinkedIn performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDebugMode(!debugMode)}
          >
            {debugMode ? "Hide" : "Show"} Debug
          </Button>
          <div className="flex space-x-2">
            {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="glass" className="p-4 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg mr-3">
              <Target size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Profile Strength</div>
              <div className="text-xl font-bold">85%</div>
            </div>
          </div>
        </Card>
        <Card variant="glass" className="p-4 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg mr-3">
              <Users size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Network Quality</div>
              <div className="text-xl font-bold">7/10</div>
            </div>
          </div>
        </Card>
        <Card variant="glass" className="p-4 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg mr-3">
              <Activity size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Social Activity</div>
              <div className="text-xl font-bold">3/10</div>
            </div>
          </div>
        </Card>
        <Card variant="glass" className="p-4 border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="p-2 bg-orange-50 rounded-lg mr-3">
              <BarChart3 size={20} className="text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Content Performance</div>
              <div className="text-xl font-bold">5/10</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Debug Panel */}
      {debugMode && analyticsData && (
        <Card variant="glass" className="p-4 bg-yellow-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Debug Information</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDebugMode(false)}
            >
              Hide
            </Button>
          </div>
          <div className="text-sm space-y-2">
            <div>Time Range: {analyticsData.timeRange}</div>
            <div>Last Updated: {analyticsData.lastUpdated}</div>
            <div>Posts Trend Data Points: {analyticsData.postsEngagementsTrend?.length || 0}</div>
            <div>Connections Growth Data Points: {analyticsData.connectionsGrowth?.length || 0}</div>
            <div>Post Types: {analyticsData.postTypesBreakdown?.length || 0}</div>
            <div>Top Hashtags: {analyticsData.topHashtags?.length || 0}</div>
            <div>Engagement Per Post: {analyticsData.engagementPerPost?.length || 0}</div>
          </div>
        </Card>
      )}

      {/* Key Insights */}
      <Card variant="glass" className="p-6">
        <h3 className="text-lg font-semibold mb-4">Key Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Profile Optimization</h4>
            <p className="text-sm text-blue-700">Your profile strength is good but can be improved by adding more skills and getting endorsements.</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Network Growth</h4>
            <p className="text-sm text-green-700">Consider connecting with more professionals in your industry to expand your network quality.</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Content Strategy</h4>
            <p className="text-sm text-purple-700">Increase posting frequency and engage more with others' content to boost social activity.</p>
          </div>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posts & Engagements Trend */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Posts & Engagements Trend</h3>
            <div className="relative group">
              <Info size={16} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {analyticsData.scoreImpacts.postingActivity.description}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.postsEngagementsTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="posts" stroke="#3B82F6" strokeWidth={2} name="Posts" />
              <Line type="monotone" dataKey="totalEngagement" stroke="#10B981" strokeWidth={2} name="Total Engagement" />
              <Line type="monotone" dataKey="likes" stroke="#EF4444" strokeWidth={1} name="Likes" />
              <Line type="monotone" dataKey="comments" stroke="#8B5CF6" strokeWidth={1} name="Comments" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-gray-600">
            <strong>Impact:</strong> {analyticsData.scoreImpacts.postingActivity.impact}
          </div>
        </Card>

        {/* Connections Growth Chart */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Connections Growth</h3>
            <div className="relative group">
              <Info size={16} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {analyticsData.scoreImpacts.networkGrowth.description}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.connectionsGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="totalConnections" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-gray-600">
            <strong>Impact:</strong> {analyticsData.scoreImpacts.networkGrowth.impact}
          </div>
        </Card>

        {/* Post Types Chart */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Post Types Distribution</h3>
            <div className="relative group">
              <Info size={16} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {analyticsData.scoreImpacts.contentDiversity.description}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.postTypesBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={30}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analyticsData.postTypesBreakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-gray-600">
            <strong>Impact:</strong> {analyticsData.scoreImpacts.contentDiversity.impact}
          </div>
        </Card>

        {/* Top Hashtags Chart */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top 10 Hashtags</h3>
            <div className="relative group">
              <Info size={16} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Popular hashtags help increase content discoverability
              </div>
            </div>
          </div>
          {analyticsData.topHashtags.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.topHashtags} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="hashtag" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No hashtags found in your posts</p>
                <p className="text-sm">Start using hashtags to increase visibility</p>
              </div>
            </div>
          )}
          <div className="mt-2 text-xs text-gray-600">
            <strong>Tip:</strong> Use 3-5 relevant hashtags per post to increase discoverability
          </div>
        </Card>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement per Post */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Posts by Engagement</h3>
            <div className="relative group">
              <Info size={16} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {analyticsData.scoreImpacts.engagementQuality.description}
              </div>
            </div>
          </div>
          {analyticsData.engagementPerPost.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.engagementPerPost}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="content" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="likes" stackId="a" fill="#EF4444" name="Likes" />
                <Bar dataKey="comments" stackId="a" fill="#8B5CF6" name="Comments" />
                <Bar dataKey="shares" stackId="a" fill="#10B981" name="Shares" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Heart size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No engagement data available</p>
                <p className="text-sm">Start posting to see engagement metrics</p>
              </div>
            </div>
          )}
          <div className="mt-2 text-xs text-gray-600">
            <strong>Impact:</strong> {analyticsData.scoreImpacts.engagementQuality.impact}
          </div>
        </Card>

        {/* Messages Sent vs Received */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Messages Sent vs Received</h3>
            <div className="relative group">
              <Info size={16} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {analyticsData.scoreImpacts.mutualInteractions.description}
              </div>
            </div>
          </div>
          {analyticsData.messagesSentReceived.some(d => d.sent > 0 || d.received > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.messagesSentReceived}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sent" stackId="a" fill="#3B82F6" name="Sent" />
                <Bar dataKey="received" stackId="a" fill="#10B981" name="Received" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No message data available</p>
                <p className="text-sm">Message activity will appear here</p>
              </div>
            </div>
          )}
          <div className="mt-2 text-xs text-gray-600">
            <strong>Impact:</strong> {analyticsData.scoreImpacts.mutualInteractions.impact}
          </div>
        </Card>
      </div>

      {/* Audience Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Industry Distribution */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Industry Distribution</h3>
            <div className="relative group">
              <Info size={16} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {analyticsData.scoreImpacts.audienceRelevance.description}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.audienceDistribution.industries}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {analyticsData.audienceDistribution.industries.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Position Distribution */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Position Distribution</h3>
            <div className="relative group">
              <Info size={16} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Professional connections enhance your network quality
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.audienceDistribution.positions.slice(0, 8)} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Location Distribution */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Location Distribution</h3>
            <div className="relative group">
              <Info size={16} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Geographic diversity can expand your professional reach
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.audienceDistribution.locations.slice(0, 8)} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Score Improvement Tips */}
      <Card variant="glass" className="p-6">
        <h3 className="text-lg font-semibold mb-4">How to Improve Your Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(analyticsData.scoreImpacts).slice(0, 6).map(([key, impact]) => (
            <div key={key} className="space-y-2">
              <h4 className="font-medium text-gray-900 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <p className="text-sm text-gray-600">{impact.description}</p>
              <ul className="text-xs text-gray-500 space-y-1">
                {impact.tips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span className="text-blue-500">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};