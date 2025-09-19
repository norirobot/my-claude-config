const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('📝 int main() 안의 주석만 남기고 나머지 삭제합니다...');

// 표준 플레이스홀더
const standardPlaceholder = '// 여기에 코드를 입력하세요';

// 모든 문제의 starterCode 업데이트
db.serialize(() => {
  db.all('SELECT id, title, starterCode FROM problems WHERE starterCode IS NOT NULL', (err, rows) => {
    if (err) {
      console.error('❌ 문제 조회 실패:', err);
      return;
    }

    console.log(`📋 총 ${rows.length}개 문제 발견`);

    rows.forEach(problem => {
      let newStarterCode = problem.starterCode;

      // 로직:
      // 1. int main() 밖의 모든 플레이스홀더 주석 삭제
      // 2. int main() 안에 플레이스홀더 주석이 없으면 하나 추가
      // 3. int main() 안에 여러 주석이 있으면 하나만 남기고 삭제

      const lines = newStarterCode.split('\n');
      let inMainFunction = false;
      let mainBraceCount = 0;
      let foundMainStart = false;
      let hasCommentInMain = false;
      let mainStartIndex = -1;

      // 첫 번째 패스: main 함수 위치 찾기
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('int main()') || lines[i].includes('int main(')) {
          mainStartIndex = i;
          break;
        }
      }

      const processedLines = lines.map((line, index) => {
        // int main() 시작 감지
        if (line.includes('int main()') || line.includes('int main(')) {
          foundMainStart = true;
          return line;
        }

        // 중괄호 카운팅으로 main 함수 영역 추적
        if (foundMainStart && line.includes('{')) {
          mainBraceCount++;
          if (mainBraceCount === 1) {
            inMainFunction = true;
          }
          return line;
        }

        // int main() 밖의 플레이스홀더 주석은 모두 삭제
        if (!inMainFunction && line.trim() === standardPlaceholder) {
          return null; // 삭제
        }

        // main 함수 내부의 주석 처리
        if (inMainFunction && line.trim().startsWith('//')) {
          if (line.trim() === standardPlaceholder) {
            if (!hasCommentInMain) {
              hasCommentInMain = true;
              return '    ' + standardPlaceholder; // 들여쓰기 적용
            } else {
              return null; // 이미 하나 있으면 삭제
            }
          } else {
            // 다른 주석들은 표준 주석으로 교체 (첫 번째만)
            if (!hasCommentInMain) {
              hasCommentInMain = true;
              return '    ' + standardPlaceholder;
            } else {
              return null; // 삭제
            }
          }
        }

        // 중괄호 닫힘 감지
        if (foundMainStart && line.includes('}') && mainBraceCount > 0) {
          mainBraceCount--;
          if (mainBraceCount === 0) {
            inMainFunction = false;
          }
        }

        return line;
      }).filter(line => line !== null);

      newStarterCode = processedLines.join('\n');

      // main 함수 내부에 주석이 하나도 없다면 추가
      if (!hasCommentInMain && mainStartIndex !== -1) {
        const newLines = newStarterCode.split('\n');
        // int main() { 다음 줄에 주석 추가
        for (let i = 0; i < newLines.length; i++) {
          if ((newLines[i].includes('int main()') || newLines[i].includes('int main(')) &&
              i + 1 < newLines.length && newLines[i + 1].includes('{')) {
            newLines.splice(i + 2, 0, '    ' + standardPlaceholder);
            break;
          }
        }
        newStarterCode = newLines.join('\n');
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
              console.log(`✅ 문제 ${problem.id} (${problem.title}) int main 주석 정리 완료`);
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
      console.log('✅ int main 주석 정리 작업 완료!');
      console.log('📝 표준 주석: "// 여기에 코드를 입력하세요" (int main 안에만)');
    }
  });
}, 3000);
