/*  Catherine Parra — "Chambers"
    Dependency-free progressive enhancement:
    mobile nav, scroll-spy, portfolio filtering, back-to-top, quiet reveal.  */

(function () {
  'use strict';

  var header = document.querySelector('.masthead');
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('primary-nav');
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]')) : [];
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var toTop = document.getElementById('to-top');
  var desktop = window.matchMedia('(min-width: 64em)');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- Header height drives scroll-padding so anchors land below the band -- */
  function measureHeader() {
    if (!header) return;
    document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
  }

  /* ---- Mobile navigation ------------------------------------------------- */
  function setNav(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  function navIsOpen() {
    return !!nav && nav.classList.contains('is-open');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setNav(!navIsOpen());
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        setNav(false);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navIsOpen()) {
        setNav(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (navIsOpen() && !nav.contains(event.target) && !toggle.contains(event.target)) {
        setNav(false);
      }
    });

    desktop.addEventListener('change', function () {
      setNav(false);
    });
  }

  /* ---- Scroll-spy -------------------------------------------------------- */
  function spy() {
    if (!sections.length) return;
    var offset = (header ? header.offsetHeight : 0) + 32;
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    var active = sections[0];

    if (atBottom) {
      active = sections[sections.length - 1];
    } else {
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top - offset <= 0) active = section;
      });
    }

    navLinks.forEach(function (link) {
      if (link.getAttribute('href') === '#' + active.id) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  /* ---- Back to top ------------------------------------------------------- */
  function toggleToTop() {
    if (!toTop) return;
    toTop.hidden = window.scrollY < 600;
  }

  if (toTop) {
    toTop.addEventListener('click', function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: calm.matches ? 'auto' : 'smooth' });
      var landing = document.querySelector('.wordmark');
      if (landing) landing.focus({ preventScroll: true });
    });
  }

  /* ---- Scroll loop (rAF-throttled) --------------------------------------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      spy();
      toggleToTop();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    measureHeader();
    onScroll();
  });

  /* ---- Portfolio filtering ----------------------------------------------- */
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var works = Array.prototype.slice.call(document.querySelectorAll('.work'));
  var status = document.getElementById('portfolio-status');

  function applyFilter(button) {
    var key = button.getAttribute('data-filter');
    var shown = 0;

    filters.forEach(function (other) {
      var on = other === button;
      other.classList.toggle('is-active', on);
      other.setAttribute('aria-pressed', String(on));
    });

    works.forEach(function (work) {
      var tags = (work.getAttribute('data-tags') || '').split(' ');
      var match = key === '*' || tags.indexOf(key) !== -1;
      work.hidden = !match;
      if (match) shown += 1;
    });

    if (status) {
      var label = button.textContent.replace(/\s+/g, ' ').trim();
      var noun = shown === 1 ? 'work' : 'works';
      status.textContent = key === '*'
        ? 'Showing all ' + shown + ' ' + noun + '.'
        : 'Showing ' + shown + ' ' + noun + ' in ' + label + '.';
    }
  }

  filters.forEach(function (button) {
    button.addEventListener('click', function () {
      applyFilter(button);
    });
  });

  /* ---- Quiet reveal on scroll -------------------------------------------- */
  function armReveals() {
    var targets = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!targets.length) return;

    if (calm.matches || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    targets.forEach(function (el) {
      // Only arm what is still below the fold, so nothing already painted flashes.
      if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
        el.classList.add('is-armed');
        observer.observe(el);
      }
    });
  }

  measureHeader();
  armReveals();
  spy();
  toggleToTop();
})();
