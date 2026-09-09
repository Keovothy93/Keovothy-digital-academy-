/**
 * KEOVOTHY Digital Academy — interaction layer.
 * Loaded as <script type="module" src="js/main.js" defer>, i.e. after the
 * AOS / VanillaTilt libraries so their globals are available.
 */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Init AOS Animation
if (window.AOS) { AOS.init({ once: true, offset: 50, duration: prefersReducedMotion ? 0 : 1000, easing: 'ease-out-cubic', disable: prefersReducedMotion }); }

// Cinematic Split Preloader Reveal
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('split-active');
        setTimeout(() => { preloader.style.display = 'none'; }, 1000);
    }, prefersReducedMotion ? 50 : 800);
});

// Floating Smart Header (Hide on scroll down, show on up)
let lastScroll = 0;
const header = document.getElementById('main-header');
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll <= 0) {
        header.classList.remove('header-hidden');
        header.style.background = 'rgba(0,0,0,0.4)';
    } else if (currentScroll > lastScroll && currentScroll > 100) {
        header.classList.add('header-hidden'); // Scroll Down
    } else {
        header.classList.remove('header-hidden'); // Scroll Up
        header.style.background = 'rgba(0,0,0,0.85)';
    }
    lastScroll = currentScroll;
    
    // Scroll Progress Line
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (currentScroll / height) * 100;
    document.getElementById('scroll-progress').style.width = scrolled + '%';
});

