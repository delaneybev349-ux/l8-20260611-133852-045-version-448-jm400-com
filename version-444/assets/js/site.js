(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var toggle = qs('[data-menu-toggle]');
    var mobileNav = qs('[data-mobile-nav]');
    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    qsa('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = qs('input', form);
            var query = input ? input.value.trim() : '';
            var url = 'search.html';
            if (query) {
                url += '?q=' + encodeURIComponent(query);
            }
            window.location.href = url;
        });
    });

    function applyFilters() {
        var input = qs('[data-filter-input]');
        var select = qs('[data-filter-select]');
        var empty = qs('[data-empty-state]');
        var query = input ? input.value.trim().toLowerCase() : '';
        var year = select ? select.value : '';
        var visible = 0;
        qsa('[data-card]').forEach(function (card) {
            var text = card.getAttribute('data-search') || '';
            var cardYear = card.getAttribute('data-year') || '';
            var matched = (!query || text.indexOf(query) !== -1) && (!year || cardYear === year);
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.style.display = visible ? 'none' : 'block';
        }
    }

    var filterInput = qs('[data-filter-input]');
    var filterSelect = qs('[data-filter-select]');
    if (filterInput || filterSelect) {
        var params = new URLSearchParams(window.location.search);
        var queryParam = params.get('q');
        if (queryParam && filterInput) {
            filterInput.value = queryParam;
        }
        if (filterInput) {
            filterInput.addEventListener('input', applyFilters);
        }
        if (filterSelect) {
            filterSelect.addEventListener('change', applyFilters);
        }
        applyFilters();
    }

    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    if (slides.length > 1) {
        var current = 0;
        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    qsa('[data-player]').forEach(function (player) {
        var video = qs('video', player);
        var overlay = qs('[data-player-overlay]', player);
        var button = qs('[data-player-button]', player);
        if (!video || !button) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var ready = false;
        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }
        function tryPlay() {
            hideOverlay();
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        }
        function start() {
            if (ready) {
                tryPlay();
                return;
            }
            ready = true;
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, tryPlay);
                hls.on(window.Hls.Events.ERROR, function () {
                    if (!video.src) {
                        video.src = stream;
                    }
                });
            } else {
                video.src = stream;
                tryPlay();
            }
        }
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            start();
        });
        if (overlay) {
            overlay.addEventListener('click', start);
        }
        video.addEventListener('play', hideOverlay);
    });
})();
