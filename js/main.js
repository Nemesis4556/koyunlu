/**
 * ═══════════════════════════════════════════════════════════
 * Elektrikçi Projesi | CKR TECH | js/main.js
 * Loader, Navbar Scroll, Smooth Scroll, Scroll-Reveal,
 * Harita Etkileşimi, İstatistik Sayacı, Çerez Banner, Form
 * ══════════════════════════════════════════════════════════
 */

'use strict';

/* ── YARDIMCI FONKSİYONLAR ──────────────────────────────── */

/**
 * Bir elemanı CSS seçici ile seç
 * @param {string} sel - CSS seçici
 * @param {Element} [ctx=document]
 * @returns {Element|null}
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/**
 * Tüm eşleşen elemanları seç
 * @param {string} sel
 * @param {Element} [ctx=document]
 * @returns {NodeList}
 */
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

/* ── 1. LOADER ───────────────────────────────────────────── */
(function initLoader() {
  const loader   = $('#loader');
  const body     = document.body;

  if (!loader) return;

  // Sayfa yüklenene kadar kaydırmayı engelle
  body.style.overflow = 'hidden';

  // Yükleme tamamlandığında loader'ı gizle
  const hideLoader = () => {
    loader.classList.add('hidden');
    body.style.overflow = '';

    // Animasyon bittikten sonra DOM'dan kaldır
    loader.addEventListener('transitionend', () => {
      loader.remove();
    }, { once: true });
  };

  // Maksimum 2.5 saniyede loader kapansın (ağır sayfalara karşı güvence)
  window.addEventListener('load', () => {
    setTimeout(hideLoader, 2000);
  });

  // window.load'u beklemeden erken kapatma (hızlı bağlantılar için)
  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 1800);
  }
})();

/* ── 2. NAVBAR SCROLL EFEKTİ ─────────────────────────────── */
(function initNavbar() {
  const navbar = $('#navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 60;

  const updateNavbar = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  // Scroll throttle (performans)
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateNavbar();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateNavbar(); // Sayfa yenilenince mevcut konumu kontrol et
})();

/* ── 3. MOBİL MENÜ ───────────────────────────────────────── */
(function initMobileMenu() {
  const hamburger  = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  if (!hamburger || !mobileMenu) return;

  // Mobil menü linklerini seç
  const menuLinks = $$('.mobile-menu__link, .mobile-menu__cta', mobileMenu);

  const toggle = (force) => {
    const isOpen = typeof force === 'boolean' ? force : !hamburger.classList.contains('open');

    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  hamburger.addEventListener('click', () => toggle());

  // Linklere tıklanınca menüyü kapat
  menuLinks.forEach(link => {
    link.addEventListener('click', () => toggle(false));
  });

  // Sayfa dışına tıklanınca kapat
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      toggle(false);
    }
  });
})();

/* ── 4. SMOOTH SCROLL ────────────────────────────────────── */
(function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const navbarHeight = $('#navbar')?.offsetHeight || 80;
    const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ── 5. SCROLL REVEAL (IntersectionObserver) ─────────────── */
(function initScrollReveal() {
  const elements = $$('.rv');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Tek seferlik tetikle
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -50px 0px' // Biraz önceden tetikle
    }
  );

  elements.forEach(el => observer.observe(el));
})();

/* ── 6. İSTATİSTİK SAYACI ANIMASYONU ─────────────────────── */
(function initCounters() {
  const numEls = $$('.stat-item__num');
  if (!numEls.length) return;

  /**
   * Sayı animasyonu
   * @param {Element} el - Sayı elemanı
   * @param {number} target - Hedef sayı
   * @param {number} duration - Animasyon süresi (ms)
   */
  const animateCount = (el, target, duration = 1800) => {
    const start = performance.now();

    const update = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic easing
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target; // Kesin değeri garantile
      }
    };

    requestAnimationFrame(update);
  };

  // Görünürlük kontrolü
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.target, 10);
          if (!isNaN(target)) {
            animateCount(el, target);
          }
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  numEls.forEach(el => observer.observe(el));
})();

/* ── 7. HARİTA ETKİLEŞİMİ ────────────────────────────────── */
(function initMapInteraction() {
  const map        = $('#regionMap');
  const tooltip    = $('#mapTooltip');
  const provinces  = $$('.map-province', map);

  if (!map || !tooltip || !provinces.length) return;

  let mouseX = 0, mouseY = 0;

  // Tooltip konumunu güncelle
  const moveTooltip = (e) => {
    const rect     = map.getBoundingClientRect();
    const wrapRect = map.closest('.map-wrapper')?.getBoundingClientRect() || rect;

    const x = e.clientX - wrapRect.left + 12;
    const y = e.clientY - wrapRect.top  - 12;

    // Tooltip ekran dışına çıkmasın
    const maxX = wrapRect.width - 200;
    const maxY = wrapRect.height - 80;

    tooltip.style.left = Math.min(x, maxX) + 'px';
    tooltip.style.top  = Math.max(0, Math.min(y, maxY)) + 'px';

    mouseX = x;
    mouseY = y;
  };

  const showTooltip = (province) => {
    const name = province.dataset.name || '';
    const desc = province.dataset.desc || '';
    const isCenter = province.classList.contains('center-province');

    tooltip.innerHTML = `
      <strong>${name}</strong>
      ${desc ? `<span>${desc}</span>` : ''}
      ${isCenter ? '<span style="color:#ffcc00">★ Merkez Ofis</span>' : '<span style="color:#00f0ff">✓ Hizmet Bölgesi</span>'}
    `;
    tooltip.classList.add('show');
  };

  const hideTooltip = () => {
    tooltip.classList.remove('show');
  };

  // Her ili dinle
  provinces.forEach(province => {
    province.addEventListener('mouseenter', (e) => {
      moveTooltip(e);
      showTooltip(province);
    });

    province.addEventListener('mousemove', moveTooltip);

    province.addEventListener('mouseleave', hideTooltip);

    // Dokunmatik erişilebilirlik
    province.addEventListener('focus', () => showTooltip(province));
    province.addEventListener('blur', hideTooltip);
  });

  // Harita dışına çıkınca tooltip'i gizle
  map.addEventListener('mouseleave', hideTooltip);
})();

