import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchLinkedInChangelog, fetchLinkedInSnapshot, fetchLinkedInProfile, fetchLinkedInHistoricalPosts } from '../services/linkedin';
import { useAuthStore } from '../stores/authStore';

export const useLinkedInProfile = () => {
  const { accessToken } = useAuthStore();
  
  return useQuery({
    queryKey: ['linkedin-profile'],
    queryFn: () => fetchLinkedInProfile(accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLinkedInChangelog = (count: number = 50) => {
  const { dmaToken } = useAuthStore();
  
  return useQuery({
    queryKey: ['linkedin-changelog', count],
    queryFn: () => fetchLinkedInChangelog(dmaToken!, count),
    enabled: !!dmaToken,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useLinkedInSnapshot = (domain?: string) => {
  const { dmaToken } = useAuthStore();
  
  return useQuery({
    queryKey: ['linkedin-snapshot', domain],
    queryFn: async () => {
      try {
        const data = await fetchLinkedInSnapshot(dmaToken!, domain);
        
        // Additional validation to ensure no objects with country/language slip through
        const validateData = (obj: any): any => {
          if (obj === null || obj === undefined) return obj;
          
          if (Array.isArray(obj)) {
            return obj.map(validateData);
          }
          
          if (typeof obj === 'object') {
            // Check for problematic objects
            if (obj.country && obj.language && typeof obj.country === 'string' && typeof obj.language === 'string') {
              console.warn('Found country/language object, converting to string:', obj);
              return `${obj.language}_${obj.country}`;
            }
            
            const validated: any = {};
            for (const [key, value] of Object.entries(obj)) {
              validated[key] = validateData(value);
            }
            return validated;
          }
          
          return obj;
        };
        
        return validateData(data);
      } catch (error) {
        console.error('Error in useLinkedInSnapshot:', error);
        // Return safe fallback data
        return {
          elements: [],
          paging: { count: 0, start: 0 }
        };
      }
    },
    enabled: !!dmaToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useLinkedInMultipleSnapshots = (domains: string[]) => {
  const { dmaToken } = useAuthStore();
  
  return useQuery({
    queryKey: ['linkedin-multiple-snapshots', domains],
    queryFn: async () => {
      const results = await Promise.all(
        domains.map(domain => fetchLinkedInSnapshot(dmaToken!, domain))
      );
      return results.reduce((acc, result, index) => {
        acc[domains[index]] = result;
        return acc;
      }, {} as Record<string, any>);
    },
    enabled: !!dmaToken && domains.length > 0,
    staleTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useLinkedInHistoricalPosts = (daysBack: number = 90) => {
  const { dmaToken } = useAuthStore();
  
  return useInfiniteQuery({
    queryKey: ['linkedin-historical-posts', daysBack],
    queryFn: async ({ pageParam = 0 }) => {
      return fetchLinkedInHistoricalPosts(dmaToken!, daysBack, pageParam, 10);
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentStart = allPages.length * 10;
      if (lastPage.paging?.hasMore && currentStart < (lastPage.paging?.total || 0)) {
        return currentStart;
      }
      return undefined;
    },
    enabled: !!dmaToken,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 2,
    refetchOnWindowFocus: false,
  });
};