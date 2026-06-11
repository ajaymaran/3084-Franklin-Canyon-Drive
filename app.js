/**
 * Villa Serein - Interactive Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initializations
    initNavigation();
    initRoomExplorer();
    initFloorPlan();
    // initGalleryLightbox() handled externally
    initMapSimulator();
    initThemeToggle();
});

/**
 * 1. Navigation Actions & Active Highlighting on Scroll
 */
function initNavigation() {
    const header = document.querySelector('header');
    const sections = document.querySelectorAll('section, .hero');
    const navLinks = document.querySelectorAll('.nav-links a');
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

    // Scroll listener for sticky header styling
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

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // If it's a dropdown trigger on mobile, toggle it instead of closing menu
                if (link.classList.contains('dropdown-trigger') && window.innerWidth <= 768) {
                    e.preventDefault();
                    const parent = link.closest('.dropdown');
                    if (parent) parent.classList.toggle('active');
                    return;
                }
                
                navLinksList.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            });
        });
    }
}

/**
 * 2. Room Explorer Tab Switcher
 */
let globalActiveRoom = 'master_bedroom';

function initRoomExplorer() {
    const tabs = document.querySelectorAll('.explorer-tab-btn');
    const images = document.querySelectorAll('.explorer-image-wrapper');
    const contents = document.querySelectorAll('.room-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetRoom = tab.getAttribute('data-room');
            if (targetRoom) {
                switchRoom(targetRoom);
            }
        });
    });
}

function switchRoom(roomId) {
    globalActiveRoom = roomId;

    // Update explorer tabs
    const tabs = document.querySelectorAll('.explorer-tab-btn');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-room') === roomId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update explorer images
    const images = document.querySelectorAll('.explorer-image-wrapper');
    images.forEach(img => {
        if (img.getAttribute('data-room') === roomId) {
            img.classList.add('active');
        } else {
            img.classList.remove('active');
        }
    });

    // Update explorer content
    const contents = document.querySelectorAll('.room-content');
    contents.forEach(content => {
        if (content.getAttribute('data-room') === roomId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });

    // Sync with Floor Plan shapes
    const svgRooms = document.querySelectorAll('.floorplan-room');
    svgRooms.forEach(room => {
        if (room.getAttribute('data-room') === roomId) {
            room.classList.add('active');
        } else {
            room.classList.remove('active');
        }
    });

    // Sync with Floor Plan text list items
    const listItems = document.querySelectorAll('.floorplan-room-item');
    listItems.forEach(item => {
        if (item.getAttribute('data-room') === roomId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * 3. Floor Plan Sync logic
 */
function initFloorPlan() {
    const svgRooms = document.querySelectorAll('.floorplan-room');
    const listItems = document.querySelectorAll('.floorplan-room-item');
    const explorerSection = document.getElementById('details');

    // Click SVG room
    svgRooms.forEach(room => {
        room.addEventListener('click', () => {
            const targetRoom = room.getAttribute('data-room');
            if (targetRoom) {
                switchRoom(targetRoom);
                // Smooth scroll to details explorer
                if (explorerSection) {
                    explorerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    });

    // Click list item
    listItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetRoom = item.getAttribute('data-room');
            if (targetRoom) {
                switchRoom(targetRoom);
                // Smooth scroll to details explorer
                if (explorerSection) {
                    explorerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    });
}

/**
 * 4. Photo Gallery Lightbox Carousel
 */
// initGalleryLightbox moved to universal lightbox.js

/**
 * 5. Local Area Simulated Interactive Map
 */
function initMapSimulator() {
    const markers = document.querySelectorAll('.map-marker');
    const listItems = document.querySelectorAll('.map-info-item');

    function activateMapPoint(pointId) {
        markers.forEach(marker => {
            if (marker.getAttribute('data-point') === pointId) {
                marker.classList.add('active');
            } else {
                marker.classList.remove('active');
            }
        });

        listItems.forEach(item => {
            if (item.getAttribute('data-point') === pointId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    markers.forEach(marker => {
        marker.addEventListener('click', () => {
            const pointId = marker.getAttribute('data-point');
            if (pointId) activateMapPoint(pointId);
        });
    });

    listItems.forEach(item => {
        item.addEventListener('click', () => {
            const pointId = item.getAttribute('data-point');
            if (pointId) activateMapPoint(pointId);
        });
    });
}



/**
 * 7. Theme Switching: Dark (Default) & Light Custom Scheme
 */
function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Load theme preference on init
    const savedTheme = localStorage.getItem('theme');
    const icon = themeBtn ? themeBtn.querySelector('i') : null;
    
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        if (icon) icon.className = 'fas fa-moon';
    } else {
        body.classList.remove('light-theme');
        if (icon) icon.className = 'fas fa-sun';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
            localStorage.setItem('theme', currentTheme);
            
            if (icon) {
                if (currentTheme === 'light') {
                    icon.className = 'fas fa-moon';
                } else {
                    icon.className = 'fas fa-sun';
                }
            }
        });
    }
}
