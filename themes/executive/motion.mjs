/** Native progressive motion: readable defaults, one-shot arrivals, no scroll loop. */
export function createExecutiveMotion(root, { observerFactory = (callback) => new IntersectionObserver(callback, { threshold: .12, rootMargin: "0px 0px -8% 0px" }) } = {}) {
  let enabled = false;
  let disposed = false;
  let introPlayed = false;
  const running = new Set();
  const seen = new WeakSet();
  const visible = new Set();
  const play = (element, from, duration, delay, id) => {
    if (!element?.animate || !enabled || disposed) return;
    const animation = element.animate([{ transform: from }, { transform: "none" }], {
      duration, delay, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards",
    });
    animation.id = id;
    const record = { element, animation };
    running.add(record);
    animation.onfinish = animation.oncancel = () => running.delete(record);
  };
  const intro = () => {
    if (introPlayed || !enabled) return;
    introPlayed = true;
    root.querySelectorAll(".executive-identity,.executive-hero-word,.executive-hero-intro,.executive-hero .executive-actions,.executive-hero-stack").forEach((element, index) => {
      play(element, "translateY(48px)", 1000, index * 95, `executive-intro-${index}`);
    });
    play(root.querySelector(".executive-hero-brief"), "translateY(64px) scale(.96)", 1350, 180, "executive-portrait");
    play(root.querySelector(".executive-experience-stamp"), "translateY(28px)", 1000, 550, "executive-summary");
  };
  const reveal = (element, index = 0) => {
    if (!enabled || seen.has(element)) return;
    seen.add(element);
    element.dataset.motionEntered = "true";
    play(element, "translateY(44px)", 950, (index % 3) * 100, "executive-arrival");
  };
  const observer = observerFactory((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) { visible.add(entry.target); reveal(entry.target, index); }
      else visible.delete(entry.target);
    });
  });
  root.querySelectorAll("main .executive-section-heading,main .executive-project,main [data-role],main .executive-expertise-grid > article,main .executive-certificate,main .executive-resume-card,main .executive-contact-intro,main .executive-route-header,main .executive-article-list > article").forEach((element) => observer.observe(element));
  const cancelAll = () => { [...running].forEach(({ animation }) => animation.cancel()); running.clear(); };
  return {
    setEnabled(value) {
      if (disposed || enabled === value) return;
      enabled = value;
      if (!enabled) cancelAll();
      else { intro(); [...visible].forEach(reveal); }
    },
    settleFocused(target) {
      [...running].forEach(({ element, animation }) => {
        if (element === target || element.contains(target)) animation.cancel();
      });
    },
    dispose() { disposed = true; cancelAll(); observer.disconnect(); visible.clear(); },
  };
}
