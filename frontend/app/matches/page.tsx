'use client';

import {useState, useEffect} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import {useAuth} from '../context/AuthContext';
import {useMatches} from '../hooks/useMatches';
import {useDeleteMatch} from '../hooks/useMatchMutations';
import ErrorMessage from '../components/ErrorMessage';

export default function MatchesPage() {
	const [confirmModal, setConfirmModal] = useState(false);
	const [gameToDelete, setGameToDelete] = useState<string | null>(null);
	const [errorModal, setErrorModal] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const router = useRouter();
	const {loading: authLoading} = useAuth();
	const {data, isLoading, error, isError, refetch} = useMatches();
	const deleteMatch = useDeleteMatch();

	const matches = data?.data || [];

	// Auth check
	useEffect(() => {
		if (authLoading) return;

		const token = Cookies.get('token');
		if (!token) {
			router.push('/login');
		}
	}, [router, authLoading]);

	const openDeleteConfirmation = (id: string, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setGameToDelete(id);
		setConfirmModal(true);
	};

	const confirmDelete = async () => {
		if (!gameToDelete) return;

		try {
			const response = await deleteMatch.mutateAsync(gameToDelete);

			if (!response.success) {
				const errorMessage = typeof response.error === 'string' ? response.error : 'שגיאה במחיקת יום המשחקים';
				showErrorModal(errorMessage);
			}
		} catch (err) {
			console.error('שגיאה במחיקת יום המשחקים:', err);
			showErrorModal('שגיאה במחיקת יום המשחקים');
		} finally {
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

	if (isLoading || authLoading) {
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

	const errorMessageText = isError ? (error as Error).message : null;

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
							<p className='text-gray-700'>
								האם אתה בטוח שברצונך למחוק את יום המשחקים הזה? פעולה זו אינה ניתנת לביטול.
							</p>
						</div>
						<div className='flex justify-end space-x-2 space-x-reverse'>
							<button
								onClick={cancelDelete}
								className='bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors'
								disabled={deleteMatch.isPending}>
								ביטול
							</button>
							<button
								onClick={confirmDelete}
								className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center'
								disabled={deleteMatch.isPending}>
								{deleteMatch.isPending && (
									<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
								)}
								{deleteMatch.isPending ? 'מוחק...' : 'מחק'}
							</button>
						</div>
					</div>
				</div>
			)}

			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-3xl font-bold text-green-800'>ימי משחקים</h1>
				<div className='flex space-x-2 space-x-reverse'>
					{/* <Link
						href='/matches/generate'
						className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors'>
						יצירת קבוצות
					</Link> */}
					<Link
						href='/matches/gameday/new'
						className='bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md transition-colors'>
						יום משחקים חדש
					</Link>
				</div>
			</div>

			<ErrorMessage message={errorMessageText} />
		</div>
	);
}
