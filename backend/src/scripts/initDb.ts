import mongoose from 'mongoose';
import '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/neighborhood-football';

async function initDatabase() {
	try {
		console.log('Connecting to MongoDB...');
		await mongoose.connect(MONGODB_URI);
		console.log(`MongoDB Connected: ${mongoose.connection.host}`);

		// Create a test user to initialize the users collection
		const UserModel = mongoose.model('User');

		// Check if users collection already has documents
		const userCount = await UserModel.countDocuments();
		console.log(`Current user count: ${userCount}`);

		if (userCount === 0) {
			console.log('Creating test user...');
			const testUser = new UserModel({
				name: 'Test User',
				email: 'test@example.com',
				password: 'password123',
			});

			await testUser.save();
			console.log('Test user created successfully');
		} else {
			console.log('Users already exist in the database');
		}

		console.log('Database initialization complete');
	} catch (error) {
		console.error('Database initialization error:', error);
	} finally {
		await mongoose.disconnect();
		console.log('Database connection closed');
	}
}

initDatabase();
