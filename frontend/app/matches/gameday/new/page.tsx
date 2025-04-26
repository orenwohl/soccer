'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Player, TeamPlayer } from '@/app/types'
import { playerService, matchService } from '@/app/services'
import { TeamShirt, TEAM_COLORS } from '@/app/components/TeamShirt'

// Color Picker Modal Component
interface ColorPickerModalProps {
	isOpen: boolean
	onClose: () => void
	selectedTeam: ExtendedTeam | undefined
	onSelectColor: (color: string) => void
	usedColors: string[]
}

const ColorPickerModal = ({ isOpen, onClose, selectedTeam, onSelectColor, usedColors }: ColorPickerModalProps) => {
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4" onClick={onClose}>
			<div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold">בחירת צבע לקבוצה</h2>
					<button onClick={onClose} className="text-gray-500 hover:text-gray-700">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="text-center mb-4">
					<div className="inline-block h-12 w-12 rounded-full border-2 border-gray-300 mb-2" style={{ backgroundColor: selectedTeam?.color }}></div>
					<p className="text-gray-700">{selectedTeam?.name}</p>
				</div>

				<div className="grid grid-cols-3 gap-3 mb-4">
					{TEAM_COLORS.map(color => {
						const isUsed = usedColors.includes(color.value) && color.value !== selectedTeam?.color
						return (
							<button
								key={color.value}
								disabled={isUsed}
								onClick={() => onSelectColor(color.value)}
								className={`
									h-16 rounded-md flex flex-col items-center justify-center 
									${color.value === selectedTeam?.color ? 'ring-2 ring-blue-500' : isUsed ? 'opacity-40 cursor-not-allowed' : 'hover:ring-2 hover:ring-gray-300'}
								`}
								style={{
									backgroundColor: color.value,
									color: color.textColor
								}}
							>
								<span>{color.name}</span>
								{isUsed && <span className="text-xs mt-1">בשימוש</span>}
							</button>
						)
					})}
				</div>

				<div className="flex justify-end">
					<button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
						ביטול
					</button>
				</div>
			</div>
		</div>
	)
}

// מוק נתונים של שחקנים - בהמשך המידע ייטען מהשרת
// const MOCK_PLAYERS: Player[] = [ ... ]

// Function to render star rating
const renderRatingStars = (rating: number) => {
	return (
		<div className="flex">
			{[...Array(5)].map((_, i) => (
				<span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
					★
				</span>
			))}
		</div>
	)
}

// Update the types to fix linter errors
interface ExtendedTeam {
	name: string
	color: string
	players?: TeamPlayer[]
	averageRating?: number
}

