@echo off
title EduRural (no cierres esta ventana mientras uses la app)
cd /d "%~dp0"
echo Iniciando EduRural...
start "" cmd /c "timeout /t 3 >nul & start http://localhost:3000"
node --no-warnings server.js
pause
