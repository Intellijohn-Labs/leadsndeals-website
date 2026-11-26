// PM2 config for the Leadsndeals website (Next.js server: pages + API routes for Lia's chat,
// voice transcription and the demo form).
// Start:   pm2 start ecosystem.config.cjs
// Needs a production build first (npm run build) and the keys in .env.local (see README).
module.exports = {
  apps: [
    {
      name: 'leadsndeals',
      script: 'node_modules/next/dist/bin/next',
      // 3020 is used by the WAAU site on the same VPS. Listen on localhost only; Nginx is in front.
      args: 'start -p 3030 -H 127.0.0.1',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3030,
      },
      max_memory_restart: '600M',
      autorestart: true,
      watch: false,
      time: true,
    },
  ],
};
