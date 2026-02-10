@echo off
echo Attempting to run MDS Database Setup using XAMPP PHP...
echo.

:: Change to XAMPP PHP directory to ensure extensions load correctly
pushd C:\xampp\php

:: Run the setup script
php.exe -c php.ini "c:\Users\junal\OneDrive\Desktop\code\MDS(T1)\setup_database.php"

popd
echo.
pause
