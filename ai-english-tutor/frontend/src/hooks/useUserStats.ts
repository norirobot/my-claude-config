import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { UserStats } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const fetchUserStats = async (userId: string): Promise<UserStats> => {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/stats`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user stats: ${response.statusText}`)
  }
  
  return response.json()
}

export const useUserStats = (
  userId: string | undefined,
  options?: Omit<UseQueryOptions<UserStats, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<UserStats, Error>({
    queryKey: ['userStats', userId],
    queryFn: () => fetchUserStats(userId!),
    enabled: !!userId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options
  })
}