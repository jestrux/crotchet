// player.js — base player factory
// Individual players (YoutubePlayer, etc.) call BasePlayer.create(config) with
// their DOM refs and capability hooks. Controls are shown/hidden based on which
// hooks are provided.

var BasePlayer = (function () {

  function create(config) {
    // Required config:
    //   video, overlayEl, spinnerEl, stepEl, titleEl, statusEl,
    //   timeCurEl, timeTotEl, fillEl, handleEl,
    //   playIconEl, pauseIconEl, playBtn, progressBar, backBtn
    //   onLoad(item, { showError, onReady }) — player-specific loading logic
    //
    // Optional hooks (button hidden if not provided):
    //   onSkipBack()    onSkipForward()    onRestart()    onToggleCrop()
    //
    // Optional loop bounds (defaults to 0 / video.duration):
    //   getLoopStart()  getLoopEnd()
    //
    // Optional lifecycle:
    //   onTimeUpdate() — called each timeupdate before progress is recalculated

    var overlayTimer = null;
    var bufferTimer  = null;
    var seekTimer    = null;
    var seekTarget   = null;
    var isSeeking    = false;

    var video     = config.video;
    var overlayEl = config.overlayEl;
    var spinnerEl = config.spinnerEl;
    var stepEl    = config.stepEl;
    var titleEl   = config.titleEl;
    var statusEl  = config.statusEl;
    var timeCurEl = config.timeCurEl;
    var timeTotEl = config.timeTotEl;
    var fillEl    = config.fillEl;
    var handleEl  = config.handleEl;
    var playIconEl  = config.playIconEl;
    var pauseIconEl = config.pauseIconEl;
    var playBtn   = config.playBtn;

    function getLoopStart() {
      return config.getLoopStart ? config.getLoopStart() : 0;
    }

    function getLoopEnd() {
      return config.getLoopEnd ? config.getLoopEnd() : video.duration;
    }

    function formatTime(s) {
      if (!s || isNaN(s) || s < 0) return '0:00';
      s = Math.floor(s);
      var m = Math.floor(s / 60);
      var sec = String(s % 60).padStart(2, '0');
      return m + ':' + sec;
    }

    function updateProgress() {
      if (isSeeking || !video.duration) return;
      var start   = getLoopStart();
      var end     = getLoopEnd();
      var elapsed = Math.max(0, video.currentTime - start);
      var total   = end - start;
      var pct     = total > 0 ? (elapsed / total * 100).toFixed(1) : '0.0';
      if (timeCurEl) timeCurEl.textContent = formatTime(elapsed);
      if (timeTotEl) timeTotEl.textContent = formatTime(total);
      if (fillEl)    fillEl.style.width    = pct + '%';
      if (handleEl)  handleEl.style.left   = pct + '%';
    }

    function updatePlayIcon() {
      if (!playIconEl || !pauseIconEl) return;
      playIconEl.style.display  = video.paused ? '' : 'none';
      pauseIconEl.style.display = video.paused ? 'none' : '';
    }

    function showOverlay() {
      var wasHidden = !overlayEl.classList.contains('visible');
      overlayEl.classList.add('visible');
      clearTimeout(overlayTimer);
      if (video.readyState >= 3) {
        overlayTimer = setTimeout(function () {
          overlayEl.classList.remove('visible');
          if (window.Nav) Nav.pause();
        }, 4000);
      }
      if (window.Nav) Nav.resume();
      if (wasHidden && playBtn) setTimeout(function () { playBtn.focus(); }, 50);
    }

    function hideOverlay() {
      if (video.readyState < 3) return;
      clearTimeout(overlayTimer);
      overlayEl.classList.remove('visible');
      if (window.Nav) Nav.pause();
    }

    function seek(seconds) {
      isSeeking  = true;
      var base   = seekTarget !== null ? seekTarget : video.currentTime;
      seekTarget = Math.max(getLoopStart(), Math.min(base + seconds, getLoopEnd()));
      var elapsed = Math.max(0, seekTarget - getLoopStart());
      var total   = getLoopEnd() - getLoopStart();
      var pct     = total > 0 ? (elapsed / total * 100).toFixed(1) : '0.0';
      if (timeCurEl) timeCurEl.textContent = formatTime(elapsed);
      if (fillEl)    fillEl.style.width    = pct + '%';
      if (handleEl)  handleEl.style.left   = pct + '%';
      showOverlay();
      clearTimeout(seekTimer);
      seekTimer = setTimeout(function () {
        video.currentTime = seekTarget;
        seekTarget = null;
        isSeeking  = false;
      }, 600);
    }

    function showError(msg) {
      if (spinnerEl) spinnerEl.classList.add('hidden');
      overlayEl.classList.remove('loading');
      overlayEl.classList.add('visible');
      if (statusEl) { statusEl.textContent = msg; statusEl.className = 'error'; }
      if (window.Nav) Nav.resume();
    }

    function resetProgress() {
      if (fillEl)    fillEl.style.width    = '0%';
      if (handleEl)  handleEl.style.left   = '0%';
      if (timeCurEl) timeCurEl.textContent = '0:00';
      if (timeTotEl) timeTotEl.textContent = '0:00';
    }

    function onTimeUpdate() {
      if (config.onTimeUpdate) config.onTimeUpdate();
      updateProgress();
    }

    function onEnded() {
      video.currentTime = getLoopStart();
      video.play();
    }

    function play(item) {
      seekTarget = null;
      isSeeking  = false;

      if (titleEl)  titleEl.textContent  = item.title || '';
      if (statusEl) { statusEl.textContent = ''; statusEl.className = ''; }
      resetProgress();

      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
      video.pause();
      video.src = '';
      clearTimeout(overlayTimer);
      clearTimeout(seekTimer);
      clearTimeout(bufferTimer);

      if (spinnerEl) spinnerEl.classList.remove('hidden');
      if (stepEl)    stepEl.textContent = 'Fetching URL…';
      overlayEl.classList.remove('visible');
      overlayEl.classList.add('loading');
      if (window.Nav) Nav.pause();

      updatePlayIcon();

      function onReady(src) {
        video.addEventListener('canplay', function onCanPlay() {
          video.removeEventListener('canplay', onCanPlay);
          var start = getLoopStart();
          if (start) video.currentTime = start;
          if (spinnerEl) spinnerEl.classList.add('hidden');
          overlayEl.classList.remove('loading');
          showOverlay();
        });
        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('ended', onEnded);
        if (stepEl) stepEl.textContent = 'Buffering…';
        video.src = src;
        video.play();
      }

      config.onLoad(item, { showError: showError, onReady: onReady });
    }

    function stop() {
      clearTimeout(overlayTimer);
      clearTimeout(seekTimer);
      clearTimeout(bufferTimer);
      seekTarget = null;
      isSeeking  = false;
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
      video.pause();
      video.src = '';
      overlayEl.classList.remove('visible');
      overlayEl.classList.remove('loading');
      if (spinnerEl) spinnerEl.classList.remove('hidden');
      if (stepEl)    stepEl.textContent = 'Loading…';
      if (statusEl)  { statusEl.textContent = ''; statusEl.className = ''; }
      resetProgress();
      if (window.Nav) Nav.resume();
    }

    // Mid-playback buffering
    video.addEventListener('waiting', function () {
      clearTimeout(bufferTimer);
      bufferTimer = setTimeout(function () {
        if (video.paused) return;
        if (stepEl)    stepEl.textContent = 'Buffering…';
        if (spinnerEl) spinnerEl.classList.remove('hidden');
      }, 500);
    });
    video.addEventListener('playing', function () {
      clearTimeout(bufferTimer);
      if (spinnerEl) spinnerEl.classList.add('hidden');
      updatePlayIcon();
    });
    video.addEventListener('pause', updatePlayIcon);

    // Play/pause
    if (playBtn) {
      playBtn.addEventListener('click', function () {
        if (video.paused) video.play(); else video.pause();
        updatePlayIcon();
        showOverlay();
      });
    }

    // Optional controls — hide button if hook not provided, wire click if it is
    var restartBtn = config.restartBtn;
    if (restartBtn) {
      if (config.onRestart) {
        restartBtn.addEventListener('click', function () { config.onRestart(); showOverlay(); });
      } else {
        restartBtn.style.display = 'none';
      }
    }

    var skipBackBtn = config.skipBackBtn;
    if (skipBackBtn) {
      if (config.onSkipBack) {
        skipBackBtn.addEventListener('click', function () { config.onSkipBack(); });
      } else {
        skipBackBtn.style.display = 'none';
      }
    }

    var skipFwdBtn = config.skipFwdBtn;
    if (skipFwdBtn) {
      if (config.onSkipForward) {
        skipFwdBtn.addEventListener('click', function () { config.onSkipForward(); });
      } else {
        skipFwdBtn.style.display = 'none';
      }
    }

    var cropBtn = config.cropBtn;
    if (cropBtn) {
      if (config.onToggleCrop) {
        cropBtn.addEventListener('click', function () { config.onToggleCrop(); showOverlay(); });
      } else {
        cropBtn.style.display = 'none';
      }
    }

    var progressBar = config.progressBar;
    if (progressBar && !config.onScrub) progressBar.style.display = 'none';

    return { play: play, stop: stop, seek: seek, showOverlay: showOverlay, hideOverlay: hideOverlay };
  }

  return { create: create };
})();
