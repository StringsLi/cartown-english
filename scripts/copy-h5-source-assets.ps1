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

Write-Output "Copied H5 source assets."
