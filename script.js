const firebaseConfig = {
    apiKey: "AIzaSyBcyP2Gmer-TWyEnDeCPqo6E4tptAuHdBQ",
    authDomain: "hookah-law.firebaseapp.com",
    projectId: "hookah-law",
    storageBucket: "hookah-law.firebasestorage.app",
    messagingSenderId: "337023489666",
    appId: "1:337023489666:web:75f463fda37247ff41469b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
const nameInput = document.getElementById('signatureName');
const surnameInput = document.getElementById('signatureSurname');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const signaturesList = document.getElementById('signaturesList');
const canvasWrapper = document.querySelector('.canvas-wrapper');
const viewSignaturesBtn = document.getElementById('viewSignaturesBtn');
const passwordModal = document.getElementById('passwordModal');
const passwordInput = document.getElementById('passwordInput');
const passwordSubmit = document.getElementById('passwordSubmit');
const passwordCancel = document.getElementById('passwordCancel');

let isDrawing = false;
let hasSignature = false;
let selectedEmoji = null;
let signaturesCache = [];
let isAuthenticated = false;

const emojiCategories = {
    popular: ['😎', '🔥', '💨', '👑', '🌙', '⚡', '💎', '🎯', '🚀', '🌟', '😍', '🥰', '😘', '🤩', '😏', '😜', '🤪', '🤓', '😂', '🤣', '😊', '😇', '🙃', '😉', '😌', '😋', '😛', '🤗', '🤔', '🤫'],
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '😵‍💫', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦀', '🦞', '🐠', '🐟', '🐡', '🦈', '🐳', '🐋', '🐬', '🦭', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🪶', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'],
    food: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾'],
    nature: ['🌵', '🎄', '🌲', '🌳', '🌴', '🪵', '🌱', '🌿', '☘️', '🍀', '🎍', '🪴', '🎋', '🍃', '🍂', '🍁', '🍄', '🐚', '🪨', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '🪐', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '🫧', '☔', '☂️', '🌊', '🌫️'],
    objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '🧾', '💎', '⚖️', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🧽', '🪣', '🧴'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '⚧️', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓']
};

const emojiGrid = document.getElementById('emojiGrid');
const selectedEmojiDisplay = document.getElementById('selectedEmojiDisplay');

function vibrate(duration = 10) {
    if ('vibrate' in navigator) {
        navigator.vibrate(duration);
    }
}

function loadEmojiCategory(category) {
    emojiGrid.innerHTML = '';
    const emojis = emojiCategories[category] || emojiCategories.popular;
    
    emojis.forEach(emoji => {
        const btn = document.createElement('button');
        btn.className = 'emoji-btn';
        btn.dataset.emoji = emoji;
        btn.textContent = emoji;
        
        if (emoji === selectedEmoji) {
            btn.classList.add('selected');
        }
        
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedEmoji = emoji;
            selectedEmojiDisplay.textContent = emoji;
            vibrate(20);
        });
        
        emojiGrid.appendChild(btn);
    });
}

// Загружаем популярные emoji по умолчанию
loadEmojiCategory('popular');

// Обработчики для табов
document.querySelectorAll('.emoji-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        document.querySelectorAll('.emoji-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const category = tab.dataset.category;
        loadEmojiCategory(category);
    });
});

function setupCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (e.touches && e.touches[0]) {
        return {
            x: (e.touches[0].clientX - rect.left) * scaleX,
            y: (e.touches[0].clientY - rect.top) * scaleY
        };
    }
    
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    
    if (!hasSignature) {
        hasSignature = true;
        canvasWrapper.classList.add('active');
        vibrate(5);
    }
}

function draw(e) {
    e.preventDefault();
    if (!isDrawing) return;
    
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
}

function stopDrawing(e) {
    e.preventDefault();
    if (!isDrawing) return;
    isDrawing = false;
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDrawing, { passive: false });
canvas.addEventListener('touchcancel', stopDrawing, { passive: false });

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasSignature = false;
    canvasWrapper.classList.remove('active');
    setupCanvas();
}

