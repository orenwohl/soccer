'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Cookies from 'js-cookie'
import { authService } from '../services'

interface User {
	id: string
	name: string
	email: string
	picture?: string
}

interface AuthContextType {
	user: User | null
	loading: boolean
	login: (email: string, password: string) => Promise<void>
	register: (name: string, email: string, password: string) => Promise<void>
	logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Set cookie expiration to 30 days
const COOKIE_EXPIRATION = 30

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const router = useRouter()

	useEffect(() => {
		// Check if user is logged in
		const token = Cookies.get('token')
		if (token) {
			loadUser()
		} else {
			setLoading(false)
		}
	}, [])

	const loadUser = async () => {
		try {
			const response = await authService.getMe()
			if (response.success && response.user) {
				setUser(response.user as User)
			} else {
				// Only remove token if the error is specifically related to authentication
				if (response.error?.includes('authorization') || response.error?.includes('authenticated') || response.error?.includes('token')) {
					console.warn('Removing token due to auth error:', response.error)
					Cookies.remove('token')
					setUser(null)
				}
			}
		} catch (err) {
			console.error('Error loading user:', err)
			// Only remove token on specific auth errors, not on network errors
			// This prevents logouts on temporary network issues
			if (err instanceof Error && (err.message.includes('authorization') || err.message.includes('token') || err.message.includes('auth'))) {
				Cookies.remove('token')
				setUser(null)
			}
		} finally {
			setLoading(false)
		}
	}

	const login = async (email: string, password: string) => {
		try {
			setLoading(true)
			const response = await authService.login({ email, password })

			if (response.success && response.token && response.user) {
				// Store token in cookie
				Cookies.set('token', response.token, { expires: COOKIE_EXPIRATION })
				setUser(response.user as User)
				toast.success('התחברת בהצלחה')

				// Check if there's a callback URL to redirect to
				const urlParams = new URLSearchParams(window.location.search)
				const callbackUrl = urlParams.get('callbackUrl')

				if (callbackUrl) {
					window.location.href = decodeURI(callbackUrl)
				} else {
					router.push('/')
				}
			} else {
				toast.error(response.error || 'התחברות נכשלה')
			}
		} catch (err) {
			const error = err as Error & { response?: { data?: { message?: string } } }
			toast.error(error.response?.data?.message || 'התחברות נכשלה')
		} finally {
			setLoading(false)
		}
	}

	const register = async (name: string, email: string, password: string) => {
		try {
			setLoading(true)
			const response = await authService.register({ name, email, password })

			if (response.success && response.token && response.user) {
				// Store token in cookie
				Cookies.set('token', response.token, { expires: COOKIE_EXPIRATION })
				setUser(response.user as User)
				toast.success('נרשמת בהצלחה')
				router.push('/')
			} else {
				toast.error(response.error || 'ההרשמה נכשלה')
			}
		} catch (err) {
			const error = err as Error & { response?: { data?: { message?: string } } }
			toast.error(error.response?.data?.message || 'ההרשמה נכשלה')
		} finally {
			setLoading(false)
		}
	}

	const logout = () => {
		Cookies.remove('token')
		setUser(null)
		toast.success('התנתקת בהצלחה')
		router.push('/login')
	}

	return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
