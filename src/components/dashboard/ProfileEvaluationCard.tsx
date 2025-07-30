import { motion } from 'framer-motion';
import { Info, TrendingUp, TrendingDown, Minus, Sparkles, BarChart3, Users, Target } from 'lucide-react';
import { Card } from '../ui/Card';
import { ProfileScore } from '../../hooks/useDashboardData';
import { useAppStore } from '../../stores/appStore';

interface ProfileEvaluationCardProps {
  scores: ProfileScore;
  overallScore: number;
  explanations: Record<string, string>;
}

export const ProfileEvaluationCard = ({ 
  scores, 
  overallScore, 
  explanations 
}: ProfileEvaluationCardProps) => {
  const { setCurrentModule } = useAppStore();

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-600 bg-emerald-50 border-emerald-200 shadow-emerald-100';
    if (score >= 5) return 'text-amber-600 bg-amber-50 border-amber-200 shadow-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-200 shadow-rose-100';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 8) return 'from-emerald-500 to-teal-600';
    if (score >= 5) return 'from-amber-500 to-orange-600';
    return 'from-rose-500 to-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <TrendingUp size={16} className="text-emerald-600" />;
    if (score >= 5) return <Minus size={16} className="text-amber-600" />;
    return <TrendingDown size={16} className="text-rose-600" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 5) return 'Good';
    return 'Needs Work';
  };

  const getCategoryIcon = (key: string) => {
    const icons = {
      profileCompleteness: Users,
      postingActivity: BarChart3,
      engagementQuality: Sparkles,
      networkGrowth: TrendingUp,
      audienceRelevance: Target,
      contentDiversity: Sparkles,
      engagementRate: BarChart3,
      mutualInteractions: Users,
      profileVisibility: TrendingUp,
      professionalBrand: Target
    };
    const IconComponent = icons[key as keyof typeof icons] || BarChart3;
    return <IconComponent size={18} />;
  };

  const scoreItems = [
    { key: 'profileCompleteness', label: 'Profile Completeness', score: scores.profileCompleteness },
    { key: 'postingActivity', label: 'Posting Activity', score: scores.postingActivity },
    { key: 'engagementQuality', label: 'Engagement Quality', score: scores.engagementQuality },
    { key: 'networkGrowth', label: 'Network Growth', score: scores.networkGrowth },
    { key: 'audienceRelevance', label: 'Audience Relevance', score: scores.audienceRelevance },
    { key: 'contentDiversity', label: 'Content Diversity', score: scores.contentDiversity },
    { key: 'engagementRate', label: 'Engagement Rate', score: scores.engagementRate },
    { key: 'mutualInteractions', label: 'Mutual Interactions', score: scores.mutualInteractions },
    { key: 'profileVisibility', label: 'Profile Visibility', score: scores.profileVisibility },
    { key: 'professionalBrand', label: 'Professional Brand', score: scores.professionalBrand },
  ];

  return (
    <Card 
      variant="glass" 
      className="p-8 cursor-pointer hover:shadow-xl transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-white/90 to-blue-50/30 backdrop-blur-xl border-white/20"
      onClick={() => setCurrentModule('analytics')}
    >
      {/* Header with animated overall score */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
            <BarChart3 size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Profile Evaluation</h3>
            <p className="text-sm text-gray-600">LinkedIn optimization score</p>
          </div>
        </div>
        
        {/* Animated overall score circle */}
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative"
          >
            {/* Background circle */}
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              {/* Progress ring */}
              <svg className="w-20 h-20 absolute inset-0 -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-gray-200"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  className={`${overallScore >= 8 ? 'text-emerald-500' : overallScore >= 5 ? 'text-amber-500' : 'text-rose-500'}`}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: overallScore / 10 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  style={{
                    strokeDasharray: "220",
                    strokeDashoffset: "220"
                  }}
                />
              </svg>
              
              {/* Score text */}
              <div className="text-center z-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`text-2xl font-bold ${
                    overallScore >= 8 ? 'text-emerald-600' : 
                    overallScore >= 5 ? 'text-amber-600' : 
                    'text-rose-600'
                  }`}
                >
                  {overallScore}
                </motion.div>
                <div className="text-xs text-gray-500 font-medium">out of 10</div>
              </div>
            </div>
          </motion.div>
          
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-full text-xs font-semibold ${
              overallScore >= 8 ? 'bg-emerald-100 text-emerald-700' : 
              overallScore >= 5 ? 'bg-amber-100 text-amber-700' : 
              'bg-rose-100 text-rose-700'
            }`}
          >
            {getScoreLabel(overallScore)}
          </motion.div>
        </div>
      </div>

      {/* Score breakdown grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scoreItems.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            className="group relative"
          >
            <div className={`relative overflow-hidden rounded-xl border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm ${getScoreColor(item.score)}`}>
              {/* Gradient background overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r opacity-5 ${getScoreGradient(item.score)}`} />
              
              <div className="relative p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Category icon */}
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${getScoreGradient(item.score)} text-white shadow-lg`}>
                      {getCategoryIcon(item.key)}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{item.label}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getScoreIcon(item.score)}
                        <p className="text-xs font-medium text-gray-600">{getScoreLabel(item.score)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Score display */}
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                        className={`text-2xl font-bold ${getScoreColor(item.score).split(' ')[0]}`}
                      >
                        {item.score}
                      </motion.div>
                      <div className="text-xs text-gray-500 font-medium">/ 10</div>
                    </div>
                    
                    {/* Info tooltip */}
                    <div className="relative">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Info size={16} className="text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                      </motion.div>
                      <div className="absolute bottom-full right-0 mb-2 w-80 p-4 bg-gray-900/95 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none shadow-2xl backdrop-blur-sm border border-gray-700">
                        <div className="font-semibold mb-1">{item.label}</div>
                        <div className="text-gray-300">{explanations[item.key]}</div>
                        {/* Tooltip arrow */}
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.score / 10) * 100}%` }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.8, ease: "easeOut" }}
                      className={`h-full bg-gradient-to-r ${getScoreGradient(item.score)} rounded-full shadow-sm`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-8"
      >
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-700/20" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3Ccircle cx="37" cy="37" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg">Boost Your LinkedIn Performance</h4>
                <p className="text-blue-100 text-sm">
                  Get detailed insights and personalized recommendations
                </p>
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all cursor-pointer"
            >
              <span className="font-medium">View Analytics</span>
              <TrendingUp size={16} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Card>
  );
};