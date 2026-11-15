/**
 * Gallery lightbox built on the native <dialog> element.
 * Every <figure> inside the container becomes clickable; the image's
 * `data-full` (or `src`) is shown large, with the <figcaption> as caption.
 */
class Lightbox {
  constructor(container, dialog) {
    this.items = [...container.querySelectorAll("figure")].map((fig) => {
      const img = fig.querySelector("img");
      return {
        src: img.dataset.full || img.currentSrc || img.src,
        alt: img.alt,
        caption: fig.querySelector("figcaption")?.textContent.trim() || "",
      };
    });

    this.dialog = dialog;
    this.img = dialog.querySelector("img");
    this.caption = dialog.querySelector("figcaption");
    this.index = 0;

    container.querySelectorAll("figure").forEach((fig, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", `Open photo: ${this.items[i].alt}`);
      btn.addEventListener("click", () => this.open(i));
      fig.appendChild(btn);
    });

    dialog.querySelector("[data-lightbox-close]").addEventListener("click", () => dialog.close());
    dialog.querySelector("[data-lightbox-prev]").addEventListener("click", () => this.show(this.index - 1));
    dialog.querySelector("[data-lightbox-next]").addEventListener("click", () => this.show(this.index + 1));

    // Close when clicking the dark backdrop (outside the figure)
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") this.show(this.index + 1);
      if (e.key === "ArrowLeft") this.show(this.index - 1);
    });
  }

  show(i) {
    const n = this.items.length;
    this.index = (i + n) % n;
    const item = this.items[this.index];
    this.img.src = item.src;
    this.img.alt = item.alt;
    this.caption.textContent = item.caption;
  }

  open(i) {
    this.show(i);
    if (typeof this.dialog.showModal === "function") this.dialog.showModal();
    else window.open(this.items[i].src, "_blank");
  }
}

window.Lightbox = Lightbox;
