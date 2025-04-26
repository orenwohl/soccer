'use client'

import { Player, PlayersResponse, PlayerResponse } from '../types'
import api from './api-client'
import { AxiosError } from 'axios'

export const playerService = {
	getAll: async (): Promise<PlayersResponse> => {
		try {
			const response = await api.get('/api/players')
			return response.data
		} catch (error: unknown) {
			console.error('Error fetching players:', error)
			const axiosError = error as AxiosError<{ error?: string }>
			return {
				success: false,
				data: [],
				error: axiosError.response?.data?.error || 'Failed to fetch players'
			}
		}
	},

	getById: async (id: string): Promise<PlayerResponse> => {
		try {
			const response = await api.get(`/api/players/${id}`)
			return response.data
		} catch (error: unknown) {
			console.error(`Error fetching player ${id}:`, error)
			const axiosError = error as AxiosError<{ error?: string }>
			return {
				success: false,
				data: {} as Player,
				error: axiosError.response?.data?.error || 'Failed to fetch player'
			}
		}
	},

	create: async (playerData: Omit<Player, '_id' | 'createdAt' | 'updatedAt'>): Promise<PlayerResponse> => {
		try {
			const response = await api.post('/api/players', playerData)
			return response.data
		} catch (error: unknown) {
			console.error('Error creating player:', error)
			const axiosError = error as AxiosError<{ error?: string }>
			return {
				success: false,
				data: {} as Player,
				error: axiosError.response?.data?.error || 'Failed to create player'
			}
		}
	},

	update: async (id: string, playerData: Partial<Omit<Player, '_id' | 'createdAt' | 'updatedAt'>>): Promise<PlayerResponse> => {
		try {
			const response = await api.put(`/api/players/${id}`, playerData)
			return response.data
		} catch (error: unknown) {
			console.error(`Error updating player ${id}:`, error)
			const axiosError = error as AxiosError<{ error?: string }>
			return {
				success: false,
				data: {} as Player,
				error: axiosError.response?.data?.error || 'Failed to update player'
			}
		}
	},

	delete: async (id: string): Promise<PlayerResponse> => {
		try {
			const response = await api.delete(`/api/players/${id}`)
			return response.data
		} catch (error: unknown) {
			console.error(`Error deleting player ${id}:`, error)
			const axiosError = error as AxiosError<{ error?: string }>
			return {
				success: false,
				data: {} as Player,
				error: axiosError.response?.data?.error || 'Failed to delete player'
			}
		}
	}
}
