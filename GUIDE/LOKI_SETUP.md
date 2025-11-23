# Grafana Loki Setup Guide

This guide explains how to send test error logs to Grafana Loki (included in Grafana Cloud free tier).

## Step 1: Get Your Loki Credentials

1. Go to your Grafana Cloud portal: https://grafana.com/auth/sign-in/
2. Navigate to **My Account** → **Stack** → Click on your stack (tklegend)
3. Click **Send Logs** or go to **Details** → **Loki**
4. You'll see:
   - **URL**: `https://logs-prod-xxx.grafana.net/loki/api/v1/push`
   - **User ID**: Your instance number (e.g., `123456`)

5. Generate an API Key:
   - Go to **Cloud Portal** → **Security** → **API Keys**
   - Or visit: https://grafana.com/orgs/[your-org]/api-keys
   - Click **Create API Key**
   - Name: `GitHub Actions Logs`
   - Role: **MetricsPublisher** (allows writing logs)
   - Click **Add API Key** and copy the key

## Step 2: Add Secrets to GitHub Repository

1. Go to your GitHub repository: https://github.com/ToanTranDuc/TT-CNPM
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these three secrets:

   - **Name**: `LOKI_URL`
     - **Value**: `https://logs-prod-xxx.grafana.net/loki/api/v1/push`
   
   - **Name**: `LOKI_USER`
     - **Value**: Your user ID (e.g., `123456`)
   
   - **Name**: `LOKI_API_KEY`
     - **Value**: The API key you generated

## Step 3: Test the Setup

1. Commit and push the workflow changes
2. Deliberately fail a test to trigger the log upload
3. Wait for the workflow to complete
4. Go to Grafana Cloud → **Explore** → Select **Loki** as data source
5. Query: `{app="backend-tests"}` to see all test logs
6. Filter by status: `{app="backend-tests", status="failure"}`

## Step 4: Create Grafana Dashboard for Test Errors

1. Go to **Dashboards** → **New** → **New Dashboard**
2. Add a **Logs** panel:
   - Data source: **Loki**
   - Query: `{app="backend-tests", status="failure"}`
   
3. Add a **Stat** panel for error count:
   - Query: `count_over_time({app="backend-tests", status="failure"}[24h])`
   - Title: "Failed Tests (Last 24h)"

4. Add a **Table** panel for recent failures:
   - Query: `{app="backend-tests", status="failure"} | json`
   - Transform: Group by `branch`, `commit`

## Useful Loki Queries

```logql
# All test failures
{app="backend-tests", status="failure"}

# Failures on develop branch
{app="backend-tests", branch="develop", status="failure"}

# Count failures in last hour
count_over_time({app="backend-tests", status="failure"}[1h])

# Search for specific error
{app="backend-tests"} |= "cart test(s) failed"

# Filter by workflow run
{app="backend-tests", run_id="123456789"}
```

## What Gets Logged

Each failed test run sends:
- Full test output (all console logs)
- Metadata:
  - Workflow name
  - Repository
  - Branch
  - Commit SHA
  - GitHub run ID
  - Timestamp

## Free Tier Limits

Grafana Cloud Free Tier includes:
- **Logs**: 50 GB ingestion per month
- **Retention**: 14 days
- **Series**: 10,000 active series

This is more than enough for test logging!

## Troubleshooting

### Logs not appearing in Grafana?
1. Check GitHub Actions logs for "Failed to send logs to Loki" message
2. Verify secrets are correctly set in GitHub repository settings
3. Confirm Loki URL ends with `/loki/api/v1/push`
4. Check API key has **MetricsPublisher** role

### How to find my Loki URL?
1. Go to https://grafana.com/
2. Click on your organization
3. Go to **Stacks** → Your stack → **Details**
4. Look for **Loki** section

### Alternative: Grafana Alloy

If you prefer, you can also use **Grafana Alloy** (newer agent) instead of direct API calls. Let me know if you want that setup!
