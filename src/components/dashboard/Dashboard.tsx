import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Zap, RefreshCw, Database, Target, Users, Activity, BarChart3, Calendar, TrendingUp, MessageCircle, ThumbsUp, FileText, UserPlus } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { useAuthStore } from "../../stores/authStore";
import { useDashboardData } from "../../hooks/useDashboardData";
import { useAppStore } from "../../stores/appStore";

// New metric card component
const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  change, 
  icon: Icon, 
  color,
  bgColor 
}: {
  title: string;
  value: string;
  subtitle: string;
  change?: string;
  icon: any;
  color: string;
  bgColor: string;
}) => (
  <Card variant="glass" className="p-6 border-l-4" style={{ borderLeftColor: color }}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-full ${bgColor}`}>
        <Icon size={24} style={{ color }} />
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{subtitle}</div>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      {change && (
        <div className="flex items-center text-sm text-green-600">
          <TrendingUp size={14} className="mr-1" />
          {change}
        </div>
      )}
    </div>
  </Card>
);

// Activity stats component
const ActivityStats = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
  <div className="text-center p-4 bg-gray-50 rounded-lg">
    <div className="text-3xl font-bold mb-2" style={{ color }}>{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

// Progress circle component
const ProgressCircle = ({ percentage }: { percentage: number }) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#3b82f6"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
      </div>
    </div>
  );
};

// Recommendation item component
const RecommendationItem = ({ text, color = "text-blue-600" }: { text: string; color?: string }) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
    <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`}></div>
    <span className="text-sm text-gray-700">{text}</span>
  </div>
);

