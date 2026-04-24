@echo off
REM ============================================
REM LOTO Database Restore Script
REM ============================================

echo.
echo ============================================
echo LOTO Database Restore
echo ============================================
echo.

if "%1"=="" (
    echo ERROR: Please provide backup file path
    echo Usage: restore-database.bat backups\loto_backup_YYYYMMDD_HHMMSS.sql
    echo.
    pause
    exit /b 1
)

set BACKUP_FILE=%1

if not exist "%BACKUP_FILE%" (
    echo ERROR: Backup file not found: %BACKUP_FILE%
    echo.
    pause
    exit /b 1
)

echo WARNING: This will overwrite the current database!
echo Backup file: %BACKUP_FILE%
echo.
set /p CONFIRM="Are you sure you want to restore? (yes/no): "

if /i not "%CONFIRM%"=="yes" (
    echo Restore cancelled.
    pause
    exit /b 0
)

REM Database credentials
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=loto_db
set PGUSER=loto_user
set PGPASSWORD=loto_password_change_in_production

echo.
echo Restoring database from: %BACKUP_FILE%
echo.

REM Restore database
pg_restore -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c -v "%BACKUP_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo Restore completed successfully!
    echo ============================================
    echo.
) else (
    echo.
    echo ============================================
    echo ERROR: Restore failed!
    echo ============================================
    echo.
)

pause
