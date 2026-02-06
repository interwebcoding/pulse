# Nuc Deployment - pulse

## When Nuc is accessible

### 1. SSH to Nuc
```bash
ssh nuc
# or
ssh brendon@192.168.0.4
```

### 2. Clone and Deploy
```bash
# On your Nuc terminal:
cd ~/hosted-stack
git clone https://github.com/interwebcoding/pulse.git
cd pulse

# Make deploy script executable
chmod +x scripts/deploy.sh

# Run initial setup
./scripts/deploy.sh
```

### 3. Access
- **API:** http://nuc.local:3000/api/health
- **Frontend:** Build frontend and serve statically

### Troubleshooting

**SSH Connection Refused:**
- Ensure Nuc is on the same network
- Check SSH is running: `sudo systemctl status ssh`
- Start SSH: `sudo systemctl start ssh`

**GitHub Access:**
- Ensure GitHub CLI is authenticated: `gh auth status`

**Firewall:**
- Ensure port 3000 is open on Nuc
