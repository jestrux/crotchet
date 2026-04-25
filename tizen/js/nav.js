// nav.js — spatial navigation via js-spatial-navigation

var Nav = (function () {
  var SN = null;
  var DEFAULT_ICON = 'M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z';

  function init() {
    SN = window.SpatialNavigation;
    SN.init();

    SN.set({
      navigableFilter: function (elem) {
        var screen = elem.closest && elem.closest('.screen');
        if (screen && !screen.classList.contains('active')) return false;
        if (elem.closest && elem.closest('#side-rail')) {
          var home = document.getElementById('home-screen');
          if (!home || !home.classList.contains('active')) return false;
        }
        return true;
      }
    });

    SN.add({
      id: 'rail',
      selector: '.rail-item',
      enterTo: 'last-focused',
      restrict: 'self-first',
    });

    SN.add({
      id: 'home-grid',
      selector: '#home-scroll .card',
      enterTo: 'last-focused',
      restrict: 'self-first',
    });

    SN.add({
      id: 'player-controls',
      selector: '#player-restart-btn, #skip-back-btn, #play-pause-btn, #skip-fwd-btn, #crop-btn',
      restrict: 'self-only',
      enterTo: 'default-element',
      defaultElement: '#play-pause-btn',
      leaveFor: { up: '@player-seek', down: '', left: '', right: '' },
    });

    SN.add({
      id: 'player-seek',
      selector: '#player-progress-bar',
      restrict: 'self-only',
      leaveFor: { down: '@player-controls', up: '', left: '', right: '' },
    });

    SN.makeFocusable();

    document.addEventListener('sn:focused', function (e) {
      if (e.target.classList.contains('card')) scrollIntoView(e.target);
    });

    document.addEventListener('keydown', handleCustomKeys);
  }

  function handleCustomKeys(e) {
    var code = e.keyCode || e.which;
    var onPlayer = document.getElementById('player-screen').classList.contains('active');
    var onPreview = document.getElementById('preview-screen').classList.contains('active');

    // ── Player ──────────────────────────────────────────────────────────
    if (onPlayer) {
      // Arrow keys
      if (code >= 37 && code <= 40) {
        var overlayVisible = document.getElementById('player-overlay').classList.contains('visible');
        if (!overlayVisible) {
          // Overlay hidden: show it, don't let SN navigate
          e.preventDefault();
          e.stopPropagation();
          YoutubePlayer.showOverlay();
          return;
        }
        // Seek bar focused: handle left/right as seek, up as hide overlay
        var seekFocused = document.activeElement && document.activeElement.id === 'player-progress-bar';
        if (seekFocused) {
          if (code === 37) { e.preventDefault(); e.stopPropagation(); YoutubePlayer.seek(-2); return; }
          if (code === 39) { e.preventDefault(); e.stopPropagation(); YoutubePlayer.seek(2);  return; }
          if (code === 38) { e.preventDefault(); e.stopPropagation(); YoutubePlayer.hideOverlay(); return; }
          // Down: let SN handle (goes to player-controls)
          return;
        }
        // Controls focused: reset the auto-hide timer, let SN navigate between buttons
        YoutubePlayer.showOverlay();
        return;
      }

      // Back / Escape
      if (e.key === 'Escape' || code === 10009 || e.key === 'Backspace') {
        e.preventDefault();
        YoutubePlayer.stop();
        SN.resume();
        Router.navigate('home');
        return;
      }

      // Media keys
      if (code === 415 || code === 19 || code === 179) {
        e.preventDefault();
        var btn = document.getElementById('play-pause-btn');
        if (btn) btn.click();
        return;
      }
      if (code === 417) { e.preventDefault(); YoutubePlayer.seek(30);  return; }
      if (code === 412) { e.preventDefault(); YoutubePlayer.seek(-10); return; }

      return;
    }

    if (onPreview) {
      if (e.key === 'Escape' || code === 10009 || e.key === 'Backspace') {
        e.preventDefault();
        SN.resume();
        Router.navigate('home');
        return;
      }
      return;
    }

    // ── Home screen Up handling ───────────────────────────────────────────
    var onHome = document.getElementById('home-screen').classList.contains('active');
    if (onHome && code === 38) {
      var focused = document.activeElement;
      // Up from search input → move to first card
      if (focused && focused.id === 'search-input') {
        e.preventDefault();
        SN.resume();
        var firstCard2 = document.querySelector('#home-scroll .card');
        if (firstCard2) firstCard2.focus();
        return;
      }
      // Up from first row of cards → move to search input
      if (focused && focused.classList.contains('card')) {
        var firstCard = document.querySelector('#home-scroll .card');
        if (firstCard && Math.abs(focused.getBoundingClientRect().top - firstCard.getBoundingClientRect().top) < 10) {
          e.preventDefault();
          var searchInput = document.getElementById('search-input');
          if (searchInput) searchInput.focus();
          return;
        }
      }
    }

    // ── Non-player Back ──────────────────────────────────────────────────
    var searchFocused = document.activeElement && document.activeElement.id === 'search-input';
    if ((e.key === 'Escape' || code === 10009 || (e.key === 'Backspace' && !searchFocused))) {
      e.preventDefault();
      if (onHome) {
        SN.makeFocusable('rail');
        var activeRailBtn = document.querySelector('#rail-pages .rail-item.active') ||
                            document.querySelector('#rail-pages .rail-item');
        if (activeRailBtn) activeRailBtn.focus();
      }
    }
  }

  function scrollIntoView(el) {
    var scrollEl = document.getElementById('home-scroll');
    if (!scrollEl) return;
    var r  = el.getBoundingClientRect();
    var sr = scrollEl.getBoundingClientRect();
    var margin = 60;
    if (r.top < sr.top + margin)            scrollEl.scrollTop -= (sr.top + margin - r.top);
    else if (r.bottom > sr.bottom - margin) scrollEl.scrollTop += (r.bottom - (sr.bottom - margin));
  }

  function buildRail(pages) {
    var container = document.getElementById('rail-pages');
    if (!container) return;

    // Remember which page is active before rebuilding
    var activeName = null;
    var activeBtn = container.querySelector('.rail-item.active');
    if (activeBtn) activeName = activeBtn.dataset.pageName;

    container.innerHTML = '';

    (pages || []).forEach(function (page, idx) {
      var btn = document.createElement('button');
      btn.className = 'rail-item';
      btn.tabIndex = 0;
      btn.dataset.focusId = 'rail-page-' + page.name;
      btn.dataset.pageName = page.name;

      var iconSpan = document.createElement('span');
      iconSpan.className = 'rail-icon';
      iconSpan.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' +
        (page.icon || DEFAULT_ICON) + '"/></svg>';

      var labelSpan = document.createElement('span');
      labelSpan.className = 'rail-label';
      labelSpan.textContent = page.label || page.name;

      btn.appendChild(iconSpan);
      btn.appendChild(labelSpan);

      btn.addEventListener('click', function () {
        container.querySelectorAll('.rail-item').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        Home.loadPage(page);
        // Move focus into the grid
        setTimeout(function () {
          var first = document.querySelector('#home-scroll .card');
          if (first) first.focus();
        }, 120);
      });

      if (page.name === activeName || (!activeName && idx === 0)) {
        btn.classList.add('active');
      }

      container.appendChild(btn);
    });

    if (SN) SN.makeFocusable('rail');
  }

  function getActivePage() {
    var btn = document.querySelector('#rail-pages .rail-item.active');
    return btn ? btn.dataset.pageName : null;
  }

  function makeFocusable(sectionId) { if (SN) SN.makeFocusable(sectionId); }
  function focus(sectionId)         { if (SN) SN.focus(sectionId); }
  function pause()                  { if (SN) SN.pause(); }
  function resume()                 { if (SN) SN.resume(); }

  return { init: init, buildRail: buildRail, getActivePage: getActivePage, makeFocusable: makeFocusable, focus: focus, pause: pause, resume: resume };
})();
