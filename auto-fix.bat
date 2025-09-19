@echo off
echo ========================================
echo     코딩 멘토 프로젝트 자동 수정
echo ========================================

echo.
echo [1/2] 백엔드 코드 자동 수정 중...
cd backend

echo   - ESLint 자동 수정...
call npm run lint:fix
echo   ✅ ESLint 자동 수정 완료

echo   - Prettier 코드 포맷팅...
call npm run format
echo   ✅ 코드 포맷팅 완료

echo.
echo [2/2] 프론트엔드 코드 확인 중...
cd ..\frontend
echo   - React 앱 빌드 테스트...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 프론트엔드 빌드 실패
    pause
    exit /b 1
)
echo ✅ 프론트엔드 빌드 성공

cd ..
echo.
echo ========================================
echo ✅ 자동 수정 완료!
echo 💡 이제 'quality-check.bat'으로 최종 검증하세요
echo ========================================
pause