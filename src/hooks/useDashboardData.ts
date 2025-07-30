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
}

export const useDashboardData = () => {
  const { dmaToken } = useAuthStore();
  
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async (): Promise<DashboardData> => {
      if (!dmaToken) {
        throw new Error('DMA token is required for dashboard data');
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
        
        // For 401 errors, still try to parse response as it might contain demo data
        if (response.status === 401) {
          console.log('Dashboard: Authentication issue, but checking for demo data');
          try {
            const data = JSON.parse(errorText);
            if (data.profileEvaluation && data.summaryKPIs && data.miniTrends) {
              console.log('Dashboard: Using demo data from error response');
              return data;
            }
          } catch (parseError) {
            console.log('Dashboard: Could not parse error response as JSON');
          }
        }
        
        throw new Error(`Dashboard API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Validate the response structure
      if (!data.profileEvaluation || !data.summaryKPIs || !data.miniTrends) {
        console.error('Invalid dashboard data structure:', data);
        throw new Error('Invalid dashboard data structure received');
      }
      
      return data;
    },
    enabled: !!dmaToken,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Dashboard data query error:', error);
    }
  });
};