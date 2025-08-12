chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    flashcards: [],
    settings: {
      autoGenerateFlashcards: false,
      maxFlashcardsPerVideo: 10,
      reminderNotifications: true,
      studyGoalPerDay: 20,
      preferredLanguage: 'en',
      difficultyAlgorithm: 'sm2'
    }
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'generateFlashcards') {
    (async () => {
      try {
        const response = await fetch('http://127.0.0.1:5050/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: msg.transcript })
        });

        const data = await response.json();

        // If data.flashcards is already an array, use it directly:
        const cards = Array.isArray(data.flashcards) ? data.flashcards : [];
        
        chrome.storage.local.get('flashcards', ({ flashcards }) => {
          const updated = [...(flashcards || []), ...cards];
          chrome.storage.local.set({ flashcards: updated }, () => {
            sendResponse({ success: true, count: cards.length });
          });
        });
        return true;        

      } catch (err) {
        console.error('Flashcard generation failed:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();

    // Return true to indicate async sendResponse
    return true;
  }
});
