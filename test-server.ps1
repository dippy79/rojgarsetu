# Test the API server
$ErrorActionPreference = "SilentlyContinue"

# Start server in background
$serverJob = Start-Job -ScriptBlock {
    Set-Location "F:\Rojgarsetu"
    node server.js
} 

# Wait for server to start
Start-Sleep -Seconds 6

# Test health endpoint
Write-Host "=== Testing Health Endpoint ==="
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 5
    Write-Host "Status: $($health.status)"
    Write-Host "Database: $($health.database)"
    if ($health.stats) {
        Write-Host "Total Jobs: $($health.stats.totalJobs)"
        Write-Host "Government Jobs: $($health.stats.governmentJobs)"
        Write-Host "Private Jobs: $($health.stats.privateJobs)"
        Write-Host "Courses: $($health.stats.totalCourses)"
    }
} catch {
    Write-Host "Health check failed: $_"
}

# Test jobs endpoint
Write-Host "`n=== Testing Jobs Endpoint ==="
try {
    $jobs = Invoke-RestMethod -Uri "http://localhost:5000/api/jobs?limit=2" -Method Get -TimeoutSec 5
    Write-Host "Success: $($jobs.success)"
    Write-Host "Jobs returned: $($jobs.jobs.Count)"
    if ($jobs.jobs.Count -gt 0) {
        Write-Host "First job: $($jobs.jobs[0].title)"
    }
} catch {
    Write-Host "Jobs API failed: $_"
}

# Test courses endpoint
Write-Host "`n=== Testing Courses Endpoint ==="
try {
    $courses = Invoke-RestMethod -Uri "http://localhost:5000/api/courses?limit=2" -Method Get -TimeoutSec 5
    Write-Host "Success: $($courses.success)"
    Write-Host "Courses returned: $($courses.courses.Count)"
    if ($courses.courses.Count -gt 0) {
        Write-Host "First course: $($courses.courses[0].title)"
    }
} catch {
    Write-Host "Courses API failed: $_"
}

# Clean up
Stop-Job $serverJob -ErrorAction SilentlyContinue
Remove-Job $serverJob -Force

Write-Host "`n=== Tests Complete ==="
