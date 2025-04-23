import { Request, Response } from 'express'
import User from '../models/User' // Keep for type and token generation methods
import { dbService } from '../config/db'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config'

export const register = async (req: Request, res: Response): Promise<void> => {
	try {
		const { name, email, password } = req.body
		const collection = await dbService.getCollection('users')

		const userExists = await collection.findOne({ email })
		if (userExists) {
			res.status(400).json({ success: false, message: 'User already exists' })
			return
		}

		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(password, salt)

		const result = await collection.insertOne({
			name,
			email,
			password: hashedPassword,
			createdAt: new Date(),
			updatedAt: new Date()
		})

		const user = await collection.findOne({ _id: result.insertedId })

		const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '30d' })

		res.status(201).json({
			success: true,
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email
			}
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ success: false, message: 'Server Error' })
	}
}

export const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const { email, password } = req.body
		const collection = await dbService.getCollection('users')

		// Check for user
		const user = await collection.findOne({ email })
		if (!user) {
			res.status(401).json({ success: false, message: 'Invalid credentials' })
			return
		}

		// Check if password matches
		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			res.status(401).json({ success: false, message: 'Invalid credentials' })
			return
		}

		// Generate token
		const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '30d' })

		res.json({
			success: true,
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				picture: user.picture
			}
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ success: false, message: 'Server Error' })
	}
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
	try {
		// req.user is set in the auth middleware
		const collection = await dbService.getCollection('users')
		const user = await collection.findOne({ _id: new ObjectId(req.user.id) })

		if (!user) {
			res.status(404).json({ success: false, message: 'User not found' })
			return
		}

		res.json({
			success: true,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				picture: user.picture
			}
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ success: false, message: 'Server Error' })
	}
}
