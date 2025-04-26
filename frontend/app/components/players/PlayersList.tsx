'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Player } from '../../types'
import StarRating from '../StarRating'
import { Edit, User, Dumbbell, Shield, Briefcase, Trash2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { playerService } from '@/app/services'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface PlayersListProps {
	players: Player[]
}

export default function PlayersList({ players }: PlayersListProps) {
	const router = useRouter()
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [showConfirmation, setShowConfirmation] = useState(false)
	const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)
	// Track locally deleted player IDs
	const [deletedPlayerIds, setDeletedPlayerIds] = useState<string[]>([])

	const handleDeleteClick = (player: Player) => {
		setPlayerToDelete(player)
		setShowConfirmation(true)
	}

	const confirmDelete = async () => {
		if (!playerToDelete) return

		try {
			setIsDeleting(true)
			setDeletingId(playerToDelete._id)

			const response = await playerService.delete(playerToDelete._id)

			if (response.success) {
				// Add this ID to our locally maintained list of deleted IDs
				setDeletedPlayerIds(prev => [...prev, playerToDelete._id])

				// Subtle router refresh without causing a visible loading state
				router.refresh()
			} else {
				console.error('Failed to delete player:', response.error)
				alert(`שגיאה במחיקת שחקן: ${response.error || 'שגיאה לא ידועה'}`)
			}
		} catch (error) {
			console.error('Error deleting player:', error)
			alert('אירעה שגיאה במחיקת השחקן')
		} finally {
			setIsDeleting(false)
			setDeletingId(null)
			setShowConfirmation(false)
			setPlayerToDelete(null)
		}
	}

	const cancelDelete = () => {
		setShowConfirmation(false)
		setPlayerToDelete(null)
	}

	// Filter out players that have been deleted in the current session
	const filteredPlayers = players.filter(player => !deletedPlayerIds.includes(player._id))

	if (filteredPlayers.length === 0) {
		return (
			<div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
				<User className="h-12 w-12 mx-auto text-gray-300 mb-3" />
				<p className="text-gray-600 mb-1 text-lg font-medium">אין שחקנים להצגה</p>
				<p className="text-gray-500 text-sm">הוסף שחקנים חדשים כדי להתחיל</p>
			</div>
		)
	}

	return (
		<>
			{/* Confirmation Modal */}
			{showConfirmation && playerToDelete && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
					<div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 border border-gray-100 animate-in fade-in slide-in-from-bottom-5">
						<h3 className="text-xl font-bold mb-3 text-gray-900">מחיקת שחקן</h3>
						<p className="mb-6 text-gray-600">
							האם אתה בטוח שברצונך למחוק את השחקן <span className="font-semibold text-gray-900">{playerToDelete.name}</span>?
						</p>
						<div className="flex justify-end gap-3">
							<button onClick={cancelDelete} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium" disabled={isDeleting}>
								ביטול
							</button>
							<button
								onClick={confirmDelete}
								className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
								disabled={isDeleting}
							>
								{isDeleting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
								{isDeleting ? 'מוחק...' : 'מחק שחקן'}
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm">
				<div className="overflow-y-auto max-h-[500px]">
					<Table>
						<TableHeader className="bg-gray-50 sticky top-0 z-10">
							<TableRow className="hover:bg-gray-50/80">
								<TableHead className="py-3.5 font-semibold text-gray-700">
									<div className="flex items-center gap-1.5">
										<User className="h-4 w-4 text-gray-500" />
										<span>שם</span>
									</div>
								</TableHead>
								<TableHead className="py-3.5 font-semibold text-gray-700">
									<div className="flex items-center gap-1.5">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="h-4 w-4 text-gray-500"
										>
											<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
										</svg>
										<span>דירוג</span>
									</div>
								</TableHead>
								<TableHead className="hidden md:table-cell py-3.5 font-semibold text-gray-700">
									<div className="flex items-center gap-1.5">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="h-4 w-4 text-gray-500"
										>
											<path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path>
											<path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path>
											<path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path>
											<path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path>
											<path d="M12 16h3.5a3.5 3.5 0 1 1 0 7H12v-7z"></path>
										</svg>
										<span>פירוט יכולות</span>
									</div>
								</TableHead>
								<TableHead className="text-center py-3.5 font-semibold text-gray-700 w-[180px]">פעולות</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredPlayers.map(player => (
								<TableRow key={player._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
									<TableCell className="font-medium py-4 pl-6">
										<div className="text-gray-900">{player.name}</div>
										{player.phone && <div className="text-gray-500 text-sm hidden sm:block mt-0.5">{player.phone}</div>}
									</TableCell>
									<TableCell className="py-4">
										<div className="flex items-center">
											<div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
												<span className="font-bold text-amber-700">{player.rating}</span>
												<StarRating rating={player.rating} size="md" showValue={false} />
											</div>
										</div>
									</TableCell>
									<TableCell className="hidden md:table-cell py-4">
										<div className="flex flex-row items-center gap-2">
											<div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md">
												<Dumbbell className="h-3.5 w-3.5 text-blue-600" />
												<span className="text-xs font-medium text-blue-700 mr-1.5">כושר:</span>
												<StarRating rating={player.fitnessRating} />
											</div>
											<div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md">
												<Shield className="h-3.5 w-3.5 text-red-600" />
												<span className="text-xs font-medium text-red-700 mr-1.5">הגנה:</span>
												<StarRating rating={player.defenseRating} />
											</div>
											<div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md">
												<Briefcase className="h-3.5 w-3.5 text-green-600" />
												<span className="text-xs font-medium text-green-700 mr-1.5">טכניקה:</span>
												<StarRating rating={player.techniqueRating} />
											</div>
										</div>
									</TableCell>
									<TableCell className="text-center py-4">
										<div className="flex items-center justify-center space-x-reverse space-x-2">
											<Link
												href={`/players/${player._id}/edit`}
												className={cn(
													'transition-all flex items-center justify-center',
													'w-9 h-9 rounded-full',
													'bg-amber-50 text-amber-700 border border-amber-200/70',
													'hover:bg-amber-100 hover:border-amber-300'
												)}
												title="עריכה"
												aria-label={`ערוך שחקן ${player.name}`}
											>
												<Edit className="h-4 w-4" />
											</Link>
											<button
												onClick={() => handleDeleteClick(player)}
												disabled={deletingId === player._id}
												title="מחיקה"
												aria-label={`מחק שחקן ${player.name}`}
												className={cn(
													'transition-all flex items-center justify-center',
													'w-9 h-9 rounded-full',
													'bg-red-50 text-red-700 border border-red-200/70',
													'hover:bg-red-100 hover:border-red-300',
													deletingId === player._id && 'opacity-80'
												)}
											>
												{deletingId === player._id ? (
													<div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
												) : (
													<Trash2 className="h-4 w-4" />
												)}
											</button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
				<div className="p-4 bg-gray-50 border-t border-gray-100 text-sm text-gray-500 flex justify-between items-center">
					<div>סה״כ: {filteredPlayers.length} שחקנים</div>
					<div className="text-xs">דירוג ממוצע: {(filteredPlayers.reduce((sum, player) => sum + player.rating, 0) / filteredPlayers.length).toFixed(1)}</div>
				</div>
			</div>
		</>
	)
}
