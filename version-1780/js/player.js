(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function readSourcePayload() {
    var node = document.getElementById('video-source');
    if (!node) {
      return { url: '', sources: [] };
    }
    try {
      return JSON.parse(node.textContent || '{}');
    } catch (error) {
      return { url: '', sources: [] };
    }
  }

  ready(function () {
    var shell = document.querySelector('[data-player-shell]');
    var video = document.getElementById('movie-player');
    var button = document.querySelector('[data-player-button]');
    var payload = readSourcePayload();
    var sources = Array.isArray(payload.sources) && payload.sources.length ? payload.sources.slice() : [payload.url];
    var hls = null;
    var sourceIndex = 0;

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    function destroyHls() {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
      hls = null;
    }

    function load(index) {
      if (!video || !sources.length) {
        return;
      }
      sourceIndex = index % sources.length;
      var source = sources[sourceIndex];
      destroyHls();

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && sources.length > 1) {
            load(sourceIndex + 1);
          }
        });
        return;
      }

      video.src = source;
      playVideo();
    }

    function start() {
      if (shell) {
        shell.classList.add('is-playing');
      }
      load(sourceIndex);
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('error', function () {
        if (sources.length > 1) {
          load(sourceIndex + 1);
        }
      });
    }
  });
})();
