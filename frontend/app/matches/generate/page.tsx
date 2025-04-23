'use client';

import {useState} from 'react';
import Link from 'next/link';

interface Player {
	_id: string;
	name: string;
	rating: number;
}

interface TeamPlayer {
	playerId: string;
	name: string;
	rating: number;
}

interface Team {
	name: string;
	players: TeamPlayer[];
	totalRating: number;
	averageRating: number;
}

// Demo player data - in a real app, this would be fetched from the API
const PLAYERS: Player[] = [
	{_id: '1', name: 'יוסי כהן', rating: 5},
	{_id: '2', name: 'דנה לוי', rating: 4},
	{_id: '3', name: 'משה ישראלי', rating: 5},
	{_id: '4', name: 'שרה רבין', rating: 3},
	{_id: '5', name: 'דוד אברהם', rating: 4},
	{_id: '6', name: 'מיכל דוד', rating: 4},
	{_id: '7', name: 'אלכס וייס', rating: 3},
	{_id: '8', name: 'לאה גולן', rating: 3},
	{_id: '9', name: 'יעקב לוינסון', rating: 5},
	{_id: '10', name: 'אורית מרקוס', rating: 4},
];

// Mock implementation of the team generation algorithm
function mockGenerateTeams(playerIds: string[], numberOfTeams = 2): Team[] {
	const selectedPlayers = PLAYERS.filter((p) => playerIds.includes(p._id));

	// Sort players by rating (descending)
	const sortedPlayers = [...selectedPlayers].sort((a, b) => b.rating - a.rating);

	// Initialize teams
	const teams: Team[] = Array.from({length: numberOfTeams}, (_, i) => ({
		name: `קבוצה ${i === 0 ? 'אדומה' : i === 1 ? 'כחולה' : i === 2 ? 'ירוקה' : 'צהובה'}`,
		players: [],
		totalRating: 0,
		averageRating: 0,
	}));

	// Distribute players using snake draft method
	sortedPlayers.forEach((player, index) => {
		const round = Math.floor(index / numberOfTeams);
		const teamIndex = round % 2 === 0 ? index % numberOfTeams : numberOfTeams - 1 - (index % numberOfTeams);

		const teamPlayer: TeamPlayer = {
			playerId: player._id,
			name: player.name,
			rating: player.rating,
		};

		teams[teamIndex].players.push(teamPlayer);
		teams[teamIndex].totalRating += player.rating;
	});

	// Calculate average ratings
	teams.forEach((team) => {
		team.averageRating =
			team.players.length > 0 ? parseFloat((team.totalRating / team.players.length).toFixed(2)) : 0;
	});

	return teams;
}

// Function to render star rating
const renderRatingStars = (rating: number) => {
	return (
		<div className='flex'>
			{[...Array(5)].map((_, i) => (
				<span
					key={i}
					className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
					★
				</span>
			))}
		</div>
	);
};

