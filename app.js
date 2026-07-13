/* ==========================================================================
   INTERACTIVE LOGIC & EFFECTS - UNIVERSITAS PATTIMURA PORTAL
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --- Theme Toggle (Dark & Light Mode) --- */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check saved theme or use system default
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        body.classList.replace('light-theme', 'dark-theme');
        updateThemeIcon(true);
    } else {
        body.classList.replace('dark-theme', 'light-theme');
        updateThemeIcon(false);
    }

    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('light-theme')) {
            body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark');
            updateThemeIcon(true);
        } else {
            body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light');
            updateThemeIcon(false);
        }
    });

    function updateThemeIcon(isDark) {
        const icon = themeToggleBtn.querySelector('i');
        if (isDark) {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    }


    /* --- Mobile Menu Drawer --- */
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeDrawerBtn = document.querySelector('.close-drawer-btn');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    mobileMenuBtn.addEventListener('click', () => {
        mobileDrawer.classList.add('open');
    });

    closeDrawerBtn.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
    });

    drawerLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileDrawer.classList.remove('open');
        });
    });


    /* --- Sticky Header & Scroll Indicator & Back to Top --- */
    const header = document.querySelector('.main-header');
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Sticky Header State
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Scroll Progress Bar
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = scrollPercent + '%';

        // Back to Top Button
        if (scrollTop > 400) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }

        // Active Navigation Highlight on Scroll
        highlightNavLinks();
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });


    /* --- Active Navigation Highlight --- */
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a:not(.nav-portal-btn)');

    function highlightNavLinks() {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 120; // offset header height

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }


    /* --- Intersection Observer for Animations --- */
    const animateElements = document.querySelectorAll('.animate-reveal, .timeline-item');
    
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // If it is a timeline item, trigger visible class
                if (entry.target.classList.contains('timeline-item')) {
                    entry.target.classList.add('visible');
                }
                
                // If the element has stats-number inside, trigger counting
                const statNumber = entry.target.querySelector('.stat-number');
                if (statNumber && !statNumber.classList.contains('counted')) {
                    animateCountUp(statNumber);
                }
                
                observer.unobserve(entry.target); // stop observing once animated
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach(el => {
        revealObserver.observe(el);
    });


    /* --- Stat Counter Count Up Animation --- */
    function animateCountUp(element) {
        const targetValue = parseInt(element.getAttribute('data-target'), 10);
        const duration = 2000; // 2 seconds animation
        const frameRate = 1000 / 60; // 60fps
        const totalFrames = Math.round(duration / frameRate);
        let currentFrame = 0;
        
        element.classList.add('counted');

        const counter = setInterval(() => {
            currentFrame++;
            const progress = currentFrame / totalFrames;
            // ease-out cubic curve
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(easedProgress * targetValue);
            
            if (targetValue >= 10000) {
                // format for large numbers (e.g. 25000 -> 25.000+)
                element.innerText = currentValue.toLocaleString('id-ID') + '+';
            } else {
                element.innerText = currentValue;
            }

            if (currentFrame >= totalFrames) {
                element.innerText = targetValue >= 10000 ? targetValue.toLocaleString('id-ID') + '+' : targetValue;
                clearInterval(counter);
            }
        }, frameRate);
    }


    /* --- Faculty Search & Filtering --- */
    const searchInput = document.getElementById('faculty-search');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const facultyCards = document.querySelectorAll('.facultas-card');

    // Filter Buttons action
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterFaculties();
        });
    });

    // Search bar input action
    searchInput.addEventListener('input', () => {
        filterFaculties();
    });

    function filterFaculties() {
        const query = searchInput.value.toLowerCase().trim();
        const activeCategory = document.querySelector('.filter-btn.active').getAttribute('data-filter');

        facultyCards.forEach(card => {
            const name = card.querySelector('h3').innerText.toLowerCase();
            const desc = card.querySelector('.fac-desc').innerText.toLowerCase();
            const keywords = card.getAttribute('data-keywords').toLowerCase();
            const category = card.getAttribute('data-category');
            
            const matchesQuery = name.includes(query) || desc.includes(query) || keywords.includes(query);
            const matchesCategory = activeCategory === 'all' || category === activeCategory;

            if (matchesQuery && matchesCategory) {
                card.style.display = 'flex';
                card.classList.add('active');
            } else {
                card.style.display = 'none';
            }
        });
    }


    /* --- Photo Gallery Slider --- */
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        let index = currentSlide + 1;
        if (index >= slides.length) index = 0;
        showSlide(index);
    }

    function prevSlide() {
        let index = currentSlide - 1;
        if (index < 0) index = slides.length - 1;
        showSlide(index);
    }

    // Set Manual dots clicking (global function for onclick attribute)
    window.setCurrentSlide = (index) => {
        showSlide(index);
        resetSlideTimer();
    };

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetSlideTimer();
        });

        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetSlideTimer();
        });
    }

    // Autoplay Timer
    function startSlideTimer() {
        slideInterval = setInterval(nextSlide, 5000); // changes every 5 seconds
    }

    function resetSlideTimer() {
        clearInterval(slideInterval);
        startSlideTimer();
    }

    if (slides.length > 0) {
        startSlideTimer();
    }
});


/* --- Expand Faculty Program Studi Details --- */
function toggleFacDetails(btn) {
    const card = btn.closest('.facultas-card');
    const details = card.querySelector('.fac-details');
    
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        details.style.display = 'block';
        btn.innerHTML = 'Tutup Detail <i class="fa-solid fa-chevron-up"></i>';
    } else {
        details.style.display = 'none';
        btn.innerHTML = 'Program Studi <i class="fa-solid fa-chevron-down"></i>';
    }
}
