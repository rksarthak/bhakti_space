/**
 * Arrows + dots for a native CSS scroll-snap carousel.
 * Swiping is handled by the browser; this only adds the controls and keeps
 * the active dot in sync. It does nothing when the list isn't scrollable
 * (e.g. on desktop, where the same list is a normal grid).
 *
 * Markup:
 *   <div id="x"> …items… </div>            (overflow-x: auto + scroll-snap in CSS)
 *   <button data-scroller-prev="x">  <button data-scroller-next="x">
 *   <div data-scroller-dots="x"></div>
 */
class SnapScroller {
  constructor(list) {
    this.list = list;
    this.items = [...list.children];
    this.dots = document.querySelector(`[data-scroller-dots="${list.id}"]`);

    document.querySelectorAll(`[data-scroller-prev="${list.id}"]`)
      .forEach((b) => b.addEventListener("click", () => this.goTo(this.current() - 1)));
    document.querySelectorAll(`[data-scroller-next="${list.id}"]`)
      .forEach((b) => b.addEventListener("click", () => this.goTo(this.current() + 1)));

    if (this.dots) {
      this.items.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Go to item ${i + 1}`);
        dot.addEventListener("click", () => this.goTo(i));
        this.dots.appendChild(dot);
      });
    }

    let ticking = false;
    list.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { this.update(); ticking = false; });
    }, { passive: true });
    window.addEventListener("resize", () => this.update(), { passive: true });
    this.update();
  }

  /** Index of the item whose left edge is closest to the scroll position. */
  current() {
    const left = this.list.scrollLeft + this.items[0].offsetLeft;
    let best = 0;
    this.items.forEach((item, i) => {
      if (Math.abs(item.offsetLeft - left) < Math.abs(this.items[best].offsetLeft - left)) best = i;
    });
    // At the very end of the scroll, the last item may not reach the left edge
    if (this.list.scrollLeft + this.list.clientWidth >= this.list.scrollWidth - 4) best = this.items.length - 1;
    return best;
  }

  goTo(i) {
    const n = this.items.length;
    const target = this.items[(i + n) % n];
    this.list.scrollTo({ left: target.offsetLeft - this.items[0].offsetLeft, behavior: "smooth" });
  }

  update() {
    if (!this.dots) return;
    const active = this.current();
    [...this.dots.children].forEach((dot, i) => dot.setAttribute("aria-current", String(i === active)));
  }
}

window.SnapScroller = SnapScroller;
