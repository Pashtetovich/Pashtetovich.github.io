/* =========================================================
   PULSE — landing page interactions
   - IntersectionObserver reveals
   - Count-up stats animation
   - Smooth anchor scrolling
   - Scroll-triggered parallax on hero phone mockup
   - Sticky nav styling
   - Mobile menu + dynamic year + hover feature spotlight
   - Respects prefers-reduced-motion
   ========================================================= */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------- Dynamic year in footer --------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --------- Sticky nav scrolled state --------- */
  const nav = document.getElementById('nav');
  const updateNav = () => {
    if (!nav) return;
    if (window.scrollY > 10) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  /* --------- Mobile menu toggle --------- */
  const navToggle  = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('hidden') === false;
      navToggle.setAttribute('aria-expanded', String(open));
    });
    // Close the menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* --------- Smooth anchor scrolling --------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  });

  /* --------- Reveal on scroll --------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Slight stagger for sibling elements
          const delay = Math.min(i * 60, 240);
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* --------- Count-up animation for stats --------- */
  const counters = document.querySelectorAll('.count');
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  const animateCount = el => {
    const target   = parseFloat(el.dataset.target || '0');
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1600;

    if (prefersReducedMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const value = target * easeOutCubic(t);
      el.textContent = value.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else       el.textContent = target.toFixed(decimals) + suffix;
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const countObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => countObs.observe(c));
  } else {
    counters.forEach(animateCount);
  }

  /* --------- Hero phone parallax (subtle) --------- */
  const phone = document.getElementById('phoneWrap');
  if (phone && !prefersReducedMotion) {
    let ticking = false;
    const maxOffset = 36; // px — stays in the 20-40 range
    const heroHeight = () => phone.closest('section')?.offsetHeight || window.innerHeight;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const h = heroHeight();
        // Translate up to maxOffset as user scrolls the hero's height
        const progress = Math.min(Math.max(y / h, 0), 1);
        const offset = -progress * maxOffset;
        phone.style.transform = `translateY(${offset.toFixed(2)}px)`;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --------- Feature card spotlight follow --------- */
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
    });
  });
})();
