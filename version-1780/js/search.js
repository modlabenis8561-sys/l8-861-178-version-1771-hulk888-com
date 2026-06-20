(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  ready(function () {
    var form = document.querySelector('[data-search-page-form]');
    var input = document.querySelector('[data-search-page-input]');
    var results = document.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (!form || !input || !results) {
      return;
    }

    function render(query) {
      var keyword = String(query || '').trim().toLowerCase();
      if (!keyword) {
        results.innerHTML = '<div class="empty-state">输入关键词后即可查看匹配影片。</div>';
        return;
      }

      var matches = (window.MOVIE_INDEX || []).filter(function (movie) {
        var text = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.summary
        ].join(' ').toLowerCase();
        return text.indexOf(keyword) !== -1;
      }).slice(0, 80);

      if (!matches.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配影片。</div>';
        return;
      }

      results.innerHTML = matches.map(function (movie) {
        return '<a class="search-result-item" href="' + escapeHtml(movie.href) + '">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span><h2>' + escapeHtml(movie.title) + '</h2><p>' + escapeHtml(movie.summary) + '</p></span>' +
          '<em>' + escapeHtml(movie.rating) + '</em>' +
        '</a>';
      }).join('');
    }

    input.value = initial;
    render(initial);

    input.addEventListener('input', function () {
      render(input.value);
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = './search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
      window.history.replaceState(null, '', nextUrl);
      render(query);
    });
  });
})();
