$ErrorActionPreference = "Stop"

$siteRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $siteRoot "images\responsive\manifest.json"

if (!(Test-Path -LiteralPath $manifestPath)) {
  throw "Responsive image manifest was not found at $manifestPath"
}

$manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
$htmlFiles = Get-ChildItem -Path $siteRoot -File -Filter *.html

function Get-ManifestEntry {
  param([string]$Source)

  $property = $manifest.PSObject.Properties[$Source]

  if ($property) {
    return $property.Value
  }

  return $null
}

function Get-ImageType {
  param([string]$Extension)

  if ($Extension -eq "webp") {
    return "image/webp"
  }

  if ($Extension -eq "png") {
    return "image/png"
  }

  return "image/jpeg"
}

function Add-AttrIfMissing {
  param(
    [string]$Tag,
    [string]$Name,
    [string]$Value
  )

  if ($Tag -match "\s$Name=") {
    return $Tag
  }

  return $Tag -replace '\s*/?>$', " $Name=""$Value"" />"
}

function Set-Attr {
  param(
    [string]$Tag,
    [string]$Name,
    [string]$Value
  )

  if ($Tag -match "\s$Name=""[^""]*""") {
    return [regex]::Replace($Tag, "\s$Name=""[^""]*""", " $Name=""$Value""", 1)
  }

  return Add-AttrIfMissing -Tag $Tag -Name $Name -Value $Value
}

function Get-SizesForTag {
  param(
    [string]$Tag,
    [string]$Source
  )

  if ($Tag -match 'img-property-slide|property-hero') {
    return "(max-width: 991px) 100vw, 58vw"
  }

  if ($Source -match 'popular|listing|img_') {
    return "(max-width: 575px) 100vw, (max-width: 991px) 50vw, 33vw"
  }

  if ($Source -match 'hero|poster|exempt') {
    return "100vw"
  }

  return "(max-width: 768px) 100vw, 50vw"
}

function Convert-ImgTag {
  param([System.Text.RegularExpressions.Match]$Match)

  $tag = $Match.Value

  if ($tag -match 'logo-image' -or $tag -match 'src="images/strada-properties-logo') {
    return $tag
  }

  $srcMatch = [regex]::Match($tag, 'src="(images/[^"]+\.(?:png|jpe?g|webp))"', 'IgnoreCase')

  if (!$srcMatch.Success) {
    return $tag
  }

  $src = $srcMatch.Groups[1].Value
  $entry = Get-ManifestEntry -Source $src

  if ($null -eq $entry) {
    return $tag
  }

  $sizes = Get-SizesForTag -Tag $tag -Source $src
  $fallbackType = Get-ImageType -Extension $entry.fallbackExt
  $imgTag = $tag

  $imgTag = Set-Attr -Tag $imgTag -Name "src" -Value $entry.fallback
  $imgTag = Set-Attr -Tag $imgTag -Name "srcset" -Value $entry.fallbackSrcset
  $imgTag = Set-Attr -Tag $imgTag -Name "sizes" -Value $sizes
  $imgTag = Add-AttrIfMissing -Tag $imgTag -Name "width" -Value $entry.width
  $imgTag = Add-AttrIfMissing -Tag $imgTag -Name "height" -Value $entry.height
  $imgTag = Add-AttrIfMissing -Tag $imgTag -Name "loading" -Value "lazy"
  $imgTag = Add-AttrIfMissing -Tag $imgTag -Name "decoding" -Value "async"

  return "<picture><source type=""image/avif"" srcset=""$($entry.avifSrcset)"" sizes=""$sizes""><source type=""$fallbackType"" srcset=""$($entry.fallbackSrcset)"" sizes=""$sizes"">$imgTag</picture>"
}

function Convert-BackgroundImage {
  param([System.Text.RegularExpressions.Match]$Match)

  $src = $Match.Groups[1].Value
  $entry = Get-ManifestEntry -Source $src

  if ($null -eq $entry) {
    return $Match.Value
  }

  $fallbackType = Get-ImageType -Extension $entry.fallbackExt
  $largestAvif = (($entry.avifSrcset -split ',')[-1].Trim() -split ' ')[0]

  return "background-image: url('$($entry.fallback)'); background-image: image-set(url('$largestAvif') type('image/avif'), url('$($entry.fallback)') type('$fallbackType'))"
}

foreach ($file in $htmlFiles) {
  $text = Get-Content -Raw -LiteralPath $file.FullName

  $text = $text -replace 'images/strada-properties-logo-optimized\.png', 'images/strada-properties-logo.svg'
  $text = [regex]::Replace($text, '<img\b[^>]*>', { param($m) Convert-ImgTag -Match $m }, 'IgnoreCase, Singleline')
  $text = [regex]::Replace($text, "background-image:\s*url\(['""]?(images/[^'"")]+\.(?:png|jpe?g|webp))['""]?\)", { param($m) Convert-BackgroundImage -Match $m }, 'IgnoreCase')

  Set-Content -LiteralPath $file.FullName -Value $text -Encoding UTF8
}

[pscustomobject]@{
  UpdatedHtmlFiles = $htmlFiles.Count
  Manifest = $manifestPath
}
