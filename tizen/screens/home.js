// home.js — page viewer

var Home = (function () {
  var currentPage   = null;
  var allItems      = [];
  var lastPlayedId  = null;

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function cardFocusId(item, sectionName) {
    var id = item._id || item.title || Math.random();
    return 'card-' + sectionName + '-' + String(id).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  }

  function makeCard(item, sectionName, isFirst) {
    var btn = document.createElement('button');
    btn.className = 'card';
    btn.tabIndex = 0;
    btn.dataset.focusId = cardFocusId(item, sectionName);
    if (isFirst) btn.setAttribute('data-default-focus', '1');

    var media = document.createElement('div');
    media.className = 'card-media';

    var thumb = item.image || item.video;
    if (thumb) {
      var img = document.createElement('img');
      img.src = thumb;
      img.alt = '';
      img.loading = 'lazy';
      media.appendChild(img);
    } else {
      var placeholder = document.createElement('div');
      placeholder.className = 'card-placeholder';
      media.appendChild(placeholder);
    }

    var info = document.createElement('div');
    info.className = 'card-info';
    info.innerHTML =
      '<div class="card-title">' + escapeHtml(item.title) + '</div>' +
      (item.subtitle ? '<div class="card-meta">' + escapeHtml(item.subtitle) + '</div>' : '');

    btn.appendChild(media);
    btn.appendChild(info);

    btn.addEventListener('click', function () {
      if (!item.url) return;
      lastPlayedId = btn.dataset.focusId;
      openUrl(item.url, item);
    });

    return btn;
  }

  function showSkeleton() {
    var scroll = document.getElementById('home-scroll');
    scroll.innerHTML = '';
    var section = document.createElement('div');
    section.className = 'section';
    var titleBar = document.createElement('div');
    titleBar.className = 'skeleton-title';
    section.appendChild(titleBar);
    var row = document.createElement('div');
    row.className = 'grid';
    for (var i = 0; i < 3; i++) {
      var card = document.createElement('div');
      card.className = 'skeleton-card';
      var cardMedia = document.createElement('div');
      cardMedia.className = 'skeleton-card-media';
      var cardLine = document.createElement('div');
      cardLine.className = 'skeleton-card-line';
      card.appendChild(cardMedia);
      card.appendChild(cardLine);
      row.appendChild(card);
    }
    section.appendChild(row);
    scroll.appendChild(section);
  }

  function renderPage(page, isUpdate) {
    currentPage = page;
    allItems = (page && page.items) || [];

    var scroll = document.getElementById('home-scroll');
    var active = document.activeElement;
    var savedFocusId = active && active.dataset ? active.dataset.focusId : null;

    scroll.innerHTML = '';

    if (!allItems.length) {
      scroll.innerHTML = '<div class="center-msg"><span>No items</span></div>';
      return;
    }

    var grid = document.createElement('div');
    grid.className = 'grid';
    allItems.forEach(function (item, idx) {
      grid.appendChild(makeCard(item, page.name, idx === 0));
    });
    scroll.appendChild(grid);

    if (window.Nav) Nav.makeFocusable('home-grid');

    if (!isUpdate) {
      var first = scroll.querySelector('[data-default-focus]');
      if (first) setTimeout(function () { first.focus(); }, 80);
    } else if (savedFocusId) {
      var target = scroll.querySelector('[data-focus-id="' + savedFocusId + '"]');
      if (target) setTimeout(function () { target.focus(); }, 80);
    }
  }

  function renderSearch(query) {
    var scroll = document.getElementById('home-scroll');

    if (!query.trim()) {
      renderPage(currentPage, false);
      return;
    }

    var q = query.toLowerCase().trim();
    var matches = allItems.filter(function (item) {
      return (item.title || '').toLowerCase().indexOf(q) !== -1;
    });

    scroll.innerHTML = '';

    if (!matches.length) {
      scroll.innerHTML = '<div class="center-msg"><span>No results for &ldquo;' + escapeHtml(query) + '&rdquo;</span></div>';
      return;
    }

    var grid = document.createElement('div');
    grid.className = 'grid';
    matches.forEach(function (item, idx) {
      grid.appendChild(makeCard(item, 'search', idx === 0));
    });
    scroll.appendChild(grid);
    if (window.Nav) Nav.makeFocusable('home-grid');
  }

  function clearSearch() {
    var input = document.getElementById('search-input');
    if (input) input.value = '';
    renderPage(currentPage, false);
  }

  function loadPage(page) {
    renderPage(page, false);
    var input = document.getElementById('search-input');
    if (input) input.value = '';
    if (lastPlayedId) {
      var target = document.querySelector('[data-focus-id="' + lastPlayedId + '"]');
      if (target) setTimeout(function () { target.focus(); }, 80);
      lastPlayedId = null;
    }
  }

  function init() {
    var input = document.getElementById('search-input');
    if (!input) return;

    input.addEventListener('focus', function () {
      if (window.Nav) Nav.pause();
    });

    input.addEventListener('blur', function () {
      if (window.Nav) Nav.resume();
    });

    input.addEventListener('input', function () {
      renderSearch(input.value);
    });

    var form = document.getElementById('search-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (window.Nav) Nav.resume();
        var first = document.querySelector('#home-scroll .card');
        if (first) first.focus();
      });
    }

    input.addEventListener('keydown', function (e) {
      var code = e.keyCode || e.which;
      // ArrowDown or Enter → jump into first card
      if (code === 40 || code === 13) {
        e.preventDefault();
        if (window.Nav) Nav.resume();
        var first = document.querySelector('#home-scroll .card');
        if (first) first.focus();
        return;
      }
      // Back (TV remote or Escape) → clear search if needed, land on first card
      if (e.key === 'Escape' || code === 10009) {
        e.preventDefault();
        e.stopPropagation(); // nav.js must not double-handle this
        input.value = '';
        renderPage(currentPage, false);
        if (window.Nav) Nav.resume();
        setTimeout(function () {
          var first = document.querySelector('#home-scroll [data-default-focus]') ||
                      document.querySelector('#home-scroll .card');
          if (first) first.focus();
        }, 80);
      }
    });
  }

  Store.onUpdate(function (pages) {
    if (window.Nav) Nav.buildRail(pages);
    // Refresh current page's items if it's being viewed
    var homeScreen = document.getElementById('home-screen');
    if (!homeScreen || !homeScreen.classList.contains('active')) return;
    var input = document.getElementById('search-input');
    if (input && input.value.trim()) return; // don't clobber live search
    if (!currentPage) return;
    var updated = pages.find(function (p) { return p.name === currentPage.name; });
    if (updated) renderPage(updated, true);
  });

  return { loadPage: loadPage, showSkeleton: showSkeleton, init: init, clearSearch: clearSearch };
})();
