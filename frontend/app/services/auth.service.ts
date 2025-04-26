'use client'

import api from './api-client'
import { AxiosError } from 'axios'

export interface AuthResponse {
	success: boolean
	token?: string
	user?: {
		id: string
		name: string
		email: string
	}
	error?: string
}

export const authService = {
	register: async (userData: { name: string; email: string; password: string }): Promise<AuthResponse> => {
		try {
			const response = await api.post('/api/auth/register', userData)
			return {
				success: true,
				token: response.data.token,
				user: response.data.user
			}
		} catch (error: unknown) {
			console.error('Error registering user:', error)
			const axiosError = error as AxiosError<{ message?: string }>
			return {
				success: false,
				error: axiosError.response?.data?.message || 'Failed to register user'
			}
		}
	},

	login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
		try {
			const response = await api.post('/api/auth/login', credentials)
			return {
				success: true,
				token: response.data.token,
				user: response.data.user
			}
		} catch (error: unknown) {
			console.error('Error logging in:', error)
			const axiosError = error as AxiosError<{ message?: string }>
			return {
				success: false,
				error: axiosError.response?.data?.message || 'Failed to login'
			}
		}
	},

	getMe: async (): Promise<AuthResponse> => {
		try {
			const response = await api.get('/api/auth/me')
			return {
				success: true,
				user: response.data.user
			}
		} catch (error: unknown) {
			console.error('Error fetching user profile:', error)
			const axiosError = error as AxiosError<{ message?: string }>
			return {
				success: false,
				error: axiosError.response?.data?.message || 'Failed to fetch user profile'
			}
		}
	}
}
