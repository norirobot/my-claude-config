const io = require('socket.io-client');

console.log('Direct Socket.io Connection Test');
console.log('================================\n');

const socket = io('http://localhost:3000', {
    transports: ['websocket', 'polling']
});

socket.on('connect', () => {
    console.log('✅ Connected successfully!');
    console.log('Socket ID:', socket.id);
    
    // Test authentication
    socket.emit('authenticate', { userId: 'direct-test-user' });
});

socket.on('authenticated', (data) => {
    console.log('✅ Authenticated:', data);
    
    // Test session join
    socket.emit('join-conversation', {
        sessionId: 'direct-test-session',
        situationId: 'daegu_taxi'
    });
});

socket.on('conversation-joined', (data) => {
    console.log('✅ Session joined:', data);
    
    // Test message
    socket.emit('send-message', {
        message: 'Hello from direct test!',
        sessionId: 'direct-test-session'
    });
});

socket.on('message-sent', (data) => {
    console.log('✅ Message sent:', data);
    console.log('\n🎉 All tests passed! Socket.io is working correctly.');
    process.exit(0);
});

socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
    console.error('Type:', error.type);
    process.exit(1);
});

socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
});

setTimeout(() => {
    console.log('⏱️ Test timed out after 10 seconds');
    process.exit(1);
}, 10000);