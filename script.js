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
    const portfolioPager = document.querySelector(".portfolio-pager");
    const portfolioPageCount = document.querySelector(".portfolio-page-count");
    const portfolioArrows = document.querySelectorAll(".portfolio-arrow");
    const mobilePortfolio = window.matchMedia("(max-width: 600px)");
    let portfolioCategory = null;
    let portfolioPage = 0;

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

    // Six items per page on desktop, one on mobile; the arrows only show when there is more than one page
    const getPortfolioPageSize = () => (mobilePortfolio.matches ? 1 : 6);

    const getPortfolioPageCount = () => {
        const total = Array.from(portfolioItems).filter((item) => item.getAttribute("data-category") === portfolioCategory).length;
        return Math.max(1, Math.ceil(total / getPortfolioPageSize()));
    };

    const renderPortfolio = (animate) => {
        const pageSize = getPortfolioPageSize();
        const pageCount = getPortfolioPageCount();
        const categoryItems = Array.from(portfolioItems).filter((item) => item.getAttribute("data-category") === portfolioCategory);
        portfolioPage = Math.min(portfolioPage, pageCount - 1);
        const visibleItems = categoryItems.slice(portfolioPage * pageSize, (portfolioPage + 1) * pageSize);

        portfolioItems.forEach((item) => {
            if (visibleItems.includes(item)) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
                item.classList.remove("portfolio-enter");
                item.style.removeProperty("--portfolio-delay");
            }
        });

        if (animate) {
            animatePortfolioEntry(visibleItems);
        }

        if (portfolioPager) {
            portfolioPager.hidden = pageCount <= 1;
            portfolioPageCount.textContent = `${portfolioPage + 1} / ${pageCount}`;
        }
    };

    const filterPortfolio = (category, animate = true) => {
        portfolioCategory = category;
        portfolioPage = 0;
        renderPortfolio(animate);

        descriptionTexts.forEach((text) => {
            const matches = text.getAttribute("data-for-category") === category;
            text.classList.toggle("active", matches);
        });
    };

    portfolioArrows.forEach((arrow) => {
        arrow.addEventListener("click", () => {
            const pageCount = getPortfolioPageCount();
            const direction = arrow.classList.contains("portfolio-next") ? 1 : -1;
            portfolioPage = (portfolioPage + direction + pageCount) % pageCount;
            renderPortfolio(true);
        });
    });

    mobilePortfolio.addEventListener("change", () => {
        if (!portfolioCategory) {
            return;
        }

        // Keep the first item that was on screen visible after the page size changes
        const firstIndex = portfolioPage * (mobilePortfolio.matches ? 6 : 1);
        portfolioPage = Math.floor(firstIndex / getPortfolioPageSize());
        renderPortfolio(false);
    });

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

    // To add a reel, add a line here. "image" is optional, e.g. image: "images/reels/reel1.jpg"
    const reels = [
        { link: "https://www.instagram.com/reel/DdwekKQAt3A/", image: "images/IMG_5676.PNG" },
        { link: "https://www.instagram.com/reel/DPEe3fLAL6I/", image: "images/IMG_5677.PNG" },
        { link: "https://www.instagram.com/reel/DQzG7vZgI6n/", image: "images/IMG_5678.PNG" },
        { link: "https://www.instagram.com/reel/Dewyf34xWKb/", image: "images/IMG_5679.PNG" },
        { link: "https://www.instagram.com/reel/DWQ_5x3ETLX/", image: "images/IMG_5680.PNG" },
        { link: "https://www.instagram.com/reel/DQHugOBj1ew/", image: "images/IMG_5681.PNG" },
        { link: "https://www.instagram.com/reel/DKfqmWHRcYh/", image: "images/IMG_5682.PNG" },
        { link: "https://www.instagram.com/reel/DGCPVw4R8tE/", image: "images/IMG_5683.PNG" },
    ];

    const reelSlots = document.querySelectorAll(".reel-slot");
    const reelArrows = document.querySelectorAll(".reels-arrow");
    const REEL_ANIM_MS = 260;
    const REEL_STAGGER_MS = 45;
    let reelStart = 0;
    let reelsAnimating = false;

    const renderReelSlot = (slot, index) => {
        slot.innerHTML = "";
        if (index >= reels.length) {
            return;
        }

        const reel = reels[(reelStart + index) % reels.length];
        const card = document.createElement("a");
        card.className = "reel-card";
        card.href = reel.link;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.setAttribute("aria-label", "Watch reel on Instagram");

        if (reel.image) {
            const img = document.createElement("img");
            img.src = reel.image;
            img.alt = "";
            card.appendChild(img);
        }

        const icon = document.createElement("i");
        icon.className = "fas fa-play";
        card.appendChild(icon);
        slot.appendChild(card);
    };

    const moveReels = (direction) => {
        if (reelsAnimating) {
            return;
        }

        reelStart = (reelStart + direction + reels.length) % reels.length;

        if (prefersReducedMotion) {
            reelSlots.forEach(renderReelSlot);
            return;
        }

        reelsAnimating = true;
        const outClass = direction > 0 ? "reel-out-left" : "reel-out-right";
        const inClass = direction > 0 ? "reel-in-right" : "reel-in-left";

        // Slots leave one after another in the direction of movement, then the new reels slide in
        reelSlots.forEach((slot, index) => {
            const order = direction > 0 ? index : reelSlots.length - 1 - index;

            setTimeout(() => {
                slot.classList.add(outClass);

                setTimeout(() => {
                    slot.classList.remove(outClass);
                    renderReelSlot(slot, index);
                    slot.classList.add(inClass);
                    setTimeout(() => slot.classList.remove(inClass), REEL_ANIM_MS);
                }, REEL_ANIM_MS);
            }, order * REEL_STAGGER_MS);
        });

        setTimeout(() => {
            reelsAnimating = false;
        }, (reelSlots.length - 1) * REEL_STAGGER_MS + REEL_ANIM_MS * 2);
    };

    if (reelSlots.length > 0) {
        reelSlots.forEach(renderReelSlot);

        reelArrows.forEach((arrow) => {
            arrow.hidden = reels.length <= reelSlots.length;
            arrow.addEventListener("click", () => {
                moveReels(arrow.classList.contains("reels-next") ? 1 : -1);
            });
        });
    }
})();
