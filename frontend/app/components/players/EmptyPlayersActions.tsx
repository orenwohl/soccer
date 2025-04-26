'use client'

import Link from 'next/link'
import { useState } from 'react'
import { playerService } from '@/app/services'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function EmptyPlayersActions() {
	const [error, setError] = useState<string | null>(null)
	const queryClient = useQueryClient()

	const createTestPlayer = useMutation({
		mutationFn: async () => {
			// Create a test player
			const testPlayer = {
				name: 'שחקן לדוגמה',
				email: `test${Date.now()}@example.com`,
				phone: '050-0000000',
				rating: 4,
				fitnessRating: 4,
				defenseRating: 4,
				techniqueRating: 4
			}

			return playerService.create(testPlayer)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['players'] })
		},
		onError: err => {
			console.error('Failed to create test player:', err)
			setError('Failed to create test player')
		}
	})

	return (
		<div className="text-center py-8">
			<p className="text-gray-600 mb-4">אין שחקנים להצגה. הוסף שחקנים חדשים כדי להתחיל.</p>

			<div className="flex justify-center space-x-4">
				<Link href="/players/new" className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md transition-colors">
					הוסף שחקן חדש
				</Link>

				<button
					onClick={() => createTestPlayer.mutate()}
					disabled={createTestPlayer.isPending}
					className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
				>
					{createTestPlayer.isPending ? 'יוצר שחקן...' : 'צור שחקן לדוגמה'}
				</button>
			</div>

			{error && <div className="mt-4 text-red-500">{error}</div>}
		</div>
	)
}
