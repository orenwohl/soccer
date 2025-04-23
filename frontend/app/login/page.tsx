'use client';

import {useState} from 'react';
import {useAuth} from '../context/AuthContext';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLogin, setIsLogin] = useState(true);
	const [name, setName] = useState('');

	const {login, register, loading} = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (isLogin) {
			await login(email, password);
		} else {
			await register(name, email, password);
		}
	};

	return (
		<div className='max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md'>
			<h1 className='text-2xl font-bold mb-6 text-center'>{isLogin ? 'התחברות' : 'הרשמה'}</h1>

			<form onSubmit={handleSubmit}>
				{!isLogin && (
					<div className='mb-4'>
						<label
							className='block text-gray-700 text-sm font-bold mb-2'
							htmlFor='name'>
							שם מלא
						</label>
						<input
							className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
							id='name'
							type='text'
							placeholder='שם מלא'
							value={name}
							onChange={(e) => setName(e.target.value)}
							required={!isLogin}
						/>
					</div>
				)}

				<div className='mb-4'>
					<label
						className='block text-gray-700 text-sm font-bold mb-2'
						htmlFor='email'>
						דוא״ל
					</label>
					<input
						className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
						id='email'
						type='email'
						placeholder='דוא״ל'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>

				<div className='mb-6'>
					<label
						className='block text-gray-700 text-sm font-bold mb-2'
						htmlFor='password'>
						סיסמה
					</label>
					<input
						className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
						id='password'
						type='password'
						placeholder='סיסמה'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>

				<div className='flex items-center justify-between mb-4'>
					<button
						className='bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
						type='submit'
						disabled={loading}>
						{loading ? 'מעבד...' : isLogin ? 'התחבר' : 'הירשם'}
					</button>

					<button
						type='button'
						className='inline-block align-baseline font-bold text-sm text-green-600 hover:text-green-800'
						onClick={() => setIsLogin(!isLogin)}>
						{isLogin ? 'אין לך חשבון?' : 'כבר יש לך חשבון?'}
					</button>
				</div>

				<div className='mt-4 text-center'>
					<p className='text-gray-600 mb-2'>או התחבר באמצעות</p>
					<button
						type='button'
						className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full'
						onClick={() => alert('התחברות עם גוגל תהיה זמינה בקרוב')}>
						גוגל
					</button>
				</div>
			</form>
		</div>
	);
}
