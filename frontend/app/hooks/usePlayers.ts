'use client'

import { useQuery } from '@tanstack/react-query'
import { playerApi } from '../services/api'
import { PlayersResponse } from '../types'

export function usePlayers() {
	return useQuery<PlayersResponse>({
		queryKey: ['players'],
		queryFn: async () => {
			console.log('Fetching players with React Query...')
			const response = await playerApi.getAll()
			console.log('Player API response:', response)

			if (!response.success) {
				throw new Error(typeof response.error === 'string' ? response.error : 'Failed to load players')
			}

			return response
		}
	})
}
