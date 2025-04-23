import {Player, Match, PlayersResponse, PlayerResponse, MatchesResponse, MatchResponse, TeamsResponse} from '../types';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create API instance
const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Add auth token to requests
api.interceptors.request.use(
	(config) => {
		if (typeof window !== 'undefined') {
			const token = localStorage.getItem('token');
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// Player API
export const playerApi = {
	getAll: async (): Promise<PlayersResponse> => {
		try {
			const response = await api.get('/api/players');
			return response.data;
		} catch (error) {
			console.error('Error fetching players:', error);
			return {success: false, error: 'Failed to fetch players'};
		}
	},

	getById: async (id: string): Promise<PlayerResponse> => {
		try {
			const response = await api.get(`/api/players/${id}`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching player ${id}:`, error);
			return {success: false, error: 'Failed to fetch player'};
		}
	},

	create: async (playerData: Omit<Player, '_id' | 'createdAt' | 'updatedAt'>): Promise<PlayerResponse> => {
		try {
			const response = await api.post('/api/players', playerData);
			return response.data;
		} catch (error) {
			console.error('Error creating player:', error);
			return {
				success: false,
				error: error.response?.data?.message || 'Failed to create player',
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
		} catch (error) {
			console.error(`Error updating player ${id}:`, error);
			return {
				success: false,
				error: error.response?.data?.message || 'Failed to update player',
			};
		}
	},

	delete: async (id: string): Promise<PlayerResponse> => {
		try {
			const response = await api.delete(`/api/players/${id}`);
			return response.data;
		} catch (error) {
			console.error(`Error deleting player ${id}:`, error);
			return {
				success: false,
				error: error.response?.data?.message || 'Failed to delete player',
			};
		}
	},
};

// Match API
export const matchApi = {
	getAll: async (): Promise<MatchesResponse> => {
		try {
			const response = await api.get('/api/matches');
			return response.data;
		} catch (error) {
			console.error('Error fetching matches:', error);
			return {success: false, error: 'Failed to fetch matches'};
		}
	},

	getById: async (id: string): Promise<MatchResponse> => {
		try {
			const response = await api.get(`/api/matches/${id}`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching match ${id}:`, error);
			return {success: false, error: 'Failed to fetch match'};
		}
	},

	create: async (matchData: Omit<Match, '_id' | 'createdAt' | 'updatedAt'>): Promise<MatchResponse> => {
		try {
			const response = await api.post('/api/matches', matchData);
			return response.data;
		} catch (error) {
			console.error('Error creating match:', error);
			return {
				success: false,
				error: error.response?.data?.message || 'Failed to create match',
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
		} catch (error) {
			console.error(`Error updating match ${id}:`, error);
			return {
				success: false,
				error: error.response?.data?.message || 'Failed to update match',
			};
		}
	},

	delete: async (id: string): Promise<MatchResponse> => {
		try {
			const response = await api.delete(`/api/matches/${id}`);
			return response.data;
		} catch (error) {
			console.error(`Error deleting match ${id}:`, error);
			return {
				success: false,
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
			return response.data;
		} catch (error) {
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
			return response.data;
		} catch (error) {
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
			return response.data;
		} catch (error) {
			console.error('Error fetching user profile:', error);
			return {success: false, error: 'Failed to fetch user profile'};
		}
	},
};
