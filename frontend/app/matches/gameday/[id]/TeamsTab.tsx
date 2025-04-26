import React from 'react'
import { StarRating, GameDayIcons } from '@/app/services/svg.service'
import type { GameDay, GameDayTeamPlayer } from '@/app/types'

// Default color if no color is specified
const DEFAULT_COLOR = '#9ca3af' // Gray

interface TeamsTabProps {
	gameDay: GameDay
	transferMode: 'swap' | 'transfer'
	selectedPlayerForSwap: { playerId: string; teamIndex: number } | null
	rebalanceTeams: () => void
	handlePlayerSelection: (playerId: string, teamIndex: number) => void
	movePlayerToTeam: (playerId: string, sourceTeamIndex: number, targetTeamIndex: number) => void
	isRebalancing: boolean
	isSubmitting: boolean
	setIsSubmitting: (val: boolean) => void
	setSelectedPlayerForSwap: (val: { playerId: string; teamIndex: number } | null) => void
	setTransferMode: (mode: 'swap' | 'transfer') => void
	saveTeams: () => Promise<void>
}

export function TeamsTab({
	gameDay,
	transferMode,
	selectedPlayerForSwap,
	rebalanceTeams,
	handlePlayerSelection,
	movePlayerToTeam,
	isRebalancing,
	isSubmitting,
	setIsSubmitting,
	setSelectedPlayerForSwap,
	setTransferMode,
	saveTeams
}: TeamsTabProps) {
	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">קבוצות</h2>

				{/* Transfer mode toggle */}
				<div className="flex items-center bg-gray-50 p-2 rounded-md">
					<span className="text-sm font-medium mr-2">מצב העברת שחקנים:</span>
					<div className="flex border border-gray-300 rounded-md overflow-hidden">
						<button
							type="button"
							onClick={() => setTransferMode('swap')}
							className={`px-3 py-1.5 text-sm ${transferMode === 'swap' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
						>
							החלפת שחקנים
						</button>
						<button
							type="button"
							onClick={() => setTransferMode('transfer')}
							className={`px-3 py-1.5 text-sm ${transferMode === 'transfer' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
						>
							העברת שחקן
						</button>
					</div>
				</div>
			</div>

			{selectedPlayerForSwap && (
				<div className="mb-4 bg-orange-50 border border-orange-200 p-3 rounded-md">
					<p className="text-orange-700">
						בחרת שחקן להעברה.
						{transferMode === 'swap' ? ' בחר שחקן אחר כדי להחליף ביניהם,' : ' בחר קבוצה אחרת כדי להעביר אליה את השחקן,'}
						או לחץ שוב על אותו שחקן לביטול.
					</p>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
				{gameDay.teams.map((team, teamIndex) => (
					<div
						key={teamIndex}
						className={`bg-white rounded-lg shadow-sm border-2 p-4 ${
							selectedPlayerForSwap && transferMode === 'transfer' && selectedPlayerForSwap.teamIndex !== teamIndex
								? 'cursor-pointer hover:bg-green-50' // Highlight as drop target in transfer mode
								: ''
						}`}
						style={{
							borderColor: team.color || DEFAULT_COLOR
						}}
						// Allow clicking on the team container in transfer mode
						onClick={() => {
							if (selectedPlayerForSwap && transferMode === 'transfer' && selectedPlayerForSwap.teamIndex !== teamIndex) {
								// When in transfer mode and a player is selected, clicking a team moves the player there
								movePlayerToTeam(selectedPlayerForSwap.playerId, selectedPlayerForSwap.teamIndex, teamIndex)
							}
						}}
					>
						<div className="flex items-center mb-3">
							<div
								className="w-4 h-4 rounded-full mr-2"
								style={{
									backgroundColor: team.color || DEFAULT_COLOR
								}}
							></div>
							<h3 className="font-medium text-lg">{team.name}</h3>
							<span className="text-sm text-gray-500 ml-auto">דירוג ממוצע: {team.averageRating?.toFixed(1) || 0}</span>
						</div>

						<ul className="space-y-2">
							{team.players?.map(player => (
								<li
									key={player.playerId}
									onClick={e => {
										e.stopPropagation() // Prevent team click event from triggering
										handlePlayerSelection(player.playerId, teamIndex)
									}}
									className={`flex justify-between items-center text-sm p-2 rounded-md cursor-pointer hover:bg-gray-50 ${
										selectedPlayerForSwap && selectedPlayerForSwap.playerId === player.playerId && selectedPlayerForSwap.teamIndex === teamIndex
											? 'ring-2 ring-orange-500 bg-orange-50'
											: ''
									}`}
								>
									<span>{player.name}</span>
									<StarRating rating={player.rating} />
								</li>
							))}
							{!team.players?.length && <li className="text-gray-400 text-center py-2">אין שחקנים</li>}
						</ul>
					</div>
				))}
			</div>

			<div className="flex justify-center">
				<button
					type="button"
					onClick={rebalanceTeams}
					disabled={isRebalancing}
					className={`mt-4 px-4 py-2 rounded-md flex items-center justify-center transition-all ${
						isRebalancing ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'
					}`}
				>
					{isRebalancing ? (
						<>
							<GameDayIcons.Spinner className="-ml-1 mr-2 h-4 w-4 text-white" />
							מערבב קבוצות...
						</>
					) : (
						<>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
							איזון קבוצות מחדש
						</>
					)}
				</button>

				<button type="button" onClick={saveTeams} disabled={isSubmitting} className="mt-4 mr-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
					{isSubmitting ? 'שומר...' : 'שמור שינויים'}
				</button>
			</div>
		</div>
	)
}
