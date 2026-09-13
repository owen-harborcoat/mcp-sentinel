# Calls the eventual API; never delete a database out from under a running process.
$ErrorActionPreference = 'Stop'
Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:8787/api/reset' -ContentType 'application/json' -Body '{}'
