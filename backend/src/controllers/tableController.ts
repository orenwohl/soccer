import { Request, Response } from 'express'
import { dbService } from '../config/db'
import generateLeagueTable from '../utils/leagueTableGenerator'
import { TeamStat } from '../models/Match'

// Get the league table
export const getTable = async (req: Request, res: Response): Promise<void> => {
	try {
		const collection = await dbService.getCollection('matches')

		// Get all matches with completed games
		const matches = await collection.find({ gameResults: { $exists: true, $not: { $size: 0 } } }).toArray()

		// Process matches to create a table using the generator function
		const leagueTable = generateLeagueTable(matches)

		res.status(200).json({
			success: true,
			data: leagueTable
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			error: 'Server Error'
		})
	}
}
