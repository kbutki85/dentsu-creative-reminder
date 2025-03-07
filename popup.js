document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements
  const elements = {
    reminderEnabled: document.getElementById('reminderEnabled'),
    reminderTime: document.getElementById('reminderTime'),
    testReminder: document.getElementById('testReminder'),
    status: document.getElementById('status'),
    save: document.getElementById('save')
  };

  // Load saved settings with default values
  chrome.storage.sync.get({
    reminderEnabled: true,
    reminderTime: '15:30'
  }, (settings) => {
    elements.reminderEnabled.checked = settings.reminderEnabled;
    elements.reminderTime.value = settings.reminderTime;
  });

  // Save settings handler
  elements.save.addEventListener('click', () => {
    const reminderEnabled = elements.reminderEnabled.checked;
    const reminderTime = elements.reminderTime.value;

    // Save to storage
    chrome.storage.sync.set({
      reminderEnabled,
      reminderTime
    }, () => {
      elements.status.textContent = 'Settings saved successfully!';
      elements.status.style.color = '#4CAF50'; // green color
      elements.status.classList.add('show');
      setTimeout(() => elements.status.classList.remove('show'), 2000);
    });
  });

  // Test reminder button handler
  elements.testReminder.addEventListener('click', () => {
    // Reset last reminder date
    chrome.storage.local.remove(['lastReminderDate'], () => {
      // Send test reminder
      chrome.runtime.sendMessage({ type: 'TEST_REMINDER' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Test reminder error:', chrome.runtime.lastError);
          elements.status.textContent = 'Error sending reminder!';
          elements.status.style.color = '#E74C3C'; // red color
        } else {
          console.log('Test reminder response:', response);
        }
      });
    });
    // Show test reminder notification
    elements.status.textContent = 'Test reminder sent!';
    elements.status.style.color = '#4CAF50'; // green color
    elements.status.classList.add('show');
    setTimeout(() => {
      elements.status.classList.remove('show');
    }, 3000);
  });
});
