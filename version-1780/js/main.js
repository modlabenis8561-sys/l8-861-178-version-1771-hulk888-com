(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
      menuButton.addEventListener('click', function () {
        var open = mobilePanel.classList.toggle('is-open');
        menuButton.classList.toggle('is-open', open);
        menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.querySelectorAll('.global-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"], input[type="search"]');
        var query = input ? input.value.trim() : '';
        var target = './search.html';
        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
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

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    document.querySelectorAll('[data-filter-form]').forEach(function (form) {
      var input = form.querySelector('[data-filter-input]');
      var typeFilter = form.querySelector('[data-type-filter]');
      var list = document.querySelector('[data-filter-list]');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

      function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
      }

      function filterCards() {
        var keyword = normalize(input ? input.value : '');
        var typeValue = normalize(typeFilter ? typeFilter.value : '');
        cards.forEach(function (card) {
          var content = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category'),
            card.getAttribute('data-year'),
            card.textContent
          ].join(' '));
          var typeText = normalize(card.textContent);
          var matchKeyword = !keyword || content.indexOf(keyword) !== -1;
          var matchType = !typeValue || typeText.indexOf(typeValue) !== -1;
          card.classList.toggle('is-hidden', !(matchKeyword && matchType));
        });
      }

      if (input) {
        input.addEventListener('input', filterCards);
      }
      if (typeFilter) {
        typeFilter.addEventListener('change', filterCards);
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        filterCards();
      });
    });
  });
})();
