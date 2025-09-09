// background.js - Background monitoring service

console.log('[Attok Monitor] Background script loaded');

let isMonitoring = false;
let studentData = [];
let notifiedStudents = new Set(); // Track who we've already notified

// Initialize background script
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Attok Monitor] Extension installed');
  
  // Clear any existing alarms
  chrome.alarms.clearAll();
  
  // Load stored settings
  loadSettings();
});

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(['isMonitoring', 'studentData', 'classDuration']);
    
    isMonitoring = result.isMonitoring || false;
    studentData = result.studentData || [];
    
    console.log('[Attok Monitor] Settings loaded:', { isMonitoring, studentCount: studentData.length });
    
    if (isMonitoring) {
      startMonitoring();
    }
  } catch (error) {
    console.error('[Attok Monitor] Error loading settings:', error);
  }
}

// Start monitoring
function startMonitoring() {
  console.log('[Attok Monitor] Starting monitoring...');
  
  isMonitoring = true;
  
  // Create alarm for periodic checks (every 30 seconds)
  chrome.alarms.create('monitorCheck', {
    delayInMinutes: 0.5, // 30 seconds
    periodInMinutes: 0.5
  });
  
  // Save monitoring state
  chrome.storage.local.set({ isMonitoring: true });
  
  // Notify popup about status change
  notifyStatusChange();
}

// Stop monitoring
function stopMonitoring() {
  console.log('[Attok Monitor] Stopping monitoring...');
  
  isMonitoring = false;
  
  // Clear alarm
  chrome.alarms.clear('monitorCheck');
  
  // Save monitoring state
  chrome.storage.local.set({ isMonitoring: false });
  
  // Notify popup about status change
  notifyStatusChange();
}

// Handle alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'monitorCheck' && isMonitoring) {
    console.log('[Attok Monitor] Periodic check triggered');
    performMonitoringCheck();
  }
});

// Perform monitoring check
async function performMonitoringCheck() {
  try {
    // Find attok.co.kr tabs
    const attokTabs = await chrome.tabs.query({ url: '*://*.attok.co.kr/*' });
    
    if (attokTabs.length === 0) {
      console.log('[Attok Monitor] No attok.co.kr tabs found');
      return;
    }
    
    console.log(`[Attok Monitor] Checking ${attokTabs.length} attok tabs`);
    
    // Check each tab
    for (const tab of attokTabs) {
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'CHECK_NOW' });
        
        if (response && response.success && response.students) {
          await updateStudentData(response.students);
          console.log(`[Attok Monitor] Updated data from tab ${tab.id}: ${response.students.length} students`);
        }
      } catch (error) {
        console.log(`[Attok Monitor] Could not check tab ${tab.id}:`, error.message);
      }
    }
    
    // Check for notifications
    await checkNotifications();
    
  } catch (error) {
    console.error('[Attok Monitor] Error in monitoring check:', error);
  }
}

// Update student data
async function updateStudentData(newStudents) {
  const currentTime = new Date().toISOString();
  const updatedStudents = [];
  
  // Update existing students or add new ones
  for (const newStudent of newStudents) {
    const existingStudent = studentData.find(s => s.name === newStudent.name);
    
    if (existingStudent) {
      // Keep existing start time
      updatedStudents.push({
        ...newStudent,
        startTime: existingStudent.startTime
      });
    } else {
      // New student - set start time
      updatedStudents.push({
        ...newStudent,
        startTime: currentTime
      });
      console.log(`[Attok Monitor] New student detected: ${newStudent.name}`);
    }
  }
  
  studentData = updatedStudents;
  
  // Save to storage
  await chrome.storage.local.set({ 
    studentData: studentData,
    lastUpdate: currentTime
  });
  
  // Notify popup
  try {
    chrome.runtime.sendMessage({
      type: 'STUDENT_DATA_UPDATE',
      students: studentData,
      timestamp: currentTime
    });
  } catch (error) {
    console.log('[Attok Monitor] Could not notify popup:', error.message);
  }
}

