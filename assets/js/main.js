const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const navLinks = document.querySelectorAll(".nav__link");
const header = document.getElementById("header");
const sections = document.querySelectorAll("section[id]");
const scrollProgress = document.getElementById("scroll-progress");
const cursorGlow = document.getElementById("cursor-glow");
const toastStack = document.getElementById("toast-stack");
const contactForm = document.getElementById("contact__form");
const contactSubmitButton = document.getElementById("contact-submit");
const contactButtonText = contactSubmitButton?.querySelector(".button__text");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const EMAILJS_CONFIG = {
  //  EmailJS public key here.
  publicKey: "H1TzshF5LQG4ws8Ik",
  //   EmailJS service ID here.
  serviceId: "service_ot4us7j",
  //   EmailJS template ID here.
  templateId: "template_sfrezj7",
};

const fieldRules = {
  from_name: (value) => {
    if (!value.trim()) {
      return "Please enter your name.";
    }

    if (value.trim().length < 2) {
      return "Name should be at least 2 characters.";
    }

    return "";
  },
  reply_to: (value) => {
    const emailValue = value.trim();

    if (!emailValue) {
      return "Please enter your email address.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(emailValue)) {
      return "Please enter a valid email address.";
    }

    return "";
  },
  subject: (value) => {
    if (!value.trim()) {
      return "Please add a subject.";
    }

    if (value.trim().length < 3) {
      return "Subject should be at least 3 characters.";
    }

    return "";
  },
  message: (value) => {
    if (!value.trim()) {
      return "Please add your message.";
    }

    if (value.trim().length < 12) {
      return "Message should be at least 12 characters.";
    }

    return "";
  },
};

const toastIconMap = {
  success: "fa-circle-check",
  error: "fa-circle-xmark",
  warning: "fa-triangle-exclamation",
};

let emailJsInitialized = false;
let scrollRafId = 0;

const setMenuState = (isOpen) => {
  if (!navMenu || !navToggle) {
    return;
  }

  navMenu.classList.toggle("show", isOpen);
  document.body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
};

const getHeaderOffset = () => (header ? header.offsetHeight + 18 : 96);

const smoothScrollToHash = (hash) => {
  if (!hash || hash === "#") {
    return;
  }

  const target = document.querySelector(hash);

  if (!target) {
    return;
  }

  const top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();

  window.scrollTo({
    top,
    behavior: reduceMotion ? "auto" : "smooth",
  });
};

const bindSmoothScrolling = () => {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    const hash = link.getAttribute("href");

    if (!hash || hash === "#") {
      return;
    }

    const target = document.querySelector(hash);

    if (!target) {
      return;
    }

    link.addEventListener("click", (event) => {
      event.preventDefault();
      smoothScrollToHash(hash);

      if (window.location.hash !== hash) {
        window.history.replaceState(null, "", hash);
      }

      setMenuState(false);
    });
  });
};

const syncHashOffset = () => {
  if (!window.location.hash) {
    return;
  }

  window.setTimeout(() => {
    smoothScrollToHash(window.location.hash);
  }, 80);
};

const scrollActive = () => {
  const scrollDown = window.scrollY;
  const headerOffset = getHeaderOffset();

  sections.forEach((section) => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - headerOffset;
    const sectionId = section.getAttribute("id");
    const sectionLink = document.querySelector(`.nav__menu a[href*="${sectionId}"]`);

    if (!sectionLink) {
      return;
    }

    if (scrollDown >= sectionTop && scrollDown < sectionTop + sectionHeight) {
      sectionLink.classList.add("active-link");
    } else {
      sectionLink.classList.remove("active-link");
    }
  });
};

const scrollHeader = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("scroll-header", window.scrollY >= 40);
};

const updateScrollProgress = () => {
  if (!scrollProgress) {
    return;
  }

  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? Math.min(window.scrollY / scrollableHeight, 1) : 0;

  scrollProgress.style.transform = `scaleX(${progress})`;
};

