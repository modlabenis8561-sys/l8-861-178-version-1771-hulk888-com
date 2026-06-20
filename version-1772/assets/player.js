(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var video = document.querySelector("[data-video-player]");
        var trigger = document.querySelector("[data-play-trigger]");
        if (!video) {
            return;
        }

        var stream = video.getAttribute("data-stream");
        var loaded = false;
        var hlsInstance = null;

        function loadVideo() {
            if (loaded || !stream) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                loaded = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                loaded = true;
            }
        }

        function startVideo() {
            loadVideo();
            if (trigger) {
                trigger.classList.add("is-hidden");
            }
            var playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {
                    if (trigger) {
                        trigger.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (trigger) {
            trigger.addEventListener("click", startVideo);
        }
        video.addEventListener("play", function () {
            if (trigger) {
                trigger.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 && trigger) {
                trigger.classList.remove("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
})();
