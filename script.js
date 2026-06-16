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
