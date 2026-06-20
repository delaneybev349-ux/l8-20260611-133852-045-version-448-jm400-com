(function () {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const heroDots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let heroIndex = 0;
    let heroTimer = null;

    function showHeroSlide(index) {
        if (!heroSlides.length) {
            return;
        }

        heroIndex = (index + heroSlides.length) % heroSlides.length;

        heroSlides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === heroIndex);
        });

        heroDots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === heroIndex);
        });
    }

    function startHeroTimer() {
        if (heroSlides.length < 2) {
            return;
        }

        heroTimer = window.setInterval(function () {
            showHeroSlide(heroIndex + 1);
        }, 5200);
    }

    heroDots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            window.clearInterval(heroTimer);
            showHeroSlide(index);
            startHeroTimer();
        });
    });

    showHeroSlide(0);
    startHeroTimer();

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    const filterPanels = Array.from(document.querySelectorAll('[data-filter-panel]'));

    filterPanels.forEach(function (panel) {
        const root = panel.closest('section') || document;
        const input = panel.querySelector('[data-search-input]');
        const yearSelect = panel.querySelector('[data-filter-year]');
        const typeSelect = panel.querySelector('[data-filter-type]');
        const cards = Array.from(root.querySelectorAll('[data-movie-card]'));
        const empty = document.createElement('div');
        empty.className = 'empty-filter';
        empty.textContent = '没有匹配的影片，请调整筛选条件。';

        if (cards.length) {
            const grid = cards[cards.length - 1].parentElement;
            if (grid) {
                grid.after(empty);
            }
        }

        function applyFilter() {
            const query = normalize(input ? input.value : '');
            const year = normalize(yearSelect ? yearSelect.value : '');
            const type = normalize(typeSelect ? typeSelect.value : '');
            let visible = 0;

            cards.forEach(function (card) {
                const searchText = normalize(card.dataset.search || card.textContent);
                const cardYear = normalize(card.dataset.year);
                const cardType = normalize(card.dataset.type);
                const matched = (!query || searchText.indexOf(query) !== -1) &&
                    (!year || cardYear === year) &&
                    (!type || cardType === type);

                card.classList.toggle('is-hidden-by-filter', !matched);

                if (matched) {
                    visible += 1;
                }
            });

            empty.classList.toggle('is-visible', cards.length > 0 && visible === 0);
        }

        [input, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });

    let hlsPromise = null;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsPromise) {
            return hlsPromise;
        }

        hlsPromise = new Promise(function (resolve, reject) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });

        return hlsPromise;
    }

    function beginPlayback(shell) {
        const video = shell.querySelector('video[data-src]');
        const button = shell.querySelector('[data-player-start]');

        if (!video) {
            return;
        }

        const source = video.dataset.src;

        if (!source) {
            return;
        }

        function playVideo() {
            const playRequest = video.play();

            if (playRequest && typeof playRequest.catch === 'function') {
                playRequest.catch(function () {
                    if (button) {
                        button.querySelector('strong').textContent = '点击继续播放';
                    }
                });
            }
        }

        if (video.dataset.ready === 'true') {
            playVideo();
            return;
        }

        shell.classList.add('is-loading');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.dataset.ready = 'true';
            shell.classList.add('is-playing');
            video.addEventListener('loadedmetadata', playVideo, { once: true });
            video.load();
            return;
        }

        loadHls()
            .then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    const hls = new Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        video.dataset.ready = 'true';
                        shell.classList.add('is-playing');
                        playVideo();
                    });
                    hls.on(Hls.Events.ERROR, function () {
                        if (button) {
                            button.querySelector('strong').textContent = '重新播放';
                        }
                    });
                } else {
                    video.src = source;
                    video.dataset.ready = 'true';
                    shell.classList.add('is-playing');
                    playVideo();
                }
            })
            .catch(function () {
                video.src = source;
                video.dataset.ready = 'true';
                shell.classList.add('is-playing');
                playVideo();
            });
    }

    document.querySelectorAll('[data-player-shell]').forEach(function (shell) {
        const button = shell.querySelector('[data-player-start]');

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                beginPlayback(shell);
            });
        }

        shell.addEventListener('dblclick', function () {
            beginPlayback(shell);
        });
    });
})();
