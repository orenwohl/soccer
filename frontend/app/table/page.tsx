'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useAuth } from '../context/AuthContext'
import { useLeagueTable } from '../hooks/useLeagueTable'
import LeagueTable from '../components/table/LeagueTable'
import ErrorMessage from '../components/ErrorMessage'

export default function TablePage() {
	const router = useRouter()
	const { loading: authLoading } = useAuth()
	const { data, isLoading, error, isError } = useLeagueTable()

	const teams = data?.data?.teams || []
	const lastUpdated = data?.data?.lastUpdated || new Date().toISOString()
	const errorMessage = isError ? (error as Error).message : null

	// Auth check
	useEffect(() => {
		if (authLoading) return

		const token = Cookies.get('token')
		if (!token) {
			router.push('/login')
		}
	}, [router, authLoading])

	if (isLoading || authLoading) {
		return (
			<div dir="rtl" className="flex justify-center items-center h-64">
				<div className="text-center">
					<div className="text-xl font-semibold mb-2">טוען נתוני ליגה...</div>
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800 mx-auto"></div>
				</div>
			</div>
		)
	}

	return (
		<div dir="rtl">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-green-800 mb-2">טבלת ליגה</h1>
				<p className="text-gray-600">דירוג נוכחי על סמך תוצאות המשחקים</p>
			</div>

			<ErrorMessage message={errorMessage} />

			<LeagueTable teams={teams} lastUpdated={lastUpdated} />
		</div>
	)
}
