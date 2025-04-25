import axios from 'axios';
import {Platform} from 'react-native';
import {mockPlayers, mockMatches, mockLeagueTable} from './mockData';

// Configure API URL based on platform and environment
let API_URL = '';

// For Android emulator
if (Platform.OS === 'android') {
	API_URL = 'http://10.0.2.2:3030/api';
}
// For iOS simulator
else if (Platform.OS === 'ios') {
	API_URL = 'http://localhost:3030/api';
}
// Fallback for physical devices - replace with your actual server IP
else {
	API_URL = 'http://192.168.1.100:3030/api'; // Change this to your computer's local IP
}

console.log(`Using API URL: ${API_URL}`);

const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000, // Add timeout
});

// Add response interceptor for better error handling
api.interceptors.response.use(
	(response) => response,
	(error) => {
		console.error('API Error:', error);
		if (error.message === 'Network Error') {
			console.error('Network Error - Check if the server is running and accessible');
		}
		return Promise.reject(error);
	}
);

// Players
export const getPlayers = async () => {
	try {
		const response = await api.get('/players');
		return response.data;
	} catch (error) {
		console.error('Error in getPlayers:', error);
		console.log('Using mock player data as fallback');
		return mockPlayers; // Return mock data on error
	}
};

export const getPlayer = async (id: string) => {
	try {
		const response = await api.get(`/players/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error in getPlayer:', error);
		// Find the player in mock data
		const player = mockPlayers.find((p) => p.id === id);
		if (player) return player;
		throw error;
	}
};

export const createPlayer = async (playerData: any) => {
	try {
		const response = await api.post('/players', playerData);
		return response.data;
	} catch (error) {
		console.error('Error in createPlayer:', error);
		throw error;
	}
};

export const updatePlayer = async (id: string, playerData: any) => {
	try {
		const response = await api.put(`/players/${id}`, playerData);
		return response.data;
	} catch (error) {
		console.error('Error in updatePlayer:', error);
		throw error;
	}
};

// Matches
export const getMatches = async () => {
	try {
		const response = await api.get('/matches');
		return response.data;
	} catch (error) {
		console.error('Error in getMatches:', error);
		console.log('Using mock match data as fallback');
		return mockMatches; // Return mock data on error
	}
};

export const getMatch = async (id: string) => {
	try {
		const response = await api.get(`/matches/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error in getMatch:', error);
		// Find the match in mock data
		const match = mockMatches.find((m) => m.id === id);
		if (match) return match;
		throw error;
	}
};

export const createMatch = async (matchData: any) => {
	const response = await api.post('/matches', matchData);
	return response.data;
};

export const updateMatch = async (id: string, matchData: any) => {
	const response = await api.put(`/matches/${id}`, matchData);
	return response.data;
};

// Table
export const getLeagueTable = async () => {
	try {
		const response = await api.get('/table');
		return response.data;
	} catch (error) {
		console.error('Error in getLeagueTable:', error);
		console.log('Using mock league table data as fallback');
		return mockLeagueTable; // Return mock data on error
	}
};

// Auth
export const login = async (credentials: {username: string; password: string}) => {
	const response = await api.post('/auth/login', credentials);
	return response.data;
};

export const register = async (userData: {username: string; password: string; name: string}) => {
	const response = await api.post('/auth/register', userData);
	return response.data;
};

export default api;
