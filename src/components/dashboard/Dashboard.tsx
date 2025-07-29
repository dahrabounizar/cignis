import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Zap, RefreshCw, Database } from "lucide-react";
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

      {/* Profile Evaluation */}
      <ProfileEvaluationCard
        scores={dashboardData.profileEvaluation.scores}
        overallScore={dashboardData.profileEvaluation.overallScore}
        explanations={dashboardData.profileEvaluation.explanations}
      />

      {/* Summary KPIs and Mini Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SummaryKPIsCard kpis={dashboardData.summaryKPIs} />
        <MiniTrendsCard trends={dashboardData.miniTrends} />
      </div>

      {/* Quick Actions */}
      <Card variant="premium" className="p-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-2xl transform -translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tl from-pink-200/20 to-purple-200/20 rounded-full blur-3xl transform translate-x-14 translate-y-14"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
              <p className="text-gray-600 text-sm">Boost your LinkedIn presence</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative p-6 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-sm border border-indigo-200/30 rounded-2xl hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
              onClick={() => setCurrentModule("analytics")}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-200/30 to-purple-200/30 rounded-full blur-xl transform translate-x-8 -translate-y-8"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">Detailed Analytics</h4>
                    <p className="text-sm text-gray-600">Comprehensive insights</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Dive deep into your performance metrics, audience insights, and growth patterns with advanced analytics.
                </p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative p-6 bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm border border-purple-200/30 rounded-2xl hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
              onClick={() => setCurrentModule("postgen")}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-200/30 to-pink-200/30 rounded-full blur-xl transform translate-x-8 -translate-y-8"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <span className="text-2xl">✍️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">Generate New Post</h4>
                    <p className="text-sm text-gray-600">AI-powered content</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Create engaging LinkedIn posts with AI assistance tailored to your audience and industry.
                </p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative p-6 bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm border border-green-200/30 rounded-2xl hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
              onClick={() => setCurrentModule("postpulse")}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-200/30 to-emerald-200/30 rounded-full blur-xl transform translate-x-8 -translate-y-8"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">Analyze Posts</h4>
                    <p className="text-sm text-gray-600">PostPulse insights</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Get detailed analysis of your post performance and discover what resonates with your audience.
                </p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative p-6 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm border border-blue-200/30 rounded-2xl hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
              onClick={() => setCurrentModule("scheduler")}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-200/30 to-cyan-200/30 rounded-full blur-xl transform translate-x-8 -translate-y-8"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">Schedule Content</h4>
                    <p className="text-sm text-gray-600">Optimize timing</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Plan and schedule your LinkedIn content for maximum reach and engagement.
                </p>
              </div>
            </motion.button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};