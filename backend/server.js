const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./config/database');
// Import models to ensure associations are loaded
require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const subscriptionRoutes = require('./routes/subscriptions');
const salesRoutes = require('./routes/sales');
const businessRoutes = require('./routes/business');
const paymentRoutes = require('./routes/payments');
const pricingRoutes = require('./routes/pricing');
const communicationRoutes = require('./routes/communications');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging middleware
app.use(morgan('combined'));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'TractNest Pro Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/communications', communicationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection and server start
async function startServer() {
  try {
    console.log('🔄 Starting server initialization...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database (create tables if they don't exist)
    console.log('🔄 Synchronizing database...');
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized successfully.');
    
    // Initialize default data
    console.log('🔄 Initializing default data...');
    await require('./config/initData')();
    console.log('✅ Default data initialized successfully.');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    process.exit(1);
  }
}

startServer();
