// youtube-player.js — YouTube player built on BasePlayer

var YoutubePlayer = (function () {
  var cropStart = 0;
  var cropEnd   = 0;
  var cropBtn   = document.getElementById('crop-btn');

  function cropOn() {
    return cropBtn && cropBtn.dataset.crop === 'on';
  }

  var video = document.getElementById('player-video');

  var player = BasePlayer.create({
    video:      video,
    overlayEl:  document.getElementById('player-overlay'),
    spinnerEl:  document.getElementById('player-spinner'),
    stepEl:     document.getElementById('player-step'),
    titleEl:    document.getElementById('player-title'),
    statusEl:   document.getElementById('player-status'),
    timeCurEl:  document.getElementById('player-time-cur'),
    timeTotEl:  document.getElementById('player-time-tot'),
    fillEl:     document.getElementById('player-fill'),
    handleEl:   document.getElementById('player-handle'),
    playIconEl: document.getElementById('play-icon'),
    pauseIconEl:document.getElementById('pause-icon'),
    playBtn:    document.getElementById('play-pause-btn'),
    progressBar:document.getElementById('player-progress-bar'),
    restartBtn: document.getElementById('player-restart-btn'),
    skipBackBtn:document.getElementById('skip-back-btn'),
    skipFwdBtn: document.getElementById('skip-fwd-btn'),
    cropBtn:    cropBtn,
    getLoopStart: function () { return cropOn() && cropStart ? cropStart : 0; },
    getLoopEnd:   function () { return cropOn() && cropEnd   ? cropEnd   : video.duration; },

    onLoad: function (item, helpers) {
      cropStart = (item.crop && item.crop.length >= 2) ? Number(item.crop[0]) : 0;
      cropEnd   = (item.crop && item.crop.length >= 2) ? Number(item.crop[1]) : 0;
      if (cropBtn) cropBtn.style.display = (cropStart || cropEnd) ? '' : 'none';

      fetch('http://' + Store.getHost() + '/youtube-url?id=' + encodeURIComponent(item._id))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.error) { helpers.showError(data.error); return; }
          if (data.url)   helpers.onReady(data.url);
        })
        .catch(function (e) { helpers.showError('Could not load video: ' + e.message); });
    },

    onTimeUpdate: function () {
      if (cropOn() && cropEnd) {
        var t = video.currentTime;
        if (t >= cropEnd || t < cropStart) video.currentTime = cropStart;
      }
    },

    onScrub: true,

    onSkipBack:    function () { player.seek(-10); },
    onSkipForward: function () { player.seek(10); },

    onRestart: function () {
      video.currentTime = cropOn() && cropStart ? cropStart : 0;
      video.play();
    },

    onToggleCrop: function () {
      var turningOn = cropBtn.dataset.crop !== 'on';
      cropBtn.dataset.crop = turningOn ? 'on' : 'off';
      video.currentTime = turningOn ? cropStart : 0;
      video.play();
    },
  });

  return player;
})();
