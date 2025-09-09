const axios = require('axios');

// API 테스트 스크립트
// 주요 conversation API 엔드포인트 테스트

const API_BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let sessionId = '';

// 테스트 사용자 데이터
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  username: 'testuser',
  display_name: 'Test User'
};

// API 요청 헬퍼 함수
const apiRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
};

// 테스트 함수들
const tests = {
  // 1. 서버 상태 확인
  async testHealthCheck() {
    console.log('\n🔍 Testing Health Check...');
    const result = await apiRequest('GET', '/../health'); // health is at root level
    console.log('Health Check:', result.success ? '✅ PASS' : '❌ FAIL');
    if (!result.success) console.log('Error:', result.error);
    return result.success;
  },

  // 2. 사용자 등록
  async testUserRegistration() {
    console.log('\n👤 Testing User Registration...');
    const result = await apiRequest('POST', '/auth/register', testUser);
    console.log('User Registration:', result.success ? '✅ PASS' : '❌ FAIL');
    if (!result.success) console.log('Error:', result.error);
    return result.success;
  },

  // 3. 사용자 로그인
  async testUserLogin() {
    console.log('\n🔐 Testing User Login...');
    const result = await apiRequest('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    if (result.success && result.data.token) {
      authToken = result.data.token;
      console.log('User Login: ✅ PASS');
      return true;
    } else {
      console.log('User Login: ❌ FAIL');
      console.log('Error:', result.error);
      return false;
    }
  },

  // 4. 상황 목록 조회
  async testGetSituations() {
    console.log('\n📋 Testing Get Situations...');
    const result = await apiRequest('GET', '/conversation/situations', null, authToken);
    console.log('Get Situations:', result.success ? '✅ PASS' : '❌ FAIL');
    if (result.success) {
      console.log(`Found ${result.data.data?.length || 0} situations`);
    } else {
      console.log('Error:', result.error);
    }
    return result.success;
  },

  // 5. 대화 세션 시작
  async testStartSession() {
    console.log('\n🎬 Testing Start Conversation Session...');
    const result = await apiRequest('POST', '/conversation/sessions/start', {
      situationId: 'daegu_taxi'
    }, authToken);

    if (result.success && result.data.data?.sessionId) {
      sessionId = result.data.data.sessionId;
      console.log('Start Session: ✅ PASS');
      console.log('Session ID:', sessionId);
      return true;
    } else {
      console.log('Start Session: ❌ FAIL');
      console.log('Error:', result.error);
      return false;
    }
  },

  // 6. 메시지 전송
  async testSendMessage() {
    if (!sessionId) {
      console.log('\n💬 Testing Send Message: ❌ SKIP (No session)');
      return false;
    }

    console.log('\n💬 Testing Send Message...');
    const result = await apiRequest('POST', `/conversation/sessions/${sessionId}/message`, {
      message: "Hello, could you take me to Suseong Lake please?",
      audioUrl: null
    }, authToken);

    console.log('Send Message:', result.success ? '✅ PASS' : '❌ FAIL');
    if (result.success) {
      console.log('AI Response:', result.data.data?.aiResponse || 'No response');
    } else {
      console.log('Error:', result.error);
    }
    return result.success;
  },

  // 7. 세션 종료
  async testEndSession() {
    if (!sessionId) {
      console.log('\n🏁 Testing End Session: ❌ SKIP (No session)');
      return false;
    }

    console.log('\n🏁 Testing End Session...');
    const result = await apiRequest('POST', `/conversation/sessions/${sessionId}/end`, {}, authToken);
    
    console.log('End Session:', result.success ? '✅ PASS' : '❌ FAIL');
    if (result.success) {
      console.log('Final Score:', result.data.data?.evaluation?.score || 'No score');
    } else {
      console.log('Error:', result.error);
    }
    return result.success;
  },

  // 8. 진행률 조회
  async testGetProgress() {
    console.log('\n📊 Testing Get Progress...');
    const result = await apiRequest('GET', '/conversation/progress', null, authToken);
    console.log('Get Progress:', result.success ? '✅ PASS' : '❌ FAIL');
    if (result.success) {
      console.log('Total Situations:', result.data.summary?.totalSituations || 0);
    } else {
      console.log('Error:', result.error);
    }
    return result.success;
  }
};

// 전체 테스트 실행
async function runAllTests() {
  console.log('🚀 Starting API Tests for English Learning App');
  console.log('=' .repeat(50));

  const testResults = [];
  
  // 서버 기본 테스트
  testResults.push(await tests.testHealthCheck());
  
  // 인증 관련 테스트 (실제 DB 연결이 필요함)
  // testResults.push(await tests.testUserRegistration());
  // testResults.push(await tests.testUserLogin());
  
  // 대화 기능 테스트 (인증이 필요함)
  // testResults.push(await tests.testGetSituations());
  // testResults.push(await tests.testStartSession());
  // testResults.push(await tests.testSendMessage());
  // testResults.push(await tests.testEndSession());
  // testResults.push(await tests.testGetProgress());

  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Results Summary');
  console.log('=' .repeat(50));
  
  const passedTests = testResults.filter(result => result).length;
  const totalTests = testResults.length;
  
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above.');
  }
  
  console.log('\n📝 Note: Auth and conversation tests are commented out');
  console.log('   Uncomment them after setting up database and OpenAI API key');
}

// 개별 테스트 실행 함수
async function runSpecificTest(testName) {
  if (tests[testName]) {
    console.log(`🔍 Running specific test: ${testName}`);
    await tests[testName]();
  } else {
    console.log(`❌ Test '${testName}' not found`);
    console.log('Available tests:', Object.keys(tests).join(', '));
  }
}

// 스크립트 실행
if (require.main === module) {
  const testName = process.argv[2];
  if (testName) {
    runSpecificTest(testName);
  } else {
    runAllTests();
  }
}

module.exports = { tests, apiRequest };