@echo off
REM ============================================
REM LOTO Database Backup Script
REM ============================================

echo.
echo ============================================
echo LOTO Database Backup
echo ============================================
echo.

REM Get current date and time for backup filename
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set BACKUP_DATE=%datetime:~0,8%
set BACKUP_TIME=%datetime:~8,6%
set BACKUP_FILENAME=loto_backup_%BACKUP_DATE%_%BACKUP_TIME%.sql

REM Create backups directory if not exists
if not exist "backups" mkdir backups

echo Backing up database to: backups\%BACKUP_FILENAME%
echo.

REM Database credentials from .env
REM Update these if different
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=loto_db
set PGUSER=loto_user
set PGPASSWORD=loto_password_change_in_production

REM Backup database
pg_dump -h %PGHOST% -p %PGPORT% -U %PGUSER% -F c -b -v -f "backups\%BACKUP_FILENAME%" %PGDATABASE%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo Backup completed successfully!
    echo File: backups\%BACKUP_FILENAME%
    echo ============================================
    echo.
    
    REM Also create a plain SQL version for easy viewing
    pg_dump -h %PGHOST% -p %PGPORT% -U %PGUSER% -F p -f "backups\%BACKUP_FILENAME%.plain.sql" %PGDATABASE%
    echo Plain SQL version: backups\%BACKUP_FILENAME%.plain.sql
) else (
    echo.
    echo ============================================
    echo ERROR: Backup failed!
    echo ============================================
    echo.
)

pause
