import mongoose, {Document, Schema} from 'mongoose';

interface TeamPlayer {
	playerId: mongoose.Types.ObjectId;
	name: string;
	rating: number;
}

interface Team {
	name: string;
	players: TeamPlayer[];
	averageRating: number;
	score: number;
	color?: string;
}

export interface IMatch extends Document {
	date: Date;
	location: string;
	teams: Team[];
	gameResults: any[];
	statistics: any[];
	isCompleted: boolean;
	user: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const TeamPlayerSchema: Schema = new Schema({
	playerId: {
		type: Schema.Types.ObjectId,
		ref: 'Player',
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	rating: {
		type: Number,
		required: true,
	},
});

const TeamSchema: Schema = new Schema({
	name: {
		type: String,
		required: true,
	},
	players: [TeamPlayerSchema],
	averageRating: {
		type: Number,
		required: true,
	},
	score: {
		type: Number,
		default: 0,
	},
	color: {
		type: String,
		default: '#9ca3af',
	},
});

// Game result schema
const GameResultSchema: Schema = new Schema(
	{
		team1: {
			type: String,
			required: true,
		},
		team2: {
			type: String,
			required: true,
		},
		team1Score: {
			type: Number,
			required: true,
		},
		team2Score: {
			type: Number,
			required: true,
		},
		date: {
			type: Date,
			default: Date.now,
		},
		winner: {
			type: String,
			default: null,
		},
	},
	{_id: true}
);

// Team statistics schema
const TeamStatSchema: Schema = new Schema(
	{
		teamId: {
			type: String,
			required: true,
		},
		teamName: {
			type: String,
			required: true,
		},
		played: {
			type: Number,
			default: 0,
		},
		won: {
			type: Number,
			default: 0,
		},
		drawn: {
			type: Number,
			default: 0,
		},
		lost: {
			type: Number,
			default: 0,
		},
		goalsFor: {
			type: Number,
			default: 0,
		},
		goalsAgainst: {
			type: Number,
			default: 0,
		},
	},
	{_id: false}
);

const MatchSchema: Schema = new Schema(
	{
		date: {
			type: Date,
			required: [true, 'Please provide match date'],
		},
		location: {
			type: String,
			required: [true, 'Please provide match location'],
		},
		teams: [TeamSchema],
		gameResults: [GameResultSchema],
		statistics: [TeamStatSchema],
		isCompleted: {
			type: Boolean,
			default: false,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: false,
		},
	},
	{timestamps: true}
);

export default mongoose.model<IMatch>('Match', MatchSchema);
