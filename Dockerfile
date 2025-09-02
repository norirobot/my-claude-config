# Node.js 기반 이미지 사용
FROM node:18

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일들 복사
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY package*.json ./

# 의존성 설치
RUN cd backend && npm install
RUN cd frontend && npm install
RUN npm install

# 소스 코드 복사
COPY backend ./backend
COPY frontend ./frontend

# 프론트엔드 빌드
RUN cd frontend && npm run build

# 포트 노출
EXPOSE 3001 3006

# 서버 시작
CMD ["npm", "run", "deploy"]