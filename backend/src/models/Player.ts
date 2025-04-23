import mongoose, {Document, Schema} from 'mongoose';

export interface IPlayer extends Document {
	name: string;
	rating: number;
	email: string;
	phone: string;
	availability: string[];
	user: mongoose.Schema.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const PlayerSchema: Schema = new Schema(
	{
		name: {
			type: String,
			required: [true, 'Please provide player name'],
			trim: true,
		},
		rating: {
			type: Number,
			required: [true, 'Please provide player rating'],
			min: 1,
			max: 10,
		},
		email: {
			type: String,
			required: [true, 'Please provide email'],
			unique: true,
			match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
		},
		phone: {
			type: String,
			required: false,
		},
		availability: {
			type: [String],
			enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
			default: [],
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{timestamps: true}
);

export default mongoose.model<IPlayer>('Player', PlayerSchema);
