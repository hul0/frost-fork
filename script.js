gsap.registerPlugin(ScrollTrigger);

/* ---------------- DATA ---------------- */
const menuItems = [
    { id: 1, name: "Arctic King Crab", price: 45.00, desc: "Steamed legs with lemon-dill butter and frost-salt.", category: "savory", chef: true, img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80" },
    { id: 2, name: "Reindeer Stew", price: 28.50, desc: "Hearty root vegetables and tender venison in red wine.", category: "savory", chef: false, img: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80" },
    { id: 3, name: "Frostbite Martini", price: 16.00, desc: "Vodka, blue curacao, white cacao, rimmed with sugar ice.", category: "warm", chef: false, img: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=600&q=80" },
    { id: 4, name: "White Forest Cake", price: 12.00, desc: "White chocolate shavings, cherries, and vanilla sponge.", category: "sweet", chef: false, img: "https://images.unsplash.com/photo-1576618148400-f54bed99fcf8?auto=format&fit=crop&w=600&q=80" },
    { id: 5, name: "Golden Glazed Ham", price: 32.00, desc: "Honey and clove glaze with a side of roasted chestnuts.", category: "savory", chef: true, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80" },
    { id: 6, name: "North Pole Cocoa", price: 8.00, desc: "Thick european chocolate with a peppermint candy cane.", category: "warm", chef: false, img: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80" },
    { id: 7, name: "Yule Log", price: 14.50, desc: "Rolled sponge cake resembling a bark-covered log.", category: "sweet", chef: false, img: "https://images.unsplash.com/photo-1607920592519-bab4d790f489?auto=format&fit=crop&w=600&q=80" },
    { id: 8, name: "Truffle Risotto", price: 26.00, desc: "Creamy arborio rice with black winter truffles.", category: "savory", chef: false, img: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=80" },
    { id: 9, name: "Spiced Mulled Wine", price: 10.00, desc: "Warm red wine with star anise, cinnamon, and orange.", category: "warm", chef: false, img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80" }
];

let cart = JSON.parse(localStorage.getItem('winterFeastCart')) || [];

/* ---------------- NEW SNOW LOGIC ---------------- */
const canvas = document.querySelector('.canvas'); // Updated selector
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
    const snowflakeCount = Math.floor(window.innerWidth * window.innerHeight / 1400);
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
    renderMenu('all');
    updateCartUI();
    startCountdown();
    initParallax();
    
    // Init New Snow System
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    renderSnow();
});

function renderMenu(category) {
    const grid = document.getElementById('menu-grid');
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
                
                // Using the New Snowy Button Style below
                card.innerHTML = `
                    <div class="h-56 overflow-hidden relative">
                        <img src="${item.img}" alt="${item.name}" id="img-${item.id}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                        ${item.chef ? `<div class="absolute top-3 right-3 bg-gold-luxury/90 text-slate-900 text-xs font-bold px-3 py-1 rounded-full animate-pulse-gold uppercase tracking-wider"><i class="fas fa-crown mr-1"></i> Chef's Choice</div>` : ''}
                    </div>
                    <div class="p-6 flex-1 flex flex-col relative z-10 bg-gradient-to-b from-transparent to-slate-900/50">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="font-header text-xl text-white group-hover:text-cyan-300 transition-colors">${item.name}</h3>
                            <span class="font-header text-xl text-cyan-400">$${item.price.toFixed(2)}</span>
                        </div>
                        <p class="text-slate-400 text-sm mb-6 flex-1 font-light leading-relaxed">${item.desc}</p>
                        
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
                if(btn.innerText.toLowerCase() === category || (category === 'all' && btn.innerText === 'All')) {
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
    
    if(imgEl && cartIcon) {
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
    } else { updateCartUI(); }
}

function updateCartUI() {
    const badge = document.getElementById('cart-badge');
    const totalQty = cart.reduce((acc, i) => acc + i.qty, 0);
    badge.innerText = totalQty;
    badge.classList.toggle('scale-0', totalQty === 0);
    badge.classList.toggle('scale-100', totalQty > 0);
    
    const container = document.getElementById('cart-items');
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
                    <button onclick="changeQty(${item.id}, -1)" class="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-white">-</button>
                    <span class="text-xs font-bold text-white w-3 text-center">${item.qty}</span>
                    <button onclick="changeQty(${item.id}, 1)" class="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-white">+</button>
                </div>
            </div>
        `).join('');
    }
    const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    document.getElementById('cart-total').innerText = `$${total.toFixed(2)}`;
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
    document.getElementById('toast-msg').innerText = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
}

function initParallax() {
    const hero = document.getElementById('hero');
    const els = document.querySelectorAll('.parallax-el');
    hero.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth - e.pageX * 2) / 100;
        const y = (window.innerHeight - e.pageY * 2) / 100;
        document.getElementById('hero-content').style.transform = `translate(${x/5}px, ${y/5}px)`;
        els.forEach(el => {
            const speed = el.getAttribute('data-speed');
            el.style.transform = `translate(${x * speed * 50}px, ${y * speed * 50}px)`;
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
        document.getElementById('days').innerText = String(d).padStart(2, '0');
        document.getElementById('hours').innerText = String(h).padStart(2, '0');
        document.getElementById('mins').innerText = String(m).padStart(2, '0');
        document.getElementById('secs').innerText = String(s).padStart(2, '0');
    }
    setInterval(update, 1000);
    update();
}

function toggleMusic(btn) {
    const icon = btn.querySelector('i');
    if(icon.classList.contains('fa-volume-mute')) {
        icon.classList.remove('fa-volume-mute');
        icon.classList.add('fa-volume-up', 'text-cyan-400');
        showToast('Festive ambiance enabled');
    } else {
        icon.classList.add('fa-volume-mute');
        icon.classList.remove('fa-volume-up', 'text-cyan-400');
        showToast('Sound muted');
    }
}





/* ---------------- COOKIE CONSENT ---------------- */
function checkCookieConsent() {
  const consent = localStorage.getItem('cookieConsent');
  if (!consent) {
    // Show popup after a brief delay for better UX
    setTimeout(() => {
      document.getElementById('cookie-popup').classList.remove('hidden');
    }, 1000);
  }
}

function acceptCookies() {
  localStorage.setItem('cookieConsent', 'accepted');
  localStorage.setItem('cookieConsentDate', new Date().toISOString());
  closeCookiePopup();
  // Optional: Initialize analytics or other cookie-dependent features here
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
  popup.style.animation = 'fadeOut 0.3s ease';
  setTimeout(() => {
    popup.classList.add('hidden');
  }, 300);
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);

// Check consent on page load
checkCookieConsent();
