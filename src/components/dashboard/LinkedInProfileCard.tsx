import { motion } from 'framer-motion';
import { User, Mail, Globe, MapPin, Briefcase } from 'lucide-react';
import { Card } from '../ui/Card';
import { useLinkedInProfile } from '../../hooks/useLinkedInData';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const LinkedInProfileCard = () => {
  const { data: linkedInProfile, isLoading, error } = useLinkedInProfile();

  if (isLoading) {
    return (
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="md" />
        </div>
      </Card>
    );
  }

  if (error || !linkedInProfile) {
    return (
      <Card variant="glass" className="p-6">
        <div className="text-center text-gray-500">
          <User size={48} className="mx-auto mb-2 text-gray-300" />
          <p>LinkedIn profile not available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">LinkedIn Profile</h3>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Connected" />
      </div>

      <div className="flex items-start space-x-4">
        {/* Profile Picture */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {linkedInProfile.picture ? (
            <img
              src={linkedInProfile.picture}
              alt={linkedInProfile.name}
              className="w-20 h-20 rounded-full ring-4 ring-blue-500/20 object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
          )}
        </motion.div>

        {/* Profile Information */}
        <div className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold text-gray-900 truncate">
              {linkedInProfile.name}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {linkedInProfile.given_name} {linkedInProfile.family_name}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            {linkedInProfile.email && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail size={14} />
                <span className="truncate">{linkedInProfile.email}</span>
                {linkedInProfile.email_verified && (
                  <span className="text-green-500 text-xs">✓</span>
                )}
              </div>
            )}

            {linkedInProfile.locale && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Globe size={14} />
                <span>{linkedInProfile.locale}</span>
              </div>
            )}

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Briefcase size={14} />
              <span>LinkedIn Professional</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm font-medium text-green-800">
              LinkedIn Connected
            </span>
          </div>
          <span className="text-xs text-green-600">
            Data synced and ready
          </span>
        </div>
      </motion.div>
    </Card>
  );
};