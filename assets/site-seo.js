// Applies SEO settings saved from admin.html.
(function () {
  var pageDefaults = {
    home: {
      title: "Elevation Tech | Elevator Installation and Maintenance in Saudi Arabia",
      description: "Elevation Tech provides elevator installation, maintenance, modernization, escalators, home elevators, freight elevators, and hospital elevator solutions in Riyadh and Saudi Arabia.",
      keywords: "elevators Saudi Arabia, elevator maintenance Riyadh, elevator installation, escalators, home elevators, freight elevators, hospital elevators, Elevation Tech",
      canonical: "https://elevation-tech.sa/",
      image: "https://elevation-tech.sa/assets/hero-img.jpeg",
      imageAlt: "Elevation Tech | Elevator Installation and Maintenance in Saudi Arabia",
      robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      schemaType: "LocalBusiness"
    },
    about: {
      title: "About Elevation Tech | Elevator Company in Saudi Arabia",
      description: "Learn about Elevation Tech, a Saudi elevator company providing installation, maintenance, modernization, and escalator solutions for residential and commercial projects.",
      keywords: "about Elevation Tech, elevator company Saudi Arabia, elevator contractor Riyadh, lift company, escalator company",
      canonical: "https://elevation-tech.sa/pages/about.html",
      image: "https://elevation-tech.sa/assets/logo.png",
      imageAlt: "About Elevation Tech | Elevator Company in Saudi Arabia",
      robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      schemaType: "AboutPage"
    },
    services: {
      title: "Elevator Services | Installation, Maintenance and Modernization",
      description: "Elevation Tech services include elevator installation, preventive maintenance, emergency support, elevator modernization, technical consultation, and escalator solutions.",
      keywords: "elevator services, elevator maintenance, elevator installation, elevator modernization, emergency elevator service, escalator maintenance",
      canonical: "https://elevation-tech.sa/pages/services.html",
      image: "https://elevation-tech.sa/assets/hero-img.jpeg",
      imageAlt: "Elevator Services | Installation, Maintenance and Modernization",
      robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      schemaType: "Service"
    },
    products: {
      title: "Elevator Products | Passenger, Home, Freight and Hospital Elevators",
      description: "Explore Elevation Tech elevator products including passenger elevators, freight elevators, hospital elevators, panoramic elevators, home elevators, and escalators.",
      keywords: "passenger elevators, freight elevators, hospital elevators, panoramic elevators, home elevators, escalators, elevator products Saudi Arabia",
      canonical: "https://elevation-tech.sa/pages/products.html",
      image: "https://elevation-tech.sa/assets/passenger.jpg",
      imageAlt: "Elevator Products | Passenger, Home, Freight and Hospital Elevators",
      robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      schemaType: "CollectionPage"
    },
    projects: {
      title: "Elevator Projects | Elevation Tech Completed Projects",
      description: "View Elevation Tech completed elevator projects for residential towers, commercial complexes, healthcare facilities, and hotel projects in Saudi Arabia.",
      keywords: "elevator projects, completed elevator projects, elevator contractor projects, Saudi elevator projects, Riyadh elevator installation",
      canonical: "https://elevation-tech.sa/pages/projects.html",
      image: "https://elevation-tech.sa/assets/hero-img.jpeg",
      imageAlt: "Elevator Projects | Elevation Tech Completed Projects",
      robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      schemaType: "CollectionPage"
    },
    contact: {
      title: "Contact Elevation Tech | Elevator Consultation and Quotation",
      description: "Contact Elevation Tech for elevator consultation, quotation, installation, maintenance, modernization, and escalator services in Riyadh and Saudi Arabia.",
      keywords: "contact elevator company, elevator quotation Riyadh, elevator consultation Saudi Arabia, Elevation Tech contact, elevator maintenance phone",
      canonical: "https://elevation-tech.sa/pages/contact.html",
      image: "https://elevation-tech.sa/assets/logo.png",
      imageAlt: "Contact Elevation Tech | Elevator Consultation and Quotation",
      robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      schemaType: "ContactPage"
    }
  };

  function getPageKey() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf("/about.html") !== -1) return "about";
    if (path.indexOf("/services.html") !== -1) return "services";
    if (path.indexOf("/products.html") !== -1) return "products";
    if (path.indexOf("/projects.html") !== -1) return "projects";
    if (path.indexOf("/contact.html") !== -1) return "contact";
    return "home";
  }

  function getStoredSettings() {
    try {
      return JSON.parse(localStorage.getItem("site_settings") || "{}");
    } catch (error) {
      return {};
    }
  }

  function setMeta(selector, attrs, content) {
    if (!content) return;
    var element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement("meta");
      Object.keys(attrs).forEach(function (name) {
        element.setAttribute(name, attrs[name]);
      });
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
  }

  function setLink(selector, rel, href) {
    if (!href) return;
    var element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement("link");
      element.setAttribute("rel", rel);
      document.head.appendChild(element);
    }
    element.setAttribute("href", href);
  }

  function buildBasicSchema(pageKey, pageSeo, settings) {
    var type = pageSeo.schemaType || "WebPage";
    var schema = {
      "@context": "https://schema.org",
      "@type": type,
      "name": pageSeo.title,
      "url": pageSeo.canonical,
      "description": pageSeo.description,
      "image": pageSeo.image
    };

    if (type === "LocalBusiness") {
      schema.logo = "https://elevation-tech.sa/assets/logo.png";
      schema.telephone = settings.companyPhone || "+966531154551";
      schema.email = settings.companyEmail || "sales@elevation-tech.sa";
      schema.address = {
        "@type": "PostalAddress",
        "addressLocality": "Riyadh",
        "addressCountry": "SA"
      };
    } else {
      schema.isPartOf = {
        "@type": "WebSite",
        "name": "Elevation Tech",
        "url": "https://elevation-tech.sa/"
      };
    }

    if (pageKey === "services") {
      schema.provider = {
        "@type": "LocalBusiness",
        "name": "Elevation Tech",
        "url": "https://elevation-tech.sa/"
      };
      schema.areaServed = {
        "@type": "Country",
        "name": "Saudi Arabia"
      };
    }

    return schema;
  }

  function applySchema(pageKey, pageSeo, settings) {
    var schema;
    if (pageSeo.schemaJson) {
      try {
        schema = JSON.parse(pageSeo.schemaJson);
      } catch (error) {
        return;
      }
    } else if (pageSeo.schemaType) {
      schema = buildBasicSchema(pageKey, pageSeo, settings);
    }

    if (!schema) return;

    var existing = document.getElementById("admin-seo-jsonld");
    if (!existing) {
      existing = document.createElement("script");
      existing.type = "application/ld+json";
      existing.id = "admin-seo-jsonld";
      document.head.appendChild(existing);
    }
    existing.textContent = JSON.stringify(schema);
  }

  function applyPageContent(pageKey, settings) {
    var pageContent = settings.pages && settings.pages[pageKey];
    if (!pageContent) return;

    var heading = document.querySelector(pageKey === "home" ? "#home h2" : "section h1");
    if (heading && pageContent.heading) heading.textContent = pageContent.heading;

    var subtitle = heading && heading.parentElement ? heading.parentElement.querySelector("p") : null;
    if (subtitle && pageContent.subtitle) subtitle.textContent = pageContent.subtitle;
  }

  function applySeo() {
    var settings = getStoredSettings();
    var pageKey = getPageKey();
    var pageSeo = Object.assign({}, pageDefaults[pageKey] || {}, (settings.seo && settings.seo.pages && settings.seo.pages[pageKey]) || {});

    if (pageSeo.title) document.title = pageSeo.title;
    setMeta('meta[name="description"]', { name: "description" }, pageSeo.description);
    setMeta('meta[name="keywords"]', { name: "keywords" }, pageSeo.keywords);
    setMeta('meta[name="robots"]', { name: "robots" }, pageSeo.robots);
    setLink('link[rel="canonical"]', "canonical", pageSeo.canonical);
    setMeta('meta[property="og:title"]', { property: "og:title" }, pageSeo.title);
    setMeta('meta[property="og:description"]', { property: "og:description" }, pageSeo.description);
    setMeta('meta[property="og:url"]', { property: "og:url" }, pageSeo.canonical);
    setMeta('meta[property="og:image"]', { property: "og:image" }, pageSeo.image);
    setMeta('meta[property="og:image:alt"]', { property: "og:image:alt" }, pageSeo.imageAlt || pageSeo.title);
    setMeta('meta[name="twitter:title"]', { name: "twitter:title" }, pageSeo.title);
    setMeta('meta[name="twitter:description"]', { name: "twitter:description" }, pageSeo.description);
    setMeta('meta[name="twitter:image"]', { name: "twitter:image" }, pageSeo.image);
    applySchema(pageKey, pageSeo, settings);
    applyPageContent(pageKey, settings);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applySeo);
  } else {
    applySeo();
  }
}());
