document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var previous = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startSlider() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        startSlider();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(current - 1);
        startSlider();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startSlider();
      });
    }

    startSlider();
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var searchInput = document.querySelector("[data-movie-search]");
  var regionFilter = document.querySelector("[data-filter-region]");
  var typeFilter = document.querySelector("[data-filter-type]");
  var yearFilter = document.querySelector("[data-filter-year]");

  function applyFilters() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var region = regionFilter ? regionFilter.value : "";
    var type = typeFilter ? typeFilter.value : "";
    var year = yearFilter ? yearFilter.value : "";

    cards.forEach(function (card) {
      var text = card.getAttribute("data-search") || "";
      var cardRegion = card.getAttribute("data-region") || "";
      var cardType = card.getAttribute("data-type") || "";
      var cardYear = card.getAttribute("data-year") || "";
      var matched = true;

      if (query && text.indexOf(query) === -1) {
        matched = false;
      }

      if (region && cardRegion.indexOf(region) === -1) {
        matched = false;
      }

      if (type && cardType.indexOf(type) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      card.hidden = !matched;
    });
  }

  [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });
});
