(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var index = 0;
    var timer = null;
    var showSlide = function (next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };
    var nextSlide = function () {
      showSlide(index + 1);
    };
    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(nextSlide, 5000);
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide') || 0));
        restart();
      });
    });
    var prevButton = hero.querySelector('[data-hero-prev]');
    var nextButton = hero.querySelector('[data-hero-next]');
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }
    restart();
  }

  var filterPanels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
  filterPanels.forEach(function (panel) {
    var input = panel.querySelector('.filter-input');
    var typeSelect = panel.querySelector('.filter-type');
    var yearSelect = panel.querySelector('.filter-year');
    var grid = panel.nextElementSibling;
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var applyFilter = function () {
      var text = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matched = (!text || haystack.indexOf(text) !== -1) && (!type || cardType.indexOf(type) !== -1) && (!year || cardYear === year);
        card.classList.toggle('is-hidden', !matched);
      });
    };
    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
    var query = new URLSearchParams(window.location.search).get('q');
    if (query && input) {
      input.value = query;
      applyFilter();
    }
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var source = player.getAttribute('data-video');
    var loaded = false;
    var hls = null;
    if (!video || !source) {
      return;
    }
    var loadVideo = function () {
      if (loaded) {
        return;
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
      }
      loaded = true;
    };
    var playVideo = function () {
      loadVideo();
      video.setAttribute('controls', 'controls');
      player.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    };
    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        player.classList.remove('is-playing');
      }
    });
    video.addEventListener('ended', function () {
      player.classList.remove('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
