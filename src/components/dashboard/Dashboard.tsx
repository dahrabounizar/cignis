import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Zap, RefreshCw, Database, Target, Users, Activity, BarChart3 } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { useAuthStore } from "../../stores/authStore";
import { useDashboardData } from "../../hooks/useDashboardData";
import { MetricCard } from "./MetricCard";
import { ActivityOverview } from "./ActivityOverview";
import { ProfileProgress } from "./ProfileProgress";
import { PerformanceTrends } from "./PerformanceTrends";
import { useAppStore } from "../../stores/appStore";

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
      {/* Header with Debug Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-gray-600 mt-1">LinkedIn profile evaluation and key metrics</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDebugMode(!debugMode)}
          >
            <Database size={14} className="mr-1" />
            {debugMode ? "Hide" : "Show"} Debug
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefetch}
            disabled={isRefetching}
          >
            <RefreshCw size={14} className={`mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

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

      {/* Main Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Profile Strength"
          value={`${dashboardData.profileEvaluation.overallScore * 10}%`}
          subtitle="Overall profile quality"
          changeText="0 new this month"
          icon={Target}
          borderColor="border-blue-500"
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <MetricCard
          title="Network Quality"
          value={`${Math.min(10, Math.floor(dashboardData.summaryKPIs.totalConnections / 100))}/10`}
          subtitle="Connection strength"
          changeText="0 new this month"
          icon={Users}
          borderColor="border-green-500"
          iconColor="text-green-600"
          bgColor="bg-green-50"
        />
        <MetricCard
          title="Social Activity"
          value="0/10"
          subtitle="Engagement level"
          changeText="0 interactions"
          icon={Activity}
          borderColor="border-purple-500"
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
        />
        <MetricCard
          title="Content Performance"
          value="0/10"
          subtitle="Post effectiveness"
          changeText="0 posts published"
          icon={BarChart3}
          borderColor="border-orange-500"
          iconColor="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Activity Overview and Profile Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityOverview
            postsCreated={dashboardData.summaryKPIs.postsLast30Days}
            commentsGiven={0}
            likesGiven={0}
            totalPosts={dashboardData.summaryKPIs.postsLast30Days}
          />
        </div>
        <div>
          <ProfileProgress
            percentage={dashboardData.profileEvaluation.overallScore * 10}
          />
        </div>
      </div>

      {/* Performance Trends */}
      <PerformanceTrends
        data={dashboardData.miniTrends.posts.map((post, index) => ({
          date: `Day ${index + 1}`,
          value: post.value
        }))}
        change={5.2}
      />

      {/* Quick Actions */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Zap className="mr-2" size={20} />
            Quick Actions
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all"
            onClick={() => setCurrentModule("analytics")}
          >
            📊 View Detailed Analytics
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            onClick={() => setCurrentModule("postgen")}
          >
            ✍️ Generate New Post
          </motion.button>
        </div>
      </Card>
    </motion.div>
  );
};