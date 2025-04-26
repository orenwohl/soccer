import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { WeatherDisplay } from '@/app/components/WeatherDisplay'
import type { GameDay, Game, GameDayPlayerStats } from '@/app/types'

interface OverviewTabProps {
	gameDay: GameDay
	activeGames: Game[]
	topScorers: GameDayPlayerStats[]
}

export function OverviewTab({ gameDay, activeGames, topScorers }: OverviewTabProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
			{/* Basic Information */}
			<Card>
				<CardHeader>
					<CardTitle>מידע כללי</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<h4 className="text-sm font-medium text-gray-500">תאריך</h4>
							<p>{gameDay.date}</p>
						</div>
						<div>
							<h4 className="text-sm font-medium text-gray-500">מיקום</h4>
							<p>{gameDay.location || 'לא צוין'}</p>
						</div>
						<div>
							<h4 className="text-sm font-medium text-gray-500">מספר קבוצות</h4>
							<p>{gameDay.teams?.length || 0}</p>
						</div>
						<div>
							<h4 className="text-sm font-medium text-gray-500">מספר שחקנים</h4>
							<p>{gameDay.teams?.reduce((total, team) => total + (team.players?.length || 0), 0) || 0}</p>
						</div>
						<div>
							<h4 className="text-sm font-medium text-gray-500">מספר משחקים</h4>
							<p>{activeGames.length}</p>
						</div>
						<div>
							<h4 className="text-sm font-medium text-gray-500">סטטוס</h4>
							<p>{gameDay.isCompleted ? 'הושלם' : 'פעיל'}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Weather Information */}
			<WeatherDisplay location={gameDay.location} />

			{/* Top Scorers */}
			<Card className="md:col-span-2">
				<CardHeader>
					<CardTitle>מובילי הכיבושים</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full text-right">
							<thead>
								<tr className="border-b">
									<th className="pb-2 font-medium text-gray-500">שחקן</th>
									<th className="pb-2 font-medium text-gray-500">קבוצה</th>
									<th className="pb-2 font-medium text-gray-500 text-center">גולים</th>
									<th className="pb-2 font-medium text-gray-500 text-center">משחקים</th>
								</tr>
							</thead>
							<tbody>
								{topScorers.length > 0 ? (
									topScorers
										.sort((a, b) => b.goals - a.goals)
										.slice(0, 10)
										.map((scorer, idx) => (
											<tr key={idx} className="border-b last:border-b-0">
												<td className="py-2">{scorer.playerName}</td>
												<td className="py-2">{scorer.team}</td>
												<td className="py-2 text-center">{scorer.goals}</td>
												<td className="py-2 text-center">{scorer.matches}</td>
											</tr>
										))
								) : (
									<tr>
										<td colSpan={4} className="py-4 text-center text-gray-500">
											אין נתוני כיבושים
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
