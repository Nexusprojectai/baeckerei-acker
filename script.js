/* Bäckerei Acker — interactions */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- sticky header ----- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----- mobile menu ----- */
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  if (navToggle && mobileMenu) {
    var setMenu = function (open) {
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      mobileMenu.hidden = !open;
    };
    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 820) setMenu(false);
    });
  }

  /* ----- Tageszeiten tabs ----- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));

  function activateTab(tab) {
    if (!tab) return;
    tabs.forEach(function (t) {
      var active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
      t.setAttribute('tabindex', active ? '0' : '-1');
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.classList.toggle('is-active', active);
    });
  }

  if (tabs.length) {
    tabs.forEach(function (tab, i) {
      tab.setAttribute('tabindex', tab.classList.contains('is-active') ? '0' : '-1');
      tab.addEventListener('click', function () { activateTab(tab); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          activateTab(next);
          next.focus();
        }
      });
    });

    /* pick the panel matching Berlin local time on first load */
    var h = new Date().getHours();
    if (h >= 11 && h < 15) activateTab(tabs[1]);
    else if (h >= 15) activateTab(tabs[2]);
  }

  /* ----- scroll reveals ----- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reveals.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var seen = new WeakMap();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = seen.has(el) ? 0 : Math.min(seen.__count = (seen.__count || 0) + 1, 6) * 55;
          window.setTimeout(function () { el.classList.add('is-in'); }, delay);
          seen.set(el, true);
          io.unobserve(el);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ----- order form (client-side only) ----- */
  var form = document.getElementById('orderForm');
  var note = document.getElementById('formNote');
  if (form && note) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('oName');
      var what = document.getElementById('oBrot');
      var day = document.getElementById('oTag');
      var value = name ? name.value.trim() : '';
      note.classList.remove('is-error');

      if (value.length < 2) {
        note.classList.add('is-error');
        note.textContent = 'Bitte trag noch deinen Namen ein.';
        if (name) name.focus();
        return;
      }

      var label = what && what.selectedIndex >= 0 ? what.options[what.selectedIndex].text : 'dein Brot';
      var when = day && day.selectedIndex >= 0 ? day.options[day.selectedIndex].text.toLowerCase() : 'bald';
      note.textContent = 'Danke, ' + value + ' — wir legen „' + label + '“ für ' + when + ' zurück. Bitte telefonisch bestätigen.';

      if (what) what.selectedIndex = 0;
      if (day) day.selectedIndex = 0;
      if (name) name.value = '';
    });
  }

  /* ----- year ----- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
