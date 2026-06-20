window.MoviePlayer = {
    mount: function (id, source) {
        var shell = document.getElementById(id);
        if (!shell) {
            return;
        }
        var video = shell.querySelector('video');
        var cover = shell.querySelector('.play-cover');
        var loaded = false;
        var hls = null;

        function attach() {
            if (loaded) {
                if (video.paused) {
                    video.play().catch(function () {});
                }
                return;
            }
            loaded = true;
            if (cover) {
                cover.classList.add('is-hidden');
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            video.play().catch(function () {});
        }

        if (cover) {
            cover.addEventListener('click', attach);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                attach();
            }
        });
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }
};
