import {Request, Response} from 'express';
import {dbService} from '../config/db';
import {ObjectId} from 'mongodb';
import generateBalancedTeams from '../utils/teamGenerator';

// Get all matches
export const getAllMatches = async (req: Request, res: Response): Promise<void> => {
	try {
		const collection = await dbService.getCollection('matches');
		// Get all matches since req.user is undefined
		const matches = await collection.find().sort({date: -1}).toArray();
		res.status(200).json({success: true, count: matches.length, data: matches});
	} catch (error) {
		res.status(500).json({success: false, error: 'Server Error'});
	}
};

// Get single match
export const getMatch = async (req: Request, res: Response): Promise<void> => {
	try {
		console.log('getMatch: Request params:', req.params);
		console.log('getMatch: User info:', req.user);

		const collection = await dbService.getCollection('matches');
		const match = await collection.findOne({_id: new ObjectId(req.params.id)});

		console.log('getMatch: Match found:', match ? 'Yes' : 'No');
		if (match && match.user) {
			console.log('getMatch: Match has user field:', match.user);
		}

		if (!match) {
			res.status(404).json({success: false, error: 'Match not found'});
			return;
		}

		// Make sure user owns the match, but only if the user field exists
		if (match.user && (!req.user || match.user.toString() !== req.user.id)) {
			console.log(
				'getMatch: Auth failed - match.user:',
				match.user.toString(),
				'req.user.id:',
				req.user ? req.user.id : 'undefined'
			);
			res.status(401).json({
				success: false,
				error: 'Not authorized to access this match',
			});
			return;
		}

		res.status(200).json({success: true, data: match});
	} catch (error) {
		console.error('getMatch error:', error);
		res.status(500).json({success: false, error: 'Server Error'});
	}
};

// Create new match
export const createMatch = async (req: Request, res: Response): Promise<void> => {
	try {
		console.log('Creating match, request body:', req.body);
		console.log('User info:', req.user);

		// Check if user is authenticated
		if (!req.user) {
			res.status(401).json({success: false, error: 'Authentication required'});
			return;
		}

		const collection = await dbService.getCollection('matches');

		// Add user to request body
		req.body.user = new ObjectId(req.user.id);

		const result = await collection.insertOne(req.body);
		const match = await collection.findOne({_id: result.insertedId});

		res.status(201).json({success: true, data: match});
	} catch (error: any) {
		console.error('Create match error:', error);
		if (error.name === 'ValidationError') {
			const messages = Object.values(error.errors).map((val: any) => val.message);
			res.status(400).json({success: false, error: messages});
		} else {
			res.status(500).json({success: false, error: 'Server Error'});
		}
	}
};

// Update match
export const updateMatch = async (req: Request, res: Response): Promise<void> => {
	try {
		const collection = await dbService.getCollection('matches');
		let match = await collection.findOne({_id: new ObjectId(req.params.id)});

		if (!match) {
			res.status(404).json({success: false, error: 'Match not found'});
			return;
		}

		// Make sure user owns the match, but only if the user field exists
		if (match.user && match.user.toString() !== req.user.id) {
			res.status(401).json({
				success: false,
				error: 'Not authorized to update this match',
			});
			return;
		}

		// Assign user if not already set
		if (!match.user) {
			req.body.user = new ObjectId(req.user.id);
		}

		const updatedMatch = await collection.findOneAndUpdate(
			{_id: new ObjectId(req.params.id)},
			{$set: req.body},
			{returnDocument: 'after'}
		);

		res.status(200).json({success: true, data: updatedMatch.value});
	} catch (error: any) {
		if (error.name === 'ValidationError') {
			const messages = Object.values(error.errors).map((val: any) => val.message);
			res.status(400).json({success: false, error: messages});
		} else {
			res.status(500).json({success: false, error: 'Server Error'});
		}
	}
};

// Delete match
export const deleteMatch = async (req: Request, res: Response): Promise<void> => {
	try {
		const collection = await dbService.getCollection('matches');
		const match = await collection.findOne({_id: new ObjectId(req.params.id)});

		if (!match) {
			res.status(404).json({success: false, error: 'Match not found'});
			return;
		}

		// Make sure user owns the match, but only if the user field exists
		if (match.user && match.user.toString() !== req.user.id) {
			res.status(401).json({
				success: false,
				error: 'Not authorized to delete this match',
			});
			return;
		}

		await collection.deleteOne({_id: new ObjectId(req.params.id)});
		res.status(200).json({success: true, data: {}});
	} catch (error) {
		res.status(500).json({success: false, error: 'Server Error'});
	}
};

