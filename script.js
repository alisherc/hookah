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

function vibrate(duration = 10) {
    if ('vibrate' in navigator) {
        navigator.vibrate(duration);
    }
}

document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedEmoji = btn.dataset.emoji;
        vibrate(20);
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

clearBtn.addEventListener('click', clearCanvas);

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
        
        const signaturesCount = await db.collection('signatures').get();
        const orderNumber = signaturesCount.size + 1;
        
        await db.collection('signatures').add({
            name: name,
            surname: surname,
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
        
        if (isAuthenticated) {
            loadSignatures();
        }
        
    } catch (error) {
        console.error('Error:', error);
        showError('Ошибка при сохранении. Попробуй ещё раз');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Подписать';
    }
}

submitBtn.addEventListener('click', submitSignature);

async function checkPassword(password) {
    try {
        const configDoc = await db.collection('config').doc('settings').get();
        if (configDoc.exists) {
            const data = configDoc.data();
            return password === data.viewPassword;
        }
        return password === 'hookah2025';
    } catch (error) {
        console.error('Error checking password:', error);
        return password === 'hookah2025';
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
    
    if (await checkPassword(password)) {
        isAuthenticated = true;
        passwordModal.classList.remove('active');
        signaturesList.style.display = 'grid';
        viewSignaturesBtn.style.display = 'none';
        loadSignatures();
        
        localStorage.setItem('hookah_auth', 'true');
        localStorage.setItem('hookah_auth_time', Date.now());
    } else {
        showError('Неверный пароль!');
        passwordInput.value = '';
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

const authCache = localStorage.getItem('hookah_auth');
const authTime = localStorage.getItem('hookah_auth_time');
if (authCache === 'true' && authTime && (Date.now() - parseInt(authTime) < 3600000)) {
    isAuthenticated = true;
    signaturesList.style.display = 'grid';
    viewSignaturesBtn.style.display = 'none';
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
    
    const date = data.timestamp ? data.timestamp.toDate() : new Date();
    const dateStr = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const orderClass = data.orderNumber <= 5 ? 'founder' : '';
    
    card.innerHTML = `
        <div class="signature-order-number ${orderClass}">#${data.orderNumber}</div>
        <div class="signature-emoji">${data.emoji || '😎'}</div>
        <div class="signature-card-name">${escapeHtml(data.name)} ${escapeHtml(data.surname || '')}</div>
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