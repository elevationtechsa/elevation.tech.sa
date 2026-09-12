(() => {
"use strict";
let dispose;
function render() {
  const root = document.getElementById("home"), host = root?.querySelector(".hero-copy");
  const slides = window.ELEVATION_CONTENT?.heroSlides;
  if (!root || !host || !window.CarouselPlayback) return;
  dispose?.(); dispose = undefined;
  if (!slides?.length) { delete root.dataset.slideIndex; delete root.dataset.autoplay; return; }
  const heading = host.querySelector("h1,h2"), description = host.querySelector("h1 + p,h2 + p"), image = root.querySelector(".hero-image-wrap img");
  root.setAttribute("role", "region"); root.setAttribute("aria-roledescription", "carousel"); root.setAttribute("aria-label", "حلول تقنية الارتفاع");
  const controls = document.createElement("div"); controls.className = "cms-hero-controls";
  const toggle = document.createElement("button"); toggle.type = "button"; toggle.className = "cms-hero-toggle";
  const navigation = document.createElement("div"); navigation.className = "cms-hero-navigation";
  const previous = document.createElement("button"); previous.type = "button"; previous.textContent = "→"; previous.setAttribute("aria-label", "الشريحة السابقة"); previous.dataset.heroPrevious = "";
  const next = document.createElement("button"); next.type = "button"; next.textContent = "←"; next.setAttribute("aria-label", "الشريحة التالية"); next.dataset.heroNext = "";
  const dots = document.createElement("div"); dots.className = "cms-hero-dots"; dots.setAttribute("role", "group"); dots.setAttribute("aria-label", "اختيار شريحة");
  const status = document.createElement("span"); status.className = "cms-hero-status";
  controls.append(toggle, navigation, status); navigation.append(previous, dots, next); host.append(controls);
  controls.hidden = slides.length < 2;
  let index = 0, playback, textFrame, textWidth = 0, disposed = false;
  const originalHeights = [heading?.style.minHeight || "", description?.style.minHeight || ""];
  const animations = [];
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  function reserveTextHeight() {
    if (disposed || !heading || !description || !host.clientWidth) return;
    textWidth = host.clientWidth;
    const measure = document.createElement("div"), titleCopy = heading.cloneNode(false), descriptionCopy = description.cloneNode(false);
    measure.setAttribute("aria-hidden", "true"); measure.inert = true;
    measure.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;width:" + textWidth + "px";
    titleCopy.style.minHeight = "0"; descriptionCopy.style.minHeight = "0";
    measure.append(titleCopy, descriptionCopy); host.append(measure);
    let titleHeight = 0, descriptionHeight = 0;
    for (const slide of slides) {
      titleCopy.textContent = slide.title; descriptionCopy.textContent = slide.description;
      titleHeight = Math.max(titleHeight, titleCopy.getBoundingClientRect().height);
      descriptionHeight = Math.max(descriptionHeight, descriptionCopy.getBoundingClientRect().height);
    }
    measure.remove(); heading.style.minHeight = Math.ceil(titleHeight) + "px"; description.style.minHeight = Math.ceil(descriptionHeight) + "px";
  }
  const textObserver = new ResizeObserver(() => { if (host.clientWidth !== textWidth) { cancelAnimationFrame(textFrame); textFrame = requestAnimationFrame(reserveTextHeight); } });
  textObserver.observe(host);
  document.fonts?.ready.then(() => { if (!disposed) { cancelAnimationFrame(textFrame); textFrame = requestAnimationFrame(reserveTextHeight); } });
  function show(target, animate = true) {
    index = (target + slides.length) % slides.length;
    const slide = slides[index]; root.dataset.slideIndex = String(index);
    animations.splice(0).forEach(animation => animation.cancel());
    if (heading) heading.textContent = slide.title;
    if (description) description.textContent = slide.description;
    if (image) { image.src = slide.image || "/assets/hero-img.jpeg"; image.alt = slide.title; }
    dots.querySelectorAll("button").forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
    status.textContent = "الشريحة " + (index + 1) + " من " + slides.length;
    if (animate && !motion.matches) for (const node of [heading, description, image]) if (node) animations.push(node.animate([{opacity: .15}, {opacity: 1}], {duration: 450, easing: "ease-out"}));
    playback?.restart();
  }
  slides.forEach((slide, i) => {
    const button = document.createElement("button"); button.type = "button"; button.textContent = String(i + 1); button.dataset.heroSlide = String(i);
    button.setAttribute("aria-label", "الشريحة " + (i + 1) + ": " + slide.title);
    button.onclick = () => show(i); dots.append(button);
    if (slide.image) { const preload = new Image(); preload.src = slide.image; }
  });
  previous.onclick = () => show(index - 1); next.onclick = () => show(index + 1);
  navigation.onkeydown = event => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); show(index + (event.key === "ArrowLeft" ? 1 : -1)); } };
  playback = CarouselPlayback({root, toggle, delay: 6000, canAdvance: () => slides.length > 1, advance: () => show(index + 1), onChange: enabled => status.setAttribute("aria-live", enabled ? "off" : "polite")});
  show(0, false); reserveTextHeight();
  dispose = () => { disposed = true; cancelAnimationFrame(textFrame); textObserver.disconnect(); playback.destroy(); animations.forEach(animation => animation.cancel()); controls.remove(); if (heading) heading.style.minHeight = originalHeights[0]; if (description) description.style.minHeight = originalHeights[1]; };
}
window.addEventListener("elevation:content", render);
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render, {once: true}); else render();
})();
