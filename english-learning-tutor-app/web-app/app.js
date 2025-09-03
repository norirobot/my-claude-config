// App State
let socket = null;
let currentUser = null;
let currentSession = null;
let selectedSituation = null;
let isRecording = false;

// API Configuration
const API_URL = 'http://localhost:3000';
const SOCKET_URL = 'http://localhost:3000';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initializeEventListeners();
    initializeSocket();
});

function initializeApp() {
    // Check for saved user session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserInterface();
    }
    
    // Show home page by default
    showPage('home');
}

function initializeEventListeners() {
    console.log('🔧 이벤트 리스너 초기화 시작...');
    
    // Navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    console.log('📱 찾은 네비게이션 버튼 개수:', navButtons.length);
    
    navButtons.forEach(btn => {
        console.log('🔘 버튼 등록:', btn.textContent, 'data-page:', btn.dataset.page);
        btn.addEventListener('click', (e) => {
            const page = e.target.dataset.page;
            console.log('🖱️ 버튼 클릭됨:', page);
            showPage(page);
        });
    });
    
    // Logo click for home
    document.querySelector('.clickable-logo').addEventListener('click', () => {
        console.log('🏠 로고 클릭됨 - 홈으로 이동');
        showPage('home');
    });

    // Login button
    document.getElementById('loginBtn').addEventListener('click', () => {
        document.getElementById('loginModal').style.display = 'block';
    });
    
    // Modal close
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('loginModal').style.display = 'none';
    });
    
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Feature cards (on home page)
    document.querySelectorAll('.feature-card.clickable').forEach(card => {
        card.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            console.log('🏠 기능 카드 클릭됨:', page);
            showPage(page);
        });
    });

    // Situation cards
    document.querySelectorAll('.situation-card').forEach(card => {
        card.addEventListener('click', (e) => {
            selectSituation(e.currentTarget);
        });
    });
    
    // Chat input
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    
    // Voice button
    document.getElementById('voiceBtn').addEventListener('click', toggleVoiceRecording);
    
    // Text mode button
    document.getElementById('textModeBtn').addEventListener('click', () => {
        setInputMode('text');
    });
}

function initializeSocket() {
    socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true
    });
    
    socket.on('connect', () => {
        console.log('Connected to server');
        showToast('서버에 연결되었습니다', 'success');
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        showToast('서버 연결이 끊어졌습니다', 'error');
    });
    
    socket.on('error', (error) => {
        console.error('Socket error:', error);
        showToast('연결 오류가 발생했습니다', 'error');
    });
    
    // Chat events
    socket.on('ai-response', handleAIResponse);
    socket.on('pronunciation_feedback', handlePronunciationFeedback);
    socket.on('conversation-joined', handleSessionStarted);
    socket.on('session-ended', handleSessionEnded);
}

// Page Navigation
function showPage(pageName) {
    console.log('📄 페이지 전환 요청:', pageName);
    
    // Hide all pages
    const allPages = document.querySelectorAll('.page');
    console.log('📋 전체 페이지 수:', allPages.length);
    
    allPages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPageId = `${pageName}Page`;
    const page = document.getElementById(targetPageId);
    console.log('🎯 대상 페이지 ID:', targetPageId, '찾은 페이지:', page ? '있음' : '없음');
    
    if (page) {
        page.classList.add('active');
        console.log('✅ 페이지 활성화 완료:', pageName);
    } else {
        console.error('❌ 페이지를 찾을 수 없음:', targetPageId);
    }
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === pageName) {
            btn.classList.add('active');
        }
    });
}

// User Authentication
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
            localStorage.setItem('token', data.token);
            
            updateUserInterface();
            document.getElementById('loginModal').style.display = 'none';
            showToast('로그인 성공!', 'success');
            
            // Authenticate socket
            socket.emit('authenticate', { userId: currentUser.id });
        } else {
            showToast(data.message || '로그인 실패', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        // For demo, create a test user
        currentUser = {
            id: 'test-' + Date.now(),
            name: '테스트 사용자',
            email: email
        };
        localStorage.setItem('user', JSON.stringify(currentUser));
        updateUserInterface();
        document.getElementById('loginModal').style.display = 'none';
        showToast('테스트 모드로 로그인했습니다', 'success');
        
        // Authenticate socket with test user
        socket.emit('authenticate', { userId: currentUser.id });
    }
}

