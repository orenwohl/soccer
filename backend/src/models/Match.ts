import { z } from 'zod'
import { validate } from '../utils/schemaValidator'
import { ObjectId } from 'mongodb'

export interface TeamPlayer {
	playerId: string | ObjectId
	name: string
	rating: number
}

export interface Team {
	name: string
	players: TeamPlayer[]
	averageRating: number
	score: number
	color?: string
}

export interface GameResult {
	_id?: string
	team1: string
	team2: string
	team1Score: number
	team2Score: number
	date: Date
	winner: string | null
}

export interface TeamStat {
	teamId: string
	teamName: string
	played: number
	won: number
	drawn: number
	lost: number
	goalsFor: number
	goalsAgainst: number
}

export interface IMatch {
	_id?: string
	date: Date
	location: string
	teams: Team[]
	gameResults: GameResult[]
	statistics: TeamStat[]
	isCompleted: boolean
	user?: string | ObjectId
	createdAt: Date
	updatedAt: Date
}

// Define Zod schemas for validation
const TeamPlayerSchema = z.object({
	playerId: z.string().or(z.instanceof(ObjectId)),
	name: z.string().min(1, 'Player name is required'),
	rating: z.number().min(1, 'Rating is required')
})

const TeamSchema = z.object({
	name: z.string().min(1, 'Team name is required'),
	players: z.array(TeamPlayerSchema),
	averageRating: z.number(),
	score: z.number().default(0),
	color: z.string().default('#9ca3af')
})

const GameResultSchema = z.object({
	_id: z.string().optional(),
	team1: z.string().min(1, 'Team 1 name is required'),
	team2: z.string().min(1, 'Team 2 name is required'),
	team1Score: z.number().int(),
	team2Score: z.number().int(),
	date: z.date().default(() => new Date()),
	winner: z.string().nullable().default(null)
})

const TeamStatSchema = z.object({
	teamId: z.string().min(1, 'Team ID is required'),
	teamName: z.string().min(1, 'Team name is required'),
	played: z.number().int().default(0),
	won: z.number().int().default(0),
	drawn: z.number().int().default(0),
	lost: z.number().int().default(0),
	goalsFor: z.number().int().default(0),
	goalsAgainst: z.number().int().default(0)
})

export const MatchSchema = z.object({
	date: z.date(),
	location: z.string().min(1, 'Location is required'),
	teams: z.array(TeamSchema).default([]),
	gameResults: z.array(GameResultSchema).default([]),
	statistics: z.array(TeamStatSchema).default([]),
	isCompleted: z.boolean().default(false),
	user: z.string().or(z.instanceof(ObjectId)).optional(),
	createdAt: z
		.date()
		.optional()
		.default(() => new Date()),
	updatedAt: z
		.date()
		.optional()
		.default(() => new Date())
})

export type MatchInput = z.infer<typeof MatchSchema>

// Helper function
export const validateMatch = (matchData: MatchInput): MatchInput => {
	return validate(matchData, MatchSchema)
}

export default {
	validate: validateMatch
}
