import { useQuery } from '@tanstack/react-query'
import { WeatherData } from '@/app/types'

// Weather service for fetching data
export const weatherService = {
	async getWeatherByLocation(location: string): Promise<WeatherData> {
		if (!location) {
			throw new Error('מיקום חסר')
		}

		// First get coordinates from the location name
		const geocodeResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=he`)

		if (!geocodeResponse.ok) {
			throw new Error('שגיאה בחיפוש מיקום')
		}

		const geocodeData = await geocodeResponse.json()

		if (!geocodeData.results || geocodeData.results.length === 0) {
			throw new Error('לא נמצא מיקום')
		}

		// Get coordinates from the first result
		const { latitude, longitude } = geocodeData.results[0]

		// Fetch weather data using coordinates
		const weatherResponse = await fetch(
			`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,pressure_msl&timezone=auto&forecast_days=1`
		)

		if (!weatherResponse.ok) {
			throw new Error('שגיאה בטעינת נתוני מזג האוויר')
		}

		return weatherResponse.json()
	}
}

// React Query hook for weather data
export function useWeather(location?: string) {
	return useQuery({
		queryKey: ['weather', location],
		queryFn: () => (location ? weatherService.getWeatherByLocation(location) : null),
		enabled: !!location, // Only run the query if location is provided
		staleTime: 1000 * 60 * 30, // Consider data fresh for 30 minutes
		gcTime: 1000 * 60 * 60, // Keep unused data in cache for 1 hour
		retry: 2
	})
}
