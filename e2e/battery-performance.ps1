param(
    [Parameter(Mandatory)][string]$Serial,
    [ValidateRange(60, 900)][int]$SecondsPerPhase = 180
)

$ErrorActionPreference = 'Stop'
if ($Serial -notmatch '\._adb-tls-connect\._tcp$|^\d{1,3}(\.\d{1,3}){3}:\d+$') {
    throw 'Usa el identificador ADB inalámbrico del teléfono físico.'
}

$package = 'com.erick12.BusTrack'
$evidence = 'evidence/performance/physical-battery-run.json'
$uiFile = "/data/local/tmp/bustrack-perf-ui-$PID.xml"
$null = New-Item -ItemType Directory -Force 'evidence/performance'

function Invoke-PhoneAdb {
    $output = & adb -s $Serial @args
    if ($LASTEXITCODE -ne 0) { throw "Falló ADB: $($args -join ' ')" }
    return $output
}

function Get-ScreenNodes {
    try {
        Invoke-PhoneAdb shell uiautomator dump --compressed $uiFile | Out-Null
        [xml]$ui = (Invoke-PhoneAdb shell cat $uiFile) -join ''
        return $ui.SelectNodes('//node')
    } finally {
        Invoke-PhoneAdb shell rm -f $uiFile | Out-Null
    }
}

function Select-Tab([string]$Name) {
    $tab = Get-ScreenNodes | Where-Object {
        $_.package -eq $package -and ($_.text -eq $Name -or $_.'content-desc' -like "$Name,*")
    } | Select-Object -First 1
    if (-not $tab) { throw "No se encontró la pestaña $Name." }
    $bounds = [regex]::Matches($tab.bounds, '\d+')
    if ($bounds.Count -ne 4) { throw "No se encontraron los límites de la pestaña $Name." }
    $x = [int](([int]$bounds[0].Value + [int]$bounds[2].Value) / 2)
    $y = [int](([int]$bounds[1].Value + [int]$bounds[3].Value) / 2)
    Invoke-PhoneAdb shell input tap $x $y | Out-Null
}

function Read-PhaseSample([string]$Phase, [double]$ElapsedSeconds) {
    $battery = (Invoke-PhoneAdb shell dumpsys battery) -join "`n"
    if ($battery -match '(?m)^\s*(AC|USB|Wireless|Dock) powered:\s*true' -or
        $battery -notmatch '(?m)^\s*status:\s*3\s*$') {
        throw 'El teléfono dejó de estar en descarga durante la medición.'
    }
    $charge = [regex]::Match($battery, '(?m)^\s*Charge counter:\s*(\d+)', 'IgnoreCase')
    $level = [regex]::Match($battery, '(?m)^\s*level:\s*(\d+)')
    if (-not $charge.Success -or [int]$charge.Groups[1].Value -le 0) {
        throw 'Android no publicó un contador de carga válido.'
    }
    $power = (Invoke-PhoneAdb shell dumpsys power) -join "`n"
    if ($power -notmatch 'mWakefulness=Awake') { throw 'La pantalla dejó de estar activa.' }
    $activity = (Invoke-PhoneAdb shell dumpsys activity activities | Select-String 'topResumedActivity').Line
    $appForeground = ($activity -join ' ') -match [regex]::Escape($package)
    if ($appForeground -ne ($Phase -ne 'launcher')) {
        throw 'La aplicación visible cambió durante el intervalo.'
    }
    [ordered]@{
        phase = $Phase
        elapsedSeconds = [math]::Round($ElapsedSeconds, 1)
        chargeMicroAh = [int]$charge.Groups[1].Value
        levelPercent = [int]$level.Groups[1].Value
    }
}

function Read-AppEstimate([string]$Label) {
    $stats = (Invoke-PhoneAdb shell dumpsys batterystats --charged $package) -join "`n"
    $match = [regex]::Match($stats, "(?m)^\s*UID ${Label}:\s*([0-9.]+)")
    if ($match.Success) { return [double]$match.Groups[1].Value }
}

