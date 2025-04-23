'use client';

import {useState, useEffect} from 'react';
import Link from 'next/link';
import {GameDay, Match} from '@/app/types';
import {matchApi} from '@/app/services/api';

// נמחק את נתוני הדוגמה ונשתמש בנתונים אמיתיים מהשרת
// const MOCK_GAMEDAYS: GameDay[] = [ ... ]

export default function MatchesPage() {
	const [gamedays, setGamedays] = useState<GameDay[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState<string | null>(null);
	const [errorModal, setErrorModal] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [confirmModal, setConfirmModal] = useState(false);
	const [gameToDelete, setGameToDelete] = useState<string | null>(null);

	useEffect(() => {
		fetchGamedays();
	}, []);

	const fetchGamedays = async () => {
		try {
			setIsLoading(true);

			// קריאה לשרת במקום שימוש בנתוני דמה
			const response = await matchApi.getAll();

			if (response.success) {
				// המר את נתוני ה-Match מהשרת לפורמט של GameDay
				const gameDays: GameDay[] = response.data.map((match: Match) => ({
					...match,
					matches: [], // אין לנו מידע על משחקים ספציפיים מהשרת, לכן נאתחל כמערך ריק
				}));
				setGamedays(gameDays);
			} else {
				const errorMessage = typeof response.error === 'string' ? response.error : 'שגיאה בטעינת ימי המשחקים';
				setError(errorMessage);
			}
		} catch (err) {
			setError('שגיאה בטעינת ימי המשחקים');
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const openDeleteConfirmation = (id: string, e: React.MouseEvent) => {
		e.preventDefault(); // מניעת ניווט לדף המשחק
		e.stopPropagation(); // עצירת התפשטות האירוע
		setGameToDelete(id);
		setConfirmModal(true);
	};

	const confirmDelete = async () => {
		if (!gameToDelete) return;

		try {
			setIsDeleting(gameToDelete);
			const response = await matchApi.delete(gameToDelete);

			if (response.success) {
				// עדכון הרשימה ללא יום המשחקים שנמחק
				setGamedays(gamedays.filter((gameday) => gameday._id !== gameToDelete));
			} else {
				const errorMessage = typeof response.error === 'string' ? response.error : 'שגיאה במחיקת יום המשחקים';
				showErrorModal(errorMessage);
			}
		} catch (err) {
			console.error('שגיאה במחיקת יום המשחקים:', err);
			showErrorModal('שגיאה במחיקת יום המשחקים');
		} finally {
			setIsDeleting(null);
			setConfirmModal(false);
			setGameToDelete(null);
		}
	};

	const cancelDelete = () => {
		setConfirmModal(false);
		setGameToDelete(null);
	};

	const showErrorModal = (message: string) => {
		setErrorMessage(message);
		setErrorModal(true);
	};

	const closeErrorModal = () => {
		setErrorModal(false);
		setErrorMessage('');
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('he-IL', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const getCompletionStatus = (gameDay: GameDay) => {
		const totalMatches = gameDay.matches?.length || 0;
		const completedMatches = gameDay.matches?.filter((match) => match.isCompleted)?.length || 0;

		// אם אין משחקים, נחזיר 0% או 100% בהתאם לסטטוס ההשלמה
		const percentage =
			totalMatches === 0 ? (gameDay.isCompleted ? 100 : 0) : Math.floor((completedMatches / totalMatches) * 100);

		return {
			percentage,
			text: gameDay.isCompleted
				? 'הושלם'
				: totalMatches === 0
				? 'טרם נקבעו משחקים'
				: `${completedMatches}/${totalMatches} משחקים`,
			color: gameDay.isCompleted ? 'bg-green-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-blue-500',
		};
	};

	if (isLoading) {
		return (
			<div
				dir='rtl'
				className='flex justify-center items-center h-64'>
				<div className='text-center'>
					<div className='text-xl font-semibold mb-2'>טוען ימי משחקים...</div>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-800 mx-auto'></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div
				dir='rtl'
				className='bg-red-100 p-4 rounded-md text-red-700'>
				<div className='font-bold mb-2'>שגיאה</div>
				<div>{error}</div>
			</div>
		);
	}

	return (
		<div dir='rtl'>
			{/* Error Modal */}
			{errorModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'>
					<div className='bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl'>
						<div className='flex items-center mb-4'>
							<div className='bg-red-100 p-2 rounded-full mr-3'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-6 w-6 text-red-600'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
									/>
								</svg>
							</div>
							<h3 className='text-lg font-medium text-gray-900'>שגיאה</h3>
						</div>
						<div className='mb-5'>
							<p className='text-gray-700'>{errorMessage}</p>
						</div>
						<div className='flex justify-end'>
							<button
								onClick={closeErrorModal}
								className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors'>
								סגור
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Confirmation Modal */}
			{confirmModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'>
					<div className='bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl'>
						<div className='flex items-center mb-4'>
							<div className='bg-yellow-100 p-2 rounded-full mr-3'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-6 w-6 text-yellow-600'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
									/>
								</svg>
							</div>
							<h3 className='text-lg font-medium text-gray-900'>אישור מחיקה</h3>
						</div>
						<div className='mb-5'>
							<p className='text-gray-700'>האם אתה בטוח שברצונך למחוק את יום המשחקים הזה?</p>
						</div>
						<div className='flex justify-end space-x-3'>
							<button
								onClick={cancelDelete}
								className='bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors ml-3'>
								ביטול
							</button>
							<button
								onClick={confirmDelete}
								disabled={isDeleting === gameToDelete}
								className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center'>
								{isDeleting === gameToDelete ? (
									<>
										<div className='w-4 h-4 animate-spin rounded-full border-b-2 border-white mr-2'></div>
										מוחק...
									</>
								) : (
									'מחק'
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-3xl font-bold text-green-800'>ימי משחקים</h1>
				<Link
					href='/matches/gameday/new'
					className='bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md transition-colors'>
					צור יום משחקים חדש
				</Link>
			</div>

			{gamedays.length === 0 ? (
				<div className='bg-white rounded-lg shadow p-6 text-center'>
					<h2 className='text-xl font-semibold mb-4'>אין ימי משחקים</h2>
					<p className='mb-4'>טרם נוצרו ימי משחקים במערכת.</p>
					<Link
						href='/matches/gameday/new'
						className='inline-block bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md transition-colors'>
						צור יום משחקים ראשון
					</Link>
				</div>
			) : (
				<div className='grid gap-6'>
					{gamedays.map((gameday) => {
						const status = getCompletionStatus(gameday);

						return (
							<div
								key={gameday._id}
								className='relative bg-white rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-green-600'>
								<Link
									href={`/matches/gameday/${gameday._id}`}
									className='block p-6'>
									<div className='flex flex-col md:flex-row md:justify-between md:items-center'>
										<div>
											<h2 className='text-xl font-semibold'>
												יום משחקים - {formatDate(gameday.date)}
											</h2>
											<div className='text-gray-600 mt-1'>{gameday.location}</div>
											<div className='mt-2 flex flex-wrap gap-2'>
												{gameday.teams.map((team, idx) => (
													<span
														key={idx}
														className='inline-block px-2 py-1 text-xs rounded-full'
														style={{
															backgroundColor: team.color ? `${team.color}20` : '#f3f4f6',
															color: team.color || '#1f2937',
															borderColor: team.color,
															borderWidth: '1px',
														}}>
														{team.name}
													</span>
												))}
											</div>
										</div>
										<div className='mt-4 md:mt-0'>
											<div className='flex items-center'>
												<div className='relative w-48 h-2 bg-gray-200 rounded'>
													<div
														className={`absolute top-0 left-0 h-2 rounded ${status.color}`}
														style={{width: `${status.percentage}%`}}></div>
												</div>
												<span className='ml-2 text-sm font-medium'>{status.text}</span>
											</div>
											<div className='mt-2 text-sm text-gray-500'>
												{gameday.matches?.length
													? `${gameday.matches.length} משחקים כולל`
													: 'טרם נקבעו משחקים'}
											</div>
										</div>
									</div>
								</Link>
								<button
									onClick={(e) => openDeleteConfirmation(gameday._id, e)}
									className='absolute top-2 left-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors'
									title='מחק יום משחקים'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
										strokeWidth={1.5}
										stroke='currentColor'
										className='w-5 h-5'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
										/>
									</svg>
								</button>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
