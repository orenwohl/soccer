'use client';

import Link from 'next/link';
import {useAuth} from '../context/AuthContext';

const Navbar = () => {
	const {user, logout} = useAuth();

	return (
		<div className='flex justify-between items-center'>
			<Link
				href='/'
				className='text-2xl font-bold hover:text-green-200 transition-colors'>
				כדורגל שכונתי
			</Link>
			<nav className='flex space-x-reverse space-x-6'>
				<Link
					href='/players'
					className='hover:text-green-200 transition-colors'>
					שחקנים
				</Link>
				<Link
					href='/matches'
					className='hover:text-green-200 transition-colors'>
					משחקים
				</Link>
				<Link
					href='/table'
					className='hover:text-green-200 transition-colors'>
					טבלת ליגה
				</Link>

				{user ? (
					<div className='flex items-center space-x-reverse space-x-4'>
						<span className='text-green-200'>{user.name}</span>
						<button
							onClick={logout}
							className='bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-sm transition-colors'>
							התנתק
						</button>
					</div>
				) : (
					<Link
						href='/login'
						className='hover:text-green-200 transition-colors'>
						התחברות
					</Link>
				)}
			</nav>
		</div>
	);
};

export default Navbar;
