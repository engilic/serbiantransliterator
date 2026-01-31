# scripts/add-headers.ps1
$ErrorActionPreference = "Stop"

$Root = Get-Location

# Dodao sam .ps1 i .sh (po tvojim primerima)
$Extensions = @(".ts", ".js", ".cjs", ".mjs", ".tsx", ".css", ".html", ".ps1", ".sh")

# Napomena: Ignore se proverava preko relativne putanje na početku
$Ignore = @(
    "node_modules",
    "dist",
    "coverage",
    ".git",
    "wasm-core/pkg",
    "wasm-core/target"
)

$Stats = @{
    Scanned = 0
    Cleaned = 0
    Skipped = 0
}

# -------------------------
# Header helpers
# -------------------------

function Get-ExpectedHeaderLine([string]$Ext, [string]$RelPath) {
    switch ($Ext) {
        ".html" { return "<!-- $RelPath -->" }
        ".css"  { return "/* $RelPath */" }
        ".ps1"  { return "# $RelPath" }
        ".sh"   { return "# $RelPath" }
        default { return "// $RelPath" }
    }
}

function Is-Ignored([string]$RelPath) {
    foreach ($I in $Ignore) {
        if ($RelPath.StartsWith($I)) { return $true }
    }
    return $false
}

function LooksLike-RepoPath([string]$p) {
    if (-not $p) { return $false }
    $p = $p.Trim()

    # vrlo namerno usko: da ne hvata random komentare
    # proširi po potrebi (npr. "apps/", "packages/" itd.)
    if ($p -match "^(src|scripts|tests|assets)/") { return $true }

    return $false
}

function Extract-HeaderPath([string]$Line) {
    # Vrati putanju ako linija liči na naš header format.
    # Ako nije header => $null

    if (-not $Line) { return $null }
    $t = $Line.Trim()

    # Stari format
    if ($t -match "===\s*FILE:\s*(.+)$") {
        $p = ($Matches[1] -as [string]).Trim()
        if (LooksLike-RepoPath $p) { return $p }
        return $null
    }

    # // path
    if ($t -match "^//\s+(.+)$") {
        $p = ($Matches[1] -as [string]).Trim()
        # uzmi samo prvu “reč” da izbegnemo komentare tipa "// src/x.ts - note"
        $p = ($p -split "\s+")[0]
        if (LooksLike-RepoPath $p) { return $p }
        return $null
    }

    # # path (ps1/sh)
    if ($t -match "^#\s+(.+)$") {
        $p = ($Matches[1] -as [string]).Trim()
        $p = ($p -split "\s+")[0]
        if (LooksLike-RepoPath $p) { return $p }
        return $null
    }

    # /* path */
    if ($t -match "^/\*\s+(.+?)\s*\*/$") {
        $p = ($Matches[1] -as [string]).Trim()
        $p = ($p -split "\s+")[0]
        if (LooksLike-RepoPath $p) { return $p }
        return $null
    }

    # <!-- path -->
    if ($t -match "^<!--\s+(.+?)\s*-->$") {
        $p = ($Matches[1] -as [string]).Trim()
        $p = ($p -split "\s+")[0]
        if (LooksLike-RepoPath $p) { return $p }
        return $null
    }

    return $null
}

function Is-DirectiveLine([string]$TrimmedLine) {
    if (-not $TrimmedLine) { return $false }

    # Shebang (bash/node)
    if ($TrimmedLine.StartsWith("#!")) { return $true }

    # TS triple-slash refs
    if ($TrimmedLine.StartsWith("///")) { return $true }

    # ESLint / global blocks (na početku fajla)
    if ($TrimmedLine.StartsWith("/* eslint")) { return $true }
    if ($TrimmedLine.StartsWith("/* global")) { return $true }

    # PowerShell directives
    if ($TrimmedLine.StartsWith("#requires")) { return $true }

    return $false
}

function Is-AnyHeaderLine([string]$TrimmedLine) {
    # Sve što liči na header putanju ili stari === FILE:
    if (Extract-HeaderPath $TrimmedLine) { return $true }
    if ($TrimmedLine -match "===\s*FILE:") { return $true }
    return $false
}

# -------------------------
# Validation: stop if wrong path exists
# -------------------------

