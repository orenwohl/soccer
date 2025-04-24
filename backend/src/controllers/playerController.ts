import {Request, Response} from 'express';
import {IPlayer} from '../models/Player';
import {dbService} from '../config/db';
import {ObjectId} from 'mongodb';

// Get all players
export const getAllPlayers = async (req: Request, res: Response): Promise<void> => {
	try {
		const collection = await dbService.getCollection('players');
		const players = await collection.find().sort({name: 1}).toArray();
		res.status(200).json({success: true, count: players.length, data: players});
	} catch (error) {
		res.status(500).json({success: false, error: 'Server Error'});
	}
};

// Get single player
export const getPlayer = async (req: Request, res: Response): Promise<void> => {
	try {
		const collection = await dbService.getCollection('players');
		const player = await collection.findOne({_id: new ObjectId(req.params.id)});

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
		const collection = await dbService.getCollection('players');

		const result = await collection.insertOne(req.body);
		const player = await collection.findOne({_id: result.insertedId});

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
		const collection = await dbService.getCollection('players');

		const updatedPlayer = await collection.findOneAndUpdate(
			{_id: new ObjectId(req.params.id)},
			{$set: req.body},
			{returnDocument: 'after'}
		);

		if (!updatedPlayer.value) {
			res.status(404).json({success: false, error: 'Player not found'});
			return;
		}

		res.status(200).json({success: true, data: updatedPlayer.value});
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
		const collection = await dbService.getCollection('players');

		const player = await collection.findOne({_id: new ObjectId(req.params.id)});

		if (!player) {
			res.status(404).json({success: false, error: 'Player not found'});
			return;
		}

		await collection.deleteOne({_id: new ObjectId(req.params.id)});
		res.status(200).json({success: true, data: {}});
	} catch (error) {
		res.status(500).json({success: false, error: 'Server Error'});
	}
};
