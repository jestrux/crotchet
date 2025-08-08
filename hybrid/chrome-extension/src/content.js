// Crotchet Extension Content Script
(() => {
  console.log("Crotchet content script loaded on:", window.location.hostname);
  
  // Track if desktop app is available
  let desktopAppAvailable = false;
  
  // Listen for messages from popup/service worker
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Content script received message:", message);
    
    switch (message.type) {
      case "CHECK_DESKTOP_APP":
        sendResponse({ available: desktopAppAvailable });
        break;
        
      case "EXTRACT_PAGE_DATA":
        // Extract useful page data for desktop app
        const pageData = {
          title: document.title,
          url: window.location.href,
          selectedText: window.getSelection().toString(),
          metadata: {
            description: document.querySelector('meta[name="description"]')?.content,
            keywords: document.querySelector('meta[name="keywords"]')?.content,
          }
        };
        sendResponse(pageData);
        break;
        
      default:
        sendResponse({ status: "unknown_message" });
    }
    
    return true;
  });
  
  // Detect if desktop app is available via protocol handler
  function checkDesktopApp() {
    try {
      // Attempt to create a link with the custom protocol
      const link = document.createElement('a');
      link.href = 'crochet-app-hybrid://ping';
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Remove the link immediately
      document.body.removeChild(link);
      
      // For now, assume not available (would need more sophisticated detection)
      desktopAppAvailable = false;
    } catch (error) {
      console.log("Desktop app not detected:", error);
      desktopAppAvailable = false;
    }
  }
  
  // Check for desktop app availability on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkDesktopApp);
  } else {
    checkDesktopApp();
  }
  
  // Optional: Add keyboard shortcut listener for quick actions
  document.addEventListener('keydown', (event) => {
    // Ctrl+Shift+C or Cmd+Shift+C to send to desktop app
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
      console.log("Quick shortcut triggered - send to desktop");
      
      chrome.runtime.sendMessage({
        type: "SEND_TO_DESKTOP",
        data: {
          url: window.location.href,
          title: document.title,
          selectedText: window.getSelection().toString()
        }
      });
      
      event.preventDefault();
    }
  });
  
  console.log("Crotchet content script initialized");
})();
