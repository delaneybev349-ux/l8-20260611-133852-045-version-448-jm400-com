(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function() {
        var open = mobileNav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.querySelectorAll('[data-search-scope]').forEach(function(scope) {
      var input = scope.querySelector('[data-search-input]');
      var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
      var section = scope.parentElement;
      var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
      var empty = section.querySelector('.empty-state');

      function applyFilters() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var activeFilters = {};
        selects.forEach(function(select) {
          activeFilters[select.getAttribute('data-filter')] = select.value;
        });
        var visibleCount = 0;
        cards.forEach(function(card) {
          var text = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-genre') || ''
          ].join(' ').toLowerCase();
          var matched = !keyword || text.indexOf(keyword) !== -1;
          Object.keys(activeFilters).forEach(function(name) {
            if (activeFilters[name] && card.getAttribute('data-' + name) !== activeFilters[name]) {
              matched = false;
            }
          });
          card.hidden = !matched;
          if (matched) {
            visibleCount += 1;
          }
        });
        if (empty) {
          empty.style.display = visibleCount ? 'none' : 'block';
        }
      }

      if (input) {
        input.addEventListener('input', applyFilters);
      }
      selects.forEach(function(select) {
        select.addEventListener('change', applyFilters);
      });
    });

    var visual = document.querySelector('[data-visual]');
    if (visual) {
      var slides = Array.prototype.slice.call(visual.querySelectorAll('.visual-layer'));
      var dots = Array.prototype.slice.call(visual.querySelectorAll('.visual-dots button'));
      var current = 0;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      dots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
          show(index);
        });
      });

      if (slides.length > 1) {
        setInterval(function() {
          show(current + 1);
        }, 5200);
      }
    }
  });
})();
