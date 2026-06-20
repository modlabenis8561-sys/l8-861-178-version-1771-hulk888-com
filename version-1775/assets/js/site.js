(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const previous = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let activeIndex = 0;
        let timer = null;

        const showSlide = function (index) {
            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, currentIndex) {
                slide.classList.toggle('active', currentIndex === activeIndex);
            });

            dots.forEach(function (dot, currentIndex) {
                dot.classList.toggle('active', currentIndex === activeIndex);
            });
        };

        const startTimer = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5000);
        };

        if (slides.length > 0) {
            showSlide(0);
            startTimer();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }
    }

    const localFilter = document.querySelector('[data-local-filter]');

    if (localFilter) {
        const cards = Array.from(document.querySelectorAll('[data-card]'));
        const buttons = Array.from(localFilter.querySelectorAll('[data-filter]'));
        const input = localFilter.querySelector('[data-filter-input]');
        let currentType = 'all';

        const applyFilter = function () {
            const keyword = input ? input.value.trim().toLowerCase() : '';

            cards.forEach(function (card) {
                const type = (card.getAttribute('data-type') || '').toLowerCase();
                const title = (card.getAttribute('data-title') || '').toLowerCase();
                const genre = (card.getAttribute('data-genre') || '').toLowerCase();
                const region = (card.getAttribute('data-region') || '').toLowerCase();
                const year = (card.getAttribute('data-year') || '').toLowerCase();
                const matchesType = currentType === 'all' || type === currentType.toLowerCase();
                const matchesText = !keyword || title.includes(keyword) || genre.includes(keyword) || region.includes(keyword) || year.includes(keyword);
                card.classList.toggle('hidden-card', !(matchesType && matchesText));
            });
        };

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                currentType = button.getAttribute('data-filter') || 'all';

                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });

                applyFilter();
            });
        });

        if (input) {
            input.addEventListener('input', applyFilter);
        }
    }
})();
