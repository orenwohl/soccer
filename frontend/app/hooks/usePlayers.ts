'use client'

import { useQuery } from '@tanstack/react-query'
import { playerService } from '../services/'
import { PlayerResponse, PlayersResponse } from '../types'

export function usePlayers() {
	return useQuery<PlayersResponse>({
		queryKey: ['players'],
		queryFn: async () => {
			console.log('Fetching players with React Query...')
			const response = await playerService.getAll()
			console.log('Player API response:', response)

			if (!response.success) {
				throw new Error(typeof response.error === 'string' ? response.error : 'Failed to load players')
			}

			return response
		}
	})
}

export function usePlayer(id: string) {
	return useQuery<PlayerResponse>({
		queryKey: ['player', id],
		queryFn: async () => {
			const response = await playerService.getById(id)

			if (!response.success) {
				throw new Error(typeof response.error === 'string' ? response.error : 'Failed to load player')
			}

			return response
		}
	})
}
