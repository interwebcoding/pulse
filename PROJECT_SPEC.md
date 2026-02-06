# pulse - SEO Dashboard Portal

**"pulse"** - Monitor your SEO performance at a glance. Short, snappy, easy to type!

---

## Project Vision
A comprehensive SEO dashboard portal to monitor, analyze, and improve website performance for multiple clients. Modern architecture hosted on your Nuc server.

## 🎯 Key Decisions

| Decision | Choice |
|----------|--------|
| **Name** | **pulse** |
| **Database** | SQLite (file-based, simple) |
| **AI** | MiniMax API (pluggable backend) |
| **Hosting** | Nuc server: `nuc@192.168.1.X:~/hosted-stack/pulse` |
| **SSH Access** | Available |
| **Tools on Nuc** | OpenClaw, Kimi CLI |

---

## 👥 Project Roles (AI Agents)

| Role | Purpose |
|------|---------|
| 👔 Project Manager | Coordinates team, manages timeline |
| 👑 **Product Owner (Bren)** | Feature decisions, UX approval |
| 🧪 Lead Tester | Tests, bugs, quality assurance |
| 🎨 UI/UX Designer | Dashboard design, components |
| 🔧 Backend Engineer | API, database, Node.js |
| 📊 DevOps/ML Engineer | Nuc deployment, AI integration |

---

## 🛠 Tech Stack

### Frontend (Nuc + PM2)
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Charts:** Chart.js or Recharts
- **State:** React Query
- **Build:** Vite static build

### Backend (Nuc + PM2)
- **Framework:** Express.js
- **Database:** SQLite (file-based)
- **Auth:** Passport.js (Google OAuth)
- **Scheduler:** node-cron

### External APIs
- **Google Analytics Data API** (GA4)
- **Google Search Console API** (Webmasters)
- **MiniMax API** (pluggable AI backend)

---

## 📊 Sites to Monitor

### silvertubes Account (Analytics)
| Property | ID | Account |
|----------|-----|---------|
| www.Interwebcoding.com | 372302012 | silvertubes |
| Matcha Zone | 383686000 | silvertubes |
| sarahrossphotography.com.au | 265878444 | silvertubes |

### interwebcoding Account (Analytics)
| Property | ID | Account |
|----------|-----|---------|
| Zento Group | 188363677 | interwebcoding |
| southwestcardiovascular.com.au | 261670633 | interwebcoding |

### Search Console Sites (6)
- https://www.interwebcoding.com/ (owner)
- https://interwebcoding.com/ (owner)
- sc-domain:drfaltaf.com.au (full user)
- sc-domain:sarahrossphotography.com.au (full user)
- sc-domain:southwestcardiovascular.com.au (owner)

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    pulse (Nuc Server)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              PM2 Process Manager                    │   │
│   ├─────────────────────────────────────────────────────┤   │
│   │                                                     │   │
│   │   ┌─────────────┐    ┌─────────────┐              │   │
│   │   │   React     │    │   Express   │              │   │
│   │   │   Static   │◄──►│   API      │              │   │
│   │   │   Build     │    │   :3000    │              │   │
│   │   └─────────────┘    └─────────────┘              │   │
│   │           │                  │                        │   │
│   │           │                  │                        │   │
│   │           ▼                  ▼                        │   │
│   │   ┌─────────────────────────────────────┐          │   │
│   │   │          SQLite Database            │          │   │
│   │   │          pulse.db                  │          │   │
│   │   └─────────────────────────────────────┘          │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│                    External APIs                              │
│   ┌────────────────┐  ┌────────────────┐              │
│   │  Google GA4     │  │  Search Console │              │
│   │  Data API       │  │  API           │              │
│   └────────────────┘  └────────────────┘              │
│                                                             │
│   ┌────────────────┐  ┌────────────────┐              │
│   │   MiniMax API   │  │   OpenClaw     │              │
│   │   (AI Engine)  │  │   CLI          │              │
│   └────────────────┘  └────────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘

URL: http://nuc.local:3000 (or custom domain)
```

---

## 📱 Features

### Phase 1 (MVP) - 3 weeks

#### 1. Dashboard Overview
- Aggregate metrics across all sites
- Health score (0-100)
- Quick alerts

#### 2. Site Management
- Add/remove sites
- Client groupings
- Settings per site

#### 3. Analytics View
- Daily/weekly/monthly traffic
- Active users, sessions, pageviews
- Traffic sources
- Chart.js visualizations

#### 4. Search Console View
- Top queries
- Click-through rates
- Average position
- Ranking trends

#### 5. AI Insights (MiniMax)
- Trend analysis
- Anomaly detection
- Recommendations

---

### Phase 2+ - Future

- Email/PDF reports
- Custom dashboards per client
- Competitor analysis
- White-label options
- Mobile app

---

## 🎨 Design Principles

Based on Bren's existing interweb-analytics app:
- Clean, minimal design
- Chart.js for visualizations
- Easy period switching (daily/weekly/monthly)
- Property/site selector
- AI insights panel

---

## 📁 GitHub Structure

```
pulse/
├── .github/
│   └── workflows/
│       └── ci.yml
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── utils/
│   ├── tailwind.config.js
│   └── package.json
├── backend/                     # Express + SQLite
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── config/
│   └── package.json
├── scripts/
│   ├── deploy.sh              # Deploy to Nuc
│   └── setup.sh               # Initial setup
├── .env.example
└── README.md
```

---

## 🚀 Nuc Deployment

### Server Access
```
Host: nuc@192.168.1.X:~/hosted-stack/pulse
SSH: Available
PM2: Available for process management
OpenClaw: Available
Kimi CLI: Available
```

### Deployment Commands (on Nuc)
```bash
# Pull latest
cd ~/hosted-stack/pulse
git pull

# Restart PM2
pm2 restart pulse

# View logs
pm2 logs pulse

# Check status
pm2 status
```

### Initial Setup (on Nuc)
```bash
# Clone repo
cd ~/hosted-stack
git clone https://github.com/interwebcoding/pulse.git
cd pulse

# Setup backend
cd backend
npm install
cp ../.env.example .env
# Edit .env with credentials

# Setup frontend
cd ../frontend
npm install

# Start with PM2
cd ..
pm2 start ecosystem.config.js
```

---

## 📅 Timeline

| Week | Focus | Deliverables |
|------|-------|-------------|
| 1 | Project Setup, Auth, Database | GitHub repo, Nuc init, Auth flow, SQLite DB schema |
| 2 | Frontend UI, Analytics | Dashboard, Site management, GA4 integration |
| 3 | Search Console, AI | Search insights, AI recommendations |
| 4 | Polish, Testing, Release | Bug fixes, Testing, v1.0 launch |

---

## ✅ Checklist

- [x] SQLite database approved
- [x] MiniMax API for AI (pluggable)
- [x] Hosting: Nuc server
- [x] Name: **pulse**
- [ ] **Product Owner Approval Needed** 👑

---

## 🔗 Key Links

- **GitHub Repo:** https://github.com/interwebcoding/pulse
- **Nuc Server:** nuc@192.168.1.X:~/hosted-stack/pulse
- **Local Dev:** http://localhost:3000
- **Prod URL:** http://nuc.local:3000

---

**Project Manager Note:** Ready to spawn the team once Bren gives the final GO! 🚀
