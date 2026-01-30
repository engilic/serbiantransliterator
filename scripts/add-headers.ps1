# scripts/add-headers.ps1

$Root = Get-Location

# --- KONFIGURACIJA ---
$SupportedExtensions = @(".ts", ".js", ".cjs", ".mjs", ".tsx", ".css", ".html", ".xml", ".rs", ".sh", ".ps1")
$JsonExtensions = @(".json")
$IgnoreFolders = @("node_modules", "dist", "coverage", ".git", "target", "pkg", ".vs", ".vscode", "bin", "obj", "assets")
$IgnoreFiles = @("package-lock.json", "cargo.lock", "slnx.sqlite")

$Stats = @{ Scanned=0; Fixed=0; CleanedJson=0; Unchanged=0 }
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Get-ExpectedHeader($Ext, $Path) {
    if ($Ext -eq ".html" -or $Ext -eq ".xml") { return "<!-- $Path -->" }
    if ($Ext -eq ".css")  { return "/* $Path */" }
    if ($Ext -eq ".ps1" -or $Ext -eq ".sh") { return "# $Path" }
    return "// $Path"
}

function Process-File($FilePath) {
    $RelPath = $FilePath.Substring($Root.Path.Length + 1).Replace("\", "/")
    
    # 1. Ignorisanje foldera
    $PathParts = $RelPath -split '/'
    foreach ($Part in $PathParts) { if ($IgnoreFolders -contains $Part) { return } }
    if ($IgnoreFiles -contains [System.IO.Path]::GetFileName($FilePath).ToLower()) { return }

    $Ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
    if ($SupportedExtensions -notcontains $Ext -and $JsonExtensions -notcontains $Ext) { return }

    try { $RawContent = [System.IO.File]::ReadAllText($FilePath) } catch { return }
    if ([string]::IsNullOrEmpty($RawContent)) { return }
    $Stats.Scanned++

    $Lines = $RawContent.Replace("`r`n", "`n") -split "`n"
    
    # --- ALARM: DETEKCIJA POGREŠNOG COPY-PASTE-A ---
    $LineIndex = 0
    foreach ($L in $Lines) {
        $LineIndex++
        if ($LineIndex -gt 5) { break } # Gledamo samo prvih par linija
        $T = $L.Trim()
        
        # [FIXED REGEX]: Hvata celu putanju uključujući foldere i fajl sa ekstenzijom
        # Primer hvatanja: // src/shared/ooxml/dom.ts ili # scripts/add-headers.ps1
        if ($T -match "^(//|#|<!--|/\*)\s*([a-zA-Z0-9_\-\.\/]+\.[a-zA-Z0-9]+)") {
            $FoundPath = $Matches[2].Trim().ToLower()
            $TargetRelPath = $RelPath.ToLower()
            
            # ALARM se pali samo ako nađe drugu validnu putanju koja nije trenutni fajl
            if ($FoundPath -ne $TargetRelPath) {
                # Provera da li FoundPath zapravo postoji kao drugi fajl u projektu 
                # (da bismo izbegli lažne uzbune na obične komentare koji liče na putanje)
                $CheckOtherFile = Join-Path $Root $FoundPath
                if (Test-Path $CheckOtherFile) {
                    Write-Host "`n[FATAL ERROR] HEADER MISMATCH!" -ForegroundColor White -BackgroundColor Red
                    Write-Host "File on disk:  $RelPath" -ForegroundColor Yellow
                    Write-Host "Header in file: $FoundPath" -ForegroundColor Red
                    Write-Host "Action: Paste confirmed from another file. Aborting.`n"
                    exit 1
                }
            }
        }
    }

    # --- LOGIKA ZA ČIŠĆENJE I SASTAVLJANJE ---
    $Directives = New-Object System.Collections.Generic.List[string]
    $CodeBody = New-Object System.Collections.Generic.List[string]
    $Shebang = $null
    $ProcessingHeader = $true

    foreach ($L in $Lines) {
        $T = $L.Trim()
        if ($ProcessingHeader -and $T.StartsWith("#!")) { $Shebang = $L; continue }
        
        # Brišemo bilo koji heder koji sadrži reč src, tests, scripts ili trenutnu putanju
        $isHeader = $T -match "^(//|#|<!--|/\*)\s*(src|tests|scripts|docs|config|[\w\.-]+\.(js|ts|sh|ps1|xml|md|css))"
        if ($ProcessingHeader -and $isHeader) { continue }

        if ($ProcessingHeader -and ($T.StartsWith("/* eslint") -or $T.StartsWith("/* global") -or $T.StartsWith("/* tslint") -or $T.StartsWith("/// <reference"))) {
            $Directives.Add($L); continue
        }
        if ($T -ne "") { $ProcessingHeader = $false }
        if (-not $ProcessingHeader) { $CodeBody.Add($L) }
    }

    $Output = New-Object System.Collections.Generic.List[string]
    $IsJson = $JsonExtensions -contains $Ext

    if (-not $IsJson) {
        if ($Shebang) { $Output.Add($Shebang) }
        $Output.Add((Get-ExpectedHeader $Ext $RelPath))
        $Output.Add("")
        foreach ($D in $Directives) { $Output.Add($D) }
        if ($Directives.Count -gt 0) { $Output.Add("") }
        foreach ($C in $CodeBody) { $Output.Add($C) }
    } else {
        foreach ($C in $CodeBody) { $Output.Add($C) }
    }

    $NewText = ($Output -join "`n").TrimEnd() + "`n"
    $OldNormalized = $RawContent.Replace("`r`n", "`n").TrimEnd() + "`n"
    
    if ($NewText -ne $OldNormalized) {
        try { 
            [System.IO.File]::WriteAllText($FilePath, $NewText, $Utf8NoBom)
            if ($IsJson) { $Stats.CleanedJson++ } else { $Stats.Fixed++ }
        } catch { }
    } else { $Stats.Unchanged++ }
}

Write-Host "STRICT HYGIENE: Source Normalization & Mismatch Protection..." -ForegroundColor Cyan
$Files = Get-ChildItem -Path $Root -Recurse -File
foreach ($F in $Files) { Process-File $F.FullName }

$jsonColor = if ($Stats.CleanedJson -gt 0) { "Green" } else { "Gray" }
$fixedColor = if ($Stats.Fixed -gt 0) { "Green" } else { "Gray" }
Write-Host "`nREPORT:" -ForegroundColor White
Write-Host "   Fixed Code:  $($Stats.Fixed)" -ForegroundColor $fixedColor
Write-Host "   Purged JSON: $($Stats.CleanedJson)" -ForegroundColor $jsonColor
Write-Host "   Unchanged:   $($Stats.Unchanged)" -ForegroundColor Gray
