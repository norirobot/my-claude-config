const io = require('socket.io-client');
const fs = require('fs');
const path = require('path');

console.log('🚀 Full End-to-End Integration Test');
console.log('===================================\n');

async function fullIntegrationTest() {
    let client1, client2;
    let testResults = {
        connection: false,
        authentication: false,
        sessionJoin: false,
        textMessage: false,
        voiceMessage: false,
        aiResponse: false,
        sessionEnd: false
    };

    try {
        console.log('🔌 Step 1: Socket.io Connection Test');
        
        // Client 1 (학습자)
        client1 = io('http://localhost:3000', {
            transports: ['websocket', 'polling']
        });
        
        // Client 2 (또 다른 세션 - 시스템 테스트용)
        client2 = io('http://localhost:3000', {
            transports: ['websocket', 'polling']
        });

        // 연결 대기
        await Promise.all([
            new Promise((resolve) => client1.on('connect', resolve)),
            new Promise((resolve) => client2.on('connect', resolve))
        ]);
        
        console.log('✅ Socket.io 연결 성공');
        testResults.connection = true;

        console.log('\n🔐 Step 2: Authentication Test');
        
        // 인증 테스트
        const authPromise1 = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Auth timeout')), 5000);
            
            client1.on('authenticated', (data) => {
                clearTimeout(timeout);
                console.log('✅ User1 인증 성공:', data);
                resolve(data);
            });
            
            client1.on('auth_error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });

        client1.emit('authenticate', { userId: 'test-user-1' });
        await authPromise1;
        testResults.authentication = true;

        console.log('\n🎯 Step 3: Session Join Test');
        
        // 세션 참여 테스트
        const sessionJoinPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Session join timeout')), 5000);
            
            client1.on('conversation-joined', (data) => {
                clearTimeout(timeout);
                console.log('✅ 세션 참여 성공:', data);
                resolve(data);
            });
            
            client1.on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });

        client1.emit('join-conversation', {
            sessionId: 'test-session-001',
            situationId: 'daegu_taxi'
        });
        
        await sessionJoinPromise;
        testResults.sessionJoin = true;

        console.log('\n💬 Step 4: Text Message Test');
        
        // 텍스트 메시지 테스트
        const messagePromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Message timeout')), 10000);
            
            client1.on('message-sent', (data) => {
                clearTimeout(timeout);
                console.log('✅ AI 응답 수신:', data.message);
                resolve(data);
            });
            
            client1.on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });

        client1.emit('send-message', {
            message: 'Hello, could you take me to Suseong Lake please?',
            sessionId: 'test-session-001'
        });
        
        const aiResponse = await messagePromise;
        testResults.textMessage = true;
        testResults.aiResponse = true;

        console.log('\n🎤 Step 5: Voice Message Test');
        
        // Mock 음성 데이터 생성 (실제 Base64 오디오 데이터 시뮬레이션)
        const mockVoiceData = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        
        const voicePromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Voice timeout')), 15000);
            
            client1.on('voice-processed', (data) => {
                clearTimeout(timeout);
                console.log('✅ 음성 처리 완료:', {
                    transcription: data.transcription,
                    analysis: data.analysis ? 'Available' : 'Not available'
                });
                resolve(data);
            });
            
            client1.on('voice-error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });

        client1.emit('send-voice', {
            audioData: mockVoiceData,
            duration: 3500,
            sessionId: 'test-session-001'
        });
        
        await voicePromise;
        testResults.voiceMessage = true;

        console.log('\n📊 Step 6: Session End Test');
        
        // 세션 종료 테스트
        const sessionEndPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Session end timeout')), 5000);
            
            client1.on('session-ended', (data) => {
                clearTimeout(timeout);
                console.log('✅ 세션 종료:', data);
                resolve(data);
            });
        });

        client1.emit('end-session', { sessionId: 'test-session-001' });
        await sessionEndPromise;
        testResults.sessionEnd = true;

        // 결과 리포트
        console.log('\n' + '='.repeat(50));
        console.log('🎉 FULL INTEGRATION TEST RESULTS');
        console.log('='.repeat(50));
        
        Object.entries(testResults).forEach(([test, passed]) => {
            const status = passed ? '✅ PASS' : '❌ FAIL';
            const testName = test.replace(/([A-Z])/g, ' $1').toUpperCase();
            console.log(`${status} ${testName}`);
        });

        const passedTests = Object.values(testResults).filter(Boolean).length;
        const totalTests = Object.keys(testResults).length;
        
        console.log(`\n📊 Overall Score: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
        
        if (passedTests === totalTests) {
            console.log('\n🎯 🎉 ALL SYSTEMS OPERATIONAL! 🎉');
            console.log('✨ 앱이 완벽하게 작동합니다!');
            console.log('🚀 프로덕션 배포 준비 완료!');
        } else {
            console.log('\n⚠️  일부 테스트 실패 - 수정 필요');
        }

    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
        console.error('상세 오류:', error);
    } finally {
        // 정리
        if (client1) client1.disconnect();
        if (client2) client2.disconnect();
        
        setTimeout(() => {
            console.log('\n✨ 테스트 완료!');
            process.exit(0);
        }, 1000);
    }
}

// 테스트 시작
fullIntegrationTest();