clearBtn.addEventListener('click', () => {
    clearCanvas();
    triggerSmokeEffect(clearBtn);
});

// Эффект дыма для всех кнопок
function triggerSmokeEffect(button) {
    button.classList.add('smoke-effect');
    setTimeout(() => {
        button.classList.remove('smoke-effect');
    }, 1500);
}

// Добавляем эффект дыма для всех кнопок
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn')) {
        triggerSmokeEffect(e.target);
    }
});

// Реалистичный дым на canvas
function initSmokeCanvas() {
    const smokeCanvas = document.getElementById('smokeCanvas');
    const ctx = smokeCanvas.getContext('2d');
    
    let particles = [];
    const maxParticles = 100; // Увеличил количество частиц
    
    function resizeCanvas() {
        smokeCanvas.width = window.innerWidth;
        smokeCanvas.height = window.innerHeight; // Используем высоту viewport, а не scrollHeight
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    // Обновляем размер при изменении содержимого
    window.addEventListener('load', resizeCanvas);
    
    class SmokeParticle {
        constructor() {
            this.x = Math.random() * smokeCanvas.width;
            // Распределяем частицы по всей высоте страницы
            this.y = Math.random() * smokeCanvas.height;
            this.size = Math.random() * 100 + 100; // Увеличил размер
            this.speedX = (Math.random() - 0.5) * 1.5;
            this.speedY = Math.random() * -2 - 1;
            this.opacity = 0;
            this.life = 0;
            this.maxLife = Math.random() * 150 + 250;
            this.wobble = Math.random() * 0.02 + 0.005;
        }
        
        update() {
            this.life++;
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.life * this.wobble) * 2;
            this.size += 0.5;
            
            if (this.life < 40) {
                this.opacity = this.life / 40 * 0.3; // Увеличил непрозрачность
            } else if (this.life > this.maxLife - 60) {
                this.opacity = (this.maxLife - this.life) / 60 * 0.3;
            }
            
            this.speedY *= 0.985;
            this.speedX *= 0.99;
            
            return this.life < this.maxLife && this.y > -this.size * 2;
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.2)');
            gradient.addColorStop(0.6, 'rgba(212, 175, 55, 0.1)'); // Добавил золотой оттенок
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, smokeCanvas.width, smokeCanvas.height);
        
        // Создаём больше частиц
        if (Math.random() < 0.3 && particles.length < maxParticles) {
            particles.push(new SmokeParticle());
        }
        
        // Иногда создаём сразу несколько частиц для эффекта клубов дыма
        if (Math.random() < 0.05) {
            for (let i = 0; i < 3; i++) {
                if (particles.length < maxParticles) {
                    particles.push(new SmokeParticle());
                }
            }
        }
        
        particles = particles.filter(particle => {
            const alive = particle.update();
            if (alive) particle.draw();
            return alive;
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Инициализируем дым при загрузке страницы
document.addEventListener('DOMContentLoaded', initSmokeCanvas);

// Анимация появления при скролле
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.article, .signature-section, .signatures-list').forEach(el => {
        observer.observe(el);
    });
}

// Инициализируем анимации при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    
    // Добавляем первым элементам класс visible сразу
    document.querySelectorAll('.article:first-child').forEach(el => {
        setTimeout(() => el.classList.add('visible'), 100);
    });
});

