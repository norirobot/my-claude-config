import * as Blockly from 'blockly/core';

// ===== 순차 블록들 =====
// C언어 printf 블록  
Blockly.Blocks['c_printf'] = {
  init: function() {
    this.appendValueInput("TEXT")
        .setCheck("String")
        .appendField("printf");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip("화면에 텍스트를 출력합니다");
  }
};

// C언어 scanf 블록
Blockly.Blocks['c_scanf'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("scanf")
        .appendField(new Blockly.FieldTextInput("&variable"), "VAR");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip("사용자 입력을 받습니다");
  }
};

// ===== 변수 블록들 =====
// C언어 변수 선언 블록
Blockly.Blocks['c_variable_declare'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("변수 선언")
        .appendField(new Blockly.FieldDropdown([["int","int"], ["float","float"], ["char","char"], ["double","double"]]), "TYPE")
        .appendField(new Blockly.FieldTextInput("variable"), "NAME");
    this.appendValueInput("VALUE")
        .setCheck("Number")
        .appendField("=");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("변수를 선언하고 값을 할당합니다");
  }
};

// 변수 값 변경 블록
Blockly.Blocks['c_variable_set'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("변수")
        .appendField(new Blockly.FieldTextInput("variable"), "VAR")
        .appendField("에");
    this.appendValueInput("VALUE")
        .setCheck(null)
        .appendField("저장");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("변수에 새로운 값을 저장합니다");
  }
};

// 변수 값 가져오기 블록
Blockly.Blocks['c_variable_get'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("변수")
        .appendField(new Blockly.FieldTextInput("variable"), "VAR");
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("변수의 값을 가져옵니다");
  }
};

// ===== 함수 블록들 =====
// C언어 main 함수 블록
Blockly.Blocks['c_main'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("main 함수");
    this.appendStatementInput("STATEMENTS")
        .setCheck(null);
    this.setColour(290);
    this.setTooltip("프로그램의 시작점입니다");
    this.setDeletable(false);
  }
};

// 사용자 정의 함수 블록
Blockly.Blocks['c_function'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("함수")
        .appendField(new Blockly.FieldTextInput("myFunction"), "NAME")
        .appendField("()")
        .appendField(new Blockly.FieldDropdown([["void","void"], ["int","int"], ["float","float"]]), "RETURN_TYPE");
    this.appendStatementInput("STATEMENTS")
        .setCheck(null);
    this.setColour(290);
    this.setTooltip("사용자 정의 함수를 만듭니다");
  }
};

// 함수 호출 블록
Blockly.Blocks['c_function_call'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("함수 호출")
        .appendField(new Blockly.FieldTextInput("myFunction"), "NAME")
        .appendField("()");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("함수를 호출합니다");
  }
};

// ===== 선택 블록들 =====
// C언어 if 문 블록
Blockly.Blocks['c_if'] = {
  init: function() {
    this.appendValueInput("CONDITION")
        .setCheck("Boolean")
        .appendField("만약");
    this.appendStatementInput("STATEMENTS")
        .setCheck(null)
        .appendField("이면 실행");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("조건이 참일 때만 실행합니다");
  }
};

// C언어 if-else 블록
Blockly.Blocks['c_if_else'] = {
  init: function() {
    this.appendValueInput("CONDITION")
        .setCheck("Boolean")
        .appendField("만약");
    this.appendStatementInput("IF_STATEMENTS")
        .setCheck(null)
        .appendField("이면 실행");
    this.appendStatementInput("ELSE_STATEMENTS")
        .setCheck(null)
        .appendField("아니면 실행");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("조건에 따라 다른 명령을 실행합니다");
  }
};

// switch 문 블록
Blockly.Blocks['c_switch'] = {
  init: function() {
    this.appendValueInput("VALUE")
        .setCheck(null)
        .appendField("선택");
    this.appendStatementInput("CASES")
        .setCheck(null)
        .appendField("경우들");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("여러 경우 중 하나를 선택합니다");
  }
};

// ===== 반복 블록들 =====
// C언어 while 루프 블록
Blockly.Blocks['c_while'] = {
  init: function() {
    this.appendValueInput("CONDITION")
        .setCheck("Boolean")
        .appendField("조건이 참인 동안");
    this.appendStatementInput("STATEMENTS")
        .setCheck(null)
        .appendField("반복 실행");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip("조건이 참인 동안 계속 반복합니다");
  }
};

// C언어 for 루프 블록
Blockly.Blocks['c_for'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("for")
        .appendField(new Blockly.FieldTextInput("i"), "VAR")
        .appendField("=");
    this.appendValueInput("FROM")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField("부터");
    this.appendValueInput("TO")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField("까지");
    this.appendStatementInput("STATEMENTS")
        .setCheck(null)
        .appendField("반복 실행");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip("지정한 횟수만큼 반복합니다");
  }
};

// do-while 루프 블록
Blockly.Blocks['c_do_while'] = {
  init: function() {
    this.appendStatementInput("STATEMENTS")
        .setCheck(null)
        .appendField("다음을 실행하고");
    this.appendValueInput("CONDITION")
        .setCheck("Boolean")
        .appendField("조건이 참이면 반복");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip("최소 한 번은 실행한 후 조건을 확인합니다");
  }
};

