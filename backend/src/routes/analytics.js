import express from 'express';
import { all, get } from '../models/database.js';
import analyticsService from '../services/google-analytics.js';

const router = express.Router();

// Get analytics data for a site
router.get('/site/:siteId', async (req, res) => {
  try {
    const { siteId } = req.params;
    const { startDate = '30daysAgo', endDate = 'today' } = req.query;
    
    const site = await get('SELECT * FROM sites WHERE id = ?', [siteId]);
    
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    // Fetch real analytics data
    const analytics = await analyticsService.getAnalyticsData(
      site.property_id,
      startDate,
      endDate,
      site.account_type
    );
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get overview metrics for all sites
router.get('/overview', async (req, res) => {
  try {
    const sites = await all('SELECT id, name, property_id, account_type FROM sites WHERE property_id IS NOT NULL');
    
    const overview = await Promise.all(sites.map(async (site) => {
      const analytics = await analyticsService.getAnalyticsData(
        site.property_id,
        '30daysAgo',
        'today',
        site.account_type
      );
      
      return {
        site: { id: site.id, name: site.name, propertyId: site.property_id },
        dailyData: analytics.dailyData.slice(-7), // Last 7 days
        totals: analytics.totals,
        source: analytics.source
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
    const { siteId } = req.params;
    const site = await get('SELECT property_id, account_type FROM sites WHERE id = ?', [siteId]);
    
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    const sources = await analyticsService.getTrafficSources(
      site.property_id,
      site.account_type
    );
    
    res.json(sources);
  } catch (error) {
    console.error('Error fetching sources:', error);
    res.status(500).json({ error: 'Failed to fetch traffic sources' });
  }
});

// Get top pages
router.get('/pages/:siteId', async (req, res) => {
  try {
    const { siteId } = req.params;
    const { limit = 10 } = req.query;
    const site = await get('SELECT property_id, account_type FROM sites WHERE id = ?', [siteId]);
    
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    const pages = await analyticsService.getTopPages(
      site.property_id,
      parseInt(limit),
      site.account_type
    );
    
    res.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
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
    
    // Refresh analytics data
    const analytics = await analyticsService.getAnalyticsData(
      site.property_id,
      '30daysAgo',
      'today',
      site.account_type
    );
    
    // Cache the data
    for (const day of analytics.dailyData) {
      await run(`
        INSERT OR REPLACE INTO analytics_cache 
        (site_id, date, active_users, sessions, pageviews, bounces, avg_session_duration)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [siteId, day.date, day.activeUsers, day.sessions, day.pageviews, day.bounces, day.avgSessionDuration]);
    }
    
    res.json({ 
      message: 'Analytics refreshed successfully',
      siteId,
      propertyId: site.property_id,
      daysUpdated: analytics.dailyData.length
    });
  } catch (error) {
    console.error('Error refreshing analytics:', error);
    res.status(500).json({ error: 'Failed to refresh analytics' });
  }
});

// Get OAuth setup info
router.get('/oauth-status/:siteId', async (req, res) => {
  try {
    const { siteId } = req.params;
    const site = await get('SELECT property_id, account_type FROM sites WHERE id = ?', [siteId]);
    
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    res.json({
      propertyId: site.property_id,
      authUrl: analyticsService.getAuthUrl(site.account_type),
      note: 'Visit the auth URL to connect your Google Analytics account'
    });
  } catch (error) {
    console.error('Error getting OAuth status:', error);
    res.status(500).json({ error: 'Failed to get OAuth status' });
  }
});

export default router;
