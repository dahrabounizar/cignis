import { motion } from 'framer-motion';
import { User, MapPin, Building, Calendar, Users, Eye, Search, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { useLinkedInSnapshot } from '../../hooks/useLinkedInData';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const LinkedInDataCard = () => {
  const { data: profileSnapshot, isLoading, error } = useLinkedInSnapshot('PROFILE');

  if (isLoading) {
    return (
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-center h-40">
          <LoadingSpinner size="md" />
          <span className="ml-2 text-gray-600">Loading LinkedIn data...</span>
        </div>
      </Card>
    );
  }

  if (error || !profileSnapshot?.elements?.[0]?.snapshotData?.length) {
    return (
      <Card variant="glass" className="p-6">
        <div className="text-center text-gray-500">
          <User size={48} className="mx-auto mb-2 text-gray-300" />
          <p>LinkedIn profile data not available</p>
          <p className="text-sm mt-1">Complete DMA authentication to view detailed profile information</p>
        </div>
      </Card>
    );
  }

  // Extract profile data from snapshot
  const profileData = profileSnapshot.elements[0].snapshotData[0] || {};
  
  // Handle different possible field names from LinkedIn API
  const getFieldValue = (field: string, ...alternatives: string[]) => {
    return profileData[field] || alternatives.find(alt => profileData[alt]) || '';
  };

  const name = getFieldValue('First Name', 'firstName') + ' ' + getFieldValue('Last Name', 'lastName');
  const headline = getFieldValue('Headline', 'headline');
  const industry = getFieldValue('Industry', 'industry');
  const location = getFieldValue('Location', 'location', 'Geographic Area', 'geographicArea');
  const profileViews = getFieldValue('Profile Views', 'profileViews');
  const searchAppearances = getFieldValue('Search Appearances', 'searchAppearances');

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">LinkedIn Profile Details</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm text-blue-600 font-medium">Live Data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Profile Information
          </h4>
          
          {name.trim() && (
            <div className="flex items-center space-x-3">
              <User size={16} className="text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">{name.trim()}</p>
                <p className="text-sm text-gray-500">Full Name</p>
              </div>
            </div>
          )}

          {headline && (
            <div className="flex items-start space-x-3">
              <Building size={16} className="text-green-600 mt-1" />
              <div>
                <p className="text-gray-900">{headline}</p>
                <p className="text-sm text-gray-500">Professional Headline</p>
              </div>
            </div>
          )}

          {industry && (
            <div className="flex items-center space-x-3">
              <TrendingUp size={16} className="text-purple-600" />
              <div>
                <p className="text-gray-900">{industry}</p>
                <p className="text-sm text-gray-500">Industry</p>
              </div>
            </div>
          )}

          {location && (
            <div className="flex items-center space-x-3">
              <MapPin size={16} className="text-red-600" />
              <div>
                <p className="text-gray-900">{location}</p>
                <p className="text-sm text-gray-500">Location</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Analytics & Visibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Profile Analytics
          </h4>

          {profileViews && (
            <div className="flex items-center space-x-3">
              <Eye size={16} className="text-indigo-600" />
              <div>
                <p className="font-medium text-gray-900">{parseInt(profileViews).toLocaleString()}</p>
                <p className="text-sm text-gray-500">Profile Views</p>
              </div>
            </div>
          )}

          {searchAppearances && (
            <div className="flex items-center space-x-3">
              <Search size={16} className="text-orange-600" />
              <div>
                <p className="font-medium text-gray-900">{parseInt(searchAppearances).toLocaleString()}</p>
                <p className="text-sm text-gray-500">Search Appearances</p>
              </div>
            </div>
          )}

          {/* Additional fields that might be available */}
          {Object.keys(profileData).length > 0 && (
            <div className="pt-2">
              <div className="flex items-center space-x-3">
                <Calendar size={16} className="text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Active Profile</p>
                  <p className="text-sm text-gray-500">Data Last Updated</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Additional Profile Data Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium text-blue-900">LinkedIn Data Integration</h5>
            <p className="text-sm text-blue-700">
              Real-time profile data from LinkedIn DMA API
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-blue-900">
              {Object.keys(profileData).length} fields
            </div>
            <div className="text-xs text-blue-600">Available</div>
          </div>
        </div>
      </motion.div>
    </Card>
  );
};