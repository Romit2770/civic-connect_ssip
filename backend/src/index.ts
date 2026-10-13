import { createServer } from 'http';
import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { initializeSocket } from './config/socket';
import { runSLAMonitorCheck } from './services/slaMonitorService';

const httpServer = createServer(app);

// Initialize real-time Socket.IO
initializeSocket(httpServer);

async function startServer() {
  try {
    // 1. Listen on configured port immediately so Vite proxy & reverse proxies connect without ECONNREFUSED
    httpServer.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${env.PORT} is already in use. Clean up orphaned processes or choose another port.`);
      } else {
        console.error('❌ HTTP Server error:', error);
      }
    });

    httpServer.listen(env.PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🏛️  CivicConnect — Municipal Resolution Platform (SIH-195) ║
║   📡  Server Port:      ${String(env.PORT).padEnd(38)}║
║   🌍  Environment:      ${env.NODE_ENV.padEnd(38)}║
║   ⚡  Real-time Engine: SOCKET.IO READY                       ║
║   🤖  AI Assistant:     ${(env.AI_PROVIDER === 'gemini' ? 'Gemini 1.5 Multimodal' : 'Rule-Based Expert Engine').padEnd(38)}║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
      `);
    });

    // 2. Connect MongoDB (Mongoose automatically buffers queries while connecting)
    await connectDatabase();

    // 3. Start SLA Background Monitor (every 10 minutes in dev / configurable)
    if (env.SLA_MONITOR_ENABLED) {
      console.log('⏰ Initializing SLA Monitoring Service...');
      // Run once at boot
      runSLAMonitorCheck().catch((err) => console.warn('SLA boot check warning:', err.message));

      // Periodic check
      const intervalMs = Math.max(1, env.SLA_MONITOR_INTERVAL_MINUTES) * 60 * 1000;
      setInterval(() => {
        runSLAMonitorCheck().catch((err) => console.warn('SLA periodic monitor error:', err.message));
      }, intervalMs);
    }

    // Graceful shutdown on process reload / signals
    const gracefulShutdown = () => {
      httpServer.close(() => {
        process.exit(0);
      });
    };
    process.once('SIGINT', gracefulShutdown);
    process.once('SIGTERM', gracefulShutdown);
  } catch (error) {
    console.error('❌ Failed to start CivicConnect API server:', error);
    process.exit(1);
  }
}

startServer();

export { httpServer };
