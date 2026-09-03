@echo off
title Launching Atelier...

:: Start Express Backend
start "Atelier Backend" cmd /k "cd /d D:\CODING\ATELIER PROJECT\atelier\backend && node server.js"

:: Start Vite Frontend
start "Atelier Frontend" cmd /k "cd /d D:\CODING\ATELIER PROJECT\atelier\frontend && npm run dev"

:: Wait 3 seconds for servers to start, then open app
timeout /t 3 /nobreak >nul
start http://localhost:5173