// ID 3번 문제 localStorage 삭제 코드
console.log('=== ID 3번 문제 localStorage 삭제 ===');
console.log('브라우저 콘솔에서 다음 코드를 실행하세요:');
console.log('');
console.log('// 김도현 (ID: 21)');
console.log('localStorage.removeItem("student_21_problem_3_code");');
console.log('');
console.log('// 최문석 (ID: 22)');
console.log('localStorage.removeItem("student_22_problem_3_code");');
console.log('');
console.log('// 모든 학생의 3번 문제 localStorage 삭제');
console.log('Object.keys(localStorage).forEach(key => {');
console.log('    if (key.includes("_problem_3_code")) {');
console.log('        console.log("삭제:", key);');
console.log('        localStorage.removeItem(key);');
console.log('    }');
console.log('});');
console.log('');
console.log('그 다음 F5로 새로고침하세요!');
