const io = require('socket.io-client');

console.log('🤖 AI 대화 기능 테스트 시작...');

// Socket.io 클라이언트 연결
const socket = io('http://localhost:3000', {
    transports: ['websocket'],
    autoConnect: true
});

socket.on('connect', () => {
    console.log('✅ Socket.io 연결 성공! ID:', socket.id);
    
    // 테스트 사용자로 인증
    const userId = 'test-ai-user-' + Date.now();
    const sessionId = 'ai-test-session-' + Date.now();
    
    console.log('📝 사용자 인증:', userId);
    
    socket.emit('authenticate', { 
        userId: userId 
    });
    
    // 세션 참여
    setTimeout(() => {
        console.log('🎯 카페 상황으로 세션 참여:', sessionId);
        
        socket.emit('join-conversation', {
            sessionId: sessionId,
            userId: userId,
            situationId: 'cafe'
        });
        
    }, 500);
    
    // 세션 시작 후 메시지 전송
    socket.on('conversation-joined', (data) => {
        console.log('✅ 세션 시작됨, AI 대화 테스트 시작');
        
        setTimeout(() => {
            console.log('📤 첫 번째 메시지 전송: "Hello"');
            socket.emit('send-message', {
                sessionId: sessionId,
                message: 'Hello',
                timestamp: new Date().toISOString()
            });
        }, 1000);
        
        setTimeout(() => {
            console.log('📤 두 번째 메시지 전송: "I would like to order a coffee"');
            socket.emit('send-message', {
                sessionId: sessionId,
                message: 'I would like to order a coffee please',
                timestamp: new Date().toISOString()
            });
        }, 3000);
    });
});

// AI 응답 리스너
socket.on('ai-response', (data) => {
    console.log('🤖 AI 응답 수신:');
    console.log('   전체 데이터:', JSON.stringify(data, null, 2));
    console.log('   메시지:', data.message?.content || '(메시지 없음)');
    console.log('   피드백:', data.feedback || '(피드백 없음)');
    if (data.feedback?.suggestions && data.feedback.suggestions.length > 0) {
        console.log('   제안사항:', data.feedback.suggestions);
    }
});

socket.on('pronunciation_feedback', (data) => {
    console.log('🎯 발음 피드백 수신:', data);
});

socket.on('error', (error) => {
    console.error('❌ Socket 오류:', error);
});

socket.on('disconnect', (reason) => {
    console.log('🔌 연결 끊어짐:', reason);
});

// 20초 후 연결 종료
setTimeout(() => {
    console.log('🔚 AI 테스트 완료, 연결 종료');
    socket.disconnect();
    process.exit(0);
}, 20000);