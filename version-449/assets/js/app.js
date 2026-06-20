(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", mobileNav.classList.contains("is-open") ? "true" : "false");
    });
  }

  var slides = selectAll("[data-hero-slide]");
  var dots = selectAll("[data-hero-dot]");
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      var active = current === activeIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle("is-active", current === activeIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  selectAll("[data-filter-scope]").forEach(function (scope) {
    var search = scope.querySelector("[data-filter-search]");
    var type = scope.querySelector("[data-filter-type]");
    var region = scope.querySelector("[data-filter-region]");
    var year = scope.querySelector("[data-filter-year]");
    var cards = selectAll("[data-movie-card]", scope);
    var empty = scope.querySelector("[data-empty]");

    function matches(card) {
      var keyword = search ? search.value.trim().toLowerCase() : "";
      var typeValue = type ? type.value : "";
      var regionValue = region ? region.value : "";
      var yearValue = year ? year.value : "";
      var haystack = (card.getAttribute("data-search") || "").toLowerCase();
      var cardType = card.getAttribute("data-type") || "";
      var cardRegion = card.getAttribute("data-region") || "";
      var cardYear = card.getAttribute("data-year") || "";
      var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      var typeMatch = !typeValue || cardType === typeValue;
      var regionMatch = !regionValue || cardRegion === regionValue;
      var yearMatch = !yearValue || cardYear === yearValue;
      return keywordMatch && typeMatch && regionMatch && yearMatch;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [search, type, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  });
})();
