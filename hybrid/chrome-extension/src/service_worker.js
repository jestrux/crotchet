// Crotchet Extension Service Worker
console.log("Crotchet extension service worker loaded");

// Installation handler
self.addEventListener("install", () => {
  console.log("Crotchet extension installed");
  self.skipWaiting();
});

// Activation handler  
self.addEventListener("activate", () => {
  console.log("Crotchet extension activated");
  return self.clients.claim();
});

// Message handler for communication with popup/content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Service worker received message:", message);
  
  switch (message.type) {
    case "PING":
      sendResponse({ status: "pong" });
      break;
      
    case "OPEN_DESKTOP_APP":
      // Placeholder for triggering desktop app
      console.log("Request to open desktop app");
      sendResponse({ status: "not_implemented" });
      break;
      
    default:
      console.log("Unknown message type:", message.type);
      sendResponse({ status: "unknown_message" });
  }
  
  return true; // Keep message channel open for async response
});

// Context menu setup (placeholder for future functionality)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "crotchet-send-to-desktop",
    title: "Send to Crotchet",
    contexts: ["selection", "link"]
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "crotchet-send-to-desktop") {
    console.log("Context menu clicked:", info);
    // Placeholder: send selected text/link to desktop app
  }
});
