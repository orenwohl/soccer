'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Team } from '@/app/types'
import StarRating from '@/app/components/StarRating'
import { DatePicker } from '@/app/components/DatePicker'
import { Button } from '@/components/ui/button'

// Function to render star rating
// Demo team data - in a real app, this would be fetched from the API or passed from team generation
const DEMO_TEAMS: Team[] = [
	{
		name: 'קבוצה אדומה',
		players: [
			{ playerId: '1', name: 'יוסי כהן', rating: 5 },
			{ playerId: '3', name: 'משה ישראלי', rating: 5 },
			{ playerId: '5', name: 'דוד אברהם', rating: 4 },
			{ playerId: '7', name: 'אלכס וייס', rating: 3 }
		],
		averageRating: 4.25,
		score: 0
	},
	{
		name: 'קבוצה כחולה',
		players: [
			{ playerId: '2', name: 'דנה לוי', rating: 4 },
			{ playerId: '4', name: 'שרה רבין', rating: 3 },
			{ playerId: '6', name: 'מיכל דוד', rating: 4 },
			{ playerId: '8', name: 'לאה גולן', rating: 3 }
		],
		averageRating: 3.5,
		score: 0
	}
]

export default function NewMatchPage() {
	const router = useRouter()
	const [date, setDate] = useState<Date>(new Date())
	const [formData, setFormData] = useState({
		time: '18:00',
		location: '',
		teams: DEMO_TEAMS
	})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData({
			...formData,
			[name]: value
		})
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		setError(null)

		try {
			// In a real app, this would call the API
			// Format the data for API submission
			const matchData = {
				date: new Date(`${date.toISOString().split('T')[0]}T${formData.time}`).toISOString(),
				location: formData.location,
				teams: formData.teams,
				isCompleted: false
			}

			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 500))
			console.log('Submitted match data:', matchData)

			router.push('/matches')
			router.refresh()
		} catch (err) {
			setError('נכשל ביצירת משחק. אנא נסה שוב.')
			console.error(err)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div dir="rtl">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-green-800 mb-2">יצירת משחק חדש</h1>
				<p className="text-gray-600">תזמון משחק חדש עם הקבוצות שנבחרו</p>
			</div>

			<div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
				<form onSubmit={handleSubmit}>
					{error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
							תאריך *
						</label>
						<DatePicker date={date} setDate={newDate => newDate && setDate(newDate)} />
					</div>

					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
							שעה *
						</label>
						<input
							id="time"
							name="time"
							type="time"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
							value={formData.time}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="mb-6">
						<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
							מיקום *
						</label>
						<input
							id="location"
							name="location"
							type="text"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
							value={formData.location}
							onChange={handleChange}
							placeholder="לדוגמה: מגרש הפארק המרכזי 3"
							required
						/>
					</div>

					<div className="mb-6">
						<h3 className="text-lg font-bold mb-3">קבוצות</h3>
						<div className="grid gap-4 md:grid-cols-2">
							{formData.teams.map((team, index) => (
								<div key={index} className={`border rounded-lg p-4 ${index === 0 ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
									<h4 className="font-bold mb-2">{team.name}</h4>
									<div className="text-sm mb-2">דירוג ממוצע: {team.averageRating}</div>
									<ul className="text-sm">
										{team.players.map(player => (
											<li key={player.playerId} className="mb-1 flex justify-between">
												<span>{player.name}</span>
												<span className="text-gray-600">{<StarRating rating={player.rating} />}</span>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
						<div className="mt-2 text-sm text-gray-600">
							<Link href="/matches/generate" className="text-blue-600 hover:underline">
								יצירת קבוצות אחרות
							</Link>
						</div>
					</div>

					<div className="flex justify-between items-center">
						<Button type="submit" className="bg-green-700 hover:bg-green-800" disabled={isSubmitting}>
							{isSubmitting ? 'יוצר...' : 'יצירת משחק'}
						</Button>
						<Button variant="ghost" asChild>
							<Link href="/matches">ביטול</Link>
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}
