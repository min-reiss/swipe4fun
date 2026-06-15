// static/js/chat.js

class DialogChat {
    constructor(dialogData, characterId) {
        this.dialog = dialogData;
        this.characterId = characterId;
        this.currentMessageIndex = 0;
        this.chatMessages = document.getElementById('chatMessages');
        this.chatChoices = document.getElementById('chatChoices');
        this.isTyping = false;
        this.audioContext = null;
        
        this.loadHistory();
        
        if (!this.chatMessages || !this.chatChoices) {
            console.error('Chat elements not found!');
            return;
        }
        
        this.init();
    }
    
    init() {
        if (!this.dialog || !this.dialog.messages) {
            this.chatMessages.innerHTML = '<div class="message candidate-message">Ошибка загрузки диалога 😢</div>';
            return;
        }
        
        if (this.isChatRead()) {
            this.showDateButton();
            return;
        }
        
        if (this.hasHistory()) {
            this.showNextMessage();
        } else {
            setTimeout(() => this.showNextMessage(), 500);
        }
    }
    
    isChatRead() {
        return sessionStorage.getItem('chat_read_' + this.characterId) === 'true';
    }
    
    hasHistory() {
        return sessionStorage.getItem('chat_progress_' + this.characterId) !== null;
    }
    
    loadHistory() {
        const saved = sessionStorage.getItem('chat_progress_' + this.characterId);
        if (saved) {
            this.currentMessageIndex = parseInt(saved);
        }
        
        const savedMessages = sessionStorage.getItem('chat_messages_' + this.characterId);
        if (savedMessages) {
            this.chatMessages.innerHTML = savedMessages;
            this.scrollToBottom();
        }
    }
    
    saveProgress() {
        sessionStorage.setItem('chat_progress_' + this.characterId, this.currentMessageIndex);
        sessionStorage.setItem('chat_messages_' + this.characterId, this.chatMessages.innerHTML);
    }
    
    markAsRead() {
        sessionStorage.setItem('chat_read_' + this.characterId, 'true');
    }
    
    initAudio() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch(e) {}
        }
    }
    
    playMessageSound() {
        this.initAudio();
        if (!this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
        osc.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }
    
    playReceiveSound() {
        this.initAudio();
        if (!this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc.frequency.setValueAtTime(500, this.audioContext.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.15);
    }
    
    showNextMessage() {
        if (this.currentMessageIndex >= this.dialog.messages.length) {
            this.showChatEnded();
            return;
        }
        
        const message = this.dialog.messages[this.currentMessageIndex];
        
        if (message.from === 'candidate') {
            this.showCandidateMessage(message);
        } else if (message.from === 'bride') {
            this.showBrideChoices(message);
        }
    }
    
    showCandidateMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message candidate-message';
        this.chatMessages.appendChild(messageDiv);
        
        this.playReceiveSound();
        
        this.typeText(messageDiv, message.text, () => {
            setTimeout(() => {
                this.currentMessageIndex++;
                this.saveProgress();
                this.showNextMessage();
                this.scrollToBottom();
            }, 500);
        });
    }
    
    typeText(element, text, callback) {
        let index = 0;
        element.textContent = '';
        
        const typingDots = document.createElement('span');
        typingDots.className = 'typing-indicator';
        typingDots.innerHTML = '<span>.</span><span>.</span><span>.</span>';
        element.appendChild(typingDots);
        
        const interval = setInterval(() => {
            if (index < text.length) {
                if (index === 0 && typingDots.parentNode) {
                    typingDots.remove();
                }
                element.textContent += text[index];
                index++;
                this.scrollToBottom();
                if (Math.random() < 0.3) this.playTypingSound();
            } else {
                clearInterval(interval);
                if (typingDots.parentNode) typingDots.remove();
                if (callback) callback();
            }
        }, 40);
    }
    
    playTypingSound() {
        this.initAudio();
        if (!this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000 + Math.random() * 500, this.audioContext.currentTime);
        gain.gain.setValueAtTime(0.02, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.03);
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.03);
    }
    
    showBrideChoices(message) {
        this.chatChoices.innerHTML = '';
        
        message.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.style.animationDelay = `${index * 0.2}s`;
            
            button.addEventListener('click', () => {
                this.handleChoice(choice);
            });
            
            this.chatChoices.appendChild(button);
        });
        
        this.scrollToBottom();
    }
    
    handleChoice(choice) {
        if (this.isTyping) return;
        this.isTyping = true;
        
        this.chatChoices.innerHTML = '';
        this.playMessageSound();
        
        const brideMessage = document.createElement('div');
        brideMessage.className = 'message bride-message';
        brideMessage.textContent = choice.text;
        this.chatMessages.appendChild(brideMessage);
        this.scrollToBottom();
        
        if (choice.reply) {
            setTimeout(() => {
                const replyMessage = document.createElement('div');
                replyMessage.className = 'message candidate-message';
                this.chatMessages.appendChild(replyMessage);
                this.playReceiveSound();
                
                this.typeText(replyMessage, choice.reply, () => {
                    this.currentMessageIndex++;
                    this.saveProgress();
                    
                    if (this.currentMessageIndex < this.dialog.messages.length) {
                        this.isTyping = false;
                        setTimeout(() => this.showNextMessage(), 500);
                    } else {
                        this.markAsRead();
                        this.showDateButton();
                    }
                });
            }, 800);
        } else {
            this.currentMessageIndex++;
            this.saveProgress();
            
            if (this.currentMessageIndex < this.dialog.messages.length) {
                this.isTyping = false;
                setTimeout(() => this.showNextMessage(), 500);
            } else {
                this.markAsRead();
                this.showDateButton();
            }
        }
    }
    
    showChatEnded() {
        const endMessage = document.createElement('div');
        endMessage.className = 'chat-ended-message';
        endMessage.textContent = '💬 Доступные сообщения закончились';
        this.chatMessages.appendChild(endMessage);
        this.scrollToBottom();
        
        this.markAsRead();
        this.showDateButton();
    }
    
    showDateButton() {
        this.chatChoices.innerHTML = `
            <div class="date-actions">
                <button class="date-btn" id="dateBtn">💜 Пойти на свидание</button>
                <button class="back-to-grid-btn" id="backToGridBtn">← К списку кандидатов</button>
            </div>
        `;
        
        document.getElementById('dateBtn').addEventListener('click', () => {
            this.goOnDate();
        });
        
        document.getElementById('backToGridBtn').addEventListener('click', () => {
            window.location.href = '/matches';
        });
        
        this.scrollToBottom();
    }
    
    goOnDate() {
        const dates = JSON.parse(sessionStorage.getItem('dates') || '[]');
        if (!dates.includes(this.characterId)) {
            dates.push(this.characterId);
            sessionStorage.setItem('dates', JSON.stringify(dates));
        }
        
        window.location.href = '/result/' + this.characterId + '/date_ending';
    }
    
    scrollToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof dialogData !== 'undefined' && typeof characterId !== 'undefined') {
        new DialogChat(dialogData, characterId);
    }
});