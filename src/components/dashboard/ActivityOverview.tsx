import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Calendar } from 'lucide-react';

interface ActivityOverviewProps {
  postsCreated: number;
  commentsGiven: number;
  likesGiven: number;
  totalPosts: number;
  timeRange?: string;
}

export const ActivityOverview = ({ 
  postsCreated, 
  commentsGiven, 
  likesGiven, 
  totalPosts,
  timeRange = "Past 28 days"
}: ActivityOverviewProps) => {
  const activities = [
    { label: 'Posts Created', value: postsCreated, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Comments Given', value: commentsGiven, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Likes Given', value: likesGiven, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Total Posts', value: totalPosts, color: 'text-orange-600', bgColor: 'bg-orange-50' }
  ];

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Activity Overview</h3>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar size={16} className="mr-2" />
          {timeRange}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className={`w-16 h-16 ${activity.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <div className={`text-3xl font-bold ${activity.color}`}>
                {activity.value}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {activity.label}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};