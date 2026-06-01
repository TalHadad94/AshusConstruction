/**
 * עשוש בניה — landing page scripts
 * Tracking hooks ready for Google Tag Manager (dataLayer push can be added here).
 */

(function () {
  "use strict";

  // Google Tag Manager — dataLayer initialization (uncomment when GTM is installed)
  // window.dataLayer = window.dataLayer || [];

  var WHATSAPP_NUMBER = "972549805021";
  var DEFAULT_WHATSAPP_TEXT = "שלום, מעוניין/ת בייעוץ ראשוני ללא עלות לפרויקט ממ״ד";

  /**
   * Log tracking events. Replace console.log with dataLayer.push for GTM.
   * @param {string} eventName - value from data-track attribute
   * @param {Object} [detail] - optional extra context
   */
  function trackEvent(eventName, detail) {
    var payload = { event: eventName, timestamp: new Date().toISOString() };
    if (detail) {
      Object.assign(payload, detail);
    }
    console.log("[track]", payload);

    // Google Tag Manager — example:
    // window.dataLayer = window.dataLayer || [];
    // window.dataLayer.push(payload);
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
      /* Form submit is tracked after validation in initLeadForm */
      if (trackName === "form-whatsapp-submit") return;
      trackEvent(trackName, {
        element: el.tagName.toLowerCase(),
        href: el.getAttribute("href") || undefined,
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
        return;
      }

      var lines = [
        "שלום, פנייה מהאתר לייעוץ ראשוני (ממ״ד) — עשוש בניה",
        "",
        "שם: " + name,
        "טלפון: " + phone,
        "עיר: " + city,
      ];
      if (message) {
        lines.push("הודעה: " + message);
      }

      var submitBtn = form.querySelector('[data-track="form-whatsapp-submit"]');
      if (submitBtn) {
        trackEvent("form-whatsapp-submit", {
          city: city,
          hasMessage: Boolean(message),
        });
      }

      window.open(buildWhatsAppUrl(lines.join("\n")), "_blank", "noopener,noreferrer");
    });
  }

  function initYear() {
    var yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function init() {
    initClickTracking();
    initLeadForm();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
