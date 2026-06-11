/**
 * Villa Serein - More Details Page Script
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initDropdowns();
    initSectionCarousels();
    // initLightbox() handled externally
    initThemeToggle();
});

/**
 * 1. Mobile Menu and Scroll Anchors
 */
function initNavigation() {
    const header = document.querySelector('header');
    const sections = document.querySelectorAll('.detail-section, .sub-room-block');
    const navLinks = document.querySelectorAll('.nav-links > li > a, .dropdown-menu a');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksList = document.querySelector('.nav-links');

    // Highlight active nav link based on current page URL
    let currentPage = window.location.pathname.split('/').pop();
    if (currentPage === '') currentPage = 'index.html';
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
            // If inside a dropdown, highlight the dropdown trigger too
            const dropdown = link.closest('.dropdown');
            if (dropdown) {
                const trigger = dropdown.querySelector('.dropdown-trigger');
                if (trigger) trigger.classList.add('active');
            }
        }
    });

    // Scroll listener for header shadow
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '0.5rem 0';
            header.style.boxShadow = 'var(--shadow-md)';
        } else {
            header.style.padding = '0';
            header.style.boxShadow = 'none';
        }
    });

    // Mobile Hamburger Menu toggle
    if (mobileMenuToggle && navLinksList) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinksList.classList.toggle('active');
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                if (navLinksList.classList.contains('active')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        });
    }


}

/**
 * 2. Dropdown Menu Toggle (especially for mobile taps)
 */
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        
        trigger.addEventListener('click', (e) => {
            // Only trigger click behavior on small screens (mobile tap)
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(other => {
                    if (other !== dropdown) other.classList.remove('active');
                });

                dropdown.classList.toggle('active');
            }
        });
    });

    // Close dropdowns if clicking outside
    document.addEventListener('click', () => {
        dropdowns.forEach(d => d.classList.remove('active'));
    });
}

/**
 * 3. Room Section Multi-Photo Carousel Controller
 */
function initSectionCarousels() {
    const galleries = document.querySelectorAll('.section-gallery');

    galleries.forEach(gallery => {
        const slides = gallery.querySelectorAll('.gallery-slide');
        const prevBtn = gallery.querySelector('.gallery-control-prev');
        const nextBtn = gallery.querySelector('.gallery-control-next');
        const indicatorsContainer = gallery.querySelector('.gallery-indicators');
        
        let currentIndex = 0;

        // Exit if no slides
        if (slides.length <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            return;
        }

        // Setup indicators
        slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.classList.add('gallery-indicator');
            if (index === 0) indicator.classList.add('active');
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            
            indicator.addEventListener('click', () => {
                goToSlide(index);
            });
            
            if (indicatorsContainer) indicatorsContainer.appendChild(indicator);
        });

        const indicators = gallery.querySelectorAll('.gallery-indicator');

        function goToSlide(index) {
            slides[currentIndex].classList.remove('active');
            if (indicators[currentIndex]) indicators[currentIndex].classList.remove('active');

            currentIndex = (index + slides.length) % slides.length;

            slides[currentIndex].classList.add('active');
            if (indicators[currentIndex]) indicators[currentIndex].classList.add('active');
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Avoid triggering lightbox zoom
                goToSlide(currentIndex - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                goToSlide(currentIndex + 1);
            });
        }
    });
}

// initLightbox moved to universal lightbox.js

/**
 * 5. Theme Toggling Synced to Local state
 */
function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Load theme preference on init
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'light') {
        body.classList.add('light-theme');
        if (themeBtn) themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            let theme = 'dark';
            if (body.classList.contains('light-theme')) {
                themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
                theme = 'light';
            } else {
                themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
            }
            localStorage.setItem('theme', theme);
        });
    }
}



