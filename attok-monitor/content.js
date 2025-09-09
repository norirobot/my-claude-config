// content.js - Detects sky blue boxes and extracts student names on attok.co.kr

console.log('[Attok Monitor] Content script loaded on', window.location.href);

// Sky blue color variations to detect
const SKYBLUE_COLORS = [
  'rgb(135, 206, 235)',     // Standard skyblue RGB
  'rgba(135, 206, 235',      // RGBA (partial match)
  '#87ceeb',                 // Skyblue hex
  '#87CEEB',                 // Uppercase hex
  'skyblue',                 // Color name
  'rgb(135, 206, 250)',      // Lighter skyblue
  'rgb(173, 216, 230)',      // Light blue
  '#add8e6',                 // Light blue hex
  'lightblue',               // Light blue name
  'rgb(176, 224, 230)',      // Powder blue
  '#b0e0e6',                 // Powder blue hex
  'powderblue'               // Powder blue name
];

// Function to check if element has sky blue background
function isSkyBlueBackground(element) {
  const computedStyle = window.getComputedStyle(element);
  const bgColor = computedStyle.backgroundColor.toLowerCase();
  const bgColorRaw = element.style.backgroundColor ? element.style.backgroundColor.toLowerCase() : '';
  const bgAttribute = element.getAttribute('bgcolor') ? element.getAttribute('bgcolor').toLowerCase() : '';
  
  // Check computed style
  for (const color of SKYBLUE_COLORS) {
    if (bgColor.includes(color.toLowerCase())) return true;
    if (bgColorRaw.includes(color.toLowerCase())) return true;
    if (bgAttribute.includes(color.toLowerCase())) return true;
  }
  
  // Check for similar RGB values (sky blue range)
  const rgbMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const [_, r, g, b] = rgbMatch.map(Number);
    // Sky blue range: R: 100-180, G: 180-230, B: 200-255
    if (r >= 100 && r <= 180 && g >= 180 && g <= 230 && b >= 200 && b <= 255) {
      console.log('[Attok Monitor] Found sky blue-like color:', bgColor);
      return true;
    }
  }
  
  return false;
}

// Function to extract Korean student name from element
function extractStudentName(element) {
  const text = element.textContent || element.innerText || '';
  
  // Korean name pattern (2-4 Korean characters)
  const koreanNamePattern = /[가-힣]{2,4}/g;
  const matches = text.match(koreanNamePattern);
  
  if (matches && matches.length > 0) {
    // Filter out common non-name Korean words
    const excludeWords = ['학생', '이름', '성명', '출석', '미출석', '번호', '시간', '날짜', '요일'];
    
    for (const match of matches) {
      if (!excludeWords.includes(match)) {
        return match;
      }
    }
  }
  
  return null;
}

// Function to find all attended students
function findAttendedStudents() {
  console.log('[Attok Monitor] Searching for attended students...');
  
  const attendedStudents = [];
  const checkedElements = new Set();
  
  // Check all table rows
  const allRows = document.querySelectorAll('tr, [bgcolor], td[bgcolor], td[style*="background"]');
  
  allRows.forEach(row => {
    if (checkedElements.has(row)) return;
    checkedElements.add(row);
    
    // Check if row or any of its cells have sky blue background
    let hasSkyblueBg = isSkyBlueBackground(row);
    
    if (!hasSkyblueBg) {
      // Check all cells in the row
      const cells = row.querySelectorAll('td, th');
      for (const cell of cells) {
        if (isSkyBlueBackground(cell)) {
          hasSkyblueBg = true;
          break;
        }
      }
    }
    
    if (hasSkyblueBg) {
      // Try to extract student name
      const studentName = extractStudentName(row);
      
      if (studentName) {
        console.log('[Attok Monitor] Found attended student:', studentName);
        attendedStudents.push({
          name: studentName,
          element: row,
          timestamp: new Date().toISOString(),
          backgroundColor: window.getComputedStyle(row).backgroundColor
        });
      }
    }
  });
  
  // Also check divs and other elements that might contain student info
  const allElements = document.querySelectorAll('*[style*="background"], *[bgcolor]');
  
  allElements.forEach(element => {
    if (checkedElements.has(element)) return;
    checkedElements.add(element);
    
    if (isSkyBlueBackground(element)) {
      const studentName = extractStudentName(element);
      
      if (studentName && !attendedStudents.find(s => s.name === studentName)) {
        console.log('[Attok Monitor] Found attended student (from element):', studentName);
        attendedStudents.push({
          name: studentName,
          element: element,
          timestamp: new Date().toISOString(),
          backgroundColor: window.getComputedStyle(element).backgroundColor
        });
      }
    }
  });
  
  console.log(`[Attok Monitor] Total attended students found: ${attendedStudents.length}`);
  return attendedStudents;
}