/* ── 8. HERO PARTİKÜLLER ─────────────────────────────────── */
(function initParticles() {
  const container = $('#particles');
  if (!container) return;

  const PARTICLE_COUNT = 25;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const dot = document.createElement('span');
    dot.style.cssText = `
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      left:    ${Math.random() * 100}%;
      top:     ${Math.random() * 100}%;
      width:   ${2 + Math.random() * 3}px;
      height:  ${2 + Math.random() * 3}px;
      background: ${Math.random() > 0.5 ? 'rgba(0,240,255,0.6)' : 'rgba(0,85,255,0.5)'};
      animation: particlePulse ${2 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite;
      box-shadow: 0 0 6px currentColor;
    `;
    container.appendChild(dot);
  }
})();

/* ── 9. İLETİŞİM FORMU (WHATSAPP ENTEGRELİ) ────────────────────── */
/* ── KESİN ÇÖZÜM: WHATSAPP YÖNLENDİRMESİ ── */
(function initWhatsAppForm() {
  const sendBtn = document.getElementById('sendWaBtn');
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  // Eğer sayfa yüklendiğinde buton bulunamazsa kod hata vermesin diye durdur
  if (!sendBtn || !form) return;

  // Form submit yerine doğrudan butona TIKLAMA olayını dinliyoruz
  sendBtn.addEventListener('click', function() {
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const serviceInput = document.getElementById('service');
    const messageInput = document.getElementById('message');
    const kvkkInput = document.getElementById('kvkk');

    // 1. Gerekli alanlar boş mu kontrolü (Hata varsa tarayıcı uyarısı verir)
    if (!nameInput.value.trim()) { alert('Lütfen Ad Soyad alanını doldurunuz.'); nameInput.focus(); return; }
    if (!phoneInput.value.trim()) { alert('Lütfen Telefon Numaranızı giriniz.'); phoneInput.focus(); return; }
    if (!messageInput.value.trim()) { alert('Lütfen Mesajınızı giriniz.'); messageInput.focus(); return; }
    if (!kvkkInput.checked) { alert('Lütfen KVKK metnini okuyup onaylayınız.'); return; }

    // 2. Verileri topla
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const message = messageInput.value.trim();
    const service = serviceInput.value ? serviceInput.options[serviceInput.selectedIndex].text : 'Belirtilmedi';

    // 3. WhatsApp mesajını ve linkini oluştur
    const waMessage = `Merhaba KOYUNLU Elektrik,\nWeb sitenizden yeni bir talep oluşturdum:\n\n*Ad Soyad:* ${name}\n*Telefon:* ${phone}\n*Hizmet:* ${service}\n*Detay:* ${message}`;
    const waUrl = `https://wa.me/905457189865?text=${encodeURIComponent(waMessage)}`;

    // Başarı mesajını göster
    if (success) success.style.display = 'block';

    // 4. KESİN AÇILMA GARANTİSİ: Gecikme (setTimeout) OLMADAN tıklama anında yeni sekmede aç!
    window.open(waUrl, '_blank');

    // Formu temizle ve başarı mesajını bir süre sonra gizle
    form.reset();
    setTimeout(() => {
      if (success) success.style.display = 'none';
    }, 5000);
  });
})();

/* ── 10. ÇEREZ BANNER ────────────────────────────────────── */
(function initCookieBanner() {
  const banner  = $('#cookieBanner');
  const accept  = $('#cookieAccept');
  const decline = $('#cookieDecline');

  if (!banner) return;

  // Daha önce karar verilmişse gösterme
  const cookieDecision = localStorage.getItem('ckr_cookie');
  if (cookieDecision) {
    banner.remove();
    return;
  }

  // 1.5 saniye gecikmeyle göster
  setTimeout(() => {
    banner.removeAttribute('aria-hidden');
    banner.classList.add('visible');
  }, 1500);

  const dismiss = (decision) => {
    localStorage.setItem('ckr_cookie', decision);
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 500);
  };

  accept?.addEventListener('click',  () => dismiss('accepted'));
  decline?.addEventListener('click', () => dismiss('declined'));
})();

/* ── 11. AKTİF NAV LİNK VURGULAMA ───────────────────────── */
(function initActiveNav() {
  const sections  = $$('section[id]');
  const navLinks  = $$('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.style.color = href === `#${id}` ? 'var(--accent-cyan)' : '';
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(sec => observer.observe(sec));
})();