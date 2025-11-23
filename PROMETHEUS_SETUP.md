# Grafana Cloud Prometheus Setup for Render Backend

This guide shows how to push metrics from your Render backend to Grafana Cloud Prometheus.

## Step 1: Get Prometheus Credentials from Grafana Cloud

1. **Go to Grafana Cloud:**
   - Visit: https://grafana.com/
   - Sign in to your account

2. **Navigate to your Stack:**
   - Go to: https://grafana.com/orgs/[your-org]/stacks
   - Click on your **tklegend** stack

3. **Find Prometheus Details:**
   - Look for the **"Prometheus"** or **"Metrics"** section
   - Copy the **Remote Write Endpoint** 
     - Format: `https://prometheus-prod-XX-XX.grafana.net/api/prom/push`
   - Note the **Username/Instance ID** (e.g., `1398414`)

4. **Generate API Token:**
   - Go to: https://grafana.com/orgs/[your-org]/access-policies
   - Click **"Create access policy"**
   - Name: `Render Backend Metrics`
   - Scopes: Select **"metrics:write"** ✓
   - Click **"Create"**
   - Click **"Add token"**
   - Name: `render-metrics`
   - Click **"Create token"**
   - **COPY THE TOKEN** (starts with `glc_...`)

## Step 2: Add Environment Variables to Render

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com/
   - Select your **TT-CNPM backend** service

2. **Add Environment Variables:**
   - Go to **Environment** tab
   - Click **"Add Environment Variable"**
   
   Add these three variables:
   
   **Variable 1:**
   - Key: `PROMETHEUS_REMOTE_WRITE_URL`
   - Value: `https://prometheus-prod-XX-XX.grafana.net/api/prom/push`
   
   **Variable 2:**
   - Key: `PROMETHEUS_USER`
   - Value: `1398414` (your instance ID)
   
   **Variable 3:**
   - Key: `PROMETHEUS_PASSWORD`
   - Value: `glc_...` (the API token you generated)

3. **Save Changes** - Render will automatically redeploy

## Step 3: Deploy and Verify

1. **Commit and push your code:**
   ```bash
   git add .
   git commit -m "feat: add Prometheus metrics push to Grafana Cloud"
   git push origin develop
   ```

2. **Wait for Render to deploy** (~2-3 minutes)

3. **Check Render logs:**
   - Look for: `📊 Metrics pusher started - sending to Grafana Cloud every 30s`
   - Look for: `✅ Metrics pushed to Grafana Cloud`

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