$nodes = Get-ScreenNodes
$hasMap = $nodes | Where-Object { $_.package -eq $package -and $_.text -eq 'Mapa' } | Select-Object -First 1
$hasGuestLogin = $nodes | Where-Object {
    $_.package -eq $package -and $_.text -eq 'Bienvenido a BusTrack'
} | Select-Object -First 1
if (-not $hasMap -and -not $hasGuestLogin) {
    throw 'Abre la pantalla de inicio de sesión o la navegación principal de BusTrack antes de medir.'
}

$packageInfo = (Invoke-PhoneAdb shell cmd package list packages --user 0 -U $package) -join ''
$uid = [regex]::Match($packageInfo, 'uid:(\d+)')
if (-not $uid.Success) { throw 'No se encontró el UID de BusTrack.' }
$uidLabel = 'u0a' + ([int]$uid.Groups[1].Value - 10000)
$previousTimeout = (Invoke-PhoneAdb shell settings --user 0 get system screen_off_timeout).Trim()
if ($previousTimeout -notmatch '^\d+$') { throw 'No se pudo leer el tiempo de espera de pantalla.' }
$report = [ordered]@{
    startedAt = (Get-Date).ToString('o')
    phone = (Invoke-PhoneAdb shell getprop ro.product.model).Trim()
    nativeBuild = 'Expo development client, JavaScript minificado y sin modo de desarrollo'
    brightnessSetting = (Invoke-PhoneAdb shell settings --user 0 get system screen_brightness).Trim()
    brightnessMode = (Invoke-PhoneAdb shell settings --user 0 get system screen_brightness_mode).Trim()
    secondsPerPhase = $SecondsPerPhase
    samples = [System.Collections.Generic.List[object]]::new()
    phases = [System.Collections.Generic.List[object]]::new()
    completed = $false
}

try {
    $timeoutMs = [math]::Max([int]$previousTimeout, ($SecondsPerPhase * 2 + 120) * 1000)
    Invoke-PhoneAdb shell settings --user 0 put system screen_off_timeout $timeoutMs | Out-Null
    $phaseNames = if ($hasMap) { @('inicio-bustrack', 'mapa-bustrack') } else { @('launcher', 'login-bustrack') }
    foreach ($phase in $phaseNames) {
        switch ($phase) {
            'inicio-bustrack' { Select-Tab 'Inicio' }
            'mapa-bustrack' { Select-Tab 'Mapa' }
            'launcher' { Invoke-PhoneAdb shell input keyevent KEYCODE_HOME | Out-Null }
            'login-bustrack' {
                Invoke-PhoneAdb shell am start --user 0 -n "$package/.MainActivity" | Out-Null
            }
        }
        Start-Sleep -Seconds 10
        Write-Output "Midiendo $phase durante $SecondsPerPhase s."
        $appBefore = Read-AppEstimate $uidLabel
        $clock = [Diagnostics.Stopwatch]::StartNew()
        $first = Read-PhaseSample $phase 0
        $report.samples.Add($first)
        while ($clock.Elapsed.TotalSeconds -lt $SecondsPerPhase) {
            $wait = [math]::Min(15, $SecondsPerPhase - $clock.Elapsed.TotalSeconds)
            Start-Sleep -Milliseconds ([math]::Max(1, [int]($wait * 1000)))
            $last = Read-PhaseSample $phase $clock.Elapsed.TotalSeconds
            $report.samples.Add($last)
        }
        $appAfter = Read-AppEstimate $uidLabel
        $report.phases.Add([ordered]@{
            name = $phase
            elapsedSeconds = $last.elapsedSeconds
            deviceDrainMah = ($first.chargeMicroAh - $last.chargeMicroAh) / 1000
            appEstimatedMahBefore = $appBefore
            appEstimatedMahAfter = $appAfter
        })
    }
    $report.completed = $true
} finally {
    try {
        Invoke-PhoneAdb shell settings --user 0 put system screen_off_timeout $previousTimeout | Out-Null
    } finally {
        $report | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 $evidence
    }
}
