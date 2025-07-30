import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Star, TrendingUp, Users, FileText, Heart, Eye, Award } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface RatingExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RatingExplanationModal = ({ isOpen, onClose }: RatingExplanationModalProps) => {
  const ratingCriteria = [
    {
      name: 'Profile Completeness',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Measures how complete your LinkedIn profile is',
      factors: [
        'Basic information (name, headline, industry) - 4 points',
        'Skills listed (up to 2 points, 1 point per 5 skills)',
        'Work experience (up to 2 points, 1 point per position)',
        'Education background (up to 2 points)'
      ],
      scoring: 'Maximum 10 points. Higher scores indicate a more complete professional profile.'
    },
    {
      name: 'Posting Activity',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Evaluates your content creation frequency',
      factors: [
        '20+ posts in 30 days = 10 points',
        '15-19 posts = 8 points',
        '10-14 posts = 6 points',
        '5-9 posts = 4 points',
        '1-4 posts = 2 points'
      ],
      scoring: 'Based on posts created in the last 30 days from LinkedIn data.'
    },
    {
      name: 'Engagement Quality',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Measures the engagement your content receives',
      factors: [
        'Average likes and comments per post',
        '20+ avg engagement = 10 points',
        '15-19 avg = 8 points',
        '10-14 avg = 6 points',
        '5-9 avg = 4 points',
        '1-4 avg = 2 points'
      ],
      scoring: 'Calculated as (total likes + comments) / number of posts.'
    },
    {
      name: 'Network Growth',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Tracks how your professional network is expanding',
      factors: [
        'New connections in the last 30 days',
        '50+ new connections = 10 points',
        '30-49 = 8 points',
        '20-29 = 6 points',
        '10-19 = 4 points',
        '5-9 = 2 points'
      ],
      scoring: 'Includes both direct connections and invitation acceptances.'
    },
    {
      name: 'Audience Relevance',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'Evaluates the quality and diversity of your network',
      factors: [
        'Industry diversity of connections (up to 5 points)',
        'Professional connections ratio (up to 5 points)',
        'Connections with clear job titles/companies',
        'Variety in professional backgrounds'
      ],
      scoring: 'Higher scores for diverse, professional networks.'
    },
    {
      name: 'Content Diversity',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Measures variety in your content types',
      factors: [
        'Text posts',
        'Image posts',
        'Video content',
        'Article shares',
        'External links'
      ],
      scoring: '2.5 points per content type used (max 10 points).'
    },
    {
      name: 'Engagement Rate',
      icon: TrendingUp,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      description: 'Engagement relative to your network size',
      factors: [
        'Total engagement / posts / connections × 100',
        '5%+ rate = 10 points',
        '3-4.9% = 8 points',
        '2-2.9% = 6 points',
        '1-1.9% = 4 points',
        '0.5-0.9% = 2 points'
      ],
      scoring: 'Normalized engagement rate considering network size.'
    },
    {
      name: 'Mutual Interactions',
      icon: Heart,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100',
      description: 'How actively you engage with others\' content',
      factors: [
        'Likes given to others\' posts',
        'Comments on others\' content',
        '100+ interactions = 10 points',
        '75-99 = 8 points',
        '50-74 = 6 points',
        '25-49 = 4 points'
      ],
      scoring: 'Measures your participation in the LinkedIn community.'
    },
    {
      name: 'Profile Visibility',
      icon: Eye,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      description: 'How discoverable and visible your profile is',
      factors: [
        'Profile views (up to 4 points)',
        'Search appearances (up to 3 points)',
        'Profile completeness indicators (up to 3 points)',
        'Professional headline length and quality'
      ],
      scoring: 'Based on LinkedIn analytics when available.'
    },
    {
      name: 'Professional Brand',
      icon: Award,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: 'Strength of your professional brand presence',
      factors: [
        'Professional headline (2 points)',
        'Industry specification (2 points)',
        'Work experience depth (up to 2 points)',
        'Current position listed (2 points)',
        'Professional content ratio (2 points)'
      ],
      scoring: 'Evaluates overall professional brand strength.'
    }
  ];

  const overallScoring = [
    { range: '8.0-10.0', label: 'Excellent', color: 'text-green-600', description: 'Outstanding LinkedIn presence with strong engagement and professional brand' },
    { range: '5.0-7.9', label: 'Good', color: 'text-yellow-600', description: 'Solid LinkedIn presence with room for improvement in some areas' },
    { range: '0.0-4.9', label: 'Needs Work', color: 'text-red-600', description: 'LinkedIn presence requires significant improvement across multiple areas' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Info size={24} />
                <h2 className="text-2xl font-bold">LinkedIn Profile Rating System</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </Button>
            </div>
            <p className="mt-2 text-blue-100">
              Understanding how your LinkedIn profile is evaluated across 10 key dimensions
            </p>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-6 space-y-6">
              {/* Overall Scoring */}
              <Card variant="glass" className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Star className="mr-2 text-yellow-500" size={20} />
                  Overall Score Calculation
                </h3>
                <p className="text-gray-600 mb-4">
                  Your overall score is the average of all 10 individual scores, ranging from 0 to 10.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {overallScoring.map((tier) => (
                    <div key={tier.range} className="text-center p-3 rounded-lg border">
                      <div className={`text-lg font-bold ${tier.color}`}>{tier.range}</div>
                      <div className={`text-sm font-medium ${tier.color}`}>{tier.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{tier.description}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Individual Criteria */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Individual Rating Criteria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ratingCriteria.map((criterion, index) => (
                    <motion.div
                      key={criterion.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card variant="glass" className="p-4 h-full">
                        <div className="flex items-start space-x-3 mb-3">
                          <div className={`p-2 rounded-lg ${criterion.bgColor}`}>
                            <criterion.icon size={16} className={criterion.color} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{criterion.name}</h4>
                            <p className="text-xs text-gray-600">{criterion.description}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-700">Scoring Factors:</div>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {criterion.factors.map((factor, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {factor}
                              </li>
                            ))}
                          </ul>
                          <div className="text-xs text-gray-500 italic mt-2 pt-2 border-t">
                            {criterion.scoring}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Data Sources */}
              <Card variant="glass" className="p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Info className="mr-2 text-blue-500" size={20} />
                  Data Sources & Methodology
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    <strong>LinkedIn API Integration:</strong> Data is collected from LinkedIn's official APIs, including profile snapshots and activity changelog.
                  </p>
                  <p>
                    <strong>Real-time Analysis:</strong> Scores are calculated based on your recent activity (last 30 days) and current profile state.
                  </p>
                  <p>
                    <strong>Privacy Compliant:</strong> Only data you've authorized through LinkedIn's DMA (Data Member Agreement) is accessed and analyzed.
                  </p>
                  <p>
                    <strong>Fallback Scoring:</strong> When specific data isn't available, the system uses intelligent fallbacks to provide meaningful scores.
                  </p>
                </div>
              </Card>

              {/* Tips */}
              <Card variant="glass" className="p-4 bg-blue-50 border-blue-200">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">
                  💡 Tips to Improve Your Score
                </h3>
                <div className="text-sm text-blue-700 space-y-2">
                  <p>• <strong>Complete your profile:</strong> Fill in all sections including skills, experience, and education</p>
                  <p>• <strong>Post consistently:</strong> Share valuable content regularly to boost posting activity</p>
                  <p>• <strong>Engage authentically:</strong> Like and comment on others' posts to improve mutual interactions</p>
                  <p>• <strong>Diversify content:</strong> Mix text posts, images, videos, and article shares</p>
                  <p>• <strong>Grow strategically:</strong> Connect with relevant professionals in your industry</p>
                  <p>• <strong>Optimize visibility:</strong> Use keywords in your headline and maintain an active presence</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex justify-end">
              <Button variant="primary" onClick={onClose}>
                Got it!
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};