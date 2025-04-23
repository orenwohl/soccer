import { IMatch, TeamStat } from '../models/Match'

interface TeamStats {
	name: string
	played: number
	won: number
	drawn: number
	lost: number
	goalsFor: number
	goalsAgainst: number
	goalDifference?: number
	points: number
}

interface LeagueTable {
	teams: TeamStats[]
	lastUpdated: Date
}

/**
 * Generates a league table based on completed matches
 *
 * @param matches - List of all matches
 * @returns League table with team statistics
 */
export const generateLeagueTable = (matches: IMatch[]): LeagueTable => {
	const teams: Record<string, TeamStats> = {}

	// Process all completed matches
	matches
		.filter(match => match.isCompleted)
		.forEach(match => {
			match.teams.forEach(team => {
				if (!teams[team.name]) {
					teams[team.name] = {
						name: team.name,
						played: 0,
						won: 0,
						drawn: 0,
						lost: 0,
						goalsFor: 0,
						goalsAgainst: 0,
						points: 0
					}
				}

				const currentTeam = teams[team.name]
				currentTeam.played += 1
				currentTeam.goalsFor += team.score

				// Find opponent team
				const opponent = match.teams.find(t => t.name !== team.name)
				if (opponent) {
					currentTeam.goalsAgainst += opponent.score

					if (team.score > opponent.score) {
						currentTeam.won += 1
						currentTeam.points += 3
					} else if (team.score === opponent.score) {
						currentTeam.drawn += 1
						currentTeam.points += 1
					} else {
						currentTeam.lost += 1
					}
				}
			})
		})

	// Calculate goal difference and convert to array
	const tableTeams = Object.values(teams).map(team => ({
		...team,
		goalDifference: team.goalsFor - team.goalsAgainst
	}))

	// Sort by points (then goal difference, then goals scored)
	const sortedTeams = tableTeams.sort((a, b) => {
		// Sort by points
		const pointsDiff = b.points - a.points
		if (pointsDiff !== 0) return pointsDiff

		// If points are equal, sort by goal difference
		const goalDiffDiff = b.goalDifference! - a.goalDifference!
		if (goalDiffDiff !== 0) return goalDiffDiff

		// If goal difference is equal, sort by goals scored
		return b.goalsFor - a.goalsFor
	})

	return {
		teams: sortedTeams,
		lastUpdated: new Date()
	}
}

export default generateLeagueTable
