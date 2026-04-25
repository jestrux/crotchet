// open-url.js — TV URL router
// Processes crotchet:// URLs and dispatches to the appropriate TV screen.
// Falls back to desktop via socket for anything not handled natively.

function parseCrotchetPreviewUrl(url) {
  // Format: crotchet://preview/{url}?type=xxx&key=val
  // We search for '?type=' specifically so the parser works whether the inner
  // URL is percent-encoded or not (an unencoded image URL has its own '?').
  var afterScheme = url.slice('crotchet://preview/'.length);
  var typeIdx = afterScheme.indexOf('?type=');
  var innerUrl = decodeURIComponent(typeIdx !== -1 ? afterScheme.slice(0, typeIdx) : afterScheme);
  var outerQs = typeIdx !== -1 ? afterScheme.slice(typeIdx + 1) : '';

  var params = {};
  outerQs.split('&').forEach(function (part) {
    var eqIdx = part.indexOf('=');
    if (eqIdx === -1) return;
    var k = part.slice(0, eqIdx);
    var v = part.slice(eqIdx + 1);
    if (k) params[k] = decodeURIComponent(v);
  });

  return { innerUrl: innerUrl, params: params };
}

function openUrl(url, item) {
  if (!url) return;

  if (url.startsWith('crotchet://preview')) {
    var parsed = parseCrotchetPreviewUrl(url);
    var type = parsed.params.type;
    var innerUrl = parsed.innerUrl;

    if (type === 'youtube') {
      Router.go('youtubePlayer', Object.assign({}, item, { url: innerUrl }));
      return;
    }

    if (type === 'image') {
      Router.go('preview', Object.assign({}, item, { image: innerUrl || item.image }));
      return;
    }
  }

  // Anything else — hand off to the desktop via socket
  Store.runAction(item);
}
