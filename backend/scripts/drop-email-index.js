// Script to drop the unique email index from players collection
require('dotenv').config();
const {MongoClient} = require('mongodb');

async function main() {
	// Connection URL from environment variables
	const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
	const dbName = process.env.MONGO_DB_NAME || 'neighborhood-football';

	console.log('Connecting to MongoDB...');
	const client = new MongoClient(uri);

	try {
		await client.connect();
		console.log('Connected to MongoDB');

		const db = client.db(dbName);
		const collection = db.collection('players');

		// Get all indexes
		const indexes = await collection.indexes();
		console.log('Current indexes:', indexes);

		// Find and drop the email index
		const emailIndex = indexes.find((index) => index.key && index.key.email !== undefined);

		if (emailIndex) {
			console.log('Found email index:', emailIndex.name);
			await collection.dropIndex(emailIndex.name);
			console.log('Successfully dropped email index');
		} else {
			console.log('No email index found');
		}

		// Verify indexes after dropping
		const remainingIndexes = await collection.indexes();
		console.log('Remaining indexes:', remainingIndexes);
	} catch (err) {
		console.error('Error:', err);
	} finally {
		await client.close();
		console.log('Disconnected from MongoDB');
	}
}

main().catch(console.error);
