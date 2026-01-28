# scripts/add-headers.ps1
$Root = Get-Location
$Extensions = @(".ts", ".js", ".cjs", ".mjs", ".tsx", ".css", ".html")
$Ignore = @("node_modules", "dist", "coverage", ".git", "wasm-core\pkg", "wasm-core\target")

function Get-CommentStyle($Ext, $Path) {
    if ($Ext -eq ".html") { return "<!-- $Path -->", "^<!-- (.*?) -->" }
    if ($Ext -eq ".css")  { return "/* $Path */", "^\/\* (.*?) \*\/" }
    return "// $Path", "^\/\/ (.*?)$"
}

function Process-File($FilePath) {
    $RelPath = $FilePath.Substring($Root.Path.Length + 1).Replace("\", "/")
    $Ext = [System.IO.Path]::GetExtension($FilePath)
    if ($Extensions -notcontains $Ext) { return }
    $Styles = Get-CommentStyle $Ext $RelPath
    $Expected = $Styles[0]
    $Content = Get-Content $FilePath -Raw
    if (-not $Content) { return }
    $Lines = $Content -split "`r`n|`n"
    if ($Lines.Count -eq 0) { return }
    $Idx = 0
    while ($Idx -lt $Lines.Count) {
        $L = $Lines[$Idx].Trim()
        if ($L.StartsWith("#!") -or $L.StartsWith("///") -or $L.StartsWith("/* eslint") -or $L.StartsWith("/* global")) { $Idx++ } else { break }
    }
    if ($Idx -lt $Lines.Count) {
        if ($Lines[$Idx].Trim() -eq $Expected) { return }
    }
    Write-Host "➕ $RelPath" -ForegroundColor Green
    $New = New-Object System.Collections.Generic.List[string]
    for($i=0; $i -lt $Idx; $i++) { $New.Add($Lines[$i]) }
    $New.Add($Expected)
    for($i=$Idx; $i -lt $Lines.Count; $i++) { $New.Add($Lines[$i]) }
    $New -join "`n" | Set-Content $FilePath -NoNewline -Encoding UTF8
}
Get-ChildItem -Path $Root -Recurse -File | ForEach-Object {
    $P = $_.FullName
    $Rel = $P.Substring($Root.Path.Length + 1)
    $Skip = $false
    foreach ($I in $Ignore) { if ($Rel -match "^$I") { $Skip = $true; break } }
    if (-not $Skip) { Process-File $P }
}
