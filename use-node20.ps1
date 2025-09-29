# PowerShell script to use Node.js 20.19.0 for this project
# Run this script to set up the correct Node.js version for development

$nodePath = "$env:TEMP\node20-19\node-v20.19.0-win-x64"
if (Test-Path $nodePath) {
    $env:PATH = "$nodePath;" + $env:PATH
    Write-Host "✅ Node.js 20.19.0 is now active"
    Write-Host "Run 'pnpm dev' to start the development server"
} else {
    Write-Host "❌ Node.js 20.19.0 not found. Run the setup again."
}
