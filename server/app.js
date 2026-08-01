import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import githubRoutes from './routes/githubRoutes.js';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Apply Global Middlewares
app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
  res.send('GitHub Explorer Backend API is running...');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api', githubRoutes);

// Catch-all route for unmatched paths
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Resource endpoint not found' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
