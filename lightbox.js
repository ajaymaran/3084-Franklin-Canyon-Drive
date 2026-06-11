document.addEventListener('DOMContentLoaded', () => {
    initUnifiedLightbox();
});

function initUnifiedLightbox() {
    let slides = document.querySelectorAll('.gallery-slide, .gallery-item');
    if (slides.length === 0) return;

    let lightbox = document.querySelector('.lightbox');
    
    // First, let's inject the universal HTML.
    if (!lightbox) {
        const lightboxHTML = `
        <div class="lightbox" id="lightbox">
            <div class="lightbox-content">
                <button class="lightbox-x-close" id="lightbox-x-close" aria-label="Close Lightbox">&times;</button>
                
                <div class="lightbox-zoom-wrapper" style="overflow: hidden; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; touch-action: none; position: relative;">
                    
                    <div class="lightbox-image-wrapper" style="position: relative; display: inline-block; max-width: calc(100% - 160px); max-height: 100%;">
                        <img src="" alt="Full View" class="lightbox-img" id="lightbox-img" style="transform-origin: center; transition: transform 0.1s ease-out; touch-action: none; max-width: 100%; max-height: 100%; width: auto; height: auto; display: block; object-fit: contain;" draggable="false">
                        
                        <button class="lightbox-close" id="lightbox-close" aria-label="Exit Fullscreen"><i class="fas fa-compress"></i></button>
                        <div class="lightbox-caption" id="lightbox-caption"></div>
                        <button class="lightbox-prev" id="lightbox-prev"><i class="fas fa-chevron-left"></i></button>
                        <button class="lightbox-next" id="lightbox-next"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    
                    <div class="lightbox-scroll-hint">
                        <div class="mouse-icon"><div class="wheel"></div></div>
                        <span>Scroll to Zoom</span>
                    </div>

                </div>
                
                <div class="lightbox-indicators"></div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
        lightbox = document.querySelector('.lightbox');
    }

    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('#lightbox-prev');
    const nextBtn = lightbox.querySelector('#lightbox-next');
    const lightboxXClose = lightbox.querySelector('#lightbox-x-close');
    
    let currentLightboxIndex = 0;
    const galleryData = Array.from(slides).map(item => {
        let src = '';
        let caption = '';
        
        if (item.classList.contains('gallery-item')) {
            // index.html format
            src = item.getAttribute('data-src') || item.querySelector('img')?.src || '';
            caption = item.querySelector('.gallery-item-title')?.textContent || 'Villa Serein';
        } else {
            // more.html format
            const img = item.querySelector('img');
            src = img ? img.src : '';
            const capEl = item.querySelector('.gallery-slide-caption');
            if (capEl) {
                caption = capEl.textContent;
            } else if (src) {
                const fileName = src.split('/').pop();
                const rawName = fileName.replace(/\.[^/.]+$/, "");
                caption = rawName.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            }
        }
        return { src, caption };
    }).filter(data => data.src !== ''); 

    // Generate Indicators
    const indicatorsContainer = lightbox.querySelector('.lightbox-indicators');
    indicatorsContainer.innerHTML = '';
    const indicators = [];
    galleryData.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'lightbox-indicator';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            updateLightbox(index);
        });
        indicatorsContainer.appendChild(dot);
        indicators.push(dot);
    });

    // Zoom State
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    
    let isDragging = false;
    let startX, startY;
    
    // For pinch zoom
    let pointers = [];
    let initialDistance = 0;

    // For swipe gestures
    let touchStartX = 0;
    let touchStartY = 0;

    function applyTransform() {
        lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        
        // Fade out UI when zoomed
        const uiElements = lightbox.querySelectorAll('.lightbox-close, .lightbox-caption, .lightbox-prev, .lightbox-next, .lightbox-indicators');
        uiElements.forEach(el => {
            el.style.opacity = scale > 1 ? '0' : '1';
            el.style.pointerEvents = scale > 1 ? 'none' : 'auto';
        });
    }

    function resetZoom() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        applyTransform();
    }

    function updateLightbox(index) {
        if (index < 0) index = galleryData.length - 1;
        if (index >= galleryData.length) index = 0;
        currentLightboxIndex = index;
        
        resetZoom(); // Reset zoom when switching images
        
        const data = galleryData[currentLightboxIndex];
        if (data && data.src) {
            lightboxImg.src = data.src;
            lightboxCaption.textContent = data.caption;
            
            indicators.forEach(dot => dot.classList.remove('active'));
            if (indicators[currentLightboxIndex]) {
                indicators[currentLightboxIndex].classList.add('active');
            }
            
            if (!lightbox.classList.contains('active')) {
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                if (window.matchMedia('(pointer: fine)').matches) {
                    const hint = lightbox.querySelector('.lightbox-scroll-hint');
                    if (hint) {
                        hint.classList.remove('show');
                        void hint.offsetWidth; // Trigger reflow to restart CSS animation
                        hint.classList.add('show');
                    }
                }
            }
        }
    }

    slides.forEach((slide, index) => {
        // Double click to open
        slide.addEventListener('dblclick', () => {
            updateLightbox(index);
        });
        
        // Inject Expand Icon
        if (!slide.querySelector('.gallery-expand-btn')) {
            const expandBtn = document.createElement('button');
            expandBtn.className = 'gallery-expand-btn';
            expandBtn.innerHTML = '<i class="fas fa-expand"></i>';
            expandBtn.setAttribute('aria-label', 'Open Fullscreen');
            
            const wrapper = slide.querySelector('.slide-image-wrapper') || slide;
            // Ensure wrapper is position relative if it's the slide itself
            if (wrapper === slide && getComputedStyle(slide).position === 'static') {
                slide.style.position = 'relative';
            }
            wrapper.appendChild(expandBtn);
            
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                updateLightbox(index);
            });
        }
    });

    if (lightboxClose) lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    if (lightboxXClose) lightboxXClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    if (prevBtn) prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateLightbox(currentLightboxIndex - 1);
    });
    
    if (nextBtn) nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateLightbox(currentLightboxIndex + 1);
    });

    // Wheel Zoom
    const zoomWrapper = lightbox.querySelector('.lightbox-zoom-wrapper');
    if (zoomWrapper) {
        zoomWrapper.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const rect = zoomWrapper.getBoundingClientRect();
            const mouseX = e.clientX - (rect.left + rect.width / 2);
            const mouseY = e.clientY - (rect.top + rect.height / 2);

            const oldScale = scale;
            const delta = e.deltaY > 0 ? -0.2 : 0.2;
            scale = Math.max(1, scale + delta);
            
            if (scale === 1) { 
                translateX = 0; 
                translateY = 0; 
            } else {
                translateX = mouseX - (mouseX - translateX) * (scale / oldScale);
                translateY = mouseY - (mouseY - translateY) * (scale / oldScale);
            }
            applyTransform();
        }, { passive: false });
        
        // Double click to close
        zoomWrapper.addEventListener('dblclick', (e) => {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        });

        // Pointer Events for Pan & Pinch
        zoomWrapper.addEventListener('pointerdown', (e) => {
            pointers.push(e);
            
            if (pointers.length === 1) {
                touchStartX = e.clientX;
                touchStartY = e.clientY;
                if (scale > 1) {
                    isDragging = true;
                    startX = e.clientX - translateX;
                    startY = e.clientY - translateY;
                    lightboxImg.style.transition = 'none'; // remove transition for smooth dragging
                }
            } else if (pointers.length === 2) {
                isDragging = false;
                initialDistance = Math.hypot(pointers[0].clientX - pointers[1].clientX, pointers[0].clientY - pointers[1].clientY);
            }
        });

        zoomWrapper.addEventListener('pointermove', (e) => {
            const index = pointers.findIndex(p => p.pointerId === e.pointerId);
            if (index !== -1) pointers[index] = e;

            if (pointers.length === 1 && isDragging && scale > 1) {
                translateX = e.clientX - startX;
                translateY = e.clientY - startY;
                applyTransform();
            } else if (pointers.length === 2) {
                const currentDistance = Math.hypot(pointers[0].clientX - pointers[1].clientX, pointers[0].clientY - pointers[1].clientY);
                const deltaDistance = currentDistance - initialDistance;
                
                scale = Math.max(1, scale + (deltaDistance * 0.01));
                if (scale === 1) { translateX = 0; translateY = 0; }
                
                initialDistance = currentDistance;
                applyTransform();
            }
        });

        function endPointer(e) {
            // Check for horizontal swipe gesture when not zoomed
            if (scale === 1 && pointers.length === 1) {
                const touchEndX = e.clientX;
                const touchEndY = e.clientY;
                const diffX = touchEndX - touchStartX;
                const diffY = touchEndY - touchStartY;

                // Threshold of 50px swipe distance
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    if (diffX > 0) {
                        updateLightbox(currentLightboxIndex - 1); // Swipe right -> Previous
                    } else {
                        updateLightbox(currentLightboxIndex + 1); // Swipe left -> Next
                    }
                }
            }
            
            pointers = pointers.filter(p => p.pointerId !== e.pointerId);
            if (pointers.length === 0) {
                isDragging = false;
                lightboxImg.style.transition = 'transform 0.1s ease-out';
            }
        }

        zoomWrapper.addEventListener('pointerup', endPointer);
        zoomWrapper.addEventListener('pointercancel', endPointer);
        zoomWrapper.addEventListener('pointerleave', endPointer);
        
        // Double tap to zoom
        let lastTap = 0;
        zoomWrapper.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                if (scale > 1) resetZoom();
                else { scale = 2.5; applyTransform(); }
            }
            lastTap = currentTime;
        });
    }

    // Escape and Arrow key handling
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        } else if (e.key === 'ArrowLeft') {
            updateLightbox(currentLightboxIndex - 1);
        } else if (e.key === 'ArrowRight') {
            updateLightbox(currentLightboxIndex + 1);
        }
    });
}
