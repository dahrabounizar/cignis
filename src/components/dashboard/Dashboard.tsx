import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Zap, RefreshCw, Database, Sparkles, Activity } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
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
        className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 p-8"
      >
        <div className="max-w-2xl mx-auto">
          <Card variant="modern" className="p-12 text-center">
            <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <AlertCircle size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">Limited Access Mode</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              DMA token is missing. You need to complete the DMA authentication flow to access dashboard features.
            </p>
            <Button
              variant="primary"
              onClick={() => (window.location.href = "/")}
              className="px-8 py-3 text-lg"
            >
              Complete DMA Authentication
            </Button>
          </Card>
        </div>
      </motion.div>
    );
  }

  if (isLoading || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6 inline-block">
            <Activity size={48} className="text-white animate-pulse" />
          </div>
          <LoadingSpinner size="lg" />
          <h3 className="mt-6 text-2xl font-bold text-gray-900">Loading LinkedIn Analytics</h3>
          <p className="mt-2 text-gray-600 text-lg">Analyzing your profile and engagement data...</p>
          <p className="text-sm text-gray-500 mt-1">This may take a moment for larger accounts</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-rose-50/20 p-8">
        <div className="max-w-2xl mx-auto">
          <Card variant="modern" className="p-12 text-center">
            <div className="p-4 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <AlertCircle size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Error Loading Dashboard
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              {error.message || "Failed to load dashboard data"}
            </p>
            <div className="space-y-4">
              <Button variant="primary" onClick={handleRefetch} disabled={isRefetching} className="px-8 py-3">
                <RefreshCw size={18} className="mr-2" />
                {isRefetching ? "Refreshing..." : "Try Again"}
              </Button>
              <div className="flex space-x-4 justify-center">
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
            </div>
            {debugMode && (
              <div className="mt-8 p-6 bg-gray-100 rounded-2xl text-left">
                <h3 className="font-semibold mb-4 text-lg">Debug Information:</h3>
                <pre className="text-xs overflow-auto text-gray-700">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-8 space-y-8"
      >
        {/* Header with Enhanced Styling */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center space-x-4"
          >
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Sparkles size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 text-lg font-medium">LinkedIn profile evaluation and key metrics</p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex space-x-3"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDebugMode(!debugMode)}
              className="bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80"
            >
              <Database size={16} className="mr-2" />
              {debugMode ? "Hide" : "Show"} Debug
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefetch}
              disabled={isRefetching}
              className="bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80"
            >
              <RefreshCw size={16} className={`mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              {isRefetching ? "Refreshing..." : "Refresh"}
            </Button>
          </motion.div>
        </div>

        {/* Debug Panel with Modern Styling */}
        {debugMode && dashboardData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="modern" className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 border-2 border-blue-200/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                    <Database size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Debug Information
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDebugMode(false)}
                  className="hover:bg-white/60"
                >
                  Hide
                </Button>
              </div>
              <div className="text-sm space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                    <div className="font-semibold text-gray-900 mb-2">System Status</div>
                    <div>Last Updated: <span className="font-mono text-blue-600">{dashboardData.lastUpdated}</span></div>
                    <div>DMA Token: <span className={`font-mono ${dmaToken ? 'text-green-600' : 'text-red-600'}`}>{dmaToken ? 'Present' : 'Missing'}</span></div>
                  </div>
                  <div className="p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                    <div className="font-semibold text-gray-900 mb-2">Profile Evaluation</div>
                    <div>Overall Score: <span className="font-mono text-indigo-600">{dashboardData.profileEvaluation.overallScore}/10</span></div>
                    <div>Scores: <span className="font-mono text-gray-600">{Object.values(dashboardData.profileEvaluation.scores).join(', ')}</span></div>
                  </div>
                  <div className="p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                    <div className="font-semibold text-gray-900 mb-2">Summary KPIs</div>
                    <div>Total Connections: <span className="font-mono text-blue-600">{dashboardData.summaryKPIs.totalConnections}</span></div>
                    <div>Posts (30d): <span className="font-mono text-green-600">{dashboardData.summaryKPIs.postsLast30Days}</span></div>
                    <div>Engagement Rate: <span className="font-mono text-purple-600">{dashboardData.summaryKPIs.engagementRate}</span></div>
                    <div>New Connections: <span className="font-mono text-orange-600">{dashboardData.summaryKPIs.connectionsLast30Days}</span></div>
                  </div>
                  <div className="p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                    <div className="font-semibold text-gray-900 mb-2">Mini Trends</div>
                    <div>Posts: <span className="font-mono text-blue-600">{dashboardData.miniTrends.posts.map(p => p.value).join(', ')}</span></div>
                    <div>Engagements: <span className="font-mono text-purple-600">{dashboardData.miniTrends.engagements.map(e => e.value).join(', ')}</span></div>
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={testDataFlow}
                    className="bg-white/60 hover:bg-white/80"
                  >
                    Test Data Flow
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Profile Evaluation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ProfileEvaluationCard
            scores={dashboardData.profileEvaluation.scores}
            overallScore={dashboardData.profileEvaluation.overallScore}
            explanations={dashboardData.profileEvaluation.explanations}
          />
        </motion.div>

        {/* Summary KPIs and Mini Trends */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SummaryKPIsCard kpis={dashboardData.summaryKPIs} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MiniTrendsCard trends={dashboardData.miniTrends} />
          </motion.div>
        </div>

        {/* Quick Actions with Enhanced Modern Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card variant="modern" className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                  <Zap size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Quick Actions</h3>
                  <p className="text-gray-600 text-sm">Explore advanced features</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-600 text-white rounded-2xl hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300 text-left group"
                onClick={() => setCurrentModule("analytics")}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-3xl">📊</div>
                  <div className="text-xl font-bold">Detailed Analytics</div>
                </div>
                <p className="text-indigo-100 text-sm">Deep dive into your LinkedIn performance with comprehensive insights</p>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 bg-gradient-to-br from-purple-500 via-pink-600 to-purple-600 text-white rounded-2xl hover:shadow-xl hover:shadow-purple-200 transition-all duration-300 text-left group"
                onClick={() => setCurrentModule("postgen")}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-3xl">✍️</div>
                  <div className="text-xl font-bold">Generate New Post</div>
                </div>
                <p className="text-purple-100 text-sm">AI-powered content creation tailored to your audience</p>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-600 text-white rounded-2xl hover:shadow-xl hover:shadow-emerald-200 transition-all duration-300 text-left group"
                onClick={() => setCurrentModule("postpulse")}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-3xl">📈</div>
                  <div className="text-xl font-bold">Analyze Posts (PostPulse)</div>
                </div>
                <p className="text-emerald-100 text-sm">Comprehensive post performance analysis and optimization</p>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 bg-gradient-to-br from-orange-500 via-amber-600 to-orange-600 text-white rounded-2xl hover:shadow-xl hover:shadow-orange-200 transition-all duration-300 text-left group"
                onClick={() => setCurrentModule("scheduler")}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-3xl">📅</div>
                  <div className="text-xl font-bold">Schedule Content</div>
                </div>
                <p className="text-orange-100 text-sm">Plan and automate your LinkedIn content strategy</p>
              </motion.button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};