import 'express-async-errors';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/logger.js';
import { initializeDatabase } from './infrastructure/database/init.js';
import { inventoryRoutes } from './domains/inventory/routes.js';
import { publicInventoryRoutes } from './domains/inventory/public-routes.js';
import { salesRoutes } from './domains/sales/routes.js';
import { receiptsRoutes } from './domains/receipts/routes.js';
import { invoicesRoutes } from './domains/invoices/routes.js';
import { authRoutes } from './domains/auth/routes.js';
import { customerRoutes } from './domains/customers/routes.js';
import { messageRoutes } from './domains/messages/routes.js';
import { settingsRoutes } from './domains/settings/routes.js';

const app = express();

// Middleware
app.use(cors({ 
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory/public', publicInventoryRoutes); // Public inventory routes (no auth)
app.use('/api/inventory', inventoryRoutes); // Authenticated inventory routes
app.use('/api/sales', salesRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database (will continue even if it fails)
    await initializeDatabase();
    
    const port = parseInt(process.env.PORT || '4000', 10);
    app.listen(port, () => {
      console.log(`🚀 TrackNest Enterprise Backend running on http://localhost:${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`🔗 Frontend origin: ${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}`);
      console.log('💡 Note: Some features may not work without a proper database connection.');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();


