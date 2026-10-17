@echo off
chcp 65001 >nul
title Investment Machine 投研工作台
cd /d "%~dp0"

echo ============================================================
echo   HR 模板投资组合 · 投研工作台与机构演示系统
echo ============================================================
echo.

REM 1. 检查 8080 端口是否已在运行
netstat -ano | findstr :8080 | findstr LISTENING >nul 2>nul
if %errorlevel% neq 0 goto START_SERVER

echo [提示] 检测到本地服务器已在运行 [端口 8080]
echo [启动] 正在唤起默认浏览器打开页面: http://localhost:8080/ ...
start http://localhost:8080/
echo.
echo 浏览器已启动。本窗口将在 2 秒后自动关闭。
ping -n 3 127.0.0.1 >nul
exit /b 0

:START_SERVER
REM 2. 检测 Python 环境
set "PY_CMD="
if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
if "%PY_CMD%"=="" where py >nul 2>nul && set "PY_CMD=py"
if "%PY_CMD%"=="" where python >nul 2>nul && set "PY_CMD=python"

if "%PY_CMD%"=="" (
    echo [错误] 未在系统中检测到 Python，请先安装 Python 3.10 或更高版本。
    pause
    exit /b 1
)

REM 3. 异步拉起默认浏览器 (等待服务完全就绪)
echo [启动] 正在启动本地服务 [http://localhost:8080] ...
start "" cmd /c "ping -n 3 127.0.0.1 >nul && start http://localhost:8080/"

echo [就绪] 正在用默认浏览器打开工作台主页...
echo.
echo ============================================================
echo   本地服务器正在持续运行中...
echo   访问地址: http://localhost:8080/
echo   如需停止服务，请直接关闭本控制台窗口或按 Ctrl+C
echo ============================================================
echo.

REM 4. 运行服务主进程
"%PY_CMD%" server.py

pause
