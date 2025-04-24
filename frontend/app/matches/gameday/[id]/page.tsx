'use client';

import {useState, useEffect, ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {TeamPlayer as ImportedTeamPlayer, Match} from '@/app/types';
import {PlayerStats as ImportedPlayerStats} from '@/app/types';
import {matchApi} from '@/app/services/api';
import {FaTimes, FaSave, FaUsers, FaSortAmountDown, FaFutbol} from 'react-icons/fa';
import {toast} from 'react-toastify';
import {revalidatePath} from 'next/cache';

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

// Interface definition for TeamPlayer
interface TeamPlayer {
	playerId?: string;
	name: string;
	id?: string;
	level?: number;
	rating?: number;
	position?: string;
	goals: number;
	active?: boolean;
}

interface Team {
	id?: string;
	name: string;
	players: TeamPlayer[];
}

export default function GameDayPage({params}: {params: {id: string}}) {
	const [gameDay, setGameDay] = useState<Match | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState('games');
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
			points?: number; // Add optional points field
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
						console.log('Statistics and game results loaded:', statsResponse.data);

						// Compute team stats from gameResults
						const gameResults = statsResponse.data.gameResults || [];
						const computedStats = response.data.teams.map((team, idx) => ({
							teamIndex: idx,
							teamName: team.name,
							played: 0,
							won: 0,
							drawn: 0,
							lost: 0,
							goalsFor: 0,
							goalsAgainst: 0,
						}));

						gameResults.forEach((result) => {
							const t1 = response.data.teams.findIndex((t) => t.name === result.team1);
							const t2 = response.data.teams.findIndex((t) => t.name === result.team2);
							if (t1 === -1 || t2 === -1) return;

							// Update played
							computedStats[t1].played++;
							computedStats[t2].played++;

							// Update goals
							computedStats[t1].goalsFor += result.team1Score;
							computedStats[t1].goalsAgainst += result.team2Score;
							computedStats[t2].goalsFor += result.team2Score;
							computedStats[t2].goalsAgainst += result.team1Score;

							// Win/Loss/Draw
							if (result.team1Score > result.team2Score) {
								computedStats[t1].won++;
								computedStats[t2].lost++;
							} else if (result.team2Score > result.team1Score) {
								computedStats[t2].won++;
								computedStats[t1].lost++;
							} else {
								computedStats[t1].drawn++;
								computedStats[t2].drawn++;
							}
						});

						setTeamStatistics(computedStats);

						// Build completed games array
						const completedGames = gameResults.map((result) => {
							const team1Index = response.data.teams.findIndex((t) => t.name === result.team1);
							const team2Index = response.data.teams.findIndex((t) => t.name === result.team2);
							return {
								team1Index,
								team2Index,
								scores: [result.team1Score, result.team2Score] as [number, number],
								finished: true,
							};
						});
						setActiveGames(completedGames);

						// Recompute waiting teams
						const occupied = new Set(completedGames.flatMap((g) => [g.team1Index, g.team2Index]));
						const allIndexes = response.data.teams.map((_, i) => i);
						setWaitingTeams(allIndexes.filter((i) => !occupied.has(i)));
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
		const sortedAllPlayers = allPlayers.sort((a, b) => (b.rating || 0) - (a.rating || 0));

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
						teamPlayers[team].push(sortedAllPlayers[playerIndex]);
						playerIndex++;
					}
				}
				// Backward direction for odd rounds
				else {
					for (let team = numTeams - 1; team >= 0; team--) {
						teamPlayers[team].push(sortedAllPlayers[playerIndex]);
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
					teamPlayers[team].push(sortedAllPlayers[playerIndex]);
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

		const isCompleted = gameDay.isCompleted;

		return (
			<div className='flex flex-col space-y-6 w-full'>
				{/* Games Section */}
				<div className='pb-4 border-b border-green-700'>
					<div className='flex justify-between items-center mb-4'>
						<h2 className='text-xl font-bold text-green-800'>משחקים</h2>
						{selectedTeams.length === 2 && !isCompleted && (
							<Button
								onClick={addSelectedTeamsToGame}
								className='bg-green-600 hover:bg-green-700'>
								התחל משחק
							</Button>
						)}
					</div>

					{isCompleted && (
						<div className='mb-4 bg-blue-50 border border-blue-200 p-3 rounded-md text-blue-700'>
							<p>יום המשחקים הושלם ונעול. לא ניתן לערוך או להוסיף משחקים חדשים.</p>
						</div>
					)}

					{/* Team selection area */}
					{!isCompleted && (
						<div className='mb-4'>
							<h3 className='text-md font-semibold text-gray-700 mb-2'>בחירת קבוצות למשחק הבא:</h3>
							<div className='flex flex-wrap gap-2'>
								{gameDay.teams.map((team, index) => {
									// Check if team is already playing
									const isPlaying = activeGames.some(
										(game) =>
											!game.finished && (game.team1Index === index || game.team2Index === index)
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
											disabled={isPlaying || isCompleted}>
											{team.name}
										</button>
									);
								})}
							</div>
						</div>
					)}

					{/* Active Games */}
					<h3 className='text-md font-semibold text-gray-700 mb-2'>משחקים פעילים:</h3>
					<div className='flex flex-col space-y-4'>
						{activeGames.filter((game) => !game.finished).length === 0 ? (
							<p className='text-gray-500 text-center py-4 bg-white rounded-lg shadow-sm'>
								אין משחקים פעילים כרגע
							</p>
						) : (
							activeGames
								.filter((game) => !game.finished)
								.map((game, gameIndex) => {
									// Get the actual index in the activeGames array
									const actualGameIndex = activeGames.findIndex(
										(g) =>
											g.team1Index === game.team1Index &&
											g.team2Index === game.team2Index &&
											!g.finished
									);

									return (
										<div
											key={gameIndex}
											className='bg-white rounded-lg shadow-lg border-2 border-green-500 overflow-hidden'>
											{/* Game Header */}
											<div className='bg-green-50 p-3 border-b border-green-200 text-center'>
												<span className='inline-block px-3 py-1 rounded-full font-medium text-sm bg-green-500 text-white'>
													משחק פעיל #{gameIndex + 1}
												</span>
											</div>

											{/* Mobile-optimized Scoreboard */}
											<div className='flex flex-col md:flex-row'>
												{/* Main Scoreboard - show as column on mobile, row on desktop */}
												<div className='flex flex-row justify-between p-4 md:p-6 w-full bg-gray-50 md:bg-transparent'>
													{/* Team 1 */}
													<div className='flex flex-col items-center'>
														<div className='text-base md:text-xl font-bold text-center mb-2 px-1 truncate max-w-[110px]'>
															{gameDay.teams[game.team1Index]?.name}
														</div>
														<div className='text-4xl md:text-5xl font-black text-center text-blue-600 min-w-[40px] flex items-center justify-center h-14'>
															{game.scores[0]}
														</div>
													</div>

													{/* VS */}
													<div className='flex flex-col items-center justify-center mx-2 md:mx-4'>
														<div className='text-xl md:text-2xl font-bold'>VS</div>
														<div
															className={`mt-1 text-gray-500 text-xs md:text-sm hidden md:block ${
																isCompleted ? 'text-gray-400' : ''
															}`}>
															{isCompleted ? 'המשחק נעול' : 'לחץ על שם שחקן להוספת גול'}
														</div>
													</div>

													{/* Team 2 */}
													<div className='flex flex-col items-center'>
														<div className='text-base md:text-xl font-bold text-center mb-2 px-1 truncate max-w-[110px]'>
															{gameDay.teams[game.team2Index]?.name}
														</div>
														<div className='text-4xl md:text-5xl font-black text-center text-red-600 min-w-[40px] flex items-center justify-center h-14'>
															{game.scores[1]}
														</div>
													</div>
												</div>

												{/* Mobile-only instruction */}
												<div
													className={`text-center text-xs p-2 bg-gray-50 block md:hidden ${
														isCompleted ? 'text-gray-400' : 'text-gray-500'
													}`}>
													{isCompleted ? 'המשחק נעול' : 'לחץ על שם שחקן להוספת גול'}
												</div>

												{/* Players Container - two columns on mobile */}
												<div className='flex flex-row w-full'>
													{/* Team 1 Players */}
													<div className='w-1/2 p-2 md:p-4 flex flex-col space-y-1.5 md:space-y-2 border-t md:border-t-0 md:border-r border-gray-200'>
														{gameDay.teams[game.team1Index]?.players.map(
															(player, playerIndex) => (
																<button
																	key={playerIndex}
																	onClick={() =>
																		!isCompleted &&
																		addGoalToPlayer(actualGameIndex, 0, playerIndex)
																	}
																	disabled={isCompleted}
																	className={`py-2 px-2 md:px-3 ${
																		isCompleted
																			? 'bg-gray-100 text-gray-500 cursor-not-allowed'
																			: 'bg-blue-50 hover:bg-blue-100 cursor-pointer'
																	} rounded-md w-full text-center flex items-center justify-between transition-colors text-xs md:text-sm`}>
																	<span className='font-medium truncate'>
																		{player.name}
																	</span>
																	<span
																		className={`${
																			isCompleted ? 'bg-gray-400' : 'bg-blue-500'
																		} text-white text-xs px-2 py-1 rounded-full ml-1 min-w-[24px]`}>
																		{(player as TeamPlayer).goals || 0}
																	</span>
																</button>
															)
														)}
													</div>

													{/* Team 2 Players */}
													<div className='w-1/2 p-3 md:p-4 flex flex-col space-y-2 border-t md:border-t-0 md:border-l border-gray-200'>
														{gameDay.teams[game.team2Index]?.players.map(
															(player, playerIndex) => (
																<button
																	key={playerIndex}
																	onClick={() =>
																		!isCompleted &&
																		addGoalToPlayer(actualGameIndex, 1, playerIndex)
																	}
																	disabled={isCompleted}
																	className={`py-2 px-2 md:px-3 ${
																		isCompleted
																			? 'bg-gray-100 text-gray-500 cursor-not-allowed'
																			: 'bg-red-50 hover:bg-red-100 cursor-pointer'
																	} rounded-md w-full text-center flex items-center justify-between transition-colors text-xs md:text-sm`}>
																	<span className='font-medium truncate'>
																		{player.name}
																	</span>
																	<span
																		className={`${
																			isCompleted ? 'bg-gray-400' : 'bg-red-500'
																		} text-white text-xs px-2 py-1 rounded-full ml-1 min-w-[24px]`}>
																		{(player as TeamPlayer).goals || 0}
																	</span>
																</button>
															)
														)}
													</div>
												</div>
											</div>

											{/* Game Footer */}
											{!isCompleted && (
												<div className='p-4 border-t border-gray-200 flex justify-center'>
													<Button
														onClick={() => finishGame(actualGameIndex)}
														disabled={isSubmitting}
														className='bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2 w-full md:w-auto'>
														{isSubmitting ? (
															<>
																<svg
																	className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
																<span>מסיים משחק...</span>
															</>
														) : (
															<>
																<span>סיים משחק</span>
															</>
														)}
													</Button>
												</div>
											)}
										</div>
									);
								})
						)}
					</div>
				</div>

				{/* Add a section for completed games */}
				<h3 className='text-md font-semibold text-gray-700 mt-6 mb-2'>משחקים שהסתיימו:</h3>
				<div className='bg-white rounded-lg shadow overflow-hidden'>
					{activeGames.filter((game) => game.finished).length > 0 ? (
						<div className='overflow-x-auto'>
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
						</div>
					) : (
						<div className='p-4 text-center text-gray-500'>אין משחקים שהסתיימו</div>
					)}
				</div>

				{/* Team Statistics Table */}
				<div>
					<h2 className='text-xl font-bold text-green-800 mb-4'>טבלת הקבוצות</h2>
					{teamStatistics && teamStatistics.length > 0 ? (
						<div className='bg-white rounded-lg shadow overflow-hidden'>
							<div className='overflow-x-auto'>
								<table className='min-w-full divide-y divide-gray-200'>
									<thead className='bg-green-700'>
										<tr>
											<th className='px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider'>
												קבוצה
											</th>
											<th className='px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider'>
												נקודות
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
											.sort((a, b) => {
												// First sort by points
												const pointsA = a.won * 3 + a.drawn;
												const pointsB = b.won * 3 + b.drawn;
												if (pointsB !== pointsA) return pointsB - pointsA;

												// If points are equal, sort by goal difference
												const goalDiffA = a.goalsFor - a.goalsAgainst;
												const goalDiffB = b.goalsFor - b.goalsAgainst;
												return goalDiffB - goalDiffA;
											})
											.map((stat, index) => (
												<tr
													key={index}
													className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
													<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
														{stat.teamName || gameDay.teams[stat.teamIndex]?.name}
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center font-bold'>
														{stat.won * 3 + stat.drawn}
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
						</div>
					) : (
						<div className='bg-white p-4 rounded-lg shadow text-center text-gray-500'>
							אין נתונים סטטיסטיים זמינים
						</div>
					)}
				</div>

				{/* Top Scorers Section */}
				<div className='mt-6'>
					<h2 className='text-xl font-bold text-green-800 mb-4'>טבלת מלכי השערים</h2>
					{topScorers && topScorers.length > 0 ? (
						<div className='bg-white rounded-lg shadow overflow-hidden'>
							<div className='overflow-x-auto'>
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
												קבוצה
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
													{scorer.team}
												</td>
												<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold'>
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
						</div>
					) : (
						<div className='bg-white p-4 rounded-lg shadow text-center text-gray-500'>
							אין עדיין מלכי שערים. לחץ על שם של שחקן במשחק פעיל כדי להוסיף שער.
						</div>
					)}
				</div>

				{/* Team Selection */}
				{!isCompleted && (
					<div className='mt-8 mb-12'>
						<h2 className='text-xl font-bold mb-4 text-center'>בחירת קבוצות למשחק הבא</h2>
						<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
							{gameDay?.teams.map((team, index) => {
								// Check if team is already playing
								const isPlaying = activeGames.some(
									(game) => !game.finished && (game.team1Index === index || game.team2Index === index)
								);

								return (
									<button
										key={index}
										onClick={() => toggleTeamSelection(index)}
										disabled={isPlaying || isCompleted}
										className={`p-3 rounded-lg border ${
											isPlaying || isCompleted
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
				)}
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
				(game) => !game.finished && (game.team1Index === teamIndex || game.team2Index === teamIndex)
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

		// Reset goals for players in the newly selected teams
		if (gameDay.teams) {
			// Create a deep copy of gameDay with reset goals
			const updatedGameDay = {
				...gameDay,
				teams: gameDay.teams.map((team, idx) => {
					if (selectedTeams.includes(idx)) {
						// Reset goals for this team's players
						return {
							...team,
							players: team.players.map((player) => ({
								...player,
								goals: 0, // Reset goals to 0 for this player
							})),
						};
					}
					return team;
				}),
			};

			// Update gameDay with reset goals
			setGameDay(updatedGameDay);
		}

		// איפוס הבחירה
		setSelectedTeams([]);

		// Save all data automatically after creating a new game
		setTimeout(() => {
			saveAllData();
			toast.success('משחק חדש נוסף בהצלחה!');
		}, 300);
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

	// Rename the _saveAllData function (around line 1310) to make it usable
	const saveAllData = async () => {
		if (!gameDay) return false;

		setIsSubmitting(true);
		try {
			// Save team statistics to the database
			await saveStatisticsToDatabase();

			// Save any other data that needs to be persisted
			// Save current team assignments
			try {
				const teamResponse = await matchApi.update(params.id, {
					teams: gameDay.teams,
				});

				if (!teamResponse.success) {
					throw new Error('Failed to save team data');
				}
			} catch (err) {
				console.error('Error saving team data:', err);
				throw err;
			}

			toast.success('כל הנתונים נשמרו בהצלחה!');
			return true;
		} catch (error) {
			console.error('שגיאה בשמירת הנתונים:', error);
			toast.error('שגיאה בשמירת הנתונים');
			return false;
		} finally {
			setIsSubmitting(false);
		}
	};

	// Function to complete and lock the match day
	const completeMatchDay = async () => {
		if (!gameDay) return;

		// Confirm with the user
		if (!confirm('האם אתה בטוח שאתה רוצה לסיים ולנעול יום משחקים זה? לא ניתן יהיה לערוך אותו לאחר מכן.')) {
			return;
		}

		setIsSubmitting(true);
		try {
			// First save all current data
			const saveSuccess = await saveAllData();
			if (!saveSuccess) {
				throw new Error('Failed to save match data');
			}

			// Update match status to completed
			const response = await matchApi.update(params.id, {
				isCompleted: true,
			});

			if (!response.success) {
				throw new Error('Failed to update match status');
			}

			toast.success('יום המשחקים הושלם ונעול בהצלחה!');

			// Redirect back to matches list
			setTimeout(() => {
				router.push('/matches');
			}, 1500);
		} catch (error) {
			console.error('Error completing match day:', error);
			toast.error('שגיאה בהשלמת יום המשחקים');
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
		if (gameDay._id) {
			await addGoal({
				playerId,
				matchId: gameDay._id,
				goals: (playerGoals[playerId] || 0) + 1,
			});
		}
	};

	// Function to add a goal to a player
	const addGoalToPlayer = (gameIndex: number, teamIndex: number, playerIndex: number) => {
		if (!gameDay) return;

		try {
			// Get the game and create deep copies
			const game = activeGames[gameIndex];
			if (!game) {
				console.error('Game not found at index:', gameIndex);
				return;
			}

			// Create new copies for immutable updates
			const updatedActiveGames = activeGames.map((g, idx) => {
				if (idx === gameIndex) {
					// Create a new copy of this game with updated scores
					return {
						...g,
						scores:
							teamIndex === 0
								? ([g.scores[0] + 1, g.scores[1]] as [number, number])
								: ([g.scores[0], g.scores[1] + 1] as [number, number]),
					};
				}
				return g;
			});

			// Get the actual team index from the gameDay teams array
			const actualTeamIndex = teamIndex === 0 ? game.team1Index : game.team2Index;

			// Create a deep copy of gameDay with type assertions
			const updatedGameDay = {
				...gameDay,
				teams: gameDay.teams.map((team, idx) => {
					if (idx === actualTeamIndex) {
						// Only update the specific team
						return {
							...team,
							players: team.players.map((player, pIdx) => {
								if (pIdx === playerIndex) {
									// Update this player's goals - use type assertion and access safely
									const playerGoals = (player as any).goals || 0;
									return {
										...player,
										goals: playerGoals + 1,
									};
								}
								return player;
							}),
						};
					}
					return team;
				}),
			};

			// Update states with the new copies
			setActiveGames(updatedActiveGames);
			setGameDay(updatedGameDay);

			// Update player goals for top scorers tracking
			const player = updatedGameDay.teams[actualTeamIndex].players[playerIndex];
			const playerId = player.playerId || '';
			if (playerId) {
				setPlayerGoals((prev) => ({
					...prev,
					[playerId]: (prev[playerId] || 0) + 1,
				}));
			}

			// Update top scorers list
			const updatedScorers = buildTopScorersFromLocalData();
			setTopScorers(updatedScorers);

			console.log(
				`Goal added! Current score: ${updatedActiveGames[gameIndex].scores[0]}-${updatedActiveGames[gameIndex].scores[1]}`
			);
		} catch (error) {
			console.error('Error adding goal:', error);
		}
	};

	// Function to finish a game and save statistics
	const finishGame = async (gameIndex: number) => {
		if (!gameDay) return;

		// Show loading state
		setIsSubmitting(true);

		try {
			// 1. Create a new copy of active games
			const updatedGames = activeGames.map((game, idx) => {
				if (idx === gameIndex) {
					return {...game, finished: true};
				}
				return game;
			});

			// Update UI immediately
			setActiveGames(updatedGames);

			// Get the game data
			const game = updatedGames[gameIndex];
			const team1Name = gameDay.teams[game.team1Index].name;
			const team2Name = gameDay.teams[game.team2Index].name;
			const team1Score = game.scores[0];
			const team2Score = game.scores[1];

			// Determine winner
			let winner = null;
			if (team1Score > team2Score) {
				winner = team1Name;
			} else if (team2Score > team1Score) {
				winner = team2Name;
			}

			const gameResult = {
				team1: team1Name,
				team2: team2Name,
				team1Score: team1Score,
				team2Score: team2Score,
				date: new Date().toISOString(),
				winner: winner,
			};

			console.log('Saving game result:', gameResult);

			// Save game result to server
			const response = await matchApi.saveGameResult(params.id, gameResult);

			if (!response?.success) {
				throw new Error(response?.error || 'Problem saving game results');
			}

			console.log('Game results saved successfully!');

			// Save player statistics
			try {
				// Save team 1 player statistics
				for (const player of gameDay.teams[game.team1Index].players) {
					const playerId = player.playerId || '';
					const playerGoals = (player as any).goals;
					if (playerId && typeof playerGoals === 'number' && playerGoals > 0) {
						await addGoal({
							playerId,
							matchId: gameDay._id || params.id,
							goals: playerGoals,
						});
						console.log(`Saved ${playerGoals} goals for player ${player.name}`);
					}
				}

				// Save team 2 player statistics
				for (const player of gameDay.teams[game.team2Index].players) {
					const playerId = player.playerId || '';
					const playerGoals = (player as any).goals;
					if (playerId && typeof playerGoals === 'number' && playerGoals > 0) {
						await addGoal({
							playerId,
							matchId: gameDay._id || params.id,
							goals: playerGoals,
						});
						console.log(`Saved ${playerGoals} goals for player ${player.name}`);
					}
				}

				console.log('Player statistics saved successfully');
			} catch (statsError) {
				console.error('Error saving player statistics:', statsError);
				// Continue even if there is an error saving statistics
			}

			// Refresh data from server
			try {
				const statsResponse = await matchApi.getStatistics(params.id);
				if (statsResponse?.success && statsResponse.data) {
					console.log('Updated statistics from server:', statsResponse.data);

					// Update team statistics table
					if (statsResponse.data.statistics) {
						updateTeamStatisticsFromServer(statsResponse.data.statistics);
					}

					// Update waiting teams list
					updateWaitingTeamsList();
				}
			} catch (refreshError) {
				console.error('Error refreshing data from server:', refreshError);
			}

			// Save all data automatically after finishing a game
			await saveAllData();

			// Show success message
			toast.success('Game finished successfully!');
		} catch (error) {
			console.error('Error finishing game:', error);
			toast.error('Error finishing game');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Helper function to update team statistics from server response
	const updateTeamStatisticsFromServer = (serverStats: any[]) => {
		if (!gameDay) return;

		const localStats = serverStats
			.map((stat) => {
				const teamIndex = gameDay.teams.findIndex((team) => team.name === stat.teamName);

				if (teamIndex !== -1) {
					// Calculate points based on wins and draws
					const points = stat.won * 3 + stat.drawn;

					return {
						teamIndex,
						teamName: stat.teamName,
						played: stat.played,
						won: stat.won,
						drawn: stat.drawn,
						lost: stat.lost,
						goalsFor: stat.goalsFor,
						goalsAgainst: stat.goalsAgainst,
						// Use points from server if available, otherwise use calculated value
						points: stat.points !== undefined ? stat.points : points,
					};
				}
				return null;
			})
			.filter((stat) => stat !== null) as {
			teamIndex: number;
			teamName: string;
			played: number;
			won: number;
			drawn: number;
			lost: number;
			goalsFor: number;
			goalsAgainst: number;
			points: number;
		}[];

		setTeamStatistics(localStats);
	};

	// Helper function to update waiting teams list
	const updateWaitingTeamsList = () => {
		if (!gameDay) return;

		const activeTeamIndexes = activeGames
			.filter((g: Game) => !g.finished)
			.flatMap((g: Game) => [g.team1Index, g.team2Index]);

		const allTeamIndexes = gameDay.teams.map((_, i) => i);
		const availableTeams = allTeamIndexes.filter((i) => !activeTeamIndexes.includes(i));

		setWaitingTeams(availableTeams);
	};

	// Add the saveStatisticsToDatabase function
	const saveStatisticsToDatabase = async () => {
		if (!gameDay) return;

		try {
			// For each player with goals, save their statistics
			for (const [playerId, goals] of Object.entries(playerGoals)) {
				await addGoal({
					playerId,
					matchId: gameDay._id || params.id,
					goals: goals,
				});
			}

			console.log('Statistics saved successfully');
			return true;
		} catch (error) {
			console.error('Error saving statistics:', error);
			return false;
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

							{gameDay.isCompleted && (
								<div className='mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-blue-100 text-blue-800'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-4 w-4 mr-1'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M5 13l4 4L19 7'
										/>
									</svg>
									יום משחקים נעול
								</div>
							)}
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

					{/* Save button - only show if gameday is not completed */}
					{!gameDay.isCompleted && (
						<div className='fixed bottom-6 right-6 z-10'>
							<button
								onClick={saveAllData}
								disabled={isSubmitting}
								className='flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg transition-all transform hover:scale-105'>
								{isSubmitting ? (
									<>
										<svg
											className='animate-spin -mr-1 h-5 w-5 text-white'
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
										שומר...
									</>
								) : (
									<>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											className='h-5 w-5'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4'
											/>
										</svg>
										שמור יום משחקים
									</>
								)}
							</button>
						</div>
					)}

					{/* Complete match day button */}
					<div className={`fixed bottom-6 ${gameDay.isCompleted ? 'right-6' : 'left-6'} z-10`}>
						<button
							onClick={completeMatchDay}
							disabled={isSubmitting || gameDay.isCompleted}
							className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full shadow-lg transition-all transform hover:scale-105 ${
								gameDay.isCompleted
									? 'bg-gray-400 cursor-not-allowed'
									: 'bg-blue-600 hover:bg-blue-700 text-white'
							}`}>
							{isSubmitting ? (
								<>
									<svg
										className='animate-spin -mr-1 h-5 w-5 text-white'
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
									מעבד...
								</>
							) : gameDay.isCompleted ? (
								<>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-5 w-5 mr-1'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M5 13l4 4L19 7'
										/>
									</svg>
									יום המשחקים הושלם
								</>
							) : (
								<>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-5 w-5 mr-1'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M5 13l4 4L19 7'
										/>
									</svg>
									סיים ונעל יום משחקים
								</>
							)}
						</button>
					</div>
				</>
			)}
		</div>
	);
}
