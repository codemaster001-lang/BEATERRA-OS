param(
  [int]$QuietPeriodSeconds = 10,
  [int]$PollIntervalSeconds = 2
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repositoryRoot

function Invoke-Git {
  param([string[]]$Arguments)

  & git @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Git command failed: git $($Arguments -join ' ')"
  }
}

function Get-WorktreeSignature {
  $status = @(git status --porcelain --untracked-files=all)
  if ($LASTEXITCODE -ne 0) {
    throw 'Unable to read the Git worktree status.'
  }

  return ($status -join "`n")
}

function Sync-Changes {
  $signatureBeforeAdd = Get-WorktreeSignature
  if ([string]::IsNullOrWhiteSpace($signatureBeforeAdd)) {
    return $false
  }

  Invoke-Git @('add', '--all')
  $stagedChanges = @(git diff --cached --name-only)
  if ($LASTEXITCODE -ne 0) {
    throw 'Unable to inspect staged changes.'
  }

  if ($stagedChanges.Count -eq 0) {
    return $false
  }

  $message = "Mise à jour BEATERRA OS`n`nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
  Invoke-Git @('commit', '-m', $message)

  try {
    Invoke-Git @('push', 'origin', 'HEAD')
  } catch {
    Write-Error "Commit created, but push failed. Local changes are preserved. $($_.Exception.Message)"
    return $true
  }

  Write-Host "Synchronisation GitHub terminée : $($stagedChanges.Count) fichier(s)." -ForegroundColor Green
  return $true
}

$lastSignature = Get-WorktreeSignature
$lastChangeAt = Get-Date

Write-Host "Surveillance GitHub active sur $repositoryRoot" -ForegroundColor Cyan
Write-Host "Délai après dernière modification : $QuietPeriodSeconds seconde(s)." -ForegroundColor Cyan

while ($true) {
  Start-Sleep -Seconds $PollIntervalSeconds
  $currentSignature = Get-WorktreeSignature

  if ($currentSignature -ne $lastSignature) {
    $lastSignature = $currentSignature
    $lastChangeAt = Get-Date
    continue
  }

  if (
    -not [string]::IsNullOrWhiteSpace($currentSignature) -and
    ((Get-Date) - $lastChangeAt).TotalSeconds -ge $QuietPeriodSeconds
  ) {
    [void](Sync-Changes)
    $lastSignature = Get-WorktreeSignature
    $lastChangeAt = Get-Date
  }
}
