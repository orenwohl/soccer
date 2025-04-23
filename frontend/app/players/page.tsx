'use client';

import Link from 'next/link';
import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {playerApi} from '../services/api';

interface Player {
	_id: string;
	name: string;
	rating: number;
	email: string;
	phone?: string;
}

// Function to render star rating
const renderRatingStars = (rating: number) => {
	return (
		<div className='flex'>
			{[...Array(5)].map((_, i) => (
				<span
					key={i}
					className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
					★
				</span>
			))}
		</div>
	);
};

export default function PlayersPage() {
	const [players, setPlayers] = useState<Player[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		// Redirect to login if not authenticated
		if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
			router.push('/login');
			return;
		}

		const fetchPlayers = async () => {
			try {
				const response = await playerApi.getAll();

				if (response.success) {
					setPlayers(response.data || []);
					setError(null);
				} else {
					setError(typeof response.error === 'string' ? response.error : 'Failed to load players');

					// If error is related to authentication, redirect to login
					if (
						typeof response.error === 'string' &&
						(response.error.includes('authentication') || response.error.includes('authorized'))
					) {
						if (typeof window !== 'undefined') {
							localStorage.removeItem('token');
						}
						router.push('/login');
					}
				}
			} catch (err) {
				console.error('Failed to fetch players:', err);
				setError('Failed to load players. Please try again later.');
			} finally {
				setLoading(false);
			}
		};

		fetchPlayers();
	}, [router]);

	if (loading) {
		return <div className='text-center py-10'>Loading players...</div>;
	}

	return (
		<div dir='rtl'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-3xl font-bold text-green-800'>שחקנים</h1>
				<Link
					href='/players/new'
					className='bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md transition-colors'>
					הוסף שחקן חדש
				</Link>
			</div>

			{error && (
				<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
					<p>שגיאה בטעינת נתונים: {error}</p>
				</div>
			)}

			{players.length === 0 ? (
				<div className='text-center py-8'>
					<p className='text-gray-600'>אין שחקנים להצגה. הוסף שחקנים חדשים כדי להתחיל.</p>
				</div>
			) : (
				<div className='bg-white rounded-lg shadow overflow-hidden'>
					<table className='min-w-full divide-y divide-gray-200'>
						<thead className='bg-gray-50'>
							<tr>
								<th
									scope='col'
									className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
									שם
								</th>
								<th
									scope='col'
									className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
									דירוג
								</th>
								<th
									scope='col'
									className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
									אימייל
								</th>
								<th
									scope='col'
									className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
									פעולות
								</th>
							</tr>
						</thead>
						<tbody className='bg-white divide-y divide-gray-200'>
							{players.map((player: Player) => (
								<tr
									key={player._id}
									className='hover:bg-gray-50'>
									<td className='px-6 py-4 whitespace-nowrap'>
										<div className='font-medium text-gray-900'>{player.name}</div>
									</td>
									<td className='px-6 py-4 whitespace-nowrap'>{renderRatingStars(player.rating)}</td>
									<td className='px-6 py-4 whitespace-nowrap'>
										<div className='text-gray-500'>{player.email}</div>
									</td>
									<td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
										<div className='flex space-x-reverse space-x-2'>
											<Link
												href={`/players/${player._id}`}
												className='text-indigo-600 hover:text-indigo-900'>
												צפייה
											</Link>
											<Link
												href={`/players/${player._id}/edit`}
												className='text-amber-600 hover:text-amber-900'>
												עריכה
											</Link>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
