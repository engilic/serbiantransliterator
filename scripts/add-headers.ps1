# scripts/add-headers.ps1

$Root = Get-Location

# --- 1. KONFIGURACIJA (Whitelist ekstenzija i Blacklist foldera) ---
$SupportedExtensions = @(".ts", ".js", ".cjs", ".mjs", ".tsx", ".css", ".html", ".xml", ".rs", ".sh", ".ps1")
$JsonExtensions = @(".json")
$IgnoreFolders = @("node_modules", "dist", "coverage", ".git", "target", "pkg", ".vs", ".vscode", "bin", "obj", "assets", "test-results", "playwright-report")
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
    
    # Preskoči ignorisane foldere
    $PathParts = $RelPath -split '/'
    foreach ($Part in $PathParts) { if ($IgnoreFolders -contains $Part) { return } }
    
    # Preskoči lock fajlove
    $FileName = [System.IO.Path]::GetFileName($FilePath).ToLower()
    if ($IgnoreFiles -contains $FileName) { return }

    $Ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
    $IsJson = $JsonExtensions -contains $Ext
    $IsSupported = $SupportedExtensions -contains $Ext
    if (-not $IsJson -and -not $IsSupported) { return }

    # Čitanje sirovog sadržaja
    try { $RawContent = [System.IO.File]::ReadAllText($FilePath) } catch { return }
    if ([string]::IsNullOrEmpty($RawContent)) { return }
    $Stats.Scanned++

    # Normalizacija na LF (\n)
    $Lines = $RawContent.Replace("`r`n", "`n") -split "`n"
    
    # --- 4. ALARM ZA MISMATCH (Pogrešan Copy-Paste) ---
    $LineIndex = 0
    foreach ($L in $Lines) {
        $LineIndex++
        if ($LineIndex -gt 5) { break }
        $T = $L.Trim()
        
        # Regex koji hvata celu putanju uključujući foldere i fajl
        if ($T -match "^(//|#|<!--|/\*)\s*([a-zA-Z0-9_\-\.\/]+\.[a-zA-Z0-9]+)") {
            $FoundPathInFile = $Matches[2].Trim().ToLower()
            $ActualPathOnDisk = $RelPath.ToLower()
            
            if ($FoundPathInFile -ne $ActualPathOnDisk) {
                # Proveri da li putanja u fajlu zapravo postoji kao drugi fajl
                $OtherFilePath = Join-Path $Root $FoundPathInFile
                if (Test-Path $OtherFilePath) {
                    Write-Host "`n[FATAL ERROR] HEADER MISMATCH DETECTED!" -ForegroundColor White -BackgroundColor Red
                    Write-Host "File on disk:  $RelPath" -ForegroundColor Yellow
                    Write-Host "Header says:   $FoundPathInFile" -ForegroundColor Red
                    Write-Host "Action: Paste from wrong file confirmed. Aborting build.`n"
                    exit 1
                }
            }
        }
    }

    # --- 5. RAZVRSTAVANJE SADRŽAJA ---
    $Directives = New-Object System.Collections.Generic.List[string]
    $CodeBody = New-Object System.Collections.Generic.List[string]
    $Shebang = $null
    $ProcessingHeader = $true

    foreach ($L in $Lines) {
        $T = $L.Trim()
        
        # A. Shebang (#! /bin/bash)
        if ($ProcessingHeader -and $T.StartsWith("#!")) {
            $Shebang = $L
            continue
        }

        # B. Detekcija bilo kakvog starog zaglavlja (za brisanje)
        $isHeader = $T -match "^(//|#|<!--|/\*)\s*(src|tests|scripts|docs|config|package|tsconfig|manifest|[\w\.-]+\.(js|ts|sh|ps1|xml|md|css|cjs|mjs)).*"
        if ($ProcessingHeader -and $isHeader) {
            continue
        }

        # C. Direktive (ESLint, global, reference)
        if ($ProcessingHeader -and ($T.StartsWith("/* eslint") -or $T.StartsWith("/* global") -or $T.StartsWith("/* tslint") -or $T.StartsWith("/// <reference"))) {
            $Directives.Add($L)
            continue
        }

        # D. Telo koda (Sve što nije prazno prekida header zonu)
        if ($T -ne "") {
            $ProcessingHeader = $false
        }
        
        if (-not $ProcessingHeader) {
            $CodeBody.Add($L)
        }
    }

    # --- 6. SASTAVLJANJE (Strict Spacing) ---
    $Output = New-Object System.Collections.Generic.List[string]

    if (-not $IsJson) {
        # 1. Shebang
        if ($Shebang) { $Output.Add($Shebang) }
        
        # 2. Glavni Header
        $Output.Add((Get-ExpectedHeader $Ext $RelPath))
        
        # 3. Razmak pre direktiva/koda
        if ($Directives.Count -gt 0 -or $CodeBody.Count -gt 0) {
            $Output.Add("")
        }

        # 4. Direktive
        foreach ($D in $Directives) { $Output.Add($D) }

        # 5. Razmak pre koda (samo ako je bilo direktiva)
        if ($Directives.Count -gt 0 -and $CodeBody.Count -gt 0) {
            $Output.Add("")
        }

        # 6. Kod
        foreach ($C in $CodeBody) { $Output.Add($C) }
    } else {
        # JSON: Samo čist kod, bez zaglavlja
        foreach ($C in $CodeBody) { $Output.Add($C) }
    }

    # Finalna normalizacija (LF i Trim)
    $NewText = ($Output -join "`n").TrimEnd() + "`n"
    $OldNormalized = $RawContent.Replace("`r`n", "`n").TrimEnd() + "`n"
    
    # --- 7. UPISIVANJE ---
    if ($NewText -ne $OldNormalized) {
        try { 
            [System.IO.File]::WriteAllText($FilePath, $NewText, $Utf8NoBom)
            if ($IsJson) { $Stats.CleanedJson++ } else { $Stats.Fixed++ }
        } catch { }
    } else {
        $Stats.Unchanged++
    }
}

# --- 8. IZVRŠENJE I IZVEŠTAJ ---
Write-Host "STRICT HYGIENE: Source Normalization & Mismatch Protection..." -ForegroundColor Cyan

$Files = Get-ChildItem -Path $Root -Recurse -File
foreach ($F in $Files) { Process-File $F.FullName }

$jsonColor = if ($Stats.CleanedJson -gt 0) { "Green" } else { "Gray" }
$fixedColor = if ($Stats.Fixed -gt 0) { "Green" } else { "Gray" }

Write-Host "`nREPORT:" -ForegroundColor White
Write-Host "   Scanned:     $($Stats.Scanned)"
Write-Host "   Fixed Code:  $($Stats.Fixed)" -ForegroundColor $fixedColor
Write-Host "   Purged JSON: $($Stats.CleanedJson)" -ForegroundColor $jsonColor
Write-Host "   Unchanged:   $($Stats.Unchanged)" -ForegroundColor Gray
