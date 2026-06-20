(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
            var cover = slides[current].getAttribute("data-cover");
            if (cover) {
                hero.style.setProperty("--hero-cover", "url('" + cover + "')");
            }
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var input = panel.querySelector("[data-search]");
        var typeSelect = panel.querySelector("[data-type]");
        var yearSelect = panel.querySelector("[data-year]");
        var regionSelect = panel.querySelector("[data-region]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var counter = document.querySelector("[data-result-count]");
        var empty = document.querySelector("[data-empty]");

        function getValue(node) {
            return node ? String(node.value || "").trim().toLowerCase() : "";
        }

        function apply() {
            var keyword = getValue(input);
            var type = getValue(typeSelect);
            var year = getValue(yearSelect);
            var region = getValue(regionSelect);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year")
                ].join(" ").toLowerCase();
                var matched = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (type && String(card.getAttribute("data-type") || "").toLowerCase().indexOf(type) === -1) {
                    matched = false;
                }
                if (year && String(card.getAttribute("data-year") || "").toLowerCase() !== year) {
                    matched = false;
                }
                if (region && String(card.getAttribute("data-region") || "").toLowerCase().indexOf(region) === -1) {
                    matched = false;
                }
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (counter) {
                counter.textContent = "当前显示 " + visible + " 部";
            }
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, typeSelect, yearSelect, regionSelect].forEach(function (node) {
            if (node) {
                node.addEventListener("input", apply);
                node.addEventListener("change", apply);
            }
        });
        apply();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
