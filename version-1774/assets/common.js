const ready = (fn) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  } else {
    fn();
  }
};

ready(() => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-mobile-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    let active = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
    const show = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === active));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === active));
    };
    dots.forEach((dot, i) => dot.addEventListener("click", () => show(i)));
    if (slides.length > 1) {
      window.setInterval(() => show(active + 1), 5600);
    }
  }

  document.querySelectorAll("[data-search-scope]").forEach((scope) => {
    const input = scope.querySelector("[data-search-input]");
    const cards = Array.from(scope.querySelectorAll("[data-card]"));
    const buttons = Array.from(scope.querySelectorAll("[data-filter-value]"));
    const empty = scope.querySelector("[data-empty]");
    let group = "all";

    const apply = () => {
      const keyword = input ? input.value.trim().toLowerCase() : "";
      let visible = 0;
      cards.forEach((card) => {
        const text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        const cardGroup = card.getAttribute("data-group") || "other";
        const matchedGroup = group === "all" || cardGroup === group;
        const matchedKeyword = !keyword || text.includes(keyword);
        const show = matchedGroup && matchedKeyword;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        group = button.getAttribute("data-filter-value") || "all";
        buttons.forEach((item) => item.classList.toggle("is-active", item === button));
        apply();
      });
    });
  });
});