// 무한 반복 블록
Blockly.Blocks['c_forever'] = {
  init: function() {
    this.appendStatementInput("STATEMENTS")
        .setCheck(null)
        .appendField("무한 반복");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip("끝없이 반복합니다");
  }
};

// C언어 코드 생성기
Blockly.C = new Blockly.CodeGenerator('C');

Blockly.C.ORDER_ATOMIC = 0;
Blockly.C.ORDER_UNARY_POSTFIX = 1;
Blockly.C.ORDER_UNARY_PREFIX = 2;
Blockly.C.ORDER_MULTIPLICATIVE = 3;
Blockly.C.ORDER_ADDITIVE = 4;
Blockly.C.ORDER_RELATIONAL = 5;
Blockly.C.ORDER_EQUALITY = 6;
Blockly.C.ORDER_LOGICAL_AND = 7;
Blockly.C.ORDER_LOGICAL_OR = 8;
Blockly.C.ORDER_CONDITIONAL = 9;
Blockly.C.ORDER_ASSIGNMENT = 10;
Blockly.C.ORDER_NONE = 99;

// C언어 코드 생성 함수들
Blockly.C['c_printf'] = function(block) {
  var value_text = Blockly.C.valueToCode(block, 'TEXT', Blockly.C.ORDER_ATOMIC);
  var code = 'printf(' + value_text + ');\n';
  return code;
};

Blockly.C['c_variable_declare'] = function(block) {
  var dropdown_type = block.getFieldValue('TYPE');
  var text_name = block.getFieldValue('NAME');
  var value = Blockly.C.valueToCode(block, 'VALUE', Blockly.C.ORDER_ATOMIC);
  var code = dropdown_type + ' ' + text_name;
  if (value) {
    code += ' = ' + value;
  }
  code += ';\n';
  return code;
};

Blockly.C['c_main'] = function(block) {
  var statements = Blockly.C.statementToCode(block, 'STATEMENTS');
  var code = '#include <stdio.h>\n\n';
  code += 'int main() {\n';
  code += statements;
  code += '    return 0;\n';
  code += '}\n';
  return code;
};

Blockly.C['c_if'] = function(block) {
  var value_condition = Blockly.C.valueToCode(block, 'CONDITION', Blockly.C.ORDER_ATOMIC);
  var statements = Blockly.C.statementToCode(block, 'STATEMENTS');
  var code = 'if (' + value_condition + ') {\n';
  code += statements;
  code += '}\n';
  return code;
};

Blockly.C['c_while'] = function(block) {
  var value_condition = Blockly.C.valueToCode(block, 'CONDITION', Blockly.C.ORDER_ATOMIC);
  var statements = Blockly.C.statementToCode(block, 'STATEMENTS');
  var code = 'while (' + value_condition + ') {\n';
  code += statements;
  code += '}\n';
  return code;
};

Blockly.C['c_for'] = function(block) {
  var variable_var = block.getFieldValue('VAR');
  var value_from = Blockly.C.valueToCode(block, 'FROM', Blockly.C.ORDER_ATOMIC);
  var value_to = Blockly.C.valueToCode(block, 'TO', Blockly.C.ORDER_ATOMIC);
  var statements = Blockly.C.statementToCode(block, 'STATEMENTS');
  var code = 'for (int ' + variable_var + ' = ' + value_from + '; ' + variable_var + ' <= ' + value_to + '; ' + variable_var + '++) {\n';
  code += statements;
  code += '}\n';
  return code;
};

// 기본 블록들도 C언어로 변환
Blockly.C['math_number'] = function(block) {
  var code = Number(block.getFieldValue('NUM'));
  return [code, Blockly.C.ORDER_ATOMIC];
};

Blockly.C['text'] = function(block) {
  var code = '"' + block.getFieldValue('TEXT') + '"';
  return [code, Blockly.C.ORDER_ATOMIC];
};

Blockly.C['math_arithmetic'] = function(block) {
  var OPERATORS = {
    'ADD': [' + ', Blockly.C.ORDER_ADDITIVE],
    'MINUS': [' - ', Blockly.C.ORDER_ADDITIVE],
    'MULTIPLY': [' * ', Blockly.C.ORDER_MULTIPLICATIVE],
    'DIVIDE': [' / ', Blockly.C.ORDER_MULTIPLICATIVE]
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.C.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.C.valueToCode(block, 'B', order) || '0';
  var code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.C['logic_compare'] = function(block) {
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var argument0 = Blockly.C.valueToCode(block, 'A', Blockly.C.ORDER_RELATIONAL) || '0';
  var argument1 = Blockly.C.valueToCode(block, 'B', Blockly.C.ORDER_RELATIONAL) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, Blockly.C.ORDER_RELATIONAL];
};

// ===== 리스트 블록들 =====
// 배열 선언 블록
Blockly.Blocks['c_array_declare'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("배열")
        .appendField(new Blockly.FieldDropdown([["int","int"], ["float","float"], ["char","char"]]), "TYPE")
        .appendField(new Blockly.FieldTextInput("arr"), "NAME")
        .appendField("[")
        .appendField(new Blockly.FieldNumber(10), "SIZE")
        .appendField("]");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip("배열을 선언합니다");
  }
};

