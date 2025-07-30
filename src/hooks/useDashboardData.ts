import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { fetchDashboardDataFixed, enableDmaArchiving } from '../services/linkedin';

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
    queryKey: ['dashboard-data-fixed'],
    queryFn: async (): Promise<DashboardData> => {
      if (!dmaToken) {
        throw new Error('DMA token is required for dashboard data');
      }
      
      try {
        const data = await fetchDashboardDataFixed(dmaToken);
        
        // Validate the response structure
        if (!data.profileEvaluation || !data.summaryKPIs || !data.miniTrends) {
          console.error('Invalid dashboard data structure:', data);
          throw new Error('Invalid dashboard data structure received');
        }
        
        return data;
      } catch (error) {
        if (error.message.startsWith('DMA_NOT_ENABLED:')) {
          // Try to enable DMA automatically
          console.log('DMA not enabled, attempting to enable...');
          try {
            await enableDmaArchiving(dmaToken);
            console.log('DMA enabled successfully, retrying data fetch...');
            // Retry the data fetch after enabling DMA
            const data = await fetchDashboardDataFixed(dmaToken);
            return data;
          } catch (enableError) {
            console.error('Failed to enable DMA:', enableError);
            throw new Error('DMA consent required. Please enable archiving permissions.');
          }
        }
        throw error;
      }
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