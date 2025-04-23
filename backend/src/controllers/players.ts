import {Request, Response} from 'express';
import Player from '../models/Player';

// @desc    Get all players
// @route   GET /api/players
// @access  Private
export const getPlayers = async (req: Request, res: Response): Promise<void> => {
	try {
		// Get players that belong to the current user
		const players = await Player.find({user: req.user.id});

		res.json({
			success: true,
			data: players,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			error: 'Server Error',
		});
	}
};

// @desc    Get single player
// @route   GET /api/players/:id
// @access  Private
export const getPlayer = async (req: Request, res: Response): Promise<void> => {
	try {
		const player = await Player.findById(req.params.id);

		if (!player) {
			res.status(404).json({
				success: false,
				error: 'Player not found',
			});
			return;
		}

		// Make sure user owns the player
		if (player.user.toString() !== req.user.id) {
			res.status(401).json({
				success: false,
				error: 'Not authorized to access this player',
			});
			return;
		}

		res.json({
			success: true,
			data: player,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			error: 'Server Error',
		});
	}
};

// @desc    Create new player
// @route   POST /api/players
// @access  Private
export const createPlayer = async (req: Request, res: Response): Promise<void> => {
	try {
		// Add user to request body
		req.body.user = req.user.id;

		const player = await Player.create(req.body);

		res.status(201).json({
			success: true,
			data: player,
		});
	} catch (error) {
		console.error(error);

		// Handle duplicate email
		if ((error as any).code === 11000) {
			res.status(400).json({
				success: false,
				error: 'Player with that email already exists',
			});
			return;
		}

		res.status(500).json({
			success: false,
			error: 'Server Error',
		});
	}
};

// @desc    Update player
// @route   PUT /api/players/:id
// @access  Private
export const updatePlayer = async (req: Request, res: Response): Promise<void> => {
	try {
		let player = await Player.findById(req.params.id);

		if (!player) {
			res.status(404).json({
				success: false,
				error: 'Player not found',
			});
			return;
		}

		// Make sure user owns the player
		if (player.user.toString() !== req.user.id) {
			res.status(401).json({
				success: false,
				error: 'Not authorized to update this player',
			});
			return;
		}

		player = await Player.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		res.json({
			success: true,
			data: player,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			error: 'Server Error',
		});
	}
};

// @desc    Delete player
// @route   DELETE /api/players/:id
// @access  Private
export const deletePlayer = async (req: Request, res: Response): Promise<void> => {
	try {
		const player = await Player.findById(req.params.id);

		if (!player) {
			res.status(404).json({
				success: false,
				error: 'Player not found',
			});
			return;
		}

		// Make sure user owns the player
		if (player.user.toString() !== req.user.id) {
			res.status(401).json({
				success: false,
				error: 'Not authorized to delete this player',
			});
			return;
		}

		await player.deleteOne();

		res.json({
			success: true,
			data: {},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			error: 'Server Error',
		});
	}
};
