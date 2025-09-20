// AI 기반 교사 가이드 시스템
// 학생 코드를 분석하여 교사에게 구체적인 지도 방안을 제시

const { analyzeCodeQuality, analyzeComplexity } = require('./codeAnalyzer');

/**
 * 교사를 위한 코드 분석 및 가이드 생성
 * @param {string} code - 학생의 C 코드
 * @param {string} problemDescription - 문제 설명 (선택사항)
 * @returns {Object} 교사 가이드 정보
 */
function generateTeacherGuide(code, problemDescription = '') {
  const guide = {
    studentCodeAnalysis: null,
    teachingStrategy: '',
    suggestedHints: [],
    commonMistakes: [],
    correctedCodeExample: '',
    nextSteps: []
  };

  // 1. 기본 코드 분석 수행
  const qualityAnalysis = analyzeCodeQuality(code);
  const complexityAnalysis = analyzeComplexity(code);

  guide.studentCodeAnalysis = {
    quality: qualityAnalysis,
    complexity: complexityAnalysis
  };

  // 2. 교육 전략 결정
  guide.teachingStrategy = determineTeachingStrategy(qualityAnalysis, complexityAnalysis);

  // 3. 단계별 힌트 생성
  guide.suggestedHints = generateProgressiveHints(qualityAnalysis, code);

  // 4. 일반적인 실수 패턴 식별
  guide.commonMistakes = identifyCommonMistakes(qualityAnalysis, code);

  // 5. 수정된 코드 예시 생성
  guide.correctedCodeExample = generateCorrectedCode(code, qualityAnalysis);

  // 6. 다음 학습 단계 제안
  guide.nextSteps = suggestNextLearningSteps(complexityAnalysis, qualityAnalysis);

  return guide;
}

/**
 * 교육 전략 결정
 */
function determineTeachingStrategy(qualityAnalysis, complexityAnalysis) {
  const score = qualityAnalysis.score;
  const issuesCount = qualityAnalysis.issues.length;
  const level = complexityAnalysis.level;

  if (score >= 80 && issuesCount === 0) {
    return '🎉 격려 중심: 학생이 잘하고 있으므로 칭찬하고 더 복잡한 도전을 제시하세요';
  } else if (score >= 60) {
    return '🔧 개선 중심: 기본은 이해했으나 세부 사항 개선이 필요합니다. 구체적인 피드백을 제공하세요';
  } else if (score >= 40) {
    return '📚 기초 강화: 기본 개념 재학습이 필요합니다. 단계별로 차근차근 설명하세요';
  } else {
    return '🏗️ 처음부터: 기초부터 다시 시작하는 것이 좋겠습니다. 간단한 예제로 시작하세요';
  }
}

/**
 * 점진적 힌트 생성
 */
function generateProgressiveHints(qualityAnalysis, code) {
  const hints = [];

  // 구조적 문제 힌트
  if (qualityAnalysis.issues.some(issue => issue.includes('#include'))) {
    hints.push({
      level: 1,
      message: '헤더 파일이 빠져있는 것 같아요. printf를 사용할 때 무엇이 필요한지 생각해보세요.',
      type: 'structure'
    });
    hints.push({
      level: 2,
      message: 'printf 함수를 사용하려면 #include <stdio.h>가 필요합니다.',
      type: 'structure'
    });
    hints.push({
      level: 3,
      message: "코드 맨 위에 '#include <stdio.h>'를 추가하세요.",
      type: 'direct'
    });
  }

  // main 함수 문제 힌트
  if (qualityAnalysis.issues.some(issue => issue.includes('main'))) {
    hints.push({
      level: 1,
      message: 'C 프로그램의 시작점이 무엇인지 생각해보세요.',
      type: 'structure'
    });
    hints.push({
      level: 2,
      message: '모든 C 프로그램은 main 함수가 있어야 합니다.',
      type: 'structure'
    });
    hints.push({
      level: 3,
      message: "'int main() { }' 형태로 main 함수를 만들어보세요.",
      type: 'direct'
    });
  }

  // return 0 힌트
  if (qualityAnalysis.issues.some(issue => issue.includes('return'))) {
    hints.push({
      level: 1,
      message: '함수가 끝날 때 어떤 값을 돌려줘야 할까요?',
      type: 'style'
    });
    hints.push({
      level: 2,
      message: 'main 함수는 정수값을 반환해야 합니다. 성공했을 때는 보통 몇을 반환할까요?',
      type: 'style'
    });
    hints.push({
      level: 3,
      message: "main 함수 끝에 'return 0;'를 추가하세요.",
      type: 'direct'
    });
  }

  return hints;
}

/**
 * 일반적인 실수 패턴 식별
 */
