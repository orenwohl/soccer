'use client';

import {useState, useEffect, ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {TeamPlayer, Match} from '@/app/types';
import {matchApi} from '@/app/services/api';

// Function to render star rating
const renderRatingStars = (rating: number) => {
	const fullStars = Math.floor(rating);
	const halfStar = rating % 1 >= 0.5;
	const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

	return (
		<div className='flex'>
			{/* Full stars */}
			{Array.from({length: fullStars}).map((_, i) => (
				<svg
					key={`full-${i}`}
					className='w-4 h-4 text-yellow-400'
					fill='currentColor'
					viewBox='0 0 20 20'
					xmlns='http://www.w3.org/2000/svg'>
					<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'></path>
				</svg>
			))}

			{/* Half star */}
			{halfStar && (
				<svg
					className='w-4 h-4 text-yellow-400'
					fill='currentColor'
					viewBox='0 0 20 20'
					xmlns='http://www.w3.org/2000/svg'>
					<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'></path>
				</svg>
			)}

			{/* Empty stars */}
			{Array.from({length: emptyStars}).map((_, i) => (
				<svg
					key={`empty-${i}`}
					className='w-4 h-4 text-gray-300'
					fill='currentColor'
					viewBox='0 0 20 20'
					xmlns='http://www.w3.org/2000/svg'>
					<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'></path>
				</svg>
			))}
		</div>
	);
};

// Button component in shadcn-like style
interface ButtonProps {
	children: ReactNode;
	variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
	className?: string;
	disabled?: boolean;
	onClick?: () => void;
	[key: string]: unknown;
}

function Button({children, variant = 'default', className = '', ...props}: ButtonProps) {
	const variantClasses = {
		default: 'bg-green-700 text-white hover:bg-green-800',
		secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
		destructive: 'bg-red-600 text-white hover:bg-red-700',
		outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
		ghost: 'bg-transparent hover:bg-gray-100',
		link: 'bg-transparent text-green-600 underline-offset-4 hover:underline',
	};

	return (
		<button
			className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${className}`}
			{...props}>
			{children}
		</button>
	);
}

// Card component in shadcn-like style
function Card({children, className = ''}: {children: ReactNode; className?: string}) {
	return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
}

function CardHeader({children, className = ''}: {children: ReactNode; className?: string}) {
	return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
}

function CardTitle({children, className = ''}: {children: ReactNode; className?: string}) {
	return <h3 className={`text-xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
}

function CardContent({children, className = ''}: {children: ReactNode; className?: string}) {
	return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

// Default color if no color is specified
const DEFAULT_COLOR = '#9ca3af'; // Gray

export default function GameDayPage({params}: {params: {id: string}}) {
	const [gameDay, setGameDay] = useState<Match | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState('teams');
	const [isRebalancing, setIsRebalancing] = useState(false);
	const [transferMode, setTransferMode] = useState<'swap' | 'transfer'>('swap');
	const [selectedPlayerForSwap, setSelectedPlayerForSwap] = useState<{playerId: string; teamIndex: number} | null>(
		null
	);
	const [activeGames, setActiveGames] = useState<
		{team1Index: number; team2Index: number; scores: [number, number]}[]
	>([]);
	const [teamStatistics, setTeamStatistics] = useState<
		{
			teamIndex: number;
			teamName?: string;
			played: number;
			won: number;
			lost: number;
			drawn: number;
			goalsFor: number;
			goalsAgainst: number;
		}[]
	>([]);
	const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
	const [waitingTeams, setWaitingTeams] = useState<number[]>([]);
	const [lastWinner, setLastWinner] = useState<number | null>(null);
	const router = useRouter();

	useEffect(() => {
		const fetchGameDay = async () => {
			try {
				setIsLoading(true);
				console.log('Fetching match data for ID:', params.id);
				const response = await matchApi.getById(params.id);
				console.log('Match API response:', response);

				if (response.success) {
					console.log('Match data loaded:', response.data);
					if (response.data.teams) {
						console.log(
							'Team names:',
							response.data.teams.map((t: any) => t.name)
						);
					}

					// המשך הקוד הקיים

					setGameDay(response.data);
					// Initialize waiting teams with all team indices
					const initialWaitingTeams = Array.from({length: response.data.teams.length}, (_, i) => i);
					setWaitingTeams(initialWaitingTeams);

					// Fetch statistics from server
					console.log('Fetching statistics for match ID:', params.id);
					const statsResponse = await matchApi.getStatistics(params.id);
					console.log('Statistics API response:', statsResponse);
					if (statsResponse.success && statsResponse.data) {
						console.log('Statistics loaded from server:', statsResponse.data);

						// Convert server statistics to local format
						if (statsResponse.data.statistics && statsResponse.data.statistics.length > 0) {
							const serverStats = statsResponse.data.statistics;
							console.log('Server statistics:', serverStats);

							const localStats = serverStats
								.map((stat) => {
									// Find the team index based on the team name
									const teamIndex = response.data.teams.findIndex(
										(team) => team.name === stat.teamName
									);

									console.log(`Looking for index for team ${stat.teamName}, index:`, teamIndex);

									if (teamIndex !== -1) {
										return {
											teamIndex,
											teamName: stat.teamName,
											played: stat.played,
											won: stat.won,
											drawn: stat.drawn,
											lost: stat.lost,
											goalsFor: stat.goalsFor,
											goalsAgainst: stat.goalsAgainst,
										};
									}
									return null;
								})
								.filter(Boolean); // Remove any null entries

							console.log('Local statistics after conversion:', localStats);

							setTeamStatistics(
								localStats as {
									teamIndex: number;
									teamName?: string;
									played: number;
									won: number;
									lost: number;
									drawn: number;
									goalsFor: number;
									goalsAgainst: number;
								}[]
							);
						}

						// Setup active games from saved game results
						if (statsResponse.data.gameResults && statsResponse.data.gameResults.length > 0) {
							console.log('Game results found:', statsResponse.data.gameResults);
							// If there are completed games, we'll only show the table
							// Active games are managed locally during the current session
						}
					}
				} else {
					console.error('Error response from API:', response.error);
					setError(typeof response.error === 'string' ? response.error : 'שגיאה בטעינת נתוני יום המשחקים');
				}
			} catch (err) {
				console.error('Error fetching match data:', err);
				setError('שגיאה בטעינת נתוני יום המשחקים');
			} finally {
				setIsLoading(false);
			}
		};

		fetchGameDay();
	}, [params.id]);

	// Add rebalance teams functionality
	const rebalanceTeams = () => {
		if (!gameDay) return;

		// Set rebalancing state to true
		setIsRebalancing(true);

		// Reset selected player for swap if any
		setSelectedPlayerForSwap(null);

		// Collect all players from all teams into a single array
		const allPlayers: TeamPlayer[] = [];
		gameDay.teams.forEach((team) => {
			if (team.players && team.players.length > 0) {
				allPlayers.push(...team.players);
			}
		});

		// Sort players by rating (highest first)
		allPlayers.sort((a, b) => b.rating - a.rating);

		// Calculate how many players should be in each team
		const totalPlayers = allPlayers.length;
		const numTeams = gameDay.teams.length;
		const basePlayersPerTeam = Math.floor(totalPlayers / numTeams); // Minimum players per team
		const extraPlayers = totalPlayers % numTeams; // Number of teams that will get an extra player

		// Initialize team players arrays
		const teamPlayers: TeamPlayer[][] = Array(numTeams)
			.fill(null)
			.map(() => []);

		// Use setTimeout to create a visual delay for the rebalancing effect
		setTimeout(() => {
			// Distribute players using serpentine draft method (snake draft) while ensuring equal number of players
			let playerIndex = 0;

			// First, ensure each team has the minimum number of players
			for (let round = 0; round < basePlayersPerTeam; round++) {
				// Forward direction for even rounds
				if (round % 2 === 0) {
					for (let team = 0; team < numTeams; team++) {
						teamPlayers[team].push(allPlayers[playerIndex]);
						playerIndex++;
					}
				}
				// Backward direction for odd rounds
				else {
					for (let team = numTeams - 1; team >= 0; team--) {
						teamPlayers[team].push(allPlayers[playerIndex]);
						playerIndex++;
					}
				}
			}

			// Distribute remaining players (if any) to the first 'extraPlayers' teams
			// We go in reverse order so the teams with lower indices (which got the first picks)
			// don't always get the extra player
			if (extraPlayers > 0) {
				const extraDirection = basePlayersPerTeam % 2 === 0 ? -1 : 1; // Continue the snake pattern
				let team = extraDirection === 1 ? 0 : numTeams - 1;

				for (let i = 0; i < extraPlayers; i++) {
					teamPlayers[team].push(allPlayers[playerIndex]);
					playerIndex++;
					team += extraDirection;

					// Safety check to avoid index out of bounds
					if (team >= numTeams) team = numTeams - 1;
					if (team < 0) team = 0;
				}
			}

			// Update gameDay with the player assignments but preserve other properties
			const updatedTeams = gameDay.teams.map((team, idx) => {
				const players = teamPlayers[idx];
				const totalRating = players.reduce((sum, p) => sum + p.rating, 0);
				const averageRating = players.length > 0 ? totalRating / players.length : 0;

				return {
					...team, // Preserve name and other properties
					players,
					averageRating,
				};
			});

			// Update gameDay state
			setGameDay({
				...gameDay,
				teams: updatedTeams,
			});

			// Set rebalancing state back to false
			setIsRebalancing(false);
		}, 800); // Add a short delay for visual effect
	};

	// Add team player swap functionality
	const handlePlayerSelection = (playerId: string, teamIndex: number) => {
		if (
			selectedPlayerForSwap &&
			selectedPlayerForSwap.playerId === playerId &&
			selectedPlayerForSwap.teamIndex === teamIndex
		) {
			// Cancel selection if clicking the same player
			setSelectedPlayerForSwap(null);
		} else if (selectedPlayerForSwap) {
			if (transferMode === 'swap') {
				// In swap mode, exchange players between teams
				swapPlayers(selectedPlayerForSwap.playerId, selectedPlayerForSwap.teamIndex, playerId, teamIndex);
			} else {
				// In transfer mode, just move the selected player to the new team
				movePlayerToTeam(selectedPlayerForSwap.playerId, selectedPlayerForSwap.teamIndex, teamIndex);
			}
		} else {
			// Start selection
			setSelectedPlayerForSwap({playerId, teamIndex});
		}
	};

	// Swap players between teams
	const swapPlayers = (player1Id: string, team1Index: number, player2Id: string, team2Index: number) => {
		if (!gameDay || team1Index === team2Index) {
			setSelectedPlayerForSwap(null);
			return;
		}

		const updatedTeams = [...gameDay.teams];

		// Find both players
		const team1 = updatedTeams[team1Index];
		const team2 = updatedTeams[team2Index];

		if (!team1.players || !team2.players) {
			setSelectedPlayerForSwap(null);
			return;
		}

		const player1Index = team1.players.findIndex((p) => p.playerId === player1Id);
		const player2Index = team2.players.findIndex((p) => p.playerId === player2Id);

		if (player1Index === -1 || player2Index === -1) {
			setSelectedPlayerForSwap(null);
			return;
		}

		// Get both players
		const player1 = team1.players[player1Index];
		const player2 = team2.players[player2Index];

		// Swap them
		team1.players[player1Index] = player2;
		team2.players[player2Index] = player1;

		// Recalculate average ratings
		[team1Index, team2Index].forEach((teamIndex) => {
			const team = updatedTeams[teamIndex];
			if (team.players && team.players.length > 0) {
				const totalRating = team.players.reduce((sum, p) => sum + p.rating, 0);
				team.averageRating = totalRating / team.players.length;
			} else {
				team.averageRating = 0;
			}
		});

		setGameDay({
			...gameDay,
			teams: updatedTeams,
		});

		setSelectedPlayerForSwap(null);
	};

	// Move player between teams
	const movePlayerToTeam = (playerId: string, sourceTeamIndex: number, targetTeamIndex: number) => {
		if (!gameDay || sourceTeamIndex === targetTeamIndex) {
			setSelectedPlayerForSwap(null);
			return;
		}

		const updatedTeams = [...gameDay.teams];

		// Find the player in the source team
		const sourceTeam = updatedTeams[sourceTeamIndex];
		const playerIndex = sourceTeam.players?.findIndex((p) => p.playerId === playerId) ?? -1;

		if (playerIndex === -1 || !sourceTeam.players) {
			setSelectedPlayerForSwap(null);
			return;
		}

		// Get the player and remove from source team
		const [player] = sourceTeam.players.splice(playerIndex, 1);

		// Add to target team
		if (!updatedTeams[targetTeamIndex].players) {
			updatedTeams[targetTeamIndex].players = [];
		}
		updatedTeams[targetTeamIndex].players?.push(player);

		// Recalculate average ratings
		[sourceTeamIndex, targetTeamIndex].forEach((teamIndex) => {
			const team = updatedTeams[teamIndex];
			if (team.players && team.players.length > 0) {
				const totalRating = team.players.reduce((sum, p) => sum + p.rating, 0);
				team.averageRating = totalRating / team.players.length;
			} else {
				team.averageRating = 0;
			}
		});

		setGameDay({
			...gameDay,
			teams: updatedTeams,
		});

		setSelectedPlayerForSwap(null);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('he-IL', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// Render teams tab
	const renderTeamsTab = () => {
		if (!gameDay) return null;

		return (
			<div>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-xl font-semibold'>קבוצות</h2>

					{/* Transfer mode toggle */}
					<div className='flex items-center bg-gray-50 p-2 rounded-md'>
						<span className='text-sm font-medium mr-2'>מצב העברת שחקנים:</span>
						<div className='flex border border-gray-300 rounded-md overflow-hidden'>
							<button
								type='button'
								onClick={() => setTransferMode('swap')}
								className={`px-3 py-1.5 text-sm ${
									transferMode === 'swap'
										? 'bg-green-600 text-white'
										: 'bg-white text-gray-700 hover:bg-gray-50'
								}`}>
								החלפת שחקנים
							</button>
							<button
								type='button'
								onClick={() => setTransferMode('transfer')}
								className={`px-3 py-1.5 text-sm ${
									transferMode === 'transfer'
										? 'bg-green-600 text-white'
										: 'bg-white text-gray-700 hover:bg-gray-50'
								}`}>
								העברת שחקן
							</button>
						</div>
					</div>
				</div>

				{selectedPlayerForSwap && (
					<div className='mb-4 bg-orange-50 border border-orange-200 p-3 rounded-md'>
						<p className='text-orange-700'>
							בחרת שחקן להעברה.
							{transferMode === 'swap'
								? ' בחר שחקן אחר כדי להחליף ביניהם,'
								: ' בחר קבוצה אחרת כדי להעביר אליה את השחקן,'}
							או לחץ שוב על אותו שחקן לביטול.
						</p>
					</div>
				)}

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4'>
					{gameDay.teams.map((team, teamIndex) => (
						<div
							key={teamIndex}
							className={`bg-white rounded-lg shadow-sm border-2 p-4 ${
								selectedPlayerForSwap &&
								transferMode === 'transfer' &&
								selectedPlayerForSwap.teamIndex !== teamIndex
									? 'cursor-pointer hover:bg-green-50' // Highlight as drop target in transfer mode
									: ''
							}`}
							style={{
								borderColor: team.color || DEFAULT_COLOR,
							}}
							// Allow clicking on the team container in transfer mode
							onClick={() => {
								if (
									selectedPlayerForSwap &&
									transferMode === 'transfer' &&
									selectedPlayerForSwap.teamIndex !== teamIndex
								) {
									// When in transfer mode and a player is selected, clicking a team moves the player there
									movePlayerToTeam(
										selectedPlayerForSwap.playerId,
										selectedPlayerForSwap.teamIndex,
										teamIndex
									);
								}
							}}>
							<div className='flex items-center mb-3'>
								<div
									className='w-4 h-4 rounded-full mr-2'
									style={{
										backgroundColor: team.color || DEFAULT_COLOR,
									}}></div>
								<h3 className='font-medium text-lg'>{team.name}</h3>
								<span className='text-sm text-gray-500 ml-auto'>
									דירוג ממוצע: {team.averageRating?.toFixed(1) || 0}
								</span>
							</div>

							<ul className='space-y-2'>
								{team.players?.map((player) => (
									<li
										key={player.playerId}
										onClick={(e) => {
											e.stopPropagation(); // Prevent team click event from triggering
											handlePlayerSelection(player.playerId, teamIndex);
										}}
										className={`flex justify-between items-center text-sm p-2 rounded-md cursor-pointer hover:bg-gray-50 ${
											selectedPlayerForSwap &&
											selectedPlayerForSwap.playerId === player.playerId &&
											selectedPlayerForSwap.teamIndex === teamIndex
												? 'ring-2 ring-orange-500 bg-orange-50'
												: ''
										}`}>
										<span>{player.name}</span>
										{renderRatingStars(player.rating)}
									</li>
								))}
								{!team.players?.length && (
									<li className='text-gray-400 text-center py-2'>אין שחקנים</li>
								)}
							</ul>
						</div>
					))}
				</div>

				<div className='flex justify-center'>
					<button
						type='button'
						onClick={rebalanceTeams}
						disabled={isRebalancing}
						className={`mt-4 px-4 py-2 rounded-md flex items-center justify-center transition-all ${
							isRebalancing ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'
						}`}>
						{isRebalancing ? (
							<>
								<svg
									className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'>
									<circle
										className='opacity-25'
										cx='12'
										cy='12'
										r='10'
										stroke='currentColor'
										strokeWidth='4'></circle>
									<path
										className='opacity-75'
										fill='currentColor'
										d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
								</svg>
								מערבב קבוצות...
							</>
						) : (
							<>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-5 w-5 mr-1.5'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
									/>
								</svg>
								איזון קבוצות מחדש
							</>
						)}
					</button>

					<button
						type='button'
						onClick={async () => {
							if (!gameDay) return;

							try {
								setIsSubmitting(true);
								const response = await matchApi.update(params.id, {
									teams: gameDay.teams,
								});

								if (response.success) {
									alert('הקבוצות נשמרו בהצלחה!');
								} else {
									alert('שגיאה בשמירת הקבוצות: ' + response.error);
								}
							} catch (err) {
								console.error('Failed to save teams:', err);
								alert('שגיאה בשמירת הקבוצות');
							} finally {
								setIsSubmitting(false);
							}
						}}
						disabled={isSubmitting}
						className='mt-4 mr-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'>
						{isSubmitting ? 'שומר...' : 'שמור שינויים'}
					</button>
				</div>
			</div>
		);
	};

	// Render overview tab
	const renderOverviewTab = () => {
		if (!gameDay) return null;

		return (
			<div>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<Card>
						<CardHeader>
							<CardTitle>פרטי יום המשחקים</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								<div>
									<h4 className='text-sm font-medium text-gray-500'>תאריך</h4>
									<p>{formatDate(gameDay.date)}</p>
								</div>
								<div>
									<h4 className='text-sm font-medium text-gray-500'>מקום</h4>
									<p>{gameDay.location || 'לא צוין'}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>סיכום משחקים</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								<div>
									<h4 className='text-sm font-medium text-gray-500'>סטטוס</h4>
									<div
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm ${
											gameDay.isCompleted
												? 'bg-green-100 text-green-800'
												: 'bg-yellow-100 text-yellow-800'
										}`}>
										{gameDay.isCompleted ? 'הסתיים' : 'פעיל'}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	};

	// Render games and table tab
	const renderGamesAndTableTab = () => {
		if (!gameDay) return null;

		return (
			<div>
				<div className='flex items-center justify-between mb-6'>
					<h2 className='text-xl font-semibold'>טבלה ומשחקים</h2>
				</div>

				{/* בחירת קבוצות ראשונית */}
				{activeGames.length === 0 && teamStatistics.length === 0 && (
					<div className='mb-6 p-4 bg-gray-50 rounded-lg border'>
						<h3 className='text-lg font-medium mb-3'>בחר 2 קבוצות להתחלה</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
							{gameDay.teams.map((team, index) => (
								<div
									key={index}
									onClick={() => toggleTeamSelection(index)}
									className={`p-3 rounded-md cursor-pointer flex items-center ${
										selectedTeams.includes(index)
											? 'bg-green-100 border-2 border-green-500'
											: 'bg-white border border-gray-300 hover:bg-gray-50'
									}`}>
									<div
										className='w-4 h-4 rounded-full mr-2'
										style={{
											backgroundColor: team.color || DEFAULT_COLOR,
										}}></div>
									<span>{team.name}</span>
								</div>
							))}
						</div>
						<button
							onClick={addSelectedTeamsToGame}
							disabled={selectedTeams.length !== 2}
							className='px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 hover:bg-blue-700'>
							התחל משחק
						</button>
					</div>
				)}

				{/* משחקים פעילים */}
				{activeGames.length > 0 && (
					<div className='mb-6'>
						<h3 className='text-lg font-medium mb-3'>משחקים פעילים</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{activeGames.map((game, gameIndex) => (
								<div
									key={gameIndex}
									className='bg-white p-4 rounded-lg shadow-sm border'>
									<div className='flex justify-between items-center mb-4'>
										<h4 className='font-medium'>משחק {gameIndex + 1}</h4>
									</div>

									{/* קבוצה 1 */}
									<div className='mb-3 flex items-center'>
										<div
											className='w-4 h-4 rounded-full mr-2'
											style={{
												backgroundColor: gameDay.teams[game.team1Index].color || DEFAULT_COLOR,
											}}></div>
										<span className='flex-1'>{gameDay.teams[game.team1Index].name}</span>
										<input
											type='number'
											min='0'
											value={game.scores[0]}
											onChange={(e) =>
												updateGameScore(gameIndex, 1, parseInt(e.target.value) || 0)
											}
											className='w-16 border rounded p-2 text-center'
										/>
									</div>

									{/* קבוצה 2 */}
									<div className='mb-4 flex items-center'>
										<div
											className='w-4 h-4 rounded-full mr-2'
											style={{
												backgroundColor: gameDay.teams[game.team2Index].color || DEFAULT_COLOR,
											}}></div>
										<span className='flex-1'>{gameDay.teams[game.team2Index].name}</span>
										<input
											type='number'
											min='0'
											value={game.scores[1]}
											onChange={(e) =>
												updateGameScore(gameIndex, 2, parseInt(e.target.value) || 0)
											}
											className='w-16 border rounded p-2 text-center'
										/>
									</div>

									<button
										onClick={() => finishGame(gameIndex)}
										disabled={isSubmitting}
										className='w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50'>
										{isSubmitting ? 'שומר...' : 'סיים משחק'}
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* כפתור להוספת משחק חדש */}
				{waitingTeams.length > 0 && (activeGames.length > 0 || teamStatistics.length > 0) && (
					<div className='mb-6'>
						<div className='p-4 bg-gray-50 rounded-lg border'>
							<h3 className='text-lg font-medium mb-3'>בחר קבוצות למשחק הבא</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
								{gameDay.teams.map((team, index) => {
									// הצג רק קבוצות שלא משחקות כרגע
									const isPlaying = activeGames.some(
										(game) => game.team1Index === index || game.team2Index === index
									);

									if (isPlaying) return null;

									return (
										<div
											key={index}
											onClick={() => toggleTeamSelection(index)}
											className={`p-3 rounded-md cursor-pointer flex items-center ${
												selectedTeams.includes(index)
													? 'bg-green-100 border-2 border-green-500'
													: 'bg-white border border-gray-300 hover:bg-gray-50'
											}`}>
											<div
												className='w-4 h-4 rounded-full mr-2'
												style={{
													backgroundColor: team.color || DEFAULT_COLOR,
												}}></div>
											<span>{team.name}</span>
										</div>
									);
								})}
							</div>
							<div className='flex flex-wrap gap-2'>
								<button
									onClick={addSelectedTeamsToGame}
									disabled={selectedTeams.length !== 2}
									className='px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 hover:bg-blue-700'>
									התחל משחק חדש
								</button>

								{lastWinner !== null && waitingTeams.length > 0 && (
									<button
										onClick={addNextGame}
										className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700'>
										משחק מהיר: {gameDay.teams[waitingTeams[0]].name} נגד{' '}
										{gameDay.teams[lastWinner].name}
									</button>
								)}
							</div>
						</div>
					</div>
				)}

				{/* טבלת סטטיסטיקות */}
				{teamStatistics.length > 0 && (
					<div className='mb-6'>
						<h3 className='text-lg font-medium mb-3'>טבלת תוצאות</h3>
						<div className='bg-white rounded-lg shadow overflow-hidden'>
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
									{teamStatistics
										.sort((a, b) => {
											// סידור לפי נקודות (נצחון = 3, תיקו = 1)
											const pointsA = a.won * 3 + a.drawn;
											const pointsB = b.won * 3 + b.drawn;

											if (pointsB !== pointsA) {
												return pointsB - pointsA;
											}

											// יחס שערים
											const goalDiffA = a.goalsFor - a.goalsAgainst;
											const goalDiffB = b.goalsFor - b.goalsAgainst;

											return goalDiffB - goalDiffA;
										})
										.map((stat, index) => {
											const points = stat.won * 3 + stat.drawn;
											// קבל את שם הקבוצה ישירות או דרך אינדקס
											const teamName = stat.teamName || gameDay.teams[stat.teamIndex]?.name || '';
											const goalDifference = stat.goalsFor - stat.goalsAgainst;

											return (
												<tr
													key={stat.teamIndex}
													className={`
														hover:bg-gray-50
														${index === 0 ? 'bg-green-50' : ''}
														${index === teamStatistics.length - 1 && teamStatistics.length > 1 ? 'bg-red-50' : ''}
													`}>
													<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
														{index + 1}
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
														<div className='flex items-center'>
															<div
																className='w-3 h-3 rounded-full mr-2'
																style={{
																	backgroundColor:
																		gameDay.teams.find((t) => t.name === teamName)
																			?.color || DEFAULT_COLOR,
																}}></div>
															{teamName}
														</div>
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center'>
														{stat.played}
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center'>
														{stat.won}
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center'>
														{stat.drawn}
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center'>
														{stat.lost}
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center'>
														{stat.goalsFor}
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center'>
														{stat.goalsAgainst}
													</td>
													<td
														className={`px-6 py-4 whitespace-nowrap text-sm text-center font-medium
															${goalDifference > 0 ? 'text-green-600' : goalDifference < 0 ? 'text-red-600' : 'text-gray-500'}
														`}>
														{goalDifference > 0 ? '+' : ''}
														{goalDifference}
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center'>
														{points}
													</td>
												</tr>
											);
										})}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* כפתור לשמירת כל הנתונים */}
				{teamStatistics.length > 0 && (
					<div className='mt-8 flex justify-center'>
						<button
							onClick={() => saveAllData()}
							disabled={isSubmitting}
							className='px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50'>
							{isSubmitting ? 'שומר נתונים...' : 'שמור את כל נתוני יום המשחקים'}
						</button>
					</div>
				)}
			</div>
		);
	};

	// הוספת קבוצות נבחרות למשחק
	const addSelectedTeamsToGame = () => {
		if (selectedTeams.length !== 2 || !gameDay) return;

		// יצירת משחק חדש עם הקבוצות הנבחרות
		const newGame = {
			team1Index: selectedTeams[0],
			team2Index: selectedTeams[1],
			scores: [0, 0] as [number, number],
		};

		setActiveGames([...activeGames, newGame]);

		// עדכון הקבוצות המחכות
		const teamsInActiveGames = activeGames.flatMap((game) => [game.team1Index, game.team2Index]);
		teamsInActiveGames.push(selectedTeams[0], selectedTeams[1]);

		// מצא את כל הקבוצות שלא משחקות כרגע
		const allTeamIndexes = gameDay.teams.map((_, index) => index);
		const newWaitingTeams = allTeamIndexes.filter((index) => !teamsInActiveGames.includes(index));

		setWaitingTeams(newWaitingTeams);

		// איפוס הבחירה
		setSelectedTeams([]);
	};

	// עדכון תוצאת משחק
	const updateGameScore = (gameIndex: number, teamNumber: 1 | 2, score: number) => {
		const updatedGames = [...activeGames];
		if (teamNumber === 1) {
			updatedGames[gameIndex].scores[0] = score;
		} else {
			updatedGames[gameIndex].scores[1] = score;
		}
		setActiveGames(updatedGames);
	};

	// סיום משחק ועדכון סטטיסטיקות
	const finishGame = async (gameIndex: number) => {
		if (!gameDay) return;

		setIsSubmitting(true);

		try {
			const game = activeGames[gameIndex];
			const team1Score = game.scores[0];
			const team2Score = game.scores[1];

			// עדכון הסטטיסטיקות
			const updatedStats = [...teamStatistics];

			// מציאת או יצירת סטטיסטיקה עבור קבוצה 1
			let team1Stat = updatedStats.find((stat) => stat.teamIndex === game.team1Index);
			if (!team1Stat) {
				team1Stat = {
					teamIndex: game.team1Index,
					played: 0,
					won: 0,
					lost: 0,
					drawn: 0,
					goalsFor: 0,
					goalsAgainst: 0,
				};
				updatedStats.push(team1Stat);
			}

			// מציאת או יצירת סטטיסטיקה עבור קבוצה 2
			let team2Stat = updatedStats.find((stat) => stat.teamIndex === game.team2Index);
			if (!team2Stat) {
				team2Stat = {
					teamIndex: game.team2Index,
					played: 0,
					won: 0,
					lost: 0,
					drawn: 0,
					goalsFor: 0,
					goalsAgainst: 0,
				};
				updatedStats.push(team2Stat);
			}

			// עדכון המשחקים ששוחקו
			team1Stat.played += 1;
			team2Stat.played += 1;

			// עדכון הגולים
			team1Stat.goalsFor += team1Score;
			team1Stat.goalsAgainst += team2Score;
			team2Stat.goalsFor += team2Score;
			team2Stat.goalsAgainst += team1Score;

			let winner: number | null = null;

			// עדכון ניצחונות/הפסדים/תיקו
			if (team1Score > team2Score) {
				// קבוצה 1 ניצחה
				team1Stat.won += 1;
				team2Stat.lost += 1;
				winner = game.team1Index;
			} else if (team2Score > team1Score) {
				// קבוצה 2 ניצחה
				team2Stat.won += 1;
				team1Stat.lost += 1;
				winner = game.team2Index;
			} else {
				// תיקו
				team1Stat.drawn += 1;
				team2Stat.drawn += 1;
			}

			// יצירת אובייקט המשחק לשמירה בדאטהבייס
			const matchResult = {
				team1: gameDay.teams[game.team1Index].name,
				team2: gameDay.teams[game.team2Index].name,
				team1Score,
				team2Score,
				date: new Date().toISOString(),
				winner: winner !== null ? gameDay.teams[winner].name : null,
			};

			// שמירת המשחק בדאטהבייס
			const response = await matchApi.saveGameResult(params.id, matchResult);

			if (response.success) {
				// עדכון הסטטיסטיקות במצב המקומי
				setTeamStatistics(updatedStats);
				setLastWinner(winner);

				// הסרת המשחק מהמשחקים הפעילים
				const filteredGames = activeGames.filter((_, index) => index !== gameIndex);
				setActiveGames(filteredGames);

				// עדכון הקבוצות המחכות - הוסף את הקבוצות שסיימו לשחק לרשימת הקבוצות הזמינות
				const teamsStillPlaying = filteredGames.flatMap((game) => [game.team1Index, game.team2Index]);
				const allTeamIndexes = gameDay.teams.map((_, index) => index);
				const newWaitingTeams = allTeamIndexes.filter((index) => !teamsStillPlaying.includes(index));
				setWaitingTeams(newWaitingTeams);

				// קריאה מחדש של הסטטיסטיקות - זה עשוי לעזור לרענן את המצב במערכת
				try {
					const statsResponse = await matchApi.getStatistics(params.id);
					if (
						statsResponse.success &&
						statsResponse.data &&
						statsResponse.data.statistics &&
						statsResponse.data.statistics.length > 0
					) {
						// עדכון הסטטיסטיקות לאחר קבלתן מהשרת
						console.log('נתוני סטטיסטיקות חדשים נטענו מהשרת:', statsResponse.data);
					}
				} catch (refreshError) {
					console.error('שגיאה ברענון הסטטיסטיקות:', refreshError);
				}
			} else {
				alert('שגיאה בשמירת תוצאות המשחק: ' + response.error);
			}
		} catch (err) {
			console.error('Failed to save game result:', err);
			alert('שגיאה בשמירת תוצאות המשחק');
		} finally {
			setIsSubmitting(false);
		}
	};

	// הוספת משחק חדש בין המנצח האחרון לקבוצה שמחכה
	const addNextGame = () => {
		if (lastWinner === null || waitingTeams.length === 0 || !gameDay) return;

		// לקיחת הקבוצה הבאה בתור
		const nextTeamIndex = waitingTeams[0];

		// וידוא שהקבוצות לא משחקות כרגע
		const isPlaying = activeGames.some(
			(game) =>
				game.team1Index === nextTeamIndex ||
				game.team2Index === nextTeamIndex ||
				game.team1Index === lastWinner ||
				game.team2Index === lastWinner
		);

		if (isPlaying) {
			alert('אחת הקבוצות או שתיהן כבר משחקות במשחק אחר');
			return;
		}

		// הוספת משחק חדש
		const newGame = {
			team1Index: nextTeamIndex,
			team2Index: lastWinner,
			scores: [0, 0] as [number, number],
		};

		setActiveGames([...activeGames, newGame]);

		// עדכון הקבוצות המחכות
		const teamsInActiveGames = [...activeGames, newGame].flatMap((game) => [game.team1Index, game.team2Index]);

		// מצא את כל הקבוצות שלא משחקות כרגע
		const allTeamIndexes = gameDay.teams.map((_, index) => index);
		const newWaitingTeams = allTeamIndexes.filter((index) => !teamsInActiveGames.includes(index));

		setWaitingTeams(newWaitingTeams);

		// אם הקבוצות היו בבחירה, אפס את הבחירה
		if (selectedTeams.includes(nextTeamIndex) || selectedTeams.includes(lastWinner)) {
			setSelectedTeams([]);
		}
	};

	// בחירת קבוצה למשחק
	const toggleTeamSelection = (teamIndex: number) => {
		// אם הקבוצה כבר נבחרה, מוריד אותה מהרשימה
		if (selectedTeams.includes(teamIndex)) {
			setSelectedTeams(selectedTeams.filter((index) => index !== teamIndex));
		}
		// אם עוד לא נבחרו 2 קבוצות, מוסיף את הקבוצה לרשימה
		else if (selectedTeams.length < 2) {
			// בדוק שהקבוצה לא משחקת כרגע במשחק פעיל
			const isPlaying = activeGames.some(
				(game) => game.team1Index === teamIndex || game.team2Index === teamIndex
			);

			if (!isPlaying) {
				setSelectedTeams([...selectedTeams, teamIndex]);
			}
		}
	};

	// Function to save statistics to database
	const saveStatisticsToDatabase = async () => {
		if (!gameDay || teamStatistics.length === 0) return false;

		try {
			// Format statistics for saving
			const stats = teamStatistics.map((stat) => ({
				teamId: gameDay.teams[stat.teamIndex].name, // Use name as ID
				teamName: stat.teamName || gameDay.teams[stat.teamIndex].name,
				played: stat.played,
				won: stat.won,
				drawn: stat.drawn,
				lost: stat.lost,
				goalsFor: stat.goalsFor,
				goalsAgainst: stat.goalsAgainst,
			}));

			// Save statistics to database
			const response = await matchApi.saveStatistics(params.id, {
				statistics: stats,
			});

			return response.success;
		} catch (err) {
			console.error('Failed to save statistics:', err);
			return false;
		}
	};

	// Function to save all data at the end of the game day
	const saveAllData = async () => {
		if (!gameDay) return false;

		try {
			setIsSubmitting(true);

			// Save all match results first
			const allMatchPromises = activeGames.map((game) =>
				matchApi.saveGameResult(params.id, {
					team1: gameDay.teams[game.team1Index].name,
					team2: gameDay.teams[game.team2Index].name,
					team1Score: game.scores[0],
					team2Score: game.scores[1],
					date: new Date().toISOString(),
					winner:
						game.scores[0] > game.scores[1]
							? gameDay.teams[game.team1Index].name
							: game.scores[1] > game.scores[0]
							? gameDay.teams[game.team2Index].name
							: null,
				})
			);

			const allMatchResults = await Promise.all(allMatchPromises);

			if (!allMatchResults.every((result) => result.success)) {
				throw new Error('Failed to save some match results');
			}

			// Then save statistics
			const statsSuccess = await saveStatisticsToDatabase();

			if (!statsSuccess) {
				throw new Error('Failed to save statistics');
			}

			// Update gameday status to completed
			const response = await matchApi.update(params.id, {
				isCompleted: true,
			});

			if (response.success) {
				// Update local state
				if (gameDay) {
					setGameDay({
						...gameDay,
						isCompleted: true,
					});
				}
				alert('נתוני יום המשחקים נשמרו בהצלחה!');
				return true;
			} else {
				alert('שגיאה בשמירת נתוני יום המשחקים: ' + response.error);
				return false;
			}
		} catch (error) {
			console.error('Error saving all data:', error);
			alert('שגיאה בשמירת הנתונים');
			return false;
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className='container mx-auto py-8 px-4 text-right'>
				<div className='flex justify-center items-center min-h-[50vh]'>
					<div className='text-center'>
						<div className='w-16 h-16 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto'></div>
						<p className='mt-4 text-gray-600'>טוען פרטי יום משחקים...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='container mx-auto py-8 px-4 text-right'>
				<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
					<p>אירעה שגיאה בטעינת פרטי יום המשחקים: {error}</p>
					<button
						onClick={() => window.location.reload()}
						className='mt-2 text-sm underline hover:text-red-900'>
						נסה שוב
					</button>
				</div>
			</div>
		);
	}

	// Conditionally render tabs based on activeTab state
	let activeTabContent;
	if (activeTab === 'teams') {
		activeTabContent = renderTeamsTab();
	} else if (activeTab === 'overview') {
		activeTabContent = renderOverviewTab();
	} else if (activeTab === 'games') {
		activeTabContent = renderGamesAndTableTab();
	}

	return (
		<div className='container mx-auto py-8 px-4 text-right'>
			{gameDay && (
				<>
					<div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
						<div>
							<h1 className='text-2xl font-bold'>יום משחקים: {formatDate(gameDay.date)}</h1>
							{gameDay.location && <p className='text-gray-600 mt-1'>{gameDay.location}</p>}
						</div>

						<div className='flex space-x-2 mt-4 md:mt-0'>
							<Button onClick={() => router.push('/matches')}>חזרה לרשימה</Button>
						</div>
					</div>

					<div className='mb-6'>
						<div className='inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground'>
							<button
								onClick={() => setActiveTab('overview')}
								className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none ${
									activeTab === 'overview'
										? 'bg-background text-foreground shadow-sm'
										: 'hover:bg-muted hover:text-foreground'
								}`}>
								סקירה כללית
							</button>
							<button
								onClick={() => setActiveTab('teams')}
								className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none ${
									activeTab === 'teams'
										? 'bg-background text-foreground shadow-sm'
										: 'hover:bg-muted hover:text-foreground'
								}`}>
								קבוצות
							</button>
							<button
								onClick={() => setActiveTab('games')}
								className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none ${
									activeTab === 'games'
										? 'bg-background text-foreground shadow-sm'
										: 'hover:bg-muted hover:text-foreground'
								}`}>
								טבלה ומשחקים
							</button>
						</div>
					</div>

					<div className='pt-4'>{activeTabContent}</div>
				</>
			)}
		</div>
	);
}
