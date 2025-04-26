import { Player } from '@/app/types'

/**
 * Form data interface for player edit/create forms
 */
export type PlayerFormData = Omit<Player, '_id' | 'createdAt' | 'updatedAt'> & {
	fitnessRating: number
	defenseRating: number
	techniqueRating: number
}

/**
 * Union type for player rating fields
 */
export type RatingFieldType = 'fitnessRating' | 'defenseRating' | 'techniqueRating'

/**
 * Interface for player rating field props
 */
export interface PlayerRatingFieldProps {
	field: RatingFieldType
	value: number
	onChange: (field: RatingFieldType, value: number) => void
}
