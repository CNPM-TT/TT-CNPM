import promClient from 'prom-client';
import https from 'https';
import http from 'http';

// Configuration from environment variables
const PROMETHEUS_REMOTE_WRITE_URL = process.env.PROMETHEUS_REMOTE_WRITE_URL;
const PROMETHEUS_USER = process.env.PROMETHEUS_USER;
const PROMETHEUS_PASSWORD = process.env.PROMETHEUS_PASSWORD;

// Push metrics to Grafana Cloud Prometheus using remote write protocol
export function startMetricsPusher() {
  if (!PROMETHEUS_REMOTE_WRITE_URL || !PROMETHEUS_USER || !PROMETHEUS_PASSWORD) {
    console.log('⚠️  Prometheus remote write not configured, metrics will only be available locally at /metrics');
    return;
  }

  // Push metrics every 30 seconds
  setInterval(async () => {
    try {
      // Get metrics in Prometheus format
      const metrics = await promClient.register.metrics();
      
      // Parse URL
      const url = new URL(PROMETHEUS_REMOTE_WRITE_URL);
      const isHttps = url.protocol === 'https:';
      const httpModule = isHttps ? https : http;
      
      // Prepare request options
      const auth = Buffer.from(`${PROMETHEUS_USER}:${PROMETHEUS_PASSWORD}`).toString('base64');
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`,
          'Content-Length': Buffer.byteLength(metrics),
        },
      };
      
      // Send request
      const req = httpModule.request(options, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Metrics pushed to Grafana Cloud');
        } else {
          console.error(`❌ Failed to push metrics: ${res.statusCode}`);
          res.on('data', (chunk) => console.error(chunk.toString()));
        }
      });
      
      req.on('error', (err) => {
        console.error('❌ Error pushing metrics:', err.message);
      });
      
      req.write(metrics);
      req.end();
      
    } catch (error) {
      console.error('❌ Error collecting metrics:', error.message);
    }
  }, 30000); // Every 30 seconds

  console.log('📊 Metrics pusher started - sending to Grafana Cloud every 30s');
}