const runScrollEffects = () => {
  scrollRafId = 0;
  scrollActive();
  scrollHeader();
  updateScrollProgress();
};

const queueScrollEffects = () => {
  if (scrollRafId) {
    return;
  }

  scrollRafId = window.requestAnimationFrame(runScrollEffects);
};

const initNavigation = () => {
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      setMenuState(!navMenu.classList.contains("show"));
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".nav") && navMenu.classList.contains("show")) {
        setMenuState(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navMenu.classList.contains("show")) {
        setMenuState(false);
      }
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      setMenuState(false);
    }

    queueScrollEffects();
  });

  window.addEventListener("scroll", queueScrollEffects, { passive: true });
  window.addEventListener("hashchange", syncHashOffset);
  queueScrollEffects();
  bindSmoothScrolling();
  syncHashOffset();
};

const initRoleTyping = () => {
  const roleElement = document.querySelector(".role[data-roles]");

  if (!roleElement) {
    return;
  }

  const roles = roleElement.dataset.roles
    .split("|")
    .map((role) => role.trim())
    .filter(Boolean);

  if (reduceMotion || roles.length <= 1) {
    roleElement.textContent = roles[0] || roleElement.textContent;
    return;
  }

  let roleIndex = 0;
  let characterIndex = 0;
  let isDeleting = false;

  const typeRole = () => {
    const currentRole = roles[roleIndex];
    roleElement.textContent = currentRole.slice(0, characterIndex);

    if (!isDeleting && characterIndex < currentRole.length) {
      characterIndex += 1;
      window.setTimeout(typeRole, 80);
      return;
    }

    if (!isDeleting) {
      isDeleting = true;
      window.setTimeout(typeRole, 1500);
      return;
    }

    if (characterIndex > 0) {
      characterIndex -= 1;
      window.setTimeout(typeRole, 42);
      return;
    }

    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    window.setTimeout(typeRole, 180);
  };

  typeRole();
};

const initScrollReveal = () => {
  if (!window.ScrollReveal || reduceMotion) {
    return;
  }

  const sr = ScrollReveal({
    origin: "bottom",
    distance: "32px",
    duration: 900,
    delay: 100,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    reset: false,
    mobile: true,
  });

  sr.reveal(".home__data", { origin: "left" });
  sr.reveal(".home__visual", { origin: "right", delay: 180 });
  sr.reveal(".about__visual", { origin: "left", delay: 120, distance: "24px" });
  sr.reveal(".about__content", { origin: "right", delay: 160, distance: "24px" });
  sr.reveal(".about__info-card, .about__pill-list span", { interval: 70, delay: 220, distance: "16px" });
  sr.reveal(".home__highlight, .home__social-icon", { interval: 100, delay: 220, distance: "20px" });
  sr.reveal(".home__detail-card, .home__stack-pills span", { interval: 100, delay: 250, distance: "18px" });
  sr.reveal(".education__metric", { interval: 90, delay: 110, distance: "18px" });
  sr.reveal(".education__item", { interval: 140, delay: 120, distance: "28px" });
  sr.reveal(".skills__category", { interval: 120, delay: 120, distance: "24px" });
  sr.reveal(".skills__card", { interval: 55, delay: 180, distance: "16px" });
  sr.reveal(".project", { interval: 140, delay: 120, distance: "26px" });
  sr.reveal(".collaboration__card", { delay: 140, distance: "24px" });
  sr.reveal(".collaboration__link", { interval: 90, delay: 220, distance: "18px" });
  sr.reveal(".contact__panel", { origin: "left", delay: 140, distance: "24px" });
  sr.reveal("#contact__form", { origin: "right", delay: 180, distance: "24px" });
};

