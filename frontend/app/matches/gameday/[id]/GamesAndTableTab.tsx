import React from 'react'
import type { Game, GameDay, GameDayTeamPlayer } from '@/app/types'
import { Button } from '@/components/ui/button'
import { GameDayIcons } from '@/app/services/svg.service'

interface GamesAndTableTabProps {
	gameDay: GameDay
	activeGames: Game[]
	isCompleted: boolean
	teamStatistics: any[] // Replace with proper type when available
	selectedTeams: number[]
	isSubmitting: boolean
	toggleTeamSelection: (teamIndex: number) => void
	addSelectedTeamsToGame: () => void
	addGoalToPlayer: (gameIndex: number, teamIndex: number, playerIndex: number) => void
	finishGame: (gameIndex: number) => void
}

export function GamesAndTableTab({
	gameDay,
	activeGames,
	isCompleted,
	teamStatistics,
	selectedTeams,
	isSubmitting,
	toggleTeamSelection,
	addSelectedTeamsToGame,
	addGoalToPlayer,
	finishGame
}: GamesAndTableTabProps) {
	return (
		<div className="flex flex-col space-y-6 w-full">
			{/* Games Section */}
			<div className="pb-4 border-b border-green-700">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold text-green-800">משחקים</h2>
				</div>

				{isCompleted && (
					<div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-md text-blue-700">
						<p>יום המשחקים הושלם ונעול. לא ניתן לערוך או להוסיף משחקים חדשים.</p>
					</div>
				)}

				{/* Team selection area */}
				{!isCompleted && (
					<div className="mt-8 mb-12">
						<h2 className="text-xl font-bold mb-4 text-center">בחירת קבוצות למשחק הבא</h2>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{gameDay?.teams.map((team, index) => {
								// Check if team is already playing
								const isPlaying = activeGames.some(game => !game.finished && (game.team1Index === index || game.team2Index === index))

								return (
									<button
										key={index}
										onClick={() => toggleTeamSelection(index)}
										disabled={isPlaying || isCompleted}
										className={`p-3 rounded-lg border ${
											isPlaying || isCompleted
												? 'bg-gray-100 text-gray-500 cursor-not-allowed'
												: selectedTeams.includes(index)
												? 'bg-green-100 border-green-500 text-green-700'
												: 'bg-white hover:bg-green-50 border-gray-200'
										}`}
									>
										<div className="font-bold">{team.name}</div>
										<div className="text-sm text-gray-600">{team.players.length} שחקנים</div>
									</button>
								)
							})}
						</div>

						{selectedTeams.length === 2 && (
							<div className="mt-4 flex justify-center">
								<Button onClick={addSelectedTeamsToGame} className="bg-green-600 hover:bg-green-700 text-white">
									התחל משחק עם הקבוצות שנבחרו
								</Button>
							</div>
						)}
					</div>
				)}
				{/* Active Games */}
				<h3 className="text-md font-semibold text-gray-700 mb-2">משחקים פעילים:</h3>
				<div className="flex flex-col space-y-4">
					{activeGames.filter(game => !game.finished).length === 0 ? (
						<p className="text-gray-500 text-center py-4 bg-white rounded-lg shadow-sm">אין משחקים פעילים כרגע</p>
					) : (
						activeGames
							.filter(game => !game.finished)
							.map((game, gameIndex) => {
								// Get the actual index in the activeGames array
								const actualGameIndex = activeGames.findIndex(g => g.team1Index === game.team1Index && g.team2Index === game.team2Index && !g.finished)

								return (
									<div key={gameIndex} className="bg-white rounded-lg shadow-lg border-2 border-green-500 overflow-hidden">
										{/* Game Header */}
										<div className="bg-green-50 p-3 border-b border-green-200 text-center">
											<span className="inline-block px-3 py-1 rounded-full font-medium text-sm bg-green-500 text-white">משחק פעיל #{gameIndex + 1}</span>
										</div>

										{/* Mobile-optimized Scoreboard */}
										<div className="flex flex-col md:flex-row">
											{/* Main Scoreboard - show as column on mobile, row on desktop */}
											<div className="flex flex-row justify-between p-4 md:p-6 w-full bg-gray-50 md:bg-transparent">
												{/* Team 1 */}
												<div className="flex flex-col items-center">
													<div className="text-base md:text-xl font-bold text-center mb-2 px-1 truncate max-w-[110px]">{gameDay.teams[game.team1Index]?.name}</div>
													<div className="text-4xl md:text-5xl font-black text-center text-blue-600 min-w-[40px] flex items-center justify-center h-14">{game.scores[0]}</div>
												</div>

												{/* VS */}
												<div className="flex flex-col items-center justify-center mx-2 md:mx-4">
													<div className="text-xl md:text-2xl font-bold">VS</div>
													<div className={`mt-1 text-gray-500 text-xs md:text-sm hidden md:block ${isCompleted ? 'text-gray-400' : ''}`}>
														{isCompleted ? 'המשחק נעול' : 'לחץ על שם שחקן להוספת גול'}
													</div>
												</div>

												{/* Team 2 */}
												<div className="flex flex-col items-center">
													<div className="text-base md:text-xl font-bold text-center mb-2 px-1 truncate max-w-[110px]">{gameDay.teams[game.team2Index]?.name}</div>
													<div className="text-4xl md:text-5xl font-black text-center text-red-600 min-w-[40px] flex items-center justify-center h-14">{game.scores[1]}</div>
												</div>
											</div>

											{/* Mobile-only instruction */}
											<div className={`text-center text-xs p-2 bg-gray-50 block md:hidden ${isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
												{isCompleted ? 'המשחק נעול' : 'לחץ על שם שחקן להוספת גול'}
											</div>

											{/* Players Container - two columns on mobile */}
											<div className="flex flex-row w-full">
												{/* Team 1 Players */}
												<div className="w-1/2 p-2 md:p-4 flex flex-col space-y-1.5 md:space-y-2 border-t md:border-t-0 md:border-r border-gray-200">
													{gameDay.teams[game.team1Index]?.players.map((player, playerIndex) => (
														<button
															key={playerIndex}
															onClick={() => !isCompleted && addGoalToPlayer(actualGameIndex, 0, playerIndex)}
															disabled={isCompleted}
															className={`py-2 px-2 md:px-3 ${
																isCompleted ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-blue-50 hover:bg-blue-100 cursor-pointer'
															} rounded-md w-full text-center flex items-center justify-between transition-colors text-xs md:text-sm`}
														>
															<span className="font-medium truncate">{player.name}</span>
															<span className={`${isCompleted ? 'bg-gray-400' : 'bg-blue-500'} text-white text-xs px-2 py-1 rounded-full ml-1 min-w-[24px]`}>
																{(player as GameDayTeamPlayer).goals || 0}
															</span>
														</button>
													))}
												</div>

												{/* Team 2 Players */}
												<div className="w-1/2 p-3 md:p-4 flex flex-col space-y-2 border-t md:border-t-0 md:border-l border-gray-200">
													{gameDay.teams[game.team2Index]?.players.map((player, playerIndex) => (
														<button
															key={playerIndex}
															onClick={() => !isCompleted && addGoalToPlayer(actualGameIndex, 1, playerIndex)}
															disabled={isCompleted}
															className={`py-2 px-2 md:px-3 ${
																isCompleted ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-red-50 hover:bg-red-100 cursor-pointer'
															} rounded-md w-full text-center flex items-center justify-between transition-colors text-xs md:text-sm`}
														>
															<span className="font-medium truncate">{player.name}</span>
															<span className={`${isCompleted ? 'bg-gray-400' : 'bg-red-500'} text-white text-xs px-2 py-1 rounded-full ml-1 min-w-[24px]`}>
																{(player as GameDayTeamPlayer).goals || 0}
															</span>
														</button>
													))}
												</div>
											</div>
										</div>

										{/* Game Footer */}
										{!isCompleted && (
											<div className="p-4 border-t border-gray-200 flex justify-center">
												<Button
													onClick={() => finishGame(actualGameIndex)}
													disabled={isSubmitting}
													className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2 w-full md:w-auto"
												>
													{isSubmitting ? (
														<>
															<GameDayIcons.Spinner className="-ml-1 mr-2 h-4 w-4 text-white" />
															<span>מסיים משחק...</span>
														</>
													) : (
														<>
															<span>סיים משחק</span>
														</>
													)}
												</Button>
											</div>
										)}
									</div>
								)
							})
					)}
				</div>
			</div>

			{/* Add a section for completed games */}
			<h3 className="text-md font-semibold text-gray-700 mt-6 mb-2">משחקים שהסתיימו:</h3>
			<div className="bg-white rounded-lg shadow overflow-hidden">
				{activeGames.filter(game => game.finished).length > 0 ? (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-green-700">
								<tr>
									<th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">קבוצה 1</th>
									<th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">תוצאה</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">קבוצה 2</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{activeGames
									.filter(game => game.finished)
									.map((game, index) => (
										<tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{gameDay.teams[game.team1Index]?.name}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center font-bold">
												{game.scores[0]} - {game.scores[1]}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">{gameDay.teams[game.team2Index]?.name}</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="p-4 text-center text-gray-500">אין משחקים שהסתיימו</div>
				)}
			</div>

			{/* Team Statistics Table */}
			<div>
				<h2 className="text-xl font-bold text-green-800 mb-4">טבלת הקבוצות</h2>
				{teamStatistics && teamStatistics.length > 0 ? (
					<div className="bg-white rounded-lg shadow overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-green-700">
									<tr>
										<th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">קבוצה</th>
										<th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">נקודות</th>
										<th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">משחקים</th>
										<th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">נצחונות</th>
										<th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">תיקו</th>
										<th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">הפסדים</th>
										<th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">יחס שערים</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{teamStatistics
										.sort((a, b) => {
											// First sort by points
											const pointsA = a.won * 3 + a.drawn
											const pointsB = b.won * 3 + b.drawn
											if (pointsB !== pointsA) return pointsB - pointsA

											// If points are equal, sort by goal difference
											const goalDiffA = a.goalsFor - a.goalsAgainst
											const goalDiffB = b.goalsFor - b.goalsAgainst
											return goalDiffB - goalDiffA
										})
										.map((teamStat, index) => (
											<tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{teamStat.teamName}</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center font-bold">{teamStat.won * 3 + teamStat.drawn}</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{teamStat.played}</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{teamStat.won}</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{teamStat.drawn}</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{teamStat.lost}</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
													{teamStat.goalsFor} - {teamStat.goalsAgainst}
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">אין נתונים סטטיסטיים זמינים</div>
				)}
			</div>
		</div>
	)
}