// Добавляем случайные искры
function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 4px;
        height: 4px;
        background: ${Math.random() > 0.5 ? '#d4af37' : '#fff'};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: sparkle-fall 1s ease-out forwards;
    `;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1000);
}

// Добавляем стили для искр
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkle-fall {
        0% {
            transform: translateY(0) translateX(0);
            opacity: 1;
        }
        100% {
            transform: translateY(50px) translateX(${(Math.random() - 0.5) * 100}px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Создаём искры при движении мыши (редко)
let lastSparkleTime = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSparkleTime > 200 && Math.random() < 0.1) {
        createSparkle(e.clientX, e.clientY);
        lastSparkleTime = now;
    }
});

function isCanvasEmpty() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] !== 0) return false;
    }
    return true;
}

function showError(message) {
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    document.querySelector('.signature-form').insertBefore(errorDiv, document.querySelector('.signature-form').firstChild);
    vibrate([50, 30, 50]);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

function showModalError(message) {
    const existingError = document.querySelector('.modal-error');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'modal-error error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'margin-bottom: 10px;';
    
    const modalContent = document.querySelector('.modal-content');
    modalContent.insertBefore(errorDiv, modalContent.querySelector('input'));
    vibrate([50, 30, 50]);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

function createParticles(x, y) {
    const particlesContainer = document.getElementById('particles');
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.setProperty('--random-x', (Math.random() - 0.5) * 100 + 'px');
        particlesContainer.appendChild(particle);
        
        setTimeout(() => particle.remove(), 3000);
    }
}

function showSuccessAnimation(emoji) {
    const animation = document.createElement('div');
    animation.className = 'success-animation';
    animation.textContent = emoji || '✨';
    document.body.appendChild(animation);
    
    vibrate([100, 50, 100]);
    
    setTimeout(() => animation.remove(), 1000);
}

async function submitSignature() {
    const name = nameInput.value.trim();
    const surname = surnameInput.value.trim();
    
    if (!name) {
        showError('Введи своё имя!');
        nameInput.focus();
        return;
    }
    
    if (!surname) {
        showError('Введи свою фамилию!');
        surnameInput.focus();
        return;
    }
    
    if (!selectedEmoji) {
        showError('Выбери emoji!');
        return;
    }
    
    if (isCanvasEmpty()) {
        showError('Нарисуй подпись!');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Сохраняем...';
    
    try {
        const signatureDataUrl = canvas.toDataURL('image/png');
        
        // Получаем последний номер из базы данных
        const lastSignature = await db.collection('signatures')
            .orderBy('orderNumber', 'desc')
            .limit(1)
            .get();
        
        let orderNumber = 1;
        if (!lastSignature.empty) {
            const lastNumber = lastSignature.docs[0].data().orderNumber;
            orderNumber = (lastNumber || 0) + 1;
        }
        
        // Проверяем на дубликаты по имени и фамилии
        const existingUser = await db.collection('signatures')
            .where('name', '==', name)
            .where('surname', '==', surname)
            .get();
            
        if (!existingUser.empty) {
            showError('Ты уже подписал кодекс! Можно подписать только один раз.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Подписать';
            return;
        }
        
        await db.collection('signatures').add({
            name: name.substring(0, 50), // Ограничиваем длину
            surname: surname.substring(0, 50), // Ограничиваем длину
            emoji: selectedEmoji,
            signature: signatureDataUrl,
            orderNumber: orderNumber,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        nameInput.value = '';
        surnameInput.value = '';
        clearCanvas();
        document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        selectedEmoji = null;
        
        const rect = submitBtn.getBoundingClientRect();
        createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
        showSuccessAnimation(selectedEmoji);
        
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(244, 228, 160, 0.1));
            border: 2px solid var(--gold);
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 15px;
            color: var(--gold);
            text-align: center;
            font-weight: 600;
            animation: fadeIn 0.5s ease;
        `;
        successDiv.textContent = `Поздравляю! Ты теперь #${orderNumber} в кодексе!`;
        document.querySelector('.signature-form').insertBefore(successDiv, document.querySelector('.signature-form').firstChild);
        
        setTimeout(() => successDiv.remove(), 5000);
        
        // Обновляем счетчик после успешной подписи
        updateSignaturesCount();
        
        if (isAuthenticated) {
            loadSignatures();
        }
        
    } catch (error) {
        console.error('Error:', error);
        
        if (error.code === 'unavailable') {
            showError('Нет подключения к серверу. Проверь интернет-соединение.');
        } else if (error.code === 'permission-denied') {
            showError('Недостаточно прав для сохранения. Обратись к администратору.');
        } else if (error.code === 'resource-exhausted') {
            showError('Превышен лимит запросов. Попробуй позже.');
        } else {
            showError('Ошибка при сохранении. Попробуй ещё раз.');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Подписать';
    }
}

