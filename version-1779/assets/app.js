(function () {
    function select(selector, root) {
        return (root || document).querySelector(selector);
    }

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeText(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function initMenu() {
        var toggle = select('[data-menu-toggle]');
        var menu = select('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.hidden = !menu.hidden;
        });
    }

    function initHero() {
        var hero = select('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = select('[data-hero-prev]', hero);
        var next = select('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function renderSearchResult(movie) {
        return [
            '<a class="search-item" href="' + escapeText(movie.url) + '">',
            '<img src="' + escapeText(movie.poster) + '" alt="' + escapeText(movie.title) + '">',
            '<span>',
            '<strong>' + escapeText(movie.title) + '</strong>',
            '<span>' + escapeText([movie.region, movie.year, movie.type].filter(Boolean).join(' · ')) + '</span>',
            '</span>',
            '</a>'
        ].join('');
    }

    function initSearch() {
        var forms = selectAll('.site-search');
        if (!forms.length || !window.SITE_MOVIES) {
            return;
        }
        forms.forEach(function (form) {
            var input = select('[data-site-search]', form);
            var panel = select('[data-search-panel]', form);
            if (!input || !panel) {
                return;
            }
            var current = [];

            function update() {
                var query = input.value.trim().toLowerCase();
                if (!query) {
                    panel.hidden = true;
                    panel.innerHTML = '';
                    current = [];
                    return;
                }
                current = window.SITE_MOVIES.filter(function (movie) {
                    return [movie.title, movie.region, movie.type, movie.year, movie.genre].join(' ').toLowerCase().indexOf(query) !== -1;
                }).slice(0, 12);
                if (!current.length) {
                    panel.innerHTML = '<p class="search-empty">暂无匹配内容</p>';
                } else {
                    panel.innerHTML = current.map(renderSearchResult).join('');
                }
                panel.hidden = false;
            }

            input.addEventListener('input', update);
            input.addEventListener('focus', update);
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                if (current.length) {
                    window.location.href = current[0].url;
                }
            });
            document.addEventListener('click', function (event) {
                if (!form.contains(event.target)) {
                    panel.hidden = true;
                }
            });
        });
    }

    function initLocalFilter() {
        var holders = selectAll('[data-card-filter]');
        holders.forEach(function (holder) {
            var input = select('[data-local-filter]', holder);
            var chips = selectAll('[data-chip]', holder);
            var grid = select('[data-card-grid]', holder);
            if (!grid) {
                return;
            }
            var cards = selectAll('.movie-card', grid);
            var activeChip = 'all';

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
                    var chipPass = activeChip === 'all' || text.indexOf(activeChip) !== -1;
                    var queryPass = !query || text.indexOf(query) !== -1;
                    card.style.display = chipPass && queryPass ? '' : 'none';
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    activeChip = chip.getAttribute('data-chip') || 'all';
                    chips.forEach(function (item) {
                        item.classList.toggle('is-active', item === chip);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initSearch();
        initLocalFilter();
    });
}());
