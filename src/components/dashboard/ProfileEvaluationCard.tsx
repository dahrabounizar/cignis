import { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProfileScore } from '../../hooks/useDashboardData';
import { useAppStore } from '../../stores/appStore';
import { RatingExplanationModal } from './RatingExplanationModal';

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
  const [showExplanationModal, setShowExplanationModal] = useState(false);

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
      className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={() => setCurrentModule('analytics')}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-gray-900">Profile Evaluation</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowExplanationModal(true);
            }}
            className="text-gray-500 hover:text-blue-600"
          >
            <HelpCircle size={16} />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`text-3xl font-bold ${
            overallScore >= 8 ? 'text-green-600' : 
            overallScore >= 5 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {overallScore}/10
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Overall</div>
            <div className={`text-xs font-medium ${
              overallScore >= 8 ? 'text-green-600' : 
              overallScore >= 5 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {getScoreLabel(overallScore)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scoreItems.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative"
          >
            <div className={`flex items-center justify-between p-3 rounded-lg border-2 hover:shadow-md transition-all ${getScoreColor(item.score)}`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full bg-white ${getScoreColor(item.score).split(' ')[0]}`}>
                  {getScoreIcon(item.score)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-600">{getScoreLabel(item.score)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-bold ${getScoreColor(item.score).split(' ')[0]}`}>
                  {item.score}
                </span>
                <div className="relative">
                  <Info size={14} className="text-gray-400 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none shadow-lg">
                    {explanations[item.key]}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Click to view detailed analytics</strong> and learn how to improve each score.
        </p>
      </div>

      <RatingExplanationModal
        isOpen={showExplanationModal}
        onClose={() => setShowExplanationModal(false)}
      />
    </Card>
  );
};