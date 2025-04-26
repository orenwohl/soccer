'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Match } from '@/app/types'
import { toast } from 'react-hot-toast'
import { matchService } from '@/app/services/'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { StarRating, GameDayIcons } from '@/app/services/svg.service'
import { WeatherDisplay } from '@/app/components/WeatherDisplay'
import { Check, Download } from 'lucide-react'

import type { Game, GameDayPlayerStats, GameDayTeamPlayer } from '@/app/types'
import { TeamsTab } from './TeamsTab'
import { OverviewTab } from './OverviewTab'
import { GamesAndTableTab } from './GamesAndTableTab'

// Default color if no color is specified
const DEFAULT_COLOR = '#9ca3af' // Gray

export default function GameDayPage({ params }: { params: { id: string } }) {
	// Properly cast and unwrap params - use as any to work around typing issue
	const { id } = use(params as any) as { id: string }
	const [gameDay, setGameDay] = useState<Match | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [activeTab, setActiveTab] = useState('games')
	const [isRebalancing, setIsRebalancing] = useState(false)
	const [transferMode, setTransferMode] = useState<'swap' | 'transfer'>('swap')
	const [selectedPlayerForSwap, setSelectedPlayerForSwap] = useState<{ playerId: string; teamIndex: number } | null>(null)
	const [activeGames, setActiveGames] = useState<Game[]>([])
	const [teamStatistics, setTeamStatistics] = useState<
		{
			teamIndex: number
			teamName?: string
			played: number
			won: number
			lost: number
			drawn: number
			goalsFor: number
			goalsAgainst: number
			points?: number // Add optional points field
		}[]
	>([])
	const [selectedTeams, setSelectedTeams] = useState<number[]>([])
	const [waitingTeams, setWaitingTeams] = useState<number[]>([])
	const [playerGoals, setPlayerGoals] = useState<Record<string, number>>({})
	const [topScorers, setTopScorers] = useState<GameDayPlayerStats[]>([])
	const router = useRouter()

	const [currentGame, setCurrentGame] = useState<Game | null>(null)

	// Comment out unused variables
	// const {data: gameDayData, error: gameDayError, isLoading: gameDayIsLoading} = useGetGameDay(params.id);

	// Right after useEffect starts and before fetchGameDay, initialize topScorers as an empty array
	useEffect(() => {
		// Initialize top scorers as empty to avoid showing the "no scorers found" message initially
		setTopScorers([])

		const fetchGameDay = async () => {
			try {
				setIsLoading(true)
				console.log('Fetching match data for ID:', id)
				const response = await matchService.getById(id)
				console.log('Match API response:', response)

				if (response.success) {
					console.log('Match data loaded:', response.data)
					if (response.data.teams) {
						console.log(
							'Team names:',
							response.data.teams.map(t => t.name)
						)
					}

					// המשך הקוד הקיים

					setGameDay(response.data)
					// Initialize waiting teams with all team indices
					const initialWaitingTeams = Array.from({ length: response.data.teams.length }, (_, i) => i)
					setWaitingTeams(initialWaitingTeams)

					// Fetch statistics from server
					console.log('Fetching statistics for match ID:', id)
					const statsResponse = await matchService.getStatistics(id)
					console.log('Statistics API response:', statsResponse)
					if (statsResponse.success && statsResponse.data) {
						console.log('Statistics and game results loaded:', statsResponse.data)

						// Compute team stats from gameResults
						const gameResults = statsResponse.data.gameResults || []
						const computedStats = response.data.teams.map((team, idx) => ({
							teamIndex: idx,
							teamName: team.name,
							played: 0,
							won: 0,
							drawn: 0,
							lost: 0,
							goalsFor: 0,
							goalsAgainst: 0
						}))

						gameResults.forEach(result => {
							const t1 = response.data.teams.findIndex(t => t.name === result.team1)
							const t2 = response.data.teams.findIndex(t => t.name === result.team2)
							if (t1 === -1 || t2 === -1) return

							// Update played
							computedStats[t1].played++
							computedStats[t2].played++

							// Update goals
							computedStats[t1].goalsFor += result.team1Score
							computedStats[t1].goalsAgainst += result.team2Score
							computedStats[t2].goalsFor += result.team2Score
							computedStats[t2].goalsAgainst += result.team1Score

							// Win/Loss/Draw
							if (result.team1Score > result.team2Score) {
								computedStats[t1].won++
								computedStats[t2].lost++
							} else if (result.team2Score > result.team1Score) {
								computedStats[t2].won++
								computedStats[t1].lost++
							} else {
								computedStats[t1].drawn++
								computedStats[t2].drawn++
							}
						})

						setTeamStatistics(computedStats)

						// Build completed games array
						const completedGames = gameResults.map(result => {
							const team1Index = response.data.teams.findIndex(t => t.name === result.team1)
							const team2Index = response.data.teams.findIndex(t => t.name === result.team2)
							return {
								team1Index,
								team2Index,
								scores: [result.team1Score, result.team2Score] as [number, number],
								finished: true
							}
						})
						setActiveGames(completedGames)

						// Recompute waiting teams
						const occupied = new Set(completedGames.flatMap(g => [g.team1Index, g.team2Index]))
						const allIndexes = response.data.teams.map((_, i) => i)
						setWaitingTeams(allIndexes.filter(i => !occupied.has(i)))
					}
				} else {
					console.error('Error response from API:', response.error)
					setError(typeof response.error === 'string' ? response.error : 'שגיאה בטעינת נתוני יום המשחקים')
				}
			} catch (err) {
				console.error('Error fetching match data:', err)
				setError('שגיאה בטעינת נתוני יום המשחקים')
			} finally {
				setIsLoading(false)
			}
		}

		fetchGameDay()
	}, [id])

	const rebalanceTeams = () => {
		if (!gameDay) return

		// Set rebalancing state to true
		setIsRebalancing(true)

		// Reset selected player for swap if any
		setSelectedPlayerForSwap(null)

		// Collect all players from all teams into a single array
		const allPlayers: GameDayTeamPlayer[] = []
		gameDay.teams.forEach(team => {
			if (team.players && team.players.length > 0) {
				allPlayers.push(...team.players)
			}
		})

		// Sort players by rating (highest first)
		const sortedAllPlayers = allPlayers.sort((a, b) => (b.rating || 0) - (a.rating || 0))

		// Calculate how many players should be in each team
		const totalPlayers = allPlayers.length
		const numTeams = gameDay.teams.length
		const basePlayersPerTeam = Math.floor(totalPlayers / numTeams) // Minimum players per team
		const extraPlayers = totalPlayers % numTeams // Number of teams that will get an extra player

		// Initialize team players arrays
		const teamPlayers: GameDayTeamPlayer[][] = Array(numTeams)
			.fill(null)
			.map(() => [])

		// Use setTimeout to create a visual delay for the rebalancing effect
		setTimeout(() => {
			// Distribute players using serpentine draft method (snake draft) while ensuring equal number of players
			let playerIndex = 0

			// First, ensure each team has the minimum number of players
			for (let round = 0; round < basePlayersPerTeam; round++) {
				// Forward direction for even rounds
				if (round % 2 === 0) {
					for (let team = 0; team < numTeams; team++) {
						teamPlayers[team].push(sortedAllPlayers[playerIndex])
						playerIndex++
					}
				}
				// Backward direction for odd rounds
				else {
					for (let team = numTeams - 1; team >= 0; team--) {
						teamPlayers[team].push(sortedAllPlayers[playerIndex])
						playerIndex++
					}
				}
			}

			// Distribute remaining players (if any) to the first 'extraPlayers' teams
			// We go in reverse order so the teams with lower indices (which got the first picks)
			// don't always get the extra player
			if (extraPlayers > 0) {
				const extraDirection = basePlayersPerTeam % 2 === 0 ? -1 : 1 // Continue the snake pattern
				let team = extraDirection === 1 ? 0 : numTeams - 1

				for (let i = 0; i < extraPlayers; i++) {
					teamPlayers[team].push(sortedAllPlayers[playerIndex])
					playerIndex++
					team += extraDirection

					// Safety check to avoid index out of bounds
					if (team >= numTeams) team = numTeams - 1
					if (team < 0) team = 0
				}
			}

			// Update gameDay with the player assignments but preserve other properties
			const updatedTeams = gameDay.teams.map((team, idx) => {
				const players = teamPlayers[idx]
				const totalRating = players.reduce((sum, p) => sum + p.rating, 0)
				const averageRating = players.length > 0 ? totalRating / players.length : 0

				return {
					...team, // Preserve name and other properties
					players,
					averageRating
				}
			})

			// Update gameDay state
			setGameDay({
				...gameDay,
				teams: updatedTeams
			})

			// Set rebalancing state back to false
			setIsRebalancing(false)
		}, 800) // Add a short delay for visual effect
	}

	// Add team player swap functionality
	const handlePlayerSelection = (playerId: string, teamIndex: number) => {
		if (selectedPlayerForSwap && selectedPlayerForSwap.playerId === playerId && selectedPlayerForSwap.teamIndex === teamIndex) {
			// Cancel selection if clicking the same player
			setSelectedPlayerForSwap(null)
		} else if (selectedPlayerForSwap) {
			if (transferMode === 'swap') {
				// In swap mode, exchange players between teams
				swapPlayers(selectedPlayerForSwap.playerId, selectedPlayerForSwap.teamIndex, playerId, teamIndex)
			} else {
				// In transfer mode, just move the selected player to the new team
				movePlayerToTeam(selectedPlayerForSwap.playerId, selectedPlayerForSwap.teamIndex, teamIndex)
			}
		} else {
			// Start selection
			setSelectedPlayerForSwap({ playerId, teamIndex })
		}
	}

	// Swap players between teams
	const swapPlayers = (player1Id: string, team1Index: number, player2Id: string, team2Index: number) => {
		if (!gameDay || team1Index === team2Index) {
			setSelectedPlayerForSwap(null)
			return
		}

		const updatedTeams = [...gameDay.teams]

		// Find both players
		const team1 = updatedTeams[team1Index]
		const team2 = updatedTeams[team2Index]

		if (!team1.players || !team2.players) {
			setSelectedPlayerForSwap(null)
			return
		}

		const player1Index = team1.players.findIndex(p => p.playerId === player1Id)
		const player2Index = team2.players.findIndex(p => p.playerId === player2Id)

		if (player1Index === -1 || player2Index === -1) {
			setSelectedPlayerForSwap(null)
			return
		}

		// Get both players
		const player1 = team1.players[player1Index]
		const player2 = team2.players[player2Index]

		// Swap them
		team1.players[player1Index] = player2
		team2.players[player2Index] = player1

		// Recalculate average ratings
		;[team1Index, team2Index].forEach(teamIndex => {
			const team = updatedTeams[teamIndex]
			if (team.players && team.players.length > 0) {
				const totalRating = team.players.reduce((sum, p) => sum + p.rating, 0)
				team.averageRating = totalRating / team.players.length
			} else {
				team.averageRating = 0
			}
		})

		setGameDay({
			...gameDay,
			teams: updatedTeams
		})

		setSelectedPlayerForSwap(null)
	}

	// Move player between teams
	const movePlayerToTeam = (playerId: string, sourceTeamIndex: number, targetTeamIndex: number) => {
		if (!gameDay || sourceTeamIndex === targetTeamIndex) {
			setSelectedPlayerForSwap(null)
			return
		}

		const updatedTeams = [...gameDay.teams]

		// Find the player in the source team
		const sourceTeam = updatedTeams[sourceTeamIndex]
		const playerIndex = sourceTeam.players?.findIndex(p => p.playerId === playerId) ?? -1

		if (playerIndex === -1 || !sourceTeam.players) {
			setSelectedPlayerForSwap(null)
			return
		}

		// Get the player and remove from source team
		const [player] = sourceTeam.players.splice(playerIndex, 1)

		// Add to target team
		if (!updatedTeams[targetTeamIndex].players) {
			updatedTeams[targetTeamIndex].players = []
		}
		updatedTeams[targetTeamIndex].players?.push(player)

		// Recalculate average ratings
		;[sourceTeamIndex, targetTeamIndex].forEach(teamIndex => {
			const team = updatedTeams[teamIndex]
			if (team.players && team.players.length > 0) {
				const totalRating = team.players.reduce((sum, p) => sum + p.rating, 0)
				team.averageRating = totalRating / team.players.length
			} else {
				team.averageRating = 0
			}
		})

		setGameDay({
			...gameDay,
			teams: updatedTeams
		})

		setSelectedPlayerForSwap(null)
	}

	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return date.toLocaleDateString('he-IL', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	// Use the TeamsTab component instead of inline render function
	const renderTeamsTab = () => {
		if (!gameDay) return null

		// Create a saveTeams function to handle team saving
		const saveTeams = async () => {
			try {
				setIsSubmitting(true)
				await saveAllData()
				toast.success('הקבוצות נשמרו בהצלחה')
			} catch (error) {
				toast.error('שגיאה בשמירת הקבוצות')
			} finally {
				setIsSubmitting(false)
			}
		}

		return (
			<TeamsTab
				gameDay={gameDay}
				transferMode={transferMode}
				selectedPlayerForSwap={selectedPlayerForSwap}
				rebalanceTeams={rebalanceTeams}
				handlePlayerSelection={handlePlayerSelection}
				movePlayerToTeam={movePlayerToTeam}
				isRebalancing={isRebalancing}
				isSubmitting={isSubmitting}
				setIsSubmitting={setIsSubmitting}
				setSelectedPlayerForSwap={setSelectedPlayerForSwap}
				setTransferMode={setTransferMode}
				saveTeams={saveTeams}
			/>
		)
	}

	// Use the OverviewTab component instead of inline render function
	const renderOverviewTab = () => {
		if (!gameDay) return null

		return <OverviewTab gameDay={gameDay} activeGames={activeGames} topScorers={topScorers} />
	}

	// Use the GamesAndTableTab component instead of inline render function
	const renderGamesAndTableTab = () => {
		if (!gameDay) return null

		return (
			<GamesAndTableTab
				gameDay={gameDay}
				activeGames={activeGames}
				isCompleted={!!gameDay.isCompleted}
				teamStatistics={teamStatistics}
				selectedTeams={selectedTeams}
				isSubmitting={isSubmitting}
				toggleTeamSelection={toggleTeamSelection}
				addSelectedTeamsToGame={addSelectedTeamsToGame}
				addGoalToPlayer={addGoalToPlayer}
				finishGame={finishGame}
			/>
		)
	}

	// Add the toggleTeamSelection function
	const toggleTeamSelection = (teamIndex: number) => {
		// אם הקבוצה כבר נבחרה, מוריד אותה מהרשימה
		if (selectedTeams.includes(teamIndex)) {
			setSelectedTeams(selectedTeams.filter(index => index !== teamIndex))
		}
		// אם עוד לא נבחרו 2 קבוצות, מוסיף את הקבוצה לרשימה
		else if (selectedTeams.length < 2) {
			// בדוק שהקבוצה לא משחקת כרגע במשחק פעיל
			const isPlaying = activeGames.some(game => !game.finished && (game.team1Index === teamIndex || game.team2Index === teamIndex))

			if (!isPlaying) {
				setSelectedTeams([...selectedTeams, teamIndex])
			}
		}
	}

	// Add the addSelectedTeamsToGame function
	const addSelectedTeamsToGame = () => {
		if (selectedTeams.length !== 2 || !gameDay) return

		// יצירת משחק חדש עם הקבוצות הנבחרות
		const newGame = {
			team1Index: selectedTeams[0],
			team2Index: selectedTeams[1],
			scores: [0, 0] as [number, number],
			finished: false
		}

		setActiveGames([...activeGames, newGame])

		// עדכון הקבוצות המחכות
		const teamsInActiveGames = activeGames.flatMap(game => [game.team1Index, game.team2Index])
		teamsInActiveGames.push(selectedTeams[0], selectedTeams[1])

		// מצא את כל הקבוצות שלא משחקות כרגע
		const allTeamIndexes = gameDay.teams.map((_, index) => index)
		const newWaitingTeams = allTeamIndexes.filter(index => !teamsInActiveGames.includes(index))

		setWaitingTeams(newWaitingTeams)

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
							players: team.players.map(player => ({
								...player,
								goals: 0 // Reset goals to 0 for this player
							}))
						}
					}
					return team
				})
			}

			// Update gameDay with reset goals
			setGameDay(updatedGameDay)
		}

		// איפוס הבחירה
		setSelectedTeams([])

		// Save all data automatically after creating a new game
		setTimeout(() => {
			saveAllData()
			toast.success('משחק חדש נוסף בהצלחה!')
		}, 300)
	}

	// Prefix unused functions with underscore to indicate they're available for future use
	const _addNextGame = () => {
		if (gameDay?.teams && gameDay.teams.length > 1) {
			// Find available teams that are not currently playing
			const teamsPlaying = activeGames.filter(game => !game.finished).flatMap(game => [game.team1Index, game.team2Index])

			const availableTeams = gameDay.teams.map((_, index) => index).filter(index => !teamsPlaying.includes(index))

			// If we have at least 2 available teams, create a new game
			if (availableTeams.length >= 2) {
				// Select first two available teams
				const newTeam1Index = availableTeams[0]
				const newTeam2Index = availableTeams[1]

				setActiveGames([
					...activeGames,
					{
						team1Index: newTeam1Index,
						team2Index: newTeam2Index,
						scores: [0, 0],
						finished: false
					}
				])

				// Clear team selection
				setSelectedTeams([])
			} else {
				alert('אין מספיק קבוצות זמינות למשחק חדש')
			}
		}
	}

	const _updateGameScore = (gameIndex: number, teamNumber: 1 | 2, score: number) => {
		setActiveGames(currentGames => {
			return currentGames.map((game, index) => {
				if (index === gameIndex) {
					const newScores = [...game.scores]
					newScores[teamNumber - 1] = Math.max(0, score) // Ensure score is not negative
					return { ...game, scores: newScores as [number, number] }
				}
				return game
			})
		})
	}

	// Rename the _saveAllData function (around line 1310) to make it usable
	const saveAllData = async () => {
		if (!gameDay) return false

		setIsSubmitting(true)
		try {
			// Save team statistics to the database
			await saveStatisticsToDatabase()

			// Save any other data that needs to be persisted
			// Save current team assignments
			try {
				const teamResponse = await matchService.update(id, {
					teams: gameDay.teams
				})

				if (!teamResponse.success) {
					throw new Error('Failed to save team data')
				}
			} catch (err) {
				console.error('Error saving team data:', err)
				throw err
			}

			toast.success('כל הנתונים נשמרו בהצלחה!')
			return true
		} catch (error) {
			console.error('שגיאה בשמירת הנתונים:', error)
			toast.error('שגיאה בשמירת הנתונים')
			return false
		} finally {
			setIsSubmitting(false)
		}
	}

	// Function to complete and lock the match day
	const completeMatchDay = async () => {
		if (!gameDay) return

		// Confirm with the user
		if (!confirm('האם אתה בטוח שאתה רוצה לסיים ולנעול יום משחקים זה? לא ניתן יהיה לערוך אותו לאחר מכן.')) {
			return
		}

		setIsSubmitting(true)
		try {
			// First save all current data
			const saveSuccess = await saveAllData()
			if (!saveSuccess) {
				throw new Error('Failed to save match data')
			}

			// Update match status to completed
			const response = await matchService.update(id, {
				isCompleted: true
			})

			if (!response.success) {
				throw new Error('Failed to update match status')
			}

			toast.success('יום המשחקים הושלם ונעול בהצלחה!')

			// Redirect back to matches list
			setTimeout(() => {
				router.push('/matches')
			}, 1500)
		} catch (error) {
			console.error('Error completing match day:', error)
			toast.error('שגיאה בהשלמת יום המשחקים')
		} finally {
			setIsSubmitting(false)
		}
	}

	// Define the findPlayerInfo helper function
	const findPlayerInfo = (playerId: string) => {
		if (!gameDay) return null

		for (const team of gameDay.teams) {
			const player = team.players.find(p => p.playerId === playerId)
			if (player) {
				return {
					name: player.name,
					team: team.name
				}
			}
		}
		return null
	}

	// Update buildTopScorersFromLocalData to use the correct types
	const buildTopScorersFromLocalData = () => {
		if (!gameDay) return [] as GameDayPlayerStats[]

		// Use the playerGoals state to build the top scorers list
		const scorers = Object.entries(playerGoals).map(([playerId, goals]) => {
			const playerInfo = findPlayerInfo(playerId)
			return {
				playerId: playerId,
				playerName: playerInfo?.name || 'Unknown Player',
				team: playerInfo?.team || 'Unknown Team',
				goals: goals,
				matches: 1 // We can improve this if needed
			} as GameDayPlayerStats
		})

		return scorers.sort((a, b) => b.goals - a.goals)
	}

	// Import the addGoal function from the API
	const addGoal = async ({ playerId, matchId, goals }: { playerId: string; matchId: string; goals: number }) => {
		try {
			await fetch('/api/goals', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ playerId, matchId, goals })
			})
			return true
		} catch (error) {
			console.error('Error adding goal:', error)
			return false
		}
	}

	// Add the addGoalForPlayer function
	const addGoalForPlayer = async (playerId: string) => {
		if (!gameDay || !currentGame) return

		// Update player goals in state
		setPlayerGoals(prev => {
			const newGoals = { ...prev }
			newGoals[playerId] = (newGoals[playerId] || 0) + 1
			return newGoals
		})

		// Update top scorers list
		buildTopScorersFromLocalData()

		// Call API to save goal if we have valid IDs
		if (gameDay._id) {
			await addGoal({
				playerId,
				matchId: gameDay._id,
				goals: (playerGoals[playerId] || 0) + 1
			})
		}
	}

	// Function to add a goal to a player
	const addGoalToPlayer = (gameIndex: number, teamIndex: number, playerIndex: number) => {
		if (!gameDay) return

		try {
			// Get the game and create deep copies
			const game = activeGames[gameIndex]
			if (!game) {
				console.error('Game not found at index:', gameIndex)
				return
			}

			// Create new copies for immutable updates
			const updatedActiveGames = activeGames.map((g, idx) => {
				if (idx === gameIndex) {
					// Create a new copy of this game with updated scores
					return {
						...g,
						scores: teamIndex === 0 ? ([g.scores[0] + 1, g.scores[1]] as [number, number]) : ([g.scores[0], g.scores[1] + 1] as [number, number])
					}
				}
				return g
			})

			// Get the actual team index from the gameDay teams array
			const actualTeamIndex = teamIndex === 0 ? game.team1Index : game.team2Index

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
									const playerGoals = (player as any).goals || 0
									return {
										...player,
										goals: playerGoals + 1
									}
								}
								return player
							})
						}
					}
					return team
				})
			}

			// Update states with the new copies
			setActiveGames(updatedActiveGames)
			setGameDay(updatedGameDay)

			// Update player goals for top scorers tracking
			const player = updatedGameDay.teams[actualTeamIndex].players[playerIndex]
			const playerId = player.playerId || ''
			if (playerId) {
				setPlayerGoals(prev => ({
					...prev,
					[playerId]: (prev[playerId] || 0) + 1
				}))
			}

			// Update top scorers list
			const updatedScorers = buildTopScorersFromLocalData()
			setTopScorers(updatedScorers)

			console.log(`Goal added! Current score: ${updatedActiveGames[gameIndex].scores[0]}-${updatedActiveGames[gameIndex].scores[1]}`)
		} catch (error) {
			console.error('Error adding goal:', error)
		}
	}

	// Function to finish a game and save statistics
	const finishGame = async (gameIndex: number) => {
		if (!gameDay) return

		// Show loading state
		setIsSubmitting(true)

		try {
			// 1. Create a new copy of active games
			const updatedGames = activeGames.map((game, idx) => {
				if (idx === gameIndex) {
					return { ...game, finished: true }
				}
				return game
			})

			// Update UI immediately
			setActiveGames(updatedGames)

			// Get the game data
			const game = updatedGames[gameIndex]
			const team1Name = gameDay.teams[game.team1Index].name
			const team2Name = gameDay.teams[game.team2Index].name
			const team1Score = game.scores[0]
			const team2Score = game.scores[1]

			// Determine winner
			let winner = null
			if (team1Score > team2Score) {
				winner = team1Name
			} else if (team2Score > team1Score) {
				winner = team2Name
			}

			const gameResult = {
				team1: team1Name,
				team2: team2Name,
				team1Score: team1Score,
				team2Score: team2Score,
				date: new Date().toISOString(),
				winner: winner
			}

			console.log('Saving game result:', gameResult)

			// Save game result to server
			const response = await matchService.saveGameResult(id, gameResult)

			if (!response?.success) {
				throw new Error(response?.error || 'Problem saving game results')
			}

			console.log('Game results saved successfully!')

			// Save player statistics
			try {
				// Save team 1 player statistics
				for (const player of gameDay.teams[game.team1Index].players) {
					const playerId = player.playerId || ''
					const playerGoals = (player as any).goals
					if (playerId && typeof playerGoals === 'number' && playerGoals > 0) {
						await addGoal({
							playerId,
							matchId: gameDay._id || id,
							goals: playerGoals
						})
						console.log(`Saved ${playerGoals} goals for player ${player.name}`)
					}
				}

				// Save team 2 player statistics
				for (const player of gameDay.teams[game.team2Index].players) {
					const playerId = player.playerId || ''
					const playerGoals = (player as any).goals
					if (playerId && typeof playerGoals === 'number' && playerGoals > 0) {
						await addGoal({
							playerId,
							matchId: gameDay._id || id,
							goals: playerGoals
						})
						console.log(`Saved ${playerGoals} goals for player ${player.name}`)
					}
				}

				console.log('Player statistics saved successfully')
			} catch (statsError) {
				console.error('Error saving player statistics:', statsError)
				// Continue even if there is an error saving statistics
			}

			// Refresh data from server
			try {
				const statsResponse = await matchService.getStatistics(id)
				if (statsResponse?.success && statsResponse.data) {
					console.log('Updated statistics from server:', statsResponse.data)

					// Update team statistics table
					if (statsResponse.data.statistics) {
						updateTeamStatisticsFromServer(statsResponse.data.statistics)
					}

					// Update waiting teams list
					updateWaitingTeamsList()
				}
			} catch (refreshError) {
				console.error('Error refreshing data from server:', refreshError)
			}

			// Save all data automatically after finishing a game
			await saveAllData()

			// Show success message
			toast.success('Game finished successfully!')
		} catch (error) {
			console.error('Error finishing game:', error)
			toast.error('Error finishing game')
		} finally {
			setIsSubmitting(false)
		}
	}

	// Helper function to update team statistics from server response
	const updateTeamStatisticsFromServer = (serverStats: any[]) => {
		if (!gameDay) return

		const localStats = serverStats
			.map(stat => {
				const teamIndex = gameDay.teams.findIndex(team => team.name === stat.teamName)

				if (teamIndex !== -1) {
					// Calculate points based on wins and draws
					const points = stat.won * 3 + stat.drawn

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
						points: stat.points !== undefined ? stat.points : points
					}
				}
				return null
			})
			.filter(stat => stat !== null) as {
			teamIndex: number
			teamName: string
			played: number
			won: number
			drawn: number
			lost: number
			goalsFor: number
			goalsAgainst: number
			points: number
		}[]

		setTeamStatistics(localStats)
	}

	// Helper function to update waiting teams list
	const updateWaitingTeamsList = () => {
		if (!gameDay) return

		const activeTeamIndexes = activeGames.filter((g: Game) => !g.finished).flatMap((g: Game) => [g.team1Index, g.team2Index])

		const allTeamIndexes = gameDay.teams.map((_, i) => i)
		const availableTeams = allTeamIndexes.filter(i => !activeTeamIndexes.includes(i))

		setWaitingTeams(availableTeams)
	}

	// Add the saveStatisticsToDatabase function
	const saveStatisticsToDatabase = async () => {
		if (!gameDay) return

		try {
			// For each player with goals, save their statistics
			for (const [playerId, goals] of Object.entries(playerGoals)) {
				await addGoal({
					playerId,
					matchId: gameDay._id || id,
					goals: goals
				})
			}

			console.log('Statistics saved successfully')
			return true
		} catch (error) {
			console.error('Error saving statistics:', error)
			return false
		}
	}

	if (isLoading) {
		return (
			<div className="container mx-auto py-8 px-4 text-right">
				<div className="flex justify-center items-center min-h-[50vh]">
					<div className="text-center">
						<div className="w-16 h-16 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto"></div>
						<p className="mt-4 text-gray-600">טוען פרטי יום משחקים...</p>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="container mx-auto py-8 px-4 text-right">
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					<p>אירעה שגיאה בטעינת פרטי יום המשחקים: {error}</p>
					<button onClick={() => window.location.reload()} className="mt-2 text-sm underline hover:text-red-900">
						נסה שוב
					</button>
				</div>
			</div>
		)
	}

	// Conditionally render tabs based on activeTab state
	let activeTabContent
	if (activeTab === 'teams') {
		activeTabContent = renderTeamsTab()
	} else if (activeTab === 'overview') {
		activeTabContent = renderOverviewTab()
	} else if (activeTab === 'games') {
		activeTabContent = renderGamesAndTableTab()
	}

	return (
		<div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4 text-right">
			{gameDay && (
				<>
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 md:mb-6">
						<div>
							<h1 className="text-xl sm:text-2xl font-bold">יום משחקים: {formatDate(gameDay.date)}</h1>
							{gameDay.location && <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1">{gameDay.location}</p>}

							{gameDay.isCompleted && (
								<div className="mt-1 sm:mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs sm:text-sm bg-blue-100 text-blue-800">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
									יום משחקים נעול
								</div>
							)}
						</div>

						<div className="flex space-x-2 mt-2 md:mt-0">
							<Button onClick={() => router.push('/matches')}>חזרה לרשימה</Button>
						</div>
					</div>

					<div className="mb-3 sm:mb-6">
						<div className="inline-flex h-8 sm:h-10 items-center justify-center rounded-md bg-muted p-0.5 sm:p-1 text-muted-foreground">
							<button
								onClick={() => setActiveTab('overview')}
								className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none ${
									activeTab === 'overview' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted hover:text-foreground'
								}`}
							>
								סקירה כללית
							</button>
							<button
								onClick={() => setActiveTab('teams')}
								className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none ${
									activeTab === 'teams' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted hover:text-foreground'
								}`}
							>
								קבוצות
							</button>
							<button
								onClick={() => setActiveTab('games')}
								className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none ${
									activeTab === 'games' ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted hover:text-foreground'
								}`}
							>
								טבלה ומשחקים
							</button>
						</div>
					</div>

					<div className="pt-2 sm:pt-4">{activeTabContent}</div>

					{/* Update Save button for mobile - make it smaller */}
					{!gameDay.isCompleted && (
						<div className="fixed bottom-3 sm:bottom-6 right-3 sm:right-6 z-10">
							<button
								onClick={saveAllData}
								disabled={isSubmitting}
								className="flex items-center justify-center gap-1 sm:gap-2 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-full shadow-lg transition-all transform hover:scale-105"
							>
								{isSubmitting ? (
									<>
										<GameDayIcons.Spinner className="-mr-1 h-4 w-4 sm:h-5 sm:w-5 text-white" />
										שומר...
									</>
								) : (
									<>
										<Download className="h-4 w-4 sm:h-5 sm:w-5" />
										שמור
									</>
								)}
							</button>
						</div>
					)}

					{/* Update Complete match day button for mobile */}
					<div className={`fixed bottom-3 sm:bottom-6 ${gameDay.isCompleted ? 'right-3 sm:right-6' : 'left-3 sm:left-6'} z-10`}>
						<button
							onClick={completeMatchDay}
							disabled={isSubmitting || gameDay.isCompleted}
							className={`flex items-center justify-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-full shadow-lg transition-all transform hover:scale-105 ${
								gameDay.isCompleted ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
							}`}
						>
							{isSubmitting ? (
								<>
									<GameDayIcons.Spinner className="-mr-1 h-5 w-5 text-white" />
									מעבד...
								</>
							) : gameDay.isCompleted ? (
								<>
									<Download />
									יום המשחקים הושלם
								</>
							) : (
								<>
									<Check className="h-5 w-5 mr-1" />
									סיים ונעל יום משחקים
								</>
							)}
						</button>
					</div>
				</>
			)}
		</div>
	)
}
