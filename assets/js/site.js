(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normal(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupNavigation() {
        var toggle = $('.nav-toggle');
        var mobileNav = $('.mobile-nav');
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', mobileNav.classList.contains('is-open') ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = $('.hero');
        if (!hero) {
            return;
        }
        var slides = $all('.hero-slide', hero);
        var dots = $all('.hero-dot', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
            var image = slides[index].getAttribute('data-hero-image');
            if (image) {
                hero.style.setProperty('--hero-image', 'url("' + image + '")');
            }
        }
        dots.forEach(function (dot, current) {
            dot.addEventListener('click', function () {
                show(current);
            });
        });
        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupFilters() {
        var filterRoots = $all('[data-filter-root]');
        filterRoots.forEach(function (root) {
            var searchInput = $('[data-search-input]', root);
            var yearSelect = $('[data-year-filter]', root);
            var typeSelect = $('[data-type-filter]', root);
            var sortSelect = $('[data-sort-select]', root);
            var cardsWrap = $('[data-card-wrap]', root);
            var cards = $all('[data-movie-card]', root);
            var emptyTip = $('[data-empty-tip]', root);

            function apply() {
                var query = normal(searchInput && searchInput.value);
                var year = yearSelect ? yearSelect.value : '';
                var type = typeSelect ? typeSelect.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normal(card.getAttribute('data-search') || card.textContent);
                    var cardYear = card.getAttribute('data-year') || '';
                    var cardType = card.getAttribute('data-type') || '';
                    var matched = true;
                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });

                if (emptyTip) {
                    emptyTip.classList.toggle('is-visible', visible === 0);
                }
            }

            function sortCards() {
                if (!sortSelect || !cardsWrap) {
                    return;
                }
                var mode = sortSelect.value;
                var sorted = cards.slice().sort(function (a, b) {
                    if (mode === 'title') {
                        return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                    }
                    if (mode === 'index') {
                        return Number(a.getAttribute('data-index')) - Number(b.getAttribute('data-index'));
                    }
                    return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
                });
                sorted.forEach(function (card) {
                    cardsWrap.appendChild(card);
                });
                apply();
            }

            [searchInput, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            if (sortSelect) {
                sortSelect.addEventListener('change', sortCards);
            }
            apply();
        });
    }

    function setupHomeSearch() {
        var form = $('[data-home-search]');
        if (!form) {
            return;
        }
        var input = $('input', form);
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var keyword = encodeURIComponent(input ? input.value.trim() : '');
            window.location.href = keyword ? 'library.html?q=' + keyword : 'library.html';
        });
    }

    function applyQueryToLibrary() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (!query) {
            return;
        }
        var input = $('[data-search-input]');
        if (input) {
            input.value = query;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupHomeSearch();
        applyQueryToLibrary();
    });
}());
