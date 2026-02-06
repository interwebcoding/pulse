import express from 'express';
import { google } from 'googleapis';
import { all, get, run } from '../models/database.js';

const router = express.Router();

// Get OAuth2 client for user
function getOAuth2Client(req) {
  if (!req.isAuthenticated()) {
    return null;
  }
  
  // In production, you'd store tokens in database
  // For now, we'll use a simple approach
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'
  );
  
  return oauth2Client;
}

// Get analytics data for a site
router.get('/site/:siteId', async (req, res) => {
  try {
    const { siteId } = req.params;
    const { startDate, endDate, granularity = 'daily' } = req.query;
    
    const site = get('SELECT * FROM sites WHERE id = ?', [siteId]);
    
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    // Check cache first
    const cached = all(`
      SELECT * FROM analytics_cache 
      WHERE site_id = ? 
      AND date BETWEEN ? AND ?
      ORDER BY date
    `, [siteId, startDate || '30daysAgo', endDate || 'today']);
    
    // If we have cached data, return it
    if (cached.length > 0) {
      return res.json({ 
        data: cached,
        source: 'cache',
        propertyId: site.property_id
      });
    }
    
    // Fetch from Google Analytics API if no cache
    // This would require proper OAuth tokens stored in DB
    res.json({ 
      message: 'No cached data. Set up OAuth tokens to fetch from GA4.',
      propertyId: site.property_id,
      source: 'api'
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get overview metrics for all sites
router.get('/overview', async (req, res) => {
  try {
    const sites = all('SELECT id, name, property_id FROM sites WHERE property_id IS NOT NULL');
    
    const overview = [];
    
    for (const site of sites) {
      // Get latest cached data for each site
      const latest = get(`
        SELECT * FROM analytics_cache 
        WHERE site_id = ? 
        ORDER BY date DESC 
        LIMIT 1
      `, [site.id]);
      
      // Get aggregate stats
      const stats = get(`
        SELECT 
          SUM(active_users) as total_users,
          SUM(sessions) as total_sessions,
          SUM(pageviews) as total_pageviews,
          AVG(avg_session_duration) as avg_duration
        FROM analytics_cache 
        WHERE site_id = ?
      `, [site.id]);
      
      overview.push({
        site: {
          id: site.id,
          name: site.name,
          propertyId: site.property_id
        },
        latest: latest || null,
        totals: stats || { total_users: 0, total_sessions: 0, total_pageviews: 0, avg_duration: 0 }
      });
    }
    
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
    
    // For now, return mock data structure
    // In production, this would come from GA4 API
    res.json({
      data: [
        { source: 'google', medium: 'organic', sessions: 0, percentage: 0 },
        { source: 'direct', medium: '(none)', sessions: 0, percentage: 0 },
        { source: 'facebook', medium: 'social', sessions: 0, percentage: 0 }
      ]
    });
  } catch (error) {
    console.error('Error fetching sources:', error);
    res.status(500).json({ error: 'Failed to fetch traffic sources' });
  }
});

// Get page performance
router.get('/pages/:siteId', async (req, res) => {
  try {
    const { siteId } = req.params;
    const { limit = 10 } = req.query;
    
    // Mock data for now
    res.json({
      data: [
        { page: '/', title: 'Home', views: 0, uniqueViews: 0, avgTime: 0 },
        { page: '/about', title: 'About', views: 0, uniqueViews: 0, avgTime: 0 }
      ]
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch page data' });
  }
});

// Trigger data refresh (calls Google Analytics API)
router.post('/refresh/:siteId', async (req, res) => {
  try {
    const { siteId } = req.params;
    
    const site = get('SELECT * FROM sites WHERE id = ?', [siteId]);
    
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    // Queue a background job to fetch from GA4
    // For now, return success
    res.json({ 
      message: 'Refresh job queued',
      siteId,
      propertyId: site.property_id
    });
  } catch (error) {
    console.error('Error queuing refresh:', error);
    res.status(500).json({ error: 'Failed to queue refresh' });
  }
});

export default router;
