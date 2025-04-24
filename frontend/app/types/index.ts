export interface Player {
	_id: string;
	name: string;
	rating: number;
	phone: string;
	fitnessRating: number;
	defenseRating: number;
	techniqueRating: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface TeamPlayer {
	playerId: string;
	name: string;
	rating: number;
}

export interface Team {
	name: string;
	players: TeamPlayer[];
	averageRating: number;
	color?: string;
	score?: number;
}

export interface Goal {
	playerId: string;
	playerName: string;
	teamId: string;
	teamName: string;
	matchId: string;
	gameDayId: string;
	timestamp: string;
}

export interface GameMatch {
	team1: string;
	team2: string;
	team1Score?: number;
	team2Score?: number;
	isCompleted: boolean;
	goals?: Goal[];
}

export interface GameDay {
	_id: string;
	date: string;
	location: string;
	teams: Team[];
	matches: GameMatch[];
	isCompleted: boolean;
	createdAt?: string;
	updatedAt?: string;
	goals?: Goal[];
}

export interface Match {
	_id: string;
	date: string;
	location: string;
	teams: Team[];
	isCompleted: boolean;
	createdAt?: string;
	updatedAt?: string;
	goals?: Goal[];
}

export interface TeamStats {
	name: string;
	played: number;
	won: number;
	drawn: number;
	lost: number;
	goalsFor: number;
	goalsAgainst: number;
	goalDifference: number;
	points: number;
}

export interface PlayerStats {
	playerId: string;
	playerName: string;
	goals: number;
	matches: number;
}

export interface LeagueTable {
	teams: TeamStats[];
	topScorers?: PlayerStats[];
	lastUpdated: string;
}

export interface ApiResponse<T> {
	success: boolean;
	data: T;
	count?: number;
	error?: string | string[];
}

export type PlayersResponse = ApiResponse<Player[]>;
export type PlayerResponse = ApiResponse<Player>;

export type MatchesResponse = ApiResponse<Match[]>;
export type MatchResponse = ApiResponse<Match>;

export type GameDaysResponse = ApiResponse<GameDay[]>;
export type GameDayResponse = ApiResponse<GameDay>;

export type TeamsResponse = ApiResponse<Team[]>;

export type LeagueTableResponse = ApiResponse<LeagueTable>;
