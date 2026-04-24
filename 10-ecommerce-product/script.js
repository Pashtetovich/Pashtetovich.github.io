/* КЛЫК — product page interactions
   Plain vanilla JS, no dependencies. */

(function () {
  'use strict';

  // ------- Gallery -------
  const images = [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80',
    'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=1200&q=80',
    'https://images.unsplash.com/photo-1520256862855-398228c41684?w=1200&q=80',
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1200&q=80'
  ];

  const mainImage = document.getElementById('mainImage');
  const thumbs = Array.from(document.querySelectorAll('.thumb'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let currentIndex = 0;

  function setImage(index) {
    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;
    currentIndex = index;

    mainImage.classList.add('fade-out');
    setTimeout(() => {
      mainImage.src = images[index];
      mainImage.classList.remove('fade-out');
    }, 180);

    thumbs.forEach((t, i) => {
      const active = i === index;
      t.classList.toggle('border-ink', active);
      t.classList.toggle('border-transparent', !active);
    });
  }

  thumbs.forEach((t, i) => {
    t.addEventListener('click', () => setImage(i));
  });
  prevBtn.addEventListener('click', () => setImage(currentIndex - 1));
  nextBtn.addEventListener('click', () => setImage(currentIndex + 1));

  // Keyboard arrows when gallery focused
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowLeft') setImage(currentIndex - 1);
    if (e.key === 'ArrowRight') setImage(currentIndex + 1);
  });

  // ------- Color swatches -------
  const swatches = document.querySelectorAll('.swatch');
  const colorLabel = document.getElementById('colorLabel');
  swatches.forEach((sw) => {
    sw.addEventListener('click', () => {
      swatches.forEach((x) => {
        x.setAttribute('aria-pressed', 'false');
        x.classList.remove('border-ink', 'ring-2', 'ring-offset-2', 'ring-ink');
        x.classList.add('border-line');
      });
      sw.setAttribute('aria-pressed', 'true');
      sw.classList.remove('border-line');
      sw.classList.add('border-ink', 'ring-2', 'ring-offset-2', 'ring-ink');
      colorLabel.textContent = sw.dataset.color;
    });
  });

  // ------- Size selector -------
  const sizeButtons = document.querySelectorAll('.size-btn');
  const sizeHint = document.getElementById('sizeHint');
  let selectedSize = null;

  sizeButtons.forEach((b) => {
    b.addEventListener('click', () => {
      if (b.hasAttribute('disabled')) return;
      sizeButtons.forEach((x) => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      selectedSize = b.dataset.size;
      sizeHint.textContent = 'Выбран размер ' + selectedSize;
      sizeHint.classList.remove('text-accent');
      sizeHint.classList.add('text-ink');
    });
  });

  // ------- Quantity stepper -------
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const qtyValue = document.getElementById('qtyValue');
  let qty = 1;

  function updateQty(delta) {
    qty = Math.min(10, Math.max(1, qty + delta));
    qtyValue.textContent = qty;
  }
  qtyMinus.addEventListener('click', () => updateQty(-1));
  qtyPlus.addEventListener('click', () => updateQty(+1));

  // ------- Add to cart -------
  const addBtn = document.getElementById('addToCart');
  const addBtnText = document.getElementById('addToCartText');
  const cartCount = document.getElementById('cartCount');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  let cart = parseInt(cartCount.textContent, 10) || 0;

  function showToast(message) {
    toastText.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  addBtn.addEventListener('click', () => {
    if (!selectedSize) {
      sizeHint.textContent = 'Пожалуйста, выберите размер';
      sizeHint.classList.add('text-accent');
      sizeHint.classList.remove('text-ink', 'text-muted');
      // scroll to sizes softly
      document.getElementById('sizes').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const originalText = addBtnText.textContent;
    addBtn.classList.add('btn-success');
    addBtnText.textContent = '✓ Добавлено в корзину';

    cart += qty;
    cartCount.textContent = cart;
    cartCount.classList.remove('counter-pulse');
    // force reflow to re-trigger animation
    void cartCount.offsetWidth;
    cartCount.classList.add('counter-pulse');

    showToast('Добавлено: Север · Зима, размер ' + selectedSize + ' (×' + qty + ')');

    setTimeout(() => {
      addBtn.classList.remove('btn-success');
      addBtnText.textContent = originalText;
    }, 1600);
  });

  // ------- Accordion (single-open) -------
  const accItems = document.querySelectorAll('.acc-item');
  accItems.forEach((item) => {
    const head = item.querySelector('.acc-head');
    const body = item.querySelector('.acc-body');
    const icon = item.querySelector('.acc-icon');

    head.addEventListener('click', () => {
      const isOpen = !body.classList.contains('hidden');

      // close all
      accItems.forEach((x) => {
        x.querySelector('.acc-body').classList.add('hidden');
        x.querySelector('.acc-head').setAttribute('aria-expanded', 'false');
        const ic = x.querySelector('.acc-icon');
        if (ic) ic.classList.remove('rotate-180');
      });

      // toggle current
      if (!isOpen) {
        body.classList.remove('hidden');
        head.setAttribute('aria-expanded', 'true');
        if (icon) icon.classList.add('rotate-180');
      }
    });
  });

  // ------- Newsletter form -------
  const form = document.getElementById('newsletterForm');
  const emailInput = document.getElementById('emailInput');
  const nlMessage = document.getElementById('nlMessage');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = emailInput.value.trim();
    nlMessage.classList.remove('text-emerald-300', 'text-rose-300');

    if (!value) {
      nlMessage.textContent = 'Введите email';
      nlMessage.classList.add('text-rose-300');
      emailInput.focus();
      return;
    }
    if (!EMAIL_RE.test(value)) {
      nlMessage.textContent = 'Проверьте правильность адреса';
      nlMessage.classList.add('text-rose-300');
      emailInput.focus();
      return;
    }

    nlMessage.textContent = '✓ Готово! Промокод отправлен на ' + value;
    nlMessage.classList.add('text-emerald-300');
    emailInput.value = '';
  });

  // ------- IntersectionObserver reveal -------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
})();
