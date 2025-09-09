const io = require('socket.io-client');

console.log('🧪 Socket.io 연결 테스트 시작...');

// Socket.io 클라이언트 연결
const socket = io('http://localhost:3000', {
    transports: ['websocket'],
    autoConnect: true
});

socket.on('connect', () => {
    console.log('✅ Socket.io 연결 성공! ID:', socket.id);
    
    // 테스트 사용자로 인증
    const userId = 'test-user-' + Date.now();
    console.log('📝 사용자 인증 시도:', userId);
    
    socket.emit('authenticate', { 
        userId: userId 
    });
    
    // 세션 참여 테스트
    setTimeout(() => {
        const sessionId = 'test-session-' + Date.now();
        console.log('🎯 세션 참여 시도:', sessionId);
        
        socket.emit('join_session', {
            sessionId: sessionId,
            userId: userId,
            situationId: 'cafe'
        });
        
        // 테스트 메시지 전송
        setTimeout(() => {
            console.log('📤 테스트 메시지 전송...');
            socket.emit('send_message', {
                sessionId: sessionId,
                message: 'Hello, I would like to order a coffee please.',
                timestamp: new Date().toISOString()
            });
        }, 1000);
        
    }, 500);
});

socket.on('disconnect', (reason) => {
    console.log('🔌 Socket.io 연결 끊어짐:', reason);
});

socket.on('error', (error) => {
    console.error('❌ Socket.io 오류:', error);
});

// AI 응답 리스너
socket.on('ai_response', (data) => {
    console.log('🤖 AI 응답 수신:', data);
});

socket.on('session_started', (data) => {
    console.log('✅ 세션 시작됨:', data);
});

socket.on('session_ended', (data) => {
    console.log('🏁 세션 종료됨:', data);
});

// 7초 후 연결 종료
setTimeout(() => {
    console.log('🔚 테스트 완료, 연결 종료');
    socket.disconnect();
    process.exit(0);
}, 7000);