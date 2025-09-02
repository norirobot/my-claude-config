import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import 'blockly/blocks';
import './CBlocks.js';

Blockly.setLocale(En);

const BlocklyEditor = ({ allowedBlocks = null, onCodeComplete = null }) => {
  const blocklyDiv = useRef();
  const workspace = useRef();
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    // 허용된 블록이 지정된 경우 해당 블록만 표시
    const createLimitedToolbox = (allowedBlockTypes) => {
      if (!allowedBlockTypes) {
        // 기본 전체 툴박스 반환
        return getFullToolbox();
      }
      
      return {
        "kind": "categoryToolbox",
        "contents": [
          {
            "kind": "category",
            "name": "🎯 이 레벨의 블록들",
            "colour": "#4CAF50",
            "contents": allowedBlockTypes.map(blockType => ({
              "kind": "block",
              "type": blockType
            }))
          }
        ]
      };
    };

    const getFullToolbox = () => {
    return {
      "kind": "categoryToolbox",
      "contents": [
        {
          "kind": "category",
          "name": "🏁 순차",
          "colour": "#5CA65C",
          "contents": [
            {
              "kind": "block",
              "type": "c_printf"
            },
            {
              "kind": "block",
              "type": "c_scanf"
            },
            {
              "kind": "block",
              "type": "text"
            },
            {
              "kind": "block",
              "type": "math_number"
            }
          ]
        },
        {
          "kind": "category",
          "name": "🔄 반복",
          "colour": "#5C68A6",
          "contents": [
            {
              "kind": "block",
              "type": "c_for"
            },
            {
              "kind": "block",
              "type": "c_while"
            },
            {
              "kind": "block",
              "type": "c_do_while"
            },
            {
              "kind": "block",
              "type": "c_forever"
            }
          ]
        },
        {
          "kind": "category",
          "name": "🌟 선택",
          "colour": "#A65C97",
          "contents": [
            {
              "kind": "block",
              "type": "c_if"
            },
            {
              "kind": "block",
              "type": "c_if_else"
            },
            {
              "kind": "block",
              "type": "c_switch"
            },
            {
              "kind": "block",
              "type": "logic_compare"
            }
          ]
        },
        {
          "kind": "category",
          "name": "📦 변수",
          "colour": "#5C81A6",
          "contents": [
            {
              "kind": "block",
              "type": "c_variable_declare"
            },
            {
              "kind": "block",
              "type": "c_variable_set"
            },
            {
              "kind": "block",
              "type": "c_variable_get"
            },
            {
              "kind": "block",
              "type": "math_arithmetic"
            }
          ]
        },
        {
          "kind": "category",
          "name": "📋 리스트",
          "colour": "#8A5CA6",
          "contents": [
            {
              "kind": "block",
              "type": "c_array_declare"
            },
            {
              "kind": "block",
              "type": "c_array_set"
            },
            {
              "kind": "block",
              "type": "c_array_get"
            }
          ]
        },
        {
          "kind": "category",
          "name": "⚙️ 함수",
          "colour": "#A6755C",
          "contents": [
            {
              "kind": "block",
              "type": "c_main"
            },
            {
              "kind": "block",
              "type": "c_function"
            },
            {
              "kind": "block",
              "type": "c_function_call"
            }
          ]
        },
        {
          "kind": "category",
          "name": "🏆 온라인저지 - 초급",
          "colour": "#4CAF50",
          "contents": [
            {
              "kind": "block",
              "type": "oj_hello_world"
            },
            {
              "kind": "block",
              "type": "oj_add_two_numbers"
            },
            {
              "kind": "block",
              "type": "oj_input"
            },
            {
              "kind": "block",
              "type": "oj_output"
            }
          ]
        },
        {
          "kind": "category",
          "name": "🥈 온라인저지 - 중급",
          "colour": "#FF9800",
          "contents": [
            {
              "kind": "block",
              "type": "oj_star_pattern"
            },
            {
              "kind": "block",
              "type": "oj_multiplication_table"
            },
            {
              "kind": "block",
              "type": "oj_find_max"
            }
          ]
        },
        {
          "kind": "category",
          "name": "🥇 온라인저지 - 고급",
          "colour": "#D14D41",
          "contents": [
            {
              "kind": "block",
              "type": "oj_prime_check"
            },
            {
              "kind": "block",
              "type": "oj_fibonacci"
            },
            {
              "kind": "block",
              "type": "oj_sort_array"
            }
          ]
        },
        {
          "kind": "category",
          "name": "📝 프로그래밍 평가 1단계",
          "colour": "#9C27B0",
          "contents": [
            {
              "kind": "block",
              "type": "assessment_stage1"
            },
            {
              "kind": "block",
              "type": "stage1_counting"
            },
            {
              "kind": "block",
              "type": "stage1_grade_check"
            }
          ]
        },
        {
          "kind": "category",
          "name": "📝 프로그래밍 평가 2단계",
          "colour": "#3F51B5",
          "contents": [
            {
              "kind": "block",
              "type": "assessment_stage2"
            },
            {
              "kind": "block",
              "type": "stage2_calculator"
            },
            {
              "kind": "block",
              "type": "stage2_sum_sequence"
            }
          ]
        },
        {
          "kind": "category",
          "name": "📝 프로그래밍 평가 3단계",
          "colour": "#E91E63",
          "contents": [
            {
              "kind": "block",
              "type": "assessment_stage3"
            },
            {
              "kind": "block",
              "type": "stage3_array_average"
            },
            {
              "kind": "block",
              "type": "stage3_number_function"
            }
          ]
        },
        {
          "kind": "category",
          "name": "📊 개별 평가 - 기초",
          "colour": "#607D8B",
          "contents": [
            {
              "kind": "block",
              "type": "assessment_sequential"
            },
            {
              "kind": "block",
              "type": "sequential_problem"
            },
            {
              "kind": "block",
              "type": "assessment_loop"
            },
            {
              "kind": "block",
              "type": "loop_problem"
            },
            {
              "kind": "block",
              "type": "assessment_conditional"
            },
            {
              "kind": "block",
              "type": "conditional_problem"
            }
          ]
        },
        {
          "kind": "category",
          "name": "📊 개별 평가 - 응용",
          "colour": "#795548",
          "contents": [
            {
              "kind": "block",
              "type": "assessment_variable"
            },
            {
              "kind": "block",
              "type": "variable_problem"
            },
            {
              "kind": "block",
              "type": "assessment_io"
            },
            {
              "kind": "block",
              "type": "assessment_array"
            },
            {
              "kind": "block",
              "type": "assessment_function"
            }
          ]
        }
      ]
    };
    };

    const toolbox = createLimitedToolbox(allowedBlocks);

    workspace.current = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      }
    });

    // 코드 생성 이벤트 리스너
    workspace.current.addChangeListener(() => {
      generateCode();
    });

    return () => {
      if (workspace.current) {
        workspace.current.dispose();
      }
    };
  }, []);

  const generateCode = () => {
    if (workspace.current) {
      const code = Blockly.C.workspaceToCode(workspace.current);
      setGeneratedCode(code);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div 
        ref={blocklyDiv} 
        style={{ 
          height: '100%', 
          width: '70%',
          border: '1px solid #ccc'
        }} 
      />
      <div style={{ 
        width: '30%', 
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderLeft: '1px solid #ccc'
      }}>
        <h3>생성된 C 코드:</h3>
        <pre style={{
          backgroundColor: '#fff',
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          height: 'calc(100vh - 120px)',
          overflow: 'auto'
        }}>
          {generatedCode || '// 블록을 연결하면 C 코드가 여기에 생성됩니다'}
        </pre>
      </div>
    </div>
  );
};

export default BlocklyEditor;