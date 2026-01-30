# scripts/add-headers.ps1

$Root = Get-Location

# --- 1. KONFIGURACIJA (Whitelist i Blacklist) ---
# Obrađujemo isključivo ove tekstualne formate
$SupportedExtensions = @(".ts", ".js", ".cjs", ".mjs", ".tsx", ".css", ".html", ".xml", ".rs", ".sh", ".ps1")
# JSON fajlovi se samo čiste (ne smeju imati komentare)
$JsonExtensions = @(".json")

# Folderi koje potpuno ignorišemo (sistemski, build i assets)
$IgnoreFolders = @("node_modules", "dist", "coverage", ".git", "target", "pkg", ".vs", ".vscode", "bin", "obj", "assets", "test-results", "playwright-report")

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
    $RelPath = $FilePath.Substring($Root.Path.Length + 1).Replace("\", "/")
    
    # Detaljna provera foldera (Hirurška preciznost)
    $PathParts = $RelPath -split '/'
    foreach ($Part in $PathParts) {
        if ($IgnoreFolders -contains $Part) { return }
    }
    
    # Detaljna provera imena fajla
    $FileName = [System.IO.Path]::GetFileName($FilePath).ToLower()
    foreach ($IF in $IgnoreFiles) {
        if ($FileName -eq $IF) { return }
    }

    $Ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
    $IsJson = $JsonExtensions -contains $Ext
    $IsSupported = $SupportedExtensions -contains $Ext

    # Obrađujemo samo ako je na beloj listi
    if (-not $IsJson -and -not $IsSupported) { return }

    # Bezbedno čitanje sirovog sadržaja (Eksplicitno dekodiranje)
    try {
        $RawContent = [System.IO.File]::ReadAllText($FilePath)
    } catch { return }

    if ([string]::IsNullOrEmpty($RawContent)) { return }
    $Stats.Scanned++

    # --- 4. NORMALIZACIJA (Eliminacija sukoba sa Prettier-om) ---
    # Pretvaramo sve završetke u LF (\n) i brišemo razmake na krajevima redova
    $RawLines = $RawContent.Replace("`r`n", "`n") -split "`n"
    $Lines = New-Object System.Collections.Generic.List[string]
    foreach ($Line in $RawLines) {
        $Lines.Add($Line.TrimEnd())
    }
    
    # --- 5. ALARM ZA MISMATCH (Detekcija pogrešnog Copy-Paste-a) ---
    $LineIndex = 0
    foreach ($L in $Lines) {
        $LineIndex++
        if ($LineIndex -gt 5) { break }
        $T = $L.Trim()
        
        # Regex koji hvata celu putanju unutar komentara
        if ($T -match "^(//|#|<!--|/\*)\s*([a-zA-Z0-9_\-\.\/]+\.[a-zA-Z0-9]+)") {
            $FoundPath = $Matches[2].Trim().ToLower()
            $ActualPath = $RelPath.ToLower()
            
            if ($FoundPath -ne $ActualPath) {
                # Provera da li nađena putanja zapravo postoji kao drugi fajl u projektu
                $CheckPath = Join-Path $Root $FoundPath
                if (Test-Path $CheckPath) {
                    Write-Host "`n[FATAL ERROR] HEADER MISMATCH DETECTED!" -ForegroundColor White -BackgroundColor Red
                    Write-Host "File on disk:  $RelPath" -ForegroundColor Yellow
                    Write-Host "Header says:   $FoundPath" -ForegroundColor Red
                    Write-Host "Action: Paste from wrong file confirmed. Aborting.`n"
                    exit 1 # Zaustavlja Guardian sistem
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

        # B. Brisanje starih headera i duplikata
        $isHeader = $T -match "^(//|#|<!--|/\*)\s*(src|tests|scripts|docs|config|package|tsconfig|manifest|[\w\.-]+/).*"
        if ($ProcessingHeader -and ($isHeader -or $T.Contains($RelPath) -or $T -match "=== file:")) {
            continue
        }

        # C. Čuvanje bitnih direktiva (eslint, global, reference)
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

    # --- 7. SASTAVLJANJE (God Mode Strict Spacing) ---
    $Output = New-Object System.Collections.Generic.List[string]

    if (-not $IsJson) {
        # 1. Shebang/XML ide na Liniju 1
        if ($SpecialTopLine) { $Output.Add($SpecialTopLine) }
        
        # 2. Putanja ide na Liniju 2 (ili 1 ako nema specijalne linije)
        $Output.Add((Get-ExpectedHeader $Ext $RelPath))
        
        # 3. Tačno jedan razmak posle headera
        if ($Directives.Count -gt 0 -or $CodeBody.Count -gt 0) {
            $Output.Add("")
        }

        # 4. Direktive jedna ispod druge
        foreach ($D in $Directives) { $Output.Add($D) }

        # 5. Tačno jedan razmak pre koda (samo ako je bilo direktiva)
        if ($Directives.Count -gt 0 -and $CodeBody.Count -gt 0) {
            $Output.Add("")
        }

        # 6. Telo koda
        foreach ($C in $CodeBody) { $Output.Add($C) }
    } else {
        # JSON: Samo čist kod bez ičega
        foreach ($C in $CodeBody) { $Output.Add($C) }
    }

    # Finalni string: Tačno jedan newline na kraju fajla
    $NewText = ($Output -join "`n").TrimEnd() + "`n"
    
    # Poređenje sa normalizovanim starim sadržajem (LF i TrimEnd)
    $OldNormalized = ($Lines -join "`n").TrimEnd() + "`n"
    
    if ($NewText -ne $OldNormalized) {
        try { 
            # Koristimo binarne metode upisa da izbegnemo Windows \r\n probleme
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
Write-Host "STRICT HYGIENE: Source Normalization & Mismatch Protection..." -ForegroundColor Cyan

$Files = Get-ChildItem -Path $Root -Recurse -File
foreach ($F in $Files) {
    Process-File $F.FullName
}

# --- 9. FINAL REPORT SA DINAMIČKIM BOJAMA ---
$jsonColor = if ($Stats.CleanedJson -gt 0) { "Green" } else { "Gray" }
$fixedColor = if ($Stats.Fixed -gt 0) { "Green" } else { "Gray" }
$unchangedColor = if ($Stats.Unchanged -eq $Stats.Scanned -and $Stats.Scanned -gt 0) { "Green" } else { "Gray" }

Write-Host "`nREPORT:" -ForegroundColor White
Write-Host "   Scanned:     $($Stats.Scanned)"
Write-Host "   Fixed Code:  $($Stats.Fixed)" -ForegroundColor $fixedColor
Write-Host "   Purged JSON: $($Stats.CleanedJson)" -ForegroundColor $jsonColor
Write-Host "   Unchanged:   $($Stats.Unchanged)" -ForegroundColor $unchangedColorS
