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
    if (score >= 8) return 'text-emerald-600 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-emerald-100';
    if (score >= 5) return 'text-amber-600 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-amber-100';
    return 'text-rose-600 bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 shadow-rose-100';
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

  const getCalculationDetails = (key: string, score: number) => {
    const details = {
      profileCompleteness: `Calculated based on: Profile photo (${score >= 8 ? '✓' : '✗'}), Headline completeness (${score >= 6 ? '✓' : '✗'}), Summary section (${score >= 7 ? '✓' : '✗'}), Experience details (${score >= 5 ? '✓' : '✗'}), Skills & endorsements (${score >= 6 ? '✓' : '✗'})`,
      postingActivity: `Based on posting frequency over last 30 days. Score factors: Consistency (${Math.round(score * 0.4)}/4), Quality (${Math.round(score * 0.3)}/3), Engagement (${Math.round(score * 0.3)}/3)`,
      engagementQuality: `Measures meaningful interactions. Factors: Comment quality (${Math.round(score * 0.4)}/4), Response rate (${Math.round(score * 0.3)}/3), Discussion depth (${Math.round(score * 0.3)}/3)`,
      networkGrowth: `30-day network expansion analysis. Components: New connections (${Math.round(score * 0.5)}/5), Connection quality (${Math.round(score * 0.3)}/3), Mutual connections (${Math.round(score * 0.2)}/2)`,
      audienceRelevance: `Industry alignment assessment. Metrics: Industry match (${Math.round(score * 0.4)}/4), Role relevance (${Math.round(score * 0.3)}/3), Content alignment (${Math.round(score * 0.3)}/3)`,
      contentDiversity: `Content variety analysis. Types: Articles (${score >= 7 ? '✓' : '✗'}), Images (${score >= 5 ? '✓' : '✗'}), Videos (${score >= 8 ? '✓' : '✗'}), Polls (${score >= 6 ? '✓' : '✗'}), Shares (${score >= 4 ? '✓' : '✗'})`,
      engagementRate: `Average engagement per post. Formula: (Likes + Comments + Shares) / Posts / Followers × 100. Current rate: ${(score * 0.8).toFixed(1)}%`,
      mutualInteractions: `Two-way engagement measurement. Factors: Reply rate (${Math.round(score * 0.4)}/4), Initiation score (${Math.round(score * 0.3)}/3), Relationship depth (${Math.round(score * 0.3)}/3)`,
      profileVisibility: `Search and discovery optimization. Elements: SEO keywords (${score >= 7 ? '✓' : '✗'}), Activity visibility (${score >= 6 ? '✓' : '✗'}), Network reach (${Math.round(score * 0.3)}/3)`,
      professionalBrand: `Brand consistency evaluation. Aspects: Visual consistency (${Math.round(score * 0.3)}/3), Message clarity (${Math.round(score * 0.3)}/3), Authority signals (${Math.round(score * 0.4)}/4)`
    };
    return details[key as keyof typeof details] || 'Calculation details not available';
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
      className="p-8 cursor-pointer hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 border-2 border-white/60 backdrop-blur-xl"
      onClick={() => setCurrentModule('analytics')}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Profile Evaluation</h3>
            <p className="text-gray-600 text-sm">AI-powered LinkedIn analysis</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-500 font-medium">Overall Score</div>
            <div className={`text-xs font-semibold ${
              overallScore >= 8 ? 'text-emerald-600' : 
              overallScore >= 5 ? 'text-amber-600' : 
              'text-rose-600'
            }`}>
              {getScoreLabel(overallScore)}
            </div>
          </div>
          <div className={`text-4xl font-black ${
            overallScore >= 8 ? 'text-emerald-600' : 
            overallScore >= 5 ? 'text-amber-600' : 
            'text-rose-600'
          }`}>
            {overallScore}<span className="text-2xl text-gray-400">/10</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scoreItems.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
            className="group relative"
          >
            <div className={`flex items-center justify-between p-4 rounded-2xl border-2 hover:shadow-lg hover:scale-105 transition-all duration-300 ${getScoreColor(item.score)}`}>
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl bg-white/80 shadow-sm ${getScoreColor(item.score).split(' ')[0]}`}>
                  {getScoreIcon(item.score)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                  <p className={`text-xs font-medium ${getScoreColor(item.score).split(' ')[0]}`}>
                    {getScoreLabel(item.score)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-xl font-bold ${getScoreColor(item.score).split(' ')[0]}`}>
                  {item.score}
                </span>
                <div className="relative">
                  <Info size={16} className="text-gray-500 hover:text-blue-600 cursor-help transition-colors" />
                  <div className="absolute bottom-full right-0 mb-3 w-80 p-4 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none shadow-2xl border border-gray-700">
                    <div className="font-semibold text-blue-300 mb-2">{item.label} - Score: {item.score}/10</div>
                    <div className="text-gray-300 mb-3">{explanations[item.key]}</div>
                    <div className="text-gray-400 text-xs border-t border-gray-700 pt-2">
                      <strong className="text-blue-300">Calculation:</strong><br />
                      {getCalculationDetails(item.key, item.score)}
                    </div>
                    <div className="absolute top-full right-4 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900/95"></div>
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
        transition={{ delay: 0.5 }}
        className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <TrendingUp size={18} className="text-blue-600" />
          </div>
          <p className="text-sm text-blue-900 font-medium">
            <strong>Click to view detailed analytics</strong> and get personalized recommendations to improve each score.
          </p>
        </div>
      </motion.div>
    </Card>
  );
};