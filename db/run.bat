if not defined in_subprocess (cmd /k set in_subprocess=y ^& %0 %*) & exit )

@echo off
setlocal enabledelayedexpansion

REM Configuration


set /p SERVER_NAME=<db_name.txt
set "DATABASE_NAME=Honse"
set "SQL_SCRIPTS_DIR=.\"

REM Convert relative path to absolute path
for %%I in ("%SQL_SCRIPTS_DIR%") do set "SQL_SCRIPTS_DIR_ABS=%%~fI"
for %%I in (".") do set "CURRENT_DIR=%%~fI"

echo Starting SQL script execution at %date% %time%
echo =========================================

REM Check if directory exists
if not exist "%SQL_SCRIPTS_DIR%" (
    echo Error: Directory %SQL_SCRIPTS_DIR% does not exist!
    exit /b 1
)

REM Execute all .sql files in the directory
for %%f in ("%SQL_SCRIPTS_DIR%\*.sql") do (
    echo Executing: %%~nxf
    
    sqlcmd -S %SERVER_NAME% -d %DATABASE_NAME% -i "%%f" -b -I
    
    if !errorlevel! equ 0 (
        echo SUCCESS: %%~nxf
    ) else (
        echo FAILED: %%~nxf (Error: !errorlevel!)
    )
)

echo.
echo All scripts processed.