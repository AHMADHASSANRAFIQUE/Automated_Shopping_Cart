import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import authRoutes from './routes/auth.js';
import groceryListRoutes from './routes/groceryLists.js';
import receiptRoutes from './routes/receipts.js';
import configRoutes from './routes/config.js';
import sessionRoutes from './routes/sessions.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Configure Express "trust proxy" to allow correct IP extraction behind proxies/load-balancers
const defaultTrust = process.env.NODE_ENV === 'production' ? 'true' : 'false';
const trustProxyEnv = typeof process.env.TRUST_PROXY !== 'undefined' ? process.env.TRUST_PROXY : defaultTrust;
const trustProxyValue = (trustProxyEnv === 'true' || trustProxyEnv === '1') ? true : (trustProxyEnv === 'false' ? false : trustProxyEnv);
app.set('trust proxy', trustProxyValue);

// Security middleware
app.use(helmet());

// Rate limiting
const rateLimitKeySource = process.env.RATE_LIMIT_KEY_SOURCE || 'auto';
let keyGenerator;
if (rateLimitKeySource && rateLimitKeySource.toLowerCase().startsWith('header:')) {
  const headerName = rateLimitKeySource.slice('header:'.length).trim().toLowerCase();
  keyGenerator = (req) => (req.headers && (req.headers[headerName] || req.headers[headerName.toLowerCase()])) || req.ip;
} else if (rateLimitKeySource === 'ip') {
  keyGenerator = (req) => req.ip;
} else if (rateLimitKeySource === 'x-real-ip') {
  keyGenerator = (req) => req.headers && (req.headers['x-real-ip'] || req.headers['x-real-ip'.toLowerCase()]) || req.ip;
} else {
  const trustProxy = app.get('trust proxy');
  if (trustProxy) {
    keyGenerator = (req) => req.ip;
  } else {
    keyGenerator = (req) => (req.headers && (req.headers['x-real-ip'] || req.headers['x-real-ip'.toLowerCase()])) || req.ip;
  }
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this client, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  throw error;
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/grocery-lists', groceryListRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/config', configRoutes);
app.use('/api/sessions', sessionRoutes);

// Health check endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'Florland Voice Service is Online',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((error, req, res, _next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} (0.0.0.0)`);
});