// 배열 값 설정 블록
Blockly.Blocks['c_array_set'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("배열")
        .appendField(new Blockly.FieldTextInput("arr"), "NAME")
        .appendField("[");
    this.appendValueInput("INDEX")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField("]에");
    this.appendValueInput("VALUE")
        .setCheck(null)
        .appendField("저장");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip("배열의 특정 위치에 값을 저장합니다");
  }
};

// 배열 값 가져오기 블록
Blockly.Blocks['c_array_get'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("배열")
        .appendField(new Blockly.FieldTextInput("arr"), "NAME")
        .appendField("[");
    this.appendValueInput("INDEX")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField("]");
    this.setOutput(true, null);
    this.setColour(260);
    this.setTooltip("배열의 특정 위치 값을 가져옵니다");
  }
};

// ===== 온라인저지 블록들 =====
// ===== 초급: 기초 문제 블록들 =====
// Hello World 문제
Blockly.Blocks['oj_hello_world'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🌟 Hello World 출력");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(300);
    this.setTooltip("Hello World를 출력합니다 (초급 문제)");
  }
};

// A+B 문제 블록
Blockly.Blocks['oj_add_two_numbers'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📊 두 수 더하기")
        .appendField("A:")
        .appendField(new Blockly.FieldTextInput("a"), "VAR1")
        .appendField("B:")
        .appendField(new Blockly.FieldTextInput("b"), "VAR2");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(300);
    this.setTooltip("두 정수 A, B를 입력받아 A+B를 출력합니다");
  }
};

// ===== 중급: 패턴 & 알고리즘 블록들 =====
// 별찍기 패턴
Blockly.Blocks['oj_star_pattern'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("⭐ 별찍기 패턴")
        .appendField(new Blockly.FieldDropdown([
          ["삼각형", "triangle"],
          ["역삼각형", "reverse_triangle"],
          ["피라미드", "pyramid"],
          ["다이아몬드", "diamond"]
        ]), "PATTERN");
    this.appendValueInput("SIZE")
        .setCheck("Number")
        .appendField("크기:");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(320);
    this.setTooltip("다양한 별 패턴을 출력합니다 (중급 문제)");
  }
};

// 구구단 출력
Blockly.Blocks['oj_multiplication_table'] = {
  init: function() {
    this.appendValueInput("NUMBER")
        .setCheck("Number")
        .appendField("📚 구구단");
    this.appendDummyInput()
        .appendField("단");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(320);
    this.setTooltip("입력받은 수의 구구단을 출력합니다");
  }
};

// 최댓값 찾기
Blockly.Blocks['oj_find_max'] = {
  init: function() {
    this.appendValueInput("COUNT")
        .setCheck("Number")
        .appendField("🔍 최댓값 찾기 - 개수:");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(320);
    this.setTooltip("여러 수 중에서 최댓값을 찾습니다");
  }
};

// ===== 고급: 복잡한 알고리즘 블록들 =====
// 소수 판별
Blockly.Blocks['oj_prime_check'] = {
  init: function() {
    this.appendValueInput("NUMBER")
        .setCheck("Number")
        .appendField("🧮 소수 판별:");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(340);
    this.setTooltip("입력받은 수가 소수인지 판별합니다 (고급 문제)");
  }
};

// 피보나치 수열
Blockly.Blocks['oj_fibonacci'] = {
  init: function() {
    this.appendValueInput("N")
        .setCheck("Number")
        .appendField("🔢 피보나치 수열 - N번째:");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(340);
    this.setTooltip("N번째 피보나치 수를 구합니다");
  }
};

// 배열 정렬
Blockly.Blocks['oj_sort_array'] = {
  init: function() {
    this.appendValueInput("SIZE")
        .setCheck("Number")
        .appendField("📊 배열 정렬 - 크기:");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ["오름차순", "asc"],
          ["내림차순", "desc"]
        ]), "ORDER");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(340);
    this.setTooltip("배열을 정렬합니다");
  }
};

// 공통 입출력 블록들
Blockly.Blocks['oj_input'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("입력 받기")
        .appendField(new Blockly.FieldDropdown([
          ["정수", "int"],
          ["실수", "float"], 
          ["문자", "char"],
          ["문자열", "string"]
        ]), "TYPE")
        .appendField(new Blockly.FieldTextInput("variable"), "VAR");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(300);
    this.setTooltip("사용자로부터 입력을 받습니다");
  }
};

Blockly.Blocks['oj_output'] = {
  init: function() {
    this.appendValueInput("VALUE")
        .setCheck(null)
        .appendField("출력:");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(300);
    this.setTooltip("결과를 출력합니다");
  }
};

// 새로운 블록들의 코드 생성기들도 추가
Blockly.C['c_scanf'] = function(block) {
  var variable = block.getFieldValue('VAR');
  return 'scanf("%d", ' + variable + ');\n';
};

Blockly.C['c_variable_set'] = function(block) {
  var variable = block.getFieldValue('VAR');
  var value = Blockly.C.valueToCode(block, 'VALUE', Blockly.C.ORDER_ASSIGNMENT) || '0';
  return variable + ' = ' + value + ';\n';
};

