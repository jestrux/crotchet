document.addEventListener("DOMContentLoaded", async () => {
  const themeToggle = document.getElementById("theme-toggle");
  const installButton = document.getElementById("install");
  
  // Load saved theme
  const result = await chrome.storage.local.get(['theme']);
  const savedTheme = result.theme || 'light';
  themeToggle.value = savedTheme;
  applyTheme(savedTheme);
  
  // Theme toggle handler
  themeToggle.addEventListener("change", async (e) => {
    const theme = e.target.value;
    await chrome.storage.local.set({ theme });
    applyTheme(theme);
  });
  
  // Install button handler (placeholder)
  installButton.addEventListener("click", () => {
    console.log("Install desktop app clicked");
    // Future: trigger desktop app installation or deep link
  });
});

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}
