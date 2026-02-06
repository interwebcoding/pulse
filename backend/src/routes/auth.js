import express from 'express';
import passport from 'passport';
import { getQuery, runQuery, allQuery } from '../models/database.js';

const router = express.Router();

// Check authentication status
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      authenticated: true,
      user: req.user
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Google OAuth login
router.get('/google', 
  passport.authenticate('google', {
    scope: [
      'profile', 
      'email',
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/webmasters.readonly'
    ]
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google' }),
  (req, res) => {
    // Redirect to frontend after successful auth
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard`);
  }
);

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy();
    res.json({ success: true });
  });
});

// Get user settings
router.get('/settings', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const settings = getQuery(
    'SELECT settings FROM dashboard_settings WHERE user_id = ?',
    [req.user.id]
  );
  
  res.json({ 
    settings: settings ? JSON.parse(settings.settings || '{}') : {} 
  });
});

// Update user settings
router.post('/settings', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { settings } = req.body;
  
  const existing = getQuery(
    'SELECT * FROM dashboard_settings WHERE user_id = ?',
    [req.user.id]
  );
  
  if (existing) {
    runQuery(
      'UPDATE dashboard_settings SET settings = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [JSON.stringify(settings), req.user.id]
    );
  } else {
    runQuery(
      'INSERT INTO dashboard_settings (user_id, settings) VALUES (?, ?)',
      [req.user.id, JSON.stringify(settings)]
    );
  }
  
  res.json({ success: true });
});

export default router;
