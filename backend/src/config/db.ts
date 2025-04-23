import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/neighborhood-football';

const connectDB = async (): Promise<void> => {
	try {
		const conn = await mongoose.connect(process.env.MONGODB_URI as string);

		// Only in development mode, reset the collections with changed schemas
		if (process.env.NODE_ENV === 'development' && process.env.RESET_DB === 'true') {
			console.log('Resetting matches collection...');
			await mongoose.connection.collections['matches']?.drop();
		}

		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`MongoDB connection error: ${error}`);
		process.exit(1);
	}
};

export default connectDB;
