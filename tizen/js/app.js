// app.js — boot sequence

(function () {
  var setupScreen = document.getElementById('setup-screen');
  var setupForm = document.getElementById('setup-form');
  var setupInput = document.getElementById('setup-input');
  var setupBtn = document.getElementById('setup-btn');
  var setupMsg = document.getElementById('setup-msg');
  var appEl = document.getElementById('app');

  function bootApp() {
    Store.init();
    setupScreen.style.display = 'none';
    appEl.style.display = '';

    Router.register('home', document.getElementById('home-screen'), {
      onEnter: function () {},
      onLeave: function () {}
    });

    Router.register('preview', document.getElementById('preview-screen'), {
      onEnter: function (item) {
        if (window.Nav) Nav.pause();
        Preview.show(item);
      },
      onLeave: function () {
        if (window.Nav) Nav.resume();
      }
    });

    Router.register('youtubePlayer', document.getElementById('player-screen'), {
      onEnter: function (item) {
        if (window.Nav) Nav.pause();
        YoutubePlayer.play(item);
      },
      onLeave: function () {
        YoutubePlayer.stop();
        if (window.Nav) Nav.resume();
      }
    });

    Router.init();
    Nav.init();
    Home.init();
    Router.navigate('home');

    Home.showSkeleton();
    Store.getPages().then(function (pages) {
      Nav.buildRail(pages);
      if (pages && pages.length) {
        Home.loadPage(pages[0]);
      } else {
        var scroll = document.getElementById('home-scroll');
        if (scroll) scroll.innerHTML = '<div class="center-msg"><span>No pages available</span></div>';
      }
    });

    if (window.tizen && window.tizen.tvinputdevice) {
      var keys = ['MediaPlayPause', 'MediaPlay', 'MediaPause', 'MediaStop', 'MediaFastForward', 'MediaRewind'];
      keys.forEach(function (k) { try { tizen.tvinputdevice.registerKey(k); } catch (e) {} });
    }
  }

  function showSetup(msg) {
    setupMsg.textContent = msg || 'Enter your Crotchet desktop IP to connect.';
    setupMsg.classList.remove('error');
    setupScreen.style.display = '';
    appEl.style.display = 'none';
    var saved = Store.getHost().replace(':3127', '');
    setupInput.value = saved;
    setTimeout(function () { setupInput.focus(); }, 100);
  }

  async function tryConnect(host) {
    setupBtn.disabled = true;
    setupBtn.textContent = 'Connecting…';
    Store.setHost(host);
    var ok = await Store.ping();
    setupBtn.disabled = false;
    setupBtn.textContent = 'Connect';
    if (ok) {
      bootApp();
    } else {
      setupMsg.textContent = 'Could not reach ' + host + '. Check the address and try again.';
      setupMsg.classList.add('error');
    }
  }

  setupForm.addEventListener('submit', function () {
    var host = setupInput.value.trim();
    if (!host) return;
    setupMsg.classList.remove('error');
    tryConnect(host);
  });

  appEl.style.display = 'none';
  var saved = Store.getHost();
  Store.setHost(saved);
  setupScreen.style.display = 'none';
  Store.ping().then(function (ok) {
    if (ok) {
      bootApp();
    } else {
      showSetup('Could not reach the server. Check the address and try again.');
    }
  });
})();
