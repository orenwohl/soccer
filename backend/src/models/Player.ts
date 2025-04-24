import {z} from 'zod';
import {validate, isValidEmail} from '../utils/schemaValidator';
import {ObjectId} from 'mongodb';

export interface IPlayer {
	_id?: string;
	name: string;
	rating: number;
	email?: string;
	phone?: string;
	availability: string[];
	user: string | ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

// Define week days for availability
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type WeekDay = (typeof weekDays)[number];

// Define Zod schema for player validation
export const PlayerSchema = z.object({
	name: z.string().min(1, 'Please provide player name').trim(),
	rating: z.number().min(1, 'Rating must be at least 1').max(10, 'Rating cannot exceed 10'),
	email: z.string().optional(),
	phone: z.string().optional(),
	availability: z.array(z.enum(weekDays)).default([]),
	user: z.string().or(z.instanceof(ObjectId)),
	createdAt: z
		.date()
		.optional()
		.default(() => new Date()),
	updatedAt: z
		.date()
		.optional()
		.default(() => new Date()),
});

export type PlayerInput = z.infer<typeof PlayerSchema>;

// Helper function
export const validatePlayer = (playerData: PlayerInput): PlayerInput => {
	// Ensure availability is an array
	const data = {...playerData};
	if (!data.availability) {
		data.availability = [] as WeekDay[];
	}
	return validate(data, PlayerSchema);
};

export default {
	validate: validatePlayer,
};
