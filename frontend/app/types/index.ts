export interface Player {
	_id: string
	name: string
	rating: number
	phone: string
	fitnessRating: number
	defenseRating: number
	techniqueRating: number
	createdAt?: string
	updatedAt?: string
}

export interface TeamPlayer {
	playerId: string
	name: string
	rating: number
	goals?: number
}

export interface Team {
	name: string
	players: TeamPlayer[]
	averageRating: number
	color?: string
	score?: number
}

export interface Goal {
	playerId: string
	playerName: string
	teamId: string
	teamName: string
	matchId: string
	gameDayId: string
	timestamp: string
}

export interface GameMatch {
	team1: string
	team2: string
	team1Score?: number
	team2Score?: number
	isCompleted: boolean
	goals: Goal[]
}

export interface GameDay {
	_id: string
	date: string
	location: string
	teams: Team[]
	matches: GameMatch[]
	isCompleted: boolean
	createdAt?: string
	updatedAt?: string
	goals?: Goal[]
}

export interface Match {
	_id: string
	date: string
	location: string
	teams: Team[]
	isCompleted: boolean
	createdAt?: string
	updatedAt?: string
	goals?: Goal[]
}

export interface TeamStats {
	name: string
	played: number
	won: number
	drawn: number
	lost: number
	goalsFor: number
	goalsAgainst: number
	goalDifference: number
	points: number
}

export interface PlayerStats {
	playerId: string
	playerName: string
	goals: number
	matches: number
}

export interface LeagueTable {
	teams: TeamStats[]
	topScorers?: PlayerStats[]
	lastUpdated: string
}

export interface ApiResponse<T> {
	success: boolean
	data: T
	count?: number
	error?: string | string[]
}

// Weather related types
export interface WeatherData {
	current?: {
		temperature_2m?: number
		relative_humidity_2m?: number
		apparent_temperature?: number
		precipitation?: number
		weather_code?: number
		wind_speed_10m?: number
		pressure_msl?: number
	}
}

export type PlayersResponse = ApiResponse<Player[]>
export type PlayerResponse = ApiResponse<Player>

export type MatchesResponse = ApiResponse<Match[]>
export type MatchResponse = ApiResponse<Match>

export type GameDaysResponse = ApiResponse<GameDay[]>
export type GameDayResponse = ApiResponse<GameDay>

export type TeamsResponse = ApiResponse<Team[]>
export type TeamResponse = ApiResponse<Team>

export type LeagueTableResponse = ApiResponse<LeagueTable>

// --- GameDay/GamedayPage related types ---

export interface Game {
	id?: string // Make id optional since some game objects don't have it
	team1Index: number
	team2Index: number
	scores: [number, number]
	finished?: boolean
	// Other properties as needed
}

// PlayerStats for gameday context (with team)
export interface GameDayPlayerStats {
	playerId: string
	playerName: string
	team: string
	goals: number
	matches: number
}

// TeamPlayer for gameday context (with optional fields)
export interface GameDayTeamPlayer {
	playerId?: string
	name: string
	id?: string
	level?: number
	rating?: number
	position?: string
	goals: number
	active?: boolean
}
