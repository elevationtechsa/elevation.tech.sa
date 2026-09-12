(() => {
"use strict";
function start() {
  const root = document.getElementById("partners"), track = root?.querySelector(".partners-slider"), viewport = root?.querySelector(".partners-container");
  if (!root || !track || !viewport || root.dataset.carouselReady || !window.CarouselPlayback) return;
  root.dataset.carouselReady = "true";
  const previous = document.getElementById("prevPartner"), next = document.getElementById("nextPartner"), motion = matchMedia("(prefers-reduced-motion: reduce)");
  viewport.setAttribute("role", "region"); viewport.setAttribute("aria-roledescription", "carousel"); viewport.setAttribute("aria-label", "شركاء النجاح"); viewport.tabIndex = 0;
  previous?.setAttribute("aria-label", "الشريك السابق"); next?.setAttribute("aria-label", "الشريك التالي");
  const controls = document.createElement("div"); controls.className = "partner-playback";
  const toggle = document.createElement("button"); toggle.type = "button"; toggle.className = "partner-toggle";
  const status = document.createElement("span"); status.className = "partner-status";
  controls.append(toggle, status); viewport.parentElement.after(controls);
  let originals = [], visible = 4, index = 0, position = 0, step = 0, moving = false, settleTimer, lastWidth = 0, playback, touch, resizeFrame;
  const count = () => viewport.clientWidth >= 1000 ? 4 : viewport.clientWidth >= 600 ? 3 : viewport.clientWidth >= 320 ? 2 : 1;
  function paint() { track.style.transform = "translate3d(" + (position * step) + "px,0,0)"; track.dataset.index = String(index); }
  function update() {
    const total = originals.length;
    status.textContent = total ? "الشريك " + (index + 1) + " من " + total : "";
    status.setAttribute("aria-live", playback?.enabled ? "off" : "polite");
    originals.forEach((slide, i) => slide.setAttribute("aria-hidden", String((i - index + total) % total >= visible)));
    controls.hidden = total <= visible;
    for (const button of [previous, next]) if (button) { button.hidden = total <= visible; button.disabled = moving; }
    track.dataset.moving = String(moving);
  }
  function jump() {
    track.style.transition = "none"; paint();
    // Commit the identical cloned/original position before the next animated move.
    void track.offsetWidth;
    track.style.removeProperty("transition");
  }
  function settle() {
    if (!moving) return;
    clearTimeout(settleTimer); moving = false;
    if (position >= visible + originals.length || position < visible) { position = visible + index; jump(); }
    update(); playback?.restart();
  }
  function move(direction) {
    if (moving || originals.length <= visible) return;
    playback?.stop(); clearTimeout(settleTimer);
    index = (index + direction + originals.length) % originals.length; position += direction; moving = true;
    update(); paint();
    if (motion.matches) settle(); else settleTimer = setTimeout(settle, 650);
  }
  function rebuild() {
    playback?.stop(); clearTimeout(settleTimer); moving = false;
    track.querySelectorAll("[data-partner-clone]").forEach(node => node.remove());
    originals = [...track.children]; visible = count(); index = originals.length ? index % originals.length : 0;
    viewport.style.setProperty("--partner-visible", String(visible));
    originals.forEach(slide => { slide.classList.remove("is-active", "is-entering"); slide.style.removeProperty("animation"); slide.style.removeProperty("order"); });
    if (originals.length > visible) {
      const clone = slide => { const node = slide.cloneNode(true); node.dataset.partnerClone = "true"; node.setAttribute("aria-hidden", "true"); node.inert = true; node.removeAttribute("id"); node.querySelectorAll("[id]").forEach(child => child.removeAttribute("id")); return node; };
      track.prepend(...originals.slice(-visible).map(clone)); track.append(...originals.slice(0,visible).map(clone)); position = visible + index;
    } else { index = 0; position = 0; }
    const first = track.firstElementChild, style = first && getComputedStyle(first);
    step = first ? first.getBoundingClientRect().width + parseFloat(style.marginLeft) + parseFloat(style.marginRight) : 0;
    jump(); update(); lastWidth = viewport.clientWidth; playback?.restart();
  }
  track.addEventListener("transitionend", event => { if (event.target === track && event.propertyName === "transform") settle(); });
  next?.addEventListener("click", () => move(1)); previous?.addEventListener("click", () => move(-1));
  viewport.addEventListener("keydown", event => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? 1 : -1); } });
  viewport.addEventListener("pointerdown", event => { if (event.pointerType !== "mouse" && event.isPrimary) touch = {id: event.pointerId, x: event.clientX, y: event.clientY}; });
  viewport.addEventListener("pointerup", event => {
    if (!touch || touch.id !== event.pointerId) return;
    const x = event.clientX - touch.x, y = event.clientY - touch.y; touch = undefined;
    if (Math.abs(x) >= 40 && Math.abs(x) > Math.abs(y) * 1.2) move(x > 0 ? 1 : -1);
  });
  viewport.addEventListener("pointercancel", () => { touch = undefined; });
  motion.addEventListener("change", rebuild);
  new ResizeObserver(() => { if (Math.abs(viewport.clientWidth - lastWidth) > 1 || visible !== count()) { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(rebuild); } }).observe(viewport);
  window.addEventListener("elevation:content", rebuild);
  playback = CarouselPlayback({root, toggle, delay: 3500, observe: viewport, advance: () => move(1), canAdvance: () => originals.length > visible && !moving, onChange: update});
  rebuild();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, {once: true}); else start();
})();
