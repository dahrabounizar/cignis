import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Users, MessageCircle, Eye, BarChart3, Heart, FileText, Info, RefreshCw, AlertCircle } from 'lucide-react';
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
        <h2 className="text-2xl font-bold">Detailed Analytics</h2>
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
            <div>Time Range: {timeRange}</div>
            <div>Posts Trend Data Points: {analyticsData.postsTrend?.length || 0}</div>
            <div>Connections Trend Data Points: {analyticsData.connectionsTrend?.length || 0}</div>
            <div>Post Types: {Object.keys(analyticsData.postTypes || {}).length}</div>
            <div>Top Hashtags: {analyticsData.hashtags?.length || 0}</div>
            <div>Engagement Per Post: {analyticsData.engagementPerPost?.length || 0}</div>
          </div>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posts & Engagements Trend */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Posts & Engagements Trend</h3>
            <div className="relative group">
              <Info size={16} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Track your posting frequency and engagement levels over time
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.postsTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="posts" stroke="#3B82F6" strokeWidth={2} name="Posts" />
              <Line type="monotone" dataKey="engagements" stroke="#10B981" strokeWidth={2} name="Total Engagement" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-gray-600">
            <strong>Tip:</strong> Consistent posting drives better engagement
          </div>
        </Card>

        {/* Connections Growth Chart */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Connections Growth</h3>
            <div className="relative group">
              <Info size={16} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Monitor your network expansion over time
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.connectionsTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Total Connections" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-gray-600">
            <strong>Growth:</strong> {analyticsData.connectionsTrend?.length > 1 ? 
              `+${analyticsData.connectionsTrend[analyticsData.connectionsTrend.length - 1].total - analyticsData.connectionsTrend[0].total} connections` : 
              'No data'}
          </div>
        </Card>

        {/* Post Types Breakdown */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Content Types</h3>
            <div className="relative group">
              <Info size={16} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Diversify your content types for better engagement
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(analyticsData.postTypes || {}).map(([name, value]) => ({ name, value }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(analyticsData.postTypes || {}).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Hashtags */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Hashtags</h3>
            <div className="relative group">
              <Info size={16} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Your most used hashtags
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.hashtags?.slice(0, 10) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tag" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Engagement Per Post */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Performing Posts</h3>
            <div className="relative group">
              <Info size={16} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Your posts with highest engagement
              </div>
            </div>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {analyticsData.engagementPerPost?.slice(0, 10).map((post, index) => (
              <div key={post.postUrn} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Post #{index + 1}</p>
                    <p className="text-xs text-gray-600 mt-1">URN: {post.postUrn.slice(-8)}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <Heart size={14} className="mr-1 text-red-500" />
                      {post.likes}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle size={14} className="mr-1 text-blue-500" />
                      {post.comments}
                    </span>
                    <span className="font-semibold text-green-600">
                      {post.likes + post.comments} total
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Audience Distribution */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Audience Distribution</h3>
            <div className="relative group">
              <Info size={16} className="text-gray-400 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Your network composition by industry and location
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Top Industries</h4>
              <div className="space-y-2">
                {Object.entries(analyticsData.audience?.industries || {}).slice(0, 5).map(([name, value]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-sm">{name}</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Top Locations</h4>
              <div className="space-y-2">
                {Object.entries(analyticsData.audience?.geographies || {}).slice(0, 5).map(([name, value]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-sm">{name}</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Score Improvement Tips */}
      <Card variant="glass" className="p-6">
        <h3 className="text-lg font-semibold mb-4">How to Improve Your Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Profile Completeness</h4>
            <p className="text-sm text-gray-600">A complete profile increases visibility and credibility</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Add a professional headline</span>
              </li>
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Complete work experience</span>
              </li>
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Add relevant skills</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Posting Activity</h4>
            <p className="text-sm text-gray-600">Regular posting keeps you visible in your network's feed</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Post 3-5 times per week</span>
              </li>
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Share industry insights</span>
              </li>
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Engage with others' content</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Engagement Quality</h4>
            <p className="text-sm text-gray-600">High engagement indicates valuable content and strong network</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Ask questions in posts</span>
              </li>
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Share personal experiences</span>
              </li>
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Respond to comments quickly</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Network Growth</h4>
            <p className="text-sm text-gray-600">Growing your network expands your reach and opportunities</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Connect with industry peers</span>
              </li>
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Attend virtual events</span>
              </li>
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Engage before connecting</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Content Diversity</h4>
            <p className="text-sm text-gray-600">Varied content types keep your audience engaged</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Mix text, images, and videos</span>
              </li>
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Share articles and insights</span>
              </li>
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Use polls and questions</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Engagement Rate</h4>
            <p className="text-sm text-gray-600">High engagement relative to network size shows content quality</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Post when audience is active</span>
              </li>
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Create conversation-starting content</span>
              </li>
              <li className="flex items-start space-x-1">
                <span className="text-blue-500">•</span>
                <span>Use relevant hashtags</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};