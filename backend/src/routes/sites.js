import express from 'express';
import { allQuery, runQuery, getQuery } from '../models/database.js';

const router = express.Router();

// Middleware to require auth
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Get all sites for user
router.get('/', requireAuth, (req, res) => {
  try {
    const sites = allQuery(`
      SELECT * FROM sites 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [req.user.id]);
    
    res.json({ sites });
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

// Get single site
router.get('/:id', requireAuth, (req, res) => {
  try {
    const site = getQuery(`
      SELECT * FROM sites 
      WHERE id = ? AND user_id = ?
    `, [req.params.id, req.user.id]);
    
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    res.json({ site });
  } catch (error) {
    console.error('Error fetching site:', error);
    res.status(500).json({ error: 'Failed to fetch site' });
  }
});

// Add new site
router.post('/', requireAuth, (req, res) => {
  try {
    const { name, url, property_id, account_type, category } = req.body;
    
    const result = runQuery(`
      INSERT INTO sites (user_id, name, url, property_id, account_type, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.user.id, name, url, property_id, account_type || 'silvertubes', category || 'client']);
    
    const site = getQuery('SELECT * FROM sites WHERE id = ?', [result.lastInsertRowid]);
    
    res.status(201).json({ site });
  } catch (error) {
    console.error('Error creating site:', error);
    res.status(500).json({ error: 'Failed to create site' });
  }
});

// Update site
router.put('/:id', requireAuth, (req, res) => {
  try {
    const { name, url, property_id, account_type, category, settings } = req.body;
    
    runQuery(`
      UPDATE sites 
      SET name = ?, url = ?, property_id = ?, account_type = ?, category = ?, settings = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [name, url, property_id, account_type, category, JSON.stringify(settings || {}), req.params.id, req.user.id]);
    
    const site = getQuery('SELECT * FROM sites WHERE id = ?', [req.params.id]);
    
    res.json({ site });
  } catch (error) {
    console.error('Error updating site:', error);
    res.status(500).json({ error: 'Failed to update site' });
  }
});

// Delete site
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const result = runQuery(`
      DELETE FROM sites WHERE id = ? AND user_id = ?
    `, [req.params.id, req.user.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting site:', error);
    res.status(500).json({ error: 'Failed to delete site' });
  }
});

// Get sites summary (for dashboard)
router.get('/summary/all', requireAuth, (req, res) => {
  try {
    const sites = allQuery(`
      SELECT id, name, url, category, account_type 
      FROM sites 
      WHERE user_id = ?
      ORDER BY name
    `, [req.user.id]);
    
    res.json({ sites });
  } catch (error) {
    console.error('Error fetching sites summary:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

export default router;
