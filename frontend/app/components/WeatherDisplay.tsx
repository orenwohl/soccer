'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWeather } from '@/app/services/weather.service'
import {
	Cloud,
	CloudDrizzle,
	CloudFog,
	CloudLightning,
	CloudRain,
	CloudSnow,
	Loader2,
	Snowflake,
	Sun,
	Sun as SunIcon, // Use Sun as SunCloud since SunCloud isn't available
	Wind
} from 'lucide-react'

interface WeatherDisplayProps {
	location?: string
}

// Helper function to map weather codes to Lucide icons
function getWeatherIcon(code?: number, className: string = 'h-12 w-12') {
	// Default to sun icon
	if (!code) {
		return <Sun className={`${className} text-yellow-500`} />
	}

	// Map weather codes to appropriate icons
	// Based on Open-Meteo API weather codes: https://open-meteo.com/en/docs
	if (code === 0) return <Sun className={`${className} text-yellow-500`} /> // Clear sky
	if (code === 1) return <SunIcon className={`${className} text-yellow-500`} /> // Mainly clear
	if (code === 2) return <Cloud className={`${className} text-gray-500`} /> // Partly cloudy
	if (code === 3) return <Cloud className={`${className} text-gray-500`} /> // Overcast
	if (code === 45 || code === 48) return <CloudFog className={`${className} text-gray-500`} /> // Fog

	// Drizzle
	if (code >= 51 && code <= 57) return <CloudDrizzle className={`${className} text-blue-400`} />

	// Rain
	if (code >= 61 && code <= 67) return <CloudRain className={`${className} text-blue-500`} />

	// Snow
	if (code >= 71 && code <= 77) return <CloudSnow className={`${className} text-blue-300`} />

	// Showers
	if (code >= 80 && code <= 82) return <CloudRain className={`${className} text-blue-600`} />
	if (code >= 85 && code <= 86) return <Snowflake className={`${className} text-blue-300`} />

	// Thunderstorm
	if (code === 95 || code === 96 || code === 99) return <CloudLightning className={`${className} text-yellow-400`} />

	// Default
	return <Sun className={`${className} text-yellow-500`} />
}

// Helper function to get weather description based on weather code
function getWeatherDescription(code?: number): string {
	if (!code) return 'לא ידוע'

	// Weather code mapping based on Open-Meteo API
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

export function WeatherDisplay({ location }: WeatherDisplayProps) {
	const { data: weather, isLoading, error, isError } = useWeather(location)

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<Sun className="h-5 w-5 mr-2 text-yellow-500" />
						<span>מזג אוויר</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex justify-center items-center py-4">
						<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
						<span className="mr-2 text-gray-500">טוען נתוני מזג אוויר...</span>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (isError) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<Sun className="h-5 w-5 mr-2 text-yellow-500" />
						<span>מזג אוויר</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-red-500">{error instanceof Error ? error.message : 'שגיאה בטעינת מזג האוויר'}</div>
					{location && <div className="text-sm text-gray-500 mt-2">מיקום: {location}</div>}
				</CardContent>
			</Card>
		)
	}

	if (!weather || !weather.current) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<Sun className="h-5 w-5 mr-2 text-yellow-500" />
						<span>מזג אוויר</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-gray-500">אין נתוני מזג אוויר זמינים</div>
					{location && <div className="text-sm text-gray-500 mt-2">מיקום: {location}</div>}
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center">
					<Sun className="h-5 w-5 mr-2 text-yellow-500" />
					<span>מזג אוויר {location ? `ב${location}` : ''}</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-center mb-4">
					<div className="w-16 h-16 flex items-center justify-center">{getWeatherIcon(weather.current.weather_code)}</div>
					<div>
						<div className="text-2xl font-bold">{weather.current.temperature_2m || 0}°C</div>
						<div className="text-gray-600">{getWeatherDescription(weather.current.weather_code)}</div>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4 text-center">
					<div>
						<h4 className="text-sm font-medium text-gray-500">מורגש כמו</h4>
						<p>{weather.current.apparent_temperature || 0}°C</p>
					</div>
					<div>
						<h4 className="text-sm font-medium text-gray-500">לחות</h4>
						<p>{weather.current.relative_humidity_2m || 0}%</p>
					</div>
					<div>
						<h4 className="text-sm font-medium text-gray-500">משקעים</h4>
						<p>{weather.current.precipitation || 0} מ&quot;מ</p>
					</div>
					<div className="flex flex-col items-center">
						<h4 className="text-sm font-medium text-gray-500">רוח</h4>
						<div className="flex items-center">
							<Wind className="h-4 w-4 ml-1 text-blue-500" />
							<p>{weather.current.wind_speed_10m || 0} קמ&quot;ש</p>
						</div>
					</div>
					<div>
						<h4 className="text-sm font-medium text-gray-500">לחץ אוויר</h4>
						<p>{weather.current.pressure_msl || 0} hPa</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
