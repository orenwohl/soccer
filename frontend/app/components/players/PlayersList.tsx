'use client'

import Link from 'next/link'
import { Player } from '../../types'
import StarRating from '../StarRating'
import { cn } from '@/lib/utils'
import { Eye, Edit, Mail, User } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface PlayersListProps {
	players: Player[]
}

export default function PlayersList({ players }: PlayersListProps) {
	if (players.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-600 mb-4">אין שחקנים להצגה. הוסף שחקנים חדשים כדי להתחיל.</p>
			</div>
		)
	}

	return (
		<div className="rounded-lg shadow overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>
							<div className="flex items-center gap-1">
								<User className="h-3 w-3" />
								<span>שם</span>
							</div>
						</TableHead>
						<TableHead>דירוג</TableHead>
						<TableHead>
							<div className="flex items-center gap-1">
								<Mail className="h-3 w-3" />
								<span>אימייל</span>
							</div>
						</TableHead>
						<TableHead>פעולות</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{players.map(player => (
						<TableRow key={player._id}>
							<TableCell>
								<div className="font-medium">{player.name}</div>
							</TableCell>
							<TableCell>
								<StarRating rating={player.rating} />
							</TableCell>
							<TableCell>
								<div className="text-muted-foreground">{player.email}</div>
							</TableCell>
							<TableCell>
								<div className="flex space-x-reverse space-x-2">
									<Link href={`/players/${player._id}`} className={cn('text-indigo-600 hover:text-indigo-900 flex items-center gap-1')}>
										<Eye className="h-4 w-4" />
										<span>צפייה</span>
									</Link>
									<Link href={`/players/${player._id}/edit`} className={cn('text-amber-600 hover:text-amber-900 flex items-center gap-1')}>
										<Edit className="h-4 w-4" />
										<span>עריכה</span>
									</Link>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
