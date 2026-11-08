const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARACTERS_PATTERN = /^\+?[\d\s()-]+$/;
const MOBILE_NAV_QUERY = "(max-width: 1120px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

document.addEventListener("DOMContentLoaded", () => {
  setupHeaderScroll();
  setupMobileMenu();
  setupRevealOnScroll();
  setupImageFallbacks();
  setupMenuDialog();
  setupValidatedForm(document.getElementById("reservation-form"), {
    successMessage: (form) =>
      `Thank you, ${form.elements.name.value.trim()}. This is a front-end demonstration, so your request was not sent and no table has been reserved.`,
  });
  setupValidatedForm(document.getElementById("newsletter-form"), {
    successMessage: () =>
      "Thank you for subscribing to the demo. This is a front-end demonstration, so no email was sent.",
  });
});

function setupHeaderScroll() {
  const header = document.getElementById("site-header");
  const updateHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  window.addEventListener("scroll", updateHeaderState, { passive: true });
  updateHeaderState();
}

function setupMobileMenu() {
  const header = document.getElementById("site-header");
  const toggle = header.querySelector(".menu-toggle");
  const navLinks = header.querySelectorAll(".site-nav a");
  const mobileQuery = window.matchMedia(MOBILE_NAV_QUERY);

  const setMenuOpen = (isOpen) => {
    header.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  toggle.addEventListener("click", () => {
    setMenuOpen(!header.classList.contains("is-open"));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

  mobileQuery.addEventListener("change", (event) => {
    if (!event.matches) setMenuOpen(false);
  });
}

function setupRevealOnScroll() {
  const revealItems = document.querySelectorAll(".reveal");
  const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function setupImageFallbacks() {
  document.querySelectorAll("img").forEach((img) => {
    const markBroken = () => img.closest(".media")?.classList.add("is-broken");

    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) {
      markBroken();
    } else {
      img.addEventListener("error", markBroken, { once: true });
    }
  });
}

function setupMenuDialog() {
  const dialog = document.getElementById("item-dialog");
  const dialogImage = document.getElementById("item-dialog-image");
  const dialogCategory = document.getElementById("item-dialog-category");
  const dialogName = document.getElementById("item-dialog-name");
  const dialogPrice = document.getElementById("item-dialog-price");
  const dialogDesc = document.getElementById("item-dialog-desc");
  const reserveLink = dialog.querySelector(".item-dialog__cta");

  document.querySelectorAll(".menu-card").forEach((card) => {
    card.querySelector(".menu-card__btn").addEventListener("click", () => {
      const cardImage = card.querySelector("img");
      dialogImage.src = cardImage.src;
      dialogImage.alt = cardImage.alt;
      dialogCategory.textContent = card.querySelector(".menu-card__category").textContent;
      dialogName.textContent = card.querySelector(".menu-card__name").textContent;
      dialogPrice.textContent = card.querySelector(".menu-card__price").textContent;
      dialogDesc.textContent = card.querySelector(".menu-card__desc").textContent;
      dialog.showModal();
    });
  });

  dialog.querySelector(".item-dialog__close").addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  reserveLink.addEventListener("click", () => dialog.close());
}

function setupValidatedForm(form, { successMessage }) {
  const statusEl = form.querySelector(".form-status");
  const dateInput = form.querySelector('input[type="date"]');

  if (dateInput) {
    dateInput.min = todayISODate();
  }

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("input", () => {
      if (field.closest(".field").classList.contains("has-error")) {
        setFieldError(field, getFieldError(field));
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const invalidFields = validateFields(form);

    if (invalidFields.length > 0) {
      showStatus(statusEl, "error", "Please correct the highlighted fields and try again.");
      invalidFields[0].focus();
      return;
    }

    showStatus(statusEl, "success", successMessage(form));
    form.reset();
  });
}

function validateFields(form) {
  const invalidFields = [];

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    const message = getFieldError(field);
    setFieldError(field, message);
    if (message) invalidFields.push(field);
  });

  return invalidFields;
}

function getFieldError(field) {
  const value = field.value.trim();

  if (!value) {
    return field.required ? "This field is required." : "";
  }

  if (field.type === "email" && !EMAIL_PATTERN.test(value)) {
    return "Please enter a valid email address, such as name@example.com.";
  }

  if (field.type === "tel") {
    const digitCount = value.replace(/\D/g, "").length;
    if (!PHONE_CHARACTERS_PATTERN.test(value) || digitCount < 7 || digitCount > 15) {
      return "Please enter a valid phone number.";
    }
  }

  if (field.type === "date" && value < todayISODate()) {
    return "Please choose today or a future date.";
  }

  return "";
}

function setFieldError(field, message) {
  const wrapper = field.closest(".field");
  wrapper.classList.toggle("has-error", Boolean(message));
  wrapper.querySelector(".field-error").textContent = message;
  field.setAttribute("aria-invalid", String(Boolean(message)));
}

function showStatus(statusEl, type, message) {
  statusEl.hidden = false;
  statusEl.textContent = message;
  statusEl.className = `form-status form-status--${type}`;
}

function todayISODate() {
  return new Date().toLocaleDateString("en-CA");
}
