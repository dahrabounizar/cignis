import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Zap, RefreshCw, Database, TrendingUp, BarChart3, Users, Activity } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { DashboardSkeleton } from "../ui/SkeletonLoader";
import { useAuthStore } from "../../stores/authStore";
import { useDashboardData } from "../../hooks/useDashboardData";
import { ProfileEvaluationCard } from "./ProfileEvaluationCard";
import { SummaryKPIsCard } from "./SummaryKPIsCard";
import { MiniTrendsCard } from "./MiniTrendsCard";
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
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      >
        <div className="flex items-center justify-center min-h-screen p-6">
          <Card variant="glass" className="max-w-md w-full p-8 text-center bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center">
              <AlertCircle size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Limited Access Mode
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              DMA token is missing. You need to complete the DMA authentication flow to access dashboard features.
            </p>
            <Button
              variant="primary"
              onClick={() => (window.location.href = "/")}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              Complete DMA Authentication
            </Button>
          </Card>
        </div>
      </motion.div>
    );
  }

  if (isLoading || !dashboardData) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-100">
        <div className="flex items-center justify-center min-h-screen p-6">
          <Card variant="glass" className="max-w-lg w-full p-8 text-center bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center">
              <AlertCircle size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Error Loading Dashboard
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {error.message || "Failed to load dashboard data"}
            </p>
            <div className="space-y-4">
              <Button 
                variant="primary" 
                onClick={handleRefetch} 
                disabled={isRefetching}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <RefreshCw size={16} className="mr-2" />
                {isRefetching ? "Refreshing..." : "Try Again"}
              </Button>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDebugMode(!debugMode)}
                  className="flex-1"
                >
                  {debugMode ? "Hide" : "Show"} Debug Info
                </Button>
                <Button
                  variant="ghost"
                  onClick={testDataFlow}
                  className="flex-1"
                >
                  Test Data Flow
                </Button>
              </div>
            </div>
            {debugMode && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-6 p-4 bg-gray-100/80 backdrop-blur rounded-xl text-left border border-gray-200/50"
              >
                <h3 className="font-semibold mb-2 text-gray-800">Debug Information:</h3>
                <pre className="text-xs overflow-auto text-gray-700 bg-white/50 p-3 rounded-lg">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </motion.div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-6 py-8 space-y-8"
      >
        {/* Modern Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 text-lg">LinkedIn profile evaluation and key metrics</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDebugMode(!debugMode)}
              className="bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80"
            >
              <Database size={14} className="mr-2" />
              {debugMode ? "Hide" : "Show"} Debug
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefetch}
              disabled={isRefetching}
              className="bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80"
            >
              <RefreshCw size={14} className={`mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              {isRefetching ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Debug Panel */}
        {debugMode && dashboardData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="glass" className="p-6 bg-blue-50/80 backdrop-blur-xl border border-blue-200/50 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center text-blue-900">
                  <Database size={20} className="mr-3" />
                  Debug Information
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDebugMode(false)}
                  className="text-blue-700 hover:bg-blue-100/50"
                >
                  Hide
                </Button>
              </div>
              <div className="text-sm space-y-4 text-blue-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div><strong>Last Updated:</strong> {dashboardData.lastUpdated}</div>
                    <div><strong>DMA Token:</strong> {dmaToken ? 'Present' : 'Missing'}</div>
                  </div>
                  <div className="space-y-2">
                    <div><strong>Profile Score:</strong> {dashboardData.profileEvaluation.overallScore}/10</div>
                    <div><strong>Total Connections:</strong> {dashboardData.summaryKPIs.totalConnections}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={testDataFlow}
                  className="bg-blue-100/50 hover:bg-blue-200/50 text-blue-800"
                >
                  Test Data Flow
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass" className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Connections</p>
                  <p className="text-3xl font-bold mt-1">{dashboardData.summaryKPIs.totalConnections.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users size={24} />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass" className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Posts (30 days)</p>
                  <p className="text-3xl font-bold mt-1">{dashboardData.summaryKPIs.postsLast30Days}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <BarChart3 size={24} />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="glass" className="p-6 bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Engagement Rate</p>
                  <p className="text-3xl font-bold mt-1">{dashboardData.summaryKPIs.engagementRate}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <TrendingUp size={24} />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="glass" className="p-6 bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">New Connections</p>
                  <p className="text-3xl font-bold mt-1">{dashboardData.summaryKPIs.connectionsLast30Days}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Activity size={24} />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Profile Evaluation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ProfileEvaluationCard
            scores={dashboardData.profileEvaluation.scores}
            overallScore={dashboardData.profileEvaluation.overallScore}
            explanations={dashboardData.profileEvaluation.explanations}
          />
        </motion.div>

        {/* Summary KPIs and Mini Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <SummaryKPIsCard kpis={dashboardData.summaryKPIs} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <MiniTrendsCard trends={dashboardData.miniTrends} />
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card variant="glass" className="p-8 bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold flex items-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                <Zap className="mr-3 text-yellow-500" size={28} />
                Quick Actions
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                onClick={() => setCurrentModule("analytics")}
              >
                <div className="text-left">
                  <div className="text-2xl mb-2">📊</div>
                  <h4 className="font-semibold text-lg mb-1">View Detailed Analytics</h4>
                  <p className="text-indigo-100 text-sm">Deep dive into your performance metrics</p>
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                onClick={() => setCurrentModule("postgen")}
              >
                <div className="text-left">
                  <div className="text-2xl mb-2">✍️</div>
                  <h4 className="font-semibold text-lg mb-1">Generate New Post</h4>
                  <p className="text-purple-100 text-sm">Create engaging content with AI</p>
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                onClick={() => setCurrentModule("postpulse")}
              >
                <div className="text-left">
                  <div className="text-2xl mb-2">📈</div>
                  <h4 className="font-semibold text-lg mb-1">Analyze Posts (PostPulse)</h4>
                  <p className="text-green-100 text-sm">Track post performance and engagement</p>
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
                onClick={() => setCurrentModule("scheduler")}
              >
                <div className="text-left">
                  <div className="text-2xl mb-2">📅</div>
                  <h4 className="font-semibold text-lg mb-1">Schedule Content</h4>
                  <p className="text-blue-100 text-sm">Plan and automate your posting schedule</p>
                </div>
              </motion.button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};