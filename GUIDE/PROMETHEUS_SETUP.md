# Grafana Cloud Prometheus Setup for Render Backend

This guide shows how to monitor your Render backend metrics with Grafana Cloud.

## The Problem with Push from Render

Pushing metrics from Render to Grafana Cloud requires the Prometheus Remote Write protocol (Protobuf + Snappy compression), which is complex to implement. Instead, we'll use **Grafana Cloud to scrape** your metrics endpoint.

## Solution: Let Grafana Cloud Scrape Your Metrics

Your backend already exposes metrics at `/metrics`. We'll configure Grafana Cloud to scrape this endpoint.

## Step 1: Verify Your Metrics Endpoint

1. **Visit your metrics endpoint:**
   - URL: `https://tt-cnpm.onrender.com/metrics`
   - You should see Prometheus-format metrics like:
     ```
     # HELP http_request_duration_seconds Request duration
     # TYPE http_request_duration_seconds histogram
     http_request_duration_seconds_bucket{le="0.1",path="/api/user/login",method="POST",status_code="200"} 5
     ```

## Step 2: Configure Grafana Cloud to Scrape

### Option A: Using Grafana Alloy (Recommended for Render)

Since Render doesn't allow you to install agents, we'll use **Grafana Cloud's Hosted Prometheus** with external scraping:

1. **Go to Grafana Cloud:**
   - Visit: https://grafana.com/orgs/[your-org]/stacks
   - Click your stack → **Integrations**

2. **Add Prometheus Scrape Config:**
   - Unfortunately, Grafana Cloud free tier doesn't support external scraping directly
   - We need to use **Synthetic Monitoring** or run **Grafana Alloy** elsewhere

### Option B: Run Grafana Alloy on Your Local Machine (Development)

1. **Download Grafana Alloy:**
   - Windows: https://github.com/grafana/alloy/releases
   - Or use Docker: `docker run -v /path/to/config.alloy:/etc/alloy/config.alloy grafana/alloy`

2. **Create Alloy config file** (`config.alloy`):

## Step 4: View Metrics in Grafana

1. **Go to Grafana Explore:**
   - Visit: https://tklegend.grafana.net/explore
   - Select **Prometheus** data source (not Loki)

2. **Try these queries:**

   **Request rate (requests per second):**
   ```promql
   rate(http_request_duration_seconds_count[5m])
   ```

   **Requests by status code:**
   ```promql
   sum by (status_code) (rate(http_request_duration_seconds_count[5m]))
   ```

   **Response time (95th percentile):**
   ```promql
   histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
   ```

   **Requests by endpoint:**
   ```promql
   sum by (path) (rate(http_request_duration_seconds_count[5m]))
   ```

   **Error rate:**
   ```promql
   sum(rate(http_request_duration_seconds_count{status_code=~"5.."}[5m]))
   ```

## Step 5: Create Grafana Dashboard

1. **Go to Dashboards** → **New** → **New Dashboard**

2. **Add Panel 1: Request Rate**
   - Query: `rate(http_request_duration_seconds_count[5m])`
   - Visualization: **Graph**
   - Title: "Requests per Second"

3. **Add Panel 2: Response Time**
   - Query: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
   - Visualization: **Graph**
   - Title: "Response Time (95th percentile)"

4. **Add Panel 3: Status Codes**
   - Query: `sum by (status_code) (increase(http_request_duration_seconds_count[1h]))`
   - Visualization: **Pie Chart** or **Bar Chart**
   - Title: "HTTP Status Codes"

5. **Add Panel 4: Top Endpoints**
   - Query: `topk(10, sum by (path) (rate(http_request_duration_seconds_count[5m])))`
   - Visualization: **Bar Gauge**
   - Title: "Top 10 Endpoints by Request Rate"

6. **Add Panel 5: Error Rate**
   - Query: `sum(rate(http_request_duration_seconds_count{status_code=~"5.."}[5m]))`
   - Visualization: **Stat**
   - Title: "5xx Error Rate"
   - Thresholds: Green < 0.1, Red >= 0.1

## Available Metrics

Your backend exposes these metrics:

- `http_request_duration_seconds` - Request duration histogram
- `http_request_duration_seconds_count` - Total request count
- `http_request_duration_seconds_sum` - Total request duration
- `nodejs_heap_size_total_bytes` - Node.js heap memory
- `nodejs_heap_size_used_bytes` - Used heap memory
- `nodejs_eventloop_lag_seconds` - Event loop lag
- `process_cpu_user_seconds_total` - CPU usage
- `up` - Service uptime (1 = up, 0 = down)

## Troubleshooting

### Metrics not appearing in Grafana?

1. **Check Render logs:**
   - Look for error messages in deployment logs
   - Verify "Metrics pushed to Grafana Cloud" appears

2. **Verify credentials:**
   - Make sure all 3 environment variables are set correctly
   - API token must have `metrics:write` scope

3. **Test metrics endpoint locally:**
   - Visit: `https://tt-cnpm.onrender.com/metrics`
   - You should see Prometheus-format metrics

4. **Check Grafana data source:**
   - Go to Connections → Data sources
   - Find your Prometheus data source
   - Click "Test" to verify connection

### High metric cardinality warning?

If you get warnings about too many metrics:
- Reduce the push interval (change from 30s to 60s)
- Filter out high-cardinality labels in metrics middleware

## Free Tier Limits

Grafana Cloud Free Tier includes:
- **Metrics**: 10,000 active series
- **Retention**: 14 days
- **Data points**: 50M per month

Your backend should use ~100-500 series depending on traffic.
