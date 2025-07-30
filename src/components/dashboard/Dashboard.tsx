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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header Skeleton */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 text-white">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-48 h-10 bg-white bg-opacity-20 rounded-lg animate-pulse mb-2"></div>
                <div className="w-64 h-6 bg-white bg-opacity-15 rounded-lg animate-pulse"></div>
              </div>
              <div className="flex space-x-3">
                <div className="w-20 h-8 bg-white bg-opacity-20 rounded-lg animate-pulse"></div>
                <div className="w-20 h-8 bg-white bg-opacity-20 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Evaluation Skeleton */}
        <Card variant="glass" className="p-6 bg-gradient-to-br from-white via-blue-50 to-purple-50 border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse"></div>
              <div>
                <div className="w-40 h-6 bg-gray-200 rounded-lg animate-pulse mb-1"></div>
                <div className="w-32 h-4 bg-gray-100 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="w-16 h-12 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
              <div className="w-20 h-6 bg-gray-100 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div>
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="w-16 h-3 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-gray-200 h-2 rounded-full animate-pulse" style={{width: `${Math.random() * 100}%`}}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* KPIs and Trends Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* KPIs Skeleton */}
          <Card variant="glass" className="p-6 bg-gradient-to-br from-white to-blue-50 border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <div className="w-32 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="w-8 h-5 bg-gray-100 rounded-full animate-pulse"></div>
                  </div>
                  <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="w-20 h-4 bg-gray-100 rounded animate-pulse mb-2"></div>
                  <div className="h-1 bg-gray-100 rounded-full">
                    <div className="bg-gray-200 h-1 rounded-full animate-pulse" style={{width: `${Math.random() * 80 + 20}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Trends Skeleton */}
          <Card variant="glass" className="p-6 bg-gradient-to-br from-white via-purple-50 to-pink-50 border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse"></div>
                <div>
                  <div className="w-28 h-6 bg-gray-200 rounded-lg animate-pulse mb-1"></div>
                  <div className="w-24 h-4 bg-gray-100 rounded-lg animate-pulse"></div>
                </div>
              </div>
              <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div>
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                        <div className="w-24 h-3 bg-gray-100 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-8 h-6 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="w-16 h-3 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions Skeleton */}
        <Card variant="glass" className="p-6 bg-gradient-to-br from-white via-gray-50 to-blue-50 border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse"></div>
              <div>
                <div className="w-32 h-6 bg-gray-200 rounded-lg animate-pulse mb-1"></div>
                <div className="w-28 h-4 bg-gray-100 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="p-4 bg-gray-200 rounded-xl animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                  <div>
                    <div className="w-24 h-4 bg-gray-300 rounded mb-1"></div>
                    <div className="w-32 h-3 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Loading message */}
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading LinkedIn analytics...</p>
          <p className="text-sm text-gray-500">This may take a moment for larger accounts</p>
        </div>
      </motion.div>
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
      {/* Header with Modern Gradient Background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100"
              >
                Dashboard
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-blue-100 text-lg"
              >
                LinkedIn profile evaluation and key metrics
              </motion.p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDebugMode(!debugMode)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border-opacity-30"
              >
                <Database size={14} className="mr-2" />
                {debugMode ? "Hide" : "Show"} Debug
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefetch}
                disabled={isRefetching}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border-opacity-30"
              >
                <RefreshCw size={14} className={`mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                {isRefetching ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white to-transparent opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400 to-transparent opacity-20 rounded-full translate-y-24 -translate-x-24"></div>
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
      <Card variant="glass" className="p-6 bg-gradient-to-br from-white via-gray-50 to-blue-50 border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Jump to key features</p>
            </div>
          </div>
          <div className="w-2 h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            onClick={() => setCurrentModule("analytics")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <div className="text-left">
                <div className="font-semibold">View Analytics</div>
                <div className="text-xs text-indigo-100">Detailed insights & trends</div>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            onClick={() => setCurrentModule("postgen")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-lg">✍️</span>
              </div>
              <div className="text-left">
                <div className="font-semibold">Generate Post</div>
                <div className="text-xs text-purple-100">AI-powered content creation</div>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            onClick={() => setCurrentModule("postpulse")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-lg">📈</span>
              </div>
              <div className="text-left">
                <div className="font-semibold">PostPulse</div>
                <div className="text-xs text-green-100">Analyze past posts</div>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            onClick={() => setCurrentModule("scheduler")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-lg">📅</span>
              </div>
              <div className="text-left">
                <div className="font-semibold">Schedule</div>
                <div className="text-xs text-blue-100">Content calendar</div>
              </div>
            </div>
          </motion.button>
        </div>
      </Card>
    </motion.div>
  );
};