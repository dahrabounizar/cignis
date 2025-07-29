import { motion } from 'framer-motion';
import { Info, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
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
    if (score >= 8) return 'text-emerald-600 bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200/60';
    if (score >= 5) return 'text-amber-600 bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200/60';
    return 'text-rose-600 bg-gradient-to-br from-rose-50 to-red-100 border-rose-200/60';
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

  const getOverallScoreGradient = (score: number) => {
    if (score >= 8) return 'bg-gradient-to-r from-emerald-500 to-green-600';
    if (score >= 5) return 'bg-gradient-to-r from-amber-500 to-yellow-600';
    return 'bg-gradient-to-r from-rose-500 to-red-600';
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
      variant="premium" 
      className="p-8 cursor-pointer group relative overflow-hidden"
      hover={true}
      onClick={() => setCurrentModule('analytics')}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl transform translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/20 to-pink-200/20 rounded-full blur-2xl transform -translate-x-12 translate-y-12"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Profile Evaluation</h3>
              <p className="text-gray-600 text-sm">Comprehensive LinkedIn analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`text-5xl font-bold bg-gradient-to-r ${
              overallScore >= 8 ? 'from-emerald-600 to-green-600' : 
              overallScore >= 5 ? 'from-amber-600 to-yellow-600' : 
              'from-rose-600 to-red-600'
            } bg-clip-text text-transparent`}>
              {overallScore}
            </div>
            <div className="text-right">
              <div className="text-lg text-gray-400 font-medium">/10</div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                overallScore >= 8 ? 'bg-emerald-100 text-emerald-700' : 
                overallScore >= 5 ? 'bg-amber-100 text-amber-700' : 
                'bg-rose-100 text-rose-700'
              }`}>
                {getScoreLabel(overallScore)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scoreItems.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="group/item relative"
            >
              <div className={`flex items-center justify-between p-4 rounded-2xl border-2 hover:shadow-lg transition-all duration-300 backdrop-blur-sm ${getScoreColor(item.score)}`}>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl bg-white/80 shadow-sm ${getScoreColor(item.score).split(' ')[0]}`}>
                    {getScoreIcon(item.score)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                    <p className="text-xs text-gray-600 font-medium">{getScoreLabel(item.score)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-2xl font-bold ${getScoreColor(item.score).split(' ')[0]}`}>
                    {item.score}
                  </span>
                  <div className="relative">
                    <Info size={16} className="text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                    <div className="absolute bottom-full right-0 mb-3 w-80 p-4 bg-gray-900/95 backdrop-blur-xl text-white text-sm rounded-2xl opacity-0 group-hover/item:opacity-100 transition-all duration-300 z-20 pointer-events-none shadow-2xl border border-white/10">
                      <div className="font-semibold mb-2">{item.label}</div>
                      {explanations[item.key]}
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl border border-blue-200/30"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <TrendingUp size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Click to view detailed analytics
              </p>
              <p className="text-xs text-blue-700">
                Get personalized insights and improvement recommendations
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Card>
  );
};