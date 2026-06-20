(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-main-nav]");
        if (menuButton && nav) {
            menuButton.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, itemIndex) {
                    slide.classList.toggle("is-active", itemIndex === current);
                });
                dots.forEach(function (dot, itemIndex) {
                    dot.classList.toggle("is-active", itemIndex === current);
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
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    start();
                });
            });
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var list = document.querySelector("[data-filter-list]");
        if (list) {
            var queryInput = document.querySelector("[data-search-input]");
            var typeSelect = document.querySelector("[data-type-filter]");
            var regionSelect = document.querySelector("[data-region-filter]");
            var emptyState = document.querySelector("[data-empty-state]");
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";

            if (queryInput && initialQuery) {
                queryInput.value = initialQuery;
            }

            function norm(value) {
                return String(value || "").trim().toLowerCase();
            }

            function applyFilters() {
                var query = norm(queryInput ? queryInput.value : "");
                var type = typeSelect ? typeSelect.value : "";
                var region = regionSelect ? regionSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = norm([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchType = !type || card.getAttribute("data-type") === type;
                    var matchRegion = !region || card.getAttribute("data-region") === region;
                    var isVisible = matchQuery && matchType && matchRegion;
                    card.hidden = !isVisible;
                    if (isVisible) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.classList.toggle("is-visible", visible === 0);
                }
            }

            [queryInput, typeSelect, regionSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });
            applyFilters();
        }
    });
})();
