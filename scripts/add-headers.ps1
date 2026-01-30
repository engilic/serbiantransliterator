# scripts/add-headers.ps1

$Root = Get-Location

# --- 1. KONFIGURACIJA ---
$SupportedExtensions = @(".ts", ".js", ".cjs", ".mjs", ".tsx", ".css", ".html", ".xml", ".rs", ".sh", ".ps1")
$JsonExtensions = @(".json")

# [FIX]: Dodat "_" u IgnoreFolders (Husky interna dokumentacija)
$IgnoreFolders = @("node_modules", "dist", "coverage", ".git", "target", "pkg", ".vs", ".vscode", "bin", "obj", "assets", "test-results", "playwright-report", "_")

$IgnoreFiles = @("package-lock.json", "cargo.lock", "slnx.sqlite")

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
    
    # Detaljna provera foldera
    $PathParts = $RelPath -split '/'
    foreach ($Part in $PathParts) {
        if ($IgnoreFolders -contains $Part) { return }
    }
    
    $FileName = [System.IO.Path]::GetFileName($FilePath).ToLower()
    foreach ($IF in $IgnoreFiles) {
        if ($FileName -eq $IF) { return }
    }

    $Ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
    $IsJson = $JsonExtensions -contains $Ext
    $IsSupported = $SupportedExtensions -contains $Ext
    if (-not $IsJson -and -not $IsSupported) { return }

    # Čitanje sirovog sadržaja
    try {
        $RawContent = [System.IO.File]::ReadAllText($FilePath)
    } catch { return }

    if ([string]::IsNullOrEmpty($RawContent)) { return }
    $Stats.Scanned++

    # Normalizacija linija (LF) i brisanje razmaka na krajevima
    $RawLines = $RawContent.Replace("`r`n", "`n") -split "`n"
    $Lines = New-Object System.Collections.Generic.List[string]
    foreach ($Line in $RawLines) {
        $Lines.Add($Line.TrimEnd())
    }
    
    # --- 4. ALARM ZA MISMATCH ---
    $LineIndex = 0
    foreach ($L in $Lines) {
        $LineIndex++
        if ($LineIndex -gt 5) { break }
        $T = $L.Trim()
        
        if ($T -match "^(//|#|<!--|/\*)\s*([a-zA-Z0-9_\-\.\/]+\.[a-zA-Z0-9]+)") {
            $FoundPath = $Matches[2].Trim().ToLower()
            $ActualPath = $RelPath.ToLower()
            
            if ($FoundPath -ne $ActualPath) {
                $CheckPath = Join-Path $Root $FoundPath
                if (Test-Path $CheckPath) {
                    Write-Host "`n[FATAL ERROR] HEADER MISMATCH DETECTED!" -ForegroundColor White -BackgroundColor Red
                    Write-Host "File on disk:  $RelPath" -ForegroundColor Yellow
                    Write-Host "Header says:   $FoundPath" -ForegroundColor Red
                    Write-Host "Action: Paste confirmed from another file. Aborting.`n"
                    exit 1
                }
            }
        }
    }

    # --- 5. RAZVRSTAVANJE SADRŽAJA ---
    $Directives = New-Object System.Collections.Generic.List[string]
    $CodeBody = New-Object System.Collections.Generic.List[string]
    $SpecialTopLine = $null
    $ProcessingHeader = $true

    foreach ($L in $Lines) {
        $T = $L.Trim()
        
        if ($ProcessingHeader -and ($T.StartsWith("#!") -or $T.StartsWith("<?xml"))) {
            $SpecialTopLine = $L; continue
        }

        $isHeader = $T -match "^(//|#|<!--|/\*)\s*(src|tests|scripts|docs|config|package|tsconfig|manifest|[\w\.-]+/).*"
        if ($ProcessingHeader -and ($isHeader -or $T -match "=== file:")) {
            continue
        }

        if ($ProcessingHeader -and ($T.StartsWith("/* eslint") -or $T.StartsWith("/* global") -or $T.StartsWith("/* tslint") -or $T.StartsWith("/// <reference"))) {
            $Directives.Add($L); continue
        }

        if ($T -ne "") { $ProcessingHeader = $false }
        if (-not $ProcessingHeader) { $CodeBody.Add($L) }
    }

    # --- 6. SASTAVLJANJE ---
    $Output = New-Object System.Collections.Generic.List[string]
    if (-not $IsJson) {
        if ($SpecialTopLine) { $Output.Add($SpecialTopLine) }
        $Output.Add((Get-ExpectedHeader $Ext $RelPath))
        if ($Directives.Count -gt 0 -or $CodeBody.Count -gt 0) { $Output.Add("") }
        foreach ($D in $Directives) { $Output.Add($D) }
        if ($Directives.Count -gt 0 -and $CodeBody.Count -gt 0) { $Output.Add("") }
        foreach ($C in $CodeBody) { $Output.Add($C) }
    } else {
        foreach ($C in $CodeBody) { $Output.Add($C) }
    }

    # Finalni string: Tačno jedan newline na kraju fajla
    $NewText = ($Output -join "`n").TrimEnd() + "`n"
    $OldNormalized = ($Lines -join "`n").TrimEnd() + "`n"
    
    # --- 7. UPISIVANJE ---
    if ($NewText -ne $OldNormalized) {
        try { 
            [System.IO.File]::WriteAllText($FilePath, $NewText, $Utf8NoBom)
            if ($IsJson) { 
                $Stats.CleanedJson++ 
                Write-Host "   -> CLEANED JSON: $RelPath" -ForegroundColor Green
            } else { 
                $Stats.Fixed++
                Write-Host "   -> FIXED HEADER: $RelPath" -ForegroundColor Green
            }
        } catch { }
    } else {
        $Stats.Unchanged++
    }
}

# --- 8. IZVRŠENJE ---
Write-Host "HYGIENE SYSTEM: Source Normalization & Mismatch Protection..." -ForegroundColor Cyan

$Files = Get-ChildItem -Path $Root -Recurse -File
foreach ($F in $Files) {
    Process-File $F.FullName
}

# --- 9. REPORT SA ISPRAVLJENIM BOJAMA (Fix za TS2304/ParameterBinding) ---
$jsonColor = if ($Stats.CleanedJson -gt 0) { "Green" } else { "Gray" }
$fixedColor = if ($Stats.Fixed -gt 0) { "Green" } else { "Gray" }
$unchangedColor = if ($Stats.Unchanged -eq $Stats.Scanned -and $Stats.Scanned -gt 0) { "Green" } else { "Gray" }

Write-Host "`nREPORT:" -ForegroundColor White
Write-Host "   Scanned:     $($Stats.Scanned)"
Write-Host "   Fixed Code:  $($Stats.Fixed)" -ForegroundColor $fixedColor
Write-Host "   Purged JSON: $($Stats.CleanedJson)" -ForegroundColor $jsonColor
Write-Host "   Unchanged:   $($Stats.Unchanged)" -ForegroundColor $unchangedColor
