'use client';

import {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import axios from 'axios';
import {toast} from 'react-hot-toast';

interface User {
	id: string;
	name: string;
	email: string;
	picture?: string;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (name: string, email: string, password: string) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		// Check if user is logged in
		const token = localStorage.getItem('token');
		if (token) {
			loadUser(token);
		} else {
			setLoading(false);
		}
	}, []);

	const loadUser = async (token: string) => {
		try {
			const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/me`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setUser(res.data.user);
		} catch (err) {
			console.error('Error loading user:', err);
			localStorage.removeItem('token');
		} finally {
			setLoading(false);
		}
	};

	const login = async (email: string, password: string) => {
		try {
			setLoading(true);
			const res = await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`,
				{
					email,
					password,
				}
			);

			localStorage.setItem('token', res.data.token);
			setUser(res.data.user);
			toast.success('התחברת בהצלחה');
			router.push('/');
		} catch (err) {
			const error = err as Error & {response?: {data?: {message?: string}}};
			toast.error(error.response?.data?.message || 'התחברות נכשלה');
		} finally {
			setLoading(false);
		}
	};

	const register = async (name: string, email: string, password: string) => {
		try {
			setLoading(true);
			const res = await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register`,
				{
					name,
					email,
					password,
				}
			);

			localStorage.setItem('token', res.data.token);
			setUser(res.data.user);
			toast.success('נרשמת בהצלחה');
			router.push('/');
		} catch (err) {
			const error = err as Error & {response?: {data?: {message?: string}}};
			toast.error(error.response?.data?.message || 'ההרשמה נכשלה');
		} finally {
			setLoading(false);
		}
	};

	const logout = () => {
		localStorage.removeItem('token');
		setUser(null);
		toast.success('התנתקת בהצלחה');
		router.push('/login');
	};

	return <AuthContext.Provider value={{user, loading, login, register, logout}}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