submitBtn.addEventListener('click', submitSignature);

async function checkPassword(password) {
    try {
        const configDoc = await db.collection('config').doc('settings').get();
        if (!configDoc.exists) {
            throw new Error('Настройки не найдены. Обратитесь к администратору.');
        }
        const data = configDoc.data();
        if (!data.viewPassword) {
            throw new Error('Пароль не установлен. Обратитесь к администратору.');
        }
        return password === data.viewPassword;
    } catch (error) {
        console.error('Error checking password:', error);
        throw error;
    }
}

viewSignaturesBtn.addEventListener('click', () => {
    if (isAuthenticated) {
        signaturesList.style.display = 'grid';
        viewSignaturesBtn.style.display = 'none';
    } else {
        passwordModal.classList.add('active');
        passwordInput.focus();
    }
});

passwordSubmit.addEventListener('click', async () => {
    const password = passwordInput.value;
    
    try {
        const isValid = await checkPassword(password);
        if (isValid) {
            isAuthenticated = true;
            passwordModal.classList.remove('active');
            signaturesList.style.display = 'grid';
            viewSignaturesBtn.style.display = 'none';
            updateSignaturesCount();
            loadSignatures();
            
            try {
                localStorage.setItem('hookah_auth', 'true');
                localStorage.setItem('hookah_auth_time', Date.now().toString());
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                // Продолжаем работу, но без сохранения состояния
            }
        } else {
            showModalError('Неверный пароль!');
            passwordInput.value = '';
        }
    } catch (error) {
        showModalError(error.message || 'Ошибка проверки пароля');
    }
});

passwordCancel.addEventListener('click', () => {
    passwordModal.classList.remove('active');
    passwordInput.value = '';
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        passwordSubmit.click();
    }
});

// Проверяем localStorage с обработкой ошибок
try {
    const authCache = localStorage.getItem('hookah_auth');
    const authTime = localStorage.getItem('hookah_auth_time');
    if (authCache === 'true' && authTime && (Date.now() - parseInt(authTime) < 3600000)) {
        isAuthenticated = true;
        signaturesList.style.display = 'grid';
        viewSignaturesBtn.style.display = 'none';
    }
} catch (error) {
    console.error('Error accessing localStorage:', error);
    // Продолжаем работу без сохранённой авторизации
}

// Функция для обновления счетчика подписей (работает независимо от авторизации)
async function updateSignaturesCount() {
    const countElement = document.getElementById('signaturesCount');
    if (!countElement) return;
    
    try {
        const snapshot = await db.collection('signatures').get();
        const count = snapshot.size;
        countElement.textContent = count.toString();
        
        // Добавим анимацию при обновлении
        countElement.style.animation = 'none';
        setTimeout(() => {
            countElement.style.animation = 'pulse 2s ease-in-out infinite';
        }, 100);
    } catch (error) {
        console.error('Error loading signatures count:', error);
        countElement.textContent = '?';
    }
}

