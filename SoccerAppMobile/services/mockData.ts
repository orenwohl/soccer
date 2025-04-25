// Mock data for offline functionality
export const mockPlayers = [
	{
		id: '1',
		name: 'אדם לוי',
		rating: 88,
	},
	{
		id: '2',
		name: 'דניאל כהן',
		rating: 82,
	},
	{
		id: '3',
		name: 'יוסי אברהם',
		rating: 75,
	},
	{
		id: '4',
		name: 'אלכס מזרחי',
		rating: 79,
	},
	{
		id: '5',
		name: 'עידן גולן',
		rating: 90,
	},
];

export const mockMatches = [
	{
		id: '1',
		date: new Date().toISOString(),
		location: 'מגרש העירייה',
		players: ['1', '2', '3', '4'],
	},
	{
		id: '2',
		date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
		location: 'מגרש בית ספר',
		players: ['2', '3', '5'],
	},
	{
		id: '3',
		date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
		location: 'מרכז הספורט',
		players: ['1', '3', '4', '5'],
	},
];

export const mockLeagueTable = [
	{
		id: '1',
		name: 'אדם לוי',
		gamesPlayed: 15,
		goals: 12,
		assists: 8,
		points: 32,
	},
	{
		id: '5',
		name: 'עידן גולן',
		gamesPlayed: 13,
		goals: 18,
		assists: 6,
		points: 42,
	},
	{
		id: '2',
		name: 'דניאל כהן',
		gamesPlayed: 14,
		goals: 9,
		assists: 11,
		points: 29,
	},
];
