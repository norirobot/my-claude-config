// popup.js - Popup control logic and UI management

console.log('[Attok Monitor] Popup script loaded');

let isMonitoring = false;
let studentData = [];
let updateInterval = null;

// DOM elements
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const toggleMonitor = document.getElementById('toggleMonitor');
const toggleText = document.getElementById('toggleText');
const checkNowBtn = document.getElementById('checkNowBtn');
const studentCount = document.getElementById('studentCount');
const studentListContainer = document.getElementById('studentListContainer');
const lastUpdate = document.getElementById('lastUpdate');
const classDuration = document.getElementById('classDuration');

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  checkConnection();
  loadStudentData();
  setupEventListeners();
  startTimeUpdate();
});

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(['classDuration', 'isMonitoring']);
    
    if (result.classDuration) {
      classDuration.value = result.classDuration;
    }
    
    if (result.isMonitoring) {
      isMonitoring = result.isMonitoring;
      updateMonitoringUI();
    }
  } catch (error) {
    console.error('[Attok Monitor] Error loading settings:', error);
  }
}

// Save settings to storage
async function saveSettings() {
  try {
    await chrome.storage.local.set({
      classDuration: parseInt(classDuration.value),
      isMonitoring: isMonitoring
    });
  } catch (error) {
    console.error('[Attok Monitor] Error saving settings:', error);
  }
}

// Check connection to attok.co.kr
async function checkConnection() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    if (currentTab && currentTab.url && currentTab.url.includes('attok.co.kr')) {
      setConnectionStatus(true, 'attok.co.kr에 연결됨');
      
      // Test content script communication
      try {
        const response = await chrome.tabs.sendMessage(currentTab.id, { type: 'GET_STATUS' });
        if (response && response.active) {
          setConnectionStatus(true, '연결됨 - 감지 준비 완료');
        }
      } catch (error) {
        setConnectionStatus(true, '연결됨 - 스크립트 로딩 중');
        console.log('[Attok Monitor] Content script not ready yet');
      }
    } else {
      setConnectionStatus(false, 'attok.co.kr에 접속하세요');
    }
  } catch (error) {
    console.error('[Attok Monitor] Error checking connection:', error);
    setConnectionStatus(false, '연결 확인 실패');
  }
}

// Set connection status UI
function setConnectionStatus(connected, message) {
  statusDot.classList.toggle('connected', connected);
  statusText.textContent = message;
  
  // Enable/disable buttons based on connection
  checkNowBtn.disabled = !connected;
  toggleMonitor.disabled = !connected;
}

// Load student data from storage
async function loadStudentData() {
  try {
    const result = await chrome.storage.local.get(['studentData']);
    studentData = result.studentData || [];
    updateStudentList();
  } catch (error) {
    console.error('[Attok Monitor] Error loading student data:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  toggleMonitor.addEventListener('click', toggleMonitoring);
  checkNowBtn.addEventListener('click', checkNow);
  
  classDuration.addEventListener('change', () => {
    saveSettings();
    // Recalculate remaining times for existing students
    updateStudentList();
  });
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Attok Monitor] Popup received message:', message.type);
    
    if (message.type === 'STUDENT_DATA_UPDATE') {
      studentData = message.students || [];
      updateStudentList();
      updateLastUpdate();
    } else if (message.type === 'MONITORING_STATUS_CHANGED') {
      isMonitoring = message.isMonitoring;
      updateMonitoringUI();
    }
    
    sendResponse({ received: true });
  });
}

// Toggle monitoring
async function toggleMonitoring() {
  isMonitoring = !isMonitoring;
  
  // Send message to background script
  try {
    await chrome.runtime.sendMessage({
      type: 'TOGGLE_MONITORING',
      isMonitoring: isMonitoring
    });
    
    updateMonitoringUI();
    saveSettings();
  } catch (error) {
    console.error('[Attok Monitor] Error toggling monitoring:', error);
  }
}

// Update monitoring UI
function updateMonitoringUI() {
  if (isMonitoring) {
    toggleText.textContent = '모니터링 중지';
    toggleMonitor.className = 'btn btn-danger';
  } else {
    toggleText.textContent = '모니터링 시작';
    toggleMonitor.className = 'btn btn-primary';
  }
}

// Check now button handler
async function checkNow() {
  checkNowBtn.disabled = true;
  checkNowBtn.textContent = '확인 중...';
  
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    if (currentTab && currentTab.url && currentTab.url.includes('attok.co.kr')) {
      const response = await chrome.tabs.sendMessage(currentTab.id, { type: 'CHECK_NOW' });
      
      if (response && response.success) {
        console.log('[Attok Monitor] Manual check result:', response);
        
        // Update student data with current timestamps
        const currentTime = new Date().toISOString();
        studentData = response.students.map(student => ({
          ...student,
          startTime: studentData.find(s => s.name === student.name)?.startTime || currentTime
        }));
        
        // Save to storage
        await chrome.storage.local.set({ studentData: studentData });
        
        updateStudentList();
        updateLastUpdate();
      }
    }
  } catch (error) {
    console.error('[Attok Monitor] Error in manual check:', error);
  } finally {
    checkNowBtn.disabled = false;
    checkNowBtn.textContent = '지금 확인';
  }
}

// Update student list UI
function updateStudentList() {
  studentCount.textContent = studentData.length;
  
  if (studentData.length === 0) {
    studentListContainer.innerHTML = `
      <div class="empty-state">
        <i>📝</i>
        <p>출석한 학생이 없습니다</p>
        <p style="font-size: 12px; margin-top: 10px;">attok.co.kr에서 출석 페이지를 열고<br>"지금 확인" 버튼을 클릭하세요</p>
      </div>
    `;
    return;
  }
  
  const currentTime = new Date();
  const classMinutes = parseInt(classDuration.value);
  
  const studentItems = studentData.map(student => {
    const startTime = new Date(student.startTime);
    const elapsedMinutes = Math.floor((currentTime - startTime) / (1000 * 60));
    const remainingMinutes = Math.max(0, classMinutes - elapsedMinutes);
    
    let timeClass = 'remaining-time';
    let timeText = formatTime(remainingMinutes);
    let statusBadge = '';
    
    if (remainingMinutes === 0) {
      timeClass += ' ended';
      timeText = '수업 종료';
    } else if (remainingMinutes <= 10) {
      timeClass += ' danger';
      statusBadge = '<span class="notification-badge">!</span>';
    } else if (remainingMinutes <= 20) {
      timeClass += ' warning';
    }
    
    return `
      <div class="student-item">
        <div class="student-name">${student.name}${statusBadge}</div>
        <div class="student-time">
          <div class="${timeClass}">${timeText}</div>
          <div class="time-label">남은 시간</div>
        </div>
      </div>
    `;
  }).join('');
  
  studentListContainer.innerHTML = studentItems;
}

// Format time (minutes to HH:MM format)
function formatTime(minutes) {
  if (minutes <= 0) return '00:00';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Start time update interval
function startTimeUpdate() {
  // Update every second
  updateInterval = setInterval(() => {
    updateStudentList();
  }, 1000);
}

// Update last update time
function updateLastUpdate() {
  const now = new Date();
  lastUpdate.textContent = now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Check connection periodically
setInterval(checkConnection, 5000);

// Cleanup when popup closes
window.addEventListener('beforeunload', () => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});

console.log('[Attok Monitor] Popup ready');