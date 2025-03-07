document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('openTempo').addEventListener('click', function() {
    // Open Tempo in a new tab
    const tempoUrl = 'https://dentsu-poland.atlassian.net/plugins/servlet/ac/io.tempo.jira/tempo-app#!/my-work/week?type=TIME';
    chrome.tabs.create({ url: tempoUrl });
    // Close reminder tab
    window.close();
  });
  
  document.getElementById('closeBtn').addEventListener('click', function() {
    // Get current tab ID and close it
    chrome.tabs.getCurrent(function(tab) {
      if (tab) {
        chrome.tabs.remove(tab.id);
      } else {
        // Fallback if API fails
        window.close();
      }
    });
  });
}); 