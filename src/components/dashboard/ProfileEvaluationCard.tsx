import { motion } from 'framer-motion';
import { Info, TrendingUp, TrendingDown, Minus, User, Award, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { ProfileScore } from '../../hooks/useDashboardData';
import { useAppStore } from '../../stores/appStore';
import { useState } from 'react';

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
  const [selectedScore, setSelectedScore] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-gradient-to-r from-green-50 to-green-100 border-green-200';
    if (score >= 5) return 'text-amber-600 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
    return 'text-red-600 bg-gradient-to-r from-red-50 to-red-100 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <TrendingUp size={16} className="text-green-600" />;
    if (score >= 5) return <Minus size={16} className="text-amber-600" />;
    return <TrendingDown size={16} className="text-red-600" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 5) return 'Good';
    return 'Needs Work';
  };

  const getOverallScoreColor = (score: number) => {
    if (score >= 8) return 'from-green-500 to-emerald-500';
    if (score >= 5) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
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
    <Card variant="glass" className="p-6 bg-gradient-to-br from-white to-gray-50 border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
            <User className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Profile Evaluation</h3>
            <p className="text-gray-600">Comprehensive analysis of your LinkedIn presence</p>
          </div>
        </div>

        {/* Overall Score Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="text-center"
        >
          <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${getOverallScoreColor(overallScore)} flex items-center justify-center shadow-lg`}>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{overallScore}</div>
              <div className="text-xs text-white/80">/ 10</div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-center gap-1">
            <Award size={14} className="text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Overall Score</span>
          </div>
        </motion.div>
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {scoreItems.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${getScoreColor(item.score)} ${
              selectedScore === item.key ? 'ring-2 ring-indigo-300 scale-105' : ''
            }`}
            onClick={() => setSelectedScore(selectedScore === item.key ? null : item.key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getScoreIcon(item.score)}
                <span className="font-semibold text-sm">{getScoreLabel(item.score)}</span>
              </div>
              <div className="text-lg font-bold">
                {item.score}/10
              </div>
            </div>
            
            <div className="text-sm font-medium mb-2">
              {item.label}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/50 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.score / 10) * 100}%` }}
                transition={{ delay: index * 0.05 + 0.2, duration: 0.8 }}
                className={`h-2 rounded-full bg-gradient-to-r ${
                  item.score >= 8 ? 'from-green-400 to-green-600' :
                  item.score >= 5 ? 'from-amber-400 to-amber-600' :
                  'from-red-400 to-red-600'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Explanation Panel */}
      {selectedScore && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                {scoreItems.find(item => item.key === selectedScore)?.label}
              </h4>
              <p className="text-blue-700 text-sm leading-relaxed">
                {explanations[selectedScore]}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
          onClick={() => setCurrentModule('analytics')}
        >
          <Sparkles size={18} />
          View Detailed Analytics
        </motion.button>
        <p className="text-sm text-gray-600 mt-2">
          Get comprehensive insights and improvement recommendations
        </p>
      </motion.div>
    </Card>
  );
};