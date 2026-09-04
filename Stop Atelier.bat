@echo off
taskkill /F /IM node.exe
echo Atelier servers stopped successfully!
timeout /t 2 >nul