Blockly.C['c_variable_get'] = function(block) {
  var variable = block.getFieldValue('VAR');
  return [variable, Blockly.C.ORDER_ATOMIC];
};

Blockly.C['c_array_declare'] = function(block) {
  var type = block.getFieldValue('TYPE');
  var name = block.getFieldValue('NAME');
  var size = block.getFieldValue('SIZE');
  return type + ' ' + name + '[' + size + '];\n';
};

Blockly.C['c_array_set'] = function(block) {
  var name = block.getFieldValue('NAME');
  var index = Blockly.C.valueToCode(block, 'INDEX', Blockly.C.ORDER_ATOMIC) || '0';
  var value = Blockly.C.valueToCode(block, 'VALUE', Blockly.C.ORDER_ATOMIC) || '0';
  return name + '[' + index + '] = ' + value + ';\n';
};

Blockly.C['c_array_get'] = function(block) {
  var name = block.getFieldValue('NAME');
  var index = Blockly.C.valueToCode(block, 'INDEX', Blockly.C.ORDER_ATOMIC) || '0';
  return [name + '[' + index + ']', Blockly.C.ORDER_ATOMIC];
};

// ===== 온라인저지 블록 코드 생성기들 =====
// 초급 문제 코드 생성기들
Blockly.C['oj_hello_world'] = function(block) {
  return 'printf("Hello World\\n");\n';
};

Blockly.C['oj_add_two_numbers'] = function(block) {
  var var1 = block.getFieldValue('VAR1');
  var var2 = block.getFieldValue('VAR2');
  var code = 'int ' + var1 + ', ' + var2 + ';\n';
  code += 'scanf("%d %d", &' + var1 + ', &' + var2 + ');\n';
  code += 'printf("%d\\n", ' + var1 + ' + ' + var2 + ');\n';
  return code;
};

// 중급 문제 코드 생성기들
Blockly.C['oj_star_pattern'] = function(block) {
  var pattern = block.getFieldValue('PATTERN');
  var size = Blockly.C.valueToCode(block, 'SIZE', Blockly.C.ORDER_ATOMIC) || '5';
  
  var code = 'int n = ' + size + ';\n';
  switch(pattern) {
    case 'triangle':
      code += 'for (int i = 1; i <= n; i++) {\n';
      code += '    for (int j = 1; j <= i; j++) {\n';
      code += '        printf("*");\n';
      code += '    }\n';
      code += '    printf("\\n");\n';
      code += '}\n';
      break;
    case 'reverse_triangle':
      code += 'for (int i = n; i >= 1; i--) {\n';
      code += '    for (int j = 1; j <= i; j++) {\n';
      code += '        printf("*");\n';
      code += '    }\n';
      code += '    printf("\\n");\n';
      code += '}\n';
      break;
    case 'pyramid':
      code += 'for (int i = 1; i <= n; i++) {\n';
      code += '    for (int j = 1; j <= n-i; j++) {\n';
      code += '        printf(" ");\n';
      code += '    }\n';
      code += '    for (int k = 1; k <= 2*i-1; k++) {\n';
      code += '        printf("*");\n';
      code += '    }\n';
      code += '    printf("\\n");\n';
      code += '}\n';
      break;
  }
  return code;
};

Blockly.C['oj_multiplication_table'] = function(block) {
  var number = Blockly.C.valueToCode(block, 'NUMBER', Blockly.C.ORDER_ATOMIC) || '2';
  var code = 'int dan = ' + number + ';\n';
  code += 'for (int i = 1; i <= 9; i++) {\n';
  code += '    printf("%d x %d = %d\\n", dan, i, dan * i);\n';
  code += '}\n';
  return code;
};

Blockly.C['oj_find_max'] = function(block) {
  var count = Blockly.C.valueToCode(block, 'COUNT', Blockly.C.ORDER_ATOMIC) || '5';
  var code = 'int n = ' + count + ';\n';
  code += 'int max, num;\n';
  code += 'scanf("%d", &max);\n';
  code += 'for (int i = 1; i < n; i++) {\n';
  code += '    scanf("%d", &num);\n';
  code += '    if (num > max) {\n';
  code += '        max = num;\n';
  code += '    }\n';
  code += '}\n';
  code += 'printf("%d\\n", max);\n';
  return code;
};

// 고급 문제 코드 생성기들
Blockly.C['oj_prime_check'] = function(block) {
  var number = Blockly.C.valueToCode(block, 'NUMBER', Blockly.C.ORDER_ATOMIC) || 'n';
  var code = 'int n = ' + number + ';\n';
  code += 'int is_prime = 1;\n';
  code += 'if (n <= 1) {\n';
  code += '    is_prime = 0;\n';
  code += '} else {\n';
  code += '    for (int i = 2; i * i <= n; i++) {\n';
  code += '        if (n % i == 0) {\n';
  code += '            is_prime = 0;\n';
  code += '            break;\n';
  code += '        }\n';
  code += '    }\n';
  code += '}\n';
  code += 'if (is_prime) {\n';
  code += '    printf("%d는 소수입니다\\n", n);\n';
  code += '} else {\n';
  code += '    printf("%d는 소수가 아닙니다\\n", n);\n';
  code += '}\n';
  return code;
};

