document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', function(){ nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); });
    });
  }

  // Highlight the current page in the nav
  var current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.main-nav a, .footer-nav a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === current) link.classList.add('active');
  });

  // Smooth, lightweight scroll reveals.
  var revealTargets = Array.from(document.querySelectorAll('.reveal-section'));
  document.querySelectorAll('.cards-grid .project-card, .services-grid .service-item, .process-grid .process-card, .gallery-grid .g-item').forEach(function(el, i){
    el.classList.add('reveal-item');
    el.style.transitionDelay = Math.min(i % 5, 4) * 70 + 'ms';
    revealTargets.push(el);
  });
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
    revealTargets.forEach(function(el){ observer.observe(el); });
  } else {
    revealTargets.forEach(function(el){ el.classList.add('is-visible'); });
  }

  // Interactive concept / finished-space comparison.
  document.querySelectorAll('[data-compare]').forEach(function(compare){
    var range = compare.querySelector('.compare-range');
    var before = compare.querySelector('.compare-before');
    var divider = compare.querySelector('.compare-divider');
    if (!range || !before || !divider) return;
    function update(){
      var value = range.value + '%';
      before.style.width = value;
      divider.style.left = value;
    }
    range.addEventListener('input', update, {passive:true});
    update();
  });

  // Interactive service-area map hotspots.
  var infoCity = document.getElementById('mapInfoCity');
  var infoCopy = document.getElementById('mapInfoCopy');
  var hotspots = document.querySelectorAll('.map-hotspot');
  hotspots.forEach(function(hotspot){
    function activate(){
      hotspots.forEach(function(h){ h.classList.remove('is-active'); });
      hotspot.classList.add('is-active');
      if (infoCity) infoCity.textContent = hotspot.dataset.city || '';
      if (infoCopy) infoCopy.textContent = hotspot.dataset.copy || '';
    }
    hotspot.addEventListener('click', activate);
    hotspot.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });

  // Stop hero video if it is offscreen to conserve mobile/laptop resources.
  var heroVideo = document.querySelector('.hero-video');
  if (heroVideo && 'IntersectionObserver' in window) {
    var videoObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) heroVideo.play().catch(function(){});
        else heroVideo.pause();
      });
    }, {threshold:0.05});
    videoObserver.observe(heroVideo);
  }
});
