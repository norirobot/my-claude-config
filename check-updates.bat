@echo off
echo =================================
echo   Claude Code Startup Check
echo =================================
cd /d C:\Users\sintt\my-claude-config

echo Checking for updates from other PC...
git fetch origin master

FOR /f %%i in ('git rev-list HEAD..origin/master --count') do set BEHIND=%%i

if %BEHIND% GTR 0 (
    echo.
    echo *** CHANGES DETECTED FROM OTHER PC! ***
    echo %BEHIND% new commits available
    echo.
    set /p choice="Pull updates now? (y/n): "
    if /i "!choice!"=="y" (
        git pull origin master
        echo.
        echo Updates applied! Check requirements.txt for new packages.
    )
) else (
    echo No updates from other PC.
)

echo.
pause