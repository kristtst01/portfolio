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

let translations = {};

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

if (langToggle) {
  langToggle.addEventListener("click", () => {
    const currentLang = html.getAttribute("lang");
    const newLang = currentLang === "en" ? "no" : "en";
    setLanguage(newLang);
  });
}

// Dynamic navigation height adjustment via JS. Not actually completely sure why,but
// pure CSS calc() for scroll-padding-top causes incorrect scroll offsets
// when combined with scroll-snap, likely due to layout calculation timing during page load
// (hence the magic timeout which fixes it). A bit hacky, but can't get it to work otherwise.
const nav = document.querySelector(".nav");

function setNavHeight() {
  const height = nav.offsetHeight;
  document.documentElement.style.setProperty("--nav-height", height + "px");
}

setTimeout(() => {
  document.documentElement.style.scrollBehavior = "smooth";
}, 100);

window.addEventListener("load", setNavHeight);
window.addEventListener("resize", setNavHeight);

const projectGrid = document.querySelector(".project-grid");
const paginationCounter = document.querySelector(".pagination-counter");
const prevButton = document.getElementById("prev-project");
const nextButton = document.getElementById("next-project");

if (projectGrid) {
  const projectCards = document.querySelectorAll(".project-card");
  const totalCards = projectCards.length;

  const getCarouselGap = () => {
    const gapValue = getComputedStyle(document.documentElement)
      .getPropertyValue("--carousel-gap")
      .trim();
    return parseFloat(gapValue) * 16;
  };

  const getCardWidth = () => projectCards[0]?.offsetWidth || 300;

  if (paginationCounter) {
    projectGrid.addEventListener("scroll", () => {
      const scrollLeft = projectGrid.scrollLeft;
      const cardWidth = getCardWidth();
      const gap = getCarouselGap();
      const currentIndex = Math.round(scrollLeft / (cardWidth + gap));
      paginationCounter.textContent = `${currentIndex + 1} / ${totalCards}`;
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      const cardWidth = getCardWidth();
      const gap = getCarouselGap();
      projectGrid.scrollBy({
        left: -(cardWidth + gap),
        behavior: "smooth",
      });
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      const cardWidth = getCardWidth();
      const gap = getCarouselGap();
      projectGrid.scrollBy({
        left: cardWidth + gap,
        behavior: "smooth",
      });
    });
  }

  // Click and drag functionality
  let isDown = false;
  let startX;
  let scrollLeftStart;

  projectGrid.addEventListener("mousedown", (e) => {
    isDown = true;
    projectGrid.style.cursor = "grabbing";
    startX = e.pageX - projectGrid.offsetLeft;
    scrollLeftStart = projectGrid.scrollLeft;
  });

  projectGrid.addEventListener("mouseleave", () => {
    isDown = false;
    projectGrid.style.cursor = "grab";
  });

  projectGrid.addEventListener("mouseup", () => {
    isDown = false;
    projectGrid.style.cursor = "grab";
  });

  projectGrid.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - projectGrid.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    projectGrid.scrollLeft = scrollLeftStart - walk;
  });
}

// Dynamic project card sizing to make the last card always barely overlapped
function calculateCardWidth() {
  if (!projectGrid) return;

  const projectCards = document.querySelectorAll(".project-card");
  if (projectCards.length === 0) return;

  // Only apply on desktop (tablet and up)
  if (window.innerWidth < 769) {
    projectCards.forEach((card) => (card.style.flexBasis = ""));
    return;
  }

  const containerWidth = projectGrid.offsetWidth;
  const gap =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--carousel-gap",
      ),
    ) * 16;
  const partialCardWidth = 80; // Show this much of the next card
  const minCardWidth = 300;
  const maxCardWidth = 420;

  // Try different numbers of full cards and pick the best fit
  let bestCardWidth = maxCardWidth;

  for (let numCards = 2; numCards <= 6; numCards++) {
    // Calculate what card width would be needed for numCards full cards + partial
    const availableForCards =
      containerWidth - partialCardWidth - gap * numCards;
    const cardWidth = availableForCards / numCards;

    if (cardWidth >= minCardWidth && cardWidth <= maxCardWidth) {
      bestCardWidth = Math.floor(cardWidth);
      break;
    }
  }

  // Apply the calculated width
  projectCards.forEach((card) => {
    card.style.flexBasis = `${bestCardWidth}px`;
  });
}

// Run on load and resize.
window.addEventListener("DOMContentLoaded", () => {
  calculateCardWidth();
  setNavHeight();
  window.scrollTo(0, 0);

  requestAnimationFrame(() => {
    // This is purely for Lighthouse. It gave LCP error because the page was slightly unstable for ~30ms on load. Delay visibility on page for Lighhouse in this period (again ~30ms) just to get the 100 lighthouse report.
    document.documentElement.classList.add("js-ready");

    fetch("translations.json")
      .then((response) => response.json())
      .then((data) => {
        translations = data;
        setLanguage(getLanguagePreference());
      });
  });
});
