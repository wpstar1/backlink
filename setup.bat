@echo off
echo ===============================================
echo 백링크 신청 시스템 설치 스크립트
echo ===============================================
echo.

echo 1. 의존성 패키지 설치 중...
call npm install

echo.
echo 2. 설정 파일 생성 중...
if not exist config.js (
    copy config.example.js config.js
    echo config.js 파일이 생성되었습니다.
    echo config.js 파일을 편집하여 실제 설정값을 입력해주세요.
) else (
    echo config.js 파일이 이미 존재합니다.
)

echo.
echo 3. 데이터 폴더 생성 중...
if not exist data (
    mkdir data
    echo data 폴더가 생성되었습니다.
) else (
    echo data 폴더가 이미 존재합니다.
)

echo.
echo ===============================================
echo 설치 완료!
echo ===============================================
echo.
echo 다음 단계:
echo 1. config.js 파일을 편집하여 실제 설정값을 입력하세요
echo 2. npm start 명령어로 서버를 시작하세요
echo 3. http://localhost:3000 에서 웹사이트를 확인하세요
echo 4. http://localhost:3000/admin 에서 관리자 페이지를 확인하세요
echo.
pause 