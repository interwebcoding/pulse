import { google } from 'googleapis';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load OAuth credentials
function loadCredentials(accountType = 'silvertubes') {
  const credsPath = path.join(__dirname, '../../.env');
  
  // Parse .env file for credentials
  const envContent = fs.readFileSync(credsPath, 'utf8');
  const clientIdMatch = envContent.match(/GOOGLE_CLIENT_ID=(.+)/);
  const clientSecretMatch = envContent.match(/GOOGLE_CLIENT_SECRET=(.+)/);
  
  if (!clientIdMatch || !clientSecretMatch) {
    throw new Error('Google OAuth credentials not found in .env');
  }
  
  return {
    client_id: clientIdMatch[1].trim(),
    client_secret: clientSecretMatch[1].trim(),
    redirect_uris: ['http://localhost:3000/api/auth/google/callback']
  };
}

// Create OAuth2 client
function getOAuth2Client(accountType = 'silvertubes') {
  const credentials = loadCredentials(accountType);
  
  const oauth2Client = new google.auth.OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirect_uris[0]
  );
  
  return oauth2Client;
}

// Get auth URL for OAuth flow
function getAuthUrl(accountType = 'silvertubes') {
  const oauth2Client = getOAuth2Client(accountType);
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    prompt: 'consent'
  });
}

// Exchange code for tokens
async function getTokensFromCode(code, accountType = 'silvertubes') {
  const oauth2Client = getOAuth2Client(accountType);
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return { oauth2Client, tokens };
}

// Fetch GA4 analytics data
async function getAnalyticsData(propertyId, startDate = '30daysAgo', endDate = 'today', accountType = 'silvertubes') {
  try {
    const credentials = loadCredentials(accountType);
    const oauth2Client = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret
    );
    
    // For development, use mock data if no tokens available
    // In production, you'd store and refresh tokens in database
    console.log(`[GA4] Would fetch data for property ${propertyId} (${startDate} to ${endDate})`);
    
    // Return mock data structure for now
    return generateMockAnalytics(propertyId, startDate, endDate);
  } catch (error) {
    console.error('[GA4] Error fetching analytics:', error);
    return generateMockAnalytics(propertyId, startDate, endDate);
  }
}

// Generate realistic mock data for development
function generateMockAnalytics(propertyId, startDate, endDate) {
  const today = new Date();
  const days = [];
  
  // Generate 30 days of mock data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push({
      date: date.toISOString().split('T')[0],
      activeUsers: Math.floor(Math.random() * 500) + 100,
      sessions: Math.floor(Math.random() * 800) + 200,
      pageviews: Math.floor(Math.random() * 2000) + 500,
      bounces: Math.floor(Math.random() * 300) + 50,
      avgSessionDuration: Math.floor(Math.random() * 180) + 30
    });
  }
  
  const totals = days.reduce((acc, day) => ({
    activeUsers: acc.activeUsers + day.activeUsers,
    sessions: acc.sessions + day.sessions,
    pageviews: acc.pageviews + day.pageviews,
    bounces: acc.bounces + day.bounces,
    avgSessionDuration: acc.avgSessionDuration + day.avgSessionDuration
  }), { activeUsers: 0, sessions: 0, pageviews: 0, bounces: 0, avgSessionDuration: 0 });
  
  return {
    propertyId,
    period: { startDate, endDate },
    dailyData: days,
    totals: {
      ...totals,
      avgSessionDuration: Math.round(totals.avgSessionDuration / days.length)
    },
    source: 'mock',
    note: 'Set up OAuth tokens for real data'
  };
}

// Get traffic sources
async function getTrafficSources(propertyId, accountType = 'silvertubes') {
  return {
    propertyId,
    data: [
      { source: 'google', medium: 'organic', sessions: 4500, percentage: 45 },
      { source: 'direct', medium: '(none)', sessions: 2800, percentage: 28 },
      { source: 'facebook', medium: 'social', sessions: 1200, percentage: 12 },
      { source: 'google', medium: 'cpc', sessions: 800, percentage: 8 },
      { source: 'email', medium: 'newsletter', sessions: 500, percentage: 5 },
      { source: 'referral', medium: 'partner', sessions: 100, percentage: 2 }
    ]
  };
}

// Get top pages
async function getTopPages(propertyId, limit = 10, accountType = 'silvertubes') {
  return {
    propertyId,
    data: [
      { page: '/', title: 'Home', views: 15420, uniqueViews: 12300, avgTime: 45 },
      { page: '/services', title: 'Services', views: 8230, uniqueViews: 6500, avgTime: 120 },
      { page: '/about', title: 'About Us', views: 6120, uniqueViews: 5100, avgTime: 85 },
      { page: '/blog', title: 'Blog', views: 5890, uniqueViews: 4800, avgTime: 180 },
      { page: '/contact', title: 'Contact', views: 3450, uniqueViews: 3200, avgTime: 65 },
      { page: '/pricing', title: 'Pricing', views: 2890, uniqueViews: 2400, avgTime: 95 },
      { page: '/portfolio', title: 'Portfolio', views: 2340, uniqueViews: 1900, avgTime: 150 },
      { page: '/testimonials', title: 'Testimonials', views: 1890, uniqueViews: 1600, avgTime: 110 },
      { page: '/faq', title: 'FAQ', views: 1450, uniqueViews: 1200, avgTime: 200 },
      { page: '/blog/post-1', title: 'Blog Post 1', views: 1200, uniqueViews: 1000, avgTime: 240 }
    ]
  };
}

export default {
  getAuthUrl,
  getTokensFromCode,
  getAnalyticsData,
  getTrafficSources,
  getTopPages
};
