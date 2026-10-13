import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { monitorEventLoopDelay } from 'perf_hooks';

// Event loop delay histogram (resolution in milliseconds)
let eventLoopHistogram: any = null;
try {
  eventLoopHistogram = monitorEventLoopDelay({ resolution: 20 });
  eventLoopHistogram.enable();
} catch (e) {
  // Fallback for environments without perf_hooks histogram
}

interface LatencyBucket {
  count: number;
  totalMs: number;
  minMs: number;
  maxMs: number;
}

class MetricsRegistry {
  private requestCount = 0;
  private statusCodes: Record<string, number> = {
    '2xx': 0,
    '3xx': 0,
    '4xx': 0,
    '5xx': 0,
  };
  private methodCounts: Record<string, number> = {};
  private latencySamples: number[] = [];
  private maxSamples = 1000;

  // External dependency metrics
  private geminiCalls = 0;
  private geminiSuccess = 0;
  private geminiErrors = 0;
  private geminiTimeouts = 0;
  private geminiTotalDurationMs = 0;

  // Upload metrics
  private uploadAttempts = 0;
  private uploadFailures = 0;

  // Background Job metrics
  private slaJobRuns = 0;
  private slaJobFailures = 0;
  private slaLastRunDurationMs = 0;
  private slaLastRunTimestamp: string | null = null;

  public recordRequest(method: string, statusCode: number, durationMs: number) {
    this.requestCount++;
    this.methodCounts[method] = (this.methodCounts[method] || 0) + 1;

    if (statusCode >= 200 && statusCode < 300) this.statusCodes['2xx']++;
    else if (statusCode >= 300 && statusCode < 400) this.statusCodes['3xx']++;
    else if (statusCode >= 400 && statusCode < 500) this.statusCodes['4xx']++;
    else if (statusCode >= 500) this.statusCodes['5xx']++;

    this.latencySamples.push(durationMs);
    if (this.latencySamples.length > this.maxSamples) {
      this.latencySamples.shift();
    }
  }

  public recordGeminiCall(durationMs: number, success: boolean, isTimeout = false) {
    this.geminiCalls++;
    this.geminiTotalDurationMs += durationMs;
    if (success) {
      this.geminiSuccess++;
    } else {
      this.geminiErrors++;
      if (isTimeout) this.geminiTimeouts++;
    }
  }

  public recordUpload(success: boolean) {
    this.uploadAttempts++;
    if (!success) this.uploadFailures++;
  }

  public recordSlaJob(durationMs: number, success: boolean) {
    this.slaJobRuns++;
    this.slaLastRunDurationMs = durationMs;
    this.slaLastRunTimestamp = new Date().toISOString();
    if (!success) this.slaJobFailures++;
  }

  public getPercentiles(): { p50: number; p90: number; p95: number; p99: number; avg: number } {
    if (this.latencySamples.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0, avg: 0 };
    }

    const sorted = [...this.latencySamples].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const avg = Math.round((sum / sorted.length) * 100) / 100;

    const getP = (p: number) => {
      const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
      return Math.round(sorted[idx] * 100) / 100;
    };

    return {
      p50: getP(50),
      p90: getP(90),
      p95: getP(95),
      p99: getP(99),
      avg,
    };
  }

  public getSnapshot() {
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();
    const latencies = this.getPercentiles();

    const eventLoopLagMs = eventLoopHistogram
      ? Math.round((eventLoopHistogram.mean / 1e6) * 100) / 100
      : 0;

    return {
      uptimeSeconds: Math.round(process.uptime()),
      requests: {
        total: this.requestCount,
        byMethod: this.methodCounts,
        byStatus: this.statusCodes,
      },
      latencyMs: latencies,
      eventLoopLagMs,
      process: {
        memory: {
          heapUsedMb: Math.round((mem.heapUsed / (1024 * 1024)) * 100) / 100,
          heapTotalMb: Math.round((mem.heapTotal / (1024 * 1024)) * 100) / 100,
          rssMb: Math.round((mem.rss / (1024 * 1024)) * 100) / 100,
          externalMb: Math.round((mem.external / (1024 * 1024)) * 100) / 100,
        },
        cpu: {
          userSeconds: Math.round(cpu.user / 1e6),
          systemSeconds: Math.round(cpu.system / 1e6),
        },
      },
      database: {
        readyState: mongoose.connection.readyState,
        status:
          mongoose.connection.readyState === 1
            ? 'CONNECTED'
            : mongoose.connection.readyState === 2
            ? 'CONNECTING'
            : 'DISCONNECTED',
      },
      geminiAi: {
        totalCalls: this.geminiCalls,
        successful: this.geminiSuccess,
        errors: this.geminiErrors,
        timeouts: this.geminiTimeouts,
        avgLatencyMs:
          this.geminiCalls > 0
            ? Math.round((this.geminiTotalDurationMs / this.geminiCalls) * 100) / 100
            : 0,
      },
      uploads: {
        total: this.uploadAttempts,
        failures: this.uploadFailures,
        failureRate:
          this.uploadAttempts > 0
            ? `${Math.round((this.uploadFailures / this.uploadAttempts) * 100)}%`
            : '0%',
      },
      backgroundJobs: {
        slaMonitor: {
          runs: this.slaJobRuns,
          failures: this.slaJobFailures,
          lastDurationMs: this.slaLastRunDurationMs,
          lastRunAt: this.slaLastRunTimestamp,
        },
      },
    };
  }
}

export const metricsRegistry = new MetricsRegistry();

// Structured Request Logging & Telemetry Middleware
export function requestTelemetryMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  (req as any).id = requestId;
  res.setHeader('X-Request-Id', requestId);

  const startHrTime = process.hrtime.bigint();

  res.on('finish', () => {
    const endHrTime = process.hrtime.bigint();
    const durationMs = Number(endHrTime - startHrTime) / 1e6;

    // Record in metrics registry (exclude health check polling from skewing percentiles)
    const isProbe = req.path === '/health' || req.path === '/ready' || req.path === '/api/health';
    if (!isProbe) {
      metricsRegistry.recordRequest(req.method, res.statusCode, durationMs);
    }

    // Structured log in production / staging
    if (res.statusCode >= 500) {
      console.error(
        JSON.stringify({
          level: 'ERROR',
          requestId,
          method: req.method,
          url: req.originalUrl || req.url,
          status: res.statusCode,
          durationMs: Math.round(durationMs * 100) / 100,
          ip: req.ip,
          timestamp: new Date().toISOString(),
        })
      );
    } else if (durationMs > 1000 && !isProbe) {
      // Warn on slow queries (> 1 second)
      console.warn(
        JSON.stringify({
          level: 'WARN',
          tag: 'SLOW_REQUEST',
          requestId,
          method: req.method,
          url: req.originalUrl || req.url,
          status: res.statusCode,
          durationMs: Math.round(durationMs * 100) / 100,
          timestamp: new Date().toISOString(),
        })
      );
    }
  });

  next();
}
