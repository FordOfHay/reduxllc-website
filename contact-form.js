/* Buildertrend documents three resize message formats. Listen before the
   iframe loads, and accept messages only from this exact embedded form. */
(function () {
  'use strict';
  window.addEventListener('message', function (event) {
    var frame = document.getElementById('btIframe');
    if (!frame || event.source !== frame.contentWindow ||
        event.origin !== new URL(frame.src).origin) return;
    var data = event.data;
    var height;
    if (data && typeof data === 'object') {
      height = data.FrameHeight || data.height || data.frameHeight;
    } else if (typeof data === 'number') {
      height = data;
    } else if (typeof data === 'string' && /^(?:h=)?\d+(?:\.\d+)?$/.test(data)) {
      height = data.replace(/^h=/, '');
    }
    height = Number(height);
    if (!Number.isFinite(height) || height < 100 || height > 10000) return;
    frame.style.height = Math.ceil(height + 24) + 'px';
    frame.setAttribute('data-sized', 'true');
  });
})();
