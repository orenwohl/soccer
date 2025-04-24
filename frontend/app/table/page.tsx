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
			return;
		}

		try {
			setIsLoadingGameday(true);
			setGamedayError(null);
			setSelectedGameDay(gameDayId);

			const statsResponse = await matchApi.getStatistics(gameDayId);

			if (statsResponse.success && statsResponse.data) {
				// המרת סטטיסטיקות לפורמט TeamStats
				const teamStats = statsResponse.data.statistics.map((stat) => ({
					name: stat.teamName,
					played: stat.played,
					won: stat.won,
					drawn: stat.drawn,
					lost: stat.lost,
					goalsFor: stat.goalsFor,
					goalsAgainst: stat.goalsAgainst,
					goalDifference: stat.goalsFor - stat.goalsAgainst,
					points: stat.won * 3 + stat.drawn,
				}));

				setGamedayTeams(teamStats);
				setGamedayLastUpdated(new Date().toISOString());
			} else {
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
				<p className='text-gray-600'>דירוג נוכחי על סמך תוצאות המשחקים</p>
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
								<option value=''>טבלה עדכנית</option>
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

			<LeagueTable
				teams={teams}
				lastUpdated={lastUpdated}
			/>
		</div>
	);
}
