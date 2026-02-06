# pulse - SEO Dashboard

**pulse** is your personal SEO monitoring dashboard. Track your website performance across Google Analytics and Search Console, all in one place.

## Features

- 📊 **Dashboard Overview** - See all your sites at a glance
- 🔍 **Search Console Integration** - Monitor rankings, queries, and clicks
- 📈 **Google Analytics** - Track traffic, sessions, and user behavior
- 🏥 **Health Scores** - Know when something needs attention
- 🤖 **AI Insights** - Automated analysis powered by MiniMax

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Cloud Console account with Analytics and Search Console APIs enabled

### Installation

1. **Clone the repository**
   ```bash
   cd pulse
   ```

2. **Set up the backend**
   ```bash
   cd backend
   cp ../.env.example .env
   # Edit .env with your credentials
   npm install
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Google OAuth**
   
   Create a project in [Google Cloud Console](https://console.cloud.google.com/):
   - Enable Google Analytics Data API
   - Enable Search Console API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (development)
     - `https://your-domain.com/api/auth/google/callback` (production)

5. **Start the backend**
   ```bash
   cd backend
   npm run dev
   ```

6. **Start the frontend** (new terminal)
   ```bash
   cd frontend
   npm run dev
   ```

7. **Open in browser**
   ```
   http://localhost:5173
   ```

## Project Structure

```
pulse/
├── frontend/                    # React + Vite app
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── api/               # API utilities
│   │   └── utils/             # Helper functions
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/                     # Express.js API
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── services/           # Business logic
│   │   ├── models/            # Database models
│   │   └── middleware/        # Express middleware
│   └── package.json
├── scripts/                    # Deployment scripts
├── .env.example
└── README.md
```

## Available Scripts

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

### Backend
```bash
npm run dev      # Start with nodemon
npm start        # Start production
npm run db:migrate # Run database migrations
```

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 3000) |
| `FRONTEND_URL` | Frontend URL for CORS |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL |
| `SESSION_SECRET` | Session encryption key |
| `MINIMAX_API_KEY` | MiniMax API key for AI features |

## Deployment

### Nuc Server

```bash
# SSH to Nuc
ssh nuc@your-server

# Pull latest code
cd ~/hosted-stack/pulse
git pull

# Restart PM2
pm2 restart pulse

# Check status
pm2 status pulse
```

### PM2 Ecosystem

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'pulse',
    script: 'src/index.js',
    cwd: '/path/to/pulse/backend',
    interpreter: 'node',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Chart.js
- **Backend**: Express.js + SQLite + Passport.js
- **APIs**: Google Analytics Data API, Search Console API
- **AI**: MiniMax API (pluggable)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use for your own projects!