Blockly.C['oj_fibonacci'] = function(block) {
  var n = Blockly.C.valueToCode(block, 'N', Blockly.C.ORDER_ATOMIC) || '10';
  var code = 'int n = ' + n + ';\n';
  code += 'int a = 0, b = 1, fib;\n';
  code += 'if (n == 1) {\n';
  code += '    printf("0\\n");\n';
  code += '} else if (n == 2) {\n';
  code += '    printf("1\\n");\n';
  code += '} else {\n';
  code += '    for (int i = 3; i <= n; i++) {\n';
  code += '        fib = a + b;\n';
  code += '        a = b;\n';
  code += '        b = fib;\n';
  code += '    }\n';
  code += '    printf("%d\\n", fib);\n';
  code += '}\n';
  return code;
};

Blockly.C['oj_sort_array'] = function(block) {
  var size = Blockly.C.valueToCode(block, 'SIZE', Blockly.C.ORDER_ATOMIC) || '5';
  var order = block.getFieldValue('ORDER');
  var code = 'int n = ' + size + ';\n';
  code += 'int arr[100];\n';
  code += 'for (int i = 0; i < n; i++) {\n';
  code += '    scanf("%d", &arr[i]);\n';
  code += '}\n';
  code += '// 버블 정렬\n';
  code += 'for (int i = 0; i < n-1; i++) {\n';
  code += '    for (int j = 0; j < n-1-i; j++) {\n';
  if (order === 'asc') {
    code += '        if (arr[j] > arr[j+1]) {\n';
  } else {
    code += '        if (arr[j] < arr[j+1]) {\n';
  }
  code += '            int temp = arr[j];\n';
  code += '            arr[j] = arr[j+1];\n';
  code += '            arr[j+1] = temp;\n';
  code += '        }\n';
  code += '    }\n';
  code += '}\n';
  code += 'for (int i = 0; i < n; i++) {\n';
  code += '    printf("%d ", arr[i]);\n';
  code += '}\n';
  code += 'printf("\\n");\n';
  return code;
};

Blockly.C['oj_input'] = function(block) {
  var type = block.getFieldValue('TYPE');
  var variable = block.getFieldValue('VAR');
  var format = {
    'int': '%d',
    'float': '%f',
    'char': '%c',
    'string': '%s'
  };
  return 'scanf("' + format[type] + '", &' + variable + ');\n';
};

Blockly.C['oj_output'] = function(block) {
  var value = Blockly.C.valueToCode(block, 'VALUE', Blockly.C.ORDER_ATOMIC) || '""';
  return 'printf("%d\\n", ' + value + ');\n';
};

// ===== 개별 개념 평가 블록들 =====

// 순차 평가
Blockly.Blocks['assessment_sequential'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📊 순차 구조 평가");
    this.appendStatementInput("SOLUTION")
        .setCheck(null)
        .appendField("순차 실행 코드:");
    this.setColour(320);
    this.setTooltip("명령어들이 순서대로 실행되는지 평가합니다");
    this.setDeletable(false);
  }
};

// 반복 평가
Blockly.Blocks['assessment_loop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔄 반복 구조 평가");
    this.appendStatementInput("SOLUTION")
        .setCheck(null)
        .appendField("반복 구조 코드:");
    this.setColour(340);
    this.setTooltip("for문과 while문의 활용을 평가합니다");
    this.setDeletable(false);
  }
};

// 선택 평가
Blockly.Blocks['assessment_conditional'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🌟 선택 구조 평가");
    this.appendStatementInput("SOLUTION")
        .setCheck(null)
        .appendField("조건문 코드:");
    this.setColour(350);
    this.setTooltip("if문과 조건 판단 능력을 평가합니다");
    this.setDeletable(false);
  }
};

// 변수 평가
Blockly.Blocks['assessment_variable'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📦 변수 활용 평가");
    this.appendStatementInput("SOLUTION")
        .setCheck(null)
        .appendField("변수 활용 코드:");
    this.setColour(370);
    this.setTooltip("변수 선언, 할당, 사용 능력을 평가합니다");
    this.setDeletable(false);
  }
};

// 입출력 평가
Blockly.Blocks['assessment_io'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("⌨️ 입출력 평가");
    this.appendStatementInput("SOLUTION")
        .setCheck(null)
        .appendField("입출력 코드:");
    this.setColour(385);
    this.setTooltip("scanf와 printf 활용 능력을 평가합니다");
    this.setDeletable(false);
  }
};

// 리스트 평가
Blockly.Blocks['assessment_array'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📋 배열 활용 평가");
    this.appendStatementInput("SOLUTION")
        .setCheck(null)
        .appendField("배열 활용 코드:");
    this.setColour(390);
    this.setTooltip("배열 선언, 접근, 활용 능력을 평가합니다");
    this.setDeletable(false);
  }
};

// 함수 평가
Blockly.Blocks['assessment_function'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("⚙️ 함수 활용 평가");
    this.appendStatementInput("SOLUTION")
        .setCheck(null)
        .appendField("함수 활용 코드:");
    this.setColour(410);
    this.setTooltip("함수 정의, 호출, 활용 능력을 평가합니다");
    this.setDeletable(false);
  }
};

// 개별 평가 문제 블록들

