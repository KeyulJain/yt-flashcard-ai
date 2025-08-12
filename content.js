console.log('Content script loaded');
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getTranscript') {
    // Example: Stubbed transcript
    const transcript = document.body.innerText; // Replace with actual transcript extraction
    sendResponse({ transcript });
  }
});
