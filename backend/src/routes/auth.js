import express from 'express';
import { get, run } from '../models/database.js';

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:9090';

// Check authentication status
router.get('/me', (req, res) => {
  try {
    console.log('Auth check - session:', req.session?.id, 'user:', req.session?.user);
    
    if (req.session && req.session.user) {
      res.json({ 
        authenticated: true,
        user: req.session.user
      });
      return;
    }
    
    res.json({ authenticated: false });
  } catch (error) {
    console.error('Auth check error:', error);
    res.json({ authenticated: false });
  }
});

// Google OAuth login
router.get('/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('⚠️  Google OAuth not configured - using dev mode');
    res.json({
      message: 'OAuth not configured',
      devMode: true,
      setup: 'Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env'
    });
    return;
  }
  
  res.redirect(`${FRONTEND_URL}/dashboard.html`);
});

// Google OAuth callback
router.get('/google/callback', (req, res) => {
  if (req.query.dev === 'true' || !process.env.GOOGLE_CLIENT_ID) {
    res.redirect(`${FRONTEND_URL}/dashboard.html?dev=true`);
    return;
  }
  
  res.redirect(`${FRONTEND_URL}/dashboard.html`);
});

// Dev login - for testing without Google OAuth
router.post('/dev-login', async (req, res) => {
  try {
    console.log('Dev login called');
    
    const existingUser = await get('SELECT * FROM users WHERE id = ?', ['dev-user-123']);
    
    if (!existingUser) {
      await run(`
        INSERT INTO users (id, email, name, picture)
        VALUES (?, ?, ?, ?)
      `, ['dev-user-123', 'dev@example.com', 'Development User', null]);
    }
    
    req.session.user = {
      id: 'dev-user-123',
      email: 'dev@example.com',
      name: 'Development User'
    };
    
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Session save failed' });
      }
      
      console.log('Dev login success - session ID:', req.session.id);
      
      res.json({ 
        success: true, 
        user: req.session.user,
        redirect: `${FRONTEND_URL}/dashboard.html`
      });
    });
  } catch (error) {
    console.error('Dev login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  console.log('Logout called');
  req.session?.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

export default router;
