(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function initImages() {
    all('img.movie-image').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
      }, { once: true });
    });
  }

  function initMenu() {
    var button = one('.menu-toggle');
    if (!button) {
      return;
    }
    button.addEventListener('click', function () {
      var open = !document.body.classList.contains('menu-open');
      document.body.classList.toggle('menu-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = one('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    var thumbs = all('[data-hero-thumb]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('mouseenter', function () {
        show(i);
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    all('[data-filter-scope]').forEach(function (scope) {
      var section = scope.closest('.content-section') || document;
      var list = one('[data-filter-list]', section);
      if (!list) {
        return;
      }
      var cards = all('[data-title]', list);
      var search = one('[data-filter-search]', scope);
      var year = one('[data-filter-year]', scope);
      var region = one('[data-filter-region]', scope);
      function apply() {
        var term = search ? search.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var regionValue = region ? region.value : '';
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var okTerm = !term || text.indexOf(term) !== -1;
          var okYear = !yearValue || card.getAttribute('data-year') === yearValue;
          var okRegion = !regionValue || card.getAttribute('data-region') === regionValue;
          card.classList.toggle('is-hidden', !(okTerm && okYear && okRegion));
        });
      }
      [search, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function makeCard(item) {
    var tags = Array.isArray(item.tags) ? item.tags.slice(0, 3) : [];
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeHtml(item.url) + '">',
      '<span class="poster-wrap">',
      '<img class="movie-image" src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="poster-badge">' + escapeHtml(item.year) + '</span>',
      '</span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="tag-row">' + tags.map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var box = one('[data-search-results]');
    if (!box || typeof siteSearchItems === 'undefined') {
      return;
    }
    var status = one('[data-search-status]');
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = one('.search-large input[name="q"]');
    if (input) {
      input.value = query;
    }
    if (!query) {
      if (status) {
        status.textContent = '输入关键词搜索喜欢的剧集';
      }
      return;
    }
    var tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    var results = siteSearchItems.filter(function (item) {
      var haystack = [
        item.title,
        item.region,
        item.type,
        item.category,
        item.genre,
        (item.tags || []).join(' '),
        item.oneLine,
        item.summary
      ].join(' ').toLowerCase();
      return tokens.every(function (token) {
        return haystack.indexOf(token) !== -1;
      });
    }).slice(0, 120);
    if (status) {
      status.textContent = results.length ? '相关内容' : '暂无匹配内容';
    }
    box.innerHTML = results.map(makeCard).join('');
    initImages();
  }

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function initPlayers() {
    all('.player[data-stream]').forEach(function (player) {
      var video = one('video', player);
      var start = one('.player-start', player);
      var stream = player.getAttribute('data-stream');
      var ready = false;
      var hlsInstance = null;
      if (!video || !stream || !start) {
        return;
      }
      function attach() {
        if (ready) {
          return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          return;
        }
        video.src = stream;
      }
      function play() {
        var run = function () {
          attach();
          player.classList.add('is-playing');
          video.play().catch(function () {
            video.controls = true;
          });
        };
        if (video.canPlayType('application/vnd.apple.mpegurl') || window.Hls) {
          run();
        } else {
          loadHlsLibrary(run);
        }
      }
      start.addEventListener('click', play);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initImages();
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
  });
}());
