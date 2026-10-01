# Deploys the hardened Edge Functions to the Arcanum Supabase project.
#
# Before running:
#   1. npx.cmd supabase login            (once)
#   2. Apply supabase/migrations/20261001120000_oracle_daily_quota.sql in the Supabase SQL editor.
#   3. Create a NEW Groq API key in the Groq console (never paste keys into chat or into the repo).
#
# Run from the repo root:   powershell -ExecutionPolicy Bypass -File scripts/deploy-functions.ps1

$ErrorActionPreference = "Stop"
$ref = "mrmvmoyysxuopqexbxfk"

function Run($args_) {
  & npx.cmd -y supabase @args_
  if ($LASTEXITCODE -ne 0) { throw "supabase command failed: $($args_ -join ' ')" }
}

$applied = Read-Host "Did you apply the oracle quota migration in the SQL editor? (y/n)"
if ($applied -ne "y") { Write-Host "Apply the migration first, then run this script again."; exit 1 }

# --- Secrets for the free-tier model (Groq) ---
$setKey = Read-Host "Set the Groq key and model secrets now? (y/n)"
if ($setKey -eq "y") {
  $secure = Read-Host "Paste your Groq API key (input is hidden)" -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    $model = Read-Host "Model name (press Enter for llama-3.3-70b-versatile)"
    if ([string]::IsNullOrWhiteSpace($model)) { $model = "llama-3.3-70b-versatile" }
    $envFile = Join-Path $env:TEMP "arcanum-oracle-secrets.env"
    try {
      Set-Content -Path $envFile -Value @(
        "ORACLE_BASE_URL=https://api.groq.com/openai/v1",
        "ORACLE_MODEL=$model",
        "ORACLE_API_KEY=$plain"
      ) -Encoding ascii
      Run @("secrets", "set", "--env-file", $envFile, "--project-ref", $ref)
    } finally {
      if (Test-Path $envFile) { Remove-Item $envFile -Force }
    }
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

$unset = Read-Host "Remove the old OPENAI_API_KEY secret so nothing can bill you? (y/n)"
if ($unset -eq "y") { Run @("secrets", "unset", "OPENAI_API_KEY", "--project-ref", $ref) }

# --- Deploy, most urgent first ---
$functions = @("arcanum-community", "arcanum-state", "arcanum-admin", "arcanum-oracle", "astrael-player")
foreach ($fn in $functions) {
  Write-Host "Deploying $fn ..."
  Run @("functions", "deploy", $fn, "--project-ref", $ref, "--no-verify-jwt")
}

Write-Host "Done. Check the Supabase dashboard: each function should show a new version."
