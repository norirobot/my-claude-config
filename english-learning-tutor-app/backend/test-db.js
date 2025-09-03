const axios = require('axios');

const API_URL = 'http://localhost:3003';

async function testDatabase() {
  console.log('🧪 Testing Database Integration...\n');
  
  try {
    // 1. Test Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');
    
    // 2. Test User Login with seeded data
    console.log('2️⃣ Testing User Login with seeded data...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'student@test.com',
      password: 'password123'
    });
    console.log('✅ Login Success:', {
      user: loginResponse.data.user.name,
      email: loginResponse.data.user.email,
      points: loginResponse.data.user.points,
      streak: loginResponse.data.user.streak_days
    });
    const token = loginResponse.data.token;
    console.log('');
    
    // 3. Test User Profile Fetch
    console.log('3️⃣ Testing User Profile Fetch...');
    const profileResponse = await axios.get(`${API_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User Profile:', profileResponse.data);
    console.log('');
    
    // 4. Test Creating a Practice Session
    console.log('4️⃣ Testing Practice Session Creation...');
    const sessionResponse = await axios.post(`${API_URL}/api/sessions/start`, {
      situation_type: 'cafe',
      difficulty: 'medium'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Session Created:', sessionResponse.data);
    console.log('');
    
    // 5. Test User Statistics
    console.log('5️⃣ Testing User Statistics...');
    const statsResponse = await axios.get(`${API_URL}/api/users/statistics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User Statistics:', statsResponse.data);
    console.log('');
    
    console.log('🎉 All Database Tests Passed Successfully!');
    console.log('📊 SQLite database is fully integrated and working!');
    
  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
    console.error('Details:', error.response?.data?.details || 'No additional details');
  }
}

// Run tests
console.log('Starting Database Integration Tests...');
console.log('Make sure the server is running on port 3000\n');

setTimeout(() => {
  testDatabase();
}, 1000);