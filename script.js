/* ==========================================================================
   Redux LLC — site scripts
   --------------------------------------------------------------------------
   GOOGLE ANALYTICS
   The GA4 Measurement ID below belongs to the "Redux LLC" Analytics account
   (property: Redux LLC - reduxllc.com). Analytics only loads after a visitor
   presses Accept on the cookie banner — nothing is sent to Google before that.
   Clearing the ID switches Google Analytics off; the banner and the on-site
   click tracking keep working either way.
   ========================================================================== */
var REDUX_GA4_ID = 'G-1H6B8JPKKB';   // Redux LLC — reduxllc.com (GA4)
var REDUX_ADS_ID = '';           // optional Google Ads ID, e.g. 'AW-123456789'

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     COOKIES — small helpers
     ------------------------------------------------------------------ */
  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + (days * 86400000));
    document.cookie = name + '=' + encodeURIComponent(value) +
      ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax' +
      (location.protocol === 'https:' ? ';Secure' : '');
  }
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }
  function deleteCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  }

  var CONSENT_COOKIE = 'redux_consent';
  var VISITOR_COOKIE = 'redux_visitor';
  var JOURNEY_COOKIE = 'redux_journey';

  /* ------------------------------------------------------------------
     GOOGLE CONSENT MODE + GA4
     Everything starts denied. Nothing is stored until the visitor accepts.
     ------------------------------------------------------------------ */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  var gaLoaded = false;
  function loadAnalytics() {
    if (gaLoaded || !REDUX_GA4_ID) return;
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + REDUX_GA4_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', REDUX_GA4_ID, { send_page_view: true });
    if (REDUX_ADS_ID) gtag('config', REDUX_ADS_ID);
  }

  function grantConsent() {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
    loadAnalytics();
    startVisitorTracking();
  }

  function denyConsent() {
    gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied'
    });
    deleteCookie(VISITOR_COOKIE);
    deleteCookie(JOURNEY_COOKIE);
  }

  /* ------------------------------------------------------------------
     FIRST-PARTY VISITOR COOKIE
     Records where a visitor first landed, what sent them, and which pages
     and buttons they touched on the way to the contact form. Only written
     after the visitor accepts.
     ------------------------------------------------------------------ */
  var trackingOn = false;

  function startVisitorTracking() {
    trackingOn = true;
    if (!getCookie(VISITOR_COOKIE)) {
      var params = new URLSearchParams(location.search);
      setCookie(VISITOR_COOKIE, JSON.stringify({
        id: 'rx-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
        firstSeen: new Date().toISOString().slice(0, 10),
        landing: location.pathname,
        referrer: document.referrer ? document.referrer.split('/')[2] || '' : 'direct',
        source: params.get('utm_source') || '',
        campaign: params.get('utm_campaign') || ''
      }), 180);
    }
    recordStep('page:' + (location.pathname.split('/').pop() || 'index.html'));
  }

  function recordStep(step) {
    if (!trackingOn) return;
    var trail = [];
    try { trail = JSON.parse(getCookie(JOURNEY_COOKIE) || '[]'); } catch (e) { trail = []; }
    if (trail[trail.length - 1] !== step) trail.push(step);
    if (trail.length > 30) trail = trail.slice(-30);
    setCookie(JOURNEY_COOKIE, JSON.stringify(trail), 30);
  }

  /** Send an event to GA4 (when allowed) and add it to the on-site trail. */
  function track(name, params) {
    recordStep(name + (params && params.label ? ':' + params.label : ''));
    if (gaLoaded) gtag('event', name, params || {});
  }
  window.reduxTrack = track;

  /* ------------------------------------------------------------------
     COOKIE BANNER
     ------------------------------------------------------------------ */
  function buildCookieBanner() {
    if (document.querySelector('.cookie-banner')) return;
    var wrap = document.createElement('div');
    wrap.className = 'cookie-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-live', 'polite');
    wrap.setAttribute('aria-label', 'Cookie preferences');
    wrap.innerHTML =
      '<h4>We use cookies</h4>' +
      '<p>Redux LLC uses cookies to see which pages and projects visitors look at, ' +
      'so we can make the site more useful and improve our service. You can accept ' +
      'or decline — declining will not affect your ability to request a consultation. ' +
      '<a href="privacy.html">Read our privacy notice</a>.</p>' +
      '<div class="cookie-actions">' +
      '<button class="btn btn-primary" data-cookie="accept" type="button">Accept cookies</button>' +
      '<button class="btn btn-ghost" data-cookie="decline" type="button">Decline</button>' +
      '</div>';
    document.body.appendChild(wrap);

    wrap.addEventListener('click', function (e) {
      var choice = e.target.getAttribute && e.target.getAttribute('data-cookie');
      if (!choice) return;
      setCookie(CONSENT_COOKIE, choice === 'accept' ? 'granted' : 'denied', 180);
      if (choice === 'accept') grantConsent(); else denyConsent();
      wrap.classList.remove('is-shown');
    });

    setTimeout(function () { wrap.classList.add('is-shown'); }, 900);
  }

  function initConsent() {
    var stored = getCookie(CONSENT_COOKIE);
    if (stored === 'granted') { grantConsent(); return; }
    if (stored === 'denied') { denyConsent(); return; }
    buildCookieBanner();
  }

  /* ------------------------------------------------------------------
     PROJECT TYPES — one list, used by the picker and the services pages
     ------------------------------------------------------------------ */
  var PROJECT_TYPES = [
    'Kitchen Remodeling',
    'Bathroom Remodeling',
    'Whole-Home Renovation',
    'Home Addition',
    'Flooring Installation',
    'Windows & Doors',
    'Interior & Exterior Painting'
  ];
  window.REDUX_PROJECT_TYPES = PROJECT_TYPES;

  document.addEventListener('DOMContentLoaded', function () {

    initConsent();

    /* ---------------- Navigation ---------------- */
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('mainNav');
    if (toggle && nav) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          nav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    var current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav.main-nav a, .footer-nav a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === current) link.classList.add('active');
      else if (href === 'blog.html' && current.indexOf('blog-') === 0) link.classList.add('active');
    });

    /* ---------------- Scroll reveals ---------------- */
    var revealTargets = Array.from(document.querySelectorAll('.reveal-section'));
    document.querySelectorAll('.cards-grid .project-card, .services-grid .service-item, .process-grid .process-card, .gallery-grid .g-item, .post-grid .post-card, .area-grid .area-card').forEach(function (el, i) {
      el.classList.add('reveal-item');
      el.style.transitionDelay = Math.min(i % 5, 4) * 70 + 'ms';
      revealTargets.push(el);
    });
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealTargets.forEach(function (el) { observer.observe(el); });
    } else {
      revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* ---------------- Before / after comparison ---------------- */
    document.querySelectorAll('[data-compare]').forEach(function (compare) {
      var range = compare.querySelector('.compare-range');
      var before = compare.querySelector('.compare-before');
      var divider = compare.querySelector('.compare-divider');
      if (!range || !before || !divider) return;
      function update() {
        var value = range.value + '%';
        before.style.width = value;
        divider.style.left = value;
      }
      range.addEventListener('input', update, { passive: true });
      update();
    });

    /* ---------------- Service-area map ---------------- */
    var infoCity = document.getElementById('mapInfoCity');
    var infoCopy = document.getElementById('mapInfoCopy');
    var hotspots = document.querySelectorAll('.map-hotspot');
    hotspots.forEach(function (hotspot) {
      function activate() {
        hotspots.forEach(function (h) { h.classList.remove('is-active'); });
        hotspot.classList.add('is-active');
        if (infoCity) infoCity.textContent = hotspot.dataset.city || '';
        if (infoCopy) infoCopy.textContent = hotspot.dataset.copy || '';
        track('service_area_click', { label: hotspot.dataset.city || '' });
      }
      hotspot.addEventListener('click', activate);
      hotspot.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });

    /* ---------------- Hero video ---------------- */
    var heroVideo = document.querySelector('.hero-video');
    if (heroVideo && 'IntersectionObserver' in window) {
      var videoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) heroVideo.play().catch(function () { });
          else heroVideo.pause();
        });
      }, { threshold: 0.05 });
      videoObserver.observe(heroVideo);
    }

    /* ---------------- FAQ accordion ---------------- */
    document.querySelectorAll('.faq-q').forEach(function (btn) {
      var item = btn.closest('.faq-item');
      var answer = item.querySelector('.faq-a');
      btn.setAttribute('aria-expanded', 'false');
      if (answer && !answer.id) answer.id = 'faq-a-' + Math.random().toString(36).slice(2, 8);
      if (answer) btn.setAttribute('aria-controls', answer.id);
      btn.addEventListener('click', function () {
        var open = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
        if (open) track('faq_open', { label: btn.textContent.trim().slice(0, 60) });
      });
    });

    /* ---------------- Project interest from a service link ----------------
       Buildertrend's form lives in an iframe on their own domain, so nothing
       here can pre-select its Project Type menu — browsers forbid it. What we
       can still do is record which service brought the visitor here, so the
       reporting shows it without asking them the same question twice. */
    var arrivedFor = new URLSearchParams(location.search).get('project');
    if (arrivedFor && PROJECT_TYPES.indexOf(arrivedFor) !== -1) {
      track('project_interest', { label: arrivedFor });
    }

    /* Service cards elsewhere on the site carry the choice to the form. */
    document.querySelectorAll('[data-project-link]').forEach(function (link) {
      link.addEventListener('click', function () {
        try { sessionStorage.setItem('reduxProjectType', link.dataset.projectLink); } catch (e) { }
        track('service_cta_click', { label: link.dataset.projectLink });
      });
    });

    /* ---------------- Buildertrend iframe: fit to its content ---------------- */
    var btFrame = document.getElementById('btIframe');
    if (btFrame) {
      window.addEventListener('message', function (event) {
        if (String(event.origin).indexOf('buildertrend.net') === -1) return;
        var h = null;
        if (typeof event.data === 'number') h = event.data;
        else if (event.data && typeof event.data === 'object') h = event.data.height || event.data.frameHeight;
        else if (typeof event.data === 'string' && /^\d+$/.test(event.data)) h = parseInt(event.data, 10);
        if (h && h > 400 && h < 4000) btFrame.style.height = (h + 40) + 'px';
      });

      if ('IntersectionObserver' in window) {
        var formSeen = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              track('contact_form_view', { label: 'buildertrend' });
              formSeen.disconnect();
            }
          });
        }, { threshold: 0.3 });
        formSeen.observe(btFrame);
      }
    }

    /* ---------------- Sticky conversion bar ---------------- */
    var onContact = current === 'contact.html' || current === 'contact';
    if (!onContact && !sessionStorage.getItem('reduxStickyClosed')) {
      var bar = document.createElement('div');
      bar.className = 'sticky-cta';
      bar.innerHTML =
        '<div class="sticky-cta-inner">' +
        '<div class="sticky-cta-copy"><strong>Planning a remodel in DC, Maryland or Northern Virginia?</strong>' +
        '<span>Free consultation — no obligation, no pressure.</span></div>' +
        '<div class="sticky-cta-actions">' +
        '<a class="btn btn-primary" href="contact.html" data-cta="sticky-form">Get My Free Estimate</a>' +
        '<a class="btn btn-outline" href="tel:+14102995938" data-cta="sticky-call">Call (410) 299-5938</a>' +
        '</div>' +
        '<button class="sticky-cta-close" type="button" aria-label="Close">×</button>' +
        '</div>';
      document.body.appendChild(bar);

      bar.querySelector('.sticky-cta-close').addEventListener('click', function () {
        bar.classList.remove('is-visible');
        document.body.classList.remove('has-sticky-cta');
        try { sessionStorage.setItem('reduxStickyClosed', '1'); } catch (e) { }
      });

      var showBar = function () {
        if (window.scrollY > 600) {
          bar.classList.add('is-visible');
          document.body.classList.add('has-sticky-cta');
        } else {
          bar.classList.remove('is-visible');
          document.body.classList.remove('has-sticky-cta');
        }
      };
      window.addEventListener('scroll', showBar, { passive: true });
      showBar();
    }

    /* ---------------- Click tracking ---------------- */
    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('a, button') : null;
      if (!el) return;
      var href = el.getAttribute('href') || '';

      if (href.indexOf('tel:') === 0) {
        track('phone_call_click', { label: el.dataset.cta || 'phone' });
      } else if (href.indexOf('mailto:') === 0) {
        track('email_click', { label: 'email' });
      } else if (href.indexOf('contact') !== -1) {
        track('contact_cta_click', {
          label: el.dataset.cta || el.textContent.trim().slice(0, 40),
          page: current
        });
      } else if (/^https?:/.test(href) && href.indexOf(location.hostname) === -1) {
        track('outbound_click', { label: (href.split('/')[2] || '') });
      }
    }, true);

    /* ---------------- Scroll depth ---------------- */
    var marks = [25, 50, 75, 90];
    var hit = {};
    window.addEventListener('scroll', function () {
      var doc = document.documentElement;
      var total = (doc.scrollHeight - window.innerHeight);
      if (total < 200) return;
      var pct = Math.round((window.scrollY / total) * 100);
      marks.forEach(function (m) {
        if (pct >= m && !hit[m]) {
          hit[m] = true;
          track('scroll_depth', { label: m + '%', page: current });
        }
      });
    }, { passive: true });
  });
})();
