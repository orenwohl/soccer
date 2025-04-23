import { IPlayer } from '../models/Player'
import { ObjectId } from 'mongodb'

interface TeamPlayer {
	playerId: string
	name: string
	rating: number
}

interface Team {
	name: string
	players: TeamPlayer[]
	totalRating: number
	averageRating: number
}

/**
 * Generates balanced teams based on player ratings using a snake draft method.
 *
 * @param players - List of players to distribute into teams
 * @param numberOfTeams - Number of teams to generate (default: 2)
 * @param teamNames - Array of team names to use (defaults to Hebrew team names)
 * @returns Array of balanced teams
 */
export const generateBalancedTeams = (players: IPlayer[], numberOfTeams = 2, teamNames?: string[]): Team[] => {
	// Default team names if not provided (in Hebrew)
	const defaultTeamNames = ['קבוצה אדומה', 'קבוצה כחולה', 'קבוצה ירוקה', 'קבוצה צהובה']
	const usedTeamNames = teamNames || defaultTeamNames.slice(0, numberOfTeams)

	// Sort players by rating (descending)
	const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating)

	// Initialize teams
	const teams: Team[] = usedTeamNames.map(name => ({
		name,
		players: [],
		totalRating: 0,
		averageRating: 0
	}))

	// Distribute players using "snake draft" method to ensure balance
	sortedPlayers.forEach((player, index) => {
		// For even rounds, go left to right
		// For odd rounds, go right to left
		const round = Math.floor(index / numberOfTeams)
		const teamIndex = round % 2 === 0 ? index % numberOfTeams : numberOfTeams - 1 - (index % numberOfTeams)

		// Safely convert _id to string, handling different types
		let playerIdString: string

		// Generate new ID if _id is missing
		if (!player._id) {
			playerIdString = new ObjectId().toString()
		} else {
			// Convert any type of _id to string safely
			try {
				// First try direct string conversion for string or ObjectId
				playerIdString = String(player._id)
			} catch (error) {
				// If that fails, generate a new ID
				console.warn('Could not convert player ID to string, generating new ID')
				playerIdString = new ObjectId().toString()
			}
		}

		const teamPlayer: TeamPlayer = {
			playerId: playerIdString,
			name: player.name,
			rating: player.rating
		}

		teams[teamIndex].players.push(teamPlayer)
		teams[teamIndex].totalRating += player.rating
	})

	// Calculate average ratings
	teams.forEach(team => {
		team.averageRating = team.players.length > 0 ? parseFloat((team.totalRating / team.players.length).toFixed(2)) : 0
	})

	return teams
}

export default generateBalancedTeams
