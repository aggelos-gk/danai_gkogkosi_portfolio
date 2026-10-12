(function () {
    const header = document.getElementById("header");
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    const navItems = document.querySelectorAll(".nav-links a");
    const backToTop = document.querySelector(".back-to-top");
    const heroImage = document.querySelector(".hero-image");
    const heroPortrait = document.querySelector(".hero-portrait");
    const trackedSections = Array.from(navItems)
        .map((item) => item.getAttribute("href"))
        .filter((href) => href && href.startsWith("#") && href !== "#")
        .map((href) => document.querySelector(href))
        .filter(Boolean);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scrollAnimationFrame = null;

    const smoothScrollTo = (targetY, maxDuration = 760) => {
        if (prefersReducedMotion) {
            window.scrollTo(0, targetY);
            return;
        }

        if (scrollAnimationFrame !== null) {
            cancelAnimationFrame(scrollAnimationFrame);
            scrollAnimationFrame = null;
        }

        const safeTargetY = Math.max(0, targetY);
        const startY = window.scrollY;
        const distance = safeTargetY - startY;
        if (Math.abs(distance) < 2) {
            return;
        }
        const duration = Math.max(360, Math.min(maxDuration, Math.abs(distance) * 0));
        const startTime = performance.now();

        const easeOutCubic = (time) => 1 - Math.pow(1 - time, 3);

        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);

            window.scrollTo(0, startY + distance * eased);

            if (progress < 1) {
                scrollAnimationFrame = requestAnimationFrame(step);
            } else {
                scrollAnimationFrame = null;
            }
        };

        const initialProgress = Math.min(20 / duration, 1);
        window.scrollTo(0, startY + distance * easeOutCubic(initialProgress));
        scrollAnimationFrame = requestAnimationFrame(step);
    };

    const updateActiveNav = () => {
        if (trackedSections.length === 0) {
            return;
        }

        const scrollPosition = window.scrollY + 88;
        let currentSectionId = trackedSections[0].id;

        trackedSections.forEach((section) => {
            if (scrollPosition >= section.offsetTop) {
                currentSectionId = section.id;
            }
        });

        // The footer is too short to reach the top of the screen, so mark the last link at the page bottom
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
            currentSectionId = trackedSections[trackedSections.length - 1].id;
        }

        navItems.forEach((item) => {
            item.classList.toggle("active", item.getAttribute("href") === `#${currentSectionId}`);
        });
    };

    const setScrolledState = () => {
        if (header) {
            header.classList.toggle("scrolled", window.scrollY > 32);
        }

        if (backToTop) {
            backToTop.classList.toggle("active", window.pageYOffset > 280);
        }

        updateActiveNav();
    };

    setScrolledState();
    window.addEventListener("scroll", setScrolledState, { passive: true });
    window.addEventListener("resize", updateActiveNav);

    if (heroImage && heroPortrait && window.matchMedia("(pointer: fine)").matches) {
        heroImage.addEventListener("mousemove", (event) => {
            const rect = heroImage.getBoundingClientRect();
            const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
            const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

            heroPortrait.style.setProperty("--hero-tilt-x", `${(offsetX * 7).toFixed(2)}deg`);
            heroPortrait.style.setProperty("--hero-tilt-y", `${(offsetY * -6).toFixed(2)}deg`);
        });

        heroImage.addEventListener("mouseleave", () => {
            heroPortrait.style.setProperty("--hero-tilt-x", "0deg");
            heroPortrait.style.setProperty("--hero-tilt-y", "0deg");
        });
    }

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            hamburger.classList.toggle("active");
        });
    }

    navItems.forEach((item) => {
        item.addEventListener("click", () => {
            navLinks?.classList.remove("active");
            hamburger?.classList.remove("active");
        });
    });

    if (backToTop) {
        backToTop.addEventListener("click", () => {
            smoothScrollTo(0, 1300);
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const targetId = anchor.getAttribute("href");

            if (!targetId || !targetId.startsWith("#")) {
                return;
            }

            event.preventDefault();

            if (targetId === "#") {
                smoothScrollTo(0, 980);
                return;
            }

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                smoothScrollTo(targetElement.offsetTop - 70, 820);
            }
        });
    });

    const skillsFilterButtons = document.querySelectorAll("#skills .filter-btn");
    const skillItems = document.querySelectorAll(".skill-item");

    skillsFilterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;

            skillsFilterButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");

            skillItems.forEach((item) => {
                const shouldShow = filter === "all" || item.dataset.category === filter;
                item.style.display = shouldShow ? "" : "none";
            });
        });
    });

    const portfolioFilterButtons = document.querySelectorAll("#portfolio .filter-btn");
    const portfolioItems = document.querySelectorAll(".portfolio-item");
    const descriptionTexts = document.querySelectorAll(".description-text");

    const animatePortfolioEntry = (visibleItems) => {
        requestAnimationFrame(() => {
            visibleItems.forEach((item, index) => {
                item.classList.remove("portfolio-enter");
                item.style.setProperty("--portfolio-delay", `${Math.min(index * 55, 280)}ms`);
                void item.offsetWidth;
                item.classList.add("portfolio-enter");
            });
        });
    };

    const filterPortfolio = (category, animate = true) => {
        const visibleItems = [];

        portfolioItems.forEach((item) => {
            const matches = item.getAttribute("data-category") === category;

            if (matches) {
                item.style.display = "block";
                visibleItems.push(item);
            } else {
                item.style.display = "none";
                item.classList.remove("portfolio-enter");
                item.style.removeProperty("--portfolio-delay");
            }
        });

        if (animate) {
            animatePortfolioEntry(visibleItems);
        }

        descriptionTexts.forEach((text) => {
            const matches = text.getAttribute("data-for-category") === category;
            text.classList.toggle("active", matches);
        });
    };

    if (portfolioFilterButtons.length > 0) {
        portfolioFilterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                portfolioFilterButtons.forEach((btn) => btn.classList.remove("active"));
                button.classList.add("active");
                filterPortfolio(button.getAttribute("data-filter"));
            });
        });

        const defaultButton = document.querySelector("#portfolio .filter-btn.active") || portfolioFilterButtons[0];
        if (defaultButton) {
            filterPortfolio(defaultButton.getAttribute("data-filter") || "videos", false);
        }
    }
})();