// Send student data to background script
function sendStudentData(students) {
  chrome.runtime.sendMessage({
    type: 'STUDENT_UPDATE',
    students: students.map(s => ({
      name: s.name,
      timestamp: s.timestamp
    })),
    url: window.location.href,
    timestamp: new Date().toISOString()
  }, response => {
    if (chrome.runtime.lastError) {
      console.error('[Attok Monitor] Error sending data:', chrome.runtime.lastError);
    } else {
      console.log('[Attok Monitor] Data sent successfully:', response);
    }
  });
}

// Main monitoring function
function monitorAttendance() {
  const students = findAttendedStudents();
  sendStudentData(students);
  return students;
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Attok Monitor] Received message:', request.type);
  
  if (request.type === 'CHECK_NOW') {
    const students = monitorAttendance();
    sendResponse({ 
      success: true, 
      students: students.map(s => ({
        name: s.name,
        timestamp: s.timestamp
      })),
      count: students.length 
    });
  } else if (request.type === 'GET_STATUS') {
    sendResponse({ 
      active: true, 
      url: window.location.href 
    });
  } else if (request.type === 'DEBUG_COLORS') {
    debugColors();
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});

// Debug function to log all background colors
function debugColors() {
  console.log('[Attok Monitor] === DEBUG: All Background Colors ===');
  
  const allElements = document.querySelectorAll('*');
  const colorMap = new Map();
  
  allElements.forEach(element => {
    const bgColor = window.getComputedStyle(element).backgroundColor;
    const bgAttribute = element.getAttribute('bgcolor');
    
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      const text = element.textContent ? element.textContent.substring(0, 50) : '';
      
      if (!colorMap.has(bgColor)) {
        colorMap.set(bgColor, []);
      }
      
      colorMap.get(bgColor).push({
        tagName: element.tagName,
        text: text,
        bgAttribute: bgAttribute
      });
    }
  });
  
  colorMap.forEach((elements, color) => {
    console.log(`Color: ${color}`);
    console.log('  Elements:', elements.slice(0, 3)); // Show first 3 elements
  });
  
  console.log('[Attok Monitor] === END DEBUG ===');
}

// Debug object for manual testing
window.debugAttok = {
  findStudents: findAttendedStudents,
  monitorNow: monitorAttendance,
  debugColors: debugColors,
  checkElement: (element) => {
    console.log('Background color:', window.getComputedStyle(element).backgroundColor);
    console.log('Is sky blue?', isSkyBlueBackground(element));
    console.log('Student name:', extractStudentName(element));
  },
  testColors: () => {
    console.log('Testing color detection...');
    const testDiv = document.createElement('div');
    document.body.appendChild(testDiv);
    
    const testColors = [
      'skyblue',
      'rgb(135, 206, 235)',
      '#87CEEB',
      'lightblue'
    ];
    
    testColors.forEach(color => {
      testDiv.style.backgroundColor = color;
      console.log(`${color}: ${isSkyBlueBackground(testDiv)}`);
    });
    
    document.body.removeChild(testDiv);
  }
};

// Auto-check on page load
setTimeout(() => {
  console.log('[Attok Monitor] Initial attendance check...');
  monitorAttendance();
}, 2000);

// Monitor DOM changes
const observer = new MutationObserver((mutations) => {
  // Debounce to avoid too many checks
  clearTimeout(window.attokMonitorTimeout);
  window.attokMonitorTimeout = setTimeout(() => {
    console.log('[Attok Monitor] DOM changed, rechecking...');
    monitorAttendance();
  }, 1000);
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['style', 'bgcolor', 'class']
});

console.log('[Attok Monitor] Content script ready. Use window.debugAttok for debugging.');