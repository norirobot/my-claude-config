// 기본 테스트 - 테스트 환경이 올바르게 설정되었는지 확인

describe('Basic Test Suite', () => {
  test('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  test('should check Node.js environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('should have access to global objects', () => {
    expect(global).toBeDefined();
    expect(process).toBeDefined();
    expect(require).toBeDefined();
  });
});
