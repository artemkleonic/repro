'use strict';

/**
 * REPRONOVA main.js (updated for Search)
 * - AOS animations
 * - Swiper sliders
 * - Header scroll + back-to-top
 * - Mobile menu (ESC / click outside / close on link)
 * - Smooth scroll with correct offset under fixed header
 * - Counters
 * - i18n skeleton
 * - Forms
 * - Dynamic CSS var: --header-current
 * - Search overlay + basic in-page search highlight
 * - Language dropdown (aria + click outside)  ✅ moved from HTML
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==================== AOS ==================== */
  if (window.AOS) {
    AOS.init({ once: true, duration: 700 });
  }

  /* ==================== SWIPER ==================== */
  if (window.Swiper) {
    new Swiper('.swiper-services', {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 24,
      pagination: { el: '.services-pagination', clickable: true },
      breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
    });

    new Swiper('.swiper-testimonials', {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 24,
      pagination: { el: '.testimonials-pagination', clickable: true },
      breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
    });
  }

  /* ==================== DOM ELEMENTS ==================== */
  const header = document.getElementById('site-header');
  const backToTop = document.getElementById('back-to-top');
  const burger = document.getElementById('burger');
  const navMobile = document.getElementById('nav-mobile');

  // Language switcher
  const langSwitcherEl = document.getElementById('lang-switcher');
  const langCurrentBtn = langSwitcherEl ? langSwitcherEl.querySelector('.lang-current') : null;

  // Search elements (must exist in HTML)
  const searchOverlay = document.getElementById('search-overlay');
  const openSearchBtn = document.getElementById('open-search');
  const openSearchMobileBtn = document.getElementById('open-search-mobile');
  const closeSearchBtn = document.getElementById('close-search');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');

  /* ==================== HELPERS ==================== */
  function setHeaderCurrentVar() {
    const h = header ? header.offsetHeight : 0;
    document.documentElement.style.setProperty('--header-current', `${h}px`);
  }

  function getScrollOffset() {
    const h = header ? header.offsetHeight : 0;
    return h + 10;
  }

  /* ==================== HEADER SCROLL + BACK TO TOP ==================== */
  function handleScroll() {
    const y = window.scrollY || window.pageYOffset;

    if (header) header.classList.toggle('scrolled', y > 40);
    if (backToTop) backToTop.classList.toggle('visible', y > 300);

    setHeaderCurrentVar();
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', setHeaderCurrentVar);
  setHeaderCurrentVar();
  handleScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ==================== MOBILE MENU ==================== */
  function setMenuState(open) {
    if (!burger || !navMobile) return;

    if (open) {
      burger.classList.add('active');
      navMobile.classList.add('open');
      document.body.classList.add('menu-open');
    } else {
      burger.classList.remove('active');
      navMobile.classList.remove('open');
      document.body.classList.remove('menu-open');
    }
  }

  function toggleMenu(forceState) {
    if (!burger || !navMobile) return;
    const shouldOpen =
      typeof forceState === 'boolean' ? forceState : !navMobile.classList.contains('open');
    setMenuState(shouldOpen);
  }

  if (burger && navMobile) {
    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    navMobile.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) toggleMenu(false);
    });

    document.addEventListener('click', (e) => {
      if (!navMobile.classList.contains('open')) return;
      const clickInsideMenu = navMobile.contains(e.target);
      const clickOnBurger = burger.contains(e.target);
      if (!clickInsideMenu && !clickOnBurger) toggleMenu(false);
    });
  }

  /* ==================== SEARCH OVERLAY ==================== */
  let lastFocusEl = null;

  function openSearch() {
    if (!searchOverlay) return;

    // close menu if open (so it doesn't overlap)
    if (navMobile && navMobile.classList.contains('open')) toggleMenu(false);

    lastFocusEl = document.activeElement;

    searchOverlay.classList.add('open');
    searchOverlay.setAttribute('aria-hidden', 'false');

    if (openSearchBtn) openSearchBtn.setAttribute('aria-expanded', 'true');

    // lock scroll
    document.body.classList.add('search-open');

    // focus input
    window.setTimeout(() => {
      if (searchInput) searchInput.focus();
    }, 30);
  }

  function closeSearch() {
    if (!searchOverlay) return;

    searchOverlay.classList.remove('open');
    searchOverlay.setAttribute('aria-hidden', 'true');

    if (openSearchBtn) openSearchBtn.setAttribute('aria-expanded', 'false');

    document.body.classList.remove('search-open');

    // restore focus
    if (lastFocusEl && typeof lastFocusEl.focus === 'function') {
      window.setTimeout(() => lastFocusEl.focus(), 0);
    }
  }

  if (openSearchBtn) openSearchBtn.addEventListener('click', openSearch);
  if (openSearchMobileBtn) openSearchMobileBtn.addEventListener('click', openSearch);
  if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);

  if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) closeSearch();
    });
  }

  // ESC: close search OR menu OR language dropdown
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    if (searchOverlay && searchOverlay.classList.contains('open')) {
      closeSearch();
      return;
    }

    if (navMobile && navMobile.classList.contains('open')) {
      toggleMenu(false);
      return;
    }

    if (langSwitcherEl && langSwitcherEl.classList.contains('open')) {
      langSwitcherEl.classList.remove('open');
      if (langCurrentBtn) langCurrentBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ==================== BASIC IN-PAGE SEARCH ==================== */
  function clearHighlights() {
    const marks = document.querySelectorAll('mark.repro-mark');
    marks.forEach((m) => {
      const parent = m.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    });
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function shouldSkipNode(node) {
    if (!node || !node.parentElement) return true;

    const el = node.parentElement;
    const tag = el.tagName;

    if (
      tag === 'SCRIPT' ||
      tag === 'STYLE' ||
      tag === 'NOSCRIPT' ||
      tag === 'IFRAME' ||
      tag === 'TEXTAREA' ||
      tag === 'INPUT' ||
      tag === 'BUTTON' ||
      tag === 'SELECT'
    ) return true;

    if (el.closest('header')) return true;
    if (el.closest('nav')) return true;
    if (el.closest('footer')) return true;
    if (el.closest('#search-overlay')) return true;

    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return true;

    return false;
  }

  function highlightInMain(query) {
    clearHighlights();

    const q = (query || '').trim();
    if (!q) return { count: 0, first: null };

    const main = document.querySelector('main');
    if (!main) return { count: 0, first: null };

    const re = new RegExp(escapeRegExp(q), 'gi');
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let firstMark = null;
    let total = 0;

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.nodeValue;

      if (!re.test(text)) continue;
      re.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      while ((match = re.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;

        if (start > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, start)));
        }

        const mark = document.createElement('mark');
        mark.className = 'repro-mark';
        mark.textContent = text.slice(start, end);
        frag.appendChild(mark);

        if (!firstMark) firstMark = mark;

        total += 1;
        lastIndex = end;
      }

      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      node.parentNode.replaceChild(frag, node);
    }

    return { count: total, first: firstMark };
  }

  function scrollToMark(markEl) {
    if (!markEl) return;
    const rect = markEl.getBoundingClientRect();
    const top = rect.top + window.scrollY - getScrollOffset();
    window.scrollTo({ top, behavior: 'smooth' });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const query = searchInput ? searchInput.value : '';
      closeSearch();

      const result = highlightInMain(query);
      if (result.first) window.setTimeout(() => scrollToMark(result.first), 50);
    });
  }

  /* ==================== SMOOTH SCROLL FOR ANCHORS ==================== */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const targetId = href.slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    const top = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();
    window.scrollTo({ top, behavior: 'smooth' });

    if (navMobile && navMobile.classList.contains('open')) toggleMenu(false);
  });

  /* ==================== COUNTERS ==================== */
  const counters = document.querySelectorAll('[data-counter]');

  function setCounterFinalValue(el) {
    const target = Number(el.getAttribute('data-counter')) || 0;
    if (target >= 1000) el.textContent = String(target);
    else el.textContent = `${target}+`;
  }

  if ('IntersectionObserver' in window && counters.length) {
    const countersObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = Number(el.getAttribute('data-counter')) || 0;
        const duration = 1500;
        const start = performance.now();

        function animate(time) {
          const progress = Math.min((time - start) / duration, 1);
          const value = Math.floor(target * progress);

          if (target >= 1000) el.textContent = String(value);
          else el.textContent = `${value}+`;

          if (progress < 1) requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
        observer.unobserve(el);
      });
    }, { threshold: 0.4 });

    counters.forEach((c) => countersObserver.observe(c));
  } else {
    counters.forEach(setCounterFinalValue);
  }

  /* ==================== I18N (SKELETON) ==================== */
  const translations = window.REPRONOVA_TRANSLATIONS || {};
  let currentLang = 'en';

  function applyTranslations() {
    const dict = translations[currentLang];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = dict[key];
      if (!value) return;

      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') el.placeholder = value;
      else el.textContent = value;
    });
  }

  function updateLangSwitcherUI(lang) {
    if (!langSwitcherEl) return;

    if (langCurrentBtn) langCurrentBtn.textContent = lang.toUpperCase();

    langSwitcherEl.querySelectorAll('[data-lang]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  function setLanguage(lang) {
    if (!translations[lang] && Object.keys(translations).length) return;

    currentLang = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('repronovaLang', lang);

    updateLangSwitcherUI(lang);
    applyTranslations();
  }

  (function initLanguage() {
    const saved = localStorage.getItem('repronovaLang');
    const browser = (navigator.language || navigator.userLanguage || 'en').slice(0, 2);

    if (saved && (translations[saved] || !Object.keys(translations).length)) {
      currentLang = saved;
    } else if (translations[browser]) {
      currentLang = browser;
    } else {
      currentLang = 'en';
    }

    updateLangSwitcherUI(currentLang);
    applyTranslations();
  })();

  /* ==================== LANGUAGE DROPDOWN (moved from HTML) ==================== */
  function openLangMenu() {
    if (!langSwitcherEl || !langCurrentBtn) return;
    langSwitcherEl.classList.add('open');
    langCurrentBtn.setAttribute('aria-expanded', 'true');
  }

  function closeLangMenu() {
    if (!langSwitcherEl || !langCurrentBtn) return;
    langSwitcherEl.classList.remove('open');
    langCurrentBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleLangMenu() {
    if (!langSwitcherEl || !langCurrentBtn) return;
    const isOpen = langSwitcherEl.classList.contains('open');
    if (isOpen) closeLangMenu();
    else openLangMenu();
  }

  // click on current language button toggles dropdown
  if (langCurrentBtn) {
    langCurrentBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleLangMenu();
    });
  }

  // click outside closes dropdown
  document.addEventListener('click', (e) => {
    if (!langSwitcherEl || !langSwitcherEl.classList.contains('open')) return;
    if (!langSwitcherEl.contains(e.target)) closeLangMenu();
  });

  // click on language option sets language + closes dropdown
  if (langSwitcherEl) {
    langSwitcherEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-lang]');
      if (!btn) return;

      const lang = btn.dataset.lang;
      if (!lang) return;

      setLanguage(lang);
      closeLangMenu();
    });
  }

  /* ==================== FORMS ==================== */
  const contactForm = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');

  if (contactForm && formMessage) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const dict = translations[currentLang] || {};
      const defaultText = 'Thank you! We will get back to you within 1–2 business days.';
      formMessage.textContent = dict['contact.success'] || defaultText;

      contactForm.reset();
    });
  }

  const subscribeForm = document.getElementById('subscribe-form');
  const subscribeMessage = document.getElementById('subscribe-message');

  if (subscribeForm && subscribeMessage) {
    subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('subscribe-email');
      if (!emailInput || !emailInput.value.trim()) return;

      const dict = translations[currentLang] || {};
      const defaultText = 'Thank you for subscribing!';
      subscribeMessage.textContent = dict['footer.subscribe.success'] || defaultText;

      subscribeForm.reset();
    });
  }
});
