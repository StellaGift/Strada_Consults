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

New-Item -ItemType Directory -Force -Path $responsiveRoot | Out-Null

$sourcePattern = 'images/[A-Za-z0-9_.-]+\.(?:png|jpe?g|webp)'
$codeFiles = Get-ChildItem -Path $siteRoot -Recurse -File -Include *.html,*.css,*.js |
  Where-Object { $_.FullName -notmatch '\\images\\responsive\\' }

$refs = New-Object System.Collections.Generic.HashSet[string]

foreach ($file in $codeFiles) {
  $text = Get-Content -Raw -LiteralPath $file.FullName

  if ($null -eq $text) {
    continue
  }

  foreach ($match in [regex]::Matches($text, $sourcePattern)) {
    [void]$refs.Add($match.Value)
  }
}

$widthCandidates = @(360, 540, 720, 960, 1280, 1600, 1920)
$manifest = [ordered]@{}
$missing = @()
$processed = 0

foreach ($ref in ($refs | Sort-Object)) {
  $relativePath = $ref -replace '/', '\'
  $sourcePath = Join-Path $siteRoot $relativePath

  if (!(Test-Path -LiteralPath $sourcePath)) {
    $missing += $ref
    continue
  }

  $name = [System.IO.Path]::GetFileNameWithoutExtension($sourcePath)
  $info = & $MagickPath identify -format "%w|%h|%[opaque]" $sourcePath
  $parts = $info -split '\|'
  $originalWidth = [int]$parts[0]
  $originalHeight = [int]$parts[1]
  $fallbackExt = "webp"

  $widths = @($widthCandidates | Where-Object { $_ -lt $originalWidth })
  if ($widths.Count -eq 0 -or $widths[-1] -ne $originalWidth) {
    $widths += $originalWidth
  }

  $widths = $widths | Sort-Object -Unique
  $fallbackItems = @()
  $avifItems = @()

  foreach ($width in $widths) {
    $baseOutput = Join-Path $responsiveRoot "$name-$width"
    $avifPath = "$baseOutput.avif"
    $fallbackPath = "$baseOutput.$fallbackExt"

    if (!(Test-Path -LiteralPath $avifPath)) {
      & $MagickPath $sourcePath -auto-orient -strip -colorspace sRGB -resize "${width}x>" -quality 62 $avifPath
    }

    if (!(Test-Path -LiteralPath $fallbackPath)) {
      & $MagickPath $sourcePath -auto-orient -strip -colorspace sRGB -resize "${width}x>" -quality 82 -define webp:method=6 $fallbackPath
    }

    $fallbackItems += "images/responsive/$name-$width.$fallbackExt ${width}w"
    $avifItems += "images/responsive/$name-$width.avif ${width}w"
  }

  $manifest[$ref] = [ordered]@{
    width = $originalWidth
    height = $originalHeight
    fallback = "images/responsive/$name-$($widths[-1]).$fallbackExt"
    fallbackSrcset = ($fallbackItems -join ", ")
    avifSrcset = ($avifItems -join ", ")
    fallbackExt = $fallbackExt
    webpFallback = "images/responsive/$name-$($widths[-1]).webp"
    webpSrcset = ($fallbackItems -join ", ")
  }

  $processed += 1
  if (($processed % 10) -eq 0) {
    Write-Host "Optimized $processed referenced image sources..."
  }

  $manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
}

$manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $manifestPath -Encoding UTF8

[pscustomobject]@{
  Sources = $manifest.Count
  Missing = $missing.Count
  Manifest = $manifestPath
  MissingRefs = ($missing -join ", ")
}