const showToast = ({ type = "success", title, message }) => {
  if (!toastStack) {
    return;
  }

  const toast = document.createElement("div");
  const iconClass = toastIconMap[type] || toastIconMap.success;

  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.tabIndex = 0;

  const icon = document.createElement("span");
  icon.className = "toast__icon";
  icon.setAttribute("aria-hidden", "true");

  const iconElement = document.createElement("i");
  iconElement.className = `fa-solid ${iconClass}`;
  icon.appendChild(iconElement);

  const content = document.createElement("div");
  content.className = "toast__content";

  const titleElement = document.createElement("strong");
  titleElement.className = "toast__title";
  titleElement.textContent = title;

  const messageElement = document.createElement("span");
  messageElement.className = "toast__message";
  messageElement.textContent = message;

  content.append(titleElement, messageElement);
  toast.append(icon, content);

  const existingToasts = [...toastStack.children];

  if (existingToasts.length >= 3) {
    existingToasts[0].remove();
  }

  toastStack.appendChild(toast);

  const dismissToast = () => {
    if (toast.classList.contains("is-leaving")) {
      return;
    }

    toast.classList.add("is-leaving");
    toast.addEventListener(
      "animationend",
      () => {
        toast.remove();
      },
      { once: true }
    );
  };

  toast.addEventListener("click", dismissToast);
  toast.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      dismissToast();
    }
  });

  window.setTimeout(dismissToast, 4200);
};

const initProjectModals = () => {
  const modal = document.getElementById("project-modal");
  const modalOverlay = modal?.querySelector("[data-project-modal-overlay]");
  const closeButton = modal?.querySelector(".project-modal__close");
  const titleElement = modal?.querySelector(".project-modal__title");
  const eyebrowElement = modal?.querySelector(".project-modal__eyebrow");
  const statusElement = modal?.querySelector(".project-modal__status");
  const descriptionElement = modal?.querySelector(".project-modal__description");
  const stackElement = modal?.querySelector(".project-modal__stack");
  const featuresElement = modal?.querySelector(".project-modal__features");
  const actionsElement = modal?.querySelector(".project-modal__actions");

  const projectModalDescriptions = {
    smarttrack: "SmartTrack is a full-stack productivity system built to transform how teams and solo developers coordinate work. It combines clean frontend workflow interaction with a Java/Spring Boot backend, structured MySQL persistence, and intuitive task tracking.",
    fitloopz: "FitLoopz is an AI-first daily life manager optimized for fitness, task flow, reminders, and progress tracking. It blends React Native front-end flow with intelligent task planning, chatbot-style reminders, and performance-aware mobile UX.",
    portfolio: "This portfolio platform is a polished developer showcase built for modern responsiveness, clear interaction, and maintainable frontend architecture. It keeps the focus on project storytelling, smooth navigation, and a consistent dark experience."
  };

  let activeButton = null;

  if (!modal || !titleElement || !eyebrowElement || !descriptionElement || !stackElement || !featuresElement || !actionsElement) {
    return;
  }

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (activeButton) {
      activeButton.setAttribute("aria-expanded", "false");
      activeButton.focus();
    }
    activeButton = null;
    document.body.classList.remove("has-active-modal");
    window.removeEventListener("keydown", handleEscape);
  };

  const handleEscape = (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  };

  const createStackTag = (tag) => {
    const iconHtml = tag.querySelector("i")?.outerHTML || "";
    const label = tag.getAttribute("title") || tag.textContent.trim();
    const techClass = tag.dataset.tech ? `project-modal__tag--${tag.dataset.tech}` : "";

    return `
      <span class="popup-tech-item ${techClass}">
        <span class="project-modal__tag-icon">${iconHtml}</span>
        <span class="project-modal__tag-label">${label}</span>
      </span>
    `;
  };

  const openModal = (project, button) => {
    const eyebrow = project.querySelector(".project__eyebrow")?.textContent.trim() || "";
    const title = project.querySelector(".project__title")?.textContent.trim() || "";
    const status = project.querySelector(".project__status-badge")?.textContent.trim() || "";
    const descriptionKey = project.classList.contains("project--smarttrack")
      ? "smarttrack"
      : project.classList.contains("project--fitloopz")
      ? "fitloopz"
      : project.classList.contains("project--portfolio")
      ? "portfolio"
      : "";
    const description = projectModalDescriptions[descriptionKey] || project.querySelector(".project__description")?.textContent.trim() || "";
    const tags = [...project.querySelectorAll(".project__tag")];
    const featureItems = [...project.querySelectorAll(".project__details .project__feature")].map((item) => item.textContent.trim());
    const actionButtons = [...project.querySelectorAll(".project__actions a, .project__actions button")];

    eyebrowElement.textContent = eyebrow;
    titleElement.textContent = title;
    descriptionElement.textContent = description;

    if (status) {
      statusElement.textContent = status;
      statusElement.hidden = false;
    } else {
      statusElement.hidden = true;
    }

    stackElement.innerHTML = tags.map(createStackTag).join("");

    featuresElement.innerHTML = featureItems
      .map((feature) => `<li>${feature}</li>`)
      .join("");

    actionsElement.innerHTML = "";
    actionButtons.forEach((source) => {
      const cloned = source.cloneNode(true);
      actionsElement.appendChild(cloned);
    });

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    activeButton = button;
    activeButton?.setAttribute("aria-expanded", "true");
    document.body.classList.add("has-active-modal");
    closeButton?.focus();
    window.addEventListener("keydown", handleEscape);
  };

  const openProjectPopup = (projectName) => {
    const project = document.querySelector(`.project--${projectName}`);
    if (!project) {
      return;
    }
    openModal(project, null);
  };

  document.querySelectorAll(".project__toggle").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const project = button.closest(".project");
      if (!project) {
        return;
      }
      openModal(project, button);
    });
  });

  document.querySelectorAll(".details-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const projectName = button.dataset.project;
      if (!projectName) {
        return;
      }
      openProjectPopup(projectName);
    });
  });

  closeButton?.addEventListener("click", closeModal);
  modalOverlay?.addEventListener("click", closeModal);
};

