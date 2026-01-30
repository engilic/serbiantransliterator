# scripts/add-headers.ps1

$Root = Get-Location
$SupportedExtensions = @(".ts", ".js", ".cjs", ".mjs", ".tsx", ".css", ".html", ".xml", ".rs", ".sh", ".ps1")
$JsonExtensions = @(".json")
$IgnoreFolders = @("node_modules", "dist", "coverage", ".git", "target", "pkg", ".vs", ".vscode", "bin", "obj", "assets", "test-results")
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
    $PathParts = $RelPath -split '/'
    foreach ($Part in $PathParts) { if ($IgnoreFolders -contains $Part) { return } }
    if ($IgnoreFiles -contains [System.IO.Path]::GetFileName($FilePath).ToLower()) { return }
    $Ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
    if ($SupportedExtensions -notcontains $Ext -and $JsonExtensions -notcontains $Ext) { return }

    try { $RawContent = [System.IO.File]::ReadAllText($FilePath) } catch { return }
    if ([string]::IsNullOrEmpty($RawContent)) { return }
    $Stats.Scanned++
    $RawLines = $RawContent.Replace("`r`n", "`n") -split "`n"
    $Lines = New-Object System.Collections.Generic.List[string]
    foreach ($Line in $RawLines) { $Lines.Add($Line.TrimEnd()) }

    # ALARM ZA MISMATCH
    $LineIndex = 0
    foreach ($L in $Lines) {
        $LineIndex++; if ($LineIndex -gt 5) { break }
        if ($L.Trim() -match "^(//|#|<!--|/\*)\s*([a-zA-Z0-9_\-\.\/]+\.[a-zA-Z0-9]+)") {
            $Found = $Matches[2].Trim().ToLower()
            if ($Found -ne $RelPath.ToLower() -and (Test-Path (Join-Path $Root $Found))) {
                Write-Output "[FATAL ERROR] HEADER MISMATCH: $RelPath"; exit 1
            }
        }
    }

    $Directives = New-Object System.Collections.Generic.List[string]
    $CodeBody = New-Object System.Collections.Generic.List[string]
    $SpecialTopLine = $null; $ProcessingHeader = $true
    foreach ($L in $Lines) {
        $T = $L.Trim()
        if ($ProcessingHeader -and ($T.StartsWith("#!") -or $T.StartsWith("<?xml"))) { $SpecialTopLine = $L; continue }
        $isHeader = $T -match "^(//|#|<!--|/\*)\s*(src|tests|scripts|docs|config|package|tsconfig|manifest|[\w\.-]+/).*"
        if ($ProcessingHeader -and ($isHeader -or $T.Contains($RelPath) -or $T -match "=== file:")) { continue }
        if ($ProcessingHeader -and ($T.StartsWith("/* eslint") -or $T.StartsWith("/* global") -or $T.StartsWith("/* tslint") -or $T.StartsWith("/// <reference"))) { $Directives.Add($L); continue }
        if ($T -ne "") { $ProcessingHeader = $false }
        if (-not $ProcessingHeader) { $CodeBody.Add($L) }
    }

    $Output = New-Object System.Collections.Generic.List[string]
    if ($JsonExtensions -notcontains $Ext) {
        if ($SpecialTopLine) { $Output.Add($SpecialTopLine) }
        $Output.Add((Get-ExpectedHeader $Ext $RelPath)); $Output.Add("")
        foreach ($D in $Directives) { $Output.Add($D) }
        if ($Directives.Count -gt 0) { $Output.Add("") }
        foreach ($C in $CodeBody) { $Output.Add($C) }
    } else { foreach ($C in $CodeBody) { $Output.Add($C) } }

    $NewText = ($Output -join "`n").TrimEnd() + "`n"
    if ($NewText -ne ($Lines -join "`n").TrimEnd() + "`n") {
        try {
            [System.IO.File]::WriteAllText($FilePath, $NewText, $Utf8NoBom)
            if ($JsonExtensions -contains $Ext) { $Stats.CleanedJson++ } else {
                $Stats.Fixed++; Write-Output "   -> FIXED: $RelPath"
            }
        } catch { }
    } else { $Stats.Unchanged++ }
}

Write-Output "HYGIENE: Header Normalization..."
Get-ChildItem -Path $Root -Recurse -File | ForEach-Object { Process-File $_.FullName }
Write-Output "`nREPORT: Fixed: $($Stats.Fixed), Purged JSON: $($Stats.CleanedJson), Unchanged: $($Stats.Unchanged)"
