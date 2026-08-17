/**
 * רון ירון אשוש 26 בע"מ — landing page scripts
 * Tracking is ready for Google Tag Manager, GA4, and Google Ads conversion setup.
 */

(function () {
  "use strict";

  window.dataLayer = window.dataLayer || [];

  var WHATSAPP_NUMBER = "972559624803";

  /**
   * Push a normalized event to GTM dataLayer and GA4 gtag when available.
   * In Google Tag Manager, create Custom Event triggers for:
   * - phone-click
   * - whatsapp-click
   * - form-whatsapp-submit
   *
   * @param {string} eventName - value from data-track attribute
   * @param {Object} [detail] - optional extra context
   */
  function trackEvent(eventName, detail) {
    if (!eventName) return;

    var payload = {
      event: eventName,
      event_category: "lead",
      event_label: detail && detail.label ? detail.label : undefined,
      timestamp: new Date().toISOString(),
    };

    if (detail) {
      Object.keys(detail).forEach(function (key) {
        if (detail[key] !== undefined && detail[key] !== null && detail[key] !== "") {
          payload[key] = detail[key];
        }
      });
    }

    window.dataLayer.push(payload);

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload);
    }

    console.log("[track]", payload);
  }

  /**
   * Delegate clicks on elements with data-track attribute.
   */
  function initClickTracking() {
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-track]");
      if (!el) return;

      var trackName = el.getAttribute("data-track");
      if (!trackName) return;

      // Form submit is tracked only after validation inside initLeadForm().
      if (trackName === "form-whatsapp-submit") return;

      trackEvent(trackName, {
        label: el.getAttribute("data-track-label") || el.textContent.trim(),
        element: el.tagName.toLowerCase(),
        href: el.getAttribute("href") || undefined,
        page_path: window.location.pathname,
      });
    });
  }

  /**
   * Build WhatsApp URL with encoded message.
   * @param {string} text
   * @returns {string}
   */
  function buildWhatsAppUrl(text) {
    return (
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(text)
    );
  }

  /**
   * Lead form → WhatsApp with prefilled details.
   */
  function initLeadForm() {
    var form = document.getElementById("lead-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var city = form.city.value.trim();
      var message = form.message.value.trim();

      if (!name || !phone || !city) {
        form.reportValidity();
        var firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) {
          firstInvalid.classList.add('invalid-shake');
          firstInvalid.addEventListener('animationend', function onEnd() {
            firstInvalid.classList.remove('invalid-shake');
            firstInvalid.removeEventListener('animationend', onEnd);
          }, { once: true });
          try { firstInvalid.focus({ preventScroll: true }); } catch (err) {}
        }
        return;
      }

      var lines = [
        "שלום, פנייה מהאתר לייעוץ ראשוני (ממ״ד) — רון ירון אשוש 26 בע\"מ",
        "",
        "שם: " + name,
        "טלפון: " + phone,
        "עיר: " + city,
      ];

      if (message) {
        lines.push("הודעה: " + message);
      }

      trackEvent("form-whatsapp-submit", {
        label: "lead-form",
        city: city,
        has_message: Boolean(message),
        page_path: window.location.pathname,
      });

      window.open(buildWhatsAppUrl(lines.join("\n")), "_blank", "noopener,noreferrer");
    });
  }

  /**
   * Scroll-reveal: apply to each <section> using IntersectionObserver.
   * Respects prefers-reduced-motion.
   */
  function initScrollReveal() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var sections = document.querySelectorAll('section');
    if (!sections || !sections.length) return;

    if (reduced) {
      sections.forEach(function (s) { s.classList.add('revealed'); });
      return;
    }

    sections.forEach(function (s) { s.classList.add('reveal'); });

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    sections.forEach(function (s) { io.observe(s); });
  }

  /**
   * Lazy-load Instagram embed script when any .video-section enters viewport.
   */
  function initInstagramLazyLoad() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    if (window.instgrm) return; // already loaded

    var sections = document.querySelectorAll('.video-section');
    if (!sections || !sections.length) return;

    var loaded = false;
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !loaded) {
          loaded = true;
          var s = document.createElement('script');
          s.src = 'https://www.instagram.com/embed.js';
          s.async = true;
          s.onload = function () {
            try {
              if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === 'function') {
                window.instgrm.Embeds.process();
              }
            } catch (err) { /* ignore */ }
          };
          document.body.appendChild(s);
          obs.disconnect();
        }
      });
    }, { rootMargin: '200px', threshold: 0.15 });

    sections.forEach(function (s) { io.observe(s); });
  }

  /**
   * Trust-stats: simple count-up on scroll for elements with .stat-value[data-target]
   */
  function initTrustStats() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    var container = document.querySelector('.trust-stats');
    if (!container) return;

    var values = container.querySelectorAll('.stat-value');
    if (!values || !values.length) return;

    var started = false;
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !started) {
          started = true;
          values.forEach(function (el) {
            var to = parseInt(el.getAttribute('data-target') || '0', 10) || 0;
            animateCount(el, to, 250);
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    io.observe(container);

    function animateCount(node, to, duration) {
      if (to <= 0) { node.textContent = String(to); return; }
      var start = performance.now();
      var from = 0;
      function step(now) {
        var t = Math.min(1, (now - start) / duration);
        var val = Math.floor(from + (to - from) * t);
        node.textContent = val.toLocaleString('he-IL');
        if (t < 1) requestAnimationFrame(step);
        else node.textContent = to.toLocaleString('he-IL');
      }
      requestAnimationFrame(step);
    }
  }

  /**
   * Gallery: placeholder while images load and entrance stagger
   */
  function initGalleryEnhancements() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
    if (!items.length) return;
    items.forEach(function (item, i) {
      item.style.setProperty('--stagger-delay', (i * 60) + 'ms');
      var img = item.querySelector('img');
      if (!img) return;
      if (img.complete) img.classList.add('img-loaded');
      else img.addEventListener('load', function () { img.classList.add('img-loaded'); });
      img.addEventListener('error', function () { img.classList.add('img-loaded'); });
    });
  }

  /**
   * Form: ensure invalid fields get a subtle shake when submit fails
   */
  function initFormValidationEnhancements() {
    var form = document.getElementById('lead-form');
    if (!form) return;
    form.addEventListener('invalid', function (e) {
      var t = e.target;
      if (!t) return;
      t.classList.add('invalid-shake');
      t.addEventListener('animationend', function onEnd() {
        t.classList.remove('invalid-shake');
        t.removeEventListener('animationend', onEnd);
      }, { once: true });
    }, true);
  }

  function initYear() {
    var yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  /**
   * Simple lightbox for the project gallery thumbnails.
   */
  function initGallery() {
    var lightbox = document.getElementById("lightbox");
    var lightboxImg = document.getElementById("lightbox-img");
    var closeBtn = document.getElementById("lightbox-close");
    var items = document.querySelectorAll(".gallery-item");
    if (!lightbox || !lightboxImg || !closeBtn || !items.length) return;

    var lastFocused = null;

    function openLightbox(src, alt) {
      lastFocused = document.activeElement;
      lightboxImg.src = src;
      lightboxImg.alt = alt || "";
      lightbox.hidden = false;
      closeBtn.focus();
      document.addEventListener("keydown", onKeydown);
    }

    function closeLightbox() {
      lightbox.hidden = true;
      lightboxImg.src = "";
      document.removeEventListener("keydown", onKeydown);
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    function onKeydown(e) {
      if (e.key === "Escape") closeLightbox();
    }

    items.forEach(function (item) {
      item.addEventListener("click", function () {
        openLightbox(item.getAttribute("data-lightbox-src"), item.getAttribute("data-lightbox-alt"));
      });
    });

    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  function init() {
    initClickTracking();
    initLeadForm();
    initYear();
    initGallery();
    initScrollReveal();
    initInstagramLazyLoad();
    initTrustStats();
    initGalleryEnhancements();
    initFormValidationEnhancements();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
