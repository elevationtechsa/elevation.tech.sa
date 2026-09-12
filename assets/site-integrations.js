// Site integrations for Elevation Tech.
// Fill in the IDs below when you have them. Empty values keep the service disabled.
// googleTagManagerId: "GTM-XXXXXXX"
// googleAnalyticsId: "G-XXXXXXXXXX"
// googleAdsId: "AW-XXXXXXXXXX"
// googleAdsConversionLabel: "XXXXXXXXXXXXXXX"
// metaPixelId: "000000000000000"
window.SITE_TRACKING_CONFIG = {
  googleTagManagerId: "",
  googleAnalyticsId: "",
  googleAdsId: "",
  googleAdsConversionLabel: "",
  metaPixelId: "",
  microsoftClarityId: ""
};

(function () {
  function getStoredTrackingConfig() {
    try {
      var settings = JSON.parse(localStorage.getItem("site_settings") || "{}");
      return settings.tracking || {};
    } catch (error) {
      return {};
    }
  }

  var config = Object.assign({}, window.SITE_TRACKING_CONFIG || {});

  function loadScript(src, async) {
    var script = document.createElement("script");
    script.src = src;
    script.async = async !== false;
    document.head.appendChild(script);
    return script;
  }

  if (config.googleTagManagerId) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    loadScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(config.googleTagManagerId));
  }

  if (config.googleAnalyticsId || config.googleAdsId) {
    var googleId = config.googleAnalyticsId || config.googleAdsId;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(googleId));

    if (config.googleAnalyticsId) {
      window.gtag("config", config.googleAnalyticsId);
    }

    if (config.googleAdsId) {
      window.gtag("config", config.googleAdsId);
    }
  }

  if (config.metaPixelId) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    window.fbq("init", config.metaPixelId);
    window.fbq("track", "PageView");
  }

  if (config.microsoftClarityId) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r);
      t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", config.microsoftClarityId);
  }

  function trackEvent(name, params) {
    params = params || {};

    if (window.gtag) {
      var googleEventName = name === "lead" ? "generate_lead" : name;
      window.gtag("event", googleEventName, params);

      if (name === "lead" && config.googleAdsId && config.googleAdsConversionLabel) {
        window.gtag("event", "conversion", {
          send_to: config.googleAdsId + "/" + config.googleAdsConversionLabel
        });
      }
    }

    if (window.fbq) {
      var metaName = name === "lead" ? "Lead" : "Contact";
      window.fbq("track", metaName, params);
    }

    if (window.clarity) {
      window.clarity("event", name);
    }
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a[href]");
    if (!link) return;

    var href = link.getAttribute("href") || "";
    if (href.indexOf("tel:") === 0) {
      trackEvent("phone_click", { method: "phone", value: href.replace("tel:", "") });
    } else if (href.indexOf("mailto:") === 0) {
      trackEvent("email_click", { method: "email", value: href.replace("mailto:", "") });
    } else if (href.indexOf("wa.me") !== -1 || href.indexOf("whatsapp") !== -1) {
      trackEvent("whatsapp_click", { method: "whatsapp" });
    }
  });

  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (form && form.tagName === "FORM") {
      trackEvent("lead", { form_id: form.id || "form" });
    }
  }, true);
}());