export const Dashboard = () => {
  const { dmaToken } = useAuthStore();
  const { setCurrentModule } = useAppStore();
  const { data: dashboardData, isLoading, error, refetch } = useDashboardData();
  const [debugMode, setDebugMode] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  const handleRefetch = async () => {
    setIsRefetching(true);
    try {
      await refetch();
    } finally {
      setIsRefetching(false);
    }
  };

  // Add test function to check data flow
  const testDataFlow = async () => {
    console.log("Testing data flow...");
    console.log("DMA Token present:", !!dmaToken);
    console.log("DMA Token value:", dmaToken ? dmaToken.substring(0, 20) + "..." : "null");
    console.log("Dashboard data:", dashboardData);
    console.log("Loading state:", isLoading);
    console.log("Error state:", error);
    
    // Test direct API call
    if (dmaToken) {
      try {
        console.log("Testing direct API call...");
        const response = await fetch('/.netlify/functions/dashboard-data', {
          headers: {
            'Authorization': `Bearer ${dmaToken}`,
            'Content-Type': 'application/json',
          },
        });
        console.log("Direct API response status:", response.status);
        const data = await response.json();
        console.log("Direct API response data:", data);
      } catch (apiError) {
        console.error("Direct API call failed:", apiError);
      }
    }
  };

  if (!dmaToken) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-orange-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Limited Access Mode</h2>
          <p className="text-gray-600 mb-6">
            DMA token is missing. You need to complete the DMA authentication flow to access dashboard features.
          </p>
          <Button
            variant="primary"
            onClick={() => (window.location.href = "/")}
          >
            Complete DMA Authentication
          </Button>
        </div>
      </motion.div>
    );
  }

  if (isLoading || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading LinkedIn analytics...</p>
        <p className="text-sm text-gray-500">This may take a moment for larger accounts</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Error Loading Dashboard
        </h2>
        <p className="text-gray-600 mb-4">
          {error.message || "Failed to load dashboard data"}
        </p>
        <div className="space-y-3">
          <Button variant="primary" onClick={handleRefetch} disabled={isRefetching}>
            <RefreshCw size={16} className="mr-2" />
            {isRefetching ? "Refreshing..." : "Try Again"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setDebugMode(!debugMode)}
          >
            {debugMode ? "Hide" : "Show"} Debug Info
          </Button>
          <Button
            variant="ghost"
            onClick={testDataFlow}
          >
            Test Data Flow
          </Button>
        </div>
        {debugMode && (
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
      {/* Debug Panel */}
      {debugMode && dashboardData && (
        <Card variant="glass" className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold flex items-center">
              <Database size={16} className="mr-2" />
              Debug Information
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDebugMode(false)}
            >
              Hide
            </Button>
          </div>
          <div className="text-sm space-y-2">
            <div>Last Updated: {dashboardData.lastUpdated}</div>
            <div>DMA Token: {dmaToken ? 'Present' : 'Missing'}</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Profile Evaluation:</strong>
                <div>Overall Score: {dashboardData.profileEvaluation.overallScore}/10</div>
                <div>Scores: {Object.values(dashboardData.profileEvaluation.scores).join(', ')}</div>
              </div>
              <div>
                <strong>Summary KPIs:</strong>
                <div>Total Connections: {dashboardData.summaryKPIs.totalConnections}</div>
                <div>Posts (30d): {dashboardData.summaryKPIs.postsLast30Days}</div>
                <div>Engagement Rate: {dashboardData.summaryKPIs.engagementRate}</div>
                <div>New Connections: {dashboardData.summaryKPIs.connectionsLast30Days}</div>
              </div>
            </div>
            <div>
              <strong>Mini Trends:</strong>
              <div>Posts: {dashboardData.miniTrends.posts.map(p => p.value).join(', ')}</div>
              <div>Engagements: {dashboardData.miniTrends.engagements.map(e => e.value).join(', ')}</div>
            </div>
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={testDataFlow}
              >
                Test Data Flow
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Profile Strength"
          value={`${dashboardData.profileEvaluation.overallScore}%`}
          subtitle="Overall profile quality"
          change={dashboardData.profileEvaluation.overallScore >= 8 ? "Good" : "Room for improvement"}
          icon={Target}
          color="#3b82f6"
          bgColor="bg-blue-100"
        />
        <MetricCard
          title="Network Quality"
          value={`${Math.min(dashboardData.summaryKPIs.totalConnections, 999)}/10`}
          subtitle="Connection strength"
          change={`${dashboardData.summaryKPIs.connectionsLast30Days} new this month`}
          icon={Users}
          color="#10b981"
          bgColor="bg-green-100"
        />
        <MetricCard
          title="Social Activity"
          value={`${Math.min(dashboardData.summaryKPIs.postsLast30Days * 10, 999)}/10`}
          subtitle="Engagement level"
          change={`${dashboardData.summaryKPIs.postsLast30Days} interactions`}
          icon={Activity}
          color="#8b5cf6"
          bgColor="bg-purple-100"
        />
        <MetricCard
          title="Content Performance"
          value={`${Math.min(parseFloat(dashboardData.summaryKPIs.engagementRate) * 100, 999)}/10`}
          subtitle="Post effectiveness"
          change={`${dashboardData.summaryKPIs.postsLast30Days} posts published`}
          icon={BarChart3}
          color="#f59e0b"
          bgColor="bg-yellow-100"
        />
      </div>

      {/* Activity Overview and Profile Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Overview */}
        <div className="lg:col-span-2">
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Activity Overview</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar size={16} />
                <span>Past 28 days</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ActivityStats 
                label="Posts Created" 
                value={dashboardData.summaryKPIs.postsLast30Days} 
                color="#3b82f6" 
              />
              <ActivityStats 
                label="Comments Given" 
                value={Math.floor(dashboardData.summaryKPIs.postsLast30Days * 1.5)} 
                color="#10b981" 
              />
              <ActivityStats 
                label="Likes Given" 
                value={Math.floor(dashboardData.summaryKPIs.postsLast30Days * 2.3)} 
                color="#8b5cf6" 
              />
              <ActivityStats 
                label="Total Posts" 
                value={dashboardData.summaryKPIs.postsLast30Days} 
                color="#f59e0b" 
              />
            </div>
          </Card>
        </div>

        {/* Profile Progress */}
        <Card variant="glass" className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Progress</h3>
          <ProgressCircle percentage={dashboardData.profileEvaluation.overallScore * 10} />
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">Room for improvement</p>
          </div>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card variant="glass" className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Trends</h3>
        <div className="h-48 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Trend visualization will be displayed here</p>
          </div>
        </div>
      </Card>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Development */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Profile Development</h3>
          </div>
          <div className="space-y-3">
            <RecommendationItem text="Add more skills to your profile" color="text-blue-600" />
            <RecommendationItem text="Add work experience or internships" color="text-blue-600" />
            <RecommendationItem text="Complete your basic profile information" color="text-blue-600" />
          </div>
        </Card>

        {/* Network Insights */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar size={20} className="text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Network Insights</h3>
          </div>
          <div className="space-y-3">
            <RecommendationItem text="Keep building your network!" color="text-green-600" />
          </div>
        </Card>

        {/* Content Strategy */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText size={20} className="text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Content Strategy</h3>
          </div>
          <div className="space-y-3">
            <RecommendationItem text="No posts published yet" color="text-purple-600" />
          </div>
        </Card>

        {/* Social Engagement */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ThumbsUp size={20} className="text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Social Engagement</h3>
          </div>
          <div className="space-y-3">
            <RecommendationItem text="0 likes given" color="text-orange-600" />
            <RecommendationItem text="0 engagement per connection" color="text-orange-600" />
            <RecommendationItem text="0 activities per day" color="text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Zap className="mr-2" size={20} />
            Quick Actions
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDebugMode(!debugMode)}
          >
            <Database size={14} className="mr-1" />
            {debugMode ? "Hide" : "Show"} Debug
          </Button>
        </div>
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all"
            onClick={() => setCurrentModule("analytics")}
          >
            📊 View Detailed Analytics
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            onClick={() => setCurrentModule("postgen")}
          >
            ✍️ Generate New Post
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
            onClick={() => setCurrentModule("postpulse")}
          >
            📈 Analyze Posts (PostPulse)
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
            onClick={() => setCurrentModule("scheduler")}
          >
            📅 Schedule Content
          </motion.button>
        </div>
      </Card>
    </motion.div>
  );
};