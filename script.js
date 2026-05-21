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
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !subject || !message) {
      formStatus.textContent = "Bitte fuellen Sie alle Pflichtfelder aus.";
      return;
    }

    const bodyLines = [
      `Name: ${name}`,
      `E-Mail: ${email}`,
      `Telefon: ${phone || "-"}`,
      "",
      "Nachricht:",
      message
    ];

    const mailto = `mailto:bienenmonaz@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    window.location.href = mailto;
    formStatus.textContent = "Ihr E-Mail-Programm sollte sich jetzt mit der vorbereiteten Nachricht oeffnen.";
  });
}
