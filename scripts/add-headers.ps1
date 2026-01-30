# scripts/add-headers.ps1

$Root = Get-Location
$Extensions = @(".ts", ".js", ".cjs", ".mjs", ".tsx", ".css", ".html")
$Ignore = @("node_modules", "dist", "coverage", ".git", "wasm-core/pkg", "wasm-core/target")
$Stats = @{ Scanned=0; Cleaned=0; Skipped=0 }

function Get-ExpectedHeader($Ext, $Path) {
    if ($Ext -eq ".html") { return "<!-- $Path -->" }
    if ($Ext -eq ".css")  { return "/* $Path */" }
    return "// $Path"
}

function Is-Header-Line($Line) {
    if ($Line -match "^// .*src/.*") { return $true }
    if ($Line -match "^// .*scripts/.*") { return $true }
    if ($Line -match "^// .*tests/.*") { return $true }
    if ($Line -match "^<!-- .* -->") { return $true }
    if ($Line -match "^\/\* .* \*\/") { return $true }
    if ($Line -match "=== FILE:") { return $true }
    return $false
}

function Process-File($FilePath) {
    $RelPath = $FilePath.Substring($Root.Path.Length + 1).Replace("\", "/")
    foreach ($I in $Ignore) { if ($RelPath.StartsWith($I)) { return } }

    $Ext = [System.IO.Path]::GetExtension($FilePath)
    if ($Extensions -notcontains $Ext) { return }

    $Stats.Scanned++
    $Expected = Get-ExpectedHeader $Ext $RelPath
    
    $Content = Get-Content $FilePath -Raw
    if (-not $Content) { return }
    $Lines = $Content -split "`r`n|`n"
    if ($Lines.Count -eq 0) { return }

    $Directives = New-Object System.Collections.Generic.List[string]
    $CodeLines = New-Object System.Collections.Generic.List[string]
    
    $InDirectives = $true
    foreach ($L in $Lines) {
        $Trimmed = $L.Trim()
        
        if ($InDirectives -and ($Trimmed.StartsWith("#!") -or $Trimmed.StartsWith("///") -or $Trimmed.StartsWith("/* eslint") -or $Trimmed.StartsWith("/* global"))) {
            $Directives.Add($L)
            continue
        }
        
        $InDirectives = $false 

        if (Is-Header-Line $Trimmed) {
            continue 
        }
        
        if ($CodeLines.Count -eq 0 -and $Trimmed -eq "") {
            continue
        }

        $CodeLines.Add($L)
    }

    $FinalLines = New-Object System.Collections.Generic.List[string]
    $FinalLines.AddRange($Directives)
    $FinalLines.Add($Expected)
    $FinalLines.AddRange($CodeLines)
    
    $NewContent = $FinalLines -join "`n"
    
    if ($NewContent.Trim() -ne $Content.Trim()) {
        Write-Host "CLEANED: $RelPath" -ForegroundColor Green
        $Stats.Cleaned++
        $NewContent | Set-Content $FilePath -NoNewline -Encoding UTF8
    } else {
        $Stats.Skipped++
    }
}

# UKLONJENI EMODŽIJI I AMPERSAND KOJI SU PRAVILI PROBLEM
Write-Host "PURGING AND RE-HEADERIZING..." -ForegroundColor Cyan

Get-ChildItem -Path $Root -Recurse -File | ForEach-Object { Process-File $_.FullName }

Write-Host "`nREPORT:" -ForegroundColor White
Write-Host "   Scanned: $($Stats.Scanned)"
Write-Host "   Cleaned: $($Stats.Cleaned)" -ForegroundColor Green
Write-Host "   Skipped: $($Stats.Skipped)" -ForegroundColor Gray
