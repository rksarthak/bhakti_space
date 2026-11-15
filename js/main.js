/* Bhakti Space — page behaviour. Depends on carousel.js and lightbox.js. */

const CONFIG = {
  bookingEmail: "hello@bhaktispace.com",
};

document.documentElement.classList.remove("no-js");

/* Navigation: solid background on scroll + mobile menu ------------------- */
function initNav() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };

  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

/* Marquee: duplicate the words so the loop is seamless -------------------- */
function initMarquee() {
  const track = document.getElementById("stripTrack");
  if (!track) return;
  const clone = track.innerHTML;
  track.insertAdjacentHTML("beforeend", clone);
  [...track.children].slice(track.children.length / 2).forEach((el) => el.setAttribute("aria-hidden", "true"));
}

/* Scroll-reveal animations ------------------------------------------------ */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach((el) => io.observe(el));
}

/* Carousels & gallery ----------------------------------------------------- */
function initCarousels() {
  const responsive = () => (window.innerWidth > 960 ? 3 : window.innerWidth > 720 ? 2 : 1);
  const quotes = document.getElementById("quotes");
  const reviews = document.getElementById("reviews");
  if (quotes) new Carousel(quotes, { interval: 6500 });
  if (reviews) new Carousel(reviews, { perView: responsive, interval: 5500 });

  // Workshops: a grid on desktop, a swipeable scroll-snap carousel on mobile
  const sessions = document.getElementById("sessionList");
  if (sessions) new SnapScroller(sessions);
}

function initGallery() {
  const gallery = document.getElementById("galleryGrid");
  const dialog = document.getElementById("lightbox");
  if (gallery && dialog) new Lightbox(gallery, dialog);
}

/* Booking form → opens the visitor's email client ------------------------- */
function initBookingForm() {
  const form = document.getElementById("bookingForm");
  const status = document.getElementById("formStatus");
  if (!form) return;

  // Pre-select the session when a "Book" / "Reserve" link names one
  document.querySelectorAll("[data-session]").forEach((link) => {
    link.addEventListener("click", () => { form.elements.session.value = link.dataset.session; });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const subject = `Booking request: ${data.get("session")}`;
    const body = [
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Session: ${data.get("session")}`,
      `Guests: ${data.get("guests")}`,
      "",
      data.get("message") || "",
    ].join("\n");

    window.location.href =
      `mailto:${CONFIG.bookingEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = "Your email app should open with the request ready to send. Thank you!";
  });
}

/* Footer year ------------------------------------------------------------- */
function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

initNav();
initMarquee();
initReveal();
initCarousels();
initGallery();
initBookingForm();
initYear();
