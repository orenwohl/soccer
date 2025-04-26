/**
 * Helper function to get weather description based on weather code
 * @param code - The weather code from Open-Meteo API
 * @returns A human-readable description in Hebrew
 */
export function getWeatherDescription(code?: number): string {
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

/**
 * Get a display string for temperature with unit
 * @param temp - The temperature value
 * @returns Formatted temperature with unit
 */
export function formatTemperature(temp?: number): string {
	return `${temp || 0}°C`
}

/**
 * Get a display string for precipitation with unit
 * @param precip - The precipitation value in mm
 * @returns Formatted precipitation with unit
 */
export function formatPrecipitation(precip?: number): string {
	return `${precip || 0} מ"מ`
}

/**
 * Get a display string for wind speed with unit
 * @param speed - The wind speed value in km/h
 * @returns Formatted wind speed with unit
 */
export function formatWindSpeed(speed?: number): string {
	return `${speed || 0} קמ"ש`
}
