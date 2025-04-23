'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { playerApi } from '@/app/services/api'
import { Input } from '@/components/ui/input'

export default function NewPlayerPage() {
	const router = useRouter()
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		rating: 3
	})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target
		setFormData({
			...formData,
			[name]: name === 'rating' ? parseInt(value) : value
		})
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		setError(null)

		try {
			// Call the actual API to create the player
			const response = await playerApi.create(formData)

			if (!response.success) {
				const errorMessage = typeof response.error === 'string' ? response.error : 'Failed to create player'
				throw new Error(errorMessage)
			}

			console.log('Player created successfully:', response.data)

			// Navigate back to players list
			router.push('/players')
			router.refresh()
		} catch (err) {
			console.error('Failed to create player:', err)
			const errorMessage = err instanceof Error ? err.message : 'נכשל ביצירת שחקן. אנא נסה שוב.'
			setError(errorMessage)
		} finally {
			setIsSubmitting(false)
		}
	}

	// Render star rating
	const renderStars = () => {
		const stars = []
		for (let i = 1; i <= 5; i++) {
			stars.push(
				<button key={i} type="button" onClick={() => setFormData({ ...formData, rating: i })} className={`text-2xl ${i <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
					★
				</button>
			)
		}
		return stars
	}

	return (
		<div>
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-green-800 mb-2">הוסף שחקן חדש</h1>
				<p className="text-gray-600">הרשם שחקן חדש עם פרטיו ודירוג המיומנות שלו</p>
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
						<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
							אימייל *
						</label>
						<Input
							id="email"
							name="email"
							type="email"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
							value={formData.email}
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

					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rating">
							דירוג כישרון *
						</label>
						<div className="flex items-center justify-end gap-1">{renderStars()}</div>
					</div>

					<div className="flex justify-between items-center">
						<button type="submit" className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-md transition-colors disabled:bg-gray-400" disabled={isSubmitting}>
							{isSubmitting ? 'שומר...' : 'שמור שחקן'}
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
