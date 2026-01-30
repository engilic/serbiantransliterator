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

function Is-Header-Line($Line, $RelPath) {
    $T = $Line.Trim().ToLower()
    if ($T.Length -eq 0) { return $false }
    $LowPath = $RelPath.ToLower()
    return ($T.StartsWith("//") -and $T.Contains($LowPath)) -or 
           ($T.StartsWith("#") -and $T.Contains($LowPath)) -or 
           ($T.Contains("<!--") -and $T.Contains($LowPath)) -or 
           ($T.StartsWith("/*") -and $T.Contains($LowPath)) -or 
           ($T.Contains("=== file:"))
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
            $Directives.Add($L); continue
        }
        if ($T -ne "") { $ProcessingHeader = $false }
        if (-not $ProcessingHeader) { $CodeBody.Add($L) }
    }

    $Output = New-Object System.Collections.Generic.List[string]
    if ($JsonExtensions -notcontains $Ext) {
        if ($Shebang) { $Output.Add($Shebang) }
        $Output.Add((Get-ExpectedHeader $Ext $RelPath)); $Output.Add("")
        foreach ($D in $Directives) { $Output.Add($D) }
        if ($Directives.Count -gt 0) { $Output.Add("") }
        foreach ($C in $CodeBody) { $Output.Add($C) }
    } else { foreach ($C in $CodeBody) { $Output.Add($C) } }

    $NewText = ($Output -join "`n").TrimEnd() + "`n"
    if ($NewText -ne $RawContent.Replace("`r`n", "`n").TrimEnd() + "`n") {
        try { 
            [System.IO.File]::WriteAllText($FilePath, $NewText, $Utf8NoBom)
            if ($JsonExtensions -contains $Ext) { $Stats.CleanedJson++ } else { $Stats.Fixed++ }
        } catch { }
    } else { $Stats.Unchanged++ }
}

Write-Host "HYGIENE: Headerizing Source & Purging JSON..." -ForegroundColor Cyan
Get-ChildItem -Path $Root -Recurse -File | ForEach-Object { Process-File $_.FullName }
$jsonColor = if ($Stats.CleanedJson -gt 0) { "Green" } else { "Gray" }
$fixedColor = if ($Stats.Fixed -gt 0) { "Green" } else { "Gray" }
Write-Host "`nREPORT:" -ForegroundColor White
Write-Host "   Fixed Code:  $($Stats.Fixed)" -ForegroundColor $fixedColor
Write-Host "   Purged JSON: $($Stats.CleanedJson)" -ForegroundColor $jsonColor
Write-Host "   Unchanged:   $($Stats.Unchanged)" -ForegroundColor Gray
