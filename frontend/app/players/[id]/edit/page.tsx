'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { playerService } from '@/app/services/'
import { Input } from '@/components/ui/input'
import { usePlayer } from '@/app/hooks/usePlayers'
import { use } from 'react'
import { StarRating } from '@/app/services/svg.service'
import PlayerRatingField from '@/app/components/players/PlayerRatingField'
import { PlayerFormData, RatingFieldType } from '@/app/components/players/player.types'

export default function EditPlayerPage({ params }: { params: { id: string } }) {
	// Unwrap params with React.use() - using proper typing
	const unwrappedParams = use(params as unknown) as { id: string }
	const playerId = unwrappedParams.id

	const router = useRouter()
	const [formData, setFormData] = useState<PlayerFormData>({
		name: '',
		phone: '',
		rating: 3,
		fitnessRating: 3,
		defenseRating: 3,
		techniqueRating: 3
	})

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Fetch player data on component mount
	const { data: playerResponse, isLoading } = usePlayer(playerId)

	// Populate form with player data when it loads
	useEffect(() => {
		if (playerResponse?.success && playerResponse.data) {
			const player = playerResponse.data
			setFormData({
				name: player.name || '',
				phone: player.phone || '',
				rating: player.rating || 3,
				fitnessRating: player.fitnessRating || 3,
				defenseRating: player.defenseRating || 3,
				techniqueRating: player.techniqueRating || 3
			})
		}
	}, [playerResponse])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target
		setFormData({
			...formData,
			[name]: name === 'rating' || name === 'fitnessRating' || name === 'defenseRating' || name === 'techniqueRating' ? parseInt(value) : value
		})
	}

	// Handler for rating field changes
	const handleRatingChange = (field: RatingFieldType, value: number) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}))
	}

	// Calculate overall rating from component ratings
	useEffect(() => {
		const { fitnessRating, defenseRating, techniqueRating } = formData
		const calculatedRating = Math.round((fitnessRating + defenseRating + techniqueRating) / 3)

		setFormData(prev => ({
			...prev,
			rating: calculatedRating
		}))
	}, [formData.fitnessRating, formData.defenseRating, formData.techniqueRating])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// Basic validation
		if (!formData.name.trim()) {
			setError('שם השחקן הוא שדה חובה')
			return
		}

		setIsSubmitting(true)
		setError(null)

		try {
			const response = await playerService.update(playerId, formData)

			if (!response.success) {
				const errorMessage = typeof response.error === 'string' ? response.error : 'Failed to update player'
				throw new Error(errorMessage)
			}

			router.push('/players')
			router.refresh()
		} catch (err) {
			console.error('Failed to update player:', err)
			const errorMessage = err instanceof Error ? err.message : 'נכשל בעדכון שחקן. אנא נסה שוב.'
			setError(errorMessage)
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
			</div>
		)
	}

	return (
		<div>
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-green-800 mb-2">עריכת שחקן</h1>
				<p className="text-gray-600">עדכן את פרטי השחקן ודירוג המיומנות</p>
			</div>

			<div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
				<form onSubmit={handleSubmit} dir="rtl">
					{error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
							שם מלא *
						</label>
						<Input
							id="name"
							name="name"
							type="text"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
							value={formData.name}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
							מספר טלפון
						</label>
						<Input
							id="phone"
							name="phone"
							type="tel"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
							value={formData.phone}
							onChange={handleChange}
						/>
					</div>

					<div className="mb-5">
						<h3 className="block text-gray-700 font-bold mb-3">דירוג יכולות השחקן</h3>

						<div className="space-y-4">
							<PlayerRatingField field="fitnessRating" value={formData.fitnessRating} onChange={handleRatingChange} />

							<PlayerRatingField field="defenseRating" value={formData.defenseRating} onChange={handleRatingChange} />

							<PlayerRatingField field="techniqueRating" value={formData.techniqueRating} onChange={handleRatingChange} />
						</div>
					</div>

					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2">דירוג כללי (מחושב אוטומטית)</label>
						<div className="flex items-center justify-end bg-gray-50 p-2 rounded-md">
							<div className="text-3xl font-bold text-green-700">{formData.rating}</div>
							<StarRating rating={formData.rating} size="lg" className="ml-2" />
						</div>
					</div>

					<div className="flex justify-between items-center mt-6">
						<button type="submit" className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-md transition-colors disabled:bg-gray-400" disabled={isSubmitting}>
							{isSubmitting ? 'שומר...' : 'עדכן שחקן'}
						</button>
						<Link href="/players" className="text-gray-600 hover:text-gray-800">
							ביטול
						</Link>
					</div>
				</form>
			</div>
		</div>
	)
}
