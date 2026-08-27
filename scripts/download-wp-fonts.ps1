/**
 * Re-download Reckless Neue + NHaas woff2 from fasandsabrina.com (WordPress theme).
 *
 * Run from frontend/:
 *   pwsh scripts/download-wp-fonts.ps1
 */
$dest = Join-Path $PSScriptRoot "..\src\app\fonts"
$base = "https://fasandsabrina.com/wp-content/themes/twentynineteen/fonts-new"
$map = [ordered]@{
  "RecklessNeue-Thin.woff2"       = "RecklessNeue-Thin.woff2"
  "RecklessNeue-Light.woff2"      = "RecklessNeue-Light.woff2"
  "RecklessNeue-Book.woff2"       = "RecklessNeue-Book.woff2"
  "RecklessNeue-Regular.woff2"    = "RecklessNeue-Regular.woff2"
  "RecklessNeue-Medium.woff2"     = "RecklessNeue-Medium.woff2"
  "RecklessNeue-SemiBold.woff2"   = "RecklessNeue-SemiBold.woff2"
  "RecklessNeue-Bold_1.woff2"     = "RecklessNeue-Bold.woff2"
  "RecklessNeue-BookItalic.woff2" = "RecklessNeue-BookItalic.woff2"
  "NHaasGroteskTXPro-55Rg.woff2"  = "NHaasGroteskTXPro-55Rg.woff2"
  "NHaasGroteskTXPro-65Md.woff2"  = "NHaasGroteskTXPro-65Md.woff2"
  "NHaasGroteskDSPro-55Rg.woff2"  = "NHaasGroteskDSPro-55Rg.woff2"
}

foreach ($entry in $map.GetEnumerator()) {
  $url = "$base/$($entry.Key)"
  $out = Join-Path $dest $entry.Value
  Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
  $len = (Get-Item $out).Length
  if ($len -lt 1000) { throw "Download failed or empty: $($entry.Value)" }
  Write-Host "OK $($entry.Value) ($len bytes)"
}

Write-Host "Done. @font-face rules: src/app/fonts/reckless-neue.css"
