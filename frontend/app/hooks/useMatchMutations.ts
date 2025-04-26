'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { matchService } from '../services/matchService'
import { Match } from '../types'

// Hook for creating a new match
export function useCreateMatch() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (matchData: Omit<Match, '_id' | 'createdAt' | 'updatedAt'>) => matchService.create(matchData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['matches'] })
		}
	})
}

// Hook for updating a match
export function useUpdateMatch() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Match, '_id' | 'createdAt' | 'updatedAt'>> }) => matchService.update(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['matches'] })
			queryClient.invalidateQueries({ queryKey: ['matches', variables.id] })
		}
	})
}

// Hook for deleting a match
export function useDeleteMatch() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => matchService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['matches'] })
		}
	})
}

// Hook for saving match results
export function useSaveMatchResult() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			gameDayId,
			matchId,
			resultData
		}: {
			gameDayId: string
			matchId: string
			resultData: {
				team1Score: number
				team2Score: number
			}
		}) => matchService.saveMatchResult(gameDayId, matchId, resultData),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['matches'] })
			queryClient.invalidateQueries({ queryKey: ['matches', variables.gameDayId] })
			queryClient.invalidateQueries({ queryKey: ['matches', variables.gameDayId, 'statistics'] })
			queryClient.invalidateQueries({ queryKey: ['leagueTable'] })
		}
	})
}

// Hook for generating teams
export function useGenerateTeams() {
	return useMutation({
		mutationFn: (data: { playerIds: string[]; numberOfTeams?: number; teamNames?: string[] }) => matchService.generateTeams(data)
	})
}
