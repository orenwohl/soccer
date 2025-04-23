import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { validate, isValidEmail, ValidationError } from '../utils/schemaValidator'

export interface IUser {
	_id?: string
	name: string
	email: string
	password?: string
	googleId?: string
	picture?: string
	createdAt: Date
	updatedAt: Date
}

// Define Zod schema for user validation
export const UserSchema = z.object({
	name: z.string().min(1, 'Please provide name').trim(),
	email: z.string().min(1, 'Please provide email').refine(isValidEmail, 'Please provide a valid email'),
	password: z.string().min(6, 'Password must be at least 6 characters').optional(),
	googleId: z.string().optional(),
	picture: z.string().optional(),
	createdAt: z
		.date()
		.optional()
		.default(() => new Date()),
	updatedAt: z
		.date()
		.optional()
		.default(() => new Date())
})

export type UserInput = z.infer<typeof UserSchema>

// Helper functions
export const validateUser = (userData: UserInput): UserInput => {
	return validate(userData, UserSchema)
}

export const hashPassword = async (password: string): Promise<string> => {
	const salt = await bcrypt.genSalt(10)
	return await bcrypt.hash(password, salt)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
	return await bcrypt.compare(password, hashedPassword)
}

export const generateAuthToken = (userId: string): string => {
	return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: '30d' })
}

export default {
	validate: validateUser,
	hashPassword,
	comparePassword,
	generateAuthToken
}