export default function NewGameDayPage() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [isRebalancing, setIsRebalancing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [transferMode, setTransferMode] = useState<'swap' | 'transfer'>('swap')

	// Color picker modal state
	const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
	const [selectedTeamForColor, setSelectedTeamForColor] = useState<{ index: number; team: ExtendedTeam } | null>(null)

	const [formData, setFormData] = useState<{
		date: string
		time: string
		location: string
		teams: ExtendedTeam[]
	}>({
		date: '',
		time: '14:00',
		location: '',
		teams: [] // Start with empty teams array
	})

	// מצב עבור בחירת שחקנים
	const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])
	const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
	const [step, setStep] = useState<'info' | 'players' | 'teams'>('info')
	const [selectedPlayerForMove, setSelectedPlayerForMove] = useState<{
		playerId: string
		teamIndex: number
	} | null>(null)

	// טעינת רשימת השחקנים בעת טעינת הדף
	useEffect(() => {
		const fetchPlayers = async () => {
			try {
				setIsLoading(true)
				const response = await playerService.getAll()

				if (response.success) {
					setAvailablePlayers(response.data)
				} else {
					console.error('Failed to fetch players:', response.error)
					setError('אירעה שגיאה בטעינת רשימת השחקנים')
				}
			} catch (err) {
				console.error('Error fetching players:', err)
				setError('אירעה שגיאה בטעינת רשימת השחקנים')
			} finally {
				setIsLoading(false)
			}
		}

		fetchPlayers()

		// Initialize with two teams on first load
		if (formData.teams.length === 0) {
			// Add first team
			const firstColor = TEAM_COLORS[0]
			const updatedTeams = [...formData.teams, { name: `קבוצה ${firstColor.name}`, color: firstColor.value }]

			// Add second team
			const secondColor = TEAM_COLORS[1]
			updatedTeams.push({ name: `קבוצה ${secondColor.name}`, color: secondColor.value })

			setFormData(prev => ({ ...prev, teams: updatedTeams }))
		}
	}, [formData.teams]) // Include formData.teams in the dependency array

	const handleAddTeam = () => {
		// בחירת הצבע הראשון שעדיין לא נבחר
		const usedColors = formData.teams.map(team => team.color)
		const availableColor = TEAM_COLORS.find(color => !usedColors.includes(color.value))

		if (!availableColor) {
			setError('הגעת למספר המקסימלי של קבוצות')
			return
		}

		setFormData({
			...formData,
			teams: [...formData.teams, { name: `קבוצה ${availableColor.name}`, color: availableColor.value }]
		})
	}

	const handleRemoveTeam = (index: number) => {
		if (formData.teams.length <= 2) {
			setError('יום משחקים חייב לכלול לפחות 2 קבוצות')
			return
		}
		setFormData({
			...formData,
			teams: formData.teams.filter((_, i) => i !== index)
		})

		setError(null)
	}

	// Open color picker modal for a team
	const openColorPicker = (index: number) => {
		setSelectedTeamForColor({
			index,
			team: formData.teams[index]
		})
		setIsColorPickerOpen(true)
	}

	// Handle color selection from modal
	const handleTeamColorChange = (colorValue: string) => {
		if (!selectedTeamForColor) return

		const selectedColor = TEAM_COLORS.find(color => color.value === colorValue)
		if (!selectedColor) return

		const index = selectedTeamForColor.index
		const updatedTeams = [...formData.teams]

		updatedTeams[index] = {
			...updatedTeams[index],
			color: selectedColor.value,
			name: `קבוצה ${selectedColor.name}`
		}

		setFormData({ ...formData, teams: updatedTeams })
		setIsColorPickerOpen(false)
		setError(null)
	}

	// Toggle player selection
	const togglePlayerSelection = (playerId: string) => {
		if (selectedPlayers.includes(playerId)) {
			setSelectedPlayers(selectedPlayers.filter(id => id !== playerId))
		} else {
			setSelectedPlayers([...selectedPlayers, playerId])
		}
	}

	// Check/uncheck all players
	const toggleAllPlayers = () => {
		if (selectedPlayers.length === availablePlayers.length) {
			setSelectedPlayers([])
		} else {
			setSelectedPlayers(availablePlayers.map(player => player._id))
		}
	}

	// Create a separate rebalance function that doesn't change step or other settings
	const rebalanceTeams = () => {
		// Set rebalancing state to true
		setIsRebalancing(true)

		// Reset selected player for move if any
		setSelectedPlayerForMove(null)

		// Collect all players from all teams into a single array
		const allPlayers: TeamPlayer[] = []
		formData.teams.forEach(team => {
			if (team.players && team.players.length > 0) {
				allPlayers.push(...team.players)
			}
		})

		// Sort players by rating (highest first)
		allPlayers.sort((a, b) => b.rating - a.rating)

		// Calculate how many players should be in each team
		const totalPlayers = allPlayers.length
		const numTeams = formData.teams.length
		const basePlayersPerTeam = Math.floor(totalPlayers / numTeams) // Minimum players per team
		const extraPlayers = totalPlayers % numTeams // Number of teams that will get an extra player

		// Initialize team players arrays
		const teamPlayers: TeamPlayer[][] = Array(numTeams)
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
						teamPlayers[team].push(allPlayers[playerIndex])
						playerIndex++
					}
				}
				// Backward direction for odd rounds
				else {
					for (let team = numTeams - 1; team >= 0; team--) {
						teamPlayers[team].push(allPlayers[playerIndex])
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
					teamPlayers[team].push(allPlayers[playerIndex])
					playerIndex++
					team += extraDirection

					// Safety check to avoid index out of bounds
					if (team >= numTeams) team = numTeams - 1
					if (team < 0) team = 0
				}
			}

			// Update form data with the player assignments but preserve other properties
			const updatedTeams = formData.teams.map((team, idx) => {
				const players = teamPlayers[idx]
				const totalRating = players.reduce((sum, p) => sum + p.rating, 0)
				const averageRating = players.length > 0 ? totalRating / players.length : 0

				return {
					...team, // Preserve color, name and other properties
					players,
					averageRating
				}
			})

			// Update form data
			setFormData({
				...formData, // Preserve all other form data
				teams: updatedTeams
			})

			// Set rebalancing state back to false
			setIsRebalancing(false)
		}, 800) // Add a short delay for visual effect
	}

	// Select player for moving between teams
	const handlePlayerSelection = (playerId: string, teamIndex: number) => {
		if (selectedPlayerForMove && selectedPlayerForMove.playerId === playerId && selectedPlayerForMove.teamIndex === teamIndex) {
			// Cancel selection if clicking the same player
			setSelectedPlayerForMove(null)
		} else if (selectedPlayerForMove) {
			if (transferMode === 'swap') {
				// In swap mode, exchange players between teams
				swapPlayers(selectedPlayerForMove.playerId, selectedPlayerForMove.teamIndex, playerId, teamIndex)
			} else {
				// In transfer mode, just move the selected player to the new team
				movePlayerToTeam(selectedPlayerForMove.playerId, selectedPlayerForMove.teamIndex, teamIndex)
			}
		} else {
			// Start selection
			setSelectedPlayerForMove({ playerId, teamIndex })
		}
	}

	// Swap players between teams
	const swapPlayers = (player1Id: string, team1Index: number, player2Id: string, team2Index: number) => {
		if (team1Index === team2Index) {
			setSelectedPlayerForMove(null)
			return
		}

		const updatedTeams = [...formData.teams]

		// Find both players
		const team1 = updatedTeams[team1Index]
		const team2 = updatedTeams[team2Index]

		if (!team1.players || !team2.players) {
			setSelectedPlayerForMove(null)
			return
		}

		const player1Index = team1.players.findIndex(p => p.playerId === player1Id)
		const player2Index = team2.players.findIndex(p => p.playerId === player2Id)

		if (player1Index === -1 || player2Index === -1) {
			setSelectedPlayerForMove(null)
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

		setFormData({
			...formData,
			teams: updatedTeams
		})

		setSelectedPlayerForMove(null)
	}

	// Move player between teams
	const movePlayerToTeam = (playerId: string, sourceTeamIndex: number, targetTeamIndex: number) => {
		if (sourceTeamIndex === targetTeamIndex) {
			setSelectedPlayerForMove(null)
			return
		}

		const updatedTeams = [...formData.teams]

		// Find the player in the source team
		const sourceTeam = updatedTeams[sourceTeamIndex]
		const playerIndex = sourceTeam.players?.findIndex(p => p.playerId === playerId) ?? -1

		if (playerIndex === -1 || !sourceTeam.players) {
			setSelectedPlayerForMove(null)
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

		setFormData({
			...formData,
			teams: updatedTeams
		})

		setSelectedPlayerForMove(null)
	}

	// Generate balanced teams based on ratings - used for initial team generation
	const generateBalancedTeams = () => {
		if (selectedPlayers.length < formData.teams.length * 2) {
			setError(`יש לבחור לפחות ${formData.teams.length * 2} שחקנים כדי ליצור קבוצות מאוזנות`)
			return false
		}

		// Get selected players with their details
		const playersToAssign = availablePlayers
			.filter(player => selectedPlayers.includes(player._id))
			.map(player => ({
				...player,
				// Calculate a weighted score considering multiple attributes
				// Defense (25% weight)
				balanceScore:
					(player.rating || 0) * 0.5 + // Overall rating (50% weight)
					(player.fitnessRating || 0) * 0.25 + // Fitness (25% weight)
					(player.defenseRating || 0) * 0.25
			}))
			.sort((a, b) => b.balanceScore - a.balanceScore) // Sort by combined score (highest first)

		// Calculate how many players should be in each team
		const totalPlayers = playersToAssign.length
		const numTeams = formData.teams.length
		const basePlayersPerTeam = Math.floor(totalPlayers / numTeams) // Minimum players per team
		const extraPlayers = totalPlayers % numTeams // Number of teams that will get an extra player

		// Initialize team players arrays and team attribute totals
		const teamPlayers: TeamPlayer[][] = Array(numTeams)
			.fill(null)
			.map(() => [])
		const teamStats = Array(numTeams)
			.fill(null)
			.map(() => ({
				totalRating: 0,
				totalFitness: 0,
				totalDefense: 0,
				playerCount: 0
			}))

		// Distribute players using serpentine draft method with multi-attribute balancing
		let playerIndex = 0

		// First, ensure each team has the minimum number of players
		for (let round = 0; round < basePlayersPerTeam; round++) {
			// Forward direction for even rounds
			if (round % 2 === 0) {
				for (let team = 0; team < numTeams; team++) {
					const player = playersToAssign[playerIndex]
					teamPlayers[team].push({
						playerId: player._id,
						name: player.name,
						rating: player.rating
						// Include additional attributes if needed in the TeamPlayer interface
					})

					// Update team stats
					teamStats[team].totalRating += player.rating || 0
					teamStats[team].totalFitness += player.fitnessRating || 0
					teamStats[team].totalDefense += player.defenseRating || 0
					teamStats[team].playerCount++

					playerIndex++
				}
			}
			// Backward direction for odd rounds
			else {
				for (let team = numTeams - 1; team >= 0; team--) {
					const player = playersToAssign[playerIndex]
					teamPlayers[team].push({
						playerId: player._id,
						name: player.name,
						rating: player.rating
						// Include additional attributes if needed
					})

					// Update team stats
					teamStats[team].totalRating += player.rating || 0
					teamStats[team].totalFitness += player.fitnessRating || 0
					teamStats[team].totalDefense += player.defenseRating || 0
					teamStats[team].playerCount++

					playerIndex++
				}
			}
		}

		// Distribute remaining players (if any) to the teams with lowest overall balance score
		if (extraPlayers > 0) {
			// Calculate average stats for each team
			const teamBalanceScores = teamStats.map(stats => {
				const avgRating = stats.totalRating / stats.playerCount
				const avgFitness = stats.totalFitness / stats.playerCount
				const avgDefense = stats.totalDefense / stats.playerCount

				// Calculate same weighted balance as we did for players
				return 0.5 * avgRating + 0.25 * avgFitness + 0.25 * avgDefense
			})

			// Assign remaining players to teams with lowest balance scores
			for (let i = 0; i < extraPlayers; i++) {
				const player = playersToAssign[playerIndex]

				// Find team with lowest balance score
				let weakestTeamIndex = 0
				let lowestScore = teamBalanceScores[0]

				for (let t = 1; t < numTeams; t++) {
					if (teamBalanceScores[t] < lowestScore) {
						lowestScore = teamBalanceScores[t]
						weakestTeamIndex = t
					}
				}

				// Add player to weakest team
				teamPlayers[weakestTeamIndex].push({
					playerId: player._id,
					name: player.name,
					rating: player.rating
					// Include additional attributes if needed
				})

				// Update team stats
				teamStats[weakestTeamIndex].totalRating += player.rating || 0
				teamStats[weakestTeamIndex].totalFitness += player.fitnessRating || 0
				teamStats[weakestTeamIndex].totalDefense += player.defenseRating || 0
				teamStats[weakestTeamIndex].playerCount++

				// Recalculate balance score for this team
				teamBalanceScores[weakestTeamIndex] =
					0.5 * (teamStats[weakestTeamIndex].totalRating / teamStats[weakestTeamIndex].playerCount) +
					0.25 * (teamStats[weakestTeamIndex].totalFitness / teamStats[weakestTeamIndex].playerCount) +
					0.25 * (teamStats[weakestTeamIndex].totalDefense / teamStats[weakestTeamIndex].playerCount)

				playerIndex++
			}
		}

		// Update form data with the player assignments but preserve other properties
		const updatedTeams = formData.teams.map((team, idx) => {
			const players = teamPlayers[idx]
			const totalRating = players.reduce((sum, p) => sum + p.rating, 0)
			const averageRating = players.length > 0 ? totalRating / players.length : 0

			return {
				...team, // Preserve color, name and other properties
				players,
				averageRating
			}
		})

		// Update form data
		setFormData({
			...formData, // Preserve all other form data
			teams: updatedTeams
		})

		setError(null)
		return true // Return success indicator
	}

	const handleNextStep = () => {
		if (step === 'info') {
			if (!formData.date || !formData.location) {
				setError('נא למלא את כל השדות הנדרשים')
				return
			}
			setStep('players')
			setError(null)
		} else if (step === 'players') {
			if (selectedPlayers.length < 4) {
				setError('יש לבחור לפחות 4 שחקנים')
				return
			}
			// Generate teams first, and only move to next step if successful
			const success = generateBalancedTeams()
			if (success) {
				setStep('teams')
			}
		}
	}

	const handlePrevStep = () => {
		if (step === 'players') {
			setStep('info')
		} else if (step === 'teams') {
			setStep('players')
		}
		setError(null)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// Always prevent default form submission
		if (step !== 'teams') {
			setError('יש לסיים את כל השלבים לפני יצירת יום המשחקים')
			return
		}

		if (!formData.date || !formData.location) {
			setError('נא למלא את כל השדות הנדרשים')
			return
		}

		if (formData.teams.length < 2) {
			setError('יום משחקים חייב לכלול לפחות 2 קבוצות')
			return
		}

		// Check for duplicate team colors
		const teamColors = formData.teams.map(team => team.color)
		if (new Set(teamColors).size !== teamColors.length) {
			setError('צבעי הקבוצות חייבים להיות ייחודיים')
			return
		}

		try {
			setIsLoading(true)
			setError(null)

			// Format the data for the API
			const matchData = {
				date: `${formData.date}T${formData.time}:00`,
				location: formData.location,
				teams: formData.teams.map(team => ({
					name: team.name,
					color: team.color,
					players: team.players || [],
					averageRating: team.averageRating || 0,
					score: 0 // Initialize score to 0
				})),
				isCompleted: false
			}

			// Call the API to create a new match
			const response = await matchService.create(matchData)

			if (!response.success) {
				const errorMessage = typeof response.error === 'string' ? response.error : 'Failed to create game day'
				throw new Error(errorMessage)
			}

			console.log('Game day created successfully:', response.data)

			// Redirect to matches page after successful creation
			router.push('/matches')
		} catch (err) {
			console.error('Failed to create game day:', err)
			const errorMessage = err instanceof Error ? err.message : 'אירעה שגיאה ביצירת יום המשחקים'
			setError(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	// Render step content
	const renderStepContent = () => {
		if (step === 'info') {
			return (
				<>
					<div className="mb-6">
						<h2 className="text-xl font-semibold text-green-800 mb-4">פרטי יום המשחקים</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
							<div>
								<label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
									תאריך
								</label>
								<input
									type="date"
									id="date"
									value={formData.date}
									onChange={e => setFormData({ ...formData, date: e.target.value })}
									className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
									required
								/>
							</div>
							<div>
								<label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
									שעה
								</label>
								<input
									type="time"
									id="time"
									value={formData.time}
									onChange={e => setFormData({ ...formData, time: e.target.value })}
									className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
									required
								/>
							</div>
						</div>

						<div className="mb-6">
							<label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
								מיקום
							</label>
							<input
								type="text"
								id="location"
								value={formData.location}
								onChange={e => setFormData({ ...formData, location: e.target.value })}
								className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
								placeholder="לדוגמה: פארק מרכזי"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">קבוצות</label>
							<div className="space-y-3 mb-4">
								{formData.teams.map((team, index) => (
									<div key={index} className="bg-white p-4 rounded-md border border-gray-200">
										<div className="flex items-center mb-2">
											<TeamShirt color={team.color} size="md" animated />
											<span className="font-medium ml-2">{team.name}</span>
											<button type="button" onClick={() => handleRemoveTeam(index)} className="text-red-500 hover:text-red-700 mr-auto">
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
													<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>

										{/* Color selection button */}
										<button type="button" onClick={() => openColorPicker(index)} className="text-sm text-blue-600 hover:text-blue-800 mb-2 flex items-center">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
												/>
											</svg>
											שנה צבע קבוצה
										</button>
									</div>
								))}
							</div>

							<button type="button" onClick={handleAddTeam} className="flex items-center text-green-600 hover:text-green-800">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
								</svg>
								הוסף קבוצה
							</button>
						</div>
					</div>

					{/* Color Picker Modal */}
					<ColorPickerModal
						isOpen={isColorPickerOpen}
						onClose={() => setIsColorPickerOpen(false)}
						selectedTeam={selectedTeamForColor?.team}
						onSelectColor={handleTeamColorChange}
						usedColors={formData.teams.map(team => team.color)}
					/>
				</>
			)
		} else if (step === 'players') {
			return (
				<>
					<div className="mb-6">
						<h2 className="text-xl font-semibold text-green-800 mb-4">בחירת שחקנים</h2>
						<p className="text-gray-600 mb-4">בחר את השחקנים שמגיעים ליום המשחקים. לאחר מכן המערכת תיצור קבוצות מאוזנות באופן אוטומטי.</p>

						<div className="mb-4">
							<div className="flex justify-between items-center mb-2">
								<span className="font-medium">
									שחקנים נבחרו: {selectedPlayers.length} / {availablePlayers.length}
								</span>
								<button type="button" onClick={toggleAllPlayers} className="text-sm text-green-600 hover:text-green-800">
									{selectedPlayers.length === availablePlayers.length ? 'בטל בחירת הכל' : 'בחר הכל'}
								</button>
							</div>

							<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
												בחר
											</th>
											<th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
												שם
											</th>
											<th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
												דירוג
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{availablePlayers.map(player => (
											<tr
												key={player._id}
												className={`hover:bg-gray-50 cursor-pointer ${selectedPlayers.includes(player._id) ? 'bg-green-50' : ''}`}
												onClick={() => togglePlayerSelection(player._id)}
											>
												<td className="px-6 py-4 whitespace-nowrap">
													<input
														type="checkbox"
														checked={selectedPlayers.includes(player._id)}
														onChange={() => {}} // Using the row click instead
														className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
													/>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="font-medium text-gray-900">{player.name}</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">{renderRatingStars(player.rating)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</>
			)
		} else if (step === 'teams') {
			return (
				<>
					<div className="mb-6">
						<h2 className="text-xl font-semibold text-green-800 mb-4">קבוצות מחולקות</h2>
						<p className="text-gray-600 mb-4">
							המערכת חילקה את השחקנים באופן אוטומטי. ניתן לערוך את ההרכב על ידי לחיצה על שחקן אחד ולאחר מכן על שחקן או קבוצה אחרת.
							{selectedPlayerForMove && (
								<span className="block mt-2 text-orange-600 font-medium">
									בחרת שחקן להחלפה.
									{transferMode === 'swap' ? ' בחר שחקן מקבוצה אחרת להחלפה,' : ' בחר קבוצה אחרת להעברת השחקן,'}
									או לחץ שוב על אותו שחקן לביטול.
								</span>
							)}
						</p>

						{/* Transfer mode toggle */}
						<div className="flex items-center justify-center mb-4 bg-gray-50 p-3 rounded-md">
							<span className="text-sm font-medium mr-2">מצב העברת שחקנים:</span>
							<div className="flex border border-gray-300 rounded-md overflow-hidden">
								<button
									type="button"
									onClick={() => setTransferMode('swap')}
									className={`px-3 py-1.5 text-sm ${transferMode === 'swap' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
								>
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
									</svg>
									החלפת שחקנים
								</button>
								<button
									type="button"
									onClick={() => setTransferMode('transfer')}
									className={`px-3 py-1.5 text-sm ${transferMode === 'transfer' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
								>
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
									</svg>
									העברת שחקן
								</button>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
							{formData.teams.map((team, teamIndex) => (
								<div
									key={teamIndex}
									className={`bg-white rounded-lg shadow-sm border-2 p-4 ${
										selectedPlayerForMove && transferMode === 'transfer' && selectedPlayerForMove.teamIndex !== teamIndex
											? 'cursor-pointer hover:bg-green-50' // Highlight as drop target in transfer mode
											: ''
									}`}
									style={{ borderColor: team.color }}
									// Allow clicking on the team container in transfer mode
									onClick={() => {
										if (selectedPlayerForMove && transferMode === 'transfer' && selectedPlayerForMove.teamIndex !== teamIndex) {
											// When in transfer mode and a player is selected, clicking a team moves the player there
											movePlayerToTeam(selectedPlayerForMove.playerId, selectedPlayerForMove.teamIndex, teamIndex)
										}
									}}
								>
									<div className="flex items-center mb-3">
										<div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: team.color }}></div>
										<h3 className="font-medium text-lg">{team.name}</h3>
										<span className="text-sm text-gray-500 ml-auto">דירוג ממוצע: {team.averageRating?.toFixed(1) || 0}</span>
									</div>

									<ul className="space-y-2">
										{team.players?.map(player => (
											<li
												key={player.playerId}
												onClick={e => {
													e.stopPropagation() // Prevent team click event from triggering
													handlePlayerSelection(player.playerId, teamIndex)
												}}
												className={`flex justify-between items-center text-sm p-2 rounded-md cursor-pointer hover:bg-gray-50 ${
													selectedPlayerForMove && selectedPlayerForMove.playerId === player.playerId && selectedPlayerForMove.teamIndex === teamIndex
														? 'ring-2 ring-orange-500 bg-orange-50'
														: ''
												}`}
											>
												<span>{player.name}</span>
												{renderRatingStars(player.rating)}
											</li>
										))}
										{!team.players?.length && <li className="text-gray-400 text-center py-2">אין שחקנים</li>}
									</ul>
								</div>
							))}
						</div>

						<div className="flex justify-center">
							<button
								type="button"
								onClick={rebalanceTeams}
								disabled={isRebalancing}
								className={`mt-4 px-4 py-2 rounded-md flex items-center justify-center transition-all ${
									isRebalancing ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'
								}`}
							>
								{isRebalancing ? (
									<>
										<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										מערבב קבוצות...
									</>
								) : (
									<>
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
											/>
										</svg>
										איזון קבוצות מחדש
									</>
								)}
							</button>
						</div>
					</div>
				</>
			)
		}
	}

	return (
		<div dir="rtl" className="max-w-4xl mx-auto">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-green-800">יצירת יום משחקים חדש</h1>
				<p className="text-gray-600 mt-2">הגדר את הפרטים הבסיסיים ליום המשחקים והקבוצות המשתתפות.</p>
			</div>

			{/* Progress Indicator */}
			<div className="mb-8">
				<div className="flex justify-between">
					<div className={`flex-1 text-center ${step === 'info' ? 'font-medium text-green-800' : 'text-gray-500'}`}>פרטי יום משחקים</div>
					<div className={`flex-1 text-center ${step === 'players' ? 'font-medium text-green-800' : 'text-gray-500'}`}>בחירת שחקנים</div>
					<div className={`flex-1 text-center ${step === 'teams' ? 'font-medium text-green-800' : 'text-gray-500'}`}>קבוצות</div>
				</div>
				<div className="relative mt-2">
					<div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
						<div
							style={{ width: step === 'info' ? '33%' : step === 'players' ? '66%' : '100%' }}
							className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-600 transition-all duration-300"
						></div>
					</div>
				</div>
			</div>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					<p>{error}</p>
				</div>
			)}

			<form
				onSubmit={e => {
					// Extra safety to prevent automatic form submission
					e.preventDefault()
					if (step === 'teams') {
						handleSubmit(e)
					} else {
						handleNextStep()
					}
				}}
				className="bg-white rounded-lg shadow-md p-6"
			>
				{renderStepContent()}

				<div className="flex justify-between mt-8 border-t pt-4">
					<div>
						{step !== 'info' && (
							<button type="button" onClick={handlePrevStep} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200">
								חזרה
							</button>
						)}
					</div>
					<div className="flex gap-2">
						<Link href="/matches" className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200">
							ביטול
						</Link>
						{step === 'teams' ? (
							<button
								type="button" // Changed from submit to button
								onClick={handleSubmit}
								className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 disabled:opacity-50"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<span className="animate-spin mr-2">⏳</span> מעבד...
									</>
								) : (
									'צור יום משחקים'
								)}
							</button>
						) : (
							<button type="button" onClick={handleNextStep} className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800">
								המשך
							</button>
						)}
					</div>
				</div>
			</form>
		</div>
	)
}
