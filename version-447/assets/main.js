const mobileButton = document.querySelector('[data-mobile-menu-button]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', () => {
        mobileNav.classList.toggle('is-open');
    });
}

document.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
        image.classList.add('image-missing');
    });
});

const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
const dotsWrap = document.querySelector('[data-hero-dots]');
let activeSlide = 0;
let heroTimer = null;

function renderHeroDots() {
    if (!dotsWrap || slides.length <= 1) {
        return;
    }

    dotsWrap.innerHTML = '';
    slides.forEach((slide, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `切换到第 ${index + 1} 个推荐`);
        dot.addEventListener('click', () => showSlide(index, true));
        dotsWrap.appendChild(dot);
    });
}

function showSlide(index, manual = false) {
    if (!slides.length) {
        return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    if (dotsWrap) {
        Array.from(dotsWrap.children).forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    if (manual) {
        startHeroTimer();
    }
}

function startHeroTimer() {
    if (heroTimer) {
        window.clearInterval(heroTimer);
    }

    if (slides.length > 1) {
        heroTimer = window.setInterval(() => showSlide(activeSlide + 1), 5200);
    }
}

renderHeroDots();
showSlide(0);
startHeroTimer();

const prevButton = document.querySelector('[data-hero-prev]');
const nextButton = document.querySelector('[data-hero-next]');

if (prevButton) {
    prevButton.addEventListener('click', () => showSlide(activeSlide - 1, true));
}

if (nextButton) {
    nextButton.addEventListener('click', () => showSlide(activeSlide + 1, true));
}

const searchParams = new URLSearchParams(window.location.search);
const incomingQuery = searchParams.get('q') || '';
const searchInput = document.querySelector('[data-movie-search]');
const categoryFilter = document.querySelector('[data-category-filter]');
const yearFilter = document.querySelector('[data-year-filter]');
const movieCards = Array.from(document.querySelectorAll('[data-movie-card]'));

if (searchInput && incomingQuery) {
    searchInput.value = incomingQuery;
}

function applyMovieFilters() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const category = categoryFilter ? categoryFilter.value : '';
    const year = yearFilter ? yearFilter.value : '';

    movieCards.forEach((card) => {
        const searchText = (card.dataset.search || '').toLowerCase();
        const matchesQuery = !query || searchText.includes(query);
        const matchesCategory = !category || card.dataset.category === category;
        const matchesYear = !year || card.dataset.year === year;
        card.classList.toggle('is-hidden', !(matchesQuery && matchesCategory && matchesYear));
    });
}

if (movieCards.length) {
    applyMovieFilters();
}

[searchInput, categoryFilter, yearFilter].forEach((control) => {
    if (control) {
        control.addEventListener('input', applyMovieFilters);
        control.addEventListener('change', applyMovieFilters);
    }
});