// Check for notifications (10 min warning and class end)
async function checkNotifications() {
  try {
    const result = await chrome.storage.local.get(['classDuration']);
    const classMinutes = result.classDuration || 90;
    const currentTime = new Date();
    
    for (const student of studentData) {
      const startTime = new Date(student.startTime);
      const elapsedMinutes = Math.floor((currentTime - startTime) / (1000 * 60));
      const remainingMinutes = classMinutes - elapsedMinutes;
      
      const studentKey = student.name;
      
      // 10-minute warning
      if (remainingMinutes <= 10 && remainingMinutes > 0 && !notifiedStudents.has(`${studentKey}_warning`)) {
        await sendNotification(
          '수업 종료 10분 전!',
          `${student.name} 학생의 수업이 ${remainingMinutes}분 후에 종료됩니다.`,
          'warning'
        );
        notifiedStudents.add(`${studentKey}_warning`);
        console.log(`[Attok Monitor] 10-minute warning sent for ${student.name}`);
      }
      
      // Class end notification
      if (remainingMinutes <= 0 && !notifiedStudents.has(`${studentKey}_end`)) {
        await sendNotification(
          '수업 종료!',
          `${student.name} 학생의 수업 시간이 완료되었습니다.`,
          'end'
        );
        notifiedStudents.add(`${studentKey}_end`);
        console.log(`[Attok Monitor] Class end notification sent for ${student.name}`);
      }
    }
  } catch (error) {
    console.error('[Attok Monitor] Error checking notifications:', error);
  }
}

// Send notification
async function sendNotification(title, message, type) {
  try {
    const notificationId = `attok_${type}_${Date.now()}`;
    
    await chrome.notifications.create(notificationId, {
      type: 'basic',
      title: title,
      message: message,
      priority: type === 'end' ? 2 : 1,
      requireInteraction: type === 'end'
    });
    
    console.log(`[Attok Monitor] Notification sent: ${title} - ${message}`);
    
    // Auto-clear notification after 5 seconds (except for class end)
    if (type !== 'end') {
      setTimeout(() => {
        chrome.notifications.clear(notificationId);
      }, 5000);
    }
  } catch (error) {
    console.error('[Attok Monitor] Error sending notification:', error);
  }
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Attok Monitor] Background received message:', request.type);
  
  if (request.type === 'TOGGLE_MONITORING') {
    if (request.isMonitoring) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
    sendResponse({ success: true, isMonitoring: isMonitoring });
  }
  
  else if (request.type === 'STUDENT_UPDATE') {
    // Handle student updates from content script
    updateStudentData(request.students || []);
    sendResponse({ success: true });
  }
  
  else if (request.type === 'GET_MONITORING_STATUS') {
    sendResponse({ isMonitoring: isMonitoring, studentCount: studentData.length });
  }
  
  return true; // Keep message channel open for async response
});

// Notify popup about status changes
function notifyStatusChange() {
  try {
    chrome.runtime.sendMessage({
      type: 'MONITORING_STATUS_CHANGED',
      isMonitoring: isMonitoring
    });
  } catch (error) {
    console.log('[Attok Monitor] Could not notify status change:', error.message);
  }
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  console.log('[Attok Monitor] Notification clicked:', notificationId);
  
  // Clear the notification
  chrome.notifications.clear(notificationId);
  
  // Focus on attok.co.kr tab if available
  chrome.tabs.query({ url: '*://*.attok.co.kr/*' }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.update(tabs[0].id, { active: true });
      chrome.windows.update(tabs[0].windowId, { focused: true });
    }
  });
});

// Clean up notifications periodically
setInterval(() => {
  // Remove old notification tracking (older than 4 hours)
  const currentTime = new Date();
  const fourHoursAgo = new Date(currentTime - 4 * 60 * 60 * 1000);
  
  // Clean up notification set if too large
  if (notifiedStudents.size > 100) {
    notifiedStudents.clear();
    console.log('[Attok Monitor] Cleared notification tracking set');
  }
}, 60 * 60 * 1000); // Run every hour

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('[Attok Monitor] Browser started, loading settings');
  loadSettings();
});

console.log('[Attok Monitor] Background script ready');