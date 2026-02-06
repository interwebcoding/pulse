import express from 'express';
import { all, get } from '../models/database.js';
import scService from '../services/search-console.js';

const router = express.Router();

// Get all Search Console sites
router.get('/sites', async (req, res) => {
  try {
    const sites = await all('SELECT * FROM searchconsole_sites ORDER BY site_url');
    res.json({ sites });
  } catch (error) {
    console.error('Error fetching Search Console sites:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

// Get queries for a site
router.get('/queries', async (req, res) => {
  try {
    const { siteUrl, startDate = '30daysAgo', endDate = 'today', limit = 20 } = req.query;
    
    if (!siteUrl) {
      return res.status(400).json({ error: 'siteUrl required' });
    }
    
    const queries = await scService.getTopQueries(siteUrl, parseInt(limit), startDate, endDate);
    res.json(queries);
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ error: 'Failed to fetch queries' });
  }
});

// Get pages for a site
router.get('/pages', async (req, res) => {
  try {
    const { siteUrl, startDate = '30daysAgo', endDate = 'today', limit = 10 } = req.query;
    
    if (!siteUrl) {
      return res.status(400).json({ error: 'siteUrl required' });
    }
    
    const pages = await scService.getTopPages(siteUrl, parseInt(limit), startDate, endDate);
    res.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// Get performance data
router.get('/performance', async (req, res) => {
  try {
    const { siteUrl, startDate = '30daysAgo', endDate = 'today' } = req.query;
    
    if (!siteUrl) {
      return res.status(400).json({ error: 'siteUrl required' });
    }
    
    const performance = await scService.getPerformance(siteUrl, startDate, endDate);
    res.json(performance);
  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// Get overview
router.get('/overview', async (req, res) => {
  try {
    const sites = await all('SELECT * FROM searchconsole_sites');
    
    const overview = await Promise.all(sites.map(async (site) => {
      const performance = await scService.getPerformance(site.site_url, '30daysAgo', 'today');
      return {
        site: site.site_url,
        permissionLevel: site.permission_level,
        ...performance.totals
      };
    }));
    
    res.json({ overview });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

// Add a Search Console site
router.post('/sites', async (req, res) => {
  try {
    const { siteUrl, permissionLevel } = req.body;
    
    await run(`
      INSERT OR REPLACE INTO searchconsole_sites (site_url, permission_level)
      VALUES (?, ?)
    `, [siteUrl, permissionLevel || 'siteOwner']);
    
    const site = await get('SELECT * FROM searchconsole_sites WHERE site_url = ?', [siteUrl]);
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
    
    await run('DELETE FROM searchconsole_cache WHERE site_url = ?', [decodeURIComponent(siteUrl)]);
    await run('DELETE FROM searchconsole_sites WHERE site_url = ?', [decodeURIComponent(siteUrl)]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing Search Console site:', error);
    res.status(500).json({ error: 'Failed to remove site' });
  }
});

export default router;
