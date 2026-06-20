(function () {
    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupCarousel() {
        document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-dot]'));
            var prev = carousel.querySelector('[data-slide-prev]');
            var next = carousel.querySelector('[data-slide-next]');
            if (!slides.length) {
                return;
            }
            var current = 0;
            var timer = null;
            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                    dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
                });
            }
            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }
            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    start();
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    show(index);
                    start();
                });
            });
            carousel.addEventListener('mouseenter', stop);
            carousel.addEventListener('mouseleave', start);
            show(0);
            start();
        });
    }

    function setupFilters() {
        document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-select]'));
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-card'));
            var empty = scope.querySelector('[data-empty]');
            var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-chip]'));
            function selectedValue(key) {
                var select = selects.find(function (item) {
                    return item.getAttribute('data-filter-select') === key;
                });
                return select ? select.value : '';
            }
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var category = selectedValue('category');
                var type = selectedValue('type');
                var year = selectedValue('year');
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardCategory = card.getAttribute('data-category') || '';
                    var cardType = card.getAttribute('data-type') || '';
                    var cardYear = card.getAttribute('data-year') || '';
                    var match = true;
                    if (query && haystack.indexOf(query) === -1) {
                        match = false;
                    }
                    if (category && cardCategory !== category) {
                        match = false;
                    }
                    if (type && cardType !== type) {
                        match = false;
                    }
                    if (year && cardYear !== year) {
                        match = false;
                    }
                    card.style.display = match ? '' : 'none';
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    if (input) {
                        input.value = chip.getAttribute('data-filter-chip') || '';
                    }
                    apply();
                });
            });
            apply();
        });
    }

    function applyUrlSearch() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (!query) {
            return;
        }
        var input = document.querySelector('[data-filter-input]');
        if (input) {
            input.value = query;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function setupPlayers() {
        document.querySelectorAll('.player-shell').forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('.play-cover');
            var stream = shell.getAttribute('data-stream') || '';
            var prepared = false;
            function prepare() {
                if (prepared || !video || !stream) {
                    return;
                }
                prepared = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && Hls.isSupported()) {
                    var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }
            function play() {
                prepare();
                shell.classList.add('is-playing');
                video.setAttribute('controls', 'controls');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        shell.classList.remove('is-playing');
                    });
                }
            }
            if (button && video) {
                button.addEventListener('click', play);
                video.addEventListener('click', function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener('play', function () {
                    shell.classList.add('is-playing');
                });
                video.addEventListener('pause', function () {
                    if (!video.controls) {
                        shell.classList.remove('is-playing');
                    }
                });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupCarousel();
        setupFilters();
        applyUrlSearch();
        setupPlayers();
    });
})();