// Keep desktop and mobile navigation aligned with the visible section
const observedSections = [...document.querySelectorAll('#home, #tutorial, #books, #courses')];
const updateActiveNavigation = (sectionId) => {
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        const active = link.getAttribute('href') === `#${sectionId}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
};
const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) updateActiveNavigation(visible.target.id);
}, { rootMargin: '-28% 0px -58% 0px', threshold: [0, .2, .55] });
observedSections.forEach(section => sectionObserver.observe(section));
document.querySelectorAll('.mobile-nav-link').forEach(link => link.addEventListener('click', () => {
    document.getElementById('mobile-nav-details')?.removeAttribute('open');
}));

// Tutorial chapter controls: seek the local guide video and keep the written step in sync
const tutorialVideo = document.getElementById('tutorial-video');
const tutorialSteps = [...document.querySelectorAll('.tutorial-step')];
const setActiveTutorialStep = (activeStep) => {
    tutorialSteps.forEach(step => {
        const active = step === activeStep;
        step.classList.toggle('is-active', active);
        step.setAttribute('aria-pressed', String(active));
    });
};
tutorialSteps.forEach(step => step.addEventListener('click', () => {
    if (!tutorialVideo) return;
    tutorialVideo.currentTime = Number(step.dataset.tutorialTime || 0);
    setActiveTutorialStep(step);
    const playRequest = tutorialVideo.play();
    if (playRequest && typeof playRequest.catch === 'function') playRequest.catch(() => {});
}));
tutorialVideo?.addEventListener('timeupdate', () => {
    const currentTime = tutorialVideo.currentTime;
    const activeStep = [...tutorialSteps].reverse().find(step => currentTime >= Number(step.dataset.tutorialTime || 0));
    if (activeStep) setActiveTutorialStep(activeStep);
});

// Smooth in-page navigation for the moving showcase and menu links
document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.hasAttribute('data-smart-redirect')) return;

    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    document.getElementById('mobile-nav-details')?.removeAttribute('open');
    const isCardTarget = target.classList.contains('academy-card');

    target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: isCardTarget ? 'center' : 'start'
    });

    if (window.location.hash !== hash) history.pushState(null, '', hash);

    if (isCardTarget) {
        window.setTimeout(() => {
            target.classList.add('is-scroll-target');
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
            window.setTimeout(() => target.classList.remove('is-scroll-target'), 2600);
        }, prefersReducedMotion ? 0 : 450);
    }
});

// Spotlight & Parallax Depth for Cards
document.querySelectorAll('.spotlight-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
});

// Hero Parallax Elements
document.addEventListener('mousemove', (e) => {
    const x = (window.innerWidth - e.pageX) / 100;
    const y = (window.innerHeight - e.pageY) / 100;
    document.querySelectorAll('.parallax-layer').forEach(layer => {
        const speed = layer.getAttribute('data-speed');
        layer.style.transform = `translateX(${x * speed}px) translateY(${y * speed}px)`;
    });
});

// Magnetic Buttons Physics
document.querySelectorAll('.magnetic').forEach(magnet => {
    magnet.addEventListener('mousemove', function(e) {
        const pos = this.getBoundingClientRect();
        const x = e.clientX - pos.left - pos.width / 2;
        const y = e.clientY - pos.top - pos.height / 2;
        this.style.transform = `translate(${x * 0.4}px, ${y * 0.5}px)`;
    });
    magnet.addEventListener('mouseout', function() { this.style.transform = 'translate(0px, 0px)'; });
});

// Fluid Custom Cursor & Ambient Aura
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const ambientAura = document.getElementById('ambient-aura');
let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
let ringX = mouseX, ringY = mouseY;
let auraX = mouseX, auraY = mouseY;

if (window.matchMedia("(pointer: fine) and (min-width: 768px)").matches) {
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        cursorDot.style.left = `${mouseX}px`; cursorDot.style.top = `${mouseY}px`;
    });
    
    // Render Loop for Smooth Tracking
    function renderCursor() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        cursorRing.style.transform = `translate(calc(-50% + ${ringX}px), calc(-50% + ${ringY}px))`;
        
        auraX += (mouseX - auraX) * 0.05; // Aura follows slower for dream effect
        auraY += (mouseY - auraY) * 0.05;
        ambientAura.style.transform = `translate(${auraX}px, ${auraY}px)`;
        
        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Hover effects for cursor
    document.querySelectorAll('a, button, .magnetic-wrap').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorRing.style.width = '60px'; cursorRing.style.height = '60px';
            cursorRing.style.backgroundColor = 'rgba(212,175,55,0.15)';
            cursorRing.style.borderColor = 'rgba(212,175,55,0.9)';
            cursorDot.style.transform = 'translate(-50%, -50%) scale(0)';
        });
        el.addEventListener('mouseleave', () => {
            cursorRing.style.width = '36px'; cursorRing.style.height = '36px';
            cursorRing.style.backgroundColor = 'transparent';
            cursorRing.style.borderColor = 'rgba(212,175,55,0.6)';
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });
}

// Advanced Interactive Particle Mesh
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];
let globalMouse = { x: null, y: null, radius: 180 };

canvas.width = window.innerWidth; canvas.height = window.innerHeight;
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initParticles(); });
window.addEventListener('mousemove', (e) => { globalMouse.x = e.x; globalMouse.y = e.y; });
window.addEventListener('mouseout', () => { globalMouse.x = undefined; globalMouse.y = undefined; });

class Particle {
    constructor(x, y, dirX, dirY, size, color) {
        this.x = x; this.y = y; this.dirX = dirX; this.dirY = dirY; this.size = size; this.color = color;
        this.baseX = x; this.baseY = y;
    }
    draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color; ctx.fill();
    }
    update() {
        if(globalMouse.x != null) {
            let dx = globalMouse.x - this.x;
            let dy = globalMouse.y - this.y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            if (distance > 0 && distance < globalMouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (globalMouse.radius - distance) / globalMouse.radius;
                this.x -= forceDirectionX * force * 3;
                this.y -= forceDirectionY * force * 3;
            } else {
                if (this.x !== this.baseX) { this.x -= (this.x - this.baseX)/20; }
                if (this.y !== this.baseY) { this.y -= (this.y - this.baseY)/20; }
            }
        }
        if (this.x > canvas.width || this.x < 0) this.dirX = -this.dirX;
        if (this.y > canvas.height || this.y < 0) this.dirY = -this.dirY;
        this.x += this.dirX; this.y += this.dirY; this.draw();
    }
}

function initParticles() {
    particlesArray = [];
    if (prefersReducedMotion) return;
    let num = (canvas.height * canvas.width) / 14000;
    const particleLimit = window.innerWidth < 768 ? 55 : 110;
    if (num > particleLimit) num = particleLimit;
    for (let i = 0; i < num; i++) {
        let size = (Math.random() * 2) + 0.2;
        let x = Math.random() * innerWidth; let y = Math.random() * innerHeight;
        let dirX = (Math.random() * 0.8) - 0.4; let dirY = (Math.random() * 0.8) - 0.4;
        particlesArray.push(new Particle(x, y, dirX, dirY, size, 'rgba(212,175,55,0.8)'));
    }
}

function connectParticles() {
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let dist = ((particlesArray[a].x - particlesArray[b].x) ** 2) + ((particlesArray[a].y - particlesArray[b].y) ** 2);
            if (dist < 15000) {
                ctx.strokeStyle = `rgba(212, 175, 55, ${(1 - dist/15000) * 0.2})`;
                ctx.lineWidth = 1; ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y); ctx.stroke();
            }
        }
        if(globalMouse.x != null) {
            let mouseDist = ((particlesArray[a].x - globalMouse.x) ** 2) + ((particlesArray[a].y - globalMouse.y) ** 2);
            if(mouseDist < 30000) {
                ctx.strokeStyle = `rgba(212, 175, 55, ${(1 - mouseDist/30000) * 0.8})`;
                ctx.lineWidth = 1.5; ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(globalMouse.x, globalMouse.y); ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    requestAnimationFrame(animateParticles);
    if (document.hidden || prefersReducedMotion) return;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = 0; i < particlesArray.length; i++) particlesArray[i].update();
    connectParticles();
}
initParticles(); animateParticles();

// Unified Loading & Redirect Logic
const redirectModal = document.getElementById('redirect-modal');
const redirectDialog = redirectModal.querySelector('.redirect-dialog');
const redirectTitle = document.getElementById('redirect-title');
const redirectCopy = document.getElementById('redirect-copy');
const redirectDestination = document.getElementById('redirect-destination');
const redirectProgressFill = document.getElementById('redirect-progress-fill');
const redirectStatus = document.getElementById('redirect-status');
const redirectIcon = document.getElementById('redirect-icon');
const redirectCancel = document.getElementById('redirect-cancel');
let redirectTimer = null;
let redirectFrame = null;
let redirectStartedAt = 0;
const redirectDelay = 1500;
const returnHomeAfterLinkKey = 'return-home-after-link';

function isSafeRedirectUrl(url) {
    try {
        const value = String(url || '').trim();
        if (!value || /^(?:javascript|data|vbscript):/i.test(value)) return false;
        const parsed = new URL(value, window.location.href);
        const isWebLink = parsed.protocol === 'http:' || parsed.protocol === 'https:';
        const isRelativeFileLink = parsed.protocol === 'file:' && !/^[a-z][a-z\d+.-]*:/i.test(value) && !value.startsWith('//');
        return isWebLink || isRelativeFileLink;
    } catch (error) {
        return false;
    }
}

function openRedirectModal(label, url) {
    const hasValidUrl = Boolean(url) && isSafeRedirectUrl(url);
    clearTimeout(redirectTimer);
    cancelAnimationFrame(redirectFrame);
    redirectModal.classList.toggle('is-unavailable', !hasValidUrl);
    redirectModal.classList.add('is-open');
    redirectModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('redirecting');
    redirectDestination.textContent = label || 'ទំព័របន្ទាប់';
    redirectProgressFill.style.width = '0%';

    if (!hasValidUrl) {
        redirectTitle.textContent = 'តំណភ្ជាប់មិនទាន់បានកំណត់';
        redirectCopy.textContent = 'សូមបន្ថែម URL សម្រាប់ប៊ូតុងនេះសិន ដើម្បីអាចបន្តទៅកាន់ទំព័របន្ទាប់បាន។';
        redirectStatus.textContent = 'មិនមានការបញ្ជូនទំព័រទេ';
        redirectIcon.className = 'fa-solid fa-link-slash';
        redirectCancel.textContent = 'បិទ';
        setTimeout(() => redirectDialog.focus(), 30);
        return;
    }

    redirectTitle.textContent = 'កំពុងរៀបចំបើកតំណភ្ជាប់';
    redirectCopy.textContent = 'សូមរង់ចាំបន្តិច ប្រព័ន្ធកំពុងបញ្ជូនលោកអ្នកទៅកាន់ទំព័របន្ទាប់។';
    redirectStatus.textContent = 'កំពុងតភ្ជាប់ដោយសុវត្ថិភាព...';
    redirectIcon.className = 'fa-solid fa-arrow-up-right-from-square';
    redirectCancel.textContent = 'បោះបង់';
    redirectStartedAt = performance.now();

    function updateRedirectProgress(now) {
        const progress = Math.min(((now - redirectStartedAt) / redirectDelay) * 100, 100);
        redirectProgressFill.style.width = progress + '%';
        if (progress < 100) redirectFrame = requestAnimationFrame(updateRedirectProgress);
    }

    redirectFrame = requestAnimationFrame(updateRedirectProgress);
    redirectTimer = setTimeout(() => {
        redirectStatus.textContent = 'រួចរាល់ — កំពុងបើកទំព័រ...';
        redirectProgressFill.style.width = '100%';
        try {
            sessionStorage.setItem(returnHomeAfterLinkKey, 'true');
        } catch (error) {
            // Navigation still works when browser storage is unavailable.
        }
        window.location.assign(url);
    }, redirectDelay);
    setTimeout(() => redirectDialog.focus(), 30);
}

function closeRedirectModal() {
    clearTimeout(redirectTimer);
    cancelAnimationFrame(redirectFrame);
    redirectModal.classList.remove('is-open', 'is-unavailable');
    redirectModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('redirecting');
}

document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-smart-redirect]');
    if (!trigger) return;
    event.preventDefault();
    const url = trigger.dataset.redirectUrl || trigger.getAttribute('href') || '';
    const label = trigger.dataset.redirectLabel || trigger.textContent.trim();
    const mobileMenu = trigger.closest('details');
    if (mobileMenu) mobileMenu.removeAttribute('open');
    openRedirectModal(label, url);
});

redirectCancel.addEventListener('click', closeRedirectModal);
window.addEventListener('pageshow', () => {
    closeRedirectModal();
    let shouldReturnHome = false;
    try {
        shouldReturnHome = sessionStorage.getItem(returnHomeAfterLinkKey) === 'true';
        if (shouldReturnHome) sessionStorage.removeItem(returnHomeAfterLinkKey);
    } catch (error) {
        return;
    }
    if (!shouldReturnHome) return;

    requestAnimationFrame(() => {
        const homeSection = document.getElementById('home');
        history.replaceState(null, '', '#home');
        if (homeSection) {
            homeSection.scrollIntoView({ behavior: 'auto', block: 'start' });
        } else {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
    });
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && redirectModal.classList.contains('is-open')) closeRedirectModal();
});

/* --- Scroll cue (replaces the previous inline onclick attribute) --- */
document.querySelector('[data-scroll-next]')?.addEventListener('click', () => {
  window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
});
