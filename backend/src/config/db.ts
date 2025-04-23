import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import { config } from './index'
dotenv.config()

export const dbService = {
	getCollection
}

var dbConn: any = null

async function getCollection(collectionName: string) {
	const db = await _connect()
	const collection = await db.collection(collectionName)
	return collection
}

async function _connect(): Promise<any> {
	if (dbConn) return dbConn
	try {
		const conn = await MongoClient.connect(config.dbURL)
		console.log('Connected to MongoDB')
		const db = conn.db(config.dbName)
		dbConn = db
		return db
	} catch (error) {
		console.error(`MongoDB connection error: ${error}`)
		process.exit(1)
	}
}
