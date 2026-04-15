/* ================================================================
   JB FURNITURE — INTERIAS-LEVEL JS
   Morphing nav, scroll reveals, carousel, accordion, counters
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ============ PRELOADER ============ */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('is-done'), 400);
    });
    // Fallback — force close after 3s
    setTimeout(() => preloader.classList.add('is-done'), 3000);
  }

  /* ============ MORPHING PILL NAV ============ */
  const pillNav = document.getElementById('pill-nav');
  let lastScroll = 0;
  const scrollThreshold = 80;

  function handleNavScroll() {
    const scrollY = window.scrollY;
    if (scrollY > scrollThreshold) {
      pillNav.classList.add('is-scrolled');
    } else {
      pillNav.classList.remove('is-scrolled');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ============ MOBILE MENU ============ */
  const burger = document.querySelector('.pill-nav__burger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('is-open');
      mobileMenu.classList.toggle('is-open');
      burger.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', !isOpen);
      mobileMenu.setAttribute('aria-hidden', isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close on link click
    mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  /* ============ HERO ANIMATION ============ */
  function animateHero() {
    const lines = document.querySelectorAll('.hero__line');
    const subtitle = document.querySelector('.hero__subtitle');
    const cta = document.querySelector('.hero__cta');
    const teaser = document.querySelector('.hero__teaser');

    const delay = 600; // Wait for preloader
    lines.forEach((line, i) => {
      setTimeout(() => {
        line.style.transition = 'opacity 0.8s var(--ease-out), transform 0.8s var(--ease-out)';
        line.style.opacity = '1';
        line.style.transform = 'translateY(0)';
      }, delay + i * 150);
    });
    if (subtitle) {
      setTimeout(() => {
        subtitle.style.transition = 'opacity 0.8s var(--ease-out), transform 0.8s var(--ease-out)';
        subtitle.style.opacity = '1';
        subtitle.style.transform = 'translateY(0)';
      }, delay + lines.length * 150 + 100);
    }
    if (cta) {
      setTimeout(() => {
        cta.style.transition = 'opacity 0.8s var(--ease-out), transform 0.8s var(--ease-out)';
        cta.style.opacity = '1';
        cta.style.transform = 'translateY(0)';
      }, delay + lines.length * 150 + 250);
    }
    if (teaser) {
      setTimeout(() => {
        teaser.style.transition = 'opacity 0.8s var(--ease-out), transform 0.8s var(--ease-out)';
        teaser.style.opacity = '1';
        teaser.style.transform = 'translateY(0)';
      }, delay + lines.length * 150 + 400);
    }
  }
  animateHero();

  /* ============ GSAP SCROLL REVEALS ============ */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Reveal sections on scroll
    const revealElements = document.querySelectorAll('.section-intro, .feature-card, .about__image, .stats-row, .brands__row, .featured-grid__item, .journal__card, .contact__split, .faq__list, .local-seo__grid, .accordion');

    revealElements.forEach(el => {
      gsap.from(el, {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });

    // Stagger feature cards
    gsap.from('.feature-card', {
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.features__grid',
        start: 'top 80%'
      }
    });

    // Stagger featured grid items
    gsap.from('.featured-grid__item', {
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.featured-grid__items',
        start: 'top 80%'
      }
    });

    // Brand items stagger
    gsap.from('.brands__item', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.brands__row',
        start: 'top 85%'
      }
    });
  }

  /* ============ STAT COUNTERS ============ */
  function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
      const target = parseFloat(counter.dataset.count);
      const isDecimal = target % 1 !== 0;
      const duration = 2000;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;

        if (isDecimal) {
          counter.textContent = current.toFixed(1);
        } else {
          counter.textContent = Math.floor(current).toLocaleString();
        }

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }
      requestAnimationFrame(update);
    });
  }

  // Trigger counters when stats section is in view
  const statsRow = document.querySelector('.stats-row');
  if (statsRow) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(statsRow);
  }

  /* ============ PROJECTS CAROUSEL ============ */
  const carouselTrack = document.querySelector('.carousel__track');
  const prevBtn = document.querySelector('.carousel__btn--prev');
  const nextBtn = document.querySelector('.carousel__btn--next');

  if (carouselTrack && prevBtn && nextBtn) {
    let currentIndex = 0;
    const cards = carouselTrack.querySelectorAll('.carousel__card');
    const totalCards = cards.length;

    function getCardWidth() {
      if (!cards[0]) return 0;
      const gap = 24;
      return cards[0].offsetWidth + gap;
    }

    function updateCarousel() {
      const offset = currentIndex * getCardWidth();
      carouselTrack.style.transform = `translateX(-${offset}px)`;
    }

    nextBtn.addEventListener('click', () => {
      if (currentIndex < totalCards - 1) {
        currentIndex++;
        updateCarousel();
      }
    });

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    carouselTrack.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    carouselTrack.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentIndex < totalCards - 1) { currentIndex++; }
        else if (diff < 0 && currentIndex > 0) { currentIndex--; }
        updateCarousel();
      }
    }, { passive: true });
  }

  /* ============ SERVICES ACCORDION ============ */
  const accordionItems = document.querySelectorAll('[data-accordion]');
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion__header');
    if (header) {
      header.addEventListener('click', () => {
        const wasActive = item.classList.contains('accordion__item--active');
        // Close all
        accordionItems.forEach(i => i.classList.remove('accordion__item--active'));
        // Open clicked if wasn't active
        if (!wasActive) {
          item.classList.add('accordion__item--active');
        }
      });
    }
  });

  /* ============ TESTIMONIAL SLIDER ============ */
  const testimonials = [
    {
      quote: "Fantastic service! They turned my space into a stunning oasis that truly reflects my style. The quality of the furniture is exceptional and the Staingard protection gives me complete peace of mind.",
      name: "Sarah M.",
      location: "Aldershot"
    },
    {
      quote: "Best furniture store in Hampshire. The team was incredibly helpful and knowledgeable. Got our dream sofa with free delivery and Staingard protection. Couldn't be happier!",
      name: "Rebecca T.",
      location: "Farnborough"
    },
    {
      quote: "Amazing range of beds and mattresses. We bought a Highgrove bed and the quality is outstanding. UK-made, proper craftsmanship. The finance option made it so affordable too.",
      name: "Priya K.",
      location: "Guildford"
    }
  ];

  let currentTestimonial = 0;
  const quoteEl = document.getElementById('testimonial-quote');
  const nameEl = document.getElementById('testimonial-name');
  const locationEl = document.getElementById('testimonial-location');
  const testPrev = document.getElementById('test-prev');
  const testNext = document.getElementById('test-next');

  function updateTestimonial() {
    const t = testimonials[currentTestimonial];
    if (quoteEl) quoteEl.textContent = t.quote;
    if (nameEl) nameEl.textContent = t.name;
    if (locationEl) locationEl.textContent = t.location;
  }

  if (testNext) {
    testNext.addEventListener('click', () => {
      currentTestimonial = (currentTestimonial + 1) % testimonials.length;
      updateTestimonial();
    });
  }
  if (testPrev) {
    testPrev.addEventListener('click', () => {
      currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
      updateTestimonial();
    });
  }

  /* ============ SMOOTH SCROLL ============ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
