'use client'

import { TeamStats } from '../../types'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

interface LeagueTableProps {
	teams: TeamStats[]
	lastUpdated: string
}

export default function LeagueTable({ teams, lastUpdated }: LeagueTableProps) {
	if (teams.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-600 mb-4">אין סטטיסטיקות להצגה. יש להשלים משחקים כדי לראות את טבלת הליגה.</p>
			</div>
		)
	}

	// Sort teams by points (descending), goal difference (descending), goals for (descending)
	const sortedTeams = [...teams].sort((a, b) => {
		if (a.points !== b.points) return b.points - a.points
		if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference
		return b.goalsFor - a.goalsFor
	})

	return (
		<div className="bg-white rounded-lg shadow overflow-hidden">
			<div className="px-4 py-2 bg-gray-50 text-sm text-gray-500">עודכן לאחרונה: {format(new Date(lastUpdated), 'PPP בשעה HH:mm', { locale: he })}</div>

			<table className="min-w-full divide-y divide-gray-200">
				<thead className="bg-gray-50">
					<tr>
						<th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
							מיקום
						</th>
						<th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
							קבוצה
						</th>
						<th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
							מש'
						</th>
						<th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
							נצ'
						</th>
						<th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
							תק'
						</th>
						<th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
							הפ'
						</th>
						<th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
							שע'
						</th>
						<th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
							ס'
						</th>
						<th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
							נק'
						</th>
					</tr>
				</thead>

				<tbody className="bg-white divide-y divide-gray-200">
					{sortedTeams.map((team, index) => (
						<tr key={team.name} className="hover:bg-gray-50">
							<td className="px-6 py-4 whitespace-nowrap text-center">{index + 1}</td>
							<td className="px-6 py-4 whitespace-nowrap">
								<div className="font-medium text-gray-900">{team.name}</div>
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-center">{team.played}</td>
							<td className="px-6 py-4 whitespace-nowrap text-center">{team.won}</td>
							<td className="px-6 py-4 whitespace-nowrap text-center">{team.drawn}</td>
							<td className="px-6 py-4 whitespace-nowrap text-center">{team.lost}</td>
							<td className="px-6 py-4 whitespace-nowrap text-center">{team.goalsFor}</td>
							<td className="px-6 py-4 whitespace-nowrap text-center">{team.goalsAgainst}</td>
							<td className="px-6 py-4 whitespace-nowrap text-center font-bold">{team.points}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
