// Jest 테스트 설정 파일
// 테스트 실행 전에 실행되는 공통 설정

// 타임아웃 설정
jest.setTimeout(10000);

// 테스트 환경 변수
process.env.NODE_ENV = 'test';

// 콘솔 로그 억제 (필요시 주석 해제)
// global.console = {
//   log: jest.fn(),
//   error: console.error,
//   warn: console.warn,
//   info: jest.fn(),
//   debug: jest.fn(),
// };
