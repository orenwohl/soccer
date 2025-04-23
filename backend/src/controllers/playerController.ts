import {Request, Response} from 'express';
import Player, {IPlayer} from '../models/Player';

// Get all players
export const getAllPlayers = async (req: Request, res: Response): Promise<void> => {
	try {
		const players = await Player.find().sort({name: 1});
		res.status(200).json({success: true, count: players.length, data: players});
	} catch (error) {
		res.status(500).json({success: false, error: 'Server Error'});
	}
};

// Get single player
export const getPlayer = async (req: Request, res: Response): Promise<void> => {
	try {
		const player = await Player.findById(req.params.id);

		if (!player) {
			res.status(404).json({success: false, error: 'Player not found'});
			return;
		}

		res.status(200).json({success: true, data: player});
	} catch (error) {
		res.status(500).json({success: false, error: 'Server Error'});
	}
};

// Create new player
export const createPlayer = async (req: Request, res: Response): Promise<void> => {
	try {
		// Check if email already exists
		const existingPlayer = await Player.findOne({email: req.body.email});

		if (existingPlayer) {
			res.status(400).json({success: false, error: 'Email already registered'});
			return;
		}

		const player = await Player.create(req.body);
		res.status(201).json({success: true, data: player});
	} catch (error: any) {
		if (error.name === 'ValidationError') {
			const messages = Object.values(error.errors).map((val: any) => val.message);
			res.status(400).json({success: false, error: messages});
		} else {
			res.status(500).json({success: false, error: 'Server Error'});
		}
	}
};

// Update player
export const updatePlayer = async (req: Request, res: Response): Promise<void> => {
	try {
		const player = await Player.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!player) {
			res.status(404).json({success: false, error: 'Player not found'});
			return;
		}

		res.status(200).json({success: true, data: player});
	} catch (error: any) {
		if (error.name === 'ValidationError') {
			const messages = Object.values(error.errors).map((val: any) => val.message);
			res.status(400).json({success: false, error: messages});
		} else {
			res.status(500).json({success: false, error: 'Server Error'});
		}
	}
};

// Delete player
export const deletePlayer = async (req: Request, res: Response): Promise<void> => {
	try {
		const player = await Player.findById(req.params.id);

		if (!player) {
			res.status(404).json({success: false, error: 'Player not found'});
			return;
		}

		await player.deleteOne();
		res.status(200).json({success: true, data: {}});
	} catch (error) {
		res.status(500).json({success: false, error: 'Server Error'});
	}
};
