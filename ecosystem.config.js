module.exports = {
    apps: [
      {
        name: "profdidatica",
        script: "npm",
        args: "start",
        cwd: "/var/www/profdidatica",
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: "1G",
        env: {
          NODE_ENV: "production"
        }
      }
    ]
  };