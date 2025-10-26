// Background service worker for AI Audio Master

// Install event
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Audio Master extension installed');
  
  // Initialize default settings
  chrome.storage.sync.set({
    volume: 50,
    bass: 0,
    treble: 0,
    aiMode: false
  });
});

// Message listener for popup interactions
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateAudioSettings') {
    // Handle audio settings updates
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'getAudioSettings') {
    chrome.storage.sync.get(['volume', 'bass', 'treble', 'aiMode'], (settings) => {
      sendResponse({ settings });
    });
    return true;
  }
});

// Tab update listener
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Apply saved audio settings to newly loaded pages
    chrome.storage.sync.get(['volume', 'bass', 'treble'], (settings) => {
      chrome.tabs.sendMessage(tabId, {
        action: 'applyAudioSettings',
        settings: settings
      });
    });
  }
});