function identifyCommonMistakes(qualityAnalysis, code) {
  const mistakes = [];

  // 세미콜론 누락
  if (qualityAnalysis.issues.some(issue => issue.includes('세미콜론'))) {
    mistakes.push({
      mistake: '세미콜론 누락',
      explanation: 'C언어에서는 모든 문장 뒤에 세미콜론(;)이 필요합니다',
      studentLevel: '초급자에게 매우 흔한 실수'
    });
  }

  // 헤더 파일 누락
  if (qualityAnalysis.issues.some(issue => issue.includes('#include'))) {
    mistakes.push({
      mistake: '헤더 파일 누락',
      explanation: 'printf 같은 라이브러리 함수를 사용할 때는 해당 헤더를 포함해야 합니다',
      studentLevel: '초급자가 자주 놓치는 부분'
    });
  }

  // main 함수 누락
  if (qualityAnalysis.issues.some(issue => issue.includes('main'))) {
    mistakes.push({
      mistake: 'main 함수 누락',
      explanation: 'C 프로그램의 진입점인 main 함수가 없습니다',
      studentLevel: 'C언어 기초 개념 부족'
    });
  }

  return mistakes;
}

/**
 * 수정된 코드 예시 생성
 */
function generateCorrectedCode(code, qualityAnalysis) {
  let correctedCode = code;
  const comments = [];

  // 헤더 파일 추가
  if (qualityAnalysis.issues.some(issue => issue.includes('#include'))) {
    if (!correctedCode.includes('#include <stdio.h>')) {
      correctedCode = '#include <stdio.h>  // printf 함수 사용을 위한 헤더\n' + correctedCode;
      comments.push('// 헤더 파일 추가: printf 함수를 사용하기 위해 필요');
    }
  }

  // main 함수 구조 수정
  if (qualityAnalysis.issues.some(issue => issue.includes('main'))) {
    if (!correctedCode.match(/int\s+main\s*\(/)) {
      correctedCode = correctedCode.replace(/main\s*\(/, 'int main(');
      comments.push('// main 함수는 int 타입을 반환해야 함');
    }
  }

  // return 0 추가
  if (qualityAnalysis.issues.some(issue => issue.includes('return'))) {
    if (!correctedCode.includes('return 0')) {
      // main 함수의 마지막 } 앞에 return 0; 추가
      const mainMatch = correctedCode.match(/(int\s+main\s*\([^)]*\)\s*{[\s\S]*)(}(?:\s*$|\s*\/\/))/);
      if (mainMatch) {
        correctedCode = correctedCode.replace(
          mainMatch[0],
          mainMatch[1] + '    return 0;  // 프로그램 정상 종료\n' + mainMatch[2]
        );
        comments.push('// return 0 추가: 프로그램이 성공적으로 끝났음을 나타냄');
      }
    }
  }

  // 주석 추가
  if (comments.length > 0) {
    correctedCode += '\n\n' + comments.join('\n');
  }

  return correctedCode;
}

/**
 * 다음 학습 단계 제안
 */
function suggestNextLearningSteps(complexityAnalysis, qualityAnalysis) {
  const steps = [];
  const level = complexityAnalysis.level;
  const score = qualityAnalysis.score;

  if (score >= 80) {
    if (level === 'BEGINNER') {
      steps.push('변수 사용하기 (int, float, char)');
      steps.push('사용자 입력 받기 (scanf)');
      steps.push('조건문 사용하기 (if-else)');
    } else if (level === 'INTERMEDIATE') {
      steps.push('반복문 활용 (for, while)');
      steps.push('배열 사용하기');
      steps.push('함수 만들기');
    } else {
      steps.push('포인터 개념 학습');
      steps.push('구조체 활용');
      steps.push('파일 입출력');
    }
  } else {
    steps.push('기본 문법 복습');
    steps.push('예제 코드 따라 작성하기');
    steps.push('컴파일 오류 해결 연습');
  }

  return steps;
}

/**
 * 교사용 코멘트가 포함된 코드 생성
 */
function generateCommentedCodeForTeacher(code, analysis) {
  const lines = code.split('\n');
  const commentedLines = [];

  lines.forEach((line, index) => {
    commentedLines.push(line);

    // 문제가 있는 라인에 교사용 주석 추가
    if (line.includes('printf') && !code.includes('#include <stdio.h>')) {
      commentedLines.push('// 🎯 교사 가이드: 이 라인에서 printf를 사용했는데 헤더가 없습니다');
    }

    if (line.includes('main') && !line.includes('int main')) {
      commentedLines.push('// 🎯 교사 가이드: main 함수는 int 타입을 반환해야 합니다');
    }

    if (line.includes('printf') && !line.includes(';')) {
      commentedLines.push('// 🎯 교사 가이드: 세미콜론이 누락되었습니다');
    }
  });

  return commentedLines.join('\n');
}

module.exports = {
  generateTeacherGuide,
  generateCommentedCodeForTeacher
};
