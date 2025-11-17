import promBundle from 'express-prom-bundle';

// Create Prometheus metrics middleware
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { app: 'tt-cnpm-backend' },
  promClient: {
    collectDefaultMetrics: {
      timeout: 1000,
    },
  },
});

export default metricsMiddleware;
