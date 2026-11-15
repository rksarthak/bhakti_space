/**
 * Lightweight, dependency-free carousel.
 *
 * Markup:
 *   <div class="carousel" id="x">
 *     <div class="carousel__track"> <div class="carousel__slide">…</div> … </div>
 *   </div>
 *   <button data-carousel="x" data-step="-1">  <button data-carousel="x" data-step="1">
 *   <div class="carousel__dots" data-carousel-dots="x"></div>   (optional)
 *
 * Options:
 *   perView   number | () => number   slides visible at once (default 1)
 *   interval  ms between auto-advances; 0 disables autoplay (default 6000)
 */
class Carousel {
  constructor(root, { perView = 1, interval = 6000 } = {}) {
    this.root = root;
    this.track = root.querySelector(".carousel__track");
    this.slides = [...this.track.children];
    this.perViewOpt = perView;
    this.interval = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : interval;
    this.index = 0;
    this.timer = null;

    this.dots = document.querySelector(`[data-carousel-dots="${root.id}"]`);
    this.buildDots();
    this.bindControls();
    this.bindSwipe();

    root.addEventListener("mouseenter", () => this.stop());
    root.addEventListener("mouseleave", () => this.play());
    root.addEventListener("focusin", () => this.stop());
    root.addEventListener("focusout", () => this.play());
    window.addEventListener("resize", () => this.go(this.index), { passive: true });

    this.go(0);
    this.play();
  }

  get perView() {
    return typeof this.perViewOpt === "function" ? this.perViewOpt() : this.perViewOpt;
  }

  get maxIndex() {
    return Math.max(0, this.slides.length - this.perView);
  }

  go(target) {
    const max = this.maxIndex;
    this.index = target > max ? 0 : target < 0 ? max : target;
    this.track.style.transform = `translateX(-${(this.index * 100) / this.perView}%)`;

    this.slides.forEach((slide, i) => {
      const visible = i >= this.index && i < this.index + this.perView;
      slide.setAttribute("aria-hidden", String(!visible));
      slide.inert = !visible;
    });

    if (this.dots) {
      [...this.dots.children].forEach((dot, i) => {
        dot.hidden = i > max;
        dot.setAttribute("aria-current", String(i === this.index));
      });
    }
  }

  next() { this.go(this.index + 1); }
  prev() { this.go(this.index - 1); }

  play() {
    if (!this.interval) return;
    this.stop();
    this.timer = setInterval(() => this.next(), this.interval);
  }

  stop() { clearInterval(this.timer); }

  restart(fn) {
    fn();
    this.play();
  }

  buildDots() {
    if (!this.dots) return;
    this.slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => this.restart(() => this.go(i)));
      this.dots.appendChild(dot);
    });
  }

  bindControls() {
    document.querySelectorAll(`[data-carousel="${this.root.id}"]`).forEach((btn) => {
      const step = Number(btn.dataset.step) || 1;
      btn.addEventListener("click", () => this.restart(() => this.go(this.index + step)));
    });
  }

  bindSwipe() {
    let startX = 0;
    this.root.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    this.root.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) this.restart(() => (dx < 0 ? this.next() : this.prev()));
    });
  }
}

window.Carousel = Carousel;
