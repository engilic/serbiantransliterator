# scripts/add-headers.ps1

$ErrorActionPreference = "Stop"

$Root = Get-Location

# Samo fajlovi koji podržavaju komentare (NE .md)
# DODATO: .rs
$Extensions = @(".ts", ".tsx", ".js", ".cjs", ".mjs", ".css", ".html", ".ps1", ".sh", ".rs")

$IgnorePrefixes = @(
    "node_modules/",
    "dist/",
    "coverage/",
    ".git/",
    "wasm-core/pkg/",
    "wasm-core/target/",
    "src/wasm-core/pkg/",
    "src/wasm-core/target/"
)

$Stats = @{
    Scanned = 0
    Fixed   = 0
    Skipped = 0
}

function Is-IgnoredRel([string]$Rel) {
    foreach ($p in $IgnorePrefixes) {
        if ($Rel.StartsWith($p)) { return $true }
    }
    return $false
}

function Get-ExpectedHeaderLine([string]$Ext, [string]$RelPath) {
    switch ($Ext) {
        ".html" { return "<!-- $RelPath -->" }
        ".css"  { return "/* $RelPath */" }
        ".ps1"  { return "# $RelPath" }
        ".sh"   { return "# $RelPath" }
        default { return "// $RelPath" } # uključuje .rs
    }
}

function IsLikelyHeaderPathToken([string]$p) {
    if (-not $p) { return $false }
    $p = $p.Trim()
    if ($p.Contains("/")) { return $true }                    # folder/file.ext
    if ($p -match "\.[a-zA-Z0-9]{1,8}$") { return $true }     # file.ext
    return $false
}