const galleryData = {
  fitloopz: [
    { src: "assets/img/snap1.jpeg", alt: "FitLoopz screenshot 1" },
    { src: "assets/img/snap2.jpeg", alt: "FitLoopz screenshot 2" },
    { src: "assets/img/snap3.jpeg", alt: "FitLoopz screenshot 3" },
    { src: "assets/img/snap4.jpeg", alt: "FitLoopz screenshot 4" },
    { src: "assets/img/snap5.jpeg", alt: "FitLoopz screenshot 5" },
    { src: "assets/img/snap6.jpeg", alt: "FitLoopz screenshot 6" },
  ],
};

const initGalleryModal = () => {
  const modal = document.getElementById("gallery-modal");
  const overlay = modal?.querySelector("[data-gallery-modal-overlay]");
  const closeButton = modal?.querySelector(".gallery-modal__close");
  const titleElement = modal?.querySelector(".gallery-modal__title");
  const subtitleElement = modal?.querySelector(".gallery-modal__subtitle");
  const imageElement = modal?.querySelector(".gallery-modal__image");
  const emptyElement = modal?.querySelector(".gallery-modal__empty");
  const countElement = modal?.querySelector(".gallery-modal__count");
  const thumbnails = modal?.querySelector(".gallery-modal__thumbnails");
  const prevButton = modal?.querySelector(".gallery-modal__control--prev");
  const nextButton = modal?.querySelector(".gallery-modal__control--next");
  let activeGallery = null;
  let currentIndex = 0;

  if (!modal || !overlay || !closeButton || !imageElement || !emptyElement || !countElement || !thumbnails || !prevButton || !nextButton) {
    return;
  }

  const closeGallery = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-active-modal");
    activeGallery = null;
    window.removeEventListener("keydown", handleGalleryEscape);
  };

  const handleGalleryEscape = (event) => {
    if (event.key === "Escape") {
      closeGallery();
    }
  };

  const renderGallery = () => {
    const items = galleryData[activeGallery] || [];
    const activeItem = items[currentIndex] || {};
    const hasImage = Boolean(activeItem.src);

    if (hasImage) {
      imageElement.src = activeItem.src;
      imageElement.alt = activeItem.alt || "Screenshot preview";
      imageElement.hidden = false;
      emptyElement.hidden = true;
    } else {
      imageElement.hidden = true;
      emptyElement.hidden = false;
      emptyElement.textContent = "Screenshot content will appear here once image URLs are added.";
    }

    countElement.textContent = `${items.length ? currentIndex + 1 : 0} / ${items.length}`;
    prevButton.disabled = currentIndex <= 0;
    nextButton.disabled = currentIndex >= items.length - 1 || items.length === 0;

    thumbnails.innerHTML = items
      .map((item, index) => `
        <button type="button" class="gallery-modal__thumbnail" data-index="${index}" aria-label="Show screenshot ${index + 1}">
          <span>${index + 1}</span>
        </button>
      `)
      .join("");

    thumbnails.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        currentIndex = Number(button.dataset.index);
        renderGallery();
      });
    });
  };

  const openGallery = (galleryId) => {
    activeGallery = galleryId;
    currentIndex = 0;
    titleElement.textContent = galleryId === "fitloopz" ? "FitLoopz Screenshot Gallery" : "Screenshot Gallery";
    subtitleElement.textContent = "A premium visual preview of the project experience.";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-active-modal");
    renderGallery();
    closeButton.focus();
    window.addEventListener("keydown", handleGalleryEscape);
  };

  prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      renderGallery();
    }
  });

  nextButton.addEventListener("click", () => {
    const items = galleryData[activeGallery] || [];
    if (currentIndex < items.length - 1) {
      currentIndex += 1;
      renderGallery();
    }
  });

  closeButton.addEventListener("click", closeGallery);
  overlay.addEventListener("click", closeGallery);

  document.querySelectorAll(".project__gallery").forEach((button) => {
    button.addEventListener("click", () => {
      const galleryId = button.dataset.gallery;
      openGallery(galleryId);
    });
  });
};

