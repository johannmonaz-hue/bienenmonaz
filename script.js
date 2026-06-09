const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open", !expanded);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    });
  });
}

const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxCaption = document.querySelector(".lightbox-caption");
const lightboxClose = document.querySelector(".lightbox-close");

if (lightbox && lightboxImage && lightboxCaption && lightboxClose) {
  document.querySelectorAll(".gallery-button").forEach((button) => {
    button.addEventListener("click", () => {
      const image = button.dataset.image || "";
      const caption = button.dataset.caption || "";
      const alt = button.querySelector("img")?.alt || caption;

      lightboxImage.src = image;
      lightboxImage.alt = alt;
      lightboxCaption.textContent = caption;
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });

  const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxImage.src = "";
    lightboxCaption.textContent = "";
    document.body.style.overflow = "";
  };

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });
}

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

if (contactForm && formStatus) {
  const submitButton = contactForm.querySelector("button[type='submit']");

  const setStatus = (message, state) => {
    formStatus.textContent = message;
    formStatus.classList.remove("is-success", "is-error");
    if (state) formStatus.classList.add(state);
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      subject: String(formData.get("subject") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      _honey: String(formData.get("_honey") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      setStatus("Bitte füllen Sie alle Pflichtfelder aus.", "is-error");
      return;
    }

    setStatus("Wird gesendet …");
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.ok) {
        contactForm.reset();
        setStatus("Danke! Ihre Nachricht ist unterwegs. Wir melden uns bald.", "is-success");
      } else {
        setStatus(
          data.error || "Senden fehlgeschlagen. Bitte später erneut versuchen oder direkt per E-Mail.",
          "is-error"
        );
      }
    } catch {
      setStatus(
        "Verbindung fehlgeschlagen. Bitte später erneut versuchen oder direkt an bienenmonaz@gmail.com schreiben.",
        "is-error"
      );
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}
