# scripts/add-headers.ps1

$Root = Get-Location

# --- KONFIGURACIJA ---
# Ekstenzije koje SMEJU da imaju zaglavlje
$SupportedExtensions = @(".ts", ".js", ".cjs", ".mjs", ".tsx", ".css", ".html", ".xml", ".rs", ".sh", ".ps1")
# Ekstenzije koje NE SMEJU da imaju ništa (JSON čistimo)
$JsonExtensions = @(".json")

# FOLDERI KOJE POTPUNO IGNORIŠEMO (Sprečava kvarenje ikonica i baze VS-a)
$IgnoreFolders = @("node_modules", "dist", "coverage", ".git", "target", "pkg", ".vs", ".vscode", "bin", "obj", "assets", "test-results", "playwright-report")
$IgnoreFiles = @("package-lock.json", "cargo.lock", "slnx.sqlite")

$Stats = @{ Scanned=0; Fixed=0; CleanedJson=0; Unchanged=0 }

# Kreiramo UTF-8 motor BEZ BOM-a (ovo rešava Prettier Syntax Error)
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Get-ExpectedHeader($Ext, $Path) {
    if ($Ext -eq ".html" -or $Ext -eq ".xml") { return "<!-- $Path -->" }
    if ($Ext -eq ".css")  { return "/* $Path */" }
    if ($Ext -eq ".ps1" -or $Ext -eq ".sh") { return "# $Path" }
    return "// $Path"
}

function Is-Header-Line($Line, $RelPath) {
    $T = $Line.Trim().ToLower()
    if ($T.Length -eq 0) { return $false }
    $LowPath = $RelPath.ToLower()
    # Detektuje zaglavlje bez obzira na tip komentara
    return ($T.StartsWith("//") -and $T.Contains($LowPath)) -or 
           ($T.StartsWith("#") -and $T.Contains($LowPath)) -or 
           ($T.StartsWith("<!--") -and $T.Contains($LowPath)) -or 
           ($T.StartsWith("/*") -and $T.Contains($LowPath)) -or 
           ($T.Contains("=== file:"))
}

function Process-File($FilePath) {
    $RelPath = $FilePath.Substring($Root.Path.Length + 1).Replace("\", "/")
    
    # 1. Ignorisanje sistemskih foldera i assets-a
    $PathParts = $RelPath -split '/'
    foreach ($Part in $PathParts) {
        if ($IgnoreFolders -contains $Part) { return }
    }
    
    $FileName = [System.IO.Path]::GetFileName($FilePath).ToLower()
    if ($IgnoreFiles -contains $FileName) { return }

    $Ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
    $IsJson = $JsonExtensions -contains $Ext
    $IsSupported = $SupportedExtensions -contains $Ext
    if (-not $IsJson -and -not $IsSupported) { return }

    # 2. Bezbedno čitanje (UTF-8)
    try {
        $RawContent = [System.IO.File]::ReadAllText($FilePath, $Utf8NoBom)
    } catch { return }

    if ([string]::IsNullOrEmpty($RawContent)) { return }
    $Stats.Scanned++

    # 3. Normalizacija na LF i uklanjanje starih zaglavlja
    $Lines = $RawContent.Replace("`r`n", "`n") -split "`n"
    $Directives = New-Object System.Collections.Generic.List[string]
    $CodeBody = New-Object System.Collections.Generic.List[string]
    $Shebang = $null
    
    $ProcessingHeader = $true
    foreach ($L in $Lines) {
        $T = $L.Trim()
        if ($ProcessingHeader -and $T.StartsWith("#!")) { $Shebang = $L; continue }
        if ($ProcessingHeader -and (Is-Header-Line $L $RelPath)) { continue }
        if ($ProcessingHeader -and ($T.StartsWith("/* eslint") -or $T.StartsWith("/* global") -or $T.StartsWith("/* tslint") -or $T.StartsWith("/// <reference"))) {
            $Directives.Add($L)
            continue
        }
        if ($T -ne "") { $ProcessingHeader = $false }
        if (-not $ProcessingHeader) { $CodeBody.Add($L) }
    }

    # 4. Sastavljanje po God Mode standardu
    $Output = New-Object System.Collections.Generic.List[string]
    if (-not $IsJson) {
        if ($Shebang) { $Output.Add($Shebang) }
        $Output.Add((Get-ExpectedHeader $Ext $RelPath))
        $Output.Add("")
        foreach ($D in $Directives) { $Output.Add($D) }
        if ($Directives.Count -gt 0) { $Output.Add("") }
        foreach ($C in $CodeBody) { $Output.Add($C) }
    } else {
        # JSON mora biti čist
        foreach ($C in $CodeBody) { $Output.Add($C) }
    }

    $NewText = ($Output -join "`n").TrimEnd() + "`n"
    $OldNormalized = $RawContent.Replace("`r`n", "`n").TrimEnd() + "`n"
    
    # 5. Upisivanje razlika
    if ($NewText -ne $OldNormalized) {
        try {
            [System.IO.File]::WriteAllText($FilePath, $NewText, $Utf8NoBom)
            if ($IsJson) { $Stats.CleanedJson++ } else { $Stats.Fixed++ }
        } catch { }
    } else {
        $Stats.Unchanged++
    }
}

# --- IZVRŠENJE ---
Write-Host "HYGIENE SYSTEM: Headerizing Source & Cleaning JSON..." -ForegroundColor Cyan

$Files = Get-ChildItem -Path $Root -Recurse -File
foreach ($F in $Files) { Process-File $F.FullName }

# --- LEPI REPORT ---
Write-Host "`nREPORT:" -ForegroundColor White
Write-Host "   Scanned:     $($Stats.Scanned)"
Write-Host "   Fixed Code:  $($Stats.Fixed)" -ForegroundColor Green
Write-Host "   Purged JSON: $($Stats.CleanedJson)" -ForegroundColor Yellow
Write-Host "   Unchanged:   $($Stats.Unchanged)" -ForegroundColor Gray
