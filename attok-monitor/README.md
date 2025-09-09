# Attok Monitor Chrome Extension

A Chrome extension for monitoring student attendance on attok.co.kr by detecting sky blue background elements and extracting Korean student names.

## Features

- **Automatic Detection**: Detects sky blue background elements containing student names
- **Real-time Monitoring**: Monitors attendance every 30 seconds when enabled
- **Timer Functionality**: Tracks remaining class time (default 90 minutes)
- **Notifications**: Alerts 10 minutes before class ends and when class ends
- **Persistent Storage**: Maintains student data across browser sessions
- **Debug Tools**: Built-in debugging functions for troubleshooting

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the `attok-monitor` folder
4. The extension will appear in your extensions list

## Usage

1. **Navigate to attok.co.kr**: Open the attendance page on attok.co.kr
2. **Open Extension**: Click the Attok Monitor extension icon in Chrome toolbar
3. **Start Monitoring**: Click "모니터링 시작" button
4. **Manual Check**: Use "지금 확인" button for immediate attendance check

## File Structure

```
attok-monitor/
├── manifest.json     # Extension configuration
├── popup.html        # Extension popup interface
├── popup.js         # Popup control logic
├── background.js    # Background monitoring service
├── content.js       # Sky blue detection and name extraction
└── README.md        # This file
```

## Debugging

### If sky blue detection isn't working:
1. Open browser console on attok.co.kr page
2. Type `window.debugAttok.testColors()` to test color detection
3. Type `window.debugAttok.debugColors()` to see all page colors

### If student names aren't extracted:
1. Type `window.debugAttok.findStudents()` in console
2. Check console output for detected elements
3. Use `window.debugAttok.checkElement(element)` on specific elements

### If notifications don't work:
1. Check browser notification permissions
2. Look for console errors in background script
3. Verify alarm permissions are granted

## Technical Details

### Sky Blue Detection
The extension detects multiple sky blue color formats:
- RGB: `rgb(135, 206, 235)`
- RGBA: `rgba(135, 206, 235, ...)`
- Hex: `#87CEEB`
- Color names: `skyblue`, `lightblue`, `powderblue`
- Similar colors in RGB range: R:100-180, G:180-230, B:200-255

### Korean Name Extraction
- Uses regex pattern: `/[가-힣]{2,4}/g`
- Filters out common non-name words: '학생', '이름', '성명', etc.
- Searches within table rows and background-colored elements

### Monitoring Schedule
- **Automatic**: Every 30 seconds when monitoring is enabled
- **Manual**: On-demand via "지금 확인" button
- **Notifications**: 10 minutes before end and at class end time

## Permissions

- `tabs`: Access tab information and communicate with content scripts
- `storage`: Store student data and settings
- `notifications`: Send desktop notifications
- `alarms`: Schedule periodic monitoring checks
- `activeTab`: Access current active tab
- `host_permissions`: Access attok.co.kr domain

## Settings

- **Class Duration**: Adjustable from 30-180 minutes (default: 90 minutes)
- **Monitoring Status**: Toggle automatic monitoring on/off
- **Persistent Data**: Student start times saved across sessions

## Troubleshooting

### Extension not working:
1. Refresh the attok.co.kr page
2. Reload the extension in `chrome://extensions/`
3. Check console for error messages

### No students detected:
1. Ensure you're on the correct attendance page
2. Verify elements have sky blue backgrounds
3. Use debugging tools to inspect page structure

### Notifications not showing:
1. Check Chrome notification permissions
2. Ensure notifications are enabled for the extension
3. Try clicking a test notification

## Version History

**v1.0.0**
- Initial release
- Sky blue box detection
- Korean name extraction
- 90-minute timer
- Background monitoring
- Desktop notifications