# scripts/add-headers.ps1

$Root = Get-Location

# --- 1. KONFIGURACIJA (Whitelist i Blacklist) ---
# Obrađujemo isključivo ove tekstualne formate (.sh i .ps1 koriste #)
$SupportedExtensions = @(".ts", ".js", ".cjs", ".mjs", ".tsx", ".css", ".html", ".xml", ".rs", ".sh", ".ps1")
$JsonExtensions = @(".json")

# Folderi koje potpuno ignorišemo (sistemski, build, assets i Husky interna creva)
$IgnoreFolders = @("node_modules", "dist", "coverage", ".git", "target", "pkg", ".vs", ".vscode", "bin", "obj", "assets", "test-results", "playwright-report", "_")

# Specifični fajlovi koji se nikada ne diraju automatski
$IgnoreFiles = @("package-lock.json", "cargo.lock", "slnx.sqlite")

$Stats = @{ Scanned=0; Fixed=0; CleanedJson=0; Unchanged=0 }
# UTF-8 motor bez BOM-a (ključno za Prettier i Node.js kompatibilnost)
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
    # Putanja fajla u odnosu na koren projekta (npr. src/app.ts)
    $RelPath = $FilePath.Substring($Root.Path.Length + 1).Replace("\", "/")
    
    # Ime samog fajla (npr. vitest.config.ts)
    $FileName = [System.IO.Path]::GetFileName($FilePath).ToLower()
    
    # Detaljna provera foldera (Hirurška preciznost)
    $PathParts = $RelPath -split '/'
    foreach ($Part in $PathParts) {
        if ($IgnoreFolders -contains $Part) { return }
    }
    
    # Provera ignorisanih fajlova
    if ($IgnoreFiles -contains $FileName) { return }

    $Ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
    $IsJson = $JsonExtensions -contains $Ext
    $IsSupported = $SupportedExtensions -contains $Ext

    # Obrađujemo samo ako je na beloj listi
    if (-not $IsJson -and -not $IsSupported) { return }

    # Čitanje sirovog sadržaja
    try {
        $RawContent = [System.IO.File]::ReadAllText($FilePath)
    } catch { return }

    if ([string]::IsNullOrEmpty($RawContent)) { return }
    $Stats.Scanned++

    # --- 4. NORMALIZACIJA (Rešava problem stalnog fiksiranja) ---
    # Pretvaramo sve završetke u LF (\n) i brišemo razmake na krajevima redova
    $RawLinesSplit = $RawContent.Replace("`r`n", "`n") -split "`n"
    $Lines = New-Object System.Collections.Generic.List[string]
    foreach ($Line in $RawLinesSplit) {
        $Lines.Add($Line.TrimEnd())
    }
    
    # --- 5. ALARM ZA MISMATCH (Detekcija pogrešnog Copy-Paste-a) ---
    $LineIndex = 0
    foreach ($L in $Lines) {
        $LineIndex++
        if ($LineIndex -gt 5) { break }
        $T = $L.Trim()
        
        # Regex koji hvata bilo koju putanju koja liči na fajl (ima tačku i ekstenziju)
        if ($T -match "^(//|#|<!--|/\*)\s*([a-zA-Z0-9_\-\.\/]+\.[a-z0-9]+)") {
            $FoundPath = $Matches[2].Trim().ToLower()
            $ActualPath = $RelPath.ToLower()
            
            if ($FoundPath -ne $ActualPath) {
                # Provera da li nađena putanja zapravo postoji kao drugi fajl na disku
                $CheckPath = Join-Path $Root $FoundPath
                if (Test-Path $CheckPath) {
                    Write-Host "`n[FATAL ERROR] HEADER MISMATCH DETECTED!" -ForegroundColor White -BackgroundColor Red
                    Write-Host "File on disk:  $RelPath" -ForegroundColor Yellow
                    Write-Host "Header says:   $FoundPath" -ForegroundColor Red
                    Write-Host "Action: Paste from wrong file confirmed. Aborting build.`n"
                    exit 1
                }
            }
        }
    }

    # --- 6. RAZVRSTAVANJE SADRŽAJA ---
    $Directives = New-Object System.Collections.Generic.List[string]
    $CodeBody = New-Object System.Collections.Generic.List[string]
    $SpecialTopLine = $null # Shebang ili XML Declaration
    $ProcessingHeader = $true

    foreach ($L in $Lines) {
        $T = $L.Trim()
        
        # A. Shebang ili XML Deklaracija (Mora biti red br. 1)
        if ($ProcessingHeader -and ($T.StartsWith("#!") -or $T.StartsWith("<?xml"))) {
            $SpecialTopLine = $L
            continue
        }

        # B. Čišćenje zaglavlja (Brišemo stare hedere i duplikate)
        $isCurrentFileHeader = $T.Contains($FileName) -and ($T.StartsWith("//") -or $T.StartsWith("#") -or $T.StartsWith("<!--") -or $T.StartsWith("/*"))
        $isFolderHeader = $T -match "^(//|#|<!--|/\*)\s*(src|tests|scripts|docs|config|package|tsconfig|manifest|[\w\.-]+/).*"
        
        if ($ProcessingHeader -and ($isCurrentFileHeader -or $isFolderHeader -or $T -match "=== file:")) {
            continue
        }

        # C. Čuvanje bitnih direktiva
        if ($ProcessingHeader -and ($T.StartsWith("/* eslint") -or $T.StartsWith("/* global") -or $T.StartsWith("/* tslint") -or $T.StartsWith("/// <reference"))) {
            $Directives.Add($L)
            continue
        }

        # D. Telo koda (Prva linija koja nije prazna i nije header/shebang/direktiva)
        if ($T -ne "") {
            $ProcessingHeader = $false
        }
        
        if (-not $ProcessingHeader) {
            $CodeBody.Add($L)
        }
    }

    # --- 7. SASTAVLJANJE (God Mode Strict Spacing) ---
    $Output = New-Object System.Collections.Generic.List[string]

    if (-not $IsJson) {
        # 1. Specijalna linija ide na apsolutni vrh
        if ($SpecialTopLine) { $Output.Add($SpecialTopLine) }
        
        # 2. Glavni Header putanje
        $Output.Add((Get-ExpectedHeader $Ext $RelPath))
        
        # 3. Tačno jedan razmak posle headera
        if ($Directives.Count -gt 0 -or $CodeBody.Count -gt 0) {
            $Output.Add("")
        }

        # 4. Direktive (jedna ispod druge)
        foreach ($D in $Directives) { $Output.Add($D) }

        # 5. Tačno jedan razmak pre koda (samo ako je bilo direktiva)
        if ($Directives.Count -gt 0 -and $CodeBody.Count -gt 0) {
            $Output.Add("")
        }

        # 6. Telo koda
        foreach ($C in $CodeBody) {
            $Output.Add($C)
        }
    } else {
        # JSON: Samo čist kod bez ičega
        foreach ($C in $CodeBody) {
            $Output.Add($C)
        }
    }

    # Finalni string (LF završeci i tačno jedan newline na kraju)
    $NewText = ($Output -join "`n").TrimEnd() + "`n"
    $OldNormalized = ($Lines -join "`n").TrimEnd() + "`n"
    
    # --- 8. UPISIVANJE RAZLIKA ---
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

# --- 9. IZVRŠENJE ---
Write-Host "HYGIENE SYSTEM: Source Normalization & Mismatch Protection..." -ForegroundColor Cyan

$Files = Get-ChildItem -Path $Root -Recurse -File
foreach ($F in $Files) {
    Process-File $F.FullName
}

# --- 10. FINAL REPORT ---
$jsonColor = if ($Stats.CleanedJson -gt 0) { "Green" } else { "Gray" }
$fixedColor = if ($Stats.Fixed -gt 0) { "Green" } else { "Gray" }
$unchangedColor = if ($Stats.Unchanged -eq $Stats.Scanned -and $Stats.Scanned -gt 0) { "Green" } else { "Gray" }

Write-Host "`nREPORT:" -ForegroundColor White
Write-Host "   Scanned:     $($Stats.Scanned)"
Write-Host "   Fixed Code:  $($Stats.Fixed)" -ForegroundColor $fixedColor
Write-Host "   Purged JSON: $($Stats.CleanedJson)" -ForegroundColor $jsonColor
Write-Host "   Unchanged:   $($Stats.Unchanged)" -ForegroundColor $unchangedColor
