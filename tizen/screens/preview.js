// preview.js — fullscreen image/media preview screen

var Preview = (function () {

  function show(item) {
    var screen = document.getElementById('preview-screen');
    var img = document.getElementById('preview-img');
    var title = document.getElementById('preview-title');
    var subtitle = document.getElementById('preview-subtitle');

    // Show color placeholder immediately while image loads
    if (screen && item.color) screen.style.background = item.color;
    if (img) {
      img.style.opacity = '0';
      img.onload = function () {
        img.style.opacity = '1';
        if (screen) screen.style.background = '#000';
      };
      img.src = item.image || '';
      img.alt = item.title || '';
    }
    if (title) title.textContent = item.title || '';
    if (subtitle) subtitle.textContent = item.subtitle || '';
  }

  return { show: show };
})();
