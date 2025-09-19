// 코드 품질 분석 유틸리티
// 학생 코드의 품질을 분석하고 개선 제안을 제공

/**
 * C 코드 품질 분석기
 * @param {string} code - 분석할 C 코드
 * @returns {Object} 분석 결과 객체
 */
function analyzeCodeQuality(code) {
  const analysis = {
    score: 100,
    issues: [],
    suggestions: [],
    strengths: []
  };

  // 1. 기본 구조 분석
  const structureAnalysis = analyzeCodeStructure(code);
  analysis.score -= structureAnalysis.penalty;
  analysis.issues.push(...structureAnalysis.issues);
  analysis.suggestions.push(...structureAnalysis.suggestions);

  // 2. 코딩 스타일 분석
  const styleAnalysis = analyzeCodingStyle(code);
  analysis.score -= styleAnalysis.penalty;
  analysis.issues.push(...styleAnalysis.issues);
  analysis.suggestions.push(...styleAnalysis.suggestions);

  // 3. 좋은 관습 확인
  const bestPractices = checkBestPractices(code);
  analysis.strengths.push(...bestPractices.strengths);
  analysis.suggestions.push(...bestPractices.suggestions);

  // 점수는 0 이하로 내려가지 않음
  analysis.score = Math.max(0, analysis.score);

  return analysis;
}

/**
 * 코드 구조 분석
 */
function analyzeCodeStructure(code) {
  const result = {
    penalty: 0,
    issues: [],
    suggestions: []
  };

  // #include 검사
  if (code.includes('printf') && !code.includes('#include <stdio.h>')) {
    result.penalty += 20;
    result.issues.push('❌ #include <stdio.h>가 누락되었습니다');
    result.suggestions.push('💡 printf를 사용할 때는 반드시 #include <stdio.h>를 추가하세요');
  }

  // main 함수 검사
  if (!code.match(/int\s+main\s*\(/)) {
    result.penalty += 25;
    result.issues.push('❌ int main() 함수가 정의되지 않았습니다');
    result.suggestions.push('💡 C 프로그램은 반드시 int main() 함수가 있어야 합니다');
  }

  // return 0 검사
  if (code.includes('int main') && !code.includes('return 0')) {
    result.penalty += 10;
    result.issues.push('⚠️ main 함수에 return 0;이 없습니다');
    result.suggestions.push('💡 main 함수 끝에 return 0;을 추가하는 것이 좋습니다');
  }

  return result;
}

/**
 * 코딩 스타일 분석
 */
function analyzeCodingStyle(code) {
  const result = {
    penalty: 0,
    issues: [],
    suggestions: []
  };

  // 세미콜론 검사
  const printfStatements = code.match(/printf\s*\([^)]*\)/g) || [];
  for (const stmt of printfStatements) {
    const lineEnd = code.indexOf(stmt) + stmt.length;
    const nextChar = code[lineEnd];
    if (nextChar !== ';') {
      result.penalty += 5;
      result.issues.push('⚠️ printf 문 뒤에 세미콜론(;)이 없습니다');
      result.suggestions.push('💡 모든 문(statement) 뒤에는 세미콜론을 붙여야 합니다');
      break; // 첫 번째만 경고
    }
  }

  // 들여쓰기 검사
  const lines = code.split('\n');
  let hasInconsistentIndentation = false;
  for (const line of lines) {
    if (line.trim() && line.match(/^\s+/)) {
      const indentation = line.match(/^\s+/)[0];
      if (indentation.includes('\t') && indentation.includes(' ')) {
        hasInconsistentIndentation = true;
        break;
      }
    }
  }

  if (hasInconsistentIndentation) {
    result.penalty += 5;
    result.issues.push('⚠️ 들여쓰기가 일관되지 않습니다 (탭과 공백 혼용)');
    result.suggestions.push('💡 들여쓰기는 탭 또는 공백 중 하나만 일관되게 사용하세요');
  }

  return result;
}

/**
 * 좋은 코딩 관습 확인
 */
function checkBestPractices(code) {
  const result = {
    strengths: [],
    suggestions: []
  };

  // 좋은 점들 확인
  if (code.includes('#include <stdio.h>')) {
    result.strengths.push('✅ 필요한 헤더 파일을 올바르게 포함했습니다');
  }

  if (code.match(/int\s+main\s*\(/) && code.includes('return 0')) {
    result.strengths.push('✅ main 함수를 올바르게 정의하고 return 0으로 끝냈습니다');
  }

  if (!code.match(/printf\s*\([^)]*\)[^;]/)) {
    result.strengths.push('✅ 모든 문장을 세미콜론으로 올바르게 끝냈습니다');
  }

  // 주석 사용 확인
  if (code.includes('//') || code.includes('/*')) {
    result.strengths.push('✅ 주석을 사용하여 코드를 설명했습니다');
  }

  // 추가 제안사항
  if (!code.includes('//') && !code.includes('/*')) {
    result.suggestions.push('💡 주석을 추가하면 코드를 더 쉽게 이해할 수 있습니다');
  }

  return result;
}

/**
 * 코드 복잡도 분석
 */
function analyzeComplexity(code) {
  const complexity = {
    lineCount: 0,
    functionCount: 0,
    variableCount: 0,
    level: 'BEGINNER' // BEGINNER, INTERMEDIATE, ADVANCED
  };

  // 줄 수 계산 (빈 줄 제외)
  complexity.lineCount = code.split('\n').filter(line => line.trim()).length;

  // 함수 개수 (main 포함)
  const functionMatches = code.match(/\w+\s+\w+\s*\([^)]*\)\s*{/g) || [];
  complexity.functionCount = functionMatches.length;

  // 변수 선언 개수 추정
  const variableMatches = code.match(/\b(int|float|double|char)\s+\w+/g) || [];
  complexity.variableCount = variableMatches.length;

  // 복잡도 레벨 결정
  if (complexity.lineCount <= 10 && complexity.functionCount <= 1) {
    complexity.level = 'BEGINNER';
  } else if (complexity.lineCount <= 30 && complexity.functionCount <= 3) {
    complexity.level = 'INTERMEDIATE';
  } else {
    complexity.level = 'ADVANCED';
  }

  return complexity;
}

module.exports = {
  analyzeCodeQuality,
  analyzeComplexity
};