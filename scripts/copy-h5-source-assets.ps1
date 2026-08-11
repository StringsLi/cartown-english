$ErrorActionPreference = "Stop"

$workspace = Resolve-Path (Join-Path $PSScriptRoot "..")
$sourceRoot = Join-Path $workspace "docs\source-assets"
$targetRoot = Join-Path $workspace "dist\build\h5\docs\source-assets"
$assetFolders = @("books-original", "topic-icons-original", "cartown-logos-original", "audio-original")

New-Item -ItemType Directory -Force -Path $targetRoot | Out-Null

foreach ($folder in $assetFolders) {
  $source = Join-Path $sourceRoot $folder
  $target = Join-Path $targetRoot $folder
  New-Item -ItemType Directory -Force -Path $target | Out-Null
  Get-ChildItem -LiteralPath $source -Force | Copy-Item -Destination $target -Recurse -Force
}

$sourceAppRoot = Join-Path $workspace "src"
$packageDirectories = Get-ChildItem -LiteralPath $sourceAppRoot -Directory -Filter "pkg-*"
foreach ($packageDirectory in $packageDirectories) {
  $packageStatic = Join-Path $packageDirectory.FullName "static"
  if (-not (Test-Path -LiteralPath $packageStatic)) {
    continue
  }

  $packageTarget = Join-Path $workspace ("dist\build\h5\" + $packageDirectory.Name + "\static")
  New-Item -ItemType Directory -Force -Path $packageTarget | Out-Null
  Get-ChildItem -LiteralPath $packageStatic -Force | Copy-Item -Destination $packageTarget -Recurse -Force
}

Write-Output "Copied H5 source assets."