async function loadSignatures() {
    if (!isAuthenticated) return;
    
    try {
        const snapshot = await db.collection('signatures')
            .orderBy('orderNumber', 'asc')
            .get();
        
        if (snapshot.empty) {
            signaturesList.innerHTML = '<div class="loading">Пока никто не подписал кодекс. Будь первым!</div>';
            return;
        }
        
        const newSignatures = [];
        snapshot.forEach(doc => {
            newSignatures.push({ id: doc.id, ...doc.data() });
        });
        
        const existingIds = new Set(signaturesCache.map(s => s.id));
        const newIds = new Set(newSignatures.map(s => s.id));
        
        if (JSON.stringify([...existingIds].sort()) === JSON.stringify([...newIds].sort()) && signaturesCache.length > 0) {
            return;
        }
        
        const addedSignatures = newSignatures.filter(s => !existingIds.has(s.id));
        
        if (signaturesCache.length === 0) {
            signaturesList.innerHTML = '';
            newSignatures.forEach(data => {
                const card = createSignatureCard(data);
                signaturesList.appendChild(card);
            });
        } else {
            addedSignatures.forEach(data => {
                const card = createSignatureCard(data);
                signaturesList.appendChild(card);
            });
        }
        
        signaturesCache = newSignatures;
        
    } catch (error) {
        console.error('Error loading signatures:', error);
        signaturesList.innerHTML = '<div class="loading">Ошибка загрузки подписей</div>';
    }
}

function createSignatureCard(data) {
    const card = document.createElement('div');
    card.className = 'signature-card';
    card.dataset.id = data.id;
    
    let date;
    try {
        date = data.timestamp && data.timestamp.toDate ? data.timestamp.toDate() : new Date();
    } catch (error) {
        console.error('Error parsing timestamp:', error);
        date = new Date();
    }
    
    const dateStr = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const orderClass = data.orderNumber <= 5 ? 'founder' : '';
    
    const surnameInitial = data.surname ? escapeHtml(data.surname.charAt(0).toUpperCase()) + '.' : '';
    
    card.innerHTML = `
        <div class="signature-order-number ${orderClass}">#${data.orderNumber}</div>
        <div class="signature-emoji">${data.emoji || '😎'}</div>
        <div class="signature-card-name">${escapeHtml(data.name)} ${surnameInitial}</div>
        <img src="${data.signature}" alt="Подпись" class="signature-card-image">
        <div class="signature-card-date">${dateStr}</div>
    `;
    
    return card;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.addEventListener('resize', () => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);
    
    setupCanvas();
    
    ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
});

setupCanvas();

// Загружаем счетчик подписей сразу (для всех пользователей)
updateSignaturesCount();
setInterval(updateSignaturesCount, 30000);

// Загружаем сами подписи только для авторизованных
if (isAuthenticated) {
    loadSignatures();
    setInterval(loadSignatures, 30000);
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('admin') === 'true') {
    const adminBtn = document.createElement('button');
    adminBtn.textContent = '🔧';
    adminBtn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: var(--gold); border: none; border-radius: 50%; width: 50px; height: 50px; font-size: 24px; cursor: pointer;';
    adminBtn.onclick = () => window.location.href = 'admin.html';
    document.body.appendChild(adminBtn);
}

// Фикс для мобильных устройств
document.addEventListener('DOMContentLoaded', function() {
    // Предотвращаем горизонтальный скролл на мобильных
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        // Форсируем стили для body и html
        document.body.style.overflowX = 'hidden';
        document.body.style.maxWidth = '100vw';
        document.documentElement.style.overflowX = 'hidden';
        document.documentElement.style.maxWidth = '100vw';
        
        // Фикс для iOS Safari
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // Убираем возможность масштабирования жестами на iOS
        document.addEventListener('gesturestart', function (e) {
            e.preventDefault();
        });
        
        // Дополнительный фикс для скроллбаров в emoji селекторах
        const emojiTabs = document.querySelector('.emoji-tabs');
        const emojiGrid = document.querySelector('.emoji-grid');
        
        if (emojiTabs) {
            emojiTabs.style.scrollbarWidth = 'none';
            emojiTabs.style.msOverflowStyle = 'none';
            emojiTabs.style.webkitScrollbar = 'none';
        }
        
        if (emojiGrid) {
            emojiGrid.style.scrollbarWidth = 'none';
            emojiGrid.style.msOverflowStyle = 'none';
            emojiGrid.style.webkitScrollbar = 'none';
        }
    }
});