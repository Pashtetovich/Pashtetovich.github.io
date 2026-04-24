/* =========================================================
   Старт — landing page interactivity
   - Live countdown (announcement bar + final CTA)
   - FAQ accordion (auto-close siblings)
   - Curriculum accordion (auto-close siblings)
   - IntersectionObserver reveal animations
   - Smooth anchor scrolling with sticky-nav offset
   - Header scroll shadow
   ========================================================= */

(function () {
  'use strict';

  // -------------------------------------------------------
  // 1. Countdown deadline: 6 days from initial load, at 23:59:59
  // -------------------------------------------------------
  const DEADLINE = (function () {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 0);
    return d.getTime();
  })();

  const bannerEl = document.getElementById('announcement-countdown');
  const finalEl = document.getElementById('final-countdown');

  const pad = (n) => String(n).padStart(2, '0');

  function tick() {
    const now = Date.now();
    let diff = Math.max(0, DEADLINE - now);

    const days = Math.floor(diff / 86400000); diff -= days * 86400000;
    const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
    const minutes = Math.floor(diff / 60000); diff -= minutes * 60000;
    const seconds = Math.floor(diff / 1000);

    // Announcement bar compact format: "Д : ЧЧ : ММ : СС"
    if (bannerEl) {
      bannerEl.textContent = `${days} : ${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
    }

    // Final CTA blocks
    if (finalEl) {
      const units = { days, hours, minutes, seconds };
      finalEl.querySelectorAll('[data-unit]').forEach((node) => {
        const key = node.getAttribute('data-unit');
        node.textContent = pad(units[key] ?? 0);
      });
    }
  }

  tick();
  setInterval(tick, 1000);

  // -------------------------------------------------------
  // 2. Accordion helper: auto-close siblings within a scope
  // -------------------------------------------------------
  function wireAccordion(selector) {
    const items = document.querySelectorAll(selector);
    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (item.open) {
          items.forEach((other) => {
            if (other !== item && other.open) {
              other.open = false;
            }
          });
        }
      });
    });
  }

  wireAccordion('.faq-item');
  wireAccordion('.curriculum-item');

  // -------------------------------------------------------
  // 3. IntersectionObserver reveal animations
  // -------------------------------------------------------
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // -------------------------------------------------------
  // 4. Smooth anchor scrolling with sticky-nav offset
  // -------------------------------------------------------
  const header = document.querySelector('header');
  const getOffset = () => (header ? header.offsetHeight + 12 : 80);

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - getOffset();
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // -------------------------------------------------------
  // 5. Sticky header shadow on scroll
  // -------------------------------------------------------
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 8) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
