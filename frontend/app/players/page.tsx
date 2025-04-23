'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import ErrorMessage from '../components/ErrorMessage'
import PlayersList from '../components/players/PlayersList'
import EmptyPlayersActions from '../components/players/EmptyPlayersActions'
import { usePlayers } from '../hooks/usePlayers'

export default function PlayersPage() {
	const router = useRouter()
	const { loading: authLoading } = useAuth()
	const { data, isLoading, error, isError } = usePlayers()
	const players = data?.data || []
	const errorMessage = isError ? (error as Error).message : null

	// Auth check
	useEffect(() => {
		// Don't check until auth is loaded
		if (authLoading) return

		const token = Cookies.get('token')
		if (!token) {
			router.push('/login')
		}
	}, [router, authLoading])

	if (authLoading || isLoading) {
		return <div className="text-center py-10">Loading players...</div>
	}

	return (
		<div dir="rtl">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold text-green-800">שחקנים</h1>
				<Link href="/players/new" className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md transition-colors">
					הוסף שחקן חדש
				</Link>
			</div>

			<ErrorMessage message={errorMessage} />

			{players.length === 0 ? <EmptyPlayersActions /> : <PlayersList players={players} />}
		</div>
	)
}
