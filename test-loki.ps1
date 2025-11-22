# Test script to send logs to Grafana Loki from local machine

# Your Loki credentials
$LOKI_URL = "https://logs-prod-020.grafana.net/loki/api/v1/push"
$LOKI_USER = "1398414"
$LOKI_API_KEY = "glc_eyJvIjoiMTU5MTY4MSIsIm4iOiJzdGFjay0xNDQwNjIwLWhsLXdyaXRlLXRlc3QiLCJrIjoibUQ4MkhHMTBHNnM3c0cxZjlpRHhDTTA3IiwibSI6eyJyIjoicHJvZC1hcC1zb3V0aGVhc3QtMSJ9fQ=="  # Replace with your actual API key

# Create test log message
# Convert to nanoseconds - Loki requires nanosecond precision
$epoch = [DateTimeOffset]::new(1970, 1, 1, 0, 0, 0, [TimeSpan]::Zero)
$now = [DateTimeOffset]::UtcNow
$nanoseconds = ($now - $epoch).Ticks * 100  # Ticks to nanoseconds
$timestamp = $nanoseconds.ToString()
$logMessage = "Test log from local machine at $(Get-Date)"

# Create JSON payload for Loki - must be exact format
$payload = @"
{
  "streams": [
    {
      "stream": {
        "job": "local-test",
        "app": "backend-tests",
        "source": "powershell"
      },
      "values": [
        ["$timestamp", "$logMessage"]
      ]
    }
  ]
}
"@

Write-Host "Sending test log to Loki..." -ForegroundColor Cyan
Write-Host "Payload:" -ForegroundColor Yellow
Write-Host $payload

# Send to Loki using Basic Auth
$base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${LOKI_USER}:${LOKI_API_KEY}"))

try {
    $response = Invoke-RestMethod -Uri $LOKI_URL `
        -Method Post `
        -Headers @{
            "Authorization" = "Basic $base64Auth"
            "Content-Type" = "application/json"
        } `
        -Body $payload

    Write-Host "`n✅ Success! Log sent to Loki" -ForegroundColor Green
    Write-Host "Check Grafana Explore with query: {app=`"backend-tests`", source=`"powershell`"}" -ForegroundColor Green
}
catch {
    Write-Host "`n❌ Failed to send log to Loki" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
