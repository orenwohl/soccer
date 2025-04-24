'use client';

import {TeamStats} from '../../types';
import {format} from 'date-fns';
import {he} from 'date-fns/locale';

interface LeagueTableProps {
	teams: TeamStats[];
	lastUpdated: string;
}

export default function LeagueTable({teams, lastUpdated}: LeagueTableProps) {
	if (teams.length === 0) {
		return (
			<div className='text-center py-8'>
				<p className='text-gray-600 mb-4'>אין סטטיסטיקות להצגה. יש להשלים משחקים כדי לראות את טבלת הליגה.</p>
			</div>
		);
	}

	// Sort teams by points (descending), goal difference (descending), goals for (descending)
	const sortedTeams = [...teams].sort((a, b) => {
		if (a.points !== b.points) return b.points - a.points;
		if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
		return b.goalsFor - a.goalsFor;
	});

	return (
		<div className='w-full'>
			<div className='px-4 py-2 bg-gray-50 text-sm text-gray-500'>
				עודכן לאחרונה: {format(new Date(lastUpdated), 'PPP בשעה HH:mm', {locale: he})}
			</div>

			<div className='overflow-x-auto'>
				<table className='min-w-full divide-y divide-gray-200'>
					<thead className='bg-green-700'>
						<tr>
							<th
								scope='col'
								className='px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider'>
								מיקום
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider'>
								קבוצה
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider'>
								מש&apos;
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider'>
								נצ&apos;
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider'>
								תק&apos;
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider'>
								הפ&apos;
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider'>
								שע&apos;
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider'>
								ס&apos;
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider'>
								נק&apos;
							</th>
						</tr>
					</thead>

					<tbody className='bg-white divide-y divide-gray-200'>
						{sortedTeams.map((team, index) => (
							<tr
								key={team.name}
								className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
								<td className='px-6 py-4 whitespace-nowrap text-center'>{index + 1}</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='font-medium text-gray-900'>{team.name}</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-center'>{team.played}</td>
								<td className='px-6 py-4 whitespace-nowrap text-center'>{team.won}</td>
								<td className='px-6 py-4 whitespace-nowrap text-center'>{team.drawn}</td>
								<td className='px-6 py-4 whitespace-nowrap text-center'>{team.lost}</td>
								<td className='px-6 py-4 whitespace-nowrap text-center'>{team.goalsFor}</td>
								<td className='px-6 py-4 whitespace-nowrap text-center'>{team.goalsAgainst}</td>
								<td className='px-6 py-4 whitespace-nowrap text-center font-bold'>{team.points}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
