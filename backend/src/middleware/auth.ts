import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { dbService } from '../config/db'
import { ObjectId } from 'mongodb'
import { config } from '../config'

// Extend Request type to include user property
declare global {
	namespace Express {
		interface Request {
			user?: any
		}
	}
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
	let token

	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		try {
			// Get token from header
			token = req.headers.authorization.split(' ')[1]

			// Verify token
			const decoded = jwt.verify(token, config.jwtSecret || 'secret') as { id: string }

			// Get user from the token using the dbService
			const collection = await dbService.getCollection('users')
			req.user = await collection.findOne({ _id: new ObjectId(decoded.id) })

			if (!req.user) {
				res.status(401).json({ success: false, message: 'User not found' })
				return
			}

			// Make sure user ID is accessible as a string
			req.user.id = req.user._id.toString()

			// Remove password from user object
			if (req.user.password) {
				delete req.user.password
			}

			next()
		} catch (error) {
			console.error('Auth error:', error)
			res.status(401).json({ success: false, message: 'Not authorized, token failed' })
			return
		}
	} else {
		res.status(401).json({ success: false, message: 'Not authorized, no token' })
		return
	}
}
