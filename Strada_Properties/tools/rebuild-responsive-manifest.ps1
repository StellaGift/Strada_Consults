param(
  [string]$MagickPath = "C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe"
)

$ErrorActionPreference = "Stop"

$siteRoot = Split-Path -Parent $PSScriptRoot
$imagesRoot = Join-Path $siteRoot "images"
$responsiveRoot = Join-Path $imagesRoot "responsive"
$manifestPath = Join-Path $responsiveRoot "manifest.json"

if (!(Test-Path -LiteralPath $MagickPath)) {
  throw "ImageMagick was not found at $MagickPath"
}

$sourceFiles = Get-ChildItem -Path $imagesRoot -File |
  Where-Object { $_.Extension -match '^\.(png|jpe?g|webp)$' -and $_.Name -ne 'strada-properties-logo.svg' }

$manifest = [ordered]@{}

foreach ($source in $sourceFiles) {
  $base = [System.IO.Path]::GetFileNameWithoutExtension($source.Name)
  $avifFiles = Get-ChildItem -Path $responsiveRoot -File -Filter "$base-*.avif" | Sort-Object Name
  $webpFiles = Get-ChildItem -Path $responsiveRoot -File -Filter "$base-*.webp" | Sort-Object Name

  if (!$avifFiles.Length -or !$webpFiles.Length) {
    continue
  }

  $widths = @()

  foreach ($file in $avifFiles) {
    if ($file.BaseName -match '-(\d+)$') {
      $widths += [int]$Matches[1]
    }
  }

  $widths = $widths | Sort-Object -Unique

  if (!$widths.Length) {
    continue
  }

  $info = & $MagickPath identify -format "%w|%h" $source.FullName
  $parts = $info -split '\|'
  $sourceRef = "images/$($source.Name)"
  $avifItems = @()
  $webpItems = @()

  foreach ($width in $widths) {
    $avifItems += "images/responsive/$base-$width.avif ${width}w"
    $webpItems += "images/responsive/$base-$width.webp ${width}w"
  }

  $manifest[$sourceRef] = [ordered]@{
    width = [int]$parts[0]
    height = [int]$parts[1]
    fallback = "images/responsive/$base-$($widths[-1]).webp"
    fallbackSrcset = ($webpItems -join ", ")
    avifSrcset = ($avifItems -join ", ")
    fallbackExt = "webp"
    webpFallback = "images/responsive/$base-$($widths[-1]).webp"
    webpSrcset = ($webpItems -join ", ")
  }
}

$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestPath -Encoding UTF8

[pscustomobject]@{
  Entries = $manifest.Count
  Manifest = $manifestPath
}
