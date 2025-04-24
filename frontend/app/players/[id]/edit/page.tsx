'use client';

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {playerApi} from '@/app/services/api';
import {Input} from '@/components/ui/input';
import {Player} from '@/app/types';
import {Dumbbell, Shield, Briefcase} from 'lucide-react';

export default function EditPlayerPage({params}: {params: {id: string}}) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [formData, setFormData] = useState<
		Omit<Player, '_id' | 'createdAt' | 'updatedAt'> & {
			fitnessRating: number;
			defenseRating: number;
			techniqueRating: number;
		}
	>({
		name: '',
		phone: '',
		rating: 3,
		fitnessRating: 3,
		defenseRating: 3,
		techniqueRating: 3,
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch player data on component mount
	useEffect(() => {
		const fetchPlayer = async () => {
			try {
				const response = await playerApi.getById(params.id);
				if (response.success) {
					// Extract the fields we need for the form, including the specialized ratings
					const {name, phone, rating, fitnessRating, defenseRating, techniqueRating} = response.data;
					setFormData({
						name,
						phone,
						rating,
						fitnessRating: fitnessRating || 3,
						defenseRating: defenseRating || 3,
						techniqueRating: techniqueRating || 3,
					});
				} else {
					const errorMsg = Array.isArray(response.error)
						? response.error.join(', ')
						: response.error || 'Failed to load player';
					throw new Error(errorMsg);
				}
			} catch (err) {
				console.error('Error loading player:', err);
				setError('Failed to load player data');
			} finally {
				setLoading(false);
			}
		};

		fetchPlayer();
	}, [params.id]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const {name, value} = e.target;
		setFormData({
			...formData,
			[name]:
				name === 'rating' || name === 'fitnessRating' || name === 'defenseRating' || name === 'techniqueRating'
					? parseInt(value)
					: value,
		});
	};

	// Calculate overall rating based on specialized ratings
	useEffect(() => {
		const {fitnessRating, defenseRating, techniqueRating} = formData;
		const calculatedRating = Math.round((fitnessRating + defenseRating + techniqueRating) / 3);

		setFormData((prev) => ({
			...prev,
			rating: calculatedRating,
		}));
	}, [formData.fitnessRating, formData.defenseRating, formData.techniqueRating]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);

		try {
			// Call the API to update the player
			const response = await playerApi.update(params.id, formData);

			if (!response.success) {
				const errorMessage = typeof response.error === 'string' ? response.error : 'Failed to update player';
				throw new Error(errorMessage);
			}

			console.log('Player updated successfully:', response.data);

			// Navigate back to players list
			router.push('/players');
			router.refresh();
		} catch (err) {
			console.error('Failed to update player:', err);
			const errorMessage = err instanceof Error ? err.message : 'נכשל בעדכון שחקן. אנא נסה שוב.';
			setError(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Render star rating for a specific field
	const renderStars = (field: 'fitnessRating' | 'defenseRating' | 'techniqueRating') => {
		const stars = [];
		for (let i = 1; i <= 5; i++) {
			stars.push(
				<button
					key={i}
					type='button'
					onClick={() => setFormData({...formData, [field]: i})}
					className={`text-2xl ${i <= formData[field] ? 'text-yellow-400' : 'text-gray-300'}`}>
					★
				</button>
			);
		}
		return stars;
	};

	if (loading) {
		return (
			<div className='flex justify-center items-center h-64'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-700'></div>
			</div>
		);
	}

	return (
		<div>
			<div className='mb-6'>
				<h1 className='text-3xl font-bold text-green-800 mb-2'>עריכת שחקן</h1>
				<p className='text-gray-600'>עדכן את פרטי השחקן ודירוג המיומנות</p>
			</div>

			<div className='bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto'>
				<form
					onSubmit={handleSubmit}
					dir='rtl'>
					{error && <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-md'>{error}</div>}

					<div className='mb-4'>
						<label
							className='block text-gray-700 text-sm font-bold mb-2'
							htmlFor='name'>
							שם מלא *
						</label>
						<Input
							id='name'
							name='name'
							type='text'
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600'
							value={formData.name}
							onChange={handleChange}
							required
						/>
					</div>

					<div className='mb-4'>
						<label
							className='block text-gray-700 text-sm font-bold mb-2'
							htmlFor='phone'>
							מספר טלפון
						</label>
						<Input
							id='phone'
							name='phone'
							type='tel'
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600'
							value={formData.phone}
							onChange={handleChange}
						/>
					</div>

					<div className='mb-5'>
						<h3 className='block text-gray-700 font-bold mb-3'>דירוג יכולות השחקן</h3>

						<div className='space-y-4'>
							<div className='mb-2'>
								<label className='flex items-center text-gray-700 text-sm font-bold mb-2'>
									<Dumbbell className='h-4 w-4 text-blue-500 mr-1' />
									<span>כושר</span>
								</label>
								<div className='flex items-center justify-end gap-1'>
									{renderStars('fitnessRating')}
								</div>
							</div>

							<div className='mb-2'>
								<label className='flex items-center text-gray-700 text-sm font-bold mb-2'>
									<Shield className='h-4 w-4 text-red-500 mr-1' />
									<span>הגנה</span>
								</label>
								<div className='flex items-center justify-end gap-1'>
									{renderStars('defenseRating')}
								</div>
							</div>

							<div className='mb-2'>
								<label className='flex items-center text-gray-700 text-sm font-bold mb-2'>
									<Briefcase className='h-4 w-4 text-green-500 mr-1' />
									<span>טכניקה</span>
								</label>
								<div className='flex items-center justify-end gap-1'>
									{renderStars('techniqueRating')}
								</div>
							</div>
						</div>
					</div>

					<div className='mb-4'>
						<label className='block text-gray-700 text-sm font-bold mb-2'>
							דירוג כללי (מחושב אוטומטית)
						</label>
						<div className='flex items-center justify-end bg-gray-50 p-2 rounded-md'>
							<div className='text-3xl font-bold text-green-700'>{formData.rating}</div>
							<div className='text-xl text-yellow-400 ml-2'>{'★'.repeat(formData.rating)}</div>
						</div>
					</div>

					<div className='flex justify-between items-center mt-6'>
						<button
							type='submit'
							className='bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-md transition-colors disabled:bg-gray-400'
							disabled={isSubmitting}>
							{isSubmitting ? 'שומר...' : 'עדכן שחקן'}
						</button>
						<Link
							href='/players'
							className='text-gray-600 hover:text-gray-800'>
							ביטול
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
