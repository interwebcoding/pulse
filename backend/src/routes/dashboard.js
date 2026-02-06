import express from 'express';
import { all, get } from '../models/database.js';

const router = express.Router();

// Get dashboard overview
router.get('/', async (req, res) => {
  try {
    // Get site counts
    const analyticsSites = all('SELECT id, name, property_id FROM sites WHERE property_id IS NOT NULL');
    const searchConsoleSites = all('SELECT * FROM searchconsole_sites');
    
    // Calculate totals from caches
    const gaTotals = get(`
      SELECT 
        SUM(active_users) as total_users,
        SUM(sessions) as total_sessions,
        SUM(pageviews) as total_pageviews
      FROM analytics_cache
    `);
    
    const scTotals = get(`
      SELECT 
        SUM(clicks) as total_clicks,
        SUM(impressions) as total_impressions
      FROM searchconsole_cache
    `);
    
    // Get recent activity
    const recentSites = all(`
      SELECT id, name, url, updated_at 
      FROM sites 
      ORDER BY updated_at DESC 
      LIMIT 5
    `);
    
    res.json({
      summary: {
        totalSites: analyticsSites.length + searchConsoleSites.length,
        analyticsSites: analyticsSites.length,
        searchConsoleSites: searchConsoleSites.length
      },
      metrics: {
        users: gaTotals?.total_users || 0,
        sessions: gaTotals?.total_sessions || 0,
        pageviews: gaTotals?.total_pageviews || 0,
        clicks: scTotals?.total_clicks || 0,
        impressions: scTotals?.total_impressions || 0
      },
      recentSites
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get health scores
router.get('/health', async (req, res) => {
  try {
    const sites = all('SELECT id, name FROM sites');
    
    const healthScores = sites.map(site => {
      // Calculate health score based on available metrics
      const gaStats = get(`
        SELECT AVG(position) as avg_position 
        FROM searchconsole_cache 
        WHERE site_url LIKE ?
      `, [`%${site.name}%`]);
      
      const position = gaStats?.avg_position || 0;
      
      // Simple health calculation
      let score = 100;
      if (position > 50) score -= 30;
      else if (position > 30) score -= 20;
      else if (position > 10) score -= 10;
      
      return {
        siteId: site.id,
        siteName: site.name,
        score: Math.max(0, Math.min(100, score)),
        status: score >= 70 ? 'good' : score >= 40 ? 'warning' : 'critical'
      };
    });
    
    res.json({ healthScores });
  } catch (error) {
    console.error('Error fetching health scores:', error);
    res.status(500).json({ error: 'Failed to fetch health scores' });
  }
});

// Get alerts
router.get('/alerts', async (req, res) => {
  try {
    // Return mock alerts for now
    res.json({
      alerts: []
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get quick stats for header
router.get('/quick-stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = get(`
      SELECT 
        (SELECT COUNT(*) FROM sites) as siteCount,
        (SELECT COUNT(*) FROM searchconsole_sites) as scSiteCount
    `);
    
    res.json({
      siteCount: stats?.siteCount || 0,
      scSiteCount: stats?.scSiteCount || 0
    });
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
