# scripts/add-headers.ps1

$Root = Get-Location

# --- 1. KONFIGURACIJA ---
$SupportedExtensions = @(".ts", ".js", ".cjs", ".mjs", ".tsx", ".css", ".html", ".xml", ".rs", ".sh", ".ps1")
$JsonExtensions = @(".json")

# Folderi koje potpuno ignorišemo
$IgnoreFolders = @("node_modules", "dist", "coverage", ".git", "target", "pkg", ".vs", ".vscode", "bin", "obj", "assets", "test-results", "playwright-report", "_")

# Fajlovi koje nikada ne diramo
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
    # Relativna putanja (npr. src/app.ts ili vitest.config.ts)
    $RelPath = $FilePath.Substring($Root.Path.Length + 1).Replace("\", "/")
    
    # Ime fajla (npr. vitest.config.ts)
    $FileName = [System.IO.Path]::GetFileName($FilePath)
    
    # Provera ignorisanih foldera
    $PathParts = $RelPath -split '/'
    foreach ($Part in $PathParts) { if ($IgnoreFolders -contains $Part) { return } }
    
    # Provera ignorisanih fajlova
    if ($IgnoreFiles -contains $FileName.ToLower()) { return }

    $Ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
    $IsJson = $JsonExtensions -contains $Ext
    $IsSupported = $SupportedExtensions -contains $Ext
    if (-not $IsJson -and -not $IsSupported) { return }

    # Bezbedno čitanje sirovog sadržaja
    try { $RawContent = [System.IO.File]::ReadAllText($FilePath) } catch { return }
    if ([string]::IsNullOrEmpty($RawContent)) { return }
    $Stats.Scanned++

    # Normalizacija linija (LF) i brisanje razmaka na krajevima
    $RawLines = $RawContent.Replace("`r`n", "`n") -split "`n"
    $Lines = New-Object System.Collections.Generic.List[string]
    foreach ($Line in $RawLines) { $Lines.Add($Line.TrimEnd()) }
    
    # --- 4. ALARM ZA MISMATCH (Detekcija pogrešnog Copy-Paste-a) ---
    $LineIndex = 0
    foreach ($L in $Lines) {
        $LineIndex++
        if ($LineIndex -gt 5) { break }
        $T = $L.Trim()
        # Regex hvata bilo koju putanju koja liči na fajl (ima tačku i ekstenziju)
        if ($T -match "^(//|#|<!--|/\*)\s*([a-zA-Z0-9_\-\.\/]+\.[a-z0-9]+)") {
            $FoundPath = $Matches[2].Trim().ToLower()
            if ($FoundPath -ne $RelPath.ToLower()) {
                # Ako putanja u fajlu zaista postoji kao drugi fajl na disku -> ALARM
                if (Test-Path (Join-Path $Root $FoundPath)) {
                    Write-Host "`n[FATAL ERROR] HEADER MISMATCH DETECTED!" -ForegroundColor White -BackgroundColor Red
                    Write-Host "File on disk:  $RelPath" -ForegroundColor Yellow
                    Write-Host "Header says:   $FoundPath" -ForegroundColor Red
                    Write-Host "Action: Paste from wrong file confirmed. Aborting.`n"
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
        
        # A. Shebang ili XML (Linija 1)
        if ($ProcessingHeader -and ($T.StartsWith("#!") -or $T.StartsWith("<?xml"))) {
            $SpecialTopLine = $L; continue
        }

        # B. ČIŠĆENJE ZAGLAVLJA: Brišemo ako linija sadrži ime fajla ILI putanju foldera
        $isCurrentFileHeader = $T.Contains($FileName) -and ($T.StartsWith("//") -or $T.StartsWith("#") -or $T.StartsWith("<!--") -or $T.StartsWith("/*"))
        $isFolderHeader = $T -match "^(//|#|<!--|/\*)\s*(src|tests|scripts|docs|config|package|tsconfig|manifest|[\w\.-]+/).*"
        
        if ($ProcessingHeader -and ($isCurrentFileHeader -or $isFolderHeader -or $T -match "=== file:")) {
            continue
        }

        # C. Direktive
        if ($ProcessingHeader -and ($T.StartsWith("/* eslint") -or $T.StartsWith("/* global") -or $T.StartsWith("/* tslint") -or $T.StartsWith("/// <reference"))) {
            $Directives.Add($L); continue
        }

        # D. Telo koda (Sve što nije prazno prekida header zonu)
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

    # Finalni tekst (LF)
    $NewText = ($Output -join "`n").TrimEnd() + "`n"
    $OldNormalized = ($Lines -join "`n").TrimEnd() + "`n"
    
    # --- 7. UPISIVANJE ---
    if ($NewText -ne $OldNormalized) {
        try { 
            [System.IO.File]::WriteAllText($FilePath, $NewText, $Utf8NoBom)
            if ($IsJson) { $Stats.CleanedJson++ } else { 
                $Stats.Fixed++
                Write-Host "   -> FIXED: $RelPath" -ForegroundColor Green
            }
        } catch { }
    } else { $Stats.Unchanged++ }
}

# --- 8. IZVRŠENJE ---
Write-Host "HYGIENE SYSTEM: Header Normalization & Mismatch Protection..." -ForegroundColor Cyan
$Files = Get-ChildItem -Path $Root -Recurse -File
foreach ($F in $Files) { Process-File $F.FullName }

# --- 9. REPORT ---
$jsonColor = if ($Stats.CleanedJson -gt 0) { "Green" } else { "Gray" }
$fixedColor = if ($Stats.Fixed -gt 0) { "Green" } else { "Gray" }
$unchangedColor = if ($Stats.Unchanged -eq $Stats.Scanned -and $Stats.Scanned -gt 0) { "Green" } else { "Gray" }

Write-Host "`nREPORT:" -ForegroundColor White
Write-Host "   Scanned:     $($Stats.Scanned)"
Write-Host "   Fixed Code:  $($Stats.Fixed)" -ForegroundColor $fixedColor
Write-Host "   Purged JSON: $($Stats.CleanedJson)" -ForegroundColor $jsonColor
Write-Host "   Unchanged:   $($Stats.Unchanged)" -ForegroundColor $unchangedColorS
