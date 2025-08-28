// 브라우저 콘솔에서 실행할 세션 리셋 스크립트
console.log('🧹 세션 완전 정리 시작...');

// 모든 localStorage 정리
localStorage.clear();

// 세션 스토리지도 정리
sessionStorage.clear();

// 페이지 새로고침
setTimeout(() => {
  console.log('✅ 세션 정리 완료. 페이지 새로고침...');
  window.location.reload();
}, 1000);