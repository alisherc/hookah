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
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const signaturesList = document.getElementById('signaturesList');
const canvasWrapper = document.querySelector('.canvas-wrapper');

let isDrawing = false;
let hasSignature = false;

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
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

async function submitSignature() {
    const name = nameInput.value.trim();
    
    if (!name) {
        showError('Введи своё имя!');
        nameInput.focus();
        return;
    }
    
    if (name.length > 50) {
        showError('Имя слишком длинное!');
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
        
        if (signatureDataUrl.length > 1048576) {
            showError('Подпись слишком сложная, попробуй проще');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Подписать';
            return;
        }
        
        const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
        const ipData = ipResponse ? await ipResponse.json().catch(() => null) : null;
        const ip = ipData?.ip || 'unknown';
        
        const existingSignatures = await db.collection('signatures')
            .where('ip', '==', ip)
            .get();
        
        if (existingSignatures.size >= 3) {
            showError('Достигнут лимит подписей с одного IP');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Подписать';
            return;
        }
        
        await db.collection('signatures').add({
            name: name,
            signature: signatureDataUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            ip: ip
        });
        
        nameInput.value = '';
        clearCanvas();
        
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            background: rgba(0, 255, 0, 0.1);
            border: 1px solid rgba(0, 255, 0, 0.3);
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            color: #4ade80;
            text-align: center;
        `;
        successDiv.textContent = 'Подпись успешно добавлена!';
        document.querySelector('.signature-form').insertBefore(successDiv, document.querySelector('.signature-form').firstChild);
        
        setTimeout(() => successDiv.remove(), 3000);
        
        loadSignatures();
        
    } catch (error) {
        console.error('Error:', error);
        showError('Ошибка при сохранении. Попробуй ещё раз');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Подписать';
    }
}

submitBtn.addEventListener('click', submitSignature);

nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        submitSignature();
    }
});

async function loadSignatures() {
    try {
        const snapshot = await db.collection('signatures')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();
        
        if (snapshot.empty) {
            signaturesList.innerHTML = '<div class="loading">Пока никто не подписал кодекс. Будь первым!</div>';
            return;
        }
        
        signaturesList.innerHTML = '';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const card = createSignatureCard(data);
            signaturesList.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading signatures:', error);
        signaturesList.innerHTML = '<div class="loading">Ошибка загрузки подписей</div>';
    }
}

function createSignatureCard(data) {
    const card = document.createElement('div');
    card.className = 'signature-card';
    
    const date = data.timestamp ? data.timestamp.toDate() : new Date();
    const dateStr = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    card.innerHTML = `
        <div class="signature-card-name">${escapeHtml(data.name)}</div>
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
loadSignatures();

setInterval(loadSignatures, 30000);