'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { matchService } from '../services'
import { Match } from '../types'

/**
 * Custom hook that provides all data fetching for the GameDay page
 */
export function useGameDayData(id: string) {
	const queryClient = useQueryClient()

	// Get match data
	const matchQuery = useQuery({
		queryKey: ['matches', id],
		queryFn: async () => {
			console.log('Fetching match data for ID:', id)
			const response = await matchService.getById(id)
			console.log('Match API response:', response)

			if (!response.success) {
				throw new Error(typeof response.error === 'string' ? response.error : 'Failed to load match')
			}

			return response.data
		},
		enabled: !!id
	})

	// Get match statistics
	const statisticsQuery = useQuery({
		queryKey: ['matches', id, 'statistics'],
		queryFn: async () => {
			console.log('Fetching statistics for match ID:', id)
			const response = await matchService.getStatistics(id)
			console.log('Statistics API response:', response)

			if (!response.success) {
				throw new Error(typeof response.error === 'string' ? response.error : 'Failed to load match statistics')
			}

			return response.data
		},
		enabled: !!id
	})

	// Weather data query
	const weatherQuery = useQuery({
		queryKey: ['weather', matchQuery.data?.location || 'Tel Aviv'],
		queryFn: async () => {
			// We don't actually use the location variable for the API call
			// since we're using fixed coordinates for Tel Aviv
			try {
				const response = await fetch(
					`https://api.open-meteo.com/v1/forecast?latitude=32.0853&longitude=34.7818&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,precipitation&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=IST&forecast_days=1`
				)

				if (!response.ok) {
					throw new Error('Weather API error')
				}

				const data = await response.json()
				return data
			} catch (error) {
				console.error('Error fetching weather data:', error)
				throw error
			}
		},
		enabled: !!matchQuery.data,
		staleTime: 30 * 60 * 1000 // 30 minutes
	})

	// Save all data
	const saveDataMutation = useMutation({
		mutationFn: async (data: Partial<Match>) => {
			const response = await matchService.update(id, data)

			if (!response.success) {
				throw new Error(typeof response.error === 'string' ? response.error : 'Failed to save match data')
			}

			return response.data
		},
		onSuccess: () => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: ['matches', id] })
			queryClient.invalidateQueries({ queryKey: ['matches', id, 'statistics'] })
		}
	})

	// Add goal
	const addGoalMutation = useMutation({
		mutationFn: async (params: { playerId: string; matchId: string; goals: number }) => {
			// Create a properly formatted goal object
			const goalData = {
				playerId: params.playerId,
				playerName: 'Player Name', // This should come from your data source
				teamId: 'Team ID', // This should come from your data source
				teamName: 'Team Name', // This should come from your data source
				matchId: params.matchId
			}

			// Call the service with the correct parameters
			const response = await matchService.addGoal(goalData)

			if (!response.success) {
				throw new Error(typeof response.error === 'string' ? response.error : 'Failed to add goal')
			}

			return response.data
		},
		onSuccess: () => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: ['matches', id, 'statistics'] })
		}
	})

	// Complete match day
	const completeMatchDayMutation = useMutation({
		mutationFn: async () => {
			// We need to check if this method exists or create it
			// For now, we'll use update to set isCompleted = true
			const response = await matchService.update(id, { isCompleted: true })

			if (!response.success) {
				throw new Error(typeof response.error === 'string' ? response.error : 'Failed to complete match day')
			}

			return response.data
		},
		onSuccess: () => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: ['matches', id] })
			queryClient.invalidateQueries({ queryKey: ['matches', id, 'statistics'] })
			queryClient.invalidateQueries({ queryKey: ['matches'] })
			queryClient.invalidateQueries({ queryKey: ['leagueTable'] })
		}
	})

	return {
		match: {
			data: matchQuery.data,
			isLoading: matchQuery.isLoading,
			isError: matchQuery.isError,
			error: matchQuery.error
		},
		statistics: {
			data: statisticsQuery.data,
			isLoading: statisticsQuery.isLoading,
			isError: statisticsQuery.isError,
			error: statisticsQuery.error
		},
		weather: {
			data: weatherQuery.data,
			isLoading: weatherQuery.isLoading,
			isError: weatherQuery.isError,
			error: weatherQuery.error
		},
		mutations: {
			saveData: saveDataMutation,
			addGoal: addGoalMutation,
			completeMatchDay: completeMatchDayMutation
		}
	}
}
