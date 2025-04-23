'use client'

import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { cn } from '@/lib/utils'
import { Users, Volleyball, Trophy, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Navbar = () => {
	const { user, logout } = useAuth()

	return (
		<div className="flex justify-between items-center">
			<Link href="/" className="text-2xl font-bold hover:text-green-200 transition-colors">
				כדורגל שכונתי
			</Link>
			<nav className="flex space-x-reverse space-x-6">
				{user ? (
					<>
						<Link href="/players" className={cn('hover:text-green-200 transition-colors flex items-center gap-2')}>
							<Users className="h-4 w-4" />
							<span>שחקנים</span>
						</Link>
						<Link href="/matches" className={cn('hover:text-green-200 transition-colors flex items-center gap-2')}>
							<Volleyball className="h-4 w-4" />
							<span>משחקים</span>
						</Link>
						<Link href="/table" className={cn('hover:text-green-200 transition-colors flex items-center gap-2')}>
							<Trophy className="h-4 w-4" />
							<span>טבלת ליגה</span>
						</Link>
						<div className="flex items-center space-x-reverse space-x-4">
							<span className="text-green-200">{user.name}</span>
							<Button onClick={logout} variant="destructive" size="sm" className="flex items-center gap-2 rtl">
								<LogOut className="h-4 w-4" />
								<span>התנתק</span>
							</Button>
						</div>
					</>
				) : (
					<Link href="/login" className="hover:text-green-200 transition-colors">
						התחברות
					</Link>
				)}
			</nav>
		</div>
	)
}

export default Navbar
