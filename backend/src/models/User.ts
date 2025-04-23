import mongoose, {Document, Schema} from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
	name: string;
	email: string;
	password?: string;
	googleId?: string;
	picture?: string;
	createdAt: Date;
	updatedAt: Date;
	generateAuthToken: () => string;
	matchPassword: (enteredPassword: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema(
	{
		name: {
			type: String,
			required: [true, 'Please provide name'],
			trim: true,
		},
		email: {
			type: String,
			required: [true, 'Please provide email'],
			unique: true,
			match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
		},
		password: {
			type: String,
			required: false,
			minlength: 6,
			select: false,
		},
		googleId: {
			type: String,
			required: false,
		},
		picture: {
			type: String,
			required: false,
		},
	},
	{timestamps: true}
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
	if (!this.isModified('password') || !this.password) {
		next();
		return;
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password as string, salt);
	next();
});

// Generate JWT
UserSchema.methods.generateAuthToken = function () {
	return jwt.sign({id: this._id}, process.env.JWT_SECRET || 'secret', {expiresIn: '30d'});
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
	if (!this.password) return false;
	return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
