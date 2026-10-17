Write-Host "Kitna load test karna hai? Select karo:" -ForegroundColor Cyan
Write-Host "1) 0 - 100 users"
Write-Host "2) 100 - 1000 users"
Write-Host "3) 1000 - 2000 users"
Write-Host "4) 2000 - 5000 users"

$choice = Read-Host "Enter number (1-4)"

switch ($choice) {
  "1" { $profile = "100" }
  "2" { $profile = "1000" }
  "3" { $profile = "2000" }
  "4" { $profile = "5000" }
  default { $profile = "100" }
}

Write-Host "Running with $profile users profile..." -ForegroundColor Green

k6 run -e PROFILE=$profile loadtest.js