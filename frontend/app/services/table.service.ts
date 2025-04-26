'use client'

import { LeagueTableResponse } from '../types'
import api from './api-client'
import { AxiosError } from 'axios'

export const tableService = {
	getTable: async (): Promise<LeagueTableResponse> => {
		try {
			const response = await api.get('/api/table')
			return response.data
		} catch (error: unknown) {
			console.error('Error fetching league table:', error)
			const axiosError = error as AxiosError<{ error?: string }>
			return {
				success: false,
				data: { teams: [], lastUpdated: new Date().toISOString() },
				error: axiosError.response?.data?.error || 'Failed to fetch league table'
			}
		}
	}
}
