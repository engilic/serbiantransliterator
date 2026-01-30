# scripts/add-headers.ps1

$Root = Get-Location

# --- 1. KONFIGURACIJA (Whitelist ekstenzija i Blacklist foldera) ---
$SupportedExtensions = @(".ts", ".js", ".cjs", ".mjs", ".tsx", ".css", ".html", ".xml", ".rs", ".sh", ".ps1")
$JsonExtensions = @(".json")

# FOLDERI KOJE POTPUNO IGNORIŠEMO (Sprečava kvarenje ikonica i sistemskih baza)
$IgnoreFolders = @("node_modules", "dist", "coverage", ".git", "target", "pkg", ".vs", ".vscode", "bin", "obj", "assets", "test-results", "playwright-report")

# Specifični fajlovi koji se nikada ne diraju automatski
$IgnoreFiles = @("package-lock.json", "cargo.lock", "slnx.sqlite")

$Stats = @{ Scanned=0; Fixed=0; CleanedJson=0; Unchanged=0 }
# Kreiramo UTF-8 motor BEZ BOM-a (ovo rešava Prettier Syntax Error i Mojibake)
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
    
    # Ignorisanje foldera (uključujući assets)
    $PathParts = $RelPath -split '/'
    foreach ($Part in $PathParts) {
        if ($IgnoreFolders -contains $Part) { return }
    }
    
    # Ignorisanje sistemskih lock fajlova
    $FileName = [System.IO.Path]::GetFileName($FilePath).ToLower()
    if ($IgnoreFiles -contains $FileName) { return }

    $Ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
    $IsJson = $JsonExtensions -contains $Ext
    $IsSupported = $SupportedExtensions -contains $Ext

    # Obrađujemo samo podržane formate i JSON
    if (-not $IsJson -and -not $IsSupported) { return }

    # Bezbedno čitanje sirovog sadržaja
    try {
        $RawContent = [System.IO.File]::ReadAllText($FilePath)
    } catch { return }

    if ([string]::IsNullOrEmpty($RawContent)) { return }
    $Stats.Scanned++

    # Normalizacija na LF (\n) - Standard za Cross-platform razvoj
    $Lines = $RawContent.Replace("`r`n", "`n") -split "`n"
    
    # --- 4. ALARM ZA MISMATCH (Detekcija pogrešnog Copy-Paste-a) ---
    $LineIndex = 0
    foreach ($L in $Lines) {
        $LineIndex++
        if ($LineIndex -gt 5) { break } # Gledamo samo vrh fajla
        $T = $L.Trim()
        
        # Regex koji hvata celu putanju uključujući foldere i fajl sa ekstenzijom
        if ($T -match "^(//|#|<!--|/\*)\s*([a-zA-Z0-9_\-\.\/]+\.[a-zA-Z0-9]+)") {
            $FoundPathInFile = $Matches[2].Trim().ToLower()
            $ActualPathOnDisk = $RelPath.ToLower()
            
            if ($FoundPathInFile -ne $ActualPathOnDisk) {
                # Provera da li putanja pronađena u fajlu zapravo postoji kao drugi fajl
                $OtherFilePath = Join-Path $Root $FoundPathInFile
                if (Test-Path $OtherFilePath) {
                    Write-Host "`n[FATAL ERROR] HEADER MISMATCH DETECTED!" -ForegroundColor White -BackgroundColor Red
                    Write-Host "File on disk:  $RelPath" -ForegroundColor Yellow
                    Write-Host "Header says:   $FoundPathInFile" -ForegroundColor Red
                    Write-Host "Action: Paste from wrong file confirmed. Aborting build.`n"
                    exit 1 # Odmah zaustavlja ceo Guardian sistem
                }
            }
        }
    }

    # --- 5. RAZVRSTAVANJE SADRŽAJA ---
    $Directives = New-Object System.Collections.Generic.List[string]
    $CodeBody = New-Object System.Collections.Generic.List[string]
    $SpecialTopLine = $null # Shebang (#!...) ili XML Deklaracija (<?xml...)
    $ProcessingHeader = $true

    foreach ($L in $Lines) {
        $T = $L.Trim()
        
        # A. Specijalne linije koje MORAJU biti na prvom mestu
        if ($ProcessingHeader -and ($T.StartsWith("#!") -or $T.StartsWith("<?xml"))) {
            $SpecialTopLine = $L
            continue
        }

        # B. Detekcija bilo kakvog starog/duplog zaglavlja (za brisanje)
        $isHeader = $T -match "^(//|#|<!--|/\*)\s*(src|tests|scripts|docs|config|package|tsconfig|manifest|[\w\.-]+/).*"
        if ($ProcessingHeader -and ($isHeader -or $T -match "=== file:")) {
            continue
        }

        # C. Direktive (ESLint, global, reference) koje čuvamo
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

    # --- 6. SASTAVLJANJE (God Mode Strict Spacing) ---
    $Output = New-Object System.Collections.Generic.List[string]

    if (-not $IsJson) {
        # 1. Specijalna linija (Shebang ili XML) ide na apsolutni vrh
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

        # 6. Ostatak koda
        foreach ($C in $CodeBody) { $Output.Add($C) }
    } else {
        # JSON: Samo čist kod, bez ikakvih zaglavlja (Strict JSON compliance)
        foreach ($C in $CodeBody) { $Output.Add($C) }
    }

    # Finalna normalizacija (Trim i tačno jedan newline na kraju)
    $NewText = ($Output -join "`n").TrimEnd() + "`n"
    $OldNormalized = $RawContent.Replace("`r`n", "`n").TrimEnd() + "`n"
    
    # --- 7. UPISIVANJE RAZLIKA ---
    if ($NewText -ne $OldNormalized) {
        try { 
            # Koristimo eksplicitni UTF-8 bez BOM-a da ne kvari Prettier/Node
            [System.IO.File]::WriteAllText($FilePath, $NewText, $Utf8NoBom)
            if ($IsJson) { $Stats.CleanedJson++ } else { $Stats.Fixed++ }
        } catch { }
    } else {
        $Stats.Unchanged++
    }
}

# --- 8. IZVRŠENJE I IZVEŠTAJ ---
Write-Host "HYGIENE SYSTEM: Source Normalization & Mismatch Protection..." -ForegroundColor Cyan

$Files = Get-ChildItem -Path $Root -Recurse -File
foreach ($F in $Files) { Process-File $F.FullName }

# Lepi, obojeni report
$jsonColor = if ($Stats.CleanedJson -gt 0) { "Green" } else { "Gray" }
$fixedColor = if ($Stats.Fixed -gt 0) { "Green" } else { "Gray" }

Write-Host "`nREPORT:" -ForegroundColor White
Write-Host "   Scanned:     $($Stats.Scanned)"
Write-Host "   Fixed Code:  $($Stats.Fixed)" -ForegroundColor $fixedColor
Write-Host "   Purged JSON: $($Stats.CleanedJson)" -ForegroundColor $jsonColor
Write-Host "   Unchanged:   $($Stats.Unchanged)" -ForegroundColor Gray
