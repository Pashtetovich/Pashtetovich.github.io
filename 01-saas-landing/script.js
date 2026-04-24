// Scroll-triggered reveal animations
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
});

revealElements.forEach((el) => revealObserver.observe(el));

// FAQ: close others when opening one (accordion behavior)
const faqItems = document.querySelectorAll('#faq-list details');

faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
        if (item.open) {
            faqItems.forEach((other) => {
                if (other !== item) other.open = false;
            });
        }
    });
});

// Smooth-scroll offset for the fixed header
document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id.length <= 1) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const headerOffset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});
