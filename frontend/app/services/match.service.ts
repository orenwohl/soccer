'use client'

import { Match, MatchesResponse, MatchResponse, TeamsResponse } from '../types'
import api from './api-client'
import Cookies from 'js-cookie'
import { AxiosError } from 'axios'

export interface StatisticsResponse {
	statistics: {
		teamId: string
		teamName: string
		played: number
		won: number
		drawn: number
		lost: number
		goalsFor: number
		goalsAgainst: number
	}[]
	gameResults: {
		team1: string
		team2: string
		team1Score: number
		team2Score: number
		date: string
		winner: string | null
	}[]
	topScorers?: {
		playerId: string
		playerName: string
		team: string
		goals: number
		matches: number
	}[]
}

export const matchService = {
	getAll: async (): Promise<MatchesResponse> => {
		try {
			const response = await api.get('/api/matches')
			return response.data
		} catch (error: unknown) {
			console.error('Error fetching matches:', error)
			const axiosError = error as AxiosError<{ error?: string }>
			return {
				success: false,
				data: [],
				error: axiosError.response?.data?.error || 'Failed to fetch matches'
			}
		}
	},

	getById: async (id: string): Promise<MatchResponse> => {
		try {
			console.log(`Calling getById API for match ID: ${id}`)
			console.log(`Full URL: ${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3030'}/api/matches/${id}`)

			const response = await api.get(`/api/matches/${id}`)
			console.log('API getById raw response:', response)

			return response.data
		} catch (error: unknown) {
			console.error(`Error fetching match ${id}:`, error)
			console.error('Full error object:', JSON.stringify(error, null, 2))

			const axiosError = error as AxiosError<{ error?: string }>
			if (axiosError.response) {
				console.error('Response error data:', axiosError.response.data)
				console.error('Response status:', axiosError.response.status)
			}

			return {
				success: false,
				data: {} as Match,
				error: axiosError.response?.data?.error || 'Failed to fetch match'
			}
		}
	},

	create: async (matchData: Omit<Match, '_id' | 'createdAt' | 'updatedAt'>): Promise<MatchResponse> => {
		try {
			// Check if you have a valid token
			const token = Cookies.get('token')
			console.log('Current auth token:', token)

			console.log('Match data received:', JSON.stringify(matchData, null, 2))
			const response = await api.post('/api/matches', matchData)
			return response.data
		} catch (error: unknown) {
			console.error('Detailed error:', error)
			const axiosError = error as AxiosError<{ error?: string; message?: string }>
			return {
				success: false,
				data: {} as Match,
				error: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to create match'
			}
		}
	},

	update: async (id: string, matchData: Partial<Omit<Match, '_id' | 'createdAt' | 'updatedAt'>>): Promise<MatchResponse> => {
		try {
			const response = await api.put(`/api/matches/${id}`, matchData)
			return response.data
		} catch (error: unknown) {
			console.error(`Error updating match ${id}:`, error)
			const axiosError = error as AxiosError<{ message?: string }>
			return {
				success: false,
				data: {} as Match,
				error: axiosError.response?.data?.message || 'Failed to update match'
			}
		}
	},

	delete: async (id: string): Promise<MatchResponse> => {
		try {
			const response = await api.delete(`/api/matches/${id}`)
			return response.data
		} catch (error: unknown) {
			console.error(`Error deleting match ${id}:`, error)
			const axiosError = error as AxiosError<{ message?: string }>
			return {
				success: false,
				data: {} as Match,
				error: axiosError.response?.data?.message || 'Failed to delete match'
			}
		}
	},

	generateTeams: async (data: { playerIds: string[]; numberOfTeams?: number; teamNames?: string[] }): Promise<TeamsResponse> => {
		const response = await api.post('/api/matches/generate-teams', data)
		return response.data
	},

	saveGameResult: async (
		gameDayId: string,
		resultData: {
			team1: string
			team2: string
			team1Score: number
			team2Score: number
			date: string
			winner: string | null
			goals?: Array<{
				playerId: string
				playerName: string
				teamId: string
				teamName: string
			}>
		}
	): Promise<{ success: boolean; data?: unknown; error?: string }> => {
		const response = await api.post(`/api/matches/${gameDayId}/game-result`, resultData)
		return response.data
	},

	saveStatistics: async (
		gameDayId: string,
		data: {
			statistics: Array<{
				teamId: string
				teamName: string
				played: number
				won: number
				drawn: number
				lost: number
				goalsFor: number
				goalsAgainst: number
			}>
		}
	): Promise<{ success: boolean; data?: unknown; error?: string }> => {
		const response = await api.post(`/api/matches/${gameDayId}/statistics`, data)
		return response.data
	},

	getStatistics: async (
		gameDayId: string
	): Promise<{
		success: boolean
		data?: {
			statistics: Array<{
				teamId: string
				teamName: string
				played: number
				won: number
				drawn: number
				lost: number
				goalsFor: number
				goalsAgainst: number
			}>
			gameResults: Array<{
				team1: string
				team2: string
				team1Score: number
				team2Score: number
				date: string
				winner: string | null
			}>
		}
		error?: string
	}> => {
		try {
			const response = await api.get(`/api/matches/${gameDayId}/statistics`)
			return response.data
		} catch (error) {
			console.error('Error fetching match statistics:', error)
			return { success: false, error: 'Failed to fetch match statistics' }
		}
	},

	saveMatchResult: async (
		gameDayId: string,
		matchId: string,
		resultData: {
			team1Score: number
			team2Score: number
		}
	): Promise<boolean> => {
		try {
			const response = await api.put(`/api/matches/${gameDayId}/match/${matchId}`, resultData)
			const data = await response.data
			return data.success
		} catch (error) {
			console.error('Error saving match result:', error)
			return false
		}
	},

	saveTeamStatistics: async (
		gameDayId: string,
		teamStats: Array<{
			teamId: string
			wins: number
			losses: number
			draws: number
			goalsFor: number
			goalsAgainst: number
		}>
	): Promise<boolean> => {
		try {
			const response = await api.post('/api/matches/stats', { teamStats })
			const data = await response.data
			return data.success
		} catch (error) {
			console.error('Error saving team statistics:', error)
			return false
		}
	},

	addGoal: async (
		gameDayId: string,
		goalData: {
			playerId: string
			playerName: string
			teamId: string
			teamName: string
			matchId?: string
		}
	): Promise<{ success: boolean; data?: unknown; error?: string }> => {
		try {
			console.log(`Calling addGoal API for game day ID: ${gameDayId}`, goalData)
			console.log(`Full URL: ${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3030'}/api/matches/${gameDayId}/goal`)

			const response = await api.post(`/api/matches/${gameDayId}/goal`, goalData)
			console.log('Goal API response:', response.data)
			return response.data
		} catch (error: unknown) {
			console.error('Error adding goal:', error)

			const axiosError = error as AxiosError
			if (axiosError.response) {
				console.error('Response error data:', axiosError.response.data)
				console.error('Response status:', axiosError.response.status)
			}

			return { success: false, error: 'Failed to add goal' }
		}
	},

	getTopScorers: async (): Promise<{
		success: boolean
		data?: Array<{ playerId: string; playerName: string; goals: number; matches: number }>
		error?: string
	}> => {
		try {
			// Use general stats endpoint that doesn't require a gameDay ID
			const response = await api.get('/api/stats/scorers')
			return response.data
		} catch (error) {
			console.error('Error fetching top scorers:', error)
			return { success: false, error: 'Failed to fetch top scorers' }
		}
	}
}
