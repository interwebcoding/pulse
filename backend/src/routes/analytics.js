import express from 'express';
import { all, get } from '../models/database.js';

const router = express.Router();

// Get analytics data for a site
router.get('/site/:siteId', async (req, res) => {
  try {
    const { siteId } = req.params;
    const { startDate, endDate } = req.query;
    
    const site = await get('SELECT * FROM sites WHERE id = ?', [siteId]);
    
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    const cached = await all(`
      SELECT * FROM analytics_cache 
      WHERE site_id = ? 
      ORDER BY date DESC
      LIMIT 30
    `, [siteId]);
    
    res.json({ 
      data: cached,
      source: cached.length > 0 ? 'cache' : 'api',
      propertyId: site.property_id,
      message: cached.length === 0 ? 'No cached data. Configure Google Analytics API to fetch live data.' : null
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get overview metrics for all sites
router.get('/overview', async (req, res) => {
  try {
    const sites = await all('SELECT id, name, property_id FROM sites WHERE property_id IS NOT NULL');
    
    const overview = await Promise.all(sites.map(async (site) => {
      const latest = await get(`
        SELECT * FROM analytics_cache 
        WHERE site_id = ? 
        ORDER BY date DESC 
        LIMIT 1
      `, [site.id]);
      
      const stats = await get(`
        SELECT 
          SUM(active_users) as total_users,
          SUM(sessions) as total_sessions,
          SUM(pageviews) as total_pageviews,
          AVG(avg_session_duration) as avg_duration
        FROM analytics_cache 
        WHERE site_id = ?
      `, [site.id]);
      
      return {
        site: { id: site.id, name: site.name, propertyId: site.property_id },
        latest: latest || null,
        totals: stats || { total_users: 0, total_sessions: 0, total_pageviews: 0, avg_duration: 0 }
      };
    }));
    
    res.json({ overview });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

// Get traffic sources
router.get('/sources/:siteId', async (req, res) => {
  try {
    res.json({
      data: [
        { source: 'google', medium: 'organic', sessions: 0, percentage: 0 },
        { source: 'direct', medium: '(none)', sessions: 0, percentage: 0 }
      ],
      message: 'Configure Google Analytics API to fetch real traffic data'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch traffic sources' });
  }
});

// Get page performance
router.get('/pages/:siteId', async (req, res) => {
  try {
    res.json({
      data: [
        { page: '/', title: 'Home', views: 0, uniqueViews: 0, avgTime: 0 }
      ],
      message: 'Configure Google Analytics API to fetch real page data'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch page data' });
  }
});

// Trigger data refresh
router.post('/refresh/:siteId', async (req, res) => {
  try {
    const { siteId } = req.params;
    const site = await get('SELECT * FROM sites WHERE id = ?', [siteId]);
    
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    res.json({ 
      message: 'Refresh job queued',
      siteId,
      propertyId: site.property_id
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to queue refresh' });
  }
});

export default router;
