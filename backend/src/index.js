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

// Debug logging
console.log(`Frontend URL: ${FRONTEND_URL}`);

// CORS with credentials
app.use(cors({
  origin: FRONTEND_URL,
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
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Debug middleware to log sessions
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log(`  Session ID: ${req.session?.id}`);
  console.log(`  Session user: ${JSON.stringify(req.session?.user)}`);
  next();
});

// Dynamic imports for routes
app.use('/api/auth', (await import('./routes/auth.js')).default);
app.use('/api/sites', (await import('./routes/sites.js')).default);
app.use('/api/analytics', (await import('./routes/analytics.js')).default);
app.use('/api/searchconsole', (await import('./routes/searchconsole.js')).default);
app.use('/api/dashboard', (await import('./routes/dashboard.js')).default);

// Health check - no auth required
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
    cookies: req.cookies,
    signedCookies: req.signedCookies
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Initialize database and start server
async function start() {
  try {
    const { initDatabase } = await import('./models/database.js');
    await initDatabase();
    console.log('✅ Database initialized');

    app.listen(PORT, () => {
      console.log(`🚀 pulse API running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
