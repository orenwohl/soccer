'use client'

import { useQuery } from '@tanstack/react-query'
import { matchService } from '@/app/services/'
import { MatchesResponse, MatchResponse } from '../types'

// Hook to fetch all matches
export function useMatches() {
	return useQuery<MatchesResponse>({
		queryKey: ['matches'],
		queryFn: async () => {
			const response = await matchService.getAll()

			if (!response.success) {
				throw new Error(typeof response.error === 'string' ? response.error : 'Failed to load matches')
			}

			return response
		}
	})
}

// Hook to fetch a single match by ID
export function useMatch(id: string) {
	return useQuery<MatchResponse>({
		queryKey: ['matches', id],
		queryFn: async () => {
			const response = await matchService.getById(id)

			if (!response.success) {
				throw new Error(typeof response.error === 'string' ? response.error : 'Failed to load match')
			}

			return response
		},
		enabled: !!id // Only run the query if an ID is provided
	})
}

// Hook to fetch match statistics
export function useMatchStatistics(gameDayId: string) {
	return useQuery({
		queryKey: ['matches', gameDayId, 'statistics'],
		queryFn: async () => {
			const response = await matchService.getStatistics(gameDayId)

			if (!response.success) {
				throw new Error(typeof response.error === 'string' ? response.error : 'Failed to load match statistics')
			}

			return response
		},
		enabled: !!gameDayId // Only run the query if a gameDayId is provided
	})
}
