module.exports = {
  apps: [
    {
      name: 'pulse-api',
      script: 'src/index.js',
      cwd: '/home/nuc/hosted-stack/pulse/backend',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        FRONTEND_URL: 'http://localhost:5173'
      },
      log_file: '/home/nuc/hosted-stack/pulse/logs/pm2.log',
      out_file: '/home/nuc/hosted-stack/pulse/logs/out.log',
      error_file: '/home/nuc/hosted-stack/pulse/logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
