@echo off
REM Auto-sync script for Claude Code environment
echo Starting auto-sync...

cd /d C:\Users\sintt\my-claude-config

REM Pull latest changes
echo Pulling latest changes from GitHub...
git pull origin master

REM Add all changes
echo Adding all changes...
git add .

REM Check if there are changes to commit
git diff --staged --quiet
if %errorlevel% neq 0 (
    echo Changes detected, committing...
    git commit -m "Auto-sync: %date% %time%"
    echo Pushing to GitHub...
    git push origin master
    echo Sync completed!
) else (
    echo No changes to sync.
)

pause