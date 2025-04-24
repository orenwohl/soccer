import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import playerRoutes from './routes/players';
import matchRoutes from './routes/matches';
import tableRoutes from './routes/table';
import authRoutes from './routes/auth';
import path from 'path';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS Configuration
const corsOptions = {
	origin:
		process.env.NODE_ENV === 'production'
			? ['https://yourproductiondomain.com'] // Replace with your production domain
			: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3030', 'http://127.0.0.1:3030'],
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.resolve('public')));
}

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/table', tableRoutes);

// Default route
app.get('/', (req, res) => {
	res.json({message: 'Welcome to Neighborhood Football API'});
});

// Port configuration
const PORT = process.env.PORT || 3030;

// Start server
const server = app.listen(PORT, () => {
	console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
	console.log(`Error: ${err.message}`);
	// Close server & exit process
	server.close(() => process.exit(1));
});
