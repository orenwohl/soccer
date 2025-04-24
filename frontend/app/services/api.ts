'use client';

import {
	Player,
	Match,
	Team,
	PlayersResponse,
	PlayerResponse,
	MatchesResponse,
	MatchResponse,
	TeamsResponse,
	TeamResponse,
} from '../types';
import Axios, {AxiosError} from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with default config
const api = Axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3030',
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true, // Important for CORS with credentials
});

// Add request interceptor to add authorization header when token exists
api.interceptors.request.use((config) => {
	const token = Cookies.get('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		// Handle expired tokens, unauthorized access, etc.
		if (error.response?.status === 401 || error.response?.status === 403) {
			// Don't remove token on every error - let the handler function decide
			console.warn('Authorization error:', error.message);
		}
		return Promise.reject(error);
	}
);

// Player API
export const playerApi = {
	getAll: async (): Promise<PlayersResponse> => {
		try {
			const response = await api.get('/api/players');
			return response.data;
		} catch (error: any) {
			console.error('Error fetching players:', error);
			return {
				success: false,
				data: [],
				error: error.response?.data?.error || 'Failed to fetch players',
			};
		}
	},

	getById: async (id: string): Promise<PlayerResponse> => {
		try {
			const response = await api.get(`/api/players/${id}`);
			return response.data;
		} catch (error: any) {
			console.error(`Error fetching player ${id}:`, error);
			return {
				success: false,
				data: {} as Player,
				error: error.response?.data?.error || 'Failed to fetch player',
			};
		}
	},

	create: async (playerData: Omit<Player, '_id' | 'createdAt' | 'updatedAt'>): Promise<PlayerResponse> => {
		try {
			const response = await api.post('/api/players', playerData);
			return response.data;
		} catch (error: any) {
			console.error('Error creating player:', error);
			return {
				success: false,
				data: {} as Player,
				error: error.response?.data?.error || 'Failed to create player',
			};
		}
	},

	update: async (
		id: string,
		playerData: Partial<Omit<Player, '_id' | 'createdAt' | 'updatedAt'>>
	): Promise<PlayerResponse> => {
		try {
			const response = await api.put(`/api/players/${id}`, playerData);
			return response.data;
		} catch (error: any) {
			console.error(`Error updating player ${id}:`, error);
			return {
				success: false,
				data: {} as Player,
				error: error.response?.data?.error || 'Failed to update player',
			};
		}
	},

	delete: async (id: string): Promise<PlayerResponse> => {
		try {
			const response = await api.delete(`/api/players/${id}`);
			return response.data;
		} catch (error: any) {
			console.error(`Error deleting player ${id}:`, error);
			return {
				success: false,
				data: {} as Player,
				error: error.response?.data?.error || 'Failed to delete player',
			};
		}
	},
};

export interface StatisticsResponse {
	statistics: {
		teamId: string;
		teamName: string;
		played: number;
		won: number;
		drawn: number;
		lost: number;
		goalsFor: number;
		goalsAgainst: number;
	}[];
	gameResults: {
		team1: string;
		team2: string;
		team1Score: number;
		team2Score: number;
		date: string;
		winner: string | null;
	}[];
	topScorers?: {
		playerId: string;
		playerName: string;
		team: string;
		goals: number;
		matches: number;
	}[];
}

// Match API
export const matchApi = {
	getAll: async (): Promise<MatchesResponse> => {
		try {
			const response = await api.get('/api/matches');
			return response.data;
		} catch (error: any) {
			console.error('Error fetching matches:', error);
			return {
				success: false,
				data: [],
				error: error.response?.data?.error || 'Failed to fetch matches',
			};
		}
	},

	getById: async (id: string): Promise<MatchResponse> => {
		try {
			console.log(`Calling getById API for match ID: ${id}`);
			console.log(`Full URL: ${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3030'}/api/matches/${id}`);

			const response = await api.get(`/api/matches/${id}`);
			console.log('API getById raw response:', response);

			return response.data;
		} catch (error: any) {
			console.error(`Error fetching match ${id}:`, error);
			console.error('Full error object:', JSON.stringify(error, null, 2));

			if (error.response) {
				console.error('Response error data:', error.response.data);
				console.error('Response status:', error.response.status);
			}

			return {
				success: false,
				data: {} as Match,
				error: error.response?.data?.error || 'Failed to fetch match',
			};
		}
	},

	create: async (matchData: Omit<Match, '_id' | 'createdAt' | 'updatedAt'>): Promise<MatchResponse> => {
		try {
			// Check if you have a valid token
			const token = Cookies.get('token');
			console.log('Current auth token:', token);

			console.log('Match data received:', JSON.stringify(matchData, null, 2));
			const response = await api.post('/api/matches', matchData);
			return response.data;
		} catch (error: any) {
			console.error('Detailed error:', error);
			return {
				success: false,
				data: {} as Match,
				error: error.response?.data?.error || error.response?.data?.message || 'Failed to create match',
			};
		}
	},

	update: async (
		id: string,
		matchData: Partial<Omit<Match, '_id' | 'createdAt' | 'updatedAt'>>
	): Promise<MatchResponse> => {
		try {
			const response = await api.put(`/api/matches/${id}`, matchData);
			return response.data;
		} catch (error: any) {
			console.error(`Error updating match ${id}:`, error);
			return {
				success: false,
				data: {} as Match,
				error: error.response?.data?.message || 'Failed to update match',
			};
		}
	},

	delete: async (id: string): Promise<MatchResponse> => {
		try {
			const response = await api.delete(`/api/matches/${id}`);
			return response.data;
		} catch (error: any) {
			console.error(`Error deleting match ${id}:`, error);
			return {
				success: false,
				data: {} as Match,
				error: error.response?.data?.message || 'Failed to delete match',
			};
		}
	},

	generateTeams: async (data: {
		playerIds: string[];
		numberOfTeams?: number;
		teamNames?: string[];
	}): Promise<TeamsResponse> => {
		const response = await api.post('/api/matches/generate-teams', data);
		return response.data;
	},

	saveGameResult: async (
		gameDayId: string,
		resultData: {
			team1: string;
			team2: string;
			team1Score: number;
			team2Score: number;
			date: string;
			winner: string | null;
			goals?: Array<{
				playerId: string;
				playerName: string;
				teamId: string;
				teamName: string;
			}>;
		}
	): Promise<{success: boolean; data?: unknown; error?: string}> => {
		const response = await api.post(`/api/matches/${gameDayId}/game-result`, resultData);
		return response.data;
	},

	saveStatistics: async (
		gameDayId: string,
		data: {
			statistics: Array<{
				teamId: string;
				teamName: string;
				played: number;
				won: number;
				drawn: number;
				lost: number;
				goalsFor: number;
				goalsAgainst: number;
			}>;
		}
	): Promise<{success: boolean; data?: unknown; error?: string}> => {
		const response = await api.post(`/api/matches/${gameDayId}/statistics`, data);
		return response.data;
	},

	getStatistics: async (
		gameDayId: string
	): Promise<{
		success: boolean;
		data?: {
			statistics: Array<{
				teamId: string;
				teamName: string;
				played: number;
				won: number;
				drawn: number;
				lost: number;
				goalsFor: number;
				goalsAgainst: number;
			}>;
			gameResults: Array<{
				team1: string;
				team2: string;
				team1Score: number;
				team2Score: number;
				date: string;
				winner: string | null;
			}>;
		};
		error?: string;
	}> => {
		try {
			const response = await api.get(`/api/matches/${gameDayId}/statistics`);
			return response.data;
		} catch (error) {
			console.error('Error fetching match statistics:', error);
			return {success: false, error: 'Failed to fetch match statistics'};
		}
	},

	saveMatchResult: async (
		gameDayId: string,
		matchId: string,
		resultData: {
			team1Score: number;
			team2Score: number;
		}
	): Promise<boolean> => {
		try {
			const response = await api.put(`/api/matches/${gameDayId}/match/${matchId}`, resultData);
			const data = await response.data;
			return data.success;
		} catch (error) {
			console.error('Error saving match result:', error);
			return false;
		}
	},

	saveTeamStatistics: async (
		gameDayId: string,
		teamStats: Array<{
			teamId: string;
			wins: number;
			losses: number;
			draws: number;
			goalsFor: number;
			goalsAgainst: number;
		}>
	): Promise<boolean> => {
		try {
			const response = await api.post('/api/matches/stats', {teamStats});
			const data = await response.data;
			return data.success;
		} catch (error) {
			console.error('Error saving team statistics:', error);
			return false;
		}
	},

	addGoal: async (
		gameDayId: string,
		goalData: {
			playerId: string;
			playerName: string;
			teamId: string;
			teamName: string;
			matchId?: string;
		}
	): Promise<{success: boolean; data?: unknown; error?: string}> => {
		try {
			console.log(`Calling addGoal API for game day ID: ${gameDayId}`, goalData);
			console.log(
				`Full URL: ${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3030'}/api/matches/${gameDayId}/goal`
			);

			const response = await api.post(`/api/matches/${gameDayId}/goal`, goalData);
			console.log('Goal API response:', response.data);
			return response.data;
		} catch (error: any) {
			console.error('Error adding goal:', error);

			if (error.response) {
				console.error('Response error data:', error.response.data);
				console.error('Response status:', error.response.status);
			}

			return {success: false, error: 'Failed to add goal'};
		}
	},

	getTopScorers: async (
		gameDayId: string
	): Promise<{
		success: boolean;
		data?: Array<{playerId: string; playerName: string; goals: number; matches: number}>;
		error?: string;
	}> => {
		try {
			// Instead of using gameDay-specific endpoint, try general stats endpoint
			const response = await api.get('/api/stats/scorers');
			return response.data;
		} catch (error) {
			console.error('Error fetching top scorers:', error);
			return {success: false, error: 'Failed to fetch top scorers'};
		}
	},
};

// League Table API
export const tableApi = {
	getTable: async () => {
		const response = await api.get('/api/table');
		return response.data;
	},
};

// Auth API
export const authApi = {
	register: async (userData: {name: string; email: string; password: string}) => {
		try {
			const response = await api.post('/api/auth/register', userData);
			return {
				success: true,
				token: response.data.token,
				user: response.data.user,
			};
		} catch (error: any) {
			console.error('Error registering user:', error);
			return {
				success: false,
				error: error.response?.data?.message || 'Failed to register user',
			};
		}
	},
	login: async (credentials: {email: string; password: string}) => {
		try {
			const response = await api.post('/api/auth/login', credentials);
			return {
				success: true,
				token: response.data.token,
				user: response.data.user,
			};
		} catch (error: any) {
			console.error('Error logging in:', error);
			return {
				success: false,
				error: error.response?.data?.message || 'Failed to login',
			};
		}
	},
	getMe: async () => {
		try {
			const response = await api.get('/api/auth/me');
			return {
				success: true,
				user: response.data.user,
			};
		} catch (error: any) {
			console.error('Error fetching user profile:', error);
			return {
				success: false,
				error: 'Failed to fetch user profile',
			};
		}
	},
};

// Team API
export const teamApi = {
	getAll: async (): Promise<TeamsResponse> => {
		try {
			const response = await api.get('/api/teams');
			return response.data;
		} catch (error: any) {
			console.error('Error fetching teams:', error);
			return {
				success: false,
				data: [],
				error: error.response?.data?.error || 'Failed to fetch teams',
			};
		}
	},

	getById: async (id: string): Promise<TeamResponse> => {
		try {
			const response = await api.get(`/api/teams/${id}`);
			return response.data;
		} catch (error: any) {
			console.error(`Error fetching team ${id}:`, error);
			return {
				success: false,
				data: {} as Team,
				error: error.response?.data?.error || 'Failed to fetch team',
			};
		}
	},

	create: async (teamData: Omit<Team, '_id' | 'createdAt' | 'updatedAt'>): Promise<TeamResponse> => {
		try {
			const response = await api.post('/api/teams', teamData);
			return response.data;
		} catch (error: any) {
			console.error('Error creating team:', error);
			return {
				success: false,
				data: {} as Team,
				error: error.response?.data?.error || 'Failed to create team',
			};
		}
	},

	update: async (
		id: string,
		teamData: Partial<Omit<Team, '_id' | 'createdAt' | 'updatedAt'>>
	): Promise<TeamResponse> => {
		try {
			const response = await api.put(`/api/teams/${id}`, teamData);
			return response.data;
		} catch (error: any) {
			console.error(`Error updating team ${id}:`, error);
			return {
				success: false,
				data: {} as Team,
				error: error.response?.data?.error || 'Failed to update team',
			};
		}
	},

	delete: async (id: string): Promise<TeamResponse> => {
		try {
			const response = await api.delete(`/api/teams/${id}`);
			return response.data;
		} catch (error: any) {
			console.error(`Error deleting team ${id}:`, error);
			return {
				success: false,
				data: {} as Team,
				error: error.response?.data?.error || 'Failed to delete team',
			};
		}
	},
};

export default api;
