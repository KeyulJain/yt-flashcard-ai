document.getElementById('generate').addEventListener('click', () => {  
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { action: 'getTranscript' }, (response) => {
      console.log('Transcript response:', response);
      chrome.runtime.sendMessage({ action: 'generateFlashcards', transcript: response.transcript }, (res) => {
        console.log('Background response:', res);
        if (res.success) alert(`${res.count} flashcards created!`);
        else alert('Error: ' + res.error);
      });
    });
  });
});

function loadFlashcards() {
  chrome.storage.local.get('flashcards', ({ flashcards }) => {
    const container = document.getElementById('cards');
    container.innerHTML = '';
    flashcards.forEach((card, i) => {
      const el = document.createElement('div');
      el.className = 'card';
      el.innerHTML = `<b>Q:</b> ${card.question}<br/><b>A:</b> ${card.answer}`;
      container.appendChild(el);
    });
  });
}

loadFlashcards();
