// Theme toggle functionality
const themeToggle = document.getElementById("theme-toggle");
const html = document.documentElement;

const isLocalStorageAvailable = () => {
  try {
    const test = "__test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

const getThemePreference = () => {
  if (isLocalStorageAvailable()) {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const setTheme = (theme) => {
  html.setAttribute("data-theme", theme);
  if (isLocalStorageAvailable()) {
    localStorage.setItem("theme", theme);
  }
};

setTheme(getThemePreference());

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  });
}

// Language toggle functionality
const langToggle = document.getElementById("lang-toggle");
const langText = document.getElementById("lang-text");

const translations = {
  en: {
    "nav.about": "About",
    "nav.projects": "Projects",
    "projects.title": "Projects",
    "projects.pokeclicker.description":
      "Full-stack Pokemon clicker game with GraphQL API, MongoDB backend, comprehensive unit and E2E testing, and custom canvas-based map collision detection.",
    "projects.dinder.description":
      "Recipe sharing platform with user authentication, real-time updates, and drag-and-drop recipe organization. Built with React, Supabase, and TanStack Query.",
    "about.title": "About Me",
    "about.education.label": "Education",
    "about.education.value":
      "Bachelor in Informatics, NTNU\nGraduating Spring 2026",
    "about.experience.label": "Experience",
    "about.experience.value":
      "Built full-stack web applications using React, TypeScript, and GraphQL. Worked with MongoDB and PostgreSQL, written tests with Vitest and Playwright.",
    "about.learning.label": "Currently Learning",
    "about.learning.value": "The Odin Project (JavaScript)",
    "contact.title": "Contact Me",
    "footer.rights": "All rights reserved.",
  },
  no: {
    "nav.about": "Om",
    "nav.projects": "Prosjekter",
    "projects.title": "Prosjekter",
    "projects.pokeclicker.description":
      "Fullstack Pokemon-klikkespill med GraphQL API, MongoDB backend, omfattende enhets- og E2E-testing, og tilpasset canvas-basert kollisjonsdeteksjon for kart.",
    "projects.dinder.description":
      "Oppskriftsdelingsplattform med brukerautentisering, sanntidsoppdateringer og dra-og-slipp organisering. Bygget med React, Supabase og TanStack Query.",
    "about.title": "Om meg",
    "about.education.label": "Utdanning",
    "about.education.value": "Bachelor i Informatikk, NTNU\nFerdig våren 2026",
    "about.experience.label": "Erfaring",
    "about.experience.value":
      "Har laget fullstack-webapplikasjoner med React, TypeScript og GraphQL. Jobbet med MongoDB og PostgreSQL, skrevet tester med Vitest og Playwright.",
    "about.learning.label": "Lærer nå",
    "about.learning.value": "The Odin Project (JavaScript)",
    "contact.title": "Kontakt meg",
    "footer.rights": "Alle rettigheter reservert.",
  },
};

const getLanguagePreference = () => {
  if (isLocalStorageAvailable()) {
    const savedLang = localStorage.getItem("language");
    if (savedLang) {
      return savedLang;
    }
  }
  return "en";
};

const setLanguage = (lang) => {
  html.setAttribute("lang", lang === "no" ? "no" : "en");

  // Fade out, change text, fade in for smooth transition
  const elements = document.querySelectorAll("[data-i18n]");

  elements.forEach((element) => {
    element.style.opacity = "0";
  });

  setTimeout(() => {
    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (translations[lang] && translations[lang][key]) {
        const text = translations[lang][key];
        // Handle line breaks for elements that need them
        if (text.includes("\n")) {
          element.innerHTML = text.replace(/\n/g, "<br>");
        } else {
          element.textContent = text;
        }
      }
    });

    // Fade back in
    setTimeout(() => {
      elements.forEach((element) => {
        element.style.opacity = "1";
      });
    }, 10);
  }, 150);

  if (langText) {
    langText.textContent = lang === "en" ? "NO" : "EN";
  }

  if (isLocalStorageAvailable()) {
    localStorage.setItem("language", lang);
  }
};

setLanguage(getLanguagePreference());

if (langToggle) {
  langToggle.addEventListener("click", () => {
    const currentLang = html.getAttribute("lang");
    const newLang = currentLang === "en" ? "no" : "en";
    setLanguage(newLang);
  });
}

// Dynamic navigation height adjustment. Kinda insane approach but the calculations were always wrong with pure CSS for some reason
const nav = document.querySelector(".nav");

function setNavHeight() {
  const height = nav.offsetHeight;
  document.documentElement.style.setProperty("--nav-height", height + "px");
}

setNavHeight();
window.scrollTo(0, 0);

setTimeout(() => {
  document.documentElement.style.scrollBehavior = 'smooth';
}, 100);

window.addEventListener("load", setNavHeight);
window.addEventListener("resize", setNavHeight);

// Project carousel pagination counter
const projectGrid = document.querySelector(".project-grid");
const paginationCounter = document.querySelector(".pagination-counter");

if (projectGrid && paginationCounter) {
  const projectCards = document.querySelectorAll(".project-card");
  const totalCards = projectCards.length;

  // Update counter based on scroll position
  projectGrid.addEventListener("scroll", () => {
    const scrollLeft = projectGrid.scrollLeft;
    const cardWidth = projectCards[0]?.offsetWidth || 300;
    const gap = 32; // 2rem gap
    const currentIndex = Math.round(scrollLeft / (cardWidth + gap));
    paginationCounter.textContent = `${currentIndex + 1} / ${totalCards}`;
  });
}

// Dynamic project card sizing to make the last card always barely overlapped
function calculateCardWidth() {
  if (!projectGrid) return;

  const projectCards = document.querySelectorAll(".project-card");
  if (projectCards.length === 0) return;

  // Only apply on desktop (tablet and up)
  if (window.innerWidth < 769) {
    projectCards.forEach(card => card.style.flexBasis = '');
    return;
  }

  const containerWidth = projectGrid.offsetWidth;
  const gap = 32; // 2rem in px
  const partialCardWidth = 80; // Show this much of the next card
  const minCardWidth = 300;
  const maxCardWidth = 420;

  // Try different numbers of full cards and pick the best fit
  let bestCardWidth = maxCardWidth;

  for (let numCards = 2; numCards <= 6; numCards++) {
    // Calculate what card width would be needed for numCards full cards + partial
    const availableForCards = containerWidth - partialCardWidth - (gap * numCards);
    const cardWidth = availableForCards / numCards;

    if (cardWidth >= minCardWidth && cardWidth <= maxCardWidth) {
      bestCardWidth = Math.floor(cardWidth);
      break;
    }
  }

  // Apply the calculated width
  projectCards.forEach(card => {
    card.style.flexBasis = `${bestCardWidth}px`;
  });
}

// Run on load and resize
calculateCardWidth();
window.addEventListener("resize", calculateCardWidth);
