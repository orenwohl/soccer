'use client'

import React from 'react'
import StarRating from '@/app/components/StarRating'
import { TeamShirt, TEAM_COLORS } from '@/app/components/TeamShirt'

// Re-export existing components
export { StarRating, TeamShirt, TEAM_COLORS }

// Additional component for editable star rating
export const EditableStarRating: React.FC<{
	value: number
	onChange: (newValue: number) => void
	maxRating?: number
	size?: 'sm' | 'md' | 'lg'
}> = ({ value, onChange, maxRating = 5, size = 'lg' }) => {
	const sizeClasses = {
		sm: 'text-base',
		md: 'text-xl',
		lg: 'text-2xl'
	}

	return (
		<div className="flex items-center justify-end gap-1">
			{Array.from({ length: maxRating }).map((_, i) => (
				<button key={i} type="button" onClick={() => onChange(i + 1)} className={`${sizeClasses[size]} ${i < value ? 'text-yellow-400' : 'text-gray-300'}`}>
					★
				</button>
			))}
		</div>
	)
}

// Icons for player rating fields
export const RatingSvgIcons = {
	fitness: (props: React.SVGProps<SVGSVGElement>) => (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="h-4 w-4 text-blue-500"
			{...props}
		>
			<path d="M6.5 6.5h11"></path>
			<path d="M6.5 17.5h11"></path>
			<path d="M6 9h12"></path>
			<path d="M6 12h12"></path>
			<path d="M6 15h12"></path>
			<path d="M6.5 2C3.5 2 2 3.5 2 6.5S3.5 11 6.5 11h11c3 0 4.5-1.5 4.5-4.5S20.5 2 17.5 2h-11Z"></path>
			<path d="M6.5 13c-3 0-4.5 1.5-4.5 4.5S3.5 22 6.5 22h11c3 0 4.5-1.5 4.5-4.5S20.5 13 17.5 13h-11Z"></path>
		</svg>
	),
	defense: (props: React.SVGProps<SVGSVGElement>) => (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="h-4 w-4 text-red-500"
			{...props}
		>
			<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
		</svg>
	),
	technique: (props: React.SVGProps<SVGSVGElement>) => (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="h-4 w-4 text-green-500"
			{...props}
		>
			<path d="M20 6h-4V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"></path>
			<path d="M14 4.5V4"></path>
			<path d="M10 4.5V4"></path>
			<path d="M8 11h8"></path>
			<path d="M8 15h5"></path>
		</svg>
	)
}

// Game Day UI Icons
export const GameDayIcons = {
	// Star icon for ratings
	Star: ({ filled = true, className = '' }: { filled?: boolean; className?: string }) => (
		<svg className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'} ${className}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
			<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
		</svg>
	),

	// Save icon
	Save: ({ className = '' }: { className?: string }) => (
		<svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 sm:h-5 sm:w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
		</svg>
	),

	// Loading spinner
	Spinner: ({ className = '' }: { className?: string }) => (
		<svg className={`animate-spin h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
			<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
		</svg>
	),

	// Add icon
	Add: ({ className = '' }: { className?: string }) => (
		<svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
			<path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
		</svg>
	),

	// Weather icon
	Weather: ({ code }: { code?: number }) => {
		// Default to sun icon
		if (!code) {
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
					/>
				</svg>
			)
		}

		// Rain icon (codes typically in the 200-500 range for rain)
		if (code >= 200 && code < 600) {
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V7m0 13v-3" />
				</svg>
			)
		}

		// Clouds icon (codes typically in the 700-800 range for clouds)
		if (code >= 600 && code < 800) {
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
				</svg>
			)
		}

		// Default sun or clear sky
		return (
			<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
				/>
			</svg>
		)
	},

	// Alias for the Weather component to fix the linter error
	WeatherIcon: ({ code }: { code?: number }) => {
		return GameDayIcons.Weather({ code })
	},

	// Function to get weather description based on weather code
	getWeatherDescription: (code?: number): string => {
		if (!code) return 'לא ידוע'

		// Weather code mapping based on Open-Meteo API
		// https://open-meteo.com/en/docs
		const weatherCodes: Record<number, string> = {
			0: 'שמיים בהירים',
			1: 'בהיר בעיקרו',
			2: 'מעונן חלקית',
			3: 'מעונן',
			45: 'ערפל',
			48: 'ערפל כפור',
			51: 'טפטוף קל',
			53: 'טפטוף בינוני',
			55: 'טפטוף חזק',
			56: 'גשם קל קפוא',
			57: 'גשם קפוא',
			61: 'גשם קל',
			63: 'גשם בינוני',
			65: 'גשם חזק',
			66: 'גשם קפוא קל',
			67: 'גשם קפוא חזק',
			71: 'שלג קל',
			73: 'שלג בינוני',
			75: 'שלג חזק',
			77: 'גרגרי שלג',
			80: 'ממטרים קלים',
			81: 'ממטרים בינוניים',
			82: 'ממטרים חזקים',
			85: 'שלג קל',
			86: 'שלג חזק',
			95: 'סופת רעמים',
			96: 'סופת רעמים עם ברד קל',
			99: 'סופת רעמים עם ברד כבד'
		}

		return weatherCodes[code] || 'לא ידוע'
	}
}