function updateUserInterface() {
    const loginBtn = document.getElementById('loginBtn');
    if (currentUser) {
        loginBtn.textContent = currentUser.name || currentUser.email;
        loginBtn.onclick = null; // 로그아웃 기능은 나중에 추가 가능
    } else {
        loginBtn.textContent = '로그인';
        loginBtn.onclick = () => {
            document.getElementById('loginModal').style.display = 'block';
        };
    }
}

// Situation Selection
function selectSituation(card) {
    // Remove previous selection
    document.querySelectorAll('.situation-card').forEach(c => {
        c.classList.remove('selected');
    });
    
    // Add selection to clicked card
    card.classList.add('selected');
    
    selectedSituation = card.dataset.situation;
    
    // Show chat interface
    document.getElementById('chatInterface').style.display = 'block';
    document.getElementById('situationTitle').textContent = 
        card.querySelector('.situation-name').textContent;
    
    // Start session
    startChatSession();
}

// Chat Session Management
function startChatSession() {
    // 테스트 모드: 로그인 없이도 사용 가능
    if (!currentUser) {
        console.log('🧪 테스트 모드: 임시 사용자 생성');
        currentUser = {
            id: 'test-user-' + Date.now(),
            name: '테스트 사용자',
            email: 'test@example.com'
        };
        showToast('테스트 모드로 진행합니다', 'success');
        
        // Socket 인증
        if (socket && socket.connected) {
            socket.emit('authenticate', { userId: currentUser.id });
        }
    }
    
    if (!selectedSituation) {
        showToast('상황을 선택해주세요', 'error');
        return;
    }
    
    // Clear previous messages
    document.getElementById('chatMessages').innerHTML = '';
    
    // Create session
    const sessionId = 'session-' + Date.now();
    currentSession = {
        id: sessionId,
        situation: selectedSituation,
        startTime: new Date()
    };
    
    // Emit session start
    socket.emit('join-conversation', {
        sessionId: sessionId,
        userId: currentUser.id,
        situationId: selectedSituation
    });
    
    // Add welcome message
    addMessage('ai', getWelcomeMessage(selectedSituation));
}

function getWelcomeMessage(situation) {
    const messages = {
        cafe: "Welcome to the cafe! What would you like to order today?",
        taxi: "Hello! Where would you like to go today?",
        restaurant: "Good evening! Do you have a reservation?",
        airport: "Welcome to the airport. How may I assist you?",
        hospital: "Hello, how can I help you today?",
        business: "Good morning! Nice to meet you. Shall we begin our meeting?"
    };
    
    return messages[situation] || "Hello! How can I help you today?";
}

function endSession() {
    if (currentSession) {
        socket.emit('end-session', {
            sessionId: currentSession.id
        });
        
        currentSession = null;
        document.getElementById('chatInterface').style.display = 'none';
        showToast('세션이 종료되었습니다', 'success');
    }
}

// Message Handling
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    console.log('📤 메시지 전송 시도:', message);
    
    if (!message) {
        console.log('❌ 빈 메시지');
        return;
    }
    
    if (!currentSession) {
        console.log('❌ 세션 없음');
        showToast('먼저 상황을 선택해주세요', 'error');
        return;
    }
    
    if (!socket || !socket.connected) {
        console.log('❌ Socket 연결 없음');
        showToast('서버 연결이 끊어졌습니다', 'error');
        return;
    }
    
    console.log('✅ 메시지 전송 조건 충족');
    console.log('📡 현재 세션:', currentSession);
    console.log('🔌 Socket 상태:', socket.connected);
    
    // Add user message to chat
    addMessage('user', message);
    
    // Send to server
    const messageData = {
        sessionId: currentSession.id,
        message: message,
        timestamp: new Date().toISOString()
    };
    
    console.log('📨 서버로 전송하는 데이터:', messageData);
    socket.emit('send-message', messageData);
    
    // Clear input
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    console.log('⏳ 타이핑 인디케이터 표시됨');
}

