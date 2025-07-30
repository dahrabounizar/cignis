import { motion } from 'framer-motion';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
    if (score >= 8) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 5) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <TrendingUp size={16} />;
    if (score >= 5) return <Minus size={16} />;
    return <TrendingDown size={16} />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 5) return 'Good';
    return 'Needs Work';
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
      className="p-6 cursor-pointer hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white via-blue-50 to-purple-50 border-blue-100"
      onClick={() => setCurrentModule('analytics')}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Profile Evaluation</h3>
            <p className="text-sm text-gray-600">Click for detailed analytics</p>
          </div>
        </div>
        <div className="text-right">
          <div className="relative">
            <div className={`text-4xl font-bold ${
              overallScore >= 8 ? 'text-green-600' : 
              overallScore >= 5 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {overallScore}
            </div>
            <div className="text-lg text-gray-400 absolute -top-1 -right-6">/10</div>
          </div>
          <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
            overallScore >= 8 ? 'bg-green-100 text-green-700' : 
            overallScore >= 5 ? 'bg-yellow-100 text-yellow-700' : 
            'bg-red-100 text-red-700'
          }`}>
            {getScoreLabel(overallScore)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {scoreItems.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="group relative"
          >
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getScoreColor(item.score).split(' ')[1]} ${getScoreColor(item.score).split(' ')[2]}`}>
                    {getScoreIcon(item.score)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                    <p className={`text-xs font-medium ${getScoreColor(item.score).split(' ')[0]}`}>
                      {getScoreLabel(item.score)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl font-bold ${getScoreColor(item.score).split(' ')[0]}`}>
                    {item.score}
                  </span>
                  <div className="relative">
                    <Info size={14} className="text-gray-400 cursor-help hover:text-blue-500 transition-colors" />
                    <div className="absolute bottom-full right-0 mb-2 w-80 p-4 bg-gray-900 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none shadow-xl border border-gray-700">
                      <div className="font-medium mb-1">{item.label}</div>
                      <div className="text-gray-300">{explanations[item.key]}</div>
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className={`h-full bg-gradient-to-r ${
                    item.score >= 8 ? 'from-green-400 to-green-600' : 
                    item.score >= 5 ? 'from-yellow-400 to-yellow-600' : 
                    'from-red-400 to-red-600'
                  } rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.score / 10) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Ready to improve your LinkedIn presence?
              </p>
              <p className="text-xs text-blue-700">
                Click anywhere to view detailed analytics and actionable insights
              </p>
            </div>
          </div>
          <div className="text-blue-500">
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              →
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Card>
  );
};