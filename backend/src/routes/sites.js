import express from 'express';
import { all, run, get } from '../models/database.js';

const router = express.Router();

// Middleware to require auth
function requireAuth(req, res, next) {
  const isAuthenticated = req.user || (req.session && req.session.user);
  
  if (!isAuthenticated) {
    return res.status(401).json({ error: 'Unauthorized - Please log in' });
  }
  next();
}

// Get all sites for user
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.session.user?.id;
    const sites = await all(`
      SELECT * FROM sites 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);
    
    res.json({ sites });
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

// Get single site
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.session.user?.id;
    const site = await get(`
      SELECT * FROM sites 
      WHERE id = ? AND user_id = ?
    `, [req.params.id, userId]);
    
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
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, url, property_id, account_type, category } = req.body;
    const userId = req.user?.id || req.session.user?.id;
    
    console.log('Creating site with:', { userId, name, url, property_id, account_type, category });
    
    await run(`
      INSERT INTO sites (user_id, name, url, property_id, account_type, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, name, url, property_id, account_type || 'silvertubes', category || 'client']);
    
    // Get the newly inserted site by user_id and name
    const site = await get(`
      SELECT * FROM sites 
      WHERE user_id = ? AND name = ?
    `, [userId, name]);
    
    console.log('Created site:', site);
    res.status(201).json({ site: site });
  } catch (error) {
    console.error('Error creating site:', error);
    res.status(500).json({ error: 'Failed to create site: ' + error.message });
  }
});

// Update site
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, url, property_id, account_type, category, settings } = req.body;
    const userId = req.user?.id || req.session.user?.id;
    
    await run(`
      UPDATE sites 
      SET name = ?, url = ?, property_id = ?, account_type = ?, category = ?, settings = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [name, url, property_id, account_type, category, JSON.stringify(settings || {}), req.params.id, userId]);
    
    const site = await get('SELECT * FROM sites WHERE id = ?', [req.params.id]);
    
    res.json({ site });
  } catch (error) {
    console.error('Error updating site:', error);
    res.status(500).json({ error: 'Failed to update site' });
  }
});

// Delete site
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.session.user?.id;
    
    const result = await run(`
      DELETE FROM sites WHERE id = ? AND user_id = ?
    `, [req.params.id, userId]);
    
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
router.get('/summary/all', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.session.user?.id;
    const sites = await all(`
      SELECT id, name, url, category, account_type 
      FROM sites 
      WHERE user_id = ?
      ORDER BY name
    `, [userId]);
    
    res.json({ sites });
  } catch (error) {
    console.error('Error fetching sites summary:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

export default router;
