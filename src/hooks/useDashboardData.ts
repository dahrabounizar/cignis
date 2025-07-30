import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';

export interface ProfileScore {
  profileCompleteness: number;
  postingActivity: number;
  engagementQuality: number;
  networkGrowth: number;
  audienceRelevance: number;
  contentDiversity: number;
  engagementRate: number;
  mutualInteractions: number;
  profileVisibility: number;
  professionalBrand: number;
}

export interface SummaryKPIs {
  totalConnections: number;
  postsLast30Days: number;
  engagementRate: string;
  connectionsLast30Days: number;
}

export interface MiniTrend {
  date: string;
  value: number;
}

export interface DashboardData {
  profileEvaluation: {
    scores: ProfileScore;
    overallScore: number;
    explanations: Record<string, string>;
  };
  summaryKPIs: SummaryKPIs;
  miniTrends: {
    posts: MiniTrend[];
    engagements: MiniTrend[];
  };
  lastUpdated: string;
  isDemoData?: boolean;
  error?: string;
}

// Fallback data in case everything fails
const getFallbackData = (): DashboardData => ({
  profileEvaluation: {
    scores: {
      profileCompleteness: 5,
      postingActivity: 4,
      engagementQuality: 6,
      networkGrowth: 3,
      audienceRelevance: 5,
      contentDiversity: 4,
      engagementRate: 6,
      mutualInteractions: 5,
      profileVisibility: 4,
      professionalBrand: 6
    },
    overallScore: 5,
    explanations: {
      profileCompleteness: "Profile completeness based on filled fields (headline, skills, experience, education)",
      postingActivity: "Posting frequency in the last 30 days from LinkedIn changelog",
      engagementQuality: "Average engagement (likes + comments) received per post",
      networkGrowth: "New connections and invitations in the last 30 days",
      audienceRelevance: "Industry diversity and professional connection quality",
      contentDiversity: "Variety in content types (text, images, videos, articles)",
      engagementRate: "Total engagement relative to your network size",
      mutualInteractions: "Engagement you give to others (likes, comments)",
      profileVisibility: "Profile views and search appearances from LinkedIn",
      professionalBrand: "Professional signals (headline, industry, current role)"
    }
  },
  summaryKPIs: {
    totalConnections: 654,
    postsLast30Days: 3,
    engagementRate: "3.2%",
    connectionsLast30Days: 8
  },
  miniTrends: {
    posts: [
      { date: "Day 1", value: 0 },
      { date: "Day 2", value: 1 },
      { date: "Day 3", value: 0 },
      { date: "Day 4", value: 1 },
      { date: "Day 5", value: 0 },
      { date: "Day 6", value: 1 },
      { date: "Day 7", value: 0 }
    ],
    engagements: [
      { date: "Day 1", value: 5 },
      { date: "Day 2", value: 12 },
      { date: "Day 3", value: 8 },
      { date: "Day 4", value: 15 },
      { date: "Day 5", value: 3 },
      { date: "Day 6", value: 18 },
      { date: "Day 7", value: 7 }
    ]
  },
  lastUpdated: new Date().toISOString(),
  isDemoData: true,
  error: "Using fallback data - please check your LinkedIn connection"
});

export const useDashboardData = () => {
  const { dmaToken } = useAuthStore();
  
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async (): Promise<DashboardData> => {
      if (!dmaToken) {
        console.log('No DMA token available, using fallback data');
        return getFallbackData();
      }
      
      try {
        const response = await fetch('/.netlify/functions/dashboard-data', {
          headers: {
            'Authorization': `Bearer ${dmaToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Dashboard API error:', response.status, errorText);
          
          // Return fallback data instead of throwing error
          return getFallbackData();
        }

        const data = await response.json();
        
        // Validate the response structure
        if (!data.profileEvaluation || !data.summaryKPIs || !data.miniTrends) {
          console.error('Invalid dashboard data structure:', data);
          return getFallbackData();
        }
        
        return data;
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        return getFallbackData();
      }
    },
    enabled: true, // Always enabled now
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1, // Reduced retries since we have fallback
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Dashboard data query error:', error);
    }
  });
};