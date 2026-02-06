// Load environment variables FIRST
import { config } from 'dotenv';
config({ path: new URL('../../.env', import.meta.url).pathname });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Allow multiple origins for development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:9090',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:9090'
];

// CORS with credentials - allow any localhost for dev
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost origins
    if (allowedOrigins.includes(origin) || origin.match(/http:\/\/localhost:\d+/)) {
      return callback(null, true);
    }
    
    // In development, allow any localhost
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'pulse-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  name: 'pulse.sid',
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Dynamic imports for routes
app.use('/api/auth', (await import('./routes/auth.js')).default);
app.use('/api/sites', (await import('./routes/sites.js')).default);
app.use('/api/analytics', (await import('./routes/analytics.js')).default);
app.use('/api/searchconsole', (await import('./routes/searchconsole.js')).default);
app.use('/api/dashboard', (await import('./routes/dashboard.js')).default);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Debug endpoint
app.get('/api/debug/session', (req, res) => {
  res.json({
    sessionID: req.session?.id,
    session: req.session,
    cookies: req.cookies
  });
});

// Error handling
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS not allowed' });
  }
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

async function start() {
  try {
    const { initDatabase } = await import('./models/database.js');
    await initDatabase();
    console.log('✅ Database initialized');

    app.listen(PORT, () => {
      console.log(`🚀 pulse API running on port ${PORT}`);
      console.log(`   Frontend URL: ${FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
