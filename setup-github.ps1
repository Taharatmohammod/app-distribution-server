# PowerShell script to set up GitHub repository
Write-Host "Setting up GitHub repository..." -ForegroundColor Green

# Check if git is available
try {
    $gitVersion = git --version
    Write-Host "Git version: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git not found. Please restart your terminal and try again." -ForegroundColor Red
    exit 1
}

# Check current remote
Write-Host "Checking current remote configuration..." -ForegroundColor Yellow
git remote -v

# Remove existing remote if it exists
Write-Host "Removing existing remote if any..." -ForegroundColor Yellow
git remote remove origin 2>$null

# Instructions for GitHub setup
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://github.com and create a new repository" -ForegroundColor White
Write-Host "2. Name it 'app-distribution-server'" -ForegroundColor White
Write-Host "3. Don't initialize with README (you already have one)" -ForegroundColor White
Write-Host "4. Copy the repository URL" -ForegroundColor White
Write-Host "5. Run: git remote add origin YOUR_REPOSITORY_URL" -ForegroundColor White
Write-Host "6. Run: git push -u origin master" -ForegroundColor White

Write-Host "`nOr use GitHub CLI (if available):" -ForegroundColor Cyan
Write-Host "1. Run: gh auth login" -ForegroundColor White
Write-Host "2. Run: gh repo create app-distribution-server --public --source=. --remote=origin --push" -ForegroundColor White

Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 