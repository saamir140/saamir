
document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation
  const menuToggle = document.querySelector(
    ".menu-toggle, .nav-toggle, #menuToggle"
  );

  const navigation = document.querySelector(
    ".nav-links, .nav-menu, #navMenu"
  );

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("active");

      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu after clicking a navigation link
    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navigation.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (target) {
        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // FAQ accordion
  const faqItems = document.querySelectorAll(
    ".faq-item, .accordion-item"
  );

  faqItems.forEach((item) => {
    const trigger = item.querySelector(
      ".faq-question, .accordion-header, button"
    );

    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      // Close other FAQ items
      faqItems.forEach((otherItem) => {
        otherItem.classList.remove("active");

        const otherTrigger = otherItem.querySelector(
          ".faq-question, .accordion-header, button"
        );

        if (otherTrigger) {
          otherTrigger.setAttribute("aria-expanded", "false");
        }
      });

      // Toggle selected item
      if (!isOpen) {
        item.classList.add("active");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Footer dynamic year
  const yearElement = document.querySelector(
    "#currentYear, .current-year"
  );

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Scroll reveal animation
  const revealElements = document.querySelectorAll(
    ".reveal, .fade-up"
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }

  // Prevent empty contact form submission
  const contactForm = document.querySelector(
    "#contactForm, .contact-form"
  );

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      const requiredFields = contactForm.querySelectorAll(
        "[required]"
      );

      let isValid = true;

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false;
          field.focus();
        }
      });

      if (!isValid) {
        event.preventDefault();
      }
    });
  }
});
