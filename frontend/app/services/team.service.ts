'use client'

import { Team, TeamsResponse, TeamResponse } from '../types'
import api from './api-client'
import { AxiosError } from 'axios'

export const teamService = {
	getAll: async (): Promise<TeamsResponse> => {
		try {
			const response = await api.get('/api/teams')
			return response.data
		} catch (error: unknown) {
			console.error('Error fetching teams:', error)
			const axiosError = error as AxiosError<{ error?: string }>
			return {
				success: false,
				data: [],
				error: axiosError.response?.data?.error || 'Failed to fetch teams'
			}
		}
	},

	getById: async (id: string): Promise<TeamResponse> => {
		try {
			const response = await api.get(`/api/teams/${id}`)
			return response.data
		} catch (error: unknown) {
			console.error(`Error fetching team ${id}:`, error)
			const axiosError = error as AxiosError<{ error?: string }>
			return {
				success: false,
				data: {} as Team,
				error: axiosError.response?.data?.error || 'Failed to fetch team'
			}
		}
	},

	create: async (teamData: Omit<Team, '_id' | 'createdAt' | 'updatedAt'>): Promise<TeamResponse> => {
		try {
			const response = await api.post('/api/teams', teamData)
			return response.data
		} catch (error: unknown) {
			console.error('Error creating team:', error)
			const axiosError = error as AxiosError<{ error?: string }>
			return {
				success: false,
				data: {} as Team,
				error: axiosError.response?.data?.error || 'Failed to create team'
			}
		}
	},

	update: async (id: string, teamData: Partial<Omit<Team, '_id' | 'createdAt' | 'updatedAt'>>): Promise<TeamResponse> => {
		try {
			const response = await api.put(`/api/teams/${id}`, teamData)
			return response.data
		} catch (error: unknown) {
			console.error(`Error updating team ${id}:`, error)
			const axiosError = error as AxiosError<{ error?: string }>
			return {
				success: false,
				data: {} as Team,
				error: axiosError.response?.data?.error || 'Failed to update team'
			}
		}
	},

	delete: async (id: string): Promise<TeamResponse> => {
		try {
			const response = await api.delete(`/api/teams/${id}`)
			return response.data
		} catch (error: unknown) {
			console.error(`Error deleting team ${id}:`, error)
			const axiosError = error as AxiosError<{ error?: string }>
			return {
				success: false,
				data: {} as Team,
				error: axiosError.response?.data?.error || 'Failed to delete team'
			}
		}
	}
}
