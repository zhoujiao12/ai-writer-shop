@echo off
chcp 65001 >nul
echo ============================================================
echo 飞书文档自动获取脚本 (Windows版)
echo ============================================================
echo.
echo 步骤：
echo 1. 此脚本会在 Windows 上安装 Python 和 Playwright
echo 2. 然后自动打开飞书文档
echo 3. 输入密码: p36178#5
echo 4. 自动提取内容并保存
echo.
echo ============================================================
echo.

:: 检查 Python 是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo Python 未安装，正在安装...
    winget install Python.Python.3.12
    echo 请重新运行此脚本
    pause
    exit /b
)

:: 检查 Playwright 是否安装
pip show playwright >nul 2>&1
if errorlevel 1 (
    echo 正在安装 Playwright...
    pip install playwright
    playwright install chromium
)

:: 运行 Python 脚本
python "%~dp0feishu_fetcher.py"

pause
