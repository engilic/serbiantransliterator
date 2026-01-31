# scripts/add-headers.ps1

$ErrorActionPreference = "Stop"

$Root = Get-Location

# samo fajlovi koji podržavaju komentare (NE md)
$Extensions = @(".ts", ".tsx", ".js", ".cjs", ".mjs", ".css", ".html", ".ps1", ".sh")

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

$FixedFiles = New-Object System.Collections.Generic.List[string]

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
        default { return "// $RelPath" }
    }
}

function IsLikelyHeaderPathToken([string]$p) {
    if (-not $p) { return $false }
    $p = $p.Trim()
    if ($p.Contains("/")) { return $true }                    # folder/file.ext
    if ($p -match "\.[a-zA-Z0-9]{2,8}$") { return $true }     # file.ext
    return $false
}

# STRICT: linija mora biti samo "comment + path" (bez dodatnog teksta)
function Extract-HeaderPathStrict([string]$Line) {
    if (-not $Line) { return $null }
    $t = $Line.Trim()

    # === FILE: path
    if ($t -match "===\s*FILE:\s*(.+)$") {
        $p = ($Matches[1] -as [string]).Trim().Replace("\", "/")
        if (IsLikelyHeaderPathToken $p) { return $p }
        return $null
    }

    # // path
    if ($t -match "^//\s+([^\s]+)\s*$") {
        $p = ($Matches[1] -as [string]).Trim().Replace("\", "/")
        if (IsLikelyHeaderPathToken $p) { return $p }
        return $null
    }

    # # path
    if ($t -match "^#\s+([^\s]+)\s*$") {
        $p = ($Matches[1] -as [string]).Trim().Replace("\", "/")
        if (IsLikelyHeaderPathToken $p) { return $p }
        return $null
    }

    # /* path */
    if ($t -match "^/\*\s+([^\s]+)\s*\*/\s*$") {
        $p = ($Matches[1] -as [string]).Trim().Replace("\", "/")
        if (IsLikelyHeaderPathToken $p) { return $p }
        return $null
    }

    # <!-- path -->
    if ($t -match "^<!--\s+([^\s]+)\s*-->\s*$") {
        $p = ($Matches[1] -as [string]).Trim().Replace("\", "/")
        if (IsLikelyHeaderPathToken $p) { return $p }
        return $null
    }

    return $null
}

function Is-DirectiveLine([string]$TrimmedLine) {
    if (-not $TrimmedLine) { return $false }

    if ($TrimmedLine.StartsWith("#!")) { return $true }                  # shebang
    if ($TrimmedLine.StartsWith("///")) { return $true }                 # TS triple slash
    if ($TrimmedLine.StartsWith("/* eslint")) { return $true }
    if ($TrimmedLine.StartsWith("/* global")) { return $true }
    if ($TrimmedLine.ToLower().StartsWith("#requires")) { return $true } # PowerShell

    return $false
}

function Write-Utf8NoBom([string]$FilePath, [string]$Content) {
    # pwsh: utf8 = no BOM, ali eksplicitno je lepše
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

function Get-HeaderZoneIndices([string[]]$Lines) {
    # vraća indeks gde počinje "code" nakon direktiva + (blank/header/oldheader) zone
    $i = 0

    # 0) strip BOM sa prve linije u memoriji (ako postoji)
    if ($Lines.Count -gt 0) {
        $Lines[0] = $Lines[0] -replace "^\uFEFF", ""
    }

    # 1) directives
    while ($i -lt $Lines.Count -and (Is-DirectiveLine $Lines[$i].Trim())) { $i++ }

    # 2) header zone: blank lines + header lines + old === FILE:
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

    # od početka do kraja "header zone"
    $zoneEnd = Get-HeaderZoneIndices $lines

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

    # 1) directives
    $directives = New-Object System.Collections.Generic.List[string]
    $i = 0
    while ($i -lt $lines.Count -and (Is-DirectiveLine $lines[$i].Trim())) {
        $directives.Add($lines[$i])
        $i++
    }

    # 2) preskoči sve blank/header linije u header zoni (sve što možemo da "auto-fixujemo")
    while ($i -lt $lines.Count) {
        $t = $lines[$i].Trim()
        if ($t -eq "") { $i++; continue }

        $hp = Extract-HeaderPathStrict $t
        if ($hp) {
            # ovde su već eliminisane WRONG-path situacije u pre-scan fazi,
            # ali ostavljamo safety:
            if ($hp -ne $RelPath) {
                throw "WRONG PATH HEADER encountered during fix (should have been caught earlier) in $RelPath"
            }
            $i++
            continue
        }

        if ($t -match "===\s*FILE:") { $i++; continue }

        break
    }

    # 3) ostatak je code
    $code = New-Object System.Collections.Generic.List[string]
    for (; $i -lt $lines.Count; $i++) { $code.Add($lines[$i]) }

    # 4) ukloni leading prazne linije u "code" delu (da ne bude 2+ prazne linije posle headera)
    while ($code.Count -gt 0 -and $code[0].Trim() -eq "") {
        $code.RemoveAt(0)
    }

    # 5) sklopi: directives + header (odmah) + BLANK LINE + code
    $final = New-Object System.Collections.Generic.List[string]
    $final.AddRange($directives)
    $final.Add($expectedHeader)
    $final.Add("") # obavezna prazna linija ispod putanje
    $final.AddRange($code)

    $newContent = $final -join "`n"

    if ($newContent.Trim() -ne $content.Trim()) {
        Write-Host ("✔ FIXED: {0}" -f $RelPath) -ForegroundColor Green
        $Stats.Fixed++
        $FixedFiles.Add($RelPath) | Out-Null
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

# procesuiraj ovaj skript LAST (sigurnije dok radi)
$selfRel = "scripts/add-headers.ps1"
if ($tracked -contains $selfRel) {
    $tracked = @($tracked | Where-Object { $_ -ne $selfRel }) + @($selfRel)
}

# PASS 1: nađi copy/paste greške (wrong-path header u header zoni)
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

if ($FixedFiles.Count -gt 0) {
    Write-Host "`n✅ Fixed files:" -ForegroundColor Green
    foreach ($f in $FixedFiles) {
        Write-Host ("   - {0}" -f $f) -ForegroundColor Green
    }
} else {
    Write-Host "`n✨ No changes needed (all headers already OK)." -ForegroundColor Green
}
