export interface Player {
	_id: string;
	name: string;
	rating: number;
	email: string;
	phone: string;
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

export interface GameMatch {
	team1: string;
	team2: string;
	team1Score?: number;
	team2Score?: number;
	isCompleted: boolean;
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
}

export interface Match {
	_id: string;
	date: string;
	location: string;
	teams: Team[];
	isCompleted: boolean;
	createdAt?: string;
	updatedAt?: string;
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

export interface LeagueTable {
	teams: TeamStats[];
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
