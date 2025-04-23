'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import ErrorMessage from '../components/ErrorMessage'
import PlayersList from '../components/players/PlayersList'
import EmptyPlayersActions from '../components/players/EmptyPlayersActions'
import { usePlayers } from '../hooks/usePlayers'
import { Button } from '@/components/ui/button'
import { PlusCircle, RefreshCw } from 'lucide-react'

export default function PlayersPage() {
	const router = useRouter()
	const pathname = usePathname()
	const { loading: authLoading } = useAuth()
	const { data, isLoading, error, isError, refetch, isRefetching } = usePlayers()
	const [lastPathname, setLastPathname] = useState<string | null>(null)

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

	// Refetch on mount and when returning to this page
	useEffect(() => {
		// Manual refetch when component mounts
		refetch()

		// If returning from another page (e.g., after adding a player)
		if (pathname === '/players' && lastPathname && lastPathname !== pathname) {
			refetch()
		}

		// Update the last pathname
		setLastPathname(pathname)
	}, [pathname, lastPathname, refetch])

	const handleRefresh = () => {
		refetch()
	}

	if (authLoading || isLoading) {
		return <div className="text-center py-10">Loading players...</div>
	}

	return (
		<div dir="rtl">
			<div className="flex justify-between items-center mb-6">
				<div className="flex items-center">
					<h1 className="text-3xl font-bold text-green-800">שחקנים</h1>
					<Button variant="ghost" size="icon" onClick={handleRefresh} className="mr-2" disabled={isRefetching}>
						<RefreshCw className={`h-5 w-5 ${isRefetching ? 'animate-spin' : ''}`} />
					</Button>
				</div>
				<Button asChild className="bg-green-700 hover:bg-green-800">
					<Link href="/players/new" className="flex items-center">
						<PlusCircle className="mr-2 h-4 w-4" />
						הוסף שחקן חדש
					</Link>
				</Button>
			</div>

			<ErrorMessage message={errorMessage} />

			{players.length === 0 ? <EmptyPlayersActions /> : <PlayersList players={players} />}
		</div>
	)
}
