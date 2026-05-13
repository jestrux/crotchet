// store.js — thin client; crotchet desktop is the source of truth
// HTTP for reads, socket.io for live updates + actions

var Store = (function () {
  var BASE = '';
  var _socket = null;
  var _listeners = [];
  var _playOnTvListeners = [];
  var _remoteActionListeners = [];

  function setHost(ip) {
    var host = ip.trim();
    if (host.indexOf(':') === -1) host = host + ':3127';
    BASE = 'http://' + host;
    localStorage.setItem('crotchet_host', host);
  }

  function getHost() {
    return localStorage.getItem('crotchet_host') || '192.168.0.4:3127';
  }

  function ping() {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 5000);
    return fetch(BASE + '/', { signal: controller.signal })
      .then(function (r) { clearTimeout(timer); return r.ok; })
      .catch(function () { clearTimeout(timer); return false; });
  }

  function getPages() {
    return fetch(BASE + '/tv-pages')
      .then(function (r) { return r.json(); })
      .catch(function () { return []; });
  }

  function runAction(item) {
    if (!_socket) return;
    var url = typeof item === 'string' ? item : (item.url || '');
    if (url.indexOf('crotchet://action/') === 0) {
      var action = url.replace('crotchet://action/', '').split('?')[0];
      // Send full item as payload so desktop has crop/start/end data
      var payload = typeof item === 'object' ? item : url.split('?')[1]
        ? decodeURIComponent(url.split('?')[1].replace('arg=', ''))
        : null;
      _socket.emit('run-action', { action: action, showWindow: true, payload: payload });
    } else if (url) {
      _socket.emit('open-url', url);
    }
  }

  function connect(host) {
    if (_socket) { _socket.disconnect(); _socket = null; }
    _socket = io('http://' + host, { transports: ['websocket'] });

    _socket.on('tv-pages-updated', function (sections) {
      _listeners.forEach(function (fn) { fn(sections); });
    });

    _socket.on('play-on-tv', function (item) {
      _playOnTvListeners.forEach(function (fn) { fn(item); });
    });

    _socket.on('tv-remote-action', function (data) {
      _remoteActionListeners.forEach(function (fn) { fn(data); });
    });

    _socket.on('disconnect', function () {
      setTimeout(function () { connect(host); }, 3000);
    });
  }

  function onUpdate(fn) {
    _listeners.push(fn);
    return function () {
      _listeners = _listeners.filter(function (l) { return l !== fn; });
    };
  }

  function onPlayOnTv(fn) {
    _playOnTvListeners.push(fn);
  }

  function onTvRemoteAction(fn) {
    _remoteActionListeners.push(fn);
  }

  function init() {
    var host = getHost();
    if (host) connect(host);
  }

  return { setHost: setHost, getHost: getHost, ping: ping, init: init, getPages: getPages, runAction: runAction, onUpdate: onUpdate, onPlayOnTv: onPlayOnTv, onTvRemoteAction: onTvRemoteAction };
})();
