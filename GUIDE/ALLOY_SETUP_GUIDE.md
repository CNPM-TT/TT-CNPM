# Quick Setup Guide: Monitor Render Backend Traffic with Grafana

This guide shows you how to monitor your Render backend's traffic, API calls, and performance metrics using Grafana Cloud.

## What You'll Get

After setup, you'll see in Grafana:
- 📊 **Request rate** (requests per second)
- ⏱️ **Response times** (latency, p95, p99)
- 🔢 **Status codes** (200s, 400s, 500s)
- 📍 **Top endpoints** (which APIs are called most)
- ❌ **Error rates** (failed requests)

## Step 1: Get Your Grafana Cloud Credentials

1. Go to: https://grafana.com/orgs/[your-org]/stacks
2. Click your **tklegend** stack
3. Find **Prometheus** section
4. Note these values:
   - **Remote Write URL**: Should be `https://prometheus-prod-020.grafana.net/api/prom/push`
   - **Username**: `1398414` (you already have this)
5. Generate **API Token**:
   - Go to: https://grafana.com/orgs/[your-org]/access-policies
   - Create access policy → Scopes: **metrics:write** ✓
   - Add token → Copy it

## Step 2: Download Grafana Alloy

**Option A: Download installer**
1. Visit: https://github.com/grafana/alloy/releases/latest
2. Download: `alloy-installer-windows-amd64.exe.zip`
3. Extract and install

**Option B: Portable version (recommended)**
```powershell
# Create folder
New-Item -ItemType Directory -Path "C:\grafana-alloy" -Force

# Download (replace version if needed)
Invoke-WebRequest -Uri "https://github.com/grafana/alloy/releases/download/v1.5.1/alloy-windows-amd64.exe.zip" -OutFile "$env:TEMP\alloy.zip"

# Extract
Expand-Archive -Path "$env:TEMP\alloy.zip" -DestinationPath "C:\grafana-alloy" -Force
```

## Step 3: Configure Alloy

1. **Edit `alloy-config.alloy` in your project:**
   - Replace `YOUR_API_TOKEN_HERE` with your actual API token
   - Verify the URL matches your Grafana Cloud instance

2. **Copy config to Alloy folder:**
   ```powershell
   Copy-Item "alloy-config.alloy" -Destination "C:\grafana-alloy\config.alloy"
   ```

## Step 4: Run Grafana Alloy

```powershell
# Navigate to Alloy folder
cd C:\grafana-alloy

# Run Alloy (keep this terminal open)
.\alloy-windows-amd64.exe run config.alloy
```

You should see:
```
ts=... level=info msg="starting Alloy"
ts=... level=info component=prometheus.scrape msg="scraping target" target=https://tt-cnpm.onrender.com/metrics
```

**Keep this terminal running** - it scrapes your backend every 30 seconds!

## Step 5: Verify Metrics in Grafana

1. Go to: https://tklegend.grafana.net/explore
2. Select **Prometheus** data source (not Loki)
3. Try these queries:

**Request rate:**
```promql
rate(http_request_duration_seconds_count[5m])
```

**Top endpoints:**
```promql
topk(10, sum by (path) (rate(http_request_duration_seconds_count[5m])))
```

**Status codes:**
```promql
sum by (status_code) (rate(http_request_duration_seconds_count[5m]))
```

**Response time (95th percentile):**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

## Step 6: Create Dashboard

1. Go to **Dashboards** → **New Dashboard**
2. Add these panels:

### Panel 1: Request Rate
- Query: `sum(rate(http_request_duration_seconds_count[5m]))`
- Visualization: **Graph**
- Title: "Requests per Second"

### Panel 2: Response Time
- Query: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))`
- Visualization: **Graph**
- Title: "Response Time (p95)"
- Unit: seconds (s)

### Panel 3: Status Codes
- Query: `sum by (status_code) (increase(http_request_duration_seconds_count[1h]))`
- Visualization: **Pie chart**
- Title: "Status Codes (Last Hour)"

### Panel 4: Top Endpoints
- Query: `topk(10, sum by (path) (rate(http_request_duration_seconds_count[5m])))`
- Visualization: **Bar chart**
- Title: "Top 10 API Endpoints"

### Panel 5: Error Rate
- Query: `sum(rate(http_request_duration_seconds_count{status_code=~"5.."}[5m]))`
- Visualization: **Stat**
- Title: "5xx Errors/sec"
- Thresholds: Green (0), Yellow (0.1), Red (1)

## Running Alloy as a Service (Optional)

To keep Alloy running in the background:

**Using Task Scheduler:**
```powershell
# Create a scheduled task that runs on startup
$action = New-ScheduledTaskAction -Execute "C:\grafana-alloy\alloy-windows-amd64.exe" -Argument "run C:\grafana-alloy\config.alloy"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType Interactive
Register-ScheduledTask -TaskName "Grafana Alloy" -Action $action -Trigger $trigger -Principal $principal
```

## Troubleshooting

### Metrics not appearing?
1. Check Alloy logs for errors
2. Verify `/metrics` endpoint: https://tt-cnpm.onrender.com/metrics
3. Confirm API token has `metrics:write` scope
4. Check if Alloy is running

### High CPU usage?
- Increase scrape interval from 30s to 60s in config

### Can't keep terminal open?
- Use Task Scheduler (see above)
- Or use Windows Subsystem for Linux (WSL) with systemd

## Summary

✅ **What's happening:**
- Alloy runs on your local machine
- Every 30 seconds, it scrapes `https://tt-cnpm.onrender.com/metrics`
- It sends the data to Grafana Cloud
- You see live traffic metrics in Grafana dashboards

✅ **Cost:** Free (within Grafana Cloud free tier limits)

✅ **Performance impact:** Minimal - just 1 HTTP request every 30 seconds to your backend
