// static/js/swipe.js

class TinderSwipe {
    constructor() {
        this.cards = Array.from(document.querySelectorAll('.card'));
        this.currentCardIndex = 0;
        this.likedCharacters = [];
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        
        // Инициализация аудио контекста для звуков
        this.audioContext = null;
        
        this.init();
    }
    
    init() {
        if (this.cards.length === 0) {
            this.showEmptyState();
            return;
        }
        
        // Показываем только верхнюю карточку
        this.showTopCard();
        
        // Кнопки
        document.getElementById('dislikeBtn').addEventListener('click', () => this.swipe('left'));
        document.getElementById('likeBtn').addEventListener('click', () => this.swipe('right'));
        document.getElementById('superlikeBtn').addEventListener('click', () => this.swipe('up'));
        
        // Drag события
        this.setupDragEvents();
    }
    
    // Инициализация аудио (нужен пользовательский клик для браузеров)
    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    // Проигрывание звука
    playSound(type) {
        // Инициализируем аудио при первом использовании
        this.initAudio();
        
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Настройка звука в зависимости от действия
        switch(type) {
            case 'like':
                // Приятный высокий звук для лайка
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // До
                oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // Ми
                oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // Соль
                gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);
                break;
                
            case 'dislike':
                // Низкий звук для дизлайка
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
                oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime + 0.15);
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.2);
                break;
                
            case 'superlike':
                // Звук-сюрприз для суперлайка
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // Ля
                oscillator.frequency.setValueAtTime(554.37, this.audioContext.currentTime + 0.1); // До#
                oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.2); // Ми
                oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime + 0.3); // Ля
                gainNode.gain.setValueAtTime(0.12, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.4);
                break;
        }
    }
    
    showTopCard() {
        // Скрываем все карточки
        this.cards.forEach(card => {
            card.style.display = 'none';
            card.style.transform = '';
            card.style.opacity = '';
        });
        
        // Показываем текущую
        if (this.currentCardIndex < this.cards.length) {
            const card = this.cards[this.currentCardIndex];
            card.style.display = 'block';
            card.style.opacity = '1';
            card.style.transform = 'translateX(0) rotate(0deg)';
        }
        
        this.updateCounter();
    }
    
    setupDragEvents() {
        const cardsContainer = document.getElementById('cardsContainer');
        
        cardsContainer.addEventListener('mousedown', (e) => this.startDrag(e));
        cardsContainer.addEventListener('mousemove', (e) => this.duringDrag(e));
        cardsContainer.addEventListener('mouseup', () => this.endDrag());
        cardsContainer.addEventListener('mouseleave', () => this.endDrag());
        
        // Touch события для мобильных
        cardsContainer.addEventListener('touchstart', (e) => this.startDrag(e));
        cardsContainer.addEventListener('touchmove', (e) => this.duringDrag(e));
        cardsContainer.addEventListener('touchend', () => this.endDrag());
    }
    
    startDrag(e) {
        if (this.currentCardIndex >= this.cards.length) return;
        
        this.isDragging = true;
        this.startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        this.startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        
        const card = this.cards[this.currentCardIndex];
        card.style.transition = 'none';
    }
    
    duringDrag(e) {
        if (!this.isDragging) return;
        
        this.currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        this.currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        
        const diffX = this.currentX - this.startX;
        const diffY = this.currentY - this.startY;
        const card = this.cards[this.currentCardIndex];
        
        // Определяем основное направление движения
        if (Math.abs(diffY) > Math.abs(diffX) && diffY < -50) {
            // Движение вверх (суперлайк)
            const progress = Math.min(Math.abs(diffY) / 300, 1);
            card.style.transform = `translateY(${diffY}px) scale(${1 - progress * 0.3})`;
            card.style.opacity = Math.max(1 - progress, 0.3);
        } else {
            // Горизонтальное движение (лайк/дизлайк)
            card.style.transform = `translateX(${diffX}px) rotate(${diffX * 0.1}deg)`;
            const opacity = 1 - Math.abs(diffX) / 500;
            card.style.opacity = Math.max(opacity, 0.3);
        }
    }
    
    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        const diffX = this.currentX - this.startX;
        const diffY = this.currentY - this.startY;
        const card = this.cards[this.currentCardIndex];
        card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        
        // Определяем направление свайпа
        if (Math.abs(diffY) > Math.abs(diffX) && diffY < -100) {
            // Свайп вверх - суперлайк
            this.playSound('superlike');
            this.animateSwipe(card, 'up');
        } else if (Math.abs(diffX) > 100) {
            // Свайп влево или вправо
            const direction = diffX > 0 ? 'right' : 'left';
            
            if (direction === 'right') {
                this.playSound('like');
            } else {
                this.playSound('dislike');
            }
            
            this.animateSwipe(card, direction);
        } else {
            // Возвращаем карточку на место
            card.style.transform = 'translateX(0) rotate(0deg)';
            card.style.opacity = '1';
        }
    }
    
    swipe(direction) {
        if (this.currentCardIndex >= this.cards.length) return;
        
        const card = this.cards[this.currentCardIndex];
        
        // Проигрываем соответствующий звук
        switch(direction) {
            case 'right':
                this.playSound('like');
                break;
            case 'left':
                this.playSound('dislike');
                break;
            case 'up':
                this.playSound('superlike');
                break;
        }
        
        this.animateSwipe(card, direction);
    }
    
    animateSwipe(card, direction) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        let transformValue;
        
        switch(direction) {
            case 'left':
                transformValue = `translateX(-${screenWidth}px) rotate(-30deg)`;
                break;
            case 'right':
                transformValue = `translateX(${screenWidth}px) rotate(30deg)`;
                break;
            case 'up':
                transformValue = `translateY(-${screenHeight}px) scale(0.5) rotate(0deg)`;
                break;
        }
        
        card.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        card.style.transform = transformValue;
        card.style.opacity = '0';
        
        // Если лайк или суперлайк - добавляем в избранное
        if (direction === 'right' || direction === 'up') {
            const characterId = card.dataset.id;
            this.likedCharacters.push(characterId);
            
            // Открываем чат с персонажем
            setTimeout(() => {
                window.location.href = `/chat/${characterId}`;
            }, 500);
        } else {
            // Переходим к следующей карточке
            setTimeout(() => {
                this.nextCard();
            }, 400);
        }
    }
    
    nextCard() {
        this.currentCardIndex++;
        
        if (this.currentCardIndex >= this.cards.length) {
            this.showEmptyState();
        } else {
            this.showTopCard();
        }
    }
    
    showEmptyState() {
        const cardsContainer = document.getElementById('cardsContainer');
        cardsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-emoji">💜</div>
                <h3>Карточки закончились!</h3>
                <p>Ты просмотрела всех кандидаток. Выбери тех, с кем хочешь пообщаться!</p>
                <div class="liked-list" id="likedList"></div>
                <a href="/" class="start-button">На главную</a>
            </div>
        `;
        
        // Показываем список лайкнутых
        if (this.likedCharacters.length > 0) {
            const likedList = document.getElementById('likedList');
            this.likedCharacters.forEach(id => {
                const btn = document.createElement('a');
                btn.href = `/chat/${id}`;
                btn.className = 'liked-item';
                btn.textContent = `💬 Поговорить с персонажем ${id}`;
                likedList.appendChild(btn);
            });
        }
        
        // Скрываем кнопки
        document.querySelector('.swipe-actions').style.display = 'none';
        document.getElementById('counter').textContent = '0';
    }
    
    updateCounter() {
        const remaining = this.cards.length - this.currentCardIndex;
        document.getElementById('counter').textContent = remaining;
    }
}

// Запускаем когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    new TinderSwipe();
});