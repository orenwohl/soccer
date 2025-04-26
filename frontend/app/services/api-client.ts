'use client'

import Axios, { AxiosError } from 'axios'
import Cookies from 'js-cookie'

// Create axios instance with default config
const api = Axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3030',
	headers: {
		'Content-Type': 'application/json'
	},
	withCredentials: true // Important for CORS with credentials
})

// Add request interceptor to add authorization header when token exists
api.interceptors.request.use(config => {
	const token = Cookies.get('token')
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
	response => response,
	(error: AxiosError) => {
		// Handle expired tokens, unauthorized access, etc.
		if (error.response?.status === 401 || error.response?.status === 403) {
			// Don't remove token on every error - let the handler function decide
			console.warn('Authorization error:', error.message)
		}
		return Promise.reject(error)
	}
)

export default api
