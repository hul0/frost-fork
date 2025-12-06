gsap.registerPlugin(ScrollTrigger);

/* ---------------- DATA ---------------- */
let menuItems = [];
let cart = JSON.parse(localStorage.getItem('winterFeastCart')) || [];

// Load menu from JSON file
async function loadMenu() {
    try {
        const response = await fetch('menu.json');
        const data = await response.json();
        menuItems = data.dishes;
        console.log(`Loaded ${menuItems.length} dishes from menu.json`);
        // Initialize menu after data is loaded
        renderMenu('all');
        updateCartUI();
    } catch (error) {
        console.error('Error loading menu:', error);
        // Fallback error message
        const grid = document.getElementById('menu-grid');
        if (grid) {
            grid.innerHTML = '<p class="text-red-500 text-center col-span-full text-xl">❄️ Error loading menu. Please refresh the page.</p>';
        }
    }
}

/* ---------------- NEW SNOW LOGIC ---------------- */
const canvas = document.querySelector('.canvas'); 
const ctx = canvas ? canvas.getContext('2d') : null;
const pixelRatio = window.devicePixelRatio || 1;
const snowflakes = [];

class Snowflake {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        const maxSize = 3;
        this.size = Math.random() * (maxSize - 1) + 1;
        this.velocity = this.size * 0.35;
        const opacity = this.size / maxSize;
        this.fill = `rgb(255 255 255 / ${opacity})`;
        this.windSpeed = (Math.random() - 0.5) * 0.1;
        this.windAngle = Math.random() * Math.PI * 2;
    }
    isOutsideCanvas() { return this.y > canvas.height + this.size; }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -this.size;
    }
    update() {
        this.windAngle += this.windSpeed;
        this.wind = Math.cos(this.windAngle) * 0.5;
        this.x += this.wind;
        this.y += this.velocity;
        if (this.isOutsideCanvas()) { this.reset(); }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.fill;
        ctx.fill();
        ctx.closePath();
    }
}

const createSnowflakes = () => {
    // Reduced snowflake count for mobile performance
    const isMobile = window.innerWidth < 768;
    const density = isMobile ? 2500 : 1400; 
    const snowflakeCount = Math.floor(window.innerWidth * window.innerHeight / density);
    
    for (let i = 0; i < snowflakeCount; i++) {
        snowflakes.push(new Snowflake());
    }
};

const resizeCanvas = () => {
    if (!canvas) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(pixelRatio, pixelRatio);
    snowflakes.length = 0;
    createSnowflakes();
};

const renderSnow = () => {
    if (!ctx) return;
    requestAnimationFrame(renderSnow);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snowflakes.forEach(snowflake => {
        snowflake.update();
        snowflake.draw();
    });
};

/* ---------------- APP LOGIC ---------------- */
document.addEventListener('DOMContentLoaded', () => {
    // Load menu data first
    loadMenu();
    
    startCountdown();
    
    // Only init parallax if not on mobile to save battery/performance
    if (window.innerWidth > 768) {
        initParallax();
    }
    
    // Init New Snow System
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    renderSnow();
    
    // Init Festive Music Player
    initMusicPlayer();

    // Check cookie consent
    checkCookieConsent();
});

