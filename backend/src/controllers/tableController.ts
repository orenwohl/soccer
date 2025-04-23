import {Request, Response} from 'express';
import Match from '../models/Match';
import generateLeagueTable from '../utils/leagueTableGenerator';

// Get the current league table
export const getLeagueTable = async (req: Request, res: Response): Promise<void> => {
	try {
		// Get all completed matches
		const matches = await Match.find({isCompleted: true});

		// Generate the league table
		const leagueTable = generateLeagueTable(matches);

		res.status(200).json({
			success: true,
			data: leagueTable,
			count: leagueTable.teams.length,
		});
	} catch (error) {
		res.status(500).json({success: false, error: 'Server Error'});
	}
};
