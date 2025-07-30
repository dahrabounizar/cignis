import { motion } from 'framer-motion';
import { Info, TrendingUp, TrendingDown, Minus, Star, Award, Target } from 'lucide-react';
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
    if (score >= 8) return {
      gradient: 'from-green-500 to-emerald-500',
      bg: 'from-green-50 to-emerald-50',
      text: 'text-green-700',
      border: 'border-green-200'
    };
    if (score >= 5) return {
      gradient: 'from-yellow-500 to-orange-500',
      bg: 'from-yellow-50 to-orange-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200'
    };
    return {
      gradient: 'from-red-500 to-pink-500',
      bg: 'from-red-50 to-pink-50',
      text: 'text-red-700',
      border: 'border-red-200'
    };
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <TrendingUp size={16} className="text-green-600" />;
    if (score >= 5) return <Minus size={16} className="text-yellow-600" />;
    return <TrendingDown size={16} className="text-red-600" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 5) return 'Good';
    return 'Needs Work';
  };

  const getOverallGrade = (score: number) => {
    if (score >= 9) return { grade: 'A+', color: 'from-green-500 to-emerald-600' };
    if (score >= 8) return { grade: 'A', color: 'from-green-500 to-emerald-600' };
    if (score >= 7) return { grade: 'B+', color: 'from-blue-500 to-cyan-600' };
    if (score >= 6) return { grade: 'B', color: 'from-blue-500 to-cyan-600' };
    if (score >= 5) return { grade: 'C+', color: 'from-yellow-500 to-orange-600' };
    if (score >= 4) return { grade: 'C', color: 'from-yellow-500 to-orange-600' };
    return { grade: 'D', color: 'from-red-500 to-pink-600' };
  };

  const scoreItems = [
    { key: 'profileCompleteness', label: 'Profile Completeness', score: scores.profileCompleteness, icon: '👤' },
    { key: 'postingActivity', label: 'Posting Activity', score: scores.postingActivity, icon: '📝' },
    { key: 'engagementQuality', label: 'Engagement Quality', score: scores.engagementQuality, icon: '💬' },
    { key: 'networkGrowth', label: 'Network Growth', score: scores.networkGrowth, icon: '🌱' },
    { key: 'audienceRelevance', label: 'Audience Relevance', score: scores.audienceRelevance, icon: '🎯' },
    { key: 'contentDiversity', label: 'Content Diversity', score: scores.contentDiversity, icon: '🎨' },
    { key: 'engagementRate', label: 'Engagement Rate', score: scores.engagementRate, icon: '📊' },
    { key: 'mutualInteractions', label: 'Mutual Interactions', score: scores.mutualInteractions, icon: '🤝' },
    { key: 'profileVisibility', label: 'Profile Visibility', score: scores.profileVisibility, icon: '👁️' },
    { key: 'professionalBrand', label: 'Professional Brand', score: scores.professionalBrand, icon: '🏆' },
  ];

  const overallGrade = getOverallGrade(overallScore);

  return (
    <Card variant="glass" className="p-8 bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${overallGrade.color} rounded-2xl flex items-center justify-center shadow-lg`}>
            <Award size={32} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Profile Evaluation
            </h3>
            <p className="text-gray-600">Comprehensive LinkedIn profile analysis</p>
          </div>
        </div>
        
        {/* Overall Score Display */}
        <div className="text-center">
          <div className={`w-20 h-20 bg-gradient-to-br ${overallGrade.color} rounded-2xl flex flex-col items-center justify-center shadow-lg mb-2`}>
            <div className="text-2xl font-bold text-white">{overallGrade.grade}</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{overallScore.toFixed(1)}/10</div>
          <div className="text-sm text-gray-600">Overall Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {scoreItems.map((item, index) => {
          const colors = getScoreColor(item.score);
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`p-4 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{item.label}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      {getScoreIcon(item.score)}
                      <span className={`text-xs font-medium ${colors.text}`}>
                        {getScoreLabel(item.score)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{item.score.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">/ 10</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.score / 10) * 100}%` }}
                  transition={{ delay: index * 0.05 + 0.2, duration: 0.8 }}
                  className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Improvement Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-100/50"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Target size={20} className="text-white" />
          </div>
          <h4 className="font-semibold text-gray-900">Quick Improvements</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scoreItems
            .filter(item => item.score < 7)
            .slice(0, 3)
            .map((item, index) => (
              <div key={item.key} className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-gray-700">Improve {item.label}</span>
              </div>
            ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-blue-200/50">
          <button
            onClick={() => setCurrentModule('analytics')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
          >
            View detailed recommendations →
          </button>
        </div>
      </motion.div>
    </Card>
  );
};