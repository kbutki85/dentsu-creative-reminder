// Background script for Dentsu Creative Reminder

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  // Set up reminder alarm on installation/update
  chrome.alarms.create('reminderAlarm', {
    periodInMinutes: 1
  });
  
  // Reset last reminder date to enable receiving it today
  const resetDate = new Date();
  resetDate.setDate(resetDate.getDate() - 1); // yesterday
  chrome.storage.local.set({ lastReminderDate: resetDate.toDateString() });
});

// Function to display reminder
function showReminder() {
  try {
    chrome.notifications.create('tempo-reminder', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: 'Time Logging Reminder',
      message: 'Remember to log your work time in Tempo!',
      buttons: [
        { title: 'Open Tempo' }
      ],
      priority: 2
    });
    
    // Alternative method - open reminder popup
    chrome.tabs.create({
      url: chrome.runtime.getURL('reminder.html'),
      active: true
    });
  } catch (error) {
    console.error('Error showing reminder:', error);
  }
}

// Handle alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'reminderAlarm') {
    checkTimeForReminder();
  }
});

// Set up alarm every minute
chrome.alarms.create('reminderAlarm', {
  periodInMinutes: 1
});

// Function to check time
async function checkTimeForReminder() {
  const today = new Date();
  const dateString = today.toDateString();
  
  // Check if we already showed reminder today
  const result = await chrome.storage.local.get(['lastReminderDate']);
  if (result.lastReminderDate === dateString) {
    return;
  }
  
  // Get reminder settings
  const settings = await chrome.storage.sync.get(['reminderEnabled', 'reminderTime']);
  if (!settings.reminderEnabled) return;
  
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // Parse reminder time (format "HH:MM")
  const [reminderHours, reminderMinutes] = settings.reminderTime.split(':').map(Number);
  
  // Check if it's time for reminder
  if (currentHours === reminderHours && 
      currentMinutes >= reminderMinutes && 
      currentMinutes < reminderMinutes + 5) {
    // Show reminder
    showReminder();
    
    // Save reminder display date
    chrome.storage.local.set({ lastReminderDate: dateString });
  }
}

// Handle notification button click
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId === 'tempo-reminder' && buttonIndex === 0) {
    // Open Tempo in new tab
    chrome.tabs.create({ url: 'https://dentsu-poland.atlassian.net/plugins/servlet/ac/io.tempo.jira/tempo-app#!/my-work/week?type=TIME' });
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle test reminder
  if (message.type === 'TEST_REMINDER') {
    showReminder();
    sendResponse({ success: true, message: 'Test notification sent' });
    return true;
  }

  // Handle reminder tab closing
  if (message.type === 'CLOSE_CURRENT_TAB') {
    chrome.tabs.remove(sender.tab.id);
  }
});