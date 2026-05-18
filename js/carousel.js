/**
 * ═══════════════════════════════════════════════════════════
 * Elektrikçi Projesi | CKR TECH | js/carousel.js
 * Hizmetler Bölümü — Mobil Yatay Slider
 * Dot göstergeli, ok butonlu, scroll-snap ile uyumlu
 * ══════════════════════════════════════════════════════════
 */

'use strict';

(function initServicesCarousel() {

  /* ── ELEMANLAR ──────────────────────────────────────────── */
  const carousel  = document.getElementById('servicesCarousel');
  const dotsWrap  = document.getElementById('carouselDots');
  const prevBtn   = document.getElementById('prevBtn');
  const nextBtn   = document.getElementById('nextBtn');

  if (!carousel || !dotsWrap) return;

  const cards     = Array.from(carousel.querySelectorAll('.service-card'));
  const cardCount = cards.length;

  if (!cardCount) return;

  /* ── DURUM ──────────────────────────────────────────────── */
  let currentIndex  = 0;
  let isMobile      = false;
  let scrollTimeout = null;

  /* ── YARDIMCILAR ────────────────────────────────────────── */

  /**
   * Ekranın mobil carousel modunda mı olduğunu kontrol eder
   * (CSS breakpoint ile senkronize: max-width 768px)
   */
  const checkMobile = () => window.innerWidth <= 768;

  /**
   * Belirtilen indexe git
   * @param {number} index
   */
  const goTo = (index) => {
    const clamped = Math.max(0, Math.min(index, cardCount - 1));
    currentIndex = clamped;

    const card = cards[clamped];
    if (!card) return;

    // Kartı görünür hale getir
    carousel.scrollTo({
      left:     card.offsetLeft - carousel.offsetLeft,
      behavior: 'smooth'
    });

    updateDots();
  };

  /* ── DOT GÖSTERGELER ────────────────────────────────────── */

  /**
   * Dot'ları oluştur (bir kez çağrılır)
   */
  const buildDots = () => {
    dotsWrap.innerHTML = '';

    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className      = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Hizmet ${i + 1}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');

      dot.addEventListener('click', () => goTo(i));

      dotsWrap.appendChild(dot);
    });
  };

  /**
   * Aktif dot'u güncelle
   */
  const updateDots = () => {
    const dots = dotsWrap.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
      dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
    });
  };

  /* ── OK BUTONLARI ───────────────────────────────────────── */

  if (prevBtn) {
    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));
  }

  /* ── SCROLL TAKİBİ ──────────────────────────────────────── */
  /**
   * Carousel scroll pozisyonuna göre aktif kartı belirle
   * Throttled (performans için)
   */
  const onScroll = () => {
    if (scrollTimeout) return;

    scrollTimeout = setTimeout(() => {
      scrollTimeout = null;

      if (!isMobile) return;

      const scrollLeft    = carousel.scrollLeft;
      const carouselLeft  = carousel.offsetLeft;

      // Hangi kart en solda görünüyor?
      let closest      = 0;
      let closestDist  = Infinity;

      cards.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft - carouselLeft - scrollLeft);
        if (dist < closestDist) {
          closestDist = dist;
          closest     = i;
        }
      });

      if (closest !== currentIndex) {
        currentIndex = closest;
        updateDots();
      }
    }, 80);
  };

  carousel.addEventListener('scroll', onScroll, { passive: true });

  /* ── KLAVYE NAVİGASYONU ─────────────────────────────────── */
  carousel.addEventListener('keydown', (e) => {
    if (!isMobile) return;

    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(currentIndex - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentIndex + 1); }
    if (e.key === 'Home')       { e.preventDefault(); goTo(0); }
    if (e.key === 'End')        { e.preventDefault(); goTo(cardCount - 1); }
  });

  /* ── DOKUNMATIK JEST DESTEĞİ (Touch) ────────────────────── */
  let touchStartX = 0;
  let touchEndX   = 0;
  const MIN_SWIPE = 50; // Minimum swipe mesafesi (px)

  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const delta = touchStartX - touchEndX;

    if (Math.abs(delta) > MIN_SWIPE) {
      goTo(delta > 0 ? currentIndex + 1 : currentIndex - 1);
    }
  }, { passive: true });

  /* ── RESPONSIVE YÖNETIMI ────────────────────────────────── */

  /**
   * Mobil/masaüstü modunu uygula
   */
  const applyMode = () => {
    const mobile = checkMobile();

    if (mobile !== isMobile) {
      isMobile = mobile;

      if (isMobile) {
        // Mobil moda geç: carousel aktif
        buildDots();
        goTo(0);
        carousel.setAttribute('tabindex', '0');
        carousel.setAttribute('aria-label', 'Hizmetler kaydırmalı liste');
      } else {
        // Masaüstüne geç: carousel kapat, grid göster
        dotsWrap.innerHTML = '';
        currentIndex = 0;
        carousel.scrollLeft = 0;
        carousel.removeAttribute('tabindex');
        carousel.removeAttribute('aria-label');
      }
    }
  };

  // Resize throttle
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyMode, 150);
  });

  /* ── BAŞLAT ─────────────────────────────────────────────── */
  applyMode();

  /* ── OTO-PLAY (Opsiyonel, mobil ve sadece sayfa odaktaysa) ─ */
  const AUTOPLAY_INTERVAL = 4500;
  let autoplayTimer = null;

  const startAutoplay = () => {
    if (!isMobile) return;
    autoplayTimer = setInterval(() => {
      const next = currentIndex + 1 < cardCount ? currentIndex + 1 : 0;
      goTo(next);
    }, AUTOPLAY_INTERVAL);
  };

  const stopAutoplay = () => {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  };

  // Kullanıcı etkileşiminde oto-play durdur
  carousel.addEventListener('touchstart', stopAutoplay, { passive: true });
  prevBtn?.addEventListener('click', stopAutoplay);
  nextBtn?.addEventListener('click', stopAutoplay);
  dotsWrap.addEventListener('click', stopAutoplay);

  // Sayfa görünür olduğunda oto-play başlat
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else if (isMobile) {
      startAutoplay();
    }
  });

  // IntersectionObserver ile carousel görünür olduğunda oto-play başlat
  const carouselSection = carousel.closest('section');
  if (carouselSection) {
    const visObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && isMobile) {
          startAutoplay();
        } else {
          stopAutoplay();
        }
      },
      { threshold: 0.5 }
    );
    visObs.observe(carouselSection);
  }

})();