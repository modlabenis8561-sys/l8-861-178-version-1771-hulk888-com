function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

ready(function () {
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));

  if (slides.length > 1) {
    var current = 0;
    var activate = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
      });
    });

    window.setInterval(function () {
      activate((current + 1) % slides.length);
    }, 5200);
  }

  var searchInput = document.querySelector(".site-search");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".filter-tab"));
  var activeFilter = "all";

  var normalize = function (value) {
    return String(value || "").trim().toLowerCase();
  };

  var applyFilter = function () {
    var keyword = normalize(searchInput ? searchInput.value : "");
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-tags")
      ].join(" "));
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchFilter = activeFilter === "all" || haystack.indexOf(normalize(activeFilter)) !== -1;
      var show = matchKeyword && matchFilter;
      card.style.display = show ? "" : "none";
      if (show) {
        visible += 1;
      }
    });

    var empty = document.querySelector(".no-results");
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0 && cards.length > 0);
    }
  };

  if (searchInput && cards.length) {
    searchInput.addEventListener("input", applyFilter);
  }

  if (tabs.length && cards.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activeFilter = tab.getAttribute("data-filter") || "all";
        tabs.forEach(function (item) {
          item.classList.toggle("is-active", item === tab);
        });
        applyFilter();
      });
    });
  }
});

function initMoviePlayer(url) {
  ready(function () {
    var video = document.getElementById("moviePlayer");
    var cover = document.getElementById("playerCover");
    var attached = false;

    if (!video || !url) {
      return;
    }

    var attach = function () {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        return;
      }

      video.src = url;
    };

    var play = function () {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    };

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!attached) {
        play();
      }
    });
  });
}
