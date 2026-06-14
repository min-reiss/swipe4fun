// static/js/swipe.js

class TinderSwipe {
    constructor() {
        this.cards = Array.from(document.querySelectorAll('.card'));
        this.currentCardIndex = 0;
        this.likedCharacters = [];
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        
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
        
        const card = this.cards[this.currentCardIndex];
        card.style.transition = 'none';
    }
    
    duringDrag(e) {
        if (!this.isDragging) return;
        
        this.currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const diff = this.currentX - this.startX;
        const card = this.cards[this.currentCardIndex];
        
        // Двигаем карточку
        card.style.transform = `translateX(${diff}px) rotate(${diff * 0.1}deg)`;
        
        // Меняем прозрачность в зависимости от свайпа
        const opacity = 1 - Math.abs(diff) / 500;
        card.style.opacity = Math.max(opacity, 0.3);
    }
    
    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        const diff = this.currentX - this.startX;
        const card = this.cards[this.currentCardIndex];
        card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        
        if (Math.abs(diff) > 100) {
            // Свайп влево или вправо
            const direction = diff > 0 ? 'right' : 'left';
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
        this.animateSwipe(card, direction);
    }
    
    animateSwipe(card, direction) {
        const screenWidth = window.innerWidth;
        let transformValue;
        
        switch(direction) {
            case 'left':
                transformValue = `translateX(-${screenWidth}px) rotate(-30deg)`;
                break;
            case 'right':
                transformValue = `translateX(${screenWidth}px) rotate(30deg)`;
                break;
            case 'up':
                transformValue = `translateY(-${screenWidth}px) scale(0.5)`;
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