// router.js — screen manager with focus memory

var Router = (function () {
  var screens = {};
  var pendingOpts = {};
  var currentId = null;

  function register(id, el, opts) {
    screens[id] = { el: el, opts: opts || {} };
  }

  function navigate(id, opts) {
    if (currentId === id) return;

    if (currentId) {
      var prev = screens[currentId];
      if (prev) {
        prev.el.classList.remove('active');
        if (prev.opts.onLeave) prev.opts.onLeave();
      }
    }

    currentId = id;
    var next = screens[id];
    if (next) {
      next.el.classList.add('active');
      if (next.opts.onEnter) next.opts.onEnter(opts);
    }
  }

  function go(id, opts) {
    pendingOpts[id] = opts;
    history.pushState({ screen: id }, '', '#' + id);
    navigate(id, opts);
  }

  function back() {
    history.back();
  }

  function init() {
    window.addEventListener('popstate', function (e) {
      var id = (location.hash || '#home').replace('#', '') || 'home';
      var opts = pendingOpts[id];
      delete pendingOpts[id];
      navigate(id, opts);
    });
  }

  return { register: register, go: go, back: back, init: init, navigate: navigate };
})();
