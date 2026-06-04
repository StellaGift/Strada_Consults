param(
  [string]$MagickPath = "C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe"
)

$ErrorActionPreference = "Stop"

$siteRoot = Split-Path -Parent $PSScriptRoot
$responsiveRoot = Join-Path $siteRoot "images\responsive"
$manifestPath = Join-Path $responsiveRoot "manifest.json"

if (!(Test-Path -LiteralPath $MagickPath)) {
  throw "ImageMagick was not found at $MagickPath"
}

if (!(Test-Path -LiteralPath $manifestPath)) {
  throw "Responsive image manifest was not found at $manifestPath"
}

$manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
$updated = [ordered]@{}
$processed = 0

foreach ($property in $manifest.PSObject.Properties) {
  $sourceRef = $property.Name
  $entry = $property.Value
  $sourcePath = Join-Path $siteRoot ($sourceRef -replace '/', '\')

  if (!(Test-Path -LiteralPath $sourcePath)) {
    continue
  }

  $webpItems = @()
  $widths = @()

  foreach ($item in ($entry.avifSrcset -split ',')) {
    $trimmed = $item.Trim()

    if ($trimmed -match '(\d+)w$') {
      $widths += [int]$Matches[1]
    }
  }

  $widths = $widths | Sort-Object -Unique
  $name = [System.IO.Path]::GetFileNameWithoutExtension($sourcePath)

  foreach ($width in $widths) {
    $webpPath = Join-Path $responsiveRoot "$name-$width.webp"

    if (!(Test-Path -LiteralPath $webpPath)) {
      & $MagickPath $sourcePath -auto-orient -strip -colorspace sRGB -resize "${width}x>" -quality 82 -define webp:method=6 $webpPath
    }

    $webpItems += "images/responsive/$name-$width.webp ${width}w"
  }

  $entry | Add-Member -NotePropertyName "webpSrcset" -NotePropertyValue ($webpItems -join ", ") -Force
  $entry | Add-Member -NotePropertyName "webpFallback" -NotePropertyValue "images/responsive/$name-$($widths[-1]).webp" -Force
  $entry.fallback = $entry.webpFallback
  $entry.fallbackSrcset = $entry.webpSrcset
  $entry.fallbackExt = "webp"

  $updated[$sourceRef] = $entry
  $processed += 1

  if (($processed % 10) -eq 0) {
    Write-Host "Generated WebP fallbacks for $processed image sources..."
    $updated | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
  }
}

$updated | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestPath -Encoding UTF8

[pscustomobject]@{
  UpdatedEntries = $updated.Count
  Processed = $processed
  Manifest = $manifestPath
}
