// 1번 문제 localStorage 강제 삭제
const keys = [
  'student_21_problem_1_code',
  'student_22_problem_1_code'
];

keys.forEach(key => {
  const value = localStorage.getItem(key);
  if (value !== null) {
    console.log(`삭제 전 ${key}:`, value.substring(0, 50) + '...');
    localStorage.removeItem(key);
    console.log(`✅ ${key} 삭제됨`);
  } else {
    console.log(`${key} 없음`);
  }
});

console.log('1번 문제 localStorage 정리 완료');