// 순차 평가 문제
Blockly.Blocks['sequential_problem'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📊 순차 문제: 인사말 출력")
        .appendField("이름:")
        .appendField(new Blockly.FieldTextInput("홍길동"), "NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(320);
    this.setTooltip("이름을 포함한 인사말을 순차적으로 출력합니다");
  }
};

// 반복 평가 문제
Blockly.Blocks['loop_problem'] = {
  init: function() {
    this.appendValueInput("TIMES")
        .setCheck("Number")
        .appendField("🔄 반복 문제: 안녕하세요를");
    this.appendDummyInput()
        .appendField("번 출력");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(340);
    this.setTooltip("지정된 횟수만큼 메시지를 반복 출력합니다");
  }
};

// 선택 평가 문제
Blockly.Blocks['conditional_problem'] = {
  init: function() {
    this.appendValueInput("AGE")
        .setCheck("Number")
        .appendField("🌟 선택 문제: 나이");
    this.appendDummyInput()
        .appendField("에 따른 분류");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(350);
    this.setTooltip("나이에 따라 어린이/청소년/성인을 분류합니다");
  }
};

// 변수 평가 문제
Blockly.Blocks['variable_problem'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("📦 변수 문제: 점수 계산")
        .appendField("과목 수:")
        .appendField(new Blockly.FieldNumber(3), "SUBJECTS");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(370);
    this.setTooltip("여러 과목 점수를 변수에 저장하고 총점을 계산합니다");
  }
};

// ===== 단계별 프로그래밍 평가 블록들 =====

// 1단계 평가 (순차, 반복, 선택)
Blockly.Blocks['assessment_stage1'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🎯 프로그래밍 평가 1단계")
        .appendField("(순차, 반복, 선택)");
    this.appendStatementInput("SOLUTION")
        .setCheck(null)
        .appendField("문제 해결:");
    this.setColour(360);
    this.setTooltip("1단계 평가: 순차, 반복, 선택 구조를 활용한 문제해결");
    this.setDeletable(false);
  }
};

// 2단계 평가 (+ 변수, 입출력)
Blockly.Blocks['assessment_stage2'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🎯 프로그래밍 평가 2단계")
        .appendField("(변수, 입출력 추가)");
    this.appendStatementInput("SOLUTION")
        .setCheck(null)
        .appendField("문제 해결:");
    this.setColour(380);
    this.setTooltip("2단계 평가: 변수와 입출력을 활용한 종합 문제해결");
    this.setDeletable(false);
  }
};

// 3단계 평가 (+ 리스트, 함수)
Blockly.Blocks['assessment_stage3'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🎯 프로그래밍 평가 3단계")
        .appendField("(리스트, 함수 추가)");
    this.appendStatementInput("SOLUTION")
        .setCheck(null)
        .appendField("문제 해결:");
    this.setColour(400);
    this.setTooltip("3단계 평가: 리스트와 함수까지 활용한 고급 문제해결");
    this.setDeletable(false);
  }
};

// 단계별 평가 문제 블록들

// 1단계 평가 문제들
Blockly.Blocks['stage1_counting'] = {
  init: function() {
    this.appendValueInput("START")
        .setCheck("Number")
        .appendField("📊 1단계 문제: 숫자 세기");
    this.appendValueInput("END")
        .setCheck("Number")
        .appendField("부터");
    this.appendDummyInput()
        .appendField("까지 세기");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(360);
    this.setTooltip("지정된 범위의 숫자를 순차적으로 출력합니다");
  }
};

Blockly.Blocks['stage1_grade_check'] = {
  init: function() {
    this.appendValueInput("SCORE")
        .setCheck("Number")
        .appendField("📊 1단계 문제: 성적 판별");
    this.appendDummyInput()
        .appendField("점수로 등급 출력");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(360);
    this.setTooltip("점수에 따라 A,B,C,D,F 등급을 판별합니다");
  }
};

// 2단계 평가 문제들  
Blockly.Blocks['stage2_calculator'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🧮 2단계 문제: 계산기")
        .appendField("연산:")
        .appendField(new Blockly.FieldDropdown([
          ["더하기", "add"],
          ["빼기", "sub"], 
          ["곱하기", "mul"],
          ["나누기", "div"]
        ]), "OPERATION");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(380);
    this.setTooltip("두 수를 입력받아 선택된 연산을 수행합니다");
  }
};

Blockly.Blocks['stage2_sum_sequence'] = {
  init: function() {
    this.appendValueInput("N")
        .setCheck("Number")
        .appendField("🔢 2단계 문제: 수열의 합");
    this.appendDummyInput()
        .appendField("까지의 합");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(380);
    this.setTooltip("1부터 N까지의 합을 계산합니다");
  }
};

// 3단계 평가 문제들
Blockly.Blocks['stage3_array_average'] = {
  init: function() {
    this.appendValueInput("COUNT")
        .setCheck("Number")
        .appendField("📊 3단계 문제: 배열 평균");
    this.appendDummyInput()
        .appendField("개 숫자의 평균");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(400);
    this.setTooltip("배열에 저장된 숫자들의 평균을 계산합니다");
  }
};

Blockly.Blocks['stage3_number_function'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("🔧 3단계 문제: 숫자 함수")
        .appendField(new Blockly.FieldDropdown([
          ["최대공약수", "gcd"],
          ["최소공배수", "lcm"],
          ["팩토리얼", "factorial"]
        ]), "FUNC_TYPE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(400);
    this.setTooltip("함수를 정의하여 수학 문제를 해결합니다");
  }
};

