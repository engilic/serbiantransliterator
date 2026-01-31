# scripts/add-headers.ps1

$Root = Get-Location

# --- 1. KONFIGURACIJA (Whitelist i Blacklist) ---
$SupportedExtensions = @(".ts", ".js", ".cjs", ".mjs", ".tsx", ".css", ".html", ".xml", ".rs", ".sh", ".ps1")
$JsonExtensions = @(".json")

# FOLDERI KOJE POTPUNO IGNORIŠEMO
$IgnoreFolders = @("node_modules", "dist", "coverage", ".git", "target", "pkg", ".vs", ".vscode", "bin", "obj", "assets", "test-results", "playwright-report", "_", ".stryker-tmp", "reports")

# [GOD MODE FIX]: Dodat 'stryker.config.json' na listu ignorisanja
$IgnoreFiles = @("package-lock.json", "cargo.lock", "slnx.sqlite", "stryker.config.json")

$Stats = @{ Scanned=0; Fixed=0; CleanedJson=0; Unchanged=0 }
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# --- 2. POMOĆNE FUNKCIJE ---
function Get-ExpectedHeader($Ext, $Path) {
    if ($Ext -eq ".html" -or $Ext -eq ".xml") { return "<!-- $Path -->" }
    if ($Ext -eq ".css")  { return "/* $Path */" }
    if ($Ext -eq ".ps1" -or $Ext -eq ".sh") { return "# $Path" }
    return "// $Path"
}

# --- 3. GLAVNA LOGIKA PROCESIRANJA ---
function Process-File($FilePath) {
    $RelPath = $FilePath.Substring($Root.Path.Length + 1).Replace("\", "/")
    $FileName = [System.IO.Path]::GetFileName($FilePath).ToLower()
    
    # Detaljna provera foldera
    $PathParts = $RelPath -split '/'
    foreach ($Part in $PathParts) {
        if ($IgnoreFolders -contains $Part) { return }
    }
    
    # Provera ignorisanih fajlova
    if ($IgnoreFiles -contains $FileName) { return }

    $Ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
    $IsJson = $JsonExtensions -contains $Ext
    $IsSupported = $SupportedExtensions -contains $Ext
    if (-not $IsJson -and -not $IsSupported) { return }

    try { $RawContent = [System.IO.File]::ReadAllText($FilePath) } catch { return }
    if ([string]::IsNullOrEmpty($RawContent)) { return }
    $Stats.Scanned++

    # Normalizacija linija (LF) i brisanje razmaka na krajevima redova
    $Lines = New-Object System.Collections.Generic.List[string]
    foreach ($Line in ($RawContent.Replace("`r`n", "`n") -split "`n")) { $Lines.Add($Line.TrimEnd()) }
    
    # --- 4. ALARM ZA MISMATCH ---
    $LineIndex = 0
    foreach ($L in $Lines) {
        $LineIndex++
        if ($LineIndex -gt 5) { break }
        if ($L.Trim() -match "^(//|#|<!--|/\*)\s*([a-zA-Z0-9_\-\.\/]+\.[a-z0-9]+)") {
            $Found = $Matches[2].Trim().ToLower()
            if ($Found -ne $RelPath.ToLower() -and (Test-Path (Join-Path $Root $Found))) {
                Write-Host "`n[FATAL ERROR] HEADER MISMATCH DETECTED!" -ForegroundColor White -BackgroundColor Red
                Write-Host "File on disk:  $RelPath" -ForegroundColor Yellow
                Write-Host "Header says:   $Found" -ForegroundColor Red
                exit 1
            }
        }
    }

    # --- 5. RAZVRSTAVANJE SADRŽAJA ---
    $Directives = New-Object System.Collections.Generic.List[string]
    $CodeBody = New-Object System.Collections.Generic.List[string]
    $SpecialTopLine = $null; $ProcessingHeader = $true

    foreach ($L in $Lines) {
        $T = $L.Trim()
        if ($ProcessingHeader -and ($T.StartsWith("#!") -or $T.StartsWith("<?xml"))) { $SpecialTopLine = $L; continue }
        $isCurrentHeader = $T.Contains($FileName) -and ($T.StartsWith("//") -or $T.StartsWith("#") -or $T.StartsWith("<!--") -or $T.Contains($RelPath))
        $isFolderHeader = $T -match "^(//|#|<!--|/\*)\s*(src|tests|scripts|docs|config|package|tsconfig|manifest|[\w\.-]+/).*"
        if ($ProcessingHeader -and ($isCurrentHeader -or $isFolderHeader -or $T -match "=== file:")) { continue }
        if ($ProcessingHeader -and ($T.StartsWith("/* eslint") -or $T.StartsWith("/* global") -or $T.StartsWith("/* tslint") -or $T.StartsWith("/// <reference"))) { $Directives.Add($L); continue }
        if ($T -ne "") { $ProcessingHeader = $false }
        if (-not $ProcessingHeader) { $CodeBody.Add($L) }
    }

    # --- 6. SASTAVLJANJE ---
    $Output = New-Object System.Collections.Generic.List[string]
    if ($Ext -ne ".json") {
        if ($SpecialTopLine) { $Output.Add($SpecialTopLine) }
        $Output.Add((Get-ExpectedHeader $Ext $RelPath))
        $Output.Add("")
        foreach ($D in $Directives) { $Output.Add($D) }
        if ($Directives.Count -gt 0) { $Output.Add("") }
        foreach ($C in $CodeBody) { $Output.Add($C) }
    } else {
        foreach ($C in $CodeBody) { $Output.Add($C) }
    }

    $NewText = ($Output -join "`n").TrimEnd() + "`n"
    if ($NewText -ne ($Lines -join "`n").TrimEnd() + "`n") {
        try { 
            [System.IO.File]::WriteAllText($FilePath, $NewText, $Utf8NoBom)
            if ($Ext -eq ".json") { $Stats.CleanedJson++; Write-Host "   -> CLEANED JSON: $RelPath" -ForegroundColor Green } 
            else { $Stats.Fixed++; Write-Host "   -> FIXED HEADER: $RelPath" -ForegroundColor Green }
        } catch { }
    } else { $Stats.Unchanged++ }
}

Write-Host "HYGIENE SYSTEM: Source Normalization & Mismatch Protection..." -ForegroundColor Cyan
Get-ChildItem -Path $Root -Recurse -File | ForEach-Object { Process-File $_.FullName }

$jsonColor = if ($Stats.CleanedJson -gt 0) { "Green" } else { "Gray" }
$fixedColor = if ($Stats.Fixed -gt 0) { "Green" } else { "Gray" }
$unchangedColor = if ($Stats.Unchanged -eq $Stats.Scanned -and $Stats.Scanned -gt 0) { "Green" } else { "Gray" }

Write-Host "`nREPORT:" -ForegroundColor White
Write-Host "   Scanned:     $($Stats.Scanned)"
Write-Host "   Fixed Code:  $($Stats.Fixed)" -ForegroundColor $fixedColor
Write-Host "   Purged JSON: $($Stats.CleanedJson)" -ForegroundColor $jsonColor
Write-Host "   Unchanged:   $($Stats.Unchanged)" -ForegroundColor $unchangedColor
