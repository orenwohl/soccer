// In a real application, this would be fetched from the API
async function getLeagueTable() {
	// Mock data for demonstration
	return {
		success: true,
		data: {
			teams: [
				{
					name: 'קבוצה אדומה',
					played: 5,
					won: 4,
					drawn: 1,
					lost: 0,
					goalsFor: 15,
					goalsAgainst: 7,
					goalDifference: 8,
					points: 13,
				},
				{
					name: 'קבוצה כחולה',
					played: 5,
					won: 2,
					drawn: 2,
					lost: 1,
					goalsFor: 10,
					goalsAgainst: 8,
					goalDifference: 2,
					points: 8,
				},
				{
					name: 'קבוצה ירוקה',
					played: 5,
					won: 2,
					drawn: 1,
					lost: 2,
					goalsFor: 12,
					goalsAgainst: 10,
					goalDifference: 2,
					points: 7,
				},
				{
					name: 'קבוצה צהובה',
					played: 5,
					won: 0,
					drawn: 0,
					lost: 5,
					goalsFor: 5,
					goalsAgainst: 17,
					goalDifference: -12,
					points: 0,
				},
			],
			lastUpdated: new Date().toISOString(),
		},
	};
}

// Mock recent matches
async function getRecentMatches() {
	return [
		{
			teams: [
				{name: 'קבוצה אדומה', score: 3},
				{name: 'קבוצה כחולה', score: 1},
			],
			date: '2023-04-15T14:00:00Z',
			location: 'פארק מרכזי',
		},
		{
			teams: [
				{name: 'קבוצה ירוקה', score: 2},
				{name: 'קבוצה כחולה', score: 2},
			],
			date: '2023-04-08T14:00:00Z',
			location: 'מגרש נחל',
		},
		{
			teams: [
				{name: 'קבוצה אדומה', score: 4},
				{name: 'קבוצה צהובה', score: 2},
			],
			date: '2023-04-01T14:00:00Z',
			location: 'פארק מרכזי',
		},
	];
}

export default async function TablePage() {
	const {data: leagueTable} = await getLeagueTable();
	const recentMatches = await getRecentMatches();

	// Format date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('he-IL', {month: 'short', day: 'numeric', year: 'numeric'});
	};

	return (
		<div dir='rtl'>
			<div className='mb-6'>
				<h1 className='text-3xl font-bold text-green-800 mb-2'>טבלת ליגה</h1>
				<p className='text-gray-600'>דירוג נוכחי על סמך תוצאות המשחקים</p>
			</div>

			<div className='bg-white rounded-lg shadow overflow-hidden mb-8'>
				<table className='min-w-full divide-y divide-gray-200'>
					<thead className='bg-gray-50'>
						<tr>
							<th
								scope='col'
								className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
								מיקום
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
								קבוצה
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
								מש&quot;
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
								נצ&quot;
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
								תיקו
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
								הפ&quot;
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
								בעד
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
								נגד
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
								הפרש
							</th>
							<th
								scope='col'
								className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
								נק&quot;
							</th>
						</tr>
					</thead>
					<tbody className='bg-white divide-y divide-gray-200'>
						{leagueTable.teams.map((team, index) => (
							<tr
								key={team.name}
								className={`
                  hover:bg-gray-50
                  ${index === 0 ? 'bg-green-50' : ''}
                  ${index === leagueTable.teams.length - 1 ? 'bg-red-50' : ''}
                `}>
								<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
									{index + 1}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
									{team.name}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center'>
									{team.played}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center'>
									{team.won}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center'>
									{team.drawn}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center'>
									{team.lost}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center'>
									{team.goalsFor}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center'>
									{team.goalsAgainst}
								</td>
								<td
									className={`px-6 py-4 whitespace-nowrap text-sm text-center font-medium
                  ${
						team.goalDifference > 0
							? 'text-green-600'
							: team.goalDifference < 0
							? 'text-red-600'
							: 'text-gray-500'
					}
                `}>
									{team.goalDifference > 0 ? '+' : ''}
									{team.goalDifference}
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center'>
									{team.points}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div>
				<h2 className='text-2xl font-bold text-green-800 mb-4'>תוצאות אחרונות</h2>
				<div className='bg-white rounded-lg shadow overflow-hidden'>
					<ul className='divide-y divide-gray-200'>
						{recentMatches.map((match, index) => (
							<li
								key={index}
								className='p-4 hover:bg-gray-50'>
								<div className='flex flex-col sm:flex-row justify-between'>
									<div className='font-medium'>
										<span
											className={`${
												match.teams[0].score > match.teams[1].score ? 'font-bold' : ''
											}`}>
											{match.teams[0].name} {match.teams[0].score}
										</span>
										{' - '}
										<span
											className={`${
												match.teams[1].score > match.teams[0].score ? 'font-bold' : ''
											}`}>
											{match.teams[1].score} {match.teams[1].name}
										</span>
									</div>
									<div className='text-gray-500 text-sm mt-1 sm:mt-0'>
										{formatDate(match.date)} • {match.location}
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}