// 개별 평가 블록들의 코드 생성기
Blockly.C['assessment_sequential'] = function(block) {
  var solution = Blockly.C.statementToCode(block, 'SOLUTION');
  var code = '// 순차 구조 평가\n';
  code += '#include <stdio.h>\n\n';
  code += 'int main() {\n';
  code += solution;
  code += '    return 0;\n';
  code += '}\n';
  return code;
};

Blockly.C['assessment_loop'] = function(block) {
  var solution = Blockly.C.statementToCode(block, 'SOLUTION');
  var code = '// 반복 구조 평가\n';
  code += '#include <stdio.h>\n\n';
  code += 'int main() {\n';
  code += solution;
  code += '    return 0;\n';
  code += '}\n';
  return code;
};

Blockly.C['assessment_conditional'] = function(block) {
  var solution = Blockly.C.statementToCode(block, 'SOLUTION');
  var code = '// 선택 구조 평가\n';
  code += '#include <stdio.h>\n\n';
  code += 'int main() {\n';
  code += solution;
  code += '    return 0;\n';
  code += '}\n';
  return code;
};

Blockly.C['assessment_variable'] = function(block) {
  var solution = Blockly.C.statementToCode(block, 'SOLUTION');
  var code = '// 변수 활용 평가\n';
  code += '#include <stdio.h>\n\n';
  code += 'int main() {\n';
  code += solution;
  code += '    return 0;\n';
  code += '}\n';
  return code;
};

Blockly.C['assessment_io'] = function(block) {
  var solution = Blockly.C.statementToCode(block, 'SOLUTION');
  var code = '// 입출력 평가\n';
  code += '#include <stdio.h>\n\n';
  code += 'int main() {\n';
  code += solution;
  code += '    return 0;\n';
  code += '}\n';
  return code;
};

Blockly.C['assessment_array'] = function(block) {
  var solution = Blockly.C.statementToCode(block, 'SOLUTION');
  var code = '// 배열 활용 평가\n';
  code += '#include <stdio.h>\n\n';
  code += 'int main() {\n';
  code += solution;
  code += '    return 0;\n';
  code += '}\n';
  return code;
};

Blockly.C['assessment_function'] = function(block) {
  var solution = Blockly.C.statementToCode(block, 'SOLUTION');
  var code = '// 함수 활용 평가\n';
  code += '#include <stdio.h>\n\n';
  code += solution;
  code += 'int main() {\n';
  code += '    return 0;\n';
  code += '}\n';
  return code;
};

// 개별 평가 문제 코드 생성기들
Blockly.C['sequential_problem'] = function(block) {
  var name = block.getFieldValue('NAME');
  var code = 'printf("안녕하세요!\\n");\n';
  code += 'printf("제 이름은 ' + name + '입니다.\\n");\n';
  code += 'printf("만나서 반갑습니다.\\n");\n';
  return code;
};

Blockly.C['loop_problem'] = function(block) {
  var times = Blockly.C.valueToCode(block, 'TIMES', Blockly.C.ORDER_ATOMIC) || '3';
  var code = 'for (int i = 0; i < ' + times + '; i++) {\n';
  code += '    printf("안녕하세요!\\n");\n';
  code += '}\n';
  return code;
};

Blockly.C['conditional_problem'] = function(block) {
  var age = Blockly.C.valueToCode(block, 'AGE', Blockly.C.ORDER_ATOMIC) || 'age';
  var code = 'int age = ' + age + ';\n';
  code += 'if (age < 13) {\n';
  code += '    printf("어린이\\n");\n';
  code += '} else if (age < 20) {\n';
  code += '    printf("청소년\\n");\n';
  code += '} else {\n';
  code += '    printf("성인\\n");\n';
  code += '}\n';
  return code;
};

Blockly.C['variable_problem'] = function(block) {
  var subjects = block.getFieldValue('SUBJECTS');
  var code = 'int total = 0;\n';
  for (let i = 1; i <= subjects; i++) {
    code += 'int subject' + i + ' = 0;\n';
    code += 'printf("' + i + '번째 과목 점수를 입력하세요: ");\n';
    code += 'scanf("%d", &subject' + i + ');\n';
    code += 'total += subject' + i + ';\n';
  }
  code += 'float average = (float)total / ' + subjects + ';\n';
  code += 'printf("총점: %d점\\n", total);\n';
  code += 'printf("평균: %.1f점\\n", average);\n';
  return code;
};

// 단계별 평가 블록들의 코드 생성기
Blockly.C['assessment_stage1'] = function(block) {
  var solution = Blockly.C.statementToCode(block, 'SOLUTION');
  var code = '// 프로그래밍 평가 1단계 (순차, 반복, 선택)\n';
  code += '#include <stdio.h>\n\n';
  code += 'int main() {\n';
  code += solution;
  code += '    return 0;\n';
  code += '}\n';
  return code;
};

