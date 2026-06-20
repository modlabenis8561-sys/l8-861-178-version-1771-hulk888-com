(function () {
  function pagePrefix() {
    var depth = Number(document.documentElement.getAttribute("data-depth") || "0");
    return depth > 0 ? "../".repeat(depth) : "";
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>\"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '\"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupMenu() {
    var toggle = qs(".nav-toggle");
    var menu = qs("#mobileNav");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.hidden = !menu.hidden;
    });
  }

  function setupHero() {
    var slider = qs("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = qsa(".hero-slide", slider);
    var prev = qs("[data-hero-prev]", slider);
    var next = qs("[data-hero-next]", slider);
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === active);
      });
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      restart();
    }
  }

  function renderSearch(query, panel) {
    var prefix = pagePrefix();
    var keyword = query.trim().toLowerCase();
    if (!keyword || !window.MOVIE_SEARCH_INDEX) {
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }
    var items = window.MOVIE_SEARCH_INDEX.filter(function (item) {
      return item.text.toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, 14);
    if (!items.length) {
      panel.innerHTML = '<div class="search-result"><span><strong>没有找到匹配影片</strong><p>可以尝试输入地区、类型或标签。</p></span></div>';
      panel.hidden = false;
      return;
    }
    panel.innerHTML = items.map(function (item) {
      return [
        '<a class="search-result" href="', prefix, item.url, '">',
        '<img src="', prefix, item.cover, '" alt="', escapeHtml(item.title), '">',
        '<span><strong>', escapeHtml(item.title), '</strong><em>', escapeHtml(item.meta), '</em><p>', escapeHtml(item.desc), '</p></span>',
        '</a>'
      ].join("");
    }).join("");
    panel.hidden = false;
  }

  function setupGlobalSearch() {
    var forms = qsa("[data-global-search]");
    var panel = qs("[data-global-results]");
    if (!forms.length || !panel) {
      return;
    }
    forms.forEach(function (form) {
      var input = qs('input[type="search"]', form);
      if (!input) {
        return;
      }
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        renderSearch(input.value, panel);
      });
      input.addEventListener("input", function () {
        if (input.value.trim().length >= 2) {
          renderSearch(input.value, panel);
        } else {
          panel.hidden = true;
        }
      });
      input.addEventListener("focus", function () {
        if (input.value.trim().length >= 2) {
          renderSearch(input.value, panel);
        }
      });
    });
    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && !event.target.closest("[data-global-search]")) {
        panel.hidden = true;
      }
    });
  }

  function setupCatalog() {
    var grid = qs("[data-catalog-grid]");
    if (!grid) {
      return;
    }
    var cards = qsa(".movie-card", grid);
    var keyword = qs("[data-catalog-keyword]");
    var region = qs("[data-catalog-region]");
    var type = qs("[data-catalog-type]");
    var year = qs("[data-catalog-year]");

    function value(node) {
      return node ? node.value.trim().toLowerCase() : "";
    }

    function apply() {
      var key = value(keyword);
      var reg = value(region);
      var typ = value(type);
      var yr = value(year);
      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(" ").toLowerCase();
        var matched = true;
        if (key && text.indexOf(key) === -1) {
          matched = false;
        }
        if (reg && (card.dataset.region || "").toLowerCase() !== reg) {
          matched = false;
        }
        if (typ && (card.dataset.type || "").toLowerCase() !== typ) {
          matched = false;
        }
        if (yr && (card.dataset.year || "").toLowerCase() !== yr) {
          matched = false;
        }
        card.hidden = !matched;
      });
    }

    [keyword, region, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = qs("#movie-player");
    var button = qs("#playerStart");
    var hlsInstance = null;

    if (!video || !button || !streamUrl) {
      return;
    }

    function attach() {
      if (video.dataset.ready === "1") {
        return Promise.resolve();
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.dataset.ready = "1";
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        video.dataset.ready = "1";
        return new Promise(function (resolve) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
          setTimeout(resolve, 1400);
        });
      }

      video.src = streamUrl;
      video.dataset.ready = "1";
      return Promise.resolve();
    }

    function play() {
      attach().then(function () {
        button.classList.add("is-hidden");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      });
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupCatalog();
  });
})();
