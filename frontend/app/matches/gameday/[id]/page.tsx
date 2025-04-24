'use client';

import {useState, useEffect, ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {TeamPlayer, Match} from '@/app/types';
import {PlayerStats as ImportedPlayerStats} from '@/app/types';
import {matchApi} from '@/app/services/api';
import {FaTimes, FaSave, FaUsers, FaSortAmountDown, FaFutbol} from 'react-icons/fa';

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

// Define a Game interface with all required properties
interface Game {
	id?: string; // Make id optional since some game objects don't have it
	team1Index: number;
	team2Index: number;
	scores: [number, number];
	finished?: boolean;
	// Other properties as needed
}

// Define the PlayerStats interface to match our data structure
interface PlayerStats {
	playerId: string;
	playerName: string;
	team: string;
	goals: number;
	matches: number;
}

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
	const [activeGames, setActiveGames] = useState<Game[]>([]);
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
	const [playerGoals, setPlayerGoals] = useState<Record<string, number>>({});
	const [topScorers, setTopScorers] = useState<PlayerStats[]>([]);
	const router = useRouter();

	// Current game state to track which game is active when adding goals
	const [currentGame, setCurrentGame] = useState<Game | null>(null);

	// Comment out unused variables
	// const {data: gameDayData, error: gameDayError, isLoading: gameDayIsLoading} = useGetGameDay(params.id);

	// Right after useEffect starts and before fetchGameDay, initialize topScorers as an empty array
	useEffect(() => {
		// Initialize top scorers as empty to avoid showing the "no scorers found" message initially
		setTopScorers([]);

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
							response.data.teams.map((t) => t.name)
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

					// We no longer try to fetch top scorers from API, but build them locally from any existing data
					// This is where we would initialize the topScorers array if we had data
					// For now, we leave it as an empty array and will be populated when goals are added
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
			<div className='flex flex-col space-y-6 w-full'>
				{/* Games Section */}
				<div className='pb-4 border-b border-green-700'>
					<div className='flex justify-between items-center mb-4'>
						<h2 className='text-xl font-bold text-green-800'>משחקים</h2>
						{selectedTeams.length === 2 && (
							<Button
								onClick={addSelectedTeamsToGame}
								className='bg-green-600 hover:bg-green-700'>
								התחל משחק
							</Button>
						)}
					</div>

					{/* Team selection area */}
					<div className='mb-4'>
						<h3 className='text-md font-semibold text-gray-700 mb-2'>בחירת קבוצות למשחק הבא:</h3>
						<div className='flex flex-wrap gap-2'>
							{gameDay.teams.map((team, index) => {
								// Check if team is already playing
								const isPlaying = activeGames.some(
									(game) => !game.finished && (game.team1Index === index || game.team2Index === index)
								);

								return (
									<button
										key={index}
										onClick={() => toggleTeamSelection(index)}
										className={`px-3 py-1 rounded-full text-sm font-medium ${
											selectedTeams.includes(index)
												? 'bg-green-600 text-white'
												: isPlaying
												? 'bg-gray-300 text-gray-600 cursor-not-allowed'
												: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
										}`}
										disabled={isPlaying}>
										{team.name}
									</button>
								);
							})}
						</div>
					</div>

					{/* Active Games */}
					<h3 className='text-md font-semibold text-gray-700 mb-2'>משחקים פעילים:</h3>
					<div className='flex flex-col space-y-4'>
						{activeGames.length === 0 ? (
							<p className='text-gray-500 text-center'>אין משחקים פעילים כרגע</p>
						) : (
							activeGames.map((game, gameIndex) => (
								<div
									key={gameIndex}
									className={`bg-white p-4 rounded-lg shadow-md ${
										game.finished ? 'opacity-75' : ''
									}`}>
									{/* Game Status */}
									<div className='mb-2 text-center'>
										<span
											className={`inline-block px-2 py-1 rounded text-xs font-medium ${
												game.finished
													? 'bg-gray-200 text-gray-700'
													: 'bg-green-100 text-green-800'
											}`}>
											{game.finished ? 'הסתיים' : 'פעיל'}
										</span>
									</div>

									{/* Scoreboard */}
									<div className='mb-4'>
										<div className='flex justify-between items-center bg-green-700 text-white rounded-t-lg py-2 px-4'>
											<span className='font-semibold'>
												{gameDay.teams[game.team1Index]?.name || 'קבוצה 1'}
											</span>
											<div className='text-2xl font-bold'>
												{game.scores[0]} - {game.scores[1]}
											</div>
											<span className='font-semibold'>
												{gameDay.teams[game.team2Index]?.name || 'קבוצה 2'}
											</span>
										</div>

										<div className='bg-white border border-gray-200 rounded-b-lg'>
											<div className='p-3'>
												<p className='text-center text-sm text-gray-600 mb-2'>
													לחץ על שם השחקן כדי להוסיף שער
												</p>

												{/* Team 1 Players */}
												<div className='mb-3'>
													<h4 className='font-medium text-green-800 mb-1'>
														{gameDay.teams[game.team1Index]?.name}:
													</h4>
													<div className='flex flex-wrap gap-1'>
														{gameDay.teams[game.team1Index]?.players.map((player) => (
															<button
																key={player.playerId}
																onClick={() =>
																	!game.finished && addGoalForPlayer(player.playerId)
																}
																disabled={game.finished}
																className={`text-xs py-1 px-2 border rounded-full ${
																	game.finished
																		? 'bg-gray-100 text-gray-400 cursor-not-allowed'
																		: 'hover:bg-green-50 hover:border-green-300'
																}`}>
																{player.name}{' '}
																{playerGoals[player.playerId] ? (
																	<span className='inline-flex items-center'>
																		({playerGoals[player.playerId]})
																		<span className='text-xs ml-1'>⚽</span>
																	</span>
																) : null}
															</button>
														))}
													</div>
												</div>

												{/* Team 2 Players */}
												<div>
													<h4 className='font-medium text-green-800 mb-1'>
														{gameDay.teams[game.team2Index]?.name}:
													</h4>
													<div className='flex flex-wrap gap-1'>
														{gameDay.teams[game.team2Index]?.players.map((player) => (
															<button
																key={player.playerId}
																onClick={() =>
																	!game.finished && addGoalForPlayer(player.playerId)
																}
																disabled={game.finished}
																className={`text-xs py-1 px-2 border rounded-full ${
																	game.finished
																		? 'bg-gray-100 text-gray-400 cursor-not-allowed'
																		: 'hover:bg-green-50 hover:border-green-300'
																}`}>
																{player.name}{' '}
																{playerGoals[player.playerId] ? (
																	<span className='inline-flex items-center'>
																		({playerGoals[player.playerId]})
																		<span className='text-xs ml-1'>⚽</span>
																	</span>
																) : null}
															</button>
														))}
													</div>
												</div>
											</div>

											{!game.finished && (
												<div className='bg-gray-50 p-2 text-center border-t'>
													<Button
														variant='outline'
														onClick={() => finishGame(gameIndex)}
														className='bg-green-600 text-white hover:bg-green-700 hover:text-white'>
														סיים משחק
													</Button>
												</div>
											)}
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</div>

				{/* Add a section for completed games */}
				<h3 className='text-md font-semibold text-gray-700 mt-6 mb-2'>משחקים שהסתיימו:</h3>
				<div className='bg-white rounded-lg shadow overflow-hidden'>
					{activeGames.filter((game) => game.finished).length > 0 ? (
						<table className='min-w-full divide-y divide-gray-200'>
							<thead className='bg-green-700'>
								<tr>
									<th className='px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider'>
										קבוצה 1
									</th>
									<th className='px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider'>
										תוצאה
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider'>
										קבוצה 2
									</th>
								</tr>
							</thead>
							<tbody className='bg-white divide-y divide-gray-200'>
								{activeGames
									.filter((game) => game.finished)
									.map((game, index) => (
										<tr
											key={index}
											className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
											<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right'>
												{gameDay.teams[game.team1Index]?.name}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center font-bold'>
												{game.scores[0]} - {game.scores[1]}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left'>
												{gameDay.teams[game.team2Index]?.name}
											</td>
										</tr>
									))}
							</tbody>
						</table>
					) : (
						<div className='p-4 text-center text-gray-500'>אין משחקים שהסתיימו</div>
					)}
				</div>

				{/* Team Statistics Table */}
				<div>
					<h2 className='text-xl font-bold text-green-800 mb-4'>טבלת הקבוצות</h2>
					{teamStatistics && teamStatistics.length > 0 ? (
						<div className='bg-white rounded-lg shadow overflow-hidden'>
							<table className='min-w-full divide-y divide-gray-200'>
								<thead className='bg-green-700'>
									<tr>
										<th className='px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider'>
											קבוצה
										</th>
										<th className='px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider'>
											משחקים
										</th>
										<th className='px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider'>
											נצחונות
										</th>
										<th className='px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider'>
											תיקו
										</th>
										<th className='px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider'>
											הפסדים
										</th>
										<th className='px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider'>
											יחס שערים
										</th>
									</tr>
								</thead>
								<tbody className='bg-white divide-y divide-gray-200'>
									{teamStatistics
										.sort((a, b) => b.won * 3 + b.drawn - (a.won * 3 + a.drawn))
										.map((stat, index) => (
											<tr
												key={index}
												className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
												<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
													{stat.teamName || gameDay.teams[stat.teamIndex]?.name}
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
													{stat.goalsFor} - {stat.goalsAgainst}
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					) : (
						<div className='bg-white p-4 rounded-lg shadow text-center text-gray-500'>
							אין נתונים סטטיסטיים זמינים
						</div>
					)}
				</div>

				{/* Top Scorers Section */}
				<div>
					<h2 className='text-xl font-bold text-green-800 mb-4'>טבלת מלכי השערים</h2>
					{topScorers.length > 0 ? (
						<div className='bg-white rounded-lg shadow overflow-hidden'>
							<table className='min-w-full divide-y divide-gray-200'>
								<thead className='bg-green-700'>
									<tr>
										<th className='px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider'>
											דירוג
										</th>
										<th className='px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider'>
											שחקן
										</th>
										<th className='px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider'>
											שערים
										</th>
										<th className='px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider'>
											משחקים
										</th>
									</tr>
								</thead>
								<tbody className='bg-white divide-y divide-gray-200'>
									{topScorers.map((scorer, index) => (
										<tr
											key={scorer.playerId}
											className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
											<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
												{index + 1}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
												{scorer.playerName}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
												{scorer.goals}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
												{scorer.matches}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className='bg-white p-4 rounded-lg shadow text-center text-gray-500'>
							אין עדיין מלכי שערים. לחץ על שם של שחקן במשחק פעיל כדי להוסיף שער.
						</div>
					)}
				</div>

				{/* Team Selection */}
				<div className='mt-8 mb-12'>
					<h2 className='text-xl font-bold mb-4 text-center'>בחירת קבוצות למשחק הבא</h2>
					<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
						{gameDay?.teams.map((team, index) => {
							// Check if team is already playing
							const isPlaying = activeGames.some(
								(game) => game.team1Index === index || game.team2Index === index
							);

							return (
								<button
									key={index}
									onClick={() => toggleTeamSelection(index)}
									disabled={isPlaying}
									className={`p-3 rounded-lg border ${
										isPlaying
											? 'bg-gray-100 text-gray-500 cursor-not-allowed'
											: selectedTeams.includes(index)
											? 'bg-green-100 border-green-500 text-green-700'
											: 'bg-white hover:bg-green-50 border-gray-200'
									}`}>
									<div className='font-bold'>{team.name}</div>
									<div className='text-sm text-gray-600'>{team.players.length} שחקנים</div>
								</button>
							);
						})}
					</div>

					{selectedTeams.length === 2 && (
						<div className='mt-4 flex justify-center'>
							<Button
								onClick={addSelectedTeamsToGame}
								className='bg-green-600 hover:bg-green-700 text-white'>
								התחל משחק עם הקבוצות שנבחרו
							</Button>
						</div>
					)}
				</div>
			</div>
		);
	};

	// Add the toggleTeamSelection function
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

	// Add the addSelectedTeamsToGame function
	const addSelectedTeamsToGame = () => {
		if (selectedTeams.length !== 2 || !gameDay) return;

		// יצירת משחק חדש עם הקבוצות הנבחרות
		const newGame = {
			team1Index: selectedTeams[0],
			team2Index: selectedTeams[1],
			scores: [0, 0] as [number, number],
			finished: false,
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

	// Prefix unused functions with underscore to indicate they're available for future use
	const _addNextGame = () => {
		if (gameDay?.teams && gameDay.teams.length > 1) {
			// Find available teams that are not currently playing
			const teamsPlaying = activeGames
				.filter((game) => !game.finished)
				.flatMap((game) => [game.team1Index, game.team2Index]);

			const availableTeams = gameDay.teams
				.map((_, index) => index)
				.filter((index) => !teamsPlaying.includes(index));

			// If we have at least 2 available teams, create a new game
			if (availableTeams.length >= 2) {
				// Select first two available teams
				const newTeam1Index = availableTeams[0];
				const newTeam2Index = availableTeams[1];

				setActiveGames([
					...activeGames,
					{
						team1Index: newTeam1Index,
						team2Index: newTeam2Index,
						scores: [0, 0],
						finished: false,
					},
				]);

				// Clear team selection
				setSelectedTeams([]);
			} else {
				alert('אין מספיק קבוצות זמינות למשחק חדש');
			}
		}
	};

	const _updateGameScore = (gameIndex: number, teamNumber: 1 | 2, score: number) => {
		setActiveGames((currentGames) => {
			return currentGames.map((game, index) => {
				if (index === gameIndex) {
					const newScores = [...game.scores];
					newScores[teamNumber - 1] = Math.max(0, score); // Ensure score is not negative
					return {...game, scores: newScores as [number, number]};
				}
				return game;
			});
		});
	};

	const _saveAllData = async () => {
		setIsSubmitting(true);
		try {
			// Save team statistics to the database
			await saveStatisticsToDatabase();

			// Save any other data that needs to be persisted

			alert('כל הנתונים נשמרו בהצלחה!');
			return true;
		} catch (error) {
			console.error('שגיאה בשמירת הנתונים:', error);
			alert('שגיאה בשמירת הנתונים');
			return false;
		} finally {
			setIsSubmitting(false);
		}
	};

	// Define the findPlayerInfo helper function
	const findPlayerInfo = (playerId: string) => {
		if (!gameDay) return null;

		for (const team of gameDay.teams) {
			const player = team.players.find((p) => p.playerId === playerId);
			if (player) {
				return {
					name: player.name,
					team: team.name,
				};
			}
		}
		return null;
	};

	// Update buildTopScorersFromLocalData to use the correct types
	const buildTopScorersFromLocalData = () => {
		if (!gameDay) return [] as PlayerStats[];

		// Use the playerGoals state to build the top scorers list
		const scorers = Object.entries(playerGoals).map(([playerId, goals]) => {
			const playerInfo = findPlayerInfo(playerId);
			return {
				playerId: playerId,
				playerName: playerInfo?.name || 'Unknown Player',
				team: playerInfo?.team || 'Unknown Team',
				goals: goals,
				matches: 1, // We can improve this if needed
			} as PlayerStats;
		});

		return scorers.sort((a, b) => b.goals - a.goals);
	};

	// Import the addGoal function from the API
	const addGoal = async ({playerId, matchId, goals}: {playerId: string; matchId: string; goals: number}) => {
		try {
			await fetch('/api/goals', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({playerId, matchId, goals}),
			});
			return true;
		} catch (error) {
			console.error('Error adding goal:', error);
			return false;
		}
	};

	// Add the addGoalForPlayer function
	const addGoalForPlayer = async (playerId: string) => {
		if (!gameDay || !currentGame) return;

		// Update player goals in state
		setPlayerGoals((prev) => {
			const newGoals = {...prev};
			newGoals[playerId] = (newGoals[playerId] || 0) + 1;
			return newGoals;
		});

		// Update top scorers list
		buildTopScorersFromLocalData();

		// Call API to save goal if we have valid IDs
		if (gameDay.id) {
			await addGoal({
				playerId,
				matchId: gameDay.id,
				goals: (playerGoals[playerId] || 0) + 1,
			});
		}
	};

	// Update the finishGame function to save game results to the database
	const finishGame = async (gameIndex: number) => {
		if (!gameDay) return;

		// Update local state first
		const updatedGames = [...activeGames];
		updatedGames[gameIndex].finished = true;

		// Determine the winner
		const game = updatedGames[gameIndex];
		let winnerTeamIndex = null;

		if (game.scores[0] > game.scores[1]) {
			winnerTeamIndex = game.team1Index;
		} else if (game.scores[1] > game.scores[0]) {
			winnerTeamIndex = game.team2Index;
		}

		// Update local state
		setActiveGames(updatedGames);

		// Save the game result to the database
		try {
			// Create a game result object to send to the API
			const gameResult = {
				matchId: params.id,
				team1Index: game.team1Index,
				team2Index: game.team2Index,
				team1Score: game.scores[0],
				team2Score: game.scores[1],
				winnerIndex: winnerTeamIndex,
				date: new Date().toISOString(),
			};

			console.log('Saving game result:', gameResult);

			// Call the API to save the game result
			const response = await matchApi.saveGameResult(gameResult);

			if (response && response.success) {
				console.log('Game result saved successfully');

				// After saving, refresh the statistics to show updated tables
				const statsResponse = await matchApi.getStatistics(params.id);
				if (statsResponse && statsResponse.success && statsResponse.data) {
					console.log('Updated statistics:', statsResponse.data);

					// Update team statistics if available
					if (statsResponse.data.statistics) {
						const serverStats = statsResponse.data.statistics;
						const localStats = serverStats
							.map((stat) => {
								const teamIndex = gameDay.teams.findIndex((team) => team.name === stat.teamName);

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
							.filter(Boolean);

						setTeamStatistics(localStats as any);
					}
				}
			} else {
				console.error('Failed to save game result:', response?.error);
			}
		} catch (error) {
			console.error('Error saving game result:', error);
		}

		// Update waiting teams
		const teamsInActiveGames = activeGames
			.filter((g, i) => i !== gameIndex || !g.finished)
			.flatMap((game) => [game.team1Index, game.team2Index]);

		const allTeamIndexes = gameDay.teams.map((_, index) => index);
		const newWaitingTeams = allTeamIndexes.filter((index) => !teamsInActiveGames.includes(index));

		setWaitingTeams(newWaitingTeams);

		// Also save player goals
		await saveStatisticsToDatabase();
	};

	// Add the saveStatisticsToDatabase function
	const saveStatisticsToDatabase = async () => {
		if (!gameDay) return;

		try {
			// For each player with goals, save their statistics
			for (const [playerId, goals] of Object.entries(playerGoals)) {
				await addGoal({
					playerId,
					matchId: params.id,
					goals: goals,
				});
			}

			// Update the match information if needed
			// This would depend on your API implementation

			alert('סטטיסטיקות נשמרו בהצלחה!');
		} catch (error) {
			console.error('Error saving statistics:', error);
			alert('שגיאה בשמירת הסטטיסטיקות');
		}
	};

	// In GameDayPage, add a useEffect to update currentGame when active game changes
	useEffect(() => {
		if (activeGames && activeGames.length > 0) {
			// Find the first non-finished game or use the last game
			const activeGame = activeGames.find((game: any) => !game.finished) || activeGames[activeGames.length - 1];
			setCurrentGame(activeGame);
		}
	}, [activeGames]);

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
