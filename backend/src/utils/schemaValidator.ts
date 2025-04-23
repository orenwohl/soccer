import { z } from 'zod'

// Validate email format with regex pattern
const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/

// Function to validate email
export const isValidEmail = (email: string): boolean => {
	return emailRegex.test(email)
}

// Validation error class
export class ValidationError extends Error {
	errors: Record<string, { message: string }>

	constructor(errors: Record<string, { message: string }>) {
		super('Validation failed')
		this.name = 'ValidationError'
		this.errors = errors
	}
}

// Generic validation function
export const validate = <T>(data: T, schema: z.ZodType<T>): T => {
	try {
		return schema.parse(data)
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errors: Record<string, { message: string }> = {}
			error.errors.forEach(err => {
				const path = err.path.join('.')
				errors[path] = { message: err.message }
			})
			throw new ValidationError(errors)
		}
		throw error
	}
}
