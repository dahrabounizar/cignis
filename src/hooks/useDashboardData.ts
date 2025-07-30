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
  profileVisibility: number | null;
  professionalBrand: number;
}

export interface Summary {
  totalConnections: number;
  posts30d: number;
  engagementRatePct: number;
  newConnections: number;
}

export interface Trends {
  weeklyPosts: Record<string, number>;
  weeklyEngagements: Record<string, number>;
}

export interface DashboardData {
  scores: ProfileScore;
  summary: Summary;
  trends: Trends;
}

export const useDashboardData = () => {
  const { dmaToken } = useAuthStore();
  
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async (): Promise<DashboardData> => {
      // For local development without DMA token, return mock data
      if (!dmaToken) {
        return {
          scores: {
            profileCompleteness: 8,
            postingActivity: 6,
            engagementQuality: 7,
            networkGrowth: 5,
            audienceRelevance: 8,
            contentDiversity: 6,
            engagementRate: 7,
            mutualInteractions: 5,
            profileVisibility: null,
            professionalBrand: 7
          },
          summary: {
            totalConnections: 1200,
            posts30d: 4,
            engagementRatePct: 4.6,
            newConnections: 45
          },
          trends: {
            weeklyPosts: { '2025-W01': 3, '2025-W02': 5 },
            weeklyEngagements: { '2025-W01': 20, '2025-W02': 33 }
          }
        };
      }
      
      const response = await fetch('/.netlify/functions/dashboard-data', {
        headers: {
          'Authorization': `Bearer ${dmaToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dashboard API error:', response.status, errorText);
        throw new Error(`Dashboard API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Validate the response structure
      if (!data.scores || !data.summary || !data.trends) {
        console.error('Invalid dashboard data structure:', data);
        throw new Error('Invalid dashboard data structure received');
      }
      
      return data;
    },
    enabled: true, // Always enabled, will use mock data if no token
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Dashboard data query error:', error);
    }
  });
};