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
  
  console.log('=== useDashboardData Hook ===');
  console.log('DMA Token present:', !!dmaToken);
  console.log('DMA Token length:', dmaToken ? dmaToken.length : 0);
  
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async (): Promise<DashboardData> => {
      console.log('=== Dashboard Data Query Function ===');
      console.log('Starting dashboard data fetch...');
      
      if (!dmaToken) {
        console.error('No DMA token available');
        throw new Error('DMA token is required for dashboard data');
      }
      
      console.log('Making fetch request to dashboard-data endpoint...');
      const response = await fetch('/.netlify/functions/dashboard-data', {
        headers: {
          'Authorization': `Bearer ${dmaToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dashboard API error:', response.status, errorText);
        throw new Error(`Dashboard API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Dashboard data received:', {
        hasProfileEvaluation: !!data.profileEvaluation,
        hasSummaryKPIs: !!data.summaryKPIs,
        hasMiniTrends: !!data.miniTrends,
        lastUpdated: data.lastUpdated,
        dataKeys: Object.keys(data)
      });
      
      // Validate the response structure
      if (!data.profileEvaluation || !data.summaryKPIs || !data.miniTrends) {
        console.error('Invalid dashboard data structure:', data);
        throw new Error('Invalid dashboard data structure received');
      }
      
      console.log('Dashboard data validation passed, returning data');
      return data;
    },
    enabled: !!dmaToken,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Dashboard data query error:', error);
    },
    onSuccess: (data) => {
      console.log('Dashboard data query successful:', data);
    }
  });
};