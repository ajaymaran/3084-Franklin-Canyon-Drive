/**
 * Villa Serein - More Details Page Script
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initDropdowns();
    initSectionCarousels();
    initImageMagnifier();
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

    // Load theme preference on init - Always start in dark theme
    body.classList.remove('light-theme');
    if (themeBtn) themeBtn.innerHTML = '<i class="fas fa-sun"></i>';

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

/**
 * 6. Interactive Amazon-Style Hover Image Magnifier (Side-by-Side Zoom)
 */
function initImageMagnifier() {
    // Only initialize on desktop devices with hover support
    if (!window.matchMedia('(hover: hover)').matches) return;

    const wrappers = document.querySelectorAll('.slide-image-wrapper');
    const grid = document.querySelector('.detail-grid');
    const specsPanel = document.querySelector('.detail-specs-panel');

    if (!grid || !specsPanel) return;

    wrappers.forEach(wrapper => {
        const img = wrapper.querySelector('img');
        if (!img) return;

        let lens = null;
        let result = null;

        wrapper.addEventListener('mouseenter', () => {
            if (!lens) {
                // Create selection tracker lens
                lens = document.createElement('div');
                lens.className = 'img-zoom-lens';
                wrapper.appendChild(lens);

                // Create zoom result container
                result = document.createElement('div');
                result.className = 'img-zoom-result';
                grid.appendChild(result);

                // Bind image source
                result.style.backgroundImage = `url('${img.src}')`;

                // Calculate layout boundaries of specsPanel to overlay it exactly
                const gridRect = grid.getBoundingClientRect();
                const specsRect = specsPanel.getBoundingClientRect();

                result.style.left = `${specsRect.left - gridRect.left}px`;
                result.style.top = `${specsRect.top - gridRect.top}px`;
                result.style.width = `${specsRect.width}px`;
                result.style.height = `${specsRect.height}px`;

                // Animate opacity fade-in
                setTimeout(() => {
                    if (lens) lens.style.opacity = '1';
                    if (result) result.style.opacity = '1';
                }, 10);
            }
        });

        wrapper.addEventListener('mousemove', (e) => {
            if (!lens || !result) return;

            const rect = img.getBoundingClientRect();
            
            // Cursor position relative to original image bounds
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            // Handle boundaries
            if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
                removeZoom();
                return;
            }

            // Zoom Factor (3x Zoom)
            const zoom = 3;

            // Calculate tracker lens dimensions proportionally
            const lensWidth = result.offsetWidth / zoom;
            const lensHeight = result.offsetHeight / zoom;

            lens.style.width = `${lensWidth}px`;
            lens.style.height = `${lensHeight}px`;

            // Position lens centered over cursor
            let lensLeft = x - (lensWidth / 2);
            let lensTop = y - (lensHeight / 2);

            // Constraint boundaries
            if (lensLeft < 0) lensLeft = 0;
            if (lensLeft > rect.width - lensWidth) lensLeft = rect.width - lensWidth;
            if (lensTop < 0) lensTop = 0;
            if (lensTop > rect.height - lensHeight) lensTop = rect.height - lensHeight;

            // Offset positions relative to wrapper
            const imgLeft = img.offsetLeft;
            const imgTop = img.offsetTop;

            lens.style.left = `${imgLeft + lensLeft}px`;
            lens.style.top = `${imgTop + lensTop}px`;

            // Render zoomed view
            result.style.backgroundSize = `${rect.width * zoom}px ${rect.height * zoom}px`;
            result.style.backgroundPosition = `-${lensLeft * zoom}px -${lensTop * zoom}px`;
        });

        wrapper.addEventListener('mouseleave', () => {
            removeZoom();
        });

        // Watch for active slides modifying the image source dynamically
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                    if (result) {
                        result.style.backgroundImage = `url('${img.src}')`;
                    }
                }
            });
        });
        observer.observe(img, { attributes: true });

        function removeZoom() {
            if (lens) {
                const tempLens = lens;
                lens = null;
                tempLens.style.opacity = '0';
                setTimeout(() => {
                    if (tempLens.parentNode === wrapper) wrapper.removeChild(tempLens);
                }, 200);
            }
            if (result) {
                const tempResult = result;
                result = null;
                tempResult.style.opacity = '0';
                setTimeout(() => {
                    if (tempResult.parentNode === grid) grid.removeChild(tempResult);
                }, 200);
            }
        }
    });
}



