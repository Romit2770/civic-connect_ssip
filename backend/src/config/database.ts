import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';

export async function connectDatabase(): Promise<typeof mongoose> {
  try {
    mongoose.set('strictQuery', true);
    
    // Prefer IPv4 for SRV resolution
    try {
      if (dns.setDefaultResultOrder) {
        dns.setDefaultResultOrder('ipv4first');
      }
    } catch (_dnsErr) {
      // Ignore if environment restricts
    }
    
    const conn = await mongoose.connect(env.MONGODB_URI, {
      autoIndex: env.NODE_ENV !== 'production',
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error: any) {
    console.error('❌ MongoDB Connection Error:', error.message);
    throw error;
  }
}

/**
 * Lightweight ping check for /ready probe
 */
export async function pingDatabase(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  if (mongoose.connection.readyState !== 1) {
    return { ok: false, latencyMs: 0 };
  }
  try {
    await mongoose.connection.db?.admin().ping();
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB Disconnected. Attempting auto-reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Runtime Error:', err);
});
