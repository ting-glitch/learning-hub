@echo off
chcp 65001 >nul
title Learning Hub Local Server

node server.js

if %errorlevel% neq 0 (
    echo.
    echo 伺服器啟動失敗。請檢查是否已安裝 Node.js，或是連接埠 8080 已被佔用。
    echo.
    pause
)
