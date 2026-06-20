(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalise(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      var willOpen = panel.hasAttribute('hidden');
      if (willOpen) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      button.setAttribute('aria-expanded', String(willOpen));
    });
  }

  function setupHero() {
    var hero = document.querySelector('.hero-slider');
    if (!hero) {
      return;
    }

    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var previous = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
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

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var list = document.querySelector('[data-movie-list]');

    if (!panel || !list) {
      return;
    }

    var keyword = panel.querySelector('[data-filter-keyword]');
    var genre = panel.querySelector('[data-filter-genre]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var cards = selectAll('.movie-card, .ranking-row', list);
    var empty = document.querySelector('[data-empty-message]');

    function applyFilters() {
      var keywordValue = normalise(keyword && keyword.value);
      var genreValue = normalise(genre && genre.value);
      var regionValue = normalise(region && region.value);
      var typeValue = normalise(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var content = normalise([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));

        var matchesKeyword = !keywordValue || content.indexOf(keywordValue) !== -1;
        var matchesGenre = !genreValue || normalise(card.getAttribute('data-genre')).indexOf(genreValue) !== -1;
        var matchesRegion = !regionValue || normalise(card.getAttribute('data-region')) === regionValue;
        var matchesType = !typeValue || normalise(card.getAttribute('data-type')) === typeValue;
        var matches = matchesKeyword && matchesGenre && matchesRegion && matchesType;

        card.classList.toggle('is-hidden', !matches);
        if (matches) {
          visible += 1;
        }
      });

      if (empty) {
        if (visible > 0) {
          empty.setAttribute('hidden', '');
        } else {
          empty.removeAttribute('hidden');
        }
      }
    }

    [keyword, genre, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && keyword) {
      keyword.value = query;
    }

    applyFilters();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
}());
