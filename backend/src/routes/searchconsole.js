import express from 'express';
import { all, get, run } from '../models/database.js';

const router = express.Router();

// Get all Search Console sites
router.get('/sites', async (req, res) => {
  try {
    const sites = all('SELECT * FROM searchconsole_sites ORDER BY site_url');
    res.json({ sites });
  } catch (error) {
    console.error('Error fetching Search Console sites:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

// Get queries for a site
router.get('/queries', async (req, res) => {
  try {
    const { siteUrl, startDate, endDate, limit = 100 } = req.query;
    
    if (!siteUrl) {
      return res.status(400).json({ error: 'siteUrl required' });
    }
    
    // Check cache first
    let query = `
      SELECT query, SUM(clicks) as clicks, SUM(impressions) as impressions, 
             AVG(ctr) as ctr, AVG(position) as position
      FROM searchconsole_cache 
      WHERE site_url = ?
    `;
    
    const params = [siteUrl];
    
    if (startDate && endDate) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' GROUP BY query ORDER BY clicks DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const queries = all(query, params);
    
    res.json({ 
      data: queries,
      siteUrl
    });
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ error: 'Failed to fetch queries' });
  }
});

// Get pages for a site
router.get('/pages', async (req, res) => {
  try {
    const { siteUrl, startDate, endDate, limit = 50 } = req.query;
    
    if (!siteUrl) {
      return res.status(400).json({ error: 'siteUrl required' });
    }
    
    // For now, return empty structure
    res.json({
      data: [],
      siteUrl
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// Get overview metrics
router.get('/overview', async (req, res) => {
  try {
    const sites = all('SELECT * FROM searchconsole_sites');
    
    const overview = [];
    
    for (const site of sites) {
      const totals = get(`
        SELECT 
          SUM(clicks) as total_clicks,
          SUM(impressions) as total_impressions,
          AVG(ctr) as avg_ctr,
          AVG(position) as avg_position
        FROM searchconsole_cache 
        WHERE site_url = ?
      `, [site.site_url]);
      
      overview.push({
        site: site.site_url,
        permissionLevel: site.permission_level,
        totals: totals || {
          total_clicks: 0,
          total_impressions: 0,
          avg_ctr: 0,
          avg_position: 0
        }
      });
    }
    
    res.json({ overview });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

// Get ranking trends
router.get('/trends', async (req, res) => {
  try {
    const { siteUrl, startDate, endDate } = req.query;
    
    if (!siteUrl) {
      return res.status(400).json({ error: 'siteUrl required' });
    }
    
    const trends = all(`
      SELECT 
        date,
        SUM(clicks) as clicks,
        SUM(impressions) as impressions,
        AVG(ctr) as ctr,
        AVG(position) as position
      FROM searchconsole_cache 
      WHERE site_url = ?
      AND date BETWEEN ? AND ?
      GROUP BY date
      ORDER BY date
    `, [siteUrl, startDate || '30daysAgo', endDate || 'today']);
    
    res.json({ 
      data: trends,
      siteUrl
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// Add a Search Console site
router.post('/sites', async (req, res) => {
  try {
    const { siteUrl, permissionLevel } = req.body;
    
    run(`
      INSERT INTO searchconsole_sites (site_url, permission_level)
      VALUES (?, ?)
    `, [siteUrl, permissionLevel || 'siteOwner']);
    
    const site = get('SELECT * FROM searchconsole_sites WHERE site_url = ?', [siteUrl]);
    
    res.status(201).json({ site });
  } catch (error) {
    console.error('Error adding Search Console site:', error);
    res.status(500).json({ error: 'Failed to add site' });
  }
});

// Remove a Search Console site
router.delete('/sites/:siteUrl', async (req, res) => {
  try {
    const { siteUrl } = req.params;
    
    run('DELETE FROM searchconsole_cache WHERE site_url = ?', [siteUrl]);
    run('DELETE FROM searchconsole_sites WHERE site_url = ?', [siteUrl]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing Search Console site:', error);
    res.status(500).json({ error: 'Failed to remove site' });
  }
});

export default router;
