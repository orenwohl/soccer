'use client'

import Link from 'next/link'
import { Match } from '../../types'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { CalendarDays, MapPin, Users, CheckCircle, Clock, Eye, Edit } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface MatchesListProps {
	matches: Match[]
}

export default function MatchesList({ matches }: MatchesListProps) {
	if (matches.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-600 mb-4">אין משחקים להצגה. צור משחק חדש כדי להתחיל.</p>
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
								<CalendarDays className="h-3 w-3" />
								<span>תאריך</span>
							</div>
						</TableHead>
						<TableHead>
							<div className="flex items-center gap-1">
								<MapPin className="h-3 w-3" />
								<span>מיקום</span>
							</div>
						</TableHead>
						<TableHead>
							<div className="flex items-center gap-1">
								<Users className="h-3 w-3" />
								<span>מספר קבוצות</span>
							</div>
						</TableHead>
						<TableHead>סטטוס</TableHead>
						<TableHead>פעולות</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{matches.map(match => (
						<TableRow key={match._id}>
							<TableCell>
								<div className="font-medium">{format(new Date(match.date), 'PPP', { locale: he })}</div>
							</TableCell>
							<TableCell>
								<div className="text-muted-foreground">{match.location}</div>
							</TableCell>
							<TableCell>
								<div className="text-muted-foreground">{match.teams?.length || 0}</div>
							</TableCell>
							<TableCell>
								<span
									className={cn(
										'px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1',
										match.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
									)}
								>
									{match.isCompleted ? (
										<>
											<CheckCircle className="h-3 w-3" />
											<span>הושלם</span>
										</>
									) : (
										<>
											<Clock className="h-3 w-3" />
											<span>מתוכנן</span>
										</>
									)}
								</span>
							</TableCell>
							<TableCell>
								<div className="flex space-x-reverse space-x-2">
									<Button variant="ghost" size="sm" asChild>
										<Link href={`/matches/${match._id}`} className={cn('text-indigo-600 hover:text-indigo-900 flex items-center gap-1')}>
											<Eye className="h-4 w-4" />
											<span>צפייה</span>
										</Link>
									</Button>
									<Button variant="ghost" size="sm" asChild>
										<Link href={`/matches/${match._id}/edit`} className={cn('text-amber-600 hover:text-amber-900 flex items-center gap-1')}>
											<Edit className="h-4 w-4" />
											<span>עריכה</span>
										</Link>
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