const initCursorGlow = () => {
  if (!cursorGlow || reduceMotion) {
    return;
  }

  const mediaQuery = window.matchMedia("(pointer: fine)");

  if (!mediaQuery.matches || window.innerWidth < 1024) {
    return;
  }

  let cursorX = 0;
  let cursorY = 0;
  let cursorRafId = 0;

  const renderCursorGlow = () => {
    cursorRafId = 0;
    cursorGlow.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
  };

  document.addEventListener("pointermove", (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    cursorGlow.classList.add("is-visible");

    if (!cursorRafId) {
      cursorRafId = window.requestAnimationFrame(renderCursorGlow);
    }
  });

  document.addEventListener("pointerdown", () => {
    cursorGlow.classList.add("is-pressed");
  });

  document.addEventListener("pointerup", () => {
    cursorGlow.classList.remove("is-pressed");
  });

  document.documentElement.addEventListener("mouseleave", () => {
    cursorGlow.classList.remove("is-visible");
    cursorGlow.classList.remove("is-pressed");
  });
};

const getFieldWrapper = (input) => input.closest(".field, .message");

const clearFieldError = (input) => {
  const wrapper = getFieldWrapper(input);
  const errorElement = wrapper?.querySelector(".field__error");

  if (!wrapper || !errorElement) {
    return;
  }

  wrapper.classList.remove("is-invalid");
  input.removeAttribute("aria-invalid");
  errorElement.textContent = "";
};

const setFieldError = (input, message) => {
  const wrapper = getFieldWrapper(input);
  const errorElement = wrapper?.querySelector(".field__error");

  if (!wrapper || !errorElement) {
    return;
  }

  wrapper.classList.add("is-invalid");
  input.setAttribute("aria-invalid", "true");
  errorElement.textContent = message;
};

const validateField = (input) => {
  const rule = fieldRules[input.name];

  if (!rule) {
    return true;
  }

  const message = rule(input.value);

  if (message) {
    setFieldError(input, message);
    return false;
  }

  clearFieldError(input);
  return true;
};