/* ---------------- FESTIVE MUSIC PLAYER ---------------- */
function initMusicPlayer() {
    const audio = document.getElementById('christmas-audio');
    const player = document.getElementById('festive-player');
    const playerTrigger = document.getElementById('player-trigger');
    const playBtn = document.getElementById('play-pause-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const timeDisplay = document.getElementById('time-display');
    const disc = document.getElementById('player-disc');
    const volIcon = document.querySelector('.volume-control i');

    if (!audio) return;

    // --- EXPAND/COLLAPSE LOGIC ---
    if (playerTrigger && player) {
        playerTrigger.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering document click
            player.classList.toggle('collapsed');
        });

        // Close player when clicking outside (Better UX for mobile)
        document.addEventListener('click', (e) => {
            if (!player.contains(e.target) && !player.classList.contains('collapsed')) {
                player.classList.add('collapsed');
            }
        });

        // Prevent closing when clicking inside controls
        player.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Set initial volume
    audio.volume = 0.5;

    // Helper: Format Time (MM:SS)
    const formatTime = (time) => {
        if(isNaN(time)) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? '0' + sec : sec}`;
    };

    // Toggle Play/Pause
    const togglePlay = () => {
        if (audio.paused) {
            audio.play().then(() => {
                playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                player.classList.add('playing');
                disc.classList.add('playing');
                // Auto-expand if playing and currently collapsed (optional preference)
                // player.classList.remove('collapsed'); 
            }).catch(e => console.log("Play failed:", e));
        } else {
            audio.pause();
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            player.classList.remove('playing');
            disc.classList.remove('playing');
        }
    };

    playBtn.addEventListener('click', togglePlay);

    // Update Progress Bar & Timer
    audio.addEventListener('timeupdate', () => {
        const { duration, currentTime } = audio;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        timeDisplay.innerText = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    });

    // Seek Functionality
    const seek = (e) => {
        const width = progressContainer.clientWidth;
        // Handle both mouse and touch events
        const clickX = (e.offsetX !== undefined) ? e.offsetX : (e.touches[0].clientX - progressContainer.getBoundingClientRect().left);
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    };

    progressContainer.addEventListener('click', seek);

    // Volume Control
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
        if(audio.volume === 0) {
            volIcon.className = 'fa-solid fa-volume-mute text-xs text-slate-400 mr-2';
        } else if (audio.volume < 0.5) {
            volIcon.className = 'fa-solid fa-volume-low text-xs text-slate-400 mr-2';
        } else {
            volIcon.className = 'fa-solid fa-volume-high text-xs text-slate-400 mr-2';
        }
    });

    // Metadata loaded (for setting initial duration text)
    audio.addEventListener('loadedmetadata', () => {
        timeDisplay.innerText = `0:00 / ${formatTime(audio.duration)}`;
    });

    // Auto-Play Handling
    // Browser policies might block autoplay. We try, and catch if it fails.
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            // Auto-play started
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            player.classList.add('playing');
            disc.classList.add('playing');
        }).catch(error => {
            // Auto-play was prevented. 
            // We leave the UI in "Paused" state so user can click to play.
            console.log("Auto-play prevented by browser policy.");
        });
    }
}

function renderMenu(category) {
    const grid = document.getElementById('menu-grid');
    if (!grid) return;
    
    gsap.to(grid.children, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        onComplete: () => {
            grid.innerHTML = '';
            const filtered = category === 'all' ? menuItems : menuItems.filter(item => item.category === category);

            filtered.forEach(item => {
                const card = document.createElement('div');
                card.className = `menu-item glass-card rounded-2xl overflow-hidden group relative flex flex-col card-inner h-full opacity-0 transform translate-y-10`;
                card.id = `item-${item.id}`;
                
                card.innerHTML = `
                    <div class="h-48 md:h-56 overflow-hidden relative">
                        <img src="${item.img}" alt="${item.name}" id="img-${item.id}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                        ${item.chef ? `<div class="absolute top-3 right-3 bg-gold-luxury/90 text-slate-900 text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full animate-pulse-gold uppercase tracking-wider"><i class="fas fa-crown mr-1"></i> Chef's Choice</div>` : ''}
                    </div>
                    <div class="p-4 md:p-6 flex-1 flex flex-col relative z-10 bg-gradient-to-b from-transparent to-slate-900/50">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="font-header text-lg md:text-xl text-white group-hover:text-cyan-300 transition-colors">${item.name}</h3>
                            <span class="font-header text-lg md:text-xl text-cyan-400">$${item.price.toFixed(2)}</span>
                        </div>
                        <p class="text-slate-400 text-xs md:text-sm mb-4 md:mb-6 flex-1 font-light leading-relaxed">${item.desc}</p>
                        
                        <div class="pt-2">
                            <button onclick="addToCart(event, ${item.id})" class="snow-btn">
                                Add to Order
                            </button>
                        </div>

                    </div>
                `;
                grid.appendChild(card);
            });

            gsap.to(".menu-item", {
                scrollTrigger: { trigger: "#menu-grid", start: "top bottom-=100" },
                y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out"
            });
            
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('bg-white', 'text-slate-900', 'border-transparent');
                if(btn.innerText.toLowerCase() === category || (category === 'all' && btn.innerText.includes('All'))) {
                    btn.classList.add('bg-white', 'text-slate-900', 'border-transparent');
                }
            });
        }
    });
}

function filterMenu(cat) { renderMenu(cat); }

function addToCart(event, id) {
    const item = menuItems.find(i => i.id === id);
    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty++;
    else cart.push({ ...item, qty: 1 });
    saveCart();
    
    // Animation Logic
    const imgEl = document.getElementById(`img-${id}`);
    const cartIcon = document.getElementById('cart-btn-nav');
    
    // Skip flying image on mobile to prevent layout issues/performance drops
    const isMobile = window.innerWidth < 768;

    if(imgEl && cartIcon && !isMobile) {
        const flyImg = imgEl.cloneNode();
        const rect = imgEl.getBoundingClientRect();
        const targetRect = cartIcon.getBoundingClientRect();
        
        flyImg.classList.add('flying-img');
        flyImg.style.width = `${rect.width}px`;
        flyImg.style.height = `${rect.height}px`;
        flyImg.style.top = `${rect.top}px`;
        flyImg.style.left = `${rect.left}px`;
        
        document.body.appendChild(flyImg);
        
        gsap.to(flyImg, {
            top: targetRect.top + 10, left: targetRect.left + 10,
            width: 20, height: 20, opacity: 0, borderRadius: "50%",
            duration: 0.8, ease: "power2.inOut",
            onComplete: () => {
                flyImg.remove();
                updateCartUI();
                gsap.fromTo(cartIcon, { rotate: -15, scale: 1.2 }, { rotate: 0, scale: 1, duration: 0.4, ease: "elastic.out(1, 0.3)" });
                showToast(`Added ${item.name}`);
            }
        });
    } else { 
        // Simple UI update for mobile
        updateCartUI();
        showToast(`Added ${item.name}`);
        // Small wobble on cart icon
        if(cartIcon) {
             gsap.fromTo(cartIcon, { rotate: -15, scale: 1.1 }, { rotate: 0, scale: 1, duration: 0.4 });
        }
    }
}

function updateCartUI() {
    const badge = document.getElementById('cart-badge');
    const totalQty = cart.reduce((acc, i) => acc + i.qty, 0);
    if (badge) {
        badge.innerText = totalQty;
        badge.classList.toggle('scale-0', totalQty === 0);
        badge.classList.toggle('scale-100', totalQty > 0);
    }
    
    const container = document.getElementById('cart-items');
    if (container) {
        if(cart.length === 0) {
            container.innerHTML = `<div class="flex flex-col items-center justify-center h-full opacity-50"><i class="fa-regular fa-snowflake text-6xl text-cyan-200 mb-4 animate-pulse"></i><p class="font-header text-xl text-slate-300">It's cold in here...</p></div>`;
        } else {
            container.innerHTML = cart.map(item => `
                <div class="glass-card p-3 rounded-lg flex gap-3 items-center border-l-2 border-cyan-400">
                    <img src="${item.img}" class="w-12 h-12 rounded object-cover">
                    <div class="flex-1">
                        <h4 class="font-bold text-slate-200 text-sm">${item.name}</h4>
                        <p class="text-cyan-400 text-xs">$${item.price}</p>
                    </div>
                    <div class="flex items-center gap-2 bg-white/10 rounded px-1">
                        <button onclick="changeQty(${item.id}, -1)" class="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white">-</button>
                        <span class="text-xs font-bold text-white w-4 text-center">${item.qty}</span>
                        <button onclick="changeQty(${item.id}, 1)" class="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white">+</button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    const totalEl = document.getElementById('cart-total');
    if (totalEl) {
        const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
        totalEl.innerText = `$${total.toFixed(2)}`;
    }
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if(item) {
        item.qty += delta;
        if(item.qty <= 0) cart = cart.filter(i => i.id !== id);
        saveCart();
        updateCartUI();
    }
}

function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (!drawer || !overlay) return;

    const isOpen = !drawer.classList.contains('translate-x-full');
    if(isOpen) {
        drawer.classList.add('translate-x-full');
        overlay.classList.remove('opacity-100');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    } else {
        overlay.classList.remove('hidden');
        setTimeout(() => { overlay.classList.remove('opacity-0'); overlay.classList.add('opacity-100'); drawer.classList.remove('translate-x-full'); }, 10);
    }
}

function checkout() {
    if(cart.length === 0) return;
    showToast("Order Sent to the North Pole!", true);
    cart = [];
    saveCart();
    updateCartUI();
    toggleCart();
}

function saveCart() { localStorage.setItem('winterFeastCart', JSON.stringify(cart)); }

function showToast(msg) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    if (!toast || !msgEl) return;
    
    msgEl.innerText = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
}

function initParallax() {
    const hero = document.getElementById('hero');
    const els = document.querySelectorAll('.parallax-el');
    if (!hero) return;

    hero.addEventListener('mousemove', (e) => {
        // Debounce or verify performance in heavy apps
        requestAnimationFrame(() => {
            const x = (window.innerWidth - e.pageX * 2) / 100;
            const y = (window.innerHeight - e.pageY * 2) / 100;
            const content = document.getElementById('hero-content');
            if(content) content.style.transform = `translate(${x/5}px, ${y/5}px)`;
            
            els.forEach(el => {
                const speed = el.getAttribute('data-speed');
                el.style.transform = `translate(${x * speed * 50}px, ${y * speed * 50}px)`;
            });
        });
    });
}

function startCountdown() {
    const target = new Date();
    target.setDate(target.getDate() + 5); 
    function update() {
        const now = new Date();
        const diff = target - now;
        if (diff <= 0) return;
        
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        
        const elD = document.getElementById('days');
        const elH = document.getElementById('hours');
        const elM = document.getElementById('mins');
        const elS = document.getElementById('secs');
        
        if(elD) elD.innerText = String(d).padStart(2, '0');
        if(elH) elH.innerText = String(h).padStart(2, '0');
        if(elM) elM.innerText = String(m).padStart(2, '0');
        if(elS) elS.innerText = String(s).padStart(2, '0');
    }
    setInterval(update, 1000);
    update();
}

/* ---------------- COOKIE CONSENT ---------------- */
function checkCookieConsent() {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
        // Show popup after a brief delay for better UX
        setTimeout(() => {
            const popup = document.getElementById('cookie-popup');
            if(popup) popup.classList.remove('hidden');
        }, 1000);
    }
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    closeCookiePopup();
    console.log('Cookies accepted');
}

function rejectCookies() {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    closeCookiePopup();
    console.log('Cookies rejected');
}

function closeCookiePopup() {
    const popup = document.getElementById('cookie-popup');
    if(popup) {
        popup.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            popup.classList.add('hidden');
        }, 300);
    }
}

// Add fadeOut animation dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);