# setup-assets.ps1 — Descarga assets para AHA Contactos
# Ejecutar: powershell -ExecutionPolicy Bypass -File setup-assets.ps1

$AssetsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$CssDir = Join-Path $AssetsDir "assets\css"
$LibsDir = Join-Path $AssetsDir "assets\js\libs"

Write-Host "⬇️  Descargando assets para AHA Contactos..." -ForegroundColor Cyan

$urls = @{
    # CSS
    "assets\css\tailwind.min.css" = "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
    "assets\css\daisyui.min.css" = "https://cdn.jsdelivr.net/npm/daisyui@4.12.14/dist/full.min.css"
    "assets\css\bootstrap-icons.css" = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
    "assets\css\animate.min.css" = "https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css"
    # JS Libs
    "assets\js\libs\alpine.js" = "https://cdn.jsdelivr.net/npm/alpinejs@3.14.3/dist/cdn.min.js"
    "assets\js\libs\dexie.js" = "https://cdn.jsdelivr.net/npm/dexie@3.2.6/dist/dexie.min.js"
    "assets\js\libs\crypto-js.js" = "https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.min.js"
    "assets\js\libs\pako.js" = "https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js"
    "assets\js\libs\chart.js" = "https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"
}

$ok = $true
foreach ($relPath in $urls.Keys) {
    $fullPath = Join-Path $AssetsDir $relPath
    $url = $urls[$relPath]
    $dir = Split-Path $fullPath -Parent
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    try {
        Write-Host "  📥 $relPath" -NoNewline
        Invoke-WebRequest -Uri $url -OutFile $fullPath -UseBasicParsing -ErrorAction Stop
        $size = (Get-Item $fullPath).Length
        Write-Host " ($([math]::Round($size/1KB)) KB) ✅" -ForegroundColor Green
    } catch {
        Write-Host " ❌ Falló: $_" -ForegroundColor Red
        $ok = $false
    }
}

if ($ok) {
    Write-Host "`n✅ Todos los assets descargados correctamente." -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Algunos assets fallaron. Revisa tu conexión." -ForegroundColor Yellow
}
