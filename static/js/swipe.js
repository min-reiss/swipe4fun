// static/js/swipe.js

class TinderSwipe {
    constructor() {
        this.cards = Array.from(document.querySelectorAll('.card'));
        this.currentCardIndex = 0;
        this.likedCharacters = JSON.parse(sessionStorage.getItem('likedCharacters') || '[]');
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.audioContext = null;
        
        this.init();
    }
    
    init() {
        if (this.cards.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.showTopCard();
        
        const dislikeBtn = document.getElementById('dislikeBtn');
        const likeBtn = document.getElementById('likeBtn');
        const superlikeBtn = document.getElementById('superlikeBtn');
        
        if (dislikeBtn) dislikeBtn.addEventListener('click', () => this.swipe('left'));
        if (likeBtn) likeBtn.addEventListener('click', () => this.swipe('right'));
        if (superlikeBtn) superlikeBtn.addEventListener('click', () => this.swipe('up'));
        
        this.setupDragEvents();
    }
    
    initAudio() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch(e) {}
        }
    }
    
    playSound(type) {
        this.initAudio();
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            switch(type) {
                case 'like':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1);
                    oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.3);
                    break;
                case 'dislike':
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime + 0.15);
                    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.2);
                    break;
                case 'superlike':
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(554.37, this.audioContext.currentTime + 0.1);
                    oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.2);
                    oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime + 0.3);
                    gainNode.gain.setValueAtTime(0.12, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.4);
                    break;
            }
        } catch(e) {}
    }
    
    showTopCard() {
        this.cards.forEach(card => {
            card.style.display = 'none';
            card.style.transform = '';
            card.style.opacity = '';
        });
        
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
        if (!cardsContainer) return;
        
        cardsContainer.addEventListener('mousedown', (e) => this.startDrag(e));
        cardsContainer.addEventListener('mousemove', (e) => this.duringDrag(e));
        cardsContainer.addEventListener('mouseup', () => this.endDrag());
        cardsContainer.addEventListener('mouseleave', () => this.endDrag());
        
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
        if (card) card.style.transition = 'none';
    }
    
    duringDrag(e) {
        if (!this.isDragging) return;
        
        this.currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        this.currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        
        const diffX = this.currentX - this.startX;
        const diffY = this.currentY - this.startY;
        const card = this.cards[this.currentCardIndex];
        if (!card) return;
        
        if (Math.abs(diffY) > Math.abs(diffX) && diffY < -50) {
            const progress = Math.min(Math.abs(diffY) / 300, 1);
            card.style.transform = `translateY(${diffY}px) scale(${1 - progress * 0.3})`;
            card.style.opacity = Math.max(1 - progress, 0.3);
        } else {
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
        if (!card) return;
        
        card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        
        if (Math.abs(diffY) > Math.abs(diffX) && diffY < -100) {
            this.playSound('superlike');
            this.animateSwipe(card, 'up');
        } else if (Math.abs(diffX) > 100) {
            const direction = diffX > 0 ? 'right' : 'left';
            this.playSound(direction === 'right' ? 'like' : 'dislike');
            this.animateSwipe(card, direction);
        } else {
            card.style.transform = 'translateX(0) rotate(0deg)';
            card.style.opacity = '1';
        }
    }
    
    swipe(direction) {
        if (this.currentCardIndex >= this.cards.length) return;
        
        const card = this.cards[this.currentCardIndex];
        if (!card) return;
        
        switch(direction) {
            case 'right': this.playSound('like'); break;
            case 'left': this.playSound('dislike'); break;
            case 'up': this.playSound('superlike'); break;
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
        
        const characterId = card.dataset.id;
        
        if (direction === 'right' || direction === 'up') {
            if (!this.likedCharacters.includes(characterId)) {
                this.likedCharacters.push(characterId);
            }
        }
        
        sessionStorage.setItem('likedCharacters', JSON.stringify(this.likedCharacters));
        
        setTimeout(() => {
            this.nextCard();
        }, 400);
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
        window.location.href = '/matches';
    }
    
    updateCounter() {
        const remaining = this.cards.length - this.currentCardIndex;
        const counter = document.getElementById('counter');
        if (counter) counter.textContent = remaining;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Если это новый заход — очищаем старые данные
    if (!sessionStorage.getItem('game_started')) {
        sessionStorage.clear();
        sessionStorage.setItem('game_started', 'true');
    }
    new TinderSwipe();
});