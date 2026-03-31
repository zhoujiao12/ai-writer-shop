# ZZDH 启动诊断脚本
$Host.UI.RawUI.WindowTitle = "ZZDH Diagnostic"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ZZDH Diagnostic Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$zzdhPath = "D:\字字动画_8_0_7\字字动画_8_0_7\字字动画.exe"
$zzdhDir = "D:\字字动画_8_0_7\字字动画_8_0_7"

# 1. 检查程序
Write-Host "[1] 检查程序文件..." -ForegroundColor Yellow
if (Test-Path $zzdhPath) {
    Write-Host "✓ 程序存在: $zzdhPath" -ForegroundColor Green
    $fileInfo = Get-Item $zzdhPath
    Write-Host "  大小: $([math]::Round($fileInfo.Length/1MB, 2)) MB" -ForegroundColor Gray
    Write-Host "  修改: $($fileInfo.LastWriteTime)" -ForegroundColor Gray
} else {
    Write-Host "✗ 程序不存在!" -ForegroundColor Red
    Read-Host "按回车退出"
    exit 1
}

# 2. 检查进程
Write-Host ""
Write-Host "[2] 检查现有进程..." -ForegroundColor Yellow
$processes = Get-Process -Name "字字动画" -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "⚠ 发现 $($processes.Count) 个运行中的实例" -ForegroundColor Yellow
    foreach ($p in $processes) {
        Write-Host "  PID: $($p.Id), 内存: $([math]::Round($p.WorkingSet64/1MB, 2)) MB" -ForegroundColor Gray
    }
    $kill = Read-Host "是否结束这些进程? (y/n)"
    if ($kill -eq 'y') {
        $processes | Stop-Process -Force
        Write-Host "✓ 已结束进程" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
} else {
    Write-Host "✓ 没有运行中的实例" -ForegroundColor Green
}

# 3. 检查日志
Write-Host ""
Write-Host "[3] 最近日志..." -ForegroundColor Yellow
$logDir = Join-Path $zzdhDir "日志"
if (Test-Path $logDir) {
    $latestLog = Get-ChildItem $logDir -Filter "generator_log_*.txt" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($latestLog) {
        Write-Host "  最新日志: $($latestLog.Name)" -ForegroundColor Gray
        Write-Host "  时间: $($latestLog.LastWriteTime)" -ForegroundColor Gray
    }
}

# 4. 启动程序
Write-Host ""
Write-Host "[4] 启动ZZDH..." -ForegroundColor Yellow
try {
    Start-Process $zzdhPath -WorkingDirectory $zzdhDir
    Write-Host "✓ 已启动，请检查窗口" -ForegroundColor Green
} catch {
    Write-Host "✗ 启动失败: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "诊断完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Read-Host "按回车退出"
