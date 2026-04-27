// Renders content added in admin.html on the matching inner pages.
(function () {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getSavedItems(type) {
    try {
      var items = JSON.parse(localStorage.getItem(type) || "[]");
      return Array.isArray(items) ? items : [];
    } catch (error) {
      console.warn("Unable to load saved " + type, error);
      return [];
    }
  }

  function getSavedImages(item) {
    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images
        .map(function (image) {
          return typeof image === "string"
            ? { src: image, name: "", caption: "" }
            : { src: image.src || image.url || "", name: image.name || "", caption: image.caption || "" };
        })
        .filter(function (image) { return image.src; });
    }

    return item.image ? [{ src: item.image, name: item.imageName || "", caption: item.imageCaption || "" }] : [];
  }

  function hasSavedItems(type) {
    return getSavedItems(type).length > 0;
  }

  var defaultServiceFeatures = {
    "default-service-1": ["مصاعد الركاب", "مصاعد البضائع", "مصاعد المستشفيات"],
    "default-service-2": ["صيانة وقائية شهرية", "فحص دوري شامل", "تقارير فنية مفصلة"],
    "default-service-3": ["أنظمة تحكم حديثة", "تحسين كفاءة الطاقة", "تقنيات الأمان المتطورة"],
    "default-service-4": ["استجابة سريعة", "فنيون مؤهلون", "قطع غيار أصلية"],
    "default-service-5": ["سلالم متحركة داخلية", "سلالم متحركة خارجية", "ممرات متحركة"],
    "default-service-6": ["دراسات الجدوى", "التصاميم الهندسية", "المواصفات الفنية"]
  };

  var defaultServiceFeaturesByIcon = {
    "fas fa-building": defaultServiceFeatures["default-service-1"],
    "fas fa-tools": defaultServiceFeatures["default-service-2"],
    "fas fa-sync-alt": defaultServiceFeatures["default-service-3"],
    "fas fa-phone-alt": defaultServiceFeatures["default-service-4"],
    "fas fa-stairs": defaultServiceFeatures["default-service-5"],
    "fas fa-clipboard-check": defaultServiceFeatures["default-service-6"]
  };

  function getServiceFeatures(service) {
    if (Array.isArray(service.features) && service.features.length > 0) return service.features;
    return defaultServiceFeatures[service.id] || defaultServiceFeaturesByIcon[service.icon] || [];
  }

  function isImageValue(value) {
    return /^data:image\//.test(value || "") || /\.(png|jpe?g|webp|gif|svg|jfif)(\?.*)?$/i.test(value || "") || /^https?:\/\//i.test(value || "");
  }

  function renderServiceIcon(icon) {
    icon = normalizeAssetPath(icon || "");
    return isImageValue(icon)
      ? '<img src="' + escapeHtml(icon) + '" alt="" class="w-8 h-8 object-contain">'
      : '<i class="' + escapeHtml(icon || "fas fa-cog") + ' text-lg sm:text-xl lg:text-2xl text-white"></i>';
  }

  function normalizeAssetPath(value) {
    if (location.pathname.includes("/pages/") && /^assets\//.test(value || "")) {
      return "../" + value;
    }
    return value || "";
  }

  function renderServices() {
    var container = document.getElementById("services-page-list");
    if (!container) return;
    if (!hasSavedItems("services")) return;
    container.querySelectorAll(":scope > .card-hover").forEach(function (card) {
      card.remove();
    });

    getSavedItems("services").forEach(function (service, index) {
      var isGold = index % 2 === 1;
      var title = escapeHtml(service.title);
      var description = escapeHtml(service.description);
      var icon = service.icon || "fas fa-cog";
      var features = getServiceFeatures(service);
      var featuresHtml = features.length
        ? '<ul class="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2 mt-3 lg:mt-4">' +
          features.map(function (feature) {
            return '<li class="flex items-start"><i class="fas fa-check ' + (isGold ? "text-[#b8952b]" : "text-[#004d40]") + ' ml-1.5 sm:ml-2 mt-0.5"></i><span>' + escapeHtml(feature) + '</span></li>';
          }).join("") +
          '</ul>'
        : "";

      if (!title && !description) return;

      container.insertAdjacentHTML("beforeend",
        '<div class="bg-gradient-to-br ' + (isGold ? "from-yellow-50 border-yellow-100" : "from-green-50 border-green-100") + ' to-white p-6 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border card-hover">' +
          '<div class="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r ' + (isGold ? "from-[#b8952b] to-[#d4af37]" : "from-[#004d40] to-[#00332a]") + ' rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-5 lg:mb-6">' +
            renderServiceIcon(icon) +
          '</div>' +
          '<h3 class="text-lg sm:text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4">' + title + '</h3>' +
          '<p class="text-sm sm:text-base text-gray-600 leading-relaxed">' + description + '</p>' +
          featuresHtml +
        '</div>'
      );
    });
  }

  function renderProducts() {
    var container = document.getElementById("products-page-list");
    if (!container) return;
    if (!hasSavedItems("products")) return;
    container.querySelectorAll(":scope > .card-hover").forEach(function (card) {
      card.remove();
    });

    getSavedItems("products").forEach(function (product) {
      var name = escapeHtml(product.name);
      var description = escapeHtml(product.description);
      var productImages = getSavedImages(product);
      var image = escapeHtml(normalizeAssetPath((productImages[0] && productImages[0].src) || product.image || "../assets/hero-img.jpeg"));
      var features = Array.isArray(product.features) ? product.features : [];
      var featuresHtml = features.length
        ? '<ul class="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2 mt-3 sm:mt-4">' +
          features.map(function (feature) {
            return '<li class="flex items-start"><i class="fas fa-check text-[#004d40] ml-1.5 sm:ml-2 mt-0.5"></i><span>' + escapeHtml(feature) + '</span></li>';
          }).join("") +
          '</ul>'
        : "";

      if (!name && !description) return;

      container.insertAdjacentHTML("beforeend",
        '<div class="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl card-hover">' +
          '<div class="h-40 sm:h-44 lg:h-48 relative overflow-hidden">' +
            '<img src="' + image + '" alt="' + name + '" class="w-full h-full object-cover" />' +
            '<div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>' +
            '<h3 class="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 text-lg sm:text-xl lg:text-2xl font-bold text-white">' + name + '</h3>' +
          '</div>' +
          '<div class="p-4 sm:p-5 lg:p-6">' +
            '<p class="text-sm sm:text-base text-gray-600 leading-relaxed">' + description + '</p>' +
            featuresHtml +
          '</div>' +
        '</div>'
      );
    });
  }

  function renderProjects() {
    var container = document.getElementById("projects-page-list");
    if (!container) return;
    if (!hasSavedItems("projects")) return;
    container.querySelectorAll(":scope > .card-hover").forEach(function (card) {
      card.remove();
    });

    getSavedItems("projects").forEach(function (project, index) {
      var isGold = index % 2 === 1;
      var id = "saved-" + escapeHtml(project.id || String(Date.now())) + "-" + index;
      var title = escapeHtml(project.title);
      var description = escapeHtml(project.description);
      var type = escapeHtml(project.type);
      var elevators = escapeHtml(project.elevators);
      var location = escapeHtml(project.location);
      var year = escapeHtml(project.year);
      var projectImages = getSavedImages(project);
      var image = escapeHtml(normalizeAssetPath((projectImages[0] && projectImages[0].src) || project.image || ""));

      if (!title && !description) return;

      window.projects = window.projects || {};
      window.projects[id] = {
        title: project.title || "",
        description: project.description || "",
        elevators: project.elevators || "",
        speed: project.speed || project.location || "",
        capacity: project.capacity || project.year || "",
        images: projectImages.map(function (item, imageIndex) {
          return {
            src: normalizeAssetPath(item.src),
            alt: project.title || item.name || "",
            caption: item.caption || item.name || project.title || ("صورة " + (imageIndex + 1))
          };
        })
      };

      container.insertAdjacentHTML("beforeend",
        '<div class="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl card-hover">' +
          '<div class="h-36 sm:h-44 lg:h-48 ' + (image ? "relative overflow-hidden p-0" : "bg-gradient-to-r " + (isGold ? "from-[#b8952b] to-[#d4af37]" : "from-[#004d40] to-[#00332a]") + " p-4 sm:p-6 lg:p-8") + ' text-white">' +
            (image ? '<img src="' + image + '" alt="' + title + '" class="absolute inset-0 w-full h-full object-cover" /><div class="absolute inset-0 bg-gradient-to-t from-black/75 to-black/20"></div><div class="relative p-4 sm:p-6 lg:p-8">' : "") +
              '<div class="flex items-start justify-between mb-3 sm:mb-4">' +
                '<h3 class="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">' + title + '</h3>' +
                '<i class="fas fa-building text-xl sm:text-2xl lg:text-3xl opacity-50 mr-2 sm:mr-0"></i>' +
              '</div>' +
              '<p class="text-xs sm:text-sm lg:text-base ' + (image ? "text-white/90" : isGold ? "text-yellow-100" : "text-green-100") + '">' + (type || location || year) + '</p>' +
            (image ? '</div>' : "") +
          '</div>' +
          '<div class="p-4 sm:p-6 lg:p-8">' +
            '<p class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">' + description + '</p>' +
            '<div class="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">' +
              '<div class="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">' +
                '<i class="fas fa-elevator text-lg sm:text-xl lg:text-2xl ' + (isGold ? "text-[#b8952b]" : "text-[#004d40]") + ' mb-1 sm:mb-2"></i>' +
                '<div class="text-xl sm:text-2xl font-bold">' + (elevators || "-") + '</div>' +
                '<div class="text-xs sm:text-sm text-gray-600">&#1605;&#1589;&#1593;&#1583;</div>' +
              '</div>' +
              '<div class="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">' +
                '<i class="fas fa-map-marker-alt text-lg sm:text-xl lg:text-2xl ' + (isGold ? "text-[#b8952b]" : "text-[#004d40]") + ' mb-1 sm:mb-2"></i>' +
                '<div class="text-sm sm:text-base font-bold">' + (location || year || "-") + '</div>' +
                '<div class="text-xs sm:text-sm text-gray-600">&#1575;&#1604;&#1605;&#1608;&#1602;&#1593;</div>' +
              '</div>' +
            '</div>' +
            '<button class="project-details-btn w-full bg-gradient-to-r ' + (isGold ? "from-[#b8952b] to-[#d4af37]" : "from-[#004d40] to-[#00332a]") + ' text-white py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4" data-project="' + id + '">' +
              '<i class="fas fa-info-circle"></i> &#1593;&#1585;&#1590; &#1575;&#1604;&#1578;&#1601;&#1575;&#1589;&#1610;&#1604;' +
            '</button>' +
          '</div>' +
        '</div>'
      );
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderServices();
    renderProducts();
    renderProjects();
  });
}());