Blockly.C['assessment_stage2'] = function(block) {
  var solution = Blockly.C.statementToCode(block, 'SOLUTION');
  var code = '// 프로그래밍 평가 2단계 (변수, 입출력 추가)\n';
  code += '#include <stdio.h>\n\n';
  code += 'int main() {\n';
  code += solution;
  code += '    return 0;\n';
  code += '}\n';
  return code;
};

Blockly.C['assessment_stage3'] = function(block) {
  var solution = Blockly.C.statementToCode(block, 'SOLUTION');
  var code = '// 프로그래밍 평가 3단계 (리스트, 함수 추가)\n';
  code += '#include <stdio.h>\n\n';
  code += solution;
  code += 'int main() {\n';
  code += '    return 0;\n';
  code += '}\n';
  return code;
};

// 단계별 문제 코드 생성기들
Blockly.C['stage1_counting'] = function(block) {
  var start = Blockly.C.valueToCode(block, 'START', Blockly.C.ORDER_ATOMIC) || '1';
  var end = Blockly.C.valueToCode(block, 'END', Blockly.C.ORDER_ATOMIC) || '10';
  var code = 'for (int i = ' + start + '; i <= ' + end + '; i++) {\n';
  code += '    printf("%d ", i);\n';
  code += '}\n';
  code += 'printf("\\n");\n';
  return code;
};

Blockly.C['stage1_grade_check'] = function(block) {
  var score = Blockly.C.valueToCode(block, 'SCORE', Blockly.C.ORDER_ATOMIC) || 'score';
  var code = 'int score = ' + score + ';\n';
  code += 'if (score >= 90) {\n';
  code += '    printf("A\\n");\n';
  code += '} else if (score >= 80) {\n';
  code += '    printf("B\\n");\n';
  code += '} else if (score >= 70) {\n';
  code += '    printf("C\\n");\n';
  code += '} else if (score >= 60) {\n';
  code += '    printf("D\\n");\n';
  code += '} else {\n';
  code += '    printf("F\\n");\n';
  code += '}\n';
  return code;
};

Blockly.C['stage2_calculator'] = function(block) {
  var operation = block.getFieldValue('OPERATION');
  var code = 'int a, b;\n';
  code += 'scanf("%d %d", &a, &b);\n';
  switch(operation) {
    case 'add':
      code += 'printf("%d\\n", a + b);\n';
      break;
    case 'sub':
      code += 'printf("%d\\n", a - b);\n';
      break;
    case 'mul':
      code += 'printf("%d\\n", a * b);\n';
      break;
    case 'div':
      code += 'if (b != 0) {\n';
      code += '    printf("%.2f\\n", (float)a / b);\n';
      code += '} else {\n';
      code += '    printf("0으로 나눌 수 없습니다\\n");\n';
      code += '}\n';
      break;
  }
  return code;
};

Blockly.C['stage2_sum_sequence'] = function(block) {
  var n = Blockly.C.valueToCode(block, 'N', Blockly.C.ORDER_ATOMIC) || '10';
  var code = 'int n = ' + n + ';\n';
  code += 'int sum = 0;\n';
  code += 'for (int i = 1; i <= n; i++) {\n';
  code += '    sum += i;\n';
  code += '}\n';
  code += 'printf("1부터 %d까지의 합: %d\\n", n, sum);\n';
  return code;
};

Blockly.C['stage3_array_average'] = function(block) {
  var count = Blockly.C.valueToCode(block, 'COUNT', Blockly.C.ORDER_ATOMIC) || '5';
  var code = 'int n = ' + count + ';\n';
  code += 'int arr[100];\n';
  code += 'int sum = 0;\n';
  code += 'for (int i = 0; i < n; i++) {\n';
  code += '    scanf("%d", &arr[i]);\n';
  code += '    sum += arr[i];\n';
  code += '}\n';
  code += 'printf("평균: %.2f\\n", (float)sum / n);\n';
  return code;
};

Blockly.C['stage3_number_function'] = function(block) {
  var funcType = block.getFieldValue('FUNC_TYPE');
  var code = '';
  
  switch(funcType) {
    case 'gcd':
      code += 'int gcd(int a, int b) {\n';
      code += '    if (b == 0) return a;\n';
      code += '    return gcd(b, a % b);\n';
      code += '}\n\n';
      code += 'int a, b;\n';
      code += 'scanf("%d %d", &a, &b);\n';
      code += 'printf("최대공약수: %d\\n", gcd(a, b));\n';
      break;
    case 'lcm':
      code += 'int gcd(int a, int b) {\n';
      code += '    if (b == 0) return a;\n';
      code += '    return gcd(b, a % b);\n';
      code += '}\n\n';
      code += 'int lcm(int a, int b) {\n';
      code += '    return (a * b) / gcd(a, b);\n';
      code += '}\n\n';
      code += 'int a, b;\n';
      code += 'scanf("%d %d", &a, &b);\n';
      code += 'printf("최소공배수: %d\\n", lcm(a, b));\n';
      break;
    case 'factorial':
      code += 'int factorial(int n) {\n';
      code += '    if (n <= 1) return 1;\n';
      code += '    return n * factorial(n - 1);\n';
      code += '}\n\n';
      code += 'int n;\n';
      code += 'scanf("%d", &n);\n';
      code += 'printf("%d! = %d\\n", n, factorial(n));\n';
      break;
  }
  return code;
};

export default Blockly;