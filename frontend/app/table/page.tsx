'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import {useAuth} from '../context/AuthContext';
import {useLeagueTable} from '../hooks/useLeagueTable';
import LeagueTable from '../components/table/LeagueTable';
import ErrorMessage from '../components/ErrorMessage';
import {matchApi} from '../services/api';
import {GameDay, Match, TeamStats} from '../types';
import {format} from 'date-fns';
import {he} from 'date-fns/locale';

// הוספת הגדרות טיפוסים חסרות
interface GameResult {
	team1: string;
	team2: string;
	team1Score: number;
	team2Score: number;
	date: string;
	winner: string | null;
	finished?: boolean;
}

interface Game {
	team1Index: number;
	team2Index: number;
	scores: [number, number];
	finished?: boolean;
}

interface TeamPlayerType {
	name: string;
	// הגדרות נוספות שעשויות להיות נדרשות
	playerId?: string;
	rating?: number;
	goals?: number;
}

interface ExtendedMatch extends Match {
	games?: Game[];
	teams?: Array<{
		name: string;
		players: TeamPlayerType[];
	}>;
}

export default function TablePage() {
	const router = useRouter();
	const {loading: authLoading} = useAuth();
	const {data, isLoading, error, isError} = useLeagueTable();
	const [gamedays, setGamedays] = useState<GameDay[]>([]);
	const [selectedGameDay, setSelectedGameDay] = useState<string | null>(null);
	const [gamedayTeams, setGamedayTeams] = useState<TeamStats[]>([]);
	const [gamedayLastUpdated, setGamedayLastUpdated] = useState<string>('');
	const [isLoadingGameday, setIsLoadingGameday] = useState(false);
	const [gamedayError, setGamedayError] = useState<string | null>(null);

	const teams = selectedGameDay ? gamedayTeams : data?.data?.teams || [];
	const lastUpdated = selectedGameDay ? gamedayLastUpdated : data?.data?.lastUpdated || new Date().toISOString();
	const errorMessage = selectedGameDay ? gamedayError : isError ? (error as Error).message : null;
	const showLoading = (isLoading && !selectedGameDay) || (isLoadingGameday && !!selectedGameDay) || authLoading;

	// Log the current state for debugging
	useEffect(() => {
		if (selectedGameDay) {
			console.log('Selected gameday teams:', gamedayTeams);
		} else {
			console.log('Main league table teams:', data?.data?.teams);
		}
	}, [selectedGameDay, gamedayTeams, data?.data?.teams]);

	// Auth check
	useEffect(() => {
		if (authLoading) return;

		const token = Cookies.get('token');
		if (!token) {
			router.push('/login');
		}
	}, [router, authLoading]);

	// Fetch game days
	useEffect(() => {
		const fetchGamedays = async () => {
			try {
				const response = await matchApi.getAll();
				if (response.success) {
					// המרת נתוני Match לפורמט GameDay
					const gamedays: GameDay[] = response.data.map((match: Match) => ({
						...match,
						matches: [], // אתחול מערך matches כמערך ריק
					}));

					// מיון לפי תאריך (החדש ביותר קודם)
					const sortedGamedays = gamedays
						.filter((gameday) => gameday.isCompleted) // רק ימי משחק שהסתיימו
						.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

					setGamedays(sortedGamedays);
				}
			} catch (err) {
				console.error('Error fetching gamedays:', err);
			}
		};

		fetchGamedays();
	}, []);

	// טיפול בבחירת יום משחק
	const handleGameDayChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
		const gameDayId = event.target.value;

		if (!gameDayId) {
			setSelectedGameDay(null);
			setGamedayTeams([]);
			return;
		}

		try {
			setIsLoadingGameday(true);
			setGamedayError(null);
			setSelectedGameDay(gameDayId);

			console.log(`Fetching statistics for gameday ID: ${gameDayId}`);
			const statsResponse = await matchApi.getStatistics(gameDayId);
			console.log('Statistics response:', statsResponse);

			if (statsResponse.success && statsResponse.data) {
				// Check if we have statistics data
				let teamStats: TeamStats[] = [];

				if (
					statsResponse.data.statistics &&
					Array.isArray(statsResponse.data.statistics) &&
					statsResponse.data.statistics.length > 0
				) {
					// Use server-provided statistics if available
					console.log('Using server-provided statistics');

					teamStats = statsResponse.data.statistics.map((stat) => {
						return {
							name: stat.teamName || 'קבוצה לא ידועה',
							played: stat.played || 0,
							won: stat.won || 0,
							drawn: stat.drawn || 0,
							lost: stat.lost || 0,
							goalsFor: stat.goalsFor || 0,
							goalsAgainst: stat.goalsAgainst || 0,
							goalDifference: (stat.goalsFor || 0) - (stat.goalsAgainst || 0),
							points: (stat.won || 0) * 3 + (stat.drawn || 0),
						};
					});
				}
				// If statistics array is empty but we have game results, calculate statistics from game results
				else if (
					statsResponse.data.gameResults &&
					Array.isArray(statsResponse.data.gameResults) &&
					statsResponse.data.gameResults.length > 0
				) {
					console.log('Calculating statistics from game results');
					const gameResults = statsResponse.data.gameResults;
					console.log('Game results:', gameResults);

					// Create a map to collect team stats
					const teamsMap = new Map<string, TeamStats>();

					// Process each game result
					gameResults.forEach((result: GameResult) => {
						// Skip incomplete games
						if (!result.finished) return;

						// Get or create team1 stats
						if (!teamsMap.has(result.team1)) {
							teamsMap.set(result.team1, {
								name: result.team1,
								played: 0,
								won: 0,
								drawn: 0,
								lost: 0,
								goalsFor: 0,
								goalsAgainst: 0,
								goalDifference: 0,
								points: 0,
							});
						}

						// Get or create team2 stats
						if (!teamsMap.has(result.team2)) {
							teamsMap.set(result.team2, {
								name: result.team2,
								played: 0,
								won: 0,
								drawn: 0,
								lost: 0,
								goalsFor: 0,
								goalsAgainst: 0,
								goalDifference: 0,
								points: 0,
							});
						}

						const team1Stats = teamsMap.get(result.team1)!;
						const team2Stats = teamsMap.get(result.team2)!;

						// Update games played
						team1Stats.played++;
						team2Stats.played++;

						// Update goals
						team1Stats.goalsFor += result.team1Score;
						team1Stats.goalsAgainst += result.team2Score;
						team2Stats.goalsFor += result.team2Score;
						team2Stats.goalsAgainst += result.team1Score;

						// Update wins/losses/draws
						if (result.team1Score > result.team2Score) {
							team1Stats.won++;
							team1Stats.points += 3;
							team2Stats.lost++;
						} else if (result.team1Score < result.team2Score) {
							team2Stats.won++;
							team2Stats.points += 3;
							team1Stats.lost++;
						} else {
							team1Stats.drawn++;
							team1Stats.points += 1;
							team2Stats.drawn++;
							team2Stats.points += 1;
						}

						// Calculate goal difference
						team1Stats.goalDifference = team1Stats.goalsFor - team1Stats.goalsAgainst;
						team2Stats.goalDifference = team2Stats.goalsFor - team2Stats.goalsAgainst;

						// Update teams in the map
						teamsMap.set(result.team1, team1Stats);
						teamsMap.set(result.team2, team2Stats);
					});

					// Convert the map values to an array
					teamStats = Array.from(teamsMap.values());
					console.log('Calculated team stats:', teamStats);
				} else {
					// בדיקת אפשרות שלישית - האם יש משחקים בתוך נתוני יום המשחק
					const gameDayResponse = await matchApi.getById(gameDayId);
					console.log('GameDay response:', gameDayResponse);

					if (gameDayResponse.success && gameDayResponse.data) {
						const matchData = gameDayResponse.data as ExtendedMatch;

						if (matchData.games && Array.isArray(matchData.games)) {
							console.log('Calculating statistics directly from gameday games');
							const games = matchData.games;
							const teams = matchData.teams || [];

							// יצירת מפה לאיסוף סטטיסטיקות קבוצה
							const teamsMap = new Map<string, TeamStats>();

							// הוספת כל הקבוצות למפה תחילה
							teams.forEach((team) => {
								if (team.name) {
									teamsMap.set(team.name, {
										name: team.name,
										played: 0,
										won: 0,
										drawn: 0,
										lost: 0,
										goalsFor: 0,
										goalsAgainst: 0,
										goalDifference: 0,
										points: 0,
									});
								}
							});

							// עיבוד כל משחק
							games.forEach((game: Game) => {
								// דלג על משחקים שלא הסתיימו
								if (!game.finished) return;

								const team1Name = teams[game.team1Index]?.name;
								const team2Name = teams[game.team2Index]?.name;

								if (!team1Name || !team2Name) return;

								// ודא שהקבוצות קיימות במפה
								if (!teamsMap.has(team1Name)) {
									teamsMap.set(team1Name, {
										name: team1Name,
										played: 0,
										won: 0,
										drawn: 0,
										lost: 0,
										goalsFor: 0,
										goalsAgainst: 0,
										goalDifference: 0,
										points: 0,
									});
								}

								if (!teamsMap.has(team2Name)) {
									teamsMap.set(team2Name, {
										name: team2Name,
										played: 0,
										won: 0,
										drawn: 0,
										lost: 0,
										goalsFor: 0,
										goalsAgainst: 0,
										goalDifference: 0,
										points: 0,
									});
								}

								const team1Score = game.scores[0];
								const team2Score = game.scores[1];
								const team1Stats = teamsMap.get(team1Name)!;
								const team2Stats = teamsMap.get(team2Name)!;

								// עדכון משחקים ששוחקו
								team1Stats.played++;
								team2Stats.played++;

								// עדכון שערים
								team1Stats.goalsFor += team1Score;
								team1Stats.goalsAgainst += team2Score;
								team2Stats.goalsFor += team2Score;
								team2Stats.goalsAgainst += team1Score;

								// עדכון ניצחונות/הפסדים/תיקו
								if (team1Score > team2Score) {
									team1Stats.won++;
									team1Stats.points += 3;
									team2Stats.lost++;
								} else if (team1Score < team2Score) {
									team2Stats.won++;
									team2Stats.points += 3;
									team1Stats.lost++;
								} else {
									team1Stats.drawn++;
									team1Stats.points += 1;
									team2Stats.drawn++;
									team2Stats.points += 1;
								}

								// חישוב הפרש שערים
								team1Stats.goalDifference = team1Stats.goalsFor - team1Stats.goalsAgainst;
								team2Stats.goalDifference = team2Stats.goalsFor - team2Stats.goalsAgainst;

								// עדכון קבוצות במפה
								teamsMap.set(team1Name, team1Stats);
								teamsMap.set(team2Name, team2Stats);
							});

							// המרת ערכי המפה למערך
							teamStats = Array.from(teamsMap.values());
							console.log('Calculated team stats from gameday games:', teamStats);
						} else {
							console.warn('No statistics, game results, or gameday games found');
						}
					} else {
						console.warn('No statistics, game results, or gameday games found');
					}
				}

				// Sort the team stats by points and goal difference
				const sortedTeamStats = teamStats.sort((a, b) => {
					// First by points (descending)
					if (b.points !== a.points) return b.points - a.points;
					// Then by goal difference (descending)
					if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
					// Then by goals scored (descending)
					return b.goalsFor - a.goalsFor;
				});

				console.log('Processed gameday teams:', sortedTeamStats);

				// Check if we have valid data
				if (sortedTeamStats.length === 0) {
					setGamedayError('אין נתונים סטטיסטיים עבור יום משחק זה');
					setGamedayTeams([]);
				} else {
					setGamedayTeams(sortedTeamStats);
					setGamedayLastUpdated(new Date().toISOString());
				}
			} else {
				console.error('Failed to get statistics:', statsResponse.error);
				setGamedayError('לא ניתן לטעון סטטיסטיקות ליום משחק זה');
				setGamedayTeams([]);
			}
		} catch (error) {
			console.error('Error loading gameday statistics:', error);
			setGamedayError('שגיאה בטעינת סטטיסטיקות');
			setGamedayTeams([]);
		} finally {
			setIsLoadingGameday(false);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return format(date, 'PPP', {locale: he});
	};

	if (showLoading) {
		return (
			<div
				dir='rtl'
				className='flex justify-center items-center h-64'>
				<div className='text-center'>
					<div className='text-xl font-semibold mb-2'>טוען נתוני ליגה...</div>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-800 mx-auto'></div>
				</div>
			</div>
		);
	}

	return (
		<div dir='rtl'>
			<div className='mb-6'>
				<h1 className='text-3xl font-bold text-green-800 mb-2'>טבלת ליגה</h1>
				<p className='text-gray-600'>
					{selectedGameDay ? 'טבלת דירוג ליום משחק ספציפי' : 'דירוג נוכחי על סמך תוצאות המשחקים'}
				</p>
			</div>

			{gamedays.length > 0 && (
				<div className='mb-6'>
					<div className='flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4'>
						<div className='text-sm font-medium text-gray-700'>הצג טבלה ליום משחק:</div>
						<div className='w-full md:w-64'>
							<select
								onChange={handleGameDayChange}
								value={selectedGameDay || ''}
								className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'>
								{gamedays.map((gameday) => (
									<option
										key={gameday._id}
										value={gameday._id}>
										{formatDate(gameday.date)}
									</option>
								))}
							</select>
						</div>
						{selectedGameDay && (
							<button
								onClick={() => setSelectedGameDay(null)}
								className='text-sm text-blue-600 hover:text-blue-800 hover:underline'>
								הצג טבלה עדכנית
							</button>
						)}
					</div>
				</div>
			)}

			<ErrorMessage message={errorMessage} />

			{teams.length === 0 && !showLoading && !errorMessage ? (
				<div className='text-center p-10 bg-gray-50 rounded-lg border border-gray-200'>
					<p className='text-gray-600'>אין נתוני טבלה להצגה</p>
					{selectedGameDay && (
						<button
							onClick={() => setSelectedGameDay(null)}
							className='mt-4 text-sm text-blue-600 hover:text-blue-800 hover:underline'>
							הצג טבלה עדכנית
						</button>
					)}
				</div>
			) : (
				<div className='bg-white rounded-lg shadow-md overflow-hidden'>
					<div className='overflow-x-auto'>
						<LeagueTable
							teams={teams}
							lastUpdated={lastUpdated}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
