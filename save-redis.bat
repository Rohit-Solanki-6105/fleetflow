@echo off
SET CONTAINER_NAME=redis-local

echo Requesting Redis to save data to disk...

:: This command executes 'redis-cli save' inside the running container
docker exec %CONTAINER_NAME% redis-cli save

if %ERRORLEVEL% EQU 0 (
    echo.
    echo -----------------------------------------
    echo SUCCESS: Data has been flushed to disk.
    echo -----------------------------------------
) else (
    echo.
    echo ERROR: Could not save. Is the container running?
    echo Try running start_redis.bat first.
)
pause