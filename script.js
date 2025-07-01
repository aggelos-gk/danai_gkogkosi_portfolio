 // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Sticky Header
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Back to Top Button
    const backToTop = document.querySelector('.back-to-top');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('active');
        } else {
            backToTop.classList.remove('active');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
//maximize resume
	function openImage(imageUrl) {
            const modal = document.getElementById('imageModal');
            const modalImg = document.getElementById('modalImage');
            modalImg.src = imageUrl;
            modal.classList.add('show');
        }

        function closeModal() {
            const modal = document.getElementById('imageModal');
            modal.classList.remove('show');
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    // Skills Filter Functionality
    document.addEventListener('DOMContentLoaded', function() {
        const skillsFilterButtons = document.querySelectorAll('#skills .filter-btn');
        const skillItems = document.querySelectorAll('.skill-item');
        
        skillsFilterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button (only in skills section)
                skillsFilterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const filter = button.dataset.filter;
                
                // Filter skills
                skillItems.forEach(item => {
                    if (filter === 'all' || item.dataset.category === filter) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    });

    // Portfolio Filter
    const portfolioFilterButtons = document.querySelectorAll('#portfolio .filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const descriptionTexts = document.querySelectorAll('.description-text');

    // Function to filter portfolio items and update description
    const filterPortfolio = (category) => {
        // Update portfolio items
        portfolioItems.forEach(item => {
            if (item.getAttribute('data-category') === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
        
        // Update description text
        descriptionTexts.forEach(text => {
            if (text.getAttribute('data-for-category') === category) {
                text.classList.add('active');
            } else {
                text.classList.remove('active');
            }
        });
    };

    // Initialize - show only swimming items and description on load
    window.addEventListener('DOMContentLoaded', () => {
        filterPortfolio('swimming');
    });

    portfolioFilterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all portfolio buttons only
            portfolioFilterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            filterPortfolio(filterValue);
        });
    });

   
    // Form Submission
    document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    
    try {
        const response = await fetch(this.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
        alert('Thank you for contacting me! I\'ll get back to you soon.');
        this.reset();
        } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
        }
    } catch (error) {
        alert('Network error - check console');
        console.error(error);
    }
    });
    function forceDownload(url) {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = 'resume_danai_gkogkosi.pdf';
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(link.href);
            })
            .catch(error => {
                console.error('Download failed:', error);
                // Fallback: open in new tab
                window.open(url, '_blank');
            });
    }