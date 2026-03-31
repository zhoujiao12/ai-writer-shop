@echo off
chcp 65001 >nul
echo ========================================
echo ZZDH 诊断工具
echo ========================================
echo.

set ZZDH_PATH=D:\字字动画_8_0_7\字字动画_8_0_7\字字动画.exe

echo [1] 检查程序文件...
if exist "%ZZDH_PATH%" (
    echo ✓ 程序文件存在: %ZZDH_PATH%
) else (
    echo ✗ 程序文件不存在！
    goto :end
)

echo.
echo [2] 检查完整性检测...
cd /d "D:\字字动画_8_0_7\字字动画_8_0_7"
if exist "完整性检测.bat" (
    call "完整性检测.bat"
) else (
    echo ✗ 完整性检测文件不存在
)

echo.
echo [3] 尝试启动ZZDH...
echo 启动中，请稍候...
start "" "%ZZDH_PATH%"

echo.
echo 如果ZZDH窗口没有出现，请检查:
echo - 是否有杀毒软件拦截
echo - 是否有其他实例在运行
echo - Windows事件查看器中的错误日志

:end
echo.
echo ========================================
echo 诊断完成
echo ========================================
pause
