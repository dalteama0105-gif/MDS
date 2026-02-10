@echo off
echo Starting MDS Local Server on http://localhost:8000
echo.

:: Change to XAMPP PHP directory
pushd C:\xampp\php

:: Start PHP built-in server serving the project directory
php.exe -c php.ini -S localhost:8000 -t "c:\Users\junal\OneDrive\Desktop\code\MDS(T1)"

popd
pause
