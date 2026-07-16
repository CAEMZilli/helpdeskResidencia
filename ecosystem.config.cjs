module.exports = {
  apps: [{
    name: 'bienestarAPI',         // El nombre que verás al ejecutar 'pm2 list'
    script: './dist/server.js',   // La ruta hacia tu archivo de entrada ya compilado
    instances: 1,                 // 1 instancia es lo ideal para tu vCPU actual
    autorestart: true,            // Si la API llega a caerse por un error, PM2 la levanta de inmediato
    watch: false,                 // Falso en producción (ahorra ciclos de CPU)
    max_memory_restart: '220M',   // Reinicio automático de emergencia si la RAM supera los 220MB
    
    // Variables de entorno específicas para tu servidor de producción
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      PRISMA_CLIENT_ENGINE_TYPE: 'library',    // Forza a Prisma a usar la librería ligera para ahorrar RAM
      NODE_OPTIONS: '--max-old-space-size=180'  // Limita el Garbage Collector de Node estricto a 180MB
    }
  }]
};
