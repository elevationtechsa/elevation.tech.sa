(() => {
"use strict";
window.CarouselPlayback = function ({root, toggle, advance, canAdvance, delay, observe = root, onChange = () => {}}) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const events = new AbortController();
  let enabled = !motion.matches, hovered = false, pointerFocus = false, explicitPlay = false;
  let inView = false, timer, destroyed = false;
  const allowed = () => enabled && !document.hidden && inView && (!hovered || explicitPlay) && canAdvance();
  const stop = () => { clearTimeout(timer); timer = undefined; };
  function restart() {
    stop();
    if (destroyed) return;
    toggle.textContent = enabled ? "إيقاف الحركة التلقائية" : "تشغيل الحركة التلقائية";
    toggle.setAttribute("aria-pressed", String(enabled));
    root.dataset.autoplay = String(allowed());
    onChange(enabled);
    if (allowed()) timer = setTimeout(async () => {
      try { if (allowed()) await advance(); }
      catch (error) { enabled = false; console.warn("Carousel could not advance.", error.message); }
      restart();
    }, delay);
  }
  const listen = (node, type, handler) => node.addEventListener(type, handler, {signal: events.signal});
  listen(toggle, "click", () => { enabled = !enabled; explicitPlay = enabled; restart(); });
  listen(root, "pointerenter", event => { if (event.pointerType === "mouse") { hovered = true; explicitPlay = false; restart(); } });
  listen(root, "pointerleave", event => { if (event.pointerType === "mouse") { hovered = false; explicitPlay = false; restart(); } });
  listen(root, "pointerdown", () => { pointerFocus = true; stop(); });
  listen(root, "pointerup", restart);
  listen(root, "pointercancel", restart);
  listen(document, "keydown", () => { pointerFocus = false; });
  listen(root, "focusin", () => { if (!pointerFocus) { enabled = false; explicitPlay = false; restart(); } });
  listen(document, "visibilitychange", restart);
  listen(motion, "change", () => { enabled = !motion.matches; explicitPlay = false; restart(); });
  const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; restart(); }, {threshold: .1});
  observer.observe(observe);
  queueMicrotask(restart);
  return {
    restart, stop,
    get enabled() { return enabled; },
    destroy() { destroyed = true; stop(); events.abort(); observer.disconnect(); }
  };
};
})();