function Find-HeaderPathMismatches([string]$FilePath) {
    $RelPath = $FilePath.Substring($Root.Path.Length + 1).Replace("\", "/")
    if (Is-Ignored $RelPath) { return @() }

    $Ext = [System.IO.Path]::GetExtension($FilePath)
    if ($Extensions -notcontains $Ext) { return @() }

    $Content = Get-Content $FilePath -Raw
    if (-not $Content) { return @() }

    $Lines = $Content -split "`r`n|`n"
    if ($Lines.Count -eq 0) { return @() }

    $issues = New-Object System.Collections.Generic.List[object]

    for ($i = 0; $i -lt $Lines.Count; $i++) {
        $line = $Lines[$i]
        $found = Extract-HeaderPath $line
        if (-not $found) { continue }

        # Ako negde postoji header putanja koja NIJE putanja tog fajla => greška
        if ($found -ne $RelPath) {
            $issues.Add([pscustomobject]@{
                File     = $RelPath
                Line     = ($i + 1)
                Found    = $found
                Expected = $RelPath
                Raw      = $line.Trim()
            })
        }
    }

    return $issues
}

# -------------------------
# Rewrite
# -------------------------

function Process-File([string]$FilePath) {
    $RelPath = $FilePath.Substring($Root.Path.Length + 1).Replace("\", "/")
    if (Is-Ignored $RelPath) { return }

    $Ext = [System.IO.Path]::GetExtension($FilePath)
    if ($Extensions -notcontains $Ext) { return }

    $Stats.Scanned++

    $ExpectedHeader = Get-ExpectedHeaderLine $Ext $RelPath

    $Content = Get-Content $FilePath -Raw
    if (-not $Content) { return }

    $Lines = $Content -split "`r`n|`n"
    if ($Lines.Count -eq 0) { return }

    $Directives = New-Object System.Collections.Generic.List[string]
    $CodeLines = New-Object System.Collections.Generic.List[string]

    $InDirectives = $true

    foreach ($L in $Lines) {
        $Trimmed = $L.Trim()

        if ($InDirectives -and (Is-DirectiveLine $Trimmed)) {
            $Directives.Add($L)
            continue
        }

        $InDirectives = $false

        # ukloni sve stare header linije (bilo koji format)
        if (Is-AnyHeaderLine $Trimmed) {
            continue
        }

        # ukloni prazne linije na samom početku code dela (da ne bude “rupa” posle header-a)
        if ($CodeLines.Count -eq 0 -and $Trimmed -eq "") {
            continue
        }

        $CodeLines.Add($L)
    }

    # Sklopi: Direktive + Header + PRAZNA LINIJA + Kod
    $FinalLines = New-Object System.Collections.Generic.List[string]
    $FinalLines.AddRange($Directives)
    $FinalLines.Add($ExpectedHeader)
    $FinalLines.Add("") # obavezna prazna linija posle putanje
    $FinalLines.AddRange($CodeLines)

    $NewContent = $FinalLines -join "`n"

    if ($NewContent.Trim() -ne $Content.Trim()) {
        Write-Host ("✔ CLEANED: {0}" -f $RelPath) -ForegroundColor Green
        $Stats.Cleaned++
        $NewContent | Set-Content $FilePath -NoNewline -Encoding UTF8
    } else {
        $Stats.Skipped++
    }
}

# -------------------------
# MAIN
# -------------------------

Write-Host "🔍 VALIDATING HEADERS..." -ForegroundColor Cyan

$AllFiles = Get-ChildItem -Path $Root -Recurse -File
$AllIssues = New-Object System.Collections.Generic.List[object]

foreach ($f in $AllFiles) {
    $issues = Find-HeaderPathMismatches $f.FullName
    foreach ($i in $issues) { $AllIssues.Add($i) }
}

if ($AllIssues.Count -gt 0) {
    Write-Host ""
    Write-Host "✖ HEADER PATH MISMATCHES DETECTED. Aborting." -ForegroundColor Red
    Write-Host "   Fix these (wrong path headers) and rerun." -ForegroundColor Yellow
    Write-Host ""

    # grupisanje po fajlu radi čitljivosti
    $grouped = $AllIssues | Group-Object File
    foreach ($g in $grouped) {
        Write-Host ("📄 {0}" -f $g.Name) -ForegroundColor White
        foreach ($it in $g.Group) {
            Write-Host ("   Line {0}: Found '{1}' but expected '{2}'" -f $it.Line, $it.Found, $it.Expected) -ForegroundColor Red
            Write-Host ("     Raw: {0}" -f $it.Raw) -ForegroundColor Gray
        }
        Write-Host ""
    }

    exit 1
}

Write-Host "🧹 PURGING & RE-HEADERIZING..." -ForegroundColor Cyan

foreach ($f in $AllFiles) {
    Process-File $f.FullName
}

Write-Host "`n📊 REPORT:" -ForegroundColor White
Write-Host ("   Scanned: {0}" -f $Stats.Scanned)
Write-Host ("   Cleaned: {0}" -f $Stats.Cleaned) -ForegroundColor Green
Write-Host ("   Skipped: {0}" -f $Stats.Skipped) -ForegroundColor Gray
