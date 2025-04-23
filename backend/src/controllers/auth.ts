import {Request, Response} from 'express';
import User from '../models/User';

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
	try {
		const {name, email, password} = req.body;

		// Check if user exists
		const userExists = await User.findOne({email});
		if (userExists) {
			res.status(400).json({success: false, message: 'User already exists'});
			return;
		}

		// Create user
		const user = await User.create({
			name,
			email,
			password,
		});

		// Generate token
		const token = user.generateAuthToken();

		res.status(201).json({
			success: true,
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({success: false, message: 'Server Error'});
	}
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const {email, password} = req.body;

		// Check for user
		const user = await User.findOne({email}).select('+password');
		if (!user) {
			res.status(401).json({success: false, message: 'Invalid credentials'});
			return;
		}

		// Check if password matches
		const isMatch = await user.matchPassword(password);
		if (!isMatch) {
			res.status(401).json({success: false, message: 'Invalid credentials'});
			return;
		}

		// Generate token
		const token = user.generateAuthToken();

		res.json({
			success: true,
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				picture: user.picture,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({success: false, message: 'Server Error'});
	}
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
	try {
		// req.user is set in the auth middleware
		const user = await User.findById(req.user.id);

		if (!user) {
			res.status(404).json({success: false, message: 'User not found'});
			return;
		}

		res.json({
			success: true,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				picture: user.picture,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({success: false, message: 'Server Error'});
	}
};