function addMessage(sender, text, time = new Date()) {
    const messagesDiv = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.textContent = text;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = time.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    bubbleDiv.appendChild(timeDiv);
    messageDiv.appendChild(bubbleDiv);
    messagesDiv.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showTypingIndicator() {
    const messagesDiv = document.getElementById('chatMessages');
    
    // Remove existing indicator
    removeTypingIndicator();
    
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'message ai typing-indicator';
    indicatorDiv.innerHTML = '<div class="message-bubble"><span class="loading"></span> AI가 응답 중...</div>';
    
    messagesDiv.appendChild(indicatorDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Socket Event Handlers
function handleAIResponse(data) {
    console.log('🤖 AI 응답 수신:', data);
    removeTypingIndicator();
    
    // 새로운 데이터 구조에 맞춰 메시지 추출
    if (data.message && data.message.content) {
        addMessage('ai', data.message.content);
    }
    
    // 피드백 표시
    if (data.feedback) {
        showFeedback(data.feedback);
    }
}

function handlePronunciationFeedback(data) {
    const feedbackArea = document.getElementById('feedbackArea');
    const feedbackContent = document.getElementById('feedbackContent');
    
    feedbackArea.style.display = 'block';
    feedbackContent.innerHTML = `
        <div class="pronunciation-score">
            발음 점수: ${data.score || 'N/A'}/100
        </div>
        <div class="pronunciation-feedback">
            ${data.feedback || '피드백을 생성하는 중...'}
        </div>
        ${data.suggestions ? `
            <div class="pronunciation-suggestions">
                <strong>개선 제안:</strong>
                <ul>
                    ${data.suggestions.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
    `;
}

function handleSessionStarted(data) {
    console.log('Session started:', data);
    showToast('세션이 시작되었습니다', 'success');
}

function handleSessionEnded(data) {
    console.log('Session ended:', data);
    
    if (data.summary) {
        showSessionSummary(data.summary);
    }
}

function showSessionSummary(summary) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>세션 요약</h2>
            <div class="session-summary">
                <p><strong>총 대화 시간:</strong> ${summary.duration || 'N/A'}</p>
                <p><strong>메시지 수:</strong> ${summary.messageCount || 0}</p>
                <p><strong>평균 점수:</strong> ${summary.averageScore || 'N/A'}/100</p>
                <p><strong>주요 피드백:</strong></p>
                <ul>
                    ${(summary.keyFeedback || []).map(f => `<li>${f}</li>`).join('')}
                </ul>
            </div>
            <button class="btn-primary" onclick="this.parentElement.parentElement.remove()">확인</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Voice Recording
function toggleVoiceRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        isRecording = true;
        document.getElementById('voiceBtn').classList.add('recording');
        document.getElementById('voiceBtn').textContent = '🔴 녹음 중...';
        
        // Create MediaRecorder
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            await sendVoiceData(audioBlob);
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        
        // Store recorder for stopping
        window.currentRecorder = mediaRecorder;
        
        // Auto-stop after 30 seconds
        setTimeout(() => {
            if (isRecording) {
                stopRecording();
            }
        }, 30000);
        
    } catch (error) {
        console.error('Error accessing microphone:', error);
        showToast('마이크 접근 권한이 필요합니다', 'error');
    }
}

function stopRecording() {
    if (window.currentRecorder && isRecording) {
        isRecording = false;
        window.currentRecorder.stop();
        
        document.getElementById('voiceBtn').classList.remove('recording');
        document.getElementById('voiceBtn').textContent = '🎤 음성 입력';
    }
}

async function sendVoiceData(audioBlob) {
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64Audio = reader.result.split(',')[1];
        
        // Send to server
        socket.emit('send-voice', {
            sessionId: currentSession.id,
            audioData: base64Audio,
            timestamp: new Date().toISOString()
        });
        
        showToast('음성 전송 중...', 'success');
    };
    reader.readAsDataURL(audioBlob);
}

function setInputMode(mode) {
    if (mode === 'text') {
        document.getElementById('textModeBtn').classList.add('active');
        document.getElementById('voiceBtn').classList.remove('active');
        document.getElementById('messageInput').focus();
    } else {
        document.getElementById('voiceBtn').classList.add('active');
        document.getElementById('textModeBtn').classList.remove('active');
    }
}

// Utility Functions
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showFeedback(feedback) {
    const feedbackArea = document.getElementById('feedbackArea');
    const feedbackContent = document.getElementById('feedbackContent');
    
    feedbackArea.style.display = 'block';
    feedbackContent.innerHTML = `
        <div class="feedback-item">
            ${feedback}
        </div>
    `;
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showPage,
        sendMessage,
        startChatSession,
        endSession
    };
}