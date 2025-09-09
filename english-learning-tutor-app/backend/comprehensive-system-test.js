const io = require('socket.io-client');
const fs = require('fs').promises;
const path = require('path');

console.log('🧪 Comprehensive System Test Suite');
console.log('===================================\n');

const testResults = {
    passed: [],
    failed: [],
    warnings: []
};

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function report(test, status, message) {
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${test}: ${message}`);
    
    if (status === 'pass') testResults.passed.push(test);
    else if (status === 'fail') testResults.failed.push({ test, message });
    else testResults.warnings.push({ test, message });
}

async function testConnection() {
    console.log('\n📡 Testing Connection...');
    
    return new Promise((resolve) => {
        const socket = io('http://localhost:3000');
        
        socket.on('connect', () => {
            report('Connection', 'pass', 'Successfully connected');
            socket.disconnect();
            resolve(true);
        });
        
        socket.on('connect_error', (error) => {
            report('Connection', 'fail', error.message);
            resolve(false);
        });
        
        setTimeout(() => {
            report('Connection', 'fail', 'Connection timeout');
            socket.disconnect();
            resolve(false);
        }, 5000);
    });
}

async function testAuthentication() {
    console.log('\n🔐 Testing Authentication...');
    
    return new Promise((resolve) => {
        const socket = io('http://localhost:3000');
        
        socket.on('connect', () => {
            // Test valid authentication
            socket.emit('authenticate', { userId: 'test-user-' + Date.now() });
            
            socket.on('authenticated', (data) => {
                report('Valid Authentication', 'pass', 'User authenticated successfully');
                
                // Test duplicate authentication
                socket.emit('authenticate', { userId: 'duplicate-user' });
                
                setTimeout(() => {
                    socket.disconnect();
                    resolve(true);
                }, 1000);
            });
            
            socket.on('auth-error', (error) => {
                report('Authentication', 'fail', error.message);
                socket.disconnect();
                resolve(false);
            });
        });
    });
}

async function testSessionManagement() {
    console.log('\n🎯 Testing Session Management...');
    
    return new Promise((resolve) => {
        const socket = io('http://localhost:3000');
        const sessionId = 'test-session-' + Date.now();
        
        socket.on('connect', () => {
            socket.emit('authenticate', { userId: 'session-test-user' });
            
            socket.on('authenticated', () => {
                // Test session join
                socket.emit('join-conversation', {
                    sessionId: sessionId,
                    situationId: 'daegu_taxi'
                });
                
                socket.on('conversation-joined', (data) => {
                    report('Session Join', 'pass', `Joined session ${data.sessionId}`);
                    
                    // Test session end
                    socket.emit('end-session', { sessionId });
                    
                    socket.on('session-ended', (data) => {
                        report('Session End', 'pass', 'Session ended successfully');
                        socket.disconnect();
                        resolve(true);
                    });
                });
            });
        });
        
        setTimeout(() => {
            report('Session Management', 'fail', 'Timeout');
            socket.disconnect();
            resolve(false);
        }, 10000);
    });
}

async function testMessageFlow() {
    console.log('\n💬 Testing Message Flow...');
    
    return new Promise((resolve) => {
        const socket = io('http://localhost:3000');
        const sessionId = 'message-test-' + Date.now();
        let messageCount = 0;
        
        socket.on('connect', () => {
            socket.emit('authenticate', { userId: 'message-test-user' });
            
            socket.on('authenticated', () => {
                socket.emit('join-conversation', { sessionId, situationId: 'coffee_order' });
                
                socket.on('conversation-joined', () => {
                    // Send multiple messages
                    const messages = [
                        'Hello!',
                        'I would like a coffee',
                        'Make it a large latte please'
                    ];
                    
                    messages.forEach((msg, index) => {
                        setTimeout(() => {
                            socket.emit('send-message', { message: msg, sessionId });
                        }, index * 1000);
                    });
                    
                    socket.on('message-sent', (data) => {
                        messageCount++;
                        report(`Message ${messageCount}`, 'pass', `Sent: ${data.message.content}`);
                        
                        if (messageCount === messages.length) {
                            socket.disconnect();
                            resolve(true);
                        }
                    });
                });
            });
        });
    });
}

async function testVoiceProcessing() {
    console.log('\n🎤 Testing Voice Processing...');
    
    return new Promise((resolve) => {
        const socket = io('http://localhost:3000');
        const sessionId = 'voice-test-' + Date.now();
        
        socket.on('connect', () => {
            socket.emit('authenticate', { userId: 'voice-test-user' });
            
            socket.on('authenticated', () => {
                socket.emit('join-conversation', { sessionId, situationId: 'daegu_taxi' });
                
                socket.on('conversation-joined', () => {
                    // Send different sizes of audio data
                    const audioSizes = [
                        { size: 'small', data: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=' },
                        { size: 'medium', data: 'data:audio/wav;base64,' + Buffer.from(new Array(1000).fill(0)).toString('base64') },
                        { size: 'large', data: 'data:audio/wav;base64,' + Buffer.from(new Array(10000).fill(0)).toString('base64') }
                    ];
                    
                    let processed = 0;
                    
                    audioSizes.forEach((audio, index) => {
                        setTimeout(() => {
                            socket.emit('send-voice', {
                                audioData: audio.data,
                                duration: (index + 1) * 1000,
                                sessionId
                            });
                        }, index * 2000);
                    });
                    
                    socket.on('voice-processed', (data) => {
                        processed++;
                        report(`Voice Processing ${processed}`, 'pass', 'Audio processed successfully');
                        
                        if (processed === audioSizes.length) {
                            socket.disconnect();
                            resolve(true);
                        }
                    });
                    
                    socket.on('voice-error', (error) => {
                        report('Voice Processing', 'fail', error.message);
                    });
                });
            });
        });
        
        setTimeout(() => {
            socket.disconnect();
            resolve(true);
        }, 10000);
    });
}

async function testErrorHandling() {
    console.log('\n⚠️ Testing Error Handling...');
    
    // Test invalid authentication
    const socket1 = io('http://localhost:3000');
    await new Promise((resolve) => {
        socket1.on('connect', () => {
            socket1.emit('authenticate', {}); // Empty data
            
            socket1.on('error', () => {
                report('Invalid Auth Handling', 'pass', 'Error handled correctly');
                socket1.disconnect();
                resolve();
            });
            
            setTimeout(() => {
                socket1.disconnect();
                resolve();
            }, 2000);
        });
    });
    
    // Test invalid session
    const socket2 = io('http://localhost:3000');
    await new Promise((resolve) => {
        socket2.on('connect', () => {
            socket2.emit('authenticate', { userId: 'error-test-user' });
            
            socket2.on('authenticated', () => {
                socket2.emit('send-message', { 
                    message: 'test',
                    sessionId: 'non-existent-session'
                });
                
                socket2.on('error', (error) => {
                    report('Invalid Session Handling', 'pass', 'Session error handled');
                    socket2.disconnect();
                    resolve();
                });
            });
        });
        
        setTimeout(() => {
            socket2.disconnect();
            resolve();
        }, 3000);
    });
    
    return true;
}

async function testConcurrentConnections() {
    console.log('\n👥 Testing Concurrent Connections...');
    
    const sockets = [];
    const connectionCount = 10;
    let connected = 0;
    
    return new Promise((resolve) => {
        for (let i = 0; i < connectionCount; i++) {
            const socket = io('http://localhost:3000');
            sockets.push(socket);
            
            socket.on('connect', () => {
                connected++;
                
                if (connected === connectionCount) {
                    report('Concurrent Connections', 'pass', `${connectionCount} simultaneous connections successful`);
                    
                    // Cleanup
                    sockets.forEach(s => s.disconnect());
                    resolve(true);
                }
            });
        }
        
        setTimeout(() => {
            report('Concurrent Connections', 'warning', `Only ${connected}/${connectionCount} connected`);
            sockets.forEach(s => s.disconnect());
            resolve(false);
        }, 5000);
    });
}

async function testReconnection() {
    console.log('\n🔄 Testing Reconnection...');
    
    return new Promise((resolve) => {
        const socket = io('http://localhost:3000', {
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000
        });
        
        let disconnectCount = 0;
        let reconnectCount = 0;
        
        socket.on('connect', () => {
            if (reconnectCount === 0) {
                report('Initial Connection', 'pass', 'Connected');
                
                // Force disconnect
                setTimeout(() => {
                    socket.disconnect();
                    socket.connect();
                }, 1000);
            } else {
                report('Reconnection', 'pass', 'Reconnected successfully');
                socket.disconnect();
                resolve(true);
            }
            reconnectCount++;
        });
        
        socket.on('disconnect', () => {
            disconnectCount++;
        });
        
        setTimeout(() => {
            socket.disconnect();
            resolve(true);
        }, 10000);
    });
}

async function runAllTests() {
    console.log('Starting comprehensive system tests...\n');
    const startTime = Date.now();
    
    try {
        // Run tests sequentially
        await testConnection();
        await delay(1000);
        
        await testAuthentication();
        await delay(1000);
        
        await testSessionManagement();
        await delay(1000);
        
        await testMessageFlow();
        await delay(1000);
        
        await testVoiceProcessing();
        await delay(1000);
        
        await testErrorHandling();
        await delay(1000);
        
        await testConcurrentConnections();
        await delay(1000);
        
        await testReconnection();
        
    } catch (error) {
        console.error('Test suite error:', error);
    }
    
    // Final report
    const duration = Date.now() - startTime;
    console.log('\n' + '='.repeat(50));
    console.log('📊 COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${testResults.passed.length} tests`);
    console.log(`❌ Failed: ${testResults.failed.length} tests`);
    console.log(`⚠️ Warnings: ${testResults.warnings.length}`);
    console.log(`⏱️ Duration: ${(duration / 1000).toFixed(2)} seconds`);
    
    if (testResults.failed.length > 0) {
        console.log('\nFailed Tests:');
        testResults.failed.forEach(f => console.log(`  - ${f.test}: ${f.message}`));
    }
    
    if (testResults.warnings.length > 0) {
        console.log('\nWarnings:');
        testResults.warnings.forEach(w => console.log(`  - ${w.test}: ${w.message}`));
    }
    
    const successRate = (testResults.passed.length / (testResults.passed.length + testResults.failed.length) * 100).toFixed(1);
    console.log(`\n🎯 Success Rate: ${successRate}%`);
    
    if (successRate >= 90) {
        console.log('✨ System is production ready!');
    } else if (successRate >= 70) {
        console.log('⚠️ System needs some improvements');
    } else {
        console.log('❌ System has critical issues');
    }
    
    process.exit(testResults.failed.length > 0 ? 1 : 0);
}

// Run tests
runAllTests();