// Generate balanced teams
export const generateTeams = async (req: Request, res: Response): Promise<void> => {
	try {
		// Extract parameters from request body
		const {playerIds, numberOfTeams = 2, teamNames} = req.body;
		const playersCollection = await dbService.getCollection('players');

		if (!playerIds || !Array.isArray(playerIds) || playerIds.length < numberOfTeams * 2) {
			res.status(400).json({
				success: false,
				error: `Need at least ${numberOfTeams * 2} players to generate ${numberOfTeams} teams`,
			});
			return;
		}

		// Convert string IDs to ObjectId
		const objectIds = playerIds.map((id) => new ObjectId(id));

		// Get player details from database - only for players belonging to the current user
		const players = await playersCollection
			.find({
				_id: {$in: objectIds},
				user: new ObjectId(req.user.id),
			})
			.toArray();

		// Check if all players belong to the current user
		if (players.length !== playerIds.length) {
			res.status(401).json({
				success: false,
				error: 'You can only use players you created',
			});
			return;
		}

		// Generate balanced teams
		const teams = generateBalancedTeams(players, numberOfTeams, teamNames);

		// Format response data
		const responseTeams = teams.map((team) => ({
			name: team.name,
			players: team.players,
			averageRating: team.averageRating,
			score: 0,
		}));

		res.status(200).json({success: true, data: responseTeams});
	} catch (error) {
		res.status(500).json({success: false, error: 'Server Error'});
	}
};

// Add game result to a match
export const saveGameResult = async (req: Request, res: Response): Promise<void> => {
	try {
		const matchId = req.params.id;
		const gameResult = req.body;
		const collection = await dbService.getCollection('matches');

		const match = await collection.findOne({_id: new ObjectId(matchId)});
		if (!match) {
			res.status(404).json({success: false, error: 'Match not found'});
			return;
		}

		// Make sure user owns the match, but only if the user field exists
		if (match.user && match.user.toString() !== req.user.id) {
			res.status(401).json({
				success: false,
				error: 'Not authorized to update this match',
			});
			return;
		}

		// Initialize gameResults array if it doesn't exist
		if (!match.gameResults) {
			match.gameResults = [];
		}

		// Add the new game result with an ID
		const newGameResult = {
			...gameResult,
			_id: new ObjectId().toString(),
			date: new Date(),
		};

		// Add the new game result
		match.gameResults.push(newGameResult);

		// Assign user if not already set
		if (!match.user) {
			match.user = new ObjectId(req.user.id);
		}

		// Update the document in MongoDB
		await collection.updateOne(
			{_id: new ObjectId(matchId)},
			{
				$set: {
					gameResults: match.gameResults,
					user: match.user,
					updatedAt: new Date(),
				},
			}
		);

		res.status(200).json({
			success: true,
			data: match,
			message: 'Game result added successfully',
		});
	} catch (error) {
		console.error('Error adding game result:', error);
		res.status(500).json({success: false, error: 'Failed to add game result'});
	}
};

// Update a specific match result
export const updateGameResult = async (req: Request, res: Response): Promise<void> => {
	try {
		const matchId = req.params.id;
		const gameResultId = req.params.matchId;
		const {team1Score, team2Score} = req.body;
		const collection = await dbService.getCollection('matches');

		const match = await collection.findOne({_id: new ObjectId(matchId)});
		if (!match) {
			res.status(404).json({success: false, error: 'Match not found'});
			return;
		}

		// Make sure user owns the match, but only if the user field exists
		if (match.user && match.user.toString() !== req.user.id) {
			res.status(401).json({
				success: false,
				error: 'Not authorized to update this match',
			});
			return;
		}

		// Find the game result by ID
		const gameResultIndex = match.gameResults.findIndex((result: any) => result._id.toString() === gameResultId);

		if (gameResultIndex === -1) {
			res.status(404).json({success: false, error: 'Game result not found'});
			return;
		}

		const gameResult = match.gameResults[gameResultIndex];

		// Update scores
		gameResult.team1Score = team1Score;
		gameResult.team2Score = team2Score;

		// Update winner
		if (team1Score > team2Score) {
			gameResult.winner = gameResult.team1;
		} else if (team2Score > team1Score) {
			gameResult.winner = gameResult.team2;
		} else {
			gameResult.winner = null; // draw
		}

		// Update the match with the modified game result
		match.gameResults[gameResultIndex] = gameResult;

		// Update the document in MongoDB
		await collection.updateOne(
			{_id: new ObjectId(matchId)},
			{
				$set: {
					gameResults: match.gameResults,
					updatedAt: new Date(),
				},
			}
		);

		res.status(200).json({
			success: true,
			data: match,
			message: 'Game result updated successfully',
		});
	} catch (error) {
		console.error('Error updating game result:', error);
		res.status(500).json({success: false, error: 'Failed to update game result'});
	}
};

