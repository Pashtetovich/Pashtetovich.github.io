/* =====================================================
   Olivea — landing page interactions
   - Header scrolled state
   - Mobile menu
   - Smooth anchor scrolling (with fixed-header offset)
   - IntersectionObserver reveal-on-scroll
   - Reservation form validation + success state
   ===================================================== */

(function () {
  'use strict';

  // ---------------------------------------------------
  // Header: translucent background once scrolled
  // ---------------------------------------------------
  const header = document.getElementById('site-header');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------------------------------------------------
  // Mobile menu toggle
  // ---------------------------------------------------
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('hidden') === false;
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------------------------------------------------
  // Smooth anchor scrolling (accounts for fixed header)
  // ---------------------------------------------------
  const getHeaderOffset = () => (header ? header.offsetHeight : 0);

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset() + 1;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---------------------------------------------------
  // Reveal-on-scroll with IntersectionObserver
  // ---------------------------------------------------
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
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
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ---------------------------------------------------
  // Reservation form
  // ---------------------------------------------------
  const form = document.getElementById('reservationForm');
  const success = document.getElementById('reservationSuccess');

  const validators = {
    name: (v) => (v.trim().length >= 2 ? '' : 'Please tell us your name.'),
    email: (v) => {
      if (!v.trim()) return 'Email is required.';
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
      return ok ? '' : 'Please enter a valid email.';
    },
    date: (v) => {
      if (!v) return 'Please pick a date.';
      const picked = new Date(v + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return picked >= today ? '' : 'Date cannot be in the past.';
    },
    time: (v) => (v ? '' : 'Please pick a time.'),
    guests: (v) => (v ? '' : 'How many guests?'),
  };

  const setFieldError = (name, message) => {
    if (!form) return;
    const input = form.querySelector(`[name="${name}"]`);
    const errorEl = form.querySelector(`[data-error-for="${name}"]`);
    if (!input || !errorEl) return;
    const field = input.closest('.form-field');
    if (message) {
      field?.classList.add('has-error');
      errorEl.textContent = message;
      input.setAttribute('aria-invalid', 'true');
    } else {
      field?.classList.remove('has-error');
      errorEl.textContent = '';
      input.removeAttribute('aria-invalid');
    }
  };

  // Live clear of errors when user edits a field
  if (form) {
    Object.keys(validators).forEach((name) => {
      const input = form.querySelector(`[name="${name}"]`);
      if (!input) return;
      const handler = () => {
        const msg = validators[name](input.value);
        setFieldError(name, msg);
      };
      input.addEventListener('blur', handler);
      input.addEventListener('change', handler);
    });

    // Set min date on the date input to today
    const dateInput = form.querySelector('#date');
    if (dateInput) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      dateInput.min = `${yyyy}-${mm}-${dd}`;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let firstInvalid = null;
      Object.keys(validators).forEach((name) => {
        const input = form.querySelector(`[name="${name}"]`);
        if (!input) return;
        const msg = validators[name](input.value);
        setFieldError(name, msg);
        if (msg && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      // Show success state
      if (success) {
        form.classList.add('hidden');
        success.classList.remove('hidden');
        success.setAttribute('role', 'status');
        success.setAttribute('aria-live', 'polite');

        setTimeout(() => {
          form.reset();
          form.classList.remove('hidden');
          success.classList.add('hidden');
        }, 4000);
      }
    });
  }
})();
