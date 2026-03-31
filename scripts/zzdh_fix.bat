@echo off
chcp 65001 >nul 2>&1

echo ========================================
echo ZZDH Diagnostic Tool
echo ========================================
echo.

set ZZDH_PATH=D:\字字动画_8_0_7\字字动画_8_0_7\字字动画.exe

echo [1] Checking program file...
if exist "%ZZDH_PATH%" (
    echo OK: Program exists
) else (
    echo ERROR: Program not found!
    goto :end
)

echo.
echo [2] Running integrity check...
cd /d "D:\字字动画_8_0_7\字字动画_8_0_7"
if exist "完整性检测.bat" (
    call "完整性检测.bat"
) else (
    echo WARNING: Integrity check file missing
)

echo.
echo [3] Starting ZZDH...
start "" "%ZZDH_PATH%"
echo ZZDH launched. Check if window appears.

echo.
echo If ZZDH does not start:
echo - Check antivirus blocking
echo - Check Task Manager for zombie process
echo - Run as Administrator

:end
echo.
echo ========================================
echo Done
echo ========================================
pause
