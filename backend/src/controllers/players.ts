import {Request, Response} from 'express';
import {dbService} from '../config/db';
import {ObjectId} from 'mongodb';

// @desc    Get all players
// @route   GET /api/players
// @access  Private
export const getPlayers = async (req: Request, res: Response): Promise<void> => {
	try {
		const collection = await dbService.getCollection('players');
		// Get players that belong to the current user
		const players = await collection.find({user: new ObjectId(req.user.id)}).toArray();

		res.json({
			success: true,
			data: players,
		});
	} catch (error) {
		console.error('Error in getPlayers:', error);
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
		const collection = await dbService.getCollection('players');
		const player = await collection.findOne({_id: new ObjectId(req.params.id)});

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
		const collection = await dbService.getCollection('players');

		// Add user to request body
		req.body.user = new ObjectId(req.user.id);

		const result = await collection.insertOne(req.body);
		const player = await collection.findOne({_id: result.insertedId});

		res.status(201).json({
			success: true,
			data: player,
		});
	} catch (error) {
		console.error('Error creating player:', error);
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
		const collection = await dbService.getCollection('players');
		const player = await collection.findOne({_id: new ObjectId(req.params.id)});

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

		const updatedPlayer = await collection.findOneAndUpdate(
			{_id: new ObjectId(req.params.id)},
			{$set: req.body},
			{returnDocument: 'after'}
		);

		res.json({
			success: true,
			data: updatedPlayer.value,
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
		const collection = await dbService.getCollection('players');
		const player = await collection.findOne({_id: new ObjectId(req.params.id)});

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

		await collection.deleteOne({_id: new ObjectId(req.params.id)});

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