export default function GenerateTeamsPage() {
	const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
	const [numberOfTeams, setNumberOfTeams] = useState<number>(2);
	const [generatedTeams, setGeneratedTeams] = useState<Team[] | null>(null);

	const togglePlayerSelection = (playerId: string) => {
		if (selectedPlayers.includes(playerId)) {
			setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));
		} else {
			setSelectedPlayers([...selectedPlayers, playerId]);
		}
	};

	const handleGenerateTeams = () => {
		// In a real app, this would call the API
		const teams = mockGenerateTeams(selectedPlayers, numberOfTeams);
		setGeneratedTeams(teams);
	};

	const handleRegenerateTeams = () => {
		// In a real app, this would call the API with the same params
		const teams = mockGenerateTeams(selectedPlayers, numberOfTeams);
		setGeneratedTeams(teams);
	};

	return (
		<div dir='rtl'>
			<div className='mb-6'>
				<h1 className='text-3xl font-bold text-green-800 mb-2'>יצירת קבוצות מאוזנות</h1>
				<p className='text-gray-600'>בחר שחקנים זמינים וצור קבוצות מאוזנות על סמך דירוגי השחקנים</p>
			</div>

			<div className='grid md:grid-cols-2 gap-8'>
				<div>
					<div className='bg-white rounded-lg shadow p-6'>
						<h2 className='text-xl font-bold mb-4'>שחקנים זמינים</h2>

						<div className='mb-4'>
							<label className='block text-sm font-medium text-gray-700 mb-1'>מספר קבוצות</label>
							<select
								className='border rounded-md px-3 py-2 w-full'
								value={numberOfTeams}
								onChange={(e) => setNumberOfTeams(parseInt(e.target.value))}>
								<option value={2}>2 קבוצות</option>
								<option value={3}>3 קבוצות</option>
								<option value={4}>4 קבוצות</option>
							</select>
						</div>

						<div className='mb-4'>
							<p className='text-sm text-gray-600 mb-2'>נבחרו: {selectedPlayers.length} שחקנים</p>

							<div className='grid grid-cols-1 gap-2 max-h-80 overflow-y-auto'>
								{PLAYERS.map((player) => (
									<div
										key={player._id}
										className={`flex items-center p-3 border rounded ${
											selectedPlayers.includes(player._id)
												? 'border-green-500 bg-green-50'
												: 'border-gray-200'
										}`}
										onClick={() => togglePlayerSelection(player._id)}>
										<input
											type='checkbox'
											checked={selectedPlayers.includes(player._id)}
											onChange={() => {}}
											className='ml-3'
										/>
										<div className='flex-grow'>
											<div className='font-medium'>{player.name}</div>
											<div className='text-sm text-gray-500 flex items-center'>
												דירוג: {renderRatingStars(player.rating)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						<button
							className='w-full bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
							onClick={handleGenerateTeams}
							disabled={selectedPlayers.length < numberOfTeams * 2}>
							יצירת קבוצות
						</button>

						{selectedPlayers.length < numberOfTeams * 2 && (
							<p className='mt-2 text-sm text-red-500'>
								אנא בחר לפחות {numberOfTeams * 2} שחקנים כדי ליצור {numberOfTeams} קבוצות
							</p>
						)}
					</div>
				</div>

				<div>
					{generatedTeams && (
						<div className='bg-white rounded-lg shadow p-6'>
							<div className='flex justify-between items-center mb-4'>
								<h2 className='text-xl font-bold'>קבוצות שנוצרו</h2>
								<button
									className='text-sm text-blue-600 hover:text-blue-800'
									onClick={handleRegenerateTeams}>
									יצירה מחדש
								</button>
							</div>

							<div className='space-y-6'>
								{generatedTeams.map((team, index) => (
									<div
										key={index}
										className={`border rounded-lg p-4 ${
											index === 0
												? 'border-red-200 bg-red-50'
												: index === 1
												? 'border-blue-200 bg-blue-50'
												: index === 2
												? 'border-green-200 bg-green-50'
												: 'border-yellow-200 bg-yellow-50'
										}`}>
										<div className='flex justify-between items-center mb-2'>
											<h3 className='font-bold'>{team.name}</h3>
											<div className='text-sm'>
												דירוג ממוצע: <span className='font-semibold'>{team.averageRating}</span>
											</div>
										</div>

										<ul className='divide-y'>
											{team.players.map((player) => (
												<li
													key={player.playerId}
													className='py-2'>
													<div className='flex justify-between'>
														<span>{player.name}</span>
														<span className='text-gray-600'>
															{renderRatingStars(player.rating)}
														</span>
													</div>
												</li>
											))}
										</ul>
									</div>
								))}
							</div>

							<div className='mt-6'>
								<Link
									href='/matches/new'
									className='w-full block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors'>
									יצירת משחק עם הקבוצות האלה
								</Link>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
