const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('📝 모든 문제의 주석을 통일된 형태로 수정합니다...');

// 표준 플레이스홀더
const standardPlaceholder = '// 여기에 코드를 입력하세요';

// 모든 문제의 starterCode 업데이트
db.serialize(() => {
  // 먼저 현재 상태 확인
  db.all('SELECT id, title, starterCode FROM problems WHERE starterCode IS NOT NULL', (err, rows) => {
    if (err) {
      console.error('❌ 문제 조회 실패:', err);
      return;
    }

    console.log(`📋 총 ${rows.length}개 문제 발견`);

    rows.forEach(problem => {
      let newStarterCode = problem.starterCode;

      // int main() 내부의 모든 주석을 통일하기
      const lines = newStarterCode.split('\n');
      let inMainFunction = false;
      let mainBraceCount = 0;
      let foundMainStart = false;

      const processedLines = lines.map((line, index) => {
        // int main() 시작 감지
        if (line.includes('int main()') || line.includes('int main(')) {
          foundMainStart = true;
        }

        // 중괄호 카운팅으로 main 함수 영역 추적
        if (foundMainStart && line.includes('{')) {
          mainBraceCount++;
          if (mainBraceCount === 1) {
            inMainFunction = true;
          }
        }

        // main 함수 내부의 주석 처리
        if (inMainFunction && line.trim().startsWith('//') && !line.includes('return 0')) {
          // 첫 번째 주석만 표준 플레이스홀더로 교체, 나머지는 삭제
          if (lines.slice(0, index).filter(l => inMainFunction && l.trim().startsWith('//')).length === 0) {
            return '    ' + standardPlaceholder;
          } else {
            return null; // 삭제할 라인
          }
        }

        // 중괄호 닫힘 감지
        if (foundMainStart && line.includes('}')) {
          mainBraceCount--;
          if (mainBraceCount === 0) {
            inMainFunction = false;
            foundMainStart = false;
          }
        }

        return line;
      }).filter(line => line !== null); // null인 라인들 제거

      newStarterCode = processedLines.join('\n');

      // main 함수 내부에 주석이 하나도 없다면 추가
      const hasCommentInMain = newStarterCode.includes('int main()') &&
                               newStarterCode.split('int main()')[1] &&
                               newStarterCode.split('int main()')[1].includes(standardPlaceholder);

      if (!hasCommentInMain && newStarterCode.includes('int main()')) {
        // int main() { 다음에 표준 플레이스홀더 추가
        newStarterCode = newStarterCode.replace(
          /(int main\(\)\s*\{)/,
          '$1\n    ' + standardPlaceholder + '\n'
        );
      }

      // 데이터베이스 업데이트
      if (newStarterCode !== problem.starterCode) {
        db.run(
          'UPDATE problems SET starterCode = ? WHERE id = ?',
          [newStarterCode, problem.id],
          function(err) {
            if (err) {
              console.error(`❌ 문제 ${problem.id} 업데이트 실패:`, err);
            } else {
              console.log(`✅ 문제 ${problem.id} (${problem.title}) 주석 통일 완료`);
            }
          }
        );
      } else {
        console.log(`⏭️  문제 ${problem.id} (${problem.title}) 이미 올바른 형태`);
      }
    });
  });
});

// 완료 후 연결 닫기
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('❌ 데이터베이스 연결 닫기 실패:', err);
    } else {
      console.log('✅ 모든 주석 통일 작업 완료!');
      console.log(`📝 표준 주석: "${standardPlaceholder}"`);
    }
  });
}, 3000);
