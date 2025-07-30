import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';

export interface PostTrend {
  date: string;
  posts: number;
  engagements: number;
}

export interface ConnectionTrend {
  date: string;
  total: number;
}

export interface PostTypes {
  IMAGE: number;
  VIDEO: number;
  ARTICLE: number;
  NONE: number;
}

export interface Hashtag {
  tag: string;
  count: number;
}

export interface EngagementPerPost {
  postUrn: string;
  likes: number;
  comments: number;
  date?: string;
}

export interface Audience {
  industries: Record<string, number>;
  geographies: Record<string, number>;
}

export interface AnalyticsData {
  postsTrend: PostTrend[];
  connectionsTrend: ConnectionTrend[];
  postTypes: PostTypes;
  hashtags: Hashtag[];
  engagementPerPost: EngagementPerPost[];
  audience: Audience;
}

export const useAnalyticsData = (timeRange: '7d' | '30d' | '90d' = '30d') => {
  const { dmaToken } = useAuthStore();
  
  return useQuery({
    queryKey: ['analytics-data', timeRange],
    queryFn: async (): Promise<AnalyticsData> => {
      console.log('Fetching analytics data with token:', dmaToken ? 'present' : 'missing', 'timeRange:', timeRange);
      
      // For local development without DMA token, return mock data
      if (!dmaToken) {
        return {
          postsTrend: [
            { date: '2025-01-01', posts: 2, engagements: 30 },
            { date: '2025-01-02', posts: 1, engagements: 15 },
            { date: '2025-01-03', posts: 0, engagements: 5 }
          ],
          connectionsTrend: [
            { date: '2025-01-01', total: 1200 },
            { date: '2025-01-02', total: 1205 },
            { date: '2025-01-03', total: 1210 }
          ],
          postTypes: { 
            IMAGE: 10, 
            ARTICLE: 5, 
            VIDEO: 3, 
            NONE: 2 
          },
          hashtags: [
            { tag: '#AI', count: 12 },
            { tag: '#Technology', count: 8 },
            { tag: '#Innovation', count: 6 }
          ],
          engagementPerPost: [
            { postUrn: 'urn:li:ugcPost:123', likes: 20, comments: 5 },
            { postUrn: 'urn:li:ugcPost:124', likes: 15, comments: 3 }
          ],
          audience: {
            industries: { 
              'Technology': 500, 
              'Finance': 300,
              'Healthcare': 200 
            },
            geographies: { 
              'US': 600, 
              'UK': 200,
              'Canada': 150 
            }
          }
        };
      }
      
      const response = await fetch(`/.netlify/functions/analytics-data?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${dmaToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Analytics API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Analytics API error:', response.status, errorText);
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      console.log('Analytics data received:', data);
      return data;
    },
    enabled: true, // Always enabled, will use mock data if no token
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};