# STRICT: linija mora biti samo "comment + path" (bez dodatnog teksta)
function Extract-HeaderPathStrict([string]$Line) {
    if (-not $Line) { return $null }
    $t = $Line.Trim()

    if ($t -match "===\s*FILE:\s*(.+)$") {
        $p = ($Matches[1] -as [string]).Trim().Replace("\", "/")
        if (IsLikelyHeaderPathToken $p) { return $p }
        return $null
    }

    if ($t -match "^//\s+([^\s]+)\s*$") {
        $p = ($Matches[1] -as [string]).Trim().Replace("\", "/")
        if (IsLikelyHeaderPathToken $p) { return $p }
        return $null
    }

    if ($t -match "^#\s+([^\s]+)\s*$") {
        $p = ($Matches[1] -as [string]).Trim().Replace("\", "/")
        if (IsLikelyHeaderPathToken $p) { return $p }
        return $null
    }

    if ($t -match "^/\*\s+([^\s]+)\s*\*/\s*$") {
        $p = ($Matches[1] -as [string]).Trim().Replace("\", "/")
        if (IsLikelyHeaderPathToken $p) { return $p }
        return $null
    }

    if ($t -match "^<!--\s+([^\s]+)\s*-->\s*$") {
        $p = ($Matches[1] -as [string]).Trim().Replace("\", "/")
        if (IsLikelyHeaderPathToken $p) { return $p }
        return $null
    }

    return $null
}

function Is-DirectiveLine([string]$TrimmedLine) {
    if (-not $TrimmedLine) { return $false }

    # Shebang (bash/node)
    if ($TrimmedLine.StartsWith("#!")) { return $true }

    # TS triple-slash refs (i Rust doc /// na samom vrhu neće škoditi ako je tretiraš kao direktivu)
    if ($TrimmedLine.StartsWith("///")) { return $true }

    # ESLint / global blocks
    if ($TrimmedLine.StartsWith("/* eslint")) { return $true }
    if ($TrimmedLine.StartsWith("/* global")) { return $true }

    # PowerShell
    if ($TrimmedLine.ToLower().StartsWith("#requires")) { return $true }

    return $false
}

function Write-Utf8NoBom([string]$FilePath, [string]$Content) {
    try {
        $Content | Set-Content -Path $FilePath -NoNewline -Encoding utf8NoBOM
    } catch {
        $Content | Set-Content -Path $FilePath -NoNewline -Encoding utf8
    }
}

function Get-TrackedFiles() {
    $out = (& git ls-files) 2>$null
    if (-not $out) { return @() }

    return ($out -split "`n") |
        ForEach-Object { $_.Trim() } |
        Where-Object { $_ } |
        ForEach-Object { $_.Replace("\", "/") }
}

function Get-HeaderZoneEndIndex([string[]]$Lines) {
    if ($Lines.Count -gt 0) {
        $Lines[0] = $Lines[0] -replace "^\uFEFF", ""
    }

    $i = 0
    while ($i -lt $Lines.Count -and (Is-DirectiveLine $Lines[$i].Trim())) { $i++ }

    while ($i -lt $Lines.Count) {
        $t = $Lines[$i].Trim()
        if ($t -eq "") { $i++; continue }

        $maybe = Extract-HeaderPathStrict $t
        if ($maybe) { $i++; continue }

        if ($t -match "===\s*FILE:") { $i++; continue }

        break
    }

    return $i
}

function Scan-WrongPathHeaderZone([string]$AbsPath, [string]$RelPath) {
    $ext = [System.IO.Path]::GetExtension($RelPath).ToLower()
    if ($Extensions -notcontains $ext) { return @() }
    if (Is-IgnoredRel $RelPath) { return @() }

    $content = Get-Content -Path $AbsPath -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return @() }

    $lines = $content -split "`r`n|`n"
    if ($lines.Count -eq 0) { return @() }
    $lines[0] = $lines[0] -replace "^\uFEFF", ""

    $zoneEnd = Get-HeaderZoneEndIndex $lines

    $issues = New-Object System.Collections.Generic.List[object]
    for ($ln = 0; $ln -lt $zoneEnd; $ln++) {
        $t = $lines[$ln].Trim()
        $p = Extract-HeaderPathStrict $t
        if (-not $p) { continue }

        if ($p -ne $RelPath) {
            $issues.Add([pscustomobject]@{
                File     = $RelPath
                Line     = ($ln + 1)
                Found    = $p
                Expected = $RelPath
                Raw      = $t
            })
        }
    }

    return $issues
}

function Fix-OneFile([string]$AbsPath, [string]$RelPath) {
    $ext = [System.IO.Path]::GetExtension($RelPath).ToLower()
    if ($Extensions -notcontains $ext) { return }
    if (Is-IgnoredRel $RelPath) { return }

    $Stats.Scanned++

    $expectedHeader = Get-ExpectedHeaderLine $ext $RelPath
    $content = Get-Content -Path $AbsPath -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return }

    $lines = $content -split "`r`n|`n"
    if ($lines.Count -eq 0) { return }
    $lines[0] = $lines[0] -replace "^\uFEFF", ""

    # 1) directives (shebang itd.)
    $directives = New-Object System.Collections.Generic.List[string]
    $i = 0
    while ($i -lt $lines.Count -and (Is-DirectiveLine $lines[$i].Trim())) {
        $directives.Add($lines[$i])
        $i++
    }

    # 2) preskoči blank + header linije posle direktiva (auto-fix zona)
    while ($i -lt $lines.Count) {
        $t = $lines[$i].Trim()
        if ($t -eq "") { $i++; continue }

        $hp = Extract-HeaderPathStrict $t
        if ($hp) { $i++; continue } # wrong-path već stopiran u pass 1

        if ($t -match "===\s*FILE:") { $i++; continue }

        break
    }

    # 3) code
    $code = New-Object System.Collections.Generic.List[string]
    for (; $i -lt $lines.Count; $i++) { $code.Add($lines[$i]) }

    # 4) ukloni leading prazne linije u code delu (da ne bude 2+ prazne linije posle headera)
    while ($code.Count -gt 0 -and $code[0].Trim() -eq "") {
        $code.RemoveAt(0)
    }

    # 5) directives + header (odmah) + 1 blank + code
    $final = New-Object System.Collections.Generic.List[string]
    $final.AddRange($directives)
    $final.Add($expectedHeader)
    $final.Add("") # obavezna prazna linija ispod putanje
    $final.AddRange($code)

    $newContent = $final -join "`n"

    if ($newContent.Trim() -ne $content.Trim()) {
        Write-Host ("✔ FIXED: {0}" -f $RelPath) -ForegroundColor Green
        $Stats.Fixed++
        Write-Utf8NoBom $AbsPath $newContent
    } else {
        $Stats.Skipped++
    }
}

# -------------------------
# MAIN
# -------------------------

Write-Host "🔍 HEADER AUTO-FIX: scanning git-tracked files..." -ForegroundColor Cyan

$tracked = Get-TrackedFiles
if ($tracked.Count -eq 0) {
    Write-Host "⚠ No git-tracked files found (or git not available)." -ForegroundColor Yellow
    exit 0
}

# procesuiraj ovaj skript LAST (bezbednije dok radi)
$selfRel = "scripts/add-headers.ps1"
if ($tracked -contains $selfRel) {
    $tracked = @($tracked | Where-Object { $_ -ne $selfRel }) + @($selfRel)
}

# PASS 1: abort on copy/paste wrong-path header u header zoni
$wrong = New-Object System.Collections.Generic.List[object]

foreach ($rel in $tracked) {
    $ext = [System.IO.Path]::GetExtension($rel).ToLower()
    if ($Extensions -notcontains $ext) { continue }
    if (Is-IgnoredRel $rel) { continue }

    $abs = Join-Path $Root $rel
    if (-not (Test-Path $abs)) { continue }

    $issues = Scan-WrongPathHeaderZone $abs $rel
    foreach ($it in $issues) { $wrong.Add($it) | Out-Null }
}

if ($wrong.Count -gt 0) {
    Write-Host ""
    Write-Host "✖ COPY/PASTE PATH HEADER ERROR — aborting (not auto-fixing these)." -ForegroundColor Red
    Write-Host "  Fix these manually (wrong file path in header zone), then rerun." -ForegroundColor Yellow
    Write-Host ""

    $grouped = $wrong | Group-Object File
    foreach ($g in $grouped) {
        Write-Host ("📄 {0}" -f $g.Name) -ForegroundColor White
        foreach ($it in $g.Group) {
            Write-Host ("   line {0}: Found '{1}' but expected '{2}'" -f $it.Line, $it.Found, $it.Expected) -ForegroundColor Red
            Write-Host ("     Raw: {0}" -f $it.Raw) -ForegroundColor DarkGray
        }
        Write-Host ""
    }

    exit 1
}

# PASS 2: auto-fix everything else
Write-Host "🧹 HEADER AUTO-FIX: applying fixes..." -ForegroundColor Cyan

foreach ($rel in $tracked) {
    $ext = [System.IO.Path]::GetExtension($rel).ToLower()
    if ($Extensions -notcontains $ext) { continue }
    if (Is-IgnoredRel $rel) { continue }

    $abs = Join-Path $Root $rel
    if (-not (Test-Path $abs)) { continue }

    Fix-OneFile $abs $rel
}

Write-Host "`n📊 HEADER AUTO-FIX REPORT:" -ForegroundColor White
Write-Host ("   Scanned: {0}" -f $Stats.Scanned)
Write-Host ("   Fixed:   {0}" -f $Stats.Fixed) -ForegroundColor Green
Write-Host ("   Skipped: {0}" -f $Stats.Skipped) -ForegroundColor Gray
