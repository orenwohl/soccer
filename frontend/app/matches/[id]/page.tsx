'use client';

import {useState} from 'react';
import Link from 'next/link';
import {Match} from '@/app/types';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {useMatch} from '@/app/hooks/useMatches';
import {useUpdateMatch} from '@/app/hooks/useMatchMutations';
import {Link as ClientLink} from '@/components/ui/client-link';
import {TeamShirt} from '@/app/components/TeamShirt';

// Default color if no color is specified

export default function MatchPage({params}: {params: {id: string}}) {
	const [isEditing, setIsEditing] = useState(false);
	const [teamScores, setTeamScores] = useState<number[]>([0, 0]);

	const {data: matchResponse, isLoading, error, refetch} = useMatch(params.id);
	const match = matchResponse?.data;

	const updateMatch = useUpdateMatch();

	// Set initial scores when match data is loaded
	if (match && teamScores[0] === 0 && teamScores[1] === 0) {
		setTeamScores([match.teams[0]?.score || 0, match.teams[1]?.score || 0]);
	}

	const handleScoreChange = (index: number, value: string) => {
		const newScores = [...teamScores];
		newScores[index] = parseInt(value) || 0;
		setTeamScores(newScores);
	};

	const handleSaveScores = async () => {
		if (!match) return;

		// Create an updated match object
		const updatedMatch: Match = {
			...match,
			teams: [
				{
					...match.teams[0],
					score: teamScores[0],
				},
				{
					...match.teams[1],
					score: teamScores[1],
				},
			],
			isCompleted: true,
		};

		// Call the mutation to update the match
		updateMatch.mutate(
			{id: match._id, data: updatedMatch},
			{
				onSuccess: () => {
					setIsEditing(false);
					refetch();
				},
			}
		);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// Function to check if a color is light
	const isLightColor = (color: string) => {
		// For simple hex colors
		if (color.startsWith('#')) {
			const hex = color.substring(1);
			const r = parseInt(hex.substring(0, 2), 16);
			const g = parseInt(hex.substring(2, 4), 16);
			const b = parseInt(hex.substring(4, 6), 16);
			// Calculate perceived brightness using the formula
			const brightness = (r * 299 + g * 587 + b * 114) / 1000;
			return brightness > 155; // Threshold for light color
		}
		return false;
	};

	const getTeamColorStyles = (color: string) => {
		if (!color)
			return {
				borderColor: '#d1d5db',
				textColor: 'text-gray-800',
				needsBorder: true,
			};

		const light = isLightColor(color);
		return {
			borderColor: light ? '#d1d5db' : color,
			textColor: light ? 'text-gray-800' : 'text-white',
			needsBorder: light,
		};
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center h-64'>
				<div className='text-center'>
					<div className='text-xl font-semibold mb-2'>Loading match details...</div>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-800 mx-auto'></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='bg-red-100 p-4 rounded-md text-red-700'>
				<div className='font-bold mb-2'>Error</div>
				<div>{error instanceof Error ? error.message : 'An error occurred'}</div>
				<Link
					href='/matches'
					className='mt-4 text-blue-600 hover:underline'>
					Back to matches
				</Link>
			</div>
		);
	}

	if (!match) {
		return (
			<div className='bg-yellow-100 p-4 rounded-md text-yellow-700'>
				<div className='font-bold mb-2'>Match not found</div>
				<div>The match you are looking for does not exist or has been deleted.</div>
				<Link
					href='/matches'
					className='mt-4 text-blue-600 hover:underline'>
					Back to matches
				</Link>
			</div>
		);
	}

	return (
		<div>
			<div className='mb-6'>
				<div className='flex justify-between items-center'>
					<h1 className='text-3xl font-bold text-green-800'>Match Details</h1>
					<div className='flex space-x-2'>
						<Button
							variant='outline'
							asChild>
							<Link href='/matches'>Back to Matches</Link>
						</Button>
						{!isEditing && !match.isCompleted && (
							<Button
								onClick={() => setIsEditing(true)}
								variant='default'>
								Record Result
							</Button>
						)}
					</div>
				</div>
			</div>

			<div className='bg-white shadow-md rounded-lg overflow-hidden'>
				<div className='p-6'>
					<div className='grid md:grid-cols-2 gap-6 mb-6'>
						<div>
							<h2 className='text-lg font-semibold mb-4'>Match Information</h2>
							<div className='space-y-2'>
								<div>
									<span className='font-medium'>Date & Time:</span> {formatDate(match.date)}
								</div>
								<div>
									<span className='font-medium'>Location:</span> {match.location}
								</div>
								<div>
									<span className='font-medium'>Status:</span>{' '}
									<span
										className={`px-2 py-1 text-xs rounded-full ${
											match.isCompleted
												? 'bg-green-100 text-green-800'
												: 'bg-yellow-100 text-yellow-800'
										}`}>
										{match.isCompleted ? 'Completed' : 'Upcoming'}
									</span>
								</div>
							</div>
						</div>

						{match.isCompleted && !isEditing ? (
							<div>
								<h2 className='text-lg font-semibold mb-4'>Final Score</h2>
								<div className='flex items-center justify-center space-x-8 p-4 bg-gray-50 rounded-lg'>
									<div className='text-center'>
										<div className='font-medium'>{match.teams[0]?.name}</div>
										<div
											className={`text-4xl font-bold ${
												match.teams[0]?.score > match.teams[1]?.score ? 'text-green-600' : ''
											}`}>
											{match.teams[0]?.score || 0}
										</div>
									</div>
									<div className='text-gray-400 text-2xl'>vs</div>
									<div className='text-center'>
										<div className='font-medium'>{match.teams[1]?.name}</div>
										<div
											className={`text-4xl font-bold ${
												match.teams[1]?.score > match.teams[0]?.score ? 'text-green-600' : ''
											}`}>
											{match.teams[1]?.score || 0}
										</div>
									</div>
								</div>
							</div>
						) : isEditing ? (
							<div>
								<h2 className='text-lg font-semibold mb-4'>Record Final Score</h2>
								<div className='flex items-center justify-center space-x-8 p-4 bg-gray-50 rounded-lg'>
									<div className='text-center'>
										<div className='font-medium mb-2'>{match.teams[0]?.name}</div>
										<Input
											type='number'
											min='0'
											className='w-16 p-2 text-center text-2xl font-bold border rounded'
											value={teamScores[0]}
											onChange={(e) => handleScoreChange(0, e.target.value)}
										/>
									</div>
									<div className='text-gray-400 text-2xl'>vs</div>
									<div className='text-center'>
										<div className='font-medium mb-2'>{match.teams[1]?.name}</div>
										<Input
											type='number'
											min='0'
											className='w-16 p-2 text-center text-2xl font-bold border rounded'
											value={teamScores[1]}
											onChange={(e) => handleScoreChange(1, e.target.value)}
										/>
									</div>
								</div>
								<div className='flex justify-end mt-4 space-x-2'>
									<Button
										variant='outline'
										onClick={() => setIsEditing(false)}>
										Cancel
									</Button>
									<Button
										onClick={handleSaveScores}
										disabled={updateMatch.isPending}>
										{updateMatch.isPending ? 'Saving...' : 'Save Result'}
									</Button>
								</div>
							</div>
						) : null}
					</div>

					<div>
						<h2 className='text-lg font-semibold mb-4'>Teams</h2>
						<div className='grid md:grid-cols-2 gap-6'>
							{match.teams.map((team, index) => {
								const colorStyles = getTeamColorStyles(team.color || '');

								return (
									<div
										key={index}
										className={`rounded-lg p-4 ${colorStyles.needsBorder ? 'border' : ''}`}
										style={{
											backgroundColor: team.color ? `${team.color}15` : '#ffffff',
											borderColor: colorStyles.borderColor,
										}}>
										<div className='flex items-center justify-between mb-3'>
											<h3
												className={`font-bold flex items-center gap-2 ${colorStyles.textColor}`}>
												<TeamShirt
													color={team.color}
													size='md'
													animated
												/>
												{team.name}
											</h3>
											<div className={`text-sm ${colorStyles.textColor}`}>
												Avg Rating:{' '}
												{typeof team.averageRating === 'number'
													? team.averageRating.toFixed(1)
													: '-'}
											</div>
										</div>
										<div className='grid grid-cols-2 gap-2'>
											{team.players &&
												team.players.map((player) => (
													<div
														key={player.playerId}
														className={`text-sm ${colorStyles.textColor}`}>
														{player.name}{' '}
														<span className='opacity-75'>({player.rating})</span>
													</div>
												))}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
