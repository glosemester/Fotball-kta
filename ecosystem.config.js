module.exports = {
  apps: [
    {
      name: "fotball-kta",
      script: "npm",
      args: "start",
      cwd: "/var/www/fotball-kta",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      restart_delay: 5000,
      max_restarts: 10,
    },
  ],
};