// Save match statistics
export const saveStatistics = async (req: Request, res: Response): Promise<void> => {
	try {
		const matchId = req.params.id;
		const {statistics} = req.body;
		const collection = await dbService.getCollection('matches');

		const match = await collection.findOne({_id: new ObjectId(matchId)});
		if (!match) {
			res.status(404).json({success: false, error: 'Match not found'});
			return;
		}

		// Make sure user owns the match
		if (match.user && match.user.toString() !== req.user.id) {
			res.status(401).json({
				success: false,
				error: 'Not authorized to update this match',
			});
			return;
		}

		// Update the document in MongoDB
		await collection.updateOne(
			{_id: new ObjectId(matchId)},
			{
				$set: {
					statistics: statistics,
					updatedAt: new Date(),
				},
			}
		);

		// Get the updated match
		const updatedMatch = await collection.findOne({_id: new ObjectId(matchId)});

		res.status(200).json({
			success: true,
			data: updatedMatch,
			message: 'Statistics saved successfully',
		});
	} catch (error) {
		console.error('Error saving statistics:', error);
		res.status(500).json({success: false, error: 'Failed to save statistics'});
	}
};

// Save team statistics
export const saveTeamStats = async (req: Request, res: Response): Promise<void> => {
	try {
		const matchId = req.params.id;
		const {teamStats} = req.body;
		const collection = await dbService.getCollection('matches');

		const match = await collection.findOne({_id: new ObjectId(matchId)});
		if (!match) {
			res.status(404).json({success: false, error: 'Match not found'});
			return;
		}

		// Make sure user owns the match
		if (match.user && match.user.toString() !== req.user.id) {
			res.status(401).json({
				success: false,
				error: 'Not authorized to update this match',
			});
			return;
		}

		// Map teamStats to match the TeamStatSchema structure
		const formattedStats = teamStats.map((stat: any) => ({
			teamId: stat.teamId,
			teamName: stat.teamName || stat.teamId,
			played: stat.played || 0,
			won: stat.wins || 0,
			drawn: stat.draws || 0,
			lost: stat.losses || 0,
			goalsFor: stat.goalsFor || 0,
			goalsAgainst: stat.goalsAgainst || 0,
		}));

		// Add user ID if it doesn't exist (for backward compatibility with existing records)
		const userField = match.user ? match.user : new ObjectId(req.user.id);

		// Update the document in MongoDB
		await collection.updateOne(
			{_id: new ObjectId(matchId)},
			{
				$set: {
					statistics: formattedStats,
					user: userField,
					updatedAt: new Date(),
				},
			}
		);

		// Get the updated match
		const updatedMatch = await collection.findOne({_id: new ObjectId(matchId)});

		res.status(200).json({
			success: true,
			data: updatedMatch,
			message: 'Team statistics saved successfully',
		});
	} catch (error) {
		console.error('Error saving team statistics:', error);
		res.status(500).json({success: false, error: 'Failed to save team statistics'});
	}
};

// Get match statistics
export const getMatchStatistics = async (req: Request, res: Response): Promise<void> => {
	try {
		const matchId = req.params.id;
		const collection = await dbService.getCollection('matches');

		const match = await collection.findOne({_id: new ObjectId(matchId)});
		if (!match) {
			res.status(404).json({success: false, error: 'Match not found'});
			return;
		}

		// Make sure user owns the match, but only check if the user field exists
		// This allows backward compatibility with existing records
		if (match.user && match.user.toString() !== req.user.id) {
			res.status(401).json({
				success: false,
				error: 'Not authorized to access this match',
			});
			return;
		}

		// Return the statistics array
		res.status(200).json({
			success: true,
			data: {
				statistics: match.statistics || [],
				gameResults: match.gameResults || [],
			},
		});
	} catch (error) {
		console.error('Error fetching match statistics:', error);
		res.status(500).json({success: false, error: 'Failed to fetch match statistics'});
	}
};

// Add a goal for a player
export const addGoal = async (req: Request, res: Response): Promise<void> => {
	try {
		const matchId = req.params.id;
		const goalData = req.body;
		const collection = await dbService.getCollection('matches');

		const match = await collection.findOne({_id: new ObjectId(matchId)});
		if (!match) {
			res.status(404).json({success: false, error: 'Match not found'});
			return;
		}

		// Make sure user owns the match
		if (match.user && match.user.toString() !== req.user.id) {
			res.status(401).json({
				success: false,
				error: 'Not authorized to update this match',
			});
			return;
		}

		// Initialize goals array if it doesn't exist
		if (!match.goals) {
			match.goals = [];
		}

		// Add timestamp and ID to the goal data
		const newGoal = {
			...goalData,
			_id: new ObjectId().toString(),
			timestamp: new Date(),
			matchId: matchId,
			gameDayId: matchId,
		};

		// Add the new goal
		match.goals.push(newGoal);

		// Update the document in MongoDB
		await collection.updateOne(
			{_id: new ObjectId(matchId)},
			{
				$set: {
					goals: match.goals,
					updatedAt: new Date(),
				},
			}
		);

		res.status(200).json({
			success: true,
			data: newGoal,
			message: 'Goal added successfully',
		});
	} catch (error) {
		console.error('Error adding goal:', error);
		res.status(500).json({success: false, error: 'Failed to add goal'});
	}
};
