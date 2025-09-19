@echo off
echo ========================================
echo     코딩 멘토 프로젝트 품질 검사
echo ========================================

echo.
echo [1/4] 백엔드 ESLint 검사 중...
cd backend
call npm run lint:check
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 백엔드 ESLint 검사 실패
    pause
    exit /b 1
)
echo ✅ 백엔드 ESLint 검사 통과

echo.
echo [2/4] 백엔드 Prettier 검사 중...
call npm run format:check
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 백엔드 코드 포맷팅 검사 실패
    echo 💡 'npm run format'으로 자동 수정 가능
    pause
    exit /b 1
)
echo ✅ 백엔드 코드 포맷팅 검사 통과

echo.
echo [3/4] 백엔드 테스트 실행 중...
call npm test
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 백엔드 테스트 실패
    pause
    exit /b 1
)
echo ✅ 백엔드 테스트 통과

echo.
echo [4/4] 프론트엔드 ESLint 검사 중...
cd ..\frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 프론트엔드 빌드 실패
    pause
    exit /b 1
)
echo ✅ 프론트엔드 빌드 통과

cd ..
echo.
echo ========================================
echo ✅ 모든 품질 검사 통과!
echo ========================================
pause