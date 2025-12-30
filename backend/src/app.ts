import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import chatRoutes from './routes/chat.routes';
import conversationRoutes from './routes/conversation.routes';

// Load environment variables
dotenv.config();

const app: Express = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
