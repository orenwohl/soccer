'use client';

interface StarRatingProps {
	rating: number;
	maxRating?: number;
	size?: 'sm' | 'md' | 'lg';
	showValue?: boolean;
	label?: string;
}

export default function StarRating({rating, maxRating = 5, size = 'sm', showValue = false, label}: StarRatingProps) {
	const sizeClass = {
		sm: 'text-sm',
		md: 'text-base',
		lg: 'text-lg',
	};

	return (
		<div className='flex items-center'>
			{[...Array(maxRating)].map((_, i) => (
				<span
					key={i}
					className={`${sizeClass[size]} ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
					★
				</span>
			))}
			{showValue && <span className='ml-1 text-sm text-gray-600'>({rating}/5)</span>}
			{label && <span className='ml-2 text-sm text-gray-600'>{label}</span>}
		</div>
	);
}
