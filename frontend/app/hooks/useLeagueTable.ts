'use client'

import { useQuery } from '@tanstack/react-query'
import { tableApi } from '../services/api'
import { LeagueTableResponse } from '../types'

export function useLeagueTable() {
	return useQuery<LeagueTableResponse>({
		queryKey: ['leagueTable'],
		queryFn: async () => {
			const response = await tableApi.getTable()

			if (!response.success) {
				throw new Error(typeof response.error === 'string' ? response.error : 'Failed to load league table')
			}

			return response
		},
		staleTime: 5 * 60 * 1000 // 5 minutes - league table data doesn't change as frequently
	})
}