const validateContactForm = () => {
  if (!contactForm) {
    return false;
  }

  const inputs = [...contactForm.querySelectorAll("input, textarea")];
  let isValid = true;
  let firstInvalidField = null;

  inputs.forEach((input) => {
    const fieldIsValid = validateField(input);

    if (!fieldIsValid) {
      isValid = false;

      if (!firstInvalidField) {
        firstInvalidField = input;
      }
    }
  });

  if (!isValid && firstInvalidField) {
    firstInvalidField.focus();
  }

  return isValid;
};

const hasEmailJsConfig = () =>
  Object.values(EMAILJS_CONFIG).every(
    (value) => typeof value === "string" && value.trim() !== "" && !value.startsWith("YOUR_EMAILJS_")
  );

const initEmailJs = () => {
  if (emailJsInitialized) {
    return true;
  }

  if (!window.emailjs || !hasEmailJsConfig()) {
    return false;
  }

  window.emailjs.init({
    publicKey: EMAILJS_CONFIG.publicKey,
    limitRate: {
      id: "portfolio-contact-form",
      throttle: 10000,
    },
  });

  emailJsInitialized = true;
  return true;
};

const setContactSubmitState = (isLoading) => {
  if (!contactSubmitButton || !contactButtonText) {
    return;
  }

  contactSubmitButton.disabled = isLoading;
  contactSubmitButton.classList.toggle("is-loading", isLoading);
  contactSubmitButton.setAttribute("aria-busy", String(isLoading));
  contactButtonText.textContent = isLoading ? "Sending..." : "Send Message";
};

const resetContactFormState = () => {
  if (!contactForm) {
    return;
  }

  const inputs = [...contactForm.querySelectorAll("input, textarea")];

  inputs.forEach((input) => clearFieldError(input));
  contactForm.reset();
};

const handleContactSubmit = async (event) => {
  event.preventDefault();

  if (!contactForm) {
    return;
  }

  const isValid = validateContactForm();

  if (!isValid) {
    showToast({
      type: "warning",
      title: "Check the form",
      message: "Please fix the highlighted fields before sending your message.",
    });
    return;
  }

  if (!initEmailJs()) {
    showToast({
      type: "error",
      title: "EmailJS setup needed",
      message: "Add your EmailJS public key, service ID, and template ID in assets/js/main.js.",
    });
    return;
  }

  setContactSubmitState(true);

  const formData = new FormData(contactForm);
  const templateParams = {
    // Match these parameter names with the variables used in your EmailJS template.
    from_name: String(formData.get("from_name") || "").trim(),
    reply_to: String(formData.get("reply_to") || "").trim(),
    from_email: String(formData.get("reply_to") || "").trim(),
    subject: String(formData.get("subject") || "").trim(),
    message: String(formData.get("message") || "").trim(),
  };

  try {
    await window.emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams);

    resetContactFormState();
    showToast({
      type: "success",
      title: "Message sent",
      message: "Your message was delivered successfully. I'll get back to you soon.",
    });
  } catch (error) {
    const isRateLimited = Number(error?.status) === 429;

    showToast({
      type: "error",
      title: "Message not sent",
      message: isRateLimited
        ? "You're sending messages too quickly. Please wait a few seconds and try again."
        : "Something went wrong while sending your message. Please try again in a moment.",
    });
  } finally {
    setContactSubmitState(false);
  }
};

const initContactForm = () => {
  if (!contactForm) {
    return;
  }

  const inputs = [...contactForm.querySelectorAll("input, textarea")];

  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      validateField(input);
    });

    input.addEventListener("input", () => {
      if (getFieldWrapper(input)?.classList.contains("is-invalid")) {
        validateField(input);
      }
    });
  });

  contactForm.addEventListener("submit", handleContactSubmit);
};

initNavigation();
initRoleTyping();
initScrollReveal();
initCursorGlow();
initProjectModals();
initGalleryModal();
initContactForm();
