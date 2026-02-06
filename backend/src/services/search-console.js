import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Generate realistic mock Search Console data
function generateMockSCData(siteUrl) {
  const today = new Date();
  const days = [];
  
  // Generate 30 days of mock data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push({
      date: date.toISOString().split('T')[0],
      clicks: Math.floor(Math.random() * 100) + 10,
      impressions: Math.floor(Math.random() * 2000) + 500,
      ctr: (Math.random() * 5 + 1).toFixed(2),
      position: Math.random() * 30 + 5
    });
  }
  
  return days;
}

// Get top queries
async function getTopQueries(siteUrl, limit = 20, startDate = '30daysAgo', endDate = 'today') {
  const mockQueries = [
    { query: 'web design perth', clicks: 2450, impressions: 45000, ctr: 5.44, position: 8.2 },
    { query: 'seo services', clicks: 1890, impressions: 38000, ctr: 4.97, position: 12.5 },
    { query: 'wordpress developer', clicks: 1650, impressions: 32000, ctr: 5.16, position: 6.8 },
    { query: 'ecommerce website', clicks: 1420, impressions: 28000, ctr: 5.07, position: 15.3 },
    { query: 'google analytics setup', clicks: 1180, impressions: 25000, ctr: 4.72, position: 9.1 },
    { query: 'local seo perth', clicks: 1050, impressions: 18000, ctr: 5.83, position: 5.4 },
    { query: 'website maintenance', clicks: 890, impressions: 15000, ctr: 5.93, position: 11.2 },
    { query: 'responsive web design', clicks: 780, impressions: 14000, ctr: 5.57, position: 14.8 },
    { query: 'seo audit', clicks: 720, impressions: 12000, ctr: 6.00, position: 7.3 },
    { query: 'content marketing', clicks: 680, impressions: 11000, ctr: 6.18, position: 18.5 },
    { query: 'branding agency', clicks: 620, impressions: 9500, ctr: 6.53, position: 22.1 },
    { query: 'website redesign', clicks: 580, impressions: 9000, ctr: 6.44, position: 13.7 },
    { query: 'digital marketing', clicks: 540, impressions: 8500, ctr: 6.35, position: 25.4 },
    { query: 'mobile website', clicks: 490, impressions: 7800, ctr: 6.28, position: 8.9 },
    { query: 'woocommerce development', clicks: 450, impressions: 7200, ctr: 6.25, position: 16.2 },
    { query: 'search engine optimization', clicks: 420, exclamations: 6800, ctr: 6.18, position: 19.8 },
    { query: 'ux design services', clicks: 380, impressions: 6200, ctr: 6.13, position: 21.4 },
    { query: 'web development perth', clicks: 350, impressions: 5500, ctr: 6.36, position: 4.2 },
    { query: 'logo design', clicks: 320, impressions: 4800, ctr: 6.67, position: 28.5 },
    { query: 'social media marketing', clicks: 290, impressions: 4200, ctr: 6.90, position: 31.2 }
  ];
  
  return {
    siteUrl,
    period: { startDate, endDate },
    queries: mockQueries.slice(0, limit),
    totals: {
      clicks: mockQueries.reduce((sum, q) => sum + q.clicks, 0),
      impressions: mockQueries.reduce((sum, q) => sum + q.impressions, 0),
      avgCtr: (mockQueries.reduce((sum, q) => sum + q.ctr, 0) / mockQueries.length).toFixed(2),
      avgPosition: (mockQueries.reduce((sum, q) => sum + q.position, 0) / mockQueries.length).toFixed(1)
    }
  };
}

// Get performance data (daily)
async function getPerformance(siteUrl, startDate = '30daysAgo', endDate = 'today') {
  const dailyData = generateMockSCData(siteUrl);
  
  const totals = dailyData.reduce((acc, day) => ({
    clicks: acc.clicks + day.clicks,
    impressions: acc.impressions + day.impressions,
    ctr: acc.ctr + parseFloat(day.ctr),
    position: acc.position + parseFloat(day.position)
  }), { clicks: 0, impressions: 0, ctr: 0, position: 0 });
  
  return {
    siteUrl,
    period: { startDate, endDate },
    dailyData,
    totals: {
      ...totals,
      ctr: (totals.ctr / dailyData.length).toFixed(2),
      position: (totals.position / dailyData.length).toFixed(1)
    }
  };
}

// Get top pages
async function getTopPages(siteUrl, limit = 10, startDate = '30daysAgo', endDate = 'today') {
  const mockPages = [
    { page: '/', clicks: 3450, impressions: 52000, ctr: 6.63, position: 8.5 },
    { page: '/services/', clicks: 2180, impressions: 38000, ctr: 5.74, position: 12.3 },
    { page: '/about/', clicks: 1650, impressions: 28000, ctr: 5.89, position: 15.7 },
    { page: '/blog/', clicks: 1420, impressions: 24000, ctr: 5.92, position: 18.2 },
    { page: '/contact/', clicks: 1180, impressions: 18000, ctr: 6.56, position: 6.4 },
    { page: '/portfolio/', clicks: 980, impressions: 15000, ctr: 6.53, position: 22.1 },
    { page: '/pricing/', clicks: 750, impressions: 12000, ctr: 6.25, position: 14.8 },
    { page: '/faq/', clicks: 620, impressions: 9500, ctr: 6.53, position: 25.4 },
    { page: '/testimonials/', clicks: 480, impressions: 7200, ctr: 6.67, position: 19.3 },
    { page: '/privacy-policy/', clicks: 320, impressions: 4800, ctr: 6.67, position: 35.2 }
  ];
  
  return {
    siteUrl,
    period: { startDate, endDate },
    pages: mockPages.slice(0, limit)
  };
}

export default {
  getTopQueries,
  getPerformance,
  getTopPages
};
