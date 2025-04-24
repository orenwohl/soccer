import React from 'react';
import {cn} from '@/lib/utils';

// Team color constants - using the same colors as in the team creation page
export const TEAM_COLORS = [
	{name: 'אדום', value: '#ef4444', textColor: 'white'},
	{name: 'לבן', value: '#f9fafb', textColor: 'black'},
	{name: 'שחור', value: '#1f2937', textColor: 'white'},
	{name: 'כחול', value: '#3b82f6', textColor: 'white'},
	{name: 'צהוב', value: '#fbbf24', textColor: 'black'},
	{name: 'כתום', value: '#f97316', textColor: 'white'},
	{name: 'ירוק', value: '#22c55e', textColor: 'white'},
	// Additional colors
	{name: 'סגול', value: '#8b5cf6', textColor: 'white'},
	{name: 'ורוד', value: '#ec4899', textColor: 'white'},
	{name: 'אפור', value: '#6b7280', textColor: 'white'},
	{name: 'טורקיז', value: '#06b6d4', textColor: 'white'},
];

interface TeamShirtProps {
	color?: string;
	size?: 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
	animated?: boolean;
	number?: number;
}

const sizeMap = {
	sm: {width: 16, height: 16},
	md: {width: 24, height: 24},
	lg: {width: 32, height: 32},
	xl: {width: 48, height: 48},
};

export function TeamShirt({color = '#d1d5db', size = 'md', className, animated = false, number}: TeamShirtProps) {
	const dimensions = sizeMap[size];
	const isLargeEnough = size === 'lg' || size === 'xl';
	const isWhite = color === '#ffffff' || color === '#f9fafb';

	return (
		<div
			className={cn(
				'inline-flex items-center justify-center relative',
				animated && 'transition-transform duration-300 hover:scale-110',
				className
			)}
			style={{width: dimensions.width, height: dimensions.height}}>
			<svg
				viewBox='0 0 24 24'
				width={dimensions.width}
				height={dimensions.height}
				xmlns='http://www.w3.org/2000/svg'
				style={isWhite ? {filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.1))'} : undefined}>
				{/* Light gray background for white shirts to make them stand out */}
				{isWhite && (
					<path
						d='M3 7L6 3H18L21 7L18 9V21H6V9L3 7Z'
						fill='#f5f5f5'
						stroke='none'
					/>
				)}
				{/* Base shirt */}
				<path
					d='M3 7L6 3H18L21 7L18 9V21H6V9L3 7Z'
					fill={color}
					stroke={isWhite ? '#d1d5db' : color}
					strokeWidth={isWhite ? '1.2' : '1'}
					strokeLinejoin='round'
				/>
				{/* Collar/neck area */}
				<path
					d='M9 3H15V6C15 7.65685 13.6569 9 12 9C10.3431 9 9 7.65685 9 6V3Z'
					fill={isWhite ? '#f0f0f0' : 'rgba(255,255,255,0.2)'}
					stroke={isWhite ? '#d1d5db' : color}
					strokeWidth={isWhite ? '1.2' : '1'}
					strokeLinejoin='round'
				/>
				{/* Detail lines for more realistic shirt appearance */}
				<path
					d='M6 9v12 M18 9v12'
					stroke={isWhite ? '#e5e7eb' : 'rgba(0,0,0,0.1)'}
					strokeWidth={isWhite ? '0.7' : '0.5'}
					fill='none'
				/>
				{/* Add some subtle pattern for white shirts */}
				{isWhite && (
					<path
						d='M8 12h8 M8 15h8 M8 18h8'
						stroke='#eaeaea'
						strokeWidth='0.7'
						strokeDasharray='1,2'
					/>
				)}
				{/* Team number (only shown for lg and xl sizes) */}
				{isLargeEnough && number !== undefined && (
					<text
						x='12'
						y='16'
						textAnchor='middle'
						dominantBaseline='middle'
						fontSize='6'
						fontWeight='bold'
						fill={isWhite ? '#6b7280' : 'rgba(255,255,255,0.8)'}>
						{number}
					</text>
				)}
			</svg>
		</div>
	);
}
