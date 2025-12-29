@echo off
echo Starting Frontend with Node.js...
echo.

REM Add Node.js to PATH for this session
set "PATH=C:\Program Files\nodejs;%PATH%"

REM Verify Node is accessible
node --version
npm --version

echo.
echo Starting React development server